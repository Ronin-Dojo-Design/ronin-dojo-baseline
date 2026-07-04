// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { SessionUser } from "~/server/orpc/context"
import { can, matchesPattern } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

const asUser = (role: string, id = "u1") => {
  return { id, role } as unknown as SessionUser
}

const admin = asUser("admin", "admin-1")
const member = asUser("user", "user-1")
const guest = null

describe("matchesPattern", () => {
  it("wildcard grant covers everything", () => {
    expect(matchesPattern("*", "tools.read")).toBe(true)
    expect(matchesPattern("*", "anything.at.all")).toBe(true)
  })

  it("entity wildcard covers any action on that entity", () => {
    expect(matchesPattern("tools.*", "tools.read")).toBe(true)
    expect(matchesPattern("tools.*", "tools.update")).toBe(true)
    expect(matchesPattern("tools.*", "tools.delete")).toBe(true)
  })

  it("entity wildcard does not cross entity boundaries", () => {
    expect(matchesPattern("tools.*", "posts.read")).toBe(false)
    expect(matchesPattern("tools.*", "toolsx.read")).toBe(false)
  })

  it("atomic grant matches the same permission exactly", () => {
    expect(matchesPattern("tools.read", "tools.read")).toBe(true)
    expect(matchesPattern("tools.read", "tools.update")).toBe(false)
  })
})

describe("can — admin role", () => {
  it("allows any permission", () => {
    expect(can(admin, "health.read")).toBe(true)
    expect(can(admin, "users.delete")).toBe(true)
    expect(can(admin, "anything.at.all")).toBe(true)
  })
})

describe("can — guest (unauthenticated)", () => {
  it("allows the public actions a guest is granted (health smoke + public lineage read)", () => {
    expect(can(guest, "health.read")).toBe(true)
    // Phase 1c (SESSION_0364): the public `/lineage/[treeSlug]` read migrated
    // to oRPC; its `lineage.read` permission is a public grant.
    expect(can(guest, "lineage.read")).toBe(true)
  })

  it("denies everything not granted (deny-by-default)", () => {
    expect(can(guest, "tools.read")).toBe(false)
    expect(can(guest, "lineage.edit")).toBe(false)
    expect(can(guest, "claim.review")).toBe(false)
    expect(can(guest, "users.delete")).toBe(false)
  })

  it("falls back to guest for users with an unknown role string", () => {
    const weird = asUser("nonexistent-role")
    expect(can(weird, "health.read")).toBe(true)
    expect(can(weird, "claim.review")).toBe(false)
  })

  it("still denies an unmapped role string (deny-by-default)", () => {
    const unmapped = asUser("some-future-role")
    expect(can(unmapped, "health.read")).toBe(true)
    expect(can(unmapped, "tournaments.manage")).toBe(false)
    expect(can(unmapped, "claim.review")).toBe(false)
  })
})

describe("can — tournament_director role (Ronin, Phase 1b)", () => {
  const director = asUser("tournament_director")

  it("inherits the public grants", () => {
    expect(can(director, "health.read")).toBe(true)
  })

  it("is granted tournament authority", () => {
    expect(can(director, "tournaments.manage")).toBe(true)
    expect(can(director, "tournaments.read")).toBe(true)
  })

  it("does not gain unrelated admin authority", () => {
    expect(can(director, "users.delete")).toBe(false)
    expect(can(director, "claim.review")).toBe(false)
    expect(can(director, "lineage.edit")).toBe(false)
  })
})

describe("can — user role", () => {
  it("inherits the public grants (signed-in users keep anonymous abilities)", () => {
    expect(can(member, "health.read")).toBe(true)
  })

  it("denies actions not in any grant", () => {
    expect(can(member, "users.delete")).toBe(false)
    expect(can(member, "lineage.edit")).toBe(false)
    expect(can(member, "claim.review")).toBe(false)
  })
})

describe("can — undefined / null user", () => {
  it("treats undefined the same as null (guest)", () => {
    expect(can(undefined, "health.read")).toBe(true)
    expect(can(undefined, "claim.review")).toBe(false)
  })
})

describe("beta.view — the /app/beta gate key (SESSION_0498 TASK_04)", () => {
  it("registers the beta area in the APP_AREA_PERMISSIONS vocabulary as a .view key", () => {
    // The layout gate (`requirePermission(APP_AREA_PERMISSIONS.beta)`) and this
    // pin share ONE string — renaming the key without updating the gate fails here.
    expect(APP_AREA_PERMISSIONS.beta).toBe("beta.view")
  })

  it("admin reaches the beta area via the * wildcard — zero grant plumbing", () => {
    expect(can(admin, APP_AREA_PERMISSIONS.beta)).toBe(true)
  })

  it("DENIES beta.view to every non-admin role (adversarial — FI-019 overrides are the only future path in)", () => {
    expect(can(member, APP_AREA_PERMISSIONS.beta)).toBe(false)
    expect(can(guest, APP_AREA_PERMISSIONS.beta)).toBe(false)
    expect(can(undefined, APP_AREA_PERMISSIONS.beta)).toBe(false)
    expect(can(asUser("tournament_director"), APP_AREA_PERMISSIONS.beta)).toBe(false)
    expect(can(asUser("nonexistent-role"), APP_AREA_PERMISSIONS.beta)).toBe(false)
  })
})
