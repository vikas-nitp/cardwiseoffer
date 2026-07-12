/**
 * Single source of truth for platform booking links.
 * Returns null when no safe URL can be built — UI must disable the CTA.
 */

const ALLOWED_HOSTS = new Set([
  "www.makemytrip.com",
  "www.cleartrip.com",
  "www.easemytrip.com",
  "www.goibibo.com",
]);

const HOMES: Record<string, string> = {
  MakeMyTrip: "https://www.makemytrip.com/",
  MAKEMYTRIP: "https://www.makemytrip.com/",
  Cleartrip: "https://www.cleartrip.com/",
  CLEARTRIP: "https://www.cleartrip.com/",
  EaseMyTrip: "https://www.easemytrip.com/",
  Goibibo: "https://www.goibibo.com/",
};

export interface FlightSearchContext {
  from: string;  // IATA
  to: string;    // IATA
  date: string;  // yyyy-MM-dd
}

export function buildFlightSearchUrl(platform: string, ctx: FlightSearchContext): string | null {
  const { from, to, date } = ctx;
  if (!from || !to || !date) return null;
  let url: string;
  switch (platform) {
    case "MakeMyTrip":
    case "MAKEMYTRIP":
      url = `https://www.makemytrip.com/flight/search?itinerary=${from}-${to}-${date}&tripType=O&paxType=A-1_C-0_I-0&cabinClass=E`;
      break;
    case "Cleartrip":
    case "CLEARTRIP":
      url = `https://www.cleartrip.com/flights/${from}-${to}-${date}`;
      break;
    case "EaseMyTrip":
      url = `https://www.easemytrip.com/flight-booking/${from}-${to}-${date}`;
      break;
    case "Goibibo":
      url = `https://www.goibibo.com/flights/${from}-${to}-${date}`;
      break;
    default:
      return null;
  }
  return isAllowed(url) ? url : null;
}

/** Fallback link when there's no route/date context (catalog view). */
export function platformHomeUrl(platform: string): string | null {
  return HOMES[platform] ?? null;
}

function isAllowed(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && ALLOWED_HOSTS.has(u.host);
  } catch {
    return false;
  }
}
