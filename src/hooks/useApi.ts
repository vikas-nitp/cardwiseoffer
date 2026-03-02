/**
 * Custom hooks for API data fetching with loading/error/retry states
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/services/apiClient";
import type {
  MetaResponse,
  OffersRequest,
  OffersResponse,
  SearchRequest,
  SearchResponse,
  VisitorCountResponse,
} from "@/types/api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

function useApiCall<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err: any) {
      if (mountedRef.current) setError(err.message || "Something went wrong");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => { mountedRef.current = false; };
  }, [execute]);

  return { data, loading, error, retry: execute };
}

export function useMeta(): UseApiState<MetaResponse> {
  return useApiCall(() => api.getMeta(), []);
}

export function useOffers(filters?: OffersRequest): UseApiState<OffersResponse> {
  return useApiCall(
    () => api.getOffers(filters),
    [JSON.stringify(filters)]
  );
}

export function useSearch(req: SearchRequest | null): UseApiState<SearchResponse> {
  return useApiCall(
    async () => {
      if (!req) return null as any;
      return api.search(req);
    },
    [JSON.stringify(req)]
  );
}

export function useVisitorCount(): UseApiState<VisitorCountResponse> {
  return useApiCall(() => api.getVisitorCount(), []);
}
