import { describe, expect, test } from "bun:test"
import { deriveGraphBeltLevel } from "./graph-belt-level"

describe("deriveGraphBeltLevel", () => {
  test("an explicit technique belt wins over linked course ranks", () => {
    expect(
      deriveGraphBeltLevel({ colorHex: "#123456" }, [
        { colorHex: "#ffffff", sortOrder: 1 },
        { colorHex: "#0000ff", sortOrder: 2 },
      ]),
    ).toEqual({ colorHex: "#123456" })
  })

  test("an untagged technique derives the lowest-sort-order linked course rank", () => {
    expect(
      deriveGraphBeltLevel(null, [
        { colorHex: "#0000ff", sortOrder: 2 },
        { colorHex: "#ffffff", sortOrder: 1 },
        { colorHex: "#800080", sortOrder: 3 },
      ]),
    ).toEqual({ colorHex: "#ffffff" })
  })

  test("null linked course ranks are ignored", () => {
    expect(deriveGraphBeltLevel(null, [null, { colorHex: "#ffffff", sortOrder: 1 }, null])).toEqual(
      { colorHex: "#ffffff" },
    )
  })

  test("a technique without either rank source stays unranked", () => {
    expect(deriveGraphBeltLevel(null, [null])).toBeNull()
  })
})
