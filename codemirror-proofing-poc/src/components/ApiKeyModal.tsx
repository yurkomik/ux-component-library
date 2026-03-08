import { useState } from "react";

const STORAGE_KEY_API = "openrouter_api_key";
const STORAGE_KEY_MODEL = "openrouter_model";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

interface ApiKeyModalProps {
  onSave: (apiKey: string, model: string) => void;
}

export function ApiKeyModal({ onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);

  const handleSave = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) return;

    localStorage.setItem(STORAGE_KEY_API, trimmedKey);
    localStorage.setItem(STORAGE_KEY_MODEL, model.trim() || DEFAULT_MODEL);
    onSave(trimmedKey, model.trim() || DEFAULT_MODEL);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>OpenRouter API Key</h2>
        <p style={styles.description}>
          Enter your OpenRouter API key to enable AI-powered synonym suggestions
          and sentence rewrites.
        </p>

        <div style={styles.field}>
          <label style={styles.label}>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="sk-or-v1-..."
            style={styles.input}
            autoFocus
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            Model{" "}
            <span style={styles.optional}>(optional)</span>
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={DEFAULT_MODEL}
            style={styles.input}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          style={{
            ...styles.saveButton,
            ...(!apiKey.trim() ? styles.saveButtonDisabled : {}),
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

/** Check if an API key is stored */
export function hasStoredApiKey(): boolean {
  return !!localStorage.getItem(STORAGE_KEY_API);
}

/** Get stored config */
export function getStoredConfig(): {
  apiKey: string;
  model: string;
} | null {
  const apiKey = localStorage.getItem(STORAGE_KEY_API);
  if (!apiKey) return null;
  return {
    apiKey,
    model: localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL,
  };
}

const styles = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  } as React.CSSProperties,
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "28px",
    width: "400px",
    maxWidth: "90vw",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.16)",
  } as React.CSSProperties,
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px",
  } as React.CSSProperties,
  description: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 20px",
    lineHeight: "1.5",
  } as React.CSSProperties,
  field: {
    marginBottom: "16px",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  } as React.CSSProperties,
  optional: {
    fontWeight: 400,
    color: "#9ca3af",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#374151",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  saveButton: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "background-color 0.15s",
    marginTop: "4px",
  } as React.CSSProperties,
  saveButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  } as React.CSSProperties,
};
