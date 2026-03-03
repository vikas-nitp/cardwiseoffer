/**
 * Real Backend API Service
 * Connects to FastAPI backend at configured URL
 */

import { API_BASE_URL, API_ENDPOINTS, API_RETRY_ATTEMPTS, API_RETRY_DELAY_MS } from "@/constants";

// ── UI type for OfferCard component ───────────────────────
export interface OfferTile {
  id: string;
  label: string;
  extraLabel?: string;
  labelIcon: string;
  accentClass: string;
  accentBorder: string;
  platform: string;
  platformUrl: string;
  bank: string | null;
  card: string | null;
  discount: number;
  paymentType: string;
  conditions: string[];
}

// ── Meta response (matches /api/v1/meta) ──────────────────
export interface MetaData {
  banks: Array<{ id: string; name: string }>;
  platforms: Array<{ id: string; name: string }>;
  categories: string[];
  airports: Array<{ code: string; name: string }>;
}

// ── Feature flags (matches /api/v1/feature-flags) ─────────
export interface FeatureFlags {
  authEnabled: boolean;
  offerLockingEnabled: boolean;
  allOffers: boolean;
  savedCards: boolean;
  dailyVisitorsEnabled?: boolean;
}

// ── Backend OfferCard (matches offer_engine.py) ───────────
export interface BackendOfferCard {
  offer_id: string;
  label: string;
  bank: string;
  card_name: string;
  platform: string;
  payment_method: string;
  category: string;
  coupon_code: string;
  discount_type: string;
  discount_value: number;
  max_discount: number;
  min_txn: number;
  final_price: number;
  savings: number;
  locked: boolean;
  reasons: string[];
  cta_url: string;
}

// ── Backend SearchResponse (matches main.py SearchResponse) ──
export interface SearchSummary {
  from_airport: string;
  to_airport: string;
  date: string;
  base_fare: number;
}

export interface PriceStripItem {
  date: string;
  price: number;
}

export interface SearchResponse {
  summary: SearchSummary;
  strip7days: PriceStripItem[];
  offers: BackendOfferCard[];
}

// ── All offers response (matches /api/v1/offers → Offer model) ──
export interface OfferResponse {
  offer_id: string;
  bank: string;
  card_name?: string;
  platform: string;
  category: string;
  payment_method: string;
  discount_type: string;
  discount_value: number;
  max_discount: number;
  min_txn: number;
  coupon_code: string;
  valid_from: string;
  valid_to: string;
  channels: string;
  eligibility_notes: string;
  terms_url: string;
  priority_score: number;
  login_required: boolean;
}

// ── Error class ───────────────────────────────────────────
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

// ── Core fetch helper with retry ──────────────────────────
async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
  isAuthenticated: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-auth": isAuthenticated ? "true" : "false",
  };

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= API_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(response.status, `API Error: ${response.statusText}`, errorData);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < API_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, API_RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  
  // All retries failed
  if (lastError instanceof APIError) throw lastError;
  throw new APIError(0, `Network error after ${API_RETRY_ATTEMPTS + 1} attempts: ${lastError?.message || "Unknown"}`);
}

// ── Health check ──────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`);
    return res.ok;
  } catch {
    return false;
  }
}

// ── Feature flags ─────────────────────────────────────────
export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  return apiCall<FeatureFlags>(API_ENDPOINTS.FEATURE_FLAGS);
}

// ── Metadata ──────────────────────────────────────────────
export async function fetchMetadata(): Promise<MetaData> {
  return apiCall<MetaData>(API_ENDPOINTS.META);
}

// ── Search offers ─────────────────────────────────────────
// Backend expects: { from, to, date, banks?, platforms? }
export async function searchOffers(
  fromCode: string,
  toCode: string,
  travelDate: string,
  banks: string[] = [],
  platforms: string[] = [],
  isAuthenticated: boolean = false
): Promise<SearchResponse> {
  return apiCall<SearchResponse>(
    API_ENDPOINTS.SEARCH,
    "POST",
    { 
      from: fromCode, 
      to: toCode, 
      date: travelDate,
      banks: banks.length > 0 ? banks : undefined,
      platforms: platforms.length > 0 ? platforms : undefined,
    },
    isAuthenticated
  );
}

// ── All offers catalog ────────────────────────────────────
// Backend returns { offers: [...] }, so we unwrap
export async function fetchAllOffers(
  isAuthenticated: boolean = false
): Promise<OfferResponse[]> {
  const res = await apiCall<{ offers: OfferResponse[] }>(API_ENDPOINTS.OFFERS, "GET", undefined, isAuthenticated);
  return res.offers;
}

// ── Transform search response → OfferTile[] ───────────────
export function transformSearchResponse(response: SearchResponse): OfferTile[] {
  return response.offers.map((offer, idx) => {
    let labelIcon = "Gift";
    let accentClass = "bg-secondary text-secondary-foreground";
    let accentBorder = "border-secondary";

    if (offer.label === "Best Offer" || idx === 0) {
      labelIcon = "Star";
      accentClass = "bg-primary text-primary-foreground";
      accentBorder = "border-primary";
    } else if (offer.savings > 200) {
      labelIcon = "TrendingUp";
      accentClass = "bg-highlight text-highlight-foreground";
      accentBorder = "border-highlight";
    }

    return {
      id: offer.offer_id || `offer-${idx}`,
      label: offer.label || "Offer",
      labelIcon,
      accentClass,
      accentBorder,
      platform: offer.platform,
      platformUrl: offer.cta_url || "#",
      bank: offer.bank === "Any" ? null : offer.bank,
      card: offer.card_name || null,
      discount: offer.final_price,
      paymentType: "Credit Card",
      conditions: offer.reasons?.length ? offer.reasons : ["Valid offer"],
      extraLabel: offer.locked ? "🔒 Login to unlock" : undefined,
    };
  });
}

// ── Transform all offers → OfferTile[] ────────────────────
export function transformAllOffers(offers: OfferResponse[]): OfferTile[] {
  return offers.map((offer, idx) => {
    const discount =
      offer.discount_type === "FLAT"
        ? offer.discount_value
        : Math.min(Math.round((offer.min_txn * offer.discount_value) / 100), offer.max_discount);

    return {
      id: `all-${offer.offer_id}`,
      label: idx === 0 ? "Best Offer" : offer.bank,
      labelIcon: idx === 0 ? "Star" : "CreditCard",
      accentClass: idx === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
      accentBorder: idx === 0 ? "border-primary" : "border-secondary",
      platform: offer.platform,
      platformUrl: "#",
      bank: offer.bank,
      card: offer.card_name || `${offer.bank} Card`,
      discount,
      paymentType: offer.payment_method === "CREDIT" ? "Credit Card" : offer.payment_method === "DEBIT" ? "Debit Card" : "No Card",
      conditions: [
        `Min transaction: ₹${offer.min_txn}`,
        `Max discount: ₹${offer.max_discount}`,
        `Valid till: ${offer.valid_to}`,
      ],
    };
  });
}
