import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_RETRY_ATTEMPTS,
  API_RETRY_DELAY_MS,
  API_TIMEOUT_MS,
} from "@/constants";
import type { components } from "@/types/generated-api";

export type MetaData = components["schemas"]["OfferMetadata"];
export type FeatureFlags = components["schemas"]["FeatureFlagsResponse"];
export type ApiOffer = components["schemas"]["Offer"];
export type ApiSearchOffer = components["schemas"]["SearchOffer"];
export type SearchResponse = components["schemas"]["SearchResponse"];
export type OffersResponse = components["schemas"]["OffersResponse"];

export interface ApiResponseMetadata {
  requestId: string | null;
  dataVersion: string | null;
  contractVersion: string | null;
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
    public metadata?: ApiResponseMetadata
  ) {
    super(message);
    this.name = "APIError";
  }
}

const metadataFrom = (response: Response): ApiResponseMetadata => ({
  requestId: response.headers.get("X-Request-ID"),
  dataVersion: response.headers.get("X-Data-Version"),
  contractVersion: response.headers.get("X-Contract-Version"),
});

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function apiCall<T>(
  endpoint: string,
  options: { method?: "GET" | "POST"; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  if (!API_BASE_URL) throw new APIError(0, "VITE_API_BASE_URL is not configured");

  const method = options.method ?? "GET";
  const attempts = method === "GET" ? API_RETRY_ATTEMPTS + 1 : 1;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort("timeout"), API_TIMEOUT_MS);
    const abort = () => controller.abort(options.signal?.reason);
    options.signal?.addEventListener("abort", abort, { once: true });
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
      const metadata = metadataFrom(response);
      if (!response.ok) {
        const details = await response.json().catch(() => undefined);
        const message =
          typeof details === "object" && details !== null && "error" in details
            ? String((details as { error?: { message?: string } }).error?.message ?? `HTTP ${response.status}`)
            : `HTTP ${response.status}`;
        throw new APIError(response.status, message, details, metadata);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (options.signal?.aborted) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new APIError(0, "Request timed out");
      }
      lastError = error instanceof Error ? error : new Error("Unknown API error");
      if (error instanceof APIError && (error.status < 500 || error.status === 0)) throw error;
      if (attempt + 1 < attempts) await delay(API_RETRY_DELAY_MS * (attempt + 1));
    } finally {
      window.clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abort);
    }
  }
  throw lastError instanceof APIError
    ? lastError
    : new APIError(0, lastError?.message ?? "Network error");
}

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    await apiCall<{ ok: boolean }>("/health/live", { signal });
    return true;
  } catch {
    return false;
  }
}

export const fetchFeatureFlags = (signal?: AbortSignal) =>
  apiCall<FeatureFlags>(API_ENDPOINTS.FEATURE_FLAGS, { signal });

export const fetchMetadata = (signal?: AbortSignal) =>
  apiCall<MetaData>(API_ENDPOINTS.META, { signal });

export async function searchOffers(
  fromCode: string,
  toCode: string,
  travelDate: string,
  banks: string[] = [],
  platforms: string[] = [],
  _isAuthenticated = false,
  signal?: AbortSignal
): Promise<SearchResponse> {
  return apiCall<SearchResponse>(API_ENDPOINTS.SEARCH, {
    method: "POST",
    signal,
    body: {
      from: fromCode,
      to: toCode,
      date: travelDate,
      banks: [...new Set(banks)],
      platforms: [...new Set(platforms)],
    },
  });
}

export interface OfferFilters {
  platform?: string[];
  bank?: string[];
  payment_method?: string[];
  booking_channel?: string[];
  category?: string[];
  active_on?: string;
  page?: number;
  limit?: number;
}

export const buildOffersQuery = (filters: OfferFilters): string => {
  const query = new URLSearchParams();
  for (const key of ["platform", "bank", "payment_method", "booking_channel", "category"] as const) {
    for (const value of [...new Set(filters[key] ?? [])].sort()) query.append(key, value);
  }
  if (filters.active_on) query.set("active_on", filters.active_on);
  if (filters.page !== undefined) query.set("page", String(filters.page));
  if (filters.limit !== undefined) query.set("limit", String(filters.limit));
  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
};

export async function fetchAllOffers(
  _isAuthenticated = false,
  filters: OfferFilters = {},
  signal?: AbortSignal
): Promise<ApiOffer[]> {
  const response = await apiCall<OffersResponse>(
    `${API_ENDPOINTS.OFFERS}${buildOffersQuery(filters)}`,
    { signal }
  );
  return response.offers;
}
