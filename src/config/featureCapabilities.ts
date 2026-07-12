import type { FeatureFlags } from "@/contexts/FeatureFlagContext";

// Authentication, saved cards, locking, and visitor APIs have no production
// provider in this release. A flag cannot activate an unimplemented capability.
export const IMPLEMENTED_CAPABILITIES = {
  auth: false,
  offerLocking: false,
  savedCards: false,
  dailyVisitors: false,
} as const;

export function resolveFeatureCapabilities(flags: FeatureFlags) {
  const auth = flags.authEnabled && IMPLEMENTED_CAPABILITIES.auth;
  return {
    auth,
    offerLocking: auth && flags.offerLockingEnabled && IMPLEMENTED_CAPABILITIES.offerLocking,
    allOffers: flags.allOffers,
    savedCards: auth && flags.savedCards && IMPLEMENTED_CAPABILITIES.savedCards,
    dailyVisitors: flags.dailyVisitorsEnabled && IMPLEMENTED_CAPABILITIES.dailyVisitors,
    couponCode: flags.couponCodeEnabled,
  };
}
