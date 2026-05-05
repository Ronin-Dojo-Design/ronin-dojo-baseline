import { notFound } from "next/navigation"
import Link from "next/link"
import { TournamentForm } from "~/app/admin/tournaments/_components/tournament-form"
import { DivisionsEditor } from "~/app/admin/tournaments/_components/divisions-editor"
import { StaffPanel } from "~/app/admin/tournaments/_components/staff-panel"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findTournamentById, findTournamentStaff, findTournamentRoles } from "~/server/admin/tournaments/queries"
import { db } from "~/services/db"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const tournament = await findTournamentById(id)

  if (!tournament) {
    return notFound()
  }

  const staffPromise = findTournamentStaff(id)
  const rolesPromise = findTournamentRoles()
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  })

  // Flatten divisions from tournament disciplines
  const divisions = tournament.disciplines.flatMap(td =>
    td.divisions.map(d => ({ id: d.id, name: d.name })),
  )

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
      <StaffPanel
        tournamentId={id}
        staffPromise={staffPromise}
        rolesPromise={rolesPromise}
        divisions={divisions}
        users={users}
      />
    </Wrapper>
  )
})
