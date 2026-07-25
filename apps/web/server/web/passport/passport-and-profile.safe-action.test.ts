/**
 * bun test server/web/passport/passport-and-profile.safe-action.test.ts
 *
 * WL-P2-45 (SESSION_0700): verifies the combined `updatePassportAndProfile`
 * safe-action — auth gate, both halves persisting through ONE `$transaction`,
 * and the explicit partial-failure contract (either half throwing surfaces a
 * serverError; atomicity itself is Postgres's rollback, delegated to
 * `db.$transaction` — the stub proves the write path runs INSIDE the tx callback,
 * a real-rollback integration test needs a Postgres fixture, SOP §5d note).
 *
 * DB is stubbed (SOP §3/§5b — the `passport-avatar.safe-action.test.ts` sibling
 * pattern): gate + orchestration wiring is the unit under test, not SQL.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

// Stub env validation BEFORE any other import that pulls ~/env transitively.
mock.module("~/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost/test",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    NEXT_PUBLIC_SITE_EMAIL: "test@test.com",
    NODE_ENV: "test",
    VERCEL_ENV: "development",
  },
}))

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

type UpdateCall = { where: Record<string, unknown>; data: Record<string, unknown> }

const state = {
  txStarted: 0,
  passportUpdates: [] as UpdateCall[],
  profileUpdates: [] as UpdateCall[],
  failProfileUpdate: false,
}

// Stub the DB: `$transaction` runs the interactive callback against a tx stub that
// records both updates. Order + tx-membership are what we assert on.
mock.module("~/services/db", () => ({
  db: {
    $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
      state.txStarted++
      const tx = {
        passport: {
          update: async ({ where, data }: UpdateCall) => {
            state.passportUpdates.push({ where, data })
            return { id: "passport-1", userId: "combined-test-user", ...data }
          },
        },
        directoryProfile: {
          update: async ({ where, data }: UpdateCall) => {
            if (state.failProfileUpdate) throw new Error("PROFILE_UPDATE_FAILED")
            state.profileUpdates.push({ where, data })
            return { id: "profile-1", passportId: "passport-1", ...data }
          },
        },
      }
      // A real Prisma interactive tx rolls BOTH writes back when the callback throws;
      // the stub simply rethrows — the assertion boundary is "error propagates out of
      // the tx", the rollback itself is Postgres behavior.
      return cb(tx)
    },
  },
}))

const TEST_USER = { id: "combined-test-user", role: "user" }

beforeEach(() => {
  state.txStarted = 0
  state.passportUpdates.length = 0
  state.profileUpdates.length = 0
  state.failProfileUpdate = false
})

describe("updatePassportAndProfile — combined save (WL-P2-45)", () => {
  it("rejects when unauthenticated (no DB write)", async () => {
    const { updatePassportAndProfile } = await import("~/server/web/passport/actions")
    setTestSession(null)

    const result = await updatePassportAndProfile({ displayName: "X" })
    expect(result?.serverError).toBe("User not authenticated")
    expect(state.txStarted).toBe(0)
    expect(state.passportUpdates.length).toBe(0)
    expect(state.profileUpdates.length).toBe(0)
  })

  it("persists BOTH halves inside one transaction, routed to the right models", async () => {
    const { updatePassportAndProfile } = await import("~/server/web/passport/actions")
    setTestSession(TEST_USER)

    const result = await updatePassportAndProfile({
      displayName: "Rigan Machado",
      bio: "Coral belt.",
      slug: "rigan-machado",
      locationCity: "Los Angeles",
      showRanks: true,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(state.txStarted).toBe(1)

    // Passport half — keyed by the session user, carries ONLY identity fields.
    expect(state.passportUpdates.length).toBe(1)
    expect(state.passportUpdates[0]?.where).toEqual({ userId: TEST_USER.id })
    expect(state.passportUpdates[0]?.data).toEqual({
      displayName: "Rigan Machado",
      bio: "Coral belt.",
    })

    // Directory half — keyed by the passport resolved INSIDE the tx, carries ONLY
    // presentation fields.
    expect(state.profileUpdates.length).toBe(1)
    expect(state.profileUpdates[0]?.where).toEqual({ passportId: "passport-1" })
    expect(state.profileUpdates[0]?.data).toEqual({
      slug: "rigan-machado",
      locationCity: "Los Angeles",
      showRanks: true,
    })
  })

  it("partial failure: a directory-half throw surfaces as serverError (tx rethrows → rollback)", async () => {
    const { updatePassportAndProfile } = await import("~/server/web/passport/actions")
    setTestSession(TEST_USER)
    state.failProfileUpdate = true

    const result = await updatePassportAndProfile({
      displayName: "Half Saved?",
      slug: "half-saved",
    })

    // The error escapes the tx callback → safe-action serverError; in production the
    // interactive tx rolls the already-executed passport update back with it.
    expect(result?.serverError).toBe("PROFILE_UPDATE_FAILED")
    expect(state.txStarted).toBe(1)
    expect(state.profileUpdates.length).toBe(0)
  })

  it("rejects an invalid merged payload at the schema boundary (no tx)", async () => {
    const { updatePassportAndProfile } = await import("~/server/web/passport/actions")
    setTestSession(TEST_USER)

    const result = await updatePassportAndProfile({ avatarUrl: "not-a-url", slug: "ok-slug" })
    expect(result?.validationErrors).toBeDefined()
    expect(state.txStarted).toBe(0)
  })
})
