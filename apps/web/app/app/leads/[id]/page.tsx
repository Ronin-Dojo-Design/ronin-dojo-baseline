import { notFound } from "next/navigation"
import { LeadForm } from "~/app/app/leads/_components/lead-form"
import { FollowUpPanel } from "~/app/app/leads/[id]/_components/follow-up-panel"
import { LeadLineagePlace } from "~/app/app/leads/[id]/_components/lead-lineage-place"
import { LeadLineageSelections } from "~/app/app/leads/[id]/_components/lead-lineage-selections"
import { LeadStatusActions } from "~/app/app/leads/[id]/_components/lead-status-actions"
import { Wrapper } from "~/components/common/wrapper"
import { resolvePlaceLeadOnLineageTarget } from "~/server/admin/leads/place-target"
import { resolveLeadLineageSelections } from "~/server/admin/leads/lineage-selections"
import { findLeadById, findOrganizationList } from "~/server/admin/leads/queries"

export default async function ({ params }: PageProps<"/app/leads/[id]">) {
  const { id } = await params
  const lead = await findLeadById(id)

  if (!lead) {
    return notFound()
  }

  // Slice B (SESSION_0442) — resolve the Join-the-Legacy lineage refs stored in `lead.meta`
  // so the steward sees the registered picks as verified links (custom entries as text).
  const lineageSelections = await resolveLeadLineageSelections(lead.meta)

  // FI-003 — the manual fallback: an eligible Join-the-Legacy lead (registered `trainedUnderNodeId`)
  // that wasn't auto-placed at submit can be placed on the canonical tree UNDER the named instructor.
  const placeTarget = await resolvePlaceLeadOnLineageTarget(lead)

  return (
    <Wrapper size="md" gap="sm">
      <LeadStatusActions lead={lead} />
      {placeTarget && (
        <LeadLineagePlace
          leadId={lead.id}
          instructorName={placeTarget.instructorName}
          treeName={placeTarget.treeName}
        />
      )}
      {lineageSelections && <LeadLineageSelections selections={lineageSelections} />}
      <LeadForm
        title={`Edit ${[lead.firstName, lead.lastName].filter(Boolean).join(" ")}`}
        lead={lead}
        organizationsPromise={findOrganizationList()}
      />
      <FollowUpPanel lead={lead} />
    </Wrapper>
  )
}
