import { useState, useRef, useCallback, useEffect } from "react";

interface BottomToolbarProps {
  onStyleSelect: (mode: string) => void;
  onCustomCommand: (command: string) => void;
  selectedText: string;
  loading: boolean;
}

const STYLE_PRESETS: { mode: string; label: string }[] = [
  { mode: "shorter", label: "Shorter" },
  { mode: "more-confident", label: "More Confident" },
  { mode: "more-structured", label: "More Structured" },
  { mode: "more-formal", label: "More Formal" },
  { mode: "simpler", label: "Simpler" },
];

export function BottomToolbar({
  onStyleSelect,
  onCustomCommand,
  selectedText,
  loading,
}: BottomToolbarProps) {
  const [commandText, setCommandText] = useState("");
  const [commandActive, setCommandActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasSelection = selectedText.length > 0;
  const disabled = !hasSelection || loading;

  // Listen for "/" key globally to activate command input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        // Don't capture if the editor has focus with a selection —
        // let the toolbar handle it only when appropriate
        if (hasSelection) {
          e.preventDefault();
          setCommandActive(true);
          setCommandText("");
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasSelection]);

  const handleCommandSubmit = useCallback(() => {
    const trimmed = commandText.trim();
    if (trimmed) {
      onCustomCommand(trimmed);
      setCommandText("");
      setCommandActive(false);
    }
  }, [commandText, onCustomCommand]);

  const handleCommandKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCommandSubmit();
      } else if (e.key === "Escape") {
        setCommandActive(false);
        setCommandText("");
      }
    },
    [handleCommandSubmit],
  );

  return (
    <div style={styles.toolbar}>
      <div style={styles.leftSection}>
        <div style={styles.presets}>
          {STYLE_PRESETS.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => onStyleSelect(mode)}
              disabled={disabled}
              style={{
                ...styles.presetButton,
                ...(disabled ? styles.presetButtonDisabled : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.commandSection}>
          <input
            ref={inputRef}
            type="text"
            value={commandText}
            onChange={(e) => {
              setCommandText(e.target.value);
              if (!commandActive) setCommandActive(true);
            }}
            onFocus={() => setCommandActive(true)}
            onBlur={() => {
              if (!commandText.trim()) setCommandActive(false);
            }}
            onKeyDown={handleCommandKeyDown}
            placeholder="Type / for custom command..."
            disabled={disabled}
            style={{
              ...styles.commandInput,
              ...(commandActive ? styles.commandInputActive : {}),
              ...(disabled ? styles.commandInputDisabled : {}),
            }}
          />
          {commandActive && commandText.trim() && (
            <button
              onClick={handleCommandSubmit}
              disabled={disabled}
              style={styles.submitButton}
            >
              Go
            </button>
          )}
        </div>
      </div>

      <div style={styles.rightSection}>
        {loading && <span style={styles.loadingIndicator}>Processing...</span>}
        {hasSelection && !loading && (
          <span style={styles.charCount}>
            {selectedText.length} char{selectedText.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
        )}
        {!hasSelection && !loading && (
          <span style={styles.hint}>Select text to rewrite</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    gap: "12px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  presets: {
    display: "flex",
    gap: "6px",
    flexShrink: 0,
  } as React.CSSProperties,
  presetButton: {
    padding: "5px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "5px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
    color: "#374151",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  presetButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    pointerEvents: "none" as const,
  } as React.CSSProperties,
  commandSection: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
    minWidth: "120px",
  } as React.CSSProperties,
  commandInput: {
    flex: 1,
    padding: "5px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: "5px",
    fontSize: "12px",
    color: "#374151",
    backgroundColor: "white",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  } as React.CSSProperties,
  commandInputActive: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.1)",
  } as React.CSSProperties,
  commandInputDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    backgroundColor: "#f9fafb",
  } as React.CSSProperties,
  submitButton: {
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
    flexShrink: 0,
  } as React.CSSProperties,
  rightSection: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  } as React.CSSProperties,
  charCount: {
    fontSize: "12px",
    color: "#6b7280",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  hint: {
    fontSize: "12px",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  loadingIndicator: {
    fontSize: "12px",
    color: "#2563eb",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
};
