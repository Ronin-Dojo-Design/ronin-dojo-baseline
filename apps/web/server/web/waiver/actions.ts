"use server"

import type { Brand } from "~/.generated/prisma/client"
import { canEditOrganization } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { writeSchoolOpsAudit } from "~/server/web/school-ops/audit"
import { WAIVER_ERROR } from "~/server/web/waiver/errors"
import {
  type WaiverSignatureRecord,
  waiverPayload,
  waiverSignaturePayload,
} from "~/server/web/waiver/payloads"
import { revokeWaiverSignatureSchema, signWaiverSchema } from "~/server/web/waiver/schemas"

const REVALIDATE_WAIVER_PATHS = (organizationId: string, waiverId?: string) => [
  `/organizations/${organizationId}/waivers`,
  ...(waiverId ? [`/organizations/${organizationId}/waivers/${waiverId}`] : []),
]

type DbLike = any

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
    throw new Error(WAIVER_ERROR.ORG_NOT_FOUND)
  }

  return organization
}

const assertActiveMemberWithPassport = async ({
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
  const target = await db.user.findFirst({
    where: {
      id: userId,
      memberships: {
        some: {
          brand,
          organizationId,
          status: "ACTIVE",
        },
      },
    },
    select: {
      id: true,
      passport: { select: { dob: true } },
    },
  })

  if (!target) {
    throw new Error(WAIVER_ERROR.USER_NOT_ELIGIBLE)
  }

  return target
}

const isMinorDob = (dob: Date | null | undefined, now = new Date()) => {
  if (!dob) return false
  const eighteenthBirthday = new Date(dob)
  eighteenthBirthday.setUTCFullYear(eighteenthBirthday.getUTCFullYear() + 18)
  return eighteenthBirthday.getTime() > now.getTime()
}

const assertGuardianAuthority = async ({
  db,
  guardianUserId,
  targetUserId,
}: {
  db: DbLike
  guardianUserId: string
  targetUserId: string
}) => {
  const familyGroup = await db.familyGroup.findFirst({
    where: {
      members: {
        some: {
          userId: guardianUserId,
          role: "GUARDIAN",
        },
      },
      AND: {
        members: {
          some: {
            userId: targetUserId,
          },
        },
      },
    },
    select: { id: true },
  })

  if (!familyGroup) {
    throw new Error(WAIVER_ERROR.GUARDIAN_NOT_AUTHORIZED)
  }
}

const resolveWaiver = async ({
  db,
  brand,
  organizationId,
  waiverId,
  programId,
}: {
  db: DbLike
  brand: Brand
  organizationId: string
  waiverId: string
  programId?: string
}) => {
  const waiver = await db.waiver.findFirst({
    where: {
      id: waiverId,
      isActive: true,
      AND: [
        { OR: [{ brand }, { brand: null }] },
        { OR: [{ organizationId }, { organizationId: null }] },
      ],
      ...(programId
        ? {
            programs: {
              some: {
                programId,
                program: {
                  brand,
                  organizationId,
                },
              },
            },
          }
        : {}),
    },
    select: waiverPayload,
  })

  if (!waiver) {
    throw new Error(WAIVER_ERROR.WAIVER_NOT_FOUND)
  }

  return waiver
}

const auditSignatureSnapshot = (signature: WaiverSignatureRecord) => ({
  id: signature.id,
  waiverId: signature.waiverId,
  userId: signature.userId,
  signedOnBehalfId: signature.signedOnBehalfId,
  signedAt: signature.signedAt,
})

export const signWaiver = userActionClient
  .inputSchema(signWaiverSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "waiver_write")) {
      throw new Error(WAIVER_ERROR.RATE_LIMITED)
    }

    const organization = await resolveOrganization({
      db,
      brand: requestBrand,
      organizationId: parsedInput.organizationId,
    })
    const waiver = await resolveWaiver({
      db,
      brand: requestBrand,
      organizationId: organization.id,
      waiverId: parsedInput.waiverId,
      programId: parsedInput.programId,
    })

    await assertActiveMemberWithPassport({
      db,
      brand: requestBrand,
      organizationId: organization.id,
      userId: user.id,
    })

    const signedOnBehalfId = parsedInput.signedOnBehalfId
    if (signedOnBehalfId) {
      const target = await assertActiveMemberWithPassport({
        db,
        brand: requestBrand,
        organizationId: organization.id,
        userId: signedOnBehalfId,
      })
      if (!isMinorDob(target.passport?.dob)) {
        throw new Error(WAIVER_ERROR.TARGET_NOT_MINOR)
      }
      await assertGuardianAuthority({
        db,
        guardianUserId: user.id,
        targetUserId: signedOnBehalfId,
      })
    }

    let signature: WaiverSignatureRecord
    try {
      signature = await db.waiverSignature.upsert({
        where: {
          waiverId_userId: {
            waiverId: waiver.id,
            userId: user.id,
          },
        },
        update: {
          signedAt: new Date(),
          signedOnBehalfId: signedOnBehalfId ?? null,
        },
        create: {
          waiverId: waiver.id,
          userId: user.id,
          signedOnBehalfId,
        },
        select: waiverSignaturePayload,
      })
    } catch (error) {
      console.error("signWaiver failed", error)
      throw new Error(WAIVER_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: organization.id,
      entityType: "WaiverSignature",
      entityId: signature.id,
      action: "waiver.signed",
      after: auditSignatureSnapshot(signature),
    })

    revalidate({ paths: REVALIDATE_WAIVER_PATHS(organization.id, waiver.id) })

    return signature
  })

export const revokeWaiverSignature = userActionClient
  .inputSchema(revokeWaiverSignatureSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "waiver_write")) {
      throw new Error(WAIVER_ERROR.RATE_LIMITED)
    }

    const organization = await resolveOrganization({
      db,
      brand: requestBrand,
      organizationId: parsedInput.organizationId,
    })
    if (!(await canEditOrganization(user, organization.id))) {
      throw new Error(WAIVER_ERROR.NOT_AUTHORIZED)
    }

    const existing = await db.waiverSignature.findFirst({
      where: {
        id: parsedInput.signatureId,
        OR: [
          {
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
          {
            signedOnBehalfOf: {
              memberships: {
                some: {
                  brand: requestBrand,
                  organizationId: organization.id,
                  status: "ACTIVE",
                },
              },
            },
          },
        ],
        waiver: {
          AND: [
            { OR: [{ brand: requestBrand }, { brand: null }] },
            { OR: [{ organizationId: organization.id }, { organizationId: null }] },
          ],
        },
      },
      select: waiverSignaturePayload,
    })

    if (!existing) {
      throw new Error(WAIVER_ERROR.SIGNATURE_NOT_FOUND)
    }

    try {
      await db.waiverSignature.delete({ where: { id: existing.id } })
    } catch (error) {
      console.error("revokeWaiverSignature failed", error)
      throw new Error(WAIVER_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: organization.id,
      entityType: "WaiverSignature",
      entityId: existing.id,
      action: "waiver_signature.revoked",
      before: auditSignatureSnapshot(existing),
    })

    revalidate({ paths: REVALIDATE_WAIVER_PATHS(organization.id, existing.waiverId) })

    return { id: existing.id, waiverId: existing.waiverId }
  })
