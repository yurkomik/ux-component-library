import type { Suggestion } from "@/types";
import type { OpenRouterConfig } from "@/lib/openrouter-config";
import { OpenRouterClient } from "./openrouter-client";

export interface SynonymEntry {
  word: string;
  /** If the sentence needs rewriting to use this synonym */
  rewrittenSentence?: string;
}

export interface SynonymResult {
  word: string;
  synonyms: SynonymEntry[];
}

export interface SynonymProviderConfig {
  /** Partial OpenRouter config overrides */
  openRouter?: Partial<OpenRouterConfig>;
}

export class SynonymProvider {
  readonly name = "synonym";

  private client: OpenRouterClient;
  private idCounter = 0;

  constructor(config: SynonymProviderConfig = {}) {
    this.client = new OpenRouterClient(config.openRouter);
  }

  /**
   * Find synonyms for a word in context.
   *
   * @param word        The word to find synonyms for
   * @param sentence    The surrounding sentence for context
   * @param language    Language code (e.g. "en", "uk")
   * @param signal      AbortSignal for cancellation
   */
  async findSynonyms(
    word: string,
    sentence: string,
    language: string,
    signal: AbortSignal,
  ): Promise<SynonymResult> {
    const prompt = buildSynonymPrompt(word, sentence, language);

    const result = await this.client.chatJSON<SynonymResult>(
      [
        {
          role: "system",
          content:
            "You are a multilingual linguistic assistant. " +
            "Return only valid JSON, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.3 },
      signal,
    );

    return result;
  }

  /**
   * Find synonyms and map them into the shared Suggestion model.
   *
   * @param word      The word to find synonyms for
   * @param sentence  The surrounding sentence
   * @param language  Language code
   * @param from      Start offset of the word in the document
   * @param to        End offset of the word in the document
   * @param signal    AbortSignal for cancellation
   */
  async suggest(
    word: string,
    sentence: string,
    language: string,
    from: number,
    to: number,
    signal: AbortSignal,
  ): Promise<Suggestion[]> {
    const result = await this.findSynonyms(word, sentence, language, signal);

    if (!result.synonyms || result.synonyms.length === 0) {
      return [];
    }

    return result.synonyms.map((syn) => ({
      id: `synonym-${this.idCounter++}`,
      source: "llm" as const,
      category: "style" as const,
      severity: "low" as const,
      from,
      to,
      original: word,
      replacements: [syn.word],
      message: syn.rewrittenSentence
        ? `Synonym: "${syn.word}" (sentence may need adjustment: "${syn.rewrittenSentence}")`
        : `Synonym: "${syn.word}"`,
      confidence: 0.7,
    }));
  }

  dispose(): void {
    // No resources to release
  }
}

function buildSynonymPrompt(
  word: string,
  sentence: string,
  language: string,
): string {
  return (
    `Find up to 7 synonyms for the word "${word}" as used in the following sentence:\n\n` +
    `"${sentence}"\n\n` +
    `Language: ${language}\n\n` +
    `For each synonym, check if the sentence needs to be rewritten to accommodate it ` +
    `(e.g. grammatical gender agreement, verb conjugation changes, or case changes — ` +
    `for example in Ukrainian "авто їхало" would become "автомобіль їхав"). ` +
    `If rewriting is needed, provide the rewritten sentence.\n\n` +
    `Return JSON in this exact format:\n` +
    `{\n` +
    `  "word": "${word}",\n` +
    `  "synonyms": [\n` +
    `    {\n` +
    `      "word": "synonym here",\n` +
    `      "rewrittenSentence": "rewritten sentence if needed, or omit this field"\n` +
    `    }\n` +
    `  ]\n` +
    `}`
  );
}
