# MyBetOracle V3 Product Entry Architecture

Status: Frozen product-map contract

## One Source Of Entry

V3 uses **Today's Match Intelligence** as the default product workspace at
`/{locale}/today`. It is not a landing page and it is not only a list of
predictions. It is the daily football index from which every football object
and decision workflow can be reached.

The fixture is the central product entity:

```text
date -> competition -> fixture
                         |-> match intelligence and predictions
                         |-> teams, league and country
                         |-> markets and Oracle Pick
                         |-> save/watch state
                         |-> Multi-Pick Builder and Pick Analyzer
                         `-> result and measured performance
```

This prevents V3 from becoming a collection of disconnected pages. Search,
saved items, calendars and discovery all resolve to the same fixture,
competition, team and market identities.

## Global Product Shell

The primary product navigation remains deliberately small:

1. **Today** - the date-driven match intelligence workspace.
2. **Explore** - predictions, leagues, teams, countries and markets.
3. **Multi-Picks** - published Daily and Weekly Multi-Picks, Multi-Pick Builder and Pick Analyzer.
4. **Results** - Multi-Pick wins, completed predictions and compact measured performance.
5. **Saved** - followed fixtures, teams, competitions, markets and watchlists.

Oracle Pro is deferred and absent from the launch shell. Profile, preferences,
language, support and legal pages belong to the utility and account layer.

## Surface Ownership

| Product surface | Proposed route | Primary entry |
| --- | --- | --- |
| Today's Match Intelligence | `/{locale}/today` | Default product workspace |
| Predictions | `/{locale}/today` | Date and market controls in the daily workspace |
| Match details | `/{locale}/match/{fixtureSlug}` | Any fixture row or search result |
| Oracle Pick | Embedded in Today and Match | Featured daily intelligence module |
| Explore overview | `/{locale}/explore` | Global Explore navigation |
| Competitions | `/{locale}/competitions/{competitionSlug}` | Explore, search, competition headings |
| Teams | `/{locale}/teams/{teamSlug}` | Explore, search, match participants |
| Countries | `/{locale}/countries/{countrySlug}` | Explore and competition hierarchy |
| Markets | `/{locale}/markets/{marketSlug}` | Explore and prediction context |
| Team streaks | `/{locale}/streaks` | Explore, team pages and fixture comparison |
| Calendar | `/{locale}/calendar` | Date control in Today |
| Published Multi-Picks | `/{locale}/multi-picks` | Primary Multi-Picks navigation, Today shortcut and curated publications |
| Oracle Daily | `/{locale}/betslip` | Desktop navigation and mobile hamburger menu |
| Multi-Pick Builder | `/{locale}/multi-picks/builder` | Continue from the personal My Picks tray |
| Pick Analyzer | `/{locale}/pick-analyzer` | Multi-Picks navigation and builder review |
| Performance | `/{locale}/results` | Secondary Results tab and evidence links |
| Results | `/{locale}/results` | Primary Multi-Pick history, singles and trust summary |
| Saved and watchlists | `/{locale}/saved` | Save controls and primary navigation |
| Oracle Pro | Deferred; no approved route | Separate future product review |
| Profile | `/{locale}/profile` | Account menu |
| Preferences | `/{locale}/preferences` | Account menu |
| Support | `/{locale}/support` | Utility menu and footer |
| Responsible play | `/{locale}/responsible-play` | Utility menu and footer |
| Legal | `/{locale}/privacy`, `/{locale}/terms` | Utility menu and footer |

Routes are contracts, not a signal to generate public pages blindly. Published
SEO URLs must continue to follow the existing backing-data and locale-existence
rules when integration begins.

`/{locale}/predictions` and `/{locale}/performance` are retired compatibility
routes. They permanently redirect to Today and Results respectively. They must
not return as primary product destinations without a new approved use case.

The global Explore action resolves to `/{locale}/explore`. Streaks is a child
of discovery and must not replace the Explore entry point.

## Results Hierarchy

Results is one historical destination with three levels:

1. Multi-Pick Results leads with recent wins and complete published combinations.
2. Prediction Results provides the settled single-pick archive.
3. Performance Summary contains sample-backed market and Oracle Score analysis.

The product does not expose separate Results and Performance destinations.
Multi-Pick wins are the primary proof surface; aggregate statistics support
that record rather than replacing it.

## Today Page Composition

Desktop uses three coordinated regions:

- a stable navigation and followed-competition rail
- a central date-filtered fixture feed grouped by competition
- a contextual intelligence rail for Oracle Pick, selected match evidence and
  the current Multi-Pick

Mobile converts the shell to a compact header and bottom navigation while the
feed remains the primary vertical surface. Context actions stay on the match
row so the workflow does not depend on a desktop side panel.

## Match Page Composition

`/{locale}/match/{matchSlug}` is the canonical fixture destination. A match row
opens this page directly. It preserves the competition and fixture identity at
the top, then coordinates Oracle analysis, relevant team streaks, head-to-head,
probable lineups, team comparison statistics and standings context.

Embedded streaks are contextual evidence, not a second Streak Explorer. Each
record keeps its overall, home or away scope visible, and the full discovery
workflow remains owned by `/{locale}/streaks`.

Match metadata, canonical URL, confirmed locale alternates, SportsEvent data
and visible fixture content must resolve from the same published fixture
record. Missing or unpublished records become 404s; integration failures must
remain errors rather than false missing pages.

## Published Multi-Picks Contract

`/{locale}/multi-picks` displays immutable daily and weekly Multi-Pick
publications produced by DoubleEngine. It is the primary Multi-Picks surface and
remains separate from the user-created Multi-Pick Builder and Pick Analyzer tools.

Oracle Daily remains a separate product at `/{locale}/betslip`. The server
publishes one daily selection set in the `3.00-3.99` range, while Multi-Picks publishes multiple
daily and weekly variants across target bands. User-added selections are called
My Picks and continue into Multi-Pick Builder; they are neither published product.

The page renders configured odds bands, available variants and variable leg
counts from the service result. A configured band with no qualifying
combination stays visible as unavailable. The UI must never create placeholder
combinations or weaken eligibility rules to fill a band.

Published leg and total odds are frozen SportyBet snapshots. Average leg
confidence is the arithmetic average of leg confidence scores, not a combined
winning probability. Options are alternative optimized combinations, not guarantees.

## Reference Position

Flashscore is a useful reference for density, predictable competition grouping,
date navigation and the speed of moving from a fixture list to detail. V3 must
remain original and distinct: it prioritizes explainable decision intelligence,
risk and evidence rather than presenting scores as the final product value.

## Streak Explorer Contract

Streak Explorer is an Explore surface, not an Oracle prediction surface. It
presents historical team and market evidence computed by DoubleEngine strictly
before the displayed `asOf` date. Overall, home and away scopes remain separate.
The UI must never describe a historical run as a guarantee or probability that
the pattern will continue.

The V3 prototype consumes mock data behind a `StreakExplorerService` boundary.
Integration should replace that implementation only after the UI is approved.
The current backend exposes team-specific streak records; a future aggregated
endpoint is required for a production-wide strongest-streak feed.
