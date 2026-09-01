/**
 * Frontend Constants
 * All hardcoded values, configuration, and mock data centralized here
 */

import airportsData from "@/data/generated/airports.json";

// ────────────────────────────────────────────────────────────────────
// API & Environment
// ────────────────────────────────────────────────────────────────────

const configuredApiBaseUrl = ((import.meta.env.VITE_API_BASE_URL as string) || "")
  .trim()
  .replace(/\/+$/, "");

// Endpoint constants below own the `/api/v1` prefix. Accept either the API
// origin or the documented `/api/v1` URL without producing `/api/v1/api/v1`.
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/api\/v1$/i, "");

export const API_ENDPOINTS = {
  HEALTH: "/health",
  META: "/api/v1/meta",
  OFFERS: "/api/v1/offers",
  FEATURE_FLAGS: "/api/v1/feature-flags",
  SEARCH: "/api/v1/search",
} as const;

// ────────────────────────────────────────────────────────────────────
// UI Constants
// ────────────────────────────────────────────────────────────────────

export const MAX_BANK_FILTERS = 2; // Max banks user can select (enforced by UI warning)
export const API_TIMEOUT_MS = 30000; // 30 seconds

// Booking window: latest confirmed product rule = today .. today + 10 days.
export const MAX_BOOKING_AMOUNT = 1_000_000;
export const DATE_STRIP_VISIBLE_DAYS = 7;
export const DATE_STRIP_NAVIGATION_STEP_DAYS = 1;

// Price Strip Configuration
export const STRIP_DAYS_COUNT = 7; // Number of days in price strip (always 7)
export const DATE_FORMAT = "yyyy-MM-dd"; // ISO date format for API

// Retry Configuration
export const API_RETRY_ATTEMPTS = 2;
export const API_RETRY_DELAY_MS = 1000;

// ────────────────────────────────────────────────────────────────────
// Brand
// ────────────────────────────────────────────────────────────────────

export const APP_NAME = "CardWiseOffer";
export const APP_TAGLINE = "independent card comparison for Indian flights";
export const DISCLAIMER_TEXT =
  "We are not affiliated with any platform or bank. Offers may change without notice. " +
  "Please verify details on the official website before booking.";

// ────────────────────────────────────────────────────────────────────
// Contact
// ────────────────────────────────────────────────────────────────────

export const SUPPORT_EMAIL = "support@cardwiseoffer.com";

// ────────────────────────────────────────────────────────────────────
// Date Strip
// ────────────────────────────────────────────────────────────────────

// Sentinel displayText used when a date has no eligible offers.
// Must match the value produced by LocalOfferRepository.
export const DATE_STRIP_NO_OFFERS_LABEL = "No offers";

// ────────────────────────────────────────────────────────────────────
// Trust Labels
// ────────────────────────────────────────────────────────────────────

export const TRUST_LABELS = {
  NO_BOOKING_BIAS: "No booking bias",
  UPDATED_DAILY: "Updated daily",
  INDEPENDENT_COMPARISON: "Independent comparison",
} as const;

// ────────────────────────────────────────────────────────────────────
// Cities Data (loaded from airports.json mock data)
// ────────────────────────────────────────────────────────────────────

export interface CityOption {
  city: string;
  code: string;
  airport: string;
}

// Map airport JSON → CityOption shape used by the UI
export const CITIES: CityOption[] = airportsData.map((a) => ({
  city: a.city,
  code: a.code,
  airport: a.name,
}));

// ────────────────────────────────────────────────────────────────────
// Bank Data (for filter) - CANONICAL CODES matching backend
// ────────────────────────────────────────────────────────────────────

export const BANKS = [
  "HDFC",
  "ICICI",
  "SBI",
  "AXIS",
  "AMEX",
  "KOTAK",
  "YES",
  "INDUSIND",
  "RBL",
  "HSBC",
] as const;

// Display names for UI rendering
export const BANK_DISPLAY_NAMES: Record<string, string> = {
  HDFC: "HDFC Bank",
  ICICI: "ICICI Bank",
  SBI: "SBI Card",
  AXIS: "Axis Bank",
  AMEX: "American Express",
  KOTAK: "Kotak Mahindra",
  YES: "Yes Bank",
  INDUSIND: "IndusInd Bank",
  RBL: "RBL Bank",
  HSBC: "HSBC",
};

export type BankType = (typeof BANKS)[number];

// ────────────────────────────────────────────────────────────────────
// Payment Methods (maps UI label to API canonical value)
// ────────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS = ["Credit Card", "Debit Card", "No Card"] as const;

// API canonical values for payment methods
export const PAYMENT_METHOD_API_MAP: Record<string, string> = {
  "Credit Card": "CREDIT",
  "Debit Card": "DEBIT",
  "No Card": "NO_CARD",
};

export type PaymentMethodType = (typeof PAYMENT_METHODS)[number];

// ────────────────────────────────────────────────────────────────────
// Error Messages
// ────────────────────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  SEARCH_FAILED: "Failed to fetch offers. Please try again.",
  API_TIMEOUT: "Request timed out. Please check your connection.",
  NETWORK_ERROR: "Network error. Please check your internet.",
  FEATURE_FLAGS_FAILED: "Failed to load feature flags.",
  OFFERS_FAILED: "Failed to load offers.",
  INVALID_SEARCH: "Please fill in all search fields.",
  SAME_CITY_ERROR: "Source and destination cannot be the same.",
} as const;
