# Homepage Layout Research (Sep 2026)

Research into homepage layout options before any implementation. No code changes from this doc.

## Current context

**Facets snapshot (Sep 2026):**

Platforms by offer count: MMT(31), EMT(17), Ixigo(15), Yatra(15), CT(10), Paytm(6)

Top banks by offer count: ICICI(11), AUBANK(9), INDUSIND(9), HDFC(7), BOB(7), HSBC(7)

**Key insight on bank chip sort:** ICICI has most offers but HDFC has most cardholders. Sort bank chips by brand recognition (HDFC first), not by offer count. Sort platform chips by offer count (MMT first — it is also the most-used platform).

## Layout options

### A — Current (baseline)
Header → Hero → SearchCard → [results appear below]

Clean, focused. Works. Has no way for users to browse without a specific flight in mind.

### B — Homepage with platform/bank chip shortcuts (recommended for now)
Header → Hero → SearchCard → **Quick chips row** → [results]

Chips below the search card: `[MakeMyTrip] [Cleartrip] [EaseMyTrip] [HDFC] [ICICI] [SBI]...`

- Tapping a chip jumps to All Offers filtered by that platform/bank
- Data comes from `facets.json` (offer counts per bank/platform) — never hardcoded
- Platforms sorted by offer count; banks sorted by brand recognition
- Horizontal scroll on mobile; 5–6 chips visible without scrolling

**Difference from All Offers page:** Chips are intent-driven shortcuts on the homepage (user knows they want MMT or HDFC). All Offers page is exploration mode (user wants to browse everything with sidebar filters). They complement each other — chips route *into* All Offers with a filter pre-applied.

**When to implement:** Week 1–2 of any homepage work. Controlled by `chipFiltersEnabled` FF.

### C — Homepage with offer preview strip (week 3+)
Header → Hero → SearchCard → **"Latest offers" strip** (3–4 offer cards from live data)

Shows the freshest/best offers without requiring a search. Acts as social proof.

**Requires:** frontend to fetch live offers on homepage mount (new API call). Only build after traffic shows users aren't searching.

**When to implement:** Week 3+ post-launch, after analytics confirm users want browsing.

### D — B + C combined
Full homepage with both chips and preview strip. Most engaging, highest complexity.

**When to implement:** Only if both B and C validate independently.

## Search card — segment pill (decided 2026-09-25)

The search card gets a **segment pill above the route inputs** for domestic vs international selection:

```
[ 🇮🇳 Domestic ]  [ 🌍 International ]
From ___  To ___
Date ___  Card ___
[ Find offers ]
```

- Default: Domestic (no change to existing flow)
- Sends `category` param to backend → pre-filtered response → faster
- "International" narrows airport autocomplete to international-capable airports
- Controlled by `flightInternationalEnabled` FF — segment pill hidden until FF is on

**All Offers page** gets category tabs at the top:

```
[ 🇮🇳 Domestic ] [ 🌍 International ] [ 🏨 Hotels · coming soon ]
```

Hotels tab is visible but disabled until Phase 2 data. Sets user expectation early.

Full spec: `docs/product/future-features.md` → `flightInternationalEnabled` section.

---

## Navigation architecture decision

**No new nav tabs.** Research conclusion from Sep 2026:

- Current nav: Home, All Offers, About, How It Works, Contact — sufficient
- "International Flights" tab: rejected — intl offers surface inside All Offers via `flightInternationalEnabled` FF; no separate page needed
- "Hotels" tab: deferred to Phase 2 — needs separate product surface (form, results, deep-links)
- Bank-specific pages (`/offers/hdfc`): Phase 5 SEO — programmatic, not nav-based

Chip filters inside the All Offers page handle the "show only HDFC offers" use case without a new nav item.

## What not to build now

- Auto-detect trip type from search — not enough data to do this right
- Hotel tab — hotel product surface needs its own design
- International tab — intl offers work inside All Offers already
- Hero copy change — frozen until week 4+ A/B test
