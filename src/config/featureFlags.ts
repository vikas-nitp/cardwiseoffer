/**
 * Feature Flags — centralized config
 * Reads from env vars, falls back to safe defaults (false).
 * Can be overridden by GET /api/v1/feature-flags when backend is connected.
 */

import type { FeatureFlags } from "@/types/api";

const envFlag = (key: string): boolean | undefined => {
  const val = import.meta.env[key];
  if (val === "true" || val === "1") return true;
  if (val === "false" || val === "0") return false;
  return undefined;
};

// Default flags — safe false
const DEFAULT_FLAGS: FeatureFlags = {
  allOffers: true,    // enabled by default for now
  savedCards: false,   // stubbed, disabled
};

let _flags: FeatureFlags = {
  allOffers: envFlag("VITE_FF_ALL_OFFERS") ?? DEFAULT_FLAGS.allOffers,
  savedCards: envFlag("VITE_FF_SAVED_CARDS") ?? DEFAULT_FLAGS.savedCards,
};

let _loaded = false;

export const getFeatureFlags = (): FeatureFlags => ({ ..._flags });

export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return _flags[flag] ?? false;
};

export const loadFeatureFlags = async (): Promise<FeatureFlags> => {
  if (_loaded) return getFeatureFlags();
  
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/api/v1/feature-flags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const remote = await res.json() as Partial<FeatureFlags>;
        _flags = { ..._flags, ...remote };
      }
    } catch {
      // Fail silently — keep defaults
      console.warn("[FeatureFlags] Failed to fetch remote flags, using defaults.");
    }
  }
  
  _loaded = true;
  return getFeatureFlags();
};
