import { Info } from "lucide-react";

/**
 * Product-standard disclaimer shown at the top of every page.
 * Replaces earlier "Demo mode" wording so we don't advertise unfinished-product framing
 * to end users while still being explicit about verification responsibility.
 */
const DemoModeBanner = () => (
  <div
    role="note"
    aria-label="Offer verification notice"
    className="w-full bg-muted/40 border-b border-border/40 text-muted-foreground"
  >
    <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 text-[12px] leading-snug">
      <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>
        Offer details may change. Please verify eligibility and terms on the booking platform
        before payment.
      </span>
    </div>
  </div>
);

export default DemoModeBanner;
