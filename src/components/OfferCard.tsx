import { ExternalLink, Star, TrendingUp, Gift, CreditCard, Shield } from "lucide-react";
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
      className={`bg-card rounded-2xl border border-border/50 flex flex-col h-full border-t-4 ${accentBorder} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 card-shadow`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${accentClass}`}>
            <LabelIcon className="w-3 h-3" />
            {label}
          </span>
          {extraLabel && (
            <span className="text-[11px] font-bold text-accent bg-savings-soft px-2.5 py-1 rounded-full">
              {extraLabel}
            </span>
          )}
        </div>
      </div>

      {/* Savings amount */}
      <div className="px-5 pb-3">
        <p className="text-3xl font-display font-bold text-foreground tracking-tight leading-tight">
          ₹{discount.toLocaleString()}
        </p>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">estimated savings</p>
      </div>

      {/* Bank & Card info */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {bank && (
            <span className="text-xs font-bold bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">
              {bank}
            </span>
          )}
          {card && <span className="text-xs font-medium text-muted-foreground">{card}</span>}
          {paymentType && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {paymentType}
            </span>
          )}
          {!card && !bank && (
            <span className="text-xs font-medium text-muted-foreground">Available for all users</span>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="px-5 pb-4 flex-1">
        <div className="space-y-2">
          {conditions.map((cond) => (
            <div key={cond} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
              <span className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
              {cond}
            </div>
          ))}
        </div>
      </div>

      {/* Trust indicator */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
          <Shield className="w-3 h-3" />
          <span>Verified offer</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <a href={platformUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button
            className={`gap-2 w-full font-bold text-sm rounded-xl h-11 ${accentClass} hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg`}
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
