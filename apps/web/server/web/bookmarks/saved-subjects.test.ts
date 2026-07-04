// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

describe("checkBookmarkSubjects", () => {
  let capturedFindManyArgs: any
  let findManyRows: unknown[]

  beforeEach(() => {
    capturedFindManyArgs = undefined
    findManyRows = []

    mock.module("~/services/db", () => ({
      db: {
        bookmark: {
          findMany: (args: unknown) => {
            capturedFindManyArgs = args
            return Promise.resolve(findManyRows)
          },
        },
      },
    }))
  })

  it("returns an empty set and issues NO query for empty input", async () => {
    const { checkBookmarkSubjects } = await import("./saved-subjects")

    const saved = await checkBookmarkSubjects("user_1", [])

    expect(saved.size).toBe(0)
    expect(capturedFindManyArgs).toBeUndefined()
  })

  it("resolves saved subjects in ONE query keyed on userId", async () => {
    // Only cp_1 is bookmarked; cp_2/cp_3 are not.
    findManyRows = [{ communityPostId: "cp_1" }]
    const { checkBookmarkSubjects } = await import("./saved-subjects")

    const saved = await checkBookmarkSubjects("user_1", [
      { subjectType: "COMMUNITY_POST", subjectId: "cp_1" },
      { subjectType: "COMMUNITY_POST", subjectId: "cp_2" },
      { subjectType: "COMMUNITY_POST", subjectId: "cp_3" },
    ])

    expect(saved.has("cp_1")).toBe(true)
    expect(saved.has("cp_2")).toBe(false)
    expect(saved.has("cp_3")).toBe(false)

    expect(capturedFindManyArgs.where.userId).toBe("user_1")
    expect(capturedFindManyArgs.where.OR).toEqual([{ communityPostId: { in: ["cp_1", "cp_2", "cp_3"] } }])
    expect(capturedFindManyArgs.select).toEqual({ communityPostId: true })
  })

  it("groups mixed subject types into per-column IN clauses", async () => {
    findManyRows = [{ toolId: "t_1", passportId: null }, { toolId: null, passportId: "p_1" }]
    const { checkBookmarkSubjects } = await import("./saved-subjects")

    const saved = await checkBookmarkSubjects("user_1", [
      { subjectType: "TOOL", subjectId: "t_1" },
      { subjectType: "PERSON", subjectId: "p_1" },
      { subjectType: "PERSON", subjectId: "p_2" },
    ])

    expect(saved.has("t_1")).toBe(true)
    expect(saved.has("p_1")).toBe(true)
    expect(saved.has("p_2")).toBe(false)

    expect(capturedFindManyArgs.where.OR).toEqual([
      { toolId: { in: ["t_1"] } },
      { passportId: { in: ["p_1", "p_2"] } },
    ])
    expect(capturedFindManyArgs.select).toEqual({ toolId: true, passportId: true })
  })
})
