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
    // Only gate on consent when cookieConsentEnabled FF is on.
    if (cookieConsentRequired && window.__cookie_consent === false) return;
    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", event, properties);
  },
};
