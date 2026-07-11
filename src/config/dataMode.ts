export type DataMode = "mock" | "api";

/** Resolve the active data mode. Defaults to "mock" unless VITE_DATA_MODE=api. */
export function getDataMode(): DataMode {
  const raw = (import.meta.env.VITE_DATA_MODE as string | undefined)?.trim().toLowerCase();
  return raw === "api" ? "api" : "mock";
}

export const IS_MOCK_MODE = getDataMode() === "mock";
export const IS_API_MODE = getDataMode() === "api";
