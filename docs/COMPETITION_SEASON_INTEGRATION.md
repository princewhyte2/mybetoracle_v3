# Competition season integration — 2026-09-05

Founder approved implementation and push. See DoubleEngine's
`plans/2026-09-05-competition-season-integration.md` for the cross-repository plan.

Competition detail no longer derives its content from the first 120 Today rows.
It reads `mbo-competition-v1` from the authenticated MyBetOracle BFF, with canonical
competition UUID, season, tab and page. Overview, schedule, results, grouped
standings and published predictions are server-rendered with six locale labels.
Season and tab links preserve canonical identity; switching language preserves
the active view. Match links reuse the public match URL builder. No provider
calls or browser polling originate here. Table overflow stays inside the table.

Real-data verification: Premier League 2026, 380 fixtures, 20 standings teams,
all five tabs 200, all six locales render the table and canonical metadata.
Unknown/foreign season and competition IDs fail with 404 at the BFF; wrong
readable slugs permanently redirect while retaining the encoded UUID.
Desktop and 390px mobile inspected. TypeScript, focused lint and i18n pass.

Release order: DoubleEngine main, verify live contract; V3 backend
release/mybetoracle-v3-api, verify live adaptation; then this frontend main.
Production build passed (Next.js 16.3, 137 static routes; competition pages
remain request-driven). Backend pushes: DoubleEngine `35b90f9`, BFF `f77b9d8`.
Founder confirmed both Coolify deployments in progress; remote contract checks
and the dependent frontend push remain the next release action.
Other competitions populate progressively through the background season sweep;
API-Football coverage still governs tables. No fabricated standings or fixtures.
Team detail enrichment and player statistics are separate follow-up work.
