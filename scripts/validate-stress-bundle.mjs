import { readFile } from "node:fs/promises";

const root = "/tmp/cardwiseoffer-data-stress";
const offers = JSON.parse(await readFile(`${root}/offers.json`, "utf8"));
const metadata = JSON.parse(await readFile(`${root}/metadata.json`, "utf8"));
const manifest = JSON.parse(await readFile(`${root}/manifest.json`, "utf8"));
if (offers.length !== 1000) throw new Error(`expected 1000 offers, received ${offers.length}`);
if (metadata.platforms.length !== 6) throw new Error(`expected 6 platforms, received ${metadata.platforms.length}`);
if (manifest.accepted_row_count !== 1000 || manifest.rejected_row_count !== 0) throw new Error("stress manifest counts are invalid");
console.log(`Validated stress bundle: ${offers.length} offers across ${metadata.platforms.length} platforms`);
