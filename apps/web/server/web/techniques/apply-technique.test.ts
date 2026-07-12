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

import {
  applyCreateTechnique,
  applySetTechniqueFeatured,
  applyUpdateTechnique,
} from "~/server/web/techniques/apply-technique"
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
  /** techniqueId → the stored row read by the edit/feature paths. */
  techniques?: Record<
    string,
    {
      organizationId: string | null
      authorPassportId: string | null
      slug?: string
      brand?: string
      isFeatured?: boolean
    }
  >
}

function makeDb(state: FakeState = {}) {
  const created: { creates: any[]; updates: any[]; audits: any[] } = {
    creates: [],
    updates: [],
    audits: [],
  }

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
        const stored = state.techniques?.[where.id]
        const row = { id: where.id, slug: stored?.slug ?? "some-slug", ...data }
        created.updates.push({ where, data })
        return row
      },
    },
    auditLog: {
      create: async ({ data }: any) => {
        created.audits.push(data)
        return data
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

  it("(3B) maps a P2002 on the authored partial unique index to the friendly duplicate-slug message", async () => {
    setEliteEntitled(["user-elite"])
    const { db } = makeDb({
      passports: { "user-elite": "pass-elite" },
      affiliations: { "pass-elite": null },
    })
    // Duck-typed Prisma P2002 — the DB-managed partial index (`Technique_authored_slug_key`)
    // surfaces the constraint NAME (not mapped fields) since Prisma's schema doesn't know it.
    db.technique.create = async () => {
      throw Object.assign(new Error("Unique constraint failed"), {
        code: "P2002",
        meta: { target: "Technique_authored_slug_key" },
      })
    }

    await expect(
      applyCreateTechnique({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        brandContext: brand,
        input: { ...baseInput, authored: true },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.AUTHORED_SLUG_TAKEN)
  })

  it("(3B) rethrows a NON-P2002 create failure unchanged (no over-broad catch)", async () => {
    setEliteEntitled(["user-elite"])
    const { db } = makeDb({
      passports: { "user-elite": "pass-elite" },
      affiliations: { "pass-elite": null },
    })
    db.technique.create = async () => {
      throw new Error("connection reset")
    }

    await expect(
      applyCreateTechnique({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        brandContext: brand,
        input: { ...baseInput, authored: true },
      }),
    ).rejects.toThrow("connection reset")
  })

  it("(review fix) maps the REAL pg driver-adapter P2002 shape (no meta.target — SESSION_0529 probe)", async () => {
    setEliteEntitled(["user-elite"])
    const { db } = makeDb({
      passports: { "user-elite": "pass-elite" },
      affiliations: { "pass-elite": null },
    })
    // Byte shape captured from a live duplicate insert against the partial index.
    db.technique.create = async () => {
      throw Object.assign(new Error("Unique constraint failed"), {
        code: "P2002",
        meta: {
          modelName: "Technique",
          driverAdapterError: {
            name: "DriverAdapterError",
            cause: {
              originalCode: "23505",
              originalMessage:
                'duplicate key value violates unique constraint "Technique_authored_slug_key"',
              kind: "UniqueConstraintViolation",
              constraint: { fields: ["brand", '"authorPassportId"', "slug"] },
            },
          },
        },
      })
    }

    await expect(
      applyCreateTechnique({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        brandContext: brand,
        input: { ...baseInput, authored: true },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.AUTHORED_SLUG_TAKEN)
  })

  it("(review fix) a P2002 on a DIFFERENT constraint rethrows to the generic handler", async () => {
    setEliteEntitled(["user-elite"])
    const { db } = makeDb({
      passports: { "user-elite": "pass-elite" },
      affiliations: { "pass-elite": null },
    })
    const foreign = Object.assign(new Error("Unique constraint failed"), {
      code: "P2002",
      meta: { target: "Technique_canonical_slug_key" },
    })
    db.technique.create = async () => {
      throw foreign
    }

    await expect(
      applyCreateTechnique({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        brandContext: brand,
        input: { ...baseInput, authored: true },
      }),
    ).rejects.toBe(foreign)
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

describe("applySetTechniqueFeatured — staff promote to library (SESSION_0529 Slice 3C, ADR 0046 D4)", () => {
  const authoredRow = () => ({
    "tech-authored": {
      organizationId: null,
      authorPassportId: "pass-elite",
      slug: "flying-armbar",
      brand: "BBL",
      isFeatured: false,
    },
  })

  it("rejects a NON-staff caller — even the Elite AUTHOR of the technique (no self-promotion)", async () => {
    setEliteEntitled(["user-elite"])
    const { db, created } = makeDb({
      passports: { "user-elite": "pass-elite" },
      techniques: authoredRow(),
    })

    await expect(
      applySetTechniqueFeatured({
        db,
        user: asUser({ id: "user-elite", role: "user" }),
        input: { id: "tech-authored", isFeatured: true },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.FEATURE_ACCESS_REQUIRED)
    expect(created.updates).toHaveLength(0)
    expect(created.audits).toHaveLength(0)
  })

  it("rejects org staff WITHOUT platform RBAC (canonical promotion is platform-staff-only)", async () => {
    setEliteEntitled([])
    const { db, created } = makeDb({
      memberships: [{ userId: "user-owner", organizationId: "org-1" }],
      techniques: authoredRow(),
    })

    await expect(
      applySetTechniqueFeatured({
        db,
        user: asUser({ id: "user-owner", role: "user" }),
        input: { id: "tech-authored", isFeatured: true },
      }),
    ).rejects.toThrow(TECHNIQUE_ERROR.FEATURE_ACCESS_REQUIRED)
    expect(created.updates).toHaveLength(0)
  })

  it("platform staff (RBAC techniques.manage via *) flips the flag + writes the audit row", async () => {
    const { db, created } = makeDb({ techniques: authoredRow() })

    const updated = await applySetTechniqueFeatured({
      db,
      user: asUser({ id: "user-admin", role: "admin" }),
      input: { id: "tech-authored", isFeatured: true },
    })

    expect(updated).toMatchObject({ id: "tech-authored", isFeatured: true })
    expect(created.updates[0]).toMatchObject({
      where: { id: "tech-authored" },
      data: { isFeatured: true },
    })
    expect(created.audits[0]).toMatchObject({
      action: "technique.featured.set",
      entityType: "Technique",
      entityId: "tech-authored",
      userId: "user-admin",
      before: { isFeatured: false },
      after: { isFeatured: true },
    })
  })

  it("un-feature round-trips (audit captures the true→false transition)", async () => {
    const { db, created } = makeDb({
      techniques: {
        "tech-authored": {
          organizationId: null,
          authorPassportId: "pass-elite",
          slug: "flying-armbar",
          brand: "BBL",
          isFeatured: true,
        },
      },
    })

    const updated = await applySetTechniqueFeatured({
      db,
      user: asUser({ id: "user-admin", role: "admin" }),
      input: { id: "tech-authored", isFeatured: false },
    })

    expect(updated).toMatchObject({ isFeatured: false })
    expect(created.audits[0]).toMatchObject({
      before: { isFeatured: true },
      after: { isFeatured: false },
    })
  })
})
