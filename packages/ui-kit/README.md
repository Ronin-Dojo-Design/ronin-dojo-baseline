# @ronin-dojo/ui-kit

The Ronin / BBL **shared component kernel** — a DDD shared kernel (ADR 0033 D1) consumed by the
BBL app and (future) Mammoth. **Not** ad-hoc `apps/web/components`; a real workspace package so the
single-brand BBL app stays lean and a second product is a thin consumer.

This is the **foundation slice** (PWCC-002): the design-token surface + the `m-card` presentation
card. More kinds, mappers, and the board surfaces follow.

## What's here

| Export                                               | What                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `MCard`                                              | The ONE presentation card for `kind = task \| deal \| record`.                            |
| `tokens.css`                                         | The design-token surface — accent `#E52421`, dark/light inversion, spacing, radius, type. |
| `m-card.css`                                         | The card's styles (token-driven only; no hex).                                            |
| `BBL_LIGHT` / `BBL_DARK` / `FONTS` / `brandTokenCss` | Token literals as data (for generators / OG renderers).                                   |

## Usage

```tsx
import { MCard } from "@ronin-dojo/ui-kit"
import "@ronin-dojo/ui-kit/tokens.css"
import "@ronin-dojo/ui-kit/m-card.css"

// compact
<MCard
  kind="deal"
  data={{
    id: "d1",
    eyebrow: "Pipeline · Construction",
    title: "Kitchen remodel — Alvarez",
    meta: "Stage: Proposal · 3 days in stage",
    focal: { value: "$32,450", label: "deal size" },
    badges: [{ label: "Hot", tone: "accent" }, { label: "SLA 2d", tone: "warning" }],
  }}
/>

// rich (same data shape + hero + connector rows)
<MCard kind="record" density="rich" data={record} href="/directory/jane" />
```

## Design rules it encodes

`m-card` is a **presentation view-model** (ADR 0033 D3): its props are display VALUES, never a
domain model. A Task, a Deal, a Record keep separate aggregates upstream; a mapper hands the card
an already-projected, already-gated slice. The card never fetches.

From `design-system-grid-ratio-hierarchy.md` §4:

- **One focal value per card** (`focal`) — accent + emphasis; the eye lands once.
- **Identity cluster** — leading glyph (icon / avatar / checkbox) + title + muted meta.
- **Progressive enrichment, ONE component** — `density="compact"` (text) ↔ `"rich"` (+ golden-ratio
  hero + connector rows). Same data, two presentations; never a fork.
- **Connector-motif rows** reuse the lineage timeline-tree dotted-connector idiom.
- **Muted secondary meta** never competes with the title or focal value.

## Theming

The card references **only** `var(--mk-*)` tokens — never a brand. To re-skin: override the
`--mk-*` block, or bridge to a host's tokens (e.g. `--mk-accent: var(--color-primary)`). Dark is a
true inversion that follows the OS (`prefers-color-scheme`) and is forceable via
`<html data-theme="light|dark">`.

## Preview

Open `src/demo/index.html` in a browser (no build step) to see every kind × density × theme.

## Remaining work

This is a first slice. See the PR body for the full checklist (more kinds/mappers, Tailwind-token
bridge, board surfaces, Playwright proof).
