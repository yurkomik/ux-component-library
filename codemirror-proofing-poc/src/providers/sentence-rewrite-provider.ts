import type { Suggestion } from "@/types";
import type { OpenRouterConfig } from "@/lib/openrouter-config";
import { OpenRouterClient } from "./openrouter-client";

export type SentenceRewriteStyle =
  | "shorter"
  | "more-confident"
  | "more-structured"
  | "more-formal"
  | "simpler"
  | "custom";

export interface RewriteAlternative {
  text: string;
  /** Brief description of what changed */
  style: string;
}

export interface SentenceRewriteResult {
  original: string;
  alternatives: RewriteAlternative[];
}

export interface SentenceRewriteProviderConfig {
  /** Partial OpenRouter config overrides */
  openRouter?: Partial<OpenRouterConfig>;
}

export class SentenceRewriteProvider {
  readonly name = "sentence-rewrite";

  private client: OpenRouterClient;
  private idCounter = 0;

  constructor(config: SentenceRewriteProviderConfig = {}) {
    this.client = new OpenRouterClient(config.openRouter);
  }

  /**
   * Generate alternative phrasings for a sentence.
   *
   * @param sentence       The sentence to rewrite
   * @param style          The target style
   * @param signal         AbortSignal for cancellation
   * @param customCommand  Custom instruction (only used when style is "custom")
   */
  async rewrite(
    sentence: string,
    style: SentenceRewriteStyle,
    signal: AbortSignal,
    customCommand?: string,
  ): Promise<SentenceRewriteResult> {
    const prompt = buildRewritePrompt(sentence, style, customCommand);

    const result = await this.client.chatJSON<SentenceRewriteResult>(
      [
        {
          role: "system",
          content:
            "You are a professional editor and writing assistant. " +
            "Return only valid JSON, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.7 },
      signal,
    );

    return result;
  }

  /**
   * Generate alternative phrasings and map them into the shared Suggestion model.
   *
   * @param sentence       The sentence to rewrite
   * @param style          The target style
   * @param from           Start offset of the sentence in the document
   * @param to             End offset of the sentence in the document
   * @param signal         AbortSignal for cancellation
   * @param customCommand  Custom instruction (only used when style is "custom")
   */
  async suggest(
    sentence: string,
    style: SentenceRewriteStyle,
    from: number,
    to: number,
    signal: AbortSignal,
    customCommand?: string,
  ): Promise<Suggestion[]> {
    const result = await this.rewrite(sentence, style, signal, customCommand);

    if (!result.alternatives || result.alternatives.length === 0) {
      return [];
    }

    return result.alternatives.map((alt) => ({
      id: `rewrite-${this.idCounter++}`,
      source: "llm" as const,
      category: "rewrite" as const,
      severity: "low" as const,
      from,
      to,
      original: sentence,
      replacements: [alt.text],
      message: `Rewrite (${alt.style})`,
      confidence: 0.8,
    }));
  }

  dispose(): void {
    // No resources to release
  }
}

const STYLE_INSTRUCTIONS: Record<
  Exclude<SentenceRewriteStyle, "custom">,
  string
> = {
  shorter: "Make the sentence shorter and more concise without losing meaning.",
  "more-confident":
    "Make the sentence sound more confident and assertive. " +
    "Remove hedging words like 'maybe', 'perhaps', 'I think', 'might'.",
  "more-structured":
    "Restructure the sentence for better clarity and logical flow. " +
    "Break into multiple sentences if needed.",
  "more-formal":
    "Make the sentence more formal and professional in tone.",
  simpler:
    "Simplify the sentence. Use shorter words, simpler grammar, " +
    "and make it easier to understand.",
};

function buildRewritePrompt(
  sentence: string,
  style: SentenceRewriteStyle,
  customCommand?: string,
): string {
  const instruction =
    style === "custom" && customCommand
      ? customCommand
      : STYLE_INSTRUCTIONS[style as Exclude<SentenceRewriteStyle, "custom">] ??
        "Rewrite the sentence in a different way.";

  return (
    `Rewrite the following sentence in 3 to 5 alternative ways.\n\n` +
    `Instruction: ${instruction}\n\n` +
    `Sentence: "${sentence}"\n\n` +
    `Return JSON in this exact format:\n` +
    `{\n` +
    `  "original": "${sentence}",\n` +
    `  "alternatives": [\n` +
    `    {\n` +
    `      "text": "rewritten sentence here",\n` +
    `      "style": "brief description of what changed"\n` +
    `    }\n` +
    `  ]\n` +
    `}`
  );
}
