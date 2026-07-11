/**
 * SESSION_0526 (Step B1) — pinning unit test for the freemium watch gate
 * `isTechniqueViewerEntitled` (SESSION_0525). Proves the five entitlement rows the profile rail
 * and watch page ride: guest → false, admin → true, content-owner → true, free-tier → their OWN
 * `canRenderRichMedia`, premium-tier → true.
 *
 * Fully hermetic: `~/lib/auth` (email graph), `~/services/db`, and the tier policy are ALL mocked,
 * so this file imports NO email/notify path and issues NO real query. Mock state is mutated per
 * test; the module is dynamically imported AFTER the mocks are registered.
 *
 * Run: cd apps/web && bun test server/web/techniques/technique-access.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

// Mutable mock state — the mock closures read these, so mutating them per test steers behavior
// even after the module under test is cached.
const state = {
  /** What `db.passport.findFirst` returns for the viewer's own passport (owner check). */
  passport: null as { id: string } | null,
  /** The VIEWER's own rich-media entitlement (premium/elite/legend → true). */
  canRenderRichMedia: false,
}

beforeEach(() => {
  state.passport = null
  state.canRenderRichMedia = false

  // Stub the auth seam so importing the module never pulls the Better Auth / Resend email graph.
  mock.module("~/lib/auth", () => ({
    getServerSession: async () => null,
  }))
  mock.module("~/services/db", () => ({
    db: {
      passport: {
        findFirst: async () => state.passport,
      },
    },
  }))
  mock.module("~/server/web/entitlements/lineage-tier-policy", () => ({
    getLineageProfileDetailRenderPolicyForUser: async () => ({
      canRenderRichMedia: state.canRenderRichMedia,
    }),
  }))
})

describe("isTechniqueViewerEntitled", () => {
  it("denies a null / guest viewer", async () => {
    const { isTechniqueViewerEntitled } = await import("./technique-access")

    const entitled = await isTechniqueViewerEntitled({
      userId: null,
      role: null,
      authorPassportIds: ["passport_author"],
    })

    expect(entitled).toBe(false)
  })

  it("grants the platform admin (always previews gated content)", async () => {
    const { isTechniqueViewerEntitled } = await import("./technique-access")

    const entitled = await isTechniqueViewerEntitled({
      userId: "user_admin",
      role: "admin",
      // No owner match, no paid tier — admin short-circuits regardless.
      authorPassportIds: [],
    })

    expect(entitled).toBe(true)
  })

  it("grants the content owner (viewer's own Passport authored the technique)", async () => {
    state.passport = { id: "passport_owner" }
    const { isTechniqueViewerEntitled } = await import("./technique-access")

    const entitled = await isTechniqueViewerEntitled({
      userId: "user_owner",
      role: "member",
      authorPassportIds: ["passport_owner", "passport_other"],
    })

    expect(entitled).toBe(true)
  })

  it("does NOT grant a non-owner on ownership alone (falls through to the tier gate)", async () => {
    state.passport = { id: "passport_someone_else" }
    state.canRenderRichMedia = false
    const { isTechniqueViewerEntitled } = await import("./technique-access")

    const entitled = await isTechniqueViewerEntitled({
      userId: "user_member",
      role: "member",
      authorPassportIds: ["passport_author"],
    })

    expect(entitled).toBe(false)
  })

  it("denies a free-tier viewer (rides their OWN canRenderRichMedia = false)", async () => {
    state.canRenderRichMedia = false
    const { isTechniqueViewerEntitled } = await import("./technique-access")

    const entitled = await isTechniqueViewerEntitled({
      userId: "user_free",
      role: "member",
      authorPassportIds: ["passport_author"],
    })

    expect(entitled).toBe(false)
  })

  it("grants a premium-tier viewer (their OWN canRenderRichMedia = true)", async () => {
    state.canRenderRichMedia = true
    const { isTechniqueViewerEntitled } = await import("./technique-access")

    const entitled = await isTechniqueViewerEntitled({
      userId: "user_premium",
      role: "member",
      authorPassportIds: ["passport_author"],
    })

    expect(entitled).toBe(true)
  })
})
