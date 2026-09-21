import { describe, it, expect } from "vitest";
import { buildFlightSearchUrl, platformHomeUrl, isAllowed } from "@/domain/platformUrlBuilder";

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

  it("IXIGO and YATRA platform home URLs are present and https", () => {
    expect(platformHomeUrl("IXIGO")).toBe("https://www.ixigo.com/");
    expect(platformHomeUrl("Ixigo")).toBe("https://www.ixigo.com/");
    expect(platformHomeUrl("YATRA")).toBe("https://www.yatra.com/");
    expect(platformHomeUrl("Yatra")).toBe("https://www.yatra.com/");
  });

  it("IXIGO and YATRA hosts are allow-listed", () => {
    expect(isAllowed("https://www.ixigo.com/flights")).toBe(true);
    expect(isAllowed("https://www.yatra.com/flights")).toBe(true);
  });

  it("SpiceJet, AirAsia, Vistara home URLs are present and https", () => {
    expect(platformHomeUrl("SpiceJet")).toBe("https://www.spicejet.com/");
    expect(platformHomeUrl("SPICEJET")).toBe("https://www.spicejet.com/");
    expect(platformHomeUrl("AirAsia")).toBe("https://www.airasia.com/en/in");
    expect(platformHomeUrl("AIRASIA")).toBe("https://www.airasia.com/en/in");
    expect(platformHomeUrl("Vistara")).toBe("https://www.airvistara.com/");
    expect(platformHomeUrl("VISTARA")).toBe("https://www.airvistara.com/");
  });

  it("SpiceJet, AirAsia, Vistara hosts are allow-listed", () => {
    expect(isAllowed("https://www.spicejet.com/book")).toBe(true);
    expect(isAllowed("https://www.airasia.com/en/in/flights")).toBe(true);
    expect(isAllowed("https://www.airvistara.com/flights")).toBe(true);
  });

  it("rejects http and unknown hosts", () => {
    expect(isAllowed("http://www.makemytrip.com/")).toBe(false);
    expect(isAllowed("https://evil.com/")).toBe(false);
  });
});
