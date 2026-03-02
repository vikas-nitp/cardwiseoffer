import { ShieldCheck, RefreshCw, Scale, Users } from "lucide-react";
import { useVisitorCount } from "@/hooks/useApi";

const TrustIndicators = () => {
  const { data } = useVisitorCount();
  const visitorCount = data?.count ?? 0;

  const indicators = [
    { icon: ShieldCheck, label: "No booking bias" },
    { icon: RefreshCw, label: "Updated daily" },
    { icon: Scale, label: "Independent comparison" },
    ...(visitorCount > 0 ? [{ icon: Users, label: `${visitorCount.toLocaleString()} visitors today` }] : []),
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-6 w-full max-w-5xl mx-auto px-4 relative z-0">
      {indicators.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50 text-[11px] md:text-xs font-medium whitespace-nowrap"
        >
          <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
