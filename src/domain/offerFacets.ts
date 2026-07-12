/**
 * Self-excluding facet counts:
 *  - Platform counts apply all filters EXCEPT platform selections.
 *  - Bank counts apply all filters EXCEPT bank selections.
 *  - Payment counts apply all filters EXCEPT payment selections.
 *  - Booking-channel counts apply all filters EXCEPT booking-channel selections.
 * Selected zero-count options remain visible (disabled=true) so the user can clear them.
 */

import type {
  BookingChannel,
  OfferViewModel,
  PaymentMethod,
  PlatformId,
} from "@/types/offer";
import { filterOffers, type OfferFilters } from "@/domain/offerFiltering";

export interface FacetOption {
  id: string;
  name: string;
  count: number;
  selected: boolean;
  disabled: boolean;
}

export interface OfferFacets {
  platforms: FacetOption[];
  banks: FacetOption[];
  paymentMethods: FacetOption[];
  bookingChannels: FacetOption[];
}

export interface FacetUniverse {
  platforms: Array<{ id: PlatformId; name: string }>;
  banks: Array<{ id: string; name: string }>;
  paymentMethods: Array<{ id: PaymentMethod; name: string }>;
  bookingChannels: Array<{ id: BookingChannel; name: string }>;
}

function buildOptions<T extends string>(
  universe: Array<{ id: T; name: string }>,
  selected: T[],
  counts: Map<T, number>
): FacetOption[] {
  return universe.map((u) => {
    const c = counts.get(u.id) ?? 0;
    const isSel = selected.includes(u.id);
    return { id: u.id, name: u.name, count: c, selected: isSel, disabled: c === 0 && !isSel };
  });
}

function countBy<T extends string>(offers: OfferViewModel[], key: (o: OfferViewModel) => T | null): Map<T, number> {
  const m = new Map<T, number>();
  for (const o of offers) {
    const k = key(o);
    if (k == null) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export function calculateFacets(
  offers: OfferViewModel[],
  filters: OfferFilters,
  universe: FacetUniverse
): OfferFacets {
  const withoutPlatform = filterOffers(offers, { ...filters, platformIds: [] });
  const withoutBank = filterOffers(offers, { ...filters, bankIds: [] });
  const withoutPayment = filterOffers(offers, { ...filters, paymentMethods: [] });
  const withoutChannel = filterOffers(offers, { ...filters, bookingChannels: [] });

  return {
    platforms: buildOptions(
      universe.platforms,
      filters.platformIds,
      countBy(withoutPlatform, (o) => o.platformId)
    ),
    banks: buildOptions(
      universe.banks,
      filters.bankIds,
      countBy(withoutBank, (o) => o.bankId)
    ),
    paymentMethods: buildOptions(
      universe.paymentMethods,
      filters.paymentMethods,
      countBy(withoutPayment, (o) => o.paymentMethod)
    ),
    bookingChannels: buildOptions(
      universe.bookingChannels,
      filters.bookingChannels,
      countBy(withoutChannel, (o) => o.bookingChannel)
    ),
  };
}
