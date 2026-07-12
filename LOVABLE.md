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
