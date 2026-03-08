import { useEffect, useRef, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { proofing, type ProofingViewPluginConfig } from "@/codemirror";

interface EditorProps {
  initialText?: string;
  proofingConfig: ProofingViewPluginConfig;
  onSelectionChange?: (selection: { from: number; to: number; text: string }) => void;
}

export function Editor({ initialText = "", proofingConfig, onSelectionChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  const createView = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up existing view
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const state = EditorState.create({
      doc: initialText,
      extensions: [
        // Plain text editing basics
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        placeholder("Start typing or paste text to proof..."),

        // Strip formatting on paste
        EditorView.domEventHandlers({
          paste(event, view) {
            const text = event.clipboardData?.getData("text/plain");
            if (text) {
              event.preventDefault();
              const { from, to } = view.state.selection.main;
              view.dispatch({
                changes: { from, to, insert: text },
                selection: { anchor: from + text.length },
              });
              return true;
            }
            return false;
          },
        }),

        // Selection change listener
        EditorView.updateListener.of((update) => {
          if (update.selectionSet || update.docChanged) {
            const { from, to } = update.state.selection.main;
            if (from !== to) {
              const text = update.state.sliceDoc(from, to);
              onSelectionChangeRef.current?.({ from, to, text });
            } else {
              onSelectionChangeRef.current?.({ from, to, text: "" });
            }
          }
        }),

        // Proofing extensions
        ...proofing(proofingConfig),

        // Line wrapping for plain text
        EditorView.lineWrapping,
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  useEffect(() => {
    createView();
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [createView]);

  return (
    <div
      ref={containerRef}
      className="editor-container"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "white",
      }}
    />
  );
}
