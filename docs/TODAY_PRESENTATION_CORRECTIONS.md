# Today presentation correction — 2026-09-15

Founder approved fixing hidden league URLs and restoring shared Value/Top
presentation, then pushing this narrowly scoped frontend correction.

- Removed prototype pinned names/counts and the name-only/default-Premier-League
  URL branch. The still-hidden section accepts real localized competition
  identities and uses the existing canonical entity slug codec. Invalid IDs are
  omitted and duplicate IDs are deduplicated. Personal pin persistence is not
  activated by this change.
- All Today views use the same OracleGauge and mobile score treatment, displaying
  the existing BFF confidence field rather than replacing it with probability.
- Removed the extra MarketIntelligence panel above the Oracle card and the
  extra value-evidence block within it. The standalone intelligence component,
  probability/value data, ranked selection/odds logic and backend calculations
  remain intact; this is a presentation change only.
- Focused presentation, market-route and value tests: 11 passed. No broad build
  or full browser visual certification was performed for this narrow correction.

This supersedes the hidden-shortcut defect entry in the cross-workspace public
navigation/footer proposal. That broader proposal is not implemented here.
