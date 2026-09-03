# MyBetOracle V3 Launch Execution Plan

Status: Active

This is the canonical implementation order for taking V3 from the approved UI
prototype to production. Future sessions should refer to phases by the stable
numbers below, for example: `start Phase 1`, `continue Phase 3`, or
`review Phase 6`.

## Launch Principle

Ship a stable, useful V3 and improve it with real customer feedback. Do not
delay launch for subjective visual perfection.

During integration, change the approved UI only to resolve a launch blocker:

- broken navigation or dead controls
- incorrect, missing or misleading data
- incorrect prediction or settlement states
- authentication or subscription failures
- mobile overflow or unusable responsive behaviour
- missing or broken translations
- SEO, indexing, analytics, monitoring or deployment failures

Non-blocking visual preferences belong in the post-launch UI backlog. Features
that cannot work reliably at launch should be hidden rather than presented as
functional. Oracle Pro remains deferred. The public landing page remains last.

## Phase 1 - Today and Match Details

Connect the daily match-intelligence feed and canonical match pages to real
fixtures, predictions, markets, teams, competition data and match evidence.

Exit criteria:

- real date-driven Today feed in all six locales
- market switching returns the correct prediction
- match links open the correct canonical detail route
- match status, kickoff, result and settlement states are accurate
- loading, empty and service-error states work
- metadata and structured data describe the real fixture

## Phase 2 - Streaks

Connect Streak Explorer and match-level streak evidence to the production
streak data source without mixing overall, home and away scopes.

Exit criteria:

- filters and team views use real streak data
- evidence dates, samples and eligibility states are accurate
- match pages show the correct teams and venue scopes
- unavailable and building-history states remain explicit

## Phase 3 - Multi-Picks and Oracle Daily

Connect the separate Multi-Picks and Oracle Daily products to their real
published records, recorded odds and settlement states.

Exit criteria:

- daily and weekly Multi-Picks remain distinct
- Oracle Daily remains distinct from Multi-Picks
- publication options, selections and odds are immutable after publication
- empty category arrays are treated as unavailable content, not valid output
- historical publications and results open correctly by date

## Phase 4 - Results

Connect the verified results hub to settled Multi-Picks and individual Oracle
predictions.

Exit criteria:

- won, lost and void outcomes match the published selection
- original selections and recorded odds remain visible
- date, market and outcome filters return correct records
- performance calculations use decided results and expose sample sizes

## Phase 5 - Saved Items and Preferences

Persist saved matches, saved Multi-Picks, followed teams and competitions,
notification preferences and relevant watchlist behaviour.

Exit criteria:

- saved state survives sessions for signed-in users
- follow and unfollow actions are consistent across surfaces
- alert preferences persist and map to supported notification events
- signed-out behaviour is intentional and does not lose data silently

## Phase 6 - Authentication and Subscriptions

Connect account identity, sessions, profile settings and the existing
subscription system required for launch.

Exit criteria:

- sign-up, sign-in, sign-out and session recovery work
- protected actions handle signed-out users clearly
- subscription state and entitlements are authoritative
- Free-user access is explicitly defined and consistently enforced
- Oracle Pro remains hidden or clearly deferred unless separately approved

## Phase 7 - Production Readiness

Complete the operational work required to release and observe V3 safely.

Exit criteria:

- production SEO, canonical URLs, alternates, sitemap and robots are verified
- analytics cover acquisition and core product journeys
- client and server errors are monitored
- performance and responsive behaviour meet the agreed launch bar
- environment configuration and deployment are verified
- smoke tests cover every launch-critical route

## Phase 8 - Landing Page and Launch

Build the public landing page from the final working product, complete the
launch candidate review and release V3.

Exit criteria:

- landing claims match functionality available in production
- primary calls to action enter working product journeys
- final production smoke test passes across all six locales
- rollback and incident ownership are documented

## After Launch

Prioritise UI improvements using customer behaviour, support feedback,
analytics and observed conversion or retention problems. Do not reopen the
entire design system for isolated preferences.
