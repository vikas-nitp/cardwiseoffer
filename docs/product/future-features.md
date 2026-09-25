# Frontend Future Features (FF backlog)

All items here are deferred. Do not implement until explicitly asked.

## FF: Chip filter shortcuts (`chipFiltersEnabled`)

Surface the top 5–7 banks/platforms as one-tap chip shortcuts on the homepage (below the search card) or above the offer grid in All Offers.

**Data source:** `facets.json` (offer counts per bank/platform) — never hardcoded.

**Sort order:**
- Platforms: by offer count descending (MMT first)
- Banks: by brand recognition (HDFC first, not ICICI despite higher offer count)

**UI:** Horizontal scroll on mobile; 5–6 chips visible without scrolling.

**Behavior:** Tapping a chip jumps to All Offers filtered by that bank or platform.

**Location TBD:** Below search card on homepage (Option B) OR above offer grid in All Offers. See `docs/product/homepage-layout.md` for layout options.

**When to implement:** When user confirms chip filter design and asks to build. Uses `chipFiltersEnabled` feature flag.

---

## FF: Domestic / International selector (`flightInternationalEnabled` — UI phase)

The backend FF `flightInternationalEnabled` already exists in `LocalOfferRepository.ts:20`. When flipped it gates intl offers in All Offers. The data blocker is cardsage not yet scraping intl offers.

**Decided UI design (2026-09-25):**

### Search card — segment pill
A pill above the route inputs. First thing the user sets.

```
[ 🇮🇳 Domestic ]  [ 🌍 International ]
```

- Sends `category=FLIGHT_DOMESTIC` or `FLIGHT_INTERNATIONAL` to `/api/v1/search`
- "International" selected → airport autocomplete can show international airports first
- Default: Domestic (preserves existing behaviour)

### All Offers page — tabs
```
[ 🇮🇳 Domestic ] [ 🌍 International ] [ 🏨 Hotels (coming soon) ]
```

- Each tab switches the fetch: `?category=FLIGHT_DOMESTIC` or `FLIGHT_INTERNATIONAL`
- Hotels tab is visible but disabled/greyed until Phase 2 data exists
- Backend returns only that category → smaller payload → faster

**Why not toggle:** "Domestic ●○ International" is ambiguous — users misread which state it's in. Segment pill shows both options explicitly.

**Backend change needed:**
- `/api/v1/search`: accept explicit `category` param as override (auto-infer from IATA is a fallback)
- `/api/v1/offers`: add `?category=` filter param (may already exist via platform/bank filters)

**When to implement:** When `flightInternationalEnabled` FF is ready to flip (i.e. intl offer data exists in cardsage output).

---

## FF: NL search box / AI Offer Finder (`nlSearchEnabled`)

Free-text query box — "offer on my HDFC card", "best offer on MakeMyTrip under ₹10,000" — parsed into structured filters, then matched deterministically against the offer index.

**Architecture (non-negotiable):**
```
User (natural language) → LLM (interpretation only) → structured JSON → deterministic backend → offer match
```
The LLM must NEVER invent price, airline, discount, expiry, availability, or eligibility.

**Model:** `claude-haiku-4-5-20251001` — fast + cheap for query parsing.

**Requires:** 4+ weeks of real query logs post-launch to understand what users actually search for. Do not design query patterns hypothetically.

**When to implement:** When user says "Phase 4 AI search" or "add NL search". Post-launch data first.

---

## FF: Stars on About/HowItWorks/Contact pages

Homepage has a `StarField` background component. Should it show on other pages?

**Pending decision.** Currently homepage-only. User has not confirmed or denied.

---

## FF: Motion / entrance animations

- Breathing blobs (hero section)
- Hero content entrance animation
- Header scroll transition

Discussed but never confirmed. Implement only when user explicitly asks.

---

## FF: Dark mode toggle

CSS tokens and dark classes are in place. No toggle UI exists. Could be a header icon.

---

## FF: Hero headline A/B test (week 4+ post-launch)

See `docs/design/brand-theme.md` for the alternative copy and code snippet. Run in GA4 after 4+ weeks of real traffic.
