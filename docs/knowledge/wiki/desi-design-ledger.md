---
title: Desi Design Ledger
slug: desi-design-ledger
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0612
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

### DES-001 — WorkBoard grid stuck at 4 cols after the 5-belt change

- **Surface:** `apps/web/components/app/state-of-dojo/_kernel/projection.tsx:92` (`WorkBoard`) — renders through both WS-B catalog boards.
- **Pass:** review-wave (Desi, WS-B/C/D fanout)
- **Severity:** P1
- **Finding:** `held` was added to `PHASES` (5 belts) but the grid stayed `lg:grid-cols-4` and mobile-order covered only 4 phases, so the 5th column wrapped and `held` rendered first on mobile.
- **Recommendation:** `lg:grid-cols-3 xl:grid-cols-5` + `held → max-sm:order-2` + fix "4-stop" comments.
- **Status:** resolved
- **Found in:** SESSION_0609 (fanout review). **Resolved in:** SESSION_0609 (`4edcb1b1`).

### DES-002 — No shared chart / `dataviz` primitive; duplicated projection chassis + table idioms

- **Surface:** `token-cost/token-cost-chart.tsx` (area) vs `components/admin/chart.tsx` (bar); `RecipeCard`/`ProjectionCard` chassis + the raw-`<table>` idiom repeated 2–3×.
- **Pass:** review-wave (Desi)
- **Severity:** P3 (YAGNI now — kernel frozen, exports neither)
- **Finding:** two chart impls (neither an L1), and the card-chassis + plain-table idioms are copied across panels.
- **Recommendation:** extract shared helpers when a 3rd consumer appears; accept the current hand-rolls (both are tokens-correct + a11y-complete).
- **Status:** open — **SESSION_0610 ratified the YAGNI accept** (kernel frozen, exports neither chart nor a shared table). Row kept open as a **watch**: re-trigger the extraction when a 3rd chart/table consumer lands. No code this session. **SESSION_0612 re-check: still exactly 2 chart impls** (`token-cost-chart` area + `admin/chart` bar) — no 3rd consumer appeared; the near-dup `TokenCostSessionTable`/`TokenCostModelTable` pair (DES-710) is a same-file 2× and doesn't clear the bar either. Leave open, keep watching.
- **Found in:** SESSION_0609. **Resolved in:** —

### DES-003 — WS-B/C/D panel P2s (for the trio code-review session)

- **Surface:** `token-cost-panel.tsx:45,55` · `token-cost-chart.tsx:42,85` · `cookbook-panel.tsx:84-96`.
- **Pass:** review-wave (Desi)
- **Severity:** P2
- **Finding:** (1) token-cost `<ProjectionSection accent>` used with no `--sotd-accent` in scope → border falls back to `currentcolor` (dark foreground, not accent); (2) chart `preserveAspectRatio="none"` distorts the endpoint circle into an ellipse under X-stretch; (3) cookbook `TabsList` (5 triggers + count badges) likely overflows at 375px — needs a live mobile check.
- **Recommendation:** (1) set `style={{"--sotd-accent":"var(--color-primary)"}}` on the root or drop `accent`; (2) drop the endpoint circle or make it a CSS-positioned dot; (3) scrollable `TabsList` or drop badges below `sm`. Plus P3 microcopy nits (singular/plural "1 components"; raw `(SESSION_0606)` in empty copy; compact-mode ladder parity with `state-panel`).
- **Status:** resolved
- **Found in:** SESSION_0609. **Resolved in:** SESSION_0610 (quality-suite fanout, 3 Cody worktree lanes).
  - **WS-D** (`5e984163`): (1) `--sotd-accent: var(--color-primary)` scoped on the token-cost panel root; (2) endpoint `<circle>` → CSS-positioned `<span>` dot (stays round under `preserveAspectRatio="none"`), `aria-label` preserved.
  - **WS-C** (`2beabbbf`): (3) `max-sm:hidden` on each `TabsTrigger` count `Badge` — live-verified at 375px, all 5 stage labels fit, no overflow.
  - **WS-B** (`e45671e6`): `countNoun()` plural helper (→ "1 component"); stripped raw `(SESSION_0606)` from empty copy; compact-mode ladder parity with `state-panel.tsx:80-83` (keep visual `GoalLadders`, drop only `GoalLadderTable`). Belt-ladder live-verified legible/unclipped at 375px.
  - **Manual boundary:** WS-D's chart + accent border render only when sessions carry `telemetry:` frontmatter (local env = empty state) — verified by source + clean build; live render is a prod-only smoke item.

### DES-004 — Token-cost tables: left-aligned numerics + head/body hierarchy collapse

- **Surface:** `token-cost/token-cost-table.tsx` — both `TokenCostSessionTable` + `TokenCostModelTable`.
- **Pass:** review-wave (Desi /hallmark)
- **Severity:** P1 (numeric alignment) + P2 (header hierarchy)
- **Finding:** every numeric column (Input tok / Output tok / Cost) was left-aligned, so ragged numerals defeated the scan a $/token comparison table exists for; the `thead` was the same `text-xs` size as the body, so head/body didn't separate.
- **Recommendation:** `text-right` + `tabular-nums` on the numeric `th`/`td`; `thead` row → `text-2xs uppercase tracking-wide` caption idiom.
- **Status:** resolved
- **Found in:** SESSION_0612. **Resolved in:** SESSION_0612 (`1b53880f`).

### DES-005 — Token-cost chart had no value anchor

- **Surface:** `token-cost/token-cost-panel.tsx` — under `<TokenCostChart>`.
- **Pass:** review-wave (Desi /hallmark)
- **Severity:** P2
- **Finding:** the area+endpoint trend was expressive but unquantified — a reader saw a rising line and couldn't read magnitude (peak/latest); the header showed only the total.
- **Recommendation:** a `text-2xs tabular-nums` caption `peak $X · latest $Y` reading `feed.series` already in scope (display-only, no fetch change), inside the `≥2` chart branch.
- **Status:** resolved
- **Found in:** SESSION_0612. **Resolved in:** SESSION_0612 (`1b53880f`).

### DES-006 — SotD panel header paths rendered as bare prose (empty state wrapped them in `<code>`)

- **Surface:** `component-catalog-panel.tsx` + `card-catalog-panel.tsx` (`docs/knowledge/wiki/files/`) · `cookbook-panel.tsx` (`docs/protocols/recipes`).
- **Pass:** review-wave (Desi /hallmark)
- **Severity:** P3
- **Finding:** each panel's header showed a repo path as plain text while that same panel's own empty state wrapped the identical path in `<code>` — one panel, two treatments.
- **Recommendation:** wrap the header path in `<code>` to match the empty-state idiom (3 sites).
- **Status:** resolved
- **Found in:** SESSION_0612. **Resolved in:** SESSION_0612 (`1b53880f`).

### DES-007 — Cookbook recipe card: `when` vs `why` undifferentiated

- **Surface:** `cookbook-panel.tsx` — `RecipeCard`.
- **Pass:** review-wave (Desi /hallmark)
- **Severity:** P3
- **Finding:** `when` (trigger) and `why` (rationale) were both `text-muted-foreground` differing only by size — two grey unlabeled lines read as undifferentiated.
- **Recommendation:** give `why` a distinguishing cue: `text-muted-foreground/80 italic` (keeps it clearly tertiary; copy unchanged).
- **Status:** resolved
- **Found in:** SESSION_0612. **Resolved in:** SESSION_0612 (`1b53880f`).

### DES-008 — Cookbook per-stage tab counts vanish at 375px

- **Surface:** `cookbook-panel.tsx:90` — the `TabsTrigger` count `Badge` carries `max-sm:hidden`.
- **Pass:** review-wave (Desi /hallmark)
- **Severity:** P3
- **Finding:** the `max-sm:hidden` that SESSION_0610 (DES-003) added to fix the 375px `TabsList` overflow also removes the per-stage triage counts on mobile — the viewport the hallmark cares about loses the signal.
- **Recommendation:** replace the hidden badge on small screens with a lighter bare parenthetical `(N)` `text-2xs` span (keeps the count without the badge's width), then live-verify it still fits 5 triggers at 375px.
- **Status:** open — **SESSION_0612 deferred: NOT built.** The proposed change reverses SESSION_0610's *live-verified* 375px overflow fix; shipping it blind risks re-introducing the overflow, and the win (P3 count on mobile) doesn't justify that without a fresh 375px live check. Kept open as a watch — build only behind a live 375px verification.
- **Found in:** SESSION_0612. **Resolved in:** —

## Cross-references

- [`desi-design-review.md`](../../protocols/recipes/desi-design-review.md) · [`mobile-optimization-pass.md`](../../protocols/recipes/mobile-optimization-pass.md) · [`ui-ux-pass.md`](../../protocols/recipes/ui-ux-pass.md) — the three passes that feed this ledger.
- [`recipes/review-wave.md`](../../protocols/recipes/review-wave.md) — the reviewer fan-out that dispatches Desi.
- [`recipes/quality-suite.md`](../../protocols/recipes/quality-suite.md) — the **code**-pass sibling this mirrors.
- [`closing.md` §6.7](../../rituals/closing.md) — the finding-router that routes design findings here.
- [Desi agent](../../agents/desi.md) — the reviewer persona.
