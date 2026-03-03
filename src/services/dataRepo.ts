/**
 * Data Repository — API-first with automatic mock fallback
 * 
 * Tries real backend first. If unreachable/error → falls back to mock data.
 * Components ONLY call this layer, never api.ts or mockApi.ts directly.
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
import { DEFAULT_FEATURE_FLAGS } from "@/constants";
import type { CityOption } from "@/components/CityAutocomplete";

// Track if we're in mock mode for DevBanner
let _isMockMode = true;
export const isMockMode = () => _isMockMode;

// ── Generate mock 7-day strip ──────────────────────────────
function generateMockStrip(date: Date, fromCode: string, toCode: string): Array<{ date: string; price: number }> {
  const baseDate = new Date(date);
  // Center the strip around the selected date (3 before, selected, 3 after)
  const startDate = addDays(baseDate, -3);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startDate, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const seed = hashCode(`${fromCode}-${toCode}-${dateStr}`);
    // Find best discount for this date as the "price"
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
