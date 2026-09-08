import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("starts idle with no user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.authStep).toBe("idle");
    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
  });

  it("openSignIn → phone step", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    expect(result.current.authStep).toBe("phone");
  });

  it("closeSignIn resets step and pending phone", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    act(() => result.current.closeSignIn());
    expect(result.current.authStep).toBe("idle");
    expect(result.current.pendingPhone).toBe("");
  });

  it("submitPhone → otp step with pending phone set", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    expect(result.current.authStep).toBe("otp");
    expect(result.current.pendingPhone).toBe("9876543210");
  });

  it("verifyOtp with short code returns false and stays in otp", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    let ok: boolean;
    act(() => { ok = result.current.verifyOtp("123"); });
    expect(ok!).toBe(false);
    expect(result.current.authStep).toBe("otp");
  });

  it("verifyOtp with 6 digits → consent step on first sign-in", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    let ok: boolean;
    act(() => { ok = result.current.verifyOtp("123456"); });
    expect(ok!).toBe(true);
    expect(result.current.authStep).toBe("consent");
  });

  it("giveConsent → success step with user set, then auto-closes", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    act(() => result.current.verifyOtp("123456"));
    act(() => result.current.giveConsent());
    expect(result.current.authStep).toBe("success");
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.phone).toBe("9876543210");
    expect(result.current.isSignedIn).toBe(true);
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.authStep).toBe("idle");
  });

  it("verifyOtp skips consent on repeat sign-in", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // First full sign-in
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    act(() => result.current.verifyOtp("123456"));
    act(() => result.current.giveConsent());
    act(() => vi.advanceTimersByTime(1500));
    // Sign out then sign back in
    act(() => result.current.signOut());
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    act(() => result.current.verifyOtp("654321"));
    expect(result.current.authStep).toBe("success");
  });

  it("signOut clears user and resets to idle", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    act(() => result.current.verifyOtp("123456"));
    act(() => result.current.giveConsent());
    act(() => result.current.signOut());
    expect(result.current.user).toBeNull();
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.authStep).toBe("idle");
  });

  it("maskedPhone hides all but last 4 digits", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.openSignIn());
    act(() => result.current.submitPhone("9876543210"));
    act(() => result.current.verifyOtp("123456"));
    act(() => result.current.giveConsent());
    expect(result.current.user?.maskedPhone).toBe("+91 ****3210");
  });
});
