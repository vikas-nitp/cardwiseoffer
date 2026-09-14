import type { OfferViewModel } from "@/types/offer";

export interface CatalogueFilters {
  bank: string[];
  platform: string[];
  paymentMethod: string[];
  channel: string[];
}

/** OR within each group, AND across groups. Bank matching is always strict. */
export function filterCatalogueOffers(
  offers: OfferViewModel[],
  filters: CatalogueFilters
): OfferViewModel[] {
  return offers.filter((offer) => {
    if (filters.bank.length > 0 && (!offer.bank || !filters.bank.includes(offer.bank))) {
      return false;
    }
    if (filters.platform.length > 0 && !filters.platform.includes(offer.platform)) {
      return false;
    }
    if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(offer.paymentMethod)) {
      return false;
    }
    if (filters.channel.length > 0) {
      // WEB or APP selection implicitly includes WEB_AND_APP offers
      const expanded = new Set(filters.channel);
      if (filters.channel.includes("WEB") || filters.channel.includes("APP")) {
        expanded.add("WEB_AND_APP");
      }
      if (!expanded.has(offer.bookingChannel)) return false;
    }
    return true;
  });
}
