/**
 * Pure filtering for the offer catalogue.
 * Rules:
 *  - OR within a single group
 *  - AND across groups
 *  - Bank filter is STRICT in the catalogue (main-search ranking preference lives in offerRanking).
 *  - Only publish_status = READY offers are eligible.
 */

import type {
  BookingChannel,
  OfferViewModel,
  PaymentMethod,
  PlatformId,
} from "@/types/offer";
import { isOfferActive } from "@/domain/offerValidity";

export interface OfferFilters {
  platformIds: PlatformId[];
  bankIds: string[];
  paymentMethods: PaymentMethod[];
  bookingChannels: BookingChannel[];
  categories: Array<"FLIGHT_DOMESTIC">;
  activeOn?: string; // yyyy-MM-dd
}

export const EMPTY_FILTERS: OfferFilters = {
  platformIds: [],
  bankIds: [],
  paymentMethods: [],
  bookingChannels: [],
  categories: [],
};

export function eligibleOffers(all: OfferViewModel[], activeOn?: string): OfferViewModel[] {
  const now = activeOn ? new Date(activeOn) : undefined;
  return all.filter(
    (o) => o.isActive && o.publishStatus === "READY" && isOfferActive(o, now)
  );
}

export function filterOffers(
  offers: OfferViewModel[],
  filters: OfferFilters
): OfferViewModel[] {
  return offers.filter((o) => matchesAllGroups(o, filters));
}

function matchesAllGroups(o: OfferViewModel, f: OfferFilters): boolean {
  if (f.platformIds.length && !f.platformIds.includes(o.platformId)) return false;
  if (f.bankIds.length && (!o.bankId || !f.bankIds.includes(o.bankId))) return false;
  if (f.paymentMethods.length && !f.paymentMethods.includes(o.paymentMethod)) return false;
  if (f.bookingChannels.length && !f.bookingChannels.includes(o.bookingChannel)) return false;
  if (f.categories.length && !f.categories.includes(o.category)) return false;
  return true;
}
