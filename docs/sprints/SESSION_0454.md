---
title: "SESSION 0454 — Ledger paydown (inline): Slice 1 D-024 deploy runbooks pnpm → bun"
slug: session-0454
type: session--open
status: in-progress
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

# SESSION 0454 — Ledger paydown (inline): Slice 1 D-024 deploy runbooks pnpm → bun

## Date

2026-06-27

## Operator

Brian + claude-session-0454

## Goal

Run the SESSION_0454 autonomous-paydown lane **inline** (operator on a phone; nested `claude -p`
can't authenticate from a Claude Code sandbox — proven 401, so the unattended `auto-session.sh`
launch is not viable here). Drive ledger debt down with safe, schema-free slices, one reviewable
commit at a time, operator-gated. This session: **Slice 1 — D-024** (deploy runbooks `pnpm` → `bun`).

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

Resolve drift D-024 by flipping the deploy runbooks to the verified bun toolchain (docs-only,
behavior-preserving, free push / no deploy).

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

### Scope guard

- HARD BOUNDARY (petey-plan-0454): schema-free, behavior-preserving, no prod data, no FI-001, no
  `prisma`/migrations, no `brand`, no Neon, no Vercel/DNS/Stripe prod work. This slice is docs-only.
- Did **not** touch `package.json` scripts or any code. Did **not** edit CLAUDE.md (standing context —
  flagged its stale `ignoreCommand` line as a follow-up instead).

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

## Verification

| Command / smoke | Result |
| --- | --- |
| `grep -ri pnpm docs/runbooks/deploy/` | only 2 intentional/historical mentions remain (both frame pnpm as the superseded era) |
| `bun run wiki:lint` | 0 errors, 15 warnings (all pre-existing; my 4 stale-date warnings cleared) |
| ground truth check | `apps/web/vercel.json` + root `vercel.json` = bun; only `bun.lock` present |

## Open decisions / blockers

- None for D-024 — the flagged `ignoreCommand` + email-SOP drift was folded into this slice per operator
  request.

## Next session

### Goal

Continue the safe paydown: Slice 2 — WL-P2-5 (remove the dead `treeId` param from the lineage profile
drawer `DrawerBody`).

### First task

Per `petey-plan-0454` Slice 2: grep `treeId` in `components/web/lineage/lineage-profile-drawer/*`,
confirm no consumer reads it, remove the dead param + its type + any pass-through at the call site;
gate with typecheck + oxlint/oxfmt check + the drawer's touched test + `next build`. Flip WL-P2-5 → ✅
in `wiring-ledger.md`.

## Hostile close review

Not applicable yet — session in progress (Slice 1 committed; awaiting operator review before close).
