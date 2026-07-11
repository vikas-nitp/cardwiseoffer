import type { OfferViewModel, PaymentMethod, DiscountType } from "@/types/offer";
import banks from "@/data/mock/banks.json";

interface RawOffer {
  offer_id: string;
  bank_id: string | null;
  card_name: string | null;
  platform: string;
  category: string;
  payment_method: string;
  discount_type: string;
  discount_value: number;
  max_discount: number;
  min_transaction: number;
  coupon_code: string | null;
  valid_from: string;
  valid_to: string;
  channels: string;
  eligibility_notes: string;
  terms_url: string | null;
  priority_score: number;
  login_required: boolean;
  source_type: string;
  verification_status: string;
}

const BANK_NAMES: Record<string, string> = Object.fromEntries(
  (banks as Array<{ id: string; name: string }>).map((b) => [b.id, b.name])
);

export function mapRawOffer(raw: RawOffer): OfferViewModel {
  const notes = [raw.eligibility_notes].filter(Boolean) as string[];
  if (raw.channels) notes.push(`Channels: ${raw.channels}`);
  return {
    id: raw.offer_id,
    label: raw.bank_id ? `${BANK_NAMES[raw.bank_id] ?? raw.bank_id} Offer` : "Default Offer",
    bank: raw.bank_id,
    bankDisplay: raw.bank_id ? BANK_NAMES[raw.bank_id] ?? raw.bank_id : null,
    cardName: raw.card_name,
    platform: raw.platform,
    platformUrl: null,
    savings: raw.discount_type === "FLAT" ? raw.discount_value : raw.max_discount,
    paymentMethod: (raw.payment_method as PaymentMethod) ?? "NO_CARD",
    discountType: (raw.discount_type as DiscountType) ?? "FLAT",
    discountValue: raw.discount_value,
    maxDiscount: raw.max_discount || undefined,
    minTransaction: raw.min_transaction || undefined,
    couponCode: raw.coupon_code,
    validFrom: raw.valid_from,
    validTo: raw.valid_to,
    eligibilityNotes: notes,
    category: raw.category,
    sourceType: (raw.source_type as OfferViewModel["sourceType"]) ?? "demo_excel",
    verificationStatus: (raw.verification_status as OfferViewModel["verificationStatus"]) ?? "demo",
    priorityScore: raw.priority_score ?? 0,
  };
}
