import { TournamentRoleForm } from "~/app/admin/tournaments/roles/_components/tournament-role-form"
import { Wrapper } from "~/components/common/wrapper"

export default () => {
  return (
    <Wrapper size="md" gap="sm">
      <TournamentRoleForm title="Create tournament role" />
    </Wrapper>
  )
}
