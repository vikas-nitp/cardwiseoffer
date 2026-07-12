# Feature-Flag Integration — 2026-07-12

Extended `featureFlags.json` with `contract_version` + `config_version` in preparation for the backend validated file. Defaults are safe (all gated features off except `allOffers`). `dailyVisitorsEnabled` now defaults `false` — visitor UI must not call visitor endpoints without an explicit flag flip.

Runtime gating (already wired):
- `authEnabled=false` → Header hides Sign In; `AuthModal` still available but not triggered from nav.
- `offerLockingEnabled=false` → `Index.renderOfferTiles` never enters the login-gate branch.
- `allOffers=false` → `Index` renders an "unavailable" alert instead of the catalog and skips the fetch.
