# Progressive Precision — Eligibility Philosophy

## Rule

Start with the minimum information needed to produce useful results. Ask for additional eligibility information only when the underlying offer data shows it can materially change the recommendation.

**Why:** Turning the homepage into a multi-field form (bank + credit/debit + card name) was rejected. The precision of CardOptimal's claim must never exceed the precision of the information it has about the user's eligibility. But collecting excess information upfront is also wrong — it creates friction before value is delivered.

## Three-stage architecture

### Homepage — "tell me enough to start"
Route, date, bank (optional), fare (optional). No payment type. No card name. **Never a form.**

### Results: bank-level — no refinement needed
If the bank's credit and debit offers lead to the same recommendation: show result with bank-level label, no prompt.

```
BEST HDFC OFFER
₹1,500 off · HDFC Credit Card · MakeMyTrip
```

### Results: bank-level — refinement triggered
If the bank has both credit and debit offers AND knowing the type would change eligibility or the recommended offer:

```
BEST HDFC OFFER
₹1,500 off · HDFC Credit Card · MakeMyTrip

Have an HDFC credit or debit card? This changes the offers available to you.
[ Credit ] [ Debit ]
```

### After refinement
```
YOUR HDFC CREDIT CARD OFFER
₹1,500 off
```

## Trigger logic for refinement prompt

Show the credit/debit refinement prompt when ANY of the following is true for the selected bank:
- Best credit offer amount ≠ best debit offer amount
- Best credit offer and best debit offer are on different platforms
- Best credit offer and best debit offer have different conditions (coupon, channel, validity)

Do NOT show the prompt when:
- The bank has only credit offers
- The bank has only debit offers
- Credit and debit lead to exactly the same recommended offer

## Label hierarchy (maps to information precision)

| Information known | Label |
|---|---|
| No bank selected | "Best Available Offer" |
| Bank selected | "Best [Bank] Offer" |
| Bank + payment type | "Your [Bank] Credit/Debit Card Offer" |
| Bank + payment type + card name | "Best offer for [Card Name]" |

"Your Card Offer" is reserved for Layer 2+ precision only. Never use it at bank-level.

## Scaling path

**Today (bank-level data):** Bank → credit/debit clarification when necessary.

**Later (card-specific data ingested):** After credit/debit is known, if multiple card products have different eligibility — "Which HDFC credit card do you have? [Regalia Gold] [Infinia] [Millennia]" — only when the answer changes the recommendation.

The same rule applies at every level: **only ask the next question when the answer changes the recommendation.**

## How to apply

- Homepage: never add new required fields for eligibility
- Results page: always label at the correct precision tier
- Refinement prompts: data-driven trigger, not always-shown
- "Your Card Offer" label: earned only at Layer 2+, never at Layer 1
- Any new offer data ingested: check whether it creates new eligibility ambiguity that warrants a new refinement trigger
