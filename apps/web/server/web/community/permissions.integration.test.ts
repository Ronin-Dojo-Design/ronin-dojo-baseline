/**
 * WL-P3-40 - DB-backed proof for the community-post CREATE gate.
 *
 * The sibling permissions.test.ts file pins the gate shape with an injected mock DB. This file keeps
 * one real-Prisma regression case so the actual `where` filters deny invalid tier grants.
 *
 * Run: cd apps/web && bun test server/web/community/permissions.integration.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import type { Brand } from "~/.generated/prisma/client"
import { LINEAGE_PREMIUM_ENTITLEMENT_KEY } from "~/lib/entitlements/lineage-comp"
import { db } from "~/services/db"
import { canCreateCommunityPostForUser } from "./permissions"

const TEST_BRAND = "BBL" as Brand
const PREFIX = `wl-p3-40-community-permissions-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

let entitlementId: string
let createdEntitlementId: string | null = null

describe("canCreateCommunityPostForUser - real DB", () => {
  beforeAll(async () => {
    const existingEntitlement = await db.entitlement.findUnique({
      where: {
        brand_key: {
          brand: TEST_BRAND,
          key: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
        },
      },
      select: { id: true },
    })

    if (existingEntitlement) {
      entitlementId = existingEntitlement.id
      return
    }

    const entitlement = await db.entitlement.create({
      data: {
        id: tag("premium-entitlement"),
        brand: TEST_BRAND,
        key: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
        name: "WL-P3-40 Lineage Premium",
      },
      select: { id: true },
    })
    entitlementId = entitlement.id
    createdEntitlementId = entitlement.id
  })

  afterAll(async () => {
    await db.userEntitlement.deleteMany({
      where: { OR: [{ id: { startsWith: PREFIX } }, { sourceId: { startsWith: PREFIX } }] },
    })
    await db.session.deleteMany({ where: { userId: { startsWith: PREFIX } } })
    await db.account.deleteMany({ where: { userId: { startsWith: PREFIX } } })
    await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })

    if (createdEntitlementId) {
      await db.entitlement.delete({ where: { id: createdEntitlementId } })
    }
  })

  it("denies a free-tier user whose only real tier grants are expired or non-active", async () => {
    const user = await db.user.create({
      data: {
        id: tag("free-user"),
        name: tag("free-user"),
        email: `${tag("free-user")}@test.local`,
      },
      select: { id: true },
    })

    await db.userEntitlement.createMany({
      data: [
        {
          id: tag("active-expired-grant"),
          userId: user.id,
          entitlementId,
          sourceType: "MANUAL_GRANT",
          sourceId: tag("active-expired-grant"),
          status: "ACTIVE",
          startsAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: new Date("2026-01-02T00:00:00.000Z"),
        },
        {
          id: tag("revoked-current-grant"),
          userId: user.id,
          entitlementId,
          sourceType: "MANUAL_GRANT",
          sourceId: tag("revoked-current-grant"),
          status: "REVOKED",
          startsAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: new Date("2027-01-01T00:00:00.000Z"),
        },
      ],
    })

    const seededGrantCount = await db.userEntitlement.count({ where: { userId: user.id } })
    expect(seededGrantCount).toBe(2)

    const allowed = await canCreateCommunityPostForUser(
      { id: user.id, role: "user" } as never,
      TEST_BRAND,
    )

    expect(allowed).toBe(false)
  })
})
