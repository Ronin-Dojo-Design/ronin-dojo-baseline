import type { Brand } from "~/.generated/prisma/client"
import { type AuthzUser, isAdmin } from "~/lib/authz"
import type { MediaAttachTarget } from "~/server/web/media/media-targets"
import {
  type AuthorizablePromotionEvent,
  canAuthorPromotionEvent,
  resolvePromotionEventAuthoringScope,
} from "~/server/web/promotion-events/editor-authorization"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

// Org-media authoring is intentionally broader than `hasOrgAdminAccess`: per the
// SESSION_0322 grill it includes teaching staff (INSTRUCTOR/COACH), not just owners
// and org admins.
const orgAuthorRoles = ["OWNER", "ORG_ADMIN", "INSTRUCTOR", "COACH"] as const
// Passport media by a non-self user is restricted to org *admins* of an org the
// passport owner belongs to — not the broader teaching-staff set.
const orgAdminRoles = ["OWNER", "ORG_ADMIN"] as const

/** Owner or active OWNER/ORG_ADMIN/INSTRUCTOR/COACH membership of the org. */
async function isOrgAuthor(
  db: AppDb,
  brand: Brand,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const org = await db.organization.findFirst({
    where: {
      id: organizationId,
      brand,
      OR: [
        { ownerId: userId },
        {
          memberships: {
            some: {
              userId,
              status: "ACTIVE",
              roleAssignments: { some: { role: { code: { in: [...orgAuthorRoles] } } } },
            },
          },
        },
      ],
    },
    select: { id: true },
  })

  return Boolean(org)
}

/** Owner/ORG_ADMIN of any org the passport owner is an ACTIVE member of. */
async function isAdminOfPassportOwnerOrg(
  db: AppDb,
  brand: Brand,
  userId: string,
  passportOwnerId: string,
): Promise<boolean> {
  const org = await db.organization.findFirst({
    where: {
      brand,
      memberships: { some: { userId: passportOwnerId, status: "ACTIVE" } },
      OR: [
        { ownerId: userId },
        {
          memberships: {
            some: {
              userId,
              status: "ACTIVE",
              roleAssignments: { some: { role: { code: { in: [...orgAdminRoles] } } } },
            },
          },
        },
      ],
    },
    select: { id: true },
  })

  return Boolean(org)
}

/**
 * Server-side authorization for attaching/removing media on a target. Each
 * target kind resolves a *distinct* capability check — there is deliberately no
 * single broad gate. Global admins pass everything; otherwise:
 *
 * - organization → org author (owner/admin/instructor/coach)
 * - technique/course → org author of the owning organization
 * - passport → the passport owner, or an org admin of the owner's org
 * - promotionEvent → existing `canAuthorPromotionEvent` lineage/org scope
 */
export async function authorizeMediaTarget({
  db,
  brand,
  user,
  target,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  target: MediaAttachTarget
}): Promise<boolean> {
  if (isAdmin(user)) return true

  switch (target.kind) {
    case "organization":
      return isOrgAuthor(db, brand, user.id, target.id)

    case "technique": {
      const technique = await db.technique.findFirst({
        where: { id: target.id, brand },
        select: { organizationId: true },
      })
      if (!technique) return false
      return isOrgAuthor(db, brand, user.id, technique.organizationId)
    }

    case "course": {
      const course = await db.course.findFirst({
        where: { id: target.id, brand },
        select: { organizationId: true },
      })
      if (!course) return false
      return isOrgAuthor(db, brand, user.id, course.organizationId)
    }

    case "passport": {
      const passport = await db.passport.findFirst({
        where: { id: target.id },
        select: { userId: true },
      })
      if (!passport) return false
      if (passport.userId === user.id) return true
      return isAdminOfPassportOwnerOrg(db, brand, user.id, passport.userId)
    }

    case "promotionEvent": {
      const [event, scope] = await Promise.all([
        db.promotionEvent.findFirst({
          where: { id: target.id },
          select: {
            id: true,
            hostOrganizationId: true,
            rankAwards: {
              select: {
                id: true,
                awardedById: true,
                organizationId: true,
                promotionEventId: true,
                user: { select: { lineageNode: { select: { id: true } } } },
              },
            },
          },
        }),
        resolvePromotionEventAuthoringScope({ db, brand, user }),
      ])

      if (!event) return false

      return canAuthorPromotionEvent({
        scope,
        event: event as AuthorizablePromotionEvent,
        hostOrganizationId: event.hostOrganizationId,
        awards: event.rankAwards,
        userId: user.id,
      })
    }

    default:
      return false
  }
}
