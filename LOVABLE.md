# CardWiseOffer Lovable rules

1. Do not add Lovable Cloud or Supabase.
2. Production data and APIs come from FastAPI.
3. Local mode uses generated data synchronized from the backend canonical CSV.
4. Never manually edit generated snapshots.
5. UI components depend on the offer repository contract.
6. Do not hardcode bank or platform membership.
7. Do not calculate ranking or booking savings in React components.
8. Do not restore demo authentication or localStorage sessions.
9. Do not put secrets in `VITE_` variables.
10. Regenerate OpenAPI types and run parity tests after contract changes.
11. Date availability comes only from `valid_from` and `expiry_date`.
12. Never add a fixed 7-, 10-, or 11-day range; seven visible cards are UI pagination only.
13. Backend owns feature configuration; never maintain a frontend flag list.
14. Local and API repositories must return identical results.
15. API mode must never silently fall back to local data.
16. Run data, contract, and parity checks before completing work.
