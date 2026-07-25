/**
 * Social approval-queue oRPC router — HERMETIC procedure tests (SESSION_0686).
 *
 * Invoked through the LIVE oRPC pipeline (`createRouterClient` with an injected session
 * context, `source: "rsc"` so rate limiting is skipped — the same seam RSC uses), so the
 * `meta.permission` → `can()` authz gate is exercised for real. The db is a seamed in-memory
 * mock (the `server/admin/tools/queries.test.ts` idiom) — NOT the real Postgres of SOP §13 —
 * because this lane ships the `SocialQueueItem` migration UNAPPLIED (migrate dev is banned on
 * the shared local DB; the merge owner applies it): a real-DB test would red-gate every
 * checkout until then. The mock also simulates the compare-and-swap `updateMany` semantics,
 * and doubles as the "nothing publishes" recorder: EVERY write the router ever issues is
 * captured and swept for `PUBLISHED`/`publishedAt` at the end.
 *
 * What this file proves:
 *   1. authz — every procedure gates on `social-queue.manage` (guest UNAUTHORIZED, member/
 *      director FORBIDDEN with zero writes, admin + FI-019 grantee pass)
 *   2. transitions — DRAFT→APPROVED, DRAFT/APPROVED→REJECTED, terminal REJECTED, CAS races
 *   3. consent — the live approve-time re-check (revoked → auto-reject; unratified F2 →
 *      fail closed, item stays DRAFT)
 *   4. NOTHING PUBLISHES on approve (or ever) — no write in the whole run touches
 *      `PUBLISHED`/`publishedAt`
 *
 * Run: cd apps/web && bun test server/orpc/routers/social-queue.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { beforeEach, describe, expect, it, mock } from "bun:test"
import { createRouterClient, ORPCError } from "@orpc/server"

// ── mock seams (BEFORE the dynamic router import) ────────────────────────────────────────────
mock.module("server-only", () => ({}))
mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
  cacheLife: () => {},
  cacheTag: () => {},
}))
// The pipeline resolves the session only when a transport didn't pre-inject `user` — the
// guest cases pass `user: null`, which triggers this seam. Nothing else from lib/auth runs.
mock.module("~/lib/auth", () => ({
  getServerSession: async () => null,
}))

type ItemRow = {
  id: string
  status: string
  consentBasis: string
  passportId: string | null
  source: string
  subjectKey: string
  payload: unknown
  caption: string | null
  rejectedReason: string | null
  createdAt: Date
  approvedAt: Date | null
  publishedAt: Date | null
  approvedById: string | null
  approvedBy: { name: string } | null
}

type UpdateCall = { where: Record<string, unknown>; data: Record<string, unknown> }

const state = {
  items: new Map<string, ItemRow>(),
  passports: new Map<string, { userId: string | null }>(),
  /** Writes captured for the CURRENT test (reset per test). */
  updateCalls: [] as UpdateCall[],
  /** EVERY write across the whole file (never reset) — the "nothing publishes" recorder. */
  allUpdateCalls: [] as UpdateCall[],
  /** Force the next updateMany to report this count (CAS-race simulation). */
  forceUpdateCount: null as number | null,
}

const matchesStatus = (item: ItemRow, whereStatus: unknown): boolean => {
  if (whereStatus === undefined) return true
  if (typeof whereStatus === "string") return item.status === whereStatus
  if (whereStatus && typeof whereStatus === "object" && "in" in whereStatus) {
    return ((whereStatus as { in: string[] }).in ?? []).includes(item.status)
  }
  return false
}

mock.module("~/services/db", () => ({
  db: {
    $transaction: (queries: Promise<unknown>[]) => Promise.all(queries),
    socialQueueItem: {
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(state.items.get(where.id) ?? null),
      findMany: () => Promise.resolve([...state.items.values()]),
      count: () => Promise.resolve(state.items.size),
      updateMany: ({ where, data }: UpdateCall) => {
        state.updateCalls.push({ where, data })
        state.allUpdateCalls.push({ where, data })
        if (state.forceUpdateCount !== null) {
          return Promise.resolve({ count: state.forceUpdateCount })
        }
        const item = state.items.get(where.id as string)
        // Live compare-and-swap semantics: the status predicate decides whether the write lands.
        if (!item || !matchesStatus(item, where.status)) {
          return Promise.resolve({ count: 0 })
        }
        Object.assign(item, data)
        return Promise.resolve({ count: 1 })
      },
    },
    passport: {
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(state.passports.get(where.id) ?? null),
    },
  },
}))

const { socialQueue } = await import("~/server/orpc/routers/social-queue")
const { APP_AREA_PERMISSIONS } = await import("~/server/orpc/roles")
const { can } = await import("~/server/orpc/permissions")

type TestUser = { id: string; role: string | null; extraGrants?: string[] }

/** Invoke the router through the live pipeline as a given caller (rsc source → no rate limit). */
const asCaller = (user: TestUser | null) =>
  createRouterClient(
    { socialQueue },
    { context: { user: user as never, source: "rsc" as const, brand: "BBL" as never } },
  ).socialQueue

const admin: TestUser = { id: "admin-1", role: "admin" }
const member: TestUser = { id: "user-1", role: "user" }
const director: TestUser = { id: "td-1", role: "tournament_director" }
const grantee: TestUser = { id: "va-1", role: "user", extraGrants: ["social-queue.manage"] }

const makeItem = (overrides: Partial<ItemRow> & { id: string }): ItemRow => ({
  status: "DRAFT",
  consentBasis: "AGGREGATE_ONLY",
  passportId: null,
  source: "GRAPH_MILESTONE",
  subjectKey: "milestone:verified-nodes:100",
  payload: { headline: "100 verified nodes" },
  caption: null,
  rejectedReason: null,
  createdAt: new Date("2026-07-24T00:00:00Z"),
  approvedAt: null,
  publishedAt: null,
  approvedById: null,
  approvedBy: null,
  ...overrides,
})

const expectORPCError = async (promise: Promise<unknown>, code: string) => {
  let caught: unknown
  try {
    await promise
  } catch (error) {
    caught = error
  }
  expect(caught).toBeInstanceOf(ORPCError)
  expect((caught as ORPCError<string, unknown>).code).toBe(code)
}

beforeEach(() => {
  state.items.clear()
  state.passports.clear()
  state.updateCalls = []
  state.forceUpdateCount = null
})

// ─────────────────────────────────────────────────────────────────────────────────────────────

describe("authz — social-queue.manage via the existing can() matrix (never a 5th system)", () => {
  it("registers the area key in the APP_AREA_PERMISSIONS vocabulary", () => {
    expect(APP_AREA_PERMISSIONS.socialQueue).toBe("social-queue.manage")
  })

  it("admin holds it via the * wildcard; NO non-admin role holds it (adversarial pin)", () => {
    expect(can({ id: "a", role: "admin" } as never, APP_AREA_PERMISSIONS.socialQueue)).toBe(true)
    for (const role of ["user", "guest", "tournament_director", "nonexistent-role"]) {
      expect(can({ id: "x", role } as never, APP_AREA_PERMISSIONS.socialQueue)).toBe(false)
    }
    expect(can(null, APP_AREA_PERMISSIONS.socialQueue)).toBe(false)
  })

  it("guest (unauthenticated) → UNAUTHORIZED on list", async () => {
    await expectORPCError(asCaller(null).list({}), "UNAUTHORIZED")
  })

  it("member → FORBIDDEN on list", async () => {
    await expectORPCError(asCaller(member).list({}), "FORBIDDEN")
  })

  it("member/director → FORBIDDEN on approve AND reject, with ZERO writes issued", async () => {
    state.items.set("i1", makeItem({ id: "i1" }))
    await expectORPCError(asCaller(member).approve({ id: "i1" }), "FORBIDDEN")
    await expectORPCError(asCaller(director).approve({ id: "i1" }), "FORBIDDEN")
    await expectORPCError(asCaller(member).reject({ id: "i1", reason: "nope" }), "FORBIDDEN")
    expect(state.updateCalls).toEqual([])
    expect(state.items.get("i1")?.status).toBe("DRAFT")
  })

  it("admin passes the gate (list returns the mocked page)", async () => {
    state.items.set("i1", makeItem({ id: "i1" }))
    const result = await asCaller(admin).list({})
    expect(result.total).toBe(1)
    expect(result.rows[0]).toMatchObject({
      id: "i1",
      headline: "100 verified nodes",
      status: "DRAFT",
      consentBasis: "AGGREGATE_ONLY",
    })
  })

  it("an FI-019 extraGrants holder (future VA) passes without a role widening", async () => {
    const result = await asCaller(grantee).list({})
    expect(result.total).toBe(0)
  })
})

describe("approve — DRAFT → APPROVED, and STOP (no publish)", () => {
  it("approves a DRAFT aggregate item: status APPROVED, approver stamped, NOTHING published", async () => {
    state.items.set("i1", makeItem({ id: "i1" }))
    const result = await asCaller(admin).approve({ id: "i1" })

    expect(result).toMatchObject({ id: "i1", outcome: "approved", status: "APPROVED" })
    const item = state.items.get("i1")
    expect(item?.status).toBe("APPROVED")
    expect(item?.approvedById).toBe("admin-1")
    expect(item?.approvedAt).toBeInstanceOf(Date)
    // THE STOP: approval never touches the publish fields.
    expect(item?.publishedAt).toBeNull()
    for (const call of state.updateCalls) {
      expect(call.data.status).not.toBe("PUBLISHED")
      expect("publishedAt" in call.data).toBe(false)
    }
  })

  it("approves OWNED_CONTENT (brand editorial — no consent legs)", async () => {
    state.items.set(
      "i1",
      makeItem({ id: "i1", consentBasis: "OWNED_CONTENT", source: "BLOG_POST" }),
    )
    const result = await asCaller(admin).approve({ id: "i1" })
    expect(result.outcome).toBe("approved")
  })

  it("MEMBER_OPT_IN with a claimed subject FAILS CLOSED while F2 is unratified — CONFLICT, item stays DRAFT, zero writes", async () => {
    state.passports.set("p1", { userId: "owner-1" })
    state.items.set(
      "i1",
      makeItem({
        id: "i1",
        consentBasis: "MEMBER_OPT_IN",
        passportId: "p1",
        source: "RANK_PROMOTION",
      }),
    )
    await expectORPCError(asCaller(admin).approve({ id: "i1" }), "CONFLICT")
    expect(state.items.get("i1")?.status).toBe("DRAFT")
    expect(state.updateCalls).toEqual([])
  })

  it("MEMBER_OPT_IN whose subject became a placeholder (userId null) → AUTO-REJECTED with consent-revoked", async () => {
    state.passports.set("p1", { userId: null })
    state.items.set(
      "i1",
      makeItem({
        id: "i1",
        consentBasis: "MEMBER_OPT_IN",
        passportId: "p1",
        source: "CLAIM_VERIFIED",
      }),
    )
    const result = await asCaller(admin).approve({ id: "i1" })
    expect(result).toMatchObject({
      id: "i1",
      outcome: "auto-rejected",
      status: "REJECTED",
      rejectedReason: "consent-revoked",
    })
    const item = state.items.get("i1")
    expect(item?.status).toBe("REJECTED")
    expect(item?.rejectedReason).toBe("consent-revoked")
  })

  it("MEMBER_OPT_IN whose subject Passport is GONE (or was never set) → AUTO-REJECTED", async () => {
    state.items.set(
      "i1",
      makeItem({
        id: "i1",
        consentBasis: "MEMBER_OPT_IN",
        passportId: null,
        source: "CLAIM_VERIFIED",
      }),
    )
    const result = await asCaller(admin).approve({ id: "i1" })
    expect(result.outcome).toBe("auto-rejected")
  })

  it("cannot approve an APPROVED or REJECTED item (no double-approve, no resurrect)", async () => {
    state.items.set("a", makeItem({ id: "a", status: "APPROVED" }))
    state.items.set("r", makeItem({ id: "r", status: "REJECTED" }))
    await expectORPCError(asCaller(admin).approve({ id: "a" }), "CONFLICT")
    await expectORPCError(asCaller(admin).approve({ id: "r" }), "CONFLICT")
    expect(state.updateCalls).toEqual([])
  })

  it("missing item → NOT_FOUND", async () => {
    await expectORPCError(asCaller(admin).approve({ id: "ghost" }), "NOT_FOUND")
  })

  it("a lost compare-and-swap race → CONFLICT (no silent double-transition)", async () => {
    state.items.set("i1", makeItem({ id: "i1" }))
    state.forceUpdateCount = 0
    await expectORPCError(asCaller(admin).approve({ id: "i1" }), "CONFLICT")
  })
})

describe("reject — terminal, reason required", () => {
  it("rejects a DRAFT with the operator's reason", async () => {
    state.items.set("i1", makeItem({ id: "i1" }))
    const result = await asCaller(admin).reject({ id: "i1", reason: "off-brand phrasing" })
    expect(result).toMatchObject({ id: "i1", status: "REJECTED" })
    expect(state.items.get("i1")?.rejectedReason).toBe("off-brand phrasing")
  })

  it("pulls back an APPROVED item (pre-publish revocation path) — approval stamps kept for audit", async () => {
    state.items.set(
      "i1",
      makeItem({ id: "i1", status: "APPROVED", approvedById: "admin-1", approvedAt: new Date() }),
    )
    const result = await asCaller(admin).reject({ id: "i1", reason: "subject asked to pull it" })
    expect(result.status).toBe("REJECTED")
    expect(state.items.get("i1")?.approvedById).toBe("admin-1")
  })

  it("REJECTED is terminal — rejecting again is a CONFLICT (a rejected item never re-enters)", async () => {
    state.items.set("i1", makeItem({ id: "i1", status: "REJECTED", rejectedReason: "done" }))
    await expectORPCError(asCaller(admin).reject({ id: "i1", reason: "again" }), "CONFLICT")
    expect(state.items.get("i1")?.rejectedReason).toBe("done")
  })

  it("an empty/whitespace reason is rejected by input validation (auditability is not optional)", async () => {
    state.items.set("i1", makeItem({ id: "i1" }))
    let caught: unknown
    try {
      await asCaller(admin).reject({ id: "i1", reason: "   " })
    } catch (error) {
      caught = error
    }
    expect(caught).toBeDefined()
    expect(state.updateCalls).toEqual([])
    expect(state.items.get("i1")?.status).toBe("DRAFT")
  })

  it("missing item → NOT_FOUND", async () => {
    await expectORPCError(asCaller(admin).reject({ id: "ghost", reason: "x" }), "NOT_FOUND")
  })
})

describe("THE INVARIANT — nothing in this router ever publishes", () => {
  it("across EVERY write captured in this whole file, no update set PUBLISHED or touched publishedAt", () => {
    // This sweep runs last (bun executes file order) over the never-reset recorder: whatever
    // sequence of approves/rejects/races the suite drove, not one write moved an item to
    // PUBLISHED or stamped publishedAt. The publish step does not exist in v1 — by test.
    expect(state.allUpdateCalls.length).toBeGreaterThan(0)
    for (const call of state.allUpdateCalls) {
      expect(call.data.status).not.toBe("PUBLISHED")
      expect("publishedAt" in call.data).toBe(false)
    }
  })
})
