import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import generatedFlags from "@/data/generated/featureFlags.json";
import type { components } from "@/types/generated-api";
import { getDataMode } from "@/config/dataMode";
import { repoFetchFeatureFlags } from "@/services/dataRepo";

type FeatureFlagsResponse = components["schemas"]["FeatureFlagsResponse"];
export type ProductFeatureFlags = Omit<FeatureFlagsResponse, "config_version">;
export type FeatureFlags = ProductFeatureFlags;

const LOCAL_FLAGS: ProductFeatureFlags = generatedFlags;

interface FeatureFlagContextValue {
  flags: ProductFeatureFlags;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export const useFeatureFlags = () => {
  const value = useContext(FeatureFlagContext);
  if (!value) throw new Error("useFeatureFlags must be used within FeatureFlagProvider");
  return value;
};

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const local = getDataMode() === "local";
  const [flags, setFlags] = useState<ProductFeatureFlags>(LOCAL_FLAGS);
  const [loading, setLoading] = useState(!local);
  const [error, setError] = useState<string | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const refetch = useCallback(async () => {
    if (local) return;
    setLoading(true);
    setError(null);
    setErrorDismissed(false);
    try {
      const response = await repoFetchFeatureFlags();
      const { config_version: _version, ...productFlags } = response;
      setFlags(productFlags);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Feature configuration unavailable");
      // Keep existing flags (LOCAL_FLAGS on first load, last-known-good thereafter)
    } finally {
      setLoading(false);
    }
  }, [local]);

  useEffect(() => { void refetch(); }, [refetch]);

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, error, refetch }}>
      {error && !errorDismissed && (
        <div role="alert" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-[13px]">
          <span className="text-destructive font-medium">Live configuration unavailable — using defaults.</span>
          <button
            onClick={() => setErrorDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        </div>
      )}
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
