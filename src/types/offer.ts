/**
 * Canonical frontend offer model.
 * All UI components consume OfferViewModel — never raw JSON or backend shapes.
 */

export type PaymentMethod = "CREDIT" | "DEBIT" | "NO_CARD";
export type DiscountType = "FLAT" | "PERCENT";
export type SourceType = "demo_excel" | "api";

export interface OfferViewModel {
  id: string;
  label: string;
  bank: string | null;         // canonical bank id, e.g. "HDFC"; null = default/no-card
  bankDisplay: string | null;  // resolved display name
  cardName: string | null;
  platform: string;
  platformName: string;
  offerTitle: string;
  platformUrl: string | null;  // null = no route context; UI must disable CTA

  // Money
  originalPrice?: number;
  finalPrice?: number;
  amountEligible?: boolean | null;
  comparisonText?: string | null;
  savings: number;             // best-effort estimated savings amount

  paymentMethod: PaymentMethod;
  bookingChannel: string;
  newUserOnly: boolean;
  discountType: DiscountType;
  discountValue: number;       // rupees for FLAT, percent for PERCENT
  maxDiscount?: number;
  minTransaction?: number;

  couponCode?: string | null;
  validFrom: string;           // ISO yyyy-MM-dd
  expiryDate: string;          // ISO yyyy-MM-dd

  eligibilityNotes: string[];
  category: string;

  sourceType: SourceType;
  isActive: boolean;
  priorityScore: number;
  lastUpdatedAt?: string;
}

// Legacy tile shape kept during refactor — mirrors OfferViewModel fields the OfferCard reads.
export interface OfferTileLike extends OfferViewModel {
  labelIcon?: string;
  accentClass?: string;
  accentBorder?: string;
  extraLabel?: string;
}
