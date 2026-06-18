/**
 * safeRelativePath — open-redirect guard unit table (SOP §10b).
 *
 * A pure security validator: the test is an adversarial REJECT/ACCEPT input
 * table, no DB or mocks. REJECT inputs must collapse to the fallback; ACCEPT
 * inputs must pass through verbatim (pathname + search + hash). If you weaken
 * the validator, a REJECT row flips and this fails — that's the point.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { safeRelativePath } from "~/lib/safe-redirect"

const FALLBACK = "/fallback"

// Off-origin / malformed targets that must NEVER be honored. Control-char rows
// use string escapes (never literal control bytes in source).
const REJECT: Array<[label: string, input: string | null | undefined]> = [
  ["null", null],
  ["undefined", undefined],
  ["empty", ""],
  ["absolute https", "https://evil.com"],
  ["absolute http", "http://evil.com/path"],
  ["scheme-relative //", "//evil.com"],
  ["scheme-relative ///", "///evil.com"],
  ["backslash protocol-relative", "/\\evil.com"],
  ["embedded backslash", "/foo\\bar"],
  ["backslash-slash", "/\\/evil.com"],
  ["userinfo trick", "//evil.com@good.com"],
  ["javascript: scheme", "javascript:alert(1)"],
  ["data: scheme", "data:text/html,x"],
  ["no leading slash", "evil.com"],
  ["relative dotslash", "./evil"],
  ["tab control char", "/foo\tbar"],
  ["newline control char", "/foo\nbar"],
  ["null byte", "/foo\x00bar"],
  ["CR control char", "/foo\rbar"],
  ["DEL control char", "/foo\x7fbar"],
]

// Legitimate in-app relative targets that must pass through unchanged.
const ACCEPT: Array<[label: string, input: string, expected: string]> = [
  ["simple path", "/lineage/join", "/lineage/join"],
  ["path + query", "/lineage/join?node=abc123", "/lineage/join?node=abc123"],
  ["nested query (claim link)", "/lineage/claim/accept?node=abc", "/lineage/claim/accept?node=abc"],
  ["path + hash", "/about#team", "/about#team"],
  ["path + query + hash", "/x?a=1&b=2#frag", "/x?a=1&b=2#frag"],
  ["root", "/", "/"],
]

describe("safeRelativePath", () => {
  describe("rejects off-origin / malformed targets → fallback", () => {
    for (const [label, input] of REJECT) {
      it(label, () => {
        expect(safeRelativePath(input, FALLBACK)).toBe(FALLBACK)
      })
    }
  })

  describe("accepts same-origin relative paths verbatim", () => {
    for (const [label, input, expected] of ACCEPT) {
      it(label, () => {
        expect(safeRelativePath(input, FALLBACK)).toBe(expected)
      })
    }
  })

  it("defaults the fallback to '/'", () => {
    expect(safeRelativePath("//evil.com")).toBe("/")
    expect(safeRelativePath(null)).toBe("/")
  })
})
