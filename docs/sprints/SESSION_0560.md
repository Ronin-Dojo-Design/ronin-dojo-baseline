---
title: "SESSION 0560 — apps/baseline typecheck red (SESSION_0555 FINDING_02) root-cause + fix"
slug: session-0560
type: session--implement
status: in-progress
created: 2026-07-17
updated: 2026-07-17
last_agent: claude-session-0560
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0555.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0560 — apps/baseline typecheck red (SESSION_0555 FINDING_02) root-cause + fix

## Date

2026-07-17

## Operator

Brian + claude-session-0560 (autonomous fix lane, worktree `/Users/brianscott/dev/ronin-0560`)

## Goal

Root-cause and fix SESSION_0555 FINDING_02: `apps/baseline` typecheck is RED on main —
`prisma/seed.ts` references `user`/`account` models reportedly absent from its generated
PrismaClient, and regenerating does not clear it. Determine the drift direction (schema lost models
vs seed copied from apps/web vs generated-client output-path wiring bug), apply the minimal fix
consistent with ADR 0038, and address SESSION_0555 FINDING_03 (root `bun run typecheck` wrapper does
not propagate sub-package failures) if it is a one-liner. Done = root typecheck shows apps/baseline
exiting 0, zero behavior change to apps/web. Commit held locally — NO push.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0555.md`
- Carryover: 0555 was the Claudex fan-out orchestration close; its hostile close surfaced
  FINDING_02 (baseline typecheck red, pre-existing on main) and FINDING_03 (root typecheck wrapper
  exit-code swallow). This lane is the dedicated fix for both. The 0555 merge-wave "Next session"
  goal is the operator's wave session, NOT this lane — scope guard below.

### Branch and worktree

- Branch: `session-0560-baseline-typecheck` (pre-created off origin/main `09b042c9`)
- Worktree: `/Users/brianscott/dev/ronin-0560` (canonical checkout is read-only to this lane)
- Status at bow-in: clean
- Current HEAD at bow-in: `09b042c9`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (apps/baseline client generation wiring only) |
| Extension or replacement | Extension: fix wiring on the existing ADR 0038 per-product Prisma setup |
| Why justified | Typecheck gate is red on main; no new capability added |
| Risk if bypassed | Repo-wide root typecheck stays red; wrapper masks it (FINDING_03) |

Live docs checked during planning: not applicable (wiring fix; ADR 0038 + per-app-db runbook are the intent source).

## Petey plan

### Goal

Make `apps/baseline` typecheck exit 0 from the root gate, with the fix matching ADR 0038 intent.

### Tasks

#### SESSION_0560_TASK_01 — Root-cause the baseline typecheck red

- **Agent:** claude-session-0560 (inline Cody)
- **What:** Reproduce the failure in the bootstrapped worktree; diff schema vs seed vs generated-client output path; classify drift direction.
- **Steps:** bun install at root → prisma generate (throwaway DATABASE_URL, no real DB) → `tsc --noEmit` in apps/baseline → read the actual errors.
- **Done means:** A written root cause naming which of the three hypotheses holds.
- **Depends on:** nothing

#### SESSION_0560_TASK_02 — Apply the minimal fix

- **Agent:** claude-session-0560 (inline Cody)
- **What:** Fix per the root cause (schema restore | seed conform | output-path/config wiring), scope apps/baseline/* only.
- **Done means:** `apps/baseline` `tsc --noEmit` exits 0 in the worktree.
- **Depends on:** SESSION_0560_TASK_01

#### SESSION_0560_TASK_03 — FINDING_03 wrapper exit-code (one-liner only)

- **Agent:** claude-session-0560 (inline Cody)
- **What:** If the root `typecheck` script fix is a one-liner, include it; else write it up here.
- **Done means:** Either the script line fixed + verified, or a structural write-up in this file.
- **Depends on:** SESSION_0560_TASK_01

### Open decisions

None — brief is explicit; push authorization held per standing rule.

### Scope guard

- `apps/baseline/*` + optionally the root typecheck script line ONLY.
- Zero behavior change to `apps/web`.
- No DB creation, no migrations, no seed EXECUTION — typecheck green is the goal.
- NO push / PR / merge — commit locally and hold at the push gate.
- FI-001 parked. Merge-wave execution belongs to the operator's wave session.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0560_TASK_01 | landed | Root cause: the gitignored generated client is the drifting artifact (schema + seed are consistent at HEAD) |
| SESSION_0560_TASK_02 | landed | `apps/baseline` `typecheck` script now self-provisions its client (generate-then-check) |
| SESSION_0560_TASK_03 | pending | Wrapper exit-code measurement in flight |

### SESSION_0560_TASK_01 — root cause (drift direction: generated artifact, not source)

Hypothesis elimination, all reproduced in this worktree at `09b042c9`:

1. **Schema did NOT lose models** — `apps/baseline/prisma/schema.prisma` at HEAD has
   `User`/`Account`/`Session`/`Verification` (+`Lead`/`SchoolSettings`); they landed WITH the seed in
   `7fc33138` (G-002 Phase 2, PR #207). Schema and seed have only ever moved together
   (`65154a5a` → `7fc33138`).
2. **Seed is NOT wrong** — with a client freshly generated from the HEAD schema,
   `bunx tsc --noEmit` in `apps/baseline` exits **0** (verified before any fix).
3. **The generated client is the drifting artifact** — `.generated/` is gitignored
   (`apps/baseline/.gitignore:31`) and NOTHING in the local lifecycle regenerates it:
   `apps/web` has `"postinstall": "bun run db:generate"`; `apps/baseline` had no generation hook at
   all. A client generated from the `65154a5a` draft schema (models: `Lead` + `SchoolSettings` ONLY —
   pre-auth) reproduces SESSION_0555 FINDING_02 **exactly**:
   `prisma/seed.ts(31,25)/(43,33)/(50,14)/(133,48) error TS2339: Property 'user'/'account' does not
   exist on type 'PrismaClient<…>'` — baseline exits 1, same as 0555 observed.
4. **Why "regenerating did not clear it" in 0555:** a true in-place regenerate DOES clear it (point 2).
   `prisma generate` also hard-fails when `DATABASE_URL` is unset in the shell and no
   `apps/baseline/.env` exists (Prisma 7 `prisma.config.ts` eagerly resolves `env("DATABASE_URL")`
   at config load: `PrismaConfigEnvError`) — the canonical checkout has only `.env.example`, so a
   canonical regenerate attempt without an exported URL errors out, leaving the stale client in
   place. CI never sees this because `clients-ci.yml` exports a dummy URL and runs
   `bunx prisma generate` explicitly before typecheck — baseline CI is green; the red was local-only.

## What landed

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.

## Hostile close review

Lean close (autonomous single-lane fix; verification = per-package typecheck proof below).

## ADR / ubiquitous-language check

- ADR update: TBD at bow-out (expected: not required — wiring fix within ADR 0038 intent).

## Reflections

TBD at bow-out.
