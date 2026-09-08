#!/usr/bin/env node
/**
 * check-offer-expiry.mjs
 *
 * Reads offers.json and reports / optionally marks offers by expiry status.
 *
 * Usage:
 *   node scripts/check-offer-expiry.mjs            # report only
 *   node scripts/check-offer-expiry.mjs --mark      # write is_active=false for expired offers
 *   node scripts/check-offer-expiry.mjs --date 2026-12-01  # check as-of a specific date
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OFFERS_PATH = resolve(__dir, "../src/data/generated/offers.json");

const args = process.argv.slice(2);
const MARK = args.includes("--mark");
const dateArg = args.find((a) => a.startsWith("--date"));
const asOf = dateArg ? new Date(args[args.indexOf("--date") + 1]) : new Date();
asOf.setHours(0, 0, 0, 0);

const offers = JSON.parse(readFileSync(OFFERS_PATH, "utf8"));

const expired = [];
const upcoming = [];
const active = [];

for (const offer of offers) {
  const expiry = new Date(offer.expiry_date);
  const start  = new Date(offer.valid_from);
  expiry.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  if (expiry < asOf) {
    expired.push(offer);
    if (MARK) offer.is_active = false;
  } else if (start > asOf) {
    upcoming.push(offer);
  } else {
    active.push(offer);
  }
}

const pad = (n) => String(n).padStart(2);
console.log(`\nOffer expiry report — as of ${asOf.toISOString().slice(0, 10)}\n`);
console.log(`  Active   : ${pad(active.length)} offers`);
console.log(`  Upcoming : ${pad(upcoming.length)} offers (not yet valid)`);
console.log(`  Expired  : ${pad(expired.length)} offers`);

if (expired.length > 0) {
  console.log("\nExpired:");
  for (const o of expired) {
    const marker = MARK ? " [marked is_active=false]" : "";
    console.log(`  ✗ ${o.offer_id.padEnd(28)} expired ${o.expiry_date}${marker}`);
  }
}

if (upcoming.length > 0) {
  console.log("\nUpcoming:");
  for (const o of upcoming) {
    console.log(`  ◌ ${o.offer_id.padEnd(28)} starts  ${o.valid_from}`);
  }
}

if (MARK && expired.length > 0) {
  writeFileSync(OFFERS_PATH, JSON.stringify(offers, null, 2) + "\n");
  console.log(`\nWrote updated offers.json (${expired.length} offer(s) marked inactive).`);
}

console.log();
