# Backend Contract Sync — 2026-07-12

**Status:** PENDING. `cwo_backend/contracts/openapi.json` was not accessible from this sandbox.

**When it lands, run:**
1. Save the file to `contracts/backend-openapi.json`.
2. `bun add -D openapi-typescript` and add script `"api:generate": "openapi-typescript contracts/backend-openapi.json -o src/generated/api-schema.ts"`.
3. Retype `ApiOfferRepository` DTOs from `components["schemas"]` in the generated file.
4. Capture `X-Data-Version`, `X-Contract-Version`, `ETag` in the central HTTP client.

**Current mapper compatibility:** `mapRawOffer` accepts both `platform_id` (`MAKEMYTRIP`/`CLEARTRIP`) and legacy display `platform` (`MakeMyTrip`/`Cleartrip`), plus both `booking_channel` (`WEB_AND_APP`) and legacy `channels` (`web+app`). This lets the frontend consume either the pre- or post-contract-v1 backend without a code change.
