# MyBetOracle V3 Build Status

Last updated: 2026-09-05

Competition-season release checkpoint — 2026-09-05:

- See `docs/COMPETITION_SEASON_INTEGRATION.md` for the approved integration,
  verified real-data evidence and exact release status.
- Competition overview, fixtures, results, grouped standings and predictions
  now use a dedicated season-scoped BFF read instead of the first Today page.
- Real Premier League check: 380 fixtures, 20 standings teams, all six locales.
  TypeScript, focused lint, localization verification and production build pass.
- DoubleEngine `35b90f9` and BFF `f77b9d8` are pushed and production BFF checks
  pass for all five views / six locales, including real standings and auth/404s.
- Frontend implementation `e81f5fe` is ready for the dependent main push;
  verify the public frontend after Coolify completes that deployment.
- Prior approved pending fixes preserve nullable Oracle Daily team abbreviations,
  correct its auth route, and hide Today controls that have no working action.

Live launch remediation checkpoint — 2026-09-03:

- Today now maintains one date-scoped SSE connection rather than subscribing
  to only the first 50 loaded fixtures. Score, minute, status, and prediction
  settlements update from the same canonical DoubleEngine event.
- Cursor pages load automatically near the end of the rendered feed while the
  existing button remains as an accessible retry/fallback control.
- Match Details keeps immediate score updates and performs a no-store refresh
  only after a fixture event, so timeline, statistics, lineups, standings, H2H,
  and settled predictions can advance without browser polling.
- The Match Details hierarchy and readability were strengthened within the
  approved design system; the oversized shortcut was corrected to the shared
  `kbd` treatment and explicit Won/Lost/Void states are visible.
- Significant Next.js decision: the browser-facing SSE and event-refresh
  handlers remain dynamic Route Handlers. Server-only BFF credentials stay in
  server modules and are never sent to the client.

Frontend production cutover checkpoint — 2026-09-03:

- The founder approved deployment of the V3 frontend launch candidate.
- The Next.js 16 Docker deployment uses standalone output. A `.dockerignore`
  now excludes local environment files, build output, dependencies and logs
  from the Docker build context.
- Sitemap match discovery is bounded to yesterday through the next three days.
  The verified English production response contains 3,639 canonical fixtures
  in 1.18 MB, below Next.js's 2 MB fetch-cache boundary; malformed alternatives
  are not generated.
- Production verification against `https://api.mybetoracle.com` passes: all 122
  shared translation keys and 12 feature catalogues are complete across six
  locales, ESLint passes, and the production build generates all 137 current
  routes without a data-cache warning.
- The production service must provide the server-only BFF URL/key at runtime
  and all `NEXT_PUBLIC_*` Firebase/site values during the Docker build. Local
  `.env.local` remains ignored and must never be committed or copied into the
  image context.

Launch review checkpoint — 2026-08-28:

- The Add to My Picks affordance is temporarily hidden from Today fixture rows,
  the Today selected-fixture rail and the mock Match Details Oracle panel. The
  existing selection state, handlers, builder workflow, labels and backend
  contracts remain in source for later reviewed activation.
- Browser verification confirmed zero rendered My Picks action buttons on the
  local Today and Match Details routes. The frontend remains local.
- A revised Phase 1B Match Details and Live Scores plan is recorded at
  `../../../DE/doubleengine/plans/mybetoracle-v3-match-details-end-to-end-integration.md`.
  It awaits founder approval and does not authorize implementation or
  production activation.

Launch-scope adjustment — 2026-08-26:

- Cards and corners are temporarily hidden from the Today market navigation and
  every Streak Explorer presentation path because those feeds are not ready for
  launch.
- Today now consumes the six-group launch contract: Regular, GG/NG, O/U 2.5,
  Mixed, Correct Score, and Oracle Pick. Regular preserves the exact 1X2 or
  Double Chance settlement type; Team to Score is an allowed Mixed option, not
  a standalone group.
- Deferred card/corner streak metrics and underlying provider evidence remain
  available for later reviewed activation without entering the launch UI.
- Direct Streak Explorer query parameters for card or corner categories/metrics
  now fall back to the default Wins view instead of exposing unfinished data.

Prediction-catalog correction — 2026-08-26:

- DoubleEngine `prediction-v3` generates six compact, revisioned records per
  eligible fixture and persists Oracle Pick as an exact source prediction.
- Mixed is restricted to Regular, Over 1.5, Under 3.5, Over 2.5, Home to score,
  and Away to score. Odds-based value refinement and ML remain deferred.
- The BFF exposes `mbo-today-v2` from a separate cache namespace and V3 renders
  that authoritative contract without frontend prediction-selection policy.
- Obsolete unreferenced Today mock-data files were removed. Targeted
  DoubleEngine generation/settlement/read tests, BFF API/cache tests, Prisma
  validation, DoubleEngine build, and V3 TypeScript verification pass locally.

Canonical launch order: `docs/V3_LAUNCH_EXECUTION_PLAN.md`. Use its stable
Phase 1 through Phase 8 numbering for all integration and launch sessions.

## Current Stage

The core product prototype is complete for integration planning.
Authentication, authorization, API integration and production data logic remain
deferred. The public landing page remains last and the root route currently
enters Today.

The active Today integration plan is approved and is recorded at
`../../../DE/doubleengine/plans/mybetoracle-v3-today-end-to-end-integration.md`.
Its cross-session checkpoint is
`../../../DE/MYBETORACLE_V3_TODAY_ACTIVE_HANDOFF.md`. The founder approved the
reviewed Phase 1A implementation scope on 2026-08-17.

A 2026-08-17 integration-readiness visual audit retained the approved design
direction but identified Phase 1A quality defects: mock identity initials,
approximately 8.5px mobile market labels, several 28-38px mobile action targets,
compressed spreadsheet-like feed areas, and a market strip that must remain
readable as the product catalogue evolves. These are now measurable
integration acceptance items, not a redesign of the locked design system.

Phase 1A is now implemented locally end to end behind disabled-by-default
activation flags. Today uses a locale-aware Server Component request to the
MyBetOracle Server BFF, validates the complete launch prediction contract, renders
real identity assets and nullable scores, exposes truthful stale/empty/error
states, and keeps Match Details navigation disabled until Phase 1B establishes
its real contract. Production build, TypeScript, targeted lint, and
390/768/1024/1440 responsive browser verification pass. Node 24 cross-service
smoke testing, migration, deployment, and activation remain.

## Approved Foundations

- Standalone Next.js 16 V3 repository with Tailwind CSS 4.
- React Compiler enabled through the standard Next.js starter configuration.
- Mandatory version-matched Next.js documentation workflow in `AGENTS.md`.
- Canonical premium blue visual system in `docs/V3_DESIGN_SYSTEM.md`.
- Six initial locale routes: `en`, `es`, `fr`, `de`, `it`, and `pt`.
- Joined MB plus football O recognition silhouette for the V3 logo system.

## Product Architecture

- `/{locale}/today` is the single daily product entry, not a landing page.
- Fixtures are the shared entity connecting predictions, match intelligence,
  competitions, markets, saved state, tools and measured results.
- The mobile bottom shell is limited to Today, Explore, Multi-Picks, Results and Saved.
  Oracle Daily is visible in desktop navigation and the mobile hamburger menu.
- Oracle Pro is deferred and absent from the launch shell. Account, support and
  legal are utility surfaces.
- Full route ownership is recorded in `docs/V3_PRODUCT_ENTRY_ARCHITECTURE.md`.

## Implemented UI

### Connected Product Graph

The UI-only prototype now has one connected route graph across all six locales.
`Explore` is the canonical discovery entry and links to the match calendar,
competition, team, country and market directories, entity detail pages and the
Streak Explorer. Visible fixture slugs resolve to match-detail pages; match
pages link back to their teams, competitions and countries.

The Multi-Picks product now includes published Daily and Weekly Multi-Picks, Multi-Pick Builder
and Pick Analyzer. The account perimeter includes Profile, Preferences, Support,
Responsible Play, Privacy and Terms. Personalized and provisional policy pages
remain `noindex` until authentication, persistence and final legal copy are
integrated. Oracle Pro and the public landing page remain deliberately deferred.

Oracle Daily is a separate typed mock-backed route at `/{locale}/betslip`,
matching the server's single daily `3.00-3.99` publication rather than the
multi-band Accumulator engine.

Current production build: 394 statically generated pages across `en`, `es`,
`fr`, `de`, `it` and `pt`.

### Saved and Watchlists

Route: `/{locale}/saved`

Current prototype includes a next-attention return summary, tracked matches,
saved active and winning Multi-Picks, followed teams and competitions,
notification-category controls and a branded share-receipt preview. Data is
isolated behind a typed `SavedService` boundary and the route is private/noindex
by default.

Verification completed: clean lint and production build, all six locale routes
generated, desktop visual review with no horizontal overflow, no browser console
warnings or errors, and working Matches, Multi-Picks, Alerts and share-receipt
interactions. The connected external browser did not honor its temporary mobile
viewport override during this final pass; responsive breakpoint rules remain in
place for the dedicated mobile review.

### Results Hub

Route: `/{locale}/results`

Current prototype leads with recent Multi-Pick wins and a date-ordered archive
of daily and weekly Multi-Picks. Every slip retains target and actual odds,
option number, complete legs, final scores and leg outcomes. Individual
prediction results and sample-backed performance are secondary tabs.

Verification completed: clean lint and production build, six-locale static
generation, canonical and confirmed locale-alternate inspection, desktop and
390px mobile visual review, no page overflow and no console warnings/errors.

### Retired Standalone Predictions

Compatibility route: `/{locale}/predictions` -> `/{locale}/today`

Product review found that a standalone Predictions page duplicated the daily
workspace. Predictions remain content within the date-driven match surface;
the separate destination is retired. `/{locale}/performance` likewise
redirects to the consolidated Results hub.

Verification completed: clean lint and production build, six-locale static
generation, desktop and 390px mobile visual review, no page overflow and no
console warnings/errors.

### Today's Match Intelligence

Route: `/{locale}/today`

Current prototype includes:

- responsive desktop, tablet and mobile product shell
- search across mock teams, competitions and market selections
- date navigation and All, Live, Oracle 80+ and Following filters
- competition-grouped fixture feed
- live score, Oracle Score, market, odds and risk presentation
- match save/watch interaction
- contextual selected-match intelligence panel
- Multi-Pick add/remove interaction and mobile action bar
- verified performance summary
- mock data isolated from the visual component contract
- static generation for all six supported locales from one route tree

Verification completed:

- `yarn lint` passes
- `yarn build` passes
- desktop and 390px mobile browser review completed
- Multi-Pick interaction verified
- no browser console warnings or errors observed

Integration checkpoint — 2026-08-21:

- Phase 3A is founder-approved and locally wired through DoubleEngine,
  MyBetOracle Server and V3 as `mbo-multi-picks-v1`.
- The runtime route no longer imports mock publications or a hard-coded date.
  It is request-driven by validated URL date and calls only the BFF.
- Real identity assets, localized selections, immutable publication odds,
  daily/weekly separation and explicit unavailable bands are preserved.
- Date navigation, locale preservation and local bounded search work; Saved,
  share, Match Details and history actions are disabled where their contracts
  are not yet available.
- Production currently has no accumulator publications because historical
  evidence depth does not satisfy VIP eligibility. This remains a truthful
  unavailable state; thresholds were not weakened and no data was mocked.
- Focused verification passes: DoubleEngine 8/8, BFF 3/3 and V3 TypeScript.
  The existing local port-3000 process returns HTTP 200 without prototype
  records but lacks BFF environment configuration, so it renders the expected
  service-unavailable state. Fresh browser visual QA is pending because the
  browser-control runtime could not initialize.

Review adjustments completed:

- strengthened tertiary text on both light and Midnight surfaces
- increased the smallest match, evidence and performance labels
- strengthened dense match-table dividers and inactive save controls
- improved mobile summary and bottom-navigation legibility
- corrected the active date number contrast on Action Blue
- added Oracle Best, Regular, Mixed, Over/Under and Goals prediction lenses
- made feed recommendations, odds, risk and settlement change by lens
- added premium Won, Lost and Void result states using icon, text and color
- constrained the desktop workspace to leave future advertising gutters
- compacted headers, controls and match rows to expose more fixtures above fold
- removed the competing numeric confidence percentage from the daily feed
- removed repeated market, risk, confidence, country and Oracle Score captions
- simplified market navigation to familiar short labels with hover titles
- preserved the prediction itself as the only secondary line on mobile fixtures

## Awaiting Review

### Published Multi-Picks

Route: `/{locale}/multi-picks`

Current prototype includes:

- Daily and Weekly publication switching with timezone-aware windows
- API-driven band and variant rendering with variable leg counts
- unavailable configured bands and a no-qualifying-combination state
- immutable published totals and per-leg SportyBet odds snapshots
- explicit average leg confidence language without combined-win claims
- compact variable-length selection list using friendly market labels
- pending, won, lost and void result components with icon and text
- weekly date grouping for selections across multiple match days
- results history drawer with scope, result and odds filter controls
- methodology drawer explaining eligibility, optimization and frozen odds
- recent results and responsible uncertainty trust panels
- save and share prototype controls
- typed mock data behind an `AccumulatorService` boundary
- six-locale foundation label dictionaries
- responsive loading, desktop, tablet and mobile layouts
- Multi-Picks navigation connected from existing V3 surfaces and directly from Today

Verification completed:

- `yarn lint` passes
- `yarn build` passes with all six Multi-Picks locale routes generated
- desktop at 1440px and mobile at 390px visually reviewed
- no horizontal page overflow at either viewport
- no zero-odds or placeholder accumulator rendering
- no browser console warnings or errors observed

### Match Details

Route: `/{locale}/match/{matchSlug}`

Current prototype includes:

- compact competition, kickoff, team, venue, referee and form scoreboard
- Overview, Oracle, H2H, Lineups and Stats navigation
- Oracle decision with one canonical Oracle Score and supporting evidence
- match-relevant team streaks with explicit overall, home and away scopes
- historical-streak disclaimer separating evidence from prediction
- recent head-to-head results and team comparison metrics
- probable lineup presentation and compact competition standings
- saved-match and Multi-Pick controls
- mock fixture data isolated behind a `MatchDetailService` boundary
- localized dynamic metadata, canonicals and confirmed locale alternates
- SportsEvent and BreadcrumbList structured data
- responsive desktop, tablet and mobile layouts plus route loading state
- Today fixture rows connected to the canonical match-detail route

Verification completed:

- `yarn lint` passes
- `yarn build` passes with all six match locale variants generated
- localized metadata, canonical links and six alternates inspected in rendered DOM
- SportsEvent JSON-LD inspected in rendered DOM
- desktop at 1440px and mobile at 390px visually reviewed
- no horizontal page overflow at either viewport
- no browser console warnings or errors observed

### Streak Explorer

Route: `/{locale}/streaks`

Current prototype includes:

- DoubleEngine-aligned contracts for 58 metrics across overall, home and away
- mock data isolated behind a replaceable `StreakExplorerService` boundary
- country, competition, team, category, scope, minimum length and sort controls
- dense strongest-streak feed with evidence sample sizes and strength labels
- upcoming fixture comparison with separate team and venue scopes
- team profiles exposing all metric groups
- explicit building-history, unavailable-evidence and inactive-run states
- evidence and methodology drawers without a fabricated fixture timeline
- responsive desktop, tablet and mobile layouts
- instant route loading skeleton
- Explore navigation from the approved Today shell
- static generation for all six supported locales

Verification completed:

- `yarn lint` passes
- `yarn build` passes
- desktop at 1440px and mobile at 390px visually reviewed
- no horizontal page overflow at either viewport
- no browser console warnings or errors observed

The V3 product surfaces currently ready for review are available at
`http://127.0.0.1:3000/en/today`,
`http://127.0.0.1:3000/en/explore`,
`http://127.0.0.1:3000/en/calendar`,
`http://127.0.0.1:3000/en/competitions`,
`http://127.0.0.1:3000/en/teams`,
`http://127.0.0.1:3000/en/countries`,
`http://127.0.0.1:3000/en/markets`,
`http://127.0.0.1:3000/en/results`,
`http://127.0.0.1:3000/en/multi-picks`,
`http://127.0.0.1:3000/en/multi-picks/builder`,
`http://127.0.0.1:3000/en/pick-analyzer`,
`http://127.0.0.1:3000/en/match/arsenal-v-chelsea` and
`http://127.0.0.1:3000/en/streaks`, and
`http://127.0.0.1:3000/en/saved`,
`http://127.0.0.1:3000/en/profile` and
`http://127.0.0.1:3000/en/support`.

### Six-Locale Product Review

The active V3 route set is localized for English, Spanish, French, German,
Italian and Brazilian Portuguese. This includes discovery and directory pages,
match details, Streak Explorer, Saved, decision tools, route metadata and error
states. Public copy uses `Multi-Picks` and `Oracle Daily`; internal `/betslip`
and accumulator identifiers remain implementation details.

Verification completed:

- `yarn i18n:verify` passes with 122 shared keys and 11 feature catalogs
- `yarn lint` passes
- `yarn build` generates all 394 static pages
- localized `<html lang>` attributes verified in generated output
- mobile `390x844` and desktop `1440x900` checks show no page-level overflow

### Real Results and Saved boundary — 2026-08-21

- `/{locale}/results` now uses the server-only `mbo-results-v1` BFF contract;
  no runtime performance mock is imported by the route.
- Result period, market, outcome and page are URL-driven bounded server reads.
  Real identities/assets/scores and WON/LOST/VOID records render in all six
  locales. Missing historic publication odds are explicit and accumulator
  history remains unavailable instead of synthetic.
- `/{locale}/saved` no longer renders fake saved records or local mutations.
  It shows the protected signed-out state until the reviewed web-auth phase
  supplies a verified Firebase session.
- Local verification: six Results routes returned 200 with real records and no
  prototype fixture; `yarn tsc --noEmit --incremental false` passes. Browser
  screenshots remain blocked by the Codex browser-runtime defect recorded in
  the cross-workspace handoff. Broad lint/build was intentionally deferred.

### Authentication, live Saved and preferences — 2026-08-22

- `/{locale}/auth` now provides email/password sign-in and sign-up, password
  recovery, Google, Apple and phone OTP parity with the legacy web product.
  Firebase browser state is in-memory only and is exchanged for an HttpOnly
  same-origin server session.
- Public football routes remain anonymous. Saved, Profile and Preferences use
  verified server sessions and private/no-store API responses; signed-out
  callbacks preserve the originating route.
- Today stars now persist through the authenticated Saved API. The Saved page
  is server-rendered using real canonical fixture hydration from one bounded
  DoubleEngine batch, and removes/alert updates use optimistic rollback.
- Profile renders the real verified account identity. Preferences persist the
  reviewed product-specific contract; no lineup switch, price, checkout or
  guessed premium gate was introduced.
- Focused evidence: BFF auth/Saved 9/9, DoubleEngine build-source TypeScript
  clean, V3 TypeScript clean, changed BFF JavaScript syntax clean. Local HTTP
  returned auth 200, anonymous Saved 200, protected Profile/Preferences 307 to
  auth, and missing-origin session mutation 403.
- Browser screenshot QA remains blocked by the external bundled-runtime
  `node:process` defect. Broad lint/build and production deployment remain
  intentionally unperformed.

Live Firebase email/password verification subsequently passed against the
existing production Firebase project: registration, login, HttpOnly session,
Profile SSR, Saved Firestore persistence, Saved SSR, removal, logout and
post-logout rejection. The temporary identity and Saved reference were deleted.
Only the isolated Auth/Saved BFF was used for the successful run; both local
processes were stopped afterward.

### Live Streak Explorer reliability and UI correction — 2026-08-26

- `/{locale}/streaks` now renders real DoubleEngine snapshots through the V3
  BFF. No runtime mock streak records are used.
- DoubleEngine keeps historical point-in-time snapshots authoritative and now
  maintains an additive `team_streak_current` discovery projection. Explicit
  `asOf` reads remain historical; normal current discovery uses the projection.
- The production migration populated 1,733,562 current identities. The global
  overall query measured 497 ms cold and 209–295 ms warm at PostgreSQL, versus
  the previous 8-second service timeout.
- The deployed V3 BFF chain returned 20 real records from 16,362 eligible
  overall patterns in 2,235 ms cold and 206–211 ms warm.
- The local UI removes technical cache/update wording, no longer auto-selects
  or duplicates a team filter, and keeps country, competition, minimum length,
  and sort inside one compact filter drawer. Category and venue scope remain
  immediately available.
- The global payload no longer sends hundreds of team/competition choices
  before the user narrows by country. Direct team/profile contracts remain
  available for their proper product surfaces.
- Country facets with no stored three-character code now retain their canonical
  identity (for example, `England`) through V3, the BFF, and DoubleEngine. The
  indexed competition-ID lookup measured 215 ms and browser verification
  returned 22 English competitions and 1,114 matching patterns.
- Upcoming fixture comparison is requested only for an explicit selected-team
  context; global and country discovery no longer fetch or display unrelated
  fixtures.
- Browser verification passed for real global rendering and Overall → Home URL
  navigation without an artificial `asOf` parameter. V3 TypeScript and 20
  focused DoubleEngine/BFF tests pass. The frontend remains local and unpushed.
- The discovery hierarchy now opens directly on `WIN` and exposes exact
  one-click views for Wins, Losses, Over 2.5, GG (`BTTS_YES`) and NG
  (`BTTS_NO`). Over 1.5, First Half and Corners remain immediately available as
  a quieter secondary row; the wider engine catalogue is no longer the first
  interaction users must decode.
- Exact metric and category views are URL-driven and server-filtered through
  the existing BFF contract. Losses, GG and First Half were verified to return
  only their intended evidence sets. The 390x844 browser check passed with all
  shortcuts visible, 20 real Wins rows, and no horizontal page overflow.
