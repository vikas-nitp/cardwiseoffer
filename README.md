# CardWiseOffer Frontend

Indian domestic-flight card-offer aggregator — compare credit/debit card savings across MakeMyTrip, Cleartrip, ixigo, Yatra, SpiceJet, AirAsia, and Vistara.

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
| **Local** (default) | unset or `local` | Reads from `src/data/generated/offers.json` — no backend needed |
| **API** | `api` | Calls the FastAPI backend at `VITE_API_BASE_URL` |

```env
# .env.local — API mode (point at local backend)
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:8001
```

Production builds **require** `VITE_DATA_SOURCE=api` — the app throws at startup otherwise.

---

## Data sync

Run these to pull fresh offer data from the backend pipeline into the bundled local data.

```bash
# Full sync + validation (recommended after any cardsage run)
npm run data:build

# Sync only (copy from cwo_backend/data/generated/ → src/data/generated/)
npm run data:sync-backend

# Validate the synced bundle (schema + integrity checks)
npm run data:check

# Audit offer expiry in bundled data
node scripts/check-offer-expiry.mjs

# Mark expired offers as inactive in bundled data
node scripts/check-offer-expiry.mjs --mark
```

`data:sync-backend` copies from the sibling `cwo_backend/` directory. Run `python3 scripts/build_data_bundle.py` in the backend first if you want the latest pipeline data.

---

## Full pipeline (local mode, end to end)

```bash
# 1. Run cardsage scraper (from WORKSPACE root)
python3 -m cardsage run --source all

# 2. Convert to backend CSV (from WORKSPACE root)
python3 cwo_backend/scripts/cardsage_to_snapshot.py

# 3. Build backend distribution bundle (from cwo_backend/)
python3 scripts/build_data_bundle.py

# 4. Sync into frontend (from cardwiseoffer/)
npm run data:sync-backend

# 5. Start dev server
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

- **Auth is memory-only.** `AuthContext` holds sign-in state in React memory only — nothing written to `localStorage` or `sessionStorage`.
- **Strip vs. tiles.** The 7-day date strip shows market-best savings across all active offers. Tiles filter by the user's selected banks. This gives a market-wide indicator without leaking bank-specific detail.
- **Strip no-fare mode** shows "Save up to ₹X" using `maxDiscount` (PERCENT) or `discountValue` (FLAT) — the hard cap, never a simulated fare.
- **CC/DC filter in Results.** A "All / Credit / Debit" segmented control appears when card-based offers are present. `NO_CARD` platform offers always bypass the filter.
- **Production guard.** `dataMode.ts` throws at module load time if `import.meta.env.PROD` is true and `VITE_DATA_SOURCE` is not `"api"`.

---

## License

MIT
