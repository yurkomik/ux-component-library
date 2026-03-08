import { ViewPlugin, type ViewUpdate } from "@codemirror/view";
import type { EditorView } from "@codemirror/view";
import { ProofingController } from "@/engine/proofing-controller";
import type { ProofingProvider, SuggestionSource, Suggestion } from "@/types";
import { setSuggestionsEffect } from "./proofing-effects";

export interface ProofingViewPluginConfig {
  providers: ProofingProvider[];
  debounceMs?: number;
}

/**
 * ViewPlugin that bridges document changes to the ProofingController.
 * On doc change: debounces, runs providers, dispatches results as effects.
 */
export function createProofingViewPlugin(config: ProofingViewPluginConfig) {
  return ViewPlugin.define((view: EditorView) => {
    const controller = new ProofingController(
      (source: SuggestionSource, suggestions: Suggestion[], _version: number) => {
        view.dispatch({
          effects: setSuggestionsEffect.of({ source, suggestions }),
        });
      },
    );

    // Register providers
    for (const provider of config.providers) {
      controller.registerProvider(provider);
    }

    // Run initial check
    const initialText = view.state.doc.toString();
    if (initialText.trim()) {
      controller.onDocChange(initialText, config.debounceMs ?? 300);
    }

    return {
      update(update: ViewUpdate) {
        if (update.docChanged) {
          const text = update.state.doc.toString();
          controller.onDocChange(text, config.debounceMs ?? 300);
        }
      },
      destroy() {
        controller.dispose();
      },
    };
  });
}
