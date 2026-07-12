import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};
const sourceArgument = argument("--source", "data/source/offers.csv");
const outputArgument = argument("--output-dir", "src/data/generated");
const sourcePath = resolve(root, sourceArgument);
const outputDir = resolve(root, outputArgument);
const contractVersion = "1.1";

const aliases = {
  bank: "bank_id", platform: "platform_id", min_txn: "min_transaction",
  valid_till: "valid_to", coupon: "coupon_code", active: "is_active",
  channels: "booking_channel", card_names: "supported_cards",
  supported_card: "supported_cards", eligible_cards: "supported_cards",
};
const required = [
  "offer_id", "platform_id", "platform_name", "offer_title", "payment_method",
  "category", "booking_channel", "discount_type", "discount_value", "valid_from",
  "valid_to", "source_url", "evidence_status", "is_active", "publish_status",
];
const booleans = new Set(["new_user_only", "login_required", "is_active"]);
const numbers = new Set(["discount_value", "max_discount", "min_transaction", "priority_score"]);
const nullable = new Set(["bank_id", "bank_name", "card_name", "max_discount", "min_transaction", "coupon_code", "usage_limit", "terms_url", "booking_url", "source_type", "last_verified_at"]);

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(value); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value); value = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
    } else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift()?.map((header) => aliases[header.trim()] ?? header.trim()) ?? [];
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate/aliased headers");
  return rows.map((cells, index) => ({ rowNumber: index + 2, value: Object.fromEntries(headers.map((header, cell) => [header, (cells[cell] ?? "").trim()])) }));
}

function parseBoolean(value, field, rowNumber) {
  if (["true", "1", "yes"].includes(value.toLowerCase())) return true;
  if (["false", "0", "no"].includes(value.toLowerCase())) return false;
  throw new Error(`row ${rowNumber} ${field}: invalid boolean '${value}'`);
}

function normalize(record) {
  const { rowNumber, value: input } = record;
  for (const field of required) if (!input[field]) throw new Error(`row ${rowNumber} ${field}: required`);
  const output = {}, extra = {};
  const known = new Set([...required, ...nullable, ...booleans, ...numbers, "eligibility_notes", "supported_cards"]);
  for (const [field, raw] of Object.entries(input)) {
    if (!known.has(field)) { if (raw) extra[field] = raw; continue; }
    if (!raw && nullable.has(field)) output[field] = null;
    else if (booleans.has(field)) output[field] = parseBoolean(raw, field, rowNumber);
    else if (numbers.has(field)) {
      if (!raw && field !== "discount_value") output[field] = field === "priority_score" ? 0 : null;
      else { const parsed = Number(raw); if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`row ${rowNumber} ${field}: invalid non-negative number`); output[field] = parsed; }
    } else if (field === "eligibility_notes" || field === "supported_cards") output[field] = raw ? raw.split("|").map((item) => item.trim()).filter(Boolean) : [];
    else output[field] = raw;
  }
  for (const field of ["platform_id", "bank_id", "payment_method", "category", "booking_channel", "discount_type", "evidence_status", "publish_status"])
    if (output[field]) output[field] = String(output[field]).toUpperCase().replaceAll("+", "_AND_").replaceAll(" ", "");
  if (output.valid_from > output.valid_to) throw new Error(`row ${rowNumber} valid_from: after valid_to`);
  if (output.payment_method === "NO_CARD") { if (output.bank_id || output.bank_name) throw new Error(`row ${rowNumber} bank_id: NO_CARD cannot have bank fields`); output.card_name = null; }
  else if (!output.bank_id || !output.bank_name) throw new Error(`row ${rowNumber} bank_id: bank fields required`);
  output.new_user_only ??= false; output.login_required ??= false; output.priority_score ??= 0;
  output.eligibility_notes ??= []; output.supported_cards ??= output.card_name ? [output.card_name] : [];
  output.extra = extra;
  return output;
}

const sha = (value) => createHash("sha256").update(value).digest("hex");
const sourceText = await readFile(sourcePath, "utf8");
const records = parseCsv(sourceText);
const errors = [], offers = [], seen = new Set();
for (const record of records) {
  try {
    const offer = normalize(record);
    if (seen.has(offer.offer_id)) throw new Error(`row ${record.rowNumber} offer_id: duplicate '${offer.offer_id}'`);
    seen.add(offer.offer_id); offers.push(offer);
  } catch (error) { errors.push({ source: "data/source/offers.csv", row: record.rowNumber, code: "SOURCE_VALIDATION_FAILED", message: error.message }); }
}
if (errors.length || offers.length === 0) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, "validation-report.json"), JSON.stringify({ valid: false, accepted_row_count: offers.length, rejected_row_count: errors.length, errors }, null, 2) + "\n");
  throw new Error(`data build failed with ${errors.length} validation error(s)`);
}
offers.sort((a, b) => a.offer_id.localeCompare(b.offer_id));
const dataVersion = `${offers.reduce((latest, offer) => offer.last_verified_at > latest ? offer.last_verified_at : latest, "0000-00-00")}-${sha(JSON.stringify(offers)).slice(0, 12)}`;
const publishable = offers.filter((offer) => offer.is_active && offer.publish_status === "READY" && offer.evidence_status === "VERIFIED");
const countBy = (field, nameField) => [...new Map(publishable.filter((offer) => offer[field]).map((offer) => [offer[field], offer[nameField] ?? offer[field]])).entries()].sort().map(([id, name]) => ({ id, name }));
const metadata = { data_version: dataVersion, banks: countBy("bank_id", "bank_name"), platforms: countBy("platform_id", "platform_name"), payment_methods: [...new Set(publishable.map((offer) => offer.payment_method))].sort(), categories: [...new Set(publishable.map((offer) => offer.category))].sort(), booking_channels: [...new Set(publishable.map((offer) => offer.booking_channel))].sort(), airports: JSON.parse(await readFile(resolve(root, "src/data/generated/airports.json"), "utf8")) };
const relationship = (idField, relations) => Object.fromEntries([...new Set(publishable.map((offer) => offer[idField]).filter(Boolean))].sort().map((id) => [id, { offer_count: publishable.filter((offer) => offer[idField] === id).length, ...Object.fromEntries(relations.map(([name, field]) => [name, [...new Set(publishable.filter((offer) => offer[idField] === id && offer[field]).map((offer) => offer[field]))].sort()])) }]));
const facets = { data_version: dataVersion, active_on: new Date().toISOString().slice(0, 10), platforms: relationship("platform_id", [["banks", "bank_id"], ["payment_methods", "payment_method"], ["booking_channels", "booking_channel"]]), banks: relationship("bank_id", [["platforms", "platform_id"], ["payment_methods", "payment_method"], ["booking_channels", "booking_channel"]]) };
const manifest = { schema_version: "1.1", contract_version: contractVersion, source_owner: "frontend", source_file: sourceArgument, source_hash: `sha256:${sha(sourceText)}`, data_version: dataVersion, source_count: 1, source_row_count: records.length, accepted_row_count: offers.length, rejected_row_count: 0, supported_platforms: metadata.platforms.map((platform) => platform.id) };
const report = { valid: true, source_count: 1, source_row_count: records.length, accepted_row_count: offers.length, rejected_row_count: 0, warning_count: 0, errors: [], warnings: [] };
await mkdir(outputDir, { recursive: true });
for (const [name, value] of Object.entries({ "offers.json": offers, "metadata.json": metadata, "facets.json": facets, "manifest.json": manifest, "validation-report.json": report })) await writeFile(resolve(outputDir, name), JSON.stringify(value, null, 2) + "\n");
console.log(`Built ${offers.length} offers from ${sourceArgument} (${dataVersion})`);
