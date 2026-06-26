/**
 * Attendance/check-in smoke proof - SESSION_0032 TASK_02.
 *
 * Pure Prisma rejection matrix mirroring the server action authorization path:
 * request brand -> ClassSession -> ClassSchedule -> organization -> staff
 * authority -> active same-org target membership -> idempotent Attendance /
 * CheckIn write.
 *
 * Run: cd apps/web && bun scripts/smoke-attendance.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import {
  type Brand,
  type ClassSessionStatus,
  PrismaClient,
  type UserRole,
} from "../.generated/prisma/client.js"

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev"
const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const db = new PrismaClient({ adapter })

const BRAND: Brand = "BASELINE_MARTIAL_ARTS"
const OTHER_BRAND: Brand = "BBL"
const TS = Date.now()
const TAG = `smoke-attendance-${TS}`
const STAFF_ROLE_CODES = ["OWNER", "ORG_ADMIN", "INSTRUCTOR"] as const
const DAY_MS = 24 * 60 * 60 * 1000

type CleanupBag = {
  orgIds: string[]
  programIds: string[]
  scheduleIds: string[]
  sessionIds: string[]
  userIds: string[]
  disciplineIds: string[]
  createdRoleIds: string[]
}

type Actor = {
  userId: string
  appRole?: string | null
}

async function main() {
  console.log("Attendance/check-in smoke proof - start\n")

  const cleanup: CleanupBag = {
    orgIds: [],
    programIds: [],
    scheduleIds: [],
    sessionIds: [],
    userIds: [],
    disciplineIds: [],
    createdRoleIds: [],
  }

  try {
    const admin = await createUser("admin", "admin")
    const instructor = await createUser("instructor")
    const student = await createUser("student")
    const otherOrgMember = await createUser("other-org")
    const otherBrandMember = await createUser("other-brand")
    const stranger = await createUser("stranger")
    cleanup.userIds.push(
      admin.id,
      instructor.id,
      student.id,
      otherOrgMember.id,
      otherBrandMember.id,
      stranger.id,
    )

    const discipline = await db.discipline.create({
      data: { brand: BRAND, name: `${TAG} discipline`, slug: `${TAG}-discipline` },
    })
    cleanup.disciplineIds.push(discipline.id)

    const { role: instructorRole, created: createdInstructorRole } = await findOrCreateRole(
      "INSTRUCTOR",
      BRAND,
    )
    const { role: ownerRole, created: createdOwnerRole } = await findOrCreateRole("OWNER", BRAND)
    const { role: otherBrandOwnerRole, created: createdOtherBrandOwnerRole } =
      await findOrCreateRole("OWNER", OTHER_BRAND)
    if (createdInstructorRole) cleanup.createdRoleIds.push(instructorRole.id)
    if (createdOwnerRole) cleanup.createdRoleIds.push(ownerRole.id)
    if (createdOtherBrandOwnerRole) cleanup.createdRoleIds.push(otherBrandOwnerRole.id)

    const org = await createOrg("target", BRAND, instructor.id)
    const otherOrg = await createOrg("other-org", BRAND, otherOrgMember.id)
    const otherBrandOrg = await createOrg("other-brand", OTHER_BRAND, otherBrandMember.id)
    cleanup.orgIds.push(org.id, otherOrg.id, otherBrandOrg.id)

    await db.organizationDiscipline.create({
      data: { organizationId: org.id, disciplineId: discipline.id },
    })

    await createMembership(instructor.id, org.id, discipline.id, BRAND, instructorRole.id)
    await createMembership(student.id, org.id, discipline.id, BRAND)
    await createMembership(otherOrgMember.id, otherOrg.id, discipline.id, BRAND, ownerRole.id)
    await createMembership(
      otherBrandMember.id,
      otherBrandOrg.id,
      discipline.id,
      OTHER_BRAND,
      otherBrandOwnerRole.id,
    )

    const program = await db.program.create({
      data: {
        brand: BRAND,
        organizationId: org.id,
        disciplineId: discipline.id,
        name: `${TAG} program`,
        slug: `${TAG}-program`,
        status: "ACTIVE",
      },
    })
    cleanup.programIds.push(program.id)

    const schedule = await db.classSchedule.create({
      data: {
        brand: BRAND,
        organizationId: org.id,
        programId: program.id,
        disciplineId: discipline.id,
        name: `${TAG} schedule`,
        daysOfWeek: ["MON"],
        startTime: "17:00",
        endTime: "18:00",
        timezone: "America/Denver",
      },
    })
    cleanup.scheduleIds.push(schedule.id)

    const todaySession = await createSession(schedule.id, 0)
    const pastSession = await createSession(schedule.id, -7)
    const futureSession = await createSession(schedule.id, 3)
    cleanup.sessionIds.push(todaySession.id, pastSession.id, futureSession.id)

    await recordCheckInLikeAction({
      actor: { userId: admin.id, appRole: "admin" },
      activeBrand: BRAND,
      classSessionId: todaySession.id,
      targetUserId: student.id,
    })
    console.log("✓ App admin can record check-in")

    await recordCheckInLikeAction({
      actor: { userId: instructor.id },
      activeBrand: BRAND,
      classSessionId: todaySession.id,
      targetUserId: student.id,
    })
    console.log("✓ Org instructor can record check-in")

    await recordCheckInLikeAction({
      actor: { userId: instructor.id },
      activeBrand: BRAND,
      classSessionId: pastSession.id,
      targetUserId: student.id,
    })
    console.log("✓ Past ClassSession is allowed for staff correction")

    await expectRejects(
      () =>
        recordCheckInLikeAction({
          actor: { userId: otherOrgMember.id },
          activeBrand: BRAND,
          classSessionId: todaySession.id,
          targetUserId: student.id,
        }),
      "other-org same-brand member rejected",
    )

    await expectRejects(
      () =>
        recordCheckInLikeAction({
          actor: { userId: otherBrandMember.id },
          activeBrand: BRAND,
          classSessionId: todaySession.id,
          targetUserId: student.id,
        }),
      "other-brand member rejected",
    )

    await expectRejects(
      () =>
        recordCheckInLikeAction({
          actor: { userId: stranger.id },
          activeBrand: BRAND,
          classSessionId: todaySession.id,
          targetUserId: student.id,
        }),
      "unauthenticated/no-membership actor rejected",
    )

    await expectRejects(
      () =>
        recordCheckInLikeAction({
          actor: { userId: student.id },
          activeBrand: BRAND,
          classSessionId: todaySession.id,
          targetUserId: student.id,
        }),
      "student self-check-in rejected",
    )

    await expectRejects(
      () =>
        recordCheckInLikeAction({
          actor: { userId: instructor.id },
          activeBrand: OTHER_BRAND,
          classSessionId: todaySession.id,
          targetUserId: student.id,
        }),
      "cross-brand request rejected",
    )

    await expectRejects(
      () =>
        recordCheckInLikeAction({
          actor: { userId: instructor.id },
          activeBrand: BRAND,
          classSessionId: futureSession.id,
          targetUserId: student.id,
        }),
      "future session beyond policy window rejected",
    )

    const idempotentSession = await createSession(schedule.id, 1)
    cleanup.sessionIds.push(idempotentSession.id)
    await recordCheckInLikeAction({
      actor: { userId: instructor.id },
      activeBrand: BRAND,
      classSessionId: idempotentSession.id,
      targetUserId: student.id,
    })
    await recordCheckInLikeAction({
      actor: { userId: instructor.id },
      activeBrand: BRAND,
      classSessionId: idempotentSession.id,
      targetUserId: student.id,
    })
    const attendanceCount = await db.attendance.count({
      where: { userId: student.id, classSessionId: idempotentSession.id },
    })
    const matchedCheckInCount = await db.checkIn.count({
      where: { userId: student.id, attendance: { classSessionId: idempotentSession.id } },
    })
    if (attendanceCount !== 1 || matchedCheckInCount !== 1) {
      throw new Error(
        `Idempotency failed: attendance=${attendanceCount} matchedCheckIn=${matchedCheckInCount}`,
      )
    }
    console.log("✓ Duplicate check-in remains one Attendance + one matched CheckIn")

    console.log("\nAttendance/check-in smoke proof - passed")
  } finally {
    await cleanupBag(cleanup)
  }
}

async function createUser(kind: string, role: UserRole = "user") {
  return db.user.create({
    data: { name: `${TAG} ${kind}`, email: `${TAG}-${kind}@test.local`, role },
  })
}

async function createOrg(kind: string, brand: Brand, ownerId: string) {
  return db.organization.create({
    data: {
      brand,
      name: `${TAG} ${kind}`,
      slug: `${TAG}-${kind}`,
      type: "DOJO",
      ownerId,
    },
  })
}

async function findOrCreateRole(code: string, brand: Brand) {
  const existing = await db.role.findUnique({ where: { code_brand: { code, brand } } })
  if (existing) return { role: existing, created: false }
  return {
    role: await db.role.create({ data: { brand, code, name: `${TAG} ${code}` } }),
    created: true,
  }
}

async function createMembership(
  userId: string,
  organizationId: string,
  disciplineId: string,
  brand: Brand,
  roleId?: string,
) {
  const membership = await db.membership.create({
    data: {
      brand,
      userId,
      organizationId,
      disciplineId,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  })

  if (roleId) {
    await db.membershipRoleAssignment.create({
      data: { membershipId: membership.id, roleId },
    })
  }

  return membership
}

async function createSession(
  classScheduleId: string,
  offsetDays: number,
  status: ClassSessionStatus = "SCHEDULED",
) {
  const now = new Date()
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offsetDays * DAY_MS,
  )
  return db.classSession.create({
    data: {
      classScheduleId,
      date,
      startTime: "17:00",
      endTime: "18:00",
      status,
    },
  })
}

async function recordCheckInLikeAction({
  actor,
  activeBrand,
  classSessionId,
  targetUserId,
}: {
  actor: Actor
  activeBrand: Brand
  classSessionId: string
  targetUserId: string
}) {
  const session = await db.classSession.findFirst({
    where: { id: classSessionId, classSchedule: { brand: activeBrand } },
    select: {
      id: true,
      date: true,
      status: true,
      classSchedule: {
        select: { id: true, organizationId: true, disciplineId: true },
      },
    },
  })

  if (!session) throw new Error("Session not found for active brand")
  if (session.status === "CANCELLED") throw new Error("Session is cancelled")
  if (isTooFarInFuture(session.date)) throw new Error("Session too far in future")

  if (!(await canManageOrganizationLikeAction(actor, session.classSchedule.organizationId))) {
    throw new Error("Actor cannot manage attendance")
  }

  const targetMembership = await db.membership.findFirst({
    where: {
      brand: activeBrand,
      organizationId: session.classSchedule.organizationId,
      userId: targetUserId,
      status: "ACTIVE",
      ...(session.classSchedule.disciplineId
        ? { disciplineId: session.classSchedule.disciplineId }
        : {}),
    },
    select: { id: true },
  })
  if (!targetMembership) throw new Error("Target is not active in this org/discipline")

  return db.$transaction(async tx => {
    const attendance = await tx.attendance.upsert({
      where: {
        userId_classSessionId: { userId: targetUserId, classSessionId: session.id },
      },
      update: { status: "PRESENT" },
      create: { userId: targetUserId, classSessionId: session.id, status: "PRESENT" },
    })

    const existingCheckIn = await tx.checkIn.findUnique({
      where: { matchedToAttendanceId: attendance.id },
    })

    if (existingCheckIn) return { attendance, checkIn: existingCheckIn }

    const checkIn = await tx.checkIn.create({
      data: {
        userId: targetUserId,
        method: "MANUAL",
        matchedToAttendanceId: attendance.id,
      },
    })

    return { attendance, checkIn }
  })
}

async function canManageOrganizationLikeAction(actor: Actor, organizationId: string) {
  if (actor.appRole === "admin") return true

  const organization = await db.organization.findFirst({
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
                some: { role: { code: { in: [...STAFF_ROLE_CODES] } } },
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  })

  return Boolean(organization)
}

function isTooFarInFuture(sessionDate: Date) {
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const max = today + DAY_MS
  const sessionDay = Date.UTC(
    sessionDate.getUTCFullYear(),
    sessionDate.getUTCMonth(),
    sessionDate.getUTCDate(),
  )
  return sessionDay > max
}

async function expectRejects(action: () => Promise<unknown>, label: string) {
  try {
    await action()
  } catch {
    console.log(`✓ Rejected as expected: ${label}`)
    return
  }
  throw new Error(`Expected rejection did not happen: ${label}`)
}

async function cleanupBag(bag: CleanupBag) {
  if (bag.userIds.length > 0) {
    await db.auditLog.deleteMany({ where: { userId: { in: bag.userIds } } })
    await db.checkIn.deleteMany({ where: { userId: { in: bag.userIds } } })
  }
  if (bag.sessionIds.length > 0) {
    await db.attendance.deleteMany({ where: { classSessionId: { in: bag.sessionIds } } })
    await db.classSession.deleteMany({ where: { id: { in: bag.sessionIds } } })
  }
  if (bag.scheduleIds.length > 0) {
    await db.classSchedule.deleteMany({ where: { id: { in: bag.scheduleIds } } })
  }
  if (bag.programIds.length > 0) {
    await db.program.deleteMany({ where: { id: { in: bag.programIds } } })
  }
  if (bag.orgIds.length > 0) {
    await db.membershipRoleAssignment.deleteMany({
      where: { membership: { organizationId: { in: bag.orgIds } } },
    })
    await db.membership.deleteMany({ where: { organizationId: { in: bag.orgIds } } })
    await db.organizationDiscipline.deleteMany({ where: { organizationId: { in: bag.orgIds } } })
    await db.organization.deleteMany({ where: { id: { in: bag.orgIds } } })
  }
  if (bag.userIds.length > 0) {
    await db.user.deleteMany({ where: { id: { in: bag.userIds } } })
  }
  if (bag.disciplineIds.length > 0) {
    await db.discipline.deleteMany({ where: { id: { in: bag.disciplineIds } } })
  }
  if (bag.createdRoleIds.length > 0) {
    await db.role.deleteMany({ where: { id: { in: bag.createdRoleIds } } })
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
