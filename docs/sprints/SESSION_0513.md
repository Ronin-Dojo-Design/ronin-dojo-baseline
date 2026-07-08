---
title: "SESSION 0513 — durable email claim links (broken-link incident)"
slug: session-0513
type: session--implement
status: in-progress
created: 2026-07-08
updated: 2026-07-08
last_agent: claude-session-0513
sprint: S52
pairs_with:

  - docs/sprints/SESSION_0512.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0513 — durable email claim links (broken-link incident)

## Date

2026-07-08

## Operator

Brian + claude-session-0513

## Goal

Operator-reported incident: Tony Hua (and Bob) got "The Long Road" article email with
links that "didn't open." Root cause: the email CTA embedded a **single-use, 7-day
Better-Auth magic-link** (`mintClaimMagicLink`) — mail scanners pre-fetch and consume the
one use before the human clicks, and it expires. Fix: stop embedding one-shot tokens; bind
the claim durably (existing 90-day `LineagePendingClaim`) and link to a durable public
sign-in URL (`/auth/login?next=/me`). The node still auto-claims on the recipient's next
sign-in (Google or magic-link) via the unchanged reconciliation. Prove the whole claim
flow works live end-to-end before any re-send.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0512.md` (WL-P2-36 color picker, merged #196).
- Carryover: reactive incident lane opened mid-session-0512 on an operator email report.

### Branch and worktree

- Branch: `session-0513-emaillinks`
- Worktree: `/Users/brianscott/dev/ronin-0513-emaillinks`
- Current HEAD at bow-in: `fc1d42ac` (origin/main incl. #196)

## Diagnosis (evidence)

- **Tony Hua** = BBL admin, author of the "dirty dozen" article (`/blog/the-dirty-dozen-pioneers-bjj`, live 200). His node is ALREADY claimed (account `tonyhua08@gmail.com`) → his broken link was a second click on a single-use link.
- **Bob Bass** node unclaimed; 2 `LineagePendingClaim` rows (`bobbassjj@` + `sbjjitsu30@`), unconsumed, never-expiring → reconcile on his next sign-in.
- All correct destinations live (site, `/blog`, article) → the broken links were the single-use magic-link, not 404s.
- The claim system is DESIGNED for "Continue with Google" (`reconcile-pending-claims.ts` comment) — Bob's smooth path.

## Petey plan

### Tasks

#### SESSION_0513_TASK_01 — Durable email claim-link fix

- **Agent:** Cody → Doug
- **What:** New `bindPendingClaim(email, nodeId)` + `buildClaimSignInUrl(baseUrl, nextPath="/me")` in `mint-claim-magic-link.ts`; rewire the 3 claim emails + send scripts + `public-actions` guest-claim path to bind + link durable instead of embedding a one-shot token. Reconciliation UNCHANGED.
- **Done means:** emitted URL = `…/auth/login?next=%2Fme` (no token); node still auto-claims on sign-in; gates green.

#### SESSION_0513_TASK_02 — Live end-to-end claim-flow proof

- **Agent:** Doug
- **What:** Drive the real sign-in→claim round-trip against a running server on an isolated throwaway fixture; assert node auto-claims; full teardown.
- **Done means:** DB before/after proves `passport.userId` null→user + pending-claim consumed; `/me` renders claimed; zero residue.

#### SESSION_0513_TASK_03 — Queue TICKET-0502-A into the launch gate

- **Agent:** Petey
- **What:** TICKET-0502-A (profile `/me`+`/directory` component-tree consolidation) was an un-tracked deferral. Operator wants it done before the Brian email → ledgered as **WL-P2-37** (pre-Brian gate).

### Open decisions

- `/me` vs `/directory` as the claim-link landing: **kept `/me`** (safe, slug-independent, Doug-verified; TICKET-0502-A will transparently improve its render). Operator greenlit.

## Task log

| Task | Status | Notes |
| --- | --- | --- |
| SESSION_0513_TASK_01 | built + verified | Cody built (8 files + 1 test); gates green (149+7+9 tests). Durable URL confirmed via dry-run. |
| SESSION_0513_TASK_02 | verified LIVE | Doug end-to-end proof: node auto-claimed on real sign-in (userId null→user, pending consumed, comp+access+audit written, `/me` renders claimed), full teardown zero residue. **DOES THE CLAIM FLOW WORK END-TO-END: YES (9.6/10).** |
| SESSION_0513_TASK_03 | landed | TICKET-0502-A queued as WL-P2-37 (pre-Brian gate). |

## Follow-ups flagged

- Guest paid-checkout "confirm your account" email + admin invite composer still use the older pattern (out of scope; launch-gate review).
- Prod smoke: confirm post-verify redirect lands on `blackbeltlegacy.com` host (Doug P3 — `BETTER_AUTH_URL` cosmetic locally).
