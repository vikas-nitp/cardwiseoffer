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

/** ISO-date string (yyyy-MM-dd) for a given Date, locale-independent. */
export function toISODateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Number helpers ───────────────────────────────────────────────────────────

/** Clamp `value` to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Format a rupee amount for display: ₹1,200, ₹10,000, etc. */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── String helpers ───────────────────────────────────────────────────────────

/** Return `singular` when count === 1, `plural` otherwise. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

/** Mask all but the last `keep` characters of a string with `*`. */
export function maskString(value: string, keep = 4, mask = "*"): string {
  if (value.length <= keep) return value;
  return mask.repeat(value.length - keep) + value.slice(-keep);
}
