import { Suspense } from "react"
import { ClaimsTable } from "~/app/app/claims/_components/claims-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findPendingProfileClaimsPaginated } from "~/server/admin/claims/claim-queries"
import { claimsTableParamsCache } from "~/server/admin/claims/schema"

/**
 * Admin profile-claim queue (SESSION_0354) — migrated onto the ONE `AdminCollection`
 * frame (ADR 0045, WL-P2-34). Mirrors the lineage claims list.
 */
export default async ({ searchParams }: PageProps<"/app/claims">) => {
  const { page, perPage, sort } = claimsTableParamsCache.parse(await searchParams)
  const claimsPromise = findPendingProfileClaimsPaginated({ page, perPage, sort })

  return (
    <Suspense fallback={<DataTableSkeleton title="Profile Claims" />}>
      <ClaimsTable claimsPromise={claimsPromise} />
    </Suspense>
  )
}
