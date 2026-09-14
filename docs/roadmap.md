# CardWiseOffer — Product Roadmap

## Strategy

The product risk is demand, not technology. Ship fast, validate that users actually compare card offers before booking a flight, then invest in infrastructure proportional to proven traffic.

The frontend already supports both approaches via `VITE_DATA_SOURCE=local|api`. Phase 1 → Phase 2 is a single env-var flip and a backend deploy — no component rewrites needed.

---

## Traffic Signal (define before Phase 2)

Commit to a number now. Suggested threshold:
- **500 unique users in one week**, OR
- **50 searches per day for 2 consecutive weeks**

Use search-event tracking (already wired via `analytics.ts`) to measure this.

---

## Phases

### Phase 1 — Static / Lovable (Now)

**Goal:** Validate demand as cheaply as possible.

- CSV → JSON bundle → Lovable-hosted SPA
- No sign-in, no database, no backend
- Manual offer curation (weekly review minimum)
- Use `scripts/check-offer-expiry.mjs` to catch stale data before each deploy
- Track: page visits, search events, which routes/cards users are comparing

**Data update process (Phase 1):**
1. Review offer pages on MakeMyTrip / Cleartrip
2. Update `src/data/generated/offers.json` (or the source CSV)
3. Run `node scripts/check-offer-expiry.mjs` to audit
4. Deploy

**Risk:** Data freshness. Wrong offer details (expired, wrong amounts) destroy user trust faster than any bug.

---

### Phase 1.5 — Semi-Automated Data Pipeline (Week 4+)

**Goal:** Reduce manual curation effort ~70% without removing human review.

- AI agent crawls bank T&C pages and platform offer pages
- Produces a CSV per platform per day with a confidence score per field
- Human reviews low-confidence rows before publishing
- Validation script checks schema, expiry logic, `min_transaction` sanity
- Publish only after human sign-off

**Why semi-, not fully automated:**
Offer amounts are financial data. An LLM misreading `₹1,500 off` vs `15% off` is worse than no data. The human review gate stays until source data is structured and reliable enough to trust without it.

```
Platform pages / bank T&C pages
        ↓
Agent → CSV with confidence scores
        ↓
Human review (flag rows below confidence threshold)
        ↓
Validation script (schema + expiry + amount sanity)
        ↓
JSON bundle → deployed
```

---

### Phase 2 — Backend API (Traffic signal hit)

**Goal:** Add features that require persistence and server-side logic.

- Flip `VITE_DATA_SOURCE=api`, point at `cwo_backend`
- User accounts (already built: phone OTP auth, memory-only → move to DB)
- Saved card preferences
- Saved searches and price-drop alerts
- Personalised offer ranking based on user's cards
- Richer search filters (route-specific offers, date-range comparison)

**Infrastructure already built:**
- FastAPI backend (`cwo_backend/`) with search, catalog, and feature-flag endpoints
- Auth flow in `AuthContext.tsx` (memory-only today, migrates to session/DB)
- `VITE_DATA_SOURCE` switch in `dataRepo.ts`

---

### Phase 2.5 — Fully Automated Pipeline (Stable traffic + trusted sources)

**Goal:** Remove the human review gate for high-confidence extractions.

- Fully autonomous agent runs on a daily schedule
- Confidence threshold auto-publishes; only genuinely ambiguous rows queue for review
- Multi-platform support: add a new platform by adding a new source handler
- Diff-based publishing: only changed/new offers trigger a re-deploy

**Precondition:** Need a reliable, structured data source. Options:
- Official bank deal feeds (some banks publish structured JSON)
- Affiliate network APIs (if accessible)
- Community-contributed corrections with editorial review

---

## Data Pipeline — Design Notes

**The CSV schema designed in Phase 1 becomes the long-term contract.** Design it once, carefully. Fields to get right upfront:

| Field | Why it matters |
|-------|---------------|
| `expiry_date` | Drives all freshness logic; wrong = expired offers shown as active |
| `valid_from` | Handles future-dated offers (upcoming in strip) |
| `is_active` | Manual override to suppress without deleting |
| `evidence_status` | `VERIFIED / PARTIAL / UNVERIFIED` — drives display trust signals |
| `confidence_score` | Agent-assigned; gates auto-publish vs manual review |
| `source_url` | Audit trail; required for any auto-extraction |
| `last_verified_at` | Drives staleness warnings in admin tooling |

Retrofitting these when the agent is producing 30 platforms worth of data is expensive.

---

## What This Is Not (Yet)

- Not a booking engine — deep links only, no affiliate revenue wiring in Phase 1
- Not a real-time price tracker — daily cadence is sufficient for offer data
- Not a bank partnership play — independent, unaffiliated positioning is the trust signal

---

## Open Questions

- Which Indian bank offer pages are structured enough to parse reliably?
- Is there an affiliate network (EasyDiner, CashKaro, etc.) with a card-offer API for flights?
- What does the legal/ToS posture look like for automated scraping of MMT/Cleartrip?
- At what traffic level does Lovable hosting become a constraint?
