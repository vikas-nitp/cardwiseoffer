import type { OfferViewModel } from "@/types/offer";

/**
 * Deterministic ranking for search results.
 * Rules:
 *  - 0 cards → best card offer + best default (+ optional 2nd card)
 *  - 1 card  → selected best + better alternative (only if higher savings) + default
 *  - 2 cards → best selected + 2nd selected + better outside alt (only if better) + default
 * Never duplicates. Never pads to a fixed count.
 */
export function rankOffers(
  active: OfferViewModel[],
  selectedBanks: string[]
): OfferViewModel[] {
  const cardOffers = active.filter((o) => o.bank !== null && o.paymentMethod !== "NO_CARD");
  const defaults = active.filter((o) => o.bank === null || o.paymentMethod === "NO_CARD");
  const bestDefault = pickBest(defaults);

  const sortBy = (a: OfferViewModel, b: OfferViewModel) =>
    b.savings - a.savings || b.priorityScore - a.priorityScore;

  if (selectedBanks.length === 0) {
    const bestCard = pickBest(cardOffers);
    const secondCard = pickBest(cardOffers.filter((o) => o.id !== bestCard?.id));
    return dedupe([bestCard, bestDefault, secondCard]);
  }

  const selectedOffers = cardOffers.filter((o) => o.bank && selectedBanks.includes(o.bank));
  const outsideOffers = cardOffers.filter((o) => o.bank && !selectedBanks.includes(o.bank));

  const bestByBank = new Map<string, OfferViewModel>();
  for (const o of [...selectedOffers].sort(sortBy)) {
    if (o.bank && !bestByBank.has(o.bank)) bestByBank.set(o.bank, o);
  }
  const bestSelected = [...bestByBank.values()].sort(sortBy);
  const bestOutside = pickBest(outsideOffers);

  if (selectedBanks.length === 1) {
    const primary = bestSelected[0];
    const betterAlt =
      bestOutside && primary && bestOutside.savings > primary.savings ? bestOutside : null;
    return dedupe([primary, betterAlt, bestDefault]);
  }

  // 2+ cards
  const primary = bestSelected[0];
  const secondary = bestSelected[1];
  const betterAlt =
    bestOutside && primary && bestOutside.savings > primary.savings ? bestOutside : null;
  return dedupe([primary, secondary, betterAlt, bestDefault]);
}

export function betterAltDelta(alt: OfferViewModel, primary: OfferViewModel): number {
  return Math.max(0, alt.savings - primary.savings);
}

function pickBest(offers: OfferViewModel[]): OfferViewModel | null {
  if (offers.length === 0) return null;
  return [...offers].sort(
    (a, b) => b.savings - a.savings || b.priorityScore - a.priorityScore
  )[0];
}

function dedupe(list: Array<OfferViewModel | null | undefined>): OfferViewModel[] {
  const seen = new Set<string>();
  const out: OfferViewModel[] = [];
  for (const o of list) {
    if (!o || seen.has(o.id)) continue;
    seen.add(o.id);
    out.push(o);
  }
  return out;
}
