/**
 * Bun-only E2E seed helper for authenticated lineage lifecycle coverage.
 *
 * The fixture intentionally includes hidden members, but the public claim form
 * and public tree routes should still only expose the public claim target.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, type UserRole } from "../../.generated/prisma/client"
import type { LineageLifecycleFixture, LineageLifecycleState } from "./seed-lineage-lifecycle"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

// Single-brand collapse (ADR 0034): every request resolves to Brand.BBL, so
// fixtures MUST seed under BBL or brand-scoped queries 404 the whole flow.
const TEST_BRAND = "BBL" as const
const TAG_PREFIX = "session-0251-lineage-e2e"
const LINEAGE_PREMIUM_ENTITLEMENT_KEY = "LINEAGE_PREMIUM"
// Claim-approval comps the ELITE tier (cumulative → PREMIUM + ELITE), so the ELITE
// definition must exist for this brand or grantComp throws "Entitlement … not found".
const LINEAGE_ELITE_ENTITLEMENT_KEY = "LINEAGE_ELITE"

type Visibility = "PUBLIC" | "UNLISTED" | "RESTRICTED" | "PRIVATE"

const makeRunId = () => `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-")

async function sweepStaleLifecycleRows() {
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
    where: {
      OR: [{ userId: { in: userIds } }, { entityId: { in: [...treeIds, ...nodeIds] } }],
    },
  })
  await prisma.lineageClaimEvidence.deleteMany({
    where: { claimRequest: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] } },
  })
  await prisma.lineageClaimRequest.deleteMany({
    where: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] },
  })
  // SESSION_0440 — the unified door (ADR 0036) writes PassportClaimRequest; its node/tree
  // FKs are SetNull-on-delete, so a stale row survives the node/tree sweep above unless we
  // delete it here (its passport may also be an accountless placeholder the user-sweep misses).
  await prisma.passportClaimEvidence.deleteMany({
    where: { claimRequest: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] } },
  })
  await prisma.passportClaimRequest.deleteMany({
    where: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] },
  })
  await prisma.lineageTreeAccess.deleteMany({
    where: { OR: [{ treeId: { in: treeIds } }, { userId: { in: userIds } }] },
  })
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
  await prisma.rank.deleteMany({ where: { name: { contains: "E2E Black Belt" } } })
  await prisma.rankSystem.deleteMany({
    where: { name: { contains: "E2E Lifecycle Rank System" } },
  })
  await prisma.discipline.deleteMany({ where: { slug: { contains: TAG_PREFIX } } })
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.userEntitlement.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.directoryProfile.deleteMany({ where: { passport: { userId: { in: userIds } } } })
  await prisma.passport.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
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

  // Ensure the ELITE definition exists too — claim-approval grants the cumulative
  // ELITE tier and grantComp throws if its Entitlement row is missing for the brand.
  await prisma.entitlement.upsert({
    where: { brand_key: { brand: TEST_BRAND, key: LINEAGE_ELITE_ENTITLEMENT_KEY } },
    update: {},
    create: {
      brand: TEST_BRAND,
      key: LINEAGE_ELITE_ENTITLEMENT_KEY,
      name: "Lineage Elite",
      description: "Elite lineage-tree access entitlement for E2E fixtures.",
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

async function createUser({
  runId,
  label,
  role = "user",
  isPlaceholder = false,
}: {
  runId: string
  label: string
  role?: UserRole
  isPlaceholder?: boolean
}) {
  const displayName = `E2E ${label} ${runId}`
  const slug = slugify(`${TAG_PREFIX}-${label}-${runId}`)

  const user = await prisma.user.create({
    data: {
      name: displayName,
      email: `${slug}@test.local`,
      emailVerified: true,
      role,
      isPlaceholder,
    },
  })

  // Phase 3c (SOT-ADR D1): a placeholder is an accountless Passport (claimable); a real person's
  // Passport links the account. Satellites hang off passportId.
  const passport = await prisma.passport.create({
    data: isPlaceholder ? { displayName } : { userId: user.id, displayName },
    select: { id: true },
  })
  await prisma.directoryProfile.create({
    data: { passportId: passport.id, slug },
  })

  return { user, passport, displayName, slug }
}

async function createUserNode({
  runId,
  label,
  visibility,
  isPlaceholder = false,
}: {
  runId: string
  label: string
  visibility: Visibility
  isPlaceholder?: boolean
}) {
  const entry = await createUser({ runId, label, isPlaceholder })
  const node = await prisma.lineageNode.create({
    data: {
      passportId: entry.passport.id,
      slug: `${entry.slug}-node`,
      visibility,
      isVerified: true,
      bio: `${entry.displayName} original lineage bio.`,
    },
  })

  return { ...entry, node }
}

async function seedLineageLifecycleFixture(): Promise<LineageLifecycleFixture> {
  await sweepStaleLifecycleRows()

  const runId = makeRunId()
  const searchToken = `${TAG_PREFIX}-${runId}`
  const treeSlug = slugify(`${searchToken}-tree`)
  const treeName = `E2E Authenticated Lineage ${runId}`

  const [claimant, admin, treeEditor] = await Promise.all([
    createUser({ runId, label: "Claimant" }),
    createUser({ runId, label: "Admin Reviewer", role: "admin" }),
    createUser({ runId, label: "Tree Editor" }),
  ])

  const publicEntry = await createUserNode({
    runId,
    label: "Claim Target",
    visibility: "PUBLIC",
    isPlaceholder: true,
  })
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

  const discipline = await prisma.discipline.create({
    data: {
      brand: TEST_BRAND,
      name: `E2E Lifecycle Discipline ${runId}`,
      slug: slugify(`${searchToken}-discipline`),
      code: slugify(`e2e-${runId}`).slice(0, 16),
    },
  })

  const rankSystem = await prisma.rankSystem.create({
    data: {
      brand: TEST_BRAND,
      name: `E2E Lifecycle Rank System ${runId}`,
      disciplineId: discipline.id,
    },
  })

  const rank = await prisma.rank.create({
    data: {
      brand: TEST_BRAND,
      rankSystemId: rankSystem.id,
      sortOrder: 1,
      name: `E2E Black Belt ${runId}`,
      shortName: "BB",
      colorHex: "#111827",
    },
  })

  const rankAward = await prisma.rankAward.create({
    data: {
      passportId: publicEntry.passport.id,
      rankId: rank.id,
      awardedAt: new Date(Date.UTC(2020, 0, 1)),
    },
  })

  const tree = await prisma.lineageTree.create({
    data: {
      brand: TEST_BRAND,
      slug: treeSlug,
      name: treeName,
      description: `E2E authenticated lifecycle tree ${searchToken}`,
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
      disciplineId: discipline.id,
      ownerNodeId: publicEntry.node.id,
    },
  })

  const publicGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Public Lifecycle Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 10,
      promotionDate: new Date(Date.UTC(2026, 0, 1)),
    },
  })
  const unlistedGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Unlisted Lifecycle Hidden Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 20,
      promotionDate: new Date(Date.UTC(2026, 0, 2)),
    },
  })
  const restrictedGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Restricted Lifecycle Hidden Group ${runId}`,
      showPublicLabel: true,
      sortOrder: 30,
      promotionDate: new Date(Date.UTC(2026, 0, 3)),
    },
  })
  const privateGroup = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      label: `E2E Private Lifecycle Hidden Group ${runId}`,
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

  /**
   * SESSION_0265 — drag/reorder e2e additive seed.
   *
   * Adds 3 public sibling members parented under publicMember, split across
   * two sibling visual groups. Both groups have parentMemberId=publicMember so
   * the canvas drag-end same-parent guard still permits cross-group moves.
   * Existing lifecycle tests ignore these because they only assert on the
   * original claim-target / hidden members.
   */
  const siblingEntries = await Promise.all(
    (["Sibling A", "Sibling B", "Sibling C"] as const).map(label =>
      createUserNode({ runId, label, visibility: "PUBLIC" }),
    ),
  )
  // Seed group B with one anchor sibling so the column renders as a drop target
  // (buildChildGroups in lineage-tree-canvas.tsx only emits groups that have at
  // least one child member).
  const siblingGroupBAnchor = await createUserNode({
    runId,
    label: "Sibling D Anchor",
    visibility: "PUBLIC",
  })

  const siblingGroupA = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      parentMemberId: publicMember.id,
      label: `E2E Drag Sibling Group A ${runId}`,
      groupType: "CUSTOM",
      promotionDate: new Date(Date.UTC(2027, 0, 1)),
      showPublicLabel: true,
      sortOrder: 100,
    },
  })
  const siblingGroupB = await prisma.lineageVisualGroup.create({
    data: {
      treeId: tree.id,
      parentMemberId: publicMember.id,
      label: `E2E Drag Sibling Group B ${runId}`,
      groupType: "CUSTOM",
      promotionDate: new Date(Date.UTC(2027, 0, 2)),
      showPublicLabel: true,
      sortOrder: 200,
    },
  })

  const siblingInitialSortOrders = [100, 200, 300] as const
  const siblingMembers = await Promise.all(
    siblingEntries.map((entry, index) =>
      prisma.lineageTreeMember.create({
        data: {
          treeId: tree.id,
          nodeId: entry.node.id,
          primaryVisualParentMemberId: publicMember.id,
          visualGroupId: siblingGroupA.id,
          visualSortOrder: siblingInitialSortOrders[index]!,
        },
      }),
    ),
  )
  const siblingGroupBAnchorMember = await prisma.lineageTreeMember.create({
    data: {
      treeId: tree.id,
      nodeId: siblingGroupBAnchor.node.id,
      primaryVisualParentMemberId: publicMember.id,
      visualGroupId: siblingGroupB.id,
      visualSortOrder: 100,
    },
  })

  await prisma.lineageTreeAccess.create({
    data: {
      treeId: tree.id,
      userId: treeEditor.user.id,
      grantedById: admin.user.id,
      role: "TREE_EDITOR",
    },
  })

  const claimantPremiumEntitlement = await grantLineagePremiumEntitlement({
    userId: claimant.user.id,
    sourceId: `${TAG_PREFIX}:claimant:${runId}`,
  })

  return {
    treeId: tree.id,
    treeSlug,
    treeName,
    searchToken,
    claimTargetNodeId: publicEntry.node.id,
    claimTargetMemberId: publicMember.id,
    claimTargetName: publicEntry.displayName,
    placeholderUserId: publicEntry.user.id,
    claimantUserId: claimant.user.id,
    claimantPremiumEntitlementId: claimantPremiumEntitlement.id,
    adminUserId: admin.user.id,
    treeEditorUserId: treeEditor.user.id,
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
      claimant.user.id,
      admin.user.id,
      treeEditor.user.id,
      publicEntry.user.id,
      unlistedEntry.user.id,
      restrictedEntry.user.id,
      privateEntry.user.id,
      ...siblingEntries.map(entry => entry.user.id),
      siblingGroupBAnchor.user.id,
    ],
    nodeIds: [
      publicEntry.node.id,
      unlistedEntry.node.id,
      restrictedEntry.node.id,
      privateEntry.node.id,
      ...siblingEntries.map(entry => entry.node.id),
      siblingGroupBAnchor.node.id,
    ],
    memberIds: [
      publicMember.id,
      unlistedMember.id,
      restrictedMember.id,
      privateMember.id,
      ...siblingMembers.map(member => member.id),
      siblingGroupBAnchorMember.id,
    ],
    groupIds: [
      publicGroup.id,
      unlistedGroup.id,
      restrictedGroup.id,
      privateGroup.id,
      siblingGroupA.id,
      siblingGroupB.id,
    ],
    rankAwardId: rankAward.id,
    rankId: rank.id,
    rankSystemId: rankSystem.id,
    disciplineId: discipline.id,
    siblingParentMemberId: publicMember.id,
    siblingGroupAId: siblingGroupA.id,
    siblingGroupBId: siblingGroupB.id,
    siblingGroupBLabel: siblingGroupB.label,
    siblingMemberIds: [siblingMembers[0]!.id, siblingMembers[1]!.id, siblingMembers[2]!.id],
    siblingNodeIds: [
      siblingEntries[0]!.node.id,
      siblingEntries[1]!.node.id,
      siblingEntries[2]!.node.id,
    ],
    siblingNames: [
      siblingEntries[0]!.displayName,
      siblingEntries[1]!.displayName,
      siblingEntries[2]!.displayName,
    ],
    siblingInitialSortOrders: [
      siblingInitialSortOrders[0],
      siblingInitialSortOrders[1],
      siblingInitialSortOrders[2],
    ],
  }
}

async function readLineageLifecycleState(
  fixture: LineageLifecycleFixture,
): Promise<LineageLifecycleState> {
  const [
    claim,
    node,
    placeholderUser,
    grant,
    passport,
    rankAward,
    promoterRelationship,
    siblingMembers,
    siblingRelationshipCount,
  ] = await Promise.all([
    // SESSION_0440: the node-submit door now writes the unified PassportClaimRequest
    // (ADR 0036 / P5), so the lifecycle assertions read it here. status/claimantNote/
    // reviewerNote/evidence carry the same shape they did on LineageClaimRequest.
    prisma.passportClaimRequest.findFirst({
      where: {
        treeId: fixture.treeId,
        nodeId: fixture.claimTargetNodeId,
        claimantUserId: fixture.claimantUserId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        claimantNote: true,
        reviewerNote: true,
        evidence: {
          select: { label: true, url: true, text: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.lineageNode.findUnique({
      where: { id: fixture.claimTargetNodeId },
      select: { passport: { select: { userId: true } }, bio: true },
    }),
    prisma.user.findUnique({
      where: { id: fixture.placeholderUserId },
      select: { archivedAt: true },
    }),
    prisma.lineageTreeAccess.findFirst({
      where: {
        treeId: fixture.treeId,
        userId: fixture.claimantUserId,
        nodeId: fixture.claimTargetNodeId,
        memberId: fixture.claimTargetMemberId,
        revokedAt: null,
      },
      select: { id: true, role: true, userId: true },
    }),
    prisma.passport.findUnique({
      where: { userId: fixture.claimantUserId },
      select: { displayName: true },
    }),
    prisma.rankAward.findUnique({
      where: { id: fixture.rankAwardId },
      select: { awardedAt: true },
    }),
    prisma.lineageRelationship.findFirst({
      where: {
        type: "PROMOTED_BY",
        toNodeId: fixture.claimTargetNodeId,
        rankAwardId: fixture.rankAwardId,
      },
      select: {
        fromNodeId: true,
        toNodeId: true,
        rankAwardId: true,
        verificationStatus: true,
        isVerified: true,
      },
    }),
    prisma.lineageTreeMember.findMany({
      where: { id: { in: fixture.siblingMemberIds } },
      select: {
        id: true,
        nodeId: true,
        visualSortOrder: true,
        visualGroupId: true,
        primaryVisualParentMemberId: true,
      },
    }),
    prisma.lineageRelationship.count({
      where: {
        OR: [
          { fromNodeId: { in: fixture.siblingNodeIds } },
          { toNodeId: { in: fixture.siblingNodeIds } },
        ],
      },
    }),
  ])

  return {
    claim: claim
      ? {
          id: claim.id,
          status: claim.status,
          claimantNote: claim.claimantNote,
          reviewerNote: claim.reviewerNote,
          evidence: claim.evidence,
        }
      : null,
    nodeOwnerId: node?.passport?.userId ?? null,
    placeholderArchivedAt: placeholderUser?.archivedAt?.toISOString() ?? null,
    accessGrant: grant,
    passportDisplayName: passport?.displayName ?? null,
    nodeBio: node?.bio ?? null,
    rankAwardedAt: rankAward?.awardedAt?.toISOString() ?? null,
    promoterRelationship,
    siblings: siblingMembers,
    siblingRelationshipCount,
  }
}

async function cleanupLineageLifecycleFixture(fixture: LineageLifecycleFixture) {
  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { userId: { in: fixture.userIds } },
        { entityId: fixture.claimTargetMemberId },
        { entityId: fixture.claimTargetNodeId },
      ],
    },
  })
  await prisma.lineageClaimEvidence.deleteMany({
    where: { claimRequest: { treeId: fixture.treeId } },
  })
  await prisma.lineageClaimRequest.deleteMany({ where: { treeId: fixture.treeId } })
  // SESSION_0440 — unified PassportClaimRequest rows written by the node-submit door.
  await prisma.passportClaimEvidence.deleteMany({
    where: { claimRequest: { treeId: fixture.treeId } },
  })
  await prisma.passportClaimRequest.deleteMany({ where: { treeId: fixture.treeId } })
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
  await prisma.rankAward.deleteMany({ where: { id: fixture.rankAwardId } })
  await prisma.rank.deleteMany({ where: { id: fixture.rankId } })
  await prisma.rankSystem.deleteMany({ where: { id: fixture.rankSystemId } })
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
  const encodedFixture = process.argv[3]
  if (!encodedFixture) {
    throw new Error("Missing encoded lineage lifecycle fixture")
  }

  return JSON.parse(
    Buffer.from(encodedFixture, "base64").toString("utf-8"),
  ) as LineageLifecycleFixture
}

const command = process.argv[2]

if (command === "seed") {
  const fixture = await seedLineageLifecycleFixture()
  process.stdout.write(JSON.stringify(fixture))
} else if (command === "state") {
  const state = await readLineageLifecycleState(decodeFixture())
  process.stdout.write(JSON.stringify(state))
} else if (command === "cleanup") {
  await cleanupLineageLifecycleFixture(decodeFixture())
} else {
  throw new Error(`Unknown seed-lineage-lifecycle command: ${command ?? "<missing>"}`)
}
