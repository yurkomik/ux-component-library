export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  siteUrl?: string;
  siteName?: string;
}

export function getOpenRouterConfig(): OpenRouterConfig {
  return {
    apiKey:
      (window as any).__OPENROUTER_API_KEY__ ||
      localStorage.getItem("openrouter_api_key") ||
      "",
    model:
      localStorage.getItem("openrouter_model") || "google/gemini-2.5-flash",
    siteUrl: window.location.origin,
    siteName: "CodeMirror Proofing POC",
  };
}
