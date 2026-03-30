import { GeneratedResponse } from "../types";
import { PaletteEnricher } from "../utils/paletteEnricher";

interface RawPalette {
  palette_name: string;
  description: string;
  tags: string[];
  cultural_context: string;
  colors: Array<{ name: string; hex: string; rationale: string }>;
}

export const generatePalettes = async (prompt: string): Promise<GeneratedResponse> => {
  console.log(`[AI] Generating palette for: "${prompt}"`);
  const startTime = performance.now();

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API request failed (${response.status})`);
  }

  const palette: RawPalette = await response.json();
  const elapsed = (performance.now() - startTime).toFixed(0);
  console.log(`[AI] Done in ${elapsed}ms`);

  const enrichedPalette = PaletteEnricher.process({
    name: palette.palette_name,
    description: palette.description,
    tags: palette.tags,
    cultural_context: palette.cultural_context,
    rawColors: palette.colors,
  });

  return { palettes: [enrichedPalette] };
};
