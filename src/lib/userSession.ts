import { API_BASE_URL } from "@/constants";

const STORAGE_KEY = "cwo_uid";
let memoryId: string | null = null;

/**
 * Anonymous per-browser id sent as `X-Session-Id` so the backend can keep saved
 * cards and notification prefs separate per visitor. It is not authentication.
 */
export function getUserSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // Storage blocked (private mode): keep one id for the life of the page.
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}

/** fetch() against the backend's per-user endpoints (`/api/v1/user/...`). */
export function userFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Session-Id", getUserSessionId());
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}
