// @ts-expect-error - bun:test is a Bun runtime module
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Single-brand collapse (brand-prune Stage 1): the admin content queries inline the BBL
// literal, so the "session brand" no longer threads — the matching brand is BBL.
installSafeActionMocks({ brand: "BBL" })

import { findContentAtomById, findContentVariantById } from "~/server/admin/content/queries"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const FOREIGN_BRAND = "RONIN_DOJO_DESIGN" as const
const PREFIX = `session-0229-brand-isolation-${Date.now()}`

let adminUserId = ""

const createAtom = async (suffix: string, brand: typeof TEST_BRAND | typeof FOREIGN_BRAND) => {
  return db.contentAtom.create({
    data: {
      id: `${PREFIX}-atom-${suffix}`,
      canonicalId: `${PREFIX}-canonical-${suffix}`,
      title: `Session 0229 Atom ${suffix}`,
      slug: `${PREFIX}-atom-${suffix}`,
      status: "APPROVED",
      createdById: adminUserId,
      variants: {
        create: {
          id: `${PREFIX}-variant-${suffix}`,
          brand,
          channel: "BLOG",
          status: "DRAFT",
          publicTitle: `Session 0229 Variant ${suffix}`,
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
      name: "Session 0229 Admin",
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

describe("admin content queries brand isolation", () => {
  it("findContentAtomById hydrates the atom when the session brand matches a variant brand", async () => {
    const atom = await createAtom("atom-same-brand", TEST_BRAND)

    const result = await findContentAtomById(atom.id)

    expect(result).not.toBeNull()
    expect(result?.id).toBe(atom.id)
    expect(result?.variants.some(v => v.brand === TEST_BRAND)).toBe(true)
  })

  it("findContentAtomById returns null when the atom's only variant is on a foreign brand", async () => {
    const atom = await createAtom("atom-foreign-brand", FOREIGN_BRAND)

    const result = await findContentAtomById(atom.id)

    expect(result).toBeNull()
  })

  it("findContentVariantById returns the variant when the session brand matches", async () => {
    const atom = await createAtom("variant-same-brand", TEST_BRAND)
    const variantId = atom.variants[0]?.id
    expect(variantId).toBeDefined()

    const result = await findContentVariantById(variantId as string)

    expect(result).not.toBeNull()
    expect(result?.id).toBe(variantId)
    expect(result?.brand).toBe(TEST_BRAND)
  })

  it("findContentVariantById returns null when the variant is on a foreign brand", async () => {
    const atom = await createAtom("variant-foreign-brand", FOREIGN_BRAND)
    const variantId = atom.variants[0]?.id
    expect(variantId).toBeDefined()

    const result = await findContentVariantById(variantId as string)

    expect(result).toBeNull()
  })
})
