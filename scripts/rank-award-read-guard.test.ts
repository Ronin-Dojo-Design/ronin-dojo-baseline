import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import {
  collectRankAwardReadRoots,
  findNewRankAwardReadRoots,
  main,
} from "./rank-award-read-guard";

const fixtures = resolve(import.meta.dirname, "fixtures/rank-award-read-guard");
const newRoots = (base: string, candidate: string) =>
  findNewRankAwardReadRoots(base, candidate).map((root) => root.kind);

describe("RankAward direct-read guard fixtures", () => {
  it("keeps transitional writes green", () => {
    expect(main(["--fixture", resolve(fixtures, "allowed-write.ts")])).toBe(0);
  });

  it("keeps a reviewed temporary fact-anchor join green", () => {
    expect(main(["--fixture", resolve(fixtures, "allowed-anchor.ts")])).toBe(0);
  });

  it("defeats a new direct member-rank display read", () => {
    expect(main(["--fixture", resolve(fixtures, "forbidden-display-read.ts")])).toBe(1);
  });
});

describe("semantic occurrence comparison", () => {
  it("fails when an existing findMany is replaced by a different findMany", () => {
    const base = `db.rankAward.findMany({ where: { promotionEventId: eventId } })`;
    const candidate = `db.rankAward.findMany({
      where: { passportId },
      orderBy: { rank: { sortOrder: "desc" } },
    })`;
    expect(newRoots(base, candidate)).toEqual(["delegate:findMany"]);
  });

  it("preserves a semantically unchanged root across formatting or rename", () => {
    const base = `db.rankAward.findMany({where:{promotionEventId:eventId}})`;
    const renamedCandidate = `db.rankAward.findMany({ where: { promotionEventId: eventId } })`;
    expect(newRoots(base, renamedCandidate)).toEqual([]);
  });

  it("counts duplicate semantic occurrences instead of collapsing them", () => {
    const read = `db.rankAward.findMany({ where: { passportId } })`;
    expect(newRoots(read, `${read}\n${read}`)).toEqual(["delegate:findMany"]);
  });
});

describe("AST read-root recognition", () => {
  it("detects dot, bracket, and optional-chain delegate reads", () => {
    const roots = collectRankAwardReadRoots(`
      db.rankAward.findFirst({ where })
      db["rankAward"].findMany({ where })
      db.rankAward?.findUnique({ where })
      db["rankAward"]?.count({ where })
    `);
    expect(roots.map((root) => root.kind)).toEqual([
      "delegate:findFirst",
      "delegate:findMany",
      "delegate:findUnique",
      "delegate:count",
    ]);
  });

  it("detects direct and destructured RankAward delegate aliases", () => {
    const roots = collectRankAwardReadRoots(`
      const awards = db.rankAward
      awards.findMany({ where: { passportId } })
      const { rankAward: awardDelegate } = db
      awardDelegate.findFirst({ where: { id } })
      const { rankAward } = db
      rankAward.count({ where: { passportId } })
    `);
    expect(roots.map((root) => root.kind)).toEqual([
      "delegate:findMany",
      "delegate:findFirst",
      "delegate:count",
    ]);
  });

  it("treats exported RankAward delegate aliases as cross-file roots", () => {
    const roots = collectRankAwardReadRoots(`
      export const awards = db.rankAward
      export const { rankAward: awardDelegate } = db
    `);
    expect(roots.map((root) => root.kind)).toEqual([
      "delegate-alias:rankAward",
      "delegate-alias:rankAward",
    ]);
  });

  it("does not mistake another exported Prisma delegate for RankAward", () => {
    expect(collectRankAwardReadRoots(`export const entries = db.rankEntry`)).toEqual([]);
  });

  it("detects RankAward relations only inside reads", () => {
    const roots = collectRankAwardReadRoots(`
      db.passport.findMany({
        select: { rankAwardsEarned: { select: { id: true } } },
      })
      db.rankEntry.findMany({
        select: { rankAward: { select: { awardedAt: true } } },
      })
    `);
    expect(roots.map((root) => root.kind)).toEqual([
      "relation:rankAwardsEarned",
      "relation:rankAward",
    ]);
  });

  it("resolves typed, validator, and shared-alias Prisma select objects", () => {
    const roots = collectRankAwardReadRoots(`
      const typed: Prisma.PassportSelect = {
        rankAwardsEarned: { select: { id: true } },
      }
      const validated = Prisma.validator<Prisma.PassportSelect>()({
        rankAwardsPromoted: { select: { id: true } },
      })
      const shared = { rankAward: { select: { awardedAt: true } } } as const
      db.passport.findMany({ select: shared })
    `);
    expect(roots.map((root) => root.kind)).toEqual([
      "relation:rankAwardsEarned",
      "relation:rankAwardsPromoted",
      "relation:rankAward",
    ]);
  });

  it("treats an exported relation-bearing query constant as a cross-file root", () => {
    const roots = collectRankAwardReadRoots(`
      export const passportSelect = {
        rankAwardsEarned: { select: { id: true, rank: true } },
      } as const
    `);
    expect(roots.map((root) => root.kind)).toEqual(["relation:rankAwardsEarned"]);
  });

  it("does not mistake exported ordinary RankAward domain values for query constants", () => {
    const roots = collectRankAwardReadRoots(`
      export const card = { rankAward: { id: "a1", awardedAt: "2026-01-01" } } as const
      export const emptyHistory = { rankAwards: [] } as const
      export const copy = "rankAwardsEarned: { select: { id: true } }"
    `);
    expect(roots).toEqual([]);
  });

  it("resolves the exact shared-select binding despite a later same-name function binding", () => {
    const roots = collectRankAwardReadRoots(`
      function hidden() {
        const select = { rankAwardsEarned: { select: { id: true } } }
        return db.passport.findMany({ select })
      }
      function later() {
        const select = { id: true }
        return db.passport.findMany({ select })
      }
    `);
    expect(roots.map((root) => root.kind)).toEqual(["relation:rankAwardsEarned"]);
  });

  it("keeps same-name select bindings isolated across nested and sibling blocks", () => {
    const roots = collectRankAwardReadRoots(`
      function outer() {
        const select = { rankAward: { select: { awardedAt: true } } }
        {
          const select = { id: true }
          db.rankEntry.findMany({ select })
        }
        return db.rankEntry.findMany({ select })
      }
      function sibling() {
        const select = { id: true }
        return db.rankEntry.findMany({ select })
      }
    `);
    expect(roots.map((root) => root.kind)).toEqual(["relation:rankAward"]);
  });

  it("keeps same-name delegate aliases isolated across functions", () => {
    const roots = collectRankAwardReadRoots(`
      function forbidden() {
        const rows = db.rankAward
        return rows.findMany({ where: { passportId } })
      }
      function safe() {
        const rows = db.rankEntry
        return rows.findMany({ where: { passportId } })
      }
    `);
    expect(roots.map((root) => root.kind)).toEqual(["delegate:findMany"]);
  });

  it("does not flag writes or nested write relations", () => {
    const roots = collectRankAwardReadRoots(`
      db.rankAward.create({ data: { passportId, rankId } })
      db.rankAward.update({ where: { id }, data: { awardedAt } })
      db.rankAward.upsert({ where: { id }, create: data, update: data })
      db.rankAward.delete({ where: { id } })
      db.rankEntry.create({ data: { rankAward: { connect: { id } } } })
    `);
    expect(roots).toEqual([]);
  });

  it("ignores comments, strings, type members, and ordinary object data", () => {
    const roots = collectRankAwardReadRoots(`
      // db.rankAward.findMany({})
      const text = "db.rankAward.findMany({ rankAward: true })"
      type Payload = { rankAward: { id: string }; rankAwards: unknown[] }
      const fixture = { rankAward: { id: "a1" }, rankAwards: [] }
    `);
    expect(roots).toEqual([]);
  });
});

describe("strict exemption syntax", () => {
  const read = `db.rankAward.findMany({ where: { promotionEventId } })`;

  it("accepts only an immediately preceding line comment with a nonempty reason", () => {
    expect(
      collectRankAwardReadRoots(
        `// rank-read-guard: allow -- temporary promotion-event fact read until #380\n${read}`,
      ),
    ).toEqual([]);
  });

  it("rejects same-line, string, bare, and separated markers", () => {
    const candidates = [
      `${read} // rank-read-guard: allow -- same line`,
      `"rank-read-guard: allow -- string"\n${read}`,
      `// rank-read-guard: allow\n${read}`,
      `// rank-read-guard: allow --    \n${read}`,
      `// rank-read-guard: allow -- reason\n\n${read}`,
    ];
    for (const candidate of candidates) {
      expect(collectRankAwardReadRoots(candidate).map((root) => root.kind)).toEqual([
        "delegate:findMany",
      ]);
    }
  });
});
