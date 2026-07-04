// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { findJoinLegacyLeadCountry } from "./lead-country"

/**
 * SESSION_0496 TASK_05 — signup country seeding from the join-the-legacy lead.
 *
 * Pure-helper tests with an injectable db stub (no DB, no mock.module): the contract
 * is (1) a valid asserted country resolves to the uppercase alpha-2 code, (2) any
 * bogus/unknown meta value is SKIPPED (null), (3) no lead → null, and (4) the lookup
 * NEVER throws — a bad lead must not block signup (`ensureIdentityShell` caller).
 */

type StubMeta = unknown

const stubDb = (meta: StubMeta | null) =>
  ({
    lead: {
      findFirst: async () => (meta === null ? null : { meta }),
    },
  }) as never

describe("findJoinLegacyLeadCountry", () => {
  it("resolves a valid asserted country to the uppercase alpha-2 code", async () => {
    expect(
      await findJoinLegacyLeadCountry({ db: stubDb({ country: "us" }), email: "A@b.co" }),
    ).toBe("US")
    expect(
      await findJoinLegacyLeadCountry({ db: stubDb({ country: "BR" }), email: "a@b.co" }),
    ).toBe("BR")
  })

  it("skips bogus meta values (wrong type, wrong length, unknown code, malformed meta)", async () => {
    // Wrong length / not a known code / wrong type — every one must resolve to null.
    expect(
      await findJoinLegacyLeadCountry({ db: stubDb({ country: "USA" }), email: "a@b.co" }),
    ).toBeNull()
    expect(
      await findJoinLegacyLeadCountry({ db: stubDb({ country: "ZQ" }), email: "a@b.co" }),
    ).toBeNull()
    expect(
      await findJoinLegacyLeadCountry({ db: stubDb({ country: 42 }), email: "a@b.co" }),
    ).toBeNull()
    expect(
      await findJoinLegacyLeadCountry({ db: stubDb({ country: null }), email: "a@b.co" }),
    ).toBeNull()
    // meta itself malformed: an array or a scalar instead of the object shape.
    expect(await findJoinLegacyLeadCountry({ db: stubDb(["US"]), email: "a@b.co" })).toBeNull()
    expect(await findJoinLegacyLeadCountry({ db: stubDb("US"), email: "a@b.co" })).toBeNull()
  })

  it("skips when no matching lead exists", async () => {
    expect(await findJoinLegacyLeadCountry({ db: stubDb(null), email: "a@b.co" })).toBeNull()
  })

  it("never throws — a failing lookup resolves to null (signup must not block)", async () => {
    const throwingDb = {
      lead: {
        findFirst: async () => {
          throw new Error("db exploded")
        },
      },
    } as never
    expect(await findJoinLegacyLeadCountry({ db: throwingDb, email: "a@b.co" })).toBeNull()
  })
})
