import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { EditorView } from "@codemirror/view";
import { Editor } from "@/components/Editor";
import { ProofingToolbar } from "@/components/ProofingToolbar";
import { SynonymPopover } from "@/components/SynonymPopover";
import { SentenceRewritePanel } from "@/components/SentenceRewritePanel";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ApiKeyModal, hasStoredApiKey } from "@/components/ApiKeyModal";
import { SpellcheckProvider } from "@/providers/spellcheck-provider";
import { GrammarProvider } from "@/providers/grammar-provider";
import { SynonymProvider } from "@/providers/synonym-provider";
import {
  SentenceRewriteProvider,
  type SentenceRewriteStyle,
} from "@/providers/sentence-rewrite-provider";
import { getOpenRouterConfig } from "@/lib/openrouter-config";
import type { ProofingViewPluginConfig } from "@/codemirror";
import { proofingStateField } from "@/codemirror";
import type { Suggestion } from "@/types";

// ─── Sample text ────────────────────────────────────────────────────────────

const SAMPLE_TEXT = `This is a sampel text with some erors that need to be correckted.

The proofing engine should detects misspellings and grammar issues automaticaly.

You can click on any word to see synonym suggestions, or select a sentence and use the bottom toolbar to rewrite it in a different style.

Their going to the store tommorrow to buy grocerries for the party, which is being held at there house on the weekend.`;

// ─── Types ──────────────────────────────────────────────────────────────────

interface SynonymState {
  word: string;
  sentence: string;
  sentenceFrom: number;
  sentenceTo: number;
  wordFrom: number;
  wordTo: number;
  synonyms: Array<{ word: string; rewrittenSentence?: string }>;
  loading: boolean;
  position: { top: number; left: number };
}

interface RewriteState {
  original: string;
  from: number;
  to: number;
  alternatives: Array<{ text: string; style: string }>;
  loading: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract the word under the cursor position in the document. */
function getWordAt(
  doc: string,
  pos: number,
): { word: string; from: number; to: number } | null {
  if (pos < 0 || pos > doc.length) return null;

  const wordChars = /[\w\u0400-\u04FF'-]/; // Latin + Cyrillic + hyphens/apostrophes
  let from = pos;
  let to = pos;

  while (from > 0 && wordChars.test(doc[from - 1]!)) from--;
  while (to < doc.length && wordChars.test(doc[to]!)) to++;

  if (from === to) return null;
  return { word: doc.slice(from, to), from, to };
}

/** Extract the sentence containing the given position. */
function getSentenceAt(
  doc: string,
  pos: number,
): { sentence: string; from: number; to: number } | null {
  if (pos < 0 || pos > doc.length) return null;

  // Walk backward to sentence start
  let from = pos;
  while (from > 0) {
    const ch = doc[from - 1]!;
    if ((ch === "." || ch === "!" || ch === "?") && from < pos) {
      // Skip trailing whitespace after the punctuation
      break;
    }
    if (ch === "\n" && from < pos && doc[from - 2] === "\n") {
      // Double newline = paragraph break
      break;
    }
    from--;
  }

  // Walk forward to sentence end
  let to = pos;
  while (to < doc.length) {
    const ch = doc[to]!;
    if (ch === "." || ch === "!" || ch === "?") {
      to++;
      break;
    }
    if (ch === "\n" && to + 1 < doc.length && doc[to + 1] === "\n") {
      break;
    }
    to++;
  }

  const sentence = doc.slice(from, to).trim();
  if (!sentence) return null;

  // Adjust from to skip leading whitespace
  const leadingSpaces = doc.slice(from, to).length - doc.slice(from, to).trimStart().length;
  return { sentence, from: from + leadingSpaces, to: from + leadingSpaces + sentence.length };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AppV2() {
  // API key state
  const [hasApiKey, setHasApiKey] = useState(() => hasStoredApiKey());

  // Editor refs
  const editorViewRef = useRef<EditorView | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // Proofing state
  const [spellEnabled, setSpellEnabled] = useState(true);
  const [grammarEnabled, setGrammarEnabled] = useState(true);
  const [stats, setStats] = useState({ spelling: 0, grammar: 0, style: 0 });

  // Selection state
  const [selection, setSelection] = useState({ from: 0, to: 0, text: "" });

  // Feature state
  const [synonymState, setSynonymState] = useState<SynonymState | null>(null);
  const [rewriteState, setRewriteState] = useState<RewriteState | null>(null);

  // Abort controllers
  const synonymAbortRef = useRef<AbortController | null>(null);
  const rewriteAbortRef = useRef<AbortController | null>(null);

  // Providers (lazily created when API key is available)
  const synonymProviderRef = useRef<SynonymProvider | null>(null);
  const rewriteProviderRef = useRef<SentenceRewriteProvider | null>(null);

  const ensureProviders = useCallback(() => {
    if (!synonymProviderRef.current) {
      const config = getOpenRouterConfig();
      synonymProviderRef.current = new SynonymProvider({
        openRouter: config,
      });
    }
    if (!rewriteProviderRef.current) {
      const config = getOpenRouterConfig();
      rewriteProviderRef.current = new SentenceRewriteProvider({
        openRouter: config,
      });
    }
  }, []);

  // Proofing providers
  const providers = useMemo(() => {
    const list = [];
    if (spellEnabled) list.push(new SpellcheckProvider());
    if (grammarEnabled) list.push(new GrammarProvider());
    return list;
  }, [spellEnabled, grammarEnabled]);

  const proofingConfig: ProofingViewPluginConfig = useMemo(
    () => ({ providers, debounceMs: 500 }),
    [providers],
  );

  // ─── Selection handler ──────────────────────────────────────────────────

  const handleSelectionChange = useCallback(
    (sel: { from: number; to: number; text: string }) => {
      setSelection(sel);
    },
    [],
  );

  // ─── Editor mount ───────────────────────────────────────────────────────

  const handleEditorMount = useCallback((view: EditorView) => {
    editorViewRef.current = view;

    // Poll stats
    const interval = setInterval(() => {
      try {
        const store = view.state.field(proofingStateField);
        const active = store.active;
        setStats({
          spelling: active.filter((s: Suggestion) => s.category === "spelling").length,
          grammar: active.filter((s: Suggestion) => s.category === "grammar").length,
          style: active.filter((s: Suggestion) => s.category === "style").length,
        });
      } catch {
        // Field may not be available yet
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ─── Synonym flow ──────────────────────────────────────────────────────

  const handleEditorClick = useCallback(
    (e: React.MouseEvent) => {
      const view = editorViewRef.current;
      if (!view || !hasApiKey) return;

      // Only act on single-click without selection drag
      const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
      if (pos === null) return;

      // If there's a text selection (non-collapsed), skip synonym popover
      const { from, to } = view.state.selection.main;
      if (from !== to) return;

      const doc = view.state.doc.toString();
      const wordInfo = getWordAt(doc, pos);
      if (!wordInfo) {
        setSynonymState(null);
        return;
      }

      // Skip very short words
      if (wordInfo.word.length < 2) return;

      const sentenceInfo = getSentenceAt(doc, pos);
      if (!sentenceInfo) return;

      // Get coordinates for popover positioning
      const coords = view.coordsAtPos(wordInfo.from);
      if (!coords) return;

      const containerRect = editorContainerRef.current?.getBoundingClientRect();
      const popoverTop = coords.top - (containerRect?.top ?? 0) - 8;
      const popoverLeft = coords.left - (containerRect?.left ?? 0);

      // Cancel any in-flight synonym request
      synonymAbortRef.current?.abort();
      const ac = new AbortController();
      synonymAbortRef.current = ac;

      setSynonymState({
        word: wordInfo.word,
        sentence: sentenceInfo.sentence,
        sentenceFrom: sentenceInfo.from,
        sentenceTo: sentenceInfo.to,
        wordFrom: wordInfo.from,
        wordTo: wordInfo.to,
        synonyms: [],
        loading: true,
        position: { top: popoverTop, left: popoverLeft },
      });

      ensureProviders();
      synonymProviderRef
        .current!.findSynonyms(wordInfo.word, sentenceInfo.sentence, "en", ac.signal)
        .then((result) => {
          if (ac.signal.aborted) return;
          setSynonymState((prev) =>
            prev
              ? { ...prev, synonyms: result.synonyms, loading: false }
              : null,
          );
        })
        .catch((err) => {
          if (ac.signal.aborted) return;
          console.error("Synonym fetch failed:", err);
          setSynonymState((prev) =>
            prev ? { ...prev, loading: false } : null,
          );
        });
    },
    [hasApiKey, ensureProviders],
  );

  const handleSynonymApply = useCallback(
    (replacement: string, isFullSentence: boolean) => {
      const view = editorViewRef.current;
      if (!view || !synonymState) return;

      if (isFullSentence) {
        // Replace the entire sentence
        view.dispatch({
          changes: {
            from: synonymState.sentenceFrom,
            to: synonymState.sentenceTo,
            insert: replacement,
          },
        });
      } else {
        // Replace just the word
        view.dispatch({
          changes: {
            from: synonymState.wordFrom,
            to: synonymState.wordTo,
            insert: replacement,
          },
        });
      }

      setSynonymState(null);
    },
    [synonymState],
  );

  const handleSynonymDismiss = useCallback(() => {
    synonymAbortRef.current?.abort();
    setSynonymState(null);
  }, []);

  // ─── Sentence rewrite flow ─────────────────────────────────────────────

  const triggerRewrite = useCallback(
    (mode: string, customCommand: string | null = null) => {
      const view = editorViewRef.current;
      if (!view || !hasApiKey) return;

      const { from, to } = view.state.selection.main;
      if (from === to) return;

      const text = view.state.sliceDoc(from, to);

      // Cancel in-flight rewrite
      rewriteAbortRef.current?.abort();
      const ac = new AbortController();
      rewriteAbortRef.current = ac;

      setRewriteState({
        original: text,
        from,
        to,
        alternatives: [],
        loading: true,
      });

      ensureProviders();
      rewriteProviderRef
        .current!.rewrite(
          text,
          (customCommand ? "custom" : mode) as SentenceRewriteStyle,
          ac.signal,
          customCommand ?? undefined,
        )
        .then((result) => {
          if (ac.signal.aborted) return;
          setRewriteState((prev) =>
            prev
              ? { ...prev, alternatives: result.alternatives, loading: false }
              : null,
          );
        })
        .catch((err) => {
          if (ac.signal.aborted) return;
          console.error("Rewrite failed:", err);
          setRewriteState((prev) =>
            prev ? { ...prev, loading: false } : null,
          );
        });
    },
    [hasApiKey, ensureProviders],
  );

  const handleStyleSelect = useCallback(
    (mode: string) => {
      triggerRewrite(mode);
    },
    [triggerRewrite],
  );

  const handleCustomCommand = useCallback(
    (command: string) => {
      triggerRewrite("custom", command);
    },
    [triggerRewrite],
  );

  const handleRewriteApply = useCallback(
    (text: string) => {
      const view = editorViewRef.current;
      if (!view || !rewriteState) return;

      view.dispatch({
        changes: {
          from: rewriteState.from,
          to: rewriteState.to,
          insert: text,
        },
      });

      setRewriteState(null);
    },
    [rewriteState],
  );

  const handleRewriteDismiss = useCallback(() => {
    rewriteAbortRef.current?.abort();
    setRewriteState(null);
  }, []);

  // ─── Keyboard shortcut: Ctrl/Cmd + Shift + R ───────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "R" &&
        e.shiftKey &&
        (e.ctrlKey || e.metaKey)
      ) {
        e.preventDefault();
        triggerRewrite("rewrite");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [triggerRewrite]);

  // ─── Dismiss synonym on outside click ──────────────────────────────────

  useEffect(() => {
    if (!synonymState) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-synonym-popover]")) return;
      setSynonymState(null);
    };

    // Use timeout to avoid catching the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [synonymState]);

  // ─── API key save handler ──────────────────────────────────────────────

  const handleApiKeySave = useCallback(() => {
    setHasApiKey(true);
    // Reset providers so they pick up the new config
    synonymProviderRef.current = null;
    rewriteProviderRef.current = null;
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div style={styles.app}>
      {!hasApiKey && <ApiKeyModal onSave={handleApiKeySave} />}

      <header style={styles.header}>
        <h1 style={styles.title}>CodeMirror Proofing POC v2</h1>
        <p style={styles.subtitle}>
          Click a word for synonyms. Select text and use the toolbar below to rewrite.
        </p>
      </header>

      <main style={styles.main}>
        <ProofingToolbar
          stats={stats}
          spellEnabled={spellEnabled}
          grammarEnabled={grammarEnabled}
          onToggleSpell={() => setSpellEnabled((v) => !v)}
          onToggleGrammar={() => setGrammarEnabled((v) => !v)}
        />

        <div
          ref={editorContainerRef}
          style={styles.editorWrapper}
          onClick={handleEditorClick}
        >
          <EditorWithRef
            initialText={SAMPLE_TEXT}
            proofingConfig={proofingConfig}
            onSelectionChange={handleSelectionChange}
            onMount={handleEditorMount}
          />

          {/* Synonym popover - positioned above the clicked word */}
          {synonymState && (
            <div
              data-synonym-popover
              style={{
                position: "absolute",
                top: synonymState.position.top,
                left: synonymState.position.left,
                transform: "translateY(-100%)",
                zIndex: 100,
              }}
            >
              <SynonymPopover
                word={synonymState.word}
                synonyms={synonymState.synonyms}
                onApply={handleSynonymApply}
                onDismiss={handleSynonymDismiss}
                loading={synonymState.loading}
              />
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <BottomToolbar
          onStyleSelect={handleStyleSelect}
          onCustomCommand={handleCustomCommand}
          selectedText={selection.text}
          loading={rewriteState?.loading ?? false}
        />

        {/* Sentence rewrite panel */}
        {rewriteState && (
          <SentenceRewritePanel
            original={rewriteState.original}
            alternatives={rewriteState.alternatives}
            onApply={handleRewriteApply}
            onDismiss={handleRewriteDismiss}
            loading={rewriteState.loading}
          />
        )}
      </main>
    </div>
  );
}

// ─── EditorWithRef (same pattern as App.tsx) ──────────────────────────────

function EditorWithRef({
  onMount,
  ...props
}: React.ComponentProps<typeof Editor> & {
  onMount: (view: EditorView) => (() => void) | void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (containerRef as React.RefObject<HTMLDivElement | null>).current = el;
      if (el && !mountedRef.current) {
        mountedRef.current = true;
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

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = {
  app: {
    maxWidth: "900px",
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
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  editorWrapper: {
    position: "relative" as const,
  } as React.CSSProperties,
};
