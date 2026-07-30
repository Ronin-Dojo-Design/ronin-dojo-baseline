import "server-only"

import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { isAdmin } from "~/lib/authz-predicates"
import { db } from "~/services/db"

/**
 * BBL-EDITOR-005 (viewer slice, SESSION_0726): read-only listing of the `LineageTreeAccess` grants
 * on a tree, for the admin lineage tree detail page. NO writes — grant/revoke is a deferred,
 * supervised slice. Row-scoping mirrors `findLineageTreeDetail` (server/admin/lineage/queries.ts):
 * platform admins see every grant; non-admins are narrowed to trees they hold a TREE_ADMIN grant
 * on (identity-only "who am I" filter, not an action gate).
 */
export const findLineageTreeAccessGrants = async (treeId: string) => {
  const session = await getServerSession()
  const isPlatformAdmin = isAdmin(session?.user)

  if (!isPlatformAdmin && !session?.user.id) {
    return []
  }

  const tree = await db.lineageTree.findFirst({
    where: {
      id: treeId,
      brand: Brand.BBL,
      ...(isPlatformAdmin
        ? {}
        : {
            accessGrants: {
              some: {
                // Non-null: the early return above bailed unless `isPlatformAdmin` OR a
                // signed-in user id exists; this is the non-admin branch, so id is present.
                userId: session!.user.id,
                role: "TREE_ADMIN",
                revokedAt: null,
              },
            },
          }),
    },
    select: { id: true },
  })

  if (!tree) {
    return []
  }

  const grants = await db.lineageTreeAccess.findMany({
    where: { treeId, revokedAt: null },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
          passport: { select: { displayName: true } },
        },
      },
    },
  })

  return grants.map(grant => ({
    id: grant.id,
    role: grant.role,
    createdAt: grant.createdAt,
    granteeName: grant.user.passport?.displayName ?? grant.user.name ?? grant.user.email,
  }))
}

export type LineageTreeAccessGrantRow = Awaited<
  ReturnType<typeof findLineageTreeAccessGrants>
>[number]
