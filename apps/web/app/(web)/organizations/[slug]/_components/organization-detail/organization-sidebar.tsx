import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import type { OrganizationDetailView } from "./organization-detail-data"

type OrganizationSidebarProps = Pick<
  OrganizationDetailView,
  "org" | "isOwner" | "canManage" | "uniqueMemberCount"
>

/**
 * Sidebar cards for the org detail page: the admin "Settings" entry (owner /
 * ORG_ADMIN only), the owner-only invite link, and the always-on info summary.
 * Presentational — gating booleans are resolved upstream in the data loader.
 */
export function OrganizationSidebar({
  org,
  isOwner,
  canManage,
  uniqueMemberCount,
}: OrganizationSidebarProps) {
  return (
    <>
      {canManage && (
        <Card isRevealed>
          <CardHeader>
            <H4>
              <Link href={`/organizations/${org.slug}/settings`}>
                <span className="absolute inset-0 z-10" />
                ⚙️ Organization Settings
              </Link>
            </H4>
          </CardHeader>
          <CardDescription>Manage theme, branding, and organization configuration.</CardDescription>
        </Card>
      )}

      {isOwner && org.inviteCode && (
        <Card hover={false}>
          <CardHeader>
            <H4>Invite Link</H4>
          </CardHeader>
          <CardDescription>
            <p className="text-sm text-muted-foreground break-all">
              {`/organizations/join?code=${org.inviteCode}`}
            </p>
          </CardDescription>
        </Card>
      )}

      <Card hover={false}>
        <CardHeader>
          <H4>Organization Info</H4>
        </CardHeader>
        <CardDescription>
          <Stack direction="column" className="items-start">
            <Badge variant="outline">{org.type}</Badge>
            <span>{uniqueMemberCount} members</span>
            <span>{org.disciplines.length} disciplines</span>
          </Stack>
        </CardDescription>
      </Card>
    </>
  )
}
