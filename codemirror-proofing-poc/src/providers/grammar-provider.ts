import type { ProofingProvider, Suggestion } from "@/types";

interface LanguageToolMatch {
  message: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  rule: {
    id: string;
    category: { id: string };
  };
}

interface LanguageToolResponse {
  matches: LanguageToolMatch[];
}

export interface GrammarProviderConfig {
  /** LanguageTool API endpoint, defaults to public API */
  apiUrl?: string;
  language?: string;
}

export class GrammarProvider implements ProofingProvider {
  readonly name = "grammar";
  readonly source = "grammar" as const;

  private apiUrl: string;
  private language: string;
  private idCounter = 0;

  constructor(config: GrammarProviderConfig = {}) {
    this.apiUrl =
      config.apiUrl ?? "https://api.languagetool.org/v2/check";
    this.language = config.language ?? "en-US";
  }

  async check(text: string, signal: AbortSignal): Promise<Suggestion[]> {
    if (!text.trim()) return [];

    try {
      const body = new URLSearchParams({
        text,
        language: this.language,
        enabledOnly: "false",
      });

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal,
      });

      if (!response.ok) {
        console.warn(`LanguageTool API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as LanguageToolResponse;

      if (!data || !Array.isArray(data.matches)) {
        return [];
      }

      return this.mapMatches(data.matches, text);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      console.warn("Grammar check failed:", err);
      return [];
    }
  }

  private mapMatches(
    matches: LanguageToolMatch[],
    text: string,
  ): Suggestion[] {
    return matches
      .filter((m) => {
        return (
          typeof m.offset === "number" &&
          typeof m.length === "number" &&
          m.offset >= 0 &&
          m.length >= 0 &&
          m.offset + m.length <= text.length
        );
      })
      .map((m) => {
      const from = m.offset;
      const to = m.offset + m.length;
      const category = this.mapCategory(m.rule.category.id);

      return {
        id: `grammar-${this.idCounter++}`,
        source: "grammar" as const,
        category,
        severity: category === "style" ? ("low" as const) : ("medium" as const),
        from,
        to,
        original: text.slice(from, to),
        replacements: m.replacements.map((r) => r.value).slice(0, 5),
        message: m.message,
      };
    });
  }

  private mapCategory(
    ltCategory: string,
  ): Suggestion["category"] {
    if (ltCategory.includes("SPELL")) return "spelling";
    if (ltCategory.includes("STYLE") || ltCategory.includes("REDUNDANCY"))
      return "style";
    return "grammar";
  }
}
