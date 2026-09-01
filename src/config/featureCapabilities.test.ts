import { describe, expect, it } from "vitest";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import type { FeatureFlags } from "@/contexts/FeatureFlagContext";

const flags = (value: boolean): FeatureFlags => ({
  phase2UserFeaturesEnabled: value,
  publicAllOffersEnabled: value,
  couponCodeEnabled: value,
  analyticsEnabled: value,
  bookingAmountComparisonEnabled: value,
});

describe("final feature configuration", () => {
  it("maps every false state", () => expect(resolveFeatureCapabilities(flags(false))).toEqual({ phase2UserFeatures: false, publicAllOffers: false, couponCode: false, analytics: false, bookingAmountComparison: false }));
  it("maps every true state", () => expect(resolveFeatureCapabilities(flags(true))).toEqual({ phase2UserFeatures: true, publicAllOffers: true, couponCode: true, analytics: true, bookingAmountComparison: true }));
});
