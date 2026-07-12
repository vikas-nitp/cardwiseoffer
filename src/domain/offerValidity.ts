import { parseISO, isBefore, isAfter, format } from "date-fns";
import type { OfferViewModel } from "@/types/offer";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function isOfferExpired(offer: Pick<OfferViewModel, "validTo">, now = startOfToday()): boolean {
  return isBefore(parseISO(offer.validTo), now);
}

export function isOfferUpcoming(offer: Pick<OfferViewModel, "validFrom">, now = startOfToday()): boolean {
  return isAfter(parseISO(offer.validFrom), now);
}

export function isOfferActive(offer: Pick<OfferViewModel, "validFrom" | "validTo">, now = startOfToday()): boolean {
  return !isOfferExpired(offer, now) && !isOfferUpcoming(offer, now);
}

export function isOfferEligible(
  offer: Pick<OfferViewModel, "validFrom" | "validTo" | "isActive" | "publishStatus" | "evidenceStatus" | "category">,
  date = startOfToday()
): boolean {
  return offer.isActive &&
    offer.publishStatus === "READY" &&
    offer.evidenceStatus === "VERIFIED" &&
    offer.category === "FLIGHT_DOMESTIC" &&
    isOfferActive(offer, date);
}

export function validityLabel(offer: Pick<OfferViewModel, "validFrom" | "validTo">, now = startOfToday()): string {
  if (isOfferExpired(offer, now)) return "Expired";
  if (isOfferUpcoming(offer, now)) return `Starts on ${format(parseISO(offer.validFrom), "dd MMM yyyy")}`;
  return `Valid until ${format(parseISO(offer.validTo), "dd MMM yyyy")}`;
}
