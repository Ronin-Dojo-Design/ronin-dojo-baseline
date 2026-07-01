import type { Metadata } from "next"
import { LeadsPipeline } from "~/app/app/leads-pipeline/_components/leads-pipeline"
import { Wrapper } from "~/components/common/wrapper"
import { schoolOutreachQueue } from "~/lib/leads-pipeline/board-config"
import { loadPipelineLeads } from "~/lib/leads-pipeline/queries"

export const metadata: Metadata = {
  title: "Lead Pipeline",
}

// Always render fresh so a status/invite write reflects on nav-back.
export const dynamic = "force-dynamic"

/**
 * /app/leads-pipeline — the BBL Lead Pipeline board (Slice 6, Petey Plan 0477).
 *
 * "The Mammoth CRM for BBL" the doctrine-correct way (ADR 0034/0038 — share the kernel,
 * not the data): the shared `AdminKanban` kernel is mounted over BBL's OWN `Lead` rows.
 * We SSR-load the leads ONCE here to derive the "Schools to invite" queue (the client
 * board re-loads its own cards through the DB `BoardStore` adapter). Layout-gated on
 * `leads.manage`; the queries + actions re-assert it (defense-in-depth).
 */
export default async function Page() {
  const leads = await loadPipelineLeads()
  const schoolQueue = schoolOutreachQueue(leads)

  return (
    <Wrapper size="lg" gap="sm">
      <LeadsPipeline schoolQueue={schoolQueue} />
    </Wrapper>
  )
}
