interface Env {
  OPENROUTER_API_KEY: string;
}

const MODEL = "google/gemini-3-flash-preview";

const PALETTE_SCHEMA = {
  type: "object",
  properties: {
    palette_name: { type: "string", description: "Evocative palette title that captures the mood" },
    description: { type: "string", description: "A sensory, one-sentence narrative — what this palette feels like to experience" },
    tags: { type: "array", items: { type: "string" }, description: "Exactly 4 mood/aesthetic tags" },
    cultural_context: { type: "string", description: "The cultural, historical, or emotional story behind this palette" },
    colors: {
      type: "array",
      description: "Exactly 5 harmonized colors",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Poetic, material-inspired color name" },
          hex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "6-digit HEX color" },
          rationale: { type: "string", description: "Why this color belongs in the palette (max 8 words)" },
        },
        required: ["name", "hex", "rationale"],
      },
    },
  },
  required: ["palette_name", "description", "tags", "cultural_context", "colors"],
};

const buildPrompt = (prompt: string) =>
  `You are a color theorist and visual storyteller. Create a 5-color palette for: "${prompt}".

Think like a painter composing a scene — every color must earn its place through relationship to the others.

Guidelines:
- One color anchors the light end (near white), one anchors the dark end (near black)
- The remaining three should create a natural bridge between them
- Draw from real-world materials: aged paper, wet clay, oxidized copper, storm light, dried lavender
- Name colors after what they feel like, not what they look like
- The palette should feel like it belongs to a single moment or place
- Ensure the 5 colors work in visual harmony — they should feel inevitable together

Respond with valid JSON matching the schema.`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { prompt } = (await context.request.json()) as { prompt: string };

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const apiKey = context.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: buildPrompt(prompt) }],
        response_format: {
          type: "json_schema",
          json_schema: { name: "palette", schema: PALETTE_SCHEMA, strict: true },
        },
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[API] OpenRouter error:", response.status, err);
      return Response.json({ error: "AI provider error" }, { status: 502 });
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json({ error: "Empty response from model" }, { status: 502 });
    }

    const palette = JSON.parse(content);
    return Response.json(palette);
  } catch (error) {
    console.error("[API] Generation failed:", error);
    return Response.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
};
