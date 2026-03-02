/**
 * API Client — configurable, backend-ready
 * Uses VITE_API_BASE_URL env var when available, falls back to mock data.
 */

import type {
  MetaResponse,
  OffersRequest,
  OffersResponse,
  SearchRequest,
  SearchResponse,
  VisitorCountResponse,
  CityOption,
  OfferTile,
  DateStripEntry,
} from "@/types/api";
import { format, addDays } from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const USE_MOCK = !API_BASE;

// ── Retry logic ─────────────────────────────────────────────

async function fetchWithRetry<T>(url: string, options?: RequestInit, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json() as T;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error("Unreachable");
}

// ── Deterministic hash ──────────────────────────────────────

const hashCode = (s: string): number => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const priceVariation = (seed: number, base: number, idx: number): number => {
  const v = ((seed + idx * 137) % 7) - 3;
  return Math.max(400, base + v * 100);
};

// ── Mock Data ───────────────────────────────────────────────

const CITIES: CityOption[] = [
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
  { city: "Lucknow", code: "LKO", airport: "Chaudhary Charan Singh International Airport" },
  { city: "Kochi", code: "COK", airport: "Cochin International Airport" },
  { city: "Thiruvananthapuram", code: "TRV", airport: "Trivandrum International Airport" },
  { city: "Chandigarh", code: "IXC", airport: "Chandigarh International Airport" },
  { city: "Varanasi", code: "VNS", airport: "Lal Bahadur Shastri International Airport" },
  { city: "Coimbatore", code: "CJB", airport: "Coimbatore International Airport" },
  { city: "Patna", code: "PAT", airport: "Jay Prakash Narayan Airport" },
  { city: "Indore", code: "IDR", airport: "Devi Ahilyabai Holkar Airport" },
  { city: "Bhubaneswar", code: "BBI", airport: "Biju Patnaik International Airport" },
  { city: "Visakhapatnam", code: "VTZ", airport: "Visakhapatnam Airport" },
];

const BANK_OFFERS: Record<string, { bank: string; card: string; baseDiscount: number }> = {
  "HDFC Bank": { bank: "HDFC Bank", card: "HDFC Infinia", baseDiscount: 1800 },
  "ICICI Bank": { bank: "ICICI Bank", card: "ICICI Sapphiro", baseDiscount: 1600 },
  "SBI Card": { bank: "SBI Card", card: "SBI Elite", baseDiscount: 1400 },
  "Axis Bank": { bank: "Axis Bank", card: "Axis Vistara", baseDiscount: 1200 },
  "Kotak Mahindra": { bank: "Kotak Mahindra", card: "Kotak Privy League", baseDiscount: 1050 },
  "American Express": { bank: "American Express", card: "Amex Platinum Travel", baseDiscount: 2000 },
  "Yes Bank": { bank: "Yes Bank", card: "Yes First Exclusive", baseDiscount: 900 },
  "IndusInd Bank": { bank: "IndusInd Bank", card: "IndusInd Legend", baseDiscount: 800 },
  "RBL Bank": { bank: "RBL Bank", card: "RBL ShopRite", baseDiscount: 650 },
  "HSBC": { bank: "HSBC", card: "HSBC Smart Value", baseDiscount: 750 },
};

const ALL_BANKS = Object.keys(BANK_OFFERS);
const ALL_PLATFORMS = ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Goibibo"];

const buildPlatformUrl = (platform: string, fromCode: string, toCode: string, date: string): string => {
  const urls: Record<string, string> = {
    MakeMyTrip: `https://www.makemytrip.com/flight/search?itinerary=${fromCode}-${toCode}-${date}&tripType=O&paxType=A-1_C-0_I-0&cabinClass=E`,
    Cleartrip: `https://www.cleartrip.com/flights/${fromCode}-${toCode}-${date}`,
    EaseMyTrip: `https://www.easemytrip.com/flight-booking/${fromCode}-${toCode}-${date}`,
    Goibibo: `https://www.goibibo.com/flights/${fromCode}-${toCode}-${date}`,
  };
  return urls[platform] ?? "#";
};

const makeConditions = (seed: number, idx: number): string[] => [
  `Min booking: ₹${3000 + (seed % 3) * 1000}`,
  idx % 2 === 0 ? "Non-EMI transactions only" : "EMI & Non-EMI allowed",
  idx % 2 === 0 ? "Web & Mobile App" : "Mobile App only",
  "Domestic flights only",
  "Valid till 30 Apr 2026",
];

const getBankDiscount = (seed: number, bankName: string): number => {
  const idx = ALL_BANKS.indexOf(bankName);
  return priceVariation(seed, BANK_OFFERS[bankName].baseDiscount, idx);
};

const findBestOfferMock = (seed: number) => {
  let bestDiscount = 0, bestBank = "";
  ALL_BANKS.forEach(b => {
    const d = getBankDiscount(seed, b);
    if (d > bestDiscount) { bestDiscount = d; bestBank = b; }
  });
  return { bestBank, bestDiscount };
};

const findBestOtherOffer = (seed: number, excludeBanks: string[]) => {
  let bestDiscount = 0, bestBank = "";
  ALL_BANKS.forEach(b => {
    if (excludeBanks.includes(b)) return;
    const d = getBankDiscount(seed, b);
    if (d > bestDiscount) { bestDiscount = d; bestBank = b; }
  });
  return { bestBank, bestDiscount };
};

function mockSearchResults(fromCode: string, toCode: string, dateStr: string, banks: string[]): OfferTile[] {
  const seed = hashCode(`${fromCode}-${toCode}-${dateStr}`);
  const tiles: OfferTile[] = [];
  const defaultDiscount = priceVariation(seed, 500, 99);
  const defaultPlatformIdx = (seed + 3) % ALL_PLATFORMS.length;

  if (banks.length === 0) {
    const { bestBank, bestDiscount } = findBestOfferMock(seed);
    const pIdx = seed % ALL_PLATFORMS.length;
    tiles.push({
      id: "best", label: "Best Offer", labelIcon: "Star",
      accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary",
      platform: ALL_PLATFORMS[pIdx],
      platformUrl: buildPlatformUrl(ALL_PLATFORMS[pIdx], fromCode, toCode, dateStr),
      bank: bestBank, card: BANK_OFFERS[bestBank].card, discount: bestDiscount,
      paymentType: "Credit Card", conditions: makeConditions(seed, 0),
    });
    tiles.push({
      id: "default", label: "Default Offer", labelIcon: "Gift",
      accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
      platform: ALL_PLATFORMS[defaultPlatformIdx],
      platformUrl: buildPlatformUrl(ALL_PLATFORMS[defaultPlatformIdx], fromCode, toCode, dateStr),
      bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
      conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
    });
    return tiles;
  }

  const selectedDiscounts = banks.map(b => ({
    bank: b, card: BANK_OFFERS[b]?.card ?? b, discount: getBankDiscount(seed, b),
  }));
  const { bestBank: bestOtherBank, bestDiscount: bestOtherDiscount } = findBestOtherOffer(seed, banks);

  if (banks.length === 1) {
    const sel = selectedDiscounts[0];
    tiles.push({
      id: "selected-0", label: "Your Card Offer", labelIcon: "CreditCard",
      accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary",
      platform: ALL_PLATFORMS[seed % ALL_PLATFORMS.length],
      platformUrl: buildPlatformUrl(ALL_PLATFORMS[seed % ALL_PLATFORMS.length], fromCode, toCode, dateStr),
      bank: sel.bank, card: sel.card, discount: sel.discount,
      paymentType: "Credit Card", conditions: makeConditions(seed, 0),
    });
    if (bestOtherDiscount > sel.discount) {
      tiles.push({
        id: "best-other", label: "Better Alternative", extraLabel: `₹${bestOtherDiscount - sel.discount} more`,
        labelIcon: "TrendingUp",
        accentClass: "bg-highlight text-highlight-foreground", accentBorder: "border-highlight",
        platform: ALL_PLATFORMS[(seed + 1) % ALL_PLATFORMS.length],
        platformUrl: buildPlatformUrl(ALL_PLATFORMS[(seed + 1) % ALL_PLATFORMS.length], fromCode, toCode, dateStr),
        bank: bestOtherBank, card: BANK_OFFERS[bestOtherBank].card, discount: bestOtherDiscount,
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
        platformUrl: buildPlatformUrl(ALL_PLATFORMS[(seed + i) % ALL_PLATFORMS.length], fromCode, toCode, dateStr),
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
        platformUrl: buildPlatformUrl(ALL_PLATFORMS[(seed + 2) % ALL_PLATFORMS.length], fromCode, toCode, dateStr),
        bank: bestOtherBank, card: BANK_OFFERS[bestOtherBank].card, discount: bestOtherDiscount,
        paymentType: "Credit Card", conditions: makeConditions(seed, 2),
      });
    }
  }

  tiles.push({
    id: "default", label: "Default Offer", labelIcon: "Gift",
    accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
    platform: ALL_PLATFORMS[defaultPlatformIdx],
    platformUrl: buildPlatformUrl(ALL_PLATFORMS[defaultPlatformIdx], fromCode, toCode, dateStr),
    bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });

  return tiles;
}

function mockAllOffers(filters?: OffersRequest): OfferTile[] {
  const seedStr = "global-catalog-offers";
  const seed = hashCode(seedStr);
  const result: OfferTile[] = [];

  ALL_BANKS.forEach((bankName, idx) => {
    const discount = getBankDiscount(seed, bankName);
    const pIdx = (idx + seed) % ALL_PLATFORMS.length;
    result.push({
      id: `all-${bankName}`, label: bankName, labelIcon: "TrendingUp",
      accentClass: "bg-secondary text-secondary-foreground", accentBorder: "border-secondary",
      platform: ALL_PLATFORMS[pIdx], platformUrl: "#",
      bank: bankName, card: BANK_OFFERS[bankName].card, discount,
      paymentType: idx % 3 === 2 ? "Debit Card" : "Credit Card",
      conditions: makeConditions(seed, idx),
    });
  });

  result.push({
    id: "all-default", label: "Default Offer", labelIcon: "Gift",
    accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
    platform: "EaseMyTrip", platformUrl: "#",
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

  // Apply filters
  if (filters) {
    return result.filter(o => {
      if (filters.bank?.length && o.bank && !filters.bank.includes(o.bank)) return false;
      if (filters.platform?.length && !filters.platform.includes(o.platform)) return false;
      if (filters.paymentType?.length && !filters.paymentType.includes(o.paymentType)) return false;
      return true;
    });
  }

  return result;
}

function mockDateStrip(fromCode: string, toCode: string, selectedDate: Date): DateStripEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries: DateStripEntry[] = [];
  // Generate 7 days centered on selectedDate, but not before today
  const candidates = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3)).filter(d => d >= today);
  // Ensure 7 entries
  while (candidates.length < 7) {
    candidates.push(addDays(candidates[candidates.length - 1], 1));
  }

  candidates.slice(0, 7).forEach(d => {
    const dateStr = format(d, "yyyy-MM-dd");
    const seed = hashCode(`${fromCode}-${toCode}-${dateStr}`);
    const { bestDiscount } = findBestOfferMock(seed);
    entries.push({
      date: dateStr,
      dayLabel: format(d, "EEE"),
      dateLabel: format(d, "dd MMM"),
      minPrice: bestDiscount,
    });
  });

  return entries;
}

// ── Public API ──────────────────────────────────────────────

export const api = {
  async getMeta(): Promise<MetaResponse> {
    if (!USE_MOCK) {
      return fetchWithRetry<MetaResponse>(`${API_BASE}/api/v1/meta`);
    }
    // Simulate network delay
    await new Promise(r => setTimeout(r, 100));
    return {
      cities: CITIES,
      banks: BANK_OFFERS,
      bankNames: ALL_BANKS,
      platforms: ALL_PLATFORMS,
    };
  },

  async getOffers(filters?: OffersRequest): Promise<OffersResponse> {
    if (!USE_MOCK) {
      const params = new URLSearchParams();
      if (filters?.bank?.length) params.set("bank", filters.bank.join(","));
      if (filters?.platform?.length) params.set("platform", filters.platform.join(","));
      if (filters?.paymentType?.length) params.set("paymentType", filters.paymentType.join(","));
      return fetchWithRetry<OffersResponse>(`${API_BASE}/api/v1/offers?${params}`);
    }
    await new Promise(r => setTimeout(r, 200));
    const offers = mockAllOffers(filters);
    return { offers, total: offers.length };
  },

  async search(req: SearchRequest): Promise<SearchResponse> {
    if (!USE_MOCK) {
      return fetchWithRetry<SearchResponse>(`${API_BASE}/api/v1/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
    }
    await new Promise(r => setTimeout(r, 300));
    const fromCity = CITIES.find(c => c.code === req.from)!;
    const toCity = CITIES.find(c => c.code === req.to)!;
    const date = new Date(req.date);
    const offers = mockSearchResults(req.from, req.to, req.date, req.banks ?? []);
    const dateStrip = mockDateStrip(req.from, req.to, date);
    return { offers, dateStrip, from: fromCity, to: toCity, date: req.date };
  },

  async getVisitorCount(): Promise<VisitorCountResponse> {
    if (!USE_MOCK) {
      return fetchWithRetry<VisitorCountResponse>(`${API_BASE}/api/v1/visitors`);
    }
    const today = format(new Date(), "yyyy-MM-dd");
    const seed = hashCode(today);
    return { count: 1200 + (seed % 800), date: today };
  },
};
