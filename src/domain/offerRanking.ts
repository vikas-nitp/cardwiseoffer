import type { OfferViewModel } from "@/types/offer";

const sortBy = (a: OfferViewModel, b: OfferViewModel) =>
  b.savings - a.savings || b.priorityScore - a.priorityScore;

const tag = (offer: OfferViewModel | null, label: string): OfferViewModel | null =>
  offer ? { ...offer, label } : null;

/**
 * Ranks and labels search results per product rules:
 *  - 0 banks → Best Offer + top 2 platform defaults, sorted by savings
 *  - 1+ banks → ALL offers for selected banks, deduped by bank+platform+paymentType
 *               sorted by savings; first = "Selected" (primary), rest = "Selected Alt"
 *               Better Alternative shown only when outside bank beats the primary
 *               + best single platform default
 * Labels are internal keys; ResultsSection.decorateResults converts them to display text.
 * Never duplicates. Never pads to a fixed count.
 */
export function rankAndLabelOffers(
  active: OfferViewModel[],
  selectedBanks: string[]
): OfferViewModel[] {
  const cardOffers = active.filter((o) => o.bank !== null && o.paymentMethod !== "NO_CARD");
  const defaults = active.filter((o) => o.bank === null || o.paymentMethod === "NO_CARD");

  // Best default offer per platform, sorted by savings descending
  const bestDefaultByPlatform = new Map<string, OfferViewModel>();
  for (const o of [...defaults].sort(sortBy)) {
    if (!bestDefaultByPlatform.has(o.platform)) bestDefaultByPlatform.set(o.platform, o);
  }
  const platformDefaults = [...bestDefaultByPlatform.values()].sort(sortBy);

  if (selectedBanks.length === 0) {
    // No bank selected: best market card offer + top 2 platform offers (capped to avoid noise)
    const defaultCards = platformDefaults.slice(0, 2).map(o => tag(o, "Default"));
    const eligibleCards = cardOffers.filter(o => o.amountEligible !== false);
    const bestCard = pickBest(eligibleCards.length > 0 ? eligibleCards : cardOffers);
    return dedupe([tag(bestCard, "Best Offer"), ...defaultCards]);
  }

  // Bank(s) selected: show only the single best platform default (avoids clutter)
  const defaultCards = [tag(platformDefaults[0] ?? null, "Default")];

  const selectedOffers = cardOffers.filter((o) => o.bank && selectedBanks.includes(o.bank));
  const outsideOffers = cardOffers.filter((o) => o.bank && !selectedBanks.includes(o.bank));
  const bestOutside = pickBest(outsideOffers);

  // All offers for selected banks — deduped by bank+platform+paymentType so the same
  // bank+platform pair never appears twice, but users see every platform for their bank.
  const seenKey = new Set<string>();
  const allSelected: OfferViewModel[] = [];
  for (const o of [...selectedOffers].sort(sortBy)) {
    if (!o.bank) continue;
    const key = `${o.bank}:${o.platform}:${o.paymentMethod}`;
    if (!seenKey.has(key)) { seenKey.add(key); allSelected.push(o); }
  }

  if (allSelected.length === 0) {
    return dedupe([tag(bestOutside, "Best Available"), ...defaultCards]);
  }

  const primary = allSelected[0];
  const betterAlt = bestOutside && bestOutside.savings > primary.savings ? bestOutside : null;

  return dedupe([
    tag(primary, "Selected"),
    ...allSelected.slice(1).map(o => tag(o, "Selected Alt")),
    tag(betterAlt, "Better Alternative"),
    ...defaultCards,
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
