import type { Discovery } from "@/features/ocean/discoveryEngine";

/**
 * DiscoveryQueueManager — pure, framework-agnostic buffer that guarantees
 * lossless, ordered presentation of live discoveries.
 *
 * The dive session accumulates discoveries into a single growing array. This
 * manager tracks how many of those have already been *ingested* (moved into
 * the presentation queue) so that:
 *   - every discovery is shown exactly once (no loss, no duplicates), and
 *   - bursts (multiple discoveries in one tick) all queue up rather than
 *     overwriting one another.
 */
export class DiscoveryQueueManager {
  private queue: Discovery[] = [];
  private ingestedCount = 0;

  /**
   * Reconcile against the full, append-only discoveries list. Any items beyond
   * what we've already ingested are appended to the presentation queue.
   */
  ingest(all: readonly Discovery[]): void {
    if (all.length <= this.ingestedCount) return;
    for (let i = this.ingestedCount; i < all.length; i++) {
      const item = all[i];
      if (item) this.queue.push(item);
    }
    this.ingestedCount = all.length;
  }

  get size(): number {
    return this.queue.length;
  }

  peek(): Discovery | null {
    return this.queue[0] ?? null;
  }

  /** Removes and returns the next discovery to present, or null if empty. */
  dequeue(): Discovery | null {
    return this.queue.shift() ?? null;
  }

  /** Clears everything — call when a new dive starts. */
  reset(): void {
    this.queue = [];
    this.ingestedCount = 0;
  }
}
