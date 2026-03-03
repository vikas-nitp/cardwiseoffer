/**
 * Feature Flag Context
 * 
 * Global context for feature flags loaded from backend.
 * Provides safe defaults if API fails.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { log } from "@/lib/logger";

// ── Types (match backend feature_flags.json) ───────────────────────
export interface FeatureFlags {
  authEnabled: boolean;
  offerLockingEnabled: boolean;
  allOffers: boolean;
  savedCards: boolean;
  dailyVisitorsEnabled: boolean;
}

// ── Safe defaults (fail-safe if API is down) ───────────────────────
const DEFAULT_FLAGS: FeatureFlags = {
  authEnabled: false,           // Disable auth by default (no gating)
  offerLockingEnabled: false,   // No locking by default
  allOffers: true,              // Show all offers
  savedCards: false,            // Feature not ready
  dailyVisitorsEnabled: false,  // Don't show visitors if API fails
};

// ── API Config ─────────────────────────────────────────────────────
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8001";

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
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/v1/feature-flags`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Merge with defaults to ensure all fields exist
      const mergedFlags: FeatureFlags = {
        ...DEFAULT_FLAGS,
        ...data,
      };

      setFlags(mergedFlags);
      log.info("Feature flags loaded", mergedFlags);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      log.warn("Failed to load feature flags, using defaults", { error: message });
      setError(message);
      // Keep defaults on error
      setFlags(DEFAULT_FLAGS);
    } finally {
      setLoading(false);
    }
  };

  // Load flags on mount
  useEffect(() => {
    fetchFlags();
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, error, refetch: fetchFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
