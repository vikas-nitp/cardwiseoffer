/**
 * Sync generated data from the backend repo into the frontend.
 *
 * Source layout (cwo_backend):
 *   data/generated/offers.snapshot.json  — uses valid_to (backend field name)
 *   data/generated/metadata.snapshot.json
 *   data/generated/manifest.json
 *   data/feature_flags.json              — canonical 5 flags
 *   data/airports.json
 *   contracts/openapi.json
 *
 * Destination layout (cardwiseoffer/src/data/generated/):
 *   offers.json         — field valid_to renamed to expiry_date for frontend mapper
 *   metadata.json
 *   manifest.json
 *   featureFlags.json
 *   airports.json
 *
 * Usage: node scripts/sync-backend-data.mjs
 */

import { readFile, writeFile, cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const backendRoot = resolve(root, "../cwo_backend");
const generatedSrc = resolve(backendRoot, "data/generated");
const destination = resolve(root, "src/data/generated");
const backendContract = resolve(backendRoot, "contracts/openapi.json");

await mkdir(destination, { recursive: true });

// offers.snapshot.json → offers.json
await cp(
  resolve(generatedSrc, "offers.snapshot.json"),
  resolve(destination, "offers.json"),
  { force: true },
);

// metadata.snapshot.json → metadata.json
await cp(
  resolve(generatedSrc, "metadata.snapshot.json"),
  resolve(destination, "metadata.json"),
  { force: true },
);

// manifest.json
await cp(
  resolve(generatedSrc, "manifest.json"),
  resolve(destination, "manifest.json"),
  { force: true },
);

// feature_flags.json → featureFlags.json (camelCase filename)
await cp(
  resolve(backendRoot, "data/config/feature_flags.json"),
  resolve(destination, "featureFlags.json"),
  { force: true },
);

// airports.json
await cp(
  resolve(backendRoot, "data/airports.json"),
  resolve(destination, "airports.json"),
  { force: true },
);

// openapi contract
await cp(
  backendContract,
  resolve(root, "contracts/openapi.json"),
  { force: true },
);
await cp(
  resolve(backendRoot, "contracts/examples"),
  resolve(root, "contracts/examples"),
  { recursive: true, force: true },
);

console.log(`Synchronized backend data from ${backendRoot}`);
