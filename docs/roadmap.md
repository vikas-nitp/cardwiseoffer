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

## Monetization

> Full revenue strategy: **[cwo_backend/docs/deployment/revenue.md](../../cwo_backend/docs/deployment/revenue.md)**

Priority order:
1. Fix `offerMapper.ts:55` B1 bug (booking_url null → CTA disabled) — this is a **revenue gate**
2. VCommission / Admitad publisher accounts → affiliate deep links on CTA
3. Email capture on guest gate for offer alerts
4. AdSense + Media.net display ads (Media.net pays 2–3× AdSense for finance)
5. Card apply CTA via BankBazaar sub-affiliate
6. Premium ₹99/month subscription (Phase 3, needs DB)

Estimated: ₹45,000/month at launch with 1,000 DAU → ₹3,20,000/month at Month 6.

---

## What This Is Not (Yet)

- Not a booking engine — affiliate deep links only, CWO never handles payment
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

---

### Phase 3 — Monetization (In Progress)

**Goal:** Convert every offer click into attributable affiliate revenue. Prove the unit economics before scaling.

**Status (Sep 2026):** Affiliate links wired (`affiliateLinks.ts`), email capture live, VAPT done, GitHub Actions scraper set up. Remaining: Vercel + Railway deploy.

**Tasks:**
- [x] Fix B1 bug — booking_url null → CTA disabled (`offerMapper.ts`)
- [x] Affiliate deep links — VCommission + Admitad publisher accounts; `buildAffiliateUrl()` with per-platform `aid` / `aff_id` params
- [x] Email capture bar — `/api/v1/subscriptions/email`, SHA-256 IP hash, JSONL storage
- [x] VAPT audit — security headers, CORS, input constraints signed off
- [x] GitHub Actions cron scraper — daily cardsage run, commits `output/combined/`
- [ ] Deploy frontend → Vercel (set `VITE_API_BASE_URL`, connect custom domain)
- [ ] Deploy backend → Railway (Dockerfile present; set `CORS_ORIGINS` env var)
- [ ] AdSense + Media.net display placements (Media.net pays 2–3× for finance traffic)
- [ ] Card apply CTA via BankBazaar sub-affiliate (`₹500–₹1,500` per approved application)
- [ ] Click + conversion tracking — PostHog or GA4 events on every `Continue to [platform]` click; UTM passthrough on all outbound URLs

**Revenue gate:** Every undeployed day is lost affiliate revenue. Deployment (#7) unblocks everything downstream.

---

### Phase 4 — AI Offer Finder

**Goal:** Let users describe what they want in plain language. AI interprets; the deterministic backend matches. AI never invents prices, dates or eligibility.

**Principle (non-negotiable):** LLM = query interpreter only. Backend = offer matching engine.

```
User types natural language
        ↓
Frontend — AI search box (alongside existing filters)
        ↓
POST /api/v1/ai/search  { "query": "Bangalore to Dubai under ₹15k in November" }
        ↓
Backend calls LLM (claude-haiku-4-5-20251001) with structured extraction prompt
        ↓
LLM returns JSON: { origin, destination, max_price, month, bank, trip_type, ... }
        ↓
Backend runs existing offer-filter logic on parsed params
        ↓
Response: matching offers + extraction summary ("Matched: BLR→DXB, ≤₹15,000, November")
        ↓
Frontend renders standard offer cards + explainer chip
```

**Tasks:**

#### 4.1 Backend — AI search endpoint
- [ ] `POST /api/v1/ai/search` — accepts `{ query: str }`, returns `{ offers: [...], parsed: {...}, explanation: str }`
- [ ] LLM extraction prompt: parse `origin`, `destination`, `max_price`, `bank`, `month`, `trip_type` (DOMESTIC/INTERNATIONAL), `payment_type`
  - Use `claude-haiku-4-5-20251001` (fast + cheap); fall back gracefully if API unavailable
  - Return partial matches when not all params extractable (e.g. no destination → show all international)
- [ ] Ambiguous query handling — if origin/destination cannot be resolved, return `clarification_needed: true` with the ambiguous field named
- [ ] Map city names → IATA codes using `data/distribution/frontend/airports.json` (already built)
- [ ] Feature flag `AI_SEARCH_ENABLED` in `feature_flags.py` (off by default until tested)
- [ ] Rate limit AI endpoint separately (e.g. 10 req/min/IP) to control LLM spend
- [ ] Log every AI query + parsed result to `data/ai_queries.jsonl` for quality review

#### 4.2 Frontend — AI search UI
- [ ] `AiSearchBar` component — text input with placeholder "Try: Bangalore to Dubai under ₹15,000"
- [ ] Sits above the standard `TopFiltersBar` on the AllOffers page; both usable independently
- [ ] Shows parsed-params chip strip below the input ("Origin: BLR · Destination: DXB · Max: ₹15,000")
  - Each chip is dismissible → removes that constraint and re-queries
- [ ] Loading state (spinner + "Finding offers…") while awaiting response
- [ ] Graceful fallback if AI endpoint fails → silently fall through to standard filter
- [ ] "Clear AI search" resets to full catalogue
- [ ] Hide behind `flags.aiSearchEnabled` feature flag

#### 4.3 Offer matching on AI params
- [ ] Extend backend search/filter logic to accept parsed AI params (origin, destination, max_price, month)
  - Origin/destination filter: match against offer's `source_url` domain or explicit route fields (requires data model update if route fields not present)
  - max_price: filter on `discount_value` + `min_transaction` composite; or surface offers where the discount makes a typical route price fall below threshold
  - month: match against `valid_from`–`expiry_date` overlap
- [ ] Explainability: response includes `explanation` string rendered as a contextual banner above results

#### 4.4 Quality gates
- [ ] Weekly review of `data/ai_queries.jsonl` — track: parse success rate, zero-result rate, click-through vs. standard search
- [ ] A/B test: show AI search to 50% of visitors; measure offer CTR and affiliate clicks vs. control

#### 4.5 Future AI features (post-validation)
- Personalized offer feed based on saved home city + preferred destinations
- "Is this a good deal?" scoring (price vs. historical + seasonal baseline)
- WhatsApp/email digest: "3 new offers matching your saved routes"

---

### Phase 5 — SEO

**Goal:** Capture high-intent Google search traffic ("hdfc flight offers", "bangalore to dubai cheap flights") with pages backed by real offer inventory — not thin placeholder content.

**Principle:** Every landing page must show actual live offers. A page with zero matching offers should either redirect to the catalogue or display the "No current offers" state with related offers — never a blank shell.

**Tasks:**

#### 5.1 Dynamic landing pages (React Router + pre-render or SSR)
- [ ] `/offers/[bank]-flight-offers` — e.g. `/offers/hdfc-flight-offers`, `/offers/sbi-flight-offers`
  - Filter offers by `bank_id`; show count in `<title>` ("12 HDFC Flight Offers — Offers Cardsage")
  - Regenerate with `build_data_bundle.py` so static export stays fresh daily
- [ ] `/offers/[origin]-flight-offers` — e.g. `/offers/bangalore-flight-offers`
  - Requires route-level data (origin IATA on each offer); track for Phase 5.2 data work below
- [ ] `/offers/[origin]-to-[destination]-flight-deals` — e.g. `/offers/bangalore-to-dubai-flight-deals`
  - City-pair pages; highest search intent; requires route fields on offers
- [ ] `/offers/[platform]-flight-offers` — e.g. `/offers/makemytrip-flight-offers`
  - Filter by `platform_id`; easiest to build immediately (field already exists)
- [ ] `/offers/international-flight-offers` and `/offers/domestic-flight-offers`
  - Filter by `category = FLIGHT_INTERNATIONAL` vs. `FLIGHT_DOMESTIC`

#### 5.2 Data model additions to support route-level SEO
- [ ] Add `origin_iata` and `destination_iata` fields to offer CSV schema + `cardsage_to_snapshot.py`
  - Cardsage scrapers should extract or infer route from offer text (or leave blank for non-route offers)
- [ ] Add `trip_scope` field: `DOMESTIC` | `INTERNATIONAL` | `BOTH` — derivable from platform + offer text
- [ ] Backfill existing 28 demo offers with route/scope fields

#### 5.3 On-page SEO
- [ ] Dynamic `<title>` and `<meta name="description">` per page using `react-helmet-async`
  - Formula: `"[N] [Bank/Route/Platform] Flight Offers — Offers Cardsage | Save up to ₹X"`
- [ ] Canonical URLs — every offer card on any listing page points canonical to its own detail URL
- [ ] Open Graph tags — `og:title`, `og:description`, `og:image` per landing page (auto-generate OG card from top offer)
- [ ] JSON-LD structured data — `Offer` schema per offer card; `BreadcrumbList` on landing pages
  ```json
  {
    "@type": "Offer",
    "name": "15% off on HDFC Credit Cards — MakeMyTrip",
    "priceCurrency": "INR",
    "validThrough": "2026-10-31",
    "url": "https://cardwiseoffer.com/offers/hdfc-flight-offers"
  }
  ```

#### 5.4 Technical SEO
- [ ] `sitemap.xml` — generated by `scripts/build_sitemap.py` after each `build_data_bundle.py` run
  - Include all active offer landing pages; update `lastmod` from `last_verified_at`
- [ ] `robots.txt` — allow all crawlers on `/offers/*`; disallow `/api/*`, `/admin/*`
- [ ] Prerender / static export for landing pages — Vite SSG plugin or React Router loader approach so Googlebot sees full content without JS execution
- [ ] Core Web Vitals pass — LCP < 2.5s, CLS < 0.1, FID < 100ms; measure with Lighthouse CI in GitHub Actions

#### 5.5 Internal linking
- [ ] Every offer card links to its bank landing page (e.g. "See all HDFC offers →")
- [ ] Bank landing pages cross-link to platform pages ("HDFC offers on MakeMyTrip")
- [ ] Homepage features top-N bank and platform landing pages as quick-access chips
- [ ] Breadcrumb navigation on all landing pages

#### 5.6 Content strategy (thin-content guard)
- [ ] Each bank/route/platform page includes a 2–3 sentence editorial intro (auto-generated from offer data, human-reviewed before publish)
  - Example: "HDFC Bank currently has 8 active flight offers across MakeMyTrip and Cleartrip. The best offer gives ₹1,500 off on bookings above ₹5,000."
- [ ] Related offers section at the bottom of every landing page ("You might also like")
- [ ] FAQ block on high-traffic pages (auto-generated from common query patterns in `data/ai_queries.jsonl`)

#### 5.7 Measurement
- [ ] Google Search Console — verify domain, submit sitemap, track impressions by landing page
- [ ] GA4 custom dimension `page_type` = `seo_landing` vs. `catalogue` to compare conversion rates
- [ ] Monthly review: top-10 landing pages by impressions, CTR, and affiliate clicks

---

## Open Questions

- Which Indian bank offer pages are structured enough to parse reliably?
- Is there an affiliate network (EasyDiner, CashKaro, etc.) with a card-offer API for flights?
- What does the legal/ToS posture look like for automated scraping of MMT/Cleartrip?
- At what traffic level does Lovable hosting become a constraint?
- Phase 4: Which LLM API pricing model works at scale — Haiku per-query vs. batched? At 10k AI queries/day, cost estimate: ~₹500/day at Haiku pricing.
- Phase 5: Should route-level pages be pre-rendered at build time (static) or SSR? Static is simpler; SSR needed only if offer updates need to be live within minutes.
