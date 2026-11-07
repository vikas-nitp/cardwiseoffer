# Offer Categories

## Category enum

| Category | Meaning | Phase |
|---|---|---|
| `FLIGHT_DOMESTIC` | Domestic flights | Phase 1 — always on |
| `FLIGHT_INTERNATIONAL` | International flights | Phase 2 — `flightInternationalEnabled` FF |
| `HOTEL` | Domestic hotels | Phase 2 — not yet in frontend |
| `HOTEL_INTERNATIONAL` | International hotels | Phase 2 — not yet in frontend |

The normalizer (`normalizer.py:_category()`) is authoritative: it reads title+discount text and classifies by hotel/intl regex regardless of what `raw_cat` the parser set.

## Hotel offers — design decided, pipeline ready, frontend blocked

Data pipeline can export hotel offers today if `ACTIVE_PHASE2_CATEGORIES` is updated in the backend. Frontend is blocked:

- `ELIGIBLE_CATEGORIES = new Set(["FLIGHT_DOMESTIC", "FLIGHT_INTERNATIONAL"])` hardcoded in `src/domain/offerValidity.ts:5` — **must update** when enabling hotels
- Search form is flight-specific (from/to airport + departure date) — hotels need check-in date, city, nights
- Hero CTA is "on your flight?" — must swap dynamically when hotel category is active

### Hotel design — two phases (decided 2026-09-25)

**Phase 1 — when hotel data arrives: category tab in All Offers (minimal)**
- Add `"HOTEL"` and `"HOTEL_INTERNATIONAL"` to `ELIGIBLE_CATEGORIES`
- Hotel offers appear in All Offers via the category tab (alongside Domestic / International tabs)
- Same `OfferCard` component — only badge color, icon, context label, and CTA text change:

| Field | Flight | Dom. Hotel | Intl Hotel |
|---|---|---|---|
| Context label | BLR → DEL | Any hotel / Goa | Intl hotel |
| Icon | ✈️ | 🏨 | 🌍 |
| Badge color | Blue | Amber | Purple |
| CTA | Book on MMT | Browse Hotels on MMT | Browse Intl Hotels |

Zero new component. Add a `category` prop to `OfferCard` for badge + icon.

**Phase 2 — dedicated `/hotels` page (when volume warrants)**
- City search + check-in/check-out date range (not IATA, not single date)
- Reuses the same offer grid below the search card
- New "Hotels" nav item added
- Hero: "on your hotel stay?" — separate page, no tagline conflict

## International flights — selector UI decided

`flightInternationalEnabled` FF in `LocalOfferRepository.ts:20` gates intl flight offers. `buildFlightSearchUrl()` already handles international IATA codes. Frontend is mostly ready — the only blocker is intl offer data from cardsage.

**Decided UI (2026-09-25):** Two surfaces, both needed:

1. **Segment pill in search card** (above route inputs) — `[ 🇮🇳 Domestic ] [ 🌍 International ]`
   - Sends `category` param to `/api/v1/search`; backend pre-filters → faster response
   - Default: Domestic

2. **Tabs on All Offers page** — `[ Domestic ] [ International ] [ Hotels (coming soon) ]`
   - Switches `?category=` param on fetch; Hotels tab visible but disabled until Phase 2 data
   
Full spec: `docs/product/future-features.md` → `flightInternationalEnabled` section.

## Hero tagline compatibility

"on your flight?" works for:
- Domestic flights — exact match
- International flights — still works (same CTA, same search form)

"on your flight?" does NOT work for hotels. When hotel category is enabled, the hero needs a category-aware dynamic swap:
- Flight active: "on your flight?"
- Hotel active: "on your hotel stay?"
- Both active: keep "on your flight?" as primary, add category toggle

## Hardcoded values to update when adding categories

| Location | What | Action required |
|---|---|---|
| `src/domain/offerValidity.ts:5` | `ELIGIBLE_CATEGORIES` set | Add `"HOTEL"`, `"HOTEL_INTERNATIONAL"` |
| `src/domain/platformUrlBuilder.ts` | Platform URLs + search templates | Add hotel URL builders |
| `src/pages/sections/HomeSection.tsx` | Hero tagline | Make category-aware |

## SEO strategy (Phase 5)

Generic searches ("best credit card for flights") are dominated by financial blogs — can't win at launch. What can actually rank:

- `"HDFC credit card MakeMyTrip offer"` → bank + platform specific offer pages
- `"BOB World Travel Card cashback flights 2026"` → card-specific pages
- `"best card for Cleartrip booking"` → comparison landing pages

These require **Phase 5 SEO landing pages** (`/offers/hdfc-credit-card-makemytrip` etc.). The homepage search form doesn't get indexed meaningfully — Google doesn't run the JS search.

Pre-Phase 5 acquisition: social (Twitter/X flight-tip communities, travel groups), not organic search.

## UX rule — offer disclaimers

"Verify offer on [platform] before booking" must always be visible below the CTA in the offer detail modal. Use `text-[11px] text-muted-foreground` (not `/60` opacity — too faint). Never make it conditional on `canBook`.
