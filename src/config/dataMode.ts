export type DataMode = "mock" | "api";

/** Resolve the active data source. VITE_DATA_MODE remains a temporary compatibility alias. */
export function getDataMode(): DataMode {
  const raw = ((import.meta.env.VITE_DATA_SOURCE ?? import.meta.env.VITE_DATA_MODE) as string | undefined)?.trim().toLowerCase();
  return raw === "api" ? "api" : "mock";
}

export const IS_MOCK_MODE = getDataMode() === "mock";
export const IS_API_MODE = getDataMode() === "api";
