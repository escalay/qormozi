import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

interface Env {
  OPENROUTER_API_KEY: string;
}

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

const PROMPT_TEMPLATE = (prompt: string) =>
  `You are a color theorist and visual storyteller. Create a 5-color palette for: "${prompt}".

Think like a painter composing a scene — every color must earn its place through relationship to the others.

Guidelines:
- One color anchors the light end (near white), one anchors the dark end (near black)
- The remaining three should create a natural bridge between them
- Draw from real-world materials: aged paper, wet clay, oxidized copper, storm light, dried lavender
- Name colors after what they feel like, not what they look like
- The palette should feel like it belongs to a single moment or place
- Ensure the 5 colors work in visual harmony — they should feel inevitable together`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { prompt } = (await context.request.json()) as { prompt: string };

  if (!prompt || typeof prompt !== "string") {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = context.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const openrouter = createOpenRouter({ apiKey });

    const result = await generateText({
      model: openrouter(MODEL),
      output: Output.object({ schema: paletteSchema }),
      prompt: PROMPT_TEMPLATE(prompt),
      temperature: 0,
    });

    return new Response(JSON.stringify(result.output), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[API] Generation failed:", error);
    return new Response(
      JSON.stringify({ error: "Generation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
