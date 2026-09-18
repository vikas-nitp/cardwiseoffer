/**
 * Controlled test fixtures for LocalOfferRepository tests.
 * These are kept separate from production data so tests don't break when real offers change.
 */

const BASE = {
  platform_id: "MAKEMYTRIP",
  platform_name: "MakeMyTrip",
  offer_title: "Test Offer",
  booking_url: null,
  card_name: null,
  card_specificity: null,
  category: "FLIGHT_DOMESTIC",
  booking_channel: "WEB_AND_APP",
  coupon_code: "TEST123",
  valid_from: "2026-01-01",
  expiry_date: "2028-12-31",
  new_user_only: false,
  eligibility_notes: [],
  updated_at: "2026-09-01",
  priority_score: 50,
  is_active: true,
  valid_days: null,
};

// Scenario: PERCENT CC offer with a meaningful cap
export const PERCENT_CC_OFFER = {
  ...BASE,
  offer_id: "TEST-CC-PERCENT",
  offer_title: "HDFC Credit Card 20% off",
  bank_id: "HDFC",
  bank_name: "HDFC Bank",
  payment_method: "CREDIT",
  discount_type: "PERCENT",
  discount_value: 20,
  max_discount: 1500,
  min_transaction: 5000,
};

// Scenario: FLAT DC offer
export const FLAT_DC_OFFER = {
  ...BASE,
  offer_id: "TEST-DC-FLAT",
  offer_title: "SBI Debit Card ₹500 off",
  bank_id: "SBI",
  bank_name: "State Bank of India",
  payment_method: "DEBIT",
  discount_type: "FLAT",
  discount_value: 500,
  max_discount: null,
  min_transaction: 3000,
};

// Scenario: Platform (NO_CARD) offer — passes through CC/DC filter
export const PLATFORM_OFFER = {
  ...BASE,
  offer_id: "TEST-PLATFORM",
  offer_title: "MakeMyTrip App Coupon",
  bank_id: null,
  bank_name: null,
  payment_method: "NO_CARD",
  booking_channel: "APP",
  discount_type: "PERCENT",
  discount_value: 10,
  max_discount: 800,
  min_transaction: 2000,
  coupon_code: "MMTNEW",
};

// Scenario: CC offer from same bank as DC (AXIS has both)
export const AXIS_CC_OFFER = {
  ...BASE,
  offer_id: "TEST-AXIS-CC",
  offer_title: "Axis Bank Credit Card 15% off",
  bank_id: "AXIS",
  bank_name: "Axis Bank",
  payment_method: "CREDIT",
  discount_type: "PERCENT",
  discount_value: 15,
  max_discount: 1200,
  min_transaction: 7000,
};

export const AXIS_DC_OFFER = {
  ...BASE,
  offer_id: "TEST-AXIS-DC",
  offer_title: "Axis Bank Debit Card 7% off",
  bank_id: "AXIS",
  bank_name: "Axis Bank",
  payment_method: "DEBIT",
  discount_type: "PERCENT",
  discount_value: 7,
  max_discount: 700,
  min_transaction: 3000,
};

// Scenario: expired offer — should be filtered out by isOfferEligible
export const EXPIRED_OFFER = {
  ...BASE,
  offer_id: "TEST-EXPIRED",
  offer_title: "Expired HDFC Offer",
  bank_id: "HDFC",
  bank_name: "HDFC Bank",
  payment_method: "CREDIT",
  discount_type: "FLAT",
  discount_value: 2000,
  max_discount: null,
  min_transaction: null,
  valid_from: "2025-01-01",
  expiry_date: "2025-12-31",
};

// ── Multi-platform fixtures (same bank, different platforms) ─────────────────
// Used to test that all platform variants for a selected bank are returned.

// HDFC CC on Goibibo — distinct platform from PERCENT_CC_OFFER (MakeMyTrip),
// so no bank+platform+paymentType clash.
export const HDFC_GIB_CC = {
  ...BASE,
  offer_id: "TEST-HDFC-GIB-CC",
  offer_title: "HDFC CC on Goibibo",
  bank_id: "HDFC",
  bank_name: "HDFC Bank",
  platform_id: "GOIBIBO",
  platform_name: "Goibibo",
  payment_method: "CREDIT",
  discount_type: "PERCENT",
  discount_value: 12,
  max_discount: 1500,
  min_transaction: 5000,
  priority_score: 80,
};

export const HDFC_CT_CC = {
  ...BASE,
  offer_id: "TEST-HDFC-CT-CC",
  offer_title: "HDFC CC on Cleartrip",
  bank_id: "HDFC",
  bank_name: "HDFC Bank",
  platform_id: "CLEARTRIP",
  platform_name: "Cleartrip",
  payment_method: "CREDIT",
  discount_type: "PERCENT",
  discount_value: 11,
  max_discount: 1300,
  min_transaction: 5000,
  priority_score: 75,
};

export const HDFC_IXIGO_CC = {
  ...BASE,
  offer_id: "TEST-HDFC-IXIGO-CC",
  offer_title: "HDFC CC on ixigo",
  bank_id: "HDFC",
  bank_name: "HDFC Bank",
  platform_id: "IXIGO",
  platform_name: "ixigo",
  payment_method: "CREDIT",
  discount_type: "PERCENT",
  discount_value: 10,
  max_discount: 1100,
  min_transaction: 5000,
  priority_score: 70,
};

// Lower-savings HDFC CC on same platform as HDFC_GIB_CC (Goibibo).
// Ranking must dedupe this out — only the ₹1,500 offer from Goibibo survives.
export const HDFC_GIB_CC_LOWER = {
  ...BASE,
  offer_id: "TEST-HDFC-GIB-CC-LOWER",
  offer_title: "HDFC CC on Goibibo (lower)",
  bank_id: "HDFC",
  bank_name: "HDFC Bank",
  platform_id: "GOIBIBO",
  platform_name: "Goibibo",
  payment_method: "CREDIT",
  discount_type: "FLAT",
  discount_value: 800,
  max_discount: 800,
  min_transaction: 3000,
  priority_score: 40,
};

// HDFC debit — only one platform, so label should NOT get a platform suffix.
export const HDFC_MMT_DC = {
  ...BASE,
  offer_id: "TEST-HDFC-MMT-DC",
  offer_title: "HDFC Debit on MakeMyTrip",
  bank_id: "HDFC",
  bank_name: "HDFC Bank",
  platform_id: "MAKEMYTRIP",
  platform_name: "MakeMyTrip",
  payment_method: "DEBIT",
  discount_type: "PERCENT",
  discount_value: 8,
  max_discount: 700,
  min_transaction: 3000,
  priority_score: 60,
};

// Outside-bank offer with higher savings → triggers "Better Alternative" label.
// Uses Cleartrip to avoid clashing with MON_ONLY_CC_OFFER (ICICI on MakeMyTrip).
export const ICICI_CT_CC_HIGH = {
  ...BASE,
  offer_id: "TEST-ICICI-CT-CC-HIGH",
  offer_title: "ICICI CC on Cleartrip (high savings)",
  bank_id: "ICICI",
  bank_name: "ICICI Bank",
  platform_id: "CLEARTRIP",
  platform_name: "Cleartrip",
  payment_method: "CREDIT",
  discount_type: "FLAT",
  discount_value: 2500,
  max_discount: 2500,
  min_transaction: 8000,
  priority_score: 95,
};

// Scenario: Monday-only offer (valid_days)
export const MON_ONLY_CC_OFFER = {
  ...BASE,
  offer_id: "TEST-MON-ONLY",
  offer_title: "ICICI Monday Special",
  bank_id: "ICICI",
  bank_name: "ICICI Bank",
  payment_method: "CREDIT",
  discount_type: "PERCENT",
  discount_value: 12,
  max_discount: 900,
  min_transaction: 4000,
  valid_days: [1], // 1 = Monday
};
