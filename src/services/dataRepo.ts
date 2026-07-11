/**
 * Data repository — mock/api mode is EXPLICIT (VITE_DATA_MODE).
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
import { mapRawOffer } from "@/domain/offerMapper";
import { isOfferActive } from "@/domain/offerValidity";
import { DEFAULT_FEATURE_FLAGS } from "@/constants";
import type { FeatureFlags } from "@/services/api";

export interface SearchResult {
  offers: OfferViewModel[];
  strip7days: Array<{ date: string; savings: number }>;
}

export const isMockMode = () => getDataMode() === "mock";

// ── Search offers ─────────────────────────────────────────
export async function repoSearchOffers(
  from: CityOption,
  to: CityOption,
  date: Date,
  banks: string[],
  _isAuthenticated: boolean
): Promise<SearchResult> {
  if (getDataMode() === "mock") return mockSearch(from, to, date, banks);

  const dateStr = format(date, "yyyy-MM-dd");
  const response = await apiSearch(from.code, to.code, dateStr, banks, [], _isAuthenticated);
  const offers = (response.offers ?? []).map((o) => mapRawOffer(o as any)).filter((o) => isOfferActive(o));
  const strip7days = (response.strip7days ?? []).map((d) => ({ date: d.date, savings: d.price }));
  log.info("API search ok", { offers: offers.length });
  return { offers, strip7days };
}

// ── All offers catalog ────────────────────────────────────
export async function repoFetchAllOffers(_isAuthenticated: boolean): Promise<OfferViewModel[]> {
  if (getDataMode() === "mock") return mockAllOffers();
  const raw = await apiFetchAll(_isAuthenticated);
  return raw.map((o) => mapRawOffer(o as any)).filter((o) => isOfferActive(o));
}

// ── Feature flags ─────────────────────────────────────────
export async function repoFetchFeatureFlags(): Promise<FeatureFlags> {
  if (getDataMode() === "mock") return { ...DEFAULT_FEATURE_FLAGS };
  return apiFetchFlags();
}
