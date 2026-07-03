/**
 * SESSION_0440 — regression guard for the magic-link claim callbackURL (INVALID_CALLBACK_URL).
 *
 * Run: cd apps/web && bun test server/web/lineage/claim-callback-url.test.ts
 *
 * Better Auth's magic-link `/magic-link/verify` runs `originCheck` over
 * `decodeURIComponent(ctx.query.callbackURL)` — a SECOND decode on top of the framework's —
 * then requires the result to match its trusted-relative-path regex, which permits a SINGLE
 * query string only. The old callbackURL wrapped the destination in a `/preview?token=…&next=…`
 * gate-bypass hop; for a node claim that decoded to a callbackURL with a NESTED `?` (the `%3F`
 * in `next` collapsed to a literal `?`), so every claim link failed with INVALID_CALLBACK_URL —
 * while `/me` survived (no nested query). The fix points the callbackURL straight at `nextPath`.
 *
 * This test pins that contract by replicating Better Auth's validation verbatim
 * (node_modules/better-auth/dist/auth/trusted-origins.mjs + plugins/magic-link/index.mjs).
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

// From better-auth trusted-origins.mjs `matchesOriginPattern` (allowRelativePaths branch),
// modulo oxlint's escape normalization (`\+` → `+` inside character classes — identical regex).
const BA_RELATIVE_CALLBACK_RE = /^\/(?!\/|\\|%2f|%5c)[\w\-.+/@]*(?:\?[\w\-.+/=&%@]*)?$/

/**
 * What Better Auth's magic-link verify actually validates: it `decodeURIComponent`s the
 * callbackURL query value (which the framework already decoded once) and regex-tests THAT.
 */
function passesOriginCheck(callbackURLValue: string): boolean {
  const decodedOnceMore = decodeURIComponent(callbackURLValue)
  return decodedOnceMore.startsWith("/") && BA_RELATIVE_CALLBACK_RE.test(decodedOnceMore)
}

// The current callbackURL is the bare nextPath (mint-claim-magic-link.ts, SESSION_0440 fix).
const NODE_ID = "khei911kchy3vz5fhe7jhaj0"
const claimAcceptNextPath = (nodeId: string) => `/lineage/claim/accept?node=${nodeId}`
const FREE_SIGNUP_NEXT_PATH = "/me"

// The OLD wrapped form, for the regression assertion.
const oldPreviewCallback = (nextPath: string) =>
  `/preview?token=${encodeURIComponent("bob-tony-BBL-preview")}&next=${encodeURIComponent(nextPath)}`

describe("magic-link claim callbackURL passes Better Auth originCheck", () => {
  it("the claim-accept nextPath (current callbackURL) is accepted", () => {
    expect(passesOriginCheck(claimAcceptNextPath(NODE_ID))).toBe(true)
  })

  it("the free-signup nextPath is accepted", () => {
    expect(passesOriginCheck(FREE_SIGNUP_NEXT_PATH)).toBe(true)
  })

  it("REGRESSION: the old /preview-wrapped claim callbackURL was REJECTED (nested ?)", () => {
    // Documents the exact bug: after Better Auth's extra decode, the wrapped claim URL has
    // two `?` and fails the single-query regex → INVALID_CALLBACK_URL.
    expect(passesOriginCheck(oldPreviewCallback(claimAcceptNextPath(NODE_ID)))).toBe(false)
  })

  it("the old /preview-wrapped FREE-SIGNUP callbackURL happened to pass (no nested query)", () => {
    // Why /me worked in SESSION_0439 but the claim link never did.
    expect(passesOriginCheck(oldPreviewCallback(FREE_SIGNUP_NEXT_PATH))).toBe(true)
  })
})
