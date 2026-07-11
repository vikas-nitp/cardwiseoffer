import { describe, it, expect } from "vitest";
import { estimateSavings, savingsLabel } from "@/domain/offerCalculation";
import type { OfferViewModel } from "@/types/offer";

const base = {
  id: "x", label: "x", bank: "HDFC", bankDisplay: "HDFC", cardName: null,
  platform: "MakeMyTrip", platformUrl: null,
  paymentMethod: "CREDIT" as const,
  validFrom: "2026-01-01", validTo: "2030-01-01",
  eligibilityNotes: [], category: "flight_domestic",
  sourceType: "demo_excel" as const, verificationStatus: "demo" as const,
  priorityScore: 0, savings: 0,
};

describe("offerCalculation", () => {
  it("FLAT caps at maxDiscount", () => {
    const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 3000, maxDiscount: 2000 };
    expect(estimateSavings(o)).toBe(2000);
  });

  it("PERCENT uses fare when provided", () => {
    const o: OfferViewModel = { ...base, discountType: "PERCENT", discountValue: 10, maxDiscount: 2000 };
    expect(estimateSavings(o, 5000)).toBe(500);
    expect(estimateSavings(o, 30000)).toBe(2000);
  });

  it("PERCENT without fare falls back to cap", () => {
    const o: OfferViewModel = { ...base, discountType: "PERCENT", discountValue: 10, maxDiscount: 1500 };
    expect(estimateSavings(o)).toBe(1500);
    expect(savingsLabel(o)).toContain("10% off");
  });
});
