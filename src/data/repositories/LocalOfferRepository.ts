/**
 * Offline offer repository backed by the backend-generated canonical bundle.
 */

import { addDays, format, parseISO } from "date-fns";
import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";
import { mapApiOffer, type ApiOffer } from "@/domain/offerMapper";
import { isOfferEligible } from "@/domain/offerValidity";
import { rankAndLabelOffers } from "@/domain/offerRanking";
import { DATE_STRIP_NO_OFFERS_LABEL, STRIP_DAY_FACTORS } from "@/constants";
import { buildFlightSearchUrl, platformHomeUrl } from "@/domain/platformUrlBuilder";
import { estimateSavings } from "@/domain/offerCalculation";
import offersJson from "@/data/generated/offers.json";
import featureFlags from "@/data/generated/featureFlags.json";
import type { OfferRepository, OfferSearchResult, StripDayEntry } from "./OfferRepository";

const ALL_OFFERS: OfferViewModel[] = (offersJson as unknown as Array<ApiOffer & { is_active?: boolean }>)
  .filter((raw) => raw.is_active !== false)
  .map(mapApiOffer)
  .map((offer) => ({
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
): { offers: OfferViewModel[]; strip7days: StripDayEntry[] } {
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
  const ranked = rankAndLabelOffers(compared, selectedBanks);
  const baseline = ranked[0]?.amountEligible ? ranked[0].savings : null;
  const withComparison = ranked.map((offer) => ({
    ...offer,
    comparisonText: bookingAmount !== undefined && offer.amountEligible && baseline !== null && offer.savings > baseline
      ? `Save ₹${(offer.savings - baseline).toLocaleString()} more`
      : null,
  }));
  const withUrls = attachRouteUrls(withComparison, from.code, to.code, dateStr);

  // Strip: apply day-weight factors to simulate realistic fare variation across the 7-day window.
  const strip = Array.from({ length: 7 }, (_, index) => addDays(date, index)).map((d, index) => {
    const isoDate = format(d, "yyyy-MM-dd");
    const activeThatDay = ALL_OFFERS.filter((o) => isOfferEligible(o, parseISO(isoDate)));

    let displayText: string;

    if (bookingAmount !== undefined && featureFlags.bookingAmountComparisonEnabled) {
      // Strip shows MARKET-BEST savings across ALL active offers (not just selected banks).
      // Tiles still filter by selected banks — strip is a market-wide indicator.
      const dayFare = Math.round(bookingAmount * STRIP_DAY_FACTORS[index]);
      const eligible = activeThatDay.filter(
        (offer) => !offer.minTransaction || dayFare >= offer.minTransaction
      );
      if (eligible.length === 0) {
        displayText = DATE_STRIP_NO_OFFERS_LABEL;
      } else {
        const best = Math.max(...eligible.map((offer) => estimateSavings(offer, dayFare)));
        displayText = `Save ₹${best.toLocaleString()}`;
      }
      return { date: isoDate, displayText, dayFare };
    } else {
      // No fare: show maximum possible savings from each offer's own cap/value.
      // PERCENT → maxDiscount (the hard cap); FLAT → discountValue.
      // minTransaction is ignored — we don't know the user's fare so we show the upper bound.
      if (activeThatDay.length === 0) {
        displayText = DATE_STRIP_NO_OFFERS_LABEL;
      } else {
        const best = Math.max(...activeThatDay.map((o) =>
          o.discountType === "PERCENT" ? (o.maxDiscount ?? 0) : o.discountValue
        ));
        displayText = best > 0 ? `Save up to ₹${best.toLocaleString()}` : DATE_STRIP_NO_OFFERS_LABEL;
      }
      return { date: isoDate, displayText };
    }
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
