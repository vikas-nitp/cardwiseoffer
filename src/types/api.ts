/**
 * API Request/Response type definitions
 * Stable JSON contracts for backend integration
 */

// ── Meta ────────────────────────────────────────────────────

export interface CityOption {
  city: string;
  code: string;
  airport: string;
}

export interface CardInfo {
  bank: string;
  card: string;
  baseDiscount: number;
}

export interface MetaResponse {
  cities: CityOption[];
  banks: Record<string, CardInfo>;
  bankNames: string[];
  platforms: string[];
}

// ── Offers ──────────────────────────────────────────────────

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

export interface OffersRequest {
  bank?: string[];
  platform?: string[];
  paymentType?: string[];
  category?: string;
}

export interface OffersResponse {
  offers: OfferTile[];
  total: number;
}

// ── Search ──────────────────────────────────────────────────

export interface SearchRequest {
  from: string; // city code
  to: string;   // city code
  date: string;  // YYYY-MM-DD
  banks?: string[];
}

export interface DateStripEntry {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  dateLabel: string;
  minPrice: number;
}

export interface SearchResponse {
  offers: OfferTile[];
  dateStrip: DateStripEntry[];
  from: CityOption;
  to: CityOption;
  date: string;
}

// ── Feature Flags ───────────────────────────────────────────

export interface FeatureFlags {
  allOffers: boolean;
  savedCards: boolean;
  [key: string]: boolean;
}

// ── Auth ────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  provider: "email" | "phone" | "google" | "apple";
}

export interface LoginEmailRequest {
  email: string;
  password: string;
}

export interface SignupEmailRequest {
  email: string;
  password: string;
  name: string;
}

export interface OtpSendRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  otp: string;
}

// ── Visitor ─────────────────────────────────────────────────

export interface VisitorCountResponse {
  count: number;
  date: string;
}

// ── Generic API wrapper ─────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
