---
title: "Lane Manifest: S036 — Entitlement-first Commerce"
slug: lane-s036-entitlement
type: lane-manifest
status: ready
created: 2026-05-03
author: Petey
session_target: SESSION_0036
primary_lane: School operations
worktree: wt-core-platform
pairs_with:
  - docs/sprints/SESSION_0035.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/monetization-entitlements-spec.md
---

## Lane Manifest: SESSION_0036 — Entitlement-first Commerce

## WORKFLOW 5.0 alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization (Stripe webhooks), DB (schema), shared services (action client) |
| Extension or replacement | **Extension** — adds entitlement layer on top of existing Stripe webhook + action client |
| Why justified | MVP requires paid program access gating; entitlements are the bridge between Stripe checkout and feature access |
| Risk if bypassed | No paid access control → cannot launch with billing |

## Deliverables (max 3)

1. Schema: `Entitlement` + `EntitlementGrant` + `UserEntitlement` + enums + PricingPlan Stripe IDs
2. Service layer: grant / revoke / check / expire functions
3. Stripe webhook extension: checkout → entitlement grant, subscription.deleted → revoke

---

## Recipe 1: Schema additions

- **Pattern:** Dirstarter Prisma model convention (baseline index §6)
- **Template files to read:** None needed — pure additive schema
- **Exact spec:** SESSION_0035 TASK_01 (prisma blocks provided verbatim)
- **Delta:** Add 3 models, 2 enums, 2 columns on PricingPlan, 2 relations
- **New files:** None (edit `apps/web/prisma/schema.prisma`)
- **Depends on:** Current schema must be migrated clean
- **Acceptance:** `bunx prisma validate` + `bunx prisma format` pass

---

## Recipe 2: Entitlement service (server actions + utility)

- **Pattern:** Dirstarter admin action slice (baseline index §3, §10)
- **Template files to read (canonical examples):**

| File | Why | Key pattern to copy |
| --- | --- | --- |
| `server/admin/tools/actions.ts` | Canonical `adminActionClient` usage with upsert, delete, `after()` for side effects | Action shape, error handling, revalidate |
| `server/admin/tools/schema.ts` | Zod schema for input validation | Schema-per-slice pattern |
| `server/admin/tools/queries.ts` | Read queries with Prisma select/include | Query shape for list/detail |
| `lib/safe-actions.ts` | Action client chain: base → userActionClient → adminActionClient | How to use `ctx.db`, `ctx.revalidate`, `ctx.user` |

- **Delta from template:**
  - `grantEntitlement` → like `upsertTool` but for UserEntitlement (upsert by userId+entitlementId+sourceId)
  - `revokeEntitlement` → like `deleteTools` but sets status instead of hard delete
  - `checkEntitlement` → NOT an action, just a utility function (no `adminActionClient`)
  - `expireEntitlements` → cron-callable, batch update where endsAt < now()
  - All must add `brand` scoping (not in template pattern — Ronin addition per L3)

- **New files to create:**

```text
apps/web/server/web/entitlement/
  ├── grant-entitlement.ts    (server action — userActionClient)
  ├── revoke-entitlement.ts   (server action — adminActionClient)
  ├── check-entitlement.ts    (utility — no action wrapper)
  ├── expire-entitlements.ts  (cron function — no action wrapper)
  ├── manage-entitlements.ts  (admin actions — adminActionClient)
  └── schema.ts               (Zod schemas for all inputs)
```

- **Depends on:** Recipe 1 (schema + migration)
- **Acceptance:** `bunx tsc --noEmit` passes, Biome clean, smoke script passes

---

## Recipe 3: Stripe webhook extension

- **Pattern:** Dirstarter webhook route (baseline index §9)
- **Template file to read:**

| File | Why | Key pattern to copy |
| --- | --- | --- |
| `app/api/stripe/webhooks/route.ts` | Existing handler — we ADD cases, not replace | `constructEvent`, switch on `event.type`, `after()` for async work, metadata lookup |

- **Delta from template:**
  - `checkout.session.completed` → existing handles `metadata.tool`. Add: look up `PricingPlan` by `stripePriceId` from line items → find `EntitlementGrant` rows → call `grantEntitlement` per grant
  - `customer.subscription.deleted` → existing handles `metadata.tool`. Add: find all UserEntitlements with sourceType=SUBSCRIPTION + sourceId=subscription.id → revoke each
  - Keep existing tool/featured logic intact (D-014: these are now Directory Listing payments)

- **New files:** None (edit existing `app/api/stripe/webhooks/route.ts`)
- **Depends on:** Recipe 2 (imports `grantEntitlement`, `revokeEntitlement`)
- **Acceptance:** Stripe CLI `stripe trigger checkout.session.completed` → entitlement created in DB

---

## Recipe 4: Smoke test

- **Pattern:** Standalone script (no Dirstarter equivalent — Ronin addition)
- **Template files:** None
- **New file:** `apps/web/scripts/smoke-entitlements.ts`
- **Spec:** SESSION_0035 TASK_06 (3 scenarios: grant→check→revoke→check, expire)
- **Acceptance:** `bun apps/web/scripts/smoke-entitlements.ts` outputs PASS×3

---

## Pre-flight checklist (Cody reads before starting)

- [ ] `bunx prisma migrate status` — no pending migrations
- [ ] `bun dev` starts clean
- [ ] Read this manifest (you're done after this bullet)
- [ ] Read `lib/safe-actions.ts` for action client chain (pattern in §10 of baseline index)
- [ ] Read `app/api/stripe/webhooks/route.ts` for existing webhook shape
- [ ] Do NOT read the full baseline index (300+ files) — this manifest has everything you need

## Token budget estimate

| Read | Tokens |
| --- | --- |
| This manifest | ~1.5K |
| `lib/safe-actions.ts` | ~0.5K |
| `server/admin/tools/actions.ts` | ~1K |
| `app/api/stripe/webhooks/route.ts` | ~1K |
| SESSION_0035 TASK_01 prisma block | ~0.5K |
| **Total context load** | **~4.5K** |

Compare to: searching baseline index (~8K) + reading 10+ random files (~15K) = ~23K tokens saved.

---

## Score rubric targets (WORKFLOW 5.0)

| Category | How this lane scores |
| --- | --- |
| Dirstarter alignment (2.5) | Extends existing action client + webhook patterns, doesn't replace |
| Data integrity (2.0) | Models follow Prisma conventions, brand-scoped, relations clean |
| Lifecycle coverage (1.5) | Covers purchase→access→expiry→revocation lifecycle |
| Test evidence (2.0) | Smoke script + Stripe CLI trigger |
| Merge/docs readiness (1.0) | plan-vs-current.md updated, SESSION closed |
| Launch usefulness (1.0) | Unblocks paid programs for Baseline launch |

---

## Open decisions: NONE

All 4 open questions resolved in SESSION_0035. See that file for rationale.
