import { StateField } from "@codemirror/state";
import type { Transaction } from "@codemirror/state";
import { SuggestionStore } from "@/engine/suggestion-state";
import {
  setSuggestionsEffect,
  removeSuggestionEffect,
  dismissSuggestionEffect,
  clearAllSuggestionsEffect,
  setTooltipTargetEffect,
} from "./proofing-effects";

/**
 * CodeMirror StateField that holds the canonical suggestion store.
 * Maps suggestion positions through document changes and processes effects.
 */
export const proofingStateField = StateField.define<SuggestionStore>({
  create() {
    return new SuggestionStore();
  },

  update(store: SuggestionStore, tr: Transaction) {
    let current = store;

    // Map suggestion positions through document changes
    if (tr.docChanged) {
      tr.changes.iterChanges(
        (fromA, toA, _fromB, _toB, inserted) => {
          current = current.mapThroughChange(fromA, toA, inserted.length);
        },
      );
    }

    // Process effects
    for (const effect of tr.effects) {
      if (effect.is(setSuggestionsEffect)) {
        current = current.replaceBySource(
          effect.value.source,
          effect.value.suggestions,
        );
      } else if (effect.is(removeSuggestionEffect)) {
        current = current.remove(effect.value);
      } else if (effect.is(dismissSuggestionEffect)) {
        current = current.dismiss(effect.value);
      } else if (effect.is(clearAllSuggestionsEffect)) {
        current = new SuggestionStore();
      }
    }

    return current;
  },
});

/** Tooltip target field — tracks which suggestion ID is showing a popover */
export const tooltipTargetField = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setTooltipTargetEffect)) {
        return effect.value;
      }
    }
    // Clear tooltip when document changes
    if (tr.docChanged) return null;
    return value;
  },
});
