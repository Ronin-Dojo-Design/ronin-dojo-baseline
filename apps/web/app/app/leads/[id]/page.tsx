import { notFound } from "next/navigation"
import { LeadForm } from "~/app/app/leads/_components/lead-form"
import { FollowUpPanel } from "~/app/app/leads/[id]/_components/follow-up-panel"
import { LeadStatusActions } from "~/app/app/leads/[id]/_components/lead-status-actions"
import { Wrapper } from "~/components/common/wrapper"
import { findLeadById, findOrganizationList } from "~/server/admin/leads/queries"

export default async function ({ params }: PageProps<"/app/leads/[id]">) {
  const { id } = await params
  const lead = await findLeadById(id)

  if (!lead) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <LeadStatusActions lead={lead} />
      <LeadForm
        title={`Edit ${[lead.firstName, lead.lastName].filter(Boolean).join(" ")}`}
        lead={lead}
        organizationsPromise={findOrganizationList()}
      />
      <FollowUpPanel lead={lead} />
    </Wrapper>
  )
}
