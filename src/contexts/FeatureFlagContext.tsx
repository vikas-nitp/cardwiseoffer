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
  const [flags, setFlags] = useState<ProductFeatureFlags | null>(local ? LOCAL_FLAGS : null);
  const [loading, setLoading] = useState(!local);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (local) return;
    setLoading(true);
    setError(null);
    try {
      const response = await repoFetchFeatureFlags();
      const { config_version: _version, ...productFlags } = response;
      setFlags(productFlags);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Feature configuration unavailable");
    } finally {
      setLoading(false);
    }
  }, [local]);

  useEffect(() => { void refetch(); }, [refetch]);

  if (!flags) {
    return (
      <main className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Feature configuration unavailable</h1>
          <p className="mt-2 text-muted-foreground">{loading ? "Loading configuration…" : error}</p>
          {!loading && <button className="mt-4 underline" onClick={() => void refetch()}>Retry</button>}
        </div>
      </main>
    );
  }

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, error, refetch }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
