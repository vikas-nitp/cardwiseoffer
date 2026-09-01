type AnalyticsEvent = "search" | "date_selection" | "offer_click" | "all_offers";

let enabled = false;

export const analytics = {
  configure(value: boolean) {
    enabled = value;
  },
  track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
    if (!enabled) return;
    const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", event, properties);
  },
};
