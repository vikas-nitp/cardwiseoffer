import { describe, expect, it } from "vitest";
import generatedOffers from "@/data/generated/offers.json";
import { mapApiOffer, type ApiOffer } from "@/domain/offerMapper";
import { filterCatalogueOffers } from "@/domain/offerFiltering";

const offers = (generatedOffers as unknown as ApiOffer[]).map(mapApiOffer);
const empty = { bank: [], platform: [], paymentMethod: [] };

describe("filterCatalogueOffers", () => {
  it("applies a strict bank filter", () => {
    const result = filterCatalogueOffers(offers, { ...empty, bank: ["HDFC"] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((offer) => offer.bank === "HDFC")).toBe(true);
  });

  it("filters by canonical platform ID", () => {
    const result = filterCatalogueOffers(offers, {
      ...empty,
      platform: ["CLEARTRIP"],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((offer) => offer.platform === "CLEARTRIP")).toBe(true);
  });

  it("uses OR within groups and AND across groups", () => {
    const result = filterCatalogueOffers(offers, {
      bank: ["HDFC", "SBI"],
      platform: ["MAKEMYTRIP", "CLEARTRIP"],
      paymentMethod: ["CREDIT"],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (offer) =>
          offer.bank !== null &&
          ["HDFC", "SBI"].includes(offer.bank) &&
          ["MAKEMYTRIP", "CLEARTRIP"].includes(offer.platform) &&
          offer.paymentMethod === "CREDIT"
      )
    ).toBe(true);
  });
});
