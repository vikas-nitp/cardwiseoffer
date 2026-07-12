/**
 * Mock offer repository — reads normalized fixtures and produces OfferViewModel.
 * The Excel file is NOT read at runtime; fixtures are generated once from it.
 */

import { format } from "date-fns";
import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";
import { mapLocalOffer, type LocalRawOffer } from "@/domain/offerMapper";
import { isOfferActive } from "@/domain/offerValidity";
import { rankOffers } from "@/domain/offerRanking";
import { buildFlightSearchUrl, platformHomeUrl } from "@/domain/platformUrlBuilder";
import offersJson from "@/data/mock/offers.json";

const ALL_OFFERS: OfferViewModel[] = (offersJson as LocalRawOffer[]).map(mapLocalOffer);

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
): { offers: OfferViewModel[]; strip7days: Array<{ date: string; savings: number }> } {
  const dateStr = format(date, "yyyy-MM-dd");
  const active = ALL_OFFERS.filter((o) => isOfferActive(o));
  const ranked = rankOffers(active, selectedBanks);
  const withUrls = attachRouteUrls(ranked, from.code, to.code, dateStr);

  // Strip = best available savings for each of the next 7 dates (uses same offer pool).
  const strip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const isoDate = format(d, "yyyy-MM-dd");
    const activeThatDay = ALL_OFFERS.filter((o) => isOfferActive(o, new Date(isoDate)));
    const best = activeThatDay.reduce((m, o) => Math.max(m, o.savings), 0);
    return { date: isoDate, savings: best };
  });

  return { offers: withUrls, strip7days: strip };
}

export function mockAllOffers(): OfferViewModel[] {
  const active = ALL_OFFERS.filter((o) => isOfferActive(o));
  const sorted = [...active].sort((a, b) => b.savings - a.savings || b.priorityScore - a.priorityScore);
  return attachCatalogUrls(sorted);
}

export function mockAllOffersRaw(): OfferViewModel[] {
  return ALL_OFFERS;
}
