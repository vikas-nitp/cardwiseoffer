import { describe, it, expect } from "vitest";
import { rankOffers, rankAndLabelOffers } from "@/domain/offerRanking";
import type { OfferViewModel } from "@/types/offer";

const offer = (
  id: string,
  bank: string | null,
  savings: number,
  payment: "CREDIT" | "DEBIT" | "NO_CARD" = "CREDIT",
  pri = 50,
  platform = "MAKEMYTRIP",
): OfferViewModel => ({
  id, label: "x", offerTitle: "x",
  platformName: platform === "MAKEMYTRIP" ? "MakeMyTrip" : platform === "CLEARTRIP" ? "ClearTrip" : platform,
  platform,
  bank, bankDisplay: bank, cardName: null, cardSpecificity: null,
  paymentMethod: payment, category: "FLIGHT_DOMESTIC", bookingChannel: "WEB_AND_APP",
  discountType: "FLAT", discountValue: savings, maxDiscount: null, minTransaction: null, savings,
  couponCode: null, validFrom: "2026-01-01", expiryDate: "2030-01-01",
  newUserOnly: false, eligibilityNotes: [], platformUrl: null,
  sourceType: "demo_excel", isActive: true, priorityScore: pri,
});

describe("offerRanking", () => {
  it("no selection: returns best card + best default per platform", () => {
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

  it("1 selected with a better outside offer surfaces it", () => {
    const out = rankOffers([
      offer("sel", "HDFC", 1000),
      offer("alt", "ICICI", 1600),
      offer("d", null, 200, "NO_CARD"),
    ], ["HDFC"]);
    expect(out.map(o => o.id)).toEqual(["sel", "alt", "d"]);
  });

  it("does not duplicate offers across categories", () => {
    const out = rankOffers([offer("a", "HDFC", 500), offer("a", "HDFC", 500)], []);
    expect(out.map(o => o.id)).toEqual(["a"]);
  });

  describe("CC + DC split — selected bank has both types", () => {
    it("shows credit and debit offers separately for selected bank", () => {
      const out = rankAndLabelOffers([
        offer("hdfc-cc", "HDFC", 1500, "CREDIT"),
        offer("hdfc-dc", "HDFC", 800, "DEBIT"),
        offer("d", null, 200, "NO_CARD"),
      ], ["HDFC"]);
      const ids = out.map(o => o.id);
      expect(ids).toContain("hdfc-cc");
      expect(ids).toContain("hdfc-dc");
    });

    it("highest savings gets 'Selected' label, lower gets 'Selected Alt'", () => {
      const out = rankAndLabelOffers([
        offer("hdfc-cc", "HDFC", 1500, "CREDIT"),
        offer("hdfc-dc", "HDFC", 800, "DEBIT"),
      ], ["HDFC"]);
      const byId = Object.fromEntries(out.map(o => [o.id, o.label]));
      expect(byId["hdfc-cc"]).toBe("Selected");
      expect(byId["hdfc-dc"]).toBe("Selected Alt");
    });

    it("debit offer is primary when it has higher savings", () => {
      const out = rankAndLabelOffers([
        offer("hdfc-cc", "HDFC", 800, "CREDIT"),
        offer("hdfc-dc", "HDFC", 1500, "DEBIT"),
      ], ["HDFC"]);
      const byId = Object.fromEntries(out.map(o => [o.id, o.label]));
      expect(byId["hdfc-dc"]).toBe("Selected");
      expect(byId["hdfc-cc"]).toBe("Selected Alt");
    });

    it("2 banks: shows CC + DC for each bank", () => {
      const out = rankAndLabelOffers([
        offer("hdfc-cc", "HDFC", 1500, "CREDIT"),
        offer("hdfc-dc", "HDFC", 800, "DEBIT"),
        offer("axis-cc", "AXIS", 1200, "CREDIT"),
        offer("axis-dc", "AXIS", 600, "DEBIT"),
      ], ["HDFC", "AXIS"]);
      const ids = out.map(o => o.id);
      expect(ids).toContain("hdfc-cc");
      expect(ids).toContain("hdfc-dc");
      expect(ids).toContain("axis-cc");
      expect(ids).toContain("axis-dc");
    });

    it("Better Alternative not shown when outside bank does not beat primary", () => {
      const out = rankAndLabelOffers([
        offer("hdfc-cc", "HDFC", 1500, "CREDIT"),
        offer("icici", "ICICI", 1200, "CREDIT"),
      ], ["HDFC"]);
      const labels = out.map(o => o.label);
      expect(labels).not.toContain("Better Alternative");
    });
  });

  describe("selected bank has no offers (e.g. Amex not in dataset)", () => {
    it("shows Best Available from another bank instead of only Default", () => {
      const out = rankAndLabelOffers([
        offer("hdfc", "HDFC", 800),
        offer("d", null, 200, "NO_CARD"),
      ], ["AMEX"]);
      const labels = out.map(o => o.label);
      expect(labels).toContain("Best Available");
      expect(labels).not.toContain("Selected");
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

  describe("per-platform defaults", () => {
    it("no selection: shows best default from each platform", () => {
      const out = rankAndLabelOffers([
        offer("mmt-cc", "HDFC", 1500, "CREDIT", 50, "MAKEMYTRIP"),
        offer("mmt-def", null, 800, "NO_CARD", 50, "MAKEMYTRIP"),
        offer("ct-def", null, 600, "NO_CARD", 50, "CLEARTRIP"),
      ], []);
      const ids = out.map(o => o.id);
      expect(ids).toContain("mmt-def");
      expect(ids).toContain("ct-def");
    });

    it("only the best default per platform is shown (not all)", () => {
      const out = rankAndLabelOffers([
        offer("mmt-def-high", null, 800, "NO_CARD", 50, "MAKEMYTRIP"),
        offer("mmt-def-low", null, 500, "NO_CARD", 50, "MAKEMYTRIP"),
        offer("ct-def", null, 600, "NO_CARD", 50, "CLEARTRIP"),
      ], []);
      const ids = out.map(o => o.id);
      expect(ids).toContain("mmt-def-high");
      expect(ids).not.toContain("mmt-def-low");
      expect(ids).toContain("ct-def");
    });

    it("bank selected: shows selected card before the single platform default", () => {
      const out = rankAndLabelOffers([
        offer("sel", "HDFC", 1000, "CREDIT", 50, "MAKEMYTRIP"),
        offer("mmt-def", null, 800, "NO_CARD", 50, "MAKEMYTRIP"),
        offer("ct-def", null, 600, "NO_CARD", 50, "CLEARTRIP"),
      ], ["HDFC"]);
      const ids = out.map(o => o.id);
      // Only the best platform default is shown when a bank is selected (reduces clutter)
      expect(ids).toContain("mmt-def");
      expect(ids).not.toContain("ct-def");
      expect(ids.indexOf("sel")).toBeLessThan(ids.indexOf("mmt-def"));
    });
  });
});
