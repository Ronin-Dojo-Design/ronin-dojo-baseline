import { TournamentForm } from "~/app/admin/tournaments/_components/tournament-form"
import { withTournamentAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withTournamentAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <TournamentForm title="Create tournament" />
    </Wrapper>
  )
})
