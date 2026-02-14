import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface OfferCardProps {
  label: string;
  extraLabel?: string;
  labelIcon: LucideIcon;
  accentClass: string;
  accentBorder: string;
  platform: string;
  platformUrl: string;
  card: string | null;
  bank: string | null;
  discount: number;
  conditions: string[];
  index: number;
}

const OfferCard = ({
  label,
  extraLabel,
  labelIcon: LabelIcon,
  accentClass,
  accentBorder,
  platform,
  platformUrl,
  card,
  bank,
  discount,
  conditions,
  index,
}: OfferCardProps) => {
  return (
    <div
      className={`bg-card rounded-2xl card-shadow flex flex-col h-full animate-fade-up border-t-4 ${accentBorder}`}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      {/* Label */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${accentClass}`}
          >
            <LabelIcon className="w-3.5 h-3.5" />
            {label}
          </span>
          {extraLabel && (
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {extraLabel}
            </span>
          )}
        </div>
      </div>

      {/* Discount + Bank */}
      <div className="px-5 pb-4">
        <p className="text-3xl font-display font-bold text-foreground">
          Upto ₹{discount.toLocaleString()}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {bank && (
            <span className="text-xs font-bold bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">
              {bank}
            </span>
          )}
          {card && (
            <span className="text-xs font-semibold text-muted-foreground">
              {card}
            </span>
          )}
          {!card && !bank && (
            <span className="text-xs font-semibold text-muted-foreground">
              Available for all users
            </span>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="px-5 pb-4 flex-1">
        <div className="space-y-2">
          {conditions.map((cond) => (
            <div
              key={cond}
              className="text-xs font-medium text-muted-foreground flex items-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />
              {cond}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <a href={platformUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button
            className={`gap-2 w-full font-bold text-sm rounded-xl h-11 ${accentClass} hover:opacity-90 transition-opacity`}
          >
            {platform}
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default OfferCard;
