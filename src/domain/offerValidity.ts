import { parseISO, isBefore, isAfter, format } from "date-fns";
import type { OfferViewModel } from "@/types/offer";
import { startOfToday } from "@/lib/commonUtils";

export function isOfferExpired(offer: Pick<OfferViewModel, "expiryDate">, now = startOfToday()): boolean {
  return isBefore(parseISO(offer.expiryDate), now);
}

export function isOfferUpcoming(offer: Pick<OfferViewModel, "validFrom">, now = startOfToday()): boolean {
  return isAfter(parseISO(offer.validFrom), now);
}

export function isOfferActive(offer: Pick<OfferViewModel, "validFrom" | "expiryDate">, now = startOfToday()): boolean {
  return !isOfferExpired(offer, now) && !isOfferUpcoming(offer, now);
}

export function isOfferEligible(
  offer: Pick<OfferViewModel, "validFrom" | "expiryDate" | "isActive" | "category">,
  date = startOfToday()
): boolean {
  return offer.isActive &&
    offer.category === "FLIGHT_DOMESTIC" &&
    isOfferActive(offer, date);
}

export function validityLabel(offer: Pick<OfferViewModel, "validFrom" | "expiryDate">, now = startOfToday()): string {
  if (isOfferExpired(offer, now)) return "Expired";
  if (isOfferUpcoming(offer, now)) return `Starts on ${format(parseISO(offer.validFrom), "dd MMM yyyy")}`;
  return `Valid until ${format(parseISO(offer.expiryDate), "dd MMM yyyy")}`;
}
