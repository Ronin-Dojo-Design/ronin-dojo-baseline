import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { TechniqueFeatureToggle } from "~/app/app/techniques/[id]/technique-feature-toggle"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"
import { findActiveStaffMembership } from "~/server/web/techniques/permissions"
import { getTechniqueFormOptions } from "~/server/web/techniques/queries"
import { db } from "~/services/db"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return await getPageMetadata({
    url: `/app/techniques/${id}`,
    metadata: {
      title: "Edit Technique",
      description: "Manage a technique in the dashboard.",
      robots: { index: false, follow: false },
    },
  })
}

export default async function EditTechniquePage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession()
  if (!session?.user) redirect(`/auth/login?next=/app/techniques/${id}`)

  const technique = await db.technique.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      disciplineId: true,
      position: true,
      category: true,
      difficultyLevel: true,
      beltLevelMinId: true,
      isGi: true,
      isFoundational: true,
      requiresPartner: true,
      requiresEquipment: true,
      movementPattern: true,
      rangeBand: true,
      teachingCues: true,
      commonErrors: true,
      safetyNotes: true,
      isPublished: true,
      isFeatured: true,
      organizationId: true,
    },
  })

  if (!technique) notFound()

  // @changed SESSION_0529 (Slice 3C) — platform staff (`techniques.manage` RBAC) may open ANY
  // technique here, including an authored profile-only (null-org) row: this page hosts the staff
  // "promote to library" control, and authored rows have no org gate to pass. Non-staff keep the
  // SESSION_0528 behavior byte-for-byte: null-org rows 404 (authors edit via the profile flow),
  // org rows require an ACTIVE OWNER/INSTRUCTOR membership (ACTIVE added with the SESSION_0529
  // review pass — matches `hasOrgStaffRole` + the techniques-tab / new-page gates).
  const isStaff = can(session.user, APP_AREA_PERMISSIONS.techniques)

  if (!isStaff) {
    if (!technique.organizationId) notFound()

    // The ONE shared ACTIVE-staff predicate (WL-P2-49), org-scoped to this row's school.
    const membership = await findActiveStaffMembership(db, session.user.id, {
      organizationId: technique.organizationId,
    })

    if (!membership) notFound()
  }

  const { disciplines, belts } = await getTechniqueFormOptions()

  const mediaAttachments =
    (await getDashboardMediaAttachments({
      brand: Brand.BBL,
      user: session.user,
      target: { kind: "technique", id: technique.id },
    })) ?? []

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/app/profile", title: "Dashboard" },
          { url: "/app/profile", title: "Techniques" },
          { url: `/app/techniques/${id}`, title: technique.name },
        ]}
      />

      <TechniqueForm
        organizationId={technique.organizationId ?? undefined}
        disciplines={disciplines}
        belts={belts}
        technique={technique}
      />

      <Section>
        <Section.Content>
          {/* SESSION_0529 Slice 3C — staff-only promote/demote (the action re-checks RBAC). */}
          {isStaff && (
            <TechniqueFeatureToggle
              techniqueId={technique.id}
              initialFeatured={technique.isFeatured}
            />
          )}

          <MediaAttachmentManager
            target={{ kind: "technique", id: technique.id }}
            initialAttachments={mediaAttachments}
            title="Technique media"
            description="Images or video that demonstrate this technique. Public items appear on the technique page."
          />
        </Section.Content>
      </Section>
    </>
  )
}
