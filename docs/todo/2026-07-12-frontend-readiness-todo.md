# CardWiseOffer — Frontend Readiness TODO (2026-07-12)

Status legend: IMPLEMENTED · PARTIAL · NOT_IMPLEMENTED · UNVERIFIED · DEFERRED

## Landed this pass
- IMPLEMENTED — Platform scope narrowed to MakeMyTrip + Cleartrip (offers.json, platforms.json, mapper).
- IMPLEMENTED — Canonical `OfferViewModel` with `platformId/platformName/bookingChannel/evidenceStatus/publishStatus/sourceUrl/bookingUrl/newUserOnly/usageLimit/extra`; back-compat fields retained (`platform`, `bank`, `bankDisplay`, `platformUrl`).
- IMPLEMENTED — Pure domain modules: `src/domain/offerFiltering.ts` (OR-in-group, AND-across-groups, strict bank in catalog, `eligibleOffers`), `src/domain/offerFacets.ts` (self-excluding counts, zero-count disabled options).
- IMPLEMENTED — `SidebarFilters` rewritten to consume `FacetOption[]` with counts + disabled state; new Booking Channel group.
- IMPLEMENTED — `MobileOfferFilters` (shadcn Sheet) with active-count badge, sharing the same filter state and facets.
- IMPLEMENTED — `DateStrip` no longer shows fabricated "savings" — replaced with active-offer count + honesty note.
- IMPLEMENTED — `DemoModeBanner` copy replaced with the required verification disclaimer; `OfferCard` "Demo offer" evidence row replaced with evidence-status row.
- IMPLEMENTED — `VITE_DATA_SOURCE` (`local` | `api`) added with backward-compat for `VITE_DATA_MODE`; `dataRepo` renamed helpers (`isLocalMode`, `isMockMode` deprecated).
- IMPLEMENTED — Feature-flag JSON extended with `contract_version`/`config_version`; `dailyVisitorsEnabled` default false; supported_platforms restricted to MMT/CT.

## Partial
- PARTIAL — Repository interface split (`OfferRepository`/`LocalOfferRepository`/`ApiOfferRepository`) not yet extracted — current `dataRepo.ts` still functions as the router but is a single module. Interface extraction deferred pending backend contract.
- PARTIAL — All Offers URL sync (`/all-offers?platform=&bank=…`) not yet added — filter state is component-local.
- PARTIAL — Empty/error states have generic messaging; distinct "no catalogue" vs "no results" text differentiated in `Index.tsx` but not yet a dedicated component.
- PARTIAL — OfferCard displays estimated savings; will consume `estimated_savings/final_amount/label` when backend sends them.

## Not implemented / deferred (blockers noted)
- DEFERRED — OpenAPI codegen (`openapi-typescript`, `contracts/backend-openapi.json`, `src/generated/api-schema.ts`). BLOCKER: current backend OpenAPI not accessible from this sandbox; please paste or upload `cwo_backend/contracts/openapi.json`.
- DEFERRED — Vendor-neutral analytics layer (`src/analytics/*`) + GA4 gating via `VITE_GA_MEASUREMENT_ID`.
- DEFERRED — `X-Data-Version`/`X-Contract-Version`/`ETag` capture on the HTTP client.
- DEFERRED — Landing-page slide/blank defect: not reproduced in this pass. Needs Playwright repro across 375/430/768/1024/1440. Suspect: `AnimatePresence mode="wait"` in `Index.tsx` + `motion.div` with `y` transform on `showHome`.
- DEFERRED — Real Zod boundary schemas at the API adapter (currently permissive `mapRawOffer`).
- DEFERRED — Test expansion: filtering matrix, facets self-exclude, mobile filter, URL persistence, feature-flag gates.
- DEFERRED — Full sample CSV pipeline (`scripts/normalize-offers.ts` + `data/source/offers.sample.csv`). Current `src/data/mock/offers.json` remains source of truth; needs re-normalization from a fresh source spreadsheet to add booking-channel diversity (all remaining rows are WEB_AND_APP after platform narrowing).

## Known limitations
- Booking-channel facet has only one value (`WEB_AND_APP`) in the current fixture — expected once new source data lands.
- Bank universe in the catalog surfaces only banks that have at least one MMT/CT flight_domestic offer (HDFC, ICICI, SBI). AXIS/AMEX/KOTAK/YES lost non-MMT/CT offers when narrowing scope.
- Feature-flag defaults are safe but `dailyVisitorsEnabled=false` — existing visitor UI (if any) will hide.

## Verification checklist
- Type-check: run after this change set.
- Vitest: 4 domain test files (validity, calculation, ranking, platformUrlBuilder) — fixtures updated to new model.
- Manual: `/all-offers` shows Platform/Bank/Payment/Channel with counts; selecting Platform=MAKEMYTRIP updates Bank counts without dropping unselected banks; mobile viewport shows Filters drawer button.
