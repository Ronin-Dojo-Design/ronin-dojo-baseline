// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, test } from "bun:test"
import { deriveGraphBeltLevel } from "./graph-belt-level"

describe("deriveGraphBeltLevel", () => {
  test("an explicit technique belt wins over linked course ranks", () => {
    expect(
      deriveGraphBeltLevel({ colorHex: "#123456", name: "Black Belt" }, [
        { colorHex: "#ffffff", name: "White Belt", sortOrder: 1 },
        { colorHex: "#0000ff", name: "Blue Belt", sortOrder: 2 },
      ]),
    ).toEqual({ colorHex: "#123456", name: "Black Belt" })
  })

  test("an untagged technique derives the lowest-sort-order linked course rank", () => {
    expect(
      deriveGraphBeltLevel(null, [
        { colorHex: "#0000ff", name: "Blue Belt", sortOrder: 2 },
        { colorHex: "#ffffff", name: "White Belt", sortOrder: 1 },
        { colorHex: "#800080", name: "Purple Belt", sortOrder: 3 },
      ]),
    ).toEqual({ colorHex: "#ffffff", name: "White Belt" })
  })

  test("null linked course ranks are ignored", () => {
    expect(
      deriveGraphBeltLevel(null, [
        null,
        { colorHex: "#ffffff", name: "White Belt", sortOrder: 1 },
        null,
      ]),
    ).toEqual({ colorHex: "#ffffff", name: "White Belt" })
  })

  test("a technique without either rank source stays unranked", () => {
    expect(deriveGraphBeltLevel(null, [null])).toBeNull()
  })
})
