#!/usr/bin/env node
/**
 * tag-synthetic-data.mjs
 *
 * One-time script: stamps every offer in offers.json with
 * extra.data_source = "STATIC_DEMO" so the validator and runtime
 * can skip or warn on synthetic filler data.
 *
 * Run once, then commit. When real ingestion pipeline data arrives
 * it will carry data_source = "MANUAL_VERIFIED" or "SCRAPER" and
 * will never be confused with demo data.
 *
 * Usage:
 *   node scripts/tag-synthetic-data.mjs           # dry-run (shows what would change)
 *   node scripts/tag-synthetic-data.mjs --write   # writes changes to offers.json
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OFFERS_PATH = resolve(__dir, "../src/data/generated/offers.json");

const WRITE = process.argv.includes("--write");

const offers = JSON.parse(readFileSync(OFFERS_PATH, "utf8"));

let changed = 0;
let alreadyTagged = 0;

for (const offer of offers) {
  if (!offer.extra) offer.extra = {};
  if (offer.extra.data_source) {
    alreadyTagged++;
  } else {
    offer.extra.data_source = "STATIC_DEMO";
    changed++;
  }
}

console.log(`\nTag summary:`);
console.log(`  ${changed} offers → will be tagged as STATIC_DEMO`);
console.log(`  ${alreadyTagged} offers already have a data_source tag`);

if (WRITE) {
  writeFileSync(OFFERS_PATH, JSON.stringify(offers, null, 2));
  console.log(`\n✓ Written to ${OFFERS_PATH}`);
} else {
  console.log(`\nDry-run only. Pass --write to apply.\n`);
}
