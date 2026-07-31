import type { Prisma } from "~/.generated/prisma/client"

/**
 * SESSION_0726 ggr pass 1 — the shared non-admin `LineageTreeAccess` scope predicate, extracted
 * out of a verbatim triplicate (`findLineageTrees` + `findLineageTreeDetail` in this file, and
 * `findLineageTreeAccessGrants` in `server/web/lineage/tree-access-queries.ts`).
 *
 * Row-scoping for lineage-tree admin surfaces: platform admins see every tree (empty fragment,
 * no narrowing); non-admins are narrowed to trees they hold an ACTIVE (non-revoked) TREE_ADMIN
 * grant on. This is an identity-only "who am I" data filter, not an action gate — callers still
 * gate the earlier "no session at all" case themselves via `isAdmin()` + `session?.user.id`.
 *
 * Pure/no-DB, type-only Prisma import — same shape as `buildPublishedLineageTreeWhere`
 * (`server/web/lineage/tree-where.ts`), so it's unit-testable without a database.
 */
export function treeAdminScopeWhere(
  isPlatformAdmin: boolean,
  userId: string | undefined,
): Prisma.LineageTreeWhereInput {
  if (isPlatformAdmin) return {}

  return {
    accessGrants: {
      some: {
        // Non-null: every call site early-returns unless `isPlatformAdmin` OR a signed-in
        // user id exists — this is the non-admin branch, so `userId` is present.
        userId: userId!,
        role: "TREE_ADMIN",
        revokedAt: null,
      },
    },
  }
}
