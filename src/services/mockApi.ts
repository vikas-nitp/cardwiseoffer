/**
 * Mock offer repository — reads normalized fixtures and produces OfferViewModel.
 * The Excel file is NOT read at runtime; fixtures are generated once from it.
 */

import { format } from "date-fns";
import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";
import { mapApiOffer, type ApiOffer } from "@/domain/offerMapper";
import { isOfferEligible } from "@/domain/offerValidity";
import { rankOffers } from "@/domain/offerRanking";
import { buildFlightSearchUrl, platformHomeUrl } from "@/domain/platformUrlBuilder";
import { bookingWindowDates } from "@/domain/bookingWindow";
import offersJson from "@/data/generated/offers.json";

const ALL_OFFERS: OfferViewModel[] = (offersJson as ApiOffer[]).map(mapApiOffer);

function attachRouteUrls(offers: OfferViewModel[], from: string, to: string, date: string): OfferViewModel[] {
  return offers.map((o) => ({
    ...o,
    platformUrl: buildFlightSearchUrl(o.platform, { from, to, date }),
  }));
}

function attachCatalogUrls(offers: OfferViewModel[]): OfferViewModel[] {
  return offers.map((o) => ({ ...o, platformUrl: platformHomeUrl(o.platform) }));
}

// ── Public API ─────────────────────────────────────────────
export function mockSearch(
  from: CityOption,
  to: CityOption,
  date: Date,
  selectedBanks: string[]
): { offers: OfferViewModel[]; strip7days: Array<{ date: string; bestBenefit: number | null }> } {
  const dateStr = format(date, "yyyy-MM-dd");
  const active = ALL_OFFERS.filter((o) => isOfferEligible(o, date));
  const ranked = rankOffers(active, selectedBanks);
  const withUrls = attachRouteUrls(ranked, from.code, to.code, dateStr);

  // The strip communicates offer availability, never synthetic fares or savings.
  const strip = bookingWindowDates().map((d) => {
    const isoDate = format(d, "yyyy-MM-dd");
    const activeThatDay = ALL_OFFERS.filter((o) => isOfferEligible(o, new Date(isoDate)));
    const bestBenefit = activeThatDay.reduce((best, offer) => Math.max(best, offer.savings), 0);
    return { date: isoDate, bestBenefit: bestBenefit > 0 ? bestBenefit : null };
  });

  return { offers: withUrls, strip7days: strip };
}

export function mockAllOffers(): OfferViewModel[] {
  const active = ALL_OFFERS.filter((o) => isOfferEligible(o));
  const sorted = [...active].sort((a, b) => b.savings - a.savings || b.priorityScore - a.priorityScore);
  return attachCatalogUrls(sorted);
}

export function mockAllOffersRaw(): OfferViewModel[] {
  return ALL_OFFERS;
}
