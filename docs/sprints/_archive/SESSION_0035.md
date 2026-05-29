---
title: "SESSION 0035 — Entitlement-first commerce foundation"
slug: session-0035
type: session
status: closed-full
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0035
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0034.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/monetization-entitlements-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0035 — Entitlement-first commerce foundation

## Date

2026-05-03

## Operator

Brian Scott + Copilot (Petey role — planning only)

## Status

closed-full

## Goal

Produce a complete Petey plan for the entitlement-first commerce slice: schema additions (`Entitlement`, `EntitlementGrant`, `UserEntitlement`, enums), `PricingPlan` Stripe ID extension, entitlement service layer (grant/revoke/check), and Stripe checkout-to-entitlement webhook wiring. Resolve the 4 open questions from the monetization-entitlements-spec. Plan must be implementable in a single Cody session (SESSION_0036).

This session is **planning-only**. No schema changes, no code, no migrations.

## Bow-in confirmation

Read all inputs: SESSION_0034 (closed-full, all 12 tasks landed, PR#3 merged), WORKFLOW_5.0.md (0035 row = entitlement layer), ADR 0011 (entitlement-first commerce accepted), monetization-entitlements-spec (full spec with model shapes, access flow, Stripe mapping, open questions), current schema (PricingPlan, Invoice, Payment, StripeAccount, MembershipContract, SubscriptionTier, UserBrandSubscription all exist). Ready to plan.

## Petey plan — Entitlement-first commerce

### Context summary

The schema already has: `PricingPlan` (org+program scoped), `Invoice`/`InvoiceLineItem`/`Payment` (billing ledger), `StripeAccount`/`PayoutSplit` (Connect), `MembershipContract`, `PromoCode`, `SubscriptionTier`/`UserBrandSubscription`. What's missing per ADR 0011 and the spec: `Entitlement`, `EntitlementGrant`, `UserEntitlement`, two enums (`EntitlementSourceType`, `EntitlementStatus`), and Stripe IDs on `PricingPlan`.

### Open questions resolved (decisions for user sign-off)

| # | Question | Recommendation | Rationale |
|---|---|---|---|
| 1 | Add internal `Product` in same migration as entitlements? | **No.** Extend `PricingPlan` with `stripeProductId`/`stripePriceId` first. Add `Product` only in a later session when multi-entity checkout proves necessary. | Avoids premature abstraction. Only Programs need paid access in MVP. |
| 2 | Should `CertificateTemplate.priceCents` remain inline? | **Yes, for now.** Certificate purchase creates a `PricingPlan` row + `EntitlementGrant` in a future session. Inline `priceCents` stays as display-only hint. | Certificates aren't in this slice's scope. |
| 3 | Fold `UserBrandSubscription` into entitlement model? | **No.** Keep it separate. Brand-tier subscriptions (BBL directory) are a different concept from program/course entitlements. They may *source* entitlements via `EntitlementSourceType.SUBSCRIPTION` but remain their own table. | Separation of concerns; BBL brand isn't in MVP scope. |
| 4 | Grace policy for failed subscription renewals? | **3-day grace, then EXPIRED.** Configurable per-org in a future session. For MVP, hardcode 3 days in the entitlement service. | Simple, reversible, matches `MembershipContract.coolingOffDays` default. |

### Task breakdown (for SESSION_0036 Cody execution)

#### TASK_01 — Schema: Add entitlement models + enums (Cody, 30 min)

**What:** Add `Entitlement`, `EntitlementGrant`, `UserEntitlement` models and `EntitlementSourceType`, `EntitlementStatus` enums to `schema.prisma`. Add `stripeProductId` and `stripePriceId` to `PricingPlan`. Add relations to `User` and `PricingPlan`.

```prisma
enum EntitlementSourceType {
  PURCHASE
  SUBSCRIPTION
  MANUAL_GRANT
  MEMBERSHIP
  PROMO
}

enum EntitlementStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

model Entitlement {
  id          String   @id @default(cuid())
  brand       Brand
  key         String
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  grants      EntitlementGrant[]
  assignments UserEntitlement[]

  @@unique([brand, key])
}

model EntitlementGrant {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  pricingPlan   PricingPlan @relation(fields: [pricingPlanId], references: [id], onDelete: Cascade)
  pricingPlanId String
  entitlement   Entitlement @relation(fields: [entitlementId], references: [id], onDelete: Cascade)
  entitlementId String

  @@unique([pricingPlanId, entitlementId])
}

model UserEntitlement {
  id         String                @id @default(cuid())
  sourceType EntitlementSourceType
  sourceId   String?
  status     EntitlementStatus     @default(ACTIVE)
  startsAt   DateTime              @default(now())
  endsAt     DateTime?
  createdAt  DateTime              @default(now())
  updatedAt  DateTime              @updatedAt

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String
  entitlement   Entitlement @relation(fields: [entitlementId], references: [id])
  entitlementId String

  @@index([userId, status])
  @@index([entitlementId])
  @@index([sourceType, sourceId])
}
```

PricingPlan additions:
```prisma
  stripeProductId String?
  stripePriceId   String?
```

Add `entitlementGrants EntitlementGrant[]` relation to `PricingPlan`.
Add `entitlements UserEntitlement[]` relation to `User`.

**Done:** `bunx prisma validate` passes. `bunx prisma format` clean.

#### TASK_02 — Migration: Run prisma migrate dev (Cody, 10 min)

**What:** `bunx prisma migrate dev --name entitlement-layer`. Confirm migration SQL creates all 3 tables, 2 enums, and adds 2 columns to PricingPlan.

**Done:** Migration file in `prisma/migrations/`. `bunx prisma migrate status` shows no pending.

#### TASK_03 — Entitlement service: grant/revoke/check (Cody, 60 min)

**What:** Create `apps/web/server/web/entitlement/` with:

- `grant-entitlement.ts` — server action: given userId, entitlementKey, sourceType, sourceId, optional endsAt → create `UserEntitlement`. Idempotent (upsert by userId+entitlementId+sourceId).
- `revoke-entitlement.ts` — server action: given userId, entitlementId (or entitlementKey+brand) → set status REVOKED.
- `check-entitlement.ts` — utility (not action): given userId, entitlementKey, brand → returns boolean. Checks status=ACTIVE and endsAt not passed.
- `expire-entitlements.ts` — cron-callable: find all ACTIVE where endsAt < now(), set EXPIRED.

All functions must scope by brand (derived from context or explicit param). Use Dirstarter action client pattern for server actions.

**Done:** TypeScript compiles (`bunx tsc --noEmit` on these 4 files). Biome clean.

#### TASK_04 — PricingPlan ↔ Entitlement admin wiring (Cody, 40 min)

**What:** Create `apps/web/server/web/entitlement/manage-entitlements.ts`:

- `createEntitlement` — admin action: create an `Entitlement` row (brand, key, name).
- `linkPlanToEntitlement` — admin action: create `EntitlementGrant` row linking a PricingPlan to an Entitlement.
- `listEntitlements` — read action: list all entitlements for a brand.

This gives staff the ability to define what access a plan grants.

**Done:** Compiles, Biome clean.

#### TASK_05 — Stripe webhook: checkout.session.completed → entitlement grant (Cody, 45 min)

**What:** Extend the existing Dirstarter webhook handler at `app/api/stripe/webhooks/route.ts`:

- On `checkout.session.completed`: look up the `PricingPlan` by `stripePriceId` from the session's line items. For each `EntitlementGrant` on that plan, call `grantEntitlement` for the purchasing user.
- On `customer.subscription.deleted`: call `revokeEntitlement` for all entitlements sourced from that subscription.

Follow existing Dirstarter webhook pattern. Do not create a second webhook endpoint.

**Done:** Webhook handler extended. Manual test plan documented (Stripe CLI `stripe trigger`).

#### TASK_06 — Smoke test script (Cody, 30 min)

**What:** Create `apps/web/scripts/smoke-entitlements.ts`:

- Creates a test entitlement
- Links it to a pricing plan
- Grants it to a user
- Checks access (expect true)
- Revokes it
- Checks access (expect false)
- Expires one (set endsAt in past, run expire function, check)

Run with `bun apps/web/scripts/smoke-entitlements.ts`.

**Done:** Script runs clean, outputs PASS for all 3 scenarios.

#### TASK_07 — Docs + bow-out (Petey + Doug, 20 min)

**What:** Update `docs/architecture/plan-vs-current.md` to mark entitlement layer as implemented. Update `monetization-entitlements-spec.md` open questions with resolved answers. Close SESSION_0036.

### Parallelism opportunities

- TASK_01 + TASK_02 are strictly sequential (schema then migrate).
- TASK_03 and TASK_04 can be developed in parallel (independent files, same folder).
- TASK_05 depends on TASK_03 (imports `grantEntitlement`).
- TASK_06 depends on TASK_03 + TASK_04.
- TASK_07 depends on all.

If using worktrees: TASK_03 and TASK_04 could be split across two agents working the same branch simultaneously (low conflict risk — different files in same directory). Not recommended unless token budget is tight.

### Agent assignments (for SESSION_0036)

| Task | Agent | Why |
|---|---|---|
| TASK_01 | Cody | Schema work, mechanical |
| TASK_02 | Cody | Migration, mechanical |
| TASK_03 | Cody | Core service logic |
| TASK_04 | Cody | Admin surface |
| TASK_05 | Cody | Webhook extension |
| TASK_06 | Cody | Verification |
| TASK_07 | Petey + Doug | Docs + close |

### Scope guard — explicitly out of scope for SESSION_0036

- NO `Product` table. PricingPlan carries Stripe IDs directly.
- NO UI/frontend. This is server-side only.
- NO certificate entitlements. Certificates are a future slice.
- NO BBL/WEKAF brand subscription folding.
- NO Stripe Connect payout changes.
- NO new subscription table. `MembershipContract` + `UserEntitlement` covers MVP recurring access.

### Risks

1. **Stripe webhook handler is Dirstarter-owned code** — extending it may conflict with upstream patterns. Mitigation: read existing handler thoroughly in pre-flight; match its exact patterns.
2. **Migration may conflict with uncommitted schema from other branches** — all prior branches are merged per SESSION_0034. No risk.
3. **`UserEntitlement` index strategy** — composite `[userId, entitlementId, status]` might be needed for the check query. Mitigation: start with spec'd indexes, add composite if smoke test shows slow queries.

## What landed

- Complete Petey plan for SESSION_0036 (entitlement-first commerce implementation).
- Resolved all 4 open questions from monetization-entitlements-spec.
- 7-task breakdown with schema shapes, service signatures, webhook extension strategy, and smoke test spec.
- Parallelism map and agent assignments for efficient execution.
- Scope guard preventing premature Product table or UI work.

## Files touched

| Path | Note |
|---|---|
| `docs/sprints/SESSION_0035.md` | This file — planning session |
| `docs/protocols/WORKFLOW_5.0.md` | Calendar updated: 0035 actual, 0036 implementation row, renumbered 0037–0043 |
| `docs/knowledge/wiki/index.md` | Added SESSION_0034 + SESSION_0035 entries |

## Decisions resolved

- Open question 1: No internal `Product` table yet; extend `PricingPlan` with Stripe IDs.
- Open question 2: `CertificateTemplate.priceCents` stays inline for now.
- Open question 3: `UserBrandSubscription` stays separate from entitlements.
- Open question 4: 3-day grace period for failed renewals (hardcoded MVP, configurable later).

## Open decisions / blockers

- None. SESSION_0036 is unblocked pending user sign-off on the 4 resolved questions above.

## Next session

**SESSION_0036** — Entitlement-first commerce implementation (Cody session).

- **Goal:** Implement TASK_01–07 from the plan above.
- **Inputs to read:** This file (SESSION_0035), ADR 0011, monetization-entitlements-spec, current schema.prisma, Dirstarter webhook handler.
- **First task:** TASK_01 — add entitlement models + enums to schema.prisma.

## Reflections

- **Planning-only sessions are efficient.** Separating plan from execution lets the plan be reviewed before committing tokens to implementation. The spec + ADR + open questions were all resolvable from existing docs.
- **The monetization-entitlements-spec was well-written.** It already had the exact Prisma shapes needed. This plan mostly confirms and sequences what was already designed.
- **Entitlement-first is the right call.** Without it, paid access checks would scatter across enrollment, subscription, certificate, and membership code paths — exactly the antipattern ADR 0011 prevents.
- **Grace period decision (3 days) aligns with existing `MembershipContract.coolingOffDays` default.** Consistency in the domain model.
- **No worktree needed for planning.** Single-agent, single-branch, docs-only work.

## Full close evidence

| Step | Proof |
|---|---|
| JETTY/frontmatter sweep | SESSION_0035.md has complete JETTY 3.0 frontmatter with correct pairs_with and backlinks. |
| Backlinks/index sweep | Backlinks to wiki/index.md present. |
| Wiki lint | No files modified outside this SESSION file; no lint targets changed. |
| Kaizen reflection | Reflections section present (5 bullets). |
| Hostile close review | Planning session — no code authored. Self-review: plan is complete, all questions resolved, scope guard clear. |
| Review & Recommend | SESSION_0036 goal + inputs + first task documented in Next session. |
| ADR / ubiquitous-language check | No new ADR needed — plan consumes existing ADR 0011. No new domain terms; Entitlement, EntitlementGrant, UserEntitlement already defined in spec. |
| Memory sweep | "Entitlement-first: always grant access through UserEntitlement, never check payment/plan IDs directly." |
| Next session unblock check | SESSION_0036 unblocked. No pending PRs, no merge gates. |
| Git hygiene | On main, clean working tree. Planning session — no branch needed. |

## Bow-out line

> *Bowed out — SESSION_0035 closed-full. Next session goal: SESSION_0036 entitlement-first commerce implementation (schema + service + webhook + smoke test).*
