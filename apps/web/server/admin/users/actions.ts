"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { RankAwardSource, RankAwardVerificationStatus } from "~/.generated/prisma/client"
import { removeS3Directories } from "~/lib/media"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { createPersonSchema, userSchema } from "~/server/admin/users/schema"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { createPassport } from "~/server/identity/person-service"
import { createLineageMember } from "~/server/web/lineage/create-lineage-member"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

export const updateUser = adminActionClient
  .inputSchema(userSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, brand, user: actor } }) => {
    if (!id) {
      throw new Error("User id is required.")
    }

    const updated = await db.$transaction(async tx => {
      const before = await tx.user.findUnique({ where: { id }, select: { role: true } })
      const roleChanged = input.role !== undefined && input.role !== before?.role

      // A role change through the generic edit gets the same self-guard + audit as the dedicated
      // role action — an admin cannot change their own role (WL-P2-20 / risk-register #11).
      if (roleChanged && id === actor.id) {
        throw new Error("You cannot change your own role.")
      }

      const user = await tx.user.update({ where: { id }, data: input })

      if (roleChanged) {
        await tx.auditLog.create({
          data: {
            brand,
            action: "user.role.changed",
            entityType: "User",
            entityId: id,
            userId: actor.id,
            before: { role: before?.role ?? null },
            after: { role: input.role },
          },
        })
      }

      return user
    })

    // The edit form lives on the dynamic detail page (/app/users/[id]); a plain path
    // revalidation only busts the list, so the detail page re-renders stale values on
    // return (the /admin→/app stale-revalidate class). Layout-typed revalidation covers
    // the whole /app/users subtree, list + every [id] page.
    revalidatePath("/app/users", "layout")

    return updated
  })

export const deleteUsers = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand } }) => {
    const deletedUserIds = await db.$transaction(async tx => {
      const requestedUserIds = [...new Set(ids)].sort()
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
        throw new Error("Account identity changed during deletion. Retry the operation.")
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
        throw new Error(
          "This account cannot be deleted because its person identity is referenced by belt promotion history.",
        )
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
        brand,
      )
    })

    revalidate({
      paths: ["/app/users"],
    })

    return true
  })

/**
 * Add-person ("just add someone"). ONE action, ONE transaction: a claimable placeholder `User`
 * (`isPlaceholder`, synthetic unique email) + `Passport` (identity SoT) + stated `RankAward`
 * (`source=STATED`, `verificationStatus=UNVERIFIED`) + optional display-only `Affiliation`. Optional
 * lineage placement is layered in TASK_02 (same action). Mirrors the `/app/tools/new` create idiom.
 *
 * @added SESSION_0358 — Passport-centric consolidation (TASK_01). See passport-and-shells.md + ADR 0016.
 */
export const createPerson = adminActionClient
  .inputSchema(createPersonSchema)
  .action(async ({ parsedInput, ctx: { db, brand, user } }) => {
    const {
      name,
      displayName,
      rankId,
      organizationId,
      schoolName,
      affiliationRole,
      treeId,
      parentMemberId,
    } = parsedInput

    const trimmedSchool = schoolName?.trim()

    const created = await db.$transaction(async tx => {
      // Phase 3c (SOT-ADR D1): a placeholder person is an ACCOUNTLESS Passport (no synthetic User /
      // @placeholder.invalid email). It is claimable precisely because it has no attached account.
      const passport = await createPassport(
        { displayName: displayName?.trim() || name },
        tx as AppDb,
      )

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
            brand,
            actorUserId: user.id,
            memberPassportId: passport.id,
            treeId,
            parentMemberId: parentMemberId || null,
            rankAwardId: award.id,
          })
        : null

      await tx.auditLog.create({
        data: {
          brand,
          action: "user.person.created",
          entityType: "Passport",
          entityId: passport.id,
          userId: user.id,
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

    // Layout-typed for consistency with updateUser/updateUserRole: create redirects into the
    // dynamic /app/users/[id] subtree, which plain path revalidation doesn't bust.
    revalidatePath("/app/users", "layout")

    return created
  })

export const updateUserRole = adminActionClient
  .inputSchema(userSchema.pick({ id: true, role: true }))
  .action(async ({ parsedInput: { id, role }, ctx: { db, brand, user: actor } }) => {
    if (!id || !role) {
      throw new Error("User id and role are required.")
    }
    // No self-role-change — an admin can't elevate/demote their own account (server-side mirror of
    // the UI guard in user-actions.tsx + `deleteUsers`' `role:{not:"admin"}`). WL-P2-20 / risk #11.
    if (id === actor.id) {
      throw new Error("You cannot change your own role.")
    }

    const updated = await db.$transaction(async tx => {
      const before = await tx.user.findUnique({ where: { id }, select: { role: true } })
      const user = await tx.user.update({ where: { id }, data: { role } })

      // Audit the privilege change (before/after + acting admin) — mirrors the audited
      // entitlement-grant path (WL-P1-6); satisfies risk-register #11's "alert on role grants".
      await tx.auditLog.create({
        data: {
          brand,
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

    // Same stale-revalidate fix as updateUser: the role toggle is viewed on the dynamic
    // detail page, so bust the whole /app/users subtree.
    revalidatePath("/app/users", "layout")

    return updated
  })
