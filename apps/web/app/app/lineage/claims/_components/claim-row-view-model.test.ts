// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { PendingClaim } from "~/server/admin/lineage/claim-queries"
import { claimRowViewModel } from "./claim-row-view-model"

/**
 * Unit test for the pure `claimRowViewModel` (SESSION_0492 cleanup — the display
 * derivation extracted out of `page.tsx`'s fat `.map` arrow). Covers the two claim
 * kinds and their null-fallbacks so the row projection can never drift: a
 * RANK_PROMOTION foregrounds the asserted belt (no claimant → subject arrow), an
 * identity claim shows the claimant → subject line + tree/directory context.
 */

const BASE_DATE = new Date("2026-03-14T00:00:00Z")

function claim(over: Partial<PendingClaim> = {}): PendingClaim {
  return {
    id: "claim_1",
    status: "PENDING",
    type: "IDENTITY",
    createdAt: BASE_DATE,
    claimantNote: null,
    claimedRank: null,
    passport: { displayName: "Jane Practitioner" },
    tree: { id: "tree_1", name: "Rigan Machado", slug: "rigan-machado" },
    node: { id: "node_1" },
    claimant: { id: "user_1", name: "Jane Claimant", email: "jane@test.local" },
    ...over,
  } as PendingClaim
}

describe("claimRowViewModel — identity claim", () => {
  it("renders claimant → subject, tree context, and no belt", () => {
    const vm = claimRowViewModel(claim())

    expect(vm.isPromotion).toBe(false)
    expect(vm.href).toBe("/app/lineage/claims/claim_1")
    expect(vm.title).toBe("Jane Claimant → Jane Practitioner")
    expect(vm.belt).toBeNull()
    expect(vm.treeLabel).toBe("Tree: Rigan Machado")
  })

  it("labels a directory-only claim (no tree) as a directory profile", () => {
    const vm = claimRowViewModel(claim({ tree: null }))
    expect(vm.treeLabel).toBe("Directory profile (no tree)")
  })

  it("falls back to 'Unnamed profile' when the passport has no display name", () => {
    const vm = claimRowViewModel(claim({ passport: { displayName: null } }))
    expect(vm.title).toBe("Jane Claimant → Unnamed profile")
  })
})

describe("claimRowViewModel — RANK_PROMOTION claim", () => {
  it("foregrounds the asserted belt, no claimant arrow, no tree label", () => {
    const vm = claimRowViewModel(
      claim({ type: "RANK_PROMOTION", claimedRank: { name: "Purple", colorHex: "#7b2ff7" } }),
    )

    expect(vm.isPromotion).toBe(true)
    expect(vm.title).toBe("Jane Practitioner")
    expect(vm.belt).toEqual({ colorHex: "#7b2ff7", label: "Belt promotion → Purple" })
    expect(vm.treeLabel).toBeNull()
  })

  it("tolerates a missing claimed rank (unknown belt, null swatch)", () => {
    const vm = claimRowViewModel(claim({ type: "RANK_PROMOTION", claimedRank: null }))
    expect(vm.belt).toEqual({ colorHex: null, label: "Belt promotion → Unknown belt" })
  })
})

describe("claimRowViewModel — passthrough fields", () => {
  it("carries status through and formats the created date", () => {
    const vm = claimRowViewModel(claim({ status: "NEEDS_INFO" }))
    expect(vm.status).toBe("NEEDS_INFO")
    expect(vm.createdLabel).toBe(BASE_DATE.toLocaleDateString())
  })
})
