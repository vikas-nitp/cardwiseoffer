import { describe, it, expect } from "vitest";
import { rankOffers, rankAndLabelOffers } from "@/domain/offerRanking";
import type { OfferViewModel } from "@/types/offer";

const offer = (
  id: string,
  bank: string | null,
  savings: number,
  payment: "CREDIT" | "NO_CARD" = "CREDIT",
  pri = 50
): OfferViewModel => ({
  id, label: "x", offerTitle: "x",
  platformName: "MakeMyTrip", platform: "MAKEMYTRIP",
  bank, bankDisplay: bank, cardName: null,
  paymentMethod: payment, category: "FLIGHT_DOMESTIC", bookingChannel: "WEB_AND_APP",
  discountType: "FLAT", discountValue: savings, maxDiscount: null, minTransaction: null, savings,
  couponCode: null, validFrom: "2026-01-01", expiryDate: "2030-01-01",
  newUserOnly: false, eligibilityNotes: [], platformUrl: null,
  sourceType: "demo_excel", isActive: true, priorityScore: pri,
});

describe("offerRanking", () => {
  it("no selection: returns best card + best default only (2 max)", () => {
    const out = rankOffers([offer("a", "HDFC", 1500), offer("b", "ICICI", 1200), offer("d", null, 300, "NO_CARD")], []);
    expect(out.map(o => o.id)).toEqual(["a", "d"]);
  });

  it("1 selected: shows better alt only when strictly better", () => {
    const out = rankOffers([
      offer("sel", "HDFC", 1000),
      offer("outside_lower", "ICICI", 800),
      offer("d", null, 200, "NO_CARD"),
    ], ["HDFC"]);
    expect(out.map(o => o.id)).toEqual(["sel", "d"]);
  });

  it("1 selected with a better outside offer surfaces it with correct delta", () => {
    const primary = offer("sel", "HDFC", 1000);
    const alt = offer("alt", "ICICI", 1600);
    const out = rankOffers([primary, alt, offer("d", null, 200, "NO_CARD")], ["HDFC"]);
    expect(out.map(o => o.id)).toEqual(["sel", "alt", "d"]);
  });

  it("does not duplicate offers across categories", () => {
    const out = rankOffers([offer("a", "HDFC", 500), offer("a", "HDFC", 500)], []);
    expect(out.map(o => o.id)).toEqual(["a"]);
  });

  describe("selected bank has no offers (e.g. Amex not in dataset)", () => {
    it("shows Best Available from another bank instead of only Default", () => {
      const out = rankAndLabelOffers([
        offer("hdfc", "HDFC", 800),
        offer("d", null, 200, "NO_CARD"),
      ], ["AMEX"]);
      const labels = out.map(o => o.label);
      expect(labels).toContain("Best Available");
      expect(labels).not.toContain("Your Card Offer");
      expect(labels).not.toContain("Better Alternative");
    });

    it("Best Available is ordered before Default", () => {
      const out = rankAndLabelOffers([
        offer("hdfc", "HDFC", 800),
        offer("d", null, 200, "NO_CARD"),
      ], ["AMEX"]);
      const labelOrder = out.map(o => o.label);
      expect(labelOrder.indexOf("Best Available")).toBeLessThan(labelOrder.indexOf("Default"));
    });

    it("shows only Default when no card offers exist at all", () => {
      const out = rankAndLabelOffers([offer("d", null, 200, "NO_CARD")], ["AMEX"]);
      expect(out.map(o => o.label)).toEqual(["Default"]);
    });

    it("shows nothing when dataset is empty", () => {
      const out = rankAndLabelOffers([], ["AMEX"]);
      expect(out).toHaveLength(0);
    });
  });
});
