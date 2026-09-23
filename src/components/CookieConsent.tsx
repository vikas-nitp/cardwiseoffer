import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cwo-cookie-consent";
type ConsentValue = "accepted" | "declined";

function readConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "declined") return v;
  } catch {
    // Private/blocked storage — treat as no consent recorded
  }
  return null;
}

function writeConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked — consent is in-memory for this session only
  }
}

/**
 * Applies consent choice to the global flag that analytics.ts checks.
 * Must be called before any analytics fires.
 */
function applyConsent(value: ConsentValue) {
  window.__cookie_consent = value === "accepted";
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      // Already decided — apply and hide
      applyConsent(existing);
      return;
    }
    // No prior decision — default to false (no consent) until user accepts
    window.__cookie_consent = false;
    setVisible(true);
  }, []);

  const handleAccept = () => {
    writeConsent("accepted");
    applyConsent("accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    writeConsent("declined");
    applyConsent("declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto w-full max-w-xl bg-card border border-border/60 rounded-2xl shadow-lg px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-[13px] text-foreground/80 leading-relaxed">
          We use cookies to analyse site usage and improve your experience.
          Your data is never sold.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="rounded-xl text-[12px] h-8 px-4 font-medium"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="rounded-xl text-[12px] h-8 px-4 font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
