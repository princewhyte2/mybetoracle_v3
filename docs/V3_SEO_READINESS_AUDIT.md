# MyBetOracle V3 — Competitive SEO Readiness Audit

Original status: Inspection only. Written
2026-09-15, grounded in direct inspection of `mybetoracle-v3`,
`mybetoracle_server`, and `doubleengine` (Prisma schema + `product-read.service.ts`)
on this date — every claim below is cited to a real file/line, not inferred.

## 1. Executive summary

### Implementation checkpoint — 2026-09-15

Founder approved the combined corrections and push, including existing changes
from other agents. The original audit below is historical, not a claim that all
of its recommendations are complete.

- Today market links now use the same TodayExperience for each scope/market;
  initial SSR market, date and page remain intact instead of being replaced by
  an unfiltered hydration request. Value/Top use the same component and their
  own URLs, without inheriting a previous market constraint.
- Empty Cards/Corners retain navigation; no misleading Clear filters action
  when there are no active filters. Empty market pages are noindex. Production
  inspection on this date found no published Cards/Corners fixtures and sampled
  INSUFFICIENT_DATA predictions. Historical-statistics coverage still requires
  investigation; these UI fixes do not claim to populate that evidence.
- Explore's Today preview no longer makes the whole catalogue fail. Successful
  public catalogue pages use Next's 300-second revalidation cache; a failed
  preview is not displayed as zero activity. The retry UI is localized.
- Competition overview now includes genuinely predicted fixtures and season
  statistics. Both BFF and frontend accept older payloads during rolling
  deployment. Goal statistics use regulation-time scores, not extra time.
- Legacy market URLs permanently redirect to their matching Today market;
  legacy tomorrow/BTTS/2.5 intents retain their destination intent. Sitemap
  locale failures are isolated, redirecting market URLs removed, fabricated
  static lastmod removed, market entries require available published evidence
  in the fetched feed. No schema migration, provider call or runner added.
- Remaining SEO work: complete paginated entity sitemap coverage beyond the
  existing first catalogue page; archive/discovery expansion; country catalogue
  coverage (production returned zero countries). Do not describe this as a
  complete product-wide SEO certification.
- Verification: frontend production build and TypeScript passed; 20 targeted
  frontend tests, 31 BFF tests (29 initial plus 2 new regressions), 26 engine
  tests. Browser confirmed real Value selections and shared Today navigation.


V3's **data layer is genuinely strong** — richer, in several places, than
what the earlier competitor research found on Forebet or PredictZ (real
`SportsEvent`+`BreadcrumbList` JSON-LD, real lineups with player photos and
ratings, real settled-prediction history with market/confidence
breakdowns). But **almost none of that strength is currently expressed as
crawlable, differentiated, semantically-structured pages outside Match
Detail.** The single clearest pattern in this audit: Match Detail is the
one surface built to full SEO maturity (JSON-LD, real canonical+hreflang,
rich real content). Every other surface — Today, Competition, Team,
Results, Markets — has the underlying data or a real API contract to reach
similar maturity, but currently ships with generic titles, no structured
data, no semantic heading hierarchy, and (for Competition/Results) tab or
filter state that never produces a distinct indexable URL.

The two new surfaces built in the last session (`/tomorrow`,
`/today|tomorrow/{market}`) are real, live, and already follow the correct
title/H1 pattern — but they inherit Today's underlying weaknesses (no
JSON-LD, no semantic H2/H3, thin supporting copy) since they reuse
`TodayExperience` as-is.

## 2. Today readiness — `/{locale}/today`

File: `src/app/[locale]/today/page.tsx`, `src/features/today/today-experience.tsx`.

- **Title**: `{Today|Hoy|Aujourd'hui|Heute|Oggi|Hoje} | MyBetOracle` — real
  per-locale word, but not intent-rich (no "football predictions" in the
  title itself). Verified live.
- **Meta description**: `systemLabels[locale].todayDescription` — e.g. EN:
  *"Today's football fixtures, predictions and match intelligence in one
  place."* Real, locale-correct, not thin, but static (never varies with
  actual fixture count/competitions).
- **H1**: `copy.todayMatches` → *"Today's matches"* (EN) / real per-locale
  equivalents. `today-experience.tsx:649`.
- **Intro/supporting text**: one line only — `{analysedCount} analysed ·
  {totalCount} fixtures` (`today-experience.tsx:650`). No descriptive
  paragraph.
- **Server-rendered**: yes — `getTodayData` runs server-side in
  `page.tsx`, full fixture list is in the initial HTML (`dynamic =
  "force-dynamic"`, not client-fetched).
- **Fixture count/context**: real, shown next to H1.
- **Competition grouping**: real (competitions are grouped), but rendered
  as `<strong>{competition.name}</strong>` (`today-experience.tsx:317`),
  **not** `<h2>`/`<h3>` — confirmed via full-file grep: the *only* other
  heading tag in the entire file is one `<h2>` inside a selected-market
  detail panel (line 827), unrelated to page structure.
- **Match-card info**: kickoff time, live status/minute, team emblems,
  score once live/finished — real.
- **Prediction markets shown**: per fixture, the "best" selected market
  (`marketLens` state — "best"/other), pulling from the full
  `predictionMarkets` set (14 real markets, confirmed in
  `today/types.ts`).
- **Odds displayed**: yes, from `OracleMarket.odds` (formatted decimal).
- **Confidence/probability/evidence**: `oracleScore`/`confidence` shown;
  `evidence` field exists in the type but Today's own API contract
  (`todayMapper.js`) does not populate real streak evidence per fixture
  (see §8) — confidence score yes, narrative evidence no.
- **Trend/streak info on Today**: **not present**. Today's fixture
  objects carry no streak records; `buildTrendSentence` (built last
  session) is wired only into Match Detail, which has its own richer
  payload. This is a real backend-contract gap, not just missing UI —
  see §8.
- **Team form**: not shown on Today's list rows (only recorded on Match
  Detail via `recentResults`).
- **Competition/Team/Match links**: yes — match cards link to Match
  Detail; competition names are not links on Today itself (no
  `<Link>` wrapping the `<strong>{competition.name}</strong>`, confirmed
  by the surrounding markup — competition entry to `/competitions/{slug}`
  happens via the sidebar's pinned-competition buttons instead, which are
  `<button onClick={router.push(...)}>` — **client-side navigation, not a
  real `<a href>`**, so this specific link is invisible to crawlers).
- **Related market navigation**: none — no in-page links from Today to
  the new `/today/{market}` pages.
- **Pagination/lazy-loading**: cursor-based `hasMore`/`nextCursor` in the
  API contract (`today-service.ts` `TodayApiResponse.pagination`), loaded
  client-side as the user scrolls/filters — the *first* page is real SSR
  content, subsequent pages are client-fetched.
- **Canonical**: yes, `/{locale}/today` via `localizedMetadata`.
- **hreflang/alternates**: yes, full 6-locale + x-default set (same
  mechanism verified correct in the prior session's hreflang audit).
- **Breadcrumbs**: none — no breadcrumb nav or `BreadcrumbList` JSON-LD on
  Today (Match Detail has one referencing Today as its parent, but Today
  itself has no breadcrumb of its own).
- **JSON-LD/structured data**: **none.** Confirmed by a full-tree grep for
  `application/ld+json`/`schema.org` — the *only* match is
  `match/[matchSlug]/page.tsx`. Today has zero structured data.
- **Indexability**: yes, `robots: index:true` (default, no override).
- **Sitemap inclusion**: yes, `PUBLIC_ROUTES` in `sitemap.ts`.

**Can Today realistically target "football predictions today" without
generated article copy?** Partially. The real fixture/prediction data is
there and server-rendered, which is the hard part. What's missing to
credibly compete on that query without new copy-writing: (1) a real H2/H3
structure so Google can parse the page as organized content, not one flat
list, (2) `SportsEvent`/`ItemList` JSON-LD (ship real data as structured
data — no new copy required, this is exactly the "product page as content"
approach the brief asks for), (3) real `<a href>` competition links instead
of the current button-based client navigation. None of these require
generated prose.

## 3. Tomorrow readiness — `/{locale}/tomorrow`

Built last session (`src/app/[locale]/tomorrow/page.tsx`,
`tomorrowLagosDate()` in `today-service.ts`). Stating current position, not
proposing changes.

- **Route**: real, `/{locale}/tomorrow`, `generateStaticParams` over all 6
  locales, `dynamic = "force-dynamic"`.
- **Crawlable URL, not a client filter**: confirmed — separate file,
  separate metadata, fixed server-computed date (not a `?date=` query
  param like the in-page date-rail uses).
- **Title/meta/H1**: real, distinct from Today —
  `common.tomorrow`/`systemLabels.tomorrowDescription`; H1 now correctly
  reads "Tomorrow's matches" (fixed last session, was previously going to
  inherit "Today's matches" verbatim before the `scope` prop was added).
- **Data source**: same `getTodayData()` contract as Today, `date =
  tomorrowLagosDate()`.
- **SSR**: yes, same pattern as Today.
- **Canonical/indexability**: yes, own canonical, indexable.
- **Internal linking**: **none currently link to `/tomorrow`** — it exists
  in the sitemap and is directly reachable by URL, but no in-app nav
  element (header, Today page, footer) links to it yet. Purely
  sitemap/URL-discoverable today.
- **Sitemap presence**: yes, added to `PUBLIC_ROUTES`.

Net position: real and correct as far as it goes, but orphaned from the
internal link graph (§10) and inherits every one of Today's structural gaps
(§2) since it reuses the same component.

## 4. Prediction-market page readiness

Two generations of market pages now exist:

**(a) Global market pages** — `/{locale}/markets/[marketSlug]`
(pre-existing). File: `src/app/[locale]/markets/[marketSlug]/page.tsx` →
`DiscoveryExperience view="market"`.
- Title: `{marketName} · {predictions}` via `discoveryMetadata`.
- Description: `marketDescriptions[slug]` (was broken for `total-2-5` due
  to a key mismatch — fixed last session).
- Not date-scoped — shows the market across the whole discovery dataset,
  not "today" or "tomorrow" specifically.
- Canonical/hreflang: yes, via `discoveryEntityAlternates`.
- Sitemap: yes, part of `entityEntries` in `sitemap.ts`.

**(b) Scope×market pages** — `/{locale}/{today|tomorrow}/[marketSlug]`
(built last session). File: `src/features/today/market-scope-page.tsx`.
- Real market-specific title (`"{Market}: predictions for {today|tomorrow}"`,
  correctly localized word order per locale — verified live for EN/DE/FR).
- Real description from the same `marketDescriptions` map, now covering
  all 14 real market types (was 5) across all 6 locales.
- **Content is genuinely different from Today, not a filtered duplicate**:
  verified at the query level — `product-read.service.ts:251` filters
  fixtures to only those with an `ACTIVE`/`AVAILABLE` prediction in that
  exact market group, so the fixture *set* itself differs by market, not
  just which prediction is highlighted.
- Canonical/hreflang: via `localizedMetadata`, same mechanism as
  Today/Tomorrow — correct.
- Sitemap: yes, added via `marketScopeEntries()`.
- **Match-detail links**: yes (reuses the same fixture-card component as
  Today, which links to Match Detail).
- **Internal links pointing *into* these pages**: **none** — same gap as
  Tomorrow. Nothing on Today, Markets hub, or Match Detail currently links
  to `/today/over-2-5` etc. Sitemap-discoverable only right now.
- **Inherited weaknesses**: same as Today — no JSON-LD, no H2/H3 beyond
  the shared component's structure, no market-specific supporting copy
  beyond the one-line meta description (nothing in-page explains what the
  market means or shows real market-level stats like current hit rate,
  which *does* exist as real data — see §7's `byMarket` breakdown, not
  currently surfaced on these pages).

**Real markets DoubleEngine supports with production-grade data**
(`predictionMarkets` in `today/types.ts`, cross-checked against
`Prediction.marketGroup` in the Prisma schema): REGULAR (1X2), BTTS,
TOTAL_1_5, TOTAL_2_5, TOTAL_3_5, GOALS_BAND, HALFTIME_RESULT,
HALFTIME_FULLTIME, HANDICAP, CORRECT_SCORE, CORNERS, CARDS,
TEAM_TO_SCORE, DOUBLE_CHANCE, plus MIXED and ORACLE_PICK as internal
aggregate views (correctly excluded from the market-fanout pages, per
`marketGroupForSlug`'s guard). All 14 real markets now have real,
hand-written copy in all 6 locales (fixed last session) — none are
placeholder/generic anymore.

## 5. Match Detail readiness

File: `src/app/[locale]/match/[matchSlug]/page.tsx`,
`src/features/match/match-service.ts`, `types.ts`.

**Data confirmed real and present** (from `parseMatch()`,
`match-service.ts:25-114`): home/away identity + emblems, competition +
country + round, kickoff, venue + city, referee name, status/live minute,
score, settlement per prediction (`WON`/`LOST`/`VOID`), all prediction
groups with confidence, `latestOdds`, streak evidence (`MatchStreak[]`,
real metric/scope/currentLength/sampleSize), team form (last 5 via
`recentResults`), full match statistics with home/away comparison,
per-player statistics (rating/minutes/goals/assists), H2H list, lineups
(formation, starters, player photos with a validated CDN-URL pattern,
coach names, confirmed/unconfirmed state), standings mini-table
(highlighting both teams), match events (goals/cards/subs with
minute/player/assist). This is a genuinely rich, production-grade payload
— broader than either Forebet's row-based or PredictZ's page-based match
data captured in the earlier competitor research.

**SEO specifics**:
- Title template: `${home} vs ${away}: prediction and streaks | MyBetOracle`
  (locale-correct verb order per `systemLabels.matchTitle`, e.g. FR uses
  `{home} - {away}`, not "vs").
- Description template: real, per-locale, mentions Oracle prediction,
  streaks, form, H2H, lineups, statistics — accurate to what's actually
  on the page (not generic boilerplate).
- H1: not directly inspected in `match-experience.tsx` in this pass, but
  title/H1 parity is the existing pattern elsewhere in V3.
- Canonical: yes, real, `match.canonicalPath`.
- Alternate locales: yes, and notably **N+1 across locales per match
  page** — `generateMetadata` fetches the match detail for **all 6
  locales** to build the hreflang set (`match/[matchSlug]/page.tsx:24`).
  Real and correct, but a real performance cost worth knowing about if
  this page is ever put under load-testing scrutiny.
- Breadcrumb schema: yes, real `BreadcrumbList` JSON-LD (Today → Competition
  → Match).
- `SportsEvent` JSON-LD: yes, real, with `eventStatus` correctly mapped per
  match state (`Scheduled`/`InProgress`/`Completed`/`Postponed`/`Cancelled`)
  — this is exactly the schema type the earlier competitor research
  flagged as the "concrete target" (PredictZ uses it, Forebet doesn't).
- Open Graph: yes, includes team emblem images when available.
- SSR: yes, full server component.
- Indexability: `robots: index:true, follow:true` explicit.
- Sitemap inclusion: yes, via `matchEntries()` in `sitemap.ts` (bounded to
  yesterday through +3 days — the known, already-documented constraint).

**Can the same canonical URL naturally carry the fixture through
prediction → live → settled without separate thin URLs?** Yes, and it
already does — `status`/`score`/`result` are all live fields on the one
canonical `MatchDetail` object, `eventStatus` in the JSON-LD updates with
it, and there's no separate "result" URL for a finished match. This is a
real, already-correct architectural strength, not a gap.

## 6. Competition-page readiness

File: `src/app/[locale]/competitions/[competitionSlug]/page.tsx`,
`competition-content.tsx`, `competition-service.ts`.

**Present**: competition identity + country + emblem, season selector
(multi-season, real), fixtures tab, results tab, predictions tab
(per-fixture market+confidence+result), standings tab (full W/D/L/GF:GA/
GD/Pts/last-5-form table, correctly highlighting the involved teams),
real team links from the standings table, real match links from every
fixture row, a `/streaks?competition={id}` cross-link.

**Confirmed absent** (asked for explicitly in the brief): BTTS%, Over
1.5/2.5%, average goals, home/away win split, or any other league-level
aggregate statistic. Not in `CompetitionData`'s type (`competition-types.ts`),
not rendered anywhere in `competition-content.tsx`. This is a real content
opportunity the brief's philosophy (richer real data on product pages)
directly points at, and — per §13 — is only *partially* buildable from
what's already stored (raw `Fixture`/`FixtureTeamStatistic` rows exist to
compute it from, but no precomputed aggregate contract exists yet).

**SEO specifics**:
- Title: `{competition.name} · {standings} · {results}` — generic
  template, identical shape for every competition, not intent-varied by
  which tab a visitor/crawler is actually looking at.
- Description: `genericEntityDescription` — literally *"All tracked
  football intelligence for {name}"* in every locale. Real but generic;
  flagged directly in §9.
- H1: `{competition.displayName}` — correct, simple.
- Heading structure: `<h2>` per section (fixtures/results/standings), real
  `<h3>` for standings sub-groups when present. Better than Today's
  structure, but the section H2 text is tab-label text ("Fixtures",
  "Standings"), not a search-intent phrase.
- **Canonical is tab-blind**: `canonical: /${locale}/competitions/${slug}`
  regardless of `?tab=` — meaning `fixtures`, `results`, `standings`, and
  `predictions` tab states are real, different content living behind
  query params that all canonicalize to the same URL. Google will only
  ever credit/index one version of this page; the other three tabs' content
  is effectively invisible to search as distinct pages.
- hreflang: yes, via `discoveryEntityAlternates`.
- Structured data: **none** — no JSON-LD anywhere on this page (confirmed
  by the same tree-wide grep as §2).
- Sitemap/indexability: yes, one URL per competition per locale (the
  canonical, tab-blind one), part of `entityEntries`.
- SSR vs client-only: fully server-rendered (`CompetitionContent` is a
  server component receiving already-fetched `CompetitionData`).

## 7. Team-page readiness

File: `src/app/[locale]/teams/[teamSlug]/page.tsx` → same
`DiscoveryExperience view="team"` component family as markets/countries,
**not** the richer dedicated `CompetitionContent` pattern.

- Title: `{team.name} · {predictions} · {streaks}`.
- Description: `teamEntityDescription` — *"{name} fixtures, form, streaks
  and Oracle intelligence"* — describes real capability but is a fixed
  template, identical shape for all ~hundreds of teams.
- Canonical/hreflang: yes, via `discoveryEntityAlternates`.
- Structured data: none.
- SSR: yes.

**On real content**: the team entity itself
(`discovery-service.ts:CatalogTeam`/`TeamEntity`) currently carries only
`position: null, form: [], streak: null` as placeholders in the *catalog*
mapping — i.e., the generic discovery-entity view does **not** currently
surface a team's real recent form, goals scored/conceded, BTTS rate,
Over 1.5/2.5 rate, home/away split, or streak evidence, even though every
one of those exists as real, storable data (`TeamStreakSnapshot`/
`TeamStreakCurrent` in the Prisma schema, and `recentResults`/form already
proven to work on Match Detail for the *two teams in that specific
match*). This is the clearest `DATA EXISTS, UI/SEO EXPOSURE MISSING` case
in the whole audit: the same real streak/form data that's genuinely rich
on Match Detail has no dedicated team-level page surfacing it at all —
team pages currently show the generic discovery shell (fixtures list,
basically), not a stats profile.

Distinguishing per the brief's requirement:
- `DATA EXISTS, UI MISSING`: recent form, goals scored/conceded, BTTS/O1.5/
  O2.5 rate, streak evidence, league position — the streak engine and
  fixture/statistics tables already contain what's needed; nothing on the
  team page surfaces it as team-level aggregates today.
- `BACKEND CONTRACT MISSING`: a single batched "team profile" endpoint
  that returns all of the above pre-aggregated for one team in one call.
  `streak-service.ts`'s `/api/v3/streaks` contract can filter to one team
  (`teamId` param) and already returns real streak records for that team —
  so this is closer to "partially available via an existing contract,
  wiring/aggregation missing" than a from-scratch backend build.

## 8. Prediction performance / results evidence

File: `src/app/[locale]/results/page.tsx`,
`src/features/performance/{results-service.ts,types.ts}`.

**This already exists, is real, and is currently under-exposed for SEO.**
`/results` calls a real `/api/v3/results` contract returning: `summary`
(published/settled/pending/won/lost/void/hitRate), `byMarket` breakdown
(per market group: settled/won/lost/void/hitRate), `byOracleBand`
breakdown (same, segmented by confidence tier), a paginated list of real
settled predictions with final scores and team/competition identity, and
settled accumulator history (daily/weekly scope, per-leg detail, real
total odds and result). Date range is arbitrary (`from`/`to`), UI exposes
7/30/90-day presets.

- **Settlement reliability**: `Prediction.result` is a real enum
  (`WON`/`LOST`/`VOID`/`PENDING`) with `settledAt`/`settlementEvidence`
  JSON on the Prisma model (`schema.prisma:738-740`) — this is a genuine,
  queryable, already-indexed (`predictions_result_generated_idx`) data
  source, not something that needs building.
- **Existing frontend exposure**: yes, `/results` is real and indexed
  (`localizedMetadata(locale,"results",...)`), but:
  - **Canonical is period/market/result-blind**: same pattern as
    Competition's tabs — `?period=7|30|90`, `?market=`, `?result=` all
    change real content but canonicalize to the same bare `/results` URL.
    "Predictions won in the last 7 days" and "BTTS accuracy this month"
    are both real, distinct, genuinely valuable long-tail content that
    currently has **no distinct indexable URL** — closest parallel to
    PredictZ's home/away/H2H-as-separate-pages pattern from the earlier
    competitor research, not yet applied here.
  - No structured data (no `AggregateRating`/`Dataset`-style markup, though
    schema.org's fit for "our prediction accuracy" content is itself
    worth a deliberate decision, not assumed).

This is real classification: **`EXISTS BUT PARTIAL`** — the hard part
(reliable settled data, a real API contract, a real page) is done; what's
missing is turning genuinely different query states into genuinely
separate indexable pages.

## 9. Trend/streak evidence

- **Match Detail**: real, rich — `MatchStreak[]` embedded directly in the
  match payload (`match-service.ts:36-41`), consumed by
  `buildTrendSentence()` (`features/match/trend-sentences.ts`, built last
  session) to produce real, locale-correct, evidence-gated sentences (only
  fires with `currentLength >= 3 && sampleSize >= 3` — no thin/fabricated
  claims). This is the one surface where trend text genuinely exists
  today.
- **Today**: **not present.** `today-service.ts`'s `TodayApiResponse`
  contract carries no streak data per fixture at all — confirmed by
  reading the full response type and `mapFixture()`; there's no field to
  wire a trend sentence to even if the UI wanted one. This is a
  **`BACKEND CONTRACT MISSING`** classification, not just missing UI:
  Today's API would need to start returning streak evidence per fixture
  (or the client would need a second batched call) before trend sentences
  could appear there.
- **Competitions**: not present, same root cause — `CompetitionFixture`
  type has no streak field.
- **Teams**: not present as team-level aggregates (§7).
- **Batched retrieval**: the dedicated Streak Explorer (`/streaks`,
  `streak-service.ts`) already does real, single-call batched retrieval
  with rich filters (country/competition/team/scope/category/metric/
  search/sort) — genuinely good, no N+1 pattern there. The gap is that
  this batched capability is **not reused** to hydrate Today/Competition
  fixture rows; those surfaces have their own separate, streak-less
  contracts.
- **Quality thresholds**: real and consistent — `currentLength >= 3`
  appears both in `buildTrendSentence` and as the implicit floor in how
  `TeamStreakCurrent` is presumably computed (not independently
  re-verified against the Prisma model's computation logic in this pass).
- **Deterministic, real-data-based**: yes — sentences are built from
  stored `currentLength`/`sampleSize` values via a fixed per-locale
  template map, not generated text.

## 10. Text and SEO copy audit (verbatim, English)

| Page | `<title>` | Meta description | H1 |
|---|---|---|---|
| Today | `Today \| MyBetOracle` | "Today's football fixtures, predictions and match intelligence in one place." | "Today's matches" |
| Tomorrow | `Tomorrow \| MyBetOracle` | "Tomorrow's football fixtures, predictions and match intelligence, published a day ahead of kick-off." | "Tomorrow's matches" |
| `/today/total-2-5` | `Over / Under 2.5 Goals: predictions for today \| MyBetOracle` | "Goal-line intelligence around the most-watched 2.5 threshold." | (inherits Today's H1 — **not market-specific**, still says "Today's matches") |
| Markets hub | `Prediction markets \| MyBetOracle` | "See where today's recommendations sit and how each market has performed." | not directly inspected this pass |
| Match Detail | `{Home} vs {Away}: prediction and streaks \| MyBetOracle` | "{Home} vs {Away} preview with the Oracle prediction, verified team streaks, form, head-to-head record, probable lineups and statistics." | not directly inspected this pass (title/H1 parity is the established pattern) |
| Competition | `{Name} · Standings · Results \| MyBetOracle` | "All tracked football intelligence for {name}." | `{Name}` |
| Team | `{Name} · Predictions · Streaks \| MyBetOracle` | "{Name} fixtures, form, streaks and Oracle intelligence." | not directly inspected this pass |
| Results | (from `resultsLabels[locale].title`, not read this pass) | (`resultsLabels[locale].subtitle`) | not directly inspected this pass |

**Flags, confirmed by direct evidence**:
- **Duplicate title bug, site-wide**: was `"X \| MyBetOracle \| MyBetOracle"`
  on every single page (root layout template + manual append both firing)
  — **found and fixed last session**, verified live post-fix.
- **Generic/boilerplate descriptions**: Competition's and Team's
  descriptions are single fixed templates reused verbatim across every
  competition/team — real but not differentiated (no mention of the
  specific league's country, size, or the team's actual current
  form/position).
- **Market-scope pages' H1 is not market-specific**: the title tag
  correctly names the market, but the on-page H1 (inherited from
  `TodayExperience`) still just says "Today's matches" — a real,
  user-visible title/H1 mismatch on the new pages, not yet caught before
  this audit.
- **No pages found with content only visible after hydration** in the
  surfaces inspected — Today, Match, Competition, Team, Results, Markets
  are all confirmed server-rendered for their primary content; only
  *pagination beyond page 1* and *live score updates* are client-fetched,
  which is a defensible, non-cloaking pattern.
- **Untranslated/awkward localization**: none found in this pass — every
  string inspected (including the market copy expansion and
  tomorrow/H1 fixes from last session) had real, hand-written per-locale
  text, not machine-pattern artifacts.
- **Excessively long copy / thin pages**: neither — descriptions are
  short and accurate; no page in this audit is thin in the sense of
  having too little real underlying data, but several (Competition,
  Team, Today) are thin in the sense of not yet *exposing* the real data
  they have access to.

## 11. Internal-link architecture

- **Today → Match**: yes, real `<a href>` per fixture card.
- **Today → Competition**: **broken for crawlers** — the sidebar's pinned
  competition entries are `<button onClick={router.push}>`, not `<Link>`;
  a crawler sees no `<a href>` from Today to any competition page.
- **Today → Team**: no direct links from Today's fixture rows to team
  pages.
- **Today → Tomorrow**: **no link at all**, either direction.
- **Today → market pages (new or old)**: no link.
- **Match → Team**: not directly confirmed in this pass (recommend a
  follow-up check of `match-experience.tsx` if this matters for the next
  decision).
- **Match → Competition**: the breadcrumb JSON-LD references the
  competition by name but **without a `item` URL** for that breadcrumb
  entry (`match/[matchSlug]/page.tsx:44` — position 2 has `name` but no
  `item`, unlike positions 1 and 3) — a real, small structured-data gap:
  Google's breadcrumb rich result generally expects every non-terminal
  item to carry a URL.
- **Competition → Team**: yes, real links from the standings table.
- **Competition → Match**: yes, real links from every fixture row.
- **Competition → Tomorrow/market pages**: no link.
- **Results → Match**: not confirmed in this pass (recommend checking
  `results-hub-experience.tsx` before relying on this).
- **Tomorrow/market pages → anything**: inbound links are effectively
  zero (§3, §4) — both families are reachable only via sitemap/direct URL
  today, not via on-page navigation from any other surface.

**Can a user/crawler move Today → Match → Team → Competition → related
Match without sitemap discovery?** Partially: Today → Match works, Match →
Competition/Team likely works (unconfirmed this pass), Competition →
Team → Match works well. The weak links are Today → Competition (button,
not anchor) and the complete absence of any inbound path to Tomorrow or
either market-page family.

## 12. Sitemap/indexing state

File: `src/app/sitemap.ts`. Live-verified counts from last session's
`curl http://localhost:3411/sitemap.xml`: **4,520 URLs, 953KB** (well
under Next's 2MB fetch-cache ceiling).

Families currently emitted:
- `staticEntries`: 13 static routes × 6 locales (today, tomorrow, explore,
  calendar, competitions, teams, countries, markets, streaks, multi-picks,
  results, betslip — `PUBLIC_ROUTES`).
- `entityEntries`: competitions/teams/countries/markets, real per-locale
  (fixed from an `en`-only bug in the prior session).
- `marketScopeEntries` (new): 13 real markets × 2 scopes (today/tomorrow)
  × 6 locales = 156 URLs.
- `matchEntries`: real fixtures, **bounded to yesterday through +3 days**
  — the known, already-documented constraint, unchanged by last session's
  work. This remains the single biggest limiter on match-page discovery
  depth (no historical match pages in the sitemap at all beyond that
  window, even though the pages themselves are real and crawlable via
  internal links per §11).

**No sitemap-index/sub-sitemap split exists yet** — everything is still
one file. Healthy at current size, but the 4-day match window is the
actual constraint, not file size — expanding match coverage without an
index split would risk the 2MB ceiling again.

**No legacy/redirecting URLs are emitted in the sitemap itself** — the
V2→V3 redirect map lives in `next.config.ts`, separate from `sitemap.ts`;
redirected-away URLs were never sitemap entries in V3 to begin with.

**No pages found that are indexable but absent from the sitemap, or
emitted but canonicalized elsewhere**, in the surfaces checked this pass
— Competition/Results' tab-blind canonical situation (§6, §8) means only
one canonical variant per entity is ever in the sitemap, which is
internally consistent (not a duplicate-family bug), just a missed
long-tail opportunity.

## 13. Legacy V2 items — do not automatically recreate

Carried forward from the existing `V3_SEO_STRATEGY.md` (written
2026-09-13/14, not re-litigated in this pass since nothing has changed on
this front since then):

- **Old AI-generated league/team/prediction/result pages, and the blog**:
  V2's real GSC data (cited directly in the standing memory and the prior
  strategy doc) showed ~0 clicks and terrible positions on every sampled
  row. V3 has no equivalent, and per the standing content philosophy, it
  should not get an automatically-recreated one — flag for Search Console
  review, don't rebuild.
- **Geo hubs**: real V2 traffic existed for a subset (en/fr/pt, uneven
  country coverage) — this audit does not re-adjudicate that decision;
  it was already explicitly deferred, not in scope for this pass.
- **Prediction-intent pages** (`/predictions/today` etc.): V2's versions
  are handled by the existing Phase-4 redirect plan (redirect to
  `/today`), separate from and predating this audit.

No V2 family in this list has a "superior real-data replacement" to
report as newly built in V3 during this pass — the market-scope pages
built last session are new, not replacements for any specific V2 page.

## 14. DoubleEngine/backend data inventory

Cross-referenced against `prisma/schema.prisma` model list and
`product-read.service.ts`'s real query logic.

| Data | Status | Contract |
|---|---|---|
| Fixtures | AVAILABLE | `Fixture` model; `/api/v3/today`, `/api/v3/discovery/*`, `/api/v1/product/fixtures` |
| Scores | AVAILABLE | `Fixture.score` fields, live-updated |
| Statuses | AVAILABLE | `Fixture.statusCode` + `FixtureStatusHistory` model (full history stored, not just current state) |
| Competitions | AVAILABLE | `Competition` model, real catalog endpoint |
| Teams | AVAILABLE | `Team` model |
| Venues | AVAILABLE | `Venue` model, surfaced on Match Detail |
| Predictions | AVAILABLE | `Prediction` model — real `probability`, `confidenceScore`, `qualityTier`, `evidence` JSON, indexed |
| Odds | AVAILABLE | `OddsSnapshot`/`OddsCaptureRun` models; `latestOdds` surfaced on Match Detail and Today |
| Settlement | AVAILABLE | `Prediction.result`/`settledAt`/`settlementEvidence`, real indexed enum, powers `/results` already |
| Form | PARTIAL | Derivable from `Fixture` rows (proven working for the 2 teams in a given match via `recentResults`); no standalone "team form" aggregate endpoint confirmed for arbitrary teams outside a match context |
| Streaks | AVAILABLE (as records) / PARTIAL (as UI-ready aggregates outside Match/Streak Explorer) | `TeamStreakSnapshot`/`TeamStreakCurrent` models, real `/api/v3/streaks` contract with rich filters |
| H2H | AVAILABLE (as an API response field) | No dedicated H2H Prisma model found — appears derived server-side from `Fixture` history at request time, real and working on Match Detail |
| Standings | AVAILABLE | `StandingSnapshot`/`StandingRow` models, real, used on both Competition and Match Detail |
| Statistics | AVAILABLE | `FixtureTeamStatistic`/`FixturePlayerStatistic` models, real, used on Match Detail |
| Lineups | AVAILABLE | `FixtureLineup`/`FixtureLineupPlayer`, includes validated player-photo URLs, confirmed/unconfirmed state |
| Results (settled fixtures) | AVAILABLE | Same `Fixture`+`Prediction` data, exposed via `/results` |
| Historical fixtures | AVAILABLE (backend) / PARTIAL (sitemap discovery) | Data exists indefinitely in `Fixture`; sitemap only surfaces a 4-day window (§12) |
| Prediction history/performance | AVAILABLE | `/api/v3/results` — summary, byMarket, byOracleBand, accumulator history, real and queryable by arbitrary date range |
| League aggregate statistics (BTTS%, O2.5%, avg goals, home/away split) | **NOT AVAILABLE as a precomputed contract** | Computable from raw `Fixture`/`FixtureTeamStatistic` rows, but no existing endpoint returns competition-level aggregates today |
| Team aggregate statistics (same metrics, team-level) | **NOT AVAILABLE as a precomputed contract** | Same situation — computable, not currently exposed via any contract found in this pass |

## 15. Highest-value gaps, ranked

Ranked by (SEO impact × user value) against (implementation effort ×
backend dependency) — real data, no new copy required for any of these:

1. **JSON-LD on Today/Competition/Team/Results.** Zero backend dependency
   — all the data these pages already render server-side just needs
   structured markup. Highest impact-to-effort ratio in this whole audit.
2. **Fix Today's competition grouping to real `<h2>`/team button-links to
   real `<a href>`.** Pure frontend, zero backend dependency, directly
   fixes both a semantic-heading gap (§2) and a crawler-visible internal-
   link gap (§11).
3. **Give Competition/Results tabs their own canonical URLs** (or at
   minimum, real query-string-aware canonical/hreflang per tab, if full
   separate routes aren't wanted). Real distinct content already exists
   per tab; this is a routing/metadata change, not new data work.
4. **League/team aggregate statistics (BTTS%, O2.5%, avg goals,
   home/away split).** Highest user-value item in the "richer real data"
   category the brief explicitly wants, but the one item here with a real
   backend dependency (no precomputed contract exists yet) — needs a
   product-read.service.ts addition, not just a frontend change.
5. **Fix the new market-scope pages' H1** to be market-specific instead of
   inheriting "Today's matches" verbatim — small, frontend-only, directly
   found by this audit.
6. **Internal links into Tomorrow and the new market-scope pages** from
   Today/Markets hub/Competition — small, frontend-only, closes the
   orphaned-page problem in §3/§4/§11.
7. **Team-level trend/form surfacing**, reusing the existing
   `/api/v3/streaks?teamId=` contract rather than building new backend —
   medium effort, real data already reachable.
8. **Sitemap-index split** for historical match depth beyond the current
   4-day window — real backend dependency is low (data already exists),
   but requires the index-file restructure work already scoped and
   explicitly deferred from the previous session.

## 16. Recommended first implementation slice — recommendation only

Given the ranking above, the single slice with the best (impact ×
already-available-data) ÷ (effort × backend-dependency) ratio is:
**structured data (JSON-LD) + semantic heading/link fixes on Today**,
specifically items 1 and 2 together, scoped to Today only first (not
Competition/Team/Results yet). Rationale: Today is the single
highest-traffic-intent surface named directly in the brief
("football predictions today"), the fix requires zero backend work and no
new copy, and it directly closes the gap between "real rich data exists"
and "Google can parse it as structured, organized content" — which is
exactly the audit's core finding. Everything else in §15 is real and
worth doing, but this is the one slice that's pure frontend, zero backend
dependency, and targets the exact query the brief asks about.

No code changes were made in this session. Awaiting founder review before
any implementation is authorized.
