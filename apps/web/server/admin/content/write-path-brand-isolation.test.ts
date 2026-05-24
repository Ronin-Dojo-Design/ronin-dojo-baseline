// @ts-expect-error - bun:test is a Bun runtime module
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const FOREIGN_BRAND = "RONIN_DOJO_DESIGN" as const
const PREFIX = `session-0230-write-iso-${Date.now()}`

let adminUserId = ""

const createAtom = async (suffix: string, brand: typeof TEST_BRAND | typeof FOREIGN_BRAND) => {
  return db.contentAtom.create({
    data: {
      id: `${PREFIX}-atom-${suffix}`,
      canonicalId: `${PREFIX}-canonical-${suffix}`,
      title: `Session 0230 Atom ${suffix}`,
      slug: `${PREFIX}-atom-${suffix}`,
      status: "APPROVED",
      createdById: adminUserId,
      variants: {
        create: {
          id: `${PREFIX}-variant-${suffix}`,
          brand,
          channel: "BLOG",
          status: "DRAFT",
          publicTitle: `Session 0230 Variant ${suffix}`,
          publicSlug: `${PREFIX}-variant-${suffix}`,
        },
      },
    },
    include: { variants: true },
  })
}

beforeAll(async () => {
  const admin = await db.user.create({
    data: {
      id: `${PREFIX}-admin`,
      name: "Session 0230 Admin",
      email: `${PREFIX}-admin@test.local`,
      role: "admin",
    },
  })
  adminUserId = admin.id
})

beforeEach(() => {
  setTestSession({ id: adminUserId, role: "admin" })
})

afterAll(async () => {
  await db.contentVariant.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.contentAtom.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: adminUserId } })
})

describe("admin content write-path cross-brand isolation", () => {
  it("upsertContentAtom cannot update a foreign-brand atom", async () => {
    const foreignAtom = await createAtom("upsert-foreign", FOREIGN_BRAND)

    const { upsertContentAtom } = await import("~/server/admin/content/actions")
    const result = await upsertContentAtom({
      id: foreignAtom.id,
      title: "Hijacked Title",
    })

    expect(result?.serverError).toBeDefined()

    // Verify the atom was NOT updated
    const unchanged = await db.contentAtom.findUnique({ where: { id: foreignAtom.id } })
    expect(unchanged?.title).toBe("Session 0230 Atom upsert-foreign")
  })

  it("upsertContentAtom succeeds for a same-brand atom", async () => {
    const sameAtom = await createAtom("upsert-same", TEST_BRAND)

    const { upsertContentAtom } = await import("~/server/admin/content/actions")
    const result = await upsertContentAtom({
      id: sameAtom.id,
      title: "Updated Same-Brand Title",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.title).toBe("Updated Same-Brand Title")
  })

  it("deleteContentAtoms cannot delete a foreign-brand atom", async () => {
    const foreignAtom = await createAtom("delete-foreign", FOREIGN_BRAND)

    const { deleteContentAtoms } = await import("~/server/admin/content/actions")
    const result = await deleteContentAtoms({ ids: [foreignAtom.id] })

    // Should succeed (no error thrown) but affect 0 rows
    expect(result?.serverError).toBeUndefined()

    // Verify the atom still exists
    const stillExists = await db.contentAtom.findUnique({ where: { id: foreignAtom.id } })
    expect(stillExists).not.toBeNull()
  })

  it("deleteContentAtoms succeeds for same-brand atoms", async () => {
    const sameAtom = await createAtom("delete-same", TEST_BRAND)

    const { deleteContentAtoms } = await import("~/server/admin/content/actions")
    const result = await deleteContentAtoms({ ids: [sameAtom.id] })

    expect(result?.serverError).toBeUndefined()

    const deleted = await db.contentAtom.findUnique({ where: { id: sameAtom.id } })
    expect(deleted).toBeNull()
  })

  it("deleteContentVariant cannot delete a foreign-brand variant", async () => {
    const foreignAtom = await createAtom("delvar-foreign", FOREIGN_BRAND)
    const variantId = foreignAtom.variants[0]?.id
    expect(variantId).toBeDefined()

    const { deleteContentVariant } = await import("~/server/admin/content/actions")
    const result = await deleteContentVariant({ ids: [variantId as string] })

    expect(result?.serverError).toBeUndefined()

    // Verify the variant still exists
    const stillExists = await db.contentVariant.findUnique({ where: { id: variantId as string } })
    expect(stillExists).not.toBeNull()
  })

  it("deleteContentVariant succeeds for same-brand variants", async () => {
    const sameAtom = await createAtom("delvar-same", TEST_BRAND)
    const variantId = sameAtom.variants[0]?.id
    expect(variantId).toBeDefined()

    const { deleteContentVariant } = await import("~/server/admin/content/actions")
    const result = await deleteContentVariant({ ids: [variantId as string] })

    expect(result?.serverError).toBeUndefined()

    const deleted = await db.contentVariant.findUnique({ where: { id: variantId as string } })
    expect(deleted).toBeNull()
  })
})
