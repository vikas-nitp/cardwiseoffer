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
  if (offer.discountType === "CASHBACK") {
    // Percentage cashback (value < 100): needs a fare to compute actual savings
    if (offer.discountValue < 100) {
      const pct = offer.discountValue / 100;
      if (typeof fareAmount === "number" && fareAmount > 0) {
        const raw = fareAmount * pct;
        return Math.round(offer.maxDiscount ? Math.min(raw, offer.maxDiscount) : raw);
      }
      return offer.maxDiscount ?? 0;
    }
    // Flat rupee cashback
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
  if (offer.discountType === "CASHBACK") {
    // Values < 100 are percentages (normalizer stores "5% cashback" as value=5, type=CASHBACK).
    // Values >= 100 are flat rupee cashback amounts.
    if (offer.discountValue < 100) {
      const cap = offer.maxDiscount ? ` · up to ₹${offer.maxDiscount.toLocaleString()}` : "";
      return `${offer.discountValue}% cashback${cap}`;
    }
    return `₹${estimateSavings(offer).toLocaleString()} cashback`;
  }
  if (offer.discountType === "FLAT") {
    const amt = estimateSavings(offer);
    if (amt <= 0) return "Offer available";
    let label = `₹${amt.toLocaleString()} off`;
    if (offer.minTransaction && offer.minTransaction > 0) {
      const pct = Math.round((amt / offer.minTransaction) * 100 * 10) / 10;
      if (pct >= 1 && pct <= 100) label += ` (~${pct}%)`;
    }
    return label;
  }
  // PERCENT
  const cap = offer.maxDiscount ? ` · up to ₹${offer.maxDiscount.toLocaleString()}` : "";
  return `${offer.discountValue}% off${cap}`;
}

/**
 * Estimate savings at 5 sample fare points for a PERCENT offer with no cap.
 * Returns an array of {fare, savings} pairs for display as a reference table.
 */
export function fareEstimates(
  offer: OfferViewModel,
  sampleFares = [3000, 5000, 8000, 12000, 20000],
): { fare: number; savings: number }[] {
  if (offer.discountType !== "PERCENT" || !offer.discountValue) return [];
  return sampleFares.map((fare) => ({
    fare,
    savings: Math.round(estimateSavings(offer, fare)),
  }));
}
