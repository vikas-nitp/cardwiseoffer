import type { FeatureFlags } from "@/contexts/FeatureFlagContext";

export function resolveFeatureCapabilities(flags: FeatureFlags) {
  return {
    phase2UserFeatures: flags.phase2UserFeaturesEnabled,
    publicAllOffers: flags.publicAllOffersEnabled,
    couponCode: flags.couponCodeEnabled,
    analytics: flags.analyticsEnabled,
    bookingAmountComparison: flags.bookingAmountComparisonEnabled,
  };
}
