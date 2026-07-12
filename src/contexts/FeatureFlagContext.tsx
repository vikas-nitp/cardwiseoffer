/**
 * Feature Flag Context
 * 
 * Global context for feature flags loaded from backend.
 * Provides safe defaults if API fails.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { log } from "@/lib/logger";
import { getDataMode } from "@/config/dataMode";
import type { FeatureFlags as ApiFeatureFlags } from "@/services/api";
import { repoFetchFeatureFlags } from "@/services/dataRepo";

// ── Types (match backend feature_flags.json) ───────────────────────
export type FeatureFlags = Omit<ApiFeatureFlags, "config_version">;

// ── Safe defaults (fail-safe if API is down) ───────────────────────
const DEFAULT_FLAGS: FeatureFlags = {
  authEnabled: false,           // Disable auth by default (no gating)
  offerLockingEnabled: false,   // No locking by default
  allOffers: true,              // Show all offers
  savedCards: false,            // Feature not ready
  dailyVisitorsEnabled: false,  // Don't show visitors if API fails
};

const API_FAIL_CLOSED_FLAGS: FeatureFlags = {
  ...DEFAULT_FLAGS,
  allOffers: false,
};

// Remove direct API_BASE_URL usage — dataRepo handles fallback

// ── Context ────────────────────────────────────────────────────────
interface FeatureFlagContextValue {
  flags: FeatureFlags;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export const useFeatureFlags = () => {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) {
    throw new Error("useFeatureFlags must be used within FeatureFlagProvider");
  }
  return ctx;
};

// ── Provider ───────────────────────────────────────────────────────
interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagProvider = ({ children }: FeatureFlagProviderProps) => {
  const [flags, setFlags] = useState<FeatureFlags>(
    getDataMode() === "api" ? API_FAIL_CLOSED_FLAGS : DEFAULT_FLAGS
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await repoFetchFeatureFlags();
      const apiFlags: FeatureFlags = {
        authEnabled: data.authEnabled,
        offerLockingEnabled: data.offerLockingEnabled,
        allOffers: data.allOffers,
        savedCards: data.savedCards,
        dailyVisitorsEnabled: data.dailyVisitorsEnabled,
      };
      const mergedFlags: FeatureFlags = { ...DEFAULT_FLAGS, ...apiFlags };
      setFlags(mergedFlags);
      log.info("Feature flags loaded", mergedFlags);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      log.warn("Failed to load feature flags", { error: message });
      setError(message);
      setFlags(getDataMode() === "api" ? API_FAIL_CLOSED_FLAGS : DEFAULT_FLAGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load flags on mount
  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, error, refetch: fetchFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
