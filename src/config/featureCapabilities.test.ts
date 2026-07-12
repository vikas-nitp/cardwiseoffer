import { describe, expect, it } from "vitest";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import type { FeatureFlags } from "@/contexts/FeatureFlagContext";

const flags = (changes: Partial<FeatureFlags> = {}): FeatureFlags => ({
  authEnabled: false,
  offerLockingEnabled: false,
  allOffers: true,
  savedCards: false,
  dailyVisitorsEnabled: false,
  couponCodeEnabled: false,
  ...changes,
});

describe("feature capability resolution", () => {
  it("validates all supported flags in false state", () => {
    expect(resolveFeatureCapabilities(flags({ allOffers: false }))).toEqual({
      auth: false, offerLocking: false, allOffers: false,
      savedCards: false, dailyVisitors: false, couponCode: false,
    });
  });

  it("allows implemented all-offers and coupon flags to toggle true", () => {
    const result = resolveFeatureCapabilities(flags({ allOffers: true, couponCodeEnabled: true }));
    expect(result.allOffers).toBe(true);
    expect(result.couponCode).toBe(true);
  });

  it("does not expose fake auth or dependent unsupported capabilities when flags are true", () => {
    const result = resolveFeatureCapabilities(flags({
      authEnabled: true, offerLockingEnabled: true, savedCards: true, dailyVisitorsEnabled: true,
    }));
    expect(result.auth).toBe(false);
    expect(result.offerLocking).toBe(false);
    expect(result.savedCards).toBe(false);
    expect(result.dailyVisitors).toBe(false);
  });
});
