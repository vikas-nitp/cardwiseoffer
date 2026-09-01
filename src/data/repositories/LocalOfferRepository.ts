/**
 * Offline offer repository backed by the backend-generated canonical bundle.
 */

import { addDays, format } from "date-fns";
import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";
import { mapApiOffer, type ApiOffer } from "@/domain/offerMapper";
import { isOfferEligible } from "@/domain/offerValidity";
import { rankOffers } from "@/domain/offerRanking";
import { DATE_STRIP_NO_OFFERS_LABEL } from "@/constants";
import { buildFlightSearchUrl, platformHomeUrl } from "@/domain/platformUrlBuilder";
import { estimateSavings } from "@/domain/offerCalculation";
import offersJson from "@/data/generated/offers.json";
import featureFlags from "@/data/generated/featureFlags.json";
import type { OfferRepository, OfferSearchResult } from "./OfferRepository";

const ALL_OFFERS: OfferViewModel[] = (offersJson as unknown as ApiOffer[]).map(mapApiOffer).map((offer) => ({
  ...offer,
  couponCode: featureFlags.couponCodeEnabled ? offer.couponCode : null,
}));

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
export function searchLocalOffers(
  from: CityOption,
  to: CityOption,
  date: Date,
  selectedBanks: string[],
  bookingAmount?: number
): { offers: OfferViewModel[]; strip7days: Array<{ date: string; displayText: string }> } {
  if (bookingAmount !== undefined && !featureFlags.bookingAmountComparisonEnabled) {
    throw new Error("BOOKING_COMPARISON_DISABLED");
  }
  const dateStr = format(date, "yyyy-MM-dd");
  const active = ALL_OFFERS.filter((o) => isOfferEligible(o, date));
  const compared = active.map((offer) => {
    if (bookingAmount === undefined) return { ...offer, amountEligible: null, comparisonText: null };
    const amountEligible = !offer.minTransaction || bookingAmount >= offer.minTransaction;
    const estimated = amountEligible ? estimateSavings(offer, bookingAmount) : undefined;
    return {
      ...offer,
      amountEligible,
      savings: estimated ?? 0,
      finalPrice: estimated === undefined ? undefined : Math.max(bookingAmount - estimated, 0),
    };
  });
  const ranked = rankOffers(compared, selectedBanks);
  const baseline = ranked[0]?.amountEligible ? ranked[0].savings : null;
  const withComparison = ranked.map((offer) => ({
    ...offer,
    comparisonText: bookingAmount !== undefined && offer.amountEligible && baseline !== null && offer.savings > baseline
      ? `Save ₹${(offer.savings - baseline).toLocaleString()} more`
      : null,
  }));
  const withUrls = attachRouteUrls(withComparison, from.code, to.code, dateStr);

  // The strip communicates offer availability, never synthetic fares or savings.
  const strip = Array.from({ length: 7 }, (_, index) => addDays(date, index)).map((d) => {
    const isoDate = format(d, "yyyy-MM-dd");
    const activeThatDay = ALL_OFFERS.filter((o) => isOfferEligible(o, new Date(isoDate)));
    const cappedAmounts = activeThatDay
      .filter((offer) => offer.discountType === "FLAT" || offer.maxDiscount !== undefined)
      .map((offer) => offer.maxDiscount ?? offer.discountValue);
    const uncappedPercentages = activeThatDay
      .filter((offer) => offer.discountType === "PERCENT" && offer.maxDiscount === undefined)
      .map((offer) => offer.discountValue);
    const displayText = cappedAmounts.length > 0
      ? `Up to ₹${Math.max(...cappedAmounts).toLocaleString()}`
      : uncappedPercentages.length > 0
        ? `Up to ${Math.max(...uncappedPercentages)}% off`
        : DATE_STRIP_NO_OFFERS_LABEL;
    return { date: isoDate, displayText };
  });

  return { offers: withUrls, strip7days: strip };
}

export function getLocalOffers(): OfferViewModel[] {
  const active = ALL_OFFERS.filter((o) => isOfferEligible(o));
  const sorted = [...active].sort((a, b) => b.savings - a.savings || b.priorityScore - a.priorityScore);
  return attachCatalogUrls(sorted);
}

export function getLocalOffersRaw(): OfferViewModel[] {
  return ALL_OFFERS;
}

export class LocalOfferRepository implements OfferRepository {
  async search(
    from: CityOption,
    to: CityOption,
    date: Date,
    banks: string[],
    bookingAmount?: number,
  ): Promise<OfferSearchResult> {
    return searchLocalOffers(from, to, date, banks, bookingAmount);
  }

  async all(): Promise<OfferViewModel[]> {
    return getLocalOffers();
  }
}
