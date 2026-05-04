import { TournamentForm } from "~/app/admin/tournaments/_components/tournament-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <TournamentForm title="Create tournament" />
    </Wrapper>
  )
})
