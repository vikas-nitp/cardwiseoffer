import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analytics } from "@/services/analytics";

describe("analytics consent gating", () => {
  const gtag = vi.fn();

  beforeEach(() => {
    gtag.mockClear();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
  });
  afterEach(() => {
    delete window.__cookie_consent;
  });

  it("does not track an undecided visitor when consent is required", () => {
    analytics.configure(true, true);
    analytics.track("search");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("does not track after a decline", () => {
    analytics.configure(true, true);
    window.__cookie_consent = false;
    analytics.track("search");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("tracks after acceptance, and without consent when consent is not required", () => {
    analytics.configure(true, true);
    window.__cookie_consent = true;
    analytics.track("search");
    expect(gtag).toHaveBeenCalledTimes(1);
    analytics.configure(true, false);
    delete window.__cookie_consent;
    analytics.track("all_offers");
    expect(gtag).toHaveBeenCalledTimes(2);
  });
});
