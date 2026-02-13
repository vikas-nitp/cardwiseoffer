import { ShieldCheck, RefreshCw, Scale } from "lucide-react";

const indicators = [
  { icon: ShieldCheck, label: "No booking bias" },
  { icon: RefreshCw, label: "Updated daily" },
  { icon: Scale, label: "Independent offer comparison" },
];

const TrustIndicators = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
      {indicators.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
