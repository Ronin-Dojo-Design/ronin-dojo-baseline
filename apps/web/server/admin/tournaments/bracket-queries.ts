"use server"

import { db } from "~/services/db"

export const findBracketsByDivisionId = async (divisionId: string) => {
  return db.bracket.findMany({
    where: { divisionId },
    include: {
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
}

export type BracketWithMatches = Awaited<
  ReturnType<typeof findBracketsByDivisionId>
>[number]

export type MatchWithCompetitors = BracketWithMatches["matches"][number]
