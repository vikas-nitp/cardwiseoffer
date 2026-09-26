import { describe, it, expect } from "vitest";
import { estimateSavings, savingsLabel } from "@/domain/offerCalculation";
import type { OfferViewModel } from "@/types/offer";

const base: OfferViewModel = {
  id: "x", label: "x", offerTitle: "x",
  platformName: "MakeMyTrip", platform: "MAKEMYTRIP",
  bank: "HDFC", bankDisplay: "HDFC", cardName: null, cardSpecificity: null,
  paymentMethod: "CREDIT", category: "FLIGHT_DOMESTIC", bookingChannel: "WEB_AND_APP",
  discountType: "FLAT", discountValue: 0, maxDiscount: null, minTransaction: null, savings: 0,
  couponCode: null, validFrom: "2026-01-01", expiryDate: "2030-01-01",
  newUserOnly: false, eligibilityNotes: [], platformUrl: null,
  sourceType: "demo_excel", isActive: true, priorityScore: 0,
};

describe("estimateSavings", () => {
  it("FLAT caps at maxDiscount", () => {
    const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 3000, maxDiscount: 2000 };
    expect(estimateSavings(o)).toBe(2000);
  });

  it("FLAT with no maxDiscount returns discountValue", () => {
    const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 1500, maxDiscount: null };
    expect(estimateSavings(o)).toBe(1500);
  });

  it("PERCENT uses fare when provided", () => {
    const o: OfferViewModel = { ...base, discountType: "PERCENT", discountValue: 10, maxDiscount: 2000 };
    expect(estimateSavings(o, 5000)).toBe(500);
    expect(estimateSavings(o, 30000)).toBe(2000);
  });

  it("PERCENT without fare falls back to maxDiscount cap", () => {
    const o: OfferViewModel = { ...base, discountType: "PERCENT", discountValue: 10, maxDiscount: 1500 };
    expect(estimateSavings(o)).toBe(1500);
  });

  it("PERCENT without fare and no maxDiscount returns 0", () => {
    const o: OfferViewModel = { ...base, discountType: "PERCENT", discountValue: 10, maxDiscount: null };
    expect(estimateSavings(o)).toBe(0);
  });

  it("CASHBACK percentage type uses fare", () => {
    const o: OfferViewModel = { ...base, discountType: "CASHBACK", discountValue: 5, maxDiscount: 1000 };
    expect(estimateSavings(o, 10000)).toBe(500);
    expect(estimateSavings(o, 30000)).toBe(1000); // capped at maxDiscount
  });

  it("CASHBACK flat rupee type caps at maxDiscount", () => {
    const o: OfferViewModel = { ...base, discountType: "CASHBACK", discountValue: 500, maxDiscount: 400 };
    expect(estimateSavings(o)).toBe(400);
  });
});

describe("savingsLabel", () => {
  it("PERCENT without fare shows rate and cap", () => {
    const o: OfferViewModel = { ...base, discountType: "PERCENT", discountValue: 10, maxDiscount: 1500 };
    expect(savingsLabel(o)).toBe("10% off · up to ₹1,500");
  });

  it("PERCENT without cap shows rate only", () => {
    const o: OfferViewModel = { ...base, discountType: "PERCENT", discountValue: 12, maxDiscount: null };
    expect(savingsLabel(o)).toBe("12% off");
  });

  it("FLAT shows rupee amount", () => {
    const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 2000, maxDiscount: null };
    expect(savingsLabel(o)).toBe("₹2,000 off");
  });

  it("FLAT with zero discount shows Offer available", () => {
    const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 0, maxDiscount: null };
    expect(savingsLabel(o)).toBe("Offer available");
  });

  describe("FLAT percentage annotation", () => {
    // pct = Math.round((amt / minTransaction) * 100 * 10) / 10
    // Annotation shows only when pct >= 1 && pct < 50.

    it("shows percentage when pct is a normal savings rate (~20%)", () => {
      // ₹2,000 off on ₹10,000 min = 20%
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 2000, minTransaction: 10000 };
      expect(savingsLabel(o)).toBe("₹2,000 off (~20%)");
    });

    it("shows percentage when pct is ~30%", () => {
      // ₹3,000 off on ₹10,000 min = 30%
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 3000, minTransaction: 10000 };
      expect(savingsLabel(o)).toBe("₹3,000 off (~30%)");
    });

    it("suppresses percentage when pct is exactly 100% (Paytm tiered offer bug)", () => {
      // HSBC scenario: ₹5,000 discount / ₹5,000 min_transaction = 100%
      // This is a data artifact from paired tiers, not a real savings rate.
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 5000, minTransaction: 5000 };
      expect(savingsLabel(o)).toBe("₹5,000 off");
      expect(savingsLabel(o)).not.toContain("%");
    });

    it("suppresses percentage at the 50% boundary", () => {
      // ₹5,000 off on ₹10,000 min = 50% — at boundary, should NOT show
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 5000, minTransaction: 10000 };
      expect(savingsLabel(o)).toBe("₹5,000 off");
    });

    it("shows percentage just below 50% boundary (49%)", () => {
      // ₹4,900 off on ₹10,000 min = 49%
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 4900, minTransaction: 10000 };
      expect(savingsLabel(o)).toContain("~49%");
    });

    it("suppresses percentage when pct is below 1%", () => {
      // ₹50 off on ₹10,000 min = 0.5% — too small to show
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 50, minTransaction: 10000 };
      expect(savingsLabel(o)).toBe("₹50 off");
    });

    it("suppresses percentage when minTransaction is null", () => {
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 2000, minTransaction: null };
      expect(savingsLabel(o)).toBe("₹2,000 off");
      expect(savingsLabel(o)).not.toContain("%");
    });
  });

  describe("CASHBACK", () => {
    it("percentage type shows rate and cap", () => {
      const o: OfferViewModel = { ...base, discountType: "CASHBACK", discountValue: 5, maxDiscount: 1000 };
      expect(savingsLabel(o)).toBe("5% cashback · up to ₹1,000");
    });

    it("percentage type without cap shows rate only", () => {
      const o: OfferViewModel = { ...base, discountType: "CASHBACK", discountValue: 10, maxDiscount: null };
      expect(savingsLabel(o)).toBe("10% cashback");
    });

    it("flat rupee cashback (value >= 100) shows rupee amount", () => {
      const o: OfferViewModel = { ...base, discountType: "CASHBACK", discountValue: 500, maxDiscount: null };
      expect(savingsLabel(o)).toBe("₹500 cashback");
    });

    it("flat rupee cashback caps at maxDiscount", () => {
      const o: OfferViewModel = { ...base, discountType: "CASHBACK", discountValue: 500, maxDiscount: 400 };
      expect(savingsLabel(o)).toBe("₹400 cashback");
    });
  });
});
