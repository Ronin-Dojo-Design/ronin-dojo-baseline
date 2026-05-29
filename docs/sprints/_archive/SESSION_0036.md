---
title: "SESSION 0036 — Entitlement-first commerce implementation"
slug: session-0036
type: session
status: closed-quick
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0036
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0035.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0036 — Entitlement-first commerce implementation

## Date

2026-05-03

## Operator

Brian Scott + Copilot (Cody role — implementation)

## Status

closed-quick

## Goal

Implement the entitlement-first commerce layer planned in SESSION_0035: schema (Entitlement, EntitlementGrant, UserEntitlement + enums), Stripe IDs on PricingPlan, entitlement service (grant/revoke/check/expire), admin management actions, Stripe webhook extension, smoke test.

## What landed

| Task | Description | Status |
|---|---|---|
| TASK_01 | Schema: 2 enums, 3 models, 2 PricingPlan columns, User + PricingPlan relations | ✅ Done |
| TASK_02 | Migration: `entitlement-layer` (after db reset to resolve drift) | ✅ Done |
| TASK_03 | Entitlement service: grant, revoke, check, expire | ✅ Done |
| TASK_04 | Admin management: create, link plan, list | ✅ Done |
| TASK_05 | Stripe webhook: checkout→grant, subscription.deleted→revoke | ✅ Done |
| TASK_06 | Smoke test: 3/3 scenarios pass | ✅ Done |
| TASK_07 | SESSION file + commit | ✅ This file |

## Files touched

| Path | Note |
|---|---|
| `apps/web/prisma/schema.prisma` | Added EntitlementSourceType, EntitlementStatus enums; Entitlement, EntitlementGrant, UserEntitlement models; stripeProductId/stripePriceId on PricingPlan |
| `apps/web/prisma/migrations/20260503172522_entitlement_layer/` | Migration SQL |
| `apps/web/server/web/entitlement/check-entitlement.ts` | Pure function: userId + key + brand → boolean |
| `apps/web/server/web/entitlement/grant-entitlement.ts` | Server action: idempotent grant |
| `apps/web/server/web/entitlement/revoke-entitlement.ts` | Server action: set REVOKED |
| `apps/web/server/web/entitlement/expire-entitlements.ts` | Cron-callable: ACTIVE → EXPIRED where endsAt passed |
| `apps/web/server/web/entitlement/manage-entitlements.ts` | Admin actions: create, link plan, list |
| `apps/web/app/api/stripe/webhooks/route.ts` | Extended: checkout.session.completed → grant, customer.subscription.deleted → revoke |
| `apps/web/scripts/smoke-entitlements.ts` | Smoke test: grant/check/revoke/expire — all pass |
| `docs/sprints/SESSION_0036.md` | This file |

## Decisions made

- Database reset was required (drift from prior direct-apply sessions). All existing migrations re-applied cleanly.
- Webhook entitlement logic placed as module-level functions in the same route file (not separate imports) to match existing Dirstarter pattern.
- Smoke test uses standalone PrismaClient with PrismaPg adapter (no env.ts dependency).

## Next session

**SESSION_0037** — scope TBD per WORKFLOW 5.0 calendar.

- Likely candidates: admin UI for entitlement management, or certificate entitlements slice.
- First task: check WORKFLOW 5.0 calendar for 0037 assignment.

## Bow-out line

> *Bowed out — SESSION_0036 closed-quick. Entitlement layer shipped: schema + service + webhook + smoke test, all green.*
