import { Suspense } from "react"
import { OrganizationsTable } from "~/app/app/organizations/_components/organizations-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findOrganizationsWithSettingsPaginated } from "~/server/admin/org-settings/queries"
import { organizationsTableParamsCache } from "~/server/admin/org-settings/schema"

/**
 * Per-org theme-override list — migrated onto the ONE `AdminCollection` frame
 * (ADR 0045, WL-P2-34). Row → `/app/organizations/[id]/theme` editor.
 */
export default async ({ searchParams }: PageProps<"/app/organizations">) => {
  const { page, perPage, sort } = organizationsTableParamsCache.parse(await searchParams)
  const organizationsPromise = findOrganizationsWithSettingsPaginated({ page, perPage, sort })

  return (
    <Suspense fallback={<DataTableSkeleton title="Organizations" />}>
      <OrganizationsTable organizationsPromise={organizationsPromise} />
    </Suspense>
  )
}
