import { Info } from "lucide-react";

const TrustDisclaimer = () => (
  <div className="w-full max-w-3xl mx-auto px-4 py-6">
    <div className="flex items-start gap-3 bg-muted/40 border border-border/60 rounded-xl px-5 py-4 text-muted-foreground">
      <Info className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/70" />
      <p className="text-xs leading-relaxed">
        We are not affiliated with any platform or bank. Offers may change without notice.
        Please verify details on the official website before booking.
      </p>
    </div>
  </div>
);

export default TrustDisclaimer;
