# Match Details / Multi-Picks repair — 2026-09-07

Founder approved implementation and push. Shared engine plan:
`../../../DE/doubleengine/plans/2026-09-06-match-details-and-multi-picks.md`.

- Historical publications no longer fail BFF validation on structured settlement
  evidence. Results renders paginated real tickets with independent scope/outcome
  filters. The Complete history action opens Results.
- Team form and recent matches come from canonical fixtures before kickoff.
- Provider lineups retain starters, substitutes, coach, numbers and formation.
  Pitch positions require a complete valid supplied grid; no guessed lineup.
- Match statistics keep periods/units/zero distinct from missing data. Player
  ratings, minutes, goals and assists display only supplied values.
- Recent final-match caching allows late enrichment. Detail refresh remains
  event-driven, bounded to one active fetch and cancelled on unmount.
- Missing sections no longer fill the overview with repeated empty panels.
  Service failures use localized retry links instead of internal error codes.

Verification: historical Sep 5 (12 tickets), Sep 4 (empty without crashing), real
Results (25 tickets, 2 pages), six-locale upcoming/stored-live/finished contracts,
five new automated pitch/form/statistic tests, type/lint/i18n and production build.
Mobile pitch screenshot verification is still outstanding.

The engine's configured enrichment cap blocked the final provider verification
before transport. Existing production budget overrides still need checking; this
release does not bypass limits or pretend every missing data section is filled.
V2 is unchanged. No schema migration, new Redis connection or new worker.
