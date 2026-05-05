import { notFound } from "next/navigation"
import Link from "next/link"
import { TournamentForm } from "~/app/admin/tournaments/_components/tournament-form"
import { DivisionsEditor } from "~/app/admin/tournaments/_components/divisions-editor"
import { StaffPanel } from "~/app/admin/tournaments/_components/staff-panel"
import { MatAssignmentPanel } from "~/app/admin/tournaments/_components/mat-assignment-panel"
import { FightRecordPanel } from "~/app/admin/tournaments/_components/fight-record-panel"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findTournamentById, findTournamentStaff, findTournamentRoles, findMatAssignmentsByTournament, findFightRecordsByTournament } from "~/server/admin/tournaments/queries"
import { db } from "~/services/db"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const tournament = await findTournamentById(id)

  if (!tournament) {
    return notFound()
  }

  const staffPromise = findTournamentStaff(id)
  const rolesPromise = findTournamentRoles()
  const matAssignmentsPromise = findMatAssignmentsByTournament(id)
  const fightRecordsPromise = findFightRecordsByTournament(id)

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  })

  // Flatten divisions from tournament disciplines
  const divisions = tournament.disciplines.flatMap(td =>
    td.divisions.map(d => ({ id: d.id, name: d.name })),
  )

  // Get all matches for mat assignment + fight record panels
  const allMatches = await db.match.findMany({
    where: { bracket: { division: { tournamentDiscipline: { tournamentId: id } } } },
    select: {
      id: true,
      roundNumber: true,
      matchNumber: true,
      status: true,
      winnerEntryId: true,
      matAssignment: { select: { id: true } },
      bracket: { select: { division: { select: { name: true } } } },
      competitors: {
        select: {
          registrationEntry: {
            select: { registration: { select: { user: { select: { name: true } } } } },
          },
        },
        orderBy: { slot: "asc" },
      },
    },
    orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }],
  })

  const unassignedMatches = allMatches
    .filter(m => !m.matAssignment)
    .map(m => ({
      id: m.id,
      roundNumber: m.roundNumber,
      matchNumber: m.matchNumber,
      status: m.status,
      divisionName: m.bracket.division.name,
      competitorNames: m.competitors.map(c => c.registrationEntry.registration.user.name ?? "TBD"),
    }))

  const completedMatches = allMatches
    .filter(m => m.status === "COMPLETED" && m.winnerEntryId)
    .map(m => ({
      id: m.id,
      roundNumber: m.roundNumber,
      matchNumber: m.matchNumber,
      divisionName: m.bracket.division.name,
      competitorNames: m.competitors.map(c => c.registrationEntry.registration.user.name ?? "TBD"),
    }))

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
      <MatAssignmentPanel
        tournamentId={id}
        assignmentsPromise={matAssignmentsPromise}
        unassignedMatches={unassignedMatches}
      />
      <FightRecordPanel
        fightRecordsPromise={fightRecordsPromise}
        completedMatches={completedMatches}
      />
    </Wrapper>
  )
})
