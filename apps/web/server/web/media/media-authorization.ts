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
 *
 * `allowAdminOverride` (default `false`) is an *explicit*, opt-in bypass for the
 * admin-driven passport path (SESSION_0437_TASK_0A): it lets an admin set the
 * avatar of an *unowned/placeholder* Passport, which the ordinary passport
 * branch refuses (`passport.userId === null → false`). It is ONLY honored for
 * admins, and the self-service callers never set it — so the non-admin
 * ownership boundary below is unaffected.
 */
export async function authorizeMediaTarget({
  db,
  brand,
  user,
  target,
  allowAdminOverride = false,
}: {
  db: AppDb
  brand: Brand
  user: AuthzUser
  target: MediaAttachTarget
  allowAdminOverride?: boolean
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
      // @changed SESSION_0437_TASK_0A — explicit admin override for setting a placeholder
      // person's avatar (full-body imported photos need an admin re-crop). Only reachable
      // when the admin passport action sets `allowAdminOverride`; self-service callers never
      // do. Real admins also pass at the global `isAdmin` line above — this branch keeps the
      // capability provable from the call site and would still gate it were that line removed.
      if (allowAdminOverride && isAdmin(user)) return true
      // @changed SESSION_0390 (Phase 3a) — Passport.userId is now nullable (accountless placeholder,
      // SOT-ADR D1). An accountless Passport has no owner account to delegate org-admin from, so only
      // admins (handled above) manage its media. Revisit in the Phase 3c read-path sweep.
      if (passport.userId === null) return false
      return isAdminOfPassportOwnerOrg(db, brand, user.id, passport.userId)
    }

    case "rankMilestone": {
      // A belt-journey milestone is member-owned: only the Passport that owns the
      // milestone's RankAward may attach/detach its media (Petey Plan 0477 Locked
      // #1 — always member-editable, never delegated). Mirrors the self-Passport
      // branch above, walked one hop through RankMilestone → RankAward → passport.
      const milestone = await db.rankMilestone.findFirst({
        where: { id: target.id },
        select: { rankAward: { select: { passport: { select: { userId: true } } } } },
      })
      if (!milestone) return false
      return milestone.rankAward.passport.userId === user.id
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
                passport: { select: { lineageNode: { select: { id: true } } } },
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
