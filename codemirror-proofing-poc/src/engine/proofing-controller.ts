import type { ProofingProvider, Suggestion, SuggestionSource } from "@/types";
import { VersionTracker } from "./version-tracker";

export type ProofingResultCallback = (
  source: SuggestionSource,
  suggestions: Suggestion[],
  version: number,
) => void;

/**
 * Orchestrates proofing providers, manages cancellation, and enforces
 * version freshness.
 */
export class ProofingController {
  private versionTracker = new VersionTracker();
  private providers: ProofingProvider[] = [];
  private abortControllers = new Map<string, AbortController>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private onResult: ProofingResultCallback;

  constructor(onResult: ProofingResultCallback) {
    this.onResult = onResult;
  }

  get version(): number {
    return this.versionTracker.version;
  }

  registerProvider(provider: ProofingProvider): void {
    this.providers.push(provider);
  }

  removeProvider(name: string): void {
    const idx = this.providers.findIndex((p) => p.name === name);
    if (idx !== -1) {
      const provider = this.providers[idx]!;
      provider.dispose?.();
      this.providers.splice(idx, 1);
    }
  }

  /**
   * Called on document change. Bumps version, cancels in-flight requests,
   * and schedules provider runs with debounce.
   */
  onDocChange(text: string | (() => string), debounceMs = 300): number {
    const version = this.versionTracker.bump();

    for (const provider of this.providers) {
      // Cancel in-flight
      this.abortControllers.get(provider.name)?.abort();

      // Clear pending debounce
      const existingTimer = this.debounceTimers.get(provider.name);
      if (existingTimer) clearTimeout(existingTimer);

      // Debounce the check
      const timer = setTimeout(() => {
        const resolved = typeof text === "function" ? text() : text;
        this.runProvider(provider, resolved, version);
      }, debounceMs);

      this.debounceTimers.set(provider.name, timer);
    }

    return version;
  }

  /**
   * Run a specific provider immediately (no debounce).
   * Used for explicit actions like spellcheck on load.
   */
  async runProviderNow(
    providerName: string,
    text: string,
  ): Promise<void> {
    const provider = this.providers.find((p) => p.name === providerName);
    if (!provider) return;
    const version = this.versionTracker.version;
    await this.runProvider(provider, text, version);
  }

  private async runProvider(
    provider: ProofingProvider,
    text: string,
    version: number,
  ): Promise<void> {
    const ac = new AbortController();
    this.abortControllers.set(provider.name, ac);

    try {
      const suggestions = await provider.check(text, ac.signal);

      // Discard stale results
      if (!this.versionTracker.isCurrent(version)) {
        return;
      }

      this.onResult(provider.source, suggestions, version);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // Expected cancellation
      }
      console.warn(`Proofing provider "${provider.name}" failed:`, err);
    }
  }

  dispose(): void {
    for (const ac of this.abortControllers.values()) {
      ac.abort();
    }
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    for (const provider of this.providers) {
      provider.dispose?.();
    }
    this.abortControllers.clear();
    this.debounceTimers.clear();
    this.providers = [];
  }
}
