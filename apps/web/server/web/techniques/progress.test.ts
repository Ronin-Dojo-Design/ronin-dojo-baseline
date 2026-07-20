// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

/**
 * Mocked-Prisma query-shape regression per the WL-P2-64 idiom (recorder captures the args
 * `db.techniqueProgress.*` is called with, no real DB). Proves: (1) the compound
 * `userId_techniqueId` key scopes every read/write to the CALLER's own row — ownership is
 * structural, not a caller-supplied filter; (2) the `lastDrilledAt` auto-stamp behavior described
 * in `progress.ts`'s JSDoc.
 */
describe("techniques/progress", () => {
  let capturedFindUniqueArgs: unknown
  let capturedUpsertArgs: unknown
  let capturedDeleteManyArgs: unknown

  beforeEach(() => {
    capturedFindUniqueArgs = undefined
    capturedUpsertArgs = undefined
    capturedDeleteManyArgs = undefined

    mock.module("~/services/db", () => ({
      db: {
        techniqueProgress: {
          findUnique: (args: unknown) => {
            capturedFindUniqueArgs = args
            return Promise.resolve({
              id: "progress_1",
              status: "LEARNING",
              lastDrilledAt: null,
              notes: null,
              updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            })
          },
          upsert: (args: unknown) => {
            capturedUpsertArgs = args
            return Promise.resolve({
              id: "progress_1",
              status: "DRILLING",
              lastDrilledAt: new Date("2026-01-02T00:00:00.000Z"),
              notes: "left side only",
              updatedAt: new Date("2026-01-02T00:00:00.000Z"),
            })
          },
          deleteMany: (args: unknown) => {
            capturedDeleteManyArgs = args
            return Promise.resolve({ count: 1 })
          },
        },
      },
    }))
  })

  it("findOwnTechniqueProgress scopes the read to the compound userId_techniqueId key", async () => {
    const { findOwnTechniqueProgress } = await import("./progress")

    const progress = await findOwnTechniqueProgress("user_1", "tech_1")

    expect(progress?.status).toBe("LEARNING")
    expect(capturedFindUniqueArgs).toEqual({
      where: { userId_techniqueId: { userId: "user_1", techniqueId: "tech_1" } },
      select: { id: true, status: true, lastDrilledAt: true, notes: true, updatedAt: true },
    })
  })

  it("upsertOwnTechniqueProgress auto-stamps lastDrilledAt=now() for a non-NOT_STARTED status", async () => {
    const { upsertOwnTechniqueProgress } = await import("./progress")

    await upsertOwnTechniqueProgress("user_1", "tech_1", { status: "DRILLING" })

    const args = capturedUpsertArgs as any
    expect(args.where).toEqual({ userId_techniqueId: { userId: "user_1", techniqueId: "tech_1" } })
    expect(args.create).toMatchObject({
      userId: "user_1",
      techniqueId: "tech_1",
      status: "DRILLING",
    })
    expect(args.update).toMatchObject({ status: "DRILLING" })
    // Auto-stamped, not left undefined.
    expect(args.create.lastDrilledAt).toBeInstanceOf(Date)
    expect(args.update.lastDrilledAt).toBeInstanceOf(Date)
  })

  it("upsertOwnTechniqueProgress clears lastDrilledAt when reverting to NOT_STARTED", async () => {
    const { upsertOwnTechniqueProgress } = await import("./progress")

    await upsertOwnTechniqueProgress("user_1", "tech_1", { status: "NOT_STARTED" })

    const args = capturedUpsertArgs as any
    expect(args.create.lastDrilledAt).toBeNull()
    expect(args.update.lastDrilledAt).toBeNull()
  })

  it("upsertOwnTechniqueProgress respects an explicit lastDrilledAt override (including null)", async () => {
    const { upsertOwnTechniqueProgress } = await import("./progress")
    const explicit = new Date("2020-01-01T00:00:00.000Z")

    await upsertOwnTechniqueProgress("user_1", "tech_1", {
      status: "SPARRING",
      lastDrilledAt: explicit,
    })

    expect((capturedUpsertArgs as any).update.lastDrilledAt).toEqual(explicit)

    await upsertOwnTechniqueProgress("user_1", "tech_1", {
      status: "SPARRING",
      lastDrilledAt: null,
    })

    expect((capturedUpsertArgs as any).update.lastDrilledAt).toBeNull()
  })

  it("upsertOwnTechniqueProgress leaves notes untouched on update when omitted", async () => {
    const { upsertOwnTechniqueProgress } = await import("./progress")

    await upsertOwnTechniqueProgress("user_1", "tech_1", { status: "MASTERED" })

    // Prisma treats an `undefined` value as "don't touch this column" — the key may be present
    // with an undefined value, but it must never coerce to `null` (that WOULD wipe existing notes).
    expect((capturedUpsertArgs as any).update.notes).toBeUndefined()
  })

  it("clearOwnTechniqueProgress deletes only the caller's own row", async () => {
    const { clearOwnTechniqueProgress } = await import("./progress")

    await clearOwnTechniqueProgress("user_1", "tech_1")

    expect(capturedDeleteManyArgs).toEqual({ where: { userId: "user_1", techniqueId: "tech_1" } })
  })
})
