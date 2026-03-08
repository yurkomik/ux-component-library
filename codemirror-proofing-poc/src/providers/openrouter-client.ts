import {
  getOpenRouterConfig,
  type OpenRouterConfig,
} from "@/lib/openrouter-config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  /** Override the default model for this request */
  model?: string;
  /** Request structured JSON output */
  jsonMode?: boolean;
  /** Temperature for response generation (0-2) */
  temperature?: number;
  /** Maximum tokens in the response */
  maxTokens?: number;
}

interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  error?: { message: string; code?: number };
}

export class OpenRouterClient {
  private config: OpenRouterConfig;

  constructor(config?: Partial<OpenRouterConfig>) {
    const defaults = getOpenRouterConfig();
    this.config = { ...defaults, ...config };
  }

  /**
   * Send a chat completion request to OpenRouter.
   * Returns the parsed content string from the first choice.
   */
  async chat(
    messages: ChatMessage[],
    options: ChatOptions,
    signal: AbortSignal,
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error(
        "OpenRouter API key is not configured. " +
          "Set it via localStorage.setItem('openrouter_api_key', '<key>') " +
          "or window.__OPENROUTER_API_KEY__.",
      );
    }

    const model = options.model ?? this.config.model;

    const body: Record<string, unknown> = {
      model,
      messages,
    };

    if (options.jsonMode) {
      body.response_format = { type: "json_object" };
    }
    if (options.temperature !== undefined) {
      body.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      body.max_tokens = options.maxTokens;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.config.siteUrl ?? window.location.origin,
          "X-Title": this.config.siteName ?? "CodeMirror Proofing POC",
        },
        body: JSON.stringify(body),
        signal,
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `OpenRouter API returned ${response.status}: ${errorText}`,
      );
    }

    const data = (await response.json()) as OpenRouterResponse;

    if (data.error) {
      throw new Error(
        `OpenRouter API error: ${data.error.message}`,
      );
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter returned an empty response");
    }

    return content;
  }

  /**
   * Send a chat request and parse the response as JSON.
   * Automatically enables jsonMode.
   */
  async chatJSON<T>(
    messages: ChatMessage[],
    options: Omit<ChatOptions, "jsonMode">,
    signal: AbortSignal,
  ): Promise<T> {
    const raw = await this.chat(
      messages,
      { ...options, jsonMode: true },
      signal,
    );

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(
        `Failed to parse OpenRouter JSON response: ${raw.slice(0, 200)}`,
      );
    }
  }
}
