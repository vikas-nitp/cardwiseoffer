import { describe, it, expect } from "vitest";
import { estimateSavings, savingsLabel } from "@/domain/offerCalculation";
import type { OfferViewModel } from "@/types/offer";

const base: OfferViewModel = {
  id: "x", label: "x", title: "x",
  platformId: "MAKEMYTRIP", platformName: "MakeMyTrip", platform: "MakeMyTrip",
  bankId: "HDFC", bankName: "HDFC", bank: "HDFC", bankDisplay: "HDFC", cardName: null,
  paymentMethod: "CREDIT", category: "FLIGHT_DOMESTIC", bookingChannel: "WEB_AND_APP",
  discountType: "FLAT", discountValue: 0, maxDiscount: null, minTransaction: null, savings: 0,
  couponCode: null, validFrom: "2026-01-01", validTo: "2030-01-01",
  usageLimit: null, newUserOnly: false, loginRequired: false, eligibilityNotes: [],
  termsUrl: null, sourceUrl: "https://example.com/", bookingUrl: null, platformUrl: null,
  sourceType: "demo_excel", evidenceStatus: "UNVERIFIED", publishStatus: "READY", isActive: true,
  verificationStatus: "demo", lastVerifiedAt: null, priorityScore: 0, extra: {},
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
