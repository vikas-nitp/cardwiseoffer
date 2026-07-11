import { describe, it, expect } from "vitest";
import { rankOffers, betterAltDelta } from "@/domain/offerRanking";
import type { OfferViewModel } from "@/types/offer";

const base: Omit<OfferViewModel, "id" | "bank" | "bankDisplay" | "savings" | "paymentMethod" | "priorityScore"> = {
  label: "x", cardName: null, platform: "MakeMyTrip", platformUrl: null,
  discountType: "FLAT", discountValue: 0,
  validFrom: "2026-01-01", validTo: "2030-01-01",
  eligibilityNotes: [], category: "flight_domestic",
  sourceType: "demo_excel", verificationStatus: "demo",
};

const offer = (id: string, bank: string | null, savings: number, payment: "CREDIT" | "NO_CARD" = "CREDIT", pri = 50): OfferViewModel =>
  ({ ...base, id, bank, bankDisplay: bank, savings, paymentMethod: payment, priorityScore: pri });

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
    expect(betterAltDelta(alt, primary)).toBe(600);
  });

  it("does not duplicate offers across categories", () => {
    const out = rankOffers([offer("a", "HDFC", 500), offer("a", "HDFC", 500)], []);
    expect(out.map(o => o.id)).toEqual(["a"]);
  });
});
