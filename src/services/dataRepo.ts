/**
 * Data repository — data source is EXPLICIT (VITE_DATA_SOURCE=local|api).
 * local → always local fixtures (never touches the network).
 * api   → real fetch; on failure, throws — no silent fallback.
 */

import { format } from "date-fns";
import { log } from "@/lib/logger";
import { getDataSource } from "@/config/dataMode";
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
  strip7days: Array<{ date: string; count: number }>;
}

export const isLocalMode = () => getDataSource() === "local";
/** @deprecated */ export const isMockMode = isLocalMode;

export async function repoSearchOffers(
  from: CityOption,
  to: CityOption,
  date: Date,
  banks: string[],
  isAuthenticated: boolean
): Promise<SearchResult> {
  if (getDataSource() === "local") return mockSearch(from, to, date, banks);

  const dateStr = format(date, "yyyy-MM-dd");
  const response = await apiSearch(from.code, to.code, dateStr, banks, [], isAuthenticated);
  const offers = (response.offers ?? [])
    .map((o) => mapRawOffer(o as unknown as Parameters<typeof mapRawOffer>[0]))
    .filter((o) => o.isActive && isOfferActive(o));
  const strip7days = (response.strip7days ?? []).map((d) => ({ date: d.date, count: d.price }));
  log.info("API search ok", { offers: offers.length });
  return { offers, strip7days };
}

export async function repoFetchAllOffers(isAuthenticated: boolean): Promise<OfferViewModel[]> {
  if (getDataSource() === "local") return mockAllOffers();
  const raw = await apiFetchAll(isAuthenticated);
  return raw
    .map((o) => mapRawOffer(o as unknown as Parameters<typeof mapRawOffer>[0]))
    .filter((o) => o.isActive && isOfferActive(o));
}

export async function repoFetchFeatureFlags(): Promise<FeatureFlags> {
  if (getDataSource() === "local") return { ...DEFAULT_FEATURE_FLAGS };
  return apiFetchFlags();
}
