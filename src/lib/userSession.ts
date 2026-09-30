import { API_BASE_URL } from "@/constants";

const STORAGE_KEY = "cwo_uid";
// Must match the backend's X-Session-Id pattern.
const VALID_ID = /^[A-Za-z0-9-]{16,64}$/;
let memoryId: string | null = null;

function generateId(): string {
  if (typeof crypto !== "undefined") {
    // randomUUID only exists in secure contexts (HTTPS/localhost); getRandomValues does not.
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    if (typeof crypto.getRandomValues === "function") {
      return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
    }
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

/**
 * Anonymous per-browser id sent as `X-Session-Id` so the backend can keep saved
 * cards and notification prefs separate per browser. It is not authentication and
 * is only created when a per-user endpoint is first called.
 */
export function getUserSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && VALID_ID.test(existing)) return existing;
    const id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // Storage blocked (private mode): keep one id for the life of the page.
    memoryId ??= generateId();
    return memoryId;
  }
}

/** fetch() against the backend's per-user endpoints (`/api/v1/user/...`). */
export function userFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Session-Id", getUserSessionId());
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}
