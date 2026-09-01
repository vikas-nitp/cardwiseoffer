import type { CityOption } from "@/components/CityAutocomplete";
import { mapApiOffer } from "@/domain/offerMapper";
import { fetchAllOffers, searchOffers } from "@/services/api";
import type { OfferRepository, OfferSearchResult } from "./OfferRepository";
import { format } from "date-fns";

export class ApiOfferRepository implements OfferRepository {
  async search(
    from: CityOption,
    to: CityOption,
    date: Date,
    banks: string[],
    bookingAmount?: number,
    signal?: AbortSignal,
  ): Promise<OfferSearchResult> {
    const result = await searchOffers(
      from.code,
      to.code,
      format(date, "yyyy-MM-dd"),
      banks,
      [],
      false,
      signal,
      bookingAmount,
    );
    return {
      offers: result.offers.map(mapApiOffer),
      strip7days: result.date_strip.map((item) => ({
        date: item.date,
        displayText: item.display_text,
      })),
    };
  }

  async all(signal?: AbortSignal) {
    return (await fetchAllOffers(false, {}, signal)).map(mapApiOffer);
  }
}
