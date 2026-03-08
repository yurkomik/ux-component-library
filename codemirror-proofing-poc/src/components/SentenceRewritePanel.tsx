import { computeWordDiff, type DiffChunk } from "@/diff";

interface Alternative {
  text: string;
  style: string;
}

interface SentenceRewritePanelProps {
  original: string;
  alternatives: Alternative[];
  onApply: (text: string) => void;
  onDismiss: () => void;
  loading: boolean;
}

export function SentenceRewritePanel({
  original,
  alternatives,
  onApply,
  onDismiss,
  loading,
}: SentenceRewritePanelProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Alternative Phrasings</span>
        <button onClick={onDismiss} style={styles.dismissButton}>
          &times;
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <span style={styles.spinner} />
          Generating alternatives...
        </div>
      ) : alternatives.length === 0 ? (
        <div style={styles.empty}>No alternatives generated</div>
      ) : (
        <div style={styles.cardList}>
          {alternatives.map((alt, i) => (
            <AlternativeCard
              key={i}
              original={original}
              alternative={alt}
              onApply={() => onApply(alt.text)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlternativeCard({
  original,
  alternative,
  onApply,
}: {
  original: string;
  alternative: Alternative;
  onApply: () => void;
}) {
  const chunks = computeWordDiff(original, alternative.text);

  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{alternative.style}</div>
      <div style={styles.cardDiff}>
        {chunks.map((chunk, i) => (
          <InlineDiffSpan key={i} chunk={chunk} />
        ))}
      </div>
      <div style={styles.cardActions}>
        <button onClick={onApply} style={styles.applyButton}>
          Apply
        </button>
      </div>
    </div>
  );
}

function InlineDiffSpan({ chunk }: { chunk: DiffChunk }) {
  const style =
    chunk.kind === "delete"
      ? styles.deleted
      : chunk.kind === "insert"
        ? styles.inserted
        : undefined;

  return <span style={style}>{chunk.text}</span>;
}

const styles = {
  container: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    maxHeight: "400px",
    overflowY: "auto" as const,
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    position: "sticky" as const,
    top: 0,
    zIndex: 1,
  } as React.CSSProperties,
  title: {
    fontWeight: 600,
    fontSize: "14px",
    color: "#111827",
  } as React.CSSProperties,
  dismissButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#9ca3af",
    padding: "0 2px",
    lineHeight: 1,
  } as React.CSSProperties,
  loading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "20px 16px",
    fontSize: "14px",
    color: "#6b7280",
    justifyContent: "center",
  } as React.CSSProperties,
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  } as React.CSSProperties,
  empty: {
    padding: "20px 16px",
    fontSize: "14px",
    color: "#9ca3af",
    textAlign: "center" as const,
  } as React.CSSProperties,
  cardList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1px",
    backgroundColor: "#f3f4f6",
  } as React.CSSProperties,
  card: {
    padding: "12px 16px",
    backgroundColor: "white",
  } as React.CSSProperties,
  cardLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "6px",
  } as React.CSSProperties,
  cardDiff: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#374151",
    whiteSpace: "pre-wrap" as const,
    marginBottom: "8px",
  } as React.CSSProperties,
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
  } as React.CSSProperties,
  applyButton: {
    padding: "4px 12px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
    transition: "background-color 0.15s",
  } as React.CSSProperties,
  deleted: {
    backgroundColor: "#fecaca",
    textDecoration: "line-through",
    color: "#991b1b",
    borderRadius: "2px",
    padding: "0 1px",
  } as React.CSSProperties,
  inserted: {
    backgroundColor: "#bbf7d0",
    color: "#166534",
    borderRadius: "2px",
    padding: "0 1px",
  } as React.CSSProperties,
};
