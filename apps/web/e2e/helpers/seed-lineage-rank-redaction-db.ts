/**
 * Bun-only seed helper for SESSION_0265_TASK_03 (public DOM rank-redaction).
 *
 * Creates a published PUBLIC lineage tree with two PUBLIC members. Both have
 * rank awards. Member-A has DirectoryProfile.showRanks=true, Member-B has
 * showRanks=false. The Playwright spec then walks the public drawer DOM for
 * each member and asserts the redaction contract reaches the rendered HTML.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"
import type { LineageRankRedactionFixture } from "./seed-lineage-rank-redaction"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const TAG_PREFIX = "session-0265-rank-redaction-e2e"
const LINEAGE_PREMIUM_ENTITLEMENT_KEY = "LINEAGE_PREMIUM"

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

  const treeIds = staleTrees.map(t => t.id)
  const userIds = staleUsers.map(u => u.id)
  const nodeIds = staleNodes.map(n => n.id)

  if (treeIds.length === 0 && userIds.length === 0 && nodeIds.length === 0) return

  await prisma.lineageRelationship.deleteMany({
    where: { OR: [{ fromNodeId: { in: nodeIds } }, { toNodeId: { in: nodeIds } }] },
  })
  await prisma.lineageTreeMember.deleteMany({
    where: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] },
  })
  await prisma.lineageVisualGroup.deleteMany({ where: { treeId: { in: treeIds } } })
  await prisma.lineageTree.deleteMany({ where: { id: { in: treeIds } } })
  await prisma.lineageNode.deleteMany({ where: { id: { in: nodeIds } } })
  await prisma.rankAward.deleteMany({ where: { passport: { userId: { in: userIds } } } })
  await prisma.rank.deleteMany({ where: { name: { contains: TAG_PREFIX } } })
  await prisma.rankSystem.deleteMany({ where: { name: { contains: TAG_PREFIX } } })
  await prisma.discipline.deleteMany({ where: { slug: { contains: TAG_PREFIX } } })
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.userEntitlement.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.directoryProfile.deleteMany({ where: { passport: { userId: { in: userIds } } } })
  await prisma.passport.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
}

async function createUser({ runId, label }: { runId: string; label: string }) {
  const displayName = `E2E ${label} ${runId}`
  const slug = slugify(`${TAG_PREFIX}-${label}-${runId}`)

  const user = await prisma.user.create({
    data: {
      name: displayName,
      email: `${slug}@test.local`,
      emailVerified: true,
      role: "user",
    },
  })

  const passport = await prisma.passport.create({
    data: { userId: user.id, displayName },
    select: { id: true },
  })
  await prisma.directoryProfile.create({
    data: {
      passportId: passport.id,
      slug,
      visibility: "PUBLIC",
    },
  })

  return { user, passport, displayName, slug }
}

async function grantLineagePremiumEntitlement({
  userId,
  sourceId,
}: {
  userId: string
  sourceId: string
}) {
  const entitlement = await prisma.entitlement.upsert({
    where: { brand_key: { brand: TEST_BRAND, key: LINEAGE_PREMIUM_ENTITLEMENT_KEY } },
    update: {},
    create: {
      brand: TEST_BRAND,
      key: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      name: "Lineage Premium",
      description: "Premium lineage-tree access entitlement for E2E fixtures.",
    },
  })

  return prisma.userEntitlement.create({
    data: {
      userId,
      entitlementId: entitlement.id,
      sourceType: "MANUAL_GRANT",
      sourceId,
      status: "ACTIVE",
    },
  })
}

async function createUserNode({
  runId,
  label,
  showRanks,
}: {
  runId: string
  label: string
  showRanks: boolean
}) {
  const displayName = `E2E ${label} ${runId}`
  const slug = slugify(`${TAG_PREFIX}-${label}-${runId}`)

  const user = await prisma.user.create({
    data: {
      name: displayName,
      email: `${slug}@test.local`,
      emailVerified: true,
      role: "user",
    },
  })

  const passport = await prisma.passport.create({
    data: { userId: user.id, displayName },
    select: { id: true },
  })
  await prisma.directoryProfile.create({
    data: {
      passportId: passport.id,
      slug,
      visibility: "PUBLIC",
      showRanks,
    },
  })

  const node = await prisma.lineageNode.create({
    data: {
      passportId: passport.id,
      slug: `${slug}-node`,
      visibility: "PUBLIC",
      isVerified: true,
      bio: `${displayName} biography line.`,
    },
  })

  return { user, passport, node, displayName, slug }
}

async function seedFixture(): Promise<LineageRankRedactionFixture> {
  await sweepStaleRows()

  const runId = makeRunId()
  const treeSlug = slugify(`${TAG_PREFIX}-tree-${runId}`)
  const treeName = `E2E Rank Redaction ${runId}`

  const memberAEntry = await createUserNode({
    runId,
    label: "Rank Visible Member A",
    showRanks: true,
  })
  const memberBEntry = await createUserNode({
    runId,
    label: "Rank Hidden Member B",
    showRanks: false,
  })
  const premiumViewer = await createUser({ runId, label: "Premium Rank Viewer" })
  const viewerPremiumEntitlement = await grantLineagePremiumEntitlement({
    userId: premiumViewer.user.id,
    sourceId: `${TAG_PREFIX}:viewer:${runId}`,
  })

  const discipline = await prisma.discipline.create({
    data: {
      brand: TEST_BRAND,
      name: `E2E Rank Redaction Discipline ${runId}`,
      slug: slugify(`${TAG_PREFIX}-discipline-${runId}`),
      code: slugify(`rr-${runId}`).slice(0, 16),
    },
  })

  const visibleRankSystem = await prisma.rankSystem.create({
    data: {
      brand: TEST_BRAND,
      name: `${TAG_PREFIX} Visible Rank System ${runId}`,
      disciplineId: discipline.id,
    },
  })

  const hiddenRankSystem = await prisma.rankSystem.create({
    data: {
      brand: TEST_BRAND,
      name: `${TAG_PREFIX} Hidden Rank System ${runId}`,
      disciplineId: discipline.id,
    },
  })

  // Use distinct, distinctive rank labels per member so spec assertions are
  // unambiguous — each control has its own rank system, so the visible
  // member's public belt ladder cannot serialize the hidden control rank.
  const rankA = await prisma.rank.create({
    data: {
      brand: TEST_BRAND,
      rankSystemId: visibleRankSystem.id,
      sortOrder: 1,
      name: `${TAG_PREFIX} Visible Black Belt ${runId}`,
      shortName: `VBB${runId.slice(-4)}`,
      colorHex: "#111827",
    },
  })

  const rankB = await prisma.rank.create({
    data: {
      brand: TEST_BRAND,
      rankSystemId: hiddenRankSystem.id,
      sortOrder: 2,
      name: `${TAG_PREFIX} Hidden Black Belt ${runId}`,
      shortName: `HBB${runId.slice(-4)}`,
      colorHex: "#7c2d12",
    },
  })

  const rankAwardA = await prisma.rankAward.create({
    data: {
      passportId: memberAEntry.passport.id,
      rankId: rankA.id,
      awardedAt: new Date(Date.UTC(2020, 0, 1)),
    },
  })

  const rankAwardB = await prisma.rankAward.create({
    data: {
      passportId: memberBEntry.passport.id,
      rankId: rankB.id,
      awardedAt: new Date(Date.UTC(2021, 0, 1)),
    },
  })

  const tree = await prisma.lineageTree.create({
    data: {
      brand: TEST_BRAND,
      slug: treeSlug,
      name: treeName,
      description: `E2E rank redaction tree ${TAG_PREFIX} ${runId}`,
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
      disciplineId: discipline.id,
      ownerNodeId: memberAEntry.node.id,
    },
  })

  const publicGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `${TAG_PREFIX} Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 10,
      promotionDate: new Date(Date.UTC(2026, 0, 1)),
    },
  })

  const memberA = await prisma.lineageTreeMember.create({
    data: {
      treeId: tree.id,
      nodeId: memberAEntry.node.id,
      rankAwardId: rankAwardA.id,
      visualSortOrder: 10,
      visualGroupId: publicGroup.id,
    },
  })

  const memberB = await prisma.lineageTreeMember.create({
    data: {
      treeId: tree.id,
      nodeId: memberBEntry.node.id,
      rankAwardId: rankAwardB.id,
      visualSortOrder: 20,
      visualGroupId: publicGroup.id,
    },
  })

  await prisma.lineageTree.update({
    where: { id: tree.id },
    data: { defaultRootMemberId: memberA.id },
  })

  return {
    treeId: tree.id,
    treeSlug,
    treeName,
    viewerUserId: premiumViewer.user.id,
    viewerPremiumEntitlementId: viewerPremiumEntitlement.id,
    memberA: {
      userId: memberAEntry.user.id,
      nodeId: memberAEntry.node.id,
      memberId: memberA.id,
      displayName: memberAEntry.displayName,
      rankAwardId: rankAwardA.id,
      rankName: rankA.name,
      rankShortName: rankA.shortName ?? "",
      rankSystemName: visibleRankSystem.name,
      disciplineName: discipline.name,
    },
    memberB: {
      userId: memberBEntry.user.id,
      nodeId: memberBEntry.node.id,
      memberId: memberB.id,
      displayName: memberBEntry.displayName,
      rankAwardId: rankAwardB.id,
      rankName: rankB.name,
      rankShortName: rankB.shortName ?? "",
      rankSystemName: hiddenRankSystem.name,
      disciplineName: discipline.name,
    },
    userIds: [memberAEntry.user.id, memberBEntry.user.id, premiumViewer.user.id],
    nodeIds: [memberAEntry.node.id, memberBEntry.node.id],
    memberIds: [memberA.id, memberB.id],
    groupIds: [publicGroup.id],
    rankIds: [rankA.id, rankB.id],
    rankAwardIds: [rankAwardA.id, rankAwardB.id],
    rankSystemId: visibleRankSystem.id,
    rankSystemIds: [visibleRankSystem.id, hiddenRankSystem.id],
    disciplineId: discipline.id,
  }
}

async function cleanupFixture(fixture: LineageRankRedactionFixture) {
  await prisma.lineageRelationship.deleteMany({
    where: {
      OR: [{ fromNodeId: { in: fixture.nodeIds } }, { toNodeId: { in: fixture.nodeIds } }],
    },
  })
  await prisma.lineageTreeMember.deleteMany({ where: { id: { in: fixture.memberIds } } })
  await prisma.lineageVisualGroup.deleteMany({ where: { id: { in: fixture.groupIds } } })
  await prisma.lineageTree.deleteMany({ where: { id: fixture.treeId } })
  await prisma.lineageNode.deleteMany({ where: { id: { in: fixture.nodeIds } } })
  await prisma.rankAward.deleteMany({ where: { id: { in: fixture.rankAwardIds } } })
  await prisma.rank.deleteMany({ where: { id: { in: fixture.rankIds } } })
  await prisma.rankSystem.deleteMany({
    where: { id: { in: fixture.rankSystemIds ?? [fixture.rankSystemId] } },
  })
  await prisma.discipline.deleteMany({ where: { id: fixture.disciplineId } })
  await prisma.session.deleteMany({ where: { userId: { in: fixture.userIds } } })
  await prisma.userEntitlement.deleteMany({ where: { userId: { in: fixture.userIds } } })
  await prisma.directoryProfile.deleteMany({
    where: { passport: { userId: { in: fixture.userIds } } },
  })
  await prisma.passport.deleteMany({ where: { userId: { in: fixture.userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: fixture.userIds } } })
}

const decodeFixture = () => {
  const encoded = process.argv[3]
  if (!encoded) {
    throw new Error("Missing encoded rank-redaction fixture")
  }
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as LineageRankRedactionFixture
}

const command = process.argv[2]

if (command === "seed") {
  const fixture = await seedFixture()
  process.stdout.write(JSON.stringify(fixture))
} else if (command === "cleanup") {
  await cleanupFixture(decodeFixture())
} else {
  throw new Error(`Unknown seed-lineage-rank-redaction command: ${command ?? "<missing>"}`)
}
