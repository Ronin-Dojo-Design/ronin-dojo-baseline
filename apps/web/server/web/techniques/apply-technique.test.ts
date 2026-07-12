// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it, mock } from "bun:test"

// The Elite-entitlement seam reads the global cached db + `next/cache` (`cacheTag`/`cacheLife`), which
// throw outside a Next request — so it is mocked per-test via `setEliteEntitled`, keeping the suite
// hermetic (no live db, no Resend/email path is imported transitively).
let eliteEntitled = new Set<string>()
const setEliteEntitled = (userIds: string[]) => {
  eliteEntitled = new Set(userIds)
}
mock.module("~/server/web/entitlements/queries", () => ({
  hasEntitlement: async (userId: string) => eliteEntitled.has(userId),
}))

import { applyCreateTechnique, applyUpdateTechnique } from "~/server/web/techniques/apply-technique"
import { TECHNIQUE_ERROR } from "~/server/web/techniques/technique-errors"

const brand = "BBL" as const

type SessionLike = { id: string; role: string; extraGrants?: string[] }
const asUser = (u: SessionLike) => u as any

type FakeState = {
  /** userId → OWNER/INSTRUCTOR memberships as `{ organizationId }` rows (org-scoped + brand-scoped). */
  memberships?: Array<{ userId: string; organizationId: string | null }>
  /** userId → passportId (the caller's identity Passport). */
  passports?: Record<string, string>
  /** passportId → current-affiliation org `{ id, brand }` (null = free-text school, profile-only). */
  affiliations?: Record<string, { id: string; brand: string } | null>
  /** techniqueId → the stored row read by the edit path. */
  techniques?: Record<string, { organizationId: string | null; authorPassportId: string | null }>
}

function makeDb(state: FakeState = {}) {
  const created: { creates: any[]; updates: any[] } = { creates: [], updates: [] }

  const db: any = {
    membership: {
      findFirst: async ({ where }: any) => {
        const match = (state.memberships ?? []).find(m => {
          if (m.userId !== where.userId) return false
          // org-scoped edit-path lookups pass a concrete organizationId; the brand-scoped gate does not.
          if (where.organizationId !== undefined && m.organizationId !== where.organizationId) {
            return false
          }
          return true
        })
        return match ? { id: `mem-${match.userId}` } : null
      },
    },
    passport: {
      findFirst: async ({ where }: any) => {
        const passportId = state.passports?.[where.userId]
        return passportId ? { id: passportId } : null
      },
    },
    affiliation: {
      findFirst: async ({ where }: any) => {
        const org = state.affiliations?.[where.passportId] ?? null
        return org ? { organization: org } : null
      },
    },
    organization: {
      findUniqueOrThrow: async ({ where }: any) => {
        // org-canonical path derives brand from the org; the tests that reach here seed BBL.
        return { id: where.id, brand }
      },
    },
    technique: {
      findUniqueOrThrow: async ({ where }: any) => {
        const row = state.techniques?.[where.id]
        if (!row) throw new Error("technique not found")
        return { id: where.id, ...row }
      },
      create: async ({ data }: any) => {
        const row = { id: "tech-created", ...data }
        created.creates.push(row)
        return row
      },
      update: async ({ where, data }: any) => {
        const row = { id: where.id, slug: "some-slug", ...data }
        created.updates.push({ where, data })
        return row
      },
    },
  }

  return { db, created }
}

const baseInput = {
  disciplineId: "disc-1",
  name: "Armbar from Closed Guard",
  slug: "armbar-from-closed-guard",
}

describe("applyCreateTechnique — authored path (ADR 0046 D5)", () => {
  it("(a) rejects a non-authorized user (no RBAC, no staff role, no Elite entitlement)", async () => {
    setEliteEntitled([])
    const { db, created } = makeDb({ passports: { "user-nobody": "pass-nobody" } })

    await expect(
      applyCreateTechnique({
        db,
        user: asUser({ id: "user-nobody", role: "user" }),
        brandContext: brand,
        input: { ...baseInput, authored: true },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.CREATE_ACCESS_REQUIRED)
    expect(created.creates).toHaveLength(0)
  })

  it("(b) an Elite user CAN create an authored technique — author set, org + brand derived from affiliation", async () => {
    setEliteEntitled(["user-elite"])
    const { db, created } = makeDb({
      passports: { "user-elite": "pass-elite" },
      affiliations: { "pass-elite": { id: "org-southbay", brand: "BBL" } },
    })

    const technique = await applyCreateTechnique({
      db,
      user: asUser({ id: "user-elite", role: "user" }),
      brandContext: brand,
      input: { ...baseInput, authored: true },
    })

    expect(created.creates).toHaveLength(1)
    expect(technique).toMatchObject({
      authorPassportId: "pass-elite",
      organizationId: "org-southbay",
      brand: "BBL",
    })
  })

  it("(b') an Elite user with a placeholder school (no org affiliation) authors a profile-only (org null) technique", async () => {
    setEliteEntitled(["user-elite"])
    const { db } = makeDb({
      passports: { "user-elite": "pass-elite" },
      affiliations: { "pass-elite": null },
    })

    const technique = await applyCreateTechnique({
      db,
      user: asUser({ id: "user-elite", role: "user" }),
      brandContext: brand,
      input: { ...baseInput, authored: true },
    })

    expect(technique).toMatchObject({
      authorPassportId: "pass-elite",
      organizationId: null,
      brand: "BBL",
    })
  })

  it("rejects an authored create when the caller has no identity Passport", async () => {
    setEliteEntitled(["user-elite"])
    const { db } = makeDb({ passports: {} })

    await expect(
      applyCreateTechnique({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        brandContext: brand,
        input: { ...baseInput, authored: true },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.PASSPORT_REQUIRED)
  })
})

describe("applyCreateTechnique — org-canonical path (unchanged gate)", () => {
  it("creates a canonical (author-null) technique for an OWNER/INSTRUCTOR of the org", async () => {
    setEliteEntitled([])
    const { db } = makeDb({
      memberships: [{ userId: "user-owner", organizationId: "org-1" }],
    })

    const technique = await applyCreateTechnique({
      db,
      user: asUser({ id: "user-owner", role: "user" }),
      brandContext: brand,
      input: { ...baseInput, organizationId: "org-1" },
    })

    expect(technique).toMatchObject({ organizationId: "org-1", brand: "BBL" })
    expect(technique.authorPassportId).toBeUndefined()
  })

  it("rejects a canonical create for a non-member of the org", async () => {
    setEliteEntitled([])
    const { db } = makeDb({ memberships: [] })

    await expect(
      applyCreateTechnique({
        db,
        user: asUser({ id: "user-stranger", role: "user" }),
        brandContext: brand,
        input: { ...baseInput, organizationId: "org-1" },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.ORG_AUTHOR_REQUIRED)
  })
})

describe("applyUpdateTechnique — edit authority (ADR 0046 D5)", () => {
  it("(e) the author CAN edit their own authored technique", async () => {
    const { db, created } = makeDb({
      passports: { "user-elite": "pass-elite" },
      techniques: { "tech-1": { organizationId: null, authorPassportId: "pass-elite" } },
    })

    await applyUpdateTechnique({
      db,
      user: asUser({ id: "user-elite", role: "user" }),
      input: { id: "tech-1", name: "Armbar (refined)" },
    })

    expect(created.updates).toHaveLength(1)
    expect(created.updates[0]).toMatchObject({
      where: { id: "tech-1" },
      data: { name: "Armbar (refined)" },
    })
  })

  it("(e) an author CANNOT edit another author's technique", async () => {
    const { db, created } = makeDb({
      passports: { "user-elite": "pass-elite" },
      techniques: { "tech-other": { organizationId: null, authorPassportId: "pass-someone-else" } },
    })

    await expect(
      applyUpdateTechnique({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        input: { id: "tech-other", name: "hijack" },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.EDIT_ACCESS_REQUIRED)
    expect(created.updates).toHaveLength(0)
  })

  it("a canonical (null-author) technique is staff/RBAC-only — a random Elite member cannot edit it", async () => {
    const { db } = makeDb({
      passports: { "user-elite": "pass-elite" },
      memberships: [],
      techniques: { "tech-canon": { organizationId: "org-1", authorPassportId: null } },
    })

    await expect(
      applyUpdateTechnique({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        input: { id: "tech-canon", name: "hijack" },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.EDIT_ACCESS_REQUIRED)
  })

  it("org OWNER/INSTRUCTOR staff CAN edit any technique in their school (incl. an authored one)", async () => {
    const { db, created } = makeDb({
      passports: { "user-owner": "pass-owner" },
      memberships: [{ userId: "user-owner", organizationId: "org-1" }],
      techniques: { "tech-1": { organizationId: "org-1", authorPassportId: "pass-another" } },
    })

    await applyUpdateTechnique({
      db,
      user: asUser({ id: "user-owner", role: "user" }),
      input: { id: "tech-1", isPublished: true },
    })

    expect(created.updates).toHaveLength(1)
  })

  it("a platform admin (RBAC techniques.manage via *) CAN edit a canonical technique", async () => {
    const { db, created } = makeDb({
      techniques: { "tech-canon": { organizationId: "org-1", authorPassportId: null } },
    })

    await applyUpdateTechnique({
      db,
      user: asUser({ id: "user-admin", role: "admin" }),
      input: { id: "tech-canon", name: "renamed" },
    })

    expect(created.updates).toHaveLength(1)
  })
})
