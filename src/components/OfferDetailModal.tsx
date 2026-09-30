import { ExternalLink, Tag, Calendar, Clock, CreditCard, Gift, Smartphone, Globe, Info, ArrowDownCircle, Repeat2, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { OfferViewModel } from "@/types/offer";
import { validityLabel, isOfferExpired, isOfferUpcoming } from "@/domain/offerValidity";
import { savingsLabel } from "@/domain/offerCalculation";
import { isAllowed } from "@/domain/platformUrlBuilder";
import { buildAffiliateUrl } from "@/domain/affiliateLinks";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatValidDays(days: number[]): string | null {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 0 || sorted.length === 7) return null;
  if (sorted.join() === "0,6") return "Weekends only";
  if (sorted.join() === "1,2,3,4,5") return "Weekdays only";
  return sorted.map((d) => DAY_NAMES[d]).join(" · ") + " only";
}

// Same filter used in OfferCard — keeps only meaningful eligibility notes
const GARBAGE_NOTE_RE =
  /customer\s+service|log\s*in\s*[/|]\s*sign\s*up|sign\s*in|my\s+account|recent\s+search|search\s+flights|about\s+the\s+offer|what\s+do\s+you\s+get|how\s+do\s+you\s+get|the\s+customer\s+will|customers?\s+will\s+get|to\s+avail\s+the\s+offer|adventure\s+holidays|deal\s+of\s+the\s+day|fly\s+&\s+save|no\s+card|partial\s+evidence|unverified|draft\s+offer|hidden|inactive|app\s+only|website\s+only|expires\s+\d+|expires\s+on\b|valid\s+(mon|tue|wed|thu|fri|sat|sun)|valid\s+(?:for\s+bookings?\s+)?(?:till|until|through)\s+\d|valid\s+(?:for\s+bookings?)\s+till|carry-forward|not\s+seen\s+in\s+this\s+run|also\s+found\s+at:|^domestic\s+flights?$|^international\s+flights?$|great\s+offers?\s*&\s*amazing\s+deals|min(?:imum)?\.?\s+booking\s+(?:INR|Rs\.?|₹)|coupon\s+code\s*:|validity\s*:|(?:get\s+)?up\s+to\s+[₹]\s*[\d,]+\s+off\b|up\s+to\s+INR\s+[\d,]+\s+off\b|\d+\s+days?\s+left\b|use\s+code\s*[:\t]|^\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20\d{2}$|^about\s+the\b|terms\s*&\s*conditions?\b|^t\s*&\s*c\b/i;

function isUsableNote(note: string): boolean {
  const trimmed = note.trim();
  if (trimmed.length < 13) return false;
  if (trimmed.length > 110) return false;
  if ((trimmed.match(/;/g) ?? []).length >= 2) return false;
  return !GARBAGE_NOTE_RE.test(trimmed);
}

interface OfferDetailModalProps {
  offer: OfferViewModel | null;
  onClose: () => void;
  userFareProvided?: boolean;
  searchDate?: Date;
}

// Condition row — mirrors OfferCard's Condition component but slightly larger for modal
const ModalCondition = ({ text, tone = "muted", icon: Icon }: { text: string; tone?: "muted" | "warn" | "danger"; icon?: React.ElementType }) => (
  <div className={cn(
    "text-xs flex items-start gap-1.5 leading-relaxed",
    tone === "danger" ? "text-destructive" : tone === "warn" ? "text-highlight" : "text-muted-foreground"
  )}>
    {Icon
      ? <Icon className="w-3 h-3 mt-[1px] flex-shrink-0 opacity-60" />
      : <span className="w-1 h-1 rounded-full bg-border/60 mt-[5px] flex-shrink-0" />
    }
    {text}
  </div>
);

const OfferDetailModal = ({ offer, onClose, userFareProvided = false, searchDate }: OfferDetailModalProps) => {
  const { flags } = useFeatureFlags();
  const capabilities = resolveFeatureCapabilities(flags);

  if (!offer) return null;

  const expired = isOfferExpired(offer, searchDate);
  const upcoming = isOfferUpcoming(offer, searchDate);
  const validity = validityLabel(offer, searchDate);

  const ctaHref = offer.platformUrl ? buildAffiliateUrl(offer.platformUrl, offer.platform) : null;
  const canBook = !!ctaHref && isAllowed(ctaHref) && !expired && !upcoming;

  const showCoupon = capabilities.couponCode && offer.couponCode && !/^(PARTIAL|DRAFT|TEST|UNKNOWN|N\/A)$/i.test(offer.couponCode);

  const allNotes = [...new Set(offer.eligibilityNotes.filter(isUsableNote))];
  const validDaysLabel = offer.validDays && offer.validDays.length > 0 && offer.validDays.length < 7
    ? formatValidDays(offer.validDays)
    : null;

  const savingsHeadline =
    userFareProvided && offer.amountEligible !== false && offer.savings > 0
      ? `Save ₹${offer.savings.toLocaleString()}`
      : savingsLabel(offer);

  // Same card-name and EMI derivation as OfferCard
  const isNoCard = offer.paymentMethod === "NO_CARD" || offer.bank === null;
  const displayCardName = (() => {
    if (!offer.cardName) return offer.bankDisplay ?? null;
    const bank = (offer.bankDisplay ?? offer.bank ?? "").toLowerCase();
    const name = offer.cardName.toLowerCase();
    if (bank && name.startsWith(bank)) {
      const stripped = offer.cardName.slice(bank.length).replace(/^\s+/, "");
      if (stripped && /^bank\b/i.test(stripped)) return offer.cardName;
      if (stripped && !/^(credit\s+card|debit\s+card|card)$/i.test(stripped.trim())) return stripped;
    }
    if (!/^bank\b/i.test(offer.cardName)) {
      const shortened = offer.cardName.replace(/\s+Bank\b/gi, "").replace(/\s+/g, " ").trim();
      if (shortened && shortened !== offer.cardName) return shortened;
    }
    return offer.cardName;
  })();
  const isNoCostEmi = /no[\s-]*cost[\s-]*emi|interest[\s-]*free/i.test(offer.offerTitle);
  const hasEmi = !!(offer.couponCode && /EMI/i.test(offer.couponCode)) || /\bemi\b/i.test(offer.offerTitle);
  const emiLabel = hasEmi ? (isNoCostEmi ? "No Cost EMI" : "EMI") : null;

  return (
    <Dialog open={offer !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-border/60 card-warm p-0"
        aria-describedby="offer-modal-description"
      >
        <DialogTitle className="sr-only">
          {savingsHeadline} — {offer.bankDisplay ?? ""} on {offer.platformName}
        </DialogTitle>
        <DialogDescription id="offer-modal-description" className="sr-only">
          Full offer details on {offer.platformName}
        </DialogDescription>

        {/* Header: badge chip + channel — mirrors card header; pr-12 leaves room for Dialog's close button */}
        <div className="px-4 pt-4 pb-0 flex items-center justify-between gap-2 pr-12">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border bg-accent/15 text-accent border-accent/30 min-w-0 overflow-hidden">
            {isNoCard ? <Gift className="w-3 h-3 shrink-0" /> : <CreditCard className="w-3 h-3 shrink-0" />}
            <span className="truncate">{offer.bankDisplay ?? offer.platformName}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 border border-border/30 px-2 py-1 rounded-md shrink-0">
            {offer.bookingChannel === "WEB_AND_APP" ? (
              <><Globe className="w-3 h-3" strokeWidth={2} /> Web <Smartphone className="w-3 h-3" strokeWidth={2.5} /> App</>
            ) : offer.bookingChannel === "APP" ? (
              <><Smartphone className="w-3 h-3" strokeWidth={2.5} /> App</>
            ) : (
              <><Globe className="w-3 h-3" strokeWidth={2} /> Web</>
            )}
          </span>
        </div>

        {/* Savings hero */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-2xl font-black tracking-tight leading-none tabular-nums text-savings">
            {savingsHeadline}
          </p>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-border/30" />

        {/* Conditions — exact same order and icons as OfferCard */}
        <div className="px-4 py-3 space-y-1.5">
          {/* Card name (channel moved to header) */}
          {!isNoCard && displayCardName && (
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 text-muted-foreground/50 shrink-0" />
              <span className="text-[13px] font-semibold text-foreground tracking-tight">
                {displayCardName}
                {offer.paymentMethod === "DEBIT" && !/(debit)/i.test(displayCardName ?? "") && (
                  <span className="ml-1.5 inline-flex text-[10px] font-semibold text-foreground bg-muted/50 border border-border/40 px-2 py-0.5 rounded-md">
                    Debit
                  </span>
                )}
              </span>
            </div>
          )}
          {offer.minTransaction ? (
            <ModalCondition icon={ArrowDownCircle} text={`Min. ₹${offer.minTransaction.toLocaleString()}`} />
          ) : null}
          {offer.discountType === "FLAT" && offer.maxDiscount && offer.maxDiscount !== offer.discountValue ? (
            <ModalCondition icon={Tag} text={`Max discount ₹${offer.maxDiscount.toLocaleString()}`} />
          ) : null}
          {emiLabel && <ModalCondition icon={Repeat2} text={emiLabel} />}
          <ModalCondition icon={Calendar} text={validity} tone={expired ? "danger" : upcoming ? "warn" : "muted"} />
          {offer.newUserOnly && <ModalCondition icon={UserCheck} text="New users only" />}
          {offer.usageLimit && <ModalCondition icon={Users} text={offer.usageLimit} />}
          {validDaysLabel && <ModalCondition icon={Clock} text={validDaysLabel} tone="warn" />}
          {allNotes.map((note) => <ModalCondition key={note} icon={Info} text={note} />)}
          {userFareProvided && offer.amountEligible === false && (
            <ModalCondition icon={Info} text="Below minimum booking amount — raise your fare to unlock this offer" tone="warn" />
          )}
        </div>

        {/* CTA — matches card CTA section */}
        <div className="px-4 pb-4 pt-0 space-y-0">
          {showCoupon && offer.couponCode && (
            <div className="mb-3 flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-lg px-3 py-2">
              <Tag className="w-3 h-3 text-accent shrink-0" />
              <span className="text-[11px] font-bold text-accent tracking-wide min-w-0 truncate">{offer.couponCode}</span>
            </div>
          )}
          {canBook && ctaHref ? (
            <Button asChild className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10 transition-all duration-200 shadow-sm hover:shadow-md bg-primary text-primary-foreground hover:brightness-110">
              <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                Continue to {offer.platformName}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          ) : (
            <Button
              disabled
              className="gap-2 w-full font-semibold text-[13px] rounded-xl h-10"
              title={expired ? "Offer expired" : upcoming ? "Offer not yet active" : "Choose travel details to book"}
            >
              {expired ? "Expired" : upcoming ? "Not yet active" : "Choose travel details"}
            </Button>
          )}
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Verify offer on {offer.platformName} before booking
          </p>
          {(offer.sourceUrl || offer.lastUpdatedAt) && (
            <p className="text-center text-[10px] text-muted-foreground/80 mt-0.5 leading-snug">
              {offer.sourceUrl && (
                <a
                  href={offer.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline underline-offset-2 transition-colors"
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
      </DialogContent>
    </Dialog>
  );
};

export default OfferDetailModal;
