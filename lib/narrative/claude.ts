import Anthropic from "@anthropic-ai/sdk";
import { Category, Confidence, Verdict } from "@/lib/generated/prisma/client";

const client = new Anthropic();

const SYSTEM_PROMPT = `You write a short internal note for a Vibe sales rep who is about to pitch a DTC brand on performance CTV advertising. You'll receive a domain, the marketing technologies detected on that domain (each with a confidence level: CONFIRMED means directly observed in the site's HTML, OPAQUE means a tag manager was found but the specific tool behind it could not be confirmed, UNKNOWN means nothing could be observed), and a score that has already been computed across four pillars: measurable (pixels and analytics), commerce, retention, and scale.

Respond with exactly two to three sentences as one plain-text paragraph. No title, no heading, no markdown, no bullet points, no salutation, and do not say "internal note." Never use an em dash; use a comma or period instead. Reference specific detected technologies by name. Do not invent, restate, or recompute the score. Do not treat an OPAQUE detection as if it were confirmed.`;

export interface NarrativeDetection {
  technology: string;
  category: Category;
  confidence: Confidence;
}

export interface NarrativeScore {
  measurable: number;
  commerce: number;
  retention: number;
  scale: number;
  total: number;
  verdict: Verdict;
}

export interface NarrativeInput {
  domain: string;
  detections: NarrativeDetection[];
  score: NarrativeScore;
}

export async function generateNarrative(input: NarrativeInput): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 500,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(input) }],
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    return textBlock?.text ?? null;
  } catch {
    return null;
  }
}
