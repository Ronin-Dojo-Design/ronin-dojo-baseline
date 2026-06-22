/**
 * Reusable safe-action test environment.
 *
 * Installs the standard mocks documented in `docs/runbooks/sops/sop-test-writing.md` §3
 * (next/headers, next/cache, ~/lib/auth, next/server, ~/lib/rate-limiter) so that
 * test files can invoke `userActionClient` / `adminActionClient`-wrapped server
 * actions end-to-end instead of only the exported helper functions.
 *
 * Two seams beyond the bare §3 list, learned the hard way (SESSION_0412):
 *   - `~/lib/brand-context` is mocked as a WHOLE module, so it must re-export
 *     `getRequestOrigin` — an action importing it would otherwise get `undefined`
 *     and crash building absolute URLs. (The old request-brand resolver was
 *     removed in the single-brand collapse, ADR 0034 — nothing to mock.)
 *   - The `~/lib/rate-limiter` mock only covers Upstash `isRateLimited`. Some
 *     limiters are DB-COUNT seams instead (e.g. `checkPublicLeadRateLimit` counts
 *     `Lead` rows by `x-forwarded-for` IP in the last hour). So next/headers
 *     returns a UNIQUE per-install IP — zombie rows from crashed prior runs can't
 *     accumulate against a shared `"unknown"` IP and trip the limiter. Override
 *     with `installSafeActionMocks({ ip })` or `env.setIp(...)` for limiter tests.
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
// The REAL origin resolver (captured before the brand-context mock below replaces
// the module downstream) so the mocked getRequestOrigin matches production scheme
// logic exactly (http for local hosts, https otherwise) rather than a hardcode.
import { resolveRequestOrigin } from "~/lib/brand-context"

type TestSessionUser = {
  id: string
  role?: string | null
  lastActiveBrandId?: string | null
}

type SafeActionMockOptions = {
  brand?: string
  host?: string
  ip?: string
  initialSession?: TestSessionUser | null
  initialRateLimited?: boolean
}

type SafeActionEnv = {
  setBrand: (brand: string) => void
  setHost: (host: string) => void
  setIp: (ip: string) => void
  setRateLimited: (limited: boolean) => void
}

const sessionState: { current: TestSessionUser | null } = { current: null }
const brandState = { value: "BASELINE_MARTIAL_ARTS" }
const hostState = { value: "baseline.local" }
const ipState = { value: "" }
const rateLimitState = { limited: false }

// Monotonic across installs so each test file gets a distinct default IP even
// within the same millisecond (DB-count limiters key on this; see header note).
let installSeq = 0

export const setTestSession = (session: TestSessionUser | null) => {
  sessionState.current = session
}

export const installSafeActionMocks = (options: SafeActionMockOptions = {}): SafeActionEnv => {
  brandState.value = options.brand ?? "BASELINE_MARTIAL_ARTS"
  hostState.value = options.host ?? "baseline.local"
  ipState.value = options.ip ?? `test-${Date.now()}-${installSeq++}`
  sessionState.current = options.initialSession ?? null
  rateLimitState.limited = options.initialRateLimited ?? false

  mock.module("next/headers", () => ({
    headers: async () => ({
      get: (key: string) => {
        const k = key.toLowerCase()
        if (k === "x-brand") return brandState.value
        if (k === "host") return hostState.value
        // Unique per-install IP so DB-count rate limiters don't accumulate across runs.
        if (k === "x-forwarded-for" || k === "x-real-ip") return ipState.value
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
    // Whole-module mock → must provide getRequestOrigin (actions use it to build
    // absolute checkout/return URLs). Delegate to the real resolver against the
    // mocked host so the scheme is faithful (http for *.local, https for prod).
    // The old request-brand resolver is gone (single-brand collapse, ADR 0034) —
    // the safe-action / orpc pipelines now resolve `ctx.brand` to `Brand.BBL` directly.
    getRequestOrigin: async () => resolveRequestOrigin(new Headers({ host: hostState.value })),
    resolveRequestOrigin,
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
    setIp: (ip: string) => {
      ipState.value = ip
    },
    setRateLimited: (limited: boolean) => {
      rateLimitState.limited = limited
    },
  }
}
