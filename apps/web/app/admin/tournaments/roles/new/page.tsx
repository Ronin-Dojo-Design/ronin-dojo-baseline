import { TournamentRoleForm } from "~/app/admin/tournaments/roles/_components/tournament-role-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <TournamentRoleForm title="Create tournament role" />
    </Wrapper>
  )
})
