import { Suspense } from "react"
import { LeadsTable } from "~/app/app/leads/_components/leads-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findLeads, findOrganizationList } from "~/server/admin/leads/queries"
import { leadsTableParamsCache } from "~/server/admin/leads/schema"

export default async function ({ searchParams }: PageProps<"/app/leads">) {
  const search = leadsTableParamsCache.parse(await searchParams)
  const leadsPromise = findLeads(search)
  const organizationsPromise = findOrganizationList()

  return (
    <Suspense fallback={<DataTableSkeleton title="Leads" />}>
      <LeadsTable leadsPromise={leadsPromise} organizationsPromise={organizationsPromise} />
    </Suspense>
  )
}
