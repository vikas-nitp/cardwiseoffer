/**
 * Frontend Constants
 * All hardcoded values, configuration, and mock data centralized here
 */

// ────────────────────────────────────────────────────────────────────
// API & Environment
// ────────────────────────────────────────────────────────────────────

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8001";

export const API_ENDPOINTS = {
  HEALTH: "/health",
  META: "/api/v1/meta",
  OFFERS: "/api/v1/offers",
  FEATURE_FLAGS: "/api/v1/feature-flags",
  SEARCH: "/api/v1/search",
  AUTH_INFO: "/api/v1/auth-info",
} as const;

// ────────────────────────────────────────────────────────────────────
// UI Constants
// ────────────────────────────────────────────────────────────────────

export const MAX_FREE_OFFERS = 2; // Max offers shown to guest users
export const MAX_BANK_FILTERS = 2; // Max banks user can select (enforced by UI warning)
export const API_TIMEOUT_MS = 30000; // 30 seconds

// Price Strip Configuration
export const STRIP_DAYS_COUNT = 7; // Number of days in price strip (always 7)
export const DATE_FORMAT = "yyyy-MM-dd"; // ISO date format for API

// Retry Configuration
export const API_RETRY_ATTEMPTS = 2;
export const API_RETRY_DELAY_MS = 1000;

// ────────────────────────────────────────────────────────────────────
// Cities Data (for autocomplete)
// ────────────────────────────────────────────────────────────────────

export interface CityOption {
  city: string;
  code: string;
  airport: string;
}

export const CITIES: CityOption[] = [
  { city: "Bangalore", code: "BLR", airport: "Kempegowda International Airport" },
  { city: "Delhi", code: "DEL", airport: "Indira Gandhi International Airport" },
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Maharaj International Airport" },
  { city: "Chennai", code: "MAA", airport: "Chennai International Airport" },
  { city: "Hyderabad", code: "HYD", airport: "Rajiv Gandhi International Airport" },
  { city: "Kolkata", code: "CCU", airport: "Netaji Subhas Chandra Bose International Airport" },
  { city: "Pune", code: "PNQ", airport: "Pune Airport" },
  { city: "Goa", code: "GOI", airport: "Manohar International Airport" },
  { city: "Jaipur", code: "JAI", airport: "Jaipur International Airport" },
  { city: "Ahmedabad", code: "AMD", airport: "Sardar Vallabhbhai Patel International Airport" },
];

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
// Platform Data (for filter)
// ────────────────────────────────────────────────────────────────────

export const PLATFORMS = ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Goibibo"] as const;

export type PlatformType = (typeof PLATFORMS)[number];

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
// Utility: Mock Visitor Count
// ────────────────────────────────────────────────────────────────────

export const getDailyVisitorCount = (): number => {
  const today = new Date().toISOString().split("T")[0];
  const hash = today.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return 1200 + (hash % 800); // 1200–2000 visitors
};

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

// ────────────────────────────────────────────────────────────────────
// Default Feature Flags (fallback - matches backend feature_flags.json)
// ────────────────────────────────────────────────────────────────────

export const DEFAULT_FEATURE_FLAGS = {
  authEnabled: true,           // Whether auth/login is enabled
  offerLockingEnabled: true,   // Whether to lock offers for guests
  allOffers: true,
  savedCards: false,
} as const;
