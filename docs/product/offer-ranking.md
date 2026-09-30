# Offer Ranking Design

## Rule: best CC + best DC per bank

Per selected bank, show the best CREDIT offer + best DEBIT offer (not one winner). If a bank only has one type, show one card. No payment method input from user upfront.

**Why:** The old `rankAndLabelOffers` picked one best offer per bank ignoring payment method, then labelled it "Your Card Offer" — a lie if the user's card type didn't match. Showing both types makes the label honest and removes the need for a Progressive Precision refinement prompt.

When implementing: replace the `bestByBank` single-winner map with a per-bank (credit, debit) pair.

Labels become `"HDFC Credit Card Offer"` / `"HDFC Debit Card Offer"` instead of `"Your Card Offer"` / `"Second Selected Card"`.

## Show all vs show best

**Decision: show best CC + best DC per bank as default.** Do NOT show all offers for a bank — as data grows HDFC could have 5 CC campaigns simultaneously, making results noisy. Runtime filter handles narrowing without flooding the default view.

## Runtime filter bar (results page)

Show a lightweight inline filter bar on the results page. Filters appear only when relevant:

| Filter | Show when | Options |
|---|---|---|
| Payment type | Selected bank has both CC and DC offers | CC / DC / Both (default: Both) |
| Booking channel | Offers differ by channel | Web / App / Both (default: Both) |
| Card name | Specific card products exist in data | Dropdown; only when product-tier data ingested |

Payment type filter alone solves 90% of the problem with zero new data needed.

## Bank selection limits — keep 2 / 4

Keep 2 banks (guest) / 4 banks (signed-in). Do not reduce to 1/3.

Comparison across 2 banks ("Should I use HDFC or AXIS for this booking?") is the core value prop for guests. Runtime filter handles display complexity better than reducing the bank limit.

## Current data reality (Sep 2026)

Banks with BOTH credit and debit offers: HDFC, AXIS, BOB, INDUSIND
Banks with credit only: AMEX, AU, FEDERAL, ICICI, IDFC, KOTAK, PNB, RBL, SBI, YES
Card names are generic bank-tier ("HDFC Credit Card"), not product-tier ("HDFC Regalia Gold")
Card name filter deferred until cardsage_ingestion preserves product-specific names.

## Full results layout

```
Homepage:   bank selection (2 guest / 4 signed-in) — unchanged
Results:    best CC + best DC per bank — default view
            runtime filter bar: [CC] [DC] [Both]  [Web] [App]
            card name filter: appears only when specific products in data
Better Alt: 1 card from non-selected bank if it beats all selected offers
Default:    no-card platform offer (always last)
```

## Implementation files

- `src/domain/offerRanking.ts` — bestByBank → bestCreditByBank + bestDebitByBank
- `src/pages/sections/ResultsSection.tsx` — decorateResults label matching + filter bar
- `src/components/OfferCard.tsx` — verify label renders with longer bank+type strings
