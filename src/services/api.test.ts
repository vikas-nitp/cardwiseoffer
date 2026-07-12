import { describe, expect, it } from "vitest";

import { buildOffersQuery } from "@/services/api";

describe("API query serialization", () => {
  it("uses repeated, deduplicated, deterministic filter parameters", () => {
    expect(
      buildOffersQuery({
        platform: ["MAKEMYTRIP", "CLEARTRIP", "MAKEMYTRIP"],
        bank: ["SBI", "HDFC"],
        payment_method: [],
        page: 2,
        limit: 25,
      })
    ).toBe(
      "?platform=CLEARTRIP&platform=MAKEMYTRIP&bank=HDFC&bank=SBI&page=2&limit=25"
    );
  });

  it("does not emit empty arrays", () => {
    expect(buildOffersQuery({ platform: [], bank: [] })).toBe("");
  });
});
