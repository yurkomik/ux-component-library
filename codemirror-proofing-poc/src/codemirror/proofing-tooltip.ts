import { EditorView, type Tooltip, showTooltip } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import { proofingStateField, tooltipTargetField } from "./proofing-state-field";
import {
  removeSuggestionEffect,
  dismissSuggestionEffect,
  setTooltipTargetEffect,
} from "./proofing-effects";

/**
 * Creates tooltip content DOM for a suggestion.
 */
function createTooltipDOM(
  view: EditorView,
  suggestionId: string,
): HTMLElement {
  const store = view.state.field(proofingStateField);
  const suggestion = store.suggestions.find((s) => s.id === suggestionId);
  if (!suggestion) {
    const empty = document.createElement("div");
    return empty;
  }

  const container = document.createElement("div");
  container.className = "cm-proofing-tooltip";

  // Message
  const messageEl = document.createElement("div");
  messageEl.className = "cm-proofing-tooltip-message";
  messageEl.textContent = suggestion.message;
  container.appendChild(messageEl);

  // Replacements
  if (suggestion.replacements.length > 0) {
    const replacementsEl = document.createElement("div");
    replacementsEl.className = "cm-proofing-tooltip-replacements";

    for (const replacement of suggestion.replacements) {
      const btn = document.createElement("button");
      btn.className = "cm-proofing-tooltip-replacement";
      btn.textContent = replacement;
      btn.addEventListener("click", () => {
        // Apply the replacement
        view.dispatch({
          changes: {
            from: suggestion.from,
            to: suggestion.to,
            insert: replacement,
          },
          effects: [
            removeSuggestionEffect.of(suggestion.id),
            setTooltipTargetEffect.of(null),
          ],
        });
      });
      replacementsEl.appendChild(btn);
    }

    container.appendChild(replacementsEl);
  }

  // Actions
  const actionsEl = document.createElement("div");
  actionsEl.className = "cm-proofing-tooltip-actions";

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "cm-proofing-tooltip-dismiss";
  dismissBtn.textContent = "Dismiss";
  dismissBtn.addEventListener("click", () => {
    view.dispatch({
      effects: [
        dismissSuggestionEffect.of(suggestion.id),
        setTooltipTargetEffect.of(null),
      ],
    });
  });
  actionsEl.appendChild(dismissBtn);

  container.appendChild(actionsEl);

  return container;
}

/**
 * StateField that produces a tooltip when a suggestion is targeted.
 */
const proofingTooltipField = StateField.define<Tooltip | null>({
  create() {
    return null;
  },

  update(_tooltip, tr) {
    const targetId = tr.state.field(tooltipTargetField);
    if (!targetId) return null;

    const store = tr.state.field(proofingStateField);
    const suggestion = store.suggestions.find(
      (s) => s.id === targetId && !store.dismissed.has(s.id),
    );
    if (!suggestion) return null;

    return {
      pos: suggestion.from,
      end: suggestion.to,
      above: true,
      create(view: EditorView) {
        const dom = createTooltipDOM(view, targetId);
        return { dom };
      },
    };
  },

  provide(field) {
    return showTooltip.from(field);
  },
});

/**
 * Click handler that opens/closes the suggestion tooltip.
 */
const proofingClickHandler = EditorView.domEventHandlers({
  click(event: MouseEvent, view: EditorView) {
    const pos = view.posAtCoords({
      x: event.clientX,
      y: event.clientY,
    });

    if (pos === null) {
      view.dispatch({ effects: setTooltipTargetEffect.of(null) });
      return false;
    }

    const store = view.state.field(proofingStateField);
    const suggestion = store.findAt(pos);

    if (suggestion) {
      const currentTarget = view.state.field(tooltipTargetField);
      if (currentTarget === suggestion.id) {
        // Toggle off
        view.dispatch({ effects: setTooltipTargetEffect.of(null) });
      } else {
        view.dispatch({
          effects: setTooltipTargetEffect.of(suggestion.id),
        });
      }
      return true;
    } else {
      // Click outside a suggestion — close tooltip
      view.dispatch({ effects: setTooltipTargetEffect.of(null) });
    }

    return false;
  },
});

export const proofingTooltip = [proofingTooltipField, proofingClickHandler];
