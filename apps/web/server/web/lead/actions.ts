"use server"

import { after } from "next/server"
import type { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { EmailMagicLink } from "~/emails/magic-link"
import { canEditOrganization } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { sendEmail } from "~/lib/email"
import { isRateLimited } from "~/lib/rate-limiter"
import { userActionClient } from "~/lib/safe-actions"
import { generateUniqueProfileSlug } from "~/lib/slug"
import { LEAD_ERROR } from "~/server/web/lead/errors"
import { type LeadRecord, leadPayload, leadProgramPayload } from "~/server/web/lead/payloads"
import {
  bookTrialSchema,
  completeTrialSchema,
  convertLeadSchema,
  createLeadSchema,
} from "~/server/web/lead/schemas"
import { writeSchoolOpsAudit } from "~/server/web/school-ops/audit"

const REVALIDATE_LEAD_PATHS = (organizationId: string, leadId?: string) => [
  `/organizations/${organizationId}/leads`,
  ...(leadId ? [`/organizations/${organizationId}/leads/${leadId}`] : []),
]

const BOOKABLE_LEAD_STATUSES = new Set(["NEW", "CONTACTED", "NURTURE"])

type OrgRecord = { id: string; brand: Brand; disciplines: { disciplineId: string }[] }
type DbLike = any

const normalized = (value: string | undefined) => {
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
    select: {
      id: true,
      brand: true,
      disciplines: { select: { disciplineId: true } },
    },
  })

  if (!organization) {
    throw new Error(LEAD_ERROR.ORG_NOT_FOUND)
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
    throw new Error(LEAD_ERROR.NOT_AUTHORIZED)
  }
}

const resolveProgram = async ({
  db,
  brand,
  organizationId,
  programId,
}: {
  db: DbLike
  brand: Brand
  organizationId: string
  programId: string
}) => {
  const program = await db.program.findFirst({
    where: { id: programId, brand, organizationId },
    select: leadProgramPayload,
  })

  if (!program) {
    throw new Error(LEAD_ERROR.PROGRAM_NOT_FOUND)
  }

  return program
}

const resolveLead = async ({ db, brand, leadId }: { db: DbLike; brand: Brand; leadId: string }) => {
  const lead = await db.lead.findFirst({
    where: { id: leadId, brand },
    select: leadPayload,
  })

  if (!lead) {
    throw new Error(LEAD_ERROR.LEAD_NOT_FOUND)
  }

  return lead
}

const assertDisciplineLinked = ({
  organization,
  disciplineId,
}: {
  organization: OrgRecord
  disciplineId: string
}) => {
  if (!organization.disciplines.some(d => d.disciplineId === disciplineId)) {
    throw new Error(LEAD_ERROR.DISCIPLINE_NOT_LINKED)
  }
}

const auditLeadSnapshot = (lead: LeadRecord) => ({
  id: lead.id,
  status: lead.status,
  source: lead.source,
  organizationId: lead.organizationId,
  programId: lead.programId,
  trialBookedAt: lead.trialBookedAt,
  convertedAt: lead.convertedAt,
  convertedToUserId: lead.convertedToUserId,
})

export const createLead = userActionClient
  .inputSchema(createLeadSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "lead_write")) {
      throw new Error(LEAD_ERROR.RATE_LIMITED)
    }

    const organization = await resolveOrganization({
      db,
      brand: requestBrand,
      organizationId: parsedInput.organizationId,
    })
    await assertCanManageOrganization({ user, organizationId: organization.id })

    if (parsedInput.programId) {
      await resolveProgram({
        db,
        brand: requestBrand,
        organizationId: organization.id,
        programId: parsedInput.programId,
      })
    }

    let lead: LeadRecord
    try {
      lead = await db.lead.create({
        data: {
          brand: requestBrand,
          organizationId: organization.id,
          programId: parsedInput.programId,
          source: parsedInput.source,
          firstName: parsedInput.firstName.trim(),
          lastName: normalized(parsedInput.lastName),
          email: normalized(parsedInput.email)?.toLowerCase(),
          phoneE164: normalized(parsedInput.phoneE164),
          notes: normalized(parsedInput.notes),
          referredBy: normalized(parsedInput.referredBy),
        },
        select: leadPayload,
      })
    } catch (error) {
      console.error("createLead failed", error)
      throw new Error(LEAD_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: organization.id,
      entityType: "Lead",
      entityId: lead.id,
      action: "lead.created",
      after: auditLeadSnapshot(lead),
    })

    revalidate({ paths: REVALIDATE_LEAD_PATHS(organization.id, lead.id) })

    return lead
  })

export const bookTrial = userActionClient
  .inputSchema(bookTrialSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "trial_book")) {
      throw new Error(LEAD_ERROR.TRIAL_RATE_LIMITED)
    }

    const lead = await resolveLead({ db, brand: requestBrand, leadId: parsedInput.leadId })
    await assertCanManageOrganization({ user, organizationId: lead.organizationId })

    if (lead.status === "TRIAL_BOOKED" && lead.trialBookedAt) {
      return lead
    }

    if (!BOOKABLE_LEAD_STATUSES.has(lead.status)) {
      throw new Error(LEAD_ERROR.INVALID_TRIAL_STATUS)
    }

    let updated: LeadRecord
    try {
      updated = await db.lead.update({
        where: { id: lead.id },
        data: {
          status: "TRIAL_BOOKED",
          trialBookedAt: parsedInput.trialBookedAt ?? new Date(),
        },
        select: leadPayload,
      })
    } catch (error) {
      console.error("bookTrial failed", error)
      throw new Error(LEAD_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: lead.organizationId,
      entityType: "TrialBooking",
      entityId: updated.id,
      action: "trial.booked",
      before: auditLeadSnapshot(lead),
      after: auditLeadSnapshot(updated),
    })

    revalidate({ paths: REVALIDATE_LEAD_PATHS(lead.organizationId, lead.id) })

    return updated
  })

export const completeTrial = userActionClient
  .inputSchema(completeTrialSchema)
  .action(async ({ parsedInput: { leadId }, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "lead_write")) {
      throw new Error(LEAD_ERROR.RATE_LIMITED)
    }

    const lead = await resolveLead({ db, brand: requestBrand, leadId })
    await assertCanManageOrganization({ user, organizationId: lead.organizationId })

    if (lead.status !== "TRIAL_BOOKED") {
      throw new Error(LEAD_ERROR.INVALID_TRIAL_STATUS)
    }

    let updated: LeadRecord
    try {
      updated = await db.lead.update({
        where: { id: lead.id },
        data: { status: "TRIAL_COMPLETED" },
        select: leadPayload,
      })
    } catch (error) {
      console.error("completeTrial failed", error)
      throw new Error(LEAD_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: lead.organizationId,
      entityType: "Lead",
      entityId: updated.id,
      action: "trial.completed",
      before: auditLeadSnapshot(lead),
      after: auditLeadSnapshot(updated),
    })

    revalidate({ paths: REVALIDATE_LEAD_PATHS(lead.organizationId, lead.id) })

    return updated
  })

export const convertLead = userActionClient
  .inputSchema(convertLeadSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const requestBrand = await getRequestBrand()

    if (await isRateLimited(user.id, "lead_write")) {
      throw new Error(LEAD_ERROR.RATE_LIMITED)
    }

    const lead = await resolveLead({ db, brand: requestBrand, leadId: parsedInput.leadId })
    await assertCanManageOrganization({ user, organizationId: lead.organizationId })

    if (lead.status === "CONVERTED" && lead.convertedToUserId) {
      return {
        lead,
        userId: lead.convertedToUserId,
        membershipId: null,
        enrollmentId: null,
        waiverSignatureIds: [],
      }
    }

    if (lead.status !== "TRIAL_COMPLETED" && lead.status !== "NURTURE") {
      throw new Error(LEAD_ERROR.INVALID_TRIAL_STATUS)
    }

    if (!lead.email) {
      throw new Error(LEAD_ERROR.EMAIL_REQUIRED)
    }

    const organization = await resolveOrganization({
      db,
      brand: requestBrand,
      organizationId: lead.organizationId,
    })

    const program = lead.programId
      ? await resolveProgram({
          db,
          brand: requestBrand,
          organizationId: organization.id,
          programId: lead.programId,
        })
      : null
    const disciplineId = parsedInput.disciplineId ?? program?.disciplineId
    if (!disciplineId) {
      throw new Error(LEAD_ERROR.DISCIPLINE_NOT_LINKED)
    }
    assertDisciplineLinked({ organization, disciplineId })

    const correlationId = crypto.randomUUID()

    let result: {
      lead: LeadRecord
      userId: string
      membershipId: string
      enrollmentId: string | null
      waiverSignatureIds: string[]
      isNewUser: boolean
    }
    try {
      result = await db.$transaction(async tx => {
        const leadEmail = lead.email as string
        const displayName = `${lead.firstName}${lead.lastName ? ` ${lead.lastName}` : ""}`
        const existingUser = await tx.user.findUnique({
          where: { email: leadEmail },
          select: {
            id: true,
            // Phase 3c (SOT-ADR D1): identity satellites are Passport-rooted; reach the directory
            // profile through the account's Passport.
            passport: { select: { id: true, directoryProfile: { select: { id: true } } } },
          },
        })
        const convertedUser =
          existingUser ??
          (await tx.user.create({
            data: {
              email: leadEmail,
              name: displayName,
              lastActiveBrandId: requestBrand,
            },
            select: { id: true },
          }))

        let passportId = existingUser?.passport?.id ?? null
        if (!passportId) {
          const passport = await tx.passport.create({
            data: {
              userId: convertedUser.id,
              displayName,
              legalFirstName: lead.firstName,
              legalLastName: lead.lastName ?? null,
              phoneE164: lead.phoneE164 ?? null,
            },
            select: { id: true },
          })
          passportId = passport.id
        }

        if (!existingUser?.passport?.directoryProfile) {
          const slug = await generateUniqueProfileSlug(
            displayName,
            async s => (await tx.directoryProfile.count({ where: { slug: s } })) > 0,
          )
          await tx.directoryProfile.create({
            data: { passportId, slug },
          })
        }

        const membership = await tx.membership.upsert({
          where: {
            userId_organizationId_disciplineId: {
              userId: convertedUser.id,
              organizationId: organization.id,
              disciplineId,
            },
          },
          update: {
            brand: requestBrand,
            status: "ACTIVE",
            leftAt: null,
          },
          create: {
            brand: requestBrand,
            userId: convertedUser.id,
            organizationId: organization.id,
            disciplineId,
            status: "ACTIVE",
            joinedAt: new Date(),
          },
          select: { id: true },
        })

        let enrollment: { id: string } | null = null
        if (program) {
          const existingEnrollment = await tx.programEnrollment.findUnique({
            where: {
              userId_programId: {
                userId: convertedUser.id,
                programId: program.id,
              },
            },
            select: { id: true, status: true, waitlistPosition: true },
          })

          if (existingEnrollment?.status === "ACTIVE") {
            enrollment = existingEnrollment
          } else {
            let enrollmentStatus: "ACTIVE" | "WAITLISTED" = "ACTIVE"
            let waitlistPosition: number | null = null

            if (existingEnrollment?.status === "WAITLISTED") {
              enrollmentStatus = "WAITLISTED"
              waitlistPosition = existingEnrollment.waitlistPosition
            } else if (program.maxEnrollment) {
              const activeCount = await tx.programEnrollment.count({
                where: { programId: program.id, status: "ACTIVE" },
              })
              if (activeCount >= program.maxEnrollment) {
                enrollmentStatus = "WAITLISTED"
                const aggregate = await tx.programEnrollment.aggregate({
                  where: { programId: program.id, status: "WAITLISTED" },
                  _max: { waitlistPosition: true },
                })
                waitlistPosition = (aggregate._max.waitlistPosition ?? 0) + 1
              }
            }

            enrollment = await tx.programEnrollment.upsert({
              where: {
                userId_programId: {
                  userId: convertedUser.id,
                  programId: program.id,
                },
              },
              update: {
                status: enrollmentStatus,
                waitlistPosition,
                withdrawnAt: null,
                ...(enrollmentStatus === "ACTIVE" ? { enrolledAt: new Date() } : {}),
              },
              create: {
                userId: convertedUser.id,
                programId: program.id,
                status: enrollmentStatus,
                waitlistPosition,
              },
              select: { id: true },
            })
          }
        }

        let waiverSignatureIds: string[] = []
        if (parsedInput.waiverIds.length > 0) {
          const waivers = await tx.waiver.findMany({
            where: {
              id: { in: parsedInput.waiverIds },
              isActive: true,
              AND: [
                { OR: [{ brand: requestBrand }, { brand: null }] },
                { OR: [{ organizationId: organization.id }, { organizationId: null }] },
              ],
              ...(program
                ? {
                    programs: {
                      some: {
                        programId: program.id,
                        program: {
                          brand: requestBrand,
                          organizationId: organization.id,
                        },
                      },
                    },
                  }
                : {}),
            },
            select: { id: true },
          })

          if (waivers.length !== new Set(parsedInput.waiverIds).size) {
            throw new Error(LEAD_ERROR.WAIVER_NOT_FOUND)
          }

          await tx.waiverSignature.createMany({
            data: waivers.map(waiver => ({
              waiverId: waiver.id,
              userId: convertedUser.id,
            })),
            skipDuplicates: true,
          })

          const signatures = await tx.waiverSignature.findMany({
            where: {
              waiverId: { in: waivers.map(waiver => waiver.id) },
              userId: convertedUser.id,
            },
            select: { id: true },
          })
          waiverSignatureIds = signatures.map(signature => signature.id)
        }

        const convertedLead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            status: "CONVERTED",
            convertedAt: new Date(),
            convertedToUserId: convertedUser.id,
          },
          select: leadPayload,
        })

        return {
          lead: convertedLead,
          userId: convertedUser.id,
          membershipId: membership.id,
          enrollmentId: enrollment?.id ?? null,
          waiverSignatureIds,
          isNewUser: !existingUser,
        }
      })
    } catch (error) {
      if (error instanceof Error && error.message === LEAD_ERROR.WAIVER_NOT_FOUND) {
        throw error
      }
      console.error("convertLead failed", error)
      throw new Error(LEAD_ERROR.UNEXPECTED_ERROR)
    }

    await writeSchoolOpsAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: lead.organizationId,
      entityType: "Lead",
      entityId: result.lead.id,
      action: "lead.converted",
      before: auditLeadSnapshot(lead),
      after: { ...auditLeadSnapshot(result.lead), correlationId },
    })
    await writeSchoolOpsAudit({
      brand: requestBrand,
      userId: user.id,
      organizationId: lead.organizationId,
      entityType: "Membership",
      entityId: result.membershipId,
      action: "membership.created",
      after: { userId: result.userId, disciplineId, correlationId },
    })
    if (result.enrollmentId && program) {
      await writeSchoolOpsAudit({
        brand: requestBrand,
        userId: user.id,
        organizationId: lead.organizationId,
        entityType: "Enrollment",
        entityId: result.enrollmentId,
        action: "enrollment.created",
        after: { userId: result.userId, programId: program.id, correlationId },
      })
    }
    for (const signatureId of result.waiverSignatureIds) {
      await writeSchoolOpsAudit({
        brand: requestBrand,
        userId: user.id,
        organizationId: lead.organizationId,
        entityType: "WaiverSignature",
        entityId: signatureId,
        action: "waiver.signed",
        after: { userId: result.userId, correlationId },
      })
    }

    revalidate({ paths: REVALIDATE_LEAD_PATHS(lead.organizationId, lead.id) })

    // Send welcome email to newly created users directing them to log in
    if (result.isNewUser && lead.email) {
      const brandConfig = getBrandSiteConfig(requestBrand)
      after(async () => {
        try {
          const loginUrl = `${siteConfig.url}/login`
          await sendEmail({
            to: lead.email as string,
            subject: `Welcome to ${brandConfig.name} — Set Up Your Account`,
            react: EmailMagicLink({ to: lead.email as string, url: loginUrl }),
          })
        } catch (err) {
          console.error("Failed to send welcome email to converted lead", err)
        }
      })
    }

    return result
  })
