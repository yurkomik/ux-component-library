interface ProofingStats {
  spelling: number;
  grammar: number;
  style: number;
}

interface ProofingToolbarProps {
  stats: ProofingStats;
  spellEnabled: boolean;
  grammarEnabled: boolean;
  onToggleSpell: () => void;
  onToggleGrammar: () => void;
}

export function ProofingToolbar({
  stats,
  spellEnabled,
  grammarEnabled,
  onToggleSpell,
  onToggleGrammar,
}: ProofingToolbarProps) {
  return (
    <div style={styles.toolbar}>
      <div style={styles.toggles}>
        <button
          onClick={onToggleSpell}
          style={{
            ...styles.toggle,
            ...(spellEnabled ? styles.toggleActive : {}),
          }}
        >
          <span style={styles.dot(spellEnabled ? "#ef4444" : "#d1d5db")} />
          Spelling
          {stats.spelling > 0 && (
            <span style={styles.badge("#ef4444")}>{stats.spelling}</span>
          )}
        </button>

        <button
          onClick={onToggleGrammar}
          style={{
            ...styles.toggle,
            ...(grammarEnabled ? styles.toggleActive : {}),
          }}
        >
          <span style={styles.dot(grammarEnabled ? "#3b82f6" : "#d1d5db")} />
          Grammar
          {(stats.grammar + stats.style) > 0 && (
            <span style={styles.badge("#3b82f6")}>
              {stats.grammar + stats.style}
            </span>
          )}
        </button>
      </div>

      <div style={styles.summary}>
        {stats.spelling + stats.grammar + stats.style === 0
          ? "No issues found"
          : `${stats.spelling + stats.grammar + stats.style} issue${stats.spelling + stats.grammar + stats.style === 1 ? "" : "s"} found`}
      </div>
    </div>
  );
}

const styles = {
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  } as React.CSSProperties,
  toggles: {
    display: "flex",
    gap: "8px",
  } as React.CSSProperties,
  toggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: "#6b7280",
    transition: "all 0.15s",
  } as React.CSSProperties,
  toggleActive: {
    borderColor: "#d1d5db",
    color: "#111827",
  } as React.CSSProperties,
  dot: (color: string) =>
    ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: color,
      display: "inline-block",
    }) as React.CSSProperties,
  badge: (color: string) =>
    ({
      backgroundColor: color,
      color: "white",
      borderRadius: "10px",
      padding: "1px 7px",
      fontSize: "11px",
      fontWeight: 600,
      marginLeft: "4px",
    }) as React.CSSProperties,
  summary: {
    fontSize: "13px",
    color: "#6b7280",
  } as React.CSSProperties,
};
