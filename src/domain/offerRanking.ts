import type { OfferViewModel } from "@/types/offer";

const sortBy = (a: OfferViewModel, b: OfferViewModel) =>
  b.savings - a.savings || b.priorityScore - a.priorityScore;

const tag = (offer: OfferViewModel | null, label: string): OfferViewModel | null =>
  offer ? { ...offer, label } : null;

/**
 * Ranks and labels search results per product rules:
 *  - 0 cards → Best Offer + Default (2 max)
 *  - 1 card  → Your Card Offer + Better Alternative (only if genuinely better) + Default
 *  - 2 cards → Your Card Offer + Second Selected Card + Better Alternative (only if better) + Default
 * Labels map to display variants in ResultsSection.decorateResults.
 * Never duplicates. Never pads to a fixed count.
 */
export function rankAndLabelOffers(
  active: OfferViewModel[],
  selectedBanks: string[]
): OfferViewModel[] {
  const cardOffers = active.filter((o) => o.bank !== null && o.paymentMethod !== "NO_CARD");
  const defaults = active.filter((o) => o.bank === null || o.paymentMethod === "NO_CARD");
  const bestDefault = pickBest(defaults);

  if (selectedBanks.length === 0) {
    const bestCard = pickBest(cardOffers);
    return dedupe([
      tag(bestCard, "Best Offer"),
      tag(bestDefault, "Default"),
    ]);
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
    const primary = bestSelected[0] ?? null;
    const betterAlt =
      bestOutside && primary && bestOutside.savings > primary.savings ? bestOutside : null;
    return dedupe([
      tag(primary, "Your Card Offer"),
      tag(betterAlt, "Better Alternative"),
      tag(bestDefault, "Default"),
    ]);
  }

  // 2+ cards
  const primary = bestSelected[0] ?? null;
  const secondary = bestSelected[1] ?? null;
  const betterAlt =
    bestOutside && primary && bestOutside.savings > primary.savings ? bestOutside : null;
  return dedupe([
    tag(primary, "Your Card Offer"),
    tag(secondary, "Second Selected Card"),
    tag(betterAlt, "Better Alternative"),
    tag(bestDefault, "Default"),
  ]);
}

/** @deprecated Use rankAndLabelOffers for search results. */
export function rankOffers(
  active: OfferViewModel[],
  selectedBanks: string[]
): OfferViewModel[] {
  return rankAndLabelOffers(active, selectedBanks);
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
