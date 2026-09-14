import { ExternalLink, Star, TrendingUp, Gift, CreditCard, Smartphone, Globe, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfferViewModel } from "@/types/offer";
import { validityLabel, isOfferExpired, isOfferUpcoming } from "@/domain/offerValidity";
import { savingsLabel } from "@/domain/offerCalculation";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { cn } from "@/lib/utils";

type Variant = "primary" | "highlight" | "default" | "neutral";

interface OfferCardProps {
  offer: OfferViewModel;
  variant?: Variant;
  label?: string;
  extraLabel?: string;
  index?: number;
  compact?: boolean;
  userFareProvided?: boolean;
  searchDate?: Date;
}

const VARIANTS: Record<Variant, { chip: string; savings: string; topBorder: string; cta: string; icon: React.ElementType }> = {
  // Best Offer: gold top stripe, green savings number, gold filled CTA
  primary:   { chip: "bg-accent/10 text-accent border-accent/25",          savings: "text-savings",    topBorder: "border-t-accent",    cta: "gold",    icon: Star },
  // Better Alternative: amber/highlight stripe, amber savings, amber outline CTA
  highlight: { chip: "bg-highlight/10 text-highlight border-highlight/25", savings: "text-savings",    topBorder: "border-t-highlight", cta: "amber",   icon: TrendingUp },
  // Default offer (no specific card): muted chip, still green savings, dim gold top stripe
  default:   { chip: "bg-muted/50 text-muted-foreground border-border/50", savings: "text-savings", topBorder: "border-t-accent/35", cta: "outline", icon: Gift },
  // Neutral/no-card: muted chip, green savings, faintest gold top stripe
  neutral:   { chip: "bg-muted/60 text-muted-foreground border-border/40", savings: "text-savings", topBorder: "border-t-accent/20", cta: "outline", icon: CreditCard },
};

const ChannelIcon = ({ channel }: { channel: string }) =>
  channel === "APP"
    ? <Smartphone className="w-3 h-3" strokeWidth={2.5} />
    : <Globe className="w-3 h-3" strokeWidth={2} />;

const channelLabel = (channel: string) =>
  channel === "APP" ? "App" : channel === "WEB" ? "Web" : "Web + App";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatValidDays(days: number[]): string | null {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 0 || sorted.length === 7) return null;
  if (sorted.join() === "0,6") return "Weekends only";
  if (sorted.join() === "1,2,3,4,5") return "Weekdays only";
  return sorted.map((d) => DAY_NAMES[d]).join(" · ") + " only";
}

// Notes that repeat information already visible on the card (bank name, card type, channel)
const REDUNDANT_NOTE_RE =
  /no card|required|new users?|selected .*cards?|partial evidence|unverified|draft|hidden|inactive|expired|app only|website only|valid on .*(credit|debit|bank).*card/i;

const OfferCard = ({ offer, variant = "neutral", label, extraLabel, compact = false, userFareProvided = false, searchDate }: OfferCardProps) => {
  const { flags } = useFeatureFlags();
  const capabilities = resolveFeatureCapabilities(flags);
  const v = VARIANTS[variant];
  const LabelIcon = v.icon;

  const expired = isOfferExpired(offer, searchDate);
  const upcoming = isOfferUpcoming(offer, searchDate);
  const validity = validityLabel(offer, searchDate);

  const canBook = !!offer.platformUrl && !expired && !upcoming;
  const isNoCard = offer.paymentMethod === "NO_CARD" || offer.bank === null;
  const badgeLabel = label ?? offer.label;
  const showCoupon = capabilities.couponCode && offer.couponCode && !/^(PARTIAL|DRAFT|TEST|UNKNOWN|N\/A)$/i.test(offer.couponCode);

  const filteredNotes = offer.eligibilityNotes.filter((note) => !REDUNDANT_NOTE_RE.test(note));
  const visibleNotes = filteredNotes.slice(0, 2);

  const cardAriaLabel = isNoCard
    ? `Default offer on ${offer.platformName}: ${savingsLabel(offer)}`
    : `${offer.bankDisplay ?? offer.bank} offer on ${offer.platformName}: ${savingsLabel(offer)}`;

  return (
    <div
      role="article"
      aria-label={cardAriaLabel}
      className={cn(
        "relative card-warm rounded-2xl border border-border/60 flex flex-col border-t-[3px]",
        v.topBorder,
        "card-shadow card-hover-glow"
      )}
    >
      {/* Shimmer overlay — self-contained with its own overflow:hidden so the card itself stays unclipped */}
      <div aria-hidden="true" className="card-shimmer-overlay" />
      {/* Header: label badge + channel tag */}
      <div className="px-4 pt-4 pb-0 flex items-center justify-between gap-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border min-w-0 overflow-hidden",
          v.chip
        )}>
          <LabelIcon className="w-3 h-3 shrink-0" />
          <span className="truncate">{badgeLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 border border-border/30 px-2 py-1 rounded-md shrink-0">
          {offer.bookingChannel === "WEB_AND_APP" ? (
            <><Globe className="w-3 h-3" strokeWidth={2} /> Web <Smartphone className="w-3 h-3" strokeWidth={2.5} /> App</>
          ) : (
            <><ChannelIcon channel={offer.bookingChannel} /> {channelLabel(offer.bookingChannel)}</>
          )}
        </span>
      </div>

      {/* Savings — the hero number */}
      <div className="px-4 pt-3 pb-0">
        <p className={cn("text-2xl font-black tracking-tight leading-none tabular-nums", v.savings)}>
          {userFareProvided && offer.amountEligible !== false && offer.savings > 0
            ? `Save ₹${offer.savings.toLocaleString()}`
            : savingsLabel(offer)}
        </p>
        {extraLabel && (
          <span className="inline-block mt-1.5 text-[10px] font-bold text-savings-soft-foreground bg-savings-soft px-2 py-0.5 rounded border border-savings/20">
            {extraLabel}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 mt-3 border-t border-border/30" />

      {/* Conditions */}
      <div className="px-4 py-3 space-y-1.5">
        {/* Card name — first condition row, dot-aligned with other conditions */}
        {!isNoCard && (offer.cardName || offer.bankDisplay) && (
          <div className="flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full bg-border/60 mt-[5px] flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] font-semibold text-foreground tracking-tight leading-relaxed">
                {offer.cardName ?? offer.bankDisplay}
              </p>
              {offer.paymentMethod === "DEBIT" && !/(debit)/i.test(offer.cardName ?? offer.bankDisplay ?? "") && (
                <span className="inline-flex text-[10px] font-semibold text-foreground bg-muted/50 border border-border/40 px-2 py-0.5 rounded-md">
                  Debit
                </span>
              )}
            </div>
          </div>
        )}
        {offer.minTransaction ? (
          <Condition text={`Min. ₹${offer.minTransaction.toLocaleString()}`} />
        ) : null}
        {offer.discountType === "FLAT" && offer.maxDiscount && offer.maxDiscount !== offer.discountValue ? (
          <Condition text={`Max discount ₹${offer.maxDiscount.toLocaleString()}`} />
        ) : null}
        <Condition text={validity} tone={expired ? "danger" : upcoming ? "warn" : "muted"} />
        {offer.newUserOnly && <Condition text="New users only" />}
        {offer.validDays && offer.validDays.length > 0 && offer.validDays.length < 7 && (() => {
          const label = formatValidDays(offer.validDays!);
          return label ? <Condition text={label} tone="warn" /> : null;
        })()}
        {visibleNotes.map((note) => <Condition key={note} text={note} />)}
        {userFareProvided && offer.amountEligible === false && <Condition text="Below minimum booking amount" tone="warn" />}
      </div>

      {/* CTA — coupon sits inside so it's always bottom-anchored on equal-height cards */}
      <div className="px-4 pb-4 pt-0 mt-auto">
        {showCoupon && (
          <div className="mb-3 flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-lg px-3 py-2">
            <Tag className="w-3 h-3 text-accent shrink-0" />
            <span className="text-[11px] font-bold text-accent tracking-wide min-w-0 truncate">{offer.couponCode}</span>
          </div>
        )}
        {canBook && offer.platformUrl ? (
          <>
            <a href={offer.platformUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className={cn(
                "gap-2 w-full font-semibold text-[13px] rounded-xl h-10 transition-all duration-200 shadow-sm hover:shadow-md",
                v.cta === "gold"
                  ? "bg-accent text-accent-foreground hover:brightness-110"
                  : v.cta === "amber"
                  ? "bg-transparent border border-accent/50 text-accent hover:bg-accent/10"
                  : "bg-transparent border border-accent/40 text-accent hover:bg-accent/10"
              )}>
                Continue to {offer.platformName}
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
            {!compact && (
              <p className="text-center text-[10px] text-muted-foreground/70 mt-1.5">
                Apply offer at checkout on {offer.platformName}
              </p>
            )}
          </>
        ) : (
          <Button
            disabled
            className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10"
            title={expired ? "Offer expired" : upcoming ? "Offer starts later" : "Choose travel details to book"}
          >
            {expired ? "Expired" : upcoming ? "Not yet active" : "Choose travel details"}
          </Button>
        )}
      </div>
    </div>
  );
};

const Condition = ({ text, tone = "muted", strong = false }: { text: string; tone?: "muted" | "warn" | "danger"; strong?: boolean }) => (
  <div className={cn(
    "text-xs flex items-start gap-1.5 leading-relaxed",
    tone === "danger" ? "text-destructive" : tone === "warn" ? "text-highlight" : strong ? "font-semibold text-foreground" : "text-muted-foreground"
  )}>
    <span className="w-1 h-1 rounded-full bg-border/60 mt-[5px] flex-shrink-0" />
    {text}
  </div>
);

export default OfferCard;
