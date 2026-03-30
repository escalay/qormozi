import { hexToRgb, rgbToHex } from './colorUtils';

export class VisionSimulator {
  
  // Matrix for Deuteranopia (Green-Blindness)
  private static readonly DEUTERANOPIA = [
    0.625, 0.375, 0,
    0.700, 0.300, 0,
    0.000, 0.300, 1.000
  ];

  // Matrix for Protanopia (Red-Blindness)
  private static readonly PROTANOPIA = [
    0.567, 0.433, 0,
    0.558, 0.442, 0,
    0.000, 0.242, 0.758
  ];

  static simulate(hex: string, mode: 'deuteranopia' | 'protanopia' | 'standard'): string {
    if (mode === 'standard') return hex;

    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const { r, g, b } = rgb;

    const m = mode === 'deuteranopia' ? this.DEUTERANOPIA : this.PROTANOPIA;

    // Matrix Multiplication
    const R = (r * m[0]) + (g * m[1]) + (b * m[2]);
    const G = (r * m[3]) + (g * m[4]) + (b * m[5]);
    const B = (r * m[6]) + (g * m[7]) + (b * m[8]);

    return rgbToHex(R, G, B);
  }
}