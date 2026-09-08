import { describe, it, expect } from "vitest";
import { searchLocalOffers } from "./LocalOfferRepository";

import type { CityOption } from "@/components/CityAutocomplete";
const BOM: CityOption = { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji" };
const DEL: CityOption = { city: "New Delhi", code: "DEL", airport: "Indira Gandhi" };
const DATE = new Date("2026-10-01");

describe("LocalOfferRepository — strip", () => {
  it("strip contains 7 entries anchored to the search date", async () => {
    const result = searchLocalOffers(BOM, DEL, DATE, []);
    expect(result.strip7days).toHaveLength(7);
    expect(result.strip7days[0].date).toBe("2026-10-01");
  });

  it("strip shows market-best across ALL banks even when a bank is selected", async () => {
    const withBank = searchLocalOffers(BOM, DEL, DATE, ["AXIS"], 10_000);
    const noBank   = searchLocalOffers(BOM, DEL, DATE, [],       10_000);
    // Strip for withBank should show the same or better savings than AXIS-only
    // (market-best ≥ selected-bank-only)
    const stripNoBank   = noBank.strip7days.map((d) => parseInt(d.displayText.replace(/\D/g, "")) || 0);
    const stripWithBank = withBank.strip7days.map((d) => parseInt(d.displayText.replace(/\D/g, "")) || 0);
    // They should be equal (both use all active offers for strip)
    expect(stripWithBank).toEqual(stripNoBank);
  });

  it("no-fare strip shows max-possible savings (maxDiscount / discountValue) not a simulated fare", () => {
    const result = searchLocalOffers(BOM, DEL, DATE, []);
    // Every non-empty label should say "Save up to ₹X"
    result.strip7days
      .filter((d) => d.displayText !== "No offers")
      .forEach((d) => {
        expect(d.displayText).toMatch(/^Save up to/);
      });
    // No simFare field should be present
    result.strip7days.forEach((d) => {
      expect((d as Record<string, unknown>).simFare).toBeUndefined();
    });
  });

  it("fare-mode strip has dayFare on each entry", () => {
    const result = searchLocalOffers(BOM, DEL, DATE, [], 10_000);
    result.strip7days.forEach((d) => {
      expect(d.dayFare).toBeDefined();
    });
  });
});

describe("LocalOfferRepository — tiles", () => {
  it("no-fare search gives amountEligible: null for all offers", () => {
    const result = searchLocalOffers(BOM, DEL, DATE, []);
    result.offers.forEach((o) => {
      expect(o.amountEligible).toBeNull();
    });
  });

  it("fare search gives amountEligible: boolean for all offers", () => {
    const result = searchLocalOffers(BOM, DEL, DATE, [], 10_000);
    result.offers.forEach((o) => {
      expect(typeof o.amountEligible).toBe("boolean");
    });
  });

  it("strip amounts are identical regardless of bank selection", () => {
    const axisOnly = searchLocalOffers(BOM, DEL, DATE, ["AXIS"]);
    const all      = searchLocalOffers(BOM, DEL, DATE, []);
    // Strip uses all active offers (market-wide best), so amounts must match
    const axisStrip = axisOnly.strip7days.map((d) => d.displayText);
    const allStrip  = all.strip7days.map((d) => d.displayText);
    expect(axisStrip).toEqual(allStrip);
  });
});
