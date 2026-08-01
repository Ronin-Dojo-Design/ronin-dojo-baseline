// Positive fixture: #377 explicitly preserves the RankAward write bridge until #380.
export async function createTransitionalAward(db: any) {
  return db.rankAward.create({ data: { passportId: "p1", rankId: "r1" } });
}
