---
title: "SESSION 0439 — gated PROD cutover for unified Passport claim"
slug: session-0439
type: session--open
status: in-progress
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0439
sprint: S43
pairs_with:

  - docs/sprints/SESSION_0438.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0439 — gated PROD cutover for unified Passport claim

## Date

2026-06-23

## Operator

Brian + claude-session-0439

## Goal

Execute the gated PROD cutover for the unified claim (ADR 0036), in strict order, each on explicit
operator go: (1) rotate prod Neon password; (2) push P5 paired with the prod backfill so the queue
code + the migrated data land together (no orphaned PENDING claims); (3) send Brian Truelson's real
claim invite. Then, separately and later, drop the legacy `LineageClaimRequest` table once
stragglers clear.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0438.md`
- Carryover: SESSION_0438 landed E0 **P5** (legacy `LineageClaimRequest` writer + admin/manager
  queues retired onto `PassportClaimRequest` / `reviewPassportClaim`), fixed a latent Phase-3c 500
  (D-031), pruned dead types, extracted `dispatchJoinLegacyNotifications`. Committed (`82052d15`)
  but **push HELD**. This session executes the gated prod cutover.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `82052d15` — `main` is **ahead 3** of `origin/main`
  (`82052d15` P5, `9a5843b1` finalize helpers, `1d3a836e` P0–P4)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma, hosting (Vercel env), auth |
| Extension or replacement | Operational — data migration + env rotation over the existing baseline; no capability replaced |
| Why justified | Prod data migration for the bespoke BBL claim domain; Neon rotation is security hygiene |
| Risk if bypassed | Orphaned PENDING claims if code deploys without the backfill; exposed prod creds if rotation skipped |

## Petey plan

### Goal

Run the gated prod cutover in strict order, holding for explicit operator go between each step.

### Tasks

#### SESSION_0439_TASK_01 — Step 1: rotate prod Neon password

- **Agent:** operator (Neon console) + Cody (Vercel env update)
- **What:** Reset the prod Neon role password; update Vercel prod `DATABASE_URL` +
  `DIRECT_DATABASE_URL` (Production, Sensitive). ⚠ D-024: Sensitive vars pull empty — set, don't read.
- **Done means:** new creds set in Vercel prod; a read-only prod query succeeds with the rotated string.

#### SESSION_0439_TASK_02 — Step 2: prod backfill + push P5

- **Agent:** Cody
- **What:** Point `DATABASE_URL` at prod Neon, run `apps/web/scripts/backfill-passport-claims.ts`
  (idempotent, BBL-scoped). Push `main` → `origin` around the same step so the queue code + data land
  together.
- **Done means:** Tony Hua present + APPROVED; counts match `LineageClaimRequest` +
  `ProfileClaimRequest` PERSON rows; re-run = no dupes; P5 deployed.

#### SESSION_0439_TASK_03 — Step 3: send Brian Truelson's real claim invite

- **Agent:** Cody
- **What:** 2nd-touch real claim invite (holding note sent SESSION_0436). Use the appropriate
  `apps/web/scripts/send-bbl-*` script; dry-run first if a flag exists. ⚠ LIVE Resend send.
- **Done means:** magic-link claim email delivered to Brian; Resend id recorded.

### Open decisions

- Step 4 (drop legacy `LineageClaimRequest`) deferred to a later migration once stragglers clear.

### Scope guard

- Strict order. **Hold for explicit operator go between every step.** No prod mutation or LIVE send
  without it.
- Do NOT drop the legacy table this session.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0439_TASK_01 | pending | Rotate prod Neon password + update Vercel prod env |
| SESSION_0439_TASK_02 | pending | Prod backfill + push P5 (coupled) |
| SESSION_0439_TASK_03 | pending | Send Brian Truelson's real claim invite |

## What landed

<!-- filled at bow-out -->

## Open decisions / blockers

- Every step is operator-gated. Blocked on explicit go.

## Next session

<!-- filled at bow-out -->

## Files touched

<!-- filled at bow-out -->

## Verification

<!-- filled at bow-out -->
