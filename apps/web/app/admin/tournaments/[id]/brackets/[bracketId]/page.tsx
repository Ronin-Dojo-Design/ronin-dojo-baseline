import { notFound } from "next/navigation"
import Link from "next/link"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { BracketViewer } from "~/app/admin/tournaments/_components/bracket-viewer"
import { findBracketsByDivisionId } from "~/server/admin/tournaments/bracket-queries"
import { db } from "~/services/db"

export default withAdminPage(async ({ params }) => {
  const { id, bracketId } = await params

  const bracket = await db.bracket.findUnique({
    where: { id: bracketId },
    include: {
      division: {
        select: { name: true, tournamentDisciplineId: true },
      },
      matches: {
        orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }],
        include: {
          competitors: {
            include: {
              registrationEntry: {
                include: {
                  registration: {
                    include: {
                      user: { select: { id: true, name: true } },
                    },
                  },
                },
              },
            },
            orderBy: { slot: "asc" },
          },
        },
      },
    },
  })

  if (!bracket) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Bracket: {bracket.division.name}
        </h2>
        <Link
          href={`/admin/tournaments/${id}`}
          className="text-sm text-primary hover:underline"
        >
          ← Back to Tournament
        </Link>
      </div>
      <BracketViewer bracket={bracket} />
    </Wrapper>
  )
})
