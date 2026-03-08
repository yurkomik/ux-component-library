import type { Suggestion } from "./suggestion";

export interface ProofingProvider {
  readonly name: string;
  readonly source: Suggestion["source"];

  check(text: string, signal: AbortSignal): Promise<Suggestion[]>;

  dispose?(): void;
}

export type RewriteMode =
  | "fix-grammar"
  | "rewrite"
  | "shorter"
  | "more-formal";

export interface RewriteProvider {
  readonly name: string;

  rewrite(
    text: string,
    mode: RewriteMode,
    signal: AbortSignal,
  ): Promise<{ rewritten: string; suggestions: Suggestion[] }>;

  dispose?(): void;
}
