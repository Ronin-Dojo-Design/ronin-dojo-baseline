---
title: "SESSION 0514 — bow-out deferral guard"
slug: session-0514
type: session--implement
status: in-progress
created: 2026-07-08
updated: 2026-07-08
last_agent: claude-session-0514
sprint: S52
pairs_with:

  - docs/sprints/SESSION_0513.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0514 — bow-out deferral guard

## Date

2026-07-08

## Operator

Brian + claude-session-0514

## Goal

Close the process gap that let TICKET-0502-A vanish for ~11 sessions (surfaced SESSION_0513):
a deferred work item written only in a SESSION file / memory note / recipe is **invisible
work** — the bow-in read-path (`ledger-backlog.ts` → `/app/loop-board` sync) never surfaces
it. Operator asked whether a create-card script would help; the answer is NO (the board
already auto-syncs from the ledgers on every load, so a manual card is a second, un-synced
source of truth — the same trap flipped). The real fix is upstream: a **bow-out deferral
guard** that flags any deferral in the SESSION file not backed by a real ledger row, so
punted work is forced into a ledger (which then auto-syncs to the board).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Branch and worktree

- Branch: `session-0514-deferral-guard`
- Worktree: `/Users/brianscott/dev/ronin-0514-deferral-guard`
- Current HEAD at bow-in: `fc1d42ac` (origin/main incl. #196)

## Petey plan

### Tasks

#### SESSION_0514_TASK_01 — Build the deferral guard + wire the closing ritual

- **Agent:** Petey (inline, single-file tool)
- **What:** `scripts/deferral-guard.ts` (reuses `LEDGER_FILES` from `ledger-parse.ts` — checks against the exact ledger set the read-path consumes) + closing.md §6.8 step.
- **Done means:** the guard flags un-ledgered deferrals (exit 1) and passes clean ones (exit 0); the closing ritual gates on it.

## Task log

| Task | Status | Notes |
| --- | --- | --- |
| SESSION_0514_TASK_01 | landed | `scripts/deferral-guard.ts` + closing.md §6.8. Validated: catches all 7 TICKET-0502-A misses in SESSION_0502 (exit 1); passes a clean file (exit 0); ±1-line window resolves prose-wrapped ledger ids without masking real misses (paragraph-scope rejected — it under-reported). Root-level (must resolve `docs/` + ledger paths); hand-kept no-semicolon style like `ledger-backlog.ts` (outside the apps/web oxfmt gate). Corrective action for FS-0029. |

## Design decisions

- **No create-card script** — the `/app/loop-board` page auto-imports every ledger item via `server/loop-board/sync.ts` (idempotent, `sourceRef`-keyed). A ledger row IS a card; a manual card would be an un-synced second source of truth. Fix the upstream (ledger the deferral), not the symptom.
- **±1-line window, not paragraph-scope** — a guard must never under-report; paragraph-scope let an unrelated in-paragraph ledger id falsely "back" a real miss (dropped SESSION_0502 from 7 flags to 2). The window errs toward over-flagging (safe; dismissable).
- **Markers exclude "out of scope"** — usually a scope-guard boundary, not trackable future work; kept high-signal markers only.

## Next session

### Goal

**Get `blackbeltlegacy.com` launch-SOLID for the FI-001 first tester (Brian Truelson).** The Brian
onboarding email is the GATE — it does NOT send until the site + the admin tooling behind it are solid.
Operator directive (SESSION_0513): "ALL the work done before we send that email." **LEAD with the
CONFORMANCE lane** (the AdminCollection north star + it hardens the admin surfaces used to onboard Brian),
then plan/sequence the rest of the gate. Petey plans + grills the open forks; Cody builds; Doug verifies;
3-pass gauntlet on the diff; hold push + email-send for the operator's word.

### First task — CONFORMANCE lane

- **WL-P2-34** — AdminCollection conformance: migrate a coherent batch of the ~29 hand-rolled `/app/*`
  data-tables onto the `/app/tools` law (columns + query; row→detail→one editor); ADR 0045 incremental.
- **WL-P2-35** — People Passport-keyed editor (collision now CLEARED — #194 merged): re-key
  `/app/users/[id]` userId→passportId + reuse+generalize `PassportEditor` via `updatePassportAsAdmin` +
  admin-only AccountSection; keep `/app/users`; placeholder-delete out of scope.
- **WL-P2-37** — TICKET-0502-A profile `/me`+`/directory` tree consolidation (the half-baked-profiles
  cleanup; profile = the funnel asset Bob/Brian land on).

### Then plan the rest of the gate (operator sign-off, build later)

- **A. Brian's data** — WL-P2-21 (his node in 3 trees); claim/comp/profile render complete.
- **B. Onboarding** — FI-001/G-001: lifetime comp + thank-you email + claim loop, proven on a rehearsal account.
- **C. Email path** — FI-002 (lifecycle copy, DRYRUN=0), FI-003 (student sign-up + claim-approval), FI-004 (admin composer).
- **D. Security-before-external** — RISK #13 (rotate exposed prod Neon cred), #6/#7/#8, WL-P2-33 (authz sign-off).
- **E. Public-surface QA (Desi)** — home, join/claim funnel, directory, lineage, profile, checkout — no broken/half-baked states.
- **Email-pattern follow-ups (from #197):** convert the guest paid-checkout "confirm your account" email + the admin invite composer off the single-use magic-link (the durable-link pattern, PR #197) before launch.

### Immediate outbound (operator-gated)

Re-send "The Long Road" to **Bob** (`bun scripts/send-founder-long-road-real.ts --to <bob> --variant founder --node bob-bass`) — needs the BBL Resend key + which of his two emails. The claim path is prod-verified working (#197).

