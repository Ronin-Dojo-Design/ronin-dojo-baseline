import { InviteForm } from "~/app/app/invites/_components/invite-form"
import { findOrganizationOptions } from "~/server/admin/programs/queries"

export default async function () {
  const organizations = await findOrganizationOptions()

  return <InviteForm title="New Invite" organizations={organizations} />
}
