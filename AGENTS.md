<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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
