import { useState, useCallback } from "react";
import type { RewriteMode } from "@/types";
import { LLMRewriteService } from "@/providers/llm-rewrite-provider";
import { DiffPreview } from "./DiffPreview";

interface RewritePanelProps {
  selectedText: string;
  selectionFrom: number;
  selectionTo: number;
  onApply: (from: number, to: number, replacement: string) => void;
  apiUrl?: string;
}

const REWRITE_MODES: { mode: RewriteMode; label: string }[] = [
  { mode: "fix-grammar", label: "Fix Grammar" },
  { mode: "rewrite", label: "Rewrite" },
  { mode: "shorter", label: "Make Shorter" },
  { mode: "more-formal", label: "More Formal" },
];

export function RewritePanel({
  selectedText,
  selectionFrom,
  selectionTo,
  onApply,
  apiUrl,
}: RewritePanelProps) {
  const [rewriteResult, setRewriteResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<RewriteMode | null>(null);

  const rewriteService = useState(() => new LLMRewriteService({ apiUrl }))[0];

  const handleRewrite = useCallback(
    async (mode: RewriteMode) => {
      setLoading(true);
      setError(null);
      setActiveMode(mode);
      setRewriteResult(null);

      try {
        const ac = new AbortController();
        const result = await rewriteService.rewrite(
          selectedText,
          mode,
          ac.signal,
        );
        setRewriteResult(result.rewritten);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Rewrite failed",
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedText, rewriteService],
  );

  const handleAccept = useCallback(() => {
    if (rewriteResult) {
      onApply(selectionFrom, selectionTo, rewriteResult);
      setRewriteResult(null);
      setActiveMode(null);
    }
  }, [rewriteResult, selectionFrom, selectionTo, onApply]);

  const handleReject = useCallback(() => {
    setRewriteResult(null);
    setActiveMode(null);
  }, []);

  if (!selectedText) {
    return (
      <div style={styles.empty}>
        Select text in the editor to rewrite it.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Rewrite</span>
        <span style={styles.charCount}>
          {selectedText.length} chars selected
        </span>
      </div>

      <div style={styles.modes}>
        {REWRITE_MODES.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => handleRewrite(mode)}
            disabled={loading}
            style={{
              ...styles.modeButton,
              ...(activeMode === mode ? styles.modeButtonActive : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={styles.loading}>Generating rewrite...</div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {rewriteResult && (
        <DiffPreview
          original={selectedText}
          rewritten={rewriteResult}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  empty: {
    padding: "24px",
    textAlign: "center" as const,
    color: "#9ca3af",
    fontSize: "14px",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  title: {
    fontWeight: 600,
    fontSize: "14px",
    color: "#111827",
  } as React.CSSProperties,
  charCount: {
    fontSize: "12px",
    color: "#6b7280",
  } as React.CSSProperties,
  modes: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  modeButton: {
    padding: "6px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
    transition: "all 0.15s",
  } as React.CSSProperties,
  modeButtonActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
  } as React.CSSProperties,
  loading: {
    padding: "16px",
    textAlign: "center" as const,
    color: "#6b7280",
    fontSize: "14px",
  } as React.CSSProperties,
  error: {
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    borderRadius: "6px",
    fontSize: "13px",
  } as React.CSSProperties,
};
