/**
 * cd apps/web && bun test server/web/community/permissions.test.ts
 *
 * FI-028 — the community-post CREATE gate (`canCreateCommunityPostForUser`). The participation
 * ladder (operator-ratified SESSION_0535): Free = READ · Premium = CREATE posts · Elite = AUTHOR
 * techniques. These pin all four legs of the gate, hermetically, via the INJECTED `database` (a
 * fake in-memory store) — no real DB / env is touched:
 *   1. RBAC `posts.manage` (admin `*` or a per-user override grant) → true, short-circuits the DB.
 *   2. ANY lineage-tier entitlement (PREMIUM ∨ ELITE ∨ LEGEND) → true. The Elite-ONLY-key case is
 *      the breadth proof: the gate queries the whole `LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS` set,
 *      NOT a PREMIUM-only check, so a member holding only `LINEAGE_ELITE` is allowed.
 *   3. Active OWNER/INSTRUCTOR `Membership` → true; a COACH is NOT (the tighter staff pair).
 *   4. Free member (no grant, no staff role) → false — the ONE intended behavior change.
 *
 * Mirrors the hermetic style of `technique-access.test.ts`: `~/services/db` (the default-param
 * import) + `~/env` are stubbed so importing the module pulls no email/db graph; the gate under test
 * receives the fake `database` explicitly.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS } from "~/lib/entitlements/lineage-tier-policy"

// Stub env validation BEFORE any import that pulls ~/env transitively.
mock.module("~/env", () => ({
  env: { NODE_ENV: "test", VERCEL_ENV: "development" },
  isProd: false,
}))

// The module imports `db as appDb` from ~/services/db for the DEFAULT param; the gate under test is
// always handed the fake `database` below, so this stub only keeps the import from booting Prisma.
mock.module("~/services/db", () => ({ db: {} }))

// A fake db keyed to the caller's held state. It faithfully honors the SHAPE the gate builds so the
// breadth assertion is real: `userEntitlement.findFirst` matches iff the query's `key.in` set (the
// gate's whole-ladder set) intersects the keys the user actually holds.
type EntitlementFindArgs = { where: { entitlement: { key: { in: string[] } } } }
type MembershipFindArgs = {
  where: { roleAssignments: { some: { role: { code: { in: string[] } } } } }
}

const store: { heldKeys: string[]; staffRole: string | null } = { heldKeys: [], staffRole: null }
const entitlementQueries: EntitlementFindArgs[] = []
const membershipQueries: MembershipFindArgs[] = []

const database = {
  userEntitlement: {
    findFirst: async (args: EntitlementFindArgs) => {
      entitlementQueries.push(args)
      const wanted = args.where.entitlement.key.in
      return store.heldKeys.some(key => wanted.includes(key)) ? { id: "ent-1" } : null
    },
  },
  membership: {
    findFirst: async (args: MembershipFindArgs) => {
      membershipQueries.push(args)
      const roles = args.where.roleAssignments.some.role.code.in
      return store.staffRole && roles.includes(store.staffRole) ? { id: "mem-1" } : null
    },
  },
} as never

const BRAND = "BBL" as never

beforeEach(() => {
  store.heldKeys = []
  store.staffRole = null
  entitlementQueries.length = 0
  membershipQueries.length = 0
})

describe("canCreateCommunityPostForUser", () => {
  it("DENIES a free member — no entitlement, no staff role (the ONE intended behavior change)", async () => {
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "free-1", role: "user" } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(false)
    // Breadth proof: the tier query was issued against the WHOLE ladder set, not a PREMIUM-only key.
    expect(entitlementQueries).toHaveLength(1)
    expect(entitlementQueries[0]?.where.entitlement.key.in).toEqual([
      ...LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS,
    ])
  })

  it("ALLOWS a Premium member (active LINEAGE_PREMIUM grant) — no staff query needed", async () => {
    store.heldKeys = [LINEAGE_PREMIUM_ENTITLEMENT_KEY]
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "premium-1", role: "user" } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(true)
    // The entitlement leg runs BEFORE the membership query, so the hot path skips it.
    expect(membershipQueries).toHaveLength(0)
  })

  it("ALLOWS an Elite member holding ONLY LINEAGE_ELITE (no PREMIUM key) — the any-tier-key breadth proof", async () => {
    store.heldKeys = [LINEAGE_ELITE_ENTITLEMENT_KEY]
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "elite-1", role: "user" } as never,
      BRAND,
      database,
    )

    // A PREMIUM-only check would return false here; the whole-ladder set gate returns true.
    expect(allowed).toBe(true)
  })

  it("ALLOWS a Legend member holding ONLY LINEAGE_LEGEND", async () => {
    store.heldKeys = [LINEAGE_LEGEND_ENTITLEMENT_KEY]
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "legend-1", role: "user" } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(true)
  })

  it("ALLOWS a staff OWNER (active Membership) with no entitlement", async () => {
    store.staffRole = "OWNER"
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "owner-1", role: "user" } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(true)
  })

  it("ALLOWS a staff INSTRUCTOR (active Membership) with no entitlement", async () => {
    store.staffRole = "INSTRUCTOR"
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "instructor-1", role: "user" } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(true)
  })

  it("DENIES a COACH — the gate is the tighter OWNER/INSTRUCTOR pair, not the broad media set", async () => {
    store.staffRole = "COACH"
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "coach-1", role: "user" } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(false)
  })

  it("ALLOWS an admin via RBAC (`*` grant) and short-circuits — no DB query at all", async () => {
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "admin-1", role: "admin" } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(true)
    expect(entitlementQueries).toHaveLength(0)
    expect(membershipQueries).toHaveLength(0)
  })

  it("ALLOWS a non-admin holding a `posts.manage` override grant (RBAC leg) and short-circuits", async () => {
    const { canCreateCommunityPostForUser } = await import("./permissions")

    const allowed = await canCreateCommunityPostForUser(
      { id: "granted-1", role: "user", extraGrants: ["posts.manage"] } as never,
      BRAND,
      database,
    )

    expect(allowed).toBe(true)
    expect(entitlementQueries).toHaveLength(0)
    expect(membershipQueries).toHaveLength(0)
  })
})
