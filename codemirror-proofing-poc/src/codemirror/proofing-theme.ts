import { EditorView } from "@codemirror/view";

export const proofingTheme = EditorView.theme({
  "&": {
    fontSize: "16px",
    minHeight: "300px",
  },
  ".cm-content": {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    lineHeight: "1.6",
    padding: "16px",
  },
  ".cm-focused .cm-cursor": {
    borderLeftColor: "#111",
  },
  ".cm-proofing-spelling": {
    textDecoration: "underline wavy #ef4444",
    textDecorationSkipInk: "none",
    cursor: "pointer",
    backgroundColor: "rgba(239, 68, 68, 0.06)",
  },
  ".cm-proofing-grammar": {
    textDecoration: "underline wavy #3b82f6",
    textDecorationSkipInk: "none",
    cursor: "pointer",
    backgroundColor: "rgba(59, 130, 246, 0.06)",
  },
  ".cm-proofing-style": {
    textDecoration: "underline wavy #8b5cf6",
    textDecorationSkipInk: "none",
    cursor: "pointer",
    backgroundColor: "rgba(139, 92, 246, 0.06)",
  },
  ".cm-proofing-rewrite": {
    textDecoration: "underline dashed #a855f7",
    textDecorationSkipInk: "none",
    cursor: "pointer",
    backgroundColor: "rgba(168, 85, 247, 0.08)",
  },
  // Tooltip / popover styles
  ".cm-proofing-tooltip": {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    padding: "0",
    maxWidth: "360px",
    fontSize: "14px",
    overflow: "hidden",
  },
  ".cm-proofing-tooltip-message": {
    padding: "12px 16px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
    lineHeight: "1.4",
  },
  ".cm-proofing-tooltip-replacements": {
    padding: "4px 0",
  },
  ".cm-proofing-tooltip-replacement": {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    border: "none",
    background: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    color: "#1d4ed8",
    fontWeight: "500",
    "&:hover": {
      backgroundColor: "#eff6ff",
    },
  },
  ".cm-proofing-tooltip-actions": {
    display: "flex",
    gap: "8px",
    padding: "8px 16px",
    borderTop: "1px solid #f3f4f6",
  },
  ".cm-proofing-tooltip-dismiss": {
    padding: "4px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    background: "white",
    cursor: "pointer",
    fontSize: "12px",
    color: "#6b7280",
    "&:hover": {
      backgroundColor: "#f9fafb",
    },
  },
});
