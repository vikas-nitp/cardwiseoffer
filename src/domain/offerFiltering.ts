import type { OfferViewModel } from "@/types/offer";

export interface CatalogueFilters {
  bank: string[];
  platform: string[];
  paymentMethod: string[];
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
    if (
      filters.paymentMethod.length > 0 &&
      !filters.paymentMethod.includes(offer.paymentMethod)
    ) {
      return false;
    }
    return true;
  });
}
