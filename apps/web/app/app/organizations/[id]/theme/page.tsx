import { ArrowLeftIcon, PaletteIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { OrgThemeForm } from "~/app/app/organizations/[id]/theme/_components/org-theme-form"
import { H2 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Wrapper } from "~/components/common/wrapper"
import { findOrgSettings } from "~/server/admin/org-settings/queries"
import { db } from "~/services/db"

export default async ({ params }: PageProps<"/app/organizations/[id]/theme">) => {
  const { id } = await params

  const organization = await db.organization.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, brand: true },
  })

  if (!organization) {
    notFound()
  }

  const orgSettings = await findOrgSettings(id)

  return (
    <Wrapper size="lg" gap="sm">
      <Link
        href="/app/organizations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Organizations
      </Link>

      <div className="flex items-center gap-3">
        <PaletteIcon className="size-6" />
        <div>
          <H2>{organization.name} — Theme</H2>
          <p className="text-sm text-muted-foreground">
            Override brand theme for this organization. Empty fields inherit from the brand-level
            settings.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <OrgThemeForm
          organizationId={organization.id}
          organizationName={organization.name}
          settings={orgSettings}
        />
      </div>
    </Wrapper>
  )
}
