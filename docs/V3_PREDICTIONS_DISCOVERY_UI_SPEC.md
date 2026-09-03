# MyBetOracle V3 Predictions Discovery UI

Status: Retired after product review

The standalone Predictions destination duplicated the date-driven daily
workspace and is no longer part of the approved information architecture.
`/{locale}/predictions` permanently redirects to `/{locale}/today`.

## Route Ownership

Predictions belong inside the date-driven daily workspace. Future dates show
upcoming picks, the current date shows live/upcoming intelligence, and past
dates show settled outcomes. The permanent product name for that workspace
will be decided after its complete role is reviewed.

## Information Order

1. Featured Oracle Pick with selection, fixture, evidence and Oracle Score.
2. Market-family navigation.
3. Country, match state and minimum Oracle Score filters.
4. Ranked recommended selections with fixture context, evidence, odds and
   Multi-Pick action.

The recommended selection is the primary row value. Raw scorekeeping remains
owned by Today and Match Details.

## Prototype Boundary

Typed mock records are isolated behind `PredictionDiscoveryService`. The six
locale routes share one route tree and locale-aware date/time formatting.
Future API integration must preserve the separation between discovery,
fixture intelligence and settled results.
