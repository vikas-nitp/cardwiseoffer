import { describe, it, expect } from "vitest";
import {
  isOfferActive,
  isOfferActiveOnDay,
  isOfferCatalogEligible,
  isOfferEligible,
  isOfferExpired,
  isOfferUpcoming,
  validityLabel,
} from "@/domain/offerValidity";

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

  it("requires active domestic offers within date range", () => {
    const base = {
      ...mk("2026-07-01", "2026-12-31"),
      isActive: true,
      category: "FLIGHT_DOMESTIC",
    };
    expect(isOfferEligible(base, now)).toBe(true);
    expect(isOfferEligible({ ...base, isActive: false }, now)).toBe(false);
    expect(isOfferEligible({ ...base, category: "HOTEL" }, now)).toBe(false);
  });
});

describe("isOfferActiveOnDay", () => {
  // 2026-07-13 is a Monday (getDay() === 1)
  const monday = new Date("2026-07-13T00:00:00");
  const tuesday = new Date("2026-07-14T00:00:00");
  const saturday = new Date("2026-07-18T00:00:00");

  it("null valid_days means active every day", () => {
    expect(isOfferActiveOnDay({ validDays: null }, monday)).toBe(true);
    expect(isOfferActiveOnDay({ validDays: null }, saturday)).toBe(true);
  });

  it("empty valid_days array means never active", () => {
    expect(isOfferActiveOnDay({ validDays: [] }, monday)).toBe(false);
    expect(isOfferActiveOnDay({ validDays: [] }, saturday)).toBe(false);
  });

  it("matches when day is in valid_days list", () => {
    expect(isOfferActiveOnDay({ validDays: [1] }, monday)).toBe(true);   // Monday = 1
    expect(isOfferActiveOnDay({ validDays: [5, 6] }, saturday)).toBe(true); // Saturday = 6
  });

  it("does not match when day is not in valid_days list", () => {
    expect(isOfferActiveOnDay({ validDays: [1] }, tuesday)).toBe(false);
    expect(isOfferActiveOnDay({ validDays: [5, 6] }, monday)).toBe(false);
  });
});

describe("isOfferEligible — evidenceStatus guard", () => {
  const base = {
    validFrom: "2026-07-01",
    expiryDate: "2026-12-31",
    isActive: true,
    category: "FLIGHT_DOMESTIC",
  };
  const now = new Date("2026-07-10T00:00:00Z");

  it("returns false for UNVERIFIED offers", () => {
    expect(isOfferEligible({ ...base, evidenceStatus: "UNVERIFIED" }, now)).toBe(false);
  });

  it("returns true for VERIFIED offers", () => {
    expect(isOfferEligible({ ...base, evidenceStatus: "VERIFIED" }, now)).toBe(true);
  });

  it("returns true when evidenceStatus is absent (undefined)", () => {
    expect(isOfferEligible({ ...base }, now)).toBe(true);
  });
});

describe("isOfferCatalogEligible — evidenceStatus guard", () => {
  const base = {
    validFrom: "2026-07-01",
    expiryDate: "2026-12-31",
    isActive: true,
    category: "FLIGHT_DOMESTIC",
  };
  const now = new Date("2026-07-10T00:00:00Z");

  it("returns false for UNVERIFIED offers", () => {
    expect(isOfferCatalogEligible({ ...base, evidenceStatus: "UNVERIFIED" }, now)).toBe(false);
  });

  it("returns true for VERIFIED offers", () => {
    expect(isOfferCatalogEligible({ ...base, evidenceStatus: "VERIFIED" }, now)).toBe(true);
  });

  it("ignores valid_days (all days are eligible in catalog view)", () => {
    expect(isOfferCatalogEligible({ ...base, evidenceStatus: "VERIFIED" }, now)).toBe(true);
  });
});
