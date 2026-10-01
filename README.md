# CardWiseOffer Frontend

Indian domestic-flight card-offer aggregator — compare credit/debit card savings across the booking platforms present in the current offer data (see `src/data/generated/metadata.json`).

Lovable contributors must follow [LOVABLE.md](LOVABLE.md).

---

## Setup

```bash
npm install
```

---

## Running

```bash
npm run dev          # Dev server on http://localhost:8080 (local/bundled data mode)
npm run build        # Production build (requires VITE_DATA_SOURCE=api)
npm run preview      # Preview production build locally
```

---

## Testing

```bash
npm test             # Run Vitest suite once
npm run test:watch   # Re-run on file change
npm run typecheck    # tsc strict check
npm run lint         # ESLint
```

---

## Data modes

Controlled by `VITE_DATA_SOURCE` in `.env.local`:

| Mode | Env var | Description |
|------|---------|-------------|
| **Local** (default) | unset or `local` | Reads from `src/data/generated/offers.json` (synced from the backend, gitignored) — no backend needed |
| **API** | `api` | Calls the FastAPI backend at `VITE_API_BASE_URL` |

```env
# .env.local — API mode (point at local backend)
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:8001
```

Production builds **require** `VITE_DATA_SOURCE=api` — the app throws at startup otherwise.

---

## Data sync

The backend (`cwo_backend`) is the source of truth for offer data **and** the API contract. cardsage delivers the
offer CSV to the backend, the backend builds the bundle, and this repo copies it in. `src/data/generated/` is
gitignored. `npm run dev`, `npm test` and `npm run typecheck` sync it automatically when it is missing (building the backend bundle first if needed); run `npm run data:build` yourself to refresh it after backend data changes.

```bash
# In cwo_backend: build the bundle from data/source/offers.csv
python scripts/build_data_bundle.py

# In this repo: copy data + contracts/ from the backend, then validate
npm run data:build                      # = data:sync-backend + data:check

# Regenerate TypeScript types from contracts/openapi.json
npm run generate:api

# Audit / mark expired offers in the bundled data
node scripts/check-offer-expiry.mjs [--mark]
```

The backend is found at `../cwo_backend`; set `CWO_BACKEND_DIR` to use another checkout. CI checks out the backend,
runs the same steps and fails if `contracts/` or `src/types/generated-api.d.ts` drift from the backend.

---

## Full pipeline (local mode, end to end)

```bash
# 1. cardsage produces offers.csv and commits it to cwo_backend/data/source/offers.csv
# 2. Build the backend bundle (from cwo_backend/)
python scripts/build_data_bundle.py
# 3. Sync into the frontend (from this repo)
npm run data:build
# 4. Start the dev server
npm run dev
```

---

## Feature flags

Flags are read from `src/data/generated/featureFlags.json` (local) or `/api/v1/feature-flags` (API):

| Flag | Effect |
|------|--------|
| `authEnabled` | Show Sign in button; enforce 4-card guest limit |
| `publicAllOffersEnabled` | Show "All Offers" catalogue section |
| `couponCodeEnabled` | Show coupon codes on offer tiles |
| `bookingAmountComparisonEnabled` | Enable booking-amount fare input and estimated saving |
| `analyticsEnabled` | Enable analytics tracking |
| `visitorCountEnabled` | Enable live visitor count indicator |
| `userCardsEnabled` | Enable saved cards and profile page |
| `notificationsEnabled` | Enable notification preference section |

To add a new flag run `python3 scripts/add_feature_flag.py <flagName> <true|false>` from the backend — it updates all touch points automatically.

---

## Architecture

```
src/
├── components/         # Shared UI (OfferCard, DateStrip, BankMultiSelect …)
├── contexts/           # AuthContext (memory-only), FeatureFlagContext
├── config/             # Feature capability resolution, data-mode config
├── constants/          # App-wide constants (API endpoints, error messages …)
├── data/
│   ├── generated/      # offers.json, airports.json, featureFlags.json (synced from backend)
│   └── repositories/   # LocalOfferRepository, OfferRepository interface
├── domain/             # Pure business logic (ranking, eligibility, savings, validity)
├── hooks/              # useOfferSearch, useAllOffers, useVisitorCount, useUserCards
├── lib/                # utils.ts, commonUtils.ts, logger.ts
├── pages/              # Index.tsx, ProfilePage.tsx, sections/
├── services/           # api.ts (Axios), dataRepo.ts (mode switcher), analytics.ts
└── types/              # OfferViewModel, generated-api.d.ts
```

---

## Key design decisions

- **Auth is memory-only.** `AuthContext` holds sign-in state in React memory only. The one thing persisted is an anonymous random id (`cwo_uid` in `localStorage`) sent as `X-Session-Id` so saved cards and notification prefs stay per browser; it carries no identity.
- **Strip vs. tiles.** The 7-day date strip shows market-best savings across all active offers. Tiles filter by the user's selected banks. This gives a market-wide indicator without leaking bank-specific detail.
- **Strip no-fare mode** shows "Save up to ₹X" using `maxDiscount` (PERCENT) or `discountValue` (FLAT) — the hard cap, never a simulated fare.
- **CC/DC filter in Results.** A "All / Credit / Debit" segmented control appears when card-based offers are present. `NO_CARD` platform offers always bypass the filter.
- **Production guard.** `dataMode.ts` throws at module load time if `import.meta.env.PROD` is true and `VITE_DATA_SOURCE` is not `"api"`.

---

## License

MIT
