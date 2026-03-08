interface Synonym {
  word: string;
  rewrittenSentence?: string;
}

interface SynonymPopoverProps {
  word: string;
  synonyms: Synonym[];
  onApply: (replacement: string, isFullSentence: boolean) => void;
  onDismiss: () => void;
  loading: boolean;
}

export function SynonymPopover({
  word,
  synonyms,
  onApply,
  onDismiss,
  loading,
}: SynonymPopoverProps) {
  const displaySynonyms = synonyms.slice(0, 7);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.originalWord}>{word}</span>
        <button onClick={onDismiss} style={styles.dismissButton}>
          &times;
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <span style={styles.spinner} />
          Finding synonyms...
        </div>
      ) : displaySynonyms.length === 0 ? (
        <div style={styles.empty}>No synonyms found</div>
      ) : (
        <div style={styles.chipList}>
          {displaySynonyms.map((syn, i) => (
            <button
              key={i}
              style={styles.chip}
              onClick={() =>
                onApply(
                  syn.rewrittenSentence ?? syn.word,
                  !!syn.rewrittenSentence,
                )
              }
              title={
                syn.rewrittenSentence
                  ? `Rewrites sentence: ${syn.rewrittenSentence}`
                  : `Replace "${word}" with "${syn.word}"`
              }
            >
              <span style={styles.chipText}>{syn.word}</span>
              {syn.rewrittenSentence && (
                <span style={styles.rewriteBadge}>rewrites sentence</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
    minWidth: "200px",
    maxWidth: "340px",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderBottom: "1px solid #f3f4f6",
    backgroundColor: "#f9fafb",
  } as React.CSSProperties,
  originalWord: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  } as React.CSSProperties,
  dismissButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#9ca3af",
    padding: "0 2px",
    lineHeight: 1,
  } as React.CSSProperties,
  loading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    fontSize: "13px",
    color: "#6b7280",
  } as React.CSSProperties,
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  } as React.CSSProperties,
  empty: {
    padding: "12px",
    fontSize: "13px",
    color: "#9ca3af",
    textAlign: "center" as const,
  } as React.CSSProperties,
  chipList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "6px",
    padding: "10px 12px",
  } as React.CSSProperties,
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
    transition: "all 0.15s",
    lineHeight: "1.4",
  } as React.CSSProperties,
  chipText: {
    // no extra styles needed, inherits from chip
  } as React.CSSProperties,
  rewriteBadge: {
    fontSize: "9px",
    fontWeight: 600,
    color: "#7c3aed",
    backgroundColor: "#ede9fe",
    borderRadius: "4px",
    padding: "1px 4px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.03em",
  } as React.CSSProperties,
};
