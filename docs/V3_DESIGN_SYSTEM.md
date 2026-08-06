# MyBetOracle V3 Design System

Status: Approved and locked

This document is the canonical visual foundation for MyBetOracle V3. Every
session that designs or implements UI must read it before making visual
decisions. Changes to the typography, core palette, or visual direction require
explicit user approval and must be recorded here.

## Product Character

V3 must feel exceptionally premium, precise, calm, and trustworthy. It is a
football intelligence product, not a generic dashboard or gambling interface.
Premium quality must come from typography, hierarchy, spacing, information
design, interaction quality, and restrained detail rather than decoration.

The established MyBetOracle association with blue must be preserved. V3 must
not be rebranded around red, green, orange, purple, or another dominant hue.

The public landing page is built last. Core workflows, responsive behavior,
states, and the design system must be proven before marketing surfaces are
designed.

## Typography

### Display: Sora Variable

Use Sora for:

- product identity and wordmark exploration
- major page headings
- Oracle Score
- high-value metrics and editorial moments

Approved weights: 600 and 700.

### Interface: Manrope Variable

Use Manrope for:

- navigation
- body copy
- buttons and controls
- forms
- match information
- tables and dense data
- labels, captions, and metadata

Approved weights: 400, 500, 600, and 700.

Use `font-variant-numeric: tabular-nums` for scores, odds, times, percentages,
rankings, and comparable statistics. Do not add a third monospace font unless a
future product requirement clearly justifies it.

Letter spacing is 0. Do not use negative letter spacing. Do not scale font size
with viewport width.

Load both fonts as variable fonts through the documented Next.js `next/font`
integration so they are self-hosted and do not cause layout shift.

## Core Palette: Oracle Blue

| Token | Value | Primary role |
| --- | --- | --- |
| `midnight` | `#07111F` | Deep navigation, dark intelligence surfaces, dark ink |
| `heritage-blue` | `#083F87` | Brand anchor and established recognition |
| `action-blue` | `#155EEF` | Primary actions, links, focus, active controls |
| `signal-blue` | `#2F80FF` | Data emphasis and selected information |
| `sky-blue` | `#68A7FF` | Supporting highlights on dark surfaces |
| `oracle-ice` | `#A9D3FF` | Premium cool highlight and dark-surface text |
| `blue-mist` | `#D7E8FF` | Selected light surfaces and subtle blue panels |
| `canvas` | `#F7FAFC` | Main light application background |
| `white` | `#FFFFFF` | Raised and focused surfaces |
| `graphite` | `#1C2530` | Primary text on light surfaces |
| `muted-text` | `#5F6C7E` | Secondary readable text |
| `border` | `#DCE3EA` | Dividers, outlines, and quiet structure |

`heritage-blue` preserves existing brand equity. `action-blue` is the primary
interactive color. Blue is applied intentionally; the interface must not become
a one-note wall of blue.

## Validated Contrast Pairs

| Foreground | Background | Ratio |
| --- | --- | --- |
| White | Action Blue | 5.41:1 |
| White | Heritage Blue | 10.14:1 |
| Canvas | Midnight | 18.07:1 |
| Oracle Ice | Midnight | 12.13:1 |
| Blue Mist | Heritage Blue | 8.15:1 |
| Muted Text | Canvas | 5.09:1 |

Revalidate contrast whenever a token is used in a new role. Do not communicate
meaning through color alone.

## Semantic Colors

Green, amber, and red are allowed only when their conventional semantic meaning
is necessary, such as success or win, warning or uncertainty, and error or loss.
They are never brand colors, large decorative surfaces, or navigation colors.

Every semantic state must also include text, an icon, a pattern, or another
non-color signal. Exact semantic scales will be defined when the related product
states are designed and contrast-tested.

## Surface Direction

- Use a light-first application with crisp white and cool-neutral work surfaces.
- Use Midnight selectively for navigation and high-value intelligence panels.
- Prefer solid surfaces, fine borders, and restrained shadows.
- Do not use decorative gradient fields, glowing orbs, bokeh, or excessive blur.
- Card radius is at most 8px unless a future approved component requires less.
- Do not place cards inside cards or make full page sections float as cards.
- Reserve large display typography for genuine product moments.
- Keep operational screens dense, calm, and optimized for repeated scanning.
- Use motion to communicate state, hierarchy, or causality, not as decoration.

## Data Visualization

Color must encode information rather than decorate charts. Oracle Blue may
represent the primary series, but comparisons must remain distinguishable by
value, label, pattern, line style, or shape as appropriate. Chart palettes and
Oracle Score bands must be tested for contrast and common color-vision
deficiencies before they are approved.

## Logo Direction

The existing mobile adaptive icon establishes the primary recognition anchor:
the heavy joined `MB` followed by a football acting as the `O`. Preserve that
MBO silhouette when modernizing the production identity.

The `MB` is a custom fused ligature with shared visual mass. Never reproduce it
as two normally typeset letters, loose characters, or letters separated by
tracking. Its construction may take inspiration from tightly integrated sports
wordmarks such as bet365, but the MyBetOracle geometry must remain original.

The exact legacy royal blue and white rectangular plaque are not mandatory.
Apply the approved Oracle Blue system and choose the variant with the strongest
contrast and most premium presentation for each context.

Use a responsive logo system:

- the modernized MBO is the primary symbol and app identity
- the full MyBetOracle wordmark accompanies it when space permits
- a purpose-built MB micro-mark is used for favicon-scale surfaces where the
  football detail and horizontal MBO silhouette cannot remain legible

The current raster artwork is reference material, not the V3 production master.
Production assets must use controlled vector geometry and include light, dark,
monochrome, app-icon, and micro-mark variants.

## Required Design Workflow

Before a major visual decision:

1. Research current high-quality product, sports-intelligence, editorial, and
   data-visualization references.
2. Use research to inform original work rather than copying another interface.
3. Test the decision on realistic dense content, not only ideal empty mockups.
4. Review mobile, tablet, desktop, and wide layouts.
5. Include loading, empty, error, unavailable-data, and locked states.
6. Record approved additions or changes in this document.
