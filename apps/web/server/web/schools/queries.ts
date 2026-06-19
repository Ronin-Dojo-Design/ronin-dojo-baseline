import { cacheLife, cacheTag } from "next/cache"
import type { OrganizationType } from "~/.generated/prisma/client"
import {
  SCHOOL_ORG_TYPES,
  schoolDetailPayload,
  schoolManyPayload,
} from "~/server/web/schools/payloads"
import { db } from "~/services/db"

// ---------------------------------------------------------------------------
// Schools queries — typed lens over Organization
//
// School lens = Organizations where type IN (DOJO, SCHOOL).
// LEAGUE and CLUB are tournament / club orgs and stay on /organizations/[slug].
//
// Single-brand simplification (SESSION_0415): these public read models no longer
// pin `brand`. Every Organization in this deployment belongs to the one live brand,
// so the brand scope only risked hiding the roster on a non-default host; slugs are
// effectively unique within the single brand.
//
// Mirrors:
//   - apps/web/server/web/disciplines/queries.ts (slugs + related pattern)
// ---------------------------------------------------------------------------

/**
 * Find a single school by slug.
 *
 * Resolves the slug (unique within the single brand) and then filters to school
 * types in-app — returns `null` for non-school orgs so the /schools/[slug] page can
 * `notFound()` cleanly.
 *
 * Used on the /schools/[slug] detail page.
 */
export const findSchoolBySlug = async ({ slug }: { slug: string }) => {
  "use cache"

  cacheTag(`school-${slug}`)
  cacheLife("minutes")

  const org = await db.organization.findFirst({
    where: { slug },
    select: schoolDetailPayload,
  })

  if (!org) return null
  if (!(SCHOOL_ORG_TYPES as readonly OrganizationType[]).includes(org.type)) {
    return null
  }
  return org
}

/**
 * Find all school slugs for static generation.
 *
 * Returns (slug, brand) tuples filtered to school-type orgs for cross-brand
 * `generateStaticParams`. Mirrors `findDisciplineSlugs` / `findOrganizationSlugs`.
 */
export const findSchoolSlugs = async () => {
  "use cache"

  cacheTag("school-slugs")
  cacheLife("hours")

  return db.organization.findMany({
    where: { type: { in: [...SCHOOL_ORG_TYPES] } },
    select: { slug: true, brand: true },
    orderBy: { name: "asc" },
  })
}

/**
 * Find related schools for the school detail page.
 *
 * Up to 6 school-type orgs, excluding the current school. Prefers same city or
 * same state when available (OR clause); when neither is available falls back to
 * alphabetical (similar to the Discipline pattern, per the SESSION_0238 risk note).
 */
export const findRelatedSchools = async ({
  schoolId,
  city,
  state,
}: {
  schoolId: string
  city?: string | null
  state?: string | null
}) => {
  "use cache"

  cacheTag(`related-schools-${schoolId}`)
  cacheLife("minutes")

  const localityOr = [...(city ? [{ city }] : []), ...(state ? [{ state }] : [])]

  return db.organization.findMany({
    where: {
      id: { not: schoolId },
      type: { in: [...SCHOOL_ORG_TYPES] },
      ...(localityOr.length > 0 ? { OR: localityOr } : {}),
    },
    select: schoolManyPayload,
    take: 6,
    orderBy: { name: "asc" },
  })
}
