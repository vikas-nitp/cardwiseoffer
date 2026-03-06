import { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, Scale, Users } from "lucide-react";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { log } from "@/lib/logger";
import { API_BASE_URL } from "@/constants";

interface DailyVisitorsResponse {
  date: string;
  visitors: number;
  enabled: boolean;
}

const TrustIndicators = () => {
  const { flags } = useFeatureFlags();
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    if (!flags.dailyVisitorsEnabled) {
      setVisitorCount(null);
      return;
    }

    const fetchVisitors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/stats/daily-visitors`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: DailyVisitorsResponse = await response.json();
        if (data.enabled) {
          setVisitorCount(data.visitors);
        }
      } catch (err) {
        log.warn("Failed to fetch daily visitors", err);
        setVisitorCount(null);
      }
    };

    fetchVisitors();
  }, [flags.dailyVisitorsEnabled]);

  const indicators = [
    { icon: ShieldCheck, label: "No booking bias" },
    { icon: RefreshCw, label: "Updated daily" },
    { icon: Scale, label: "Independent comparison" },
  ];

  if (flags.dailyVisitorsEnabled && visitorCount !== null && visitorCount > 0) {
    indicators.push({
      icon: Users,
      label: `${visitorCount.toLocaleString()} visitors today`,
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-10 w-full max-w-5xl mx-auto px-4 relative z-0">
      {indicators.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-muted-foreground bg-card/80 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-border/50 text-xs font-medium whitespace-nowrap hover:border-primary/20 transition-all duration-200"
        >
          <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustIndicators;
