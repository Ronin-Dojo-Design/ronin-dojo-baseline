---
title: "SESSION 0588 — merged-trunk code-quality suite over the 0583–0586 sweep range"
slug: session-0588
type: session--review
status: in-progress
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0588
sprint: S12
lane: repo
recipe: review
goal_ids: [G-022, G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0587.md
  - docs/protocols/page-code-review.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0588 — merged-trunk code-quality suite

> **Pre-staged stub (ADR 0049).** Created at SESSION_0587 bow-out. Reservation branch
> `session-0588-quality-suite-review`. The operator holds the finalized bow-in prompt (delivered
> in the 0587 chat); adopt this stub, verify the number via FS-0030, and run.

## Date

2026-07-20

## Operator

Brian + claude-session-0588

## Goal

Run the **merged-trunk variant** of the code-quality suite (`docs/protocols/page-code-review.md`,
SESSION_0567 shape) over the SESSION_0587 merged trunk (0583–0586 on local `main`): fallow
baseline → scored review (`/code-quality` + Desi UX lens) → `/fallow-fix-loop` for Class-A /
hard-cap fixes (behavior-preserving) → re-verify → prove the fallow delta. **First:** review/tweak
the page-code-review recipe with the operator — possibly conform it into a
`docs/protocols/recipes/quality-suite.md` card (0584 recipe-card format).

## First task

Bow-in per ADR 0049; grill the operator on the recipe before running. Carry in: **0583's C5
selected→hover neighborhood-glow redesign needs a Desi/operator design sign-off** (0587 Giddy P3);
and the **apps/web fixture-ownership test class** (0587: 47 fail, proven non-regression; the fix is
unmerged `session-0551-test-infra` `9d845bdd`; if 0587's trunk is still held on that, note it).
Read `docs/sprints/SESSION_0587.md` (§Full close evidence + Open decisions) first.

## Bow-in

- **Branch:** reservation `session-0588-quality-suite-review` was **stale** (pointed at early-0587
  `b7ec83ae`; local `main` was not its ancestor). Reconciled: `git branch -f` moved it onto local
  `main` (e56a0701) — carried no unique work (verified `merge-base --is-ancestor b7ec83ae main`).
- **Repo state (confirmed):** origin/main at `85f61a9a` (through the 0586 merge — docs/scripts/clients
  pushed); local `main` at `e56a0701` carries the full 0587 trunk incl. the **HELD 0583 apps/web
  merge**. Push still held pending `session-0551-test-infra` (`9d845bdd`) + local-green.
- **FS-0030:** `ledger-id-next --prefix=SESSION` → 366 numbers claimed, highest SESSION_0589; 0588 valid.
- **Scope of review = the four-lane trunk diff** `9059a640..1e9799bf` (pre-sweep base → last lane
  merge; excludes the 0587 close-writer bookkeeping): **69 files, +5212/−764**. Code-bearing = **24
  files** (21 source + 5 test): 0583 apps/web ×6, 0585 scripts ×6, 0586 MMB ×12. Docs/`.claude` = 45
  (0584 governance — wiki-lint/pointer lens).

## Grill outcome (recipe finalized)

Grilled the operator on adapting `page-code-review.md` (per-page) into the merged-trunk variant.
Four decisions pinned:

1. **Scope = whole diff, all four lanes** (0584 docs get a wiki-lint / pointer-discipline lens, not
   `/code-quality`).
2. **Depth = score + fix** — full `/fallow-fix-loop`, prove the fallow delta down.
3. **Fix push = split by deploy unit** — 0584 docs + 0585 scripts fixes may push independently; 0583
   apps/web rides the 0551/BBL-prod hold; 0586 MMB rides its own deploy.
4. **Write the card** — conform into `docs/protocols/recipes/quality-suite.md` (0584 card format);
   `page-code-review.md` stays the per-page SoT, the new card is its merged-trunk sibling. This run = the card's test case.

Two locked assumptions: **re-verify bar = delta-neutral** (no NEW failing files vs 0587's documented
fixture-ownership set — absolute green blocks on 0551, out of scope); **Desi C5 hover-glow = a design
recommendation only** (any behavior change is a logged Step-3 exception needing operator ratification).

## Fallow baseline (Step 1 — captured before any edit)

`npx fallow audit --changed-since 9059a640 --gate all` (JSON at scratchpad `fallow-baseline.json`):

| Metric | Total | Scoped hotspots (maxCRAP) |
| --- | --- | --- |
| Complexity | 23 findings | `technique-graph.tsx` 9×/**306** · MMB `sales/page.tsx` 3×/156 · MMB `actions.ts` 6×/110 · MMB `app/page.tsx` 1×/90 · `ledger-id-next.ts` 2×/42 · `ledger-backlog.ts` 1×/42 |
| Duplication | 2 clone groups | MMB `seed.ts` ↔ `apps/baseline/prisma/seed.ts` (cross-product seed) · MMB `sales/loading.tsx` ↔ `sales/page.tsx` (skeleton) |
| Dead code | 34 issues | 0 within the 24-file scope (all out-of-scope churn) |

## Petey plan

Execution shape (fan-out justified — disjoint deploy-unit file sets):

- **Review pass (read-only, scored):** 0583 apps/web → Desi (UX + C5 hover-glow sign-off) + `/code-quality`
  (highest scrutiny — member-facing, BBL-prod, CRAP 306); 0586 MMB → `/code-quality` + Doug (client gates);
  0585 scripts → `/code-quality` (+ optional D-051 parser pickup in `state-of-project-parse.ts`); 0584
  docs → wiki-lint + pointer/backlink discipline (Giddy-lens lite).
- **Fix pass:** `/fallow-fix-loop`, behavior-preserving, per deploy unit; re-verify delta-neutral; prove fallow delta down.
- **Deliverable:** the `recipes/quality-suite.md` card + logged baseline→final deltas.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0588_TASK_01 | done | Grill + finalize recipe (4 decisions pinned); scope + fallow baseline captured |
| SESSION_0588_TASK_02 | done | Wrote `recipes/quality-suite.md` card (0584 format); lint-clean |
| SESSION_0588_TASK_03 | done | Review wave (Desi/0583 + Doug/0586+0585 + Giddy/structural+seed) — verdicts below |
| SESSION_0588_TASK_04 | in-progress | Fixes: docs free-lane DONE (`f03daa62`); Cody dispatched for MMB + apps/web code |
| SESSION_0588_TASK_05 | pending | Re-verify (Doug+Desi on Cody diff) → prove fallow delta → push gate (HOLD, split) |

## Review wave — verdicts + scores

| Lane | Reviewer | Verdict / scores |
| --- | --- | --- |
| 0583 apps/web | Desi | SHIP, no P1. graph 7.0 (CRAP-306, separable PNG-export) · curriculum 7.7 · tooltip 9.0 · utils 9.3 (flag-only). **C5 hover-glow = KEEP.** |
| 0586 MMB | Doug | SHIP 8.3. lead-source/facet 9.2–9.3 gold. P2 = stale facet counts after intake. Parity = by-design. |
| 0585 scripts | Doug | SHIP 9.0. **D-051 already done in code** (verified). |
| 0584 docs | Giddy | Structural PASS (no P1). Pointer-discipline PASS. seq-research-recommend skill = unlinked copies → D-053. |
| seed dupe | Giddy `/rr` | **Leave — intentional divergence** (ADR 0038: seeds are per-product; "clone" = ~5 lines boilerplate). No build. |

## Decisions resolved (operator, SESSION_0588)

- **C5 hover-glow: KEEP + build touch-parity now** (first-tap selects+glows, second-tap opens) — ratified
  behavior change (Step-4 exception; the only non-behavior-preserving item this pass).
- **Cross-surface facet parity = BY DESIGN** (cockpit = active-only; board = all projects) — document in-code, no behavior change.
- **0583 scope = all P2 incl. PNG-export extraction.**
- **D-051 → RESOLVED** (parser already correct); **D-053 opened** (skill-pair hardlink drift — durable-guard fix direction).

## Next session

### Goal

### First task
