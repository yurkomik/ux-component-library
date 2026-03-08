import { EditorView, Decoration, type DecorationSet } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import { RangeSetBuilder } from "@codemirror/state";
import { proofingStateField } from "./proofing-state-field";
import type { SuggestionCategory } from "@/types";

const categoryClasses: Record<SuggestionCategory, string> = {
  spelling: "cm-proofing-spelling",
  grammar: "cm-proofing-grammar",
  style: "cm-proofing-style",
  rewrite: "cm-proofing-rewrite",
};

/**
 * Derives a DecorationSet from the proofing StateField.
 * Renders underline marks for each active suggestion.
 */
export const proofingDecorations = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(_decos, tr) {
    const store = tr.state.field(proofingStateField);
    const active = store.active;

    if (active.length === 0) return Decoration.none;

    // Sort by from position (required by RangeSetBuilder)
    const sorted = [...active].sort((a, b) => a.from - b.from || a.to - b.to);

    const builder = new RangeSetBuilder<Decoration>();
    const docLength = tr.state.doc.length;

    for (const s of sorted) {
      // Guard against out-of-bounds
      if (s.from < 0 || s.to > docLength || s.from >= s.to) continue;

      const className = categoryClasses[s.category] ?? "cm-proofing-grammar";
      builder.add(
        s.from,
        s.to,
        Decoration.mark({
          class: className,
          attributes: { "data-suggestion-id": s.id },
        }),
      );
    }

    return builder.finish();
  },

  provide(field) {
    return EditorView.decorations.from(field);
  },
});
