import { LeadForm } from "~/app/app/leads/_components/lead-form"
import { Wrapper } from "~/components/common/wrapper"
import { findOrganizationList } from "~/server/admin/leads/queries"

export default function () {
  return (
    <Wrapper size="md" gap="sm">
      <LeadForm title="Create lead" organizationsPromise={findOrganizationList()} />
    </Wrapper>
  )
}
