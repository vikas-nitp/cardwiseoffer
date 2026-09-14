import { useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import type { CityOption } from "@/components/CityAutocomplete";
import type { StripDay } from "@/components/DateStrip";
import type { OfferViewModel } from "@/types/offer";
import { repoSearchOffers, isLocalMode } from "@/services/dataRepo";
import { log } from "@/lib/logger";
import { analytics } from "@/services/analytics";

export interface SearchState {
  from: CityOption;
  to: CityOption;
  date: Date;
  banks: string[];
  bookingAmount?: number;
}

export function useOfferSearch() {
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [searchResults, setSearchResults] = useState<OfferViewModel[]>([]);
  const [strip7days, setStrip7days] = useState<StripDay[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async (
    from: CityOption, to: CityOption, date: Date, banks: string[], bookingAmount?: number
  ) => {
    analytics.track("search", { from: from.code, to: to.code, date: format(date, "yyyy-MM-dd") });
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setSearchState({ from, to, date, banks, bookingAmount });
    setSearchError(null);
    setSearchLoading(true);
    setStrip7days([]);
    try {
      const result = await repoSearchOffers(from, to, date, banks, false, ctrl.signal, bookingAmount);
      if (ctrl.signal.aborted) return;
      setSearchResults(result.offers);
      setStrip7days(result.strip7days);
      log.info("Search completed", { offers: result.offers.length, mode: isLocalMode() ? "local" : "api" });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setSearchError(err instanceof Error ? err.message : "Failed to fetch offers.");
      setSearchResults([]);
      setStrip7days([]);
    } finally {
      if (controller.current === ctrl) setSearchLoading(false);
    }
  }, []);

  const handleDateChange = useCallback(async (newDate: Date) => {
    analytics.track("date_selection", { date: format(newDate, "yyyy-MM-dd") });
    const current = searchState;
    if (!current) return;

    const newDateStr = format(newDate, "yyyy-MM-dd");
    const stripEntry = strip7days.find((d) => d.date === newDateStr);

    // Date is outside the current 7-day strip window — do a full re-search so the
    // strip regenerates anchored to the new date (handles "Today" jumps, etc.).
    if (!stripEntry) {
      await handleSearch(current.from, current.to, newDate, current.banks, current.bookingAmount);
      return;
    }

    // Date is within the strip — only re-fetch tiles; strip stays anchored.
    // dayFare (user fare mode) → actual day-adjusted fare for tile ranking.
    // No fare mode → pass undefined so ranking uses raw offer terms (maxDiscount).
    const searchAmount = stripEntry.dayFare ?? current.bookingAmount;
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    const nextBookingAmount = stripEntry.dayFare !== undefined ? stripEntry.dayFare : current.bookingAmount;
    setSearchState({ ...current, date: newDate, bookingAmount: nextBookingAmount });
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await repoSearchOffers(
        current.from, current.to, newDate, current.banks,
        false, ctrl.signal, searchAmount
      );
      if (ctrl.signal.aborted) return;
      setSearchResults(result.offers);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setSearchError(err instanceof Error ? err.message : "Failed to fetch offers.");
    } finally {
      if (controller.current === ctrl) setSearchLoading(false);
    }
  }, [searchState, strip7days, handleSearch]);

  return {
    searchState, searchResults, strip7days,
    searchLoading, searchError,
    handleSearch, handleDateChange,
  };
}
