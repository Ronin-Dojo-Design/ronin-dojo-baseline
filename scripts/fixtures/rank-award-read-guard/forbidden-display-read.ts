// Negative fixture: a new member-rank display root must fail mechanically.
export async function loadDisplayedRanks(db: any) {
  return db.rankAward.findMany({
    where: { passportId: "p1" },
    orderBy: { rank: { sortOrder: "desc" } },
  });
}
