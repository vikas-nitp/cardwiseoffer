import { describe, it, expect } from "vitest";
import { isOfferActive, isOfferExpired, isOfferUpcoming, validityLabel } from "@/domain/offerValidity";

const mk = (from: string, to: string) => ({ validFrom: from, validTo: to });

describe("offerValidity", () => {
  const now = new Date("2026-07-10T00:00:00Z");

  it("marks past offers as expired", () => {
    expect(isOfferExpired(mk("2026-03-01", "2026-03-31"), now)).toBe(true);
    expect(isOfferActive(mk("2026-03-01", "2026-03-31"), now)).toBe(false);
  });

  it("marks future offers as upcoming", () => {
    expect(isOfferUpcoming(mk("2026-08-01", "2026-08-31"), now)).toBe(true);
    expect(isOfferActive(mk("2026-08-01", "2026-08-31"), now)).toBe(false);
  });

  it("marks current offers as active", () => {
    expect(isOfferActive(mk("2026-07-01", "2026-12-31"), now)).toBe(true);
  });

  it("produces human validity labels", () => {
    expect(validityLabel(mk("2026-07-01", "2026-12-31"), now)).toMatch(/Valid until/);
    expect(validityLabel(mk("2026-03-01", "2026-03-31"), now)).toBe("Expired");
    expect(validityLabel(mk("2026-08-01", "2026-08-31"), now)).toMatch(/Starts on/);
  });
});
