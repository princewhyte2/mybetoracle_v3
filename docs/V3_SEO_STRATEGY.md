# MyBetOracle V3 SEO Strategy

Status: Draft for review. Written 2026-09-13, grounded directly in the real
current state of V2 (`mybetoracle_client`) and V3 (`mybetoracle-v3`) as read
from both repos on this date, plus a six-product competitor research
collection (`doubleengine/docs/competitor-research/`: Forebet, PredictZ,
BetExplorer, Flashscore, Adam Choi, MyBetCode). Every claim below about V2
or V3's current state is from direct inspection of real files, not
assumption — cited inline.

**Companion document**: `doubleengine/docs/forebet-markets-implementation-spec.md`
covers Forebet's full market list (1X2, Double Chance, Handicap, Corners,
Cards, Half Time, HT/FT, etc.) in implementation detail — what each market
means, how to compute it, and DoubleEngine's exact current build status per
market. This document's §2's "(scope × market)" URL-fanout references that
market list without repeating it — read both together, not this one alone,
before treating market-page coverage as fully specified.

## 0. The one non-negotiable risk: don't lose what V2 already has

V2 is not a blank slate. Confirmed directly from `mybetoracle_client`:

- **Live on `www.mybetoracle.com`**, real 6-locale routing (`en, es, fr, de,
  it, pt`) via `middleware.ts`.
- **A working IndexNow integration** (`scripts/indexnow-*.js`,
  `package.json` scripts `indexnow`, `indexnow:sitemap`, `indexnow:urls`) —
  instant-indexing submission to Bing/Yandex, a real and non-trivial piece
  of SEO infrastructure most competitors in this research collection don't
  have.
- **462 real, tracked URLs** in `urls.txt` across all 6 locales, covering
  `predictions`, `accumulators`, `betslip`, `special`, `subscribe`,
  `recent-wins`, `blog`, `about`, `disclaimer`, `faq`, `contact`,
  `how-to-use`, `beginners-guide`, `terms-of-service`, `privacy-policy`,
  `responsible-gambling` per locale, plus a blog with locale-specific slug
  translation (`translate-blog-slugs.js`).
- This is already presumably indexed and accumulating real Google Search
  Console history, rankings, and possibly backlinks — the exact founder
  concern in "V2 is already on Google Search Console" is well-founded.

**The single highest-risk action in this whole project is migrating to V3
without a real URL-continuity plan.** A same-domain re-platform that
silently changes URL structure without redirects is one of the most common
ways real businesses lose months of accumulated rankings almost overnight.
V3 currently shares the same domain (`sitemap.ts` defaults to
`https://www.mybetoracle.com`, matching V2's live domain) — same-domain is
lower-risk than a domain change, but only if paths are mapped and redirected
deliberately. **This must happen before or during launch, not after.**

### Real URL mapping, V2 → V3 (confirmed by direct comparison, not assumed)

| V2 path (`en`, live, indexed) | V3 equivalent today | Action needed |
|---|---|---|
| `/en/predictions` | `/en/today` (V3 retired a standalone Predictions route and redirects it internally — confirmed in `V3_BUILD_STATUS.md`) | Add a real 301 from the V2 path to `/today` if not already covered by V3's own internal redirect |
| `/en/accumulators` | `/en/multi-picks` | **No redirect exists yet for this rename** — needs one |
| `/en/betslip` | `/en/betslip` (V3 keeps this as an internal-only route name for the separate Oracle Daily product, per `V3_LOCALIZATION_STANDARD.md`) | Confirm the *public-facing* content at this path is compatible; V2 and V3 may mean different products at the same path — verify before assuming path equality is content equality |
| `/en/recent-wins` | Likely `/en/results` | Confirm and add 301 if the mapping holds |
| `/en/subscribe` | No confirmed V3 equivalent — Oracle Pro is explicitly deferred per `V3_BUILD_STATUS.md` ("Oracle Pro is deferred and absent from the launch shell") | Decide: redirect to a relevant page (e.g. `/today`) rather than 404, or keep a placeholder until Oracle Pro ships |
| `/en/special` | No confirmed V3 equivalent found | Needs investigation — don't let this 404 silently |
| `/en/about`, `/en/faq`, `/en/contact`, `/en/how-to-use`, `/en/beginners-guide`, `/en/terms-of-service`, `/en/privacy-policy`, `/en/responsible-gambling` | V3 has `terms`, `privacy`, `responsible-play`, `support` (per the app route tree) — naming differs from V2 in several cases (`terms-of-service` vs `terms`, `responsible-gambling` vs `responsible-play`) | Build the full mapping table explicitly, one row per V2 URL, before cutover — this table above is a start, not complete |
| `/en/blog/*` | No blog route found anywhere in V3's current route tree | **Real gap** — V2's blog is real, locale-translated content that's presumably indexed; V3 has nothing to redirect it to yet. Decide: rebuild the blog in V3, or keep V2's blog live/proxied post-cutover rather than deleting real indexed content |

**Action, before any V3 launch decision is final**: produce the *complete*
version of the table above (every one of the 462 real V2 URLs, not just the
top-level patterns sampled here), and implement real HTTP 301s (not
client-side redirects) for every path that changes. Submit the change via
Google Search Console once redirects are live (a "Change of Address" tool
run is for domain changes; since this is same-domain, the equivalent step
is validating the new sitemap and requesting re-crawl of the moved URLs,
not the formal Change of Address flow — don't run that tool here, it's for
a different scenario than this one).

## 1. Multi-locale content parity — the real, diagnosed cause of V2's
uneven ranking, and the single most important lesson for V3

Founder-reported symptom (2026-09-13): V2 recently started ranking well for
French, alongside its existing English ranking, but **not** for Spanish,
German, or Italian, despite all six locales being technically supported.
This was investigated directly against V2's real code rather than guessed
at — the cause is concrete, isolated, and not what it might first look
like.

### What it is *not*

- **Not a sitemap-coverage bug.** `app/sitemap.ts` and
  `utils/sitemapBuilder.ts`, read in full: static routes, blog entries, and
  programmatic league/team pages all correctly loop over every entry in
  `locales` (`en, es, fr, de, it, pt`), not just a default. This is
  structurally sound and — worth noting directly — already better than
  what V3 currently does (see §3a below, the same class of bug V3 actually
  has today).
- **Not a broken or missing hreflang implementation.** `utils/seo.ts`'s
  `getPageAlternates` generates a complete, symmetric 6-locale +
  `x-default` alternates map for every registered page. This is
  technically correct per Google's real requirement that alternate-language
  annotations be a complete, mutually-referencing set.
- **Not `middleware.ts` redirecting bots away from non-English/French
  locales.** Read in full: the locale-detection/redirect logic only fires
  for paths with *no* locale prefix at all (`pathnameHasLocale` short-
  circuits immediately otherwise). A direct crawl request to `/es/...` or
  `/de/...` passes straight through untouched.

### What it actually is

**`utils/geoSeoConfig.ts` — the geo-targeted country-hub SEO system — is
structurally built for only 3 of the 6 supported locales, with heavily
uneven coverage even among those three.** Read directly:

```ts
export type GeoSeoLocale = Extract<Locale, 'en' | 'fr' | 'pt'>
```

`GEO_PAGE_SEGMENTS` (the localized URL-segment translations that make each
geo page's URL itself readable in-language) only has `en`, `fr`, and `pt`
keys. `es`, `de`, and `it` are not merely under-populated — the type
system itself excludes them from this feature entirely.

Within the 3 locales that do exist, real country coverage is heavily
skewed (`GEO_SEO_COUNTRIES`, counted directly):

| Locale | Countries | Real geo pages (countries × 5 page-kinds) |
|---|---|---|
| `en` | Nigeria, Ghana, Kenya, South Africa, Uganda, Tanzania (6) | 30 |
| `fr` | Senegal, Côte d'Ivoire, Cameroun (3) | 15 |
| `pt` | Angola (1) | 5 |
| `es`, `de`, `it` | **0** | **0** |

Each of these pages is real, substantial, locale-specific content — not a
thin template. Every country config carries a genuine, hand-written
`regionalHook` sentence in the local language (e.g. the French entries are
written in real French, referencing Senegal/Côte d'Ivoire/Cameroun by name,
not machine-translated boilerplate), plus per-country `popularLeagues` and
`leagueKeywords`. These pages are also given the **highest priority and
change-frequency of any page type in the entire sitemap**
(`priority: kind === 'country-hub' ? 0.86 : 0.84`, `changeFrequency:
'daily'` — higher than ordinary static pages).

**This fully explains the observed pattern.** English ranks because it has
both the largest static/blog content base (the default locale) and the
largest geo-hub footprint (30 pages). French ranks because, despite being
one of five non-default locales, it has a real, substantial, daily-updated,
genuinely localized 15-page content block that Spanish, German, and Italian
have zero equivalent of. This is not a technical misconfiguration to patch
— **es/de/it are, as of today, genuinely lower-value pages than en/fr for
this specific content type, and Google is correctly reflecting that.** The
fix is adding real content, not adjusting metadata.

### The correct mental model for why this matters (so this doesn't recur)

Worth stating precisely, since getting this wrong is how teams chase the
wrong fix: **hreflang and sitemap inclusion do not cause ranking on their
own.** They only affect which already-indexed, already-valuable page
Google chooses to show a given searcher. A page with perfect hreflang
tags, present in the sitemap, submitted via IndexNow, but with no real
unique content behind it, will not rank — because it doesn't deserve to.
The geo-hub finding above is a genuine content-investment gap, correctly
reflected in real rankings, not evidence of a bug in the indexing
machinery (which, for this specific system, is in fact working correctly
for the locales it covers).

The secondary, smaller finding worth flagging: `sitemap.ts`'s dynamic CMS
blog posts are unconditionally tagged `locale: 'en'` regardless of the
post's actual language (`dynamicPosts.forEach((post) => { blogEntries.push({
locale: 'en', ... }) })`). If `serverBlogService` ever returns non-English
posts, they'd be mislabeled in the sitemap. Lower-impact than the geo-hub
gap (the *static* per-locale blog posts, `staticBlogPostsES/FR/DE/IT/PT`,
are correctly locale-tagged separately) — worth a real fix, not the primary
explanation.

### The mandate for V3, stated plainly

**Whatever locale-specific, high-value content system V3 builds
(programmatic competition/team/market pages, geo-targeted content,
auto-generated trend copy, anything) must be designed for all supported
locales from the start, or explicitly tracked as a known parity gap with a
real plan to close it — never silently shipped for a subset of locales
the way V2's geo-hub system was.** This is not a hypothetical risk for
V3 — §3a below documents V3's `sitemap.ts` already repeating the same
class of mistake (entity pages generated for `en` only) at a smaller
scale, today, before any content-volume work has even begun. Fix it now,
while the blast radius is small, not after months of content investment
have accumulated unevenly the way V2's did.

## 2. What V3 already has, confirmed real (don't rebuild this)

- **`SportsEvent` + `BreadcrumbList` JSON-LD structured data on Match
  Details pages, already live and inspected in rendered DOM** (per
  `V3_BUILD_STATUS.md`'s Match Details section). This is a genuine,
  already-shipped advantage — per `docs/competitor-research/forebet.md` §6,
  Forebet only uses generic `Article` schema, not `SportsEvent`;
  `docs/competitor-research/predictz.md` §5 confirms `SportsEvent` is the
  stronger, more search-relevant choice for sports content, and V3 already
  has it. Extend this pattern to any other market/competition/team pages
  as they're built, don't reinvent it.
- **Localized dynamic metadata, canonical links, and confirmed locale
  alternates** — implemented and verified in rendered DOM for Match
  Details specifically, and listed as complete for "localized route
  metadata, canonical alternates" generally in
  `V3_LOCALIZATION_STANDARD.md`'s Current Coverage. This is the
  `hreflang`-equivalent machinery competitors in this research collection
  mostly handle far more crudely (Forebet and PredictZ both maintain full
  separate per-locale sitemaps rather than proper alternate-link
  annotation within one page).
- **`robots.ts` and `sitemap.ts` already exist** using Next.js's native
  metadata route convention — real infrastructure, not missing.
- **Match URLs already use readable slugs, not opaque IDs** —
  `/{locale}/match/{matchSlug}` (e.g. `/en/match/arsenal-v-chelsea`, per
  `V3_BUILD_STATUS.md`). Worth stating explicitly as a confirmed strength:
  PredictZ's equivalent URL is numeric-ID-based
  (`/predictions/europe/champions-league/1220882/`, `predictz.md` §5) —
  slug-based URLs carry real keyword signal a bare ID doesn't. Don't
  regress this if match-URL structure is ever revisited.
- **394 statically generated pages across 6 locales** in the most recent
  confirmed production build (`V3_BUILD_STATUS.md`) — a real, substantial,
  server-rendered (crawlable) footprint already, not a client-only SPA
  (contrast `docs/competitor-research/adamchoi.md`, where the competitor's
  entire product is invisible to a plain crawl).
- **Private/personal routes already correctly kept out of the index** —
  Saved, Profile, Preferences use page-level `noindex` while unauthenticated
  or provisional, per `V3_BUILD_STATUS.md` ("Personalized and provisional
  policy pages remain noindex until authentication, persistence and final
  legal copy are integrated"). This is the right mechanism (page-level
  `noindex`, not just `robots.txt` disallow, which only stops discovery of
  new URLs, not de-indexing of ones Google already knows about).

## 3. Real gaps found, confirmed by direct inspection this session

### 3a. Sitemap: entity pages (competitions/teams/countries/markets) are
only generated for the `en` locale — the same class of mistake as §1

`src/app/sitemap.ts`, read directly:
```ts
const data = await getDiscoveryData({ locale: "en" });  // hardcoded "en"
...
entities.map((path) => ({ url: `${origin}/en/${path}`, ... }))  // hardcoded "/en/"
```
The `staticEntries` block (top-level routes like `/today`, `/explore`)
correctly loops over all 6 `locales`. The dynamic entity pages —
competitions, teams, countries, markets, which are exactly the kind of
content-rich, long-tail pages that Forebet and PredictZ's entire SEO
strategy is built on (`forebet.md` §2, `predictz.md` §5) — do not. **This
means 5 of 6 locales currently have zero competition/team/country/market
pages in the sitemap**, even though the routes themselves are presumably
built and locale-aware per `V3_LOCALIZATION_STANDARD.md`'s claim of
"Explore, calendar, competition, team, country and market directories and
details" being complete across all six locales. If the pages exist and
render correctly per-locale but aren't in the sitemap, that's a pure,
fixable oversight — highest priority given §1's lesson about exactly this
failure mode.

### 3b. Match sitemap window is narrow — no historical match pages surfaced
to crawlers

`sitemap.ts`'s `matchEntries` bounds discovery to `yesterday` through
`+3 days` (explicitly, "to stay comfortably below Next.js's 2MB fetch-cache
boundary" — a real, currently-necessary technical constraint, confirmed
also in `V3_BUILD_STATUS.md`: "Sitemap match discovery is bounded to
yesterday through the next three days... 3,639 canonical fixtures in
1.18 MB"). This means **settled match results and H2H pages older than a
few days are never in the sitemap**, even if the pages themselves exist and
are crawlable via internal links. Per
`docs/competitor-research/betexplorer.md` §2 and §5, deep historical
archive depth (BetExplorer goes back to the 1901/1902 season) is a
genuinely distinctive, hard-to-replicate SEO asset precisely because it's
long-tail content nobody else bothers to build. This is not something to
fix by brute-forcing every historical match into one sitemap file (that
reintroduces the 2MB problem) — the real fix is a **sitemap index** (like
`predictz.md` §5's real, confirmed `sitemap_index.xml` structure: separate
sub-sitemaps per page-type/date-range, referenced from one index file) so
historical match pages get their own bounded, paginated sitemap files
instead of competing with the primary upcoming-fixtures sitemap for the
same size budget. **Whatever this becomes must also loop over all 6
locales per §1's mandate** — a sitemap index with rich page-type coverage
that's still only built for one locale repeats the same mistake at a
larger scale.

PredictZ's exact real structure (`predictz.md` §5) gives two independent
scaling techniques worth both adopting, not just one: it splits by
**page-type** (a separate `sitemap-future-games.xml` vs. the main
predictions sitemap) *and*, specifically for historical data, splits by
**country** (`sitemap-past-games-{ENG,SCT,SPA,GER,ITA,FRA,BRA,INT}.xml` —
8 separate country-bounded files for past games alone, on top of the
locale and page-type splits). If a date-range-bounded sub-sitemap index
alone still risks hitting Next.js's 2MB ceiling once historical depth
grows substantial, country-splitting historical match sitemaps the same
way is the confirmed-working technique PredictZ actually uses for exactly
this scaling problem — worth having in reserve rather than rediscovering
under pressure later.

### 3c. No public, keyword-rich landing page — a deliberate product
decision, not an oversight, but worth surfacing as a real SEO tradeoff

Confirmed directly in `V3_PRODUCT_ENTRY_ARCHITECTURE.md`: *"V3 uses
Today's Match Intelligence as the default product workspace... It is
**not** a landing page."* This is stated as a considered product stance,
not a gap to silently override. But it has a real SEO cost worth naming
explicitly: the root domain is normally a site's single highest-authority
page, and every competitor in this research collection uses it for
keyword-rich content targeting broad head terms (`forebet.md` §2's
homepage copy explicitly names "football predictions," "over 2.5,"
specific leagues; `betexplorer.md` §3's league pages carry 2,000+ word
SEO essays). `/today` is a live product surface, not built to rank for
"football predictions" as a search query. **This needs an explicit
decision, not inheritance of the existing architecture by default**:
either accept the tradeoff (Today stays the entry point, accept weaker
head-term ranking, focus SEO effort entirely on long-tail
competition/team/match pages instead — which is a legitimate strategy,
just a different one than every competitor researched), or scope a
genuine public landing page as its own deliberate, reviewed piece of work
alongside (not instead of) Today.

### 3d. `robots.ts` disallow list may not match the real current route names

`robots.ts` disallows `/*/saved`, `/*/profile`, `/*/settings`, `/*/login`,
`/*/signup`. The actual route tree (`src/app/[locale]/`) has `preferences`
and `auth`, not `settings`, `login`, or `signup`. Since the real private
pages are already protected by page-level `noindex` (§2, the stronger,
correct mechanism), this is likely low real risk — but it's worth fixing
the `robots.ts` list to match real route names rather than stale/guessed
ones, so `robots.txt` and the actual private-route set agree.

### 3e. No blog in V3 at all, but V2's blog is real, live, translated
content

Covered in §0's table — repeating here because it's a content gap, not
just a redirect gap. V2 invested in locale-translated blog content
(`translate-blog-slugs.js` existing as real tooling implies real ongoing
blog output). Losing that content surface entirely at cutover, with
nothing to redirect it to, is a real loss of both existing rankings and
future content-marketing capacity — Forebet, PredictZ, and BetExplorer all
lean on long-form or frequently-updated content as part of their ranking
strategy (`forebet.md` §6, `betexplorer.md` §3).

### 3f. No `FAQPage` schema anywhere confirmed — a gap shared with every
competitor except none of them fixed it either

Not confirmed as built in V3 (not found in the doc search this session).
Worth calling out specifically because `forebet.md` §6 flags this as a
real, live gap in Forebet's own implementation — their FAQ page is
formatted as Q&A but never marked up with `FAQPage` schema. If V3 has (or
builds) an FAQ page, using real `FAQPage` schema there is a genuine,
concrete opportunity to out-rank a specific competitor on a specific,
checkable technical point, not a hypothetical one.

### 3g. Sitemap's dynamic blog posts are unconditionally locale-tagged `en`

Carried over from §1's secondary V2 finding — not yet relevant to V3 since
V3 has no blog at all (§3e), but **whoever builds V3's blog must not
copy this specific bug**: tag each post's real locale, not a hardcoded
default, when it's added to the sitemap.

## 4. What to bring in from the competitor research, mapped to what V3
still needs

Cross-referencing `doubleengine/docs/competitor-research/` against §3's
real gaps:

1. **Full per-locale entity sitemap coverage** (fixes §3a, and closes the
   same-shaped gap diagnosed in §1) — directly modeled on Forebet's and
   PredictZ's core pattern: every content page type gets its own URL per
   locale, not just per default language. `predictz.md` §5's real
   sitemap-index structure (separate files per locale *and* per page-type:
   predictions, results, home-record, away-record, H2H) is the concrete
   reference architecture for §3b's fix too — a sitemap index with locale-
   and date/type-bounded sub-sitemaps, not one giant file.
2. **`SportsEvent` schema, already ahead** (§2) — extend the pattern V3
   already has on Match Details to competition/team/country/market
   directory pages as they're confirmed sitemap-covered, using whichever
   schema type fits each (e.g. `SportsOrganization` for team pages,
   `SportsTeam`, per schema.org's real vocabulary — verify the exact type
   before implementing rather than assuming `SportsEvent` fits every page
   type).
3. **Auto-generated, genuinely unique per-fixture text** — Forebet's
   single biggest, most copyable idea (`forebet.md` §3): a short,
   real-data-driven sentence per fixture (e.g. "Team X have seen under 2.5
   goals in 3 of their last 5 matches") makes otherwise-templated listing
   pages non-duplicate content for search engines. DoubleEngine already
   has the underlying data for this (`TeamStreakSnapshot`/
   `TeamStreakCurrent`, per this session's earlier work on the Streak
   Explorer's "58 metrics" — `V3_BUILD_STATUS.md` confirms this data
   already flows into V3's Streak Explorer UI). This is very likely a
   presentation/wiring task on data that already exists, not new data
   infrastructure — worth scoping as a near-term item, not a someday one.
   **Must be built across all 6 locales from the start, per §1.**
4. **Long-form educational content on category/league pages** — the
   BetExplorer pattern (`betexplorer.md` §3), a different content
   strategy than Forebet's terse auto-generated sentences. Given §3c's
   root-page tradeoff (no traditional landing page), this may be the more
   fitting way to capture head-term-adjacent search traffic within V3's
   existing "no dedicated landing page" architecture — competition and
   market directory pages could carry real explanatory copy the way
   BetExplorer's do, without needing a new page type. **Also a §1-shaped
   risk**: writing this for `en` first and treating other locales as a
   follow-up is exactly how V2's geo-hub gap happened — plan real copy for
   all 6 locales as one piece of work, or explicitly track the parity gap
   with a closing date if it must be staged.
5. **`FAQPage` schema done properly** (§3f) — a small, concrete,
   competitor-beating fix if/when an FAQ surface exists.
6. **Home-record / away-record / H2H as their own separate crawlable
   pages, not tabs** (`predictz.md` §8, item 3) — PredictZ gives every
   team a dedicated home-record URL, a dedicated away-record URL, and
   every matchup its own H2H URL, rather than folding that data into tabs
   on one team page. V3 already renders H2H as part of Match Details
   (`V3_BUILD_STATUS.md`'s "recent head-to-head results" under Oracle/H2H
   navigation), so the underlying data exists — the open question is
   whether it's worth also exposing as its own indexable URL per matchup,
   which roughly triples indexable pages per team. Flagged explicitly as
   a real content-fanout decision, not assumed yes — PredictZ's own
   research note calls this out as "worth weighing against maintenance
   cost before copying."
7. **Decide V3's own stance on indexing standings/table pages** — Flashscore
   and BetExplorer made **opposite** choices here (`flashscore.md` §8 item
   2): Flashscore's `robots.txt` explicitly disallows `/standings/`,
   `/draw/`, and `/newsfeed/` from crawling; BetExplorer makes its
   standings tables (with 5 stat-type × 3 home/away/overall = up to 15
   variants per league page, `betexplorer.md` §2) a core indexed SEO asset.
   V3 has a real `/competitions` route with standings content
   (`V3_BUILD_STATUS.md`) — decide deliberately which side to take rather
   than let `sitemap.ts`/`robots.ts`'s current state answer this by
   default.
8. **Explicit decision on Value Picks / Kelly Criterion framing** — already
   covered in full in `doubleengine/docs/forebet-markets-implementation-spec.md`
   §3; repeated here only as a reminder that it's a positioning choice
   with real SEO-adjacent content implications (a "Values" page type is
   itself a crawlable, differentiated content surface if built), not
   something to decide inside this document.
9. **What NOT to copy**: MyBetCode (`mybetcode.md` §7) declared **no
   sitemap at all** — the clearest possible negative example in this
   research collection of what under-investing in this looks like,
   despite running a real, monetized API business alongside it. Flashscore
   deliberately excludes `/standings/`, `/draw/`, `/newsfeed/` from
   crawling and blocks the CCBot AI-training crawler outright
   (`flashscore.md` §5) — a legitimate but different strategic choice V3
   should make on purpose (whether to allow AI-training crawlers, which
   page types to keep out of the index) rather than default into either
   direction silently.
10. **Geo-targeted country-hub content, done right this time** — V2's
   `geoSeoConfig.ts` pattern (§1) is, in its actual mechanics, a genuinely
   good idea: per-country landing pages with real localized copy, popular
   leagues, and keyword targeting, sitemap-prioritized above ordinary
   pages. None of the six researched competitors do exactly this (they
   localize by *language*, not by *country within a language*, e.g.
   PredictZ's Naira-denominated Nigeria-specific branding is the closest
   parallel, per `predictz.md` §8, but not a structured page-per-country
   system). This is a real, distinctive idea worth carrying into V3
   deliberately — built for all supported locale/country combinations
   from day one this time, not 3 of 6 locales with an 6/3/1/0/0/0 country
   split.
11. **Time-scope pages as their own real, indexed URLs — not just an
    in-app date picker.** Both Forebet and PredictZ treat "Today,"
    "Tomorrow," "Weekend," "Yesterday" (Forebet, `forebet.md` §2) and
    individual future dates (PredictZ: "Predictions For Thursday,
    September 10th" as its own distinct URL, `predictz.md` §2) as
    separate, independently indexable pages, not a filter state on one
    URL. V3 has `/today`; whether `/tomorrow`, a weekend view, or
    individual future-dated URLs exist as their own indexed routes (vs.
    a client-side date-picker on `/today`) was not confirmed this
    session — worth checking directly, since this is exactly the kind of
    thing that looks like a UI detail but is actually a real content-
    fanout decision each researched competitor made deliberately.
12. **Market-per-league fanout, one level deeper than entity pages
    alone.** PredictZ's footer links ("Premier League BTTS Tips,"
    "Championship Over 2.5 Tips," "Bundesliga Over 2.5 Tips" —
    `predictz.md` §2) confirm a real (market × league) URL fanout,
    distinct from both the (scope × market) fanout already noted in item
    1 and the plain per-league entity pages in §3a's fix. If V3's market
    pages (`/markets/{slug}`) and competition pages
    (`/competitions/{slug}`) don't already cross-combine into pages like
    "Premier League — Over 2.5 predictions," that's a real, additional
    fanout opportunity beyond what §3a's fix alone provides — confirm
    whether this exists before assuming the simpler fix covers it.
13. **`dateModified` freshness signal on evergreen content pages, kept
    genuinely current.** Forebet's FAQ and "What is Forebet" pages both
    carry `Article` schema with real, maintained `dateModified` values —
    years after original publication, still being revised rather than
    left static (`forebet.md` §6). Separately, **hand-tune title/meta
    description per page *type*, not one interpolated template for
    every page** — Forebet's titles read as natural, specific phrases
    per market/scope combination, not a generic
    `{market} predictions for {league}` pattern repeated verbatim
    (`forebet.md` §6's real examples). Both are small, concrete,
    ongoing-content-maintenance practices worth adopting for any
    evergreen page V3 builds (FAQ, About, market/competition directory
    pages), not just for new pages at launch.
14. **What NOT to copy, addition**: PredictZ maintains **two entirely
    separate site builds** for desktop and mobile ("Use Our Desktop
    Site" / "Use Our Mobile Site" toggle, `predictz.md` §7) rather than
    one responsive build — explicitly noted in that research as
    inconsistent, legacy practice, not something to emulate. Google's
    mobile-first indexing works against a single responsive site far
    more reliably than dual m-dot-style builds. V3's existing responsive,
    single-build approach (confirmed via the `390x844`/`1440x900`
    responsive verification passes throughout `V3_BUILD_STATUS.md`) is
    already the correct choice here — stated explicitly so it's never
    reconsidered by accident.

## 5. Google Search fundamentals worth stating precisely (so nothing here
is treated as a loophole because a mechanism was misunderstood)

A few things worth being exact about, since getting these wrong is a
common, costly way real sites misdiagnose ranking problems:

- **hreflang/alternates select *which* indexed variant to show a searcher;
  they do not create ranking or indexation on their own.** A page needs to
  be genuinely crawlable, genuinely linked (internally at minimum), and
  genuinely valuable content before hreflang correctness matters at all.
  §1's finding is a direct real-world illustration: technically-perfect
  hreflang on es/de/it pages would not have fixed the ranking gap, because
  the underlying content (the geo-hub pages) simply didn't exist for those
  locales.
- **Duplicate or thin content across locales is a real, separate risk from
  missing content.** A locale that exists as a route but only carries a
  literal word-for-word machine translation with no local relevance can
  actually rank *worse* than not having the locale at all in some cases —
  Google's guidance on this is to translate meaning and local relevance,
  not just words, which `V3_LOCALIZATION_STANDARD.md` already states as a
  quality rule ("Translate meaning and user intent, not English word
  order") — worth treating that localization standard as an SEO
  requirement too, not purely a UX one.
- **`noindex` (page-level meta tag) and `robots.txt` disallow solve
  different problems and are not interchangeable.** `robots.txt` prevents
  *discovery* of new URLs by crawlers; it does not remove a URL Google
  already knows about from the index (Google may still index a
  disallowed-but-linked URL using only its anchor text/referring
  signals, with no snippet, which often looks *worse* in search results
  than a clean `noindex`). `noindex` reliably keeps a page out of the
  index but requires the page to be crawlable so Google can *see* the
  `noindex` tag in the first place — disallowing a page in `robots.txt`
  and also expecting `noindex` to remove it is a real, common
  contradiction to avoid. V3's current approach (page-level `noindex` for
  private routes, per §2) is the right one for this use case.
- **A sitemap is a hint, not a command.** Being in the sitemap makes a URL
  easier for Google to discover and signals its relative priority/update
  frequency; it does not guarantee indexation or ranking. Real internal
  linking (e.g. a competition page linking to its real teams, a team page
  linking to its real recent matches — confirmed already happening in V3
  per `V3_BUILD_STATUS.md`'s "one connected route graph") matters as much
  or more than sitemap presence for actually getting pages crawled and
  understood in context.
- **IndexNow (V2's real, working integration) is a Bing/Yandex protocol,
  not a Google one.** It does not submit to or influence Google directly.
  For Google specifically, the real levers are: sitemap freshness,
  internal linking, real content updates, and (for genuinely new/updated
  pages) the Search Console URL Inspection "Request Indexing" tool for
  spot cases — there is no Google equivalent of IndexNow at the scale V2
  currently uses it for Bing/Yandex. Don't assume IndexNow submission is
  doing anything for Google rankings specifically; it's a real, separate,
  worthwhile channel, not a Google-indexing shortcut.
- **International targeting**: if any locale is meant to target a specific
  country rather than just a language (exactly what §1's `geoSeoConfig.ts`
  country-hub pages do), Google Search Console's International Targeting
  report (under Legacy tools, or via `hreflang` region-specific codes like
  `fr-SN` rather than bare `fr`) is the mechanism to confirm Google
  understands the intended country targeting, separate from language
  targeting. V2's current geo-hub `hreflang` (per `getGeoPageAlternates`)
  uses bare locale codes (`fr`, `pt`) without a region subtag even though
  the pages are genuinely country-specific (Senegal vs Côte d'Ivoire vs
  Cameroun, all `fr`) — this is a real, second-order technical detail
  worth deciding on purpose for V3's version of this system: either adopt
  region-specific hreflang codes (`fr-SN`, `fr-CI`, `fr-CM`) for genuinely
  country-targeted pages, or rely on on-page content/schema signals alone
  and accept bare-language hreflang as sufficient. Not flagged as urgent,
  flagged as a real decision point worth making explicitly rather than
  defaulting into unexamined.
- **IP-based personalization is a real UX idea with a real cloaking-
  adjacent caution attached.** Forebet's homepage auto-detects the
  visitor's country by IP and defaults the standings widget to that
  country's league with no login required (`forebet.md` §2 — confirmed
  live: a fetch from this research session was auto-detected as Nigeria
  and shown the NPFL table). This is a genuinely nice UX touch worth
  considering for V3. **The real caution**: Google's crawler fetches pages
  from its own IP ranges, not the searcher's — if a page's *canonical*
  content (what's meant to be indexed) changes based on visitor IP, make
  sure Googlebot still sees the same default/canonical version a real user
  in an unrecognized location would see, not a version that differs
  meaningfully from what gets indexed. Personalizing a *default selection*
  on an otherwise-identical page (Forebet's actual implementation) is
  fine; changing the core indexed content itself by IP is the pattern to
  avoid. Worth being precise about this distinction before implementing,
  not after.

## 6. Prioritized action list

Ordered by (real risk if skipped) × (confirmed low effort to fix), not by
theoretical importance:

1. **Build the complete V2→V3 URL redirect map and implement real 301s**
   (§0). Highest risk in this entire plan — an indexed page returning 404
   or silently changing address without a redirect is direct, measurable
   ranking loss. Do this before or during cutover, not after.
2. **Fix `sitemap.ts` to loop entity pages over all 6 locales, not just
   `en`** (§3a). Small, mechanical, high-value fix — the code path already
   exists for `staticEntries`; extend the same pattern to `entities`. This
   is the same class of bug that produced §1's real ranking gap on V2 —
   fix it while it's cheap.
3. **Decide whether/how to build V3's version of the geo-targeted
   country-hub system** (§1, §4.10) — and if built, build it for every
   supported locale/country pairing intended at launch, not a subset with
   a plan to "add the rest later." "Later" is exactly what produced the
   0/0/0 gap on V2.
4. **Decide the blog's fate** (§3e) — rebuild in V3, keep V2's blog live
   post-cutover, or make a deliberate call to sunset it. Don't let this
   default into "nothing happens and the content disappears."
5. **Split the sitemap into an index with bounded sub-sitemaps** (§3b),
   modeled on PredictZ's real structure, to extend match/result coverage
   beyond the current 4-day window without hitting the 2MB limit again —
   built locale-complete from the start.
6. **Fix `robots.ts`'s disallow list to match real route names** (§3d) —
   small, low-risk, easy correctness fix.
7. **Make an explicit, documented decision on §3c** (landing page vs.
   Today-only entry) rather than let the current architecture be the
   silent default answer to a real strategic question.
8. **Wire real per-fixture trend sentences using existing streak data**
   (§4.3) into whichever listing pages don't already have them — likely
   the single highest content-uniqueness improvement available without
   new data work. Locale-complete from the start.
9. **Add `FAQPage` schema** if/when an FAQ page exists in V3 (§3f/§4.5) —
   small, concrete, genuinely competitor-beating.
10. **Decide on region-specific hreflang codes for country-targeted pages**
    (§5's International Targeting note) — lower urgency, real decision to
    make consciously rather than inherit unexamined from V2.
11. **Decide whether home-record/away-record/H2H become their own indexed
    pages** (§4.6) — real content-fanout upside, real maintenance cost;
    make the call rather than default into either.
12. **Decide V3's indexing stance on standings/table pages** (§4.7) —
    Flashscore and BetExplorer disagree; V3 should pick a side on purpose.
13. **Confirm whether time-scope views (tomorrow, weekend, specific future
    dates) are real indexed URLs or only a client-side filter on `/today`**
    (§4.11) — if the latter, decide whether to add them as real routes.
14. **Confirm whether market-per-league pages exist or are worth adding**
    (§4.12) — one level deeper than §3a's entity-page fix alone provides.
15. **Adopt `dateModified` freshness maintenance and per-page-type title
    tuning as ongoing practices** (§4.13) for whichever evergreen pages
    V3 has or builds (FAQ, About, directory pages) — a process change,
    not a one-time fix.
16. **No action needed, confirmed already correct**: V3's single
    responsive build (§4.14) already avoids PredictZ's dual desktop/mobile
    anti-pattern — listed so it's never second-guessed later without
    checking this document first.

## 6a. If Wednesday is real: what actually has to happen by launch vs.
what can follow

Everything above is the complete picture — nothing here is being
dropped. But a 3-day runway means triage is itself part of doing this
right, not a shortcut. Splitting the same numbered list above into
launch-blocking vs. post-launch:

**Cannot ship without (real ranking-loss or correctness risk if skipped):**
- Item 1 — the V2→V3 redirect map and real 301s. Launching V3 while V2's
  462 indexed URLs 404 or silently move is actively destructive, not
  neutral — this is the one item where "launch without it" is worse than
  "launch a few hours later because of it."
- Item 2 — the one-line-class `sitemap.ts` entity-locale fix. Trivial
  effort, and shipping V3 with the exact bug §1 just diagnosed as the
  cause of a real ranking problem would be launching with a known,
  already-proven-costly defect.
- Item 6 — the `robots.ts` route-name fix. Small, mechanical, no reason
  to defer.
- Item 4 — at minimum, the *decision* about the blog (not necessarily the
  full rebuild by Wednesday) — even "V2's blog stays live post-cutover,
  V3 doesn't have one yet" is fine, as long as it's decided, not silently
  defaulted into a 404.

**Real, valuable, and genuinely fine to follow launch (none of these
block a correct, non-regressive Wednesday launch):**
- Item 3 / §4.10 — the geo-hub country system. This is new content
  investment, not a fix to something broken; launching without it is the
  same state V3 is already in today. Build it right when there's time to
  build it for all locales at once, not rushed by Wednesday into repeating
  §1's mistake under pressure.
- Item 5 — the sitemap-index/historical-match split. Current 4-day window
  is a known, accepted, already-shipped tradeoff, not a launch blocker.
- Items 7, 9, 11, 12 — the landing-page decision, `FAQPage` schema,
  home/away/H2H page-type expansion, and standings-indexing stance are
  all real decisions worth making deliberately, none are correctness
  risks if made in week two instead of before Wednesday.
- Item 8 — the auto-generated trend-sentence wiring is a real content-
  quality improvement, not a defect; fine post-launch.
- Item 10 — region-specific hreflang is explicitly noted above as lower
  urgency already.
- Items 13, 14, 15 — confirming/adding time-scope URLs and market-per-
  league pages, and adopting the freshness/title-tuning practices, are
  all real content-architecture improvements, none are regressions if
  deferred a short time.
- Item 16 needs no action at all — it's a confirmation, not a task.

**The honest bottom line for Wednesday**: items 1, 2, 6, and the blog
*decision* (not full rebuild) are the real gate — all four are small,
mechanical, and already precisely scoped above. Everything else in this
document is real, was not left out, and should happen — just not
necessarily by Wednesday, and rushing content-volume work (the geo-hub
system especially) under a 3-day deadline is exactly how §1's uneven-
locale mistake happens a second time.

## 7. What this document does not cover

- Actual keyword research / target query selection — this document is
  about technical and structural SEO readiness, not which specific search
  terms to prioritize. That's a real, separate piece of work.
- Backlink strategy — not addressed here at all.
- Paid acquisition / ads — out of scope, this is organic search only.
- The Value Picks / Kelly Criterion feature itself — fully specified in
  `doubleengine/docs/forebet-markets-implementation-spec.md` §3; this
  document only notes its SEO-surface implications in §4.8.
- Whichever of §3's fixes require actual implementation work (all of
  them do) — this document identifies and prioritizes the gaps; building
  the fixes is separate, scoped work.
