# Frontend Readiness Audit — 2026-07-12

**Purpose:** snapshot the frontend after narrowing scope to MakeMyTrip + Cleartrip and introducing dynamic self-excluding facets.

**Previous implementation:** static filter lists in `SidebarFilters`, 4-platform metadata, hardcoded "Best estimated savings by date" strip with fabricated ₹ values, "Demo mode" banner + "Demo offer — based on sample data" chip on cards.

**Final decision (this pass):**
- Canonical `OfferViewModel` extended with `platformId`, `bookingChannel`, `evidenceStatus`, `publishStatus`, `sourceUrl`, `bookingUrl`, `newUserOnly`, `usageLimit`, `extra`. Legacy field names kept as aliases for zero-churn migration.
- Pure domain layer: `offerFiltering.ts` (OR-in-group, AND-across-groups, strict bank) and `offerFacets.ts` (self-excluding counts, disabled zero-count options preserving selection).
- Product-standard disclaimer replaces "Demo mode" wording end-to-end.
- Fare-based savings hidden from the 7-day strip (replaced with active-offer counts) because real fare data is unavailable in local mode.

**Files changed:** `src/types/offer.ts`, `src/domain/offerMapper.ts`, `src/domain/offerFiltering.ts` (new), `src/domain/offerFacets.ts` (new), `src/components/SidebarFilters.tsx`, `src/components/MobileOfferFilters.tsx` (new), `src/components/OfferCard.tsx`, `src/components/DateStrip.tsx`, `src/components/DemoModeBanner.tsx`, `src/services/mockApi.ts`, `src/services/dataRepo.ts`, `src/config/dataMode.ts`, `src/pages/Index.tsx`, `src/data/mock/offers.json`, `src/data/mock/platforms.json`, `src/data/mock/featureFlags.json`, `src/domain/offerRanking.test.ts`, `src/domain/offerCalculation.test.ts`.

**Tests:** existing domain tests updated for new model. New tests deferred (see readiness TODO).

**Backend sync notes:** frontend still calls `/api/v1/{meta,offers,search,feature-flags}` via `src/services/api.ts`; mapper accepts both `platform_id` (canonical) and legacy `platform` (display) so backends emitting either shape work without a UI change. `X-Data-Version`/`X-Contract-Version` capture is deferred.

**Known limitations:** listed in `docs/todo/2026-07-12-frontend-readiness-todo.md`.
