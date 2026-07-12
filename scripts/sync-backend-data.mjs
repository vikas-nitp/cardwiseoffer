import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "../cwo_backend/data/distribution/frontend");
const destination = resolve(root, "src/data/generated");
const publicDestination = resolve(root, "data/generated");
const backendContract = resolve(root, "../cwo_backend/contracts/openapi.json");
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });
await mkdir(publicDestination, { recursive: true });
await cp(resolve(source, "offers.json"), resolve(publicDestination, "offers.local.json"), { force: true });
await cp(backendContract, resolve(root, "contracts/openapi.json"), { force: true });
console.log(`Synchronized standalone bundle from ${source}`);
