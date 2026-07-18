import assert from "node:assert/strict"
import { db as defaultDb } from "~/services/db"

// biome-ignore lint/suspicious/noExplicitAny: mirrors the prior local tx helper surface.
export type TestTransactionClient = any
// biome-ignore lint/suspicious/noExplicitAny: test fixture cleanup spans many Prisma delegates.
type FixtureDb = any

class RollbackTransaction extends Error {
  constructor() {
    super("ROLLBACK_TEST_TRANSACTION")
    this.name = "RollbackTransaction"
  }
}

export async function inRolledBackTx<T>(
  body: (tx: TestTransactionClient) => Promise<T>,
  db: Pick<typeof defaultDb, "$transaction"> = defaultDb,
): Promise<T> {
  let result: T | undefined

  try {
    await db.$transaction(async tx => {
      result = await body(tx)
      throw new RollbackTransaction()
    })
  } catch (error) {
    if (!(error instanceof RollbackTransaction)) throw error
  }

  return result as T
}

export type FixtureRunIdentity = {
  prefix: string
  runId: string
  tag: (name: string) => string
  slug: (name: string) => string
  email: (name: string) => string
  shortCode: (label?: string) => string
}

export function createFixtureRunIdentity(prefix: string): FixtureRunIdentity {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8)
  const runId = `${Date.now()}-${suffix}`
  const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  return {
    prefix,
    runId,
    tag: name => `${prefix}-${name}-${runId}`,
    slug: name => slugify(`${prefix}-${name}-${runId}`),
    email: name => `${slugify(`${prefix}-${name}-${runId}`)}@test.local`,
    // 16-char budget for Discipline.code. Keep the unique suffix instead of truncating it off.
    shortCode: (label = "fx") => slugify(`${label}-${suffix}`).slice(0, 16),
  }
}

export type FixtureOwnership = {
  userIds?: string[]
  treeIds?: string[]
  nodeIds?: string[]
  memberIds?: string[]
  groupIds?: string[]
  rankAwardIds?: string[]
  rankIds?: string[]
  rankSystemIds?: string[]
  disciplineIds?: string[]
  organizationIds?: string[]
  entitlementIds?: string[]
  rankNameContains?: string[]
  rankSystemNameContains?: string[]
  disciplineSlugContains?: string[]
  organizationNameContains?: string[]
}

const values = (input: string[] | undefined) => input?.filter(Boolean) ?? []
const has = (input: string[] | undefined) => values(input).length > 0

function containsOr(needles: string[] | undefined) {
  const terms = values(needles)
  return terms.length ? terms.map(term => ({ contains: term })) : undefined
}

export async function findTaggedLineageOwnership(
  db: FixtureDb,
  tag: { treeDescriptionContains?: string; userEmailContains?: string; nodeSlugContains?: string },
): Promise<Pick<FixtureOwnership, "treeIds" | "userIds" | "nodeIds">> {
  const [trees, users, nodes] = await Promise.all([
    tag.treeDescriptionContains
      ? db.lineageTree.findMany({
          where: { description: { contains: tag.treeDescriptionContains } },
          select: { id: true },
        })
      : Promise.resolve([]),
    tag.userEmailContains
      ? db.user.findMany({
          where: { email: { contains: tag.userEmailContains } },
          select: { id: true },
        })
      : Promise.resolve([]),
    tag.nodeSlugContains
      ? db.lineageNode.findMany({
          where: { slug: { contains: tag.nodeSlugContains } },
          select: { id: true },
        })
      : Promise.resolve([]),
  ])

  return {
    treeIds: trees.map((tree: { id: string }) => tree.id),
    userIds: users.map((user: { id: string }) => user.id),
    nodeIds: nodes.map((node: { id: string }) => node.id),
  }
}

export async function cleanupTaggedLineageFixtures(
  db: FixtureDb,
  tag: {
    treeDescriptionContains?: string
    userEmailContains?: string
    nodeSlugContains?: string
    rankNameContains?: string[]
    rankSystemNameContains?: string[]
    disciplineSlugContains?: string[]
  },
) {
  const ownership = await findTaggedLineageOwnership(db, tag)
  if (!has(ownership.treeIds) && !has(ownership.userIds) && !has(ownership.nodeIds)) return

  await cleanupOwnedTestRows(db, {
    ...ownership,
    rankNameContains: tag.rankNameContains,
    rankSystemNameContains: tag.rankSystemNameContains,
    disciplineSlugContains: tag.disciplineSlugContains,
  })
}

export async function cleanupOwnedTestRows(db: FixtureDb, owned: FixtureOwnership) {
  const userIds = values(owned.userIds)
  const treeIds = values(owned.treeIds)
  const nodeIds = values(owned.nodeIds)
  const memberIds = values(owned.memberIds)
  const groupIds = values(owned.groupIds)
  const rankAwardIds = values(owned.rankAwardIds)
  const rankIds = values(owned.rankIds)
  const rankSystemIds = values(owned.rankSystemIds)
  const disciplineIds = values(owned.disciplineIds)
  const organizationIds = values(owned.organizationIds)
  const entitlementIds = values(owned.entitlementIds)

  if (userIds.length || treeIds.length || nodeIds.length || memberIds.length) {
    await db.auditLog.deleteMany({
      where: {
        OR: [
          ...(userIds.length ? [{ userId: { in: userIds } }] : []),
          ...[...treeIds, ...nodeIds, ...memberIds].map(entityId => ({ entityId })),
        ],
      },
    })
  }

  if (userIds.length) await db.userEntitlement.deleteMany({ where: { userId: { in: userIds } } })
  if (treeIds.length || nodeIds.length) {
    await db.lineageClaimEvidence.deleteMany({
      where: { claimRequest: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] } },
    })
    await db.lineageClaimRequest.deleteMany({
      where: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] },
    })
    await db.passportClaimEvidence.deleteMany({
      where: { claimRequest: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] } },
    })
    await db.passportClaimRequest.deleteMany({
      where: { OR: [{ treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }] },
    })
  }

  if (treeIds.length || userIds.length) {
    await db.lineageTreeAccess.deleteMany({
      where: { OR: [{ treeId: { in: treeIds } }, { userId: { in: userIds } }] },
    })
  }
  if (nodeIds.length) {
    await db.lineageRelationship.deleteMany({
      where: { OR: [{ fromNodeId: { in: nodeIds } }, { toNodeId: { in: nodeIds } }] },
    })
  }
  if (memberIds.length || treeIds.length || nodeIds.length) {
    await db.lineageTreeMember.deleteMany({
      where: {
        OR: [{ id: { in: memberIds } }, { treeId: { in: treeIds } }, { nodeId: { in: nodeIds } }],
      },
    })
  }
  if (groupIds.length || treeIds.length) {
    await db.lineageVisualGroup.deleteMany({
      where: { OR: [{ id: { in: groupIds } }, { treeId: { in: treeIds } }] },
    })
  }
  if (treeIds.length) await db.lineageTree.deleteMany({ where: { id: { in: treeIds } } })
  if (nodeIds.length) await db.lineageNode.deleteMany({ where: { id: { in: nodeIds } } })

  if (rankAwardIds.length || userIds.length) {
    await db.rankAward.deleteMany({
      where: {
        OR: [{ id: { in: rankAwardIds } }, { passport: { userId: { in: userIds } } }],
      },
    })
  }

  const rankNameFilters = containsOr(owned.rankNameContains)
  if (rankIds.length || rankNameFilters) {
    await db.rank.deleteMany({
      where: { OR: [{ id: { in: rankIds } }, ...(rankNameFilters ?? []).map(name => ({ name }))] },
    })
  }

  const rankSystemNameFilters = containsOr(owned.rankSystemNameContains)
  if (rankSystemIds.length || rankSystemNameFilters) {
    await db.rankSystem.deleteMany({
      where: {
        OR: [
          { id: { in: rankSystemIds } },
          ...(rankSystemNameFilters ?? []).map(name => ({ name })),
        ],
      },
    })
  }

  if (userIds.length) await db.membership.deleteMany({ where: { userId: { in: userIds } } })

  const organizationNameFilters = containsOr(owned.organizationNameContains)
  if (organizationIds.length || organizationNameFilters) {
    await db.organization.deleteMany({
      where: {
        OR: [
          { id: { in: organizationIds } },
          ...(organizationNameFilters ?? []).map(name => ({ name })),
        ],
      },
    })
  }

  const disciplineSlugFilters = containsOr(owned.disciplineSlugContains)
  if (disciplineIds.length || disciplineSlugFilters) {
    await db.discipline.deleteMany({
      where: {
        OR: [
          { id: { in: disciplineIds } },
          ...(disciplineSlugFilters ?? []).map(slug => ({ slug })),
        ],
      },
    })
  }

  if (entitlementIds.length) {
    await db.entitlement.deleteMany({ where: { id: { in: entitlementIds } } })
  }

  if (userIds.length) {
    await db.session.deleteMany({ where: { userId: { in: userIds } } })
    await db.directoryProfile.deleteMany({
      where: { passport: { userId: { in: userIds } } },
    })
    await db.passport.deleteMany({ where: { userId: { in: userIds } } })
    await db.user.deleteMany({ where: { id: { in: userIds } } })
  }
}

export type CountNeutralCounters = Record<string, () => Promise<number>>

export async function readFixtureCounts(counters: CountNeutralCounters) {
  const entries = await Promise.all(
    Object.entries(counters).map(async ([name, count]) => [name, await count()] as const),
  )
  return Object.fromEntries(entries) as Record<string, number>
}

export async function expectCountNeutral<T>(
  counters: CountNeutralCounters,
  body: () => Promise<T>,
): Promise<T> {
  const before = await readFixtureCounts(counters)
  const result = await body()
  const after = await readFixtureCounts(counters)
  assert.deepEqual(after, before)
  return result
}
