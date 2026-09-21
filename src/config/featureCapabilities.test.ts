import { describe, expect, it } from "vitest";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import type { FeatureFlags } from "@/contexts/FeatureFlagContext";

const flags = (value: boolean): FeatureFlags => ({
  phase2UserFeaturesEnabled: value,
  publicAllOffersEnabled: value,
  couponCodeEnabled: value,
  analyticsEnabled: value,
  bookingAmountComparisonEnabled: value,
  visitorCountEnabled: value,
  authEnabled: value,
  aboutEnabled: value,
  contactEnabled: value,
  homeEntranceAnimationEnabled: value,
  howItWorksEnabled: value,
  privacyPolicyEnabled: value,
  splashScreenEnabled: value,
  termsOfServiceEnabled: value,
  subscriptionsEnabled: value,
  userCardsEnabled: value,
  notificationsEnabled: value,
});

const allFalse = {
  phase2UserFeatures: false, publicAllOffers: false, couponCode: false,
  analytics: false, bookingAmountComparison: false, visitorCount: false, auth: false,
  about: false, contact: false, homeEntranceAnimation: false, howItWorks: false,
  privacyPolicy: false, splashScreen: false, termsOfService: false,
  subscriptions: false, userCards: false, notifications: false,
};

const allTrue = {
  phase2UserFeatures: true, publicAllOffers: true, couponCode: true,
  analytics: true, bookingAmountComparison: true, visitorCount: true, auth: true,
  about: true, contact: true, homeEntranceAnimation: true, howItWorks: true,
  privacyPolicy: true, splashScreen: true, termsOfService: true,
  subscriptions: true, userCards: true, notifications: true,
};

describe("final feature configuration", () => {
  it("maps every false state", () => expect(resolveFeatureCapabilities(flags(false))).toEqual(allFalse));
  it("maps every true state", () => expect(resolveFeatureCapabilities(flags(true))).toEqual(allTrue));
});
