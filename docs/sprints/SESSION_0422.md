---
title: "SESSION 0422 — E2E verify: signup-under-instructor → placement → pay → entitlements → emails → claim approval"
slug: session-0422
type: session--review
status: closed
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0422
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0419.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/runbooks/domain-features/directory-org-profile-hub.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0422 — E2E verify: signup-under-instructor → placement → pay → entitlements → emails → claim approval

## Date

2026-06-20

## Operator

Brian + claude-session-0422

## Goal

Verify (and fix any gaps in) the path where a student signs up UNDER their instructor/school, pays,
gets the right features, and is correctly placed — and that admin claim approval works. Produce a flow
map + pass/fail per step + any fixes made. Extend e2e/integration coverage where missing.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0419.md`
- Carryover: 0419 wired claim-success into the email lifecycle library and flipped
  `EMAIL_LIFECYCLE_DRYRUN=0` in prod (lifecycle emails are LIVE). This session verifies the full
  student-onboarding-under-instructor + claim-approval path end to end.

### Branch and worktree

- Branch: `claude/pensive-cannon-det6cm`
- Worktree: `/home/user/ronin-dojo-baseline`
- Status at bow-in: clean
- Current HEAD at bow-in: `0cf8348`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | payments (Stripe), auth, monetization (entitlements), Prisma |
| Extension or replacement | Verification only — no baseline replacement; reads existing wiring |
| Why justified | Post-launch hardening: confirm the live student onboarding + claim path works end-to-end |
| Risk if bypassed | A broken signup/placement/pay/claim path silently fails for real students |

Live docs checked during planning: payments (Stripe runbook), auth.

## Petey plan

| ID | Title | Status |
| --- | --- | --- |
| SESSION_0422_TASK_01 | Map the signup-under-instructor/school → placement flow (join surfaces + persistence) | ✅ |
| SESSION_0422_TASK_02 | Verify placement (Affiliation/Membership/LineageTree) on profile + roster | ✅ |
| SESSION_0422_TASK_03 | Verify Stripe checkout → signed webhook → UserEntitlement → tier features | ✅ |
| SESSION_0422_TASK_04 | Verify signup/lifecycle emails fire | ✅ |
| SESSION_0422_TASK_05 | Verify claim APPROVE/DENY branches (grant/email/audit per decision) | ✅ (fix: deny email) |
| SESSION_0422_TASK_06 | Extend integration coverage (DENY branch + email scheduling) | ✅ |

## Task log

Verification-led session (Doug). Code-level + executed-test verification against a local Postgres
(schema pushed via `prisma db push`). Live-prod/browser/Stripe rehearsal items are flagged MANUAL —
this sandbox has no browser, no live Stripe/Neon, and must not make a live charge.

## What landed

- **Flow mapped end-to-end** across two placement funnels + pay + email + claim (see Verification).
- **Fix (Task 5): admin DENY now emails the claimant.** `profile-claim-rejected` existed in the
  `LifecycleEmailKind` union but had **no trigger** — approve mailed, deny was silent. Added
  `scheduleClaimRejectedEmail` (mirrors `scheduleClaimApprovedEmail`: `after()`, rollback-safe,
  dry-run-gated, rate-limited, never throws) and wired it into the DENIED branch of
  `applyLineageClaimReview` (carries the reviewer note). Single call site — deny is admin-only.
- **Coverage extended (Task 6):** new DENIED integration test (no grant, no ownership change, audit
  written, rejected-email scheduled with reviewer note) + email-scheduling assertions added to the
  approve and needs-info tests. `claim-review-actions.test.ts` now 11/11 against a real DB.

## Decisions resolved

- **DENY sends a `profile-claim-rejected` lifecycle email** (closes the "email on every decision"
  gap from SESSION_0419's approve-only wiring). Reuses the existing dormant kind — no new ubiquitous
  term, no new template (shared `lifecycle-notification.tsx`).
- **Join Legacy intake is *not* a gap.** `/lineage/join` is the lead/claim funnel (ADR 0023,
  "Register ≠ Claim"); it persists the instructor/school intent appropriately (structured
  `LineageClaimRequest` when an existing node is selected; `Lead.meta` free-text otherwise). It must
  NOT auto-create an `Affiliation`/`Membership` from unverified free text — that is exactly what the
  claim-review gate + the org-invite `Membership` path are for. No change made here.

## Files touched

- `apps/web/server/web/lineage/claim-rejected-email.ts` — NEW `scheduleClaimRejectedEmail`.
- `apps/web/server/admin/lineage/claim-review-actions.ts` — capture DENIED claimant/node; fire the
  rejected email after commit.
- `apps/web/server/admin/lineage/claim-review-actions.test.ts` — DENY test + approve/needs-info
  email-scheduling assertions + hermetic email-scheduler spies.
- `docs/sprints/SESSION_0422.md` — this file.

## Verification

**Flow map (two placement funnels):**

1. **Org/school placement** — `/organizations/join?code=` → `joinByInviteCode` → **Membership**
   (`userId`+`organizationId`+`disciplineId`, `ACTIVE`, STUDENT role) + `notifyMemberOfMembershipWelcome`.
   Shows on profile via `directory/queries.ts` (`account.memberships`) + on roster via
   `getOrganizationMembers`. ✅
2. **Instructor/lineage placement** — `/lineage/join` → `createJoinLegacyInterest` →
   `LineageClaimRequest` (treeId+nodeId, structured) for an existing node, else `Lead`+`Tool`
   (prospect) ; instructor edge (`PROMOTED_BY`/tree placement) finalized on claim approval. ✅
3. **Pay → entitlements** — `actions.ts` checkout (metadata: userId/brand/plan/org) → webhook
   (`stripe-webhook.ts`) **signature-verified** (`constructEvent`, brand-aware secret), idempotent,
   7 events handled → `UserEntitlement` create/reactivate/revoke → `hasEntitlement()` gates features
   (cache-tagged). Comp path (`comp-grants.ts`, `MANUAL_GRANT`) for lineage claims. ✅
4. **Emails** — org-join welcome ✅; Join-Legacy confirmation/magic-link ✅; Stripe `new-member-welcome`
   + receipts/upgrade/refund/etc. ✅ (LIVE, `EMAIL_LIFECYCLE_DRYRUN=0` prod); claim-approved (3 paths)
   ✅; **claim-rejected now wired** ✅.
5. **Claim approve/deny** — Approve → finalize (passport attach + NODE_EDITOR access + Elite comp) +
   `lineage.claim.reviewed` audit + sonner toast + approved email ✅. Deny → status DENIED, **no
   grant**, audit + toast + (now) rejected email ✅. NEEDS_INFO → status-only, no email ✅.

**Executed here (local Postgres, schema pushed):**

- `typecheck` (next typegen + `tsc --noEmit`) — PASS (exit 0).
- `oxlint` + `oxfmt --check` on touched files — clean.
- `bun test server/admin/lineage/claim-review-actions.test.ts` — **11/11 pass** (incl. new DENY +
  email-scheduling assertions).
- `reconcile-pending-claims`, `claim-accept-actions`, `comp-grants`, `claim-review safe-action` — pass.
- 4 unrelated integration tests fail on **missing seed data** (no disciplines / published claimable
  tree in the freshly-pushed empty DB); not regressions — outside the change area. `db:seed` has a
  separate env-specific P2011 in this sandbox.

## Open decisions / blockers

- **MANUAL (cannot run in this sandbox):** browser walk-through on a preview/local env; live BBL
  Stripe **test-mode rehearsal** (per `stripe-setup-runbook.md` §test-mode) to observe
  `checkout.session.completed` → `UserEntitlement ACTIVE` → cancel → `REVOKED`; confirming the
  rejected-email copy renders in Resend. No browser, no live Stripe/Neon here; must not make a live
  charge.
- **Pre-existing (SESSION_0419 carryover):** lifecycle-email copy audit for the now-live non-claim
  kinds; secret rotation (Stripe live/test, Neon).
- Dormant kinds remain (renewal-reminder, trial-ending, win-back, comp-granted, rank-promotion) —
  future scheduled-job triggers, out of scope here.

## Next session

**Goal:** Live test-mode Stripe rehearsal + browser walk-through of the student onboarding path on a
preview env; lifecycle-email copy audit.

**First task:** Run the `stripe-setup-runbook.md` test-mode rehearsal against BBL (test keys), drive a
checkout with `4242…`, and assert `UserEntitlement` ACTIVE then REVOKED on cancel. NOT code-blocked;
needs operator-side keys + a browser.

## Reflections

- **Sub-agent "gaps" need architecture-grounding.** The signup explorer flagged "no Affiliation
  created at intake" as a bug; the hub (ADR 0023, Register ≠ Claim) shows that's by-design — the
  claim gate exists precisely so unverified free-text never becomes a real affiliation. Verified the
  two real placement paths instead of "fixing" the funnel.
- **A defined-but-dormant enum is a latent half-feature.** `profile-claim-rejected` sat in the union
  with no caller — the approve path got wired in 0419, deny didn't. The fix was wiring, not authoring
  (reused the kind + template), mirroring the 0419 lesson.
- **Stand up the dep when the sandbox lacks it.** No Neon here, but the `postgresql-16` binaries were
  present — `initdb` (as an unprivileged user) + `prisma db push` gave a real DB to actually execute
  the claim-review suite rather than only typecheck it.

## ADR / ubiquitous-language check

- No new ADR required — reuses ADR 0031 (lifecycle dry-run gate) + ADR 0023 (claim) + the existing
  `profile-claim-rejected` kind. No new ubiquitous term.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter/type | `session--review`; `last_agent` stamped; `pairs_with` set. |
| Verification | typecheck PASS; oxlint/oxfmt clean; claim-review 11/11 on local Postgres. |
| Reflections | present. |
| Hostile close review | Change is additive (new email helper + one DENIED capture branch); approve/needs-info untouched behavior re-asserted by tests; email is dry-run-gated + rate-limited + never throws → cannot block a review. |
| Next session | Goal + first task written. |
| Git hygiene | Branch `claude/pensive-cannon-det6cm`; single push at close; draft PR opened. |
