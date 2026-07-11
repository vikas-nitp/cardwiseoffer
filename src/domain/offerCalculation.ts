import type { OfferViewModel } from "@/types/offer";

/**
 * Estimated savings for a given (optional) fare.
 * FLAT: min(discountValue, maxDiscount || discountValue).
 * PERCENT: needs a fare. Without fare we cap at maxDiscount and label separately.
 */
export function estimateSavings(offer: OfferViewModel, fareAmount?: number): number {
  if (offer.discountType === "FLAT") {
    const cap = offer.maxDiscount ?? offer.discountValue;
    return Math.min(offer.discountValue, cap);
  }
  // PERCENT
  const pct = offer.discountValue / 100;
  if (typeof fareAmount === "number" && fareAmount > 0) {
    const raw = fareAmount * pct;
    return Math.round(offer.maxDiscount ? Math.min(raw, offer.maxDiscount) : raw);
  }
  // No fare: best we can say is the cap.
  return offer.maxDiscount ?? 0;
}

/** Human label when actual savings can't be computed from a fare. */
export function savingsLabel(offer: OfferViewModel): string {
  if (offer.discountType === "FLAT") return `₹${estimateSavings(offer).toLocaleString()} off`;
  const cap = offer.maxDiscount ? `, max ₹${offer.maxDiscount.toLocaleString()}` : "";
  return `${offer.discountValue}% off${cap}`;
}
