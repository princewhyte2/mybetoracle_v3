# MyBetOracle V3 UI Contract Freeze

Status: Frozen for integration planning

Freeze date: 2026-08-15

## Freeze Rule

API integration must fit the approved UI and route ownership below. A route,
primary navigation item, entitlement boundary or core entity field may change
only through an explicit product review. Backend convenience is not a reason
to reshape the product.

## Canonical Entities

- `Fixture`: stable id and slug, kickoff, status, teams, competition, country,
  score and venue context.
- `Prediction`: fixture id, market group, selection, Oracle Score, published
  odds, evidence, publication time and settlement.
- `AccumulatorPublication`: date/window, daily or weekly scope, target band,
  option, frozen legs, frozen total odds and settlement.
- `Streak`: team, metric key, scope, eligible sample, run length and as-of time.
- `FootballEntity`: country, competition, team or market with stable slug.
- `SavedItem`: user, entity type, entity id, saved time and alert preferences.

IDs are machine contracts. Labels are localized presentation. The client must
not reconstruct identity by parsing display text.

## Required Surface States

Every integrated surface must support loading, empty, unavailable and error
states. Missing published data may produce not-found. Upstream failure must
remain an error and must never be converted into a false 404.

Accumulator bands with no qualifying publication remain visibly unavailable;
the client must not fabricate a slip. Results preserve the original published
selection and odds. Streaks preserve overall, home and away scope.

## Free Launch Entitlement

Oracle Pro is deferred, so every currently approved football-intelligence
surface is Free at launch:

- all published fixtures and prediction market lenses in Today
- the primary Oracle Pick, Oracle Score and visible supporting evidence
- complete Match pages, including streaks, H2H, lineups, statistics and tables
- Explore, Calendar, competition, team, country and market discovery
- the complete Streak Explorer and its methodology/evidence views
- every published daily and weekly Multi-Pick, band and available option
- Multi-Pick Builder and Pick Analyzer, with a technical maximum of 20 legs
- complete Multi-Pick and single-prediction results plus performance summary
- profile, preferences, support, responsible-play and legal access
- up to 50 saved items, 20 followed teams, 10 followed competitions and 20
  alert-enabled entities when persistence is integrated
- kickoff, live-state and settlement alerts for alert-enabled saved entities

Trust surfaces remain Free permanently: settled results, publication odds,
sample sizes, methodology, responsible-play information and uncertainty copy.

## Oracle Pro Reservation

Oracle Pro has no approved V3 route, price, lock state or launch entitlement.
It is absent from the active shell. A future Pro proposal must be additive,
such as deeper analysis, automation or higher personal limits. It may not hide
the trust surfaces or remove capabilities listed as permanently Free.

## Locale And SEO Contract

The launch locale set is `en`, `es`, `fr`, `de`, `it` and `pt`. UI composition
must tolerate longer translated labels. A locale alternate may be emitted only
when the exact backed route exists for that locale.

Personal, support, provisional legal and internal review routes remain
`noindex`. Public entity URLs become indexable only with published backing data,
coherent localized metadata and confirmed locale existence.

## Navigation Contract

The mobile bottom navigation is fixed to Today, Explore, Multi-Picks, Results and
Saved. Desktop navigation also exposes Oracle Daily as a distinct sixth destination;
mobile exposes Oracle Daily inside the hamburger menu.
Predictions belongs to Today. Performance belongs to Results. Oracle Pick
belongs inside Today and Match. Streaks belongs to Explore. Account and legal
surfaces belong to the utility layer.

Streaks is an integral Explore capability, not a buried utility. Its entry
points are fixed: a visible Today header action, the first Explore discovery
card, entity Streaks tabs and the Match evidence section. Entity and Match
links must preserve team, competition or country context in the explorer.

Desktop may use a left rail and contextual right rail. Mobile uses the compact
header and five-item bottom navigation. No API integration may require a
desktop-only action.

The mobile hamburger menu is one shared contract across all active routes. It
must not duplicate the five destinations already fixed in the bottom navigation.
Its ordered destinations are Oracle Daily, Streaks, Profile, Preferences and Support.
Feature pages must not replace it with page-specific or partial menu contents.

## Integration Order

1. Read-only fixtures, entities and published predictions.
2. Match intelligence and streak evidence.
3. Published Multi-Picks and immutable result history.
4. Authentication, saved state, preferences and alert delivery.
5. Builder and analyzer persistence.

## Accumulator And My Picks Contract

`/{locale}/multi-picks` is the canonical Accumulators destination. Its default
state is Daily Multi-Pick and its secondary state is Weekly Multi-Picks.

`/{locale}/betslip` is a separate published product backed by the internal daily
betslip pipeline. Oracle Daily contains one focused publication targeting
`3.00-3.99` total odds.
It must not be merged with the multi-band, multi-option Accumulators product.

My Picks is a third, personal concept: the mutable selection tray shown while browsing. On
desktop it remains a compact contextual rail; on mobile it remains a compact
persistent bar. Its continuation action opens `/{locale}/multi-picks/builder`,
whose display name is Multi-Pick Builder. My Picks is not a published Multi-Pick and is not
an indexable content surface.
6. Final legal copy and production indexing review.
7. Oracle Pro only after a separate product and commercial approval.
