import { StateEffect } from "@codemirror/state";
import type { Suggestion, SuggestionSource } from "@/types";

/** Add suggestions from a provider (replaces all from that source) */
export const setSuggestionsEffect = StateEffect.define<{
  source: SuggestionSource;
  suggestions: Suggestion[];
}>();

/** Remove a single suggestion by ID (after accepting it) */
export const removeSuggestionEffect = StateEffect.define<string>();

/** Dismiss a suggestion (hide but don't apply) */
export const dismissSuggestionEffect = StateEffect.define<string>();

/** Clear all suggestions */
export const clearAllSuggestionsEffect = StateEffect.define<void>();

/** Set the active tooltip suggestion ID */
export const setTooltipTargetEffect = StateEffect.define<string | null>();
