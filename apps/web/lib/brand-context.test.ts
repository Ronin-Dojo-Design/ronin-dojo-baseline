import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { Brand } from "~/.generated/prisma/client"
import { resolveBrand } from "./brand-context"

describe("resolveBrand", () => {
  test("always returns BBL (single-brand deployment)", () => {
    assert.equal(resolveBrand("blackbeltlegacy.com"), Brand.BBL)
    assert.equal(resolveBrand("bbl.local"), Brand.BBL)
    assert.equal(resolveBrand("localhost"), Brand.BBL)
    assert.equal(resolveBrand(null), Brand.BBL)
    assert.equal(resolveBrand(undefined), Brand.BBL)
  })
})
