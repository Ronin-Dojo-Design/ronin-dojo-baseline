/**
 * Celebration-card feeder — HERMETIC unit tests (SESSION_0688).
 *
 * Same seam idiom + §13 deviation as `server/orpc/routers/social-queue.test.ts` (SESSION_0686):
 * the `SocialQueueItem` table ships with its migration UNAPPLIED on the shared local DB, so a
 * real-Postgres test would red-gate every checkout until the merge owner applies it — the db
 * (and the `"use cache"` ancestry read model) are seamed in-memory mocks installed BEFORE the
 * dynamic import. The mock doubles as the "feeder writes DRAFT and nothing else" recorder.
 *
 * What this file proves:
 *   1. payload correctness — card params (name, belt name, belt color from `Rank.colorHex`,
 *      UTC-stable date, lineage line), the relative `/api/og?…` render URL, the CTA path
 *   2. consent fails closed — placeholder/unclaimed subject (and hidden ranks, and
 *      non-VERIFIED entries) generate NOTHING
 *   3. drafts land in DRAFT — every write the feeder ever issues is status DRAFT; no write
 *      carries APPROVED/PUBLISHED/approvedAt/publishedAt
 *   4. idempotency — the `@@unique([source, subjectKey])` P2002 conflict-noops as "duplicate"
 *
 * Run: cd apps/web && bun test server/social-queue/celebration-cards.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { beforeEach, describe, expect, it, mock } from "bun:test"

// ── mock seams (BEFORE the dynamic import) ───────────────────────────────────────────────────
mock.module("server-only", () => ({}))
mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
  cacheLife: () => {},
  cacheTag: () => {},
}))
// `projectPublicPassport` → `resolveDisplayAvatar` (lib/media pulls the AWS SDK + env).
mock.module("~/lib/media", () => ({
  resolveDisplayAvatar: (url: string | null | undefined) => url ?? null,
}))
// `getOpenGraphImageUrl` defaults its origin from `~/config/site` (env-validated); the feeder
// passes an explicit "" origin, so only the import needs satisfying.
mock.module("~/config/site", () => ({
  siteConfig: { url: "https://example.test" },
}))

type CreateData = Record<string, unknown>

const state = {
  entry: null as unknown,
  /** Every socialQueueItem.create data this file ever issued — the DRAFT-only recorder. */
  createCalls: [] as CreateData[],
  allCreateCalls: [] as CreateData[],
  /** When set, the next create rejects with this error (P2002 dedupe simulation). */
  createError: null as unknown,
  ancestry: [] as { displayName: string }[],
}

mock.module("~/services/db", () => ({
  db: {
    rankEntry: {
      findUnique: () => Promise.resolve(state.entry),
    },
    socialQueueItem: {
      create: ({ data }: { data: CreateData }) => {
        state.createCalls.push(data)
        state.allCreateCalls.push(data)
        if (state.createError) return Promise.reject(state.createError)
        return Promise.resolve({ id: "sq-1" })
      },
    },
  },
}))

// The ancestry walk is `"use cache"` + its own multi-query pipeline — seam the whole module.
mock.module("~/server/web/lineage/ancestry", () => ({
  getLineageAncestryForPassport: async () => state.ancestry,
}))

const {
  buildRankPromotionCelebrationPayload,
  canEnqueueMemberOptInDraft,
  enqueueRankPromotionCelebration,
} = await import("~/server/social-queue/celebration-cards")

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────

/**
 * A `publicPassportPayload`-shaped row (+ the fork-F2 `allowSocialCelebration` consent bit the
 * feeder selects alongside): account-claimed, OPTED-IN, ranks public, one BJJ award.
 */
const makePassport = (overrides: Record<string, unknown> = {}) => ({
  id: "p-1",
  displayName: "Jane Doe",
  avatarUrl: null,
  bio: null,
  socialLinks: null,
  allowSocialCelebration: true,
  user: { id: "user-1", name: "Jane Doe", image: null },
  directoryProfile: { slug: "jane-doe", visibility: "PUBLIC", showRanks: true },
  // #376: `projectPublicPassport` reads the member's ranks from `RankEntry`; trust is the entry
  // `status` directly, and `awardedAt` nests under the anchor award's required `rankAward` relation.
  rankEntries: [
    {
      id: "re-1",
      status: "VERIFIED",
      rank: {
        id: "rank-black",
        name: "Black Belt",
        shortName: null,
        colorHex: "#111111",
        secondaryColorHex: null,
        degree: null,
        beltFamily: null,
        rankSystem: {
          id: "rs-1",
          name: "BJJ",
          discipline: { id: "d-1", name: "Brazilian Jiu-Jitsu", slug: "bjj", code: "BJJ" },
        },
      },
      rankAward: { id: "ra-1", awardedAt: new Date("2026-07-12T00:00:00Z") },
    },
  ],
  ...overrides,
})

const makeEntry = (overrides: Record<string, unknown> = {}) => ({
  id: "re-1",
  status: "VERIFIED",
  passportId: "p-1",
  passport: makePassport(),
  rank: { name: "Black Belt", colorHex: "#111111" },
  rankAward: { awardedAt: new Date("2026-07-12T00:00:00Z") },
  createdAt: new Date("2026-07-13T00:00:00Z"),
  ...overrides,
})

const ogParamsOf = (ogImageUrl: string) => new URLSearchParams(ogImageUrl.split("?")[1] ?? "")

beforeEach(() => {
  state.entry = null
  state.createCalls = []
  state.createError = null
  state.ancestry = []
})

// ─────────────────────────────────────────────────────────────────────────────────────────────

describe("buildRankPromotionCelebrationPayload — the render-input snapshot (spec §2.4)", () => {
  const base = {
    displayName: "Jane Doe",
    beltName: "Black Belt",
    beltColorHex: "#111111",
    awardedAt: new Date("2026-07-12T00:00:00Z"),
    lineageLine: "Rigan Machado → Bob Bass → Jane Doe",
    slug: "jane-doe",
  }

  it("carries the card params: name, belt name, Rank.colorHex verbatim, UTC-stable date, lineage line", () => {
    const payload = buildRankPromotionCelebrationPayload(base)
    expect(payload.kind).toBe("rank-promotion-celebration-card")
    expect(payload.headline).toBe("Jane Doe promoted to Black Belt")
    expect(payload.card).toEqual({
      name: "Jane Doe",
      beltName: "Black Belt",
      beltColorHex: "#111111",
      date: "July 12, 2026",
      lineageLine: "Rigan Machado → Bob Bass → Jane Doe",
    })
  })

  it("the OG-render URL is RELATIVE (/api/og?…) with the headline as title + lineage line as description", () => {
    const payload = buildRankPromotionCelebrationPayload(base)
    expect(payload.ogImageUrl.startsWith("/api/og?")).toBe(true)
    const params = ogParamsOf(payload.ogImageUrl)
    expect(params.get("title")).toBe("Jane Doe promoted to Black Belt")
    expect(params.get("description")).toBe("Rigan Machado → Bob Bass → Jane Doe")
  })

  it("the OG URL carries the graduated card params (SESSION_0705): card=rank-promotion + name/belt/color/date/lineage", () => {
    const params = ogParamsOf(buildRankPromotionCelebrationPayload(base).ogImageUrl)
    expect(params.get("card")).toBe("rank-promotion")
    expect(params.get("name")).toBe("Jane Doe")
    expect(params.get("beltName")).toBe("Black Belt")
    expect(params.get("beltColorHex")).toBe("#111111")
    expect(params.get("date")).toBe("July 12, 2026")
    expect(params.get("lineageLine")).toBe("Rigan Machado → Bob Bass → Jane Doe")
  })

  it("no lineage line → description + lineageLine omitted from the OG URL, card carries null", () => {
    const payload = buildRankPromotionCelebrationPayload({ ...base, lineageLine: null })
    expect(payload.card.lineageLine).toBeNull()
    expect(ogParamsOf(payload.ogImageUrl).get("description")).toBeNull()
    expect(ogParamsOf(payload.ogImageUrl).get("lineageLine")).toBeNull()
  })

  it("CTA path: /directory/<slug> when public, /lineage fallback when none", () => {
    expect(buildRankPromotionCelebrationPayload(base).ctaPath).toBe("/directory/jane-doe")
    expect(buildRankPromotionCelebrationPayload({ ...base, slug: null }).ctaPath).toBe("/lineage")
  })

  it("null Rank.colorHex rides as null (renderer falls back to the brand accent)", () => {
    const payload = buildRankPromotionCelebrationPayload({ ...base, beltColorHex: null })
    expect(payload.card.beltColorHex).toBeNull()
    expect(ogParamsOf(payload.ogImageUrl).get("beltColorHex")).toBeNull()
  })
})

describe("canEnqueueMemberOptInDraft — delegates to 0686's consent gate, fails closed", () => {
  it("account-claimed subject HOLDING the F2 opt-in → draft allowed", () => {
    expect(canEnqueueMemberOptInDraft({ userId: "user-1", allowSocialCelebration: true })).toBe(
      true,
    )
  })

  it("claimed subject WITHOUT the opt-in (default OFF) → false — consent is a precondition to drafting too", () => {
    expect(canEnqueueMemberOptInDraft({ userId: "user-1", allowSocialCelebration: false })).toBe(
      false,
    )
  })

  it("placeholder (unclaimed) subject → false", () => {
    expect(canEnqueueMemberOptInDraft({ userId: null, allowSocialCelebration: false })).toBe(false)
  })

  it("missing subject → false", () => {
    expect(canEnqueueMemberOptInDraft(null)).toBe(false)
  })
})

describe("enqueueRankPromotionCelebration — the explicit trigger seam", () => {
  const expectRankNotPublic = async () => {
    const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })
    expect(result).toEqual({ outcome: "skipped", reason: "rank-not-public" })
    expect(state.createCalls).toEqual([])
  }

  it("VERIFIED promotion of a claimed, ranks-public member → ONE DRAFT with the full snapshot", async () => {
    state.entry = makeEntry()
    state.ancestry = [
      { displayName: "Rigan Machado" },
      { displayName: "Bob Bass" },
      { displayName: "Jane Doe" },
    ]

    const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })

    expect(result).toEqual({ outcome: "created", id: "sq-1", subjectKey: "award:re-1" })
    expect(state.createCalls).toHaveLength(1)
    const data = state.createCalls[0]
    expect(data).toMatchObject({
      source: "RANK_PROMOTION",
      subjectKey: "award:re-1",
      consentBasis: "MEMBER_OPT_IN",
      status: "DRAFT",
      passportId: "p-1",
    })

    const payload = data.payload as ReturnType<typeof buildRankPromotionCelebrationPayload>
    expect(payload.headline).toBe("Jane Doe promoted to Black Belt")
    expect(payload.card.beltColorHex).toBe("#111111")
    expect(payload.card.lineageLine).toBe("Rigan Machado → Bob Bass → Jane Doe")
    expect(payload.card.date).toBe("July 12, 2026")
    expect(ogParamsOf(payload.ogImageUrl).get("title")).toBe("Jane Doe promoted to Black Belt")
    expect(payload.ctaPath).toBe("/directory/jane-doe")
    // The operator-editable caption is seeded from the payload.
    expect(data.caption as string).toContain("Jane Doe promoted to Black Belt")
  })

  it("no PUBLIC up-chain → draft still created, lineage line null", async () => {
    state.entry = makeEntry()
    state.ancestry = []
    const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })
    expect(result.outcome).toBe("created")
    const payload = state.createCalls[0].payload as { card: { lineageLine: string | null } }
    expect(payload.card.lineageLine).toBeNull()
  })

  it("non-PUBLIC directory visibility → draft created, CTA falls back to /lineage (no 404 CTA)", async () => {
    state.entry = makeEntry({
      passport: makePassport({
        directoryProfile: { slug: "jane-doe", visibility: "MEMBERS_ONLY", showRanks: true },
      }),
    })
    const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })
    expect(result.outcome).toBe("created")
    const payload = state.createCalls[0].payload as { ctaPath: string }
    // `/directory/[slug]` is visibility-gated server-side — baking the slug into the payload
    // for a MEMBERS_ONLY/HIDDEN profile would hand the publisher a dead link.
    expect(payload.ctaPath).toBe("/lineage")
  })

  it("CONSENT FAILS CLOSED: placeholder subject (no account) → nothing is generated", async () => {
    state.entry = makeEntry({ passport: makePassport({ user: null }) })
    const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })
    expect(result).toEqual({ outcome: "skipped", reason: "consent" })
    expect(state.createCalls).toEqual([])
  })

  it("CONSENT FAILS CLOSED: claimed subject WITHOUT the F2 opt-in (default OFF) → nothing is generated", async () => {
    state.entry = makeEntry({ passport: makePassport({ allowSocialCelebration: false }) })
    const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })
    expect(result).toEqual({ outcome: "skipped", reason: "consent" })
    expect(state.createCalls).toEqual([])
  })

  it("non-VERIFIED entries (PENDING/UNVERIFIED/DISPUTED) → nothing is generated", async () => {
    for (const status of ["PENDING", "UNVERIFIED", "DISPUTED"]) {
      state.entry = makeEntry({ status })
      const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })
      expect(result).toEqual({ outcome: "skipped", reason: "not-verified" })
    }
    expect(state.createCalls).toEqual([])
  })

  it("PUBLIC-DATA FLOOR: hidden ranks (showRanks false) → nothing is generated", async () => {
    state.entry = makeEntry({
      passport: makePassport({
        directoryProfile: { slug: "jane-doe", visibility: "PUBLIC", showRanks: false },
      }),
    })
    await expectRankNotPublic()
  })

  it("no public awards at all → nothing is generated", async () => {
    state.entry = makeEntry({ passport: makePassport({ rankEntries: [] }) })
    await expectRankNotPublic()
  })

  it("unknown rankEntryId → skipped, zero writes", async () => {
    const result = await enqueueRankPromotionCelebration({ rankEntryId: "ghost" })
    expect(result).toEqual({ outcome: "skipped", reason: "not-found" })
    expect(state.createCalls).toEqual([])
  })

  it("replayed event → P2002 conflict-noops as duplicate (a REJECTED item is never resurrected)", async () => {
    state.entry = makeEntry()
    state.createError = { code: "P2002" }
    const result = await enqueueRankPromotionCelebration({ rankEntryId: "re-1" })
    expect(result).toEqual({ outcome: "duplicate", subjectKey: "award:re-1" })
  })

  it("a non-unique-violation create error is rethrown, not swallowed", async () => {
    state.entry = makeEntry()
    state.createError = new Error("connection lost")
    expect(enqueueRankPromotionCelebration({ rankEntryId: "re-1" })).rejects.toThrow(
      "connection lost",
    )
  })
})

describe("THE INVARIANT — the feeder only ever writes DRAFT", () => {
  it("across EVERY create this file issued, status is DRAFT and no approve/publish field exists", () => {
    expect(state.allCreateCalls.length).toBeGreaterThan(0)
    for (const data of state.allCreateCalls) {
      expect(data.status).toBe("DRAFT")
      expect("approvedAt" in data).toBe(false)
      expect("approvedById" in data).toBe(false)
      expect("publishedAt" in data).toBe(false)
    }
  })
})
