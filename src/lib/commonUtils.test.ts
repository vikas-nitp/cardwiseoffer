import { describe, it, expect } from "vitest";
import { toISODateStr, clamp, formatINR, pluralize, maskString } from "@/lib/commonUtils";

describe("toISODateStr", () => {
  it("formats a date as yyyy-MM-dd", () => {
    expect(toISODateStr(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("pads single-digit month and day", () => {
    expect(toISODateStr(new Date(2026, 2, 7))).toBe("2026-03-07");
  });

  it("handles year-end (Dec 31)", () => {
    expect(toISODateStr(new Date(2025, 11, 31))).toBe("2025-12-31");
  });
});

describe("clamp", () => {
  it("returns min when value is below range", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("returns max when value is above range", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("returns value unchanged when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("accepts exact boundary values", () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

describe("formatINR", () => {
  it("formats zero", () => {
    expect(formatINR(0)).toBe("₹0");
  });

  it("formats four-digit amounts with thousands separator", () => {
    expect(formatINR(1200)).toBe("₹1,200");
  });

  it("always includes the rupee symbol", () => {
    expect(formatINR(50000)).toMatch(/^₹/);
  });
});

describe("pluralize", () => {
  it("returns singular form when count is 1", () => {
    expect(pluralize(1, "offer")).toBe("offer");
  });

  it("appends s by default for plural", () => {
    expect(pluralize(0, "offer")).toBe("offers");
    expect(pluralize(2, "offer")).toBe("offers");
  });

  it("uses custom plural when provided", () => {
    expect(pluralize(2, "match", "matches")).toBe("matches");
    expect(pluralize(1, "match", "matches")).toBe("match");
  });
});

describe("maskString", () => {
  it("masks all but the last 4 characters by default", () => {
    expect(maskString("9876543210")).toBe("******3210");
  });

  it("returns the full string unchanged when length <= keep", () => {
    expect(maskString("123", 4)).toBe("123");
    expect(maskString("1234", 4)).toBe("1234");
  });

  it("respects custom keep length", () => {
    expect(maskString("ABCDEFGH", 3)).toBe("*****FGH");
  });

  it("uses a custom mask character", () => {
    expect(maskString("ABCDEFGH", 3, "#")).toBe("#####FGH");
  });
});
