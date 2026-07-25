/**
 * WL-P3-39 (SESSION_0535 FI-028) — coverage for the shared `hasAnyActiveEntitlement` extraction
 * (the active-tier-entitlement `where` dedup). Real Postgres dev DB; fixtures cleaned up after.
 *
 * Run: cd apps/web && bun test server/web/entitlements/active-entitlement.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, describe, expect, it } from "bun:test"
import type { Brand } from "~/.generated/prisma/client"
import { hasAnyActiveEntitlement } from "~/server/web/entitlements/active-entitlement"
import { db } from "~/services/db"

const BRAND: Brand = "BBL"
const OTHER_BRAND: Brand = "BASELINE_MARTIAL_ARTS"
const PREFIX = `wl-p3-39-active-entitlement-${Date.now()}`
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

describe("hasAnyActiveEntitlement", () => {
  it("true — an ACTIVE, unexpired grant whose entitlement.key is one of `keys` and brand matches", async () => {
    const user = await db.user.create({
      data: { name: tag("active-user"), email: `${tag("active-user")}@test.local` },
    })
    const entitlement = await db.entitlement.create({
      data: { brand: BRAND, key: tag("premium"), name: tag("Premium") },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })

    await expect(
      hasAnyActiveEntitlement(user.id, [tag("elite"), tag("premium")], BRAND),
    ).resolves.toBe(true)
  })

  it("false — an EXPIRED grant (endsAt in the past)", async () => {
    const user = await db.user.create({
      data: { name: tag("expired-user"), email: `${tag("expired-user")}@test.local` },
    })
    const entitlement = await db.entitlement.create({
      data: { brand: BRAND, key: tag("expired-key"), name: tag("Expired") },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
        endsAt: new Date(Date.now() - 60_000),
      },
    })

    await expect(hasAnyActiveEntitlement(user.id, [tag("expired-key")], BRAND)).resolves.toBe(
      false,
    )
  })

  it("false — a grant for the WRONG brand", async () => {
    const user = await db.user.create({
      data: { name: tag("wrong-brand-user"), email: `${tag("wrong-brand-user")}@test.local` },
    })
    const entitlement = await db.entitlement.create({
      data: { brand: OTHER_BRAND, key: tag("wrong-brand-key"), name: tag("Wrong Brand") },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })

    await expect(hasAnyActiveEntitlement(user.id, [tag("wrong-brand-key")], BRAND)).resolves.toBe(
      false,
    )
  })

  it("false — an active, unexpired grant whose key is NOT in the requested `keys` set", async () => {
    const user = await db.user.create({
      data: { name: tag("wrong-key-user"), email: `${tag("wrong-key-user")}@test.local` },
    })
    const entitlement = await db.entitlement.create({
      data: { brand: BRAND, key: tag("held-key"), name: tag("Held") },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })

    await expect(
      hasAnyActiveEntitlement(user.id, [tag("some-other-key")], BRAND),
    ).resolves.toBe(false)
  })

  it("false — a REVOKED grant", async () => {
    const user = await db.user.create({
      data: { name: tag("revoked-user"), email: `${tag("revoked-user")}@test.local` },
    })
    const entitlement = await db.entitlement.create({
      data: { brand: BRAND, key: tag("revoked-key"), name: tag("Revoked") },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        status: "REVOKED",
      },
    })

    await expect(hasAnyActiveEntitlement(user.id, [tag("revoked-key")], BRAND)).resolves.toBe(
      false,
    )
  })

  it("true — a null `endsAt` (never expires)", async () => {
    const user = await db.user.create({
      data: { name: tag("lifetime-user"), email: `${tag("lifetime-user")}@test.local` },
    })
    const entitlement = await db.entitlement.create({
      data: { brand: BRAND, key: tag("lifetime-key"), name: tag("Lifetime") },
    })
    await db.userEntitlement.create({
      data: {
        userId: user.id,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
        endsAt: null,
      },
    })

    await expect(hasAnyActiveEntitlement(user.id, [tag("lifetime-key")], BRAND)).resolves.toBe(
      true,
    )
  })
})
