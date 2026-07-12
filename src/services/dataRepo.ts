/**
 * Data repository — local/api mode is explicit (VITE_DATA_SOURCE; VITE_DATA_MODE is a compatibility alias).
 * local → generated synchronized fixtures (never touches the network).
 * api   → real fetch; on failure, throws — no silent mock fallback.
 */

import { format } from "date-fns";
import { log } from "@/lib/logger";
import { getDataMode } from "@/config/dataMode";
import type { OfferViewModel } from "@/types/offer";
import type { CityOption } from "@/components/CityAutocomplete";
import { getLocalOffers, searchLocalOffers } from "@/data/repositories/LocalOfferRepository";
import {
  searchOffers as apiSearch,
  fetchAllOffers as apiFetchAll,
  fetchFeatureFlags as apiFetchFlags,
  fetchAllOffersPage,
} from "@/services/api";
import { mapApiOffer } from "@/domain/offerMapper";
import generatedFlags from "@/data/generated/featureFlags.json";
import generatedManifest from "@/data/generated/manifest.json";
import type { FeatureFlags, OfferFilters } from "@/services/api";

export interface SearchResult {
  offers: OfferViewModel[];
  strip7days: Array<{ date: string; displayText: string }>;
}

export const isLocalMode = () => getDataMode() === "local";

// ── Search offers ─────────────────────────────────────────
export async function repoSearchOffers(
  from: CityOption,
  to: CityOption,
  date: Date,
  banks: string[],
  _isAuthenticated: boolean,
  signal?: AbortSignal,
  bookingAmount?: number
): Promise<SearchResult> {
  if (isLocalMode()) return searchLocalOffers(from, to, date, banks, bookingAmount);

  const dateStr = format(date, "yyyy-MM-dd");
  const response = await apiSearch(from.code, to.code, dateStr, banks, [], _isAuthenticated, signal, bookingAmount);
  const offers = response.offers.map(mapApiOffer);
  const strip7days: SearchResult["strip7days"] = (response.date_strip ?? []).map((day) => ({
    date: day.date,
    displayText: day.display_text,
  }));
  log.info("API search ok", { offers: offers.length });
  return { offers, strip7days };
}

// ── All offers catalog ────────────────────────────────────
export async function repoFetchAllOffers(
  _isAuthenticated: boolean,
  filters: OfferFilters = {},
  signal?: AbortSignal
): Promise<OfferViewModel[]> {
  if (isLocalMode()) return getLocalOffers();
  const raw = await apiFetchAll(_isAuthenticated, filters, signal);
  return raw.map(mapApiOffer);
}

export async function repoFetchAllOffersPage(
  filters: OfferFilters = {},
  signal?: AbortSignal,
) {
  if (isLocalMode()) {
    const offers = getLocalOffers();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const start = (page - 1) * limit;
    return {
      offers: offers.slice(start, start + limit),
      pagination: { page, limit, total: offers.length, total_pages: Math.ceil(offers.length / limit) },
      facets: null,
    };
  }
  const response = await fetchAllOffersPage(filters, signal);
  return { ...response, offers: response.offers.map(mapApiOffer) };
}

// ── Feature flags ─────────────────────────────────────────
export async function repoFetchFeatureFlags(): Promise<FeatureFlags> {
  if (isLocalMode()) return {
    ...generatedFlags,
    config_version: generatedManifest.feature_config_version,
  };
  return apiFetchFlags();
}
