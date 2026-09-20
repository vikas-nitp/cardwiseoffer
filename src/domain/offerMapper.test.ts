import { describe, it, expect } from "vitest";
import { mapApiOffer, mapLocalOffer } from "@/domain/offerMapper";
import type { ApiOffer, LocalRawOffer } from "@/domain/offerMapper";

function apiOffer(overrides: Record<string, unknown> = {}): ApiOffer {
  return {
    offer_id: "O1",
    platform_id: "MAKEMYTRIP",
    platform_name: "MakeMyTrip",
    offer_title: "HDFC 20% off",
    bank_id: "HDFC",
    bank_name: "HDFC Bank",
    card_name: null,
    card_specificity: null,
    supported_cards: [],
    payment_method: "CREDIT",
    category: "FLIGHT_DOMESTIC",
    booking_channel: "WEB_AND_APP",
    discount_type: "PERCENT",
    discount_value: 20,
    max_discount: 1500,
    min_transaction: 5000,
    coupon_code: null,
    valid_from: "2026-01-01",
    expiry_date: "2026-12-31",
    updated_at: "2026-09-01",
    new_user_only: false,
    eligibility_notes: [],
    booking_url: null,
    usage_limit: null,
    valid_days: null,
    evidence_status: null,
    source_url: null,
    ...overrides,
  } as unknown as ApiOffer;
}

function localOffer(overrides: Partial<LocalRawOffer> = {}): LocalRawOffer {
  return {
    offer_id: "L1",
    bank_id: "HDFC",
    platform: "MAKEMYTRIP",
    category: "FLIGHT_DOMESTIC",
    payment_method: "CREDIT",
    discount_type: "FLAT",
    discount_value: 500,
    valid_from: "2026-01-01",
    expiry_date: "2026-12-31",
    ...overrides,
  };
}

describe("mapApiOffer", () => {
  describe("savings calculation", () => {
    it("uses maxDiscount as savings for PERCENT offers", () => {
      const vm = mapApiOffer(apiOffer({ discount_type: "PERCENT", discount_value: 20, max_discount: 1500 }));
      expect(vm.savings).toBe(1500);
    });

    it("uses discountValue as savings for FLAT offers", () => {
      const vm = mapApiOffer(apiOffer({ discount_type: "FLAT", discount_value: 500, max_discount: null }));
      expect(vm.savings).toBe(500);
    });

    it("uses estimated_savings from SearchOffer when present (overrides discount)", () => {
      const vm = mapApiOffer(apiOffer({ discount_type: "FLAT", discount_value: 500, estimated_savings: 800 }));
      expect(vm.savings).toBe(800);
    });
  });

  describe("label derivation", () => {
    it("maps display_kind SELECTED_CARD to 'Your Card Offer'", () => {
      const vm = mapApiOffer(apiOffer({ display_kind: "SELECTED_CARD" }));
      expect(vm.label).toBe("Your Card Offer");
    });

    it("maps display_kind BETTER_ALTERNATIVE correctly", () => {
      const vm = mapApiOffer(apiOffer({ display_kind: "BETTER_ALTERNATIVE" }));
      expect(vm.label).toBe("Better Alternative");
    });

    it("falls back to bank name when no display_kind", () => {
      const vm = mapApiOffer(apiOffer({ bank_id: "AXIS", bank_name: "Axis Bank" }));
      expect(vm.label).toBe("Axis Bank Offer");
    });

    it("uses bank_id when bank_name is absent", () => {
      const vm = mapApiOffer(apiOffer({ bank_id: "AXIS", bank_name: null }));
      expect(vm.label).toBe("AXIS Offer");
    });

    it("labels null-bank offers as 'Default Offer (No Card)'", () => {
      const vm = mapApiOffer(apiOffer({ bank_id: null, bank_name: null }));
      expect(vm.label).toBe("Default Offer (No Card)");
    });
  });

  describe("field mapping", () => {
    it("sets cardName to null for NO_CARD payment method regardless of card_name", () => {
      const vm = mapApiOffer(apiOffer({ payment_method: "NO_CARD", card_name: "Some Card" }));
      expect(vm.cardName).toBeNull();
    });

    it("passes card_name through for card-based payment methods", () => {
      const vm = mapApiOffer(apiOffer({ payment_method: "CREDIT", card_name: "Regalia" }));
      expect(vm.cardName).toBe("Regalia");
    });

    it("maps validDays, evidenceStatus, sourceUrl when set", () => {
      const vm = mapApiOffer(apiOffer({
        valid_days: [1, 2, 3, 4, 5],
        evidence_status: "VERIFIED",
        source_url: "https://example.com/offer",
      }));
      expect(vm.validDays).toEqual([1, 2, 3, 4, 5]);
      expect(vm.evidenceStatus).toBe("VERIFIED");
      expect(vm.sourceUrl).toBe("https://example.com/offer");
    });

    it("maps null new fields to their defaults", () => {
      const vm = mapApiOffer(apiOffer());
      expect(vm.validDays).toBeNull();
      expect(vm.evidenceStatus).toBeUndefined();
      expect(vm.sourceUrl).toBeNull();
    });

    it("always marks sourceType as api", () => {
      expect(mapApiOffer(apiOffer()).sourceType).toBe("api");
    });
  });
});

describe("mapLocalOffer", () => {
  it("computes savings as discountValue for FLAT offers", () => {
    const vm = mapLocalOffer(localOffer({ discount_type: "FLAT", discount_value: 600 }));
    expect(vm.savings).toBe(600);
  });

  it("computes savings as max_discount for PERCENT offers", () => {
    const vm = mapLocalOffer(localOffer({ discount_type: "PERCENT", discount_value: 10, max_discount: 900 }));
    expect(vm.savings).toBe(900);
  });

  it("uses zero savings for PERCENT offer with no max_discount", () => {
    const vm = mapLocalOffer(localOffer({ discount_type: "PERCENT", discount_value: 10, max_discount: undefined }));
    expect(vm.savings).toBe(0);
  });

  it("builds label from bank_id", () => {
    expect(mapLocalOffer(localOffer({ bank_id: "SBI" })).label).toBe("SBI Offer");
  });

  it("uses 'Default Offer' label when bank_id is null", () => {
    expect(mapLocalOffer(localOffer({ bank_id: null })).label).toBe("Default Offer");
  });

  it("combines eligibility_notes and channels into eligibilityNotes array", () => {
    const vm = mapLocalOffer(localOffer({ eligibility_notes: "Min ₹5000", channels: "WEB" }));
    expect(vm.eligibilityNotes).toContain("Min ₹5000");
    expect(vm.eligibilityNotes).toContain("Channels: WEB");
  });

  it("produces an empty eligibilityNotes array when neither field is set", () => {
    const vm = mapLocalOffer(localOffer({ eligibility_notes: undefined, channels: undefined }));
    expect(vm.eligibilityNotes).toEqual([]);
  });

  it("passes source_url through as sourceUrl", () => {
    const vm = mapLocalOffer(localOffer({ source_url: "https://example.com" }));
    expect(vm.sourceUrl).toBe("https://example.com");
  });

  it("always marks sourceType as demo_excel", () => {
    expect(mapLocalOffer(localOffer()).sourceType).toBe("demo_excel");
  });
});
