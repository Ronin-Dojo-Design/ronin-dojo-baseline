---
title: Desi Design Ledger
slug: desi-design-ledger
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0604
pairs_with:
  - docs/protocols/recipes/desi-design-review.md
  - docs/protocols/recipes/mobile-optimization-pass.md
  - docs/protocols/recipes/ui-ux-pass.md
  - docs/agents/desi.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - design
  - ledger
  - review
---

# Desi Design Ledger

The canonical home for **design / UX findings** — the destination the finding-router
([`closing.md` §6.7](../../rituals/closing.md)) was missing. Code findings already route (wiring→WL,
drift→D, SOP→FS…); a **design consistency / mobile / UI-UX finding** had nowhere durable to land, so it
either rotted in a SESSION file or became a scramble at push time. This ledger is that home.

Fed by the three **design passes** — [`desi-design-review`](../../protocols/recipes/desi-design-review.md)
(cross-brand consistency + component-reuse), [`mobile-optimization-pass`](../../protocols/recipes/mobile-optimization-pass.md)
(responsive / touch / mobile-first), and [`ui-ux-pass`](../../protocols/recipes/ui-ux-pass.md) (hierarchy /
friction / a11y) — plus any Desi review-wave dispatch. **Desi surfaces recommendations; a behavior change
is an operator-ratified, logged exception** (same contract as the code passes).

## Ledger contract

- **ID prefix `DES-NNN`.** Mint via `bun scripts/ledger-id-next.ts --prefix=DES` (FS-0030 — never number
  by tail-reading). Gaps stay burned.
- **Append-only rows; single-owner in-place status edits** (mirrors the shared-ledger discipline). A row
  stays **open** until a session or a design decision resolves it, then flip `Status: → resolved` with the
  SESSION reference (the inbound/outbound cross-off symmetry, `closing.md` §6.7).
- **Severity** P1 (blocks / member-facing regression) · P2 (must-fix soon) · P3 (note / polish).
- **Pass** which pass surfaced it (`design-review` | `mobile` | `ui-ux` | `review-wave`) — so a later
  sweep can re-run the right lens.
- Projection-only consumers (the SotD Component-Catalog, a future backlog aggregator row) READ this; they
  never write it. If a finding needs *code*, that's a normal build lane — this ledger tracks the finding,
  not the fix.

### Row template

```markdown
### DES-NNN — <one-line finding title>

- **Surface:** <route / component / file:line — where it shows>
- **Pass:** design-review | mobile | ui-ux | review-wave
- **Severity:** P1 | P2 | P3
- **Finding:** <what's wrong — the consistency break / friction / mobile defect>
- **Recommendation:** <Desi's proposed fix — a recommendation, not a mandate>
- **Status:** open | in-progress | resolved | declined
- **Found in:** SESSION_NNNN. **Resolved in:** <SESSION_NNNN or —>
```

## Entries

_No entries yet — the first design pass (a `desi-design-review` / `mobile-optimization-pass` /
`ui-ux-pass` run) appends `DES-001` here._

## Cross-references

- [`desi-design-review.md`](../../protocols/recipes/desi-design-review.md) · [`mobile-optimization-pass.md`](../../protocols/recipes/mobile-optimization-pass.md) · [`ui-ux-pass.md`](../../protocols/recipes/ui-ux-pass.md) — the three passes that feed this ledger.
- [`recipes/review-wave.md`](../../protocols/recipes/review-wave.md) — the reviewer fan-out that dispatches Desi.
- [`recipes/quality-suite.md`](../../protocols/recipes/quality-suite.md) — the **code**-pass sibling this mirrors.
- [`closing.md` §6.7](../../rituals/closing.md) — the finding-router that routes design findings here.
- [Desi agent](../../agents/desi.md) — the reviewer persona.
