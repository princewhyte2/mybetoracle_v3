# Mobile Today and conditional Match Details

Founder approved implementation and push, 2026-09-10/11.

## Scope

- Mobile Today uses stacked teams with aligned scores and a separate compact
  prediction/confidence/odds/outcome strip. Saved retains its independent action.
- Controls are readable with 44px targets; selected dates show their actual day.
- All fixture coverage, cursor loading, market choices and live delivery remain.
- Match Details hides empty sections and their navigation, unavailable picks,
  missing odds, empty team panels and empty player-stat columns. Real zeros stay.
- No backend, provider traffic, database, authentication or SEO contract change.
- Player portraits are not included: verify an authoritative photo source before
  extending the lineup view. Existing formation and shirt-number logic remains.

## Verification

- Eight Match Details tests, TypeScript, focused ESLint, translation verification
  (six locales) and production build passed. Final CSS date-label correction was
  verified through local hot reload and diff checks after the production build.
- Populated English/German/French/Spanish/Italian/Portuguese Today feeds checked
  in the browser; 360/390/430px checks found no horizontal page overflow.
- Mobile screenshot reviewed; market switching and direct match navigation work.
- A real finished match showed its score and available H2H while absent lineup
  and statistics tabs/panels were omitted.
- A React DevTools extension instrumentation error appeared in the local browser;
  its stack originates in chrome-extension installHook.js.
- Final desktop screenshot could not complete due to browser-tool timeout; do
  not claim a completed desktop visual regression check or production rollout.

## Release / rollback

Frontend-only main push. No migrations or environment changes. Coolify deployment
must complete before production is considered updated. Roll back the frontend
commit/image if needed; no data rollback is involved.
