/**
 * Mock API Service — backend-ready architecture
 * All reference data is loaded from src/data/mock/ JSON files.
 * No hardcoded data in this file.
 */

import { format } from "date-fns";
import type { CityOption } from "@/components/CityAutocomplete";
import { CITIES } from "@/constants";
import offersData from "@/data/mock/offers.json";
import bankOffersMvpData from "@/data/mock/bankOffersMvp.json";

// ── Types for raw offer JSON ──────────────────────────────
export interface RawOffer {
  offer_id: string;
  bank: string;
  card_name: string;
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

export interface RawBankOffer {
  offer_id: string;
  bank: string;
  platform: string;
  category: string;
  payment_method: string;
  discount_type: string;
  discount_value: number;
  max_discount: number;
  min_txn: number;
  max_txn: number | null;
  coupon_code: string;
  emi_type: string | null;
  emi_tenure_months: number | null;
  valid_from: string;
  valid_to: string;
  valid_days: string;
  frequency_limit: string;
  channels: string;
  offer_status: string;
}

// ── Loaded mock data ──────────────────────────────────────
const OFFERS: RawOffer[] = offersData as RawOffer[];
const BANK_OFFERS_MVP: RawBankOffer[] = bankOffersMvpData as RawBankOffer[];

// ── Legacy constants (derived from JSON for backward compat) ──
export interface CardOffer {
  bank: string;
  card: string;
  baseDiscount: number;
}

// Build BANK_OFFERS lookup from offers.json (pick highest discount per bank)
function buildBankOffers(): Record<string, CardOffer> {
  const map: Record<string, CardOffer> = {};
  for (const o of OFFERS) {
    if (o.bank === "Any") continue;
    const existing = map[o.bank];
    if (!existing || o.discount_value > existing.baseDiscount) {
      map[o.bank] = { bank: o.bank, card: o.card_name, baseDiscount: o.discount_value };
    }
  }
  return map;
}

export const BANK_OFFERS: Record<string, CardOffer> = buildBankOffers();
export const ALL_BANKS = Object.keys(BANK_OFFERS);
export const ALL_PLATFORMS = [...new Set(OFFERS.map((o) => o.platform))];

// Re-export CITIES for backward compat
export { CITIES };

// ── Deterministic seed ─────────────────────────────────────
export const hashCode = (s: string): number => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// ── Price with controlled variation ────────────────────────
const priceVariation = (seed: number, base: number, idx: number): number => {
  const v = ((seed + idx * 137) % 7) - 3;
  return Math.max(400, base + v * 100);
};

// ── Platform URLs ──────────────────────────────────────────
export const buildPlatformUrl = (platform: string, fromCode: string, toCode: string, date: string): string => {
  const urls: Record<string, string> = {
    MakeMyTrip: `https://www.makemytrip.com/flight/search?itinerary=${fromCode}-${toCode}-${date}&tripType=O&paxType=A-1_C-0_I-0&cabinClass=E`,
    Cleartrip: `https://www.cleartrip.com/flights/${fromCode}-${toCode}-${date}`,
    EaseMyTrip: `https://www.easemytrip.com/flight-booking/${fromCode}-${toCode}-${date}`,
    Goibibo: `https://www.goibibo.com/flights/${fromCode}-${toCode}-${date}`,
  };
  return urls[platform] ?? "#";
};

// ── Offer tile interface ───────────────────────────────────
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

const makeConditions = (seed: number, idx: number): string[] => [
  `Min booking: ₹${3000 + (seed % 3) * 1000}`,
  idx % 2 === 0 ? "Credit Card only" : "Credit & Debit Card",
  idx % 2 === 0 ? "Web & Mobile App" : "Mobile App only",
  "Domestic flights only",
  "Valid till 30 Apr 2026",
];

// ── Core API functions ─────────────────────────────────────

export const getBankDiscount = (seed: number, bankName: string): number => {
  const offer = BANK_OFFERS[bankName];
  if (!offer) return 0;
  const idx = ALL_BANKS.indexOf(bankName);
  return priceVariation(seed, offer.baseDiscount, idx);
};

export const findBestOffer = (seed: number): { bestBank: string; bestDiscount: number } => {
  let bestDiscount = 0;
  let bestBank = "";
  ALL_BANKS.forEach((b) => {
    const d = getBankDiscount(seed, b);
    if (d > bestDiscount) { bestDiscount = d; bestBank = b; }
  });
  return { bestBank, bestDiscount };
};

const findBestOtherOffer = (seed: number, excludeBanks: string[]) => {
  let bestDiscount = 0;
  let bestBank = "";
  ALL_BANKS.forEach((b) => {
    if (excludeBanks.includes(b)) return;
    const d = getBankDiscount(seed, b);
    if (d > bestDiscount) { bestDiscount = d; bestBank = b; }
  });
  return { bestBank, bestDiscount };
};

export function fetchSearchResults(
  from: CityOption, to: CityOption, date: Date, banks: string[]
): OfferTile[] {
  const dateStr = format(date, "yyyy-MM-dd");
  const seed = hashCode(`${from.code}-${to.code}-${dateStr}`);
  const tiles: OfferTile[] = [];
  const defaultDiscount = priceVariation(seed, 500, 99);
  const defaultPlatformIdx = (seed + 3) % ALL_PLATFORMS.length;

  if (banks.length === 0) {
    const { bestBank, bestDiscount } = findBestOffer(seed);
    const pIdx = seed % ALL_PLATFORMS.length;
    tiles.push({
      id: "best", label: "Best Offer", labelIcon: "Star",
      accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary",
      platform: ALL_PLATFORMS[pIdx],
      platformUrl: buildPlatformUrl(ALL_PLATFORMS[pIdx], from.code, to.code, dateStr),
      bank: bestBank, card: BANK_OFFERS[bestBank]?.card ?? bestBank, discount: bestDiscount,
      paymentType: "Credit Card", conditions: makeConditions(seed, 0),
    });
    tiles.push({
      id: "default", label: "Default Offer", labelIcon: "Gift",
      accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
      platform: ALL_PLATFORMS[defaultPlatformIdx],
      platformUrl: buildPlatformUrl(ALL_PLATFORMS[defaultPlatformIdx], from.code, to.code, dateStr),
      bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
      conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
    });
    return tiles;
  }

  const selectedDiscounts = banks.map((b) => ({
    bank: b, card: BANK_OFFERS[b]?.card ?? b, discount: getBankDiscount(seed, b),
  }));
  const { bestBank: bestOtherBank, bestDiscount: bestOtherDiscount } = findBestOtherOffer(seed, banks);

  if (banks.length === 1) {
    const sel = selectedDiscounts[0];
    tiles.push({
      id: "selected-0", label: "Your Card Offer", labelIcon: "CreditCard",
      accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary",
      platform: ALL_PLATFORMS[seed % ALL_PLATFORMS.length],
      platformUrl: buildPlatformUrl(ALL_PLATFORMS[seed % ALL_PLATFORMS.length], from.code, to.code, dateStr),
      bank: sel.bank, card: sel.card, discount: sel.discount,
      paymentType: "Credit Card", conditions: makeConditions(seed, 0),
    });
    if (bestOtherDiscount > sel.discount) {
      tiles.push({
        id: "best-other", label: "Better Alternative", extraLabel: `₹${bestOtherDiscount - sel.discount} more`,
        labelIcon: "TrendingUp",
        accentClass: "bg-highlight text-highlight-foreground", accentBorder: "border-highlight",
        platform: ALL_PLATFORMS[(seed + 1) % ALL_PLATFORMS.length],
        platformUrl: buildPlatformUrl(ALL_PLATFORMS[(seed + 1) % ALL_PLATFORMS.length], from.code, to.code, dateStr),
        bank: bestOtherBank, card: BANK_OFFERS[bestOtherBank]?.card ?? bestOtherBank, discount: bestOtherDiscount,
        paymentType: "Credit Card", conditions: makeConditions(seed, 1),
      });
    }
  } else {
    const sorted = [...selectedDiscounts].sort((a, b) => b.discount - a.discount);
    sorted.forEach((sel, i) => {
      tiles.push({
        id: `selected-${i}`, label: i === 0 ? "Best Selected Card" : sel.bank, labelIcon: i === 0 ? "Star" : "CreditCard",
        accentClass: i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        accentBorder: i === 0 ? "border-primary" : "border-secondary",
        platform: ALL_PLATFORMS[(seed + i) % ALL_PLATFORMS.length],
        platformUrl: buildPlatformUrl(ALL_PLATFORMS[(seed + i) % ALL_PLATFORMS.length], from.code, to.code, dateStr),
        bank: sel.bank, card: sel.card, discount: sel.discount,
        paymentType: "Credit Card", conditions: makeConditions(seed, i),
      });
    });
    if (bestOtherDiscount > sorted[0].discount) {
      tiles.push({
        id: "best-other", label: "Better Alternative", extraLabel: `₹${bestOtherDiscount - sorted[0].discount} more`,
        labelIcon: "TrendingUp",
        accentClass: "bg-highlight text-highlight-foreground", accentBorder: "border-highlight",
        platform: ALL_PLATFORMS[(seed + 2) % ALL_PLATFORMS.length],
        platformUrl: buildPlatformUrl(ALL_PLATFORMS[(seed + 2) % ALL_PLATFORMS.length], from.code, to.code, dateStr),
        bank: bestOtherBank, card: BANK_OFFERS[bestOtherBank]?.card ?? bestOtherBank, discount: bestOtherDiscount,
        paymentType: "Credit Card", conditions: makeConditions(seed, 2),
      });
    }
  }

  tiles.push({
    id: "default", label: "Default Offer", labelIcon: "Gift",
    accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
    platform: ALL_PLATFORMS[defaultPlatformIdx],
    platformUrl: buildPlatformUrl(ALL_PLATFORMS[defaultPlatformIdx], from.code, to.code, dateStr),
    bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });

  return tiles;
}

export function fetchAllOffers(from?: CityOption, to?: CityOption, date?: Date): OfferTile[] {
  const seedStr = from && to && date
    ? `${from.code}-${to.code}-${format(date, "yyyy-MM-dd")}`
    : "global-catalog-offers";
  const seed = hashCode(seedStr);
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const result: OfferTile[] = [];

  ALL_BANKS.forEach((bankName, idx) => {
    const discount = getBankDiscount(seed, bankName);
    const pIdx = (idx + seed) % ALL_PLATFORMS.length;
    result.push({
      id: `all-${bankName}`,
      label: bankName,
      labelIcon: "TrendingUp",
      accentClass: "bg-secondary text-secondary-foreground",
      accentBorder: "border-secondary",
      platform: ALL_PLATFORMS[pIdx],
      platformUrl: from && to ? buildPlatformUrl(ALL_PLATFORMS[pIdx], from.code, to.code, dateStr) : "#",
      bank: bankName, card: BANK_OFFERS[bankName]?.card ?? bankName, discount,
      paymentType: idx % 3 === 2 ? "Debit Card" : "Credit Card",
      conditions: makeConditions(seed, idx),
    });
  });

  result.push({
    id: "all-default", label: "Default Offer", labelIcon: "Gift",
    accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
    platform: "EaseMyTrip", platformUrl: from && to ? buildPlatformUrl("EaseMyTrip", from.code, to.code, dateStr) : "#",
    bank: null, card: null, discount: priceVariation(seed, 500, 99), paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });

  result.sort((a, b) => b.discount - a.discount);
  if (result.length > 0) {
    result[0].label = "Best Offer";
    result[0].labelIcon = "Star";
    result[0].accentClass = "bg-primary text-primary-foreground";
    result[0].accentBorder = "border-primary";
  }

  return result;
}

// ── Visitor count (mock) ───────────────────────────────────
export function getDailyVisitorCount(): number {
  const today = format(new Date(), "yyyy-MM-dd");
  const seed = hashCode(today);
  return 1200 + (seed % 800);
}

// ── Mock API functions for testing without backend ────────────────
export async function mockSearchOffers(
  from: string,
  to: string,
  date: string,
  isAuthenticated: boolean
) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const fromCity: CityOption = CITIES.find(c => c.code === from) || CITIES[0];
  const toCity: CityOption = CITIES.find(c => c.code === to) || CITIES[1];
  const dateObj = new Date(date);
  
  const offers = fetchSearchResults(fromCity, toCity, dateObj, []);
  
  return {
    summary: {
      from_airport: from,
      to_airport: to,
      date,
      base_fare: 1600,
    },
    strip7days: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(new Date(date).getTime() + i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      price: 1600 + i * 10,
    })),
    offers: isAuthenticated ? offers : offers.slice(0, 2),
  };
}

export async function mockFetchAllOffers(isAuthenticated: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const offers = fetchSearchResults(CITIES[0], CITIES[1], new Date(), []);
  return isAuthenticated ? offers : offers.slice(0, 2);
}

export async function mockFetchFeatureFlags() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    allOffers: true,
    savedCards: false,
    authRequiredForAllOffers: true,
  };
}

// ── Export raw data for external use ───────────────────────
export { OFFERS, BANK_OFFERS_MVP };
