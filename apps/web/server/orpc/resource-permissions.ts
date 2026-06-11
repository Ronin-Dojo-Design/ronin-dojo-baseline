import type { LineageTreeAccessRole } from "~/.generated/prisma/client"
import type { SessionUser } from "~/server/orpc/context"
import { can, matchesPattern } from "~/server/orpc/permissions"
import { LINEAGE_RESOURCE_GRANTS, type Permission } from "~/server/orpc/roles"
import type { db as appDb } from "~/services/db"

/**
 * BBL resource-scoped authorization (SOT-ADR D4).
 *
 * Upstream `can(user, permission)` is role-based ONLY — it has no per-resource
 * ownership concept. BBL needs per-resource authority: `TREE_ADMIN` of *a
 * tree*, `BRANCH_EDITOR` of *a branch*, `NODE_EDITOR` of *a node* (the existing
 * `LineageTreeAccess` model). This module EXTENDS `can()` additively:
 *
 * - `canWithGrants(...)` — PURE. Given preloaded `LineageTreeAccess`-shaped
 *   rows and a target resource, decides authorization with no DB access. Unit
 *   testable in isolation.
 * - `canForResource(db, ...)` — thin async resolver. Loads the user's active
 *   grants for the tree and delegates to `canWithGrants`.
 *
 * The flat-role path is preserved byte-for-byte: both entry points consult
 * `can()` FIRST, so a globally-granted permission (or the `admin` wildcard)
 * authorizes regardless of resource scope, exactly as before. Resource grants
 * can only ever ADD authority, never remove it.
 */

type AppDb = typeof appDb

/**
 * A preloaded `LineageTreeAccess` row, narrowed to the fields the matcher
 * needs. Shaped to match the Prisma model directly so callers can pass query
 * results through without remapping (see `canForResource`'s `select`).
 *
 * Scope columns by role:
 * - `TREE_ADMIN` / `TREE_EDITOR` — whole `treeId` (scope columns null).
 * - `BRANCH_EDITOR` — branch rooted at `rootMemberId`.
 * - `NODE_EDITOR` — single `nodeId` (and/or `memberId`).
 *
 * A non-null `revokedAt` means the grant is inactive and is ignored.
 */
export type LineageGrant = {
  role: LineageTreeAccessRole
  treeId: string
  rootMemberId?: string | null
  memberId?: string | null
  nodeId?: string | null
  revokedAt?: Date | null
}

/**
 * Identifies the lineage target a permission is requested against.
 *
 * Branch matching is intentionally pre-resolved: `branchRootMemberIds` is the
 * set of member ids that root a branch CONTAINING the target (the target's own
 * member id plus its ancestor chain up to the tree root). A `BRANCH_EDITOR`
 * grant rooted at any id in this set covers the target. The caller — which
 * already holds the member graph (mirroring
 * `editor-graph.isLineageMemberInBranch`) — computes this set so the matcher
 * stays pure and DB-free.
 */
export type LineageResource = {
  treeId: string
  nodeId?: string | null
  memberId?: string | null
  branchRootMemberIds?: ReadonlyArray<string>
}

/** Does a grant's scope cover the target resource? (Tree already matched.) */
const scopeCoversResource = (grant: LineageGrant, resource: LineageResource): boolean => {
  switch (grant.role) {
    case "TREE_ADMIN":
    case "TREE_EDITOR":
      // Tree-wide: any resource in the (already matched) tree is in scope.
      return true
    case "BRANCH_EDITOR":
      return (
        grant.rootMemberId != null &&
        (resource.branchRootMemberIds?.includes(grant.rootMemberId) ?? false)
      )
    case "NODE_EDITOR":
      return (
        (grant.nodeId != null && grant.nodeId === resource.nodeId) ||
        (grant.memberId != null && grant.memberId === resource.memberId)
      )
    default:
      // Unknown / future role string: deny-by-default.
      return false
  }
}

/** Does this single grant authorize the permission on the resource? */
const grantAuthorizes = (
  grant: LineageGrant,
  permission: Permission,
  resource: LineageResource,
): boolean => {
  if (grant.revokedAt) {
    return false
  }
  if (grant.treeId !== resource.treeId) {
    return false
  }

  const roleGrants = LINEAGE_RESOURCE_GRANTS[grant.role] ?? []
  if (!roleGrants.some(roleGrant => matchesPattern(roleGrant, permission))) {
    return false
  }

  return scopeCoversResource(grant, resource)
}

/**
 * Can a user perform a permission ON A SPECIFIC RESOURCE, given preloaded
 * grants? PURE — no DB, fully unit-testable.
 *
 * Flat global roles are consulted first (`can()`), so this is a strict superset
 * of the flat check: `admin` and any globally-granted permission pass without
 * needing a grant. Otherwise a single matching, in-scope, non-revoked grant
 * authorizes.
 */
export const canWithGrants = (
  user: SessionUser | null | undefined,
  permission: Permission,
  resource: LineageResource,
  grants: ReadonlyArray<LineageGrant>,
): boolean => {
  if (can(user, permission)) {
    return true
  }

  return grants.some(grant => grantAuthorizes(grant, permission, resource))
}

/**
 * Resolve `LineageTreeAccess` grants for the user on the resource's tree and
 * delegate to `canWithGrants`.
 *
 * Short-circuits the query when the flat role already authorizes, and for
 * anonymous callers (no user → no resource grants possible).
 */
export const canForResource = async (
  db: AppDb,
  user: SessionUser | null | undefined,
  permission: Permission,
  resource: LineageResource,
): Promise<boolean> => {
  if (can(user, permission)) {
    return true
  }
  if (!user) {
    return false
  }

  const grants = await db.lineageTreeAccess.findMany({
    where: {
      treeId: resource.treeId,
      userId: user.id,
      revokedAt: null,
    },
    select: {
      role: true,
      treeId: true,
      rootMemberId: true,
      memberId: true,
      nodeId: true,
      revokedAt: true,
    },
  })

  return canWithGrants(user, permission, resource, grants)
}
