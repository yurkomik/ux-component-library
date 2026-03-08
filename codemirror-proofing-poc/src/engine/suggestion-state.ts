import type { Suggestion, SuggestionSource } from "@/types";

/**
 * Immutable store for proofing suggestions.
 * Each mutation returns a new instance.
 */
export class SuggestionStore {
  private _activeCache: Suggestion[] | null = null;

  constructor(
    readonly suggestions: readonly Suggestion[] = [],
    readonly dismissed: ReadonlySet<string> = new Set(),
  ) {}

  add(newSuggestions: Suggestion[]): SuggestionStore {
    const existing = new Set(this.suggestions.map((s) => s.id));
    const toAdd = newSuggestions.filter((s) => !existing.has(s.id));
    return new SuggestionStore(
      [...this.suggestions, ...toAdd],
      this.dismissed,
    );
  }

  /**
   * Replace all suggestions from a given source with new ones.
   * Used when a provider re-runs and returns a fresh set.
   */
  replaceBySource(
    source: SuggestionSource,
    newSuggestions: Suggestion[],
  ): SuggestionStore {
    const kept = this.suggestions.filter((s) => s.source !== source);
    return new SuggestionStore(
      [...kept, ...newSuggestions],
      this.dismissed,
    );
  }

  remove(id: string): SuggestionStore {
    return new SuggestionStore(
      this.suggestions.filter((s) => s.id !== id),
      this.dismissed,
    );
  }

  dismiss(id: string): SuggestionStore {
    const next = new Set(this.dismissed);
    next.add(id);
    return new SuggestionStore(this.suggestions, next);
  }

  /**
   * Invalidate suggestions whose ranges overlap with a changed region.
   */
  invalidateRange(from: number, to: number): SuggestionStore {
    return new SuggestionStore(
      this.suggestions.filter(
        (s) => s.to <= from || s.from >= to,
      ),
      this.dismissed,
    );
  }

  /**
   * Shift suggestion positions after a text change.
   * Suggestions before the change are unaffected.
   * Suggestions overlapping the change are removed.
   * Suggestions after the change are shifted by the delta.
   */
  mapThroughChange(
    changeFrom: number,
    changeTo: number,
    insertLength: number,
  ): SuggestionStore {
    const delta = insertLength - (changeTo - changeFrom);

    if (delta === 0) {
      // Only filter overlapping, don't spread
      const filtered = this.suggestions.filter(
        (s) => s.to <= changeFrom || s.from >= changeTo,
      );
      if (filtered.length === this.suggestions.length) return this;
      return new SuggestionStore(filtered, this.dismissed);
    }

    const mapped: Suggestion[] = [];

    for (const s of this.suggestions) {
      if (s.to <= changeFrom) {
        // Before change — keep as-is
        mapped.push(s);
      } else if (s.from >= changeTo) {
        // After change — shift
        mapped.push({
          ...s,
          from: s.from + delta,
          to: s.to + delta,
        });
      }
      // Overlapping — drop
    }

    return new SuggestionStore(mapped, this.dismissed);
  }

  findAt(pos: number): Suggestion | undefined {
    return this.suggestions.find(
      (s) => pos >= s.from && pos <= s.to && !this.dismissed.has(s.id),
    );
  }

  findAllAt(pos: number): Suggestion[] {
    return this.suggestions.filter(
      (s) => pos >= s.from && pos <= s.to && !this.dismissed.has(s.id),
    );
  }

  get active(): Suggestion[] {
    if (!this._activeCache) {
      this._activeCache = this.suggestions.filter((s) => !this.dismissed.has(s.id));
    }
    return this._activeCache;
  }
}
