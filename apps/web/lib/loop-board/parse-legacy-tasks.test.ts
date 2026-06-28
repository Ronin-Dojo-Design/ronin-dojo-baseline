// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { parseLegacyTaskBoard } from "./parse-legacy-tasks"

describe("parseLegacyTaskBoard", () => {
  it("returns [] for null / empty / corrupt input", () => {
    expect(parseLegacyTaskBoard(null)).toEqual([])
    expect(parseLegacyTaskBoard("")).toEqual([])
    expect(parseLegacyTaskBoard("{not json")).toEqual([])
    expect(parseLegacyTaskBoard("{}")).toEqual([])
  })

  it("maps tasks and resolves the project id to its display name", () => {
    const raw = JSON.stringify({
      projects: [{ id: "p1", name: "Launch" }],
      tasks: [
        { id: "a", title: "Do thing", done: false, lane: "QF", due: "2026-07-01", project: "p1" },
        { id: "b", title: "Done thing", done: true, project: "unknown" },
      ],
    })
    expect(parseLegacyTaskBoard(raw)).toEqual([
      { id: "a", title: "Do thing", done: false, lane: "QF", due: "2026-07-01", project: "Launch" },
      // Unknown project id falls back to the raw id; defaults fill in.
      { id: "b", title: "Done thing", done: true, lane: null, due: null, project: "unknown" },
    ])
  })

  it("drops tasks missing an id or title", () => {
    const raw = JSON.stringify({
      tasks: [
        { id: "a", title: "" },
        { id: "", title: "no id" },
        { id: "c", title: "ok" },
      ],
    })
    expect(parseLegacyTaskBoard(raw).map(t => t.id)).toEqual(["c"])
  })
})
