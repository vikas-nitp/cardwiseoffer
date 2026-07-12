/**
 * Canonical frontend offer model.
 * All UI components consume OfferViewModel — never raw JSON or backend snake_case DTOs.
 */

export type PlatformId = "MAKEMYTRIP" | "CLEARTRIP";
export type PaymentMethod = "CREDIT" | "DEBIT" | "NO_CARD";
export type BookingChannel = "WEB" | "APP" | "WEB_AND_APP";
export type DiscountType = "FLAT" | "PERCENT";
export type EvidenceStatus = "VERIFIED" | "PARTIAL" | "UNVERIFIED";
export type PublishStatus = "READY" | "DRAFT" | "HIDDEN";
export type SourceType = "demo_excel" | "api" | string;
export type VerificationStatus = "demo" | "verified" | "expired" | "unverified" | "upcoming";
export type OfferCategory = "FLIGHT_DOMESTIC";

export interface OfferViewModel {
  id: string;

  // Platform
  platformId: PlatformId;
  platformName: string;
  /** @deprecated use platformName; retained for backward compatibility */
  platform: string;
  title: string;
  label: string;

  // Bank / card
  bankId: string | null;
  bankName: string | null;
  /** @deprecated use bankId */
  bank: string | null;
  /** @deprecated use bankName */
  bankDisplay: string | null;
  cardName: string | null;

  // Categorisation
  paymentMethod: PaymentMethod;
  category: OfferCategory;
  bookingChannel: BookingChannel;

  // Money
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minTransaction: number | null;
  originalPrice?: number;
  finalPrice?: number;
  savings: number;

  couponCode: string | null;

  // Validity
  validFrom: string;
  validTo: string;

  // Eligibility
  usageLimit: string | null;
  newUserOnly: boolean;
  loginRequired: boolean;
  eligibilityNotes: string[];

  // Links
  termsUrl: string | null;
  sourceUrl: string;
  bookingUrl: string | null;
  /** @deprecated use bookingUrl */
  platformUrl: string | null;

  // Provenance
  sourceType: SourceType;
  evidenceStatus: EvidenceStatus;
  publishStatus: PublishStatus;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
  priorityScore: number;

  extra: Record<string, unknown>;
}

// Search results may additionally include display hints from the backend
export interface OfferSearchViewModel extends OfferViewModel {
  displayKind?: string;
  displayRank?: number;
  savingsDelta?: number | null;
  estimatedSavings?: number | null;
  estimatedFinalAmount?: number | null;
  savingsLabel?: string | null;
}

// Legacy tile shape kept during refactor
export interface OfferTileLike extends OfferViewModel {
  labelIcon?: string;
  accentClass?: string;
  accentBorder?: string;
  extraLabel?: string;
}
