---
title: "ADR 0012 — Tier-Based Entitlement Auto-Grant via Stripe Webhook"
slug: adr-0012-tier-auto-grant
type: decision
status: accepted
created: 2026-05-11
updated: 2026-06-06
last_agent: codex-session-0349
deciders: Brian Scott
pairs_with:
  - docs/sprints/SESSION_0129.md
  - docs/sprints/SESSION_0130.md
  - docs/sprints/SESSION_0349.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0012 — Tier-Based Entitlement Auto-Grant via Stripe Webhook

## Context

Users with premium/elite/legend subscription tiers should automatically receive the `S3_UPLOAD` entitlement (and potentially other tier-gated entitlements in the future). Currently, upload capability is granted via:

1. Manual admin grant (`MANUAL_GRANT` source type)
2. Role-based auto-check (INSTRUCTOR/COACH/OWNER/ORG_ADMIN roles, org ownership)

We need a third path: **subscription-driven auto-grant** that activates when a user subscribes to a qualifying tier and deactivates when they cancel or downgrade.

## Decision

**Use Stripe webhook events to create/revoke `UserEntitlement` rows with `sourceType: SUBSCRIPTION`.**

### Architecture

```
Stripe Event → app/api/stripe/webhooks/route.ts → syncSubscriptionEntitlements()
```

#### Trigger Events

| Stripe Event | Action |
| --- | --- |
| `checkout.session.completed` (subscription mode) | Look up `SubscriptionTier` → query `EntitlementGrant` rows for that tier's `PricingPlan` → create `UserEntitlement` for each granted entitlement with `sourceType: SUBSCRIPTION`, `sourceId: subscription.id` |
| `customer.subscription.updated` | If tier changed (upgrade/downgrade): revoke old tier's entitlements, grant new tier's entitlements |
| `customer.subscription.deleted` | Revoke all `UserEntitlement` rows where `sourceType: SUBSCRIPTION` and `sourceId: subscription.id` |

#### Data Flow

```
PricingPlan (e.g., "Elite Monthly")
  └── EntitlementGrant (join table)
        └── Entitlement (e.g., "S3_UPLOAD")

User subscribes → UserBrandSubscription created
                → EntitlementGrant rows for that plan's tier queried
                → UserEntitlement rows created (sourceType: SUBSCRIPTION, sourceId: stripeSubscriptionId)

User cancels   → UserEntitlement rows with sourceId = stripeSubscriptionId set to REVOKED
```

#### Key Design Rules

1. **`sourceType: SUBSCRIPTION`** — distinguishes auto-granted entitlements from manual admin grants. Revoking a subscription does NOT revoke manual grants.
2. **`sourceId: stripeSubscriptionId`** — ties the entitlement to a specific subscription for clean revocation.
3. **Idempotent** — webhook handler uses upsert pattern (reactivate REVOKED if exists, create if not). Stripe webhook replay is safe.
4. **Cache invalidation** — after granting/revoking, invalidate `user-entitlements-{userId}` cache tag (same tag used by `canUploadMedia`).
5. **`canUploadMedia` is unchanged** — it already checks `UserEntitlement` status, so subscription-granted entitlements are automatically picked up.

### Qualifying Tiers

| Tier Code | Level | Gets S3_UPLOAD |
| --- | --- | --- |
| FREE | 0 | ❌ |
| PREMIUM | 2 | ✅ |
| ELITE | 3 | ✅ |
| LEGEND | 4 | ✅ |

Configuration lives in `EntitlementGrant` join table rows (PricingPlan → Entitlement). Adding a new entitlement to a tier is a DB row insert, not a code change.

SESSION_0349 alignment note: `BASIC` is retired from the product tier ladder. `LEGEND` is the all-features,
free-for-life tier used for recognized lifetime cohorts across brands (for example Dirty Dozen members in BBL or
Grandmasters in WEKAF). Code may recognize `LEGEND` entitlement keys before checkout/webhook/seed migration is fully
expanded; broad Stripe and seed-data migration remains a follow-up.

### Implementation Helper

```typescript
// server/web/billing/subscription-entitlements.ts

async function syncSubscriptionEntitlements(
  userId: string,
  brand: Brand,
  stripeSubscriptionId: string,
  tierCode: string,
) {
  // 1. Find the SubscriptionTier
  const tier = await db.subscriptionTier.findUnique({
    where: { code_brand: { code: tierCode, brand } },
  })
  if (!tier) return

  // 2. Find all EntitlementGrants for PricingPlans at this tier level
  const grants = await db.entitlementGrant.findMany({
    where: {
      pricingPlan: { brand, /* tier linkage */ },
    },
    include: { entitlement: true },
  })

  // 3. For each granted entitlement, upsert UserEntitlement
  for (const grant of grants) {
    const existing = await db.userEntitlement.findFirst({
      where: {
        userId,
        entitlementId: grant.entitlementId,
        sourceType: "SUBSCRIPTION",
        sourceId: stripeSubscriptionId,
      },
    })

    if (existing) {
      await db.userEntitlement.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", endsAt: null },
      })
    } else {
      await db.userEntitlement.create({
        data: {
          userId,
          entitlementId: grant.entitlementId,
          sourceType: "SUBSCRIPTION",
          sourceId: stripeSubscriptionId,
          status: "ACTIVE",
        },
      })
    }
  }

  // 4. Invalidate cache
  revalidateTag(`user-entitlements-${userId}`)
}

async function revokeSubscriptionEntitlements(
  userId: string,
  stripeSubscriptionId: string,
) {
  await db.userEntitlement.updateMany({
    where: {
      userId,
      sourceType: "SUBSCRIPTION",
      sourceId: stripeSubscriptionId,
      status: "ACTIVE",
    },
    data: { status: "REVOKED" },
  })

  revalidateTag(`user-entitlements-${userId}`)
}
```

### Integration Points in Webhook Handler

Add to existing cases in `app/api/stripe/webhooks/route.ts`:

```typescript
case "checkout.session.completed": {
  // ...existing tool/listing logic...

  // NEW: If this is a subscription checkout, sync entitlements
  if (session.mode === "subscription" && session.subscription) {
    await syncSubscriptionEntitlements(userId, brand, subscriptionId, tierCode)
  }
  break
}

case "customer.subscription.deleted": {
  // ...existing downgrade logic...

  // NEW: Revoke subscription-granted entitlements
  await revokeSubscriptionEntitlements(userId, subscriptionId)
  break
}
```

## Alternatives Considered

1. **Polling** — Check subscription status on every `canUploadMedia` call. Rejected: adds latency, doesn't scale, fights the caching strategy.
2. **Eager materialization at login** — Sync entitlements when user logs in. Rejected: misses mid-session subscription changes, doesn't handle cancellation promptly.
3. **Computed view (no UserEntitlement row)** — `canUploadMedia` checks subscription tier directly. Rejected: breaks the single-source pattern where `UserEntitlement` is the authoritative table for all entitlement sources.

## Consequences

- **Pro:** Single `UserEntitlement` table is the source of truth for all entitlement sources (manual, role-based, subscription). `canUploadMedia` needs no changes.
- **Pro:** Adding new tier-gated entitlements is a data operation (insert `EntitlementGrant` row), not a code change.
- **Pro:** Clean revocation path — cancel subscription → revoke only SUBSCRIPTION-sourced entitlements, leaving MANUAL_GRANTs intact.
- **Con:** Requires Stripe subscription + PricingPlan + SubscriptionTier to be fully wired before this works. Implementation blocked until Stripe subscription flow is complete.
- **Con:** `PricingPlan` → `SubscriptionTier` linkage may need a schema addition (foreign key or tier code column on PricingPlan).

## Status

**Accepted.** Implementation deferred until Stripe subscription flow (checkout, plan management, cancellation) is wired in a future sprint.

## Prerequisites for Implementation

1. Stripe products + prices created for subscription tiers
2. `PricingPlan` rows seeded with tier linkage
3. `EntitlementGrant` rows mapping plans → entitlements (e.g., Elite plan → S3_UPLOAD)
4. `UserBrandSubscription` creation wired in checkout webhook
5. This ADR's `syncSubscriptionEntitlements` + `revokeSubscriptionEntitlements` functions
