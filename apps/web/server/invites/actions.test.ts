/**
 * SESSION_0346 TASK_02 — invite acceptance materializes server-derived comps.
 *
 * Run: cd apps/web && bun test server/invites/actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { createInvite } from "~/server/admin/invites/actions"
import { claimInvite } from "~/server/invites/actions"
import type { UserRole } from "~/.generated/prisma/client"
import { db } from "~/services/db"

// Single-brand collapse (brand-prune Stage 1): the action scopes by the
// server-resolved Brand.BBL, so seed the entitlement/membership rows under BBL too.
const TEST_BRAND = "BBL" as const
const PREFIX = `session-0346-invite-comp-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

const createdUserIds: string[] = []
const createdOrgIds: string[] = []
const createdDisciplineIds: string[] = []
const createdInviteIds: string[] = []
const createdEntitlementIds: string[] = []

async function ensureEntitlement(key: string, name: string) {
  const existing = await db.entitlement.findUnique({
    where: { brand_key: { brand: TEST_BRAND, key } },
  })
  if (existing) return existing

  const entitlement = await db.entitlement.create({
    data: { brand: TEST_BRAND, key, name },
  })
  createdEntitlementIds.push(entitlement.id)
  return entitlement
}

async function createUser(name: string, role: UserRole = "user") {
  const user = await db.user.create({
    data: {
      id: tag(name),
      name: tag(name),
      email: `${tag(name)}@test.local`,
      role,
    },
  })
  createdUserIds.push(user.id)
  return user
}

async function createOrgAndDiscipline(name: string) {
  const org = await db.organization.create({
    data: {
      id: tag(`${name}-org`),
      brand: TEST_BRAND,
      type: "DOJO",
      name: tag(`${name}-org`),
      slug: tag(`${name}-org`),
    },
  })
  createdOrgIds.push(org.id)

  const discipline = await db.discipline.create({
    data: {
      id: tag(`${name}-discipline`),
      brand: TEST_BRAND,
      name: tag(`${name}-discipline`),
      slug: tag(`${name}-discipline`),
    },
  })
  createdDisciplineIds.push(discipline.id)

  return { org, discipline }
}

async function createStoredInvite({
  name,
  createdById,
  organizationId,
  comp,
}: {
  name: string
  createdById: string
  organizationId: string
  comp?: { tier: string; termDays?: number }
}) {
  const invite = await db.invite.create({
    data: {
      id: tag(`${name}-invite`),
      brand: TEST_BRAND,
      type: "ORGANIZATION",
      organizationId,
      createdById,
      meta: comp ? { comp } : undefined,
    },
  })
  createdInviteIds.push(invite.id)
  return invite
}

beforeAll(async () => {
  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium")
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite")
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [{ userId: { in: createdUserIds } }, { entityId: { contains: PREFIX } }],
    },
  })
  await db.userEntitlement.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.inviteClaim.deleteMany({ where: { inviteId: { in: createdInviteIds } } })
  await db.membership.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.invite.deleteMany({ where: { id: { in: createdInviteIds } } })
  await db.organization.deleteMany({ where: { id: { in: createdOrgIds } } })
  await db.discipline.deleteMany({ where: { id: { in: createdDisciplineIds } } })
  await db.session.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.user.deleteMany({ where: { id: { in: createdUserIds } } })

  for (const entitlementId of createdEntitlementIds) {
    await db.entitlement.delete({ where: { id: entitlementId } })
  }
})

describe("claimInvite comp grants", () => {
  it("admin invite issuance writes validated meta.comp", async () => {
    const admin = await createUser("issue-admin", "admin")
    const { org } = await createOrgAndDiscipline("issue")

    setTestSession({ id: admin.id, role: "admin" })
    const result = await createInvite({
      organizationId: org.id,
      type: "ORGANIZATION",
      maxUses: null,
      expiresAt: null,
      meta: null,
      compTier: LINEAGE_ELITE_ENTITLEMENT_KEY,
      compTermDays: 365,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.id).toBeTruthy()
    if (result?.data?.id) createdInviteIds.push(result.data.id)

    const invite = await db.invite.findUnique({ where: { id: result?.data?.id ?? "" } })
    expect(invite?.meta).toMatchObject({
      comp: { tier: LINEAGE_ELITE_ENTITLEMENT_KEY, termDays: 365 },
    })
  })

  it("accepting an invite with meta.comp grants comp entitlements in the same trusted flow", async () => {
    const admin = await createUser("accept-admin", "admin")
    const grantee = await createUser("accept-grantee")
    const { org, discipline } = await createOrgAndDiscipline("accept")
    const invite = await createStoredInvite({
      name: "accept",
      createdById: admin.id,
      organizationId: org.id,
      comp: { tier: LINEAGE_ELITE_ENTITLEMENT_KEY, termDays: 30 },
    })

    setTestSession({ id: grantee.id, role: "user" })
    const result = await claimInvite({ code: invite.code, disciplineId: discipline.id })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.membership.userId).toBe(grantee.id)
    expect(result?.data?.membership.brand).toBe(TEST_BRAND)
    expect(result?.data?.compGrantIds).toHaveLength(2)

    const [grants, audits] = await Promise.all([
      db.userEntitlement.findMany({
        where: {
          userId: grantee.id,
          sourceType: "MANUAL_GRANT",
          sourceId: `grant:${admin.id}:invite-${invite.id}`,
          status: "ACTIVE",
        },
        include: { entitlement: { select: { key: true } } },
      }),
      db.auditLog.findMany({
        where: {
          brand: TEST_BRAND,
          action: "entitlement.comp.granted",
          userId: admin.id,
          entityId: { contains: grantee.id },
        },
      }),
    ])

    expect(grants).toHaveLength(2)
    expect(grants.map(grant => grant.entitlement.key).sort()).toEqual([
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])
    for (const grant of grants) {
      expect(grant.endsAt).toBeInstanceOf(Date)
    }
    expect(audits).toHaveLength(2)
  })

  it("accepting an invite without meta.comp creates membership without entitlement grants", async () => {
    const admin = await createUser("absent-admin", "admin")
    const grantee = await createUser("absent-grantee")
    const { org, discipline } = await createOrgAndDiscipline("absent")
    const invite = await createStoredInvite({
      name: "absent",
      createdById: admin.id,
      organizationId: org.id,
    })

    setTestSession({ id: grantee.id, role: "user" })
    const result = await claimInvite({ code: invite.code, disciplineId: discipline.id })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.compGrantIds).toEqual([])

    const grantCount = await db.userEntitlement.count({ where: { userId: grantee.id } })
    expect(grantCount).toBe(0)
  })

  it("ignores client-supplied comp payload and cannot elevate beyond invite.meta.comp", async () => {
    const admin = await createUser("inject-admin", "admin")
    const grantee = await createUser("inject-grantee")
    const { org, discipline } = await createOrgAndDiscipline("inject")
    const invite = await createStoredInvite({
      name: "inject",
      createdById: admin.id,
      organizationId: org.id,
      comp: { tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY },
    })

    setTestSession({ id: grantee.id, role: "user" })
    const result = await claimInvite({
      code: invite.code,
      disciplineId: discipline.id,
      comp: { tier: LINEAGE_ELITE_ENTITLEMENT_KEY, termDays: 3650 },
    } as never)

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.compGrantIds).toHaveLength(1)

    const grants = await db.userEntitlement.findMany({
      where: { userId: grantee.id, sourceType: "MANUAL_GRANT", status: "ACTIVE" },
      include: { entitlement: { select: { key: true } } },
    })

    expect(grants).toHaveLength(1)
    expect(grants[0]?.entitlement.key).toBe(LINEAGE_PREMIUM_ENTITLEMENT_KEY)
  })
})
