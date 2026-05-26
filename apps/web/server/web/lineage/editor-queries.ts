import type { Brand, LineageTreeAccessRole } from "~/.generated/prisma/client"
import { type AuthzUser, isAdmin } from "~/lib/authz"
import {
  type LineageNodeProfile,
  type LineageTreeMemberRow,
  type LineageTreeSummary,
  type LineageVisualGroupRow,
  lineageNodeProfilePayload,
  lineageTreePublicPayload,
} from "~/server/web/lineage/payloads"
import { db } from "~/services/db"

type LineageEditorGrantSource = "global-admin" | "organization-admin" | "explicit-access"

export type LineageEditorCapability = {
  roles: LineageTreeAccessRole[]
  sources: LineageEditorGrantSource[]
  canPreview: boolean
  canEditTree: boolean
  canManageGroups: boolean
  canManageAcl: boolean
  canReviewClaims: boolean
  canPublish: boolean
}

type AccessInput = {
  isGlobalAdmin: boolean
  hasOrganizationAdminGrant: boolean
  explicitRoles: LineageTreeAccessRole[]
}

export type EditableLineageTree = {
  id: string
  name: string
  slug: string
  scopeType: string
  visibility: string
  isPublished: boolean
  organizationName: string | null
  disciplineName: string | null
  updatedAt: Date
  memberCount: number
  visualGroupCount: number
  claimCount: number
  capability: LineageEditorCapability
}

export type LineageEditorTreeResult = {
  tree: LineageTreeSummary
  members: LineageTreeMemberRow[]
  visualGroups: LineageVisualGroupRow[]
  defaultRootMemberId: string | null
  profilesById: Record<string, LineageNodeProfile>
  capability: LineageEditorCapability
}

const editorRoles = new Set<LineageTreeAccessRole>([
  "TREE_ADMIN",
  "TREE_EDITOR",
  "BRANCH_EDITOR",
  "NODE_EDITOR",
])

const treeEditRoles = new Set<LineageTreeAccessRole>(["TREE_ADMIN", "TREE_EDITOR"])

export function resolveLineageEditorCapability({
  isGlobalAdmin,
  hasOrganizationAdminGrant,
  explicitRoles,
}: AccessInput): LineageEditorCapability {
  const roleSet = new Set<LineageTreeAccessRole>()
  const sources: LineageEditorGrantSource[] = []

  if (isGlobalAdmin) {
    roleSet.add("TREE_ADMIN")
    sources.push("global-admin")
  }

  if (hasOrganizationAdminGrant) {
    roleSet.add("TREE_ADMIN")
    sources.push("organization-admin")
  }

  for (const role of explicitRoles) {
    if (editorRoles.has(role)) {
      roleSet.add(role)
    }
  }

  if (explicitRoles.some(role => editorRoles.has(role))) {
    sources.push("explicit-access")
  }

  const roles = Array.from(roleSet)
  const hasTreeAdmin = roles.includes("TREE_ADMIN")

  return {
    roles,
    sources,
    canPreview: roles.length > 0,
    canEditTree: roles.some(role => treeEditRoles.has(role)),
    canManageGroups: hasTreeAdmin,
    canManageAcl: hasTreeAdmin,
    canReviewClaims: hasTreeAdmin,
    canPublish: hasTreeAdmin,
  }
}

async function findOrganizationAdminIds(user: AuthzUser, brand: Brand): Promise<Set<string>> {
  if (isAdmin(user)) {
    return new Set()
  }

  const organizations = await db.organization.findMany({
    where: {
      brand,
      OR: [
        { ownerId: user.id },
        {
          memberships: {
            some: {
              userId: user.id,
              status: "ACTIVE",
              roleAssignments: {
                some: { role: { code: { in: ["OWNER", "ORG_ADMIN"] } } },
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  })

  return new Set(organizations.map(organization => organization.id))
}

async function findExplicitAccessByTree(userId: string) {
  const grants = await db.lineageTreeAccess.findMany({
    where: {
      userId,
      revokedAt: null,
      role: { in: Array.from(editorRoles) },
    },
    select: {
      treeId: true,
      role: true,
    },
  })

  const rolesByTree = new Map<string, LineageTreeAccessRole[]>()

  for (const grant of grants) {
    const roles = rolesByTree.get(grant.treeId) ?? []
    roles.push(grant.role)
    rolesByTree.set(grant.treeId, roles)
  }

  return rolesByTree
}

export async function findEditableLineageTrees({
  brand,
  user,
}: {
  brand: Brand
  user: AuthzUser
}): Promise<EditableLineageTree[]> {
  const userIsAdmin = isAdmin(user)
  const [organizationAdminIds, explicitAccessByTree] = await Promise.all([
    findOrganizationAdminIds(user, brand),
    findExplicitAccessByTree(user.id),
  ])

  const explicitTreeIds = Array.from(explicitAccessByTree.keys())

  if (!userIsAdmin && organizationAdminIds.size === 0 && explicitTreeIds.length === 0) {
    return []
  }

  const trees = await db.lineageTree.findMany({
    where: {
      brand,
      ...(userIsAdmin
        ? {}
        : {
            OR: [
              { id: { in: explicitTreeIds } },
              {
                scopeType: "ORGANIZATION",
                organizationId: { in: Array.from(organizationAdminIds) },
              },
            ],
          }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      scopeType: true,
      visibility: true,
      isPublished: true,
      organizationId: true,
      updatedAt: true,
      organization: {
        select: { name: true },
      },
      discipline: {
        select: { name: true },
      },
      _count: {
        select: {
          members: true,
          visualGroups: true,
          claimRequests: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  })

  return trees.map(tree => {
    const explicitRoles = explicitAccessByTree.get(tree.id) ?? []
    const hasOrganizationAdminGrant = Boolean(
      tree.scopeType === "ORGANIZATION" &&
        tree.organizationId &&
        organizationAdminIds.has(tree.organizationId),
    )

    return {
      id: tree.id,
      name: tree.name,
      slug: tree.slug,
      scopeType: tree.scopeType,
      visibility: tree.visibility,
      isPublished: tree.isPublished,
      organizationName: tree.organization?.name ?? null,
      disciplineName: tree.discipline?.name ?? null,
      updatedAt: tree.updatedAt,
      memberCount: tree._count.members,
      visualGroupCount: tree._count.visualGroups,
      claimCount: tree._count.claimRequests,
      capability: resolveLineageEditorCapability({
        isGlobalAdmin: userIsAdmin,
        hasOrganizationAdminGrant,
        explicitRoles,
      }),
    }
  })
}

export async function getLineageEditorTree({
  brand,
  treeId,
  user,
}: {
  brand: Brand
  treeId: string
  user: AuthzUser
}): Promise<LineageEditorTreeResult | null> {
  const tree = await db.lineageTree.findFirst({
    where: { id: treeId, brand },
    select: lineageTreePublicPayload,
  })

  if (!tree) {
    return null
  }

  const [organizationAdminIds, explicitAccessByTree] = await Promise.all([
    findOrganizationAdminIds(user, brand),
    findExplicitAccessByTree(user.id),
  ])

  const capability = resolveLineageEditorCapability({
    isGlobalAdmin: isAdmin(user),
    hasOrganizationAdminGrant: Boolean(
      tree.scopeType === "ORGANIZATION" &&
        tree.organizationId &&
        organizationAdminIds.has(tree.organizationId),
    ),
    explicitRoles: explicitAccessByTree.get(tree.id) ?? [],
  })

  if (!capability.canPreview) {
    return null
  }

  const nodeIds = tree.members.map(member => member.nodeId)
  const profiles =
    nodeIds.length > 0
      ? await db.lineageNode.findMany({
          where: { id: { in: nodeIds } },
          select: lineageNodeProfilePayload,
        })
      : []

  const profilesById: Record<string, LineageNodeProfile> = {}
  for (const profile of profiles) {
    profilesById[profile.id] = profile
  }

  const { members, visualGroups, ...summary } = tree

  return {
    tree: summary,
    members,
    visualGroups,
    defaultRootMemberId: tree.defaultRootMemberId,
    profilesById,
    capability,
  }
}
