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

## Product Decisions (Sep 2026)

### Offer Display & Ranking

**Show best CC + best DC per selected bank** (not one winner per bank).

Current behaviour picks one best offer per bank ignoring payment method, then labels it "Your Card Offer" — misleading if the user's card type doesn't match. The new rule:
- Per selected bank → show best CREDIT offer + best DEBIT offer separately
- If a bank has only one type, show one card
- Labels: `"HDFC Credit Card Offer"` / `"HDFC Debit Card Offer"` (honest, not personalised claims)
- Better Alternative: 1 card from a non-selected bank if it beats all selected offers
- Platform Offer: no-card default, always last

**Do not show all offers for a bank.** As data grows a bank could have 5 campaigns. Default view stays best-per-type; runtime filter handles narrowing.

---

### Runtime Filter Bar (results page)

Replace the Progressive Precision upfront prompt with a lightweight inline filter bar on the results page. Filters appear only when relevant:

| Filter | Show when | Options |
|---|---|---|
| Payment type | Selected bank has both CC and DC offers | CC / DC / Both (default: Both) |
| Booking channel | Offers differ by channel | Web / App / Both (default: Both) |
| Card name | Specific card products exist in data | dropdown, deferred until ingestion supports it |

No upfront questions. User sees results immediately, filters after. The CC/DC filter replaces the credit-or-debit prompt entirely.

---

### Bank Selection Limits — Keep 2 / 4

**Keep 2 banks (guest) / 4 banks (signed-in). Do not reduce to 1/3.**

Comparison across 2 banks ("Should I use HDFC or AXIS for this booking?") is the core guest value prop. Runtime filter handles display complexity without reducing the bank limit.

---

### Card Name Precision (Ingestion Task)

When a source offer names a specific card product (e.g. "HDFC Pixel Credit Card", "Flipkart Axis Credit Card"), the ingestion normaliser must store the exact product name in `card_name` — not flatten it to "HDFC Credit Card". A new `card_specificity` field (`ALL` | `SPECIFIC`) will be added to the model, populated by an LLM extraction step (`claude-haiku-4-5-20251001`) behind a `--llm-enrichment` CLI flag. Confidence gate: < 0.6 falls back to regex and logs a WARNING.

Current data (Sep 2026) is entirely bank-tier generic. Card name filter in the UI is deferred until this ingestion work ships.

---

### LLM Extraction Prompt (card specificity)

```
Extract card eligibility from the following offer text.

Determine:
1. bank_name — the issuing bank (e.g. "HDFC Bank", "SBI")
2. payment_type — one of: CREDIT | DEBIT | BOTH | NO_CARD
3. card_specificity — ALL (any card of that bank/type) | SPECIFIC (named product)
4. card_name — if SPECIFIC, exact product name; if ALL, generic "<Bank> Credit/Debit Card"

Return JSON only:
{
  "bank_name": "...",
  "payment_type": "CREDIT|DEBIT|BOTH|NO_CARD",
  "card_specificity": "ALL|SPECIFIC",
  "card_name": "..."
}

Offer text:
{{OFFER_TEXT}}
```

Feed: offer title + eligibility line + first 2–3 bullet points. Key signals appear in the headline, not buried in T&C.

---

### Parser Integration — DOM vs API

Confirmed from live testing (Sep 2026):

**ClearTrip** (`/all-offers/` detail page) — DOM-scraped:
```
Title:    "Flat 10% off on SBI Cards"       ← bank_name
Subtitle: "Applicable on Credit Cards"      ← payment_type
T&C:      "...with SBI Credit Cards..."     ← ALL signal
           OR "...using HDFC Pixel Credit Card..." ← SPECIFIC signal
```
`raw_title + raw_description[:500]` is exactly `{{OFFER_TEXT}}`.

**MakeMyTrip** — API intercept path:
```json
{ "title": "FLAT 15% OFF", "bankName": "Visa", "coupon": "VISAINFINITE" }
```
Already structured — `bankName` + coupon suffix often encodes bank and card specificity without LLM.

**Extraction pipeline (per offer):**
```
DOM text / API JSON
      ↓
Regex path (default, free):
  bank_name      — title keywords (~95% reliable)
  payment_type   — "Credit" / "Debit" / "Credit & Debit" in subtitle (~90%)
  card_name      — verbatim product name in title/first T&C line (~80%)
  card_specificity — "all HDFC" / named product heuristic (~75%)
      ↓ if confidence < 0.6
LLM path (--llm-enrichment flag, claude-haiku-4-5-20251001):
  same text → structured JSON → confidence gate → WARNING if still < 0.6
```

Regex covers ~80% of offers at zero API cost. LLM handles the remaining 20%: co-brand names mid-sentence, EMI-only offers, ambiguous eligibility lines.

---

## Open Questions

- Which Indian bank offer pages are structured enough to parse reliably?
- Is there an affiliate network (EasyDiner, CashKaro, etc.) with a card-offer API for flights?
- What does the legal/ToS posture look like for automated scraping of MMT/Cleartrip?
- At what traffic level does Lovable hosting become a constraint?
