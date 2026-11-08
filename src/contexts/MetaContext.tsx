/**
 * Meta Context
 * 
 * Global context for metadata loaded from backend /api/v1/meta.
 * Provides banks, platforms, airports, payment methods, categories.
 * This ensures frontend stays in sync with Excel data.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { log } from "@/lib/logger";
import metadataJson from "@/data/generated/metadata.json";
import { getDataMode } from "@/config/dataMode";
import { fetchMetadata } from "@/services/api";
import { getLocalOffers } from "@/data/repositories/LocalOfferRepository";
import { API_BASE_URL } from "@/constants";

// ── Types (match backend /api/v1/meta response) ────────────────────

export interface BankMeta {
  id: string;      // Canonical code: "HDFC", "ICICI", etc.
  name: string;    // Display name: "HDFC Bank", "ICICI Bank", etc.
}

export interface PlatformMeta {
  id: string;      // e.g., "MakeMyTrip", "Cleartrip"
  name: string;    // Display name (same as id for platforms)
}

export interface AirportMeta {
  code: string;    // IATA code: "BLR", "DEL", etc.
  city: string;    // City name: "Bengaluru", "New Delhi"
  name: string;    // Full airport name
  country: string; // Country code: "IN"
  is_domestic_default: boolean;
}

export interface MetaData {
  banks: BankMeta[];
  platforms: PlatformMeta[];
  airports: AirportMeta[];
  payment_methods: string[];
  booking_channels: string[];
  categories: string[];
  supported_banks: string[];      // Bank IDs currently supported
  supported_platforms: string[];  // Platform IDs currently supported
  availability_start: string | null;
  availability_end: string | null;
  dataset_last_updated_at: string;
  total_offers: number;
}

// ── Safe defaults built from canonical local fixtures ─────────────
const LOCAL_METADATA = metadataJson as {
  banks: BankMeta[];
  platforms: PlatformMeta[];
  airports: AirportMeta[];
  payment_methods: string[];
  booking_channels: string[];
  categories: string[];
  availability_start: string | null;
  availability_end: string | null;
  dataset_last_updated_at: string;
};

const DEFAULT_META: MetaData = {
  banks: LOCAL_METADATA.banks,
  platforms: LOCAL_METADATA.platforms,
  airports: LOCAL_METADATA.airports,
  payment_methods: LOCAL_METADATA.payment_methods,
  booking_channels: LOCAL_METADATA.booking_channels ?? ["WEB_AND_APP"],
  categories: LOCAL_METADATA.categories,
  supported_banks: LOCAL_METADATA.banks.map((bank) => bank.id),
  supported_platforms: LOCAL_METADATA.platforms.map((platform) => platform.id),
  availability_start: LOCAL_METADATA.availability_start,
  availability_end: LOCAL_METADATA.availability_end,
  dataset_last_updated_at: LOCAL_METADATA.dataset_last_updated_at,
  total_offers: getLocalOffers().length,
};

// API URL read safely inside fetchMeta — no crash if missing

// ── Context ────────────────────────────────────────────────────────
interface MetaContextValue {
  meta: MetaData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Convenience helpers
  getBankDisplayName: (bankId: string) => string;
  getPlatformDisplayName: (platformId: string) => string;
  getAirportByCode: (code: string) => AirportMeta | undefined;
}

const MetaContext = createContext<MetaContextValue | null>(null);

export const useMeta = () => {
  const ctx = useContext(MetaContext);
  if (!ctx) {
    throw new Error("useMeta must be used within MetaProvider");
  }
  return ctx;
};

// ── Provider ───────────────────────────────────────────────────────
interface MetaProviderProps {
  children: ReactNode;
}

export const MetaProvider = ({ children }: MetaProviderProps) => {
  // The generated bundle is the bootstrap in both modes. API mode refreshes it,
  // but a transient API failure must not blank navigation and search controls.
  const [meta, setMeta] = useState<MetaData>(DEFAULT_META);
  const [loading, setLoading] = useState(getDataMode() === "api");
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = async () => {
    // Local mode: the generated bundle is the source of truth. Never touch the network.
    if (getDataMode() === "local") {
      setMeta(DEFAULT_META);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMetadata();

      const mergedMeta: MetaData = {
        banks: data.banks || DEFAULT_META.banks,
        platforms: data.platforms || DEFAULT_META.platforms,
        airports: data.airports || DEFAULT_META.airports,
        payment_methods: data.payment_methods || DEFAULT_META.payment_methods,
        booking_channels: (data as { booking_channels?: string[] }).booking_channels ?? DEFAULT_META.booking_channels,
        categories: data.categories || DEFAULT_META.categories,
        supported_banks: data.banks.map((bank) => bank.id),
        supported_platforms: data.platforms.map((platform) => platform.id),
        availability_start: data.availability_start,
        availability_end: data.availability_end,
        dataset_last_updated_at: data.dataset_last_updated_at,
        total_offers: 0,
      };
      // Fetch total offer count separately (lightweight — limit=1 returns only pagination).
      try {
        const countRes = await fetch(`${API_BASE_URL}/api/v1/offers?limit=1`, { signal: AbortSignal.timeout(5000), cache: "no-store" });
        if (countRes.ok) {
          const countData = await countRes.json();
          mergedMeta.total_offers = countData.pagination?.total ?? 0;
        }
      } catch { /* non-critical — badge stays hidden */ }

      setMeta(mergedMeta);
      log.info("Meta data loaded from API");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      log.warn("Failed to load API metadata", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Load meta on mount
  useEffect(() => {
    fetchMeta();
  }, []);

  // Helper functions
  const getBankDisplayName = (bankId: string): string => {
    const bank = meta.banks.find((b) => b.id === bankId);
    return bank?.name || bankId;
  };

  const getPlatformDisplayName = (platformId: string): string => {
    const platform = meta.platforms.find((p) => p.id === platformId);
    return platform?.name || platformId;
  };

  const getAirportByCode = (code: string): AirportMeta | undefined => {
    return meta.airports.find((a) => a.code === code);
  };

  return (
    <MetaContext.Provider
      value={{
        meta,
        loading,
        error,
        refetch: fetchMeta,
        getBankDisplayName,
        getPlatformDisplayName,
        getAirportByCode,
      }}
    >
      {children}
    </MetaContext.Provider>
  );
};

export default MetaProvider;
