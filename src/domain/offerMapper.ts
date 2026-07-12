import type {
  OfferViewModel,
  PaymentMethod,
  DiscountType,
  PlatformId,
  BookingChannel,
  EvidenceStatus,
  PublishStatus,
} from "@/types/offer";
import banks from "@/data/mock/banks.json";

interface RawOffer {
  offer_id: string;
  bank_id: string | null;
  card_name: string | null;
  platform?: string;
  platform_id?: string;
  platform_name?: string;
  category: string;
  payment_method: string;
  discount_type: string;
  discount_value: number;
  max_discount: number;
  min_transaction: number;
  coupon_code: string | null;
  valid_from: string;
  valid_to: string;
  channels?: string;
  booking_channel?: string;
  eligibility_notes: string;
  terms_url: string | null;
  source_url?: string | null;
  priority_score: number;
  login_required: boolean;
  source_type: string;
  verification_status: string;
  evidence_status?: string;
  publish_status?: string;
  is_active?: boolean;
  usage_limit?: string | null;
  new_user_only?: boolean;
  [k: string]: unknown;
}

const BANK_NAMES: Record<string, string> = Object.fromEntries(
  (banks as Array<{ id: string; name: string }>).map((b) => [b.id, b.name])
);

const PLATFORM_ID_MAP: Record<string, PlatformId> = {
  MakeMyTrip: "MAKEMYTRIP",
  Cleartrip: "CLEARTRIP",
  MAKEMYTRIP: "MAKEMYTRIP",
  CLEARTRIP: "CLEARTRIP",
};
const PLATFORM_NAME_MAP: Record<string, string> = {
  MAKEMYTRIP: "MakeMyTrip",
  CLEARTRIP: "Cleartrip",
};

const CHANNEL_MAP: Record<string, BookingChannel> = {
  web: "WEB",
  app: "APP",
  "web+app": "WEB_AND_APP",
  WEB: "WEB",
  APP: "APP",
  WEB_AND_APP: "WEB_AND_APP",
};

export function mapRawOffer(raw: RawOffer): OfferViewModel {
  const notes = [raw.eligibility_notes].filter(Boolean) as string[];
  if (raw.channels) notes.push(`Channels: ${raw.channels}`);

  const platformName = raw.platform_name ?? raw.platform ?? "";
  const platformId = (raw.platform_id
    ? (raw.platform_id.toUpperCase() as PlatformId)
    : PLATFORM_ID_MAP[platformName]) as PlatformId;

  const bookingChannel =
    (raw.booking_channel && CHANNEL_MAP[raw.booking_channel]) ||
    (raw.channels && CHANNEL_MAP[raw.channels]) ||
    "WEB_AND_APP";

  const bankId = raw.bank_id;
  const bankName = bankId ? BANK_NAMES[bankId] ?? bankId : null;
  const label = bankName ? `${bankName} Offer` : "Default Offer";

  return {
    id: raw.offer_id,
    platformId,
    platformName: PLATFORM_NAME_MAP[platformId] ?? platformName,
    platform: platformName,
    title: label,
    label,
    bankId,
    bankName,
    bank: bankId,
    bankDisplay: bankName,
    cardName: raw.card_name ?? null,
    paymentMethod: (raw.payment_method as PaymentMethod) ?? "NO_CARD",
    category: "FLIGHT_DOMESTIC",
    bookingChannel,
    discountType: (raw.discount_type as DiscountType) ?? "FLAT",
    discountValue: raw.discount_value,
    maxDiscount: raw.max_discount || null,
    minTransaction: raw.min_transaction || null,
    savings: raw.discount_type === "FLAT" ? raw.discount_value : raw.max_discount,
    couponCode: raw.coupon_code ?? null,
    validFrom: raw.valid_from,
    validTo: raw.valid_to,
    usageLimit: raw.usage_limit ?? null,
    newUserOnly: raw.new_user_only ?? false,
    loginRequired: !!raw.login_required,
    eligibilityNotes: notes,
    termsUrl: raw.terms_url ?? null,
    sourceUrl: raw.source_url ?? raw.terms_url ?? "https://example.com/",
    bookingUrl: null,
    platformUrl: null,
    sourceType: raw.source_type ?? "demo_excel",
    evidenceStatus: (raw.evidence_status as EvidenceStatus) ?? "UNVERIFIED",
    publishStatus: (raw.publish_status as PublishStatus) ?? "READY",
    isActive: raw.is_active ?? true,
    verificationStatus: (raw.verification_status as OfferViewModel["verificationStatus"]) ?? "unverified",
    lastVerifiedAt: null,
    priorityScore: raw.priority_score ?? 0,
    extra: {},
  };
}
