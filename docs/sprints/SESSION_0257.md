---
title: "SESSION 0257 — MB-015 Transactional Email Plan (3-session roadmap)"
slug: session-0257
type: session--plan
status: closed
created: 2026-05-25
updated: 2026-05-25
last_agent: copilot-session-0257
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0256.md
  - docs/sprints/SESSION_0255.md
  - docs/sprints/SESSION_0254.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0257 — MB-015 Transactional Email Plan (3-session roadmap)

## Date

2026-05-25

## Operator

Brian + copilot-session-0257 (Petey planning only)

## Goal

Plan MB-015 (Resend transactional email setup) across 3 execution sessions (A, B, C) with 3–5 tasks each. Also document SOP alignment check findings. No implementation this session — plan only.

## SOP E2E User Lifecycle alignment check

Reviewed `docs/runbooks/sop-e2e-user-lifecycle.md` (last updated SESSION_0146) against current codebase state.

### Aligned sections (no changes needed)

- §1 Visitor → Account → Identity ✅
- §2 Identity → Org Shell ✅
- §3 Directory Lifecycle ✅
- §6 Tournament Lifecycle ✅
- §7 Staff/Admin Lifecycle ✅
- §8b Invite Lifecycle ✅
- §9 Cross-brand Lifecycle ✅
- §11 E2E Happy Path ✅
- §12 Failure/Edge States ✅
- §13 Listing Types ✅

### Partially built (schema exists, limited or no UI)

- §4 Course/Curriculum — schema exists, no CRUD UI yet (S6 scope)
- §5 Rank Lifecycle — schema + seed data, limited admin UI
- §8 Subscription/Certification — schema only
- §8c Payment — schema only, Stripe wiring pending
- §8d Punch card/Drop-in — schema only

### Missing sections (need to be added)

- **§14 Privacy/DSR Lifecycle** — SESSION_0254–0256 built full DSR submit + admin triage + e2e. Not in SOP.
- **§15 Lineage Lifecycle** — SESSION_0245–0251 built lineage search, privacy, public/authenticated lifecycle. Not in SOP.
- **§16 Transactional Email Touchpoints** — No section mapping lifecycle events → email templates. Needed for MB-015.

### Verdict

Doc is **active but stale**. Existing content valid. Three sections missing. Refresh planned in Session C below.

---

## MB-015 Execution Plan

### Existing infrastructure

- **Resend SDK** wired via `services/resend.ts`
- **`sendEmail` helper** at `lib/email.ts` — adds `from`, `replyTo`, `text` fallback
- **12 email templates** already exist in `emails/` (magic-link, submission variants, merch, invite, etc.)
- **`after()` pattern** established for fire-and-forget side effects (used in DSR status transitions)
- **`.env`** has `RESEND_API_KEY` and `RESEND_SENDER_EMAIL` populated (may need verification)
- **`notifications.ts`** has existing notification functions for tool submissions — pattern to follow

### What's missing

1. No DSR-related email templates
2. No membership status change email
3. No tournament registration confirmation email
4. No email touchpoint map in SOP
5. MB-015 proof artifacts not yet collected (verified domain, live key, real inbox delivery)

---

## Session A — Email Infrastructure + DSR Confirmation Email

**Goal:** Verify Resend delivery works end-to-end, then add the first domain-specific transactional email (DSR submission confirmation).

**Inputs to read:** `lib/email.ts`, `lib/notifications.ts`, `emails/submission.tsx` (template pattern), `server/admin/privacy/actions.ts`, MB-015 boundary entry.

**First task:** A1 (manual Resend verification).

### SESSION_A_TASK_01 — Verify Resend dashboard + DNS

- **Agent:** Brian (manual)
- **What:** Verify Resend dashboard: domain verified, API key live, DNS records (SPF, DKIM, DMARC) green. Update `.env` if key changed.
- **Done means:** Resend dashboard shows verified domain. `.env` has live `RESEND_API_KEY` + `RESEND_SENDER_EMAIL`.

### SESSION_A_TASK_02 — Create DSR submission confirmation email template

- **Agent:** Cody
- **What:** Create `emails/dsr-submission-confirmation.tsx` — React Email template confirming DSR receipt with request ID, type, submitted date. Follow existing `emails/submission.tsx` pattern (wrapper, button, nudge components).
- **Done means:** Template renders in `bun run email:dev` preview.
- **Preflight:** Read `emails/submission.tsx`, `emails/components/wrapper.tsx`, `emails/components/button.tsx`.

### SESSION_A_TASK_03 — Wire DSR submit → confirmation email

- **Agent:** Cody
- **What:** Wire `sendEmail` call into the DSR submit server action. Fire-and-forget after DB insert using `after()` pattern (same as DSR status transition AuditLog write).
- **Done means:** DSR submit triggers email logged in dev console (`📧 Sending email:` line).
- **Preflight:** Read DSR submit action file, `lib/notifications.ts` for pattern.

### SESSION_A_TASK_04 — Create DSR status update email template + wiring

- **Agent:** Cody
- **What:** Create `emails/dsr-status-update.tsx` — sent when admin transitions DSR status. Includes old status → new status, admin notes if present. Wire into `server/admin/privacy/actions.ts` `after()` block alongside existing AuditLog write.
- **Done means:** Status transition triggers email logged in dev console.

### SESSION_A_TASK_05 — E2E verification

- **Agent:** Doug
- **What:** Submit DSR in dev, check console for confirmation email log. Transition status via admin UI, check for status update email log. Run existing 5 DSR Playwright specs to confirm no regressions. Typecheck + biome.
- **Done means:** Both email triggers fire. 5/5 specs pass. Typecheck clean.

---

## Session B — Membership + Invite + Tournament Email Notifications

**Goal:** Add transactional emails for the three highest-traffic lifecycle events: membership status changes, invite notifications, and tournament registration.

**Inputs to read:** `server/admin/memberships/actions.ts`, `server/admin/invites/actions.ts`, `emails/invite-notification.tsx`, tournament registration action.

**First task:** B1.

### SESSION_B_TASK_01 — Membership status change email template

- **Agent:** Cody
- **What:** Create `emails/membership-status-change.tsx` — notifies member when their membership transitions (PENDING→ACTIVE, ACTIVE→SUSPENDED, etc.). Include org name, discipline, old/new status.
- **Done means:** Template renders in email preview.

### SESSION_B_TASK_02 — Wire membership transition → email

- **Agent:** Cody
- **What:** Wire `sendEmail` into membership status transition action (`server/admin/memberships/actions.ts`). Use `after()` pattern.
- **Done means:** Membership status transition fires email in dev console.

### SESSION_B_TASK_03 — Verify invite email wiring

- **Agent:** Cody
- **What:** Review existing `emails/invite-notification.tsx` — verify it's wired into `server/admin/invites/actions.ts`. If not wired, wire it. Add org name + role to template if missing.
- **Done means:** Invite creation sends email (or confirm already wired).

### SESSION_B_TASK_04 — Tournament registration confirmation email

- **Agent:** Cody
- **What:** Create `emails/tournament-registration-confirmation.tsx` — sent on successful registration. Include tournament name, division, snapshot rank/org. Wire into registration action.
- **Done means:** Registration triggers email in dev console.

### SESSION_B_TASK_05 — E2E verification + regression

- **Agent:** Doug
- **What:** Verify all 3 new email triggers fire in dev. Run full 29-spec Playwright suite to confirm no regressions. Typecheck + biome.
- **Done means:** Emails logged. 29/29 specs pass.

---

## Session C — Production Readiness + SOP Refresh + MB-015 Closure

**Goal:** Production-ready email delivery, SOP update, MB-015 closure.

**Inputs to read:** `docs/runbooks/sop-e2e-user-lifecycle.md`, `docs/knowledge/wiki/manual-boundary-registry.md`, Resend dashboard.

**First task:** C1 (manual production email test).

### SESSION_C_TASK_01 — Production email delivery test

- **Agent:** Brian (manual)
- **What:** Send test email to real inbox from Resend (via dashboard test send or a dev-mode trigger). Confirm delivery, check spam score, verify From/Reply-To headers.
- **Done means:** Real email received in inbox (not spam).

### SESSION_C_TASK_02 — Email rate limiting

- **Agent:** Cody
- **What:** Add rate limiting to email-triggering actions (prevent abuse via rapid DSR submissions or form spam). Options: (a) add `emailSentAt` timestamp to DSR model, (b) use existing `rate-limit.ts` config, or (c) lightweight `EmailLog` table. Choose simplest.
- **Done means:** Rapid-fire DSR submissions don't send duplicate emails within a cooldown window.

### SESSION_C_TASK_03 — SOP refresh (§14, §15, §16)

- **Agent:** Cody
- **What:** Update `docs/runbooks/sop-e2e-user-lifecycle.md`:
  - Add §14 Privacy/DSR lifecycle (submit → confirm email → admin triage → status transition → status email → fulfillment)
  - Add §15 Lineage lifecycle (create → privacy → search → public/authenticated views)
  - Add §16 Transactional email touchpoints (map every lifecycle event → email template → trigger location)
  - Bump `last_agent` and `updated` frontmatter.
- **Done means:** Three new sections added. `updated` date current.

### SESSION_C_TASK_04 — MB-015 closure

- **Agent:** Petey
- **What:** Verify all 3 MB-015 proof requirements: (1) Resend dashboard shows verified domain, (2) `.env` has live `RESEND_API_KEY` + `RESEND_SENDER_EMAIL`, (3) test email delivered to real inbox. Update `docs/knowledge/wiki/manual-boundary-registry.md` MB-015 status to `verified`.
- **Done means:** MB-015 status = `verified` in registry.

### SESSION_C_TASK_05 — Full regression + close

- **Agent:** Doug
- **What:** Full Playwright regression (all 29+ specs). Typecheck. Biome. Wiki lint.
- **Done means:** All checks pass. No regressions.

---

## Dependencies & cold-start notes

- **Session A** can start cold — A1 (manual Resend verification) is the gate. If DNS isn't verified, A2–A4 can still proceed (templates + wiring work in dev with console logging).
- **Session B** is independent of Session A's Resend status — templates + wiring work with dev-mode console logging regardless.
- **Session C** depends on A + B for the SOP touchpoint map (§16). C1 requires Brian's manual production test. C4 (MB-015 closure) requires C1 proof.
- All sessions follow standard bow-in/bow-out ritual. Each ends with a Doug verification task.
- Any session can be executed from a cold start by reading this plan + the previous session's close notes.

## Task log

### SESSION_0257_TASK_01

- **Status:** complete
- **Notes:** SOP alignment check performed. 3 missing sections identified (§14 Privacy/DSR, §15 Lineage, §16 Email Touchpoints). 3-session MB-015 plan written with 15 total tasks.

## What landed

- SOP alignment check with 3 gap findings
- 3-session MB-015 execution plan (Sessions A, B, C — 5 tasks each)

## Files touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0257.md` | This planning session file. |

## Decisions resolved

- **Next milestone:** MB-015 (Resend transactional email). Operator chose Option A.
- **Session structure:** 3 sessions × 5 tasks. Infrastructure first, then domain emails, then production readiness + SOP.

## Open decisions / blockers

- None. All 3 sessions are independently startable.

## Next session

**Goal:** Execute Session A — verify Resend infrastructure + build DSR confirmation/status-update email templates + wire them.

### First task

A1: Brian verifies Resend dashboard (domain, DNS, API key).

### Inputs to read

- `lib/email.ts`, `lib/notifications.ts`, `emails/submission.tsx`
- `server/admin/privacy/actions.ts`
- MB-015 boundary in `manual-boundary-registry.md`
- This plan (SESSION_0257)

### Status

closed
