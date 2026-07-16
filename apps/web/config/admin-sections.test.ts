// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { SessionUser } from "~/server/orpc/context"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import {
  ADMIN_SECTION_GROUPS,
  filterAdminSectionGroups,
  isAdminSectionItemVisible,
} from "./admin-sections"

const asUser = (role: string) => ({ role }) as SessionUser

const allItems = ADMIN_SECTION_GROUPS.flatMap(group => group.items)

describe("admin sections config shape", () => {
  it("covers all 37 managed areas with unique hrefs", () => {
    expect(allItems.length).toBe(37)
    expect(new Set(allItems.map(item => item.href)).size).toBe(37)
  })

  it("gives every item a DISTINCT icon (the FI-021 dedupe)", () => {
    expect(new Set(allItems.map(item => item.icon)).size).toBe(allItems.length)
  })

  it("gives every group a distinct icon", () => {
    const groupIcons = ADMIN_SECTION_GROUPS.map(group => group.icon)
    expect(new Set(groupIcons).size).toBe(groupIcons.length)
  })

  it("keeps the historical hrefs and gates verbatim", () => {
    const byTitle = new Map(allItems.map(item => [item.title, item]))

    // Non-default hrefs from the old sidebar.
    expect(byTitle.get("Posts")?.href).toBe("/app/blog")
    expect(byTitle.get("Privacy")?.href).toBe("/app/privacy/requests")

    // Events stays ungated (visible to every signed-in user).
    expect(byTitle.get("Events")?.permission).toBeUndefined()

    // Techniques is gated on `techniques.manage` (FI-027 — the AdminCollection index is
    // staff-only; authors reach their `[id]`/`new` editors via the profile flow, not this nav).
    expect(byTitle.get("Techniques")?.permission).toBe(APP_AREA_PERMISSIONS.techniques)

    // Belt Reviews (G-010) is gated on `belt.admin` — the moderation queue is staff-only.
    expect(byTitle.get("Belt Reviews")?.permission).toBe(APP_AREA_PERMISSIONS.beltReviews)

    // Lineage keeps its grantee flag + gate.
    expect(byTitle.get("Lineage")?.permission).toBe(APP_AREA_PERMISSIONS.lineage)
    expect(byTitle.get("Lineage")?.lineage).toBe(true)

    // Every other item is permission-gated.
    const gated = allItems.filter(item => item.permission != null)
    expect(gated.length).toBe(36)
  })
})

describe("filterAdminSectionGroups", () => {
  it("admin sees every group and item", () => {
    const groups = filterAdminSectionGroups(asUser("admin"), false)
    expect(groups.length).toBe(ADMIN_SECTION_GROUPS.length)
    expect(groups.flatMap(group => group.items).length).toBe(37)
  })

  it("guest (null user) sees only the ungated items, empty groups dropped", () => {
    const groups = filterAdminSectionGroups(null, false)
    const titles = groups.flatMap(group => group.items.map(item => item.title))
    expect(titles.sort()).toEqual(["Events"])
    // No dangling group labels: only the group holding the ungated Events item remains
    // (Techniques is now gated, so the lineage group has no ungated item to keep it alive).
    expect(groups.map(group => group.key).sort()).toEqual(["community"])
  })

  it("plain member matches guest (no *.manage grants)", () => {
    const groups = filterAdminSectionGroups(asUser("user"), false)
    const titles = groups.flatMap(group => group.items.map(item => item.title))
    expect(titles.sort()).toEqual(["Events"])
  })

  it("tournament_director additionally reaches Tournaments via its wildcard", () => {
    const groups = filterAdminSectionGroups(asUser("tournament_director"), false)
    const titles = groups.flatMap(group => group.items.map(item => item.title))
    expect(titles.sort()).toEqual(["Events", "Tournaments"])
  })

  it("an active lineage grant admits the Lineage item (and only it)", () => {
    const groups = filterAdminSectionGroups(asUser("user"), true)
    const titles = groups.flatMap(group => group.items.map(item => item.title))
    expect(titles.sort()).toEqual(["Events", "Lineage"])
  })
})

describe("isAdminSectionItemVisible", () => {
  const lineageItem = allItems.find(item => item.title === "Lineage")!
  const gatedItem = allItems.find(item => item.title === "People")!

  it("lineage flag only admits when the grant is active", () => {
    expect(isAdminSectionItemVisible(lineageItem, asUser("user"), false)).toBe(false)
    expect(isAdminSectionItemVisible(lineageItem, asUser("user"), true)).toBe(true)
  })

  it("a lineage grant does NOT leak into other gated items", () => {
    expect(isAdminSectionItemVisible(gatedItem, asUser("user"), true)).toBe(false)
  })
})
