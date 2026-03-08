import type { Extension } from "@codemirror/state";
import { proofingStateField, tooltipTargetField } from "./proofing-state-field";
import { proofingDecorations } from "./proofing-decoration";
import { proofingTheme } from "./proofing-theme";
import { proofingTooltip } from "./proofing-tooltip";
import {
  createProofingViewPlugin,
  type ProofingViewPluginConfig,
} from "./proofing-view-plugin";

export type { ProofingViewPluginConfig } from "./proofing-view-plugin";

/**
 * Returns the full set of CodeMirror extensions for the proofing layer.
 */
export function proofing(config: ProofingViewPluginConfig): Extension[] {
  return [
    proofingStateField,
    tooltipTargetField,
    proofingDecorations,
    proofingTheme,
    ...proofingTooltip,
    createProofingViewPlugin(config),
  ];
}

export {
  proofingStateField,
  tooltipTargetField,
  proofingDecorations,
  proofingTheme,
  proofingTooltip,
  createProofingViewPlugin,
};

export {
  setSuggestionsEffect,
  removeSuggestionEffect,
  dismissSuggestionEffect,
  clearAllSuggestionsEffect,
  setTooltipTargetEffect,
} from "./proofing-effects";
