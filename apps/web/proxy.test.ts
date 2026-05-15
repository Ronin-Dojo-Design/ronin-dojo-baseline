// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { matchesRoute } from "./proxy"

describe("matchesRoute", () => {
  it("matches exact routes and nested segments only", () => {
    expect(matchesRoute("/me", "/me")).toBe(true)
    expect(matchesRoute("/me/settings", "/me")).toBe(true)
    expect(matchesRoute("/merch", "/me")).toBe(false)
    expect(matchesRoute("/members", "/me")).toBe(false)
  })
})
