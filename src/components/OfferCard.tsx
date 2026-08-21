import { ExternalLink, Star, TrendingUp, Gift, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfferViewModel } from "@/types/offer";
import { validityLabel, isOfferExpired, isOfferUpcoming } from "@/domain/offerValidity";
import { savingsLabel } from "@/domain/offerCalculation";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";

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
  const { flags } = useFeatureFlags();
  const capabilities = resolveFeatureCapabilities(flags);
  const v = VARIANTS[variant];
  const LabelIcon = v.icon;

  const expired = isOfferExpired(offer);
  const upcoming = isOfferUpcoming(offer);
  const validity = validityLabel(offer);

  const canBook = !!offer.platformUrl && !expired && !upcoming;
  const isNoCard = offer.paymentMethod === "NO_CARD" || offer.bank === null;
  const badgeLabel = label ?? offer.label;
  const badgeAlreadyNamesBank = Boolean(
    offer.bankDisplay && badgeLabel.toLowerCase().includes(offer.bankDisplay.toLowerCase())
  );

  const cardAriaLabel = isNoCard
    ? `Default offer on ${offer.platformName}: ${savingsLabel(offer)}`
    : `${offer.bankDisplay ?? offer.bank} offer on ${offer.platformName}: ${savingsLabel(offer)}`;

  return (
    <div
      aria-label={cardAriaLabel}
      className={`bg-card rounded-2xl border border-border/40 flex flex-col h-full border-t-[3px] ${v.border} hover:card-shadow-xl hover:-translate-y-0.5 transition-all duration-300 card-shadow`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-[0.08em] ${v.chip}`}>
          <LabelIcon className="w-3 h-3" />
          {badgeLabel}
        </span>
        {extraLabel && (
          <span className="text-[10px] font-bold text-savings bg-savings-soft px-2 py-0.5 rounded-md">
            {extraLabel}
          </span>
        )}
      </div>

      {!isNoCard && offer.bankDisplay && !badgeAlreadyNamesBank && (
        <div className="px-5 pb-2">
          <p className="text-sm font-bold text-foreground">{offer.bankDisplay}</p>
        </div>
      )}

      {/* Discount appears once; a percentage is not presented as exact savings. */}
      <div className="px-5 pb-3">
        <p className="text-xl font-extrabold text-foreground tracking-tight">
          {savingsLabel(offer)}
        </p>
      </div>

      {!isNoCard && (
        <div className="px-5 pb-3">
          <span className="inline-flex text-[11px] font-bold text-foreground bg-muted/40 px-2 py-1 rounded">
            {PAYMENT_LABELS[offer.paymentMethod] ?? offer.paymentMethod}
          </span>
        </div>
      )}

      {/* Conditions */}
      <div className="px-5 pb-4 flex-1 space-y-1.5">
        {offer.minTransaction ? (
          <Condition text={`Minimum booking ₹${offer.minTransaction.toLocaleString()}`} />
        ) : null}
        {offer.discountType === "FLAT" && offer.maxDiscount && offer.maxDiscount !== offer.discountValue ? (
          <Condition text={`Maximum discount ₹${offer.maxDiscount.toLocaleString()}`} />
        ) : null}
        <Condition text={validity} tone={expired ? "danger" : upcoming ? "warn" : "muted"} />
        {capabilities.couponCode && offer.couponCode && <Condition text={`Coupon: ${offer.couponCode}`} />}
        <Condition text={offer.bookingChannel === "APP" ? "Mobile app" : offer.bookingChannel === "WEB" ? "Website" : "Website and mobile app"} strong />
        {offer.newUserOnly && <Condition text="New users only" strong />}
        {offer.eligibilityNotes
          .filter((note) =>
            !/no card|required|new users?|selected .* cards?/i.test(note)
          )
          .slice(0, 2)
          .map((note) => <Condition key={note} text={note} />)}
        {offer.amountEligible === false && <Condition text="Booking amount does not meet the minimum transaction" tone="warn" />}
        {offer.amountEligible && offer.savings > 0 && <Condition text={`Estimated saving: ₹${offer.savings.toLocaleString()}`} strong />}
        {offer.amountEligible && offer.finalPrice !== undefined && <Condition text={`Estimated payable: ₹${offer.finalPrice.toLocaleString()}`} strong />}
      </div>

      {offer.amountEligible !== null && offer.amountEligible !== undefined && (
        <p className="px-5 pb-3 text-[10px] leading-relaxed text-muted-foreground">Estimated values are based on advertised terms. Verify final price and eligibility on the booking platform.</p>
      )}

      {/* CTA */}
      <div className="px-5 pb-5 pt-1">
        {canBook && offer.platformUrl ? (
          <a href={offer.platformUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10 bg-accent text-accent-foreground hover:brightness-110 shadow-sm hover:shadow-md transition-all duration-200">
              Book on {offer.platformName}
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

const Condition = ({ text, tone = "muted", strong = false }: { text: string; tone?: "muted" | "warn" | "danger"; strong?: boolean }) => (
  <div className={`text-[11px] flex items-start gap-2 leading-relaxed ${
    tone === "danger" ? "text-destructive" : tone === "warn" ? "text-highlight" : strong ? "font-semibold text-foreground" : "text-muted-foreground"
  }`}>
    <span className="w-1 h-1 rounded-full bg-border mt-1.5 flex-shrink-0" />
    {text}
  </div>
);

export default OfferCard;
