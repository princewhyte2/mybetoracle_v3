# MyBetOracle V3 Final Product Review

Status: Approved for UI contract freeze

Review date: 2026-08-15

## Product Decision

The current V3 route map is coherent. It should not be expanded before API
integration. The product is one connected football-intelligence system, not a
collection of independent prediction pages.

The mobile launch shell remains Today, Explore, Multi-Picks, Results and Saved.
Oracle Daily is a sixth desktop destination and a mobile hamburger item. The root
route redirects to `/{defaultLocale}/today` until the public landing page is
designed last.

## Route Verdicts

| Route or group | Verdict | Product role |
| --- | --- | --- |
| `/` | Redirect | Sends users to `/en/today` while the landing page is deferred. |
| `/{locale}/today` | Keep | Default daily fixture and prediction workspace. |
| `/{locale}/explore` | Keep | One discovery entry for football entities and evidence. |
| `/{locale}/calendar` | Keep | Date-oriented fixture discovery. |
| `/{locale}/competitions` and detail | Keep | Competition directory and entity intelligence. |
| `/{locale}/teams` and detail | Keep | Team directory, form and fixture entry. |
| `/{locale}/countries` and detail | Keep | Country hierarchy for competitions and fixtures. |
| `/{locale}/markets` and detail | Keep | Market discovery and historical context. |
| `/{locale}/streaks` | Keep | Historical evidence explorer, not a prediction page. |
| `/{locale}/match/{slug}` | Keep | Canonical rich match-intelligence destination. |
| `/{locale}/multi-picks` | Keep | Published daily and weekly Multi-Picks. |
| `/{locale}/multi-picks/builder` | Keep | User-created selection workflow. |
| `/{locale}/pick-analyzer` | Keep | Review step for a user-created combination. |
| `/{locale}/results` | Keep | Accumulator wins first, singles and performance second. |
| `/{locale}/saved` | Keep, private | Personal watchlist and alerts surface. |
| Profile, preferences and support | Keep, private | Required account and service utilities. |
| Responsible play, privacy and terms | Keep, noindex for now | Required trust/legal surfaces pending approved final copy. |
| `/{locale}/predictions` | Redirect only | Permanently redirects to Today; no duplicate predictions page. |
| `/{locale}/performance` | Redirect only | Permanently redirects to Results; no duplicate performance page. |
| `/brand` | Internal, noindex | Identity review board, never a public product destination. |
| Standalone Oracle Pick | Remove | Oracle Pick is a module in Today and Match, not another route. |
| Oracle Pro | Deferred | No route, lock state, pricing or visible CTA in the frozen launch UI. |

## Visual Review

All distinct route patterns were reviewed in the production build at desktop
and 390px mobile widths. No reviewed page produced page-level horizontal
overflow. Dense tables become vertical mobile feeds, the primary navigation
becomes a five-item bottom bar, and the match, Multi-Pick and saved workflows
retain their main actions.

The Results header was aligned with the Midnight product shell. Oracle Pro was
removed from active navigation because an inert premium CTA weakens trust.
Notification and profile controls now resolve to Saved and Profile rather than
remaining dead actions.

Streak Explorer is visibly connected from Today and leads Explore discovery.
Match and entity links carry their relevant team, competition or country into
the explorer, while the five-item primary shell remains stable.

## Pages Not Approved For Launch Content

- The public landing page remains intentionally undesigned.
- Privacy and Terms are structural prototypes, not approved legal documents.
- Support contact submission, authentication, persistence and notification
  delivery remain integration work.
- Mock football data must never become indexable production content.

## Approval Boundary

This review approves information architecture, route ownership, responsive
composition and UI contracts. It does not approve final production data,
commercial pricing, jurisdiction-specific legal copy or Oracle Pro.
