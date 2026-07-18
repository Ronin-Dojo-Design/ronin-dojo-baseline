/**
 * cd apps/web && bun test server/web/dashboard/queries.test.ts
 *
 * WL-P2-64 (SESSION_0546 Doug P2) — the dashboard consumer of the ONE shared staff predicate.
 * `findUserTechniques` was the LAST unhardened copy of the staff-membership shape (SESSION_0529
 * Giddy drift class): WL-P2-49 repointed its staff leg onto `activeStaffMembershipWhere`, which
 * deliberately ADDED `status: ACTIVE` — a CANCELLED staff member no longer sees org rows they
 * can't edit. This pins, via a mocked Prisma `technique.findMany` recorder (no real DB, no
 * network):
 *   1. The staff leg nests the SHARED predicate (referential proof: deep-equals
 *      `activeStaffMembershipWhere(userId)`) inside `organization.memberships.some` — ACTIVE
 *      status + OWNER/INSTRUCTOR included.
 *   2. The staff leg scopes brand via the ORGANIZATION relation (this is the one nested-relation
 *      consumer — unlike `findActiveStaffMembership`, which filters the `Membership.brand` column).
 *   3. The author leg (`brand` + `author: { userId }`, ADR 0046 D2) rides alongside in the OR.
 *
 * Mirrors the hermetic style of `community/permissions.test.ts`: `~/env` + `~/services/db` are
 * stubbed BEFORE the module under test loads (it reads the GLOBAL db), and the entitlement seam
 * (`next/cache` module pulled transitively via techniques/permissions) is stubbed as in
 * `apply-technique.test.ts`.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

// Stub env validation BEFORE any import that pulls ~/env transitively.
mock.module("~/env", () => ({
  env: { NODE_ENV: "test", VERCEL_ENV: "development" },
  isProd: false,
}))

// `findUserTechniques` reads the GLOBAL db (module-level import) — the stub records the exact
// Prisma args the query issues. Only `technique.findMany` is exercised by this file.
type TechniqueFindManyArgs = { where: Record<string, unknown> }
const techniqueQueries: TechniqueFindManyArgs[] = []
mock.module("~/services/db", () => ({
  db: {
    technique: {
      findMany: async (args: TechniqueFindManyArgs) => {
        techniqueQueries.push(args)
        return []
      },
    },
  },
}))

// The entitlement seam is a `next/cache` ("use cache") module — stubbed so the import graph stays
// hermetic. Nothing in this file calls it.
mock.module("~/server/web/entitlements/queries", () => ({
  hasEntitlement: async () => false,
}))

beforeEach(() => {
  techniqueQueries.length = 0
})

describe("findUserTechniques", () => {
  it("staff leg rides the SHARED hardened predicate (ACTIVE + OWNER/INSTRUCTOR) under the org's brand; author leg alongside", async () => {
    const { findUserTechniques } = await import("./queries")

    await findUserTechniques("user-1", "BBL" as never)

    expect(techniqueQueries).toHaveLength(1)
    // Exact-shape pin of the whole where: a drifted copy that re-inlines the predicate without
    // `status: ACTIVE` (the SESSION_0529 drift class) fails here.
    expect(techniqueQueries[0]?.where).toEqual({
      OR: [
        {
          organization: {
            brand: "BBL",
            memberships: {
              some: {
                userId: "user-1",
                status: "ACTIVE",
                roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } },
              },
            },
          },
        },
        { brand: "BBL", author: { userId: "user-1" } },
      ],
    })
  })

  it("the staff leg IS activeStaffMembershipWhere(userId) — the consumer stays pointed at the ONE predicate", async () => {
    const { activeStaffMembershipWhere } = await import("~/server/web/techniques/permissions")
    const { findUserTechniques } = await import("./queries")

    await findUserTechniques("user-2", "BBL" as never)

    expect(techniqueQueries).toHaveLength(1)
    const recorded = techniqueQueries[0] as {
      where: { OR: Array<{ organization?: { memberships: { some: unknown } } }> }
    }
    const staffLeg = recorded.where.OR[0]?.organization?.memberships.some

    // Referential-shape proof: if `findUserTechniques` drifts off the shared helper (hand-copies a
    // variant), this deep-equal breaks the moment the helper and the copy diverge.
    expect(staffLeg).toEqual(activeStaffMembershipWhere("user-2"))
  })
})
