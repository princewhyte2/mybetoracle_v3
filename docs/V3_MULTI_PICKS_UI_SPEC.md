# MyBetOracle V3 Published Multi-Picks UI Specification

Status: Initial prototype contract

## Product Meaning

Published Multi-Picks are curated daily and weekly football accumulators built
from DoubleEngine's strongest eligible MIXED predictions and exact pre-match
SportyBet odds.

Route: `/{locale}/multi-picks`

This surface answers:

> What high-quality daily or weekly combinations has DoubleEngine published?

It is not the user-created Multi-Pick Builder and it does not provide future
multi-slip advisory probability claims.

## Publication Rules

- Every accumulator has at least two legs.
- Only one selection may be included per fixture.
- Bands and variants are rendered from service data, not hard-coded UI slots.
- DoubleEngine may publish one, two, three or no variants for a band.
- Options are alternatives and must never be described as guarantees.
- Configured empty bands remain visible with an unavailable state.
- Raw market and selection codes are converted to localized friendly labels.

## Odds And Confidence

Every leg keeps its SportyBet odds snapshot from the accumulator capture run.
Leg odds and the published total are immutable after publication. The interface
must never replace them with newer fixture odds.

`averageConfidence` is the arithmetic average of leg confidence scores. It is
labelled **Average leg confidence** and must not be described as the complete
slip's winning probability.

## Result Semantics

Accumulator and leg results support Pending, Won, Lost and Void. Color is
always accompanied by text and an icon.

- any lost leg makes the accumulator lost
- unresolved legs keep it pending when no leg has lost
- all void legs make it void
- all non-void legs won makes it won
- a mixture of won and void legs can still win

Missing corner or card settlement evidence remains pending. The UI must not
guess. Adjusted payout odds after voids are not shown unless a future backend
field explicitly supplies an effective settled total.

## Data Boundary

The prototype consumes typed mock data through `AccumulatorService`. Production
integration will replace the service implementation with
`GET /api/v1/product/accumulators` after visual approval.

The interface supports variable configured bands, variants and leg counts,
daily and weekly windows, frozen odds lineage, result history, empty states and
all six foundation locales.
