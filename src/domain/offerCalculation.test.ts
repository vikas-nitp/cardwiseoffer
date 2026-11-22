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

  it("FLAT shows flat rupee label", () => {
    const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 2000, maxDiscount: null };
    expect(savingsLabel(o)).toBe("Flat ₹2,000 off");
  });

  it("FLAT with zero discount shows Offer available", () => {
    const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 0, maxDiscount: null };
    expect(savingsLabel(o)).toBe("Offer available");
  });

  describe("FLAT — always shows fixed rupee, never a percentage", () => {
    it("shows flat label regardless of min_transaction ratio", () => {
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 2000, minTransaction: 10000 };
      expect(savingsLabel(o)).toBe("Flat ₹2,000 off");
      expect(savingsLabel(o)).not.toContain("%");
    });

    it("shows flat label when ratio would be ~30%", () => {
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 3000, minTransaction: 10000 };
      expect(savingsLabel(o)).toBe("Flat ₹3,000 off");
      expect(savingsLabel(o)).not.toContain("%");
    });

    it("shows flat label when ratio is 100%", () => {
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 5000, minTransaction: 5000 };
      expect(savingsLabel(o)).toBe("Flat ₹5,000 off");
      expect(savingsLabel(o)).not.toContain("%");
    });

    it("shows flat label when minTransaction is null", () => {
      const o: OfferViewModel = { ...base, discountType: "FLAT", discountValue: 2000, minTransaction: null };
      expect(savingsLabel(o)).toBe("Flat ₹2,000 off");
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
