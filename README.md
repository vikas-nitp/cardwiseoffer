# CardWiseOffer Frontend

Indian domestic-flight card-offer aggregator — compare credit/debit card savings across MakeMyTrip, Cleartrip, and other platforms.

Lovable contributors must follow [LOVABLE.md](LOVABLE.md).

## Quick Start

```sh
npm install          # Install dependencies
npm run dev          # Dev server on http://localhost:8080
npm run build        # Production build
npm test             # Run Vitest test suite
node scripts/check-offer-expiry.mjs   # Audit offer expiry in local data
```

## Data Source

The app supports two modes, controlled by `VITE_DATA_SOURCE`:

| Mode | Env var | Description |
|------|---------|-------------|
| **Local** (default) | `VITE_DATA_SOURCE=local` | Reads from `src/data/generated/offers.json` — no backend needed |
| **API** | `VITE_DATA_SOURCE=api` | Calls the FastAPI backend at `VITE_API_BASE_URL` |

```env
# .env.local — API mode example
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:8001
```

## Architecture

```
src/
├── components/         # Shared UI components (OfferCard, DateStrip, BankMultiSelect …)
├── contexts/           # AuthContext (memory-only — no localStorage), FeatureFlagContext
├── config/             # Feature capability resolution, data-mode config
├── constants/          # App constants (strip factors, API endpoints, error messages …)
├── data/
│   ├── generated/      # offers.json, airports.json, featureFlags.json (committed demo data)
│   └── repositories/   # LocalOfferRepository, OfferRepository interface
├── domain/             # Pure business logic (ranking, eligibility, savings calc, validity)
├── hooks/              # useOfferSearch, useAllOffers
├── lib/                # utils.ts (Tailwind helper), commonUtils.ts, logger.ts
├── pages/              # Index.tsx, sections/ (Home, Results, AllOffers)
├── scripts/            # Data maintenance scripts (sync-backend-data, check-offer-expiry)
├── services/           # api.ts (Axios), dataRepo.ts (mode switcher), analytics.ts
└── types/              # OfferViewModel, generated-api.d.ts
```

## Key Design Decisions

- **Auth is memory-only.** `AuthContext` holds sign-in state in React memory. Nothing is persisted to `localStorage` or `sessionStorage`. See `phase2/README.md`.
- **Strip vs. tiles.** The 7-day date strip computes market-best savings across *all* active offers. Tiles filter by the user's selected banks. This gives a market-wide indicator without leaking bank-specific detail into the strip.
- **`simFare`** is used only for strip display text when no fare is entered; it is never passed to tile searches, so "Est. saving" and "Below minimum" never appear without a real fare.
- **DAY_FACTORS** (`STRIP_DAY_FACTORS` in constants) simulate realistic fare variance across the strip by weighting each day's hypothetical fare.

## Feature Flags

Flags come from `src/data/generated/featureFlags.json` (local) or `/api/v1/feature-flags` (API):

| Flag | Effect |
|------|--------|
| `authEnabled` | Show Sign in button; enable 4-card limit for signed-in users |
| `publicAllOffersEnabled` | Show "All Offers" catalog section |
| `couponCodeEnabled` | Show coupon codes on offer tiles |
| `bookingAmountComparisonEnabled` | Enable booking-amount fare input and Est. saving |
| `analyticsEnabled` | Enable analytics tracking |
| `visitorCountEnabled` | Enable visitor indicator |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/check-offer-expiry.mjs` | Report expired / upcoming offers; `--mark` writes `is_active=false` for expired entries; `--date YYYY-MM-DD` checks as-of a past or future date |
| `scripts/sync-backend-data.mjs` | Pull canonical offer bundle from the FastAPI backend |
| `scripts/validate-data-bundle.mjs` | Validate offers.json schema and data integrity |

## License

MIT
