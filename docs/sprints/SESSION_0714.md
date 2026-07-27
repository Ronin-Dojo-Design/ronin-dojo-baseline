---
title: "SESSION 0714 — PL-032 SotD renderer unification + BBL hygiene"
slug: session-0714
type: session--implement
status: in-progress
created: 2026-07-27
updated: 2026-07-27
last_agent: claude-session-0714
sprint: S13
lane: bbl
recipe: "epic-plan"
goal_ids: [G-023]
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0712.md
  - docs/sprints/plans/petey-plan-0712-sotd-usefulness.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0714 — PL-032 SotD renderer unification + BBL hygiene

**Date:** 2026-07-27 · **Operator:** Brian + claude-session-0714

## Goal

Two operator-elected lanes in the black-belt-legacy checkout: **(A) PL-032 SotD-usefulness
session A** — unify the two SotD renderers on `_kernel/phase.ts` (kill D-055), land PL-020
belt-words once, bake Epics + Fan-out panels into `scripts/state-of-project.ts` so every future
snapshot carries them deterministically. **(B) BBL hygiene** — Doug's P3 residue from 0712:
pre-0304 petey-plan archive sweep, WEKAF PNGs → USA-Stickfighting, ADR 0055/0059 frontmatter,
api-client format/test scripts. (0712 already pruned the 6 stale worktrees.)

## Bow-in

- Previous session: `docs/sprints/SESSION_0712.md` — Phase C BBL trim (verdict **EXTENDED → YES**,
  PR #343 merged, CI 9/9). Nothing carries as a blocker. This session picks the BBL-runnable lanes
  from its `Next session` queue (Mammoth trim itself runs in mammoth-metal-buildings, ADR 0059).
- Branch/worktree: `session-0714-sotd-hygiene` @ canonical · status: clean · HEAD: `641aa635`
- Canonical claim: SESSION_0714 (was free; githooks doctor PASS via SessionStart hook).
- Operator answers (Petey's three + SotD ask): ⓪ prior goal **EXTENDED → YES** · ① lane =
  **PL-032 (A) + BBL hygiene (B)** · ② queued: Mammoth trim (other repo), FI-001 P0, RISK #2 ·
  ③ no pivot · **SotD frozen snapshot: YES** (published — see Artifacts).
- Parallel-lane assessment (1d): 2 disjoint file sets (renderer/kernel vs docs/config hygiene) but
  both single-repo + modest → two SEQUENTIAL lanes in one session/PR, not a worktree fan-out.
- On-demand blocks pulled: none yet (Cody pre-flight pulled per code task below).

## Petey plan

### Tasks

#### SESSION_0714_TASK_01 — unify `state-of-project.ts` on the kernel (D-055)

- **Agent:** Cody · **Depends on:** nothing
- **What / steps:** import `PHASES` / `BELT_WORD` / `PHASE_STOP_CLASS` / `VISIBLE_BRAND_SKINS` /
  `MASTHEAD_TITLE` from `apps/web/components/app/state-of-dojo/_kernel/phase.ts`; delete the
  script's private copies; wire deploy-scope gate + per-skin masthead.
- **Done means:** grep proves zero duplicated vocabulary; rendered HTML diff vs before is
  vocabulary-only; D-055 flips resolved.

#### SESSION_0714_TASK_02 — PL-020 belt-words once

- **Agent:** Cody · **Depends on:** TASK_01
- **What / steps:** on dojo skins, render `PHASE_LABEL` words (Planned / In flight / Review / Held /
  Done) on the belt ladder **instead of** `BELT_WORD` colors — **operator call 0714: reuse
  PHASE_LABEL, dojo + MMB converge on one vocabulary**. Keep `PHASE_STOP_CLASS` colored stops; fix
  vertical order to planned→done (white→blue→purple→brown→black); un-invert white/black stops.
  Edited ONLY in `_kernel/phase.ts` so both surfaces inherit (post-TASK_01 the script inherits too).
- **Done means:** `/app/state` + script render show PHASE_LABEL words on colored stops in correct
  order; PL-020 flips resolved w/ before/after artifact.

#### SESSION_0714_TASK_03 — Epics + Fan-out panels in the renderer

- **Agent:** Cody (Desi review on rendered output) · **Depends on:** TASK_01
- **What / steps:** two deterministic sections — Epics (parse `docs/epics/*` + product epic md +
  staged plan stubs + PL/G epic rows) and Fan-out (per-slot fork steps; SoT decided at build:
  `docs/protocols/fork-fanout.yml` or the plan file). 0712 hand-built artifact tabs = the mock.
- **Done means:** `bun scripts/state-of-project.ts` output contains both sections w/ live statuses;
  frozen-artifact publish needs no hand-merging.

#### SESSION_0714_TASK_04 — BBL hygiene sweep

- **Agent:** Cody · **Depends on:** nothing (disjoint from 01–03)
- **What / steps:** pre-0304 petey-plan archive sweep · WEKAF brand-kit PNGs → USA-Stickfighting ·
  ADR 0055/0059 missing frontmatter · api-client `format`/`test` scripts. Scope each to low-risk,
  reversible moves; verify no live references break.
- **Done means:** wiki-lint green; no executable-reference breakage; each item routed or done.

### Parallelism

TASK_01 → {02, 03} sequential (same renderer/kernel family). TASK_04 disjoint; runs independently.
All in one session, one PR.

### Open decisions / risks

- `_kernel` contract frozen (`{compact?}` only) — TASK_03 panels live in the SCRIPT renderer, not
  new app panels; flag any pressure to widen it.
- Post-trim BBL spine is brand-only (S13 era) — script board section shrinks; expected, not a regression.

## Pre-flight: TASK_01 — unify `state-of-project.ts` on the kernel vocabulary

### §0 arch-gate
- `bun scripts/arch-gate.ts` → `✓ all invariants hold` (4/4). Branch `session-0714-sotd-hygiene`,
  remote `Ronin-Dojo-Design/black-belt-legacy` — FS-0024 guard passed.

### 1. Known-risk investigation (path alias + `~/env`)
- `~/*` alias is defined ONLY in `apps/web/tsconfig.json` (`"~/*": ["./*"]`). There is **no root
  tsconfig**, so a root-run `bun scripts/*.ts` **cannot resolve `~/`**. All existing root scripts
  use relative `../apps/web/...` imports (confirmed: `ledger-backlog.ts`, `deferral-guard.ts`).
- `_kernel/phase.ts` imports `~/env` (which validates server env via `NEXT_PUBLIC_SOTD_ALL_BRANDS`
  and more), `~/components/common/badge` (React component, type-only but same file), `~/lib/utils`,
  `~/lib/state-of-dojo/parse`. Importing `phase.ts` wholesale into the bun script is therefore
  **not viable** (unresolvable alias + server-env validation side effect).

### 2. Approach decision — extract a framework-free vocab substrate
- Create `apps/web/lib/state-of-dojo/vocab.ts`: the **pure, dependency-free** projection vocabulary
  (`PHASES`, `PHASE_LABEL`, `BELT_WORD`, `PHASE_STOP_CLASS`, `BrandSkin` type, `BRAND_SKINS`,
  `DEPLOY_BRAND_KEY`, `phaseWord`, `DeploySkin`, `MASTHEAD_TITLE`, `CURRENT_DEPLOY_SKIN`,
  `MASTHEAD_TITLE_HERE`). Only `import type` from `./parse` (erased) — mirrors parse.ts's own
  "self-contained, runs under Bun and RSC" contract, so it sits next to parse.ts in `lib/`.
- `_kernel/phase.ts` re-exports everything from vocab (so every app consumer keeps importing from
  `_kernel/phase` unchanged) and **keeps** the two impure members it owns: `phaseBadgeVariant`
  (needs `badgeVariants` type from the badge component) and `VISIBLE_BRAND_SKINS` (needs `env`).
- `scripts/state-of-project.ts` imports the vocab it needs from `../apps/web/lib/state-of-dojo/vocab`
  and deletes its private `PHASES`/`PHASE_LABEL`/`BELT_WORD`/`BRANDS` copies + the duplicated
  `"State of the Dojo"` masthead literals (→ `MASTHEAD_TITLE_HERE`).
- **Why this over "script imports phase.ts":** single source of truth with ZERO new duplication and
  no server-env import into the script. Consumers unchanged (re-export). Verified all 8 kernel
  symbols are consumed only via `_kernel/phase` / `./phase`.

### 3. Scope decisions on the two "IF non-trivial → flag" riders
- **Per-skin masthead:** DONE (trivial, zero output change). `MASTHEAD_TITLE_HERE` == "State of the
  Dojo" for this deploy, so wiring it removes the duplicated literal with identical render.
- **Deploy-scope gate (`VISIBLE_BRAND_SKINS`):** **FLAGGED as follow-up, not done.** Two blockers:
  (a) it depends on `~/env` — wiring it means either importing env (breaks the plain script) or
  duplicating the `process.env` read + filter logic (new duplication, defeats the goal); (b) gating
  the script to BBL-only would DROP the RDD + MMB tabs/panels — a **data regression** in the render,
  directly violating Done-means #2 (vocabulary-only diff). The local script is an operator portfolio
  view (gitignored `out/`), not a customer deploy, so all-brands is intended here. Recommend a
  dedicated follow-up if a scope-gated variant is genuinely wanted.

### 4. FAILED_STEPS check
- FS-0002 (dev server), FS-0024 (cwd/remote guard) acknowledged. No prior FS specific to this
  script. No new deps, no schema, no auth surface.

### Scope guard

Session A is renderer-only: no new app routes, no `_kernel/contract.ts` widening, no RDD-Mono
aggregation, no loop-board embed. Cherry-pick landed commits up to rdd-monorepo after merge
(operator-directed). Hygiene = reversible moves only; anything ambiguous routes, not deletes.

## Cody pre-flight

<Per code-writing task: run docs/protocols/cody-preflight.md (§0 arch-gate first); paste filled
checklist here as `### Pre-flight: <task>` before writing code.>

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0714_TASK_01 | landed | `vocab.ts` substrate extracted (dependency-free); `_kernel/phase.ts` re-exports; `scripts/state-of-project.ts` imports it — zero dup'd vocab, render diff vocab-only, D-055 resolved. Deploy-scope gate flagged follow-up (would drop RDD/MMB tabs). Gates: arch 4/4 · tsc 0 · oxlint 0 |
| SESSION_0714_TASK_02 | landed | PL-020: `phaseWord()` returns `PHASE_LABEL` unconditionally in `vocab.ts` → both `/app/state` (projection.tsx, no edit needed) + script render show Planned/In flight/Review/Held/Done on colored belt stops. Fixes 2+3 (order/inversion) were D-055 symptoms already fixed by TASK_01 — verified via DOM, invariant comments added. `BELT_WORD` now zero-consumer → flagged for cleanup. Gates: arch 4/4 · tsc 0 · oxlint 0 · 105 tests pass |
| SESSION_0714_TASK_03 | landed | Epics (13 rows, 4 source types) + Fan-out (7 slots) sections baked into `scripts/state-of-project.ts`; new `docs/protocols/fork-fanout.yml` = Fan-out SoT (read via `Bun.YAML`). Deterministic (globs sorted; twice-render byte-identical sans timestamp). Gates: arch 4/4 · oxlint 0 |
| SESSION_0714_TASK_04 | landed | Hygiene: 6 pre-0304 lane files → `_archive/monorepo-era/lanes/` (1 left, live-ref'd) · 3 WEKAF brand-kit PNGs removed (unref'd, in usa-stickfighting fork) · ADR 0055/0059 frontmatter added · api-client `format` scripts + `.oxfmtrc.json` (README reformatted). WEKAF *app residue* (seeds/public/config) ROUTED, not touched. Gates: wiki-lint 0 err · api-client format:check clean |

**Decisions resolved:** PL-020 belt-word content (operator 0714) → **reuse PHASE_LABEL** on dojo
skins (Planned/In flight/Review/Held/Done); dojo + MMB converge on one vocabulary; keep colored
belt stops; fix order + un-invert white/black.

## Verification

Integration pass across all four lanes (working tree, pre-commit):

| Command / smoke | Result |
| --- | --- |
| `bun scripts/arch-gate.ts` | ✓ 4/4 invariants hold |
| `bun scripts/state-of-project.ts` (×2, diff sans timestamp) | deterministic ✓ (only 2 timestamp lines differ); 30 sessions · 32 goals |
| Ladder words in render | `Planned`/`Done` on stops (PHASE_LABEL) ✓ — not belt colors |
| Epics + Fan-out sections present | ✓ both `<h2>` render with live statuses |
| `apps/web` `tsc --noEmit` | exit 0 |
| oxlint (vocab.ts · phase.ts · state-of-project.ts) | clean |
| `bun run wiki:lint` | 0 err / 113 warn (all pre-existing, none on touched files) |
| `bun test lib/state-of-dojo/` | 105 pass / 0 fail |
| api-client `format:check` | all files correct |
| `docs/protocols/fork-fanout.yml` parse | ✓ 7 slots (Bun.YAML) |
| Doug full-diff verify (`641aa635..HEAD`) | **GO 9.2/10**, no hard cap — arch 4/4 · tsc 0 · `next build` PASS · format:check green · wiki-lint 0 err · `bun run test` green on clean run (the 5-fail run was pre-existing FS-0027 mock-leakage, 0 test files touched); import boundary + hygiene verified |
| Desi rendered-panel review (390px + 1100px) | structurally sound, mobile-clean, belt-words coherent; **2 publish-blockers** (YAML note truncation + epic-pill truncation) + 3 LOW deferred |
| Review fixes (commit `b57ed93f`) + re-verify | ✅ YAML notes quoted (BBL note renders full incl. `#343`) · epic pills tokenized (no truncation) · arch-gate pass · oxlint clean · deterministic |

**Follow-ups routed (bow-out finding router):**
- **FS (new):** unquoted YAML scalars containing ` #` are silently comment-truncated by `Bun.YAML.parse` (Doug+Desi, SESSION_0714) — fixed here by quoting; log the pattern + consider a lint guard.
- `BELT_WORD` now zero-consumer — cleanup candidate (needs operator sign-off before delete).
- SotD script **deploy-scope gate** not wired (would drop RDD/MMB tabs) — dedicated follow-up if a scope-gated variant is wanted.
- **WEKAF app residue** (seeds create `wekaf-usa` org · `public/images/brands/wekaf-usa` · `next.config` `wekaf.local` · email/tests) — baseline-vestige cleanup, route to WL/D.
- Desi LOW ×3 (epic-doc pill redundancy · phase-vs-status pill-color divergence doc · "Held" mid-ladder monotonicity) — follow-up session.

## Artifacts

| Artifact | Purpose | Status |
| --- | --- | --- |
| [State of the Dojo — SESSION 0714](https://claude.ai/code/artifact/76deeeae-b790-4c38-b306-c8a509a6d058) | bow-in State-of-Dojo frozen snapshot (deterministic `state-of-project.ts` render) | keep |

## Open decisions / blockers

None.

## Next session

- **Goal:** <bow-out>
- **First task:** <bow-out>

## Close evidence

<bow-out>

## Reflections

<bow-out — ≤5 bullets, each routed>
