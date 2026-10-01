/**
 * Make sure src/data/generated exists before dev/test/typecheck.
 *
 * The folder is gitignored and copied in from the backend. If it is missing this
 * builds the backend bundle (python) when needed, then runs the normal sync.
 * Set CWO_BACKEND_DIR if the backend is not at ../cwo_backend.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = ["offers", "metadata", "manifest", "featureFlags", "airports"].map((n) =>
  resolve(root, `src/data/generated/${n}.json`),
);
if (required.every(existsSync)) process.exit(0);

const backend = process.env.CWO_BACKEND_DIR
  ? resolve(process.env.CWO_BACKEND_DIR)
  : resolve(root, "../cwo_backend");

if (!existsSync(backend)) {
  console.error(
    `src/data/generated is missing and no backend checkout was found at ${backend}.\n` +
      "Clone cwo_backend next to this repo (or set CWO_BACKEND_DIR), then run `npm run data:build`.",
  );
  process.exit(1);
}

const run = (cmd, args, cwd) => {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

console.log("src/data/generated is missing - syncing from the backend...");
if (!existsSync(resolve(backend, "data/generated/offers.snapshot.json"))) {
  run(process.platform === "win32" ? "python" : "python3", ["scripts/build_data_bundle.py"], backend);
}
run(process.execPath, [resolve(root, "scripts/sync-backend-data.mjs")], root);
