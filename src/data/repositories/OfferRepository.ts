import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";

export interface StripDayEntry {
  date: string;
  displayText: string;
  dayFare?: number;   // user-fare mode: actual day-adjusted fare for tile search
}

export interface OfferSearchResult {
  offers: OfferViewModel[];
  strip7days: StripDayEntry[];
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
