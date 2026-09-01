export type DataMode = "local" | "api";

/** Resolve the active data source. VITE_DATA_MODE remains a temporary compatibility alias. */
export function getDataMode(): DataMode {
  const raw = ((import.meta.env.VITE_DATA_SOURCE ?? import.meta.env.VITE_DATA_MODE) as string | undefined)?.trim().toLowerCase();
  return raw === "api" ? "api" : "local";
}

export const IS_LOCAL_MODE = getDataMode() === "local";
export const IS_API_MODE = getDataMode() === "api";
