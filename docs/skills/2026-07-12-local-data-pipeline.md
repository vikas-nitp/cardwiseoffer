# Local Data Pipeline — 2026-07-12

**Deferred.** `scripts/normalize-offers.ts` and `data/source/offers.sample.csv` not added this pass. The current `src/data/mock/offers.json` was re-normalized in place to:
- restrict `platform` to `MakeMyTrip`/`Cleartrip`, add uppercase `platform_id`,
- restrict `category` to `FLIGHT_DOMESTIC`,
- add `booking_channel` (`WEB_AND_APP` mapped from `web+app`),
- add `evidence_status = UNVERIFIED`, `publish_status = READY`, `is_active = true`, `usage_limit = null`, `new_user_only = false`, `source_url` fallback.

After narrowing, 14 offers remain across HDFC/ICICI/SBI/No-card. AXIS/AMEX/KOTAK/YES lost coverage because their source rows were on EaseMyTrip/Goibibo. Re-uploading a new source spreadsheet (or approving the sample CSV pipeline) is required to recover them.
