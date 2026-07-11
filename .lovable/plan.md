# CardWiseOffer Stabilization Plan

Scope: fix correctness, transparency, and completeness of the local-data MVP. No real backend, no real auth. Keep the current premium UI. Structure code so a FastAPI repository can drop in later.

## Phase 1 — Offer correctness & trust
- Introduce canonical `OfferViewModel` in `src/types/offer.ts` with explicit `originalPrice`, `finalPrice`, `savings`, `discountType`, `maxDiscount`, `minTransaction`, `validFrom/To`, `verificationStatus`, `sourceType`.
- Rewrite `OfferCard` to render savings vs. final price distinctly; show `Demo offer — based on sample data` badge instead of hard-coded "Verified / Updated today".
- Derive validity label from dates (`Valid until…`, `Expired`, `Starts on…`).
- Add `src/domain/offerValidity.ts` (`isOfferActive/Expired/Upcoming`) + filter expired/inactive out of results and catalog.

## Phase 2 — Demo-mode transparency
- Add `VITE_DATA_MODE` (`mock` | `api`), default `mock` for preview.
- `mock`: always local fixtures + persistent `DemoModeBanner` ("Demo mode — sample offers…").
- `api`: real fetch; on failure show error, never silently fall back.
- Remove the current "API-first with silent mock fallback" behavior in `dataRepo.ts`.

## Phase 3 — Data normalization (one-time, dev-side)
- Re-read previously uploaded Excel via a Node script under `scripts/normalize-offers.ts` (run once locally; not shipped to browser).
- Produce canonical fixtures under `src/data/mock/`:
  - `offers.json` (canonical), `banks.json`, `platforms.json`, `airports.json`, `featureFlags.json`.
- Archive/remove `src/data/mock.json` and `bankOffersMvp.json` after confirming no imports.
- Canonical IDs: banks `HDFC|ICICI|SBI|AXIS|AMEX|KOTAK|YES|INDUSIND|RBL|HSBC`; payment `CREDIT|DEBIT|NO_CARD`; platforms `MakeMyTrip|Cleartrip|EaseMyTrip|Goibibo`. Separate display names.
- Fix Kotak (+ others) missing from selector/filters by driving all UI from `MetaContext` fed by canonical fixtures.

## Phase 4 — Search & ranking
- New `src/domain/offerRanking.ts` implementing the deterministic rules:
  - 0 cards → best card + best default (+ optional 2nd card).
  - 1 card → selected best + better alt (only if higher savings, show correct Δ) + default.
  - 2 cards → best selected + 2nd selected + better outside alt (only if better) + default.
- No forced 3 tiles, no duplicates, sort by relevance→savings→priority→expiry.
- Percent discount calc helper: uses fare when known, else labels as `Up to ₹X` / `N% off, max ₹X`.
- 7-day strip: label as "Best estimated savings" (matches available data); date change re-runs search, preserves selected banks.
- Enforce **10-day** booking window (latest confirmed rule): disable dates beyond today+10 in `SearchCard` date picker and clamp `DateStrip`. Document in `constants/index.ts`.

## Phase 5 — Booking links
- New `src/domain/platformUrlBuilder.ts` with per-platform builders for MMT/Cleartrip/EaseMyTrip/Goibibo (from, to, date, one-way).
- Catalog offers with no route → link to platform home or offer terms; if neither → disable CTA with tooltip "Choose travel details to book". Never `href="#"`.
- All external links: HTTPS allow-list, `target="_blank" rel="noopener noreferrer"`.

## Phase 6 — Mobile & responsive
- New `MobileOfferFilters` using shadcn `Sheet`, triggered from an "All Offers" filter button on `<lg` breakpoints. Bank/Platform/Payment, active count, Apply/Reset.
- Sweep responsive states at 375/430/768/1024/1440 for header, search, autocomplete, date picker/strip, card selector, offer grid, modal, banners.

## Phase 7 — Demo auth (honest)
- Relabel `AuthModal` as demo; accept valid email OR valid Indian phone format only; no fake OTP; small "Demo sign-in — no real account is created" note.
- Persist to `localStorage` under `cardwiseoffer.demo.session` / `.profile`; hydrate on mount so refresh keeps the demo user.
- `ProfileSetup`: require name + (email OR phone based on login method); add working "Skip for now" and "Logout".
- Remove `x-user-auth: true` fabricated header from `api.ts`; leave a typed `AuthTokenProvider` seam for future real auth.

## Phase 8 — Refactor (targeted, not a rewrite)
- Extract from `Index.tsx`: `OfferSearchResults`, `OfferCatalog`, `SearchSummary`, `OfferGrid`, `OfferEmptyState`, `DemoModeBanner`.
- New hooks: `useOfferSearch`, `useOfferCatalog`, `useOfferFilters`.
- Consolidate types in `src/types/` (offer, meta, feature-flags, search, session). Remove duplicates in `api.ts`, `mockApi.ts`, contexts.
- Introduce `OfferRepository` interface with `MockOfferRepository` (JSON) and `ApiOfferRepository` (HTTP). Selected by `VITE_DATA_MODE`.
- Central `src/lib/http.ts` client (base URL, timeout, AbortController, typed errors, auth-injection seam).

## Phase 9 — Validation, a11y, states
- Zod schemas for offer, meta, feature flags, search response; validate fixtures at load in dev.
- Complete loading/empty/error states across search, catalog, meta, auth.
- A11y: labels, `aria-expanded/controls`, keyboard nav for autocomplete + multiselect, focus return, visible focus, dialog semantics, `prefers-reduced-motion` respected.

## Phase 10 — Tests (Vitest + Testing Library)
- Unit: `offerMapper`, `offerValidity`, `offerRanking`, `offerCalculation`, `platformUrlBuilder`, `mockOfferRepository`, `searchValidation`.
- Component: `SearchCard`, `BankMultiSelect`, `OfferCard`, `MobileOfferFilters`, `DemoModeBanner`, `ProfileSetup`.
- Flow: 0/1/2 card search, better-alt delta, expired excluded, date-strip change, All Offers filter, mobile filter, demo login+reload persistence, demo logout, API-mode failure has no mock fallback, catalog CTA disabled without URL.
- Delete placeholder `example.test.ts`.

## Phase 11 — Config & cleanup
- Document env (`VITE_DATA_MODE`, `VITE_API_BASE_URL`) in README; dev-time validation with a visible error banner if invalid.
- Fix assets: either add `/og-image.png` or update `index.html`; ensure `favicon.png` referenced exists (already generated earlier).
- Remove/archive: `src/data/mock.json`, `bankOffersMvp.json` (if unused), unused `LockedOfferCard` and `getDailyVisitorCount` if not referenced, dead constants.

## Out of scope (explicit)
Real FastAPI, DB, Supabase migration, real auth/OTP/Google/Apple, saved cards backend, hotels, scraping, payments, analytics. Interfaces prepared only.

## Deliverables in final message
Changes list · Excel normalization summary · Architecture diagram (UI→Hooks→OfferRepository→Mock/Api) · Requirement status table · Known limitations · Verification (build/lint/typecheck/tests + QA notes) · Backend backlog.

## Technical notes
- Files added: `src/types/offer.ts`, `src/domain/{offerValidity,offerRanking,offerCalculation,platformUrlBuilder}.ts`, `src/data/repositories/{OfferRepository,MockOfferRepository,ApiOfferRepository}.ts`, `src/lib/http.ts`, `src/lib/schemas.ts`, `src/hooks/{useOfferSearch,useOfferCatalog,useOfferFilters}.ts`, `src/components/{DemoModeBanner,MobileOfferFilters,OfferSearchResults,OfferCatalog,SearchSummary,OfferGrid,OfferEmptyState}.tsx`, `scripts/normalize-offers.ts`, tests under `src/**/*.test.ts(x)`.
- Files heavily changed: `Index.tsx`, `OfferCard.tsx`, `SearchCard.tsx`, `DateStrip.tsx`, `AuthModal.tsx`, `ProfileSetup.tsx`, `AuthContext.tsx`, `dataRepo.ts`, `api.ts`, `mockApi.ts`, `constants/index.ts`, `index.html`.
- Files removed/archived after reference check: `src/data/mock.json`, `src/data/mock/bankOffersMvp.json`, `src/test/example.test.ts`, possibly `LockedOfferCard.tsx`.

Awaiting approval before implementation. If the previously uploaded Excel file is no longer accessible in this session, I will ask you to re-upload it before Phase 3; otherwise I will locate it and normalize from source.
