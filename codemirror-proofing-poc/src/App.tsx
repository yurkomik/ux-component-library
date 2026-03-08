import { useState, useCallback, useMemo, useRef } from "react";
import { Editor } from "@/components/Editor";
import { RewritePanel } from "@/components/RewritePanel";
import { ProofingToolbar } from "@/components/ProofingToolbar";
import { SpellcheckProvider } from "@/providers/spellcheck-provider";
import { GrammarProvider } from "@/providers/grammar-provider";
import type { ProofingViewPluginConfig } from "@/codemirror";
import type { Suggestion } from "@/types";
import { proofingStateField } from "@/codemirror";
import { EditorView } from "@codemirror/view";

const SAMPLE_TEXT = `This is a sampel text with some erors that need to be correckted.

The proofing engine should detects misspellings and grammar issues automaticaly.

You can select text and use the rewrite panel to improve it. Try selecting a sentence and clicking one of the rewrite modes.

Their going to the store tommorrow to buy grocerries for the party, which is being held at there house on the weekend.`;

export default function App() {
  const [selection, setSelection] = useState({ from: 0, to: 0, text: "" });
  const [spellEnabled, setSpellEnabled] = useState(true);
  const [grammarEnabled, setGrammarEnabled] = useState(true);
  const [stats, setStats] = useState({ spelling: 0, grammar: 0, style: 0 });
  const editorViewRef = useRef<EditorView | null>(null);

  // Create providers
  const providers = useMemo(() => {
    const list = [];
    if (spellEnabled) {
      list.push(new SpellcheckProvider());
    }
    if (grammarEnabled) {
      list.push(new GrammarProvider());
    }
    return list;
  }, [spellEnabled, grammarEnabled]);

  const proofingConfig: ProofingViewPluginConfig = useMemo(
    () => ({
      providers,
      debounceMs: 500,
    }),
    [providers],
  );

  const handleSelectionChange = useCallback(
    (sel: { from: number; to: number; text: string }) => {
      setSelection(sel);
    },
    [],
  );

  const handleRewriteApply = useCallback(
    (from: number, to: number, replacement: string) => {
      const view = editorViewRef.current;
      if (!view) return;

      view.dispatch({
        changes: { from, to, insert: replacement },
      });
    },
    [],
  );

  // Track stats from suggestion state changes
  const handleEditorMount = useCallback(
    (view: EditorView) => {
      editorViewRef.current = view;

      // Poll stats periodically (simple approach for POC)
      const interval = setInterval(() => {
        if (!view) {
          clearInterval(interval);
          return;
        }
        try {
          const store = view.state.field(proofingStateField);
          const active = store.active;
          setStats({
            spelling: active.filter(
              (s: Suggestion) => s.category === "spelling",
            ).length,
            grammar: active.filter(
              (s: Suggestion) => s.category === "grammar",
            ).length,
            style: active.filter(
              (s: Suggestion) => s.category === "style",
            ).length,
          });
        } catch {
          // Field may not be available yet
        }
      }, 1000);

      return () => clearInterval(interval);
    },
    [],
  );

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>CodeMirror Proofing POC</h1>
        <p style={styles.subtitle}>
          Plain-text proofreading and rewriting editor
        </p>
      </header>

      <main style={styles.main}>
        <div style={styles.editorSection}>
          <ProofingToolbar
            stats={stats}
            spellEnabled={spellEnabled}
            grammarEnabled={grammarEnabled}
            onToggleSpell={() => setSpellEnabled((v) => !v)}
            onToggleGrammar={() => setGrammarEnabled((v) => !v)}
          />

          <EditorWithRef
            initialText={SAMPLE_TEXT}
            proofingConfig={proofingConfig}
            onSelectionChange={handleSelectionChange}
            onMount={handleEditorMount}
          />
        </div>

        <aside style={styles.sidebar}>
          <RewritePanel
            selectedText={selection.text}
            selectionFrom={selection.from}
            selectionTo={selection.to}
            onApply={handleRewriteApply}
            apiUrl="/api/proof/rewrite"
          />
        </aside>
      </main>
    </div>
  );
}

/**
 * Thin wrapper that exposes the EditorView ref on mount.
 */
function EditorWithRef({
  onMount,
  ...props
}: React.ComponentProps<typeof Editor> & {
  onMount: (view: EditorView) => (() => void) | void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // We need to capture the EditorView after the Editor component mounts.
  // Since Editor creates the view internally, we observe the container.
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (containerRef as React.RefObject<HTMLDivElement | null>).current = el;
      if (el && !mountedRef.current) {
        mountedRef.current = true;
        // Wait for EditorView to be created
        requestAnimationFrame(() => {
          const cmContent = el.querySelector(".cm-editor");
          if (cmContent) {
            const view = EditorView.findFromDOM(cmContent as HTMLElement);
            if (view) {
              onMount(view);
            }
          }
        });
      }
    },
    [onMount],
  );

  return (
    <div ref={setRef}>
      <Editor {...props} />
    </div>
  );
}

const styles = {
  app: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  header: {
    marginBottom: "24px",
  } as React.CSSProperties,
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 0",
  } as React.CSSProperties,
  main: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "24px",
    alignItems: "start",
  } as React.CSSProperties,
  editorSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  sidebar: {
    position: "sticky" as const,
    top: "24px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "white",
  } as React.CSSProperties,
};
