# MyBetOracle V3 Analytics Strategy

Status: Draft for review. Written 2026-09-13, grounded directly in the real
current state of V2 (`mybetoracle_client`) and V3 (`mybetoracle-v3`) as read
from both repos on this date. Every claim about V2/V3's current analytics
setup is from direct inspection of real files, not assumption.

## 0. The headline finding: don't pick a new tool, correctly adopt what
already exists

This is not a "which analytics vendor" decision. Confirmed directly:

- **V2 already runs GA4** (`G-W9WLR4T2E8`) via manually-injected `gtag.js`
  (`app/_shared/components/providers.tsx`).
- **V2 and V3 already share one real, live Firebase project** (`mybetoracle`
  — confirmed by matching `projectId` across both repos' Firebase config;
  V3's auth system was verified in production against this same project
  per `V3_BUILD_STATUS.md`).
- **That GA4 property is already linked to the shared Firebase project** —
  confirmed directly: V2's `utils/firebase.ts` config includes
  `measurementId: "G-W9WLR4T2E8"`, the exact same ID as the manual
  `gtag.js` snippet. Firebase only populates `measurementId` in its config
  once Google Analytics has been enabled and linked to that Firebase
  project in the console. **This means a single, unified, already-existing
  GA4 property already covers this business — it's just currently
  underused (manual `gtag.js` only, not the Firebase SDK; V3 doesn't use
  it at all yet) rather than missing.**
- **V3 currently has zero analytics implementation** — no `gtag`, no
  Firebase Analytics SDK usage found anywhere in `mybetoracle-v3/src`.
  Firebase is used there for auth only so far.

**The actual task is: adopt the Firebase Analytics SDK properly in V3
(replacing V2's manual `gtag.js` approach), point it at the same existing
`G-W9WLR4T2E8` property so historical continuity isn't lost, add the same
SDK to the mobile app when it's built, and fix one real compliance bug
found along the way (§1) — not evaluate Amplitude/Mixpanel/PostHog/Segment
from a blank slate.** This is also the free option at essentially any
realistic scale for this business, and the one with genuine native
cross-platform (web + iOS + Android) parity, which matters directly given
the stated mobile-app requirement.

## 1. Real compliance bug found — fix this during the V3 rebuild, don't
carry it forward

`providers.tsx`, read directly:
```js
gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  wait_for_update: 500
});
```
**The consent default is `'granted'`, not `'denied'`.** This means
analytics and ad-storage tracking fire for every visitor immediately, on
page load, before the `CookieConsentBanner` component has ever been shown
or answered — the banner only ever *downgrades* consent to `'denied'` if a
visitor explicitly clicks Decline; it never represents the true default
state. Google's own Consent Mode v2 requirements (mandatory for EEA
traffic since March 2024) specify the opposite: default to `'denied'`,
upgrade to `'granted'` only after explicit opt-in. Since V2/V3 serve
`es`, `fr`, `de`, `it` — all real EU languages, implying real EU-domiciled
traffic — this is a live compliance gap, not a theoretical one.

**Fix for V3**: default both `analytics_storage` and `ad_storage` to
`'denied'`, read any prior real stored consent choice before the first
`gtag`/Firebase Analytics initialization, and only call the granted update
after genuine consent. The existing banner UI and its six-locale copy
(`CookieConsentBanner.tsx`) are fine and reusable — it's specifically the
default state that's wrong, not the consent-collection UI itself.

### 1a. "By using this site you agree" (implied consent) was considered
and rejected — real legal reason, not a style preference

Raised directly during this planning: would an implied-consent notice
("by using this site, you agree") avoid the data loss that a real opt-in
banner causes, instead of fixing the default to `'denied'`? **No — this
would be a regression, not a fix, for real EU/EEA/UK traffic.** The CJEU's
*Planet49* ruling and subsequent EU data-protection-authority guidance
have explicitly and repeatedly rejected "continued use implies consent"
as valid consent for non-essential tracking (analytics, ad storage) —
consent must be a clear, affirmative, opt-in action. This isn't a matter
of interpretation or house style; regulators have fined companies for
exactly this pattern, and Google's own Consent Mode v2 (which this whole
setup depends on) is built around the same requirement. Since `es`, `fr`,
`de`, `it` are real EU languages this product deliberately targets, and
`pt-BR` (per `V3_LOCALIZATION_STANDARD.md`) falls under Brazil's LGPD
(similar affirmative-consent spirit), this isn't a theoretical edge case
— switching to implied consent would remove the one real, valid consent
mechanism V2 currently has (§1's banner, just misconfigured), trading a
fixable bug for no valid legal basis at all on exactly the traffic where
it matters most.

**What actually solves the real underlying goal (not losing valuable
data) without breaking the law:**

1. **Geo-differentiated consent.** Strict opt-in (Consent Mode v2,
   default `denied`) only where legally required — EU/EEA, UK, and Brazil
   for `pt-BR`. Everywhere else (Nigeria, Ghana, and the rest of the
   actual target markets per the WhatsApp-group work), a lighter,
   notice-only banner is legally sufficient — closer to "by using this
   site you agree" in spirit, just not applied to the traffic where it's
   actually regulated. This is standard, common practice, not a
   workaround — implement it via IP-based geolocation at the same layer
   that already decides locale defaults.
2. **Consent Mode v2 "Advanced" implementation**, not "Basic." Even when
   a visitor declines, Google models/estimates the gap in Analytics and
   Ads data using aggregate patterns from consenting users — meaningfully
   better data completeness than a hard cutoff, without needing anyone's
   decline to be overridden or ignored.
3. **Anonymous, aggregate, non-per-user counting** (raw event volume not
   tied to a persistent user/device ID) sits in a different legal
   category than per-user tracking and can often run regardless of
   consent state — a real, legal way to retain coarse volume signal even
   from users who decline granular tracking.

## 2. What to actually build: Firebase Analytics SDK (GA4) as the single
cross-platform source of truth

- **Web (V3)**: add the `firebase/analytics` SDK (not manual `gtag.js`)
  initialized against the existing Firebase config already used for auth
  — `logEvent()` calls instead of hand-rolled `gtag()` calls. This
  automatically reports into the same `G-W9WLR4T2E8` GA4 property V2
  already uses, preserving continuity.
- **Mobile app (future)**: the native Firebase Analytics SDKs for iOS/
  Android report into the *exact same* GA4 property automatically — this
  is the whole point of using Firebase Analytics specifically rather than
  a web-only tool. No separate mobile analytics vendor, no separate event
  schema to reconcile later, no data-warehouse-join problem between "web
  analytics tool" and "mobile analytics tool." One property, one event
  taxonomy (§3), three platforms.
- **Why not GA4 alone (bare `gtag.js`, what V2 currently does)**: it works
  for web but has no native mobile SDK story — you'd need a second tool
  for the mobile app and then reconcile two separate data sources to
  answer any cross-platform business question. Given a mobile app is an
  explicit, stated near-term requirement, starting the web implementation
  on the Firebase SDK now avoids a real migration later.
- **Why not Amplitude/Mixpanel/PostHog**: all three are genuinely strong
  product-analytics tools with better out-of-the-box funnel/retention UI
  than GA4's own interface — but none of them share existing
  infrastructure here (no existing account, no existing linked property,
  no existing shared project with the auth system), all charge
  per-tracked-user past a free tier at a scale this product may reasonably
  hit, and none remove the "reconcile two platforms' data" problem unless
  a second SDK is added to both web and mobile anyway. If GA4/BigQuery's
  analysis ergonomics prove genuinely insufficient later, layering one of
  these on top remains possible — but that's a real, separate decision to
  make once there's live data to be frustrated by, not a reason to avoid
  the already-in-place foundation now.

## 3. Event taxonomy — define this once, before implementation starts

The single most common way cross-platform analytics quietly breaks is
inconsistent event naming between web and mobile (`multi_pick_viewed` on
web, `MultiPickViewed` or `view_multipick` on mobile) — this makes every
cross-platform funnel query wrong or impossible without manual
reconciliation. **Write the event schema as its own reviewed artifact
before either the V3 web implementation or the mobile app starts logging
anything**, not organically per-feature. GA4's own naming convention
(snake_case, verb-object or object-verb consistently, e.g.
`prediction_viewed`, `multi_pick_built`, `booking_code_copied`) is a
reasonable default to standardize on.

Concrete events worth defining now, mapped to the real business questions
this product actually needs answered (§4):

| Event | Fires when | Key parameters |
|---|---|---|
| `today_viewed` | `/today` loads | `locale`, `date`, `fixture_count` |
| `prediction_viewed` | A fixture's prediction/market detail is opened | `locale`, `market_type`, `confidence_tier`, `fixture_id` |
| `multi_pick_viewed` | A published Multi-Picks slip is opened | `locale`, `band` (2/5/10/20/40), `variant` |
| `multi_pick_built` | User completes building a custom slip (Multi-Pick Builder) | `locale`, `leg_count`, `total_odds_band` |
| `booking_code_generated` | A real SportyBet booking code is produced | `locale`, `leg_count`, `total_odds`, `bookmaker` |
| `booking_code_copied` / `booking_code_shared` | User copies/shares the code — **the closest real proxy this product has for "did they actually go bet,"** since MyBetOracle structurally cannot see SportyBet-side bet placement | `locale`, `leg_count` |
| `streak_explored` | Streak Explorer interaction | `locale`, `metric`, `scope` |
| `result_viewed` | Results/settlement page viewed | `locale`, `result_type` (won/lost/void) |
| `save_toggled` | Save/watchlist action | `locale`, `entity_type` |
| `auth_completed` | Sign-up/sign-in completes | `locale`, `method` (email/Google/Apple/phone) |
| `locale_switched` | User manually changes locale | `from_locale`, `to_locale` |

Every event should carry `locale` as a standard parameter — this is what
makes it possible to directly answer whether the SEO work
(`V3_SEO_STRATEGY.md`) is actually converting locale-by-locale, not just
ranking.

## 4. Real business questions this should be built to answer

Naming these explicitly now so the event taxonomy above is judged against
real needs, not designed in the abstract:

1. **Is the SEO investment (`V3_SEO_STRATEGY.md`) actually converting, per
   locale?** Requires joining `today_viewed`/`prediction_viewed` volume
   and source (organic search vs. direct vs. WhatsApp referral, via UTM
   parameters — see §6) against `booking_code_generated`/`_copied` by
   `locale`. This is the direct, measurable answer to "we rank for French
   but not Spanish" evolving into "does French traffic actually convert
   better too, or just visit more" — a real, different, equally important
   question the SEO doc alone can't answer.
2. **Which markets/predictions do users actually act on, versus which
   ones get generated?** DoubleEngine already knows which predictions it
   *creates* and their real settlement accuracy (this session's earlier
   work on the accumulator-selection algorithm). Analytics answers the
   other half: which of those predictions users actually *view* and *act
   on* (`prediction_viewed` → `booking_code_generated` by `market_type`).
   Neither data source alone answers "build more of what's both accurate
   and actually wanted" — both are required together.
3. **Retention and return behavior tied to the daily publication cadence**
   — does a user who had a winning Multi-Picks slip come back the next
   day at a higher rate than one who didn't? Requires joining
   `result_viewed` (win/loss) against next-day `today_viewed` per user —
   a real, answerable cohort question once user-level event data exists
   (requires `auth_completed`/logged-in state to attribute return visits
   to the same person, not just anonymous session counting).
4. **Does the WhatsApp-group testing funnel (see memory:
   `whatsapp-group-testing`) actually produce app usage?** — real UTM-
   tagged links shared in that group, tracked as a distinct acquisition
   source through to `booking_code_generated`, answers whether that
   manual/co-pilot channel (deliberately kept manual per
   `whatsapp-communication-style` memory) is worth the ongoing time
   investment, with real numbers instead of impressions.
5. **Funnel drop-off**: `today_viewed` → `prediction_viewed` →
   `multi_pick_built`/`multi_pick_viewed` → `booking_code_generated` →
   `booking_code_copied`. Standard GA4 funnel exploration handles this
   directly once events are consistently firing — the single most
   standard "critical business question" this whole setup exists to
   answer, worth confirming works end-to-end early rather than assuming.

## 5. BigQuery export — the real mechanism for answering questions GA4's
own UI can't

GA4's built-in reports and Explorations UI are real but limited for
genuinely custom cross-cutting business questions (e.g. §4.2's "predictions
DoubleEngine rates highly vs. predictions users actually act on" requires
joining GA4 event data against DoubleEngine's own Postgres data — GA4's UI
cannot do this at all). **Enable the free daily BigQuery export from the
Firebase/GA4 property** (Firebase console → Project Settings → Integrations
→ BigQuery — free at standard daily-export granularity, streaming export
is a paid tier and not necessary to start) as part of this setup, not as a
later addition:

- Raw, event-level data lands in BigQuery daily, queryable with real SQL —
  this is what makes §4.2-style cross-referencing against DoubleEngine's
  own database possible (either by also exporting/mirroring relevant
  DoubleEngine tables into the same BigQuery project, or by exporting
  BigQuery results back out for a join against Postgres — either
  direction is workable, decide based on which system should own the
  "source of truth" join, a real architecture decision to make once both
  sides have real data flowing).
- This is also the escape hatch if GA4's own interface proves
  insufficient later — the data isn't locked into GA4's UI, it's real,
  exportable, SQL-queryable data from day one.

## 5a. GA4 will undercount real visitors — this is structural, not a
setup flaw, and it's measurable

Worth stating plainly so it's never mistaken for a bug later: **no
client-side analytics tool — GA4 or any other — reports a perfectly true
visitor count.** Real, independent sources of loss, roughly biggest to
smallest for a typical audience:

1. **Ad blockers** (uBlock Origin, Brave's built-in blocking, Safari
   Intelligent Tracking Prevention, Firefox Enhanced Tracking Protection)
   block `googletagmanager.com`/`google-analytics.com` from loading at
   all, client-side — usually the single largest source of loss, and
   entirely unrelated to consent law or §1's default-state bug. Typical
   desktop estimates run 15-30%+ depending on audience; mobile is usually
   lower.
2. **Consent declines** (§1, §1a) — real, but usually smaller in practice
   than ad-blocker loss.
3. **Bot/crawler misclassification** — GA4's bot filtering is imperfect in
   both directions.
4. **Cross-device double-counting** without a stable login-linked ID.

**The concrete, low-effort way to actually measure the size of this gap
rather than guess at it**: DoubleEngine's own BFF already logs real server
requests for `/today`, prediction views, booking-code generation, etc. —
these happen on every real page load regardless of whether the browser
blocks the analytics script, since the page still has to fetch real data
from the server either way. **Compare GA4's reported event count against
the BFF's actual server-side request count for the same event/day.** The
gap between the two numbers is the measurable size of the ad-blocker-plus-
consent-decline loss — this turns "is GA4 lying to me" from an open
worry into a concrete, checkable number, using infrastructure that
already exists.

**If that measured gap turns out to be large enough to matter**, the real
upgrade path is **server-side tagging** (Google Tag Manager Server-Side,
or the Measurement Protocol) — sending the analytics event from
DoubleEngine's/the BFF's own server instead of the browser, so it never
touches a blocklisted domain from the browser's side and ad blockers
can't intercept it. This was previously scoped in §9 as a "future
hardening step, not needed at launch scale" — that's still the right call
for launch, but the trigger for revisiting it should be a real, measured
gap from the comparison above, not a vague worry.

## 6. Attribution for non-search channels (WhatsApp, Telegram, social)

Given real, live channels already exist outside organic search (the
WhatsApp group, per memory), **use consistent UTM parameters
(`utm_source`, `utm_medium`, `utm_campaign`) on every link shared through
those channels**, not just relying on GA4's automatic channel grouping —
automatic detection often misclassifies messaging-app referrals as
"direct" traffic, which would make §4.4's question unanswerable. This
costs nothing beyond a naming convention (e.g.
`?utm_source=whatsapp&utm_medium=community&utm_campaign=fr_testing_group`)
and should be a standing practice for any link shared outside organic
search results, not something added retroactively.

## 7. Mobile-app-specific considerations (for when that work starts,
flagged now so the web implementation doesn't foreclose it)

- **Use Firebase Analytics' native SDKs (iOS/Android), not a
  React-Native-wrapped web view of GA4** — if the mobile app is built with
  React Native or a similar cross-platform framework, use the real native
  Firebase Analytics bridge library for that framework (e.g.
  `@react-native-firebase/analytics`), not a WebView loading the web app,
  which would misattribute all mobile usage as web sessions.
- **User ID linking**: if the same user uses both web and the mobile app,
  set Firebase Analytics' `setUserId` (tied to the existing Firebase Auth
  UID already used for web auth) on both platforms — this is what allows
  GA4 to merge a single person's cross-device journey rather than
  counting them as two separate anonymous users, directly relevant to
  §4.3's retention question once mobile exists.
- **App-specific events**: push-notification interaction, app-open
  attribution (deep links from shared booking codes opening the app
  directly), and app-store conversion — these have no web equivalent and
  should be scoped as their own addition to the taxonomy (§3) when mobile
  work actually starts, not retrofitted awkwardly onto web-shaped event
  names.

## 7a. Closing the gap between "data is flowing" and "the dashboard
actually answers the question" — this is not automatic, do it once,
deliberately

Events reaching GA4 and the dashboard being genuinely useful are two
different states, and the gap between them is a real, one-time setup step
worth doing explicitly rather than assuming it happens by itself:

1. **Verify events actually fire correctly before trusting any report.**
   GA4's real-time **DebugView** (Admin → DebugView, or via the
   `debug_view` flag during development) shows events as they happen,
   parameter-by-parameter. Check every event in §3's taxonomy fires with
   the right parameters here before relying on any report built on top of
   it — a silently-broken event (wrong name, missing parameter, firing on
   the wrong trigger) can sit unnoticed in a dashboard for months
   otherwise, quietly making every downstream report wrong.
2. **Register `locale`, `market_type`, `confidence_tier`, `band`, and
   every other custom event parameter from §3 as Custom Dimensions**
   (Admin → Custom Definitions → Create Custom Dimension). This is the
   specific, easy-to-miss step that determines whether "which locale
   converts best" is answerable in two clicks or requires a BigQuery
   query every time. Do this once, for every parameter in the taxonomy,
   at setup time — not reactively per question later.
3. **Mark `booking_code_generated` (and any other event that represents a
   real outcome, not just an interaction) as a Conversion** (Admin →
   Events → toggle "Mark as conversion"). This is what turns it from "one
   more row in an event list" into a tracked outcome GA4's acquisition
   and attribution reports treat as the goal.
4. **Build the specific Explorations §4's questions need, once, as saved
   reports**: a funnel Exploration for
   `today_viewed → prediction_viewed → multi_pick_built → booking_code_generated → booking_code_copied`
   segmented by `locale`; a retention/cohort Exploration comparing
   next-day `today_viewed` for users whose most recent `result_viewed` was
   a win vs. a loss (§4.3); a free-form breakdown of `prediction_viewed`
   vs. `booking_code_generated` by `market_type` (§4.2). Each is built
   once in the Explore tab and then stays live, updating automatically as
   new data arrives — this is the concrete, one-time work that makes
   "open the dashboard and see the answer" literally true afterward,
   rather than something reconstructed by hand each time someone asks.

**The honest sequence, stated plainly**: wire in the SDK correctly (§2) →
verify in DebugView (step 1 above) → register dimensions and conversions
(steps 2-3) → let a real few days of data accumulate → build the
Explorations once (step 4). After that point, and not before it, opening
the GA4 dashboard genuinely shows real, current answers to §4's questions
without further manual work — but skipping steps 2-4 and expecting the
default GA4 landing reports to show locale-conversion or funnel-drop-off
data directly will be a real, avoidable disappointment, since none of that
is visible in GA4's out-of-the-box views without this setup.

## 8. Prioritized action list

1. **Fix the consent-default bug** (§1) as part of implementing analytics
   in V3, not as a separate later task — building new analytics on top of
   a non-compliant consent default just extends the compliance gap into
   the new product.
2. **Add the Firebase Analytics SDK to V3**, pointed at the existing
   `G-W9WLR4T2E8` property, replacing the need for V2's manual `gtag.js`
   approach — real continuity, not a fresh start.
3. **Write and review the event taxonomy** (§3) as its own artifact before
   wiring events into V3's pages — cheap to get right now, expensive to
   fix once mobile also depends on the same names.
4. **Enable BigQuery export** (§5) at setup time, not after the first time
   a business question needs it.
5. **Adopt the UTM convention** (§6) for the WhatsApp channel and any
   other non-search sharing going forward.
5a. **Build the GA4-vs-BFF-server-log comparison** (§5a) once real data
   exists on both sides — turns "is GA4 undercounting" from a worry into
   a real, checked number, and is the trigger for whether server-side
   tagging becomes worth doing.
6. **Verify every event in DebugView, register custom dimensions, mark
   real conversions, and build the four core Explorations** (§7a) —
   without this step, the dashboard will not show §4's answers even
   though the data is technically flowing. This is what actually makes
   "open the dashboard, see real answers" true.
7. **Revisit this document when mobile-app work actually starts** (§7) —
   the native-SDK and user-ID-linking points are correct in principle now
   but should be re-confirmed against whatever framework the mobile app
   actually ends up built in.

## 9. What this document does not cover

- Building brand-new Explorations beyond the four named in §7a as
  concrete starting points — once those exist, extending them for new
  questions is normal, low-effort GA4 usage, not a strategy decision.
- A/B testing / experimentation infrastructure (Firebase Remote Config +
  A/B Testing is a natural fit given the same Firebase project, but a
  separate scoped decision from baseline analytics).
- Server-side tagging (Google Tag Manager Server-Side, or Firebase's
  Measurement Protocol for critical events immune to ad-blockers) — a
  real, valid future hardening step, not needed to answer §4's questions
  at launch scale.
- Data retention/deletion policy specifics for GDPR — the consent-default
  fix (§1) is necessary but not sufficient for full compliance; a real
  privacy-policy and data-retention review is separate, out-of-scope work
  here.
