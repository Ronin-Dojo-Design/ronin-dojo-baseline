import { Suspense } from "react"
import { InvitesTable } from "~/app/admin/invites/_components/invites-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findInvites } from "~/server/admin/invites/queries"
import { invitesTableParamsCache } from "~/server/admin/invites/schema"
import { findOrganizationOptions } from "~/server/admin/programs/queries"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/invites">) => {
  const search = invitesTableParamsCache.parse(await searchParams)
  const invitesPromise = findInvites(search)
  const organizations = await findOrganizationOptions()

  return (
    <Suspense fallback={<DataTableSkeleton title="Invites" />}>
      <InvitesTable invitesPromise={invitesPromise} organizations={organizations} />
    </Suspense>
  )
})
