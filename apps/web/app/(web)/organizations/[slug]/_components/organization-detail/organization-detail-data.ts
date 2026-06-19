import type { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { hasOrgAdminAccess } from "~/server/web/organization/org-admin-access"
import type { OrganizationDetail, OrganizationMany } from "~/server/web/organization/payloads"
import {
  findRelatedOrganizations,
  getOrganizationBySlug,
  getSystemRoles,
} from "~/server/web/organization/queries"
import { getPromotionTimelineForOrganization } from "~/server/web/promotion-events/queries"

type Membership = OrganizationDetail["memberships"][number]

/**
 * One person grouped with all of their discipline memberships in the same org
 * (Passport+Shell model: one user → many memberships). The roster renders one card
 * per unique user, not one per membership.
 */
export type MemberGroup = { user: Membership["user"]; memberships: Membership[] }

type SystemRoles = Awaited<ReturnType<typeof getSystemRoles>>
type PromotionTimeline = Awaited<ReturnType<typeof getPromotionTimelineForOrganization>>

export type BreadcrumbItem = { url: string; title: string }

/**
 * The resolved view model the detail orchestrator renders. The route loads it once
 * (`loadOrganizationDetail`) and threads it down; the orchestrator owns no fetching
 * or derivation, only composition + lazy boundaries (component-launch-sweep step 1).
 */
export type OrganizationDetailView = {
  org: OrganizationDetail
  brand: Brand
  isOwner: boolean
  canManage: boolean
  roles: SystemRoles
  uniqueMembers: MemberGroup[]
  uniqueMemberCount: number
  formattedAddress: string | null
  relatedOrgs: OrganizationMany[]
  promotionTimeline: PromotionTimeline
  isSignedIn: boolean
  orgUrl: string
  breadcrumbItems: BreadcrumbItem[]
}

/**
 * Group memberships by unique user for display (Passport+Shell model: one person
 * can hold many discipline memberships in the same org). Pure — derivation kept out
 * of the JSX so the section files stay presentational.
 */
function groupMembersByUser(memberships: Membership[]): {
  uniqueMembers: MemberGroup[]
  uniqueMemberCount: number
} {
  const membersByUser = new Map<string, MemberGroup>()
  for (const m of memberships) {
    const existing = membersByUser.get(m.user.id)
    if (existing) {
      existing.memberships.push(m)
    } else {
      membersByUser.set(m.user.id, { user: m.user, memberships: [m] })
    }
  }
  const uniqueMembers = Array.from(membersByUser.values())
  return { uniqueMembers, uniqueMemberCount: uniqueMembers.length }
}

/** Join the expanded address fields into a single display line (null when empty). */
function formatOrgAddress(org: OrganizationDetail): string | null {
  const parts = [
    org.addressLine1,
    org.addressLine2,
    org.city,
    org.state,
    org.zip,
    org.country,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}

/**
 * Load + derive everything the public org detail surface needs. Mirrors the prior
 * inline route body verbatim (same queries, same `Promise.all` batching, same
 * derivations) — relocated into the module so `page.tsx` stays a thin route shell.
 * Returns `null` when the org is missing so the route can `notFound()`.
 */
export async function loadOrganizationDetail(slug: string): Promise<OrganizationDetailView | null> {
  const brand = await getRequestBrand()
  const [org, session, roles] = await Promise.all([
    getOrganizationBySlug(brand, slug),
    getServerSession(),
    getSystemRoles(),
  ])

  if (!org) return null

  const isOwner = session?.user?.id === org.ownerId
  // Owner OR ORG_ADMIN role can manage org settings.
  const canManage = session?.user ? await hasOrgAdminAccess(session.user.id, org.id) : false

  const [relatedOrgs, promotionTimeline] = await Promise.all([
    findRelatedOrganizations({
      organizationId: org.id,
      brand,
      disciplineIds: org.disciplines.map(od => od.discipline.id),
      city: org.city,
    }),
    getPromotionTimelineForOrganization(org.id),
  ])

  const { uniqueMembers, uniqueMemberCount } = groupMembersByUser(org.memberships)
  const orgUrl = `/organizations/${org.slug}`

  return {
    org,
    brand,
    isOwner,
    canManage,
    roles,
    uniqueMembers,
    uniqueMemberCount,
    formattedAddress: formatOrgAddress(org),
    relatedOrgs,
    promotionTimeline,
    isSignedIn: Boolean(session?.user),
    orgUrl,
    breadcrumbItems: [
      { url: "/organizations", title: "Organizations" },
      { url: orgUrl, title: org.name },
    ],
  }
}
