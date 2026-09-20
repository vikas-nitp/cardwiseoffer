import type { FeatureFlags } from "@/contexts/FeatureFlagContext";

export function resolveFeatureCapabilities(flags: FeatureFlags) {
  return {
    phase2UserFeatures: flags.phase2UserFeaturesEnabled,
    publicAllOffers: flags.publicAllOffersEnabled,
    couponCode: flags.couponCodeEnabled,
    analytics: flags.analyticsEnabled,
    bookingAmountComparison: flags.bookingAmountComparisonEnabled,
    visitorCount: flags.visitorCountEnabled,
    auth: flags.authEnabled,
    howItWorks: flags.howItWorksEnabled,
    about: flags.aboutEnabled,
    contact: flags.contactEnabled,
    privacyPolicy: flags.privacyPolicyEnabled,
    termsOfService: flags.termsOfServiceEnabled,
  };
}
