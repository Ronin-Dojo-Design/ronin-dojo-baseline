/**
 * SESSION_0701 — WL-P2-41(b): legacy `/app/users/{userId}` → passport-id fallback resolve.
 *
 * Hermetic unit tests over a fake `passport` delegate (the person-service.test.ts pattern) —
 * no real DB. Asserts the resolve contract the people detail page's redirect fallback relies on:
 * a linked passport resolves to its id, an unknown id resolves to null (page keeps 404ing),
 * and a blank id short-circuits without touching the client.
 *
 * Run: cd apps/web && bun run test server/admin/users/resolve-passport-id.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { resolvePassportIdByUserId } from "~/server/admin/users/resolve-passport-id"
import { db } from "~/services/db"

type PassportClient = typeof db

function makeFakeClient(opts: { findUniqueResult?: { id: string } | null } = {}) {
  const calls = { findUnique: [] as unknown[] }

  const client = {
    passport: {
      findUnique: async (args: unknown) => {
        calls.findUnique.push(args)
        return opts.findUniqueResult ?? null
      },
    },
  }

  return { client: client as unknown as PassportClient, calls }
}

describe("resolvePassportIdByUserId", () => {
  it("resolves a linked account's passport id via the unique userId key", async () => {
    const { client, calls } = makeFakeClient({ findUniqueResult: { id: "passport_1" } })

    await expect(resolvePassportIdByUserId("user_1", client)).resolves.toBe("passport_1")
    expect(calls.findUnique).toHaveLength(1)
    expect(calls.findUnique[0]).toMatchObject({ where: { userId: "user_1" } })
  })

  it("returns null when no passport carries that userId (page falls through to notFound)", async () => {
    const { client } = makeFakeClient({ findUniqueResult: null })

    await expect(resolvePassportIdByUserId("user_unknown", client)).resolves.toBeNull()
  })

  it("short-circuits a blank id without querying", async () => {
    const { client, calls } = makeFakeClient()

    await expect(resolvePassportIdByUserId("", client)).resolves.toBeNull()
    expect(calls.findUnique).toHaveLength(0)
  })
})
