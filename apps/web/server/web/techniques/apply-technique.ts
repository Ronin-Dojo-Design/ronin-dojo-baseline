import type { Brand } from "~/.generated/prisma/client"
import type { SessionUser } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import type {
  CreateTechniqueInput,
  UpdateTechniqueInput,
} from "~/server/web/techniques/crud-schemas"
import { canCreateTechniqueForUser } from "~/server/web/techniques/permissions"
import { TECHNIQUE_ERROR } from "~/server/web/techniques/technique-errors"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

/** OWNER/INSTRUCTOR of a school may author/edit that school's techniques (ADR 0046 D5). */
const TECHNIQUE_STAFF_ROLES = ["OWNER", "INSTRUCTOR"] as const

async function hasOrgStaffRole(
  db: AppDb,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const membership = await db.membership.findFirst({
    where: {
      userId,
      organizationId,
      // Only an ACTIVE membership authorizes — a CANCELLED OWNER/INSTRUCTOR must not (matches
      // `canCreateTechniqueForUser`, SESSION_0528 Doug P3).
      status: "ACTIVE",
      roleAssignments: { some: { role: { code: { in: [...TECHNIQUE_STAFF_ROLES] } } } },
    },
    select: { id: true },
  })
  return Boolean(membership)
}

/**
 * Create a technique via one of two paths (ADR 0046):
 *
 *   - **authored** (`input.authored`): capability-gated (`canCreateTechniqueForUser`), sets
 *     `authorPassportId` to the caller's Passport, and derives the school (`organizationId`) from their
 *     CURRENT `Affiliation` — nullable, so a member with a free-text/placeholder school authors a
 *     profile-only (org-null) technique. `brand` is the school's brand when a school is present, else the
 *     creator's brand context.
 *   - **org-canonical** (default): unchanged from the pre-ADR flow — requires an `organizationId` and an
 *     OWNER/INSTRUCTOR membership in it; `authorPassportId` stays null (the existing library).
 *
 * The core takes `db` explicitly (like `apply-media.ts`) so it is hermetically testable and so the
 * capability gate rides the same client.
 */
export async function applyCreateTechnique({
  db,
  user,
  brandContext,
  input,
}: {
  db: AppDb
  user: SessionUser
  brandContext: Brand
  input: CreateTechniqueInput
}) {
  const { organizationId, authored, ...data } = input

  if (authored) {
    const allowed = await canCreateTechniqueForUser(user, brandContext, db)
    if (!allowed) {
      throw new Error(TECHNIQUE_ERROR.CREATE_ACCESS_REQUIRED)
    }

    const passport = await db.passport.findFirst({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!passport) {
      throw new Error(TECHNIQUE_ERROR.PASSPORT_REQUIRED)
    }

    // The author's current school (nullable → profile-only). Prefer an affiliation that carries an org.
    const affiliation = await db.affiliation.findFirst({
      where: { passportId: passport.id, isCurrent: true, organizationId: { not: null } },
      select: { organization: { select: { id: true, brand: true } } },
      orderBy: { updatedAt: "desc" },
    })
    const org = affiliation?.organization ?? null

    return db.technique.create({
      data: {
        ...data,
        brand: org?.brand ?? brandContext,
        organizationId: org?.id ?? null,
        authorPassportId: passport.id,
        teachingCues: data.teachingCues ?? [],
        commonErrors: data.commonErrors ?? [],
      },
    })
  }

  // Org-canonical path (author null) — unchanged gate + brand derivation.
  if (!organizationId) {
    throw new Error(TECHNIQUE_ERROR.ORGANIZATION_REQUIRED)
  }
  if (!(await hasOrgStaffRole(db, user.id, organizationId))) {
    throw new Error(TECHNIQUE_ERROR.ORG_AUTHOR_REQUIRED)
  }
  const org = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { brand: true },
  })

  return db.technique.create({
    data: {
      ...data,
      brand: org.brand,
      organizationId,
      teachingCues: data.teachingCues ?? [],
      commonErrors: data.commonErrors ?? [],
    },
  })
}

/**
 * Whether `user` may edit `technique` (ADR 0046 D5): platform RBAC (`techniques.manage`), the author of
 * an authored row (`authorPassportId = me`), or OWNER/INSTRUCTOR staff of the row's school. A canonical
 * (null-author) row is therefore staff/RBAC-only.
 */
async function canEditTechnique(
  db: AppDb,
  user: SessionUser,
  technique: { organizationId: string | null; authorPassportId: string | null },
): Promise<boolean> {
  if (can(user, APP_AREA_PERMISSIONS.techniques)) {
    return true
  }

  if (technique.authorPassportId) {
    const passport = await db.passport.findFirst({
      where: { userId: user.id },
      select: { id: true },
    })
    if (passport && passport.id === technique.authorPassportId) {
      return true
    }
  }

  if (technique.organizationId) {
    return hasOrgStaffRole(db, user.id, technique.organizationId)
  }

  return false
}

/**
 * Edit a technique's CONTENT fields only. The ownership/identity axes — `organizationId` (school),
 * `authorPassportId`, `slug`, `disciplineId` — are stripped here, so an edit can never re-home a
 * technique between schools/authors or change its identity (SESSION_0528 Doug P2). This is the ADR-D4
 * guard in code: without the strip, an author could set `organizationId` on their own profile-only row
 * and it would pass the discovery filter into the public browse WITHOUT staff `isFeatured` promotion.
 * Re-homing/promoting is a separate staff concern (Slice 3C), not an authoring edit.
 */
export async function applyUpdateTechnique({
  db,
  user,
  input,
}: {
  db: AppDb
  user: SessionUser
  input: UpdateTechniqueInput
}) {
  const {
    id,
    authored: _authored,
    organizationId: _organizationId,
    slug: _slug,
    disciplineId: _disciplineId,
    ...data
  } = input

  const technique = await db.technique.findUniqueOrThrow({
    where: { id },
    select: { id: true, organizationId: true, authorPassportId: true },
  })

  if (!(await canEditTechnique(db, user, technique))) {
    throw new Error(TECHNIQUE_ERROR.EDIT_ACCESS_REQUIRED)
  }

  return db.technique.update({ where: { id }, data })
}
