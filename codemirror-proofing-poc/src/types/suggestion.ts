export type SuggestionSource = "spell" | "grammar" | "llm";

export type SuggestionCategory =
  | "spelling"
  | "grammar"
  | "style"
  | "rewrite";

export type SuggestionSeverity = "low" | "medium" | "high";

export interface Suggestion {
  id: string;
  source: SuggestionSource;
  category: SuggestionCategory;
  severity: SuggestionSeverity;
  from: number;
  to: number;
  original: string;
  replacements: string[];
  message: string;
  confidence?: number;
  ignored?: boolean;
}
