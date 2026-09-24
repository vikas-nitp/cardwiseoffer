import { ExternalLink, Star, TrendingUp, Gift, CreditCard, Smartphone, Globe, Tag, Calendar, UserCheck, Clock, ArrowDownCircle, Info, Repeat2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfferViewModel } from "@/types/offer";
import { validityLabel, isOfferExpired, isOfferUpcoming } from "@/domain/offerValidity";
import { savingsLabel } from "@/domain/offerCalculation";
import { isAllowed } from "@/domain/platformUrlBuilder";
import { buildAffiliateUrl } from "@/domain/affiliateLinks";
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
  onExpand?: () => void;
}

const VARIANTS: Record<Variant, { chip: string; savings: string; topBorder: string; cta: string; icon: React.ElementType }> = {
  // Best Offer: blue top stripe, blue chip (trust/action), green savings number
  primary:   { chip: "bg-primary/10 text-primary border-primary/25",       savings: "text-savings",     topBorder: "border-t-primary",   cta: "filled",  icon: Star },
  // Better Alternative: amber/highlight stripe, green savings, blue soft CTA
  highlight: { chip: "bg-highlight/10 text-highlight border-highlight/25", savings: "text-savings",     topBorder: "border-t-highlight", cta: "soft", icon: TrendingUp },
  // General card offer: muted chip, muted-green savings, dim top stripe, muted CTA
  default:   { chip: "bg-muted/50 text-muted-foreground border-border/50", savings: "text-savings",     topBorder: "border-t-accent/35", cta: "muted", icon: Gift },
  // Platform Offer (no specific card): muted chip, dimmer savings, plain border, muted CTA
  neutral:   { chip: "bg-muted/60 text-muted-foreground border-border/40", savings: "text-savings/80",  topBorder: "border-t-border",    cta: "muted", icon: CreditCard },
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

// Eligibility notes that are garbage/redundant — filtered before display.
// Raw-scraped notes often contain page navigation, T&C blobs, or info already
// shown via structured fields (validity date, bank, card type, channel).
const GARBAGE_NOTE_RE =
  /customer\s+service|log\s*in\s*[/|]\s*sign\s*up|sign\s*in|my\s+account|recent\s+search|search\s+flights|about\s+the\s+offer|what\s+do\s+you\s+get|how\s+do\s+you\s+get|the\s+customer\s+will|customers?\s+will\s+get|to\s+avail\s+the\s+offer|adventure\s+holidays|deal\s+of\s+the\s+day|fly\s+&\s+save|no\s+card|partial\s+evidence|unverified|draft\s+offer|hidden|inactive|app\s+only|website\s+only|expires\s+\d+|expires\s+on\b|valid\s+(mon|tue|wed|thu|fri|sat|sun)|valid\s+(?:for\s+bookings?\s+)?(?:till|until|through)\s+\d|valid\s+(?:for\s+bookings?)\s+till|carry-forward|not\s+seen\s+in\s+this\s+run|also\s+found\s+at:|^domestic\s+flights?$|^international\s+flights?$|great\s+offers?\s*&\s*amazing\s+deals|min(?:imum)?\.?\s+booking\s+(?:INR|Rs\.?|₹)|coupon\s+code\s*:|validity\s*:|(?:get\s+)?up\s+to\s+[₹]\s*[\d,]+\s+off\b|up\s+to\s+INR\s+[\d,]+\s+off\b|\d+\s+days?\s+left\b|use\s+code\s*[:\t]|^\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20\d{2}$|^about\s+the\b|terms\s*&\s*conditions?\b|^t\s*&\s*c\b/i;

function isUsableNote(note: string): boolean {
  const trimmed = note.trim();
  if (trimmed.length < 13) return false;         // too short to be meaningful (truncated fragments)
  if (trimmed.length > 110) return false;         // T&C blobs are always too long
  if ((trimmed.match(/;/g) ?? []).length >= 2) return false; // Ixigo nav concatenation
  return !GARBAGE_NOTE_RE.test(trimmed);
}

const OfferCard = ({ offer, variant = "neutral", label, extraLabel, compact = false, userFareProvided = false, searchDate, onExpand }: OfferCardProps) => {
  const { flags } = useFeatureFlags();
  const capabilities = resolveFeatureCapabilities(flags);
  const v = VARIANTS[variant];
  const LabelIcon = v.icon;

  const expired = isOfferExpired(offer, searchDate);
  const upcoming = isOfferUpcoming(offer, searchDate);
  const validity = validityLabel(offer, searchDate);

  // Build the outbound URL: append affiliate param if configured, then validate
  // the final URL against the ALLOWED_HOSTS allowlist before exposing it as an href.
  const ctaHref = offer.platformUrl ? buildAffiliateUrl(offer.platformUrl, offer.platform) : null;
  const canBook = !!ctaHref && isAllowed(ctaHref) && !expired && !upcoming;
  const isNoCard = offer.paymentMethod === "NO_CARD" || offer.bank === null;
  const badgeLabel = label ?? offer.label;
  const showCoupon = capabilities.couponCode && offer.couponCode && !/^(PARTIAL|DRAFT|TEST|UNKNOWN|N\/A)$/i.test(offer.couponCode);

  const displayCardName = (() => {
    if (!offer.cardName) return offer.bankDisplay ?? null;
    const bank = (offer.bankDisplay ?? offer.bank ?? "").toLowerCase();
    const name = offer.cardName.toLowerCase();
    if (bank && name.startsWith(bank)) {
      const stripped = offer.cardName.slice(bank.length).replace(/^\s+/, "");
      // If remainder starts with "Bank", bankDisplay is a short prefix of the full bank name
      // (e.g. "Federal" from "Federal Bank Credit Card") — keep the full name.
      if (stripped && /^bank\b/i.test(stripped)) return offer.cardName;
      // If remainder is a bare generic type ("Credit Card", "Debit Card"), fall through to the
      // mid-name strip so "ICICI Bank Credit Card" → "ICICI Credit Card", not just "Credit Card".
      if (stripped && !/^(credit\s+card|debit\s+card|card)$/i.test(stripped.trim())) return stripped;
    }
    // Remove " Bank" from mid-name to shorten: "HDFC Bank Credit Card" → "HDFC Credit Card"
    // Don't touch names where "Bank" starts the name: "Bank of Baroda Credit Card" stays as-is
    if (!/^bank\b/i.test(offer.cardName)) {
      const shortened = offer.cardName.replace(/\s+Bank\b/gi, "").replace(/\s+/g, " ").trim();
      if (shortened && shortened !== offer.cardName) return shortened;
    }
    return offer.cardName;
  })();

  const isNoCostEmi = /no[\s-]*cost[\s-]*emi|interest[\s-]*free/i.test(offer.offerTitle);
  const hasEmi = !!(offer.couponCode && /EMI/i.test(offer.couponCode)) || /\bemi\b/i.test(offer.offerTitle);
  const emiLabel = hasEmi ? (isNoCostEmi ? "No Cost EMI" : "EMI") : null;
  const visibleNotes = [...new Set(offer.eligibilityNotes.filter(isUsableNote))].slice(0, 2);

  const cardAriaLabel = isNoCard
    ? `Platform Offer on ${offer.platformName}: ${savingsLabel(offer)}`
    : `${offer.bankDisplay ?? offer.bank} offer on ${offer.platformName}: ${savingsLabel(offer)}`;

  return (
    <div
      role="article"
      aria-label={cardAriaLabel}
      onClick={onExpand}
      className={cn(
        "relative card-warm rounded-2xl border border-border/60 flex flex-col border-t-[3px]",
        v.topBorder,
        "card-shadow card-hover-glow",
        onExpand && "cursor-pointer select-none focus:outline-none"
      )}
    >
      {/* Shimmer overlay — self-contained with its own overflow:hidden so the card itself stays unclipped */}
      {/* Header: label badge + channel tag */}
      <div className="px-4 pt-4 pb-0 flex items-center justify-between gap-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border min-w-0 overflow-hidden",
          v.chip
        )}>
          <LabelIcon className="w-3 h-3 shrink-0" />
          <span className="truncate">{badgeLabel}</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 border border-border/30 px-2 py-1 rounded-md">
            {offer.bookingChannel === "WEB_AND_APP" ? (
              <><Globe className="w-3 h-3" strokeWidth={2} /> Web <Smartphone className="w-3 h-3" strokeWidth={2.5} /> App</>
            ) : (
              <><ChannelIcon channel={offer.bookingChannel} /> {channelLabel(offer.bookingChannel)}</>
            )}
          </span>
        </div>
      </div>

      {/* Savings — the hero number */}
      <div className="px-4 pt-4 pb-2">
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
      <div className="px-4 py-3 space-y-1.5 flex-1">
        {/* Card name — first condition row */}
        {!isNoCard && (offer.cardName || offer.bankDisplay) && (
          <div className="flex items-start gap-1.5">
            <CreditCard className="w-3 h-3 text-muted-foreground/50 mt-[2px] flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] font-semibold text-foreground tracking-tight leading-relaxed">
                {displayCardName}
              </p>
              {offer.paymentMethod === "DEBIT" && !/(debit)/i.test(displayCardName ?? "") && (
                <span className="inline-flex text-[10px] font-semibold text-foreground bg-muted/50 border border-border/40 px-2 py-0.5 rounded-md">
                  Debit
                </span>
              )}
            </div>
          </div>
        )}
        {offer.minTransaction ? (
          <Condition icon={ArrowDownCircle} text={`Min. ₹${offer.minTransaction.toLocaleString()}`} />
        ) : null}
        {offer.discountType === "FLAT" && offer.maxDiscount && offer.maxDiscount !== offer.discountValue ? (
          <Condition icon={Tag} text={`Max discount ₹${offer.maxDiscount.toLocaleString()}`} />
        ) : null}
        {emiLabel && <Condition icon={Repeat2} text={emiLabel} />}
        <Condition icon={Calendar} text={validity} tone={expired ? "danger" : upcoming ? "warn" : "muted"} />
        {offer.newUserOnly && <Condition icon={UserCheck} text="New users only" />}
        {offer.usageLimit && <Condition icon={Users} text={offer.usageLimit} />}
        {offer.validDays && offer.validDays.length > 0 && offer.validDays.length < 7 && (() => {
          const label = formatValidDays(offer.validDays!);
          return label ? <Condition icon={Clock} text={label} tone="warn" /> : null;
        })()}
        {visibleNotes.map((note) => <Condition key={note} icon={Info} text={note} />)}
        {userFareProvided && offer.amountEligible === false && <Condition icon={Info} text="Below minimum booking amount" tone="warn" />}
      </div>

      {/* CTA — coupon sits inside so it's always bottom-anchored on equal-height cards */}
      <div className="px-4 pb-4 pt-0 mt-auto">
        {showCoupon && (
          <div className="mb-3 flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-lg px-3 py-2">
            <Tag className="w-3 h-3 text-accent shrink-0" />
            <span className="text-[11px] font-bold text-accent tracking-wide min-w-0 truncate">{offer.couponCode}</span>
          </div>
        )}
        {canBook && ctaHref ? (
          <Button asChild className={cn(
            "gap-2 w-full font-semibold text-[13px] rounded-xl h-10 transition-all duration-200 shadow-sm hover:shadow-md",
            v.cta === "filled"
              ? "bg-primary text-primary-foreground hover:brightness-110"
              : v.cta === "soft"
              ? "bg-primary/90 text-primary-foreground hover:brightness-105"
              : v.cta === "muted"
              ? "bg-transparent border border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
              : "bg-transparent border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary/80"
          )}>
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Continue to {offer.platformName}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        ) : (
          <Button
            disabled
            className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10"
            title={expired ? "Offer expired" : upcoming ? "Offer starts later" : "Choose travel details to book"}
            onClick={(e) => e.stopPropagation()}
          >
            {expired ? "Expired" : upcoming ? "Not yet active" : "Choose travel details"}
          </Button>
        )}
        {/* Verify disclaimer */}
        {!compact && (
          <p className="text-center text-[10px] text-muted-foreground/80 mt-1.5 min-h-[14px]">
            {canBook ? `Verify offer on ${offer.platformName} before booking` : ""}
          </p>
        )}
        {/* Source attribution + last-updated — shown in all modes when data is present */}
        {(offer.sourceUrl || offer.lastUpdatedAt) && (
          <p className="text-center text-[10px] text-muted-foreground/80 mt-0.5 leading-snug">
            {offer.sourceUrl && (
              <a
                href={offer.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground underline underline-offset-2 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View original offer ↗
              </a>
            )}
            {offer.sourceUrl && offer.lastUpdatedAt && <span className="mx-1">·</span>}
            {offer.lastUpdatedAt && (
              <span>
                Updated{" "}
                {new Date(offer.lastUpdatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

const Condition = ({ text, tone = "muted", strong = false, icon: Icon }: { text: string; tone?: "muted" | "warn" | "danger"; strong?: boolean; icon?: React.ElementType }) => (
  <div className={cn(
    "text-xs flex items-start gap-1.5 leading-relaxed",
    tone === "danger" ? "text-destructive" : tone === "warn" ? "text-highlight" : strong ? "font-semibold text-foreground" : "text-muted-foreground"
  )}>
    {Icon
      ? <Icon className="w-3 h-3 mt-[1px] flex-shrink-0 opacity-60" />
      : <span className="w-1 h-1 rounded-full bg-border/60 mt-[5px] flex-shrink-0" />
    }
    {text}
  </div>
);

export default OfferCard;
