import { redirect } from "next/navigation"
import { AuthoredTechniqueCreate } from "~/app/(web)/dashboard/authored-technique-create"
import { TechniqueProgressTable, TechniquesTable } from "~/app/(web)/dashboard/techniques-table"
import { Stack } from "~/components/common/stack"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { findUserTechniqueProgress, findUserTechniques } from "~/server/web/dashboard/queries"
import {
  canCreateTechniqueForUser,
  findActiveStaffMembership,
} from "~/server/web/techniques/permissions"
import { getTechniqueFormOptions } from "~/server/web/techniques/queries"
import { db } from "~/services/db"

export async function DashboardTechniquesTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/app/profile")
  }

  // SESSION_0529 Slice 3B — resolve the authoring capability + the viewer's identity SERVER-side
  // (RBAC `techniques.manage` ∨ active OWNER/INSTRUCTOR ∨ Elite entitlement) and pass booleans down.
  // SESSION_0580 (G-022 Lane B) adds `progress` — the caller's OWN technique-progress rows, a
  // DISTINCT dataset from `techniques` (authored/managed rows).
  const [techniques, canCreate, identity, orgStaff, progress] = await Promise.all([
    findUserTechniques(session.user.id, Brand.BBL),
    canCreateTechniqueForUser(session.user, Brand.BBL),
    db.passport.findFirst({
      where: { userId: session.user.id },
      select: { id: true, directoryProfile: { select: { slug: true } } },
    }),
    // Whether the org-canonical editor (`/app/techniques/new`) is reachable — the same
    // OWNER/INSTRUCTOR gate that page enforces, so the table never links a guaranteed 404
    // to an Elite (non-staff) author. The ONE shared ACTIVE-staff predicate (WL-P2-49): a
    // CANCELLED staff membership must not authorize, matching `canCreateTechniqueForUser`.
    findActiveStaffMembership(db, session.user.id, { brand: Brand.BBL }),
    findUserTechniqueProgress(session.user.id, Brand.BBL),
  ])

  const formOptions = canCreate ? await getTechniqueFormOptions() : null
  const profileSlug = identity?.directoryProfile?.slug ?? null

  // Row link: the viewer's OWN authored rows watch on their profile-scoped route (profile-only rows
  // are OFF the canonical `/techniques/[slug]` by the ADR 0046 D4 discovery gate); everything else
  // keeps the canonical watch link. DRAFTS render UNLINKED (Desi P1): BOTH public watch reads are
  // published-only, so a draft link is a guaranteed 404 — the row's existing "Draft" status badge
  // carries the state.
  const rows = techniques.map(technique => ({
    ...technique,
    href: !technique.isPublished
      ? null
      : technique.authorPassportId && technique.authorPassportId === identity?.id && profileSlug
        ? `/directory/${profileSlug}/techniques/${technique.slug}`
        : `/techniques/${technique.slug}`,
  }))

  return (
    <Stack size="lg" direction="column" className="w-full">
      {canCreate && formOptions && (
        <AuthoredTechniqueCreate disciplines={formOptions.disciplines} belts={formOptions.belts} />
      )}
      <TechniquesTable techniques={rows} showOrgCreate={Boolean(orgStaff)} canCreate={canCreate} />
      <TechniqueProgressTable progress={progress} />
    </Stack>
  )
}
