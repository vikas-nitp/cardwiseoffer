import { describe, it, expect } from "vitest";
import { rankOffers } from "@/domain/offerRanking";
import type { OfferViewModel } from "@/types/offer";

const offer = (
  id: string,
  bank: string | null,
  savings: number,
  payment: "CREDIT" | "NO_CARD" = "CREDIT",
  pri = 50
): OfferViewModel => ({
  id, label: "x", title: "x",
  platformId: "MAKEMYTRIP", platformName: "MakeMyTrip", platform: "MakeMyTrip",
  bankId: bank, bankName: bank, bank, bankDisplay: bank, cardName: null,
  paymentMethod: payment, category: "FLIGHT_DOMESTIC", bookingChannel: "WEB_AND_APP",
  discountType: "FLAT", discountValue: savings, maxDiscount: null, minTransaction: null, savings,
  couponCode: null, validFrom: "2026-01-01", validTo: "2030-01-01",
  usageLimit: null, newUserOnly: false, loginRequired: false, eligibilityNotes: [],
  termsUrl: null, sourceUrl: "https://example.com/", bookingUrl: null, platformUrl: null,
  sourceType: "demo_excel", evidenceStatus: "UNVERIFIED", publishStatus: "READY", isActive: true,
  verificationStatus: "demo", lastVerifiedAt: null, priorityScore: pri, extra: {},
});

describe("offerRanking", () => {
  it("no selection: returns best card + best default", () => {
    const out = rankOffers([offer("a", "HDFC", 1500), offer("b", "ICICI", 1200), offer("d", null, 300, "NO_CARD")], []);
    expect(out.map(o => o.id)).toEqual(["a", "d", "b"]);
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
});
