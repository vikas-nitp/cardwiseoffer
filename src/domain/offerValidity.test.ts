import { describe, it, expect } from "vitest";
import { isOfferActive, isOfferEligible, isOfferExpired, isOfferUpcoming, validityLabel } from "@/domain/offerValidity";

const mk = (from: string, to: string) => ({ validFrom: from, expiryDate: to });

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

  it("requires active, ready, verified domestic offers", () => {
    const base = {
      ...mk("2026-07-01", "2026-12-31"),
      isActive: true,
      publishStatus: "READY",
      evidenceStatus: "VERIFIED",
      category: "FLIGHT_DOMESTIC",
    };
    expect(isOfferEligible(base, now)).toBe(true);
    expect(isOfferEligible({ ...base, isActive: false }, now)).toBe(false);
    expect(isOfferEligible({ ...base, publishStatus: "DRAFT" }, now)).toBe(false);
    expect(isOfferEligible({ ...base, evidenceStatus: "UNVERIFIED" }, now)).toBe(false);
    expect(isOfferEligible({ ...base, category: "HOTEL" }, now)).toBe(false);
  });
});
