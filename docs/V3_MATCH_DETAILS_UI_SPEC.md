# MyBetOracle V3 Match Details UI Specification

Status: Initial prototype contract

## Product Role

The match page is the canonical destination for a fixture. It connects match
identity, status, prediction intelligence, historical team evidence, form,
head-to-head results, lineups, statistics and competition context without
splitting the user across unrelated experiences.

Route: `/{locale}/match/{matchSlug}`

The default Overview must remain useful on its own. Oracle, H2H, Lineups and
Stats tabs allow focused reading without hiding the primary fixture context.

## Information Hierarchy

1. Competition, round and save state.
2. Teams, kickoff or score, recent form, venue and referee.
3. Stable match-section navigation.
4. Oracle decision and the evidence supporting it.
5. Relevant team streaks with explicit venue scope.
6. Team comparison, head-to-head, probable lineups and standings context.

The interface takes density and predictable detail navigation as useful lessons
from leading score products while remaining an original MyBetOracle football
intelligence experience.

## Streak Rules

Only relevant team streaks are embedded on the match page. Overall, home and
away scopes must remain explicit and separate. Streaks describe completed
historical evidence strictly before the fixture and must not be presented as a
guarantee that the pattern will continue.

The full metric discovery workflow remains owned by `/{locale}/streaks`.

## SEO Contract

- Metadata and visible content come from the same fixture record.
- The page has one fixture-level H1.
- Canonical URL uses the current confirmed locale and fixture slug.
- Locale alternates are emitted only for confirmed generated variants.
- Missing fixtures return `notFound()`; data-source failures must throw later
  during integration rather than being converted to false 404 responses.
- SportsEvent and BreadcrumbList structured data describe factual event data.
- Prediction language is not inserted into SportsEvent factual properties.

The prototype generates one mock fixture in all six confirmed V3 locales. Live
integration must derive locale existence and static route availability from
published fixture data rather than assuming every locale exists.

## Data Boundary

UI code consumes the `MatchDetailService` contract. Mock data is acceptable
during design approval. Production integration should replace only the service
implementation and preserve the page contract unless real API limitations
require an explicitly reviewed change.
