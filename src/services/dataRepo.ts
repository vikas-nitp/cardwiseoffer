/**
 * Data repository — local/api mode is explicit (VITE_DATA_SOURCE; VITE_DATA_MODE is a compatibility alias).
 * mock  → always local fixtures (never touches the network).
 * api   → real fetch; on failure, throws — no silent mock fallback.
 */

import { format } from "date-fns";
import { log } from "@/lib/logger";
import { getDataMode } from "@/config/dataMode";
import type { OfferViewModel } from "@/types/offer";
import type { CityOption } from "@/components/CityAutocomplete";
import { mockSearch, mockAllOffers } from "@/services/mockApi";
import {
  searchOffers as apiSearch,
  fetchAllOffers as apiFetchAll,
  fetchFeatureFlags as apiFetchFlags,
} from "@/services/api";
import { mapApiOffer } from "@/domain/offerMapper";
import { DEFAULT_FEATURE_FLAGS } from "@/constants";
import type { FeatureFlags, OfferFilters } from "@/services/api";

export interface SearchResult {
  offers: OfferViewModel[];
  strip7days: Array<{ date: string; bestBenefit: number | null }>;
}

export const isMockMode = () => getDataMode() === "mock";

// ── Search offers ─────────────────────────────────────────
export async function repoSearchOffers(
  from: CityOption,
  to: CityOption,
  date: Date,
  banks: string[],
  _isAuthenticated: boolean,
  signal?: AbortSignal
): Promise<SearchResult> {
  if (getDataMode() === "mock") return mockSearch(from, to, date, banks);

  const dateStr = format(date, "yyyy-MM-dd");
  const response = await apiSearch(from.code, to.code, dateStr, banks, [], _isAuthenticated, signal);
  const offers = response.offers.map(mapApiOffer);
  const strip7days: SearchResult["strip7days"] = (response.date_strip ?? []).map((day) => ({
    date: day.date,
    bestBenefit: day.best_benefit ?? null,
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
  if (getDataMode() === "mock") return mockAllOffers();
  const raw = await apiFetchAll(_isAuthenticated, filters, signal);
  return raw.map(mapApiOffer);
}

// ── Feature flags ─────────────────────────────────────────
export async function repoFetchFeatureFlags(): Promise<FeatureFlags> {
  if (getDataMode() === "mock") return { ...DEFAULT_FEATURE_FLAGS };
  return apiFetchFlags();
}
