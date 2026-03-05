/**
 * Data Repository — API-first with automatic mock fallback
 */

import { format, addDays } from "date-fns";
import { log } from "@/lib/logger";
import type { OfferTile, SearchResponse, FeatureFlags } from "@/services/api";
import {
  searchOffers as apiSearch,
  fetchAllOffers as apiFetchAll,
  fetchFeatureFlags as apiFetchFlags,
  transformSearchResponse,
  transformAllOffers,
} from "@/services/api";
import {
  fetchSearchResults as mockSearch,
  fetchAllOffers as mockAll,
  hashCode,
  ALL_BANKS,
  getBankDiscount,
  CITIES,
} from "@/services/mockApi";
import { DEFAULT_FEATURE_FLAGS, STRIP_DAYS_COUNT } from "@/constants";
import type { CityOption } from "@/components/CityAutocomplete";

let _isMockMode = true;
export const isMockMode = () => _isMockMode;

// ── Generate mock 7-day strip — always NEXT 7 days from selected date ──
function generateMockStrip(date: Date, fromCode: string, toCode: string): Array<{ date: string; price: number }> {
  return Array.from({ length: STRIP_DAYS_COUNT }, (_, i) => {
    const d = addDays(date, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const seed = hashCode(`${fromCode}-${toCode}-${dateStr}`);
    let bestPrice = 0;
    ALL_BANKS.forEach((b) => {
      const disc = getBankDiscount(seed, b);
      if (disc > bestPrice) bestPrice = disc;
    });
    return { date: dateStr, price: bestPrice || 1600 + (seed % 400) };
  });
}

// ── Search offers ──────────────────────────────────────────
export async function repoSearchOffers(
  from: CityOption,
  to: CityOption,
  date: Date,
  banks: string[],
  isAuthenticated: boolean
): Promise<{ offers: OfferTile[]; strip7days: Array<{ date: string; price: number }> }> {
  const dateStr = format(date, "yyyy-MM-dd");
  
  try {
    const response = await apiSearch(from.code, to.code, dateStr, banks, [], isAuthenticated);
    _isMockMode = false;
    const offers = transformSearchResponse(response);
    return { offers, strip7days: response.strip7days || [] };
  } catch (err) {
    log.warn("API search failed, using mock data", err);
    _isMockMode = true;
    const offers = mockSearch(from, to, date, banks);
    const strip7days = generateMockStrip(date, from.code, to.code);
    return { offers, strip7days };
  }
}

// ── All offers catalog ─────────────────────────────────────
export async function repoFetchAllOffers(
  isAuthenticated: boolean
): Promise<OfferTile[]> {
  try {
    const raw = await apiFetchAll(isAuthenticated);
    _isMockMode = false;
    return transformAllOffers(raw);
  } catch (err) {
    log.warn("API all-offers failed, using mock data", err);
    _isMockMode = true;
    return mockAll();
  }
}

// ── Feature flags ──────────────────────────────────────────
export async function repoFetchFeatureFlags(): Promise<FeatureFlags> {
  try {
    const flags = await apiFetchFlags();
    _isMockMode = false;
    return flags;
  } catch (err) {
    log.warn("Feature flags API failed, using defaults", err);
    _isMockMode = true;
    return { ...DEFAULT_FEATURE_FLAGS };
  }
}
