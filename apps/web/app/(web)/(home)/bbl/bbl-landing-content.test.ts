// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { BBL_ROUTES } from "./bbl-landing-content"

describe("BBL landing routes", () => {
  it("routes Register Now to the Join Legacy registration intake", () => {
    expect(BBL_ROUTES.register).toBe("/lineage/join")
    expect(BBL_ROUTES.join).toBe("/lineage/join")
  })
})
