import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/accordion"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"

type CompletedMatch = {
  id: string
  roundNumber: number
  matchNumber: number
  result: string | null
  winnerEntryId: string | null
  competitors: {
    id: string
    slot: number
    seed: number | null
    registrationEntry: {
      id: string
      registration: {
        user: {
          id: string
          name: string | null
          passport: { displayName: string | null } | null
        } | null
        guestName: string | null
        guestEmail: string | null
      }
      representingMembership: {
        organization: { name: string }
      } | null
    }
  }[]
}

type DivisionResult = {
  id: string
  name: string
  format: string
  gender: string
  brackets: {
    id: string
    name: string
    matches: CompletedMatch[]
  }[]
}

type BracketResultsProps = {
  divisions: DivisionResult[]
}

function getCompetitorName(competitor: CompletedMatch["competitors"][number]): string {
  const r = competitor.registrationEntry.registration
  return r.user?.passport?.displayName ?? r.user?.name ?? r.guestName ?? r.guestEmail ?? "Unknown"
}

function formatResult(result: string | null): string {
  if (!result) return ""
  return result
    .replace(/_/g, " ")
    .replace(/^WIN /, "")
    .toLowerCase()
    .replace(/^./, c => c.toUpperCase())
}

export function BracketResults({ divisions }: BracketResultsProps) {
  const divisionsWithMatches = divisions.filter(d => d.brackets.some(b => b.matches.length > 0))

  if (divisionsWithMatches.length === 0) {
    return (
      <Card className="p-6">
        <Note>No completed matches yet.</Note>
      </Card>
    )
  }

  return (
    <Accordion type="multiple" defaultValue={divisionsWithMatches.map(d => d.id)}>
      {divisionsWithMatches.map(division => (
        <AccordionItem key={division.id} value={division.id}>
          <AccordionTrigger>
            <Stack direction="row" size="sm" className="items-center">
              <span className="font-semibold">{division.name}</span>
              <Badge variant="outline">{division.format.replace(/_/g, " ")}</Badge>
              <Badge variant="soft">{division.gender}</Badge>
            </Stack>
          </AccordionTrigger>
          <AccordionContent>
            <Stack direction="column" size="md">
              {division.brackets.map(bracket => {
                // Group matches by round, descending (final first)
                const rounds = new Map<number, CompletedMatch[]>()
                for (const match of bracket.matches) {
                  const existing = rounds.get(match.roundNumber) ?? []
                  existing.push(match)
                  rounds.set(match.roundNumber, existing)
                }

                const maxRound = Math.max(...Array.from(rounds.keys()))

                return (
                  <Stack key={bracket.id} direction="column" size="sm">
                    {bracket.name !== "Main" && <Note className="font-medium">{bracket.name}</Note>}
                    {Array.from(rounds.entries())
                      .sort(([a], [b]) => b - a)
                      .map(([roundNumber, matches]) => {
                        const roundLabel =
                          roundNumber === maxRound
                            ? "Final"
                            : roundNumber === maxRound - 1
                              ? "Semifinal"
                              : `Round ${roundNumber}`

                        return (
                          <Stack key={roundNumber} direction="column" size="xs">
                            <H4 render={props => <h5 {...props}>{props.children}</h5>}>
                              {roundLabel}
                            </H4>
                            {matches
                              .sort((a, b) => a.matchNumber - b.matchNumber)
                              .map(match => (
                                <MatchResultCard key={match.id} match={match} />
                              ))}
                          </Stack>
                        )
                      })}
                  </Stack>
                )
              })}
            </Stack>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function MatchResultCard({ match }: { match: CompletedMatch }) {
  return (
    <Card className="p-4">
      <Stack direction="column" size="xs">
        {match.competitors.map(comp => {
          const isWinner = comp.registrationEntry.id === match.winnerEntryId
          const name = getCompetitorName(comp)
          const org = comp.registrationEntry.representingMembership?.organization.name

          return (
            <Stack key={comp.id} direction="row" size="sm" className="items-center justify-between">
              <Stack direction="row" size="sm" className="items-center">
                {comp.seed != null && <Note>#{comp.seed}</Note>}
                <span className={isWinner ? "font-semibold" : "text-muted-foreground"}>{name}</span>
                {org && <Note>{org}</Note>}
              </Stack>
              {isWinner && (
                <Badge variant="success" size="sm">
                  W
                </Badge>
              )}
            </Stack>
          )
        })}
        {match.result && <Note>via {formatResult(match.result)}</Note>}
      </Stack>
    </Card>
  )
}
