// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
}))

describe("content-post queries — visibility contract", () => {
  let capturedFindManyArgs: unknown
  let capturedFindFirstArgs: unknown

  beforeEach(() => {
    capturedFindManyArgs = undefined
    capturedFindFirstArgs = undefined

    mock.module("~/services/db", () => ({
      db: {
        contentVariant: {
          findMany: (args: unknown) => {
            capturedFindManyArgs = args
            return Promise.resolve([])
          },
          findFirst: (args: unknown) => {
            capturedFindFirstArgs = args
            return Promise.resolve(null)
          },
        },
      },
    }))
  })

  // --- findPublishedContentPosts ---

  it("scopes list queries to the request brand", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindManyArgs as any).where
    expect(where.brand).toBe("BASELINE_MARTIAL_ARTS")
  })

  it("only returns BLOG channel variants", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindManyArgs as any).where
    expect(where.channel).toBe("BLOG")
  })

  it("only returns PUBLISHED variants", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindManyArgs as any).where
    expect(where.status).toBe("PUBLISHED")
  })

  it("gates on parent atom status APPROVED or PUBLISHED", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindManyArgs as any).where
    expect(where.atom.status.in).toEqual(["APPROVED", "PUBLISHED"])
  })

  it("filters out future-dated variants", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindManyArgs as any).where
    // Should have an OR clause for publishDate <= now or null
    expect(where.OR).toBeDefined()
    expect(where.OR).toHaveLength(2)
    expect(where.OR[0].publishDate.lte).toBeInstanceOf(Date)
    expect(where.OR[1].publishDate).toBeNull()
  })

  it("excludes ContentTask data from list payload", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    const select = (capturedFindManyArgs as any).select
    expect(select.atom.select.tasks).toBeUndefined()
  })

  it("includes atom tags in the list payload for card badges", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    const select = (capturedFindManyArgs as any).select
    expect(select.atom.select.tags.select).toEqual({ id: true, name: true, slug: true })
    expect(select.atom.select.tags.orderBy).toEqual({ name: "asc" })
  })

  it("orders list by publishDate descending", async () => {
    const { findPublishedContentPosts } = await import("./queries")
    await findPublishedContentPosts("BASELINE_MARTIAL_ARTS" as any)

    expect((capturedFindManyArgs as any).orderBy).toEqual({ publishDate: "desc" })
  })

  // --- findPublishedContentPostBySlug ---

  it("resolves detail by publicSlug + brand", async () => {
    const { findPublishedContentPostBySlug } = await import("./queries")
    await findPublishedContentPostBySlug("why-the-bell-matters", "BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindFirstArgs as any).where
    expect(where.publicSlug).toBe("why-the-bell-matters")
    expect(where.brand).toBe("BASELINE_MARTIAL_ARTS")
  })

  it("cross-brand slug lookup does not match wrong brand", async () => {
    const { findPublishedContentPostBySlug } = await import("./queries")
    await findPublishedContentPostBySlug("why-the-bell-matters", "RONIN_DOJO_DESIGN" as any)

    const where = (capturedFindFirstArgs as any).where
    expect(where.brand).toBe("RONIN_DOJO_DESIGN")
    // The query enforces brand — a DB with only BASELINE data would return null
  })

  it("detail query requires PUBLISHED variant status", async () => {
    const { findPublishedContentPostBySlug } = await import("./queries")
    await findPublishedContentPostBySlug("test-slug", "BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindFirstArgs as any).where
    expect(where.status).toBe("PUBLISHED")
  })

  it("detail query gates on parent atom status", async () => {
    const { findPublishedContentPostBySlug } = await import("./queries")
    await findPublishedContentPostBySlug("test-slug", "BASELINE_MARTIAL_ARTS" as any)

    const where = (capturedFindFirstArgs as any).where
    expect(where.atom.status.in).toEqual(["APPROVED", "PUBLISHED"])
  })

  it("detail payload includes atom longFormCopy for renderer fallback", async () => {
    const { findPublishedContentPostBySlug } = await import("./queries")
    await findPublishedContentPostBySlug("test-slug", "BASELINE_MARTIAL_ARTS" as any)

    const select = (capturedFindFirstArgs as any).select
    expect(select.atom.select.longFormCopy).toBe(true)
  })

  it("detail payload excludes task data", async () => {
    const { findPublishedContentPostBySlug } = await import("./queries")
    await findPublishedContentPostBySlug("test-slug", "BASELINE_MARTIAL_ARTS" as any)

    const select = (capturedFindFirstArgs as any).select
    expect(select.atom.select.tasks).toBeUndefined()
  })
})
