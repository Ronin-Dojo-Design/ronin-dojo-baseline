// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
}))

describe("web post queries", () => {
  let capturedFindManyArgs: unknown
  let capturedFindFirstArgs: unknown

  beforeEach(() => {
    capturedFindManyArgs = undefined
    capturedFindFirstArgs = undefined

    mock.module("~/services/db", () => ({
      db: {
        post: {
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

  it("keeps published post lists brand-scoped", async () => {
    const { findPublishedPosts } = await import("./queries")

    await findPublishedPosts("BASELINE_MARTIAL_ARTS" as any)

    expect((capturedFindManyArgs as any).where).toMatchObject({
      brand: "BASELINE_MARTIAL_ARTS",
      status: "Published",
    })
    expect((capturedFindManyArgs as any).select.author).toBeDefined()
    // The blog feed (SESSION_0492) derives its flair tabs from post categories, so the read model
    // must surface the categories relation.
    expect((capturedFindManyArgs as any).select.categories).toBeDefined()
  })

  it("keeps single post lookup brand-scoped and selects mentioned tools", async () => {
    const { findPublishedPostBySlug } = await import("./queries")

    await findPublishedPostBySlug("launch-notes", "RONIN_DOJO_DESIGN" as any)

    expect((capturedFindFirstArgs as any).where).toMatchObject({
      slug: "launch-notes",
      brand: "RONIN_DOJO_DESIGN",
      status: "Published",
    })
    expect((capturedFindFirstArgs as any).select.tools).toBeDefined()
  })
})
