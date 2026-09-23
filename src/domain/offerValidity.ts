import { parseISO, isBefore, isAfter, format, isValid, differenceInDays } from "date-fns";
import type { OfferViewModel } from "@/types/offer";
import { startOfToday } from "@/lib/commonUtils";

const ELIGIBLE_CATEGORIES = new Set(["FLIGHT_DOMESTIC", "FLIGHT_INTERNATIONAL"]);

/** Returns a valid Date or null — never propagates Invalid Date. */
function _parseDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
}

export function isOfferExpired(offer: Pick<OfferViewModel, "expiryDate">, now = startOfToday()): boolean {
  const d = _parseDate(offer.expiryDate);
  return d !== null ? isBefore(d, now) : false;
}

export function isOfferUpcoming(offer: Pick<OfferViewModel, "validFrom">, now = startOfToday()): boolean {
  const d = _parseDate(offer.validFrom);
  return d !== null ? isAfter(d, now) : false;
}

export function isOfferActive(offer: Pick<OfferViewModel, "validFrom" | "expiryDate">, now = startOfToday()): boolean {
  return !isOfferExpired(offer, now) && !isOfferUpcoming(offer, now);
}

export function isOfferActiveOnDay(
  offer: Pick<OfferViewModel, "validDays">,
  date: Date
): boolean {
  if (offer.validDays == null) return true;
  if (offer.validDays.length === 0) return false;
  // Backend stores 0=Mon…6=Sun (Python weekday). Convert from JS getDay() (0=Sun…6=Sat).
  const pyDay = (date.getDay() + 6) % 7;
  return offer.validDays.includes(pyDay);
}

export function isOfferEligible(
  offer: Pick<OfferViewModel, "validFrom" | "expiryDate" | "isActive" | "category" | "validDays" | "evidenceStatus">,
  date = startOfToday()
): boolean {
  return offer.isActive &&
    ELIGIBLE_CATEGORIES.has(offer.category) &&
    offer.evidenceStatus !== "UNVERIFIED" &&
    isOfferActive(offer, date) &&
    isOfferActiveOnDay(offer, date);
}

/** Catalog eligibility: ignores valid_days so all non-expired offers appear regardless of today's weekday. */
export function isOfferCatalogEligible(
  offer: Pick<OfferViewModel, "validFrom" | "expiryDate" | "isActive" | "category" | "evidenceStatus">,
  date = startOfToday()
): boolean {
  return offer.isActive &&
    ELIGIBLE_CATEGORIES.has(offer.category) &&
    offer.evidenceStatus !== "UNVERIFIED" &&
    isOfferActive(offer, date);
}

export function validityLabel(offer: Pick<OfferViewModel, "validFrom" | "expiryDate">, now = startOfToday()): string {
  if (isOfferExpired(offer, now)) return "Expired";
  const from = _parseDate(offer.validFrom);
  const to = _parseDate(offer.expiryDate);
  if (isOfferUpcoming(offer, now)) {
    if (from && to && differenceInDays(to, from) <= 45) {
      return `Starts ${format(from, "dd MMM")} – ${format(to, "dd MMM yyyy")}`;
    }
    return from ? `Starts on ${format(from, "dd MMM yyyy")}` : "Upcoming";
  }
  if (from && to && differenceInDays(to, from) <= 45) {
    return `${format(from, "dd MMM")} – ${format(to, "dd MMM yyyy")}`;
  }
  return to ? `Valid until ${format(to, "dd MMM yyyy")}` : "Active";
}
