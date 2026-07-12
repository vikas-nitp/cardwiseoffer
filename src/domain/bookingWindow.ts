import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { BOOKING_WINDOW_DAYS, DATE_STRIP_VISIBLE_DAYS } from "@/constants";

export const bookingWindowStart = (now = new Date()) => startOfDay(now);
export const bookingWindowEnd = (now = new Date()) => addDays(bookingWindowStart(now), BOOKING_WINDOW_DAYS);

export function isWithinBookingWindow(date: Date, now = new Date()): boolean {
  const day = startOfDay(date);
  return day >= bookingWindowStart(now) && day <= bookingWindowEnd(now);
}

export function bookingWindowDates(now = new Date()): Date[] {
  const start = bookingWindowStart(now);
  return Array.from({ length: BOOKING_WINDOW_DAYS + 1 }, (_, index) => addDays(start, index));
}

export function stripWindowOffset(selectedDate: Date, totalDays: number, now = new Date()): number {
  const selectedIndex = Math.max(0, differenceInCalendarDays(startOfDay(selectedDate), bookingWindowStart(now)));
  const maxOffset = Math.max(0, totalDays - DATE_STRIP_VISIBLE_DAYS);
  return Math.min(Math.max(selectedIndex - Math.floor(DATE_STRIP_VISIBLE_DAYS / 2), 0), maxOffset);
}
