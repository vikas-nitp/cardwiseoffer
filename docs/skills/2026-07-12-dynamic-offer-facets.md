# Dynamic Offer Facets — 2026-07-12

**Purpose:** replace hardcoded filter lists with self-excluding facet counts driven by canonical offers.

**Architecture:**
```
Index.tsx
  ├─ filters: OfferFilters (platformIds, bankIds, paymentMethods, bookingChannels, categories)
  ├─ universe: FacetUniverse (all option ids/names from meta or derived)
  ├─ calculateFacets(offers, filters, universe) → OfferFacets
  │     └─ platform counts use filters WITHOUT platformIds, etc.
  └─ <SidebarFilters facets={facets} …/> and <MobileOfferFilters …/>
```

**Rules encoded:**
- OR within a single filter group; AND across groups.
- Bank selection in the catalogue is strict — a `HDFC` selection removes non-HDFC (and no-card) rows.
- Zero-count options render `disabled=true`, with a tooltip explaining why.
- Selected options that fall to zero remain visible so the user can clear them.

**Ownership:** local mode computes facets in-browser from `mockAllOffers()`. When API mode + backend facet payload land, `ApiOfferRepository` will pass backend counts through instead of recomputing.
