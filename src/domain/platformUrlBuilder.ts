/**
 * Single source of truth for platform booking links.
 * Returns null when no safe URL can be built — UI must disable the CTA.
 */

const ALLOWED_HOSTS = new Set([
  "www.makemytrip.com",
  "www.cleartrip.com",
  "www.easemytrip.com",
  "www.ixigo.com",
  "www.airindia.com",
  "www.goindigo.in",
]);

const HOMES: Record<string, string> = {
  MakeMyTrip: "https://www.makemytrip.com/",
  MAKEMYTRIP: "https://www.makemytrip.com/",
  Cleartrip: "https://www.cleartrip.com/",
  CLEARTRIP: "https://www.cleartrip.com/",
  EaseMyTrip: "https://www.easemytrip.com/",
  EASEMYTRIP: "https://www.easemytrip.com/",
  Ixigo: "https://www.ixigo.com/",
  IXIGO: "https://www.ixigo.com/",
  "Air India": "https://www.airindia.com/",
  AIR_INDIA: "https://www.airindia.com/",
  IndiGo: "https://www.goindigo.in/",
  INDIGO: "https://www.goindigo.in/",
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
    case "EASEMYTRIP":
      url = `https://www.easemytrip.com/flight/search?org=${from}&dest=${to}&dd=${date}&tt=1&pax=1&cls=E`;
      break;
    case "Ixigo":
    case "IXIGO":
      url = `https://www.ixigo.com/search/result/flight?from=${from}&to=${to}&date=${date}&adults=1&children=0&infants=0&class=e&source=Search`;
      break;
    case "Air India":
    case "AIR_INDIA":
      url = `https://www.airindia.com/in/en/flight-booking/search-flights.html?type=OW&orig=${from}&dest=${to}&depDate=${date}&pax=1`;
      break;
    case "IndiGo":
    case "INDIGO":
      url = `https://www.goindigo.in/flight/search.html?src=${from}&dst=${to}&type=O&class=E&adult=1&child=0&infant=0&intl=n&dd=${date}`;
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
