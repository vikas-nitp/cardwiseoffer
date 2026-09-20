# Offer Card Field Spec

> Reference for the full cardsage → backend → frontend pipeline.
> Live visual spec: https://claude.ai/artifact/FrF6Yb5rzzKHRakoehB5qt

## Card design

Current OfferCard component (`src/components/OfferCard.tsx`) is the canonical design — do not change the card UI.

The three-tier data display strategy:
- **Minimum**: bank badge + discount value + CTA
- **Standard** (current): + coupon + validity + channel
- **Maximum** (future): + instant/cashback badges + eligibility notes + confidence + source attribution

## Critical bugs

### B1: CTA disabled for all offers
`offerMapper.ts:55` — `platformUrl: raw.booking_url ?? null`
`booking_url` is `null` for every offer in the static snapshot.
**Fix**: fall back to `platformHomeUrl(platform_id)` when `booking_url` is null.

### B2: Guest gate bypass
When filters produce ≤ 3 results, `hiddenCount = max(0, totalCount - 3) = 0` → gate never shown.

## Pipeline (cardsage → backend → frontend)

```
cardsage output JSON
        ↓  [BROKEN — not connected yet]
  offers.csv  (hand-curated, manual)
        ↓  build_offer_snapshot.py
  offers.snapshot.json
        ↓  FileOfferRepository
  /api/v1/offers  (PublicOffer schema)
        ↓  offerMapper.ts
  OfferViewModel  (frontend)
```

## Field mapping: cardsage → backend

| cardsage field | backend field | Status |
|---|---|---|
| `offer_id` | `offer_id` | ✓ |
| `valid_to` | `expiry_date` | ✓ aliased in ingestion |
| `validation_status` | `evidence_status` | ~ must map: VALID→VERIFIED, WARNING/NEEDS_REVIEW→PARTIAL |
| — | `publish_status` | ✗ must derive: VERIFIED+confidence≥0.70→READY, else DRAFT |
| `confidence` | `priority_score` | ~ `int(confidence × 100)` |
| `booking_url` | `booking_url` | ✗ field does not exist in cardsage yet |
| `instant_discount` | — | ✗ cardsage has it; backend domain Offer missing |
| `cashback_value` | — | ✗ cardsage has it; backend domain Offer missing |
| `trip_type` | — | ✗ cardsage has it; backend domain Offer missing |
| `card_network` | — | ✗ cardsage has it; backend domain Offer missing |
| `is_upcoming` | — | ✗ cardsage has it; backend domain Offer missing |
| `offer_source` | — | ✗ cardsage has it; backend domain Offer missing |

## Blocking work to connect the pipeline

1. Add `booking_url: str | None` to `cardsage/core/models.py` — the ONLY new field needed in cardsage
2. Build `cardsage_to_csv.py` conversion script that derives `evidence_status`, `publish_status`, `priority_score` from cardsage signals
3. Fix `offerMapper.ts:55` CTA fallback

## Phase 2 enrichment (add to backend domain + frontend)

Fields already in cardsage model that should flow through:
`instant_discount`, `cashback_value`, `applicable_airlines`, `trip_type`, `card_network`, `is_upcoming`, `offer_source`
