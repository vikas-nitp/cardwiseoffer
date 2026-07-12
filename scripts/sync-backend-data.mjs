import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "../cwo_backend/data/distribution/frontend");
const destination = resolve(root, "src/data/generated");
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });
console.log(`Synchronized standalone bundle from ${source}`);
