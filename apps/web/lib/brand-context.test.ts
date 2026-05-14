import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { Brand } from "~/.generated/prisma/client"
import { resolveBrand } from "./brand-context"

describe("resolveBrand", () => {
  test("maps production brand domains", () => {
    assert.equal(resolveBrand("baselinemartialarts.com"), Brand.BASELINE_MARTIAL_ARTS)
    assert.equal(resolveBrand("ronindojodesign.com"), Brand.RONIN_DOJO_DESIGN)
    assert.equal(resolveBrand("blackbeltlegacy.com"), Brand.BBL)
    assert.equal(resolveBrand("wekafusa.com"), Brand.WEKAF)
  })

  test("normalizes www hostnames before lookup", () => {
    assert.equal(resolveBrand("www.baselinemartialarts.com"), Brand.BASELINE_MARTIAL_ARTS)
  })
})
