import { notFound } from "next/navigation"
import { TournamentForm } from "~/app/admin/tournaments/_components/tournament-form"
import { DivisionsEditor } from "~/app/admin/tournaments/_components/divisions-editor"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findTournamentById } from "~/server/admin/tournaments/queries"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const tournament = await findTournamentById(id)

  if (!tournament) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <TournamentForm title={`Edit ${tournament.name}`} tournament={tournament} />
      <DivisionsEditor tournament={tournament} />
    </Wrapper>
  )
})
