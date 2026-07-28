---
title: "SESSION 0716 — SotD-script hygiene (loadEpics CRAP extract + landedPanel guard + BELT_WORD delete)"
slug: session-0716
type: session--implement
status: closed
created: 2026-07-28
updated: 2026-07-28
last_agent: claude-session-0716
sprint: S13
lane: bbl
recipe: "fallow-fix-loop"
goal_ids: [G-023]
tickets: []
next_session: docs/sprints/SESSION_0717.md
pairs_with:
  - docs/sprints/SESSION_0714.md
  - docs/sprints/SESSION_0715.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0716 — SotD-script hygiene

**Date:** 2026-07-28 · **Operator:** Brian + claude-session-0716

## Goal

Execute the **BBL-runnable cleanup lane** parked by SESSION_0714 (its "can run in BBL" block): reduce
the `loadEpics` CRAP-306 hotspot in `scripts/state-of-project.ts`, close Doug's `landedPanel` guard-
symmetry P3, address the render-safe Desi LOW items, and delete the now zero-consumer `BELT_WORD`
(operator-signed-off). Single deploy unit (BBL SotD script + `vocab.ts`), one PR, render byte-diff
verified. Staged 0715 (rdd-monorepo portfolio SotD) is a **different repo** (ADR 0059) and is NOT this
session.

## Status

Frontmatter `status:` is the single source of truth.

## Bow-in

- Previous session: `docs/sprints/SESSION_0714.md` — PL-032 A SotD renderer unification (closed, verdict
  **EXTENDED → YES**, Doug GO 9.2/9.5); routed this cleanup bundle forward. No blocker carried.
- Branch/worktree: `session-0716-sotd-hygiene` @ canonical (`.canonical-session` = SESSION_0716) ·
  status: clean · HEAD: `a2009816` · FS-0024 guard passed (remote `Ronin-Dojo-Design/black-belt-legacy`).
- Parallel-lane assessment (opening.md 1d): none — all items touch the SotD render path / vocab
  substrate (not disjoint) → single sequential lane, no worktree fan-out.
- Live-lane check: 0 open BBL PRs; canonical free/claimed; a sibling MMB session is live in
  `mammoth-metal-buildings` (different repo, irrelevant). The 0641/0681/0711 "live lanes" in the
  bow-in args are stale (we are at 0715/0716; 0714 closed with PRs #347/#348 merged).
- On-demand blocks pulled: Cody pre-flight (below, TASK_01/02/03).

## Petey plan

### Tasks

#### SESSION_0716_TASK_01 — loadEpics CRAP-306 complexity extract

- **Agent:** Petey-inline · **Depends on:** nothing
- **What / steps:** extract the four inline collection blocks in `loadEpics`
  (`scripts/state-of-project.ts:264`) into named, single-purpose helpers (epic docs · product epics ·
  plan stubs · epic-flagged ledger rows) sharing the existing `read`/`glob` closures. Pure refactor —
  **render output must stay byte-identical.**
- **Done means:** `loadEpics` complexity down (fallow CRAP re-measured), `tsc`/`oxlint` clean, and the
  regenerated SotD HTML diffs to **zero** against the pre-refactor render.

#### SESSION_0716_TASK_02 — landedPanel guard symmetry (Doug P3) + render-safe Desi LOW notes

- **Agent:** Petey-inline · **Depends on:** nothing
- **What / steps:** `landedPanel()` guards only `!doc`; make it symmetric with `fanoutPanel()` — show
  the honest empty panel when `doc` loads but has **zero sections** (FS-0044 no-orphan). Plus fold the
  two doc-only Desi LOWs (phase-vs-status pill-color divergence · "Held" mid-ladder monotonicity) as
  inline clarifying comments. Epic-doc pill redundancy handled only if render-review confirms no
  regression.
- **Done means:** empty `sotd-landed.yml` degrades to the honest empty panel; comments land; render
  diff shows only the intended landed-empty-state delta.

#### SESSION_0716_TASK_03 — delete BELT_WORD (zero-consumer, operator-signed-off)

- **Agent:** Petey-inline · **Depends on:** nothing
- **What / steps:** remove `BELT_WORD` + its retained-for-reference comment from
  `apps/web/lib/state-of-dojo/vocab.ts:28`; leave the `belts` flag threaded through `phaseWord`
  (future re-divergence stays one line). Confirm zero remaining consumers.
- **Done means:** `grep -rn BELT_WORD` returns only the deletion; `tsc`/`oxlint`/`next build` clean.

### Parallelism

Sequential — TASK_01/02 both edit `scripts/state-of-project.ts`; TASK_03 is a separate file but same
subsystem. One reviewable diff, one PR.

### Open decisions / risks

- **Resolved (operator, bow-in):** delete `BELT_WORD` = YES · deploy-scope gate = **keep all-brand**
  (RDD/BBL/MMB tabs stay on the BBL deploy; the 0714 scope-gate follow-up is **closed, no work**).
- **Deferred (own lanes):** WEKAF app-residue trim — 191 refs incl. the keep-forever `Brand` enum +
  frozen migrations; needs a bounded scope, not a blanket delete → route to WL/D, not this session.

### Scope guard

No render redesign, no `Brand`-enum / migration edits, no rdd-monorepo reach, no deploy-scope gate.
Render deltas limited to the landed-empty-state guard. Adjacent debt → Open decisions / blockers.

## Cody pre-flight

### Pre-flight: TASK_01–03 (SotD-script hygiene)

- **§0 arch-gate:** reuse-first — no new files, no new modules; refactor within existing
  `state-of-project.ts` helpers + delete dead export in `vocab.ts`. No L1 area touched (build-tooling
  script + presentation vocab). No new ADR.
- **Dirstarter L1:** n/a — not storage/payments/media/content/monetization/blog/auth/theming/Prisma/
  hosting; this is the SotD projection script + its vocab substrate.
- **Blast radius:** `scripts/state-of-project.ts` (SotD HTML generator, run in the bow-out gate runner +
  `/app/state` self-fetch) and `apps/web/lib/state-of-dojo/vocab.ts`. Verified by render byte-diff.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0716_TASK_01 | landed | `loadEpics` (CRAP **306**) split into `readRel`/`globSorted` + 4 named source helpers + a shared `frontmatterEpicRow` builder (DRY'd product/plan-stub dup); `loadEpics` now a trivial concat. My code's top complexity = `frontmatterEpicRow` CRAP 42 (cognitive 3). Render byte-identical. |
| SESSION_0716_TASK_02 | landed | `landedPanel()` guard made symmetric with `fanoutPanel` (`!doc?.sections?.length` → honest empty state, FS-0044); empty message widened to "missing, unreadable, or empty". Desi phase-vs-status divergence documented as an inline comment at `statusPill`. |
| SESSION_0716_TASK_03 | landed | `BELT_WORD` deleted from `vocab.ts` + removed from `_kernel/phase.ts` re-export + `phaseWord` doc comment updated + `custom-component-inventory.md` kernel-surface row trued up. Zero source consumers remain. |

**Decisions resolved:** delete BELT_WORD = YES · deploy-scope gate = keep all-brand (follow-up closed).
**Desi LOW routing:** phase-vs-status divergence → documented (statusPill comment) · "Held" mid-ladder
monotonicity → no-action (already documented at `PHASE_STOP_CLASS`: `held` = brown/ready-to-ship) ·
epic-doc pill redundancy → deferred (only render-visible LOW; skipped to keep the approved board stable).

## Verification

| Command / smoke | Result |
| --- | --- |
| render byte-diff (pre vs post, timestamp-normalized) | ✅ byte-identical |
| `bun test lib/state-of-dojo` (--parallel=1) | ✅ 105 pass / 0 fail |
| `tsc --noEmit` (apps/web) | ✅ 0 errors |
| oxlint (changed files) | ✅ 0 findings |
| fallow audit — `loadEpics` CRAP | 306 → off the hotspot list (max mine = `frontmatterEpicRow` 42) |
| wiki:lint | ✅ 0 errors (115 pre-existing `_archive/` warnings, none mine) |

## Artifacts

None (operator declined a frozen SotD snapshot; `/app/state` stays the live zero-token view).

## Open decisions / blockers

None blocking. Deferred: WEKAF residue → WL/D (bounded scope); deploy-scope gate closed (keep all-brand);
`scripts/` CI typecheck gap → FS-0046 (proposed fix, not folded in — own follow-up).

## Next session

- **Goal:** Land the FS-0046 fix (wire a `scripts/` typecheck into CI / the pre-push gate) OR pick the
  next board-top BBL lane (FI-001 first-tester onboarding).
- **First task:** Read FS-0046 + `package.json` workspaces + `scripts/tsconfig.json`; decide CI-step vs
  pre-push-hook placement, then implement + prove it catches a seeded type error.

## Goal verdict

**EXTENDED → YES.** The three parked cleanup items landed + merged (PR #349 → `main` `cb902449`):
`loadEpics` CRAP **306 → 42** (extract + DRY `frontmatterEpicRow`), landedPanel/fanoutPanel empty-state
guard symmetry, `BELT_WORD` deleted. Scope extended beyond the original three: the DRY builder, the
kernel-surface + drift-register doc truth-ups, and **FS-0046** (a real CI gate gap Doug surfaced — the
root `scripts/` tree is untypechecked by CI). `/ggr` 9.6 cleared; deferred WEKAF residue + deploy-scope
gate (closed, keep all-brand) as agreed.

## Close evidence

**/ggr composite:** 9.6/10 — CLEARS (≥9.0, ADR 0052 D6) · **Caps applied:** none (no behavior
regression — render proven byte-identical; dead-export delete proven type-safe).
**Systemic health:** CI = pending-PR (green claim will paste the run URL at merge) · findings routed
3/3 (P3-a → FS-0046 · P3-b → drift-register truth-up · P3-c → fanoutPanel message symmetry) ·
FS patterns: FS-0046 minted (same "real-check-outside-executed-path" family as FS-0037/0044/0045; a
new distinct surface — no existing row reopened).
**Reviewer verdicts:** Giddy **pass** — structural GO, frozen mount-contract (`contract.ts`) untouched,
extract shape correct, no ADR needed · Doug **pass** — GO 9.6, byte-identical proven (normalized md5 +
fixture-driven fallback coverage + `||`-associativity proof), BELT_WORD delete type-safe repo-wide,
landedPanel guard a strict improvement · Desi **n/a** — byte-identical render, internal operator surface.
**Findings ≥ medium:** none. All three findings P3, routed (above).
**ADR / ubiquitous-language check:** no ADR — executes parked PL-020/PL-032 cleanup under G-023; D-055
already RESOLVED (SESSION_0714), no new decision/drift/pattern introduced.

| Step | Proof |
| --- | --- |
| Code-quality gate (Class-A) | 9.6/10 (Doug rubric) · worst hotspot mine = `frontmatterEpicRow` CRAP 42 (cognitive 3), down from `loadEpics` 306 |
| Runtime verification (Doug) | render byte-identical (normalized md5 match, old-code vs new-code, same tree); 105 tests pass; no Artifact (operator declined snapshot) |
| Gates | tsc 0 (apps/web + `tsc -p scripts/tsconfig.json` hand-run) · oxlint 0 · oxfmt clean · wiki-lint 0 err |
| Findings routed | 3/3 — FS-0046 · drift-register · fanoutPanel |

## Reflections

- oxfmt has no root config; running it on `scripts/` reformatted the whole file with semicolons (wrong
  style, 239-line churn) — caught by diff review, reverted. → route: no-action (scripts/ isn't in the
  oxfmt gate; the churn was self-inflicted, not a repo bug).
- "zero-consumer" needs a whole-repo check, not a local one: `BELT_WORD` had no runtime consumer but WAS
  re-exported by the frozen kernel — deleting it required trimming `phase.ts` too. → route: no-action
  (handled; Doug confirmed type-safe).
- CI typechecks only workspaces; the root `scripts/` tree (bow-out gate runner + `/app/state` build
  depend on it) is ungated — a type error would merge green. → route: FS-0046.
