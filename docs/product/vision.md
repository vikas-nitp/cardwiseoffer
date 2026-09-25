# CardOptimal Product Vision

CardOptimal is an **Indian travel-offer discovery platform** — not an OTA, not a price tracker. It aggregates flight and travel offers (airlines, OTAs, bank/card-linked discounts) and helps users find relevant deals.

**Core problem:** Relevant offers are fragmented across MakeMyTrip, Goibibo, ixigo, Cleartrip, Yatra, airline sites, and bank offer pages. CardOptimal reduces discovery friction.

**Positioning:** "Find the travel offer that's right for you." — own the offer-discovery layer, not the booking layer.

## What it is NOT

- Not a booking engine (affiliate deep links only, never handles payment)
- Not a real-time price-drop tracker (daily cadence is sufficient)
- Not a competitor to OTAs on inventory/booking/support
- Not an AI gimmick — AI only makes offer discovery easier, not the core product

## Phase roadmap

| Phase | Focus | Status |
|---|---|---|
| 1–2.5 | Offer foundation, data pipeline, discovery, backend | Done |
| 3 | Monetization (affiliate links, email capture, deploy) | In progress |
| 4 | AI Offer Finder — NL query → structured filter → offer match | Planned |
| 5 | SEO — programmatic landing pages backed by real offer data | Planned |
| 6 | Social distribution (Instagram Reels / YouTube Shorts → affiliate) | Future |
| 7 | Retention (email/WhatsApp alerts, saved searches, saved cards) | Future |
| 8 | Advanced intelligence (personalization, deal-quality scoring, price history) | Future |

Full task details for Phase 4 and Phase 5 are in `docs/roadmap.md`.

## Target users

Indian travelers: frequent flyers, occasional trip planners, credit-card users, deal seekers, social-media-driven travelers.

Primary market: domestic Indian travel. International (BLR→DXB etc.) is high-value secondary.

## AI architecture principle (Phase 4 — non-negotiable)

```
User (natural language) → LLM (interpretation only) → structured JSON → deterministic backend → offer match
```

The LLM must NEVER invent: price, airline, discount, expiry, availability, eligibility.

Use `claude-haiku-4-5-20251001` for query parsing (fast + cheap).

## SEO principle (Phase 5)

Every landing page must show actual live offers. No thin shells.
Pages: `/offers/hdfc-flight-offers`, `/offers/bangalore-to-dubai-flight-deals`, `/offers/makemytrip-flight-offers`.
Static pre-render (Vite SSG) preferred over SSR.

## Monetization model (priority order)

1. Affiliate CPA (VCommission + Admitad): ₹100–₹400/booking
2. Card apply CTA via BankBazaar: ₹500–₹1,500/approved card
3. Email capture → offer alert list
4. AdSense + Media.net display (Media.net 2–3× AdSense for finance)
5. Premium subscription ₹99/month (Phase 3+, needs DB)

Estimate: ₹45,000/month at 1,000 DAU → ₹3,20,000/month at Month 6.

## Validation checkpoints before scaling

- Users compare card offers before booking (500 unique users/week OR 50 searches/day for 2 weeks)
- Affiliate conversion rate (test before investing in AI or SEO)
- AI search CTR vs. standard filter CTR (A/B test Phase 4)
- Social → website conversion (UTM attribution)
