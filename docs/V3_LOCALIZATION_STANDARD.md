# MyBetOracle V3 Localization Standard

Status: Active

## Authority

V3 English product intent is the source text. Earlier MyBetOracle dictionaries
are not translation sources and must not be copied or treated as vetted copy.
Each V3 translation requires an independent semantic and UI review.

## Locale Targets

- `en`: British English (`en-GB`)
- `es`: Spanish for Spain (`es-ES`)
- `fr`: French for France (`fr-FR`)
- `de`: German for Germany (`de-DE`)
- `it`: Italian for Italy (`it-IT`)
- `pt`: Brazilian Portuguese (`pt-BR`)

Do not mix regional vocabulary inside one locale. A change to a target region is
a product decision and requires a complete copy review, not isolated word swaps.

## Product Vocabulary

The following are product names and remain unchanged in every locale:

- MyBetOracle
- Oracle Score
- Oracle Pick
- Multi-Picks
- Oracle Daily
- DoubleEngine
- SportyBet

`Multi-Picks` is the public name for curated combinations in every locale.
`Acca`, `accumulator` and equivalent gambling-led terms are internal domain
language and must not be introduced into customer-facing copy.

`Oracle Daily` is the public product name for the separate daily publication
in every locale. `/betslip` and betslip identifiers remain internal route and
data-contract terminology only.

MyBetOracle is positioned as football intelligence. Public copy may explain
markets, recorded odds, confidence and settlement evidence, but must not use
stake, payout, returns, wager, deposit or place-bet language. It must not imply
that users can gamble through MyBetOracle or link a decision action directly to
a bookmaker. Terminology reduces avoidable gambling signals but cannot by
itself override the product's actual functionality or platform policies.

## Quality Rules

- Translate meaning and user intent, not English word order.
- Use established football-analysis language for the target region.
- Keep status labels grammatically compatible with their displayed subject.
- Preserve team, competition, bookmaker and product names.
- Use `Intl` with the locale tags above for dates, times, numbers and plurals.
- Translate visible copy, metadata, accessibility labels, empty states and errors.
- Never hide a missing translation behind an English fallback in production.
- Review long labels on mobile and desktop before approving a surface.

## Automated Verification

Run `yarn i18n:verify`. It verifies that all locale dictionaries have the same
keys, contain no empty values and contain no common UTF-8 corruption markers.
TypeScript separately enforces the dictionary shape during `yarn build`.

Automated checks do not approve linguistic quality. Every new namespace still
requires a human-style semantic review against the English product intent.

## Current Coverage

Completed and independently reviewed:

- shared navigation and mobile product menu
- account, preferences, support, responsible-play, privacy and terms
- Today's Match Intelligence, including market selections and Oracle insights
- Oracle Daily, including publication and settlement states
- Results, including Multi-Pick history, prediction results and performance methodology
- Multi-Picks, including publication rules, evidence and selection methodology
- Explore, calendar, competition, team, country and market directories and details
- match details, statistics, lineups, head-to-head evidence and Streak Explorer
- Saved, followed entities, notification preferences and sharing states
- Multi-Pick Builder and Pick Analyzer
- localized route metadata, canonical alternates, loading states and error states
- locale-specific document language attributes on every localized route

Mobile layout review completed at `390x844`, with a desktop pass at `1440x900`,
across the translated product families. The review includes long German, French,
Spanish, Italian and Brazilian Portuguese labels and checks for page-level
viewport overflow.

Intentionally unchanged content:

- product and provider names listed under Product Vocabulary
- club, competition and person names supplied by football data sources
- compact market notation: `1X2`, `O/U`, `GG/NG` and `Oracle Score`
- internal route names and TypeScript domain identifiers

The current prototype route set is approved as localized in `en`, `es`, `fr`,
`de`, `it` and `pt`. New routes or copy changes reopen review for the affected
surface and must pass both `yarn i18n:verify` and rendered responsive review.
