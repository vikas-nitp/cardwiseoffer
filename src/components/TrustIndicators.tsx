import { ShieldCheck, RefreshCw, Scale } from "lucide-react";

const indicators = [
  { icon: ShieldCheck, label: "No booking bias" },
  { icon: RefreshCw, label: "Updated daily" },
  { icon: Scale, label: "Independent comparison" },
];

const TrustIndicators = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mt-6 w-full max-w-5xl mx-auto px-4">
      {indicators.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50 text-xs md:text-sm font-medium"
        >
          <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
