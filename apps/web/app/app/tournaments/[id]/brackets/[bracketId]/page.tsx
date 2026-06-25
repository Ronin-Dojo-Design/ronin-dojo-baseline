import Link from "next/link"
import { notFound } from "next/navigation"
import { BracketViewer } from "~/app/app/tournaments/_components/bracket-viewer"
import { Wrapper } from "~/components/common/wrapper"
import { db } from "~/services/db"

export default async ({ params }: PageProps<"/app/tournaments/[id]/brackets/[bracketId]">) => {
  const { id, bracketId } = await params

  const bracket = await db.bracket.findUnique({
    where: { id: bracketId },
    include: {
      division: {
        select: {
          name: true,
          tournamentDisciplineId: true,
          ruleSet: { select: { id: true, name: true, scoringMethod: true } },
          tournamentDiscipline: {
            select: { ruleSet: { select: { id: true, name: true, scoringMethod: true } } },
          },
        },
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

  // Resolve rule set: division-level overrides discipline-level
  const ruleSet = bracket.division.ruleSet ?? bracket.division.tournamentDiscipline.ruleSet ?? null
  const scoringMethod = ruleSet?.scoringMethod ?? "POINTS"

  return (
    <Wrapper size="md" gap="sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bracket: {bracket.division.name}</h2>
        <Link href={`/app/tournaments/${id}`} className="text-sm text-primary hover:underline">
          ← Back to Tournament
        </Link>
      </div>
      <BracketViewer bracket={bracket} scoringMethod={scoringMethod} />
    </Wrapper>
  )
}
