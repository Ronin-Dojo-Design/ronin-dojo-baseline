/**
 * SESSION_0701 — WL-P2-41(a): bind-failure rollback for the BBL claim-invite composer.
 *
 * Hermetic unit tests over a fake `lineagePendingClaim` delegate (the person-service.test.ts
 * pattern) — no real DB, no email seam. Asserts the compensating-write contract:
 * fresh bind → delete; pre-existing binding (idempotent re-send) → restore the exact prior
 * fields; rollback never throws (the send error must stay the surfaced failure); every write
 * keys on the NORMALIZED email (trim + lowercase, mirroring `bindPendingClaim`).
 *
 * Run: cd apps/web && bun run test server/admin/email/pending-claim-rollback.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  normalizePendingClaimEmail,
  type PendingClaimSnapshot,
  rollbackPendingClaimBind,
  snapshotPendingClaim,
} from "~/server/admin/email/pending-claim-rollback"
import { db } from "~/services/db"

type PendingClaimClient = typeof db

function makeFakeClient(
  opts: {
    findUniqueResult?: NonNullable<PendingClaimSnapshot> | null
    throwOnWrite?: boolean
  } = {},
) {
  const calls = {
    findUnique: [] as unknown[],
    updateMany: [] as unknown[],
    deleteMany: [] as unknown[],
  }

  const client = {
    lineagePendingClaim: {
      findUnique: async (args: unknown) => {
        calls.findUnique.push(args)
        return opts.findUniqueResult ?? null
      },
      updateMany: async (args: unknown) => {
        calls.updateMany.push(args)
        if (opts.throwOnWrite) throw new Error("boom: rollback write failed")
        return { count: 1 }
      },
      deleteMany: async (args: unknown) => {
        calls.deleteMany.push(args)
        if (opts.throwOnWrite) throw new Error("boom: rollback write failed")
        return { count: 1 }
      },
    },
  }

  return { client: client as unknown as PendingClaimClient, calls }
}

const NODE_ID = "node_1"

const priorRow = (): NonNullable<PendingClaimSnapshot> => ({
  brand: "BBL",
  expiresAt: new Date("2026-09-01T00:00:00Z"),
  consumedAt: null,
  consumedByUserId: null,
})

describe("normalizePendingClaimEmail", () => {
  it("trims and lowercases, mirroring bindPendingClaim's key", () => {
    expect(normalizePendingClaimEmail("  Rigan@Machado.COM  ")).toBe("rigan@machado.com")
  })
})

describe("snapshotPendingClaim", () => {
  it("returns null when no binding exists, keyed on the normalized email", async () => {
    const { client, calls } = makeFakeClient({ findUniqueResult: null })

    const snapshot = await snapshotPendingClaim("  Rigan@Machado.COM ", NODE_ID, client)

    expect(snapshot).toBeNull()
    expect(calls.findUnique).toHaveLength(1)
    expect(calls.findUnique[0]).toMatchObject({
      where: { email_nodeId: { email: "rigan@machado.com", nodeId: NODE_ID } },
    })
  })

  it("returns the prior row's restorable fields when a binding exists", async () => {
    const prior = priorRow()
    const { client } = makeFakeClient({ findUniqueResult: prior })

    const snapshot = await snapshotPendingClaim("rigan@machado.com", NODE_ID, client)

    expect(snapshot).toEqual(prior)
  })
})

describe("rollbackPendingClaimBind", () => {
  it("DELETES the row when no prior binding existed (fresh invite, failed send)", async () => {
    const { client, calls } = makeFakeClient()

    await rollbackPendingClaimBind(" Rigan@Machado.COM ", NODE_ID, null, client)

    expect(calls.deleteMany).toHaveLength(1)
    expect(calls.deleteMany[0]).toEqual({
      where: { email: "rigan@machado.com", nodeId: NODE_ID },
    })
    expect(calls.updateMany).toHaveLength(0)
  })

  it("RESTORES the exact prior fields when a binding predated the re-send", async () => {
    const prior = priorRow()
    const { client, calls } = makeFakeClient()

    await rollbackPendingClaimBind("rigan@machado.com", NODE_ID, prior, client)

    expect(calls.updateMany).toHaveLength(1)
    expect(calls.updateMany[0]).toEqual({
      where: { email: "rigan@machado.com", nodeId: NODE_ID },
      data: prior,
    })
    expect(calls.deleteMany).toHaveLength(0)
  })

  it("restores a consumed-marker snapshot verbatim (never re-arms what it didn't create)", async () => {
    const prior: NonNullable<PendingClaimSnapshot> = {
      ...priorRow(),
      consumedAt: new Date("2026-07-01T00:00:00Z"),
      consumedByUserId: "user_9",
    }
    const { client, calls } = makeFakeClient()

    await rollbackPendingClaimBind("rigan@machado.com", NODE_ID, prior, client)

    expect(calls.updateMany[0]).toEqual({
      where: { email: "rigan@machado.com", nodeId: NODE_ID },
      data: prior,
    })
  })

  it("never throws — a failed rollback must not mask the send error (delete path)", async () => {
    const { client, calls } = makeFakeClient({ throwOnWrite: true })

    await expect(
      rollbackPendingClaimBind("rigan@machado.com", NODE_ID, null, client),
    ).resolves.toBeUndefined()
    expect(calls.deleteMany).toHaveLength(1)
  })

  it("never throws — a failed rollback must not mask the send error (restore path)", async () => {
    const { client, calls } = makeFakeClient({ throwOnWrite: true })

    await expect(
      rollbackPendingClaimBind("rigan@machado.com", NODE_ID, priorRow(), client),
    ).resolves.toBeUndefined()
    expect(calls.updateMany).toHaveLength(1)
  })
})
