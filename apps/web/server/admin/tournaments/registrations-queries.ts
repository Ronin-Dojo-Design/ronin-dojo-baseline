import { db } from "~/services/db"

export const findRegistrationsByTournamentId = async (tournamentId: string) => {
  return db.registration.findMany({
    where: { tournamentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
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
