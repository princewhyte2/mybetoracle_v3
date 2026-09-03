# MyBetOracle V3 Streak Explorer UI Specification

Status: Canonical prototype contract

## Product Meaning

Streak Explorer describes evidence-backed historical team patterns. It is not
a user winning-streak page, an Oracle performance page or a guarantee that a
pattern will continue.

The experience should answer:

> What are the strongest currently active, historically verified team patterns
> for this date, competition, team, market and venue scope?

## Engine Rules

The UI follows the DoubleEngine streak model:

- only completed fixtures strictly before `asOf` are evaluated
- evidence is read newest to oldest
- ineligible evidence is excluded
- the run stops on the first eligible miss
- history is capped at 80 fixtures
- overall, home and away are independent scopes and must never be mixed
- the current engine contract is `streak-v2`

Each record exposes `metric`, `scope`, `currentLength`, `sampleSize`, `asOfAt`,
`sourceFixture`, `engineVersion`, `evidenceAvailable` and `zeroHistory`.

## State Language

These states are semantically different and must remain visually distinct:

| Data state | UI label |
| --- | --- |
| `currentLength=0`, `sampleSize=0`, `zeroHistory=true` | Building history |
| `evidenceAvailable=false` | Data unavailable |
| `currentLength=0`, `sampleSize>0`, `zeroHistory=false` | Not active |
| Active record | Numeric current run |

Never render a zero-history record as a `0` streak.

## Metric Coverage

The current engine provides 58 metrics, each available for overall, home and
away scopes. V3 groups them under Results, Goals, First Half, Second Half,
Corners and Cards. The canonical key list and display metadata live in
`src/features/streaks/types.ts` and `src/features/streaks/metric-catalog.ts`.

## Strength Labels

Strength is display vocabulary based only on completed run length:

| Length | Label |
| --- | --- |
| 1-2 | Neutral |
| 3-4 | Developing |
| 5-7 | Strong |
| 8-10 | Very strong |
| 11+ | Exceptional |

These labels are not forecasts or continuation probabilities.

## Prototype Surface

Route: `/{locale}/streaks`

The prototype includes the global V3 shell, evidence-date and competition
filters, category and scope controls, strongest active streaks, upcoming fixture
comparison, complete grouped team metrics and evidence drawers. It uses mock
data through `StreakExplorerService`; no live API or authentication behavior is
part of this UI approval stage.

The current team API can support individual profiles. Production discovery will
also need an aggregated strongest-streak endpoint. A complete evidence timeline
must not be shown until the API supplies the underlying fixture history; the
prototype only shows the provided latest source fixture.
