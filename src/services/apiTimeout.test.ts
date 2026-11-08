import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/constants", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/constants")>()),
  API_BASE_URL: "http://api.test",
  API_TIMEOUT_MS: 20,
  API_RETRY_ATTEMPTS: 1,
  API_RETRY_DELAY_MS: 1,
}));

import { APIError, fetchMetadata } from "@/services/api";

describe("apiCall abort handling", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reports a timeout as 'Request timed out' (not 'Unknown API error') and retries GETs", async () => {
    const fetchMock = vi.fn((_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const error = await fetchMetadata().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(APIError);
    expect((error as APIError).message).toBe("Request timed out");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not send a request when the caller already aborted", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    controller.abort();
    await expect(fetchMetadata(controller.signal)).rejects.toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
