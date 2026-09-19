#!/usr/bin/env node
/**
 * validate-offer-quality.mjs
 *
 * Checks offers.json for legal, business, and data-integrity violations.
 * Designed to catch issues before they reach production — run before every deploy.
 *
 * Exit codes:
 *   0 — no errors (warnings are OK)
 *   1 — one or more ERROR-level violations found
 *
 * Usage:
 *   node scripts/validate-offer-quality.mjs               # all findings
 *   node scripts/validate-offer-quality.mjs --errors-only # suppress warnings
 *   node scripts/validate-offer-quality.mjs --json        # machine-readable output
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OFFERS_PATH = resolve(__dir, "../src/data/generated/offers.json");

const ERRORS_ONLY = process.argv.includes("--errors-only");
const JSON_OUTPUT  = process.argv.includes("--json");

// ── ANSI colours (suppressed in JSON mode) ───────────────────────────────────
const R = JSON_OUTPUT ? "" : "\x1b[31m";
const Y = JSON_OUTPUT ? "" : "\x1b[33m";
const G = JSON_OUTPUT ? "" : "\x1b[32m";
const B = JSON_OUTPUT ? "" : "\x1b[34m";
const D = JSON_OUTPUT ? "" : "\x1b[2m";
const X = JSON_OUTPUT ? "" : "\x1b[0m";

const offers = JSON.parse(readFileSync(OFFERS_PATH, "utf8"));

// ── Result collector ─────────────────────────────────────────────────────────
const findings = [];

function err(offerId, rule, message) {
  findings.push({ severity: "ERROR", offerId, rule, message });
}
function warn(offerId, rule, message) {
  findings.push({ severity: "WARN", offerId, rule, message });
}

// ── Rule constants ───────────────────────────────────────────────────────────

// Coupon codes that look like synthetic placeholders
const SYNTHETIC_COUPON_RE = /^[A-Z]{2,6}(FLY|REF|NEW|COIN|WALLET|CASH|DIWALI|TEST|DEMO|DUMMY)$/i;

// Title words that imply a personal referral relationship
const REFERRAL_TITLE_RE = /\breferral\b/i;

// Valid JS day-of-week values
const VALID_DAYS = new Set([0, 1, 2, 3, 4, 5, 6]);

// ── Collect all offer IDs to detect duplicates ───────────────────────────────
const seenIds = new Map();
for (const offer of offers) {
  const id = offer.offer_id;
  if (seenIds.has(id)) {
    err(id, "DUPLICATE_ID", `offer_id "${id}" appears more than once`);
  } else {
    seenIds.set(id, true);
  }
}

// Collect coupon+platform pairs for duplicate detection
const seenCoupons = new Map();

// ── Per-offer checks ─────────────────────────────────────────────────────────
for (const o of offers) {
  const id = o.offer_id ?? "(no id)";
  const isDemo = o.extra?.data_source === "STATIC_DEMO";

  // ── Legal / compliance rules ────────────────────────────────────────────

  // L-1: UNVERIFIED offer served as active
  if (o.is_active && o.evidence_status === "UNVERIFIED") {
    err(id, "L1_UNVERIFIED_ACTIVE",
      `is_active=true but evidence_status=UNVERIFIED — serving unverified data to users`);
  }

  // L-2: STATIC_DEMO data mislabeled as VERIFIED
  if (isDemo && o.evidence_status === "VERIFIED") {
    err(id, "L2_DEMO_LABELED_VERIFIED",
      `data_source=STATIC_DEMO but evidence_status=VERIFIED — synthetic data must not carry VERIFIED status`);
  }

  // L-3: STATIC_DEMO data mislabeled as official source
  if (isDemo && o.source_type === "official") {
    err(id, "L3_DEMO_LABELED_OFFICIAL",
      `data_source=STATIC_DEMO but source_type=official — synthetic data must not claim an official source`);
  }

  // L-4: Referral wording in title without disclosure
  if (REFERRAL_TITLE_RE.test(o.offer_title ?? "")) {
    warn(id, "L4_REFERRAL_TITLE",
      `offer_title contains "referral" — implies personal referral relationship; rename unless this is a publicly posted promo code (ASCI guideline)`);
  }

  // L-5: UPCOMING offer marked active (shows on strip, misleads users)
  if (o.is_active && o.publish_status === "UPCOMING") {
    warn(id, "L5_UPCOMING_ACTIVE",
      `is_active=true but publish_status=UPCOMING — offer not yet live; consider is_active=false until confirmed`);
  }

  // ── Business / trust rules ──────────────────────────────────────────────

  // B-1: Synthetic-looking coupon code
  if (o.coupon_code && SYNTHETIC_COUPON_RE.test(o.coupon_code)) {
    warn(id, "B1_SYNTHETIC_COUPON",
      `coupon_code "${o.coupon_code}" matches synthetic placeholder pattern — verify this is a real public promo code`);
  }

  // B-2: Stale verification (> 90 days since last_verified_at)
  if (o.last_verified_at && o.evidence_status === "VERIFIED") {
    const verifiedMs = Date.now() - new Date(o.last_verified_at).getTime();
    const days = Math.floor(verifiedMs / 86_400_000);
    if (days > 90) {
      warn(id, "B2_STALE_VERIFICATION",
        `last_verified_at is ${days} days ago — re-verify before next deploy`);
    }
  }

  // B-3: Duplicate coupon code on same platform
  if (o.coupon_code && o.platform_id) {
    const key = `${o.platform_id}:${o.coupon_code}`;
    if (seenCoupons.has(key)) {
      warn(id, "B3_DUPLICATE_COUPON",
        `coupon_code "${o.coupon_code}" already used on ${o.platform_id} by ${seenCoupons.get(key)}`);
    } else {
      seenCoupons.set(key, id);
    }
  }

  // B-4: new_user_only=true but no note in eligibility_notes
  if (o.new_user_only) {
    const notes = (o.eligibility_notes ?? []).join(" ").toLowerCase();
    if (!notes.includes("new user")) {
      warn(id, "B4_NEW_USER_UNDISCLOSED",
        `new_user_only=true but eligibility_notes does not mention "New users" — add a note so card UI shows the restriction`);
    }
  }

  // B-5: Missing source_url on non-demo verified offers (no audit trail)
  if (!isDemo && o.evidence_status === "VERIFIED" && !o.source_url) {
    warn(id, "B5_NO_SOURCE_URL",
      `evidence_status=VERIFIED but source_url is missing — add source URL as audit trail for legal defence`);
  }

  // ── Data integrity rules ────────────────────────────────────────────────

  // I-1: PERCENT discount_value > 100
  if (o.discount_type === "PERCENT" && o.discount_value > 100) {
    err(id, "I1_PERCENT_OVER_100",
      `discount_type=PERCENT but discount_value=${o.discount_value} > 100%`);
  }

  // I-2: PERCENT discount_value <= 0
  if (o.discount_value != null && o.discount_value <= 0) {
    err(id, "I2_ZERO_DISCOUNT",
      `discount_value=${o.discount_value} — must be positive`);
  }

  // I-3: valid_from > expiry_date
  if (o.valid_from && o.expiry_date) {
    if (new Date(o.valid_from) > new Date(o.expiry_date)) {
      err(id, "I3_INVALID_DATE_RANGE",
        `valid_from (${o.valid_from}) is after expiry_date (${o.expiry_date})`);
    }
  }

  // I-4: invalid valid_days values
  if (Array.isArray(o.valid_days)) {
    const bad = o.valid_days.filter((d) => !VALID_DAYS.has(d));
    if (bad.length > 0) {
      err(id, "I4_INVALID_VALID_DAYS",
        `valid_days contains invalid day numbers: [${bad.join(", ")}] — must be 0 (Sun) through 6 (Sat)`);
    }
  }

  // I-5: min_transaction negative
  if (o.min_transaction != null && o.min_transaction < 0) {
    err(id, "I5_NEGATIVE_MIN_TRANSACTION",
      `min_transaction=${o.min_transaction} — cannot be negative`);
  }

  // I-6: No data_source tag in extra (untagged = ambiguous origin)
  if (!o.extra?.data_source) {
    warn(id, "I6_NO_DATA_SOURCE_TAG",
      `extra.data_source is missing — run scripts/tag-synthetic-data.mjs to tag existing data`);
  }
}

// ── Output ───────────────────────────────────────────────────────────────────
const errors   = findings.filter((f) => f.severity === "ERROR");
const warnings = findings.filter((f) => f.severity === "WARN");

if (JSON_OUTPUT) {
  console.log(JSON.stringify({ errors, warnings, total: findings.length }, null, 2));
  process.exit(errors.length > 0 ? 1 : 0);
}

// Human-readable output
console.log(`\n${B}CardSage — Offer Quality Validator${X}`);
console.log(`${D}${offers.length} offers · ${OFFERS_PATH}${X}\n`);

if (errors.length > 0) {
  console.log(`${R}▸ ERRORS (${errors.length})${X}`);
  for (const f of errors) {
    console.log(`  ${R}✗ [${f.rule}]${X} ${D}${f.offerId}${X}`);
    console.log(`    ${f.message}\n`);
  }
}

if (!ERRORS_ONLY && warnings.length > 0) {
  console.log(`${Y}▸ WARNINGS (${warnings.length})${X}`);
  for (const f of warnings) {
    console.log(`  ${Y}⚠ [${f.rule}]${X} ${D}${f.offerId}${X}`);
    console.log(`    ${f.message}\n`);
  }
}

// Summary line
if (errors.length === 0 && warnings.length === 0) {
  console.log(`${G}✓ All checks passed — no issues found.${X}\n`);
} else {
  console.log(`${D}────────────────────────────────────────${X}`);
  const errLine = errors.length > 0
    ? `${R}${errors.length} error${errors.length !== 1 ? "s" : ""}${X}`
    : `${G}0 errors${X}`;
  const warnLine = warnings.length > 0
    ? `${Y}${warnings.length} warning${warnings.length !== 1 ? "s" : ""}${X}`
    : `${G}0 warnings${X}`;
  console.log(`Summary: ${errLine}  ${warnLine}\n`);
}

process.exit(errors.length > 0 ? 1 : 0);
