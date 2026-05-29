import { BuildingIcon } from "lucide-react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { H2 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Wrapper } from "~/components/common/wrapper"
import { findAllOrganizationsWithSettings } from "~/server/admin/org-settings/queries"

export default withAdminPage(async () => {
  const organizations = await findAllOrganizationsWithSettings()

  return (
    <Wrapper size="lg" gap="sm">
      <div className="flex items-center gap-3">
        <BuildingIcon className="size-6" />
        <div>
          <H2>Organizations</H2>
          <p className="text-sm text-muted-foreground">
            Manage per-org theme overrides. Click an organization to edit its theme.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {organizations.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No organizations found. Create one first.
          </p>
        )}

        {organizations.map(org => {
          const hasTheme =
            org.orgSettings &&
            (org.orgSettings.primaryColor || org.orgSettings.accentColor || org.orgSettings.logoUrl)

          return (
            <Link
              key={org.id}
              href={`/admin/organizations/${org.id}/theme`}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BuildingIcon className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-muted-foreground">{org.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{org.brand}</Badge>
                {hasTheme && <Badge variant="primary">Themed</Badge>}
                {org.orgSettings?.primaryColor && (
                  <div
                    className="size-5 rounded-full border"
                    style={{ backgroundColor: `hsl(${org.orgSettings.primaryColor})` }}
                    title={`Primary: ${org.orgSettings.primaryColor}`}
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </Wrapper>
  )
})
