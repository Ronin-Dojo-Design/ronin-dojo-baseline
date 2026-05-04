---
title: "SESSION 0046 — Registration Cancellation + Stripe Refund"
slug: session-0046
type: session
status: closed-full
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0046
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0045.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0046 — Registration Cancellation + Stripe Refund

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

closed-full

### Goal

Registration cancellation flow — allow users to cancel a registration, update status to CANCELLED, handle Stripe refund if paid.

### Plan (Petey)

| ID | Description | Agent | Depends on |
| --- | --- | --- | --- |
| SESSION_0046_TASK_01 | Add `registrationCancelSchema` Zod schema | Cody | — |
| SESSION_0046_TASK_02 | Create `cancelRegistration` server action — CANCELLED + Stripe refund | Cody | TASK_01 |
| SESSION_0046_TASK_03 | Add cancel UI to RegisterButton (show when user already registered) | Cody | TASK_02 |
| SESSION_0046_TASK_04 | Update tournament detail page to pass existing registration to RegisterButton | Cody | TASK_03 |
| SESSION_0046_TASK_05 | Type-check (`tsc --noEmit`) | Cody | TASK_01–04 |

### Acceptance criteria

- Authenticated user with an existing registration can cancel it
- Status transitions: SUBMITTED/APPROVED → CANCELLED
- If paymentStatus is PAID with totalFeeCents > 0: Stripe refund issued, paymentStatus → REFUNDED
- Cancel button renders in place of register form when user already has a registration
- All files pass type-check

### Context

- Previous session: SESSION_0045 (registration polish + error cleanup)
- Registration model: `prisma/schema.prisma` line 1807
- Enums: RegistrationStatus has CANCELLED, PaymentStatus has REFUNDED, EntryStatus has CANCELLED
- Stripe pattern: `app/api/stripe/webhooks/route.ts`, `server/web/tournaments/register.ts`

### What landed

- **Registration cancel schema** — Zod input schema for cancellation
- **Cancel server action** — ownership-verified cancellation with Stripe refund for paid registrations, status → CANCELLED, entries → CANCELLED
- **Cancel UI** — RegisterButton shows "You are registered" state with cancel button when existing registration found; confirmation dialog before cancellation
- **Tournament detail page** — queries current user's registration via `getServerSession()` + `db.registration.findUnique`, passes to RegisterButton
- **Type-check** — `tsc --noEmit` passes with 0 errors

### Files touched

- `apps/web/server/web/tournaments/schema.ts` — Added `registrationCancelSchema`
- `apps/web/server/web/tournaments/register.ts` — Added `cancelRegistration` server action (ownership check, Stripe refund, status transitions)
- `apps/web/components/web/tournaments/register-button.tsx` — Added cancel UI with existing registration display, confirmation dialog
- `apps/web/app/(web)/tournaments/[slug]/page.tsx` — Added session lookup + existing registration query

### Decisions resolved

- **Cancellation scope**: user-initiated only (no admin cancel in this session)
- **Stripe refund**: full refund via `stripe.refunds.create` using payment intent from checkout session lookup
- **Entry status on cancel**: CANCELLED (not WITHDRAWN — schema only has ACTIVE/CANCELLED)
- **Cancel confirmation**: browser `confirm()` dialog (sufficient for MVP; modal upgrade deferred)

### Open decisions / blockers

- **F-01 (medium)**: Stripe refund lookup via `sessions.list(100)` is fragile — needs `stripePaymentIntentId` on Registration
- **F-02 (medium)**: Capacity check is app-level only — concurrent races possible
- **F-03 (low)**: Admin registrations page lacks brand scoping

### Hostile close review

See `docs/protocols/project-log.md` — SESSION_0042_TO_0046_REVIEW_01. Batch review of 5 sessions.

- **WORKFLOW score: 9.2/10**
- **Kaizen aggregate: 7** (100→9, 1k→8, 10k→7)
- **Score gate action**: Stage remediation SESSION_0046.5 for F-01 + F-02 before further tournament lane work

### Next session

**Goal**: SESSION_0046.5 remediation — add `stripePaymentIntentId` column to Registration, store in webhook, use for refunds. Optionally add serializable transaction for capacity check.

**Inputs to read**: Registration model in schema, webhook handler, cancel action

**First task**: Prisma migration to add `stripePaymentIntentId` nullable String field to Registration

### Task log

- SESSION_0046_TASK_01 — registrationCancelSchema ✅
- SESSION_0046_TASK_02 — cancelRegistration server action ✅
- SESSION_0046_TASK_03 — Cancel UI in RegisterButton ✅
- SESSION_0046_TASK_04 — Tournament detail page existing registration query ✅
- SESSION_0046_TASK_05 — tsc --noEmit ✅ (0 errors)

### ADR / ubiquitous-language check

No new ADRs. Confirmed `CANCELLED` (not `WITHDRAWN`) is the correct EntryStatus value.
