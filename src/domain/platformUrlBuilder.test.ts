import { describe, it, expect } from "vitest";
import { buildFlightSearchUrl, platformHomeUrl } from "@/domain/platformUrlBuilder";

describe("platformUrlBuilder", () => {
  const ctx = { from: "BLR", to: "DEL", date: "2026-07-15" };

  it("builds valid https URLs for supported platforms", () => {
    for (const p of ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Ixigo", "Air India", "IndiGo", "Goibibo", "Yatra"]) {
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

  it("supports canonical backend platform IDs", () => {
    expect(buildFlightSearchUrl("MAKEMYTRIP", ctx)).toContain("makemytrip.com");
    expect(buildFlightSearchUrl("CLEARTRIP", ctx)).toContain("cleartrip.com");
    expect(buildFlightSearchUrl("GOIBIBO", ctx)).toContain("goibibo.com");
    expect(buildFlightSearchUrl("YATRA", ctx)).toContain("yatra.com");
    expect(platformHomeUrl("MAKEMYTRIP")).toContain("makemytrip.com");
    expect(platformHomeUrl("CLEARTRIP")).toContain("cleartrip.com");
    expect(platformHomeUrl("GOIBIBO")).toContain("goibibo.com");
    expect(platformHomeUrl("YATRA")).toContain("yatra.com");
  });
});
