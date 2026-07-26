---
title: "SESSION 0454 — Ledger paydown (inline): D-024 deploy runbooks + WL-P2-5 dead treeId"
slug: session-0454
type: session--open
status: closed
created: 2026-06-26
updated: 2026-06-27
last_agent: claude-session-0454
sprint: S45
pairs_with:

  - docs/sprints/SESSION_0453.md
  - docs/petey-plan-0454-autonomous-paydown.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0454 — Ledger paydown (inline): D-024 deploy runbooks + WL-P2-5 dead treeId

## Date

2026-06-27

## Operator

Brian + claude-session-0454

## Goal

Run the SESSION_0454 autonomous-paydown lane **inline** (operator on a phone; nested `claude -p`
can't authenticate from a Claude Code sandbox — proven 401, so the unattended `auto-session.sh`
launch is not viable here). Drive ledger debt down with safe, schema-free slices, one reviewable
commit at a time, operator-gated. This session: **Slice 1 — D-024** (deploy runbooks `pnpm` → `bun`)
and **Slice 2 — WL-P2-5** (remove the dead `treeId` prop from the lineage profile drawer).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0453.md`
- Carryover: 0453 landed PR #168 + Loop-of-Loops P1/P2 + the FI-001 `--verify` fix, and split the
  next work into an **autonomous** safe-paydown lane (`petey-plan-0454`) and an **operator-gated**
  lane (clone-tree cleanup, admin branch CRUD, FI-001 send). The operator asked to launch the
  unattended overnight run; it can't run nested (401), so we run the same safe slices inline instead.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `cd5fb5e8`

### Drift logged

- **D-024 conflict resolved at source.** The 0454 plan asserted "toolchain is bun, runbooks say pnpm";
  `vercel-deploy.md:34` asserted the opposite ("Vercel production still uses pnpm... project setting
  and lockfile contract"). Verified against the live config: `apps/web/vercel.json` + root `vercel.json`
  both use `bun install --frozen-lockfile` + `bun run --filter @ronin-dojo/web …`; only `bun.lock`
  exists (`pnpm-lock.yaml` deleted by `d59fb0ac`, 2026-06-10 bun convergence). The runbook was stale →
  the flip is correct.

## Petey plan

### Goal

Resolve drift D-024 (deploy runbooks → bun, docs-only) and WL-P2-5 (remove the dead `treeId` prop from
the lineage profile drawer — code, behavior-preserving).

### Tasks

#### SESSION_0454_TASK_01 — D-024: deploy runbooks pnpm → bun

- **Agent:** Cody (inline)
- **What:** flip the active deploy commands in the `docs/runbooks/deploy/` runbooks from `pnpm` to the
  real bun toolchain; resolve drift D-024.
- **Steps:** (1) verify ground truth vs `apps/web/vercel.json` + lockfiles; (2) edit `vercel-deploy.md`,
  `vercel-domain-setup-runbook.md`, and `bbl-production-runbook.md` (cross-ref descriptors); (3) flip
  D-024 → resolved in `drift-register.md`; (4) `wiki:lint` 0 errors.
- **Done means:** `grep -ri pnpm docs/runbooks/deploy/` returns only intentional/historical mentions;
  active commands read `bun`; D-024 resolved; `wiki:lint` 0 errors.
- **Depends on:** nothing

#### SESSION_0454_TASK_02 — WL-P2-5: remove dead `treeId` prop from the lineage drawer

- **Agent:** Cody (inline)
- **What:** remove the never-read optional `treeId` prop from `LineageProfileDrawerProps` + its one
  call-site pass-through; flip WL-P2-5 → resolved.
- **Steps:** (1) grep `treeId` across the drawer module + whole app; (2) remove `treeId?: string` from
  `drawer-types.ts`; (3) typecheck surfaces the one pass-through (`lineage-tree-board.tsx:240`) → remove
  it; (4) flip WL-P2-5 in `wiring-ledger.md`.
- **Done means:** `treeId` gone; typecheck/oxlint/oxfmt clean; `next build` exit 0; behavior unchanged.
- **Depends on:** nothing

### Scope guard

- HARD BOUNDARY (petey-plan-0454): schema-free, behavior-preserving, no prod data, no FI-001, no
  `prisma`/migrations, no `brand`, no Neon, no Vercel/DNS/Stripe prod work.
- Slice 1 (D-024) is docs-only. Slice 2 (WL-P2-5) is a behavior-preserving dead-code removal (no schema,
  no behavior change). CLAUDE.md was edited only for the factual `ignoreCommand` lockfile name
  (operator-approved fold-in), not behavior.

## Task log

### SESSION_0454_TASK_01 — D-024: deploy runbooks pnpm → bun · **landed**

Flipped three `docs/runbooks/deploy/` runbooks to the bun toolchain after verifying ground truth
against the live `apps/web/vercel.json` (install `bun install --frozen-lockfile`; build
`bun run --filter @ronin-dojo/web db:generate && … build`; gate `bun.lock`). Plan scoped "two
runbooks"; the drift actually spanned three (added `bbl-production-runbook.md`'s two "pnpm monorepo"
descriptors so D-024 is visibly resolved across `deploy/`). Preserved the SESSION_0159 regression
*lesson* (missing lockfile → npm fallback → `next: command not found`) while correcting the lockfile
name to `bun.lock`. Flipped D-024 → RESOLVED in `drift-register.md`. `wiki:lint`: 0 errors.

**Fold-in (operator request, same commit):** also fixed the related `ignoreCommand` lockfile drift —
`pnpm-lock.yaml` → `bun.lock` in `CLAUDE.md` and `verification-and-testing.md:115` (now matches the live
`vercel.json` `ignoreCommand`) — and `sop-email-runbook.md`'s email-preview command `pnpm --filter` →
`bun run --filter @ronin-dojo/web email` (verified the `email` script exists in `apps/web/package.json`).

### SESSION_0454_TASK_02 — WL-P2-5: remove dead `treeId` prop · **landed**

`treeId?: string` was an optional prop on `LineageProfileDrawerProps` (`drawer-types.ts:52`) the drawer
never read. The ledger's path (`lineage-profile-drawer.tsx:177`, a `DrawerBody` destructure) was stale —
the module was since split into `lineage-profile-drawer/`. Removed the type field; typecheck then
surfaced the single never-read pass-through (`lineage-tree-board.tsx:240`, the drawer render — line 215's
`treeId` is the canvas, kept) → removed it. Confirmed never consumed (whole-app grep + typecheck). The
"Manage verification (coming soon)" feature it was speculatively threaded for (WL-P2-1) is a parked
`disabled` stub; `treeId` is in scope at the call site → trivially re-threadable if it lands (operator
confirmed: "potentially future, start fresh later"). Flipped WL-P2-5 → ✅. Gates: typecheck 0,
oxlint/oxfmt clean (only pre-existing warnings), `next build` exit 0.

### SESSION_0454_TASK_03 — WL-P2-10: dependency hygiene · **no-op (already resolved SESSION_0354)**

Re-audited per `petey-plan-0454` Slice 3. The removable unused deps (`@ai-sdk/google`, `github-slugger`)
were already removed in SESSION_0354 (lockfiles regenerated). The only deps `fallow` still flags are
`react-email` (backs the `email dev` script, `package.json:13`) and `react-dom` (core React renderer) —
both documented false-positives. **Nothing provably-unused remains**, so the slice is a clean no-op (the
plan's resilience rule). No code / `package.json` change. WL-P2-10 re-verified ✅.

## What landed

- **D-024 resolved** (Slice 1, `d71fb8bf`) — deploy runbooks + `ignoreCommand` (CLAUDE.md +
  `verification-and-testing.md`) + email-SOP flipped `pnpm` → `bun` to match the live
  `apps/web/vercel.json` (gate `bun.lock`). Docs-only → no deploy.
- **WL-P2-5 resolved** (Slice 2, `2d878ea7`) — removed the dead `treeId` prop from the lineage profile
  drawer + its one pass-through. Behavior-preserving; all gates green; fallow-fix-loop = 0 introduced.
- **WL-P2-10 re-verified no-op** (Slice 3) — deps already clean; residual flags are false-positives.
- **WL-P2-22 logged** — `LineageTreeBoard` CRAP-1190 complexity hotspot (inherited; operator-gated).
- **Remainder handed to Codex** — `auto-session-codex.sh 2` launched from this session for Slices 4–5
  (`codex exec` authenticates from the sandbox; `claude -p` does not — 401).

## Decisions resolved

- Paydown runs **inline**, not via unattended `auto-session.sh` — nested `claude -p` 401s (Claude oauth
  is in-memory). For the remainder, the **Codex** variant works because `codex exec` reads on-disk
  ChatGPT auth (verified: `codex login status` + a `PONG` exec from the sandbox).
- D-024: the runbook (not the plan) was stale — verified against the live `vercel.json` before flipping.
- WL-P2-5: the `treeId` verification-feature plumbing is "potentially future, start fresh later"
  (operator) → safe to remove now; re-threadable at the call site.

## Files touched

| File | Change |
| --- | --- |
| `docs/runbooks/deploy/vercel-deploy.md` | "Active Vercel Truth" prose + install/build commands pnpm → bun |
| `docs/runbooks/deploy/vercel-domain-setup-runbook.md` | prerequisites, "Current Vercel Truth" table, Production Build Readiness section, root-fallback json, troubleshooting box → bun |
| `docs/runbooks/deploy/bbl-production-runbook.md` | two cross-ref descriptors "pnpm monorepo" → "bun monorepo" |
| `docs/knowledge/wiki/drift-register.md` | D-024 status → RESOLVED SESSION_0454 (incl. fold-in note) |
| `CLAUDE.md` | push-cadence `ignoreCommand` lockfile `pnpm-lock.yaml` → `bun.lock` |
| `docs/runbooks/dev-environment/verification-and-testing.md` | deploy-gating `ignoreCommand` JSON `pnpm-lock.yaml` → `bun.lock` |
| `docs/runbooks/sops/sop-email-runbook.md` | email-preview command `pnpm --filter` → `bun run --filter` |
| `apps/web/components/web/lineage/lineage-profile-drawer/drawer-types.ts` | removed dead `treeId?: string` from `LineageProfileDrawerProps` (WL-P2-5) |
| `apps/web/components/web/lineage/lineage-tree-board.tsx` | removed the never-read `treeId` drawer pass-through (kept the canvas `treeId`) |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P2-5 → ✅ Resolved SESSION_0454 |

## Verification

| Command / smoke | Result |
| --- | --- |
| `grep -ri pnpm docs/runbooks/deploy/` | only 2 intentional/historical mentions remain (both frame pnpm as the superseded era) |
| `bun run wiki:lint` | 0 errors, 15 warnings (all pre-existing; my 4 stale-date warnings cleared) |
| ground truth check | `apps/web/vercel.json` + root `vercel.json` = bun; only `bun.lock` present |
| `bun run typecheck` (Slice 2) | 0 errors — surfaced + fixed the one drawer `treeId` pass-through |
| `apps/web` oxlint + oxfmt check (Slice 2) | oxlint: only pre-existing warnings (none in touched files); oxfmt: all formatted |
| `cd apps/web && npx next build` (Slice 2) | exit 0 (full route table rendered) |
| `npx fallow audit` (deps, Slice 3) | only `react-email` + `react-dom` flagged — both false-positives → no-op |
| `fallow audit --changed-since origin/main --gate new-only` | `✓ No issues in 11 changed files` — 0 introduced dead-code/dup/complexity |
| `codex exec --sandbox read-only "PONG"` | authenticated + returned PONG (gpt-5.5, ChatGPT) — launch-from-here viable |

## Open decisions / blockers

- None for D-024 — the flagged `ignoreCommand` + email-SOP drift was folded into this slice per operator
  request.
- **WL-P2-22** (`LineageTreeBoard` CRAP 1190) logged as a follow-up — operator-gated refactor, NOT an
  autonomous slice.
- **Codex run** (Slices 4–5) is unattended + PR-gated: review + merge the stacked PRs bottom-up; nothing
  merges to `main` without you.

## Next session

### Goal

**Autonomous handoff → Codex.** Slices 1–3 are done inline (Slice 3 = no-op). The **remainder
(Slice 4 + Slice 5)** runs unattended via `scripts/auto-session-codex.sh 2`, launched from this session
(Codex auth is on-disk → `codex exec` runs from the sandbox; verified). Each cold codex session bows in
here, does the next `petey-plan-0454` slice, and opens one stacked PR (PR gate — nothing merges to
`main` unattended; operator reviews + merges bottom-up). After Slice 5 the run hands back to the
operator-gated lane (clone-tree cleanup WL-P2-21, admin branch CRUD, FI-001 send).

### First task

**Slice 4 — WL-P2-18** (`server/admin/tournaments/actions.ts`): extract the oversized `upsertDivision`
/ `scoreMatch` / `seedable` branches into named helpers (behavior-preserving) and remove the 2
confirmed-dead exports (`updateTournamentStatus`, `AddPersonOptions`) after a zero-ref grep. Write
SESSION task IDs + Cody pre-flight first; run the tournament-action + scoring tests (correctness-
critical); confirm `fallow dead_code_introduced: 0` + `next build` exit 0; flip WL-P2-18 → ✅. Then
**Slice 5 — WL-P2-17** (extract the shared admin-query-builder helper across ~24
`server/admin/*/queries.ts`; behavior-preservation paramount — largest slice, may need "WL-P2-17
continued").

## Review log

### SESSION_0454_REVIEW_01 — D-024 + WL-P2-5 + WL-P2-10 no-op

- **Reviewed tasks:** TASK_01 (D-024), TASK_02 (WL-P2-5), TASK_03 (WL-P2-10 no-op).
- **Dirstarter docs check:** not applicable — docs-truth correction + a dead-code removal; no Dirstarter
  L1 layer touched.
- **Verdict:** strong. D-024 earned its keep by *verifying* (the runbook asserted pnpm was live; the
  live `vercel.json` said bun) instead of trusting the plan blindly. WL-P2-5 is a clean, compiler-proven
  removal; fallow-fix-loop confirmed 0 introduced and correctly named the inherited `LineageTreeBoard`
  bloat as a follow-up (WL-P2-22) rather than scope-creeping. The Slice 3 no-op is honest.
- **Score:** 9/10.
- **Follow-up:** Codex run does Slices 4–5; WL-P2-22 + the operator-gated lane remain.

## Hostile close review

- **Giddy:** pass — D-024 verified vs the live `vercel.json` before flipping; WL-P2-5 proven dead by
  compiler + whole-app grep; fallow confirms 0 introduced; codex auth verified before promising launch.
- **Doug:** pass — gates green (typecheck / oxlint / oxfmt / `next build` / `wiki:lint` 0 errors);
  fallow-fix-loop delta clean.
- **Kaizen aggregate:** 9/10 — honest no-op on Slice 3, inherited complexity named not adopted. −1:
  WL-P2-5 is build/type-proven not live-render-proven (accepted — the prop fed no code path, so there
  is no behavioral surface to render).

## ADR / ubiquitous-language check

- ADR update **not required** — docs-truth correction (D-024), a dead-code removal (WL-P2-5), a no-op
  (WL-P2-10). No architectural decision changed.
- Ubiquitous language update **not required** — no new domain terms.

## Reflections

The session pivoted from "launch the overnight run" to "do it inline" once the nested-`claude -p` 401
was proven — and the right fix wasn't to fight the auth but to switch to the agent whose creds the
sandbox can read (Codex). The D-024 slice was the standout: blindly trusting the plan's "flip to bun"
would have been wrong if the runbook were right — so verifying against `apps/web/vercel.json` first was
load-bearing. The fallow-fix-loop on a 2-line removal mostly proved a negative (0 introduced), which is
exactly what a clean removal should show; scaling the review to the change kept it proportionate.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter sweep | `updated: 2026-06-27` + `last_agent: claude-session-0454` on every touched doc |
| Backlinks/index sweep | `wiki:lint` 0 errors (index intact) |
| Wiki lint | 0 errors, 15 warnings (all pre-existing) |
| Kaizen reflection | see Reflections |
| Hostile close review | SESSION_0454_REVIEW_01 + hostile review above (Kaizen 9/10) |
| Review & Recommend | Next session = Slice 4 (Codex handoff) written |
| Memory sweep | new finding saved: `codex exec` authenticates from the Claude Code sandbox; `claude -p` does not |
| Next session unblock check | Codex run launched for Slices 4–5 from a clean pushed `main` |
| Git hygiene | close commit on `main` (see push) |
| Graphify update | refreshed (FS-0025, before commit) |
