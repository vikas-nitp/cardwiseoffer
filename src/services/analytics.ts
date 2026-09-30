type AnalyticsEvent = "search" | "date_selection" | "offer_click" | "all_offers";

let enabled = false;
let cookieConsentRequired = false;

declare global {
  interface Window {
    __cookie_consent?: boolean;
  }
}

export const analytics = {
  configure(analyticsEnabled: boolean, cookieConsentEnabled: boolean) {
    enabled = analyticsEnabled;
    cookieConsentRequired = cookieConsentEnabled;
  },
  track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
    if (!enabled) return;
    // When consent is required, only an explicit "accepted" lets events through: an undecided
    // visitor (flag still undefined because the banner hasn't run yet) must not be tracked.
    if (cookieConsentRequired && window.__cookie_consent !== true) return;
    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", event, properties);
  },
};
