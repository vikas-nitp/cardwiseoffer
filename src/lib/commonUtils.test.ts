import { describe, it, expect } from "vitest";
import { clamp } from "@/lib/commonUtils";

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
