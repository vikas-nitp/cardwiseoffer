import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";

export interface OfferSearchResult {
  offers: OfferViewModel[];
  strip7days: Array<{ date: string; displayText: string }>;
}

export interface OfferRepository {
  search(
    from: CityOption,
    to: CityOption,
    date: Date,
    banks: string[],
    bookingAmount?: number,
    signal?: AbortSignal,
  ): Promise<OfferSearchResult>;
  all(signal?: AbortSignal): Promise<OfferViewModel[]>;
}
