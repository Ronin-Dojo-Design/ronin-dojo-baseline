/**
 * Bun-only DB worker for SESSION_0346 multi-rank/multi-student lineage comp
 * fixture. The wrapper shells into this file so Playwright/Node callers do not
 * import the Prisma client directly.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "../../lib/entitlements/lineage-comp"
import { grantComp } from "../../server/entitlements/comp-grants"
import type {
  LineageCompSeedFixture,
  LineageCompSeedState,
  LineageCompSeedStudent,
  LineageCompTierState,
} from "./seed-lineage-comp-fixture"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const TAG_PREFIX = "session-0346-lineage-comp-e2e"
const RANKS = ["White Belt", "Blue Belt", "Purple Belt", "Brown Belt", "Black Belt"] as const
const INSTRUCTORS = ["Instructor A", "Instructor B"] as const
const STUDENTS_PER_RANK = 2

const makeRunId = () => `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-")

async function sweepStaleRows() {
  const [staleTrees, staleUsers, staleNodes] = await Promise.all([
    prisma.lineageTree.findMany({
      where: { description: { contains: TAG_PREFIX } },
      select: { id: true },
    }),
    prisma.user.findMany({
      where: { email: { contains: TAG_PREFIX } },
      select: { id: true },
    }),
    prisma.lineageNode.findMany({
      where: { slug: { contains: TAG_PREFIX } },
      select: { id: true },
    }),
  ])

  const treeIds = staleTrees.map(tree => tree.id)
  const userIds = staleUsers.map(user => user.id)
  const nodeIds = staleNodes.map(node => node.id)

  if (treeIds.length === 0 && userIds.length === 0 && nodeIds.length === 0) return

  await prisma.auditLog.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { entityId: { contains: TAG_PREFIX } }] },
  })
  await prisma.userEntitlement.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.lineageRelationship.deleteMany({
    where: { OR: [{ fromNodeId: { in: nodeIds } }, { toNodeId: { in: nodeIds } }] },
  })
  await prisma.lineageTreeMember.deleteMany({
    where: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] },
  })
  await prisma.lineageVisualGroup.deleteMany({ where: { treeId: { in: treeIds } } })
  await prisma.lineageTree.deleteMany({ where: { id: { in: treeIds } } })
  await prisma.lineageNode.deleteMany({ where: { id: { in: nodeIds } } })
  await prisma.rankAward.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.rank.deleteMany({ where: { name: { contains: TAG_PREFIX } } })
  await prisma.rankSystem.deleteMany({ where: { name: { contains: TAG_PREFIX } } })
  await prisma.discipline.deleteMany({ where: { slug: { contains: TAG_PREFIX } } })
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.directoryProfile.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.passport.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
}

async function ensureEntitlement(key: string, name: string, createdEntitlementIds: string[]) {
  const existing = await prisma.entitlement.findUnique({
    where: { brand_key: { brand: TEST_BRAND, key } },
  })
  if (existing) return existing

  const entitlement = await prisma.entitlement.create({
    data: { brand: TEST_BRAND, key, name },
  })
  createdEntitlementIds.push(entitlement.id)
  return entitlement
}

async function createUserNode({
  runId,
  label,
  role = "user",
}: {
  runId: string
  label: string
  role?: string
}) {
  const displayName = `E2E ${label} ${runId}`
  const slug = slugify(`${TAG_PREFIX}-${label}-${runId}`)
  const user = await prisma.user.create({
    data: {
      id: `${TAG_PREFIX}-${runId}-${slugify(label)}-user`,
      name: displayName,
      email: `${slug}@test.local`,
      emailVerified: true,
      role,
    },
  })

  await prisma.passport.create({
    data: { userId: user.id, displayName },
  })
  await prisma.directoryProfile.create({
    data: { userId: user.id, slug, visibility: "PUBLIC", showRanks: true },
  })

  const node = await prisma.lineageNode.create({
    data: {
      id: `${TAG_PREFIX}-${runId}-${slugify(label)}-node`,
      userId: user.id,
      slug: `${slug}-node`,
      visibility: "PUBLIC",
      isVerified: true,
      bio: `${displayName} lineage fixture profile.`,
    },
  })

  return { user, node, displayName }
}

async function seedLineageCompFixture(): Promise<LineageCompSeedFixture> {
  await sweepStaleRows()

  const runId = makeRunId()
  const createdEntitlementIds: string[] = []
  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium", createdEntitlementIds)
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite", createdEntitlementIds)

  const discipline = await prisma.discipline.create({
    data: {
      id: `${TAG_PREFIX}-${runId}-discipline`,
      brand: TEST_BRAND,
      name: `E2E Lineage Comp Discipline ${runId}`,
      slug: slugify(`${TAG_PREFIX}-discipline-${runId}`),
      code: slugify(`lc-${runId}`).slice(0, 16),
    },
  })

  const rankSystem = await prisma.rankSystem.create({
    data: {
      id: `${TAG_PREFIX}-${runId}-rank-system`,
      brand: TEST_BRAND,
      name: `${TAG_PREFIX} Rank System ${runId}`,
      disciplineId: discipline.id,
    },
  })

  const ranks = await Promise.all(
    RANKS.map((rankName, index) =>
      prisma.rank.create({
        data: {
          id: `${TAG_PREFIX}-${runId}-${slugify(rankName)}-rank`,
          brand: TEST_BRAND,
          rankSystemId: rankSystem.id,
          sortOrder: index + 1,
          name: `${TAG_PREFIX} ${rankName} ${runId}`,
          shortName: rankName
            .split(" ")
            .map(part => part[0])
            .join(""),
          colorHex: ["#f8fafc", "#2563eb", "#7c3aed", "#7c2d12", "#111827"][index],
        },
      }),
    ),
  )
  const blackBeltRank = ranks.at(-1)!

  const tree = await prisma.lineageTree.create({
    data: {
      id: `${TAG_PREFIX}-${runId}-tree`,
      brand: TEST_BRAND,
      slug: slugify(`${TAG_PREFIX}-tree-${runId}`),
      name: `E2E Lineage Comp ${runId}`,
      description: `E2E lineage comp multi-rank tree ${TAG_PREFIX} ${runId}`,
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
      disciplineId: discipline.id,
    },
  })

  const instructorUserIds: string[] = []
  const studentUserIds: string[] = []
  const nodeIds: string[] = []
  const memberIds: string[] = []
  const rankAwardIds: string[] = []
  const relationshipIds: string[] = []
  const groupIds: string[] = []
  const students: LineageCompSeedStudent[] = []
  const premiumUserIds: string[] = []
  const eliteUserIds: string[] = []

  const instructorEntries: Array<{
    user: { id: string }
    node: { id: string }
    displayName: string
    member: { id: string }
  }> = []
  for (const instructorLabel of INSTRUCTORS) {
    const instructor = await createUserNode({ runId, label: instructorLabel, role: "admin" })
    instructorUserIds.push(instructor.user.id)
    nodeIds.push(instructor.node.id)

    const rankAward = await prisma.rankAward.create({
      data: {
        id: `${TAG_PREFIX}-${runId}-${slugify(instructorLabel)}-rank-award`,
        userId: instructor.user.id,
        rankId: blackBeltRank.id,
        awardedAt: new Date(Date.UTC(2010, 0, 1)),
      },
    })
    rankAwardIds.push(rankAward.id)

    const member = await prisma.lineageTreeMember.create({
      data: {
        id: `${TAG_PREFIX}-${runId}-${slugify(instructorLabel)}-member`,
        treeId: tree.id,
        nodeId: instructor.node.id,
        rankAwardId: rankAward.id,
        visualSortOrder: instructorEntries.length * 1000,
      },
    })
    memberIds.push(member.id)
    instructorEntries.push({ ...instructor, member })
  }

  await prisma.lineageTree.update({
    where: { id: tree.id },
    data: {
      ownerNodeId: instructorEntries[0]!.node.id,
      defaultRootMemberId: instructorEntries[0]!.member.id,
    },
  })

  for (const [instructorIndex, instructor] of instructorEntries.entries()) {
    for (const [rankIndex, rank] of ranks.entries()) {
      const group = await prisma.lineageVisualGroup.create({
        data: {
          id: `${TAG_PREFIX}-${runId}-${slugify(instructor.user.id)}-${rankIndex}-group`,
          treeId: tree.id,
          parentMemberId: instructor.member.id,
          label: `${rank.name} students`,
          promotionDate: new Date(Date.UTC(2026, instructorIndex, rankIndex + 1)),
          showPublicLabel: true,
          sortOrder: rankIndex * 100,
        },
      })
      groupIds.push(group.id)

      for (let studentIndex = 1; studentIndex <= STUDENTS_PER_RANK; studentIndex++) {
        const label = `${instructor.displayName} ${RANKS[rankIndex]} Student ${studentIndex}`
        const student = await createUserNode({ runId, label })
        studentUserIds.push(student.user.id)
        nodeIds.push(student.node.id)

        const rankAward = await prisma.rankAward.create({
          data: {
            id: `${TAG_PREFIX}-${runId}-${slugify(label)}-rank-award`,
            userId: student.user.id,
            rankId: rank.id,
            awardedById: instructor.user.id,
            awardedAt: new Date(Date.UTC(2020 + rankIndex, studentIndex - 1, 1)),
          },
        })
        rankAwardIds.push(rankAward.id)

        const member = await prisma.lineageTreeMember.create({
          data: {
            id: `${TAG_PREFIX}-${runId}-${slugify(label)}-member`,
            treeId: tree.id,
            nodeId: student.node.id,
            rankAwardId: rankAward.id,
            primaryVisualParentMemberId: instructor.member.id,
            visualGroupId: group.id,
            visualSortOrder: studentIndex * 10,
          },
        })
        memberIds.push(member.id)

        const relationship = await prisma.lineageRelationship.create({
          data: {
            id: `${TAG_PREFIX}-${runId}-${slugify(label)}-relationship`,
            type: "PROMOTED_BY",
            fromNodeId: instructor.node.id,
            toNodeId: student.node.id,
            rankAwardId: rankAward.id,
            isVerified: true,
            verificationStatus: "VERIFIED",
          },
        })
        relationshipIds.push(relationship.id)

        let compTier: LineageCompTierState = "NONE"
        const studentOrdinal = students.length
        if (studentOrdinal === 0 || studentOrdinal === 7) {
          compTier = "PREMIUM"
          premiumUserIds.push(student.user.id)
          await grantComp({
            db: prisma,
            brand: TEST_BRAND,
            grantorUserId: instructor.user.id,
            granteeUserId: student.user.id,
            entitlementKeys: [LINEAGE_PREMIUM_ENTITLEMENT_KEY],
            reason: "seed-premium",
          })
        } else if (studentOrdinal === 1 || studentOrdinal === 8) {
          compTier = "ELITE"
          eliteUserIds.push(student.user.id)
          await grantComp({
            db: prisma,
            brand: TEST_BRAND,
            grantorUserId: instructor.user.id,
            granteeUserId: student.user.id,
            entitlementKeys: [LINEAGE_PREMIUM_ENTITLEMENT_KEY, LINEAGE_ELITE_ENTITLEMENT_KEY],
            term: { days: 365 },
            reason: "seed-elite",
          })
        }

        students.push({
          userId: student.user.id,
          nodeId: student.node.id,
          memberId: member.id,
          rankId: rank.id,
          rankAwardId: rankAward.id,
          instructorUserId: instructor.user.id,
          rankName: rank.name,
          displayName: student.displayName,
          compTier,
        })
      }
    }
  }

  return {
    runId,
    treeId: tree.id,
    treeSlug: tree.slug,
    disciplineId: discipline.id,
    rankSystemId: rankSystem.id,
    rankIds: ranks.map(rank => rank.id),
    instructorUserIds,
    studentUserIds,
    nodeIds,
    memberIds,
    rankAwardIds,
    relationshipIds,
    groupIds,
    students,
    premiumUserIds,
    eliteUserIds,
    createdEntitlementIds,
  }
}

async function readLineageCompFixtureState(
  fixture: LineageCompSeedFixture,
): Promise<LineageCompSeedState> {
  const members = await prisma.lineageTreeMember.findMany({
    where: { id: { in: fixture.students.map(student => student.memberId) } },
    select: {
      id: true,
      primaryVisualParent: {
        select: {
          node: { select: { userId: true } },
        },
      },
      selectedRankAward: {
        select: {
          rank: { select: { name: true } },
        },
      },
    },
  })
  const grants = await prisma.userEntitlement.findMany({
    where: {
      userId: { in: fixture.studentUserIds },
      status: "ACTIVE",
      entitlement: {
        brand: TEST_BRAND,
        key: { in: [LINEAGE_PREMIUM_ENTITLEMENT_KEY, LINEAGE_ELITE_ENTITLEMENT_KEY] },
      },
    },
    select: { userId: true },
  })

  const studentCountByInstructorAndRank: LineageCompSeedState["studentCountByInstructorAndRank"] =
    {}
  for (const member of members) {
    const instructorUserId = member.primaryVisualParent?.node.userId
    const rankName = member.selectedRankAward?.rank.name
    if (!instructorUserId || !rankName) continue

    studentCountByInstructorAndRank[instructorUserId] ??= {}
    studentCountByInstructorAndRank[instructorUserId]![rankName] ??= 0
    studentCountByInstructorAndRank[instructorUserId]![rankName]! += 1
  }

  const compGrantCountByUserId: Record<string, number> = {}
  for (const grant of grants) {
    compGrantCountByUserId[grant.userId] ??= 0
    compGrantCountByUserId[grant.userId]! += 1
  }

  return { studentCountByInstructorAndRank, compGrantCountByUserId }
}

async function cleanupLineageCompFixture(fixture: LineageCompSeedFixture) {
  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { userId: { in: [...fixture.instructorUserIds, ...fixture.studentUserIds] } },
        { entityId: { contains: TAG_PREFIX } },
      ],
    },
  })
  await prisma.userEntitlement.deleteMany({ where: { userId: { in: fixture.studentUserIds } } })
  await prisma.lineageRelationship.deleteMany({ where: { id: { in: fixture.relationshipIds } } })
  await prisma.lineageTreeMember.deleteMany({ where: { id: { in: fixture.memberIds } } })
  await prisma.lineageVisualGroup.deleteMany({ where: { id: { in: fixture.groupIds } } })
  await prisma.lineageTree.deleteMany({ where: { id: fixture.treeId } })
  await prisma.lineageNode.deleteMany({ where: { id: { in: fixture.nodeIds } } })
  await prisma.rankAward.deleteMany({ where: { id: { in: fixture.rankAwardIds } } })
  await prisma.rank.deleteMany({ where: { id: { in: fixture.rankIds } } })
  await prisma.rankSystem.deleteMany({ where: { id: fixture.rankSystemId } })
  await prisma.discipline.deleteMany({ where: { id: fixture.disciplineId } })
  await prisma.session.deleteMany({
    where: { userId: { in: [...fixture.instructorUserIds, ...fixture.studentUserIds] } },
  })
  await prisma.directoryProfile.deleteMany({
    where: { userId: { in: [...fixture.instructorUserIds, ...fixture.studentUserIds] } },
  })
  await prisma.passport.deleteMany({
    where: { userId: { in: [...fixture.instructorUserIds, ...fixture.studentUserIds] } },
  })
  await prisma.user.deleteMany({
    where: { id: { in: [...fixture.instructorUserIds, ...fixture.studentUserIds] } },
  })

  for (const entitlementId of fixture.createdEntitlementIds) {
    await prisma.entitlement.delete({ where: { id: entitlementId } })
  }
}

const decodeFixture = () => {
  const encodedFixture = process.argv[3]
  if (!encodedFixture) {
    throw new Error("Missing encoded lineage comp fixture")
  }

  return JSON.parse(
    Buffer.from(encodedFixture, "base64").toString("utf-8"),
  ) as LineageCompSeedFixture
}

const command = process.argv[2]

if (command === "seed") {
  const fixture = await seedLineageCompFixture()
  process.stdout.write(JSON.stringify(fixture))
} else if (command === "state") {
  const state = await readLineageCompFixtureState(decodeFixture())
  process.stdout.write(JSON.stringify(state))
} else if (command === "cleanup") {
  await cleanupLineageCompFixture(decodeFixture())
} else {
  throw new Error(`Unknown lineage comp fixture command: ${command ?? "<missing>"}`)
}
