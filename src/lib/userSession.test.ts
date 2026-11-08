import { afterEach, describe, expect, it, vi } from "vitest";
import { getUserSessionId, userFetch } from "./userSession";

const VALID = /^[A-Za-z0-9-]{16,64}$/;

describe("userSession", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("generates an id once and reuses it", () => {
    const first = getUserSessionId();
    expect(first).toMatch(VALID);
    expect(getUserSessionId()).toBe(first);
    expect(localStorage.getItem("cwo_uid")).toBe(first);
  });

  it("replaces a stored id the backend would reject", () => {
    localStorage.setItem("cwo_uid", "abc");
    const id = getUserSessionId();
    expect(id).toMatch(VALID);
    expect(localStorage.getItem("cwo_uid")).toBe(id);
  });

  it("falls back when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", { getRandomValues: (a: Uint8Array) => a.fill(171) });
    expect(getUserSessionId()).toMatch(VALID);
  });

  it("still returns a stable id when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const id = getUserSessionId();
    expect(id).toMatch(VALID);
    expect(getUserSessionId()).toBe(id);
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
  });
});
