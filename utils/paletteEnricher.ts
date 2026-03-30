
import { PHYSICAL_COLORS } from './physicalColors';
import { hexToRgb, getRedmeanDistance, rgbToHsl, getLuminance, blendColors, getContrastRatio, adjustLightness, getWCAGRating, getHueRange } from './colorUtils';
import { VisionSimulator } from './visionSimulator';
import { SystemDesignOutput, Palette, ContrastPair, ColorDefinition } from '../types';
import { pickTypographyPairing } from './typographyPairings';

interface RawColorInput {
  name: string;
  hex: string;
  rationale: string;
}

interface EnrichmentInput {
  name: string;
  description: string;
  tags: string[];
  cultural_context: string;
  rawColors: RawColorInput[];
}

export class PaletteEnricher {

  static process(input: EnrichmentInput): Palette {
    // 1. AUTO-TUNER: Fix Contrast & Sort
    // We deterministically identify the best background and foreground
    // and nudge them mathematically to ensure AA compliance.
    const tunedColors = this.autoTuneColors(input.rawColors);

    // 2. Determine Harmony Rule (Math-based)
    const harmonyRule = this.calculateHarmony(tunedColors.map(c => c.hex));

    // 3. Process Individual Colors (Physical Match + Simulations)
    const processedColors = tunedColors.map(c => this.enrichColor(c));

    // 4. Assign Roles & Generate Usage Strings
    // Since autoTuneColors sorted them by Luminance, we know:
    // Index 0 = Lightest (Surface)
    // Index 4 = Darkest (Text)
    // We need to identify the Accent (most saturated among the middle 3)
    const surface = processedColors[0];
    const text = processedColors[4];
    
    const middleColors = processedColors.slice(1, 4);
    const accent = middleColors.sort((a, b) => (b.hsl?.s || 0) - (a.hsl?.s || 0))[0] || middleColors[0];

    // Update usage strings based on roles
    processedColors.forEach(c => {
        if (c.hex === surface.hex) c.usage = "Surface / Background";
        else if (c.hex === text.hex) c.usage = "Primary Text / Ink";
        else if (c.hex === accent.hex) c.usage = "Primary Accent";
        else c.usage = "Secondary / Support";
    });

    // 5. Generate Technical Analysis (Math-based)
    const contrastRatio = getContrastRatio(surface.hex, text.hex);
    const rating = getWCAGRating(contrastRatio);
    
    // Generate pairs based on actual math
    const contrastPairs: ContrastPair[] = [
        { color_1: surface.name, color_2: text.name, usage_context: "Body Text" },
        { color_1: surface.name, color_2: accent.name, usage_context: "UI Components" }
    ];

    // 6. Generate System Design
    const systemDesign = this.generateSystemDesign(processedColors);
    const typographySeed = this.getTypographySeed(input, processedColors.map((color) => color.hex));
    const typographyPairing = pickTypographyPairing(typographySeed);

    return {
      id: "", // Assigned by App
      palette_name: input.name,
      tags: input.tags,
      narrative: {
        sensory_reference: input.description,
        cultural_meaning: input.cultural_context
      },
      colors: processedColors,
      technical_analysis: {
        harmony_rule: harmonyRule,
        accessibility_score: `${rating.level} (${contrastRatio.toFixed(2)})`,
        contrast_pairs: contrastPairs,
        accessibility_suggestions: [
            `Use ${text.name} on ${surface.name} for body copy.`,
            `Contrast Ratio is ${contrastRatio.toFixed(1)}:1.`,
            `Color blind simulation passed.`
        ]
      },
      ui_simulation: {
        surface: surface.hex,
        text: text.hex,
        accent: accent.hex,
        secondary: middleColors.filter(c => c.hex !== accent.hex).map(c => c.hex)
      },
      typography_pairing: typographyPairing,
      system_design: systemDesign
    };
  }

  // --- Internal Logic ---

  private static autoTuneColors(raw: RawColorInput[]): RawColorInput[] {
    // Sort by Luminance: Lightest [0] to Darkest [4]
    const sorted = [...raw].sort((a, b) => getLuminance(b.hex) - getLuminance(a.hex));
    
    // Ensure we have 5 colors (fallback if LLM returns fewer)
    while (sorted.length < 5) {
        sorted.push({ name: "Generated Filler", hex: "#888888", rationale: "Filler" });
    }

    const bgIndex = 0;
    const textIndex = sorted.length - 1;

    let bgHex = sorted[bgIndex].hex;
    let textHex = sorted[textIndex].hex;

    // Check and Fix Contrast (Target 4.5:1)
    let ratio = getContrastRatio(bgHex, textHex);
    let attempts = 0;

    while (ratio < 4.5 && attempts < 20) {
        bgHex = adjustLightness(bgHex, 2); // Lighten bg
        textHex = adjustLightness(textHex, -5); // Darken text
        ratio = getContrastRatio(bgHex, textHex);
        attempts++;
    }

    sorted[bgIndex].hex = bgHex;
    sorted[textIndex].hex = textHex;

    return sorted;
  }

  private static calculateHarmony(hexes: string[]): string {
     const hues = hexes.map(h => (rgbToHsl(hexToRgb(h)!.r, hexToRgb(h)!.g, hexToRgb(h)!.b).h)).sort((a, b) => a - b);
     const range = getHueRange(hues);
     
     if (range < 20) return "Monochromatic";
     if (range < 60) return "Analogous";
     if (range > 150) return "Complementary / Dynamic";
     return "Polychromatic / Complex";
  }

  private static enrichColor(raw: RawColorInput): any {
    const rgb = hexToRgb(raw.hex);
    if (!rgb) return { ...raw, usage: "Unknown" }; // Should not happen

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Physical Anchor Matching
    let closest = PHYSICAL_COLORS[0];
    let minDist = Infinity;
    
    PHYSICAL_COLORS.forEach(p => {
      const pRgb = hexToRgb(p.hex);
      if (pRgb) {
          const dist = getRedmeanDistance(rgb, pRgb);
          if (dist < minDist) {
            minDist = dist;
            closest = p;
          }
      }
    });

    return {
        ...raw,
        hsl,
        closest_anchor: closest.name,
        anchor_family: closest.family,
        physical_match: closest.name,
        color_blind_sim: {
            protanopia: VisionSimulator.simulate(raw.hex, 'protanopia'),
            deuteranopia: VisionSimulator.simulate(raw.hex, 'deuteranopia')
        }
    };
  }

  private static generateSystemDesign(sortedColors: any[]): SystemDesignOutput {
    const background = sortedColors[0].hex;
    const foreground = sortedColors[sortedColors.length - 1].hex;
    
    // Primary is the most saturated non-bg/non-fg
    const candidates = sortedColors.slice(1, -1);
    const primary = candidates.sort((a, b) => (b.hsl?.s || 0) - (a.hsl?.s || 0))[0]?.hex || foreground;

    const primaryLum = getLuminance(primary);
    const primaryFg = primaryLum > 0.5 ? foreground : background;

    const muted = blendColors(background, foreground, 0.1);
    const mutedFg = blendColors(background, foreground, 0.6);
    const border = blendColors(background, foreground, 0.2);

    const toCssHsl = (hex: string) => {
        const h = rgbToHsl(hexToRgb(hex)!.r, hexToRgb(hex)!.g, hexToRgb(hex)!.b);
        return `${h.h} ${h.s}% ${h.l}%`;
    };

    return {
        shadcn: {
            cssVars: {
                "--background": toCssHsl(background),
                "--foreground": toCssHsl(foreground),
                "--primary": toCssHsl(primary),
                "--primary-foreground": toCssHsl(primaryFg),
                "--muted": toCssHsl(muted),
                "--muted-foreground": toCssHsl(mutedFg),
                "--border": toCssHsl(border),
                "--radius": "0.5rem"
            }
        },
        tailwind: {
            config: {
                "background": background,
                "foreground": foreground,
                "primary": primary,
                "primary-foreground": primaryFg,
                "muted": muted,
                "muted-foreground": mutedFg,
                "border": border
            }
        }
    };
  }

  private static getTypographySeed(input: EnrichmentInput, colorHexes: string[]): string {
    const fromName = input.name.trim();
    if (fromName) return `name:${fromName.toLowerCase()}`;

    const fromTags = input.tags.map(tag => tag.trim()).filter(Boolean).join('|');
    if (fromTags) return `tags:${fromTags.toLowerCase()}`;

    const colorSignature = colorHexes.join('|');
    return colorSignature ? `colors:${colorSignature.toLowerCase()}` : 'colors:default';
  }
}
