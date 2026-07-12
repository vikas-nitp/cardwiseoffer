/**
 * Frontend data source resolution.
 * Preferred env var: VITE_DATA_SOURCE = "local" | "api"
 * Backward compat:   VITE_DATA_MODE   = "mock"  | "api"
 * Default: "local".
 */

export type DataMode = "mock" | "api";
export type DataSource = "local" | "api";

export function getDataSource(): DataSource {
  const src = (import.meta.env.VITE_DATA_SOURCE as string | undefined)?.trim().toLowerCase();
  if (src === "api") return "api";
  if (src === "local") return "local";
  const legacy = (import.meta.env.VITE_DATA_MODE as string | undefined)?.trim().toLowerCase();
  return legacy === "api" ? "api" : "local";
}

/** @deprecated use getDataSource — kept for callers that still speak the mock/api dialect. */
export function getDataMode(): DataMode {
  return getDataSource() === "api" ? "api" : "mock";
}

export const IS_LOCAL_MODE = getDataSource() === "local";
export const IS_API_MODE = getDataSource() === "api";
/** @deprecated */ export const IS_MOCK_MODE = IS_LOCAL_MODE;
