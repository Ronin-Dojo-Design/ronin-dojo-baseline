/**
 * cd apps/web && bun test server/web/techniques/permissions.test.ts
 *
 * WL-P2-64 (SESSION_0546 Doug P2) — query-shape pinning for the ONE shared staff predicate
 * (`activeStaffMembershipWhere` + `findActiveStaffMembership`, WL-P2-49). Six consumers ride this
 * helper; the drift class it killed (SESSION_0529) was hand-copied variants that dropped
 * `status: ACTIVE` — a CANCELLED staff membership must never authorize. These tests pin, via a
 * mocked Prisma `membership.findFirst` recorder (no real DB, no network):
 *   1. Brand scope rides the `Membership.brand` COLUMN (minted from the org's brand), NOT a nested
 *      `organization: { brand }` relation filter.
 *   2. Organization scope pins the school id and adds NO brand key.
 *   3. Both scopes carry the hardened fragment: `status: ACTIVE` + the tighter OWNER/INSTRUCTOR
 *      role pair (ADR 0046 D5 — deliberately NOT the broader media-authoring set).
 *   4. The select is the minimal `{ id, organizationId }` create-surface payload.
 *
 * Mirrors the hermetic style of `community/permissions.test.ts`: `~/env` + `~/services/db` are
 * stubbed so importing the module boots no Prisma/email graph, and the entitlement seam
 * (`~/server/web/entitlements/queries`, a `next/cache` module) is stubbed as in
 * `apply-technique.test.ts`. The helper under test receives the fake `database` explicitly.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

// Stub env validation BEFORE any import that pulls ~/env transitively.
mock.module("~/env", () => ({
  env: { NODE_ENV: "test", VERCEL_ENV: "development" },
  isProd: false,
}))

// The module imports `db as appDb` from ~/services/db only for the DEFAULT param of the capability
// gate; the helper under test is always handed the fake `database` below, so this stub only keeps
// the import from booting Prisma.
mock.module("~/services/db", () => ({ db: {} }))

// The entitlement seam is a `next/cache` ("use cache") module — stubbed so the import graph stays
// hermetic. Nothing in this file calls it.
mock.module("~/server/web/entitlements/queries", () => ({
  hasEntitlement: async () => false,
}))

/** The hardened fragment every scope must carry (WL-P2-49 / SESSION_0529 Giddy fix-now). */
const HARDENED_STAFF_FRAGMENT = {
  userId: "user-1",
  status: "ACTIVE",
  roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } },
}

type MembershipFindFirstArgs = {
  where: Record<string, unknown>
  select: Record<string, unknown>
}

const membershipQueries: MembershipFindFirstArgs[] = []
const store: { row: { id: string; organizationId: string } | null } = { row: null }

const database = {
  membership: {
    findFirst: async (args: MembershipFindFirstArgs) => {
      membershipQueries.push(args)
      return store.row
    },
  },
} as never

beforeEach(() => {
  membershipQueries.length = 0
  store.row = null
})

describe("activeStaffMembershipWhere", () => {
  it("is the hardened fragment: userId + ACTIVE status + the tighter OWNER/INSTRUCTOR pair", async () => {
    const { activeStaffMembershipWhere } = await import("./permissions")

    // `toEqual` pins the EXACT shape — a drifted copy that drops `status` (the SESSION_0529 drift
    // class) or widens the role set (e.g. adds COACH) fails here.
    expect(activeStaffMembershipWhere("user-1")).toEqual(HARDENED_STAFF_FRAGMENT)
  })
})

describe("findActiveStaffMembership", () => {
  it("brand scope filters the Membership.brand COLUMN (not organization: { brand }) on the hardened fragment", async () => {
    const { findActiveStaffMembership } = await import("./permissions")
    store.row = { id: "mem-1", organizationId: "org-1" }

    const staff = await findActiveStaffMembership(database, "user-1", { brand: "BBL" as never })

    expect(staff).toEqual({ id: "mem-1", organizationId: "org-1" })
    expect(membershipQueries).toHaveLength(1)
    // Exact-shape pin: brand is a TOP-LEVEL Membership column; no nested organization filter, no
    // stray keys.
    expect(membershipQueries[0]?.where).toEqual({
      ...HARDENED_STAFF_FRAGMENT,
      brand: "BBL",
    })
  })

  it("organization scope pins the school id, adds NO brand key, and keeps the hardened fragment", async () => {
    const { findActiveStaffMembership } = await import("./permissions")

    const staff = await findActiveStaffMembership(database, "user-1", {
      organizationId: "org-42",
    })

    // Recorder returned null → not staff.
    expect(staff).toBeNull()
    expect(membershipQueries).toHaveLength(1)
    expect(membershipQueries[0]?.where).toEqual({
      ...HARDENED_STAFF_FRAGMENT,
      organizationId: "org-42",
    })
  })

  it("selects the minimal { id, organizationId } payload (create surfaces target the school)", async () => {
    const { findActiveStaffMembership } = await import("./permissions")

    await findActiveStaffMembership(database, "user-1", { brand: "BBL" as never })

    expect(membershipQueries[0]?.select).toEqual({ id: true, organizationId: true })
  })
})
