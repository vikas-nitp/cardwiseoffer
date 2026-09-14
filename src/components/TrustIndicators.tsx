import { ShieldCheck, RefreshCw, Scale } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useMeta } from "@/contexts/MetaContext";
import { TRUST_LABELS } from "@/constants";

const TrustIndicators = () => {
  const { meta } = useMeta();
  const indicators = [
    { icon: ShieldCheck, label: TRUST_LABELS.NO_BOOKING_BIAS },
    { icon: RefreshCw, label: `Offers last updated: ${format(parseISO(meta.dataset_last_updated_at), "dd MMM yyyy")}` },
    { icon: Scale, label: TRUST_LABELS.INDEPENDENT_COMPARISON },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-10 w-full max-w-5xl mx-auto px-4 relative z-0">
      {indicators.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-muted-foreground bg-card px-3.5 py-2 rounded-lg border border-border text-xs font-medium whitespace-nowrap hover:border-primary/30 transition-all duration-200"
        >
          <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
