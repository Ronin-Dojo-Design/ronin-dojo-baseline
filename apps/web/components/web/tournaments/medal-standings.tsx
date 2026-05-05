import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"
import type React from "react"

type CompletedMatch = {
  id: string
  roundNumber: number
  matchNumber: number
  result: string | null
  winnerEntryId: string | null
  competitors: {
    id: string
    slot: number
    registrationEntry: {
      id: string
      registration: {
        user: {
          id: string
          name: string | null
          passport: { displayName: string | null } | null
        }
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

type MedalStandingsProps = {
  divisions: DivisionResult[]
}

type MedalEntry = {
  name: string
  org: string | null
  medal: "gold" | "silver" | "bronze"
  division: string
}

function getCompetitorName(
  competitor: CompletedMatch["competitors"][number],
): string {
  const passport = competitor.registrationEntry.registration.user.passport
  return (
    passport?.displayName ??
    competitor.registrationEntry.registration.user.name ??
    "Unknown"
  )
}

function getCompetitorOrg(
  competitor: CompletedMatch["competitors"][number],
): string | null {
  return competitor.registrationEntry.representingMembership?.organization.name ?? null
}

function deriveMedals(divisions: DivisionResult[]): MedalEntry[] {
  const medals: MedalEntry[] = []

  for (const division of divisions) {
    for (const bracket of division.brackets) {
      if (bracket.matches.length === 0) continue

      // Find the final match (highest round number)
      const maxRound = Math.max(...bracket.matches.map((m) => m.roundNumber))
      const finalMatch = bracket.matches.find(
        (m) => m.roundNumber === maxRound && m.matchNumber === 1,
      )

      if (!finalMatch || !finalMatch.winnerEntryId) continue

      // Gold = winner of final
      const goldComp = finalMatch.competitors.find(
        (c) => c.registrationEntry.id === finalMatch.winnerEntryId,
      )
      if (goldComp) {
        medals.push({
          name: getCompetitorName(goldComp),
          org: getCompetitorOrg(goldComp),
          medal: "gold",
          division: division.name,
        })
      }

      // Silver = loser of final
      const silverComp = finalMatch.competitors.find(
        (c) => c.registrationEntry.id !== finalMatch.winnerEntryId,
      )
      if (silverComp) {
        medals.push({
          name: getCompetitorName(silverComp),
          org: getCompetitorOrg(silverComp),
          medal: "silver",
          division: division.name,
        })
      }

      // Bronze = losers of semifinals (round before final)
      const semiFinalRound = maxRound - 1
      if (semiFinalRound >= 1) {
        const semiMatches = bracket.matches.filter(
          (m) => m.roundNumber === semiFinalRound,
        )
        for (const semi of semiMatches) {
          if (!semi.winnerEntryId) continue
          const bronzeComp = semi.competitors.find(
            (c) => c.registrationEntry.id !== semi.winnerEntryId,
          )
          if (bronzeComp) {
            medals.push({
              name: getCompetitorName(bronzeComp),
              org: getCompetitorOrg(bronzeComp),
              medal: "bronze",
              division: division.name,
            })
          }
        }
      }
    }
  }

  return medals
}

const medalVariant = {
  gold: "warning" as const,
  silver: "info" as const,
  bronze: "soft" as const,
}

const medalLabel = {
  gold: "🥇 Gold",
  silver: "🥈 Silver",
  bronze: "🥉 Bronze",
}

export function MedalStandings({ divisions }: MedalStandingsProps) {
  const medals = deriveMedals(divisions)

  if (medals.length === 0) {
    return (
      <Card className="p-6">
        <Note>No completed brackets yet. Results will appear once matches are scored.</Note>
      </Card>
    )
  }

  // Group by division
  const byDivision = new Map<string, MedalEntry[]>()
  for (const m of medals) {
    const existing = byDivision.get(m.division) ?? []
    existing.push(m)
    byDivision.set(m.division, existing)
  }

  return (
    <Stack direction="column" size="lg">
      {Array.from(byDivision.entries()).map(([divisionName, entries]) => (
        <Card key={divisionName} className="p-5">
          <H4>{divisionName}</H4>
          <Table
            className="mt-3"
            style={{ "--table-columns": "repeat(3, minmax(0, 1fr))" } as React.CSSProperties}
          >
            <TableHeader>
              <TableRow>
                <TableHead>Medal</TableHead>
                <TableHead>Competitor</TableHead>
                <TableHead>Team</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, i) => (
                <TableRow key={`${entry.name}-${entry.medal}-${i}`}>
                  <TableCell>
                    <Badge variant={medalVariant[entry.medal]}>
                      {medalLabel[entry.medal]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>
                    {entry.org ? (
                      <Note>{entry.org}</Note>
                    ) : (
                      <Note>Independent</Note>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}
    </Stack>
  )
}
