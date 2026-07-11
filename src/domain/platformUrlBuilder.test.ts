import { describe, it, expect } from "vitest";
import { buildFlightSearchUrl, platformHomeUrl } from "@/domain/platformUrlBuilder";

describe("platformUrlBuilder", () => {
  const ctx = { from: "BLR", to: "DEL", date: "2026-07-15" };

  it("builds valid https URLs for supported platforms", () => {
    for (const p of ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Goibibo"]) {
      const url = buildFlightSearchUrl(p, ctx);
      expect(url).toMatch(/^https:\/\//);
      expect(url).toContain("BLR");
      expect(url).toContain("DEL");
    }
  });

  it("returns null for unknown platform", () => {
    expect(buildFlightSearchUrl("UnknownPlatform", ctx)).toBeNull();
  });

  it("returns null when route context is missing", () => {
    expect(buildFlightSearchUrl("MakeMyTrip", { from: "", to: "DEL", date: "2026-07-15" })).toBeNull();
  });

  it("home URLs are allow-listed https", () => {
    expect(platformHomeUrl("MakeMyTrip")).toMatch(/^https:\/\/www\.makemytrip\.com/);
    expect(platformHomeUrl("Unknown")).toBeNull();
  });
});
