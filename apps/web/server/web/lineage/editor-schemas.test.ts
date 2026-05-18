/**
 * Lineage editor schema validation tests.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-schemas.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  updateLineageMemberPlacementSchema,
  updateLineagePromotionRelationshipSchema,
} from "~/server/web/lineage/editor-schemas"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validPlacementInput = {
  treeId: "tree-abc",
  memberId: "member-abc",
  parentMemberId: "parent-abc",
  visualGroupId: "group-abc",
  visualSortOrder: 10,
  auditNote: "Moving this member to a new position in the tree.",
}

const validPromotionInput = {
  treeId: "tree-abc",
  memberId: "member-abc",
  promoterMemberId: "promoter-abc",
  auditNote: "Updating promoter for this rank award.",
}

// ---------------------------------------------------------------------------
// updateLineageMemberPlacementSchema
// ---------------------------------------------------------------------------

describe("updateLineageMemberPlacementSchema", () => {
  it("accepts a fully valid placement input", () => {
    const result = updateLineageMemberPlacementSchema.safeParse(validPlacementInput)
    expect(result.success).toBe(true)
  })

  // --- treeId ---

  it("rejects an empty treeId", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      treeId: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a treeId longer than 191 characters", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      treeId: "a".repeat(192),
    })
    expect(result.success).toBe(false)
  })

  it("accepts a treeId of exactly 191 characters", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      treeId: "a".repeat(191),
    })
    expect(result.success).toBe(true)
  })

  // --- memberId ---

  it("rejects an empty memberId", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      memberId: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a memberId longer than 191 characters", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      memberId: "a".repeat(192),
    })
    expect(result.success).toBe(false)
  })

  // --- parentMemberId (optionalId) ---

  it("transforms empty string parentMemberId to null", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      parentMemberId: "",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.parentMemberId).toBeNull()
  })

  it("transforms null parentMemberId to null", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      parentMemberId: null,
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.parentMemberId).toBeNull()
  })

  it("keeps a valid parentMemberId string unchanged", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      parentMemberId: "parent-xyz",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.parentMemberId).toBe("parent-xyz")
  })

  it("rejects a parentMemberId longer than 191 characters", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      parentMemberId: "a".repeat(192),
    })
    expect(result.success).toBe(false)
  })

  // --- visualGroupId (optionalId) ---

  it("transforms empty string visualGroupId to null", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualGroupId: "",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.visualGroupId).toBeNull()
  })

  it("transforms null visualGroupId to null", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualGroupId: null,
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.visualGroupId).toBeNull()
  })

  it("keeps a valid visualGroupId string unchanged", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualGroupId: "group-xyz",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.visualGroupId).toBe("group-xyz")
  })

  // --- visualSortOrder ---

  it("accepts zero as visualSortOrder", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualSortOrder: 0,
    })
    expect(result.success).toBe(true)
  })

  it("accepts 100000 as visualSortOrder boundary", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualSortOrder: 100000,
    })
    expect(result.success).toBe(true)
  })

  it("rejects a negative visualSortOrder", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualSortOrder: -1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects visualSortOrder above 100000", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualSortOrder: 100001,
    })
    expect(result.success).toBe(false)
  })

  it("rejects a non-integer visualSortOrder", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualSortOrder: 1.5,
    })
    expect(result.success).toBe(false)
  })

  it("coerces a numeric string to a number for visualSortOrder", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      visualSortOrder: "42",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.visualSortOrder).toBe(42)
  })

  // --- auditNote ---

  it("trims surrounding whitespace from auditNote", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      auditNote: "  Moved to reflect current training relationship.  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.auditNote).toBe("Moved to reflect current training relationship.")
    }
  })

  it("rejects an auditNote shorter than 10 characters", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      auditNote: "too short",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an auditNote longer than 1000 characters", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      auditNote: "a".repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it("accepts an auditNote of exactly 10 characters after trimming", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      auditNote: "1234567890",
    })
    expect(result.success).toBe(true)
  })

  it("accepts an auditNote of exactly 1000 characters", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      auditNote: "a".repeat(1000),
    })
    expect(result.success).toBe(true)
  })

  it("rejects a non-string auditNote", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      auditNote: 12345,
    })
    expect(result.success).toBe(false)
  })

  // --- whitespace-only auditNote falls below min after trimming ---
  it("rejects a whitespace-only auditNote (too short after trim)", () => {
    const result = updateLineageMemberPlacementSchema.safeParse({
      ...validPlacementInput,
      auditNote: "   ",
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// updateLineagePromotionRelationshipSchema
// ---------------------------------------------------------------------------

describe("updateLineagePromotionRelationshipSchema", () => {
  it("accepts a fully valid promotion input", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse(validPromotionInput)
    expect(result.success).toBe(true)
  })

  // --- treeId ---

  it("rejects an empty treeId", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      treeId: "",
    })
    expect(result.success).toBe(false)
  })

  // --- memberId ---

  it("rejects an empty memberId", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      memberId: "",
    })
    expect(result.success).toBe(false)
  })

  // --- promoterMemberId (optionalId) ---

  it("transforms empty string promoterMemberId to null", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      promoterMemberId: "",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promoterMemberId).toBeNull()
  })

  it("transforms null promoterMemberId to null", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      promoterMemberId: null,
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promoterMemberId).toBeNull()
  })

  it("keeps a valid promoterMemberId string unchanged", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      promoterMemberId: "promoter-xyz",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promoterMemberId).toBe("promoter-xyz")
  })

  it("rejects a promoterMemberId longer than 191 characters", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      promoterMemberId: "a".repeat(192),
    })
    expect(result.success).toBe(false)
  })

  // --- auditNote ---

  it("trims surrounding whitespace from auditNote", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      auditNote: "  Correcting promoter after records audit.  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.auditNote).toBe("Correcting promoter after records audit.")
    }
  })

  it("rejects an auditNote shorter than 10 characters", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      auditNote: "short",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an auditNote longer than 1000 characters", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      ...validPromotionInput,
      auditNote: "x".repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it("accepts a promotion without a promoterMemberId (clearing the promoter)", () => {
    const result = updateLineagePromotionRelationshipSchema.safeParse({
      treeId: "tree-abc",
      memberId: "member-abc",
      promoterMemberId: null,
      auditNote: "Clearing promoter to fix data entry error.",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promoterMemberId).toBeNull()
  })
})
