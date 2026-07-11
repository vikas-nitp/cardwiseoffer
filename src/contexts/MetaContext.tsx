/**
 * Meta Context
 * 
 * Global context for metadata loaded from backend /api/v1/meta.
 * Provides banks, platforms, airports, payment methods, categories.
 * This ensures frontend stays in sync with Excel data.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { log } from "@/lib/logger";
import banksJson from "@/data/mock/banks.json";
import platformsJson from "@/data/mock/platforms.json";
import airportsJson from "@/data/mock/airports.json";
import offersJson from "@/data/mock/offers.json";
import { getDataMode } from "@/config/dataMode";

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
  categories: string[];
  supported_banks: string[];      // Bank IDs currently supported
  supported_platforms: string[];  // Platform IDs currently supported
}

// ── Safe defaults built from canonical local fixtures ─────────────
const OFFER_BANK_IDS = Array.from(
  new Set((offersJson as Array<{ bank_id: string | null }>).map((o) => o.bank_id).filter(Boolean) as string[])
);
const OFFER_PLATFORM_IDS = Array.from(
  new Set((offersJson as Array<{ platform: string }>).map((o) => o.platform))
);

const DEFAULT_META: MetaData = {
  banks: banksJson as BankMeta[],
  platforms: platformsJson as PlatformMeta[],
  airports: airportsJson as AirportMeta[],
  payment_methods: ["CREDIT", "DEBIT", "NO_CARD"],
  categories: ["flight_domestic", "flight_international", "hotel_domestic", "hotel_international"],
  supported_banks: OFFER_BANK_IDS,          // only banks that have at least one offer
  supported_platforms: OFFER_PLATFORM_IDS,
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
  const [meta, setMeta] = useState<MetaData>(DEFAULT_META);
  const [loading, setLoading] = useState(getDataMode() === "api");
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = async () => {
    // Mock mode: local fixtures are the source of truth. Never touch the network.
    if (getDataMode() === "mock") {
      setMeta(DEFAULT_META);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const apiUrl = (import.meta.env.VITE_API_BASE_URL as string) || "";
      if (!apiUrl) throw new Error("VITE_API_BASE_URL not configured");

      const response = await fetch(`${apiUrl}/api/v1/meta`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const mergedMeta: MetaData = {
        banks: data.banks || DEFAULT_META.banks,
        platforms: data.platforms || DEFAULT_META.platforms,
        airports: data.airports || DEFAULT_META.airports,
        payment_methods: data.payment_methods || DEFAULT_META.payment_methods,
        categories: data.categories || DEFAULT_META.categories,
        supported_banks: data.supported_banks || DEFAULT_META.supported_banks,
        supported_platforms: data.supported_platforms || DEFAULT_META.supported_platforms,
      };
      setMeta(mergedMeta);
      log.info("Meta data loaded from API");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      log.warn("Failed to load meta, using defaults", { error: message });
      setError(message);
      setMeta(DEFAULT_META);
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
