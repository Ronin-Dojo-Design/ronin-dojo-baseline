/**
 * Bun-only E2E seed helper — creates a published public lineage tree with one
 * PUBLIC member and three non-public members. Playwright runs in Node, while
 * the generated Prisma client in this repo runs cleanly under Bun, so
 * seed-lineage.ts shells into this file for DB work.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"
import type { LineageVisibilityFixture } from "./seed-lineage"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const TAG_PREFIX = "session-0249-lineage-e2e"

type Visibility = "PUBLIC" | "UNLISTED" | "RESTRICTED" | "PRIVATE"

const makeRunId = () => `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-")

async function createUserNode({
  runId,
  label,
  visibility,
}: {
  runId: string
  label: string
  visibility: Visibility
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
    data: { passportId: passport.id, slug },
  })

  const node = await prisma.lineageNode.create({
    data: {
      passportId: passport.id,
      slug: `${slug}-node`,
      visibility,
      isVerified: true,
      bio: `${displayName} biography should only render when this node is visible.`,
    },
  })

  return { user, node, displayName }
}

async function seedLineageVisibilityFixture(): Promise<LineageVisibilityFixture> {
  const runId = makeRunId()
  const searchToken = `${TAG_PREFIX}-${runId}`
  const treeSlug = slugify(`${searchToken}-tree`)
  const treeName = `E2E Lineage Visibility ${runId}`

  const publicEntry = await createUserNode({ runId, label: "Public Member", visibility: "PUBLIC" })
  const unlistedEntry = await createUserNode({
    runId,
    label: "Unlisted Member",
    visibility: "UNLISTED",
  })
  const restrictedEntry = await createUserNode({
    runId,
    label: "Restricted Member",
    visibility: "RESTRICTED",
  })
  const privateEntry = await createUserNode({
    runId,
    label: "Private Member",
    visibility: "PRIVATE",
  })

  const tree = await prisma.lineageTree.create({
    data: {
      brand: TEST_BRAND,
      slug: treeSlug,
      name: treeName,
      description: `E2E public no-leak tree ${searchToken}`,
      visibility: "PUBLIC",
      isPublished: true,
      ownerNodeId: publicEntry.node.id,
    },
  })

  const publicGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Public Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 10,
      promotionDate: new Date(Date.UTC(2026, 0, 1)),
    },
  })
  const unlistedGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Unlisted Hidden Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 20,
      promotionDate: new Date(Date.UTC(2026, 0, 2)),
    },
  })
  const restrictedGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Restricted Hidden Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 30,
      promotionDate: new Date(Date.UTC(2026, 0, 3)),
    },
  })
  const privateGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Private Hidden Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 40,
      promotionDate: new Date(Date.UTC(2026, 0, 4)),
    },
  })

  const publicMember = await prisma.lineageTreeMember.create({
    data: {
      treeId: tree.id,
      nodeId: publicEntry.node.id,
      visualSortOrder: 10,
      visualGroupId: publicGroup.id,
    },
  })
  const unlistedMember = await prisma.lineageTreeMember.create({
    data: {
      treeId: tree.id,
      nodeId: unlistedEntry.node.id,
      visualSortOrder: 20,
      visualGroupId: unlistedGroup.id,
    },
  })
  const restrictedMember = await prisma.lineageTreeMember.create({
    data: {
      treeId: tree.id,
      nodeId: restrictedEntry.node.id,
      visualSortOrder: 30,
      visualGroupId: restrictedGroup.id,
    },
  })
  const privateMember = await prisma.lineageTreeMember.create({
    data: {
      treeId: tree.id,
      nodeId: privateEntry.node.id,
      visualSortOrder: 40,
      visualGroupId: privateGroup.id,
    },
  })

  await prisma.lineageTree.update({
    where: { id: tree.id },
    data: { defaultRootMemberId: publicMember.id },
  })

  return {
    treeId: tree.id,
    treeSlug,
    treeName,
    searchToken,
    publicName: publicEntry.displayName,
    hiddenNames: {
      unlisted: unlistedEntry.displayName,
      restricted: restrictedEntry.displayName,
      private: privateEntry.displayName,
    },
    hiddenGroupLabels: {
      unlisted: unlistedGroup.label,
      restricted: restrictedGroup.label,
      private: privateGroup.label,
    },
    userIds: [
      publicEntry.user.id,
      unlistedEntry.user.id,
      restrictedEntry.user.id,
      privateEntry.user.id,
    ],
    nodeIds: [
      publicEntry.node.id,
      unlistedEntry.node.id,
      restrictedEntry.node.id,
      privateEntry.node.id,
    ],
    memberIds: [publicMember.id, unlistedMember.id, restrictedMember.id, privateMember.id],
    groupIds: [publicGroup.id, unlistedGroup.id, restrictedGroup.id, privateGroup.id],
  }
}

async function cleanupLineageVisibilityFixture(fixture: LineageVisibilityFixture) {
  await prisma.lineageClaimEvidence.deleteMany({
    where: { claimRequest: { treeId: fixture.treeId } },
  })
  await prisma.lineageClaimRequest.deleteMany({ where: { treeId: fixture.treeId } })
  await prisma.lineageTreeAccess.deleteMany({ where: { treeId: fixture.treeId } })
  await prisma.lineageRelationship.deleteMany({
    where: {
      OR: [{ fromNodeId: { in: fixture.nodeIds } }, { toNodeId: { in: fixture.nodeIds } }],
    },
  })
  await prisma.lineageTreeMember.deleteMany({ where: { id: { in: fixture.memberIds } } })
  await prisma.lineageVisualGroup.deleteMany({ where: { id: { in: fixture.groupIds } } })
  await prisma.lineageTree.deleteMany({ where: { id: fixture.treeId } })
  await prisma.lineageNode.deleteMany({ where: { id: { in: fixture.nodeIds } } })
  await prisma.session.deleteMany({ where: { userId: { in: fixture.userIds } } })
  await prisma.directoryProfile.deleteMany({
    where: { passport: { userId: { in: fixture.userIds } } },
  })
  await prisma.passport.deleteMany({ where: { userId: { in: fixture.userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: fixture.userIds } } })
}

const command = process.argv[2]

if (command === "seed") {
  const fixture = await seedLineageVisibilityFixture()
  process.stdout.write(JSON.stringify(fixture))
} else if (command === "cleanup") {
  const encodedFixture = process.argv[3]
  if (!encodedFixture) {
    throw new Error("Missing encoded lineage fixture")
  }
  const fixture = JSON.parse(
    Buffer.from(encodedFixture, "base64").toString("utf-8"),
  ) as LineageVisibilityFixture
  await cleanupLineageVisibilityFixture(fixture)
} else {
  throw new Error(`Unknown seed-lineage command: ${command ?? "<missing>"}`)
}
