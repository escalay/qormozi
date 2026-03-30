// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Remove hash to normalize
  const cleanHex = hex.replace('#', '');

  // Handle 3-digit shorthand (e.g. "f00" -> "ff0000")
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }

  // Handle standard 6-digit
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }

  return null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  // Clamp values to 0-255 and round to ensure valid hex production
  const c = (v: number) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
};

export const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// ============================================================================
// MATH & DISTANCE
// ============================================================================

// Redmean Color Distance Formula (Perceptually accurate approximation without full DeltaE)
export const getRedmeanDistance = (c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}) => {
  const rMean = (c1.r + c2.r) / 2;
  const r = c1.r - c2.r;
  const g = c1.g - c2.g;
  const b = c1.b - c2.b;
  
  return Math.sqrt(
    (((512 + rMean) * r * r) >> 8) + 
    4 * g * g + 
    (((767 - rMean) * b * b) >> 8)
  );
};

// Calculate the smallest arc containing all hues
export const getHueRange = (hues: number[]): number => {
    if (hues.length <= 1) return 0;
    
    // Ensure numeric sort (default JS sort is lexicographical)
    const sorted = [...hues].sort((a, b) => a - b);
    
    let maxGap = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
        maxGap = Math.max(maxGap, sorted[i+1] - sorted[i]);
    }
    
    // Check wrap-around gap (360 -> 0)
    maxGap = Math.max(maxGap, 360 - (sorted[sorted.length - 1] - sorted[0]));
    
    return 360 - maxGap;
};

// ============================================================================
// ACCESSIBILITY & CONTRAST
// ============================================================================

export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const { r, g, b } = rgb;
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastRatio = (hex1: string, hex2: string): number => {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Smart Contrast: Calculates actual ratio against black/white and picks the winner.
// Much more reliable than checking if luminance > 0.5.
export const getContrastColor = (hex: string): string => {
  // If invalid, default to black
  if (!hexToRgb(hex)) return '#000000';

  const whiteRatio = getContrastRatio(hex, '#FFFFFF');
  const blackRatio = getContrastRatio(hex, '#000000');
  
  // Return white if it provides better contrast, or if it passes AA while black doesn't
  return whiteRatio >= blackRatio ? '#FFFFFF' : '#000000';
};

export interface WCAGRating {
  level: string;
  label: string;
  pass: boolean;
}

export const getWCAGRating = (ratio: number): WCAGRating => {
  if (ratio >= 7) return { level: 'AAA', label: 'Excellent', pass: true };
  if (ratio >= 4.5) return { level: 'AA', label: 'Good', pass: true };
  if (ratio >= 3) return { level: 'AA Large', label: 'Large Text', pass: true };
  return { level: 'Fail', label: 'Low Contrast', pass: false };
};

// ============================================================================
// BLENDING & ADJUSTMENT
// ============================================================================

// Root Mean Square (Gamma Corrected) Blending
export const blendColors = (hex1: string, hex2: string, weight: number = 0.5): string => {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    if (!c1 || !c2) return hex1;

    // Square values before averaging to prevent "muddy" greys
    const r = Math.sqrt((1 - weight) * (c1.r ** 2) + weight * (c2.r ** 2));
    const g = Math.sqrt((1 - weight) * (c1.g ** 2) + weight * (c2.g ** 2));
    const b = Math.sqrt((1 - weight) * (c1.b ** 2) + weight * (c2.b ** 2));

    return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
};

export const adjustLightness = (hex: string, percent: number): string => {
    const hsl = hexToHsl(hex);
    if (!hsl) return hex;
    
    let newL = hsl.l + percent;
    newL = Math.max(0, Math.min(100, newL));
    
    // HSL to RGB conversion logic helper
    const s = hsl.s / 100;
    const l = newL / 100;
    const h = hsl.h; 

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    
    // IMPORTANT: Explicit rounding here is critical to prevent invalid hex generation
    return rgbToHex(
      Math.round(f(0) * 255), 
      Math.round(f(8) * 255), 
      Math.round(f(4) * 255)
    );
};