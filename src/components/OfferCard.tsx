import { ExternalLink, Star, TrendingUp, Gift, CreditCard, Shield, Info, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfferViewModel } from "@/types/offer";
import { validityLabel, isOfferExpired, isOfferUpcoming } from "@/domain/offerValidity";
import { savingsLabel, estimateSavings } from "@/domain/offerCalculation";

type Variant = "primary" | "highlight" | "default" | "neutral";

interface OfferCardProps {
  offer: OfferViewModel;
  variant?: Variant;
  label?: string;         // e.g. "Best Offer", "Better Alternative"
  extraLabel?: string;    // e.g. "Save ₹600 more"
  index?: number;
}

const VARIANTS: Record<Variant, { chip: string; border: string; icon: React.ElementType }> = {
  primary:   { chip: "bg-primary text-primary-foreground",     border: "border-primary",   icon: Star },
  highlight: { chip: "bg-highlight text-highlight-foreground", border: "border-highlight", icon: TrendingUp },
  default:   { chip: "bg-accent text-accent-foreground",       border: "border-accent",    icon: Gift },
  neutral:   { chip: "bg-secondary text-secondary-foreground", border: "border-secondary", icon: CreditCard },
};

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT: "Credit Card",
  DEBIT: "Debit Card",
  NO_CARD: "No Card Required",
};

const OfferCard = ({ offer, variant = "neutral", label, extraLabel }: OfferCardProps) => {
  const v = VARIANTS[variant];
  const LabelIcon = v.icon;

  const expired = isOfferExpired(offer);
  const upcoming = isOfferUpcoming(offer);
  const validity = validityLabel(offer);
  const bookingUrl = offer.bookingUrl ?? offer.platformUrl;

  const savings = estimateSavings(offer);
  const canBook = !!bookingUrl && !expired && !upcoming;

  return (
    <div
      className={`bg-card rounded-2xl border border-border/40 flex flex-col h-full border-t-[3px] ${v.border} hover:card-shadow-xl hover:-translate-y-0.5 transition-all duration-300 card-shadow`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-[0.08em] ${v.chip}`}>
          <LabelIcon className="w-3 h-3" />
          {label ?? offer.label}
        </span>
        {extraLabel && (
          <span className="text-[10px] font-bold text-accent bg-savings-soft px-2 py-0.5 rounded-md">
            {extraLabel}
          </span>
        )}
      </div>

      {/* Savings */}
      <div className="px-5 pb-3">
        <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">
          {offer.discountType === "FLAT" || offer.maxDiscount
            ? `₹${savings.toLocaleString()}`
            : savingsLabel(offer)}
        </p>
        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-[0.08em]">
          {offer.discountType === "PERCENT" ? "up to savings" : "estimated savings"}
        </p>
        {offer.discountType === "PERCENT" && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{savingsLabel(offer)}</p>
        )}
      </div>

      {/* Bank / Card / Payment */}
      <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
        {offer.bankDisplay && (
          <span className="text-[11px] font-semibold bg-muted/60 px-2 py-0.5 rounded-md text-foreground">
            {offer.bankDisplay}
          </span>
        )}
        {offer.cardName && <span className="text-[11px] text-muted-foreground">{offer.cardName}</span>}
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
          {PAYMENT_LABELS[offer.paymentMethod] ?? offer.paymentMethod}
        </span>
      </div>

      {/* Conditions */}
      <div className="px-5 pb-4 flex-1 space-y-1.5">
        {offer.minTransaction ? (
          <Condition text={`Minimum booking ₹${offer.minTransaction.toLocaleString()}`} />
        ) : null}
        {offer.maxDiscount ? (
          <Condition text={`Maximum discount ₹${offer.maxDiscount.toLocaleString()}`} />
        ) : null}
        <Condition text={validity} tone={expired ? "danger" : upcoming ? "warn" : "muted"} />
        {offer.couponCode && (
          <Condition text={`Coupon: ${offer.couponCode}`} />
        )}
        {offer.eligibilityNotes.slice(0, 2).map((n) => (
          <Condition key={n} text={n} />
        ))}
      </div>

      {/* Evidence row */}
      <div className="px-5 pb-2 flex items-center gap-3 text-[10px] text-muted-foreground/70">
        {offer.evidenceStatus === "VERIFIED" ? (
          <span className="flex items-center gap-1 text-emerald-700">
            <BadgeCheck className="w-3 h-3" />
            Verified against platform
          </span>
        ) : offer.evidenceStatus === "PARTIAL" ? (
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Partially verified
          </span>
        ) : (
          <span className="flex items-center gap-1" title="Verify terms on the booking platform before payment">
            <Info className="w-3 h-3" />
            Verify terms before booking
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-1">
        {canBook && bookingUrl ? (
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
              Book on {offer.platformName ?? offer.platform}
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        ) : (
          <Button
            disabled
            className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10"
            title={expired ? "Offer expired" : upcoming ? "Offer starts later" : "Choose travel details to book"}
          >
            {expired ? "Offer expired" : upcoming ? "Not yet active" : "Choose travel details to book"}
          </Button>
        )}
      </div>
    </div>
  );
};

const Condition = ({ text, tone = "muted" }: { text: string; tone?: "muted" | "warn" | "danger" }) => (
  <div className={`text-[11px] flex items-start gap-2 leading-relaxed ${
    tone === "danger" ? "text-destructive" : tone === "warn" ? "text-amber-700" : "text-muted-foreground"
  }`}>
    <span className="w-1 h-1 rounded-full bg-border mt-1.5 flex-shrink-0" />
    {text}
  </div>
);

export default OfferCard;
