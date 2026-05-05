import { notFound } from "next/navigation"
import { TournamentRoleForm } from "~/app/admin/tournaments/roles/_components/tournament-role-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findTournamentRoleById } from "~/server/admin/tournaments/queries"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const role = await findTournamentRoleById(id)

  if (!role) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <TournamentRoleForm title="Update tournament role" role={role} />
    </Wrapper>
  )
})
