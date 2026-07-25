import type { Brand, Prisma } from "~/.generated/prisma/client"
import { db as appDb } from "~/services/db"

type AppDb = typeof appDb

/**
 * WL-P3-39 dedup (SESSION_0535 FI-028): the "does {userId} hold an ACTIVE, unexpired grant whose
 * `entitlement.brand` matches and `entitlement.key` is one of `keys`" predicate existed as 3
 * near-identical inline `where` clauses (`community/permissions.ts`, `entitlements/lineage-tier-
 * policy.ts`, `entitlements/queries.ts`). This module is the ONE place that shape lives.
 *
 * Two builders, not one, because the call sites differ in a way that is NOT safe to collapse: two
 * are single-user existence checks (`findFirst`), one is a multi-user batch lookup (`findMany`,
 * `userId: { in: [...] }`) that needs the actual matched `entitlement.key` per user, not a boolean.
 * `activeEntitlementWhereForUsers` exists so the batch call site still shares the predicate instead
 * of re-typing it a 3rd time.
 */
function activeEntitlementWhere({
  keys,
  brand,
  now,
}: {
  keys: readonly string[]
  brand: Brand
  now: Date
}): Pick<Prisma.UserEntitlementWhereInput, "status" | "entitlement" | "OR"> {
  return {
    status: "ACTIVE",
    entitlement: { brand, key: { in: [...keys] } },
    OR: [{ endsAt: null }, { endsAt: { gt: now } }],
  }
}

/** Single-user variant — `userId` equality. Used by `hasAnyActiveEntitlement` below. */
export function activeEntitlementWhereForUser({
  userId,
  keys,
  brand,
  now,
}: {
  userId: string
  keys: readonly string[]
  brand: Brand
  now: Date
}): Prisma.UserEntitlementWhereInput {
  return { userId, ...activeEntitlementWhere({ keys, brand, now }) }
}

/** Multi-user variant — `userId: { in: [...] } }`. Used by the lineage-tier-policy batch lookup. */
export function activeEntitlementWhereForUsers({
  userIds,
  keys,
  brand,
  now,
}: {
  userIds: readonly string[]
  keys: readonly string[]
  brand: Brand
  now: Date
}): Prisma.UserEntitlementWhereInput {
  return { userId: { in: [...userIds] }, ...activeEntitlementWhere({ keys, brand, now }) }
}

/**
 * Does `userId` hold ANY active, unexpired entitlement grant matching `brand` and one of `keys`?
 * The single-user boolean check — the extraction the WL-P3-39 fix line named. `database` is
 * injectable (default global client) so callers can thread a fake/transaction for hermetic tests.
 */
export async function hasAnyActiveEntitlement(
  userId: string,
  keys: readonly string[],
  brand: Brand,
  database: AppDb = appDb,
  now: Date = new Date(),
): Promise<boolean> {
  const grant = await database.userEntitlement.findFirst({
    where: activeEntitlementWhereForUser({ userId, keys, brand, now }),
    select: { id: true },
  })
  return Boolean(grant)
}
