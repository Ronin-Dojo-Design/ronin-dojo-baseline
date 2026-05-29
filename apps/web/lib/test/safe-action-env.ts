/**
 * Reusable safe-action test environment.
 *
 * Installs the standard mocks documented in `docs/runbooks/sops/sop-test-writing.md` §3
 * (next/headers, next/cache, ~/lib/auth, next/server, ~/lib/rate-limiter) so that
 * test files can invoke `userActionClient` / `adminActionClient`-wrapped server
 * actions end-to-end instead of only the exported helper functions.
 *
 * Usage (must run BEFORE any import of an action module):
 *
 *   import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"
 *
 *   const env = installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })
 *
 *   // ...inside a test:
 *   setTestSession({ id: "user-1", role: "admin" })
 *   const result = await reviewLineageClaim({ ... })
 *   expect(result?.serverError).toBeUndefined()
 *
 *   // ...to simulate unauthenticated:
 *   setTestSession(null)
 *
 * The harness intentionally does not create DB fixtures; tests own those.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { mock } from "bun:test"

type TestSessionUser = {
  id: string
  role?: string | null
  lastActiveBrandId?: string | null
}

type SafeActionMockOptions = {
  brand?: string
  host?: string
  initialSession?: TestSessionUser | null
  initialRateLimited?: boolean
}

type SafeActionEnv = {
  setBrand: (brand: string) => void
  setHost: (host: string) => void
  setRateLimited: (limited: boolean) => void
}

const sessionState: { current: TestSessionUser | null } = { current: null }
const brandState = { value: "BASELINE_MARTIAL_ARTS" }
const hostState = { value: "baseline.local" }
const rateLimitState = { limited: false }

export const setTestSession = (session: TestSessionUser | null) => {
  sessionState.current = session
}

export const installSafeActionMocks = (options: SafeActionMockOptions = {}): SafeActionEnv => {
  brandState.value = options.brand ?? "BASELINE_MARTIAL_ARTS"
  hostState.value = options.host ?? "baseline.local"
  sessionState.current = options.initialSession ?? null
  rateLimitState.limited = options.initialRateLimited ?? false

  mock.module("next/headers", () => ({
    headers: async () => ({
      get: (key: string) => {
        const k = key.toLowerCase()
        if (k === "x-brand") return brandState.value
        if (k === "host") return hostState.value
        return null
      },
    }),
  }))

  mock.module("next/cache", () => ({
    revalidatePath: () => {},
    revalidateTag: () => {},
    updateTag: () => {},
    cacheLife: () => {},
    cacheTag: () => {},
  }))

  mock.module("~/lib/auth", () => ({
    getServerSession: async () => {
      const user = sessionState.current
      if (!user) return null
      return {
        user: {
          id: user.id,
          role: user.role ?? null,
          lastActiveBrandId: user.lastActiveBrandId ?? null,
        },
        session: { id: "safe-action-test-session" },
      }
    },
    auth: {},
  }))

  mock.module("~/lib/brand-context", () => ({
    getRequestBrand: async () => brandState.value,
  }))

  mock.module("next/server", () => ({
    after: (fn: () => void | Promise<void>) => {
      void Promise.resolve().then(() => fn())
    },
  }))

  mock.module("~/lib/rate-limiter", () => ({
    isRateLimited: async () => rateLimitState.limited,
  }))

  return {
    setBrand: (brand: string) => {
      brandState.value = brand
    },
    setHost: (host: string) => {
      hostState.value = host
    },
    setRateLimited: (limited: boolean) => {
      rateLimitState.limited = limited
    },
  }
}
