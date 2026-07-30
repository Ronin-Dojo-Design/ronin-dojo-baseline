---
title: "SESSION 0719 — FS-0046 scripts/ typecheck gate + strip cold-compile e2e paper-overs"
slug: session-0719
type: session--implement
status: closed
created: 2026-07-29
updated: 2026-07-29
last_agent: claude-session-0719
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: []
tickets: []
next_session: docs/sprints/SESSION_0720.md
pairs_with:
  - docs/sprints/SESSION_0718.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0719 — scripts/ typecheck gate + cold-compile paper-over strip

> **Staged by SESSION_0718** (operator elected both lanes at bow-out). Adopt: flip `status:` →
> `in-progress`. Two lanes; both unblocked now that the required-check gate + prod-build e2e are on `main`.

## Bow-in

- **State (git/gh):** `main`, clean, canonical claim free, push guards PASS (`doctor.sh`). **0 open PRs**;
  all four `session-0718-*` branches deleted (landed clean). Prev goal (0718) verdict **EXTENDED → YES**
  (required-check gate LIVE). No live-sibling overlap (ADR 0059 — BBL repo only this session).
- **Adopted** the staged 0719 stub (ADR 0049 flip, no `cp`). Recipe `seq-lane-build`.
- **Operator scope (bow-in `AskUserQuestion`):** **both lanes, sequential L1→L2** — *plus* a parallel
  research-recommend track for **autonomous overnight orchestration** (Claude + codex auto-run parallel
  recipe-card sessions to clear un-started ledgers/epics). SotD publish: **no** (live `/app/state`).
- **1d parallel assessment:** L1 (`ci.yml` + `scripts/`) and L2 (e2e specs + fixtures) are disjoint but
  small, and L2 is evidence-gated on green prod-build runs → **sequential single lane**, not fan-out.
  The autonomous-orchestration track *is* disjoint from the build → dispatched in parallel (plan-only).
- **FS-0048 read-before-build sweep (L1, FS-0046):**
  - `.github/workflows/ci.yml` `typecheck` job runs `bun run typecheck` in `apps/web` only (workspace-scoped);
    `scripts/tsconfig.json` (strict, noEmit, `include: ["*.ts"]`) exists but **no gate runs `tsc -p` on it**.
  - **Wrinkle:** `scripts/**` is in the `changes`-job ignore-set → a *scripts-only* PR sets `run=false`
    and skips every heavy job. So "extend the existing `typecheck` job" (gated on `changes.run`) would
    still let a scripts-only type error merge green. Robust fix = a **dedicated always-run job** (`bun
    install` + `tsc -p scripts/tsconfig.json --noEmit`, no Prisma/DB) wired into the `CI complete`
    aggregation `needs:` so the **required** check covers it. Cody to confirm the `CI complete` needs-list.
  - `scripts/` has no `package.json` (not a workspace) — expected.
- **FS-0048 read-before-build sweep (L2):** fixture FK-order fix (`cleanupTaggedLineageFixtures` deletes
  `Rank` before `RankAward`, RESTRICT FK) is an unconditional bug fix. Paper-over strips are
  **prove-before-delete** — evidence = green prod-build Playwright runs on `main` since SESSION_0717;
  Cody gathers from `gh run list` and strips only what evidence justifies, holds+flags the rest.

## Goal

Close the two remaining CI/e2e-quality follow-ups the SESSION_0717/0718 work surfaced.

## Lanes

### Lane 1 — FS-0046: root `scripts/` tree isn't typechecked in CI

The `typecheck` gate is workspace-scoped (`apps/*` + `packages/*`); root `scripts/` is not a workspace
and no gate runs `tsc -p scripts/tsconfig.json --noEmit` — so a type error in any root script (incl.
`state-of-project.ts`, which the bow-out gate runner + `/app/state` depend on) merges green. Add a
`scripts/` typecheck step to `ci.yml` (extend the existing `typecheck` job, or a small dedicated job)
so it's covered by the now-**required** `CI complete` gate. See [FS-0046](../protocols/failed-steps-log.md#fs-0046).

### Lane 2 — strip the cold-compile e2e paper-overs (prove-before-deleting)

Prod-build e2e (SESSION_0717 P1) + the required gate (0718) are on `main`, so the JIT cold-compile
flake the paper-overs masked should be gone. Strip the 8 paper-overs — the TFF-008 warm pre-hit, the
20s→40s redirect bump, and the `test.slow()`/oversized timeouts in `authenticated-lifecycle` /
`users-account-actions` / `admin-collection-conformance` / `bracket` / `scoring` / `public-rank-redaction`
— using **N green prod-build runs on `main` as evidence** before removing each (re-measure
`registration.spec.ts`'s 45s first — partly cold-mutation, not pure JIT). **Also fix** the
lineage-lifecycle fixture stale-cleanup order (SESSION_0718 finding 4): `cleanupTaggedLineageFixtures`
deletes `Rank` before its `RankAward` (RESTRICT FK) → errors on leftover data from an interrupted run.

## Still open (carry, do not auto-pick)

- **RDD upstream fail-closed fix** — the rdd-monorepo umbrella gate has the same fail-open edge BBL
  hardened in 0718; baton delivered. Cross-repo (ADR 0059 — its own session), not a BBL lane.

## Goal verdict

**EXTENDED → YES.** Both staged CI/e2e follow-ups closed, and a second track (operator-added at
bow-in) was planned + staged.

- **L1 — FS-0046: DONE.** Dedicated always-run `scripts-typecheck` job added to `ci.yml`, wired into
  the required `CI complete` aggregation (`needs` + `SCRIPTS_TYPECHECK_RESULT` env + a strict
  `!= success → exit 1` clause, kept out of the `skipped`-tolerant docs loop). Doug-verified
  **fail-closed on all four failure modes** (green on healthy PR · red on scripts type-error ·
  no forever-pending/deadlock · docs-only PR stays green) and `bunx tsc -p scripts/tsconfig.json
  --noEmit` resolves in CI with no added dependency. Closes the scripts-only-type-error hole.
- **L2 — DONE (to evidence).** (a) Fixture FK-cleanup bug fixed — the stub's premise was wrong
  (`RankAward`→`Rank` was already ordered); the real bug was **`RankEntry.rankId → Rank` (RESTRICT)
  never explicitly deleted**, throwing P2003 on orphaned rows from an interrupted run. Fixed with an
  explicit `rankEntry.deleteMany` before `rank.deleteMany`. (b) Paper-overs: **4 stripped** (pure-JIT:
  `authenticated-lifecycle` TFF-008 + redirect bump→20s, `bracket` `test.slow()`×2, `scoring`→20s) on
  evidence of 4 consecutive green prod-build runs on `main`; **4 held** with reasons (`registration`
  = mutation/nav-bound not JIT, confirmed by re-measurement; `users-account-actions` = insufficient
  evidence; `public-rank-redaction` + `admin-collection-conformance` = mixed / local isolation
  ceiling). Prove-before-delete honored — the 4 holds are principled deferrals, not misses.
- **Bonus track — autonomous overnight orchestration.** Operator elected it at bow-in; planned
  reuse-first (the proven `overnight-orchestrator-waves` recipe), 4 safety forks pinned (PUSH · default
  AFK-safe split · HOLD-on-fail · gates+PR), 3 recipe docs reconciled to one push posture, and a
  2-lane pilot staged as [`SESSION_0720`](SESSION_0720.md) — the next `/bow-in` is the dispatch.

**Gates:** `tsc`(scripts) 0 · typecheck 0 · lint 0 · unit **1925 pass / 0 fail** · 3 edited specs parse
· wiki:lint 0 errors. **Verify:** Doug GO-WITH-NITS **9.3/10**, no blockers.

## Proposed ledger edits (apply next canonical close — shared ledgers frozen this session)

- **FS-0046 → RESOLVED (SESSION_0719).** Dedicated `scripts-typecheck` CI job now covers the root
  `scripts/` tree; Doug-verified fail-closed. Mark mitigated/closed with the PR ref.
- **Carry (next session / TFF):** strip the **4 held e2e paper-overs** — priority `users-account-actions`
  — once there are more green prod-build runs on `main` OR a targeted prod-build render re-measurement
  of `/app/users` + `/app/organizations`. `registration`'s 45s is NOT a JIT paper-over (mutation/nav
  bound) — leave it.
- **TD/low (Doug nit):** `apps/web/lib/test/fixture-ownership.ts` — a third, **implicit-Restrict**
  child of `Rank` exists (`BeltTestRegistration.targetRankId`, `schema.prisma:1792`) not cleared by
  `cleanupOwnedTestRows`. Not exercised by current fixtures (comment already tightened this session);
  add a `beltTestRegistration.deleteMany` only if a fixture ever seeds belt-test data via this helper.
- **Ops check (Doug nit):** on PR #<0719> first CI run, eyeball the `CI complete` step log for
  `scripts-typecheck=success` (not empty) — closes the hyphenated-`needs` expression verification.
  Worst case is fail-closed (blocks merge loudly), never a silent bypass.
- **Drift (already captured):** the dead `ronin-dojo-app` repo name in the two invoked skills
  (`code-quality`, `fallow-fix-loop`) is SESSION_0720 pilot Lane B — proposes a new `D`-row there.

## Next session

### Goal

Run the **[SESSION_0720](SESSION_0720.md) overnight-orchestrator PILOT** (2 disjoint lanes, 1 wave) —
the next `/bow-in` adopts the staged stub and dispatches. Alternatively/after: strip the 4 held e2e
paper-overs once prod-build evidence allows (see Proposed ledger edits).

### First task

`/bow-in` → adopt `SESSION_0720` (flip `staged` → `in-progress`) → run its Dispatch instruction
(mint 2 lane numbers, cut worktrees, dispatch both Cody lanes) — do NOT re-open a pinned fork.
