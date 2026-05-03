/**
 * SESSION_0033 consolidated school-ops smoke proof.
 *
 * Pure Prisma rejection matrix mirroring the new server action predicates:
 * request brand -> scoped org/program/lead/waiver -> staff authority or guardian
 * authority -> active target membership -> transactional writes.
 *
 * Run: cd apps/web && bun scripts/smoke-school-ops-extended.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { type Brand, PrismaClient } from "../.generated/prisma/client.js"

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev"
const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const db = new PrismaClient({ adapter })

const BRAND: Brand = "BASELINE_MARTIAL_ARTS"
const OTHER_BRAND: Brand = "BBL"
const TS = Date.now()
const TAG = `smoke-school-ops-extended-${TS}`

type Actor = { userId: string; appRole?: string | null }

type CleanupBag = {
  userIds: string[]
  orgIds: string[]
  disciplineIds: string[]
  programIds: string[]
  waiverIds: string[]
  familyGroupIds: string[]
  leadIds: string[]
}

async function main() {
  console.log("SESSION_0033 school-ops extended smoke - start\n")

  const cleanup: CleanupBag = {
    userIds: [],
    orgIds: [],
    disciplineIds: [],
    programIds: [],
    waiverIds: [],
    familyGroupIds: [],
    leadIds: [],
  }

  try {
    const owner = await createUser("owner")
    const student = await createUser("student")
    const guardian = await createUser("guardian")
    const child = await createUser("child")
    const otherOrgOwner = await createUser("other-org-owner")
    const otherBrandOwner = await createUser("other-brand-owner")
    cleanup.userIds.push(
      owner.id,
      student.id,
      guardian.id,
      child.id,
      otherOrgOwner.id,
      otherBrandOwner.id,
    )

    await db.passport.createMany({
      data: [
        { userId: owner.id, displayName: `${TAG} owner` },
        { userId: student.id, displayName: `${TAG} student` },
        { userId: guardian.id, displayName: `${TAG} guardian` },
        { userId: child.id, displayName: `${TAG} child`, dob: minorDob() },
        { userId: otherOrgOwner.id, displayName: `${TAG} other org owner` },
        { userId: otherBrandOwner.id, displayName: `${TAG} other brand owner` },
      ],
    })

    const discipline = await db.discipline.create({
      data: { brand: BRAND, name: `${TAG} discipline`, slug: `${TAG}-discipline` },
    })
    cleanup.disciplineIds.push(discipline.id)

    const org = await createOrg("target", BRAND, owner.id)
    const otherOrg = await createOrg("other-org", BRAND, otherOrgOwner.id)
    const otherBrandOrg = await createOrg("other-brand", OTHER_BRAND, otherBrandOwner.id)
    cleanup.orgIds.push(org.id, otherOrg.id, otherBrandOrg.id)

    await db.organizationDiscipline.createMany({
      data: [
        { organizationId: org.id, disciplineId: discipline.id },
        { organizationId: otherOrg.id, disciplineId: discipline.id },
        { organizationId: otherBrandOrg.id, disciplineId: discipline.id },
      ],
    })

    await createMembership(owner.id, org.id, discipline.id, BRAND)
    await createMembership(student.id, org.id, discipline.id, BRAND)
    await createMembership(guardian.id, org.id, discipline.id, BRAND)
    await createMembership(child.id, org.id, discipline.id, BRAND)
    await createMembership(otherOrgOwner.id, otherOrg.id, discipline.id, BRAND)
    await createMembership(otherBrandOwner.id, otherBrandOrg.id, discipline.id, OTHER_BRAND)

    const program = await db.program.create({
      data: {
        brand: BRAND,
        organizationId: org.id,
        disciplineId: discipline.id,
        name: `${TAG} program`,
        slug: `${TAG}-program`,
        status: "ACTIVE",
        maxEnrollment: 1,
      },
    })
    cleanup.programIds.push(program.id)

    const waiver = await db.waiver.create({
      data: {
        brand: BRAND,
        organizationId: org.id,
        type: "LIABILITY",
        title: `${TAG} waiver`,
        content: "Smoke waiver",
        programs: { create: { programId: program.id, required: true } },
      },
    })
    cleanup.waiverIds.push(waiver.id)

    const enrollment = await enrollLikeAction({
      actor: { userId: owner.id },
      activeBrand: BRAND,
      programId: program.id,
      targetUserId: student.id,
    })
    if (enrollment.status !== "ACTIVE") throw new Error("Expected active enrollment")
    console.log("✓ Staff can enroll an active same-org member")

    const waitlisted = await enrollLikeAction({
      actor: { userId: owner.id },
      activeBrand: BRAND,
      programId: program.id,
      targetUserId: child.id,
    })
    if (waitlisted.status !== "WAITLISTED" || waitlisted.waitlistPosition !== 1) {
      throw new Error("Expected child to enter waitlist position 1")
    }
    console.log("✓ Capacity overflow becomes monotonic waitlist")

    await expectRejects(
      () =>
        enrollLikeAction({
          actor: { userId: otherOrgOwner.id },
          activeBrand: BRAND,
          programId: program.id,
          targetUserId: child.id,
        }),
      "cross-org enrollment actor rejected",
    )
    await expectRejects(
      () =>
        enrollLikeAction({
          actor: { userId: otherBrandOwner.id },
          activeBrand: OTHER_BRAND,
          programId: program.id,
          targetUserId: child.id,
        }),
      "cross-brand enrollment request rejected",
    )

    const familyGroup = await createFamilyLikeAction({
      actor: { userId: owner.id },
      activeBrand: BRAND,
      organizationId: org.id,
      guardianUserId: guardian.id,
      childUserId: child.id,
    })
    cleanup.familyGroupIds.push(familyGroup.id)
    console.log("✓ Staff can create scoped family group without exposing cross-org members")

    await signWaiverLikeAction({
      actor: { userId: guardian.id },
      activeBrand: BRAND,
      organizationId: org.id,
      waiverId: waiver.id,
      programId: program.id,
      signedOnBehalfOfId: child.id,
    })
    console.log("✓ Guardian can sign a program waiver for a minor family member")

    await expectRejects(
      () =>
        signWaiverLikeAction({
          actor: { userId: student.id },
          activeBrand: BRAND,
          organizationId: org.id,
          waiverId: waiver.id,
          programId: program.id,
          signedOnBehalfOfId: child.id,
        }),
      "non-guardian minor waiver signature rejected",
    )

    const lead = await createLeadLikeAction({
      actor: { userId: owner.id },
      activeBrand: BRAND,
      organizationId: org.id,
      programId: program.id,
      email: `${TAG}-converted@test.local`,
    })
    cleanup.leadIds.push(lead.id)
    await bookTrialLikeAction({ actor: { userId: owner.id }, activeBrand: BRAND, leadId: lead.id })
    await completeTrialLikeAction({
      actor: { userId: owner.id },
      activeBrand: BRAND,
      leadId: lead.id,
    })
    const converted = await convertLeadLikeAction({
      actor: { userId: owner.id },
      activeBrand: BRAND,
      leadId: lead.id,
      waiverIds: [waiver.id],
    })
    cleanup.userIds.push(converted.userId)
    if (!converted.membershipId || !converted.enrollmentId) {
      throw new Error("Lead conversion did not create membership + enrollment")
    }
    const convertedEnrollment = await db.programEnrollment.findUnique({
      where: { userId_programId: { userId: converted.userId, programId: program.id } },
    })
    if (
      convertedEnrollment?.status !== "WAITLISTED" ||
      convertedEnrollment.waitlistPosition !== 2
    ) {
      throw new Error("Lead conversion did not respect program capacity waitlist")
    }
    console.log(
      "✓ Lead -> trial -> converted creates user, membership, waitlisted enrollment, waiver",
    )

    await expectRejects(
      () =>
        createLeadLikeAction({
          actor: { userId: otherOrgOwner.id },
          activeBrand: BRAND,
          organizationId: org.id,
          programId: program.id,
          email: `${TAG}-blocked@test.local`,
        }),
      "cross-org lead actor rejected",
    )

    console.log("\nSESSION_0033 school-ops extended smoke - passed")
  } finally {
    await cleanupBag(cleanup)
  }
}

async function createUser(name: string) {
  return db.user.create({
    data: { name: `${TAG} ${name}`, email: `${TAG}-${name}@test.local` },
  })
}

async function createOrg(name: string, brand: Brand, ownerId: string) {
  return db.organization.create({
    data: {
      brand,
      name: `${TAG} ${name}`,
      slug: `${TAG}-${name}`,
      type: "DOJO",
      ownerId,
    },
  })
}

async function createMembership(
  userId: string,
  organizationId: string,
  disciplineId: string,
  brand: Brand,
) {
  return db.membership.create({
    data: {
      brand,
      userId,
      organizationId,
      disciplineId,
      status: "ACTIVE",
      joinedAt: todayUtc(),
    },
  })
}

async function canEditOrganization(actor: Actor, organizationId: string) {
  if (actor.appRole === "admin") return true
  const org = await db.organization.findFirst({
    where: {
      id: organizationId,
      OR: [
        { ownerId: actor.userId },
        {
          memberships: {
            some: {
              userId: actor.userId,
              status: "ACTIVE",
              roleAssignments: {
                some: { role: { code: { in: ["OWNER", "ORG_ADMIN", "INSTRUCTOR"] } } },
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  })
  return Boolean(org)
}

async function assertActiveMember(
  activeBrand: Brand,
  organizationId: string,
  userId: string,
  disciplineId?: string | null,
) {
  const membership = await db.membership.findFirst({
    where: {
      brand: activeBrand,
      organizationId,
      userId,
      status: "ACTIVE",
      ...(disciplineId ? { disciplineId } : {}),
    },
    select: { id: true },
  })
  if (!membership) throw new Error("active member required")
}

async function enrollLikeAction({
  actor,
  activeBrand,
  programId,
  targetUserId,
}: {
  actor: Actor
  activeBrand: Brand
  programId: string
  targetUserId: string
}) {
  const program = await db.program.findFirst({
    where: { id: programId, brand: activeBrand },
    select: { id: true, organizationId: true, disciplineId: true, maxEnrollment: true },
  })
  if (!program) throw new Error("program not found")
  if (!(await canEditOrganization(actor, program.organizationId))) {
    throw new Error("not authorized")
  }
  await assertActiveMember(activeBrand, program.organizationId, targetUserId, program.disciplineId)
  const existing = await db.programEnrollment.findUnique({
    where: { userId_programId: { userId: targetUserId, programId: program.id } },
  })
  if (existing?.status === "ACTIVE") return existing
  const activeCount = await db.programEnrollment.count({
    where: { programId: program.id, status: "ACTIVE" },
  })
  const status =
    program.maxEnrollment && activeCount >= program.maxEnrollment ? "WAITLISTED" : "ACTIVE"
  const waitlistPosition =
    status === "WAITLISTED"
      ? ((
          await db.programEnrollment.aggregate({
            where: { programId: program.id, status: "WAITLISTED" },
            _max: { waitlistPosition: true },
          })
        )._max.waitlistPosition ?? 0) + 1
      : null
  if (existing?.status === "WAITLISTED" && status === "WAITLISTED") return existing
  return db.programEnrollment.upsert({
    where: { userId_programId: { userId: targetUserId, programId: program.id } },
    update: { status, waitlistPosition, withdrawnAt: null },
    create: { userId: targetUserId, programId: program.id, status, waitlistPosition },
  })
}

async function createFamilyLikeAction({
  actor,
  activeBrand,
  organizationId,
  guardianUserId,
  childUserId,
}: {
  actor: Actor
  activeBrand: Brand
  organizationId: string
  guardianUserId: string
  childUserId: string
}) {
  const org = await db.organization.findFirst({
    where: { id: organizationId, brand: activeBrand },
    select: { id: true },
  })
  if (!org) throw new Error("org not found")
  if (!(await canEditOrganization(actor, org.id))) throw new Error("not authorized")
  await assertActiveMember(activeBrand, org.id, guardianUserId)
  await assertActiveMember(activeBrand, org.id, childUserId)
  return db.familyGroup.create({
    data: {
      name: `${TAG} family`,
      members: {
        create: [
          { userId: guardianUserId, role: "GUARDIAN", isPrimary: true },
          { userId: childUserId, role: "CHILD" },
        ],
      },
    },
  })
}

async function signWaiverLikeAction({
  actor,
  activeBrand,
  organizationId,
  waiverId,
  programId,
  signedOnBehalfOfId,
}: {
  actor: Actor
  activeBrand: Brand
  organizationId: string
  waiverId: string
  programId: string
  signedOnBehalfOfId: string
}) {
  await assertActiveMember(activeBrand, organizationId, actor.userId)
  await assertActiveMember(activeBrand, organizationId, signedOnBehalfOfId)
  const waiver = await db.waiver.findFirst({
    where: {
      id: waiverId,
      isActive: true,
      AND: [
        { OR: [{ brand: activeBrand }, { brand: null }] },
        { OR: [{ organizationId }, { organizationId: null }] },
      ],
      programs: { some: { programId, program: { brand: activeBrand, organizationId } } },
    },
    select: { id: true },
  })
  if (!waiver) throw new Error("waiver not found")
  const target = await db.user.findFirst({
    where: { id: signedOnBehalfOfId },
    select: { passport: { select: { dob: true } } },
  })
  if (!isMinorDob(target?.passport?.dob)) throw new Error("target not minor")
  const family = await db.familyGroup.findFirst({
    where: {
      members: { some: { userId: actor.userId, role: "GUARDIAN" } },
      AND: { members: { some: { userId: signedOnBehalfOfId } } },
    },
    select: { id: true },
  })
  if (!family) throw new Error("guardian not authorized")
  return db.waiverSignature.upsert({
    where: { waiverId_userId: { waiverId, userId: actor.userId } },
    update: { signedAt: new Date(), signedOnBehalfOfId },
    create: { waiverId, userId: actor.userId, signedOnBehalfOfId },
  })
}

async function createLeadLikeAction({
  actor,
  activeBrand,
  organizationId,
  programId,
  email,
}: {
  actor: Actor
  activeBrand: Brand
  organizationId: string
  programId: string
  email: string
}) {
  const org = await db.organization.findFirst({
    where: { id: organizationId, brand: activeBrand },
    select: { id: true },
  })
  if (!org) throw new Error("org not found")
  if (!(await canEditOrganization(actor, org.id))) throw new Error("not authorized")
  const program = await db.program.findFirst({
    where: { id: programId, brand: activeBrand, organizationId: org.id },
    select: { id: true },
  })
  if (!program) throw new Error("program not found")
  return db.lead.create({
    data: {
      brand: activeBrand,
      organizationId: org.id,
      programId: program.id,
      source: "WALK_IN",
      firstName: "Smoke",
      lastName: "Lead",
      email,
    },
  })
}

async function bookTrialLikeAction({
  actor,
  activeBrand,
  leadId,
}: {
  actor: Actor
  activeBrand: Brand
  leadId: string
}) {
  const lead = await scopedLead(activeBrand, leadId)
  if (!(await canEditOrganization(actor, lead.organizationId))) throw new Error("not authorized")
  return db.lead.update({
    where: { id: lead.id },
    data: { status: "TRIAL_BOOKED", trialBookedAt: new Date() },
  })
}

async function completeTrialLikeAction({
  actor,
  activeBrand,
  leadId,
}: {
  actor: Actor
  activeBrand: Brand
  leadId: string
}) {
  const lead = await scopedLead(activeBrand, leadId)
  if (!(await canEditOrganization(actor, lead.organizationId))) throw new Error("not authorized")
  if (lead.status !== "TRIAL_BOOKED") throw new Error("invalid status")
  return db.lead.update({ where: { id: lead.id }, data: { status: "TRIAL_COMPLETED" } })
}

async function convertLeadLikeAction({
  actor,
  activeBrand,
  leadId,
  waiverIds,
}: {
  actor: Actor
  activeBrand: Brand
  leadId: string
  waiverIds: string[]
}) {
  const lead = await scopedLead(activeBrand, leadId)
  if (!(await canEditOrganization(actor, lead.organizationId))) throw new Error("not authorized")
  if (lead.status !== "TRIAL_COMPLETED") throw new Error("invalid status")
  const leadEmail = lead.email
  const program = lead.program
  if (!leadEmail || !program?.disciplineId) throw new Error("missing conversion fields")
  const disciplineId = program.disciplineId
  const programId = program.id

  return db.$transaction(async tx => {
    const existingUser = await tx.user.findUnique({
      where: { email: leadEmail },
      select: {
        id: true,
        passport: { select: { id: true } },
        directoryProfile: { select: { id: true } },
      },
    })
    const user =
      existingUser ??
      (await tx.user.create({
        data: { email: leadEmail, name: "Smoke Lead", lastActiveBrandId: activeBrand },
        select: { id: true },
      }))
    if (!existingUser?.passport) {
      await tx.passport.create({
        data: {
          userId: user.id,
          displayName: "Smoke Lead",
          legalFirstName: "Smoke",
          legalLastName: "Lead",
        },
      })
    }
    if (!existingUser?.directoryProfile) {
      await tx.directoryProfile.create({ data: { userId: user.id } })
    }

    const membership = await tx.membership.upsert({
      where: {
        userId_organizationId_disciplineId: {
          userId: user.id,
          organizationId: lead.organizationId,
          disciplineId,
        },
      },
      update: { brand: activeBrand, status: "ACTIVE", leftAt: null },
      create: {
        brand: activeBrand,
        userId: user.id,
        organizationId: lead.organizationId,
        disciplineId,
        status: "ACTIVE",
      },
      select: { id: true },
    })

    const existingEnrollment = await tx.programEnrollment.findUnique({
      where: { userId_programId: { userId: user.id, programId } },
      select: { id: true, status: true, waitlistPosition: true },
    })
    let enrollmentStatus: "ACTIVE" | "WAITLISTED" = "ACTIVE"
    let waitlistPosition: number | null = null
    if (existingEnrollment?.status === "ACTIVE") {
      enrollmentStatus = "ACTIVE"
    } else if (existingEnrollment?.status === "WAITLISTED") {
      enrollmentStatus = "WAITLISTED"
      waitlistPosition = existingEnrollment.waitlistPosition
    } else if (program.maxEnrollment) {
      const activeCount = await tx.programEnrollment.count({
        where: { programId, status: "ACTIVE" },
      })
      if (activeCount >= program.maxEnrollment) {
        enrollmentStatus = "WAITLISTED"
        const aggregate = await tx.programEnrollment.aggregate({
          where: { programId, status: "WAITLISTED" },
          _max: { waitlistPosition: true },
        })
        waitlistPosition = (aggregate._max.waitlistPosition ?? 0) + 1
      }
    }

    const enrollment = await tx.programEnrollment.upsert({
      where: { userId_programId: { userId: user.id, programId } },
      update: {
        status: enrollmentStatus,
        waitlistPosition,
        withdrawnAt: null,
        ...(enrollmentStatus === "ACTIVE" ? { enrolledAt: new Date() } : {}),
      },
      create: { userId: user.id, programId, status: enrollmentStatus, waitlistPosition },
      select: { id: true, status: true, waitlistPosition: true },
    })
    await tx.waiverSignature.createMany({
      data: waiverIds.map(waiverId => ({ waiverId, userId: user.id })),
      skipDuplicates: true,
    })
    await tx.lead.update({
      where: { id: lead.id },
      data: { status: "CONVERTED", convertedAt: new Date(), convertedToUserId: user.id },
    })
    return { userId: user.id, membershipId: membership.id, enrollmentId: enrollment.id }
  })
}

async function scopedLead(activeBrand: Brand, leadId: string) {
  const lead = await db.lead.findFirst({
    where: { id: leadId, brand: activeBrand },
    include: { program: true },
  })
  if (!lead) throw new Error("lead not found")
  return lead
}

async function expectRejects(fn: () => Promise<unknown>, label: string) {
  let rejected = false
  try {
    await fn()
  } catch {
    rejected = true
  }
  if (!rejected) throw new Error(`Expected rejection: ${label}`)
  console.log(`✓ ${label}`)
}

function todayUtc() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function minorDob() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear() - 10, 0, 1))
}

function isMinorDob(dob: Date | null | undefined) {
  if (!dob) return false
  const eighteenthBirthday = new Date(dob)
  eighteenthBirthday.setUTCFullYear(eighteenthBirthday.getUTCFullYear() + 18)
  return eighteenthBirthday.getTime() > Date.now()
}

async function cleanupBag(cleanup: CleanupBag) {
  await db.auditLog.deleteMany({ where: { organizationId: { in: cleanup.orgIds } } })
  await db.waiverSignature.deleteMany({ where: { waiverId: { in: cleanup.waiverIds } } })
  await db.programEnrollment.deleteMany({ where: { programId: { in: cleanup.programIds } } })
  await db.lead.deleteMany({ where: { id: { in: cleanup.leadIds } } })
  await db.programWaiver.deleteMany({ where: { programId: { in: cleanup.programIds } } })
  await db.waiver.deleteMany({ where: { id: { in: cleanup.waiverIds } } })
  await db.familyMember.deleteMany({ where: { familyGroupId: { in: cleanup.familyGroupIds } } })
  await db.familyGroup.deleteMany({ where: { id: { in: cleanup.familyGroupIds } } })
  await db.program.deleteMany({ where: { id: { in: cleanup.programIds } } })
  await db.membership.deleteMany({ where: { organizationId: { in: cleanup.orgIds } } })
  await db.organizationDiscipline.deleteMany({
    where: { organizationId: { in: cleanup.orgIds } },
  })
  await db.organization.deleteMany({ where: { id: { in: cleanup.orgIds } } })
  await db.user.deleteMany({
    where: { OR: [{ id: { in: cleanup.userIds } }, { email: { startsWith: TAG } }] },
  })
  await db.discipline.deleteMany({ where: { id: { in: cleanup.disciplineIds } } })
  await db.$disconnect()
}

main().catch(error => {
  console.error("\nSESSION_0033 school-ops extended smoke - failed")
  console.error(error)
  process.exit(1)
})
