import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export const findRegistrationsByTournamentId = async (
  tournamentId: string,
  brand?: Brand,
) => {
  return db.registration.findMany({
    where: {
      tournamentId,
      ...(brand ? { tournament: { brand } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tournamentId: true,
      status: true,
      paymentStatus: true,
      totalFeeCents: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      entries: {
        select: {
          id: true,
          division: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })
}
