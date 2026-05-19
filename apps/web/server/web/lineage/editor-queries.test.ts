/**
 * Lineage dashboard editor query helpers.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { resolveLineageEditorCapability } from "~/server/web/lineage/editor-queries"

describe("resolveLineageEditorCapability", () => {
  it("grants full tree-admin capability to global admins", () => {
    const capability = resolveLineageEditorCapability({
      isGlobalAdmin: true,
      hasOrganizationAdminGrant: false,
      explicitRoles: [],
    })

    expect(capability.roles).toEqual(["TREE_ADMIN"])
    expect(capability.sources).toEqual(["global-admin"])
    expect(capability.canPreview).toBe(true)
    expect(capability.canEditTree).toBe(true)
    expect(capability.canManageAcl).toBe(true)
    expect(capability.canReviewClaims).toBe(true)
  })

  it("keeps branch and node grants scoped below tree management", () => {
    const capability = resolveLineageEditorCapability({
      isGlobalAdmin: false,
      hasOrganizationAdminGrant: false,
      explicitRoles: ["BRANCH_EDITOR", "NODE_EDITOR"],
    })

    expect(capability.roles).toEqual(["BRANCH_EDITOR", "NODE_EDITOR"])
    expect(capability.sources).toEqual(["explicit-access"])
    expect(capability.canPreview).toBe(true)
    expect(capability.canEditTree).toBe(false)
    expect(capability.canManageAcl).toBe(false)
    expect(capability.canReviewClaims).toBe(false)
  })

  it("denies users with no grant source", () => {
    const capability = resolveLineageEditorCapability({
      isGlobalAdmin: false,
      hasOrganizationAdminGrant: false,
      explicitRoles: [],
    })

    expect(capability.roles).toEqual([])
    expect(capability.sources).toEqual([])
    expect(capability.canPreview).toBe(false)
  })
})
