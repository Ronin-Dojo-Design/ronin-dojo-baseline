/**
 * bun test server/web/community/queries.guard.test.ts
 *
 * SESSION_0493 — proves the community read layer PINS `status: PUBLISHED` (hidden posts are
 * excluded from public queries) and only the explicit admin escape hatch (`includeHidden: true`)
 * drops the pin. The DB is stubbed to CAPTURE the built `where` — the enforcement our code adds is
 * the unit under test, not Prisma. Also covers the row→client mapping (Passport author canon,
 * excerpt derivation, isHidden flag).
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

type FindArgs = { where: Record<string, unknown> }

const captured: { findMany: FindArgs[]; findFirst: FindArgs[] } = { findMany: [], findFirst: [] }

type SampleRow = {
  id: string
  type: string
  title: string
  slug: string
  content: string
  videoUrl: string | null
  imageUrl: string | null
  status: string
  isPremium: boolean
  authorId: string
  createdAt: Date
  style: { id: string; name: string } | null
  author: {
    name: string | null
    image: string | null
    passport: { displayName: string | null; avatarUrl: string | null } | null
  }
}

const sampleRow: SampleRow = {
  id: "post-1",
  type: "TECHNIQUE",
  title: "Armbar from Closed Guard",
  slug: "armbar-from-closed-guard",
  content: "## Setup\n\nControl the **wrist**, [climb](https://x.test) the legs.",
  videoUrl: null,
  imageUrl: null,
  status: "HIDDEN",
  isPremium: false,
  authorId: "user-1",
  createdAt: new Date("2026-07-01T00:00:00Z"),
  style: { id: "style-1", name: "Brazilian Jiu-Jitsu" },
  author: {
    name: "Login Name",
    image: "https://media.test/user.jpg",
    passport: { displayName: "Passport Name", avatarUrl: "https://media.test/passport.jpg" },
  },
}

const state: { row: typeof sampleRow | null } = { row: sampleRow }

mock.module("~/services/db", () => ({
  db: {
    communityPost: {
      findMany: async (args: FindArgs) => {
        captured.findMany.push(args)
        return state.row ? [state.row] : []
      },
      findFirst: async (args: FindArgs) => {
        captured.findFirst.push(args)
        return state.row
      },
    },
    style: {
      findMany: async () => [],
    },
  },
}))

beforeEach(() => {
  captured.findMany.length = 0
  captured.findFirst.length = 0
  state.row = sampleRow
})

describe("findCommunityPosts — the public feed", () => {
  it("pins status PUBLISHED and the brand (hidden posts can never leak into the feed)", async () => {
    const { findCommunityPosts } = await import("~/server/web/community/queries")

    await findCommunityPosts("BBL" as never)

    expect(captured.findMany.length).toBe(1)
    expect(captured.findMany[0]?.where).toEqual({ brand: "BBL", status: "PUBLISHED" })
  })

  it("maps rows through the Passport author canon + server-side excerpt", async () => {
    const { findCommunityPosts } = await import("~/server/web/community/queries")

    const [post] = await findCommunityPosts("BBL" as never)

    // Passport display identity wins over the login identity.
    expect(post?.authorName).toBe("Passport Name")
    expect(post?.authorImage).toBe("https://media.test/passport.jpg")
    // Markdown stripped, link text kept, whitespace collapsed.
    expect(post?.excerpt).toBe("Setup Control the wrist, climb the legs.")
    expect(post?.isHidden).toBe(true)
  })

  it("falls back to the login identity when no passport exists", async () => {
    const { findCommunityPosts } = await import("~/server/web/community/queries")
    state.row = { ...sampleRow, author: { name: "Login Name", image: null, passport: null } }

    const [post] = await findCommunityPosts("BBL" as never)

    expect(post?.authorName).toBe("Login Name")
    expect(post?.authorImage).toBeNull()
  })
})

describe("findCommunityPostBySlug — detail lookup", () => {
  it("pins status PUBLISHED by default (a hidden post 404s for the public)", async () => {
    const { findCommunityPostBySlug } = await import("~/server/web/community/queries")

    await findCommunityPostBySlug("armbar-from-closed-guard", "BBL" as never)

    expect(captured.findFirst[0]?.where).toEqual({
      slug: "armbar-from-closed-guard",
      brand: "BBL",
      status: "PUBLISHED",
    })
  })

  it("drops the pin ONLY for the explicit admin escape hatch", async () => {
    const { findCommunityPostBySlug } = await import("~/server/web/community/queries")

    await findCommunityPostBySlug("armbar-from-closed-guard", "BBL" as never, {
      includeHidden: true,
    })

    expect(captured.findFirst[0]?.where).toEqual({
      slug: "armbar-from-closed-guard",
      brand: "BBL",
    })
  })

  it("returns null when the row is missing", async () => {
    const { findCommunityPostBySlug } = await import("~/server/web/community/queries")
    state.row = null

    const post = await findCommunityPostBySlug("nope", "BBL" as never)

    expect(post).toBeNull()
  })
})
