"use server"

import type { Brand } from "~/.generated/prisma/client"
import { canEditOrganization } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { FAMILY_ERROR } from "~/server/web/family/errors"
import {
  type FamilyGroupRecord,
  type FamilyMemberRecord,
  familyGroupPayload,
  familyMemberPayload,
} from "~/server/web/family/payloads"
import {
  addFamilyMemberSchema,
  createFamilyGroupSchema,
  removeFamilyMemberSchema,
} from "~/server/web/family/schemas"
import { writeSchoolOpsAudit } from "~/server/web/school-ops/audit"

const REVALIDATE_FAMILY_PATHS = (organizationId: string, familyGroupId?: string) => [
  `/organizations/${organizationId}/families`,
  ...(familyGroupId ? [`/organizations/${organizationId}/families/${familyGroupId}`] : []),
]

type DbLike = any

const normalizedName = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const resolveOrganization = async ({
  db,
  brand,
  organizationId,
}: {
  db: DbLike
  brand: Brand
  organizationId: string
}) => {
  const organization = await db.organization.findFirst({
    where: { id: organizationId, brand },
    select: { id: true, brand: true },
  })

  if (!organization) {
    throw new Error(FAMILY_ERROR.ORG_NOT_FOUND)
  }

  return organization
}

const assertCanManageOrganization = async ({
  user,
  organizationId,
}: {
  user: Parameters<typeof canEditOrganization>[0]
  organizationId: string
}) => {
  if (!(await canEditOrganization(user, organizationId))) {
    throw new Error(FAMILY_ERROR.NOT_AUTHORIZED)
  }
}

const assertTargetIsActiveMember = async ({
  db,
  brand,
  organizationId,
  userId,
}: {
  db: DbLike
  brand: Brand
  organizationId: string
  userId: string
}) => {
  const membership = await db.membership.findFirst({
    where: {
      brand,
      organizationId,
      userId,
      status: "ACTIVE",
    },
    select: { id: true },
  })

  if (!membership) {
    throw new Error(FAMILY_ERROR.USER_NOT_ELIGIBLE)
  }
}

const assertFamilyGroupVisibleInOrganization = async ({
  db,
  brand,
  organizationId,
  familyGroupId,
}: {
  db: DbLike
  brand: Brand
  organizationId: string
  familyGroupId: string
}) => {
  const familyGroup = await db.familyGroup.findFirst({
    where: {
      id: familyGroupId,
      members: {
        some: {
          user: {
            memberships: {
              some: {
                brand,
                organizationId,
                status: "ACTIVE",
              },
            },
          },
        },
      },
    },
    select: { id: true },
  })

  if (!familyGroup) {
    throw new Error(FAMILY_ERROR.FAMILY_GROUP_NOT_FOUND)
  }
}

const auditFamilyMemberSnapshot = (member: FamilyMemberRecord) => ({
  id: member.id,
  familyGroupId: member.familyGroupId,
  userId: member.userId,
  role: member.role,
  isPrimary: member.isPrimary,
})

export const createFamilyGroup = userActionClient
  .inputSchema(createFamilyGroupSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "family_write")) {
      throw new Error(FAMILY_ERROR.RATE_LIMITED)
    }

    const organization = await resolveOrganization({
      db,
      brand: requestBrand,
      organizationId: parsedInput.organizationId,
    })
    await assertCanManageOrganization({ user, organizationId: organization.id })
    await assertTargetIsActiveMember({
      db,
      brand: requestBrand,
      organizationId: organization.id,
      userId: parsedInput.primaryUserId,
    })

    let familyGroup: FamilyGroupRecord
    try {
      familyGroup = await db.$transaction(async tx => {
        const group = await tx.familyGroup.create({
          data: {
            name: normalizedName(parsedInput.name),
            members: {
              create: {
                userId: parsedInput.primaryUserId,
                role: parsedInput.primaryRole,
                isPrimary: true,
              },
            },
          },
          select: familyGroupPayload,
        })

        return group
      })
    } catch (error) {
      console.error("createFamilyGroup failed", error)
      throw new Error(FAMILY_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: organization.brand,
      userId: user.id,
      organizationId: organization.id,
      entityType: "FamilyGroup",
      entityId: familyGroup.id,
      action: "family_group.created",
      after: {
        id: familyGroup.id,
        name: familyGroup.name,
        primaryUserId: parsedInput.primaryUserId,
      },
    })

    revalidate({ paths: REVALIDATE_FAMILY_PATHS(organization.id, familyGroup.id) })

    return familyGroup
  })

export const addFamilyMember = userActionClient
  .inputSchema(addFamilyMemberSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "family_write")) {
      throw new Error(FAMILY_ERROR.RATE_LIMITED)
    }

    const organization = await resolveOrganization({
      db,
      brand: requestBrand,
      organizationId: parsedInput.organizationId,
    })
    await assertCanManageOrganization({ user, organizationId: organization.id })
    await assertFamilyGroupVisibleInOrganization({
      db,
      brand: requestBrand,
      organizationId: organization.id,
      familyGroupId: parsedInput.familyGroupId,
    })
    await assertTargetIsActiveMember({
      db,
      brand: requestBrand,
      organizationId: organization.id,
      userId: parsedInput.userId,
    })

    let member: FamilyMemberRecord
    try {
      member = await db.$transaction(async tx => {
        if (parsedInput.isPrimary) {
          await tx.familyMember.updateMany({
            where: { familyGroupId: parsedInput.familyGroupId, isPrimary: true },
            data: { isPrimary: false },
          })
        }

        return tx.familyMember.upsert({
          where: {
            familyGroupId_userId: {
              familyGroupId: parsedInput.familyGroupId,
              userId: parsedInput.userId,
            },
          },
          update: {
            role: parsedInput.role,
            isPrimary: parsedInput.isPrimary,
          },
          create: {
            familyGroupId: parsedInput.familyGroupId,
            userId: parsedInput.userId,
            role: parsedInput.role,
            isPrimary: parsedInput.isPrimary,
          },
          select: familyMemberPayload,
        })
      })
    } catch (error) {
      console.error("addFamilyMember failed", error)
      throw new Error(FAMILY_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: organization.brand,
      userId: user.id,
      organizationId: organization.id,
      entityType: "FamilyMember",
      entityId: member.id,
      action: "family_member.added",
      after: auditFamilyMemberSnapshot(member),
    })

    revalidate({ paths: REVALIDATE_FAMILY_PATHS(organization.id, member.familyGroupId) })

    return member
  })

export const removeFamilyMember = userActionClient
  .inputSchema(removeFamilyMemberSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "family_write")) {
      throw new Error(FAMILY_ERROR.RATE_LIMITED)
    }

    const organization = await resolveOrganization({
      db,
      brand: requestBrand,
      organizationId: parsedInput.organizationId,
    })
    await assertCanManageOrganization({ user, organizationId: organization.id })

    const existing = await db.familyMember.findFirst({
      where: {
        id: parsedInput.familyMemberId,
        user: {
          memberships: {
            some: {
              brand: requestBrand,
              organizationId: organization.id,
              status: "ACTIVE",
            },
          },
        },
      },
      select: familyMemberPayload,
    })

    if (!existing) {
      throw new Error(FAMILY_ERROR.FAMILY_MEMBER_NOT_FOUND)
    }

    try {
      await db.familyMember.delete({ where: { id: existing.id } })
    } catch (error) {
      console.error("removeFamilyMember failed", error)
      throw new Error(FAMILY_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: organization.brand,
      userId: user.id,
      organizationId: organization.id,
      entityType: "FamilyMember",
      entityId: existing.id,
      action: "family_member.removed",
      before: auditFamilyMemberSnapshot(existing),
    })

    revalidate({ paths: REVALIDATE_FAMILY_PATHS(organization.id, existing.familyGroupId) })

    return { id: existing.id, familyGroupId: existing.familyGroupId }
  })
