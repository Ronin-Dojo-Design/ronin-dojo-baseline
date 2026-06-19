---
title: "SESSION 0411 — Dry-run-gated BBL lifecycle email surface"
slug: session-0411
type: session--implement
status: closed
created: 2026-06-18
updated: 2026-06-18
last_agent: codex-session-0411
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0410.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0411 — Dry-run-gated BBL lifecycle email surface

## Date

2026-06-18

## Operator

Brian + codex-session-0411

## Goal

Add the first full pass of brand-aware, dry-run-gated Black Belt Legacy transactional/lifecycle emails
on the existing notification seam, with Stripe webhook wiring for the paid subscription lifecycle and
documentation of the dry-run contract.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0410.md`.
- Carryover: SESSION_0410 closed the local BBL profile verification lane; this session followed the
  operator-provided cloud-session email goal instead of the prior local Pods-import lane.

### Branch and worktree

- Branch: `work`
- Worktree: `/workspace/ronin-dojo-baseline`
- Status at bow-in: clean before creating this session file.
- Current HEAD at bow-in: recorded by git log at close.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Email/Resend and Stripe webhook lifecycle. |
| Extension or replacement | Extension: lifecycle sends reuse `apps/web/lib/notifications.ts` → `apps/web/lib/email.ts` and existing React Email wrappers. |
| Why justified | BBL launch needs real lifecycle copy and trigger wiring without bypassing the verified sender safeguards. |
| Risk if bypassed | Inline webhook sends or ungated Resend calls could send real mail from the DKIM-verified BBL domain during rehearsal. |

Live docs checked during planning: repo runbook `docs/runbooks/sops/sop-email-runbook.md`; no external docs needed.

### Graphify check

- Graph status: unavailable — `graphify` command is not installed in this container.
- Queries used: attempted `email notifications stripe webhook lifecycle BBL email templates`.
- Files selected from graph: none; exact files were opened directly.
- Verification note: Graphify-first was attempted and failed closed to direct file inspection.

## Petey plan

### Goal

Ship a safe first pass of lifecycle email templates, dry-run gating, docs, and Stripe webhook wiring.

### Tasks

#### SESSION_0411_TASK_01 — Add lifecycle template + notification helper

- **Agent:** Cody
- **What:** Add a reusable BBL lifecycle React Email template and `notifyUserOfLifecycleEvent` dry-run helper.
- **Done means:** Template uses `BblEmailWrapper`; helper rate-limits and returns before `sendEmail` while `EMAIL_LIFECYCLE_DRYRUN` is on.
- **Depends on:** nothing.

#### SESSION_0411_TASK_02 — Wire Stripe lifecycle triggers

- **Agent:** Cody
- **What:** Schedule lifecycle notifications from Stripe webhook paths with `after(...)`.
- **Done means:** Checkout subscription, subscription update/delete, invoice paid, payment failed, full refund, and dispute paths call the notification helper.
- **Depends on:** SESSION_0411_TASK_01.

#### SESSION_0411_TASK_03 — Document the safety contract

- **Agent:** Cody
- **What:** Update the email SOP and record the dry-run decision as an ADR.
- **Done means:** Runbook and ADR describe the default-on dry-run flag, shared receipt/renewal template decision, and single egress boundary.
- **Depends on:** SESSION_0411_TASK_01.

## What landed

- Added `EMAIL_LIFECYCLE_DRYRUN` with default `1`, making lifecycle email dry-run the default environment contract.
- Added a BBL-branded lifecycle notification template that reuses `BblEmailWrapper`, supports details, tier features, and CTAs.
- Added `notifyUserOfLifecycleEvent` with rate-limit protection and a dry-run console path that returns before `sendEmail`.
- Wired Stripe webhook lifecycle events through `after(...)`: paid subscription welcome, Premium/Elite/downgrade subscription updates, subscription ended, invoice paid receipt/renewal confirmation, payment failed/dunning, refund confirmation, and dispute alert.
- Updated the email runbook and added ADR 0031 for the lifecycle dry-run gate.

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/env.ts` | Added `EMAIL_LIFECYCLE_DRYRUN` default-on env schema. |
| `apps/web/emails/lifecycle-notification.tsx` | New BBL lifecycle template using the existing BBL wrapper. |
| `apps/web/lib/notifications.ts` | New dry-run-gated, rate-limited lifecycle notification helper. |
| `apps/web/server/web/billing/stripe-webhook.ts` | Stripe lifecycle trigger wiring via `after(...)`. |
| `docs/runbooks/sops/sop-email-runbook.md` | Documented dry-run lifecycle email contract. |
| `docs/architecture/decisions/0031-lifecycle-email-dry-run-gate.md` | ADR for dry-run gating and receipt/renewal template sharing. |
| `docs/knowledge/wiki/index.md` | Session index update. |
| `docs/sprints/SESSION_0411.md` | Session ledger. |

## Decisions resolved

- Lifecycle email sends are dry-run by default and require explicit `EMAIL_LIFECYCLE_DRYRUN=0` or `false` to reach `sendEmail`.
- Invoice paid currently covers both payment receipt and renewal confirmation copy/template needs.

## Open decisions / blockers

- Scheduled lifecycle jobs (renewal reminder, trial ending, comp expiry, win-back) still need concrete job entrypoints and preview approval before any cron registration.
- Profile-claim approved/rejected and rank-promotion emails need their non-webhook trigger wiring in a follow-up.

## Next session

### Goal

Finish non-webhook lifecycle wiring and scheduled dry-run job stubs for BBL claim/rank/comp expiry/win-back emails.

### Inputs to read

- `apps/web/lib/notifications.ts`
- `apps/web/emails/lifecycle-notification.tsx`
- `apps/web/server/web/billing/stripe-webhook.ts`
- `docs/runbooks/sops/sop-email-runbook.md`
- Claim and RankAward action files discovered from the domain hubs.

### First task

Add explicit notify wrappers for profile-claim approved/rejected, rank-promotion, comp granted, membership-expiring, renewal reminder, trial-ending, and win-back, then wire them to their real actions or dry-run job stubs.

## Task log

| Task ID | Status | Notes |
| --- | --- | --- |
| SESSION_0411_TASK_01 | done | Template + notification helper landed behind dry-run and rate-limit gates. |
| SESSION_0411_TASK_02 | done | Core Stripe lifecycle events wired with `after(...)`. |
| SESSION_0411_TASK_03 | done | SOP + ADR added. |

## Review log

| Reviewer | Scope | Verdict | Notes |
| --- | --- | --- | --- |
| codex-session-0411 | Implementation self-review | pass-with-follow-ups | Core webhook lifecycle wired safely; non-webhook/scheduled surfaces remain explicit next-session work. |

## Hostile close review

- **Giddy verdict:** pass with scope caveat — no live sends because helper returns before `sendEmail` while dry-run flag is default-on.
- **Doug verdict:** pass with follow-ups — typecheck/wiki/format passed; lint has pre-existing warnings only; no matching test files existed for the new template/helper path.
- **Score cap:** capped at 8/10 because the operator's full email list is not fully complete in one session; scheduled and non-webhook lifecycle paths are staged as follow-up work.

## ADR / ubiquitous-language check

- ADR required and added: `docs/architecture/decisions/0031-lifecycle-email-dry-run-gate.md`.
- No new ubiquitous-language terms introduced.

## Reflections

- The safest pattern is a notification-layer dry-run return before `sendEmail`, not relying only on missing `RESEND_API_KEY`.
- The Stripe webhook file already has the correct `after(...)` pattern for tournament/merch emails; extending that seam avoided new infrastructure.
- The full requested email set is larger than one safe pass; documenting follow-ups is better than pretending scheduled/non-webhook triggers are complete.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | ADR 0031 created with frontmatter; runbook/session/index dates updated. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` updated with SESSION_0411. |
| Wiki lint | `bun run wiki:lint` passed with 0 violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Review log and hostile close review entries present. |
| Review & Recommend | Next session goal and first task written. |
| Memory sweep | SOP and ADR updated; no additional glossary term needed. |
| Next session unblock check | Unblocked; follow-up scope listed under Open decisions / blockers. |
| Git hygiene | Branch `work`; commit hash reported at bow-out — see git log. |
| Graphify update | Skipped — `graphify` command unavailable in this container. |
