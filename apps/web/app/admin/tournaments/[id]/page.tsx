import { notFound } from "next/navigation"
import Link from "next/link"
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit {tournament.name}</h2>
        <Link
          href={`/admin/tournaments/${id}/registrations`}
          className="text-sm text-primary hover:underline"
        >
          View Registrations →
        </Link>
      </div>
      <TournamentForm title={`Edit ${tournament.name}`} tournament={tournament} />
      <DivisionsEditor tournament={tournament} />
    </Wrapper>
  )
})
