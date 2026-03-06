import { ExternalLink, Star, TrendingUp, Gift, CreditCard, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ElementType> = {
  Star, TrendingUp, Gift, CreditCard,
};

interface OfferCardProps {
  id?: string | number;
  label: string;
  extraLabel?: string;
  labelIcon: string | React.ElementType;
  accentClass: string;
  accentBorder: string;
  platform: string;
  platformUrl: string;
  card: string | null;
  bank: string | null;
  discount: number;
  conditions: string[];
  index: number;
  paymentType?: string;
}

const OfferCard = ({
  label, extraLabel, labelIcon, accentClass, accentBorder,
  platform, platformUrl, card, bank, discount, conditions, paymentType,
}: OfferCardProps) => {
  const LabelIcon = typeof labelIcon === "string" ? (iconMap[labelIcon] ?? Star) : labelIcon;

  return (
    <div
      className={`bg-card rounded-2xl border border-border/40 flex flex-col h-full border-t-[3px] ${accentBorder} hover:card-shadow-xl hover:-translate-y-0.5 transition-all duration-300 card-shadow`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-[0.08em] ${accentClass}`}>
            <LabelIcon className="w-3 h-3" />
            {label}
          </span>
          {extraLabel && (
            <span className="text-[10px] font-bold text-accent bg-savings-soft px-2 py-0.5 rounded-md">
              {extraLabel}
            </span>
          )}
        </div>
      </div>

      {/* Savings amount */}
      <div className="px-5 pb-3">
        <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">
          ₹{discount.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-[0.08em]">estimated savings</p>
      </div>

      {/* Bank & Card info */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {bank && (
            <span className="text-[11px] font-semibold bg-muted/60 px-2 py-0.5 rounded-md text-foreground">
              {bank}
            </span>
          )}
          {card && <span className="text-[11px] text-muted-foreground">{card}</span>}
          {paymentType && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
              {paymentType}
            </span>
          )}
          {!card && !bank && (
            <span className="text-[11px] text-muted-foreground">Available for all users</span>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="px-5 pb-4 flex-1">
        <div className="space-y-1.5">
          {conditions.map((cond) => (
            <div key={cond} className="text-[11px] text-muted-foreground flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-border mt-1.5 flex-shrink-0" />
              {cond}
            </div>
          ))}
        </div>
      </div>

      {/* Trust indicator */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Verified
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated today
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-1">
        <a href={platformUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button
            className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
          >
            Book on {platform}
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default OfferCard;
