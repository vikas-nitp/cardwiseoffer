import { describe, expect, it } from "vitest";
import { addDays } from "date-fns";
import { bookingWindowDates, bookingWindowEnd, bookingWindowStart, isWithinBookingWindow, stripWindowOffset } from "@/domain/bookingWindow";

const now = new Date(2026, 6, 12, 15, 30);

describe("booking window", () => {
  it("includes today through today plus ten days", () => {
    const dates = bookingWindowDates(now);
    expect(dates).toHaveLength(11);
    expect(dates[0]).toEqual(bookingWindowStart(now));
    expect(dates[10]).toEqual(bookingWindowEnd(now));
  });

  it("rejects dates outside both boundaries", () => {
    expect(isWithinBookingWindow(addDays(now, -1), now)).toBe(false);
    expect(isWithinBookingWindow(now, now)).toBe(true);
    expect(isWithinBookingWindow(addDays(now, 10), now)).toBe(true);
    expect(isWithinBookingWindow(addDays(now, 11), now)).toBe(false);
  });

  it("keeps a seven-day strip inside the eleven-day range", () => {
    expect(stripWindowOffset(now, 11, now)).toBe(0);
    expect(stripWindowOffset(addDays(now, 5), 11, now)).toBe(2);
    expect(stripWindowOffset(addDays(now, 10), 11, now)).toBe(4);
  });
});
