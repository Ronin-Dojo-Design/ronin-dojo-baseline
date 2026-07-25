import { ORPCError } from "@orpc/server"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { RankAwardSource, RankAwardVerificationStatus } from "~/.generated/prisma/client"
import { removeS3Directories } from "~/lib/media"
import { idsSchema } from "~/server/admin/shared/schema"
import { createPersonSchema, userSchema } from "~/server/admin/users/schema"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { createPassport } from "~/server/identity/person-service"
import { authedProcedure } from "~/server/orpc/procedure"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { createLineageMember } from "~/server/web/lineage/create-lineage-member"
import { db } from "~/services/db"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

/**
 * Admin users router (WL-P2-43, SESSION_0697) — the `/app/users` mutations migrated off the
 * retiring next-safe-action seam (`server/admin/users/actions.ts`, deleted) onto oRPC
 * (ADR 0024 full-oRPC direction / SOT-ADR D3).
 *
 * Why this migration exists: the safe-action ctx `revalidate({ paths, tags })` seam cannot
 * express Next's LAYOUT-typed revalidation, so these actions imported
 * `revalidatePath(path, "layout")` directly — a third revalidation idiom (seam bypass,
 * FI-025). Here the procedure OWNS its revalidation: the layout-typed call is idiomatic
 * inside the handler (an oRPC handler runs in the `/api/rpc` Route Handler / rsc transport,
 * where `revalidatePath` is first-class), and the deferred tag work stays on the oRPC
 * `context.revalidate` seam. The third idiom dies with the seam bypass.
 *
 * Authz: `meta.permission = APP_AREA_PERMISSIONS.users` ("users.manage") on every procedure —
 * the same string that gates the `/app/users` layout (SOT-ADR D5: the layout gate and the
 * procedure gate share one string). Only admin `"*"` grants it today, preserving the old
 * `adminActionClient` admin-only boundary.
 */

const usersProcedure = authedProcedure.meta({ permission: APP_AREA_PERMISSIONS.users })

/**
 * Layout-typed revalidation for the whole `/app/users` subtree. The edit form and role
 * toggle live on the dynamic detail page (`/app/users/[id]`); a plain path revalidation
 * only busts the list, so the detail page would re-render stale values on return (the
 * `/admin`→`/app` stale-revalidate class, FI-025). Runs before the handler returns, so the
 * caller's follow-up `router.refresh()` observes fresh data.
 */
const revalidateUsersSubtree = () => {
  revalidatePath("/app/users", "layout")
}

const update = usersProcedure.input(userSchema).handler(async ({ input, context }) => {
  const { id, ...data } = input
  if (!id) {
    throw new ORPCError("BAD_REQUEST", { message: "User id is required." })
  }

  const actor = context.user
  const updated = await db.$transaction(async tx => {
    const before = await tx.user.findUnique({ where: { id }, select: { role: true } })
    const roleChanged = data.role !== undefined && data.role !== before?.role

    // A role change through the generic edit gets the same self-guard + audit as the dedicated
    // role procedure — an admin cannot change their own role (WL-P2-20 / risk-register #11).
    if (roleChanged && id === actor.id) {
      throw new ORPCError("FORBIDDEN", { message: "You cannot change your own role." })
    }

    const user = await tx.user.update({ where: { id }, data })

    if (roleChanged) {
      await tx.auditLog.create({
        data: {
          brand: context.brand,
          action: "user.role.changed",
          entityType: "User",
          entityId: id,
          userId: actor.id,
          before: { role: before?.role ?? null },
          after: { role: data.role },
        },
      })
    }

    return user
  })

  revalidateUsersSubtree()

  return updated
})

const remove = usersProcedure.input(idsSchema).handler(async ({ input, context }) => {
  const deletedUserIds = await db.$transaction(async tx => {
    const requestedUserIds = [...new Set(input.ids)].sort()
    const initialEligibleUsers = await tx.user.findMany({
      where: { id: { in: requestedUserIds }, role: { not: "admin" } },
      select: { id: true, passport: { select: { id: true } } },
      orderBy: { id: "asc" },
    })
    const passportIds = initialEligibleUsers.flatMap(user =>
      user.passport ? [user.passport.id] : [],
    )

    // Global identity lock law: Passport before User. Claim merge holds the Passport tier before
    // attachAccount touches User; taking these in reverse would create a delete-vs-claim cycle.
    for (const passportId of [...passportIds].sort()) {
      await tx.$queryRaw`SELECT "id" FROM "Passport" WHERE "id" = ${passportId} FOR UPDATE`
    }
    for (const userId of requestedUserIds) {
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`
    }

    // Re-read under both lock tiers. A role or User↔Passport change that won before our locks
    // fails closed: never detach/delete a newly promoted admin or an identity root we did not lock.
    const eligibleUsers = await tx.user.findMany({
      where: { id: { in: requestedUserIds }, role: { not: "admin" } },
      select: { id: true, passport: { select: { id: true } } },
      orderBy: { id: "asc" },
    })
    const identitySignature = (users: typeof eligibleUsers) =>
      users.map(user => `${user.id}:${user.passport?.id ?? ""}`)
    if (
      JSON.stringify(identitySignature(eligibleUsers)) !==
      JSON.stringify(identitySignature(initialEligibleUsers))
    ) {
      throw new ORPCError("CONFLICT", {
        message: "Account identity changed during deletion. Retry the operation.",
      })
    }

    // FK writers need a key-share lock on the Passport tier held above, so no active/review
    // reference can appear after this preflight and be cascaded or SetNull'd by the User delete.
    const referencedPromoter = await tx.passport.findFirst({
      where: {
        id: { in: passportIds },
        OR: [
          { rankAwardsPromoted: { some: {} } },
          { expectedPromoterReviews: { some: {} } },
          { proposedPromoterReviews: { some: {} } },
        ],
      },
      select: { id: true },
    })
    if (referencedPromoter) {
      throw new ORPCError("CONFLICT", {
        message:
          "This account cannot be deleted because its person identity is referenced by belt promotion history.",
      })
    }

    const eligibleUserIds = eligibleUsers.map(user => user.id)
    await tx.user.deleteMany({
      where: { id: { in: eligibleUserIds }, role: { not: "admin" } },
    })
    return eligibleUserIds
  })

  // Remove the user images from S3 asynchronously
  after(async () => {
    await removeS3Directories(
      deletedUserIds.map(id => `users/${id}`),
      context.brand,
    )
  })

  context.revalidate({
    paths: ["/app/users"],
  })

  return true
})

/**
 * Add-person ("just add someone"). ONE procedure, ONE transaction: an accountless `Passport`
 * (identity SoT — claimable precisely because it has no attached account, SOT-ADR D1) + stated
 * `RankAward` (`source=STATED`, `verificationStatus=UNVERIFIED`) + optional display-only
 * `Affiliation` + optional lineage placement.
 *
 * @added SESSION_0358 — Passport-centric consolidation (TASK_01). See passport-and-shells.md +
 *   ADR 0016. Migrated to oRPC at SESSION_0697 (WL-P2-43).
 */
const createPerson = usersProcedure.input(createPersonSchema).handler(async ({ input, context }) => {
  const {
    name,
    displayName,
    rankId,
    organizationId,
    schoolName,
    affiliationRole,
    treeId,
    parentMemberId,
  } = input

  const trimmedSchool = schoolName?.trim()

  const created = await db.$transaction(async tx => {
    // Phase 3c (SOT-ADR D1): a placeholder person is an ACCOUNTLESS Passport (no synthetic User /
    // @placeholder.invalid email). It is claimable precisely because it has no attached account.
    const passport = await createPassport({ displayName: displayName?.trim() || name }, tx as AppDb)

    const award = await tx.rankAward.create({
      data: {
        passportId: passport.id,
        rankId,
        source: RankAwardSource.STATED,
        verificationStatus: RankAwardVerificationStatus.UNVERIFIED,
        ...(organizationId ? { organizationId } : {}),
      },
      select: { id: true },
    })
    await syncRankEntryFromAward(tx, award.id)

    if (organizationId || trimmedSchool) {
      await tx.affiliation.create({
        data: {
          passportId: passport.id,
          role: affiliationRole,
          isCurrent: true,
          ...(organizationId ? { organizationId } : {}),
          ...(trimmedSchool ? { schoolName: trimmedSchool } : {}),
        },
      })
    }

    // Optional lineage placement — the visibility hook. Runs in the SAME transaction so
    // add-person stays one action. createLineageMember is the first runtime member-create.
    const placement = treeId
      ? await createLineageMember({
          db: tx as AppDb,
          brand: context.brand,
          actorUserId: context.user.id,
          memberPassportId: passport.id,
          treeId,
          parentMemberId: parentMemberId || null,
          rankAwardId: award.id,
        })
      : null

    await tx.auditLog.create({
      data: {
        brand: context.brand,
        action: "user.person.created",
        entityType: "Passport",
        entityId: passport.id,
        userId: context.user.id,
        after: {
          name,
          rankId,
          rankAwardId: award.id,
          isPlaceholder: true,
          organizationId: organizationId || null,
          schoolName: trimmedSchool || null,
          treeId: treeId || null,
          lineageMemberId: placement?.memberId ?? null,
        },
      },
    })

    return {
      id: passport.id,
      rankAwardId: award.id,
      lineageMemberId: placement?.memberId ?? null,
    }
  })

  // Layout-typed for consistency with update/updateRole: create redirects into the
  // dynamic /app/users/[id] subtree, which plain path revalidation doesn't bust.
  revalidateUsersSubtree()

  return created
})

const updateRole = usersProcedure
  .input(userSchema.pick({ id: true, role: true }))
  .handler(async ({ input, context }) => {
    const { id, role } = input
    const actor = context.user
    if (!id || !role) {
      throw new ORPCError("BAD_REQUEST", { message: "User id and role are required." })
    }
    // No self-role-change — an admin can't elevate/demote their own account (server-side mirror of
    // the UI guard in user-actions.tsx + `remove`'s `role:{not:"admin"}`). WL-P2-20 / risk #11.
    if (id === actor.id) {
      throw new ORPCError("FORBIDDEN", { message: "You cannot change your own role." })
    }

    const updated = await db.$transaction(async tx => {
      const before = await tx.user.findUnique({ where: { id }, select: { role: true } })
      const user = await tx.user.update({ where: { id }, data: { role } })

      // Audit the privilege change (before/after + acting admin) — mirrors the audited
      // entitlement-grant path (WL-P1-6); satisfies risk-register #11's "alert on role grants".
      await tx.auditLog.create({
        data: {
          brand: context.brand,
          action: "user.role.changed",
          entityType: "User",
          entityId: id,
          userId: actor.id,
          before: { role: before?.role ?? null },
          after: { role },
        },
      })

      return user
    })

    // Same stale-revalidate fix as update: the role toggle is viewed on the dynamic
    // detail page, so bust the whole /app/users subtree.
    revalidateUsersSubtree()

    return updated
  })

export const users = {
  update,
  remove,
  createPerson,
  updateRole,
}
