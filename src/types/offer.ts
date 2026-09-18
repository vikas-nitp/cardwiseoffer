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
  cardSpecificity: "ALL" | "SPECIFIC" | null;  // null = not yet enriched by ingestion
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

  // 0=Sun … 6=Sat (JS getDay() convention). null/undefined = valid every day.
  validDays?: number[] | null;

  sourceType: SourceType;
  isActive: boolean;
  priorityScore: number;
  lastUpdatedAt?: string;
}

