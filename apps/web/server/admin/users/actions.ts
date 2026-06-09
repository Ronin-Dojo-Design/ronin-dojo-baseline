"use server"

import { getRandomString, slugify } from "@dirstack/utils"
import { after } from "next/server"
import { RankAwardSource, RankAwardVerificationStatus } from "~/.generated/prisma/client"
import { removeS3Directories } from "~/lib/media"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { createPersonSchema, userSchema } from "~/server/admin/users/schema"
import { createLineageMember } from "~/server/web/lineage/create-lineage-member"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

export const updateUser = adminActionClient
  .inputSchema(userSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
    const user = await db.user.update({
      where: { id },
      data: input,
    })

    revalidate({
      paths: ["/admin/users"],
    })

    return user
  })

export const deleteUsers = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.user.deleteMany({
      where: { id: { in: ids }, role: { not: "admin" } },
    })

    // Remove the user images from S3 asynchronously
    after(async () => {
      await removeS3Directories(ids.map(id => `users/${id}`))
    })

    revalidate({
      paths: ["/admin/users"],
    })

    return true
  })

/**
 * Add-person ("just add someone"). ONE action, ONE transaction: a claimable placeholder `User`
 * (`isPlaceholder`, synthetic unique email) + `Passport` (identity SoT) + stated `RankAward`
 * (`source=STATED`, `verificationStatus=UNVERIFIED`) + optional display-only `Affiliation`. Optional
 * lineage placement is layered in TASK_02 (same action). Mirrors the `/admin/tools/new` create idiom.
 *
 * @added SESSION_0358 — Passport-centric consolidation (TASK_01). See passport-and-shells.md + ADR 0016.
 */
export const createPerson = adminActionClient
  .inputSchema(createPersonSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand, user } }) => {
    const {
      name,
      displayName,
      email,
      rankId,
      organizationId,
      schoolName,
      affiliationRole,
      treeId,
      parentMemberId,
    } = parsedInput

    // Better Auth `User.email` is @unique + non-null; a placeholder has no real address, so mint a
    // deterministically-unique synthetic one (mirrors the seed's placeholder-email pattern).
    const trimmedEmail = email?.trim()
    const placeholderEmail =
      trimmedEmail && trimmedEmail.length > 0
        ? trimmedEmail
        : `${slugify(name) || "person"}.${getRandomString(8).toLowerCase()}@placeholder.invalid`

    const trimmedSchool = schoolName?.trim()

    const created = await db.$transaction(async tx => {
      const person = await tx.user.create({
        data: { name, email: placeholderEmail, isPlaceholder: true },
        select: { id: true },
      })

      await tx.passport.create({
        data: { userId: person.id, displayName: displayName?.trim() || name },
      })

      const award = await tx.rankAward.create({
        data: {
          userId: person.id,
          rankId,
          source: RankAwardSource.STATED,
          verificationStatus: RankAwardVerificationStatus.UNVERIFIED,
          ...(organizationId ? { organizationId } : {}),
        },
        select: { id: true },
      })

      if (organizationId || trimmedSchool) {
        await tx.affiliation.create({
          data: {
            userId: person.id,
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
            memberUserId: person.id,
            treeId,
            parentMemberId: parentMemberId || null,
            rankAwardId: award.id,
          })
        : null

      await tx.auditLog.create({
        data: {
          brand,
          action: "user.person.created",
          entityType: "User",
          entityId: person.id,
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

      return { id: person.id, rankAwardId: award.id, lineageMemberId: placement?.memberId ?? null }
    })

    revalidate({ paths: ["/admin/users"] })

    return created
  })

export const updateUserRole = adminActionClient
  .inputSchema(userSchema.pick({ id: true, role: true }))
  .action(async ({ parsedInput: { id, role }, ctx: { db, revalidate } }) => {
    const user = await db.user.update({
      where: { id },
      data: { role },
    })

    revalidate({
      paths: ["/admin/users"],
    })

    return user
  })
