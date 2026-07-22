/**
 * WL-P3-33 — isolated `hasEntitlement` coverage.
 *
 * The tournament registration path covers this transitively; these tests call
 * the cached query directly and pin the grant/status/expiry/brand behavior.
 *
 * Run: cd apps/web && bun test server/web/entitlements/queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
}))

import type { Brand } from "~/.generated/prisma/client"
import { hasEntitlement } from "~/server/web/entitlements/queries"
import { db } from "~/services/db"

const BRAND: Brand = "BASELINE_MARTIAL_ARTS"
const OTHER_BRAND: Brand = "BBL"
const TS = Date.now()
const PREFIX = `wl-p3-33-entitlement-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

afterAll(async () => {
  await db.userEntitlement.deleteMany({
    where: {
      OR: [
        { user: { email: { startsWith: PREFIX } } },
        { entitlement: { key: { startsWith: PREFIX } } },
      ],
    },
  })
  await db.entitlement.deleteMany({ where: { key: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { email: { startsWith: PREFIX } } })
})

describe("hasEntitlement", () => {
  it("returns true only for an active unexpired grant matching user, key, and brand", async () => {
    const [user, otherUser] = await Promise.all([
      db.user.create({
        data: { name: tag("user"), email: `${tag("user")}@test.local` },
      }),
      db.user.create({
        data: { name: tag("other-user"), email: `${tag("other-user")}@test.local` },
      }),
    ])
    const [matchingEntitlement, otherBrandEntitlement] = await Promise.all([
      db.entitlement.create({
        data: {
          brand: BRAND,
          key: tag("feature"),
          name: tag("Feature"),
        },
      }),
      db.entitlement.create({
        data: {
          brand: OTHER_BRAND,
          key: tag("feature"),
          name: tag("Feature Other Brand"),
        },
      }),
    ])

    await Promise.all([
      db.userEntitlement.create({
        data: {
          userId: user.id,
          entitlementId: matchingEntitlement.id,
          sourceType: "MANUAL_GRANT",
          status: "ACTIVE",
        },
      }),
      db.userEntitlement.create({
        data: {
          userId: user.id,
          entitlementId: otherBrandEntitlement.id,
          sourceType: "MANUAL_GRANT",
          status: "ACTIVE",
        },
      }),
      db.userEntitlement.create({
        data: {
          userId: otherUser.id,
          entitlementId: matchingEntitlement.id,
          sourceType: "MANUAL_GRANT",
          status: "ACTIVE",
        },
      }),
    ])

    await expect(hasEntitlement(user.id, matchingEntitlement.key, BRAND)).resolves.toBe(true)
    await expect(hasEntitlement(user.id, matchingEntitlement.key, OTHER_BRAND)).resolves.toBe(true)
    await expect(hasEntitlement(otherUser.id, matchingEntitlement.key, BRAND)).resolves.toBe(true)
    await expect(hasEntitlement(otherUser.id, matchingEntitlement.key, OTHER_BRAND)).resolves.toBe(
      false,
    )
    await expect(hasEntitlement(user.id, tag("missing-feature"), BRAND)).resolves.toBe(false)
  })

  it("ignores revoked and expired grants", async () => {
    const user = await db.user.create({
      data: { name: tag("inactive-user"), email: `${tag("inactive-user")}@test.local` },
    })
    const [revokedEntitlement, expiredEntitlement] = await Promise.all([
      db.entitlement.create({
        data: { brand: BRAND, key: tag("revoked"), name: tag("Revoked") },
      }),
      db.entitlement.create({
        data: { brand: BRAND, key: tag("expired"), name: tag("Expired") },
      }),
    ])

    await Promise.all([
      db.userEntitlement.create({
        data: {
          userId: user.id,
          entitlementId: revokedEntitlement.id,
          sourceType: "MANUAL_GRANT",
          status: "REVOKED",
        },
      }),
      db.userEntitlement.create({
        data: {
          userId: user.id,
          entitlementId: expiredEntitlement.id,
          sourceType: "MANUAL_GRANT",
          status: "ACTIVE",
          endsAt: new Date(Date.now() - 60_000),
        },
      }),
    ])

    await expect(hasEntitlement(user.id, revokedEntitlement.key, BRAND)).resolves.toBe(false)
    await expect(hasEntitlement(user.id, expiredEntitlement.key, BRAND)).resolves.toBe(false)
  })
})
