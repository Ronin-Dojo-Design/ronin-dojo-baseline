// Positive fixture: promotion-fact/anchor joins require a visible, reviewed exemption.
export async function loadPromotionFact(db: any) {
  return db.rankEntry.findMany({
    select: {
      // rank-read-guard: allow -- temporary awardedAt fact-anchor join until #380
      rankAward: { select: { awardedAt: true } },
    },
  });
}
