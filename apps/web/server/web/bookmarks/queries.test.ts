// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

describe("bookmark queries", () => {
  let capturedFindManyArgs: unknown

  beforeEach(() => {
    capturedFindManyArgs = undefined

    mock.module("~/services/db", () => ({
      db: {
        bookmark: {
          findMany: (args: unknown) => {
            capturedFindManyArgs = args
            return Promise.resolve([{ toolId: "tool_1" }, { toolId: "tool_2" }])
          },
          findUnique: () => Promise.resolve(null),
        },
      },
    }))
  })

  it("returns bookmarked tool IDs for a user in newest-first order", async () => {
    const { findBookmarkedToolIds } = await import("./queries")

    const ids = await findBookmarkedToolIds("user_1")

    expect(ids).toEqual(["tool_1", "tool_2"])
    expect(capturedFindManyArgs).toEqual({
      where: { userId: "user_1" },
      select: { toolId: true },
      orderBy: { createdAt: "desc" },
    })
  })

  it("scopes bookmarked tools by user ID", async () => {
    const { findBookmarkedTools } = await import("./queries")

    await findBookmarkedTools("user_1", { take: 10 })

    expect((capturedFindManyArgs as any).where).toEqual({ userId: "user_1" })
    expect((capturedFindManyArgs as any).take).toBe(10)
    expect((capturedFindManyArgs as any).select.tool).toBeDefined()
  })
})
