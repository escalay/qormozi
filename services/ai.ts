import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { GeneratedResponse } from "../types";
import { PaletteEnricher } from "../utils/paletteEnricher";

// ============================================================================
// CONFIGURATION
// ============================================================================

const MODEL = "google/gemini-3-flash-preview";

const paletteSchema = z.object({
  palette_name: z
    .string()
    .describe("Evocative palette title that captures the mood"),
  description: z
    .string()
    .describe("A sensory, one-sentence narrative — what this palette feels like to experience"),
  tags: z
    .array(z.string())
    .describe("Exactly 4 mood/aesthetic tags"),
  cultural_context: z
    .string()
    .describe("The cultural, historical, or emotional story behind this palette"),
  colors: z
    .array(
      z.object({
        name: z.string().describe("Poetic, material-inspired color name"),
        hex: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, "must be a 6-digit HEX color"),
        rationale: z
          .string()
          .describe("Why this color belongs in the palette (max 8 words)"),
      })
    )
    .describe("Exactly 5 harmonized colors"),
});

// ============================================================================
// GENERATOR SERVICE
// ============================================================================

export const generatePalettes = async (prompt: string): Promise<GeneratedResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const openrouter = createOpenRouter({ apiKey: process.env.API_KEY });

  console.log(`[AI] Generating palette for: "${prompt}"`);

  try {
    const startTime = performance.now();

    const result = await generateText({
      model: openrouter(MODEL),
      output: Output.object({ schema: paletteSchema }),
      prompt: `You are a color theorist and visual storyteller. Create a 5-color palette for: "${prompt}".

Think like a painter composing a scene — every color must earn its place through relationship to the others.

Guidelines:
- One color anchors the light end (near white), one anchors the dark end (near black)
- The remaining three should create a natural bridge between them
- Draw from real-world materials: aged paper, wet clay, oxidized copper, storm light, dried lavender
- Name colors after what they feel like, not what they look like
- The palette should feel like it belongs to a single moment or place
- Ensure the 5 colors work in visual harmony — they should feel inevitable together`,
      temperature: 0,
    });

    const elapsed = (performance.now() - startTime).toFixed(0);
    console.log(`[AI] Done in ${elapsed}ms`);

    const palette = result.output!;

    const enrichedPalette = PaletteEnricher.process({
      name: palette.palette_name,
      description: palette.description,
      tags: palette.tags,
      cultural_context: palette.cultural_context,
      rawColors: palette.colors,
    });

    return { palettes: [enrichedPalette] };
  } catch (error) {
    console.error("[AI] Generation failed:", error);
    throw error;
  }
};
