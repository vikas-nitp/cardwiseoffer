import { afterEach, describe, expect, it, vi } from "vitest";
import { getUserSessionId, userFetch } from "./userSession";

describe("userSession", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("generates an id once and reuses it", () => {
    const first = getUserSessionId();
    expect(first).toMatch(/^[A-Za-z0-9-]{16,64}$/);
    expect(getUserSessionId()).toBe(first);
    expect(localStorage.getItem("cwo_uid")).toBe(first);
  });

  it("adds the X-Session-Id header and keeps caller headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    await userFetch("/api/v1/user/cards", { method: "POST", headers: { "Content-Type": "application/json" } });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("X-Session-Id")).toBe(getUserSessionId());
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init.method).toBe("POST");
    vi.unstubAllGlobals();
  });
});
