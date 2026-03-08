import { computeWordDiff, type DiffChunk } from "@/diff";

interface DiffPreviewProps {
  original: string;
  rewritten: string;
  onAccept: () => void;
  onReject: () => void;
}

export function DiffPreview({
  original,
  rewritten,
  onAccept,
  onReject,
}: DiffPreviewProps) {
  const chunks = computeWordDiff(original, rewritten);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Rewrite Preview</span>
      </div>

      <div style={styles.diffArea}>
        {chunks.map((chunk, i) => (
          <DiffSpan key={i} chunk={chunk} />
        ))}
      </div>

      <div style={styles.actions}>
        <button
          onClick={onReject}
          style={styles.rejectButton}
        >
          Reject
        </button>
        <button
          onClick={onAccept}
          style={styles.acceptButton}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

function DiffSpan({ chunk }: { chunk: DiffChunk }) {
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
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    overflow: "hidden",
  } as React.CSSProperties,
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,
  title: {
    fontWeight: 600,
    fontSize: "14px",
    color: "#374151",
  } as React.CSSProperties,
  diffArea: {
    padding: "16px",
    lineHeight: "1.6",
    fontSize: "15px",
    fontFamily: "'Inter', system-ui, sans-serif",
    whiteSpace: "pre-wrap" as const,
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
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    padding: "12px 16px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  } as React.CSSProperties,
  rejectButton: {
    padding: "8px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
  } as React.CSSProperties,
  acceptButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  } as React.CSSProperties,
};
