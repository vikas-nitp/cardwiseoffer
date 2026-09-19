/**
 * Scenario-based tests for LocalOfferRepository.
 * Uses isolated __fixtures__/test-offers.ts data so tests don't break when production offers change.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── mock featureFlags ─────────────────────────────────────────────────────────
vi.mock("@/data/generated/featureFlags.json", () => ({
  default: {
    phase2UserFeaturesEnabled: false,
    publicAllOffersEnabled: true,
    couponCodeEnabled: false,
    analyticsEnabled: false,
    bookingAmountComparisonEnabled: true,
    visitorCountEnabled: false,
  },
}));

// ── mock offers.json with controlled test data ────────────────────────────────
import {
  PERCENT_CC_OFFER,
  FLAT_DC_OFFER,
  PLATFORM_OFFER,
  AXIS_CC_OFFER,
  AXIS_DC_OFFER,
  EXPIRED_OFFER,
  MON_ONLY_CC_OFFER,
  HDFC_GIB_CC,
  HDFC_CT_CC,
  HDFC_IXIGO_CC,
  HDFC_GIB_CC_LOWER,
  HDFC_MMT_DC,
  ICICI_CT_CC_HIGH,
} from "./__fixtures__/test-offers";

vi.mock("@/data/generated/offers.json", () => ({
  default: [
    PERCENT_CC_OFFER,
    FLAT_DC_OFFER,
    PLATFORM_OFFER,
    AXIS_CC_OFFER,
    AXIS_DC_OFFER,
    EXPIRED_OFFER,
    MON_ONLY_CC_OFFER,
    HDFC_GIB_CC,
    HDFC_CT_CC,
    HDFC_IXIGO_CC,
    HDFC_GIB_CC_LOWER,
    HDFC_MMT_DC,
    ICICI_CT_CC_HIGH,
  ],
}));

import { searchLocalOffers } from "./LocalOfferRepository";
import type { CityOption } from "@/components/CityAutocomplete";

const BOM: CityOption = { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji" };
const DEL: CityOption = { city: "New Delhi", code: "DEL", airport: "Indira Gandhi" };

// A Wednesday in 2027 — all test offers are valid; expired offer is already past
const WED_2027 = new Date("2027-03-10"); // Wednesday = dayOfWeek 3
const MON_2027 = new Date("2027-03-08"); // Monday = dayOfWeek 1

// ── Strip scenarios ───────────────────────────────────────────────────────────
describe("Strip — no fare entered", () => {
  it("returns 7 entries anchored to the search date", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, []);
    expect(strip7days).toHaveLength(7);
    expect(strip7days[0].date).toBe("2027-03-10");
    expect(strip7days[6].date).toBe("2027-03-16");
  });

  it("shows 'Save up to ₹X' using maxDiscount for PERCENT offers", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, []);
    // All 7 days should have active offers (fixtures are valid Jan 2026 – Dec 2028)
    expect(strip7days.every((d) => d.displayText !== "No offers")).toBe(true);
    strip7days.forEach((d) => {
      expect(d.displayText).toMatch(/^Save up to ₹/);
    });
  });

  it("no-fare strip amount is the best offer's maxDiscount cap — not a simulated fare", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, []);
    // Best active offer across the market is ICICI_CT_CC_HIGH (FLAT ₹2,500, no day restriction)
    // All 7 days (all weekdays in the valid date range) should show "Save up to ₹2,500"
    strip7days.forEach((d) => {
      expect(d.displayText).toBe("Save up to ₹2,500");
    });
  });

  it("no simFare field on any strip entry", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, []);
    strip7days.forEach((d) => {
      expect((d as unknown as Record<string, unknown>).simFare).toBeUndefined();
    });
  });

  it("strip is market-wide — bank selection does not change strip amounts", () => {
    const withAxis = searchLocalOffers(BOM, DEL, WED_2027, ["AXIS"]);
    const noBank   = searchLocalOffers(BOM, DEL, WED_2027, []);
    expect(withAxis.strip7days.map((d) => d.displayText))
      .toEqual(noBank.strip7days.map((d) => d.displayText));
  });
});

describe("Strip — fare entered", () => {
  it("each entry has dayFare equal to the user fare", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, [], 10_000);
    strip7days.forEach((d) => {
      expect(d.dayFare).toBe(10_000);
    });
  });

  it("shows 'Save ₹X' (not 'up to') when fare is provided", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, [], 10_000);
    const nonEmpty = strip7days.filter((d) => d.displayText !== "No offers");
    nonEmpty.forEach((d) => {
      expect(d.displayText).toMatch(/^Save ₹/);
      expect(d.displayText).not.toMatch(/up to/);
    });
  });

  it("strips with different fares produce different savings amounts", () => {
    const low  = searchLocalOffers(BOM, DEL, WED_2027, [], 5_000);
    const high = searchLocalOffers(BOM, DEL, WED_2027, [], 15_000);
    const parseAmt = (s: string) => parseInt(s.replace(/\D/g, "")) || 0;
    const lowAmt  = low.strip7days[0].displayText;
    const highAmt = high.strip7days[0].displayText;
    // Higher fare → more savings (or equal at cap)
    expect(parseAmt(highAmt)).toBeGreaterThanOrEqual(parseAmt(lowAmt));
  });
});

// ── Tile scenarios ────────────────────────────────────────────────────────────
describe("Tiles — offer eligibility", () => {
  it("expired offer is not returned", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, []);
    expect(offers.find((o) => o.id === "TEST-EXPIRED")).toBeUndefined();
  });

  it("Monday-only offer absent on Wednesday", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, []);
    expect(offers.find((o) => o.id === "TEST-MON-ONLY")).toBeUndefined();
  });

  it("Monday-only offer present on Monday", () => {
    // Select ICICI so the Monday-only ICICI offer is ranked and returned
    const { offers } = searchLocalOffers(BOM, DEL, MON_2027, ["ICICI"]);
    expect(offers.find((o) => o.id === "TEST-MON-ONLY")).toBeDefined();
  });
});

describe("Tiles — amountEligible", () => {
  it("no-fare search: amountEligible is null for all offers", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, []);
    offers.forEach((o) => expect(o.amountEligible).toBeNull());
  });

  it("fare at minimum: CC offer with min ₹5,000 is eligible at ₹5,000", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, [], 5_000);
    const hdfc = offers.find((o) => o.id === "TEST-CC-PERCENT");
    expect(hdfc?.amountEligible).toBe(true);
  });

  it("fare below minimum: CC offer with min ₹5,000 is ineligible at ₹4,999", () => {
    // Select HDFC so the offer appears in ranked results even when ineligible
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"], 4_999);
    const hdfc = offers.find((o) => o.id === "TEST-CC-PERCENT");
    expect(hdfc?.amountEligible).toBe(false);
  });
});

describe("Tiles — platform offers (NO_CARD)", () => {
  it("platform offer appears in results regardless of bank selection", () => {
    const noBank   = searchLocalOffers(BOM, DEL, WED_2027, []);
    const withHdfc = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"]);
    expect(noBank.offers.find((o) => o.id === "TEST-PLATFORM")).toBeDefined();
    expect(withHdfc.offers.find((o) => o.id === "TEST-PLATFORM")).toBeDefined();
  });

  it("platform offer has paymentMethod NO_CARD", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, []);
    const platform = offers.find((o) => o.id === "TEST-PLATFORM");
    expect(platform?.paymentMethod).toBe("NO_CARD");
  });
});

describe("Tiles — FLAT offer savings", () => {
  it("FLAT offer savings equals discountValue regardless of fare", () => {
    // Select SBI so its DC offer is ranked and returned in results
    const low  = searchLocalOffers(BOM, DEL, WED_2027, ["SBI"], 3_000);
    const high = searchLocalOffers(BOM, DEL, WED_2027, ["SBI"], 30_000);
    const savLow  = low.offers.find((o) => o.id === "TEST-DC-FLAT")?.savings ?? -1;
    const savHigh = high.offers.find((o) => o.id === "TEST-DC-FLAT")?.savings ?? -1;
    expect(savLow).toBe(500);
    expect(savHigh).toBe(500);
  });
});

describe("Tiles — PERCENT offer savings", () => {
  it("PERCENT offer caps at maxDiscount", () => {
    // HDFC: 20% of ₹10,000 = ₹2,000 > maxDiscount ₹1,500 → capped at ₹1,500
    // Select HDFC so its CC offer is ranked and returned in results
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"], 10_000);
    const hdfc = offers.find((o) => o.id === "TEST-CC-PERCENT");
    expect(hdfc?.savings).toBe(1500);
  });

  it("PERCENT offer below cap when fare is low", () => {
    // HDFC: 20% of ₹6,000 = ₹1,200 < maxDiscount ₹1,500 → uncapped at ₹1,200
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"], 6_000);
    const hdfc = offers.find((o) => o.id === "TEST-CC-PERCENT");
    expect(hdfc?.savings).toBe(1200);
  });

  it("PERCENT offer at minimum fare gives exact percentage savings", () => {
    // HDFC: 20% of ₹5,000 = ₹1,000 < maxDiscount ₹1,500 → ₹1,000
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"], 5_000);
    const hdfc = offers.find((o) => o.id === "TEST-CC-PERCENT");
    expect(hdfc?.savings).toBe(1000);
  });
});

// ── Multi-bank and CC/DC co-existence ────────────────────────────────────────
describe("Multi-bank selection", () => {
  it("both banks' offers appear when two banks are selected", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC", "SBI"]);
    expect(offers.find((o) => o.bank === "HDFC")).toBeDefined();
    expect(offers.find((o) => o.bank === "SBI")).toBeDefined();
  });

  it("platform offer always present regardless of bank selection", () => {
    const noBank   = searchLocalOffers(BOM, DEL, WED_2027, []);
    const withTwo  = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC", "SBI"]);
    expect(noBank.offers.find((o) => o.paymentMethod === "NO_CARD")).toBeDefined();
    expect(withTwo.offers.find((o) => o.paymentMethod === "NO_CARD")).toBeDefined();
  });

  it("both CC and DC from AXIS appear when AXIS is selected", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["AXIS"]);
    expect(offers.find((o) => o.id === "TEST-AXIS-CC")).toBeDefined();
    expect(offers.find((o) => o.id === "TEST-AXIS-DC")).toBeDefined();
  });

  it("no bank selected: platform offer and best market offer both appear", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, []);
    expect(offers.find((o) => o.paymentMethod === "NO_CARD")).toBeDefined();
    expect(offers.length).toBeGreaterThan(0);
  });
});

// ── All-platform offers for selected bank ─────────────────────────────────────
describe("All-platform ranking — bank selected", () => {
  it("shows CC offers from every platform for the selected bank", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"]);
    const hdfcCCIds = offers
      .filter((o) => o.bank === "HDFC" && o.paymentMethod === "CREDIT")
      .map((o) => o.id);
    // All multi-platform fixtures must appear alongside the existing MMT fixture
    expect(hdfcCCIds).toContain("TEST-HDFC-GIB-CC");
    expect(hdfcCCIds).toContain("TEST-HDFC-CT-CC");
    expect(hdfcCCIds).toContain("TEST-HDFC-IXIGO-CC");
  });

  it("dedupes same bank+platform+paymentType — keeps only the higher-savings offer", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"]);
    // HDFC_GIB_CC (₹1,500) and HDFC_GIB_CC_LOWER (₹800) share HDFC+Goibibo+CREDIT
    expect(offers.find((o) => o.id === "TEST-HDFC-GIB-CC")).toBeDefined();
    expect(offers.find((o) => o.id === "TEST-HDFC-GIB-CC-LOWER")).toBeUndefined();
  });

  it("shows both CC and DC offers when only one DC platform exists", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"]);
    expect(offers.find((o) => o.id === "TEST-HDFC-MMT-DC")).toBeDefined();
  });

  it("orders CC offers by savings descending across platforms", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"]);
    const hdfcCC = offers.filter((o) => o.bank === "HDFC" && o.paymentMethod === "CREDIT");
    const savings = hdfcCC.map((o) => o.savings);
    expect(savings).toEqual([...savings].sort((a, b) => b - a));
  });

  it("shows Better Alternative when an outside bank beats all selected-bank offers", () => {
    // ICICI_CT_CC_HIGH has ₹2,500 savings — beats HDFC's best (₹1,500)
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"]);
    const betterAlt = offers.find((o) => o.label === "Better Alternative");
    expect(betterAlt).toBeDefined();
    expect(betterAlt?.bank).toBe("ICICI");
  });

  it("does not show outside-bank offers as Better Alternative when they don't beat primary", () => {
    // HDFC+ICICI selected: primary is ICICI ₹2,500, no outside bank beats that
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC", "ICICI"]);
    expect(offers.find((o) => o.label === "Better Alternative")).toBeUndefined();
  });

  it("total offer count equals unique bank+platform+paymentType combos plus defaults", () => {
    const { offers } = searchLocalOffers(BOM, DEL, WED_2027, ["HDFC"]);
    // HDFC CC: MMT (PERCENT_CC_OFFER), GIB (HDFC_GIB_CC), CT (HDFC_CT_CC), IXIGO = 4
    // HDFC DC: MMT (HDFC_MMT_DC) = 1
    // Better Alternative: ICICI (ICICI_CT_CC_HIGH) = 1
    // Platform default: MakeMyTrip (PLATFORM_OFFER) = 1
    // HDFC-GIB-CC-LOWER deduped out; expired and MON_ONLY filtered by date
    expect(offers).toHaveLength(7);
  });
});

// ── Strip no-fare edge cases ──────────────────────────────────────────────────
describe("Strip — no-fare isUpTo flag", () => {
  it("all no-fare strip entries start with 'Save up to'", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, []);
    strip7days.filter((d) => d.displayText !== "No offers").forEach((d) => {
      expect(d.displayText.startsWith("Save up to")).toBe(true);
    });
  });

  it("fare-mode strip entries start with 'Save ₹' (not 'Save up to')", () => {
    const { strip7days } = searchLocalOffers(BOM, DEL, WED_2027, [], 10_000);
    strip7days.filter((d) => d.displayText !== "No offers").forEach((d) => {
      expect(d.displayText.startsWith("Save ₹")).toBe(true);
      expect(d.displayText.startsWith("Save up to")).toBe(false);
    });
  });
});
