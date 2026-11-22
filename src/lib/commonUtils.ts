/**
 * commonUtils.ts — shared pure utility functions used across the app.
 * Domain-specific logic lives in src/domain/; framework wrappers in src/lib/utils.ts.
 */

// ── Date helpers ─────────────────────────────────────────────────────────────

/** Returns midnight (00:00:00.000) of today in local time. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Clamp `value` to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
