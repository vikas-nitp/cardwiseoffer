import type { components } from "@/types/generated-api";
import type { OfferViewModel } from "@/types/offer";

export interface LocalRawOffer {
  offer_id: string;
  bank_id: string | null;
  card_name?: string | null;
  platform: string;
  category: string;
  payment_method: string;
  discount_type: string;
  discount_value: number;
  max_discount?: number;
  min_transaction?: number;
  coupon_code?: string | null;
  valid_from: string;
  valid_to: string;
  channels?: string;
  eligibility_notes?: string;
  priority_score?: number;
  source_type?: string;
  verification_status?: string;
}

export type ApiOffer =
  | components["schemas"]["Offer"]
  | components["schemas"]["SearchOffer"];

const verificationStatus = (
  status: ApiOffer["evidence_status"]
): OfferViewModel["verificationStatus"] => {
  if (status === "VERIFIED") return "verified";
  return "unverified";
};

export function mapApiOffer(raw: ApiOffer): OfferViewModel {
  const discountValue = raw.discount_value ?? 0;
  const maxDiscount = raw.max_discount ?? undefined;
  const estimatedSavings =
    "estimated_savings" in raw ? raw.estimated_savings ?? undefined : undefined;
  const displayKind = "display_kind" in raw ? raw.display_kind : undefined;
  const labelByKind: Record<string, string> = {
    SELECTED_CARD: "Your Card Offer",
    SECOND_SELECTED_CARD: "Second Selected Card",
    BETTER_ALTERNATIVE: "Better Alternative",
    DEFAULT_OFFER: "Default Offer (No Card)",
    GENERAL_BEST: "Best Offer",
  };

  return {
    id: raw.offer_id,
    label:
      (displayKind && labelByKind[displayKind]) ??
      (raw.bank_id ? `${raw.bank_name ?? raw.bank_id} Offer` : "Default Offer"),
    bank: raw.bank_id ?? null,
    bankDisplay: raw.bank_name ?? raw.bank_id ?? null,
    cardName: raw.card_name ?? null,
    platform: raw.platform_id,
    platformUrl: raw.booking_url ?? null,
    finalPrice:
      "estimated_final_amount" in raw
        ? raw.estimated_final_amount ?? undefined
        : undefined,
    savings:
      estimatedSavings ??
      (raw.discount_type === "FLAT" ? discountValue : maxDiscount ?? 0),
    paymentMethod: raw.payment_method,
    discountType: raw.discount_type,
    discountValue,
    maxDiscount,
    minTransaction: raw.min_transaction ?? undefined,
    couponCode: raw.coupon_code ?? null,
    validFrom: raw.valid_from,
    validTo: raw.valid_to,
    eligibilityNotes: raw.eligibility_notes ?? [],
    category: raw.category,
    sourceType: "api",
    verificationStatus: verificationStatus(raw.evidence_status),
    priorityScore: raw.priority_score,
    lastUpdatedAt: raw.last_verified_at ?? undefined,
  };
}

export function mapLocalOffer(raw: LocalRawOffer): OfferViewModel {
  const notes = raw.eligibility_notes ? [raw.eligibility_notes] : [];
  if (raw.channels) notes.push(`Channels: ${raw.channels}`);
  return {
    id: raw.offer_id,
    label: raw.bank_id ? `${raw.bank_id} Offer` : "Default Offer",
    bank: raw.bank_id,
    bankDisplay: raw.bank_id,
    cardName: raw.card_name ?? null,
    platform: raw.platform,
    platformUrl: null,
    savings: raw.discount_type === "FLAT" ? raw.discount_value : raw.max_discount ?? 0,
    paymentMethod: raw.payment_method as OfferViewModel["paymentMethod"],
    discountType: raw.discount_type as OfferViewModel["discountType"],
    discountValue: raw.discount_value,
    maxDiscount: raw.max_discount,
    minTransaction: raw.min_transaction,
    couponCode: raw.coupon_code,
    validFrom: raw.valid_from,
    validTo: raw.valid_to,
    eligibilityNotes: notes,
    category: raw.category,
    sourceType: "demo_excel",
    verificationStatus: "demo",
    priorityScore: raw.priority_score ?? 0,
  };
}
