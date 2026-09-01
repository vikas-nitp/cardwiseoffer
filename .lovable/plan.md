# CardWiseOffer Frontend Completion & Backend Sync Plan

Scope: complete the frontend to the spec in your prompt while preserving the existing premium UI, historical docs, and working flows. No Lovable Cloud, no fake auth, no scraping. Local-mode works standalone; API-mode is wired against the FastAPI contract without silent fallback.

## Phase 0 — Audit (no code changes)
- Inventory current state vs. required behavior in `docs/todo/2026-07-12-frontend-readiness-todo.md` with statuses: IMPLEMENTED / PARTIAL / NOT_IMPLEMENTED / UNVERIFIED / DEFERRED.
- Attempt to read backend contracts from `cwo_backend/contracts/*`. If not reachable from this sandbox, snapshot the last known shape and mark contract-dependent items UNVERIFIED with a blocker note. I will ask you to paste the current OpenAPI JSON if not accessible.
- Preserve all existing markdown under `.lovable/`, `docs/`, `README.md`, memory files.

## Phase 1 — Dated documentation scaffolding
Add (do not overwrite existing):
- `docs/skills/2026-07-12-frontend-readiness-audit.md`
- `docs/skills/2026-07-12-local-data-pipeline.md`
- `docs/skills/2026-07-12-dynamic-offer-facets.md`
- `docs/skills/2026-07-12-feature-flag-integration.md`
- `docs/skills/2026-07-12-backend-contract-sync.md`
- `docs/skills/2026-07-12-frontend-analytics.md`
- `docs/todo/2026-07-12-frontend-readiness-todo.md`
- Append entries to `docs/skills/README.md` (create if missing; never overwrite).

## Phase 2 — Product scope narrowing
- Restrict platforms to `MAKEMYTRIP`, `CLEARTRIP` across meta, filters, logos, deep links, empty states.
- Category fixed to `FLIGHT_DOMESTIC`.
- Payment methods: `CREDIT|DEBIT|NO_CARD`. Booking channels: `WEB|APP|WEB_AND_APP`.
- Update `banks.json`/`platforms.json`/`featureFlags.json` and constants; retire EaseMyTrip/Goibibo references without deleting historical docs.

## Phase 3 — Canonical types & mappers
- Rewrite `src/types/offer.ts` to the full `OfferViewModel` from the prompt (adds `platformId`, `bookingChannel`, `evidenceStatus`, `publishStatus`, `sourceUrl`, `newUserOnly`, `usageLimit`, `bookingUrl`, `extra`, search-only `displayKind/displayRank/savingsDelta/...`).
- New mappers: `src/data/mappers/{mapLocalOffer,mapBackendCatalogOffer,mapBackendSearchOffer}.ts`. Remove the shared-passthrough current `offerMapper.ts` (kept as thin re-export during migration).

## Phase 4 — Repository layer & data-source config
- `src/data/repositories/OfferRepository.ts` interface (`getFeatureFlags`, `getMetadata`, `listOffers`, `searchOffers`).
- `LocalOfferRepository.ts` (reads generated JSON, runs domain filter/facets).
- `ApiOfferRepository.ts` (typed fetch, repeated-key array serialization, AbortController, timeout, typed errors, header capture for `X-Data-Version`, `X-Contract-Version`, `ETag`).
- `src/data/repositoryFactory.ts` chooses based on `VITE_DATA_SOURCE`. Replace `getDataMode`/`dataRepo.ts` internals; keep old export names as adapters so components don't churn.
- No silent fallback. API errors surface via typed error → UI retry state.

## Phase 5 — Local data pipeline
- `scripts/normalize-offers.ts` produces:
  - `src/data/generated/offers.json`
  - `src/data/generated/metadata.json`
  - `src/data/generated/facets.json` (platform↔bank↔payment↔channel with counts)
  - `src/data/generated/manifest.json` (version, generated_at, source hash)
  - `src/data/generated/validation-report.json` (rejected rows w/ reasons)
- Reject invalid rows (dup id, bad dates, bad enum, unsupported platform). Preserve `null≠0`. Unknown fields go into `extra`.
- Add `data/source/offers.sample.csv` + `data/source/README.md` (field spec, aliases). Add npm script `data:normalize`.

## Phase 6 — Domain: filtering, facets, ranking
- `src/domain/offerFiltering.ts` — pure `filterOffers(offers, filters)` with OR-in-group / AND-across-groups; strict bank for catalog.
- `src/domain/offerFacets.ts` — `calculateFacets(offers, filters, universe)` with self-excluding counts, zero-count disabled options, selected zero-count retention.
- Keep `offerRanking.ts`; adjust to new model; document that in API mode backend order is authoritative and never reranked.

## Phase 7 — Feature flags
- Extend `FeatureFlagResponse` (adds `contract_version`, `config_version`).
- Safe defaults per spec. Wire real behavior:
  - `phase2UserFeaturesEnabled=false` → no account or personalization UI/network.
  - `publicAllOffersEnabled=false` → hide nav, block route, no `/offers` calls.
  - Coupon, analytics, and booking comparison flags are enforced at repository boundaries.
- Remove any `x-user-auth`, fake OTP/password paths from the codebase (already partially done — verify).

## Phase 8 — All Offers UI (desktop + mobile)
- Sidebar and new `MobileOfferFilters` (shadcn `Sheet`) share one filter state + facet source.
- Groups: Platform, Bank, Payment method, Booking channel, Active date.
- Show counts, disable zero-counts, preserve selected zero-counts, active-filter chips, Apply/Reset/Clear individual.
- URL sync: `/all-offers?platform=...&bank=...&payment=...&channel=...` (repeated keys), refresh + back/forward safe, unknown values ignored.
- Loading / no-catalog / no-results / API-error-retry / feature-disabled — distinct states.

## Phase 9 — Main search behavior
- Keep selected banks as ranking preferences (not strict). Backend order preserved in API mode.
- Fix `DateStrip`: hide fake 7-day savings; replace with "Active offers by date" count OR hide entirely until real fare data (choose count variant, documented).
- 10-day booking window enforced in picker, validation, URL, repo call.

## Phase 10 — Offer display correctness
- Percent → "N% off · Max ₹X · Min ₹Y". Flat → "Flat ₹X off · Min ₹Y". Never invent "You save".
- Consume `estimated_savings/estimated_final_amount/savings_label` only if backend supplies.
- Replace demo wording with the exact disclaimer from the prompt.

## Phase 11 — Landing page defect fix
- Investigate blank/sliding: audit `AnimatePresence` keys, absolute positioning, parent height collapse in `Index.tsx` / section transitions. Fix with stable container height + fade/small-y motion, respect `prefers-reduced-motion`, add `overflow-x: clip` on body if needed. Verify at 375/430/768/1024/1440 via Playwright.

## Phase 12 — Analytics (vendor-neutral, opt-in)
- `src/analytics/{provider,events,index}.ts`. GA4 loader gated on `VITE_GA_MEASUREMENT_ID`. No-op otherwise.
- Emit the event list from the prompt with non-PII properties. Tests for dispatch + disabled no-op.

## Phase 13 — OpenAPI sync
- Add `openapi-typescript` dev dep; script `api:generate`.
- `contracts/backend-openapi.json` (placeholder + real when you paste it); generate `src/generated/api-schema.ts`. DTO aliases used by `ApiOfferRepository` and mappers. Zod only at validation boundary; no `as any` bypasses.

## Phase 14 — Contract/version headers
- HTTP client captures `X-Data-Version`, `X-Contract-Version`, `ETag` and body `data_version`/`contract_version`; surfaces in debug metadata + analytics. Incompatible contract → clear error, no silent parsing.

## Phase 15 — Branding hygiene
- Grep for project-controlled "lovable/edit with lovable/watermark/badge" strings and remove from source (not the hosted badge — that stays via publish settings).

## Phase 16 — Tests
- Vitest units: filtering matrix, facets self-exclude + zero-count, mappers (local, backend catalog, backend search), feature-flag gates, URL parse/serialize, ranking rules, analytics dispatch + disabled.
- Component tests: SidebarFilters, MobileOfferFilters, OfferCard, DateStrip empty state, DemoDisclaimer wording.
- Playwright: landing not blank across viewports, Home→AllOffers→Home, mobile drawer flow, URL persistence, API-error retry.

## Phase 17 — Cleanup & handoff
- Remove/deprecate legacy: unused `dataMode.ts` internals (kept adapter), obsolete demo copy, dead constants.
- README env-var section: `VITE_DATA_SOURCE`, `VITE_API_BASE_URL`, `VITE_GA_MEASUREMENT_ID`.
- Final handoff message with all sections listed in your spec §28.

## Out of scope (explicit)
Real backend deploy, Supabase/Cloud, real auth, payments, hotels, scraping, editor branding removal from hosted badge, backend contract authoring.

## Open questions before I start
1. **Backend OpenAPI access**: I cannot reach `github.com/vikas-nitp/cwo_backend` from the sandbox. Can you paste the current `contracts/openapi.json` (or upload it), or should I proceed with a best-guess contract matching the examples we already have and mark it UNVERIFIED?
2. **Source data**: The last normalization used `offers.xlsx`. Should I keep the current generated `offers.json` as the source of truth for now and only add the pipeline/sample CSV, or do you want to re-upload a fresh source spreadsheet?
3. **Date strip**: Prefer "hide until real fare data" or "Active offers by date (counts only)"?
4. **Scale**: This is a large multi-day change. OK to land in one big change set, or split into PRs by phase (Phase 1-6 first, then 7-12, then 13-17)?

Awaiting approval + answers before implementation.
