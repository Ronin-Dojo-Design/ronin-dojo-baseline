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
next_session: docs/sprints/SESSION_0715.md
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

### Pivot — grill 0714 (operator: A = full parity to the 0712 artifact)

**What happened:** the operator reviewed the shipped work against the SESSION_0712 hand-built
artifact (`77fd25bb`) and rejected the flat-sections approach. `/grill-me` outcome: **A (full
parity) + F (fix-lane)**. The PL-032 plan under-specified fidelity — "bake Epics/Fan-out *panels*"
was built as two flat appended sections, NOT a reproduction of the 6-tab board the operator
hand-built and liked. **Root disconnect:** nobody opened the operator's artifact and built to it;
the plan's "the 0712 artifact tabs are the mock" was read as inspiration, not spec.

**Corrected goal:** `scripts/state-of-project.ts` must **deterministically reproduce the 0712
artifact** — 6 top-level tabs (RDD · BBL · MMB · Fan-out · Epics · What landed), the 8-sub-tab
Fan-out board, categorized Epics (4 groups), and the What-landed panel. Live data stays live;
bespoke fork/epic/landed narrative → structured data so it regenerates. **KEEP** this session's
belt-word swap (operator liked it) + the `vocab.ts` substrate (the unification is the right base).

**Literal fidelity spec:** `docs/product/black-belt-legacy/_sotd-spec/SESSION_0712-artifact-target.html`
(the operator's own artifact, saved). Build to THIS, do not invent.

#### SESSION_0714_TASK_05 — reproduce the 0712 artifact deterministically (Cody → fidelity-loop)

- **Done means:** `bun scripts/state-of-project.ts` renders all 6 tabs matching the spec's
  structure + content; Fan-out is the sub-tabbed board; Epics categorized; What-landed present;
  live sections still pull live; deterministic re-render; operator sign-off on visual fidelity.

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
| SESSION_0714_TASK_05 | landed (`eb2cb782`) | **Full-parity rebuild (grill pivot A).** `state-of-project.ts` now reproduces the 0712 6-tab board deterministically: RDD/BBL/MMB (live data) + Fan-out 8-sub-tab board + Epics (4 groups, live 13 rows kept) + What-landed. Fan-out + What-landed **byte-identical to spec**; new `fork-fanout.yml` (board) + `sotd-landed.yml` data (block scalars — dodges the `#`-truncation trap). Belt-words = PHASE_LABEL (operator). Gates: arch 4/4 · oxlint 0 · deterministic. **Remaining: operator visual sign-off + 390px pass.** |
| SESSION_0714 process | landed (`f5c782a9`) | **FS-0044 no-orphan-front-end guard** — CLAUDE.md standing directive + agent-systems-map §4 never-do (Pillar 4∩5) + cody-preflight §0b gate + FS-0044 + memory. Prevents the flat-sections miss recurring. |

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
| [State of the Dojo — SESSION 0714](https://claude.ai/code/artifact/76deeeae-b790-4c38-b306-c8a509a6d058) | Full-parity 6-tab board (reproduces the 0712 mock `77fd25bb` deterministically from live data) — pending operator sign-off | keep |
| [SESSION_0712 artifact (operator's original)](https://claude.ai/code/artifact/77fd25bb-4dd6-4f34-98f0-98dea93adbfd) | The fidelity spec TASK_05 reproduces | reference |

## Open decisions / blockers

None blocking. Architectural note (operator, grill 0714): the **portfolio SotD** (cross-repo status
aggregation) lives in **rdd-monorepo** and pulls every sibling's status via the GitHub-API fetch
pattern — the BBL board here is necessarily brand-local (ADR 0059), and its Fan-out per-slot status
is hand-maintained `fork-fanout.yml` (will drift). The live cross-repo version is the rdd-monorepo
session (already ratified as PL-032 session B). Not a blocker; routed to Next session.

## Next session

- **Goal:** rdd-monorepo bootstrap + **PL-032 session B** — cherry-pick this session's SotD renderer
  up, then make the **portfolio Fan-out board live** (cross-repo status via GitHub-API fetch, so it
  reflects the Mammoth trim + every sibling without hand-editing). Set the weekly RDD sync day.
- **First task:** clone/bootstrap rdd-monorepo; cherry-pick `a9530dc0`+`eb2cb782` (renderer + data);
  scope the cross-repo fetch (read each sibling's `docs/sprints/*` + goals-ledger via `gh api`).
  Queued behind/alongside: **BBL cleanup lane** (loadEpics complexity extract · `BELT_WORD` delete ·
  SotD deploy-scope-gate decision · WEKAF app-residue · Desi 3 LOW + Doug 2 P3).

## Close evidence

**/ggr composite:** **9.1/10 — CLEARS** (≥9.0, ADR 0052 D6) · **Caps applied:** none (no behavior
regression — render byte-identical; no Dirstarter bypass; new `vocab.ts` + yaml-data pattern
documented in-file). **Systemic health:** CI = pending (runs on PR push) · findings routed 9/9 ·
FS patterns: none re-fired (FS-0044 newly minted, mitigated).
**Reviewer verdicts:** Doug **GO 9.2** (bulk `a9530dc0..3fb382bc`) + **GO 9.5** (TASK_05 delta
`eb2cb782`) · Desi pass (2 blockers fixed: YAML truncation + epic-pill) · Giddy n/a (structure
reviewed via the /ggr score).
**Findings ≥ medium:** none open. loadEpics CRAP 306 (`state-of-project.ts:264`) = D3/D5 note →
routed to the BBL cleanup lane. Doug 2×P3 (landedPanel guard symmetry · fpanel DOM order =
intentional spec fidelity) → cleanup lane / no-action.
**ADR / ubiquitous-language check:** no new ADR required — PL-032 session A executes the SESSION_0712
grill decisions (SotD home = rdd-mono + per-brand; renderer-first; build-in-BBL-sync-up); D-055 flipped RESOLVED.

| Step | Proof |
| --- | --- |
| Task log | PASS — 5 tasks + process guard, all landed |
| Gates | arch 4/4 · tsc 0 · oxlint clean · wiki-lint 0 err/115 warn · 105 state-of-dojo tests · deterministic render |
| /ggr composite | 9.1 CLEARS (Doug 9.2+9.5 · Desi pass · fallow MI 81.5) |
| Runtime verification (Doug) + artifact | full-parity board proven byte-identical to spec; [artifact](https://claude.ai/code/artifact/76deeeae-b790-4c38-b306-c8a509a6d058) |
| Finding router | D-055 RESOLVED · FS-0044 minted · 7 follow-ups → Next session cleanup lane + rdd-mono session |
| Git hygiene | branch `session-0714-sotd-hygiene` · 8 commits · clean tree · single push at close (pending operator go) |
| Graphify | full rebuild at close (below) |
| Secret scan | PASS (clean) |

## Reflections

- **The plan under-specified fidelity and no one opened the operator's artifact — the expensive
  miss.** PL-032 "bake panels" was built as flat sections; the fix was to reproduce the operator's
  own 0712 artifact. → route: FS-0044 + CLAUDE.md/agent-systems-map §4/cody-preflight §0b guards (landed).
- **The reproduction only worked because live vs bespoke was split cleanly:** live data stays live
  (ledgers), bespoke narrative → yaml block scalars. Block scalars (`|-`) also killed the
  `Bun.YAML` `#`-truncation trap outright (no quoting). → route: pattern in `fork-fanout.yml` header comment.
- **Verification passed the wrong thing because it diffed the plan, not the operator's artifact** —
  Doug/Desi both cleared the flat build. The guard now makes verification diff against the reference
  artifact (Pillar 4∩5). → route: agent-systems-map §4 (landed).
- **The portfolio-vs-brand-local SotD split is real and ratified:** cross-repo status can't come from
  a brand-local repo (ADR 0059); the live aggregation is rdd-monorepo work. → route: Next session (PL-032 B).
- **`vocab.ts` unification (D-055) is the quiet win** — it's why the belt-word change landed once and
  the script could inherit the kernel vocabulary at all. → route: D-055 RESOLVED.

## Goal verdict

**EXTENDED → YES.** PL-032 session A (renderer unification / D-055 + PL-020 belt-words + BBL hygiene)
hit and Doug-verified (GO 9.2). Mid-session the operator caught that the build had produced flat
sections instead of reproducing the SESSION_0712 artifact they'd hand-built; `/grill-me` re-scoped
to **full parity (A)** → the renderer now reproduces the 6-tab board deterministically from live data
(Doug GO 9.5, byte-identical to spec). Plus **FS-0044 "no orphan front-end" guards** landed to
prevent recurrence. `/ggr` composite **9.1 CLEARS**. Operator elected: push + PR + squash-merge when
green; next lane = rdd-monorepo/PL-032 B (live cross-repo portfolio SotD).
