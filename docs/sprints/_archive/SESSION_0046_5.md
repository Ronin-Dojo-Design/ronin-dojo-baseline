---
title: "SESSION 0046.5 — Remediation: stripePaymentIntentId + Capacity Race Fix"
slug: session-0046-5
type: session
status: closed-unclean
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0046-5
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0046.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0046.5 — Remediation: stripePaymentIntentId + Capacity Race Fix

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

closed-quick

### Goal

Remediate F-01 and F-02 from SESSION_0046 hostile close review:

- **F-01**: Add `stripePaymentIntentId` column to Registration, store in webhook, use for refunds (replacing fragile `sessions.list(100)` lookup)
- **F-02**: Add serializable transaction for capacity check to prevent concurrent registration races

### Plan (Petey)

| ID | Description | Agent | Depends on |
| --- | --- | --- | --- |
| SESSION_0046_5_TASK_01 | Add `stripePaymentIntentId String?` + index to Registration model in schema.prisma | Cody | — |
| SESSION_0046_5_TASK_02 | Run Prisma migration | Cody | TASK_01 |
| SESSION_0046_5_TASK_03 | Store `stripePaymentIntentId` in webhook `fulfillTournamentRegistration` | Cody | TASK_02 |
| SESSION_0046_5_TASK_04 | Refactor `cancelRegistration` to use `stripePaymentIntentId` instead of `sessions.list` | Cody | TASK_02 |
| SESSION_0046_5_TASK_05 | Add serializable transaction wrapper around capacity check in registration flow | Cody | TASK_02 |
| SESSION_0046_5_TASK_06 | Type-check (`tsc --noEmit`) | Cody | TASK_03–05 |

### Acceptance criteria

- Registration model has `stripePaymentIntentId String?` with index
- Webhook stores `payment_intent` ID on registration fulfillment
- Cancel action reads `stripePaymentIntentId` directly — no `sessions.list` call
- Capacity check uses serializable transaction or `SELECT ... FOR UPDATE` pattern
- All files pass type-check

### Context

- Previous session: SESSION_0046 (registration cancellation + Stripe refund)
- Registration model: `prisma/schema.prisma` line 1807
- Webhook: `app/api/stripe/webhooks/route.ts` line 13 (`fulfillTournamentRegistration`)
- Cancel action: `server/web/tournaments/register.ts` line 127

### What landed

- **TASK_01**: Added `stripePaymentIntentId String?` + `@@index([stripePaymentIntentId])` to Registration model
- **TASK_02**: Prisma migration `20260504111530_add_stripe_payment_intent_to_registration` applied
- **TASK_03**: Webhook `fulfillTournamentRegistration` now stores `session.payment_intent` on both create and upsert paths
- **TASK_04**: `cancelRegistration` refactored — reads `stripePaymentIntentId` directly, no more `sessions.list(100)` call
- **TASK_05**: Capacity check + free registration wrapped in serializable `$transaction` to prevent concurrent race conditions
- **TASK_06**: `tsc --noEmit` passes (only pre-existing `TagInclude` depth error in admin/tags — unrelated)

### Files touched

- `apps/web/prisma/schema.prisma` — Added `stripePaymentIntentId String?` + index to Registration model
- `apps/web/prisma/migrations/20260504111530_add_stripe_payment_intent_to_registration/migration.sql` — Generated migration
- `apps/web/app/api/stripe/webhooks/route.ts` — Store `payment_intent` ID on registration create + upsert
- `apps/web/server/web/tournaments/register.ts` — Refactored cancel to use stored ID; wrapped capacity check in serializable transaction

### Decisions resolved

- **F-01 resolved**: `stripePaymentIntentId` stored at fulfillment time, used directly for refunds
- **F-02 resolved**: Serializable isolation level transaction prevents capacity race conditions
- **Refund without payment intent**: throws explicit error rather than silently skipping

### Open decisions / blockers

- **F-03 (low, from 0046)**: Admin registrations page still lacks brand scoping — deferred
- **Pre-existing**: `TagInclude` excessive stack depth error in `admin/tags/queries.ts` — unrelated to tournament lane

### Next session

**Goal**: Resume tournament lane — admin approval workflow or bracket/match generation (per program-plan)

**Inputs to read**: SESSION_0046.5 files touched, program-plan.md S2 scope

**First task**: Review program-plan for next tournament milestone

### Task log

- SESSION_0046_5_TASK_01 — Add stripePaymentIntentId to Registration schema ✅
- SESSION_0046_5_TASK_02 — Prisma migration ✅
- SESSION_0046_5_TASK_03 — Store payment intent in webhook ✅
- SESSION_0046_5_TASK_04 — Refactor cancelRegistration to use stored ID ✅
- SESSION_0046_5_TASK_05 — Serializable transaction for capacity check ✅
- SESSION_0046_5_TASK_06 — tsc --noEmit ✅ (0 new errors)
