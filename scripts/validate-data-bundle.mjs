import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const generated = resolve(root, "src/data/generated");
const names = [
  "offers.json",
  "metadata.json",
  "facets.json",
  "airports.json",
  "featureFlags.json",
  "manifest.json",
  "validation-report.json",
];

const documents = Object.fromEntries(
  await Promise.all(names.map(async (name) => [name, JSON.parse(await readFile(resolve(generated, name), "utf8"))]))
);
const manifest = documents["manifest.json"];
const metadata = documents["metadata.json"];
const facets = documents["facets.json"];
const offers = documents["offers.json"];
const report = documents["validation-report.json"];

if (!Array.isArray(offers) || offers.length === 0) throw new Error("offers.json is empty");
if (!Array.isArray(documents["airports.json"]) || documents["airports.json"].length === 0) {
  throw new Error("airports.json is empty");
}
if (!report.valid || report.accepted_row_count !== offers.length) throw new Error("validation report does not match offers");
if (!manifest.source_owner || !manifest.source_hash || manifest.contract_version !== "1.1") {
  throw new Error("manifest synchronization metadata is missing");
}
if (manifest.data_version !== metadata.data_version || manifest.data_version !== facets.data_version) {
  throw new Error("bundle data versions do not match");
}
const hash = createHash("sha256").update(JSON.stringify(offers)).digest("hex").slice(0, 12);
console.log(`Validated ${offers.length} offers, ${documents["airports.json"].length} airports (${manifest.data_version}, offers:${hash})`);
