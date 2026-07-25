/**
 * SESSION_0701 — WL-P2-41(c): boundary narrowing for `findMedia`'s URL-string enum params.
 *
 * Hermetic unit tests — no DB. Asserts the literal-union guards that replaced the
 * SESSION_0515-deferred `as any` casts: every real `Brand`/`MediaType` member passes through
 * typed, and junk (unknown values, case drift, whitespace, empty/undefined) drops to
 * `undefined` so an admin list ignores a bad filter instead of hitting Prisma's
 * invalid-enum runtime error.
 *
 * Run: cd apps/web && bun run test server/admin/media/queries.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { Brand, MediaType } from "~/.generated/prisma/client"
import { parseMediaBrandParam, parseMediaTypeParam } from "~/server/admin/media/queries"

describe("parseMediaBrandParam", () => {
  it("accepts every Brand member", () => {
    for (const brand of Object.values(Brand)) {
      expect(parseMediaBrandParam(brand)).toBe(brand)
    }
  })

  it.each([
    ["unknown value", "BANANA"],
    ["case drift", "bbl"],
    ["whitespace-padded", " BBL "],
    ["query junk", "BBL;DROP TABLE"],
    ["empty string", ""],
  ])("rejects %s", (_label: string, value: string) => {
    expect(parseMediaBrandParam(value)).toBeUndefined()
  })

  it("passes undefined through (no filter)", () => {
    expect(parseMediaBrandParam(undefined)).toBeUndefined()
  })
})

describe("parseMediaTypeParam", () => {
  it("accepts every MediaType member", () => {
    for (const type of Object.values(MediaType)) {
      expect(parseMediaTypeParam(type)).toBe(type)
    }
  })

  it.each([
    ["unknown value", "GIF"],
    ["case drift", "image"],
    ["whitespace-padded", " IMAGE "],
    ["a Brand value (cross-enum)", "BBL"],
    ["empty string", ""],
  ])("rejects %s", (_label: string, value: string) => {
    expect(parseMediaTypeParam(value)).toBeUndefined()
  })

  it("passes undefined through (no filter)", () => {
    expect(parseMediaTypeParam(undefined)).toBeUndefined()
  })
})
