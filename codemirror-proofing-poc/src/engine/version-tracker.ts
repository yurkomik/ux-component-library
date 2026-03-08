/**
 * Monotonically increasing version counter for tracking document state.
 * Used to discard stale async proofing results.
 */
export class VersionTracker {
  private _version = 0;

  get version(): number {
    return this._version;
  }

  bump(): number {
    return ++this._version;
  }

  isCurrent(version: number): boolean {
    return version === this._version;
  }
}
