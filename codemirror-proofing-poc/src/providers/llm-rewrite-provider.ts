import type { RewriteProvider, RewriteMode, Suggestion } from "@/types";

export interface LLMRewriteConfig {
  /** API endpoint for rewrite requests */
  apiUrl?: string;
}

interface RewriteResponse {
  rewritten: string;
}

export class LLMRewriteService implements RewriteProvider {
  readonly name = "llm-rewrite";

  private apiUrl: string;
  private idCounter = 0;

  constructor(config: LLMRewriteConfig = {}) {
    this.apiUrl = config.apiUrl ?? "/api/proof/rewrite";
  }

  async rewrite(
    text: string,
    mode: RewriteMode,
    signal: AbortSignal,
  ): Promise<{ rewritten: string; suggestions: Suggestion[] }> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Rewrite API returned ${response.status}`);
    }

    const data = (await response.json()) as RewriteResponse;

    const suggestion: Suggestion = {
      id: `llm-rewrite-${this.idCounter++}`,
      source: "llm",
      category: "rewrite",
      severity: "low",
      from: 0,
      to: text.length,
      original: text,
      replacements: [data.rewritten],
      message: `Rewrite (${mode}): Review the suggested changes`,
    };

    return {
      rewritten: data.rewritten,
      suggestions: [suggestion],
    };
  }
}
