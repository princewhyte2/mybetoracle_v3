<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cross-Workspace Engineering Governance

Before any integration, API, authentication, gating, caching, performance, SEO,
or launch-phase work, read
`../../DE/MYBETORACLE_V3_ENGINEERING_GOVERNANCE.md` completely. It is the
founder-approved cross-product boundary and quality contract.

No integration or launch phase implementation may begin until the founder has
reviewed and explicitly approved its written plan. Approval applies only to the
reviewed scope; material changes require a revised plan and renewed approval.

For the active Today integration, read
`../../DE/MYBETORACLE_V3_TODAY_ACTIVE_HANDOFF.md` and
`../../DE/doubleengine/plans/mybetoracle-v3-today-end-to-end-integration.md`
completely. The founder approved the revised Phase 1A scope on 2026-08-17;
material expansion still requires a revised plan and renewed approval.

## Canonical Launch Sequence

Before integration or launch work, read `docs/V3_LAUNCH_EXECUTION_PLAN.md`.
Its Phase 1 through Phase 8 numbering is the source of truth for execution
order. Do not reorder phases or expand launch scope without an explicit product
decision. The current objective is a stable launch, not subjective UI
perfection; restrict pre-launch UI changes to the blockers defined in that
document.

## MyBetOracle V3 Next.js Rule

The generated rule above is mandatory for every session and every agent.

Before writing or changing code that depends on Next.js behavior:

1. Identify the relevant guide under `node_modules/next/dist/docs/`.
2. Read the version-matched guide before choosing an API or convention.
3. Follow documented Next.js 16 behavior and heed its deprecation notices.
4. Do not rely on remembered behavior from older Next.js versions.
5. Record significant framework decisions in the V3 repository documents.

This applies especially to routing, layouts, rendering boundaries, caching,
data fetching, metadata, middleware, proxy behavior, images, fonts, Server
Actions, route handlers, configuration, build behavior, and deployment.

## MyBetOracle V3 Design Directives

- Read `docs/V3_BUILD_STATUS.md` at the start of every V3 session so work
  continues from the current approved product stage.
- Before any UI or visual work, read `docs/V3_DESIGN_SYSTEM.md`. It is the
  canonical, approved V3 design foundation. Do not replace its typography,
  palette, or visual direction without explicit user approval.
- Build the public landing page last, after the core product surfaces and
  design system have been validated.
- V3 must feel exceptionally premium, precise, and trustworthy. Treat visual
  quality as a product requirement, not final-stage polish.
- Research current, high-quality product, sports-intelligence, editorial, and
  data-visualization references before major design decisions. Use research
  to inform original work; do not copy another product's interface.
- Do not assume the V2 palette is the V3 design system. Existing colors are
  reference material until a V3 direction is reviewed and approved.
- Define colors as semantic tokens and verify contrast, dark/light behavior,
  chart legibility, status meaning, and color-vision accessibility.
- Avoid a one-note blue interface. Brand color, neutrals, data colors, and
  semantic states must have distinct jobs.
- Design real product workflows and all relevant responsive, loading, empty,
  error, unavailable-data, and locked states before designing marketing pages.

## MyBetOracle V3 Localization Rule

- V3 launches with at least the six locales supported by the current product:
  English (`en`), Spanish (`es`), French (`fr`), German (`de`), Italian (`it`),
  and Portuguese (`pt`). More locales must be addable without redesigning the
  application or duplicating the complete route tree by hand.
- English may be used as the initial mock-content language, but no component,
  route decision, navigation pattern, layout, or data contract may assume an
  English-only product.
- Design for text expansion, locale-specific date and number formatting,
  translated metadata, locale-aware links, and future writing-direction needs.
- Do not advertise or generate a localized public page until that exact page
  exists and satisfies the publication rules inherited from V2.
- Authentication, authorization, and access gating are deferred during the UI
  prototype phase. Build and review complete product surfaces with mock data;
  integration and gating behavior will be planned after visual approval.

## MyBetOracle V3 Public Terminology Rule

- Use `Multi-Picks` as the public product name in every locale. Do not display
  `Acca`, `accumulator`, or localized gambling-led equivalents in product copy.
- Use `Oracle Daily` as the public name for the separate daily publication.
  Keep `/betslip` and betslip model names internal only.
- Internal route names, API contracts, types, and legacy data fields may retain
  accumulator terminology where changing them would break integration.
- Frame odds as recorded analytical evidence. Do not use stake, payout,
  returns, deposit, wager, or place-bet language, and do not imply that users
  gamble or transact through MyBetOracle.
- Preserve established football market notation such as `1X2`, `O/U`,
  `GG/NG`, and the `Oracle Score` product name.
- Read `docs/V3_LOCALIZATION_STANDARD.md` before translating public UI copy.
