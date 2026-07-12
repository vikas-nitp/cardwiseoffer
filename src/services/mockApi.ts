/**
 * Local (mock) offer repository — reads normalized fixtures and produces OfferViewModel.
 * The Excel/CSV file is NOT read at runtime; fixtures are generated once from it.
 */

import { format } from "date-fns";
import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";
import { mapRawOffer } from "@/domain/offerMapper";
import { isOfferActive } from "@/domain/offerValidity";
import { rankOffers } from "@/domain/offerRanking";
import { buildFlightSearchUrl, platformHomeUrl } from "@/domain/platformUrlBuilder";
import offersJson from "@/data/mock/offers.json";

const ALL_OFFERS: OfferViewModel[] = (offersJson as unknown as Parameters<typeof mapRawOffer>[0][]).map(mapRawOffer);

function attachRouteUrls(offers: OfferViewModel[], from: string, to: string, date: string): OfferViewModel[] {
  return offers.map((o) => {
    const url = buildFlightSearchUrl(o.platformName, { from, to, date });
    return { ...o, bookingUrl: url, platformUrl: url };
  });
}

function attachCatalogUrls(offers: OfferViewModel[]): OfferViewModel[] {
  return offers.map((o) => {
    const url = platformHomeUrl(o.platformName);
    return { ...o, bookingUrl: url, platformUrl: url };
  });
}

export function mockSearch(
  from: CityOption,
  to: CityOption,
  date: Date,
  selectedBanks: string[]
): { offers: OfferViewModel[]; strip7days: Array<{ date: string; count: number }> } {
  const active = ALL_OFFERS.filter((o) => o.isActive && o.publishStatus === "READY" && isOfferActive(o));
  const ranked = rankOffers(active, selectedBanks);
  const withUrls = attachRouteUrls(ranked, from.code, to.code, format(date, "yyyy-MM-dd"));

  // Strip = number of active offers per date. Real fare data is unavailable in local mode,
  // so we do NOT fabricate "savings" values.
  const strip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const isoDate = format(d, "yyyy-MM-dd");
    const count = ALL_OFFERS.filter(
      (o) => o.isActive && o.publishStatus === "READY" && isOfferActive(o, new Date(isoDate))
    ).length;
    return { date: isoDate, count };
  });

  return { offers: withUrls, strip7days: strip };
}

export function mockAllOffers(): OfferViewModel[] {
  const active = ALL_OFFERS.filter((o) => o.isActive && o.publishStatus === "READY" && isOfferActive(o));
  const sorted = [...active].sort((a, b) => b.savings - a.savings || b.priorityScore - a.priorityScore);
  return attachCatalogUrls(sorted);
}

export function mockAllOffersRaw(): OfferViewModel[] {
  return ALL_OFFERS;
}
