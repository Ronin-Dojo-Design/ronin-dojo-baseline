---
title: "SOP — Test Writing Patterns"
slug: sop-test-writing
type: runbook
status: active
created: 2026-05-12
updated: 2026-05-27
last_agent: codex-session-0268
pairs_with:
  - docs/runbooks/sop-data-and-wiring-flows.md
  - docs/protocols/cody-preflight.md
  - docs/protocols/code-guardrails.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0249.md
  - docs/sprints/SESSION_0251.md
---

# SOP — Test Writing Patterns

## Purpose

Document the repeatable test patterns in this repo so:

- agents and humans write tests that match existing conventions
- mock surfaces stay minimal and consistent
- fixture setup/teardown patterns are copy-paste reliable
- new test files don't reinvent the wheel

---

## 1. Test taxonomy

```text
Test type
  |
  +--> Action test (.test.ts)
  |    +--> Drives server actions via safe-action client
  |    +--> Mocks: next/headers, next/cache, ~/lib/auth, next/server
  |    +--> Real: DB, Prisma, brand context, action middleware
  |    +--> Example: lead/actions.test.ts, schedule/actions.test.ts
  |
  +--> Query test (.test.ts / .integration.test.ts)
  |    +--> Calls query functions directly
  |    +--> Mocks: next/cache (cacheLife, cacheTag)
  |    +--> Real: DB, Prisma
  |    +--> Example: disciplines/queries.integration.test.ts
  |
  +--> Brand isolation test (.brand-isolation.test.ts)
  |    +--> Proves cross-brand data never leaks
  |    +--> Two brands, same slug pattern, assert no cross-read
  |    +--> Example: tournaments/queries.brand-isolation.test.ts
  |
  +--> Concurrency test (.concurrency.test.ts)
  |    +--> Fires parallel calls, asserts no duplicates
  |    +--> Uses unique constraint + catch/converge pattern
  |    +--> Example: materialize.concurrency.test.ts, register.concurrency.test.ts
  |
  +--> Smoke script (scripts/smoke-*.ts)
  |    +--> Pure Prisma — no action client, no mocks
  |    +--> Direct DB operations mirroring the action path
  |    +--> Own PrismaClient instance (not ~/services/db)
  |    +--> Example: smoke-attendance.ts, smoke-schedule.ts
  |
  +--> Component test (.test.tsx)
  |    +--> React component render tests
  |    +--> Example: registration-notice.test.tsx
  |
  +--> E2E test (e2e/*.spec.ts)
       +--> Playwright browser tests
       +--> Example: e2e/smoke.spec.ts, e2e/tournaments/register.spec.ts
```

```mermaid
flowchart TD
    T[Test Types] --> AT[Action test\n.test.ts]
    T --> QT[Query test\n.integration.test.ts]
    T --> BI[Brand isolation\n.brand-isolation.test.ts]
    T --> CT[Concurrency\n.concurrency.test.ts]
    T --> SM[Smoke script\nscripts/smoke-*.ts]
    T --> COMP[Component test\n.test.tsx]
    T --> E2E[E2E test\ne2e/*.spec.ts]
    AT -->|mocks| M1[next/headers\nnext/cache\n~/lib/auth\nnext/server]
    QT -->|mocks| M2[next/cache only]
    BI -->|mocks| M2
    SM -->|mocks| M3[none — own PrismaClient]
```

---

## 2. Test runtime and runner

- **Runtime:** Bun (`bun:test`)
- **Run single file:** `cd apps/web && bun test <path>`
- **Run all (non-e2e):** `cd apps/web && bun test --parallel --path-ignore-patterns='e2e/**'`
- **Package script:** `bun run test` (defined in `apps/web/package.json`)
- **No `@types/bun`** — use `// @ts-expect-error` on bun:test imports
- **Real Postgres** — all tests hit `ronindojo_dev`, not mocks or SQLite

### ⚠ `--parallel` is mandatory for the full suite

Bun's default test runner shares the module registry across files in the same process. When `mock.module()` is used (as in all safe-action tests), the mocks leak into other test files' module resolution — causing `db.someModel` to be `undefined` and ~63 false failures.

**Always use `--parallel`** when running the full suite. This spawns separate worker processes per test file, providing true process isolation. `--parallel` implies `--isolate`, so no isolation is lost. Individual files (`bun test <path>`) work fine without it.

> **History:** Prior to SESSION_0232, the SOP recommended `--isolate`. That flag isolates globals but shares the module registry, which is insufficient when `mock.module()` is used. `--parallel` was adopted in SESSION_0232 after diagnosing 63 false failures caused by mock cross-contamination.

```bash
# ✅ Correct — full suite
bun test --parallel --path-ignore-patterns='e2e/**'

# ✅ Correct — single file (isolation not needed)
bun test server/web/disciplines/queries.integration.test.ts

# ❌ Wrong — full suite without --parallel will show ~63 false failures
bun test --path-ignore-patterns='e2e/**'

# ❌ Wrong — --isolate alone does not prevent mock.module() leakage
bun test --isolate --path-ignore-patterns='e2e/**'
```

---

## 3. Mock surface — the standard seams

Every action test mocks the same four modules. Mocks MUST be installed **before** importing action modules.

```text
mock registration order
  |
  v
1. mock.module("next/headers")     ← brand context + host
  |
  v
2. mock.module("next/cache")       ← revalidatePath, revalidateTag, cacheLife, cacheTag
  |
  v
3. mock.module("~/lib/auth")       ← getServerSession → fake session
  |
  v
4. mock.module("next/server")      ← after() runs inline (optional — only if action uses after())
  |
  v
5. mock.module("~/lib/rate-limiter") ← isRateLimited toggle (optional — only if action uses it)
  |
  v
import { myAction } from "~/server/..." ← REAL import, after all mocks
```

```mermaid
flowchart TD
    M1[mock next/headers\nx-brand + host] --> M2[mock next/cache\nrevalidatePath etc.]
    M2 --> M3[mock ~/lib/auth\ngetServerSession]
    M3 --> M4[mock next/server\nafter → inline]
    M4 --> M5[mock ~/lib/rate-limiter\noptional]
    M5 --> IMP[import real actions\n+ ~/services/db]
```

### 3a. next/headers mock (brand context)

```typescript
const requestBrand = "BASELINE_MARTIAL_ARTS"

mock.module("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      const k = key.toLowerCase()
      if (k === "x-brand") return requestBrand
      if (k === "host") return "baseline.local"
      return null
    },
  }),
}))
```

### 3b. next/cache mock (revalidation no-ops)

```typescript
mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
  cacheLife: () => {},
  cacheTag: () => {},
}))
```

### 3c. ~/lib/auth mock (session)

Use a **mutable state object** so each test can change the user without re-mocking:

```typescript
const sessionUserState = { id: "", role: null as string | null }

mock.module("~/lib/auth", () => ({
  getServerSession: async () => ({
    user: {
      id: sessionUserState.id,
      role: sessionUserState.role,
      lastActiveBrandId: null,
    },
    session: { id: "test-session" },
  }),
  auth: {},
}))
```

For **admin action tests**, set `role: "admin"`:

```typescript
sessionUserState.role = "admin"
```

### 3d. next/server mock (after() inline execution)

Only needed when the action under test uses `after()` from `next/server`:

```typescript
mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))
```

This runs the `after()` callback inline so tests can observe side effects (audit logs, revalidation).

### 3e. ~/lib/rate-limiter mock (optional)

```typescript
const rateLimitState = { limited: false }

mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
}))
```

---

## 4. Fixture strategy — setup/teardown isolation

```text
beforeAll
  |
  v
Create timestamped fixtures
  +--> User(s) with tag("owner"), tag("student")
  +--> Organization with tag("org")
  +--> Discipline with tag("disc")
  +--> Membership(s)
  +--> Domain-specific fixtures (programs, roles, etc.)
  |
  v
Set sessionUserState.id = owner.id
  |
  v
(tests run)
  |
  v
afterAll
  |
  v
Two-phase cleanup
  +--> Phase 1: Delete this run's fixtures by ID (fast, no false positives)
  +--> Phase 2: Sweep zombie rows from crashed prior runs (tag-based)
```

```mermaid
flowchart TD
    BA[beforeAll] --> FX[Create timestamped fixtures\nuser + org + discipline + membership]
    FX --> SET[Set sessionUserState.id]
    SET --> TESTS[Tests run]
    TESTS --> AA[afterAll]
    AA --> P1[Phase 1: Delete by ID\nthis run's fixtures]
    P1 --> P2[Phase 2: Sweep zombies\ntag-based cleanup]
```

### Tagging convention

```typescript
const TS = Date.now()
const TAG_PREFIX = "session-0150-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`
```

All fixture names/emails/slugs use `tag()` so they are unique across parallel runs and identifiable for cleanup.

### Cascade-aware teardown order

Delete in reverse dependency order:

```text
1. AuditLog (no FK cascade from User)
2. MembershipRoleAssignment
3. Membership
4. OrganizationDiscipline
5. Program (if created)
6. Organization
7. User
8. Discipline
9. Role (if created — check isSystem)
```

---

## 5. Action test pattern (admin actions)

### Wiring flow

```text
adminActionClient middleware chain
  |
  v
actionClient.use → injects db + revalidate
  |
  v
userActionClient.use → checks getServerSession → injects user
  |
  v
adminActionClient.use → checks user.role === "admin" → injects brand
  |
  v
.inputSchema(schema).action(handler)
```

```mermaid
flowchart TD
    AC[actionClient] -->|use| DB[inject db + revalidate]
    DB --> UAC[userActionClient]
    UAC -->|use| AUTH[getServerSession\ninject user]
    AUTH --> AAC[adminActionClient]
    AAC -->|use| ADMIN[check role === admin\ninject brand]
    ADMIN --> SCHEMA[.inputSchema → .action]
    SCHEMA --> HANDLER[handler fn\nparsedInput + ctx]
```

### What the test proves

| Gate | Proof |
| --- | --- |
| Auth required | Mock returns valid session → action succeeds |
| Admin role required | `sessionUserState.role = "admin"` |
| Brand scoping | Mock returns `x-brand` → action uses `ctx.brand` |
| Input validation | Zod schema validates `parsedInput` |
| DB write | Assert row exists in Postgres after action call |
| Audit trail | Assert `AuditLog` row created with correct `entityType` + `action` |
| Revalidation | No-op mock — not asserted, just not crashing |

### Test skeleton

```typescript
// @ts-expect-error — bun:test
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// --- mocks (before imports) ---
const sessionUserState = { id: "", role: "admin" as string | null }
const requestBrand = "BASELINE_MARTIAL_ARTS"

mock.module("next/headers", () => ({ /* ... */ }))
mock.module("next/cache", () => ({ /* ... */ }))
mock.module("~/lib/auth", () => ({ /* ... role: sessionUserState.role ... */ }))
mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => { void Promise.resolve().then(() => fn()) },
}))

// --- real imports ---
import { db } from "~/services/db"
import { myAdminAction } from "~/server/admin/foo/actions"

// --- fixtures ---
const TS = Date.now()
const tag = (name: string) => `admin-test-${TS}-${name}`
let fx: { userId: string; /* ... */ }

beforeAll(async () => {
  const user = await db.user.create({ data: { name: tag("admin"), email: `${tag("admin")}@test.local` } })
  // ... create org, discipline, membership, etc.
  sessionUserState.id = user.id
  fx = { userId: user.id /* ... */ }
})

afterAll(async () => {
  // Two-phase cleanup
  if (fx) {
    await db.auditLog.deleteMany({ where: { userId: fx.userId } })
    // ... cascade-aware deletes
  }
})

describe("myAdminAction", () => {
  it("happy path", async () => {
    const result = await myAdminAction({ /* input */ })
    expect(result?.data).toBeDefined()
    // assert DB state
  })

  it("invalid input throws", async () => {
    const result = await myAdminAction({ /* bad input */ })
    expect(result?.serverError).toBeDefined()
  })
})
```

---

## 5b. Wrapped action invocation pattern (SESSION_0187)

Helper-level tests (§5) prove the business logic inside an action's exported helper. They do not prove the `next-safe-action` middleware chain — auth gate, role gate, brand injection, error normalization, revalidation. For that, invoke the wrapped export directly through `~/lib/test/safe-action-env`.

### When to use which

| Goal | Test type | Example |
| --- | --- | --- |
| Prove transaction/SQL semantics, edge cases, branching, fixture coverage | Helper-level (§5) | `claim-review-actions.test.ts` calls `applyLineageClaimReview` |
| Prove auth/admin gate, brand, schema validation, serverError shape | Wrapped action (this section) | `claim-review-actions.safe-action.test.ts` calls `reviewLineageClaim` |
| Both | Pair them — one file each, disjoint cases | SESSION_0187 ships the wrapped pair alongside SESSION_0186 helper tests |

Do not duplicate helper-level coverage in the wrapped-action file. Keep it to the gates the wrapper enforces: typically 2–3 cases (unauthenticated, unauthorized, happy path).

### Harness

`apps/web/lib/test/safe-action-env.ts` installs the standard mock seams once via `installSafeActionMocks({ brand })`. Tests mutate auth state per case with `setTestSession({ id, role })`.

### Skeleton

```typescript
// @ts-expect-error — bun:test
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

import { db } from "~/services/db"
import { reviewLineageClaim } from "~/server/admin/lineage/claim-review-actions"

// ...fixtures...

describe("reviewLineageClaim (wrapped)", () => {
  it("returns serverError when unauthenticated", async () => {
    setTestSession(null)
    const result = await reviewLineageClaim({ claimId, decision: "APPROVED" })
    expect(result?.serverError).toBe("User not authenticated")
  })

  it("returns serverError when user lacks admin role", async () => {
    setTestSession({ id: claimantId, role: "user" })
    const result = await reviewLineageClaim({ claimId, decision: "APPROVED" })
    expect(result?.serverError).toBe("User not authorized")
  })

  it("approves with admin role and brand injection", async () => {
    setTestSession({ id: adminId, role: "admin" })
    const result = await reviewLineageClaim({ claimId, decision: "APPROVED", reviewerNote: "ok" })
    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.status).toBe("APPROVED")
  })
})
```

### Rules

- `next-safe-action` returns `{ data, serverError, validationErrors }` — it never throws to the caller. Assert on `result?.serverError`, never `expect(...).toThrow`.
- Error strings come from `~/lib/safe-actions.ts`: `"User not authenticated"` (line 65), `"User not authorized"` (line 76). If those change, the tests change too.
- Use cuid-shaped ids for any schema field declared `z.string().cuid()`. Either let Prisma's `@default(cuid())` fill the id, or use `createId()` from `@paralleldrive/cuid2`. Do not pass `tag(...)` prefix strings.
- Naming: `<feature>-actions.safe-action.test.ts` next to the helper-level `<feature>-actions.test.ts`. Both files can run together; use distinct fixture prefixes (e.g., `session-NNNN-<TS>-`) so the suites don't collide.

---

## 6. Query test pattern

Simpler — no action client, just mock `next/cache` and call the query directly.

```typescript
// @ts-expect-error — bun:test
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

import { db } from "~/services/db"
import { findFoo } from "~/server/admin/foo/queries"

// fixtures + cleanup same pattern as above

describe("findFoo", () => {
  it("returns expected shape", async () => {
    const result = await findFoo(someId)
    expect(result).not.toBeNull()
    expect(result?.name).toBe(expected)
  })
})
```

---

## 7. Brand isolation test pattern

```text
Setup
  +--> Create entity with Brand A
  +--> Create entity with Brand B (same slug/name pattern)
  |
  v
Query with Brand A filter
  |
  v
Assert: only Brand A entity returned, never Brand B
```

```mermaid
flowchart TD
    S[Setup] --> A[Create entity\nBrand A]
    S --> B[Create entity\nBrand B\nsame slug]
    A & B --> Q[Query with Brand A]
    Q --> ASSERT[Assert: only Brand A\nnever Brand B]
```

---

## 8. Concurrency test pattern

```text
Setup shared fixture
  |
  v
Fire N parallel calls (Promise.all)
  |
  v
Assert:
  +--> Total row count matches single-call expected count (no duplicates)
  +--> No duplicate unique key rows
  +--> No exceptions surface to callers
```

```mermaid
flowchart TD
    FX[Setup fixture] --> PAR[Promise.all\nN parallel calls]
    PAR --> A1[Assert: correct row count]
    PAR --> A2[Assert: no duplicate keys]
    PAR --> A3[Assert: no uncaught exceptions]
```

---

## 9. Smoke script pattern

Smoke scripts are standalone — they create their own `PrismaClient`, don't use mocks, and clean up after themselves.

```text
Own PrismaClient (not ~/services/db)
  |
  v
Create fixtures with timestamp tags
  |
  v
Run the scenario (direct DB ops mirroring action logic)
  |
  v
Assert expected state
  |
  v
Cleanup all fixtures
  |
  v
Exit 0 (success) or throw (failure)
```

Run: `cd apps/web && bun scripts/smoke-foo.ts`

---

## 10. Audit trail test pattern

When an action writes to `AuditLog`, verify the row:

```typescript
it("creates audit log on transition", async () => {
  await myAction({ id: entityId, toStatus: "ACTIVE" })

  // Allow after() callback to settle
  await new Promise(r => setTimeout(r, 50))

  const log = await db.auditLog.findFirst({
    where: {
      entityType: "Membership",
      entityId: entityId,
      action: "STATUS_TRANSITION",
    },
    orderBy: { createdAt: "desc" },
  })

  expect(log).not.toBeNull()
  expect(log?.before).toEqual({ status: "PENDING" })
  expect(log?.after).toEqual({ status: "ACTIVE" })
  expect(log?.userId).toBe(fx.userId)
  expect(log?.brand).toBe(requestBrand)
})
```

---

## 11. File naming conventions

| Pattern | Convention | Example |
| --- | --- | --- |
| Action test | `server/<domain>/actions.test.ts` | `server/web/lead/actions.test.ts` |
| Query test | `server/<domain>/queries.test.ts` | `server/admin/posts/queries.test.ts` |
| Integration | `*.integration.test.ts` | `weigh-in.integration.test.ts` |
| Brand isolation | `*.brand-isolation.test.ts` | `queries.brand-isolation.test.ts` |
| Concurrency | `*.concurrency.test.ts` | `materialize.concurrency.test.ts` |
| Smoke test | `*.smoke.test.ts` | `results.smoke.test.ts` |
| Smoke script | `scripts/smoke-*.ts` | `scripts/smoke-attendance.ts` |
| Component | `*.test.tsx` | `registration-notice.test.tsx` |
| E2E | `e2e/**/*.spec.ts` | `e2e/tournaments/register.spec.ts` |

---

## 12. Existing test inventory

### Action tests (bun:test, real DB, mocked seams)

- `server/web/lead/actions.test.ts` — lead lifecycle + enrollment + family + waiver gates
- `server/web/schedule/actions.test.ts` — schedule CRUD + audit log proof
- `server/web/attendance/actions.test.ts` — attendance/check-in gates
- `server/web/billing/actions.test.ts` — billing action gates
- `server/web/billing/checkout-actions.test.ts` — Stripe checkout actions
- `app/api/stripe/webhooks/route.test.ts` — Stripe webhook handler
- `app/api/auth/dev-login/route.test.ts` — dev login route

### Wrapped safe-action tests (bun:test, real DB, harness via `lib/test/safe-action-env.ts`)

- `server/admin/lineage/claim-review-actions.safe-action.test.ts` — `adminActionClient` chain: unauth, non-admin, admin approve
- `server/web/lineage/node-profile-actions.safe-action.test.ts` — `userActionClient` chain: unauth, authorized NODE_EDITOR
- `server/web/enrollment/actions.safe-action.test.ts` — `userActionClient` chain: unauth, rate-limited, authorized enroll
- `server/web/schedule/actions.safe-action.test.ts` — `userActionClient` chain: unauth, Zod validationErrors, authorized create + audit
- `server/web/attendance/actions.safe-action.test.ts` — `userActionClient` chain: unauth, Zod validationErrors, authorized check-in + audit
- `server/web/billing/actions.safe-action.test.ts` — `userActionClient` chain: unauth, Zod validationErrors, no-customer serverError, authorized Stripe portal redirect
- `server/web/course-enrollment/actions.safe-action.test.ts` — `userActionClient` chain: enroll (membership + entitlement OR gate), unenroll, markComplete, markIncomplete

### Query / integration tests

- `server/web/disciplines/queries.integration.test.ts` — discipline query integration
- `server/web/entitlements/queries.integration.test.ts` — entitlement query integration
- `server/admin/tournaments/weigh-in.integration.test.ts` — weigh-in lifecycle
- `server/admin/posts/queries.test.ts` — post queries
- `server/admin/programs/queries.test.ts` — program queries
- `server/admin/billing/monitoring/queries.test.ts` — billing monitoring
- `server/admin/storage/monitoring/queries.test.ts` — storage monitoring
- `server/web/techniques/queries.test.ts` — technique queries
- `server/web/course-enrollment/queries.integration.test.ts` — enrollment state, progress, stats, entitlement OR gate

### Specialized tests

- `server/web/tournaments/queries.brand-isolation.test.ts` — cross-brand isolation proof
- `server/web/schedule/materialize.concurrency.test.ts` — schedule materialization concurrency
- `server/web/tournaments/register.concurrency.test.ts` — registration concurrency
- `server/web/tournaments/results.smoke.test.ts` — tournament results smoke
- `server/web/billing/drift-audit.test.ts` — billing drift audit
- `server/admin/tournaments/bracket-seeding.test.ts` — bracket seeding
- `server/admin/tournaments/upsert-division.test.ts` — division upsert
- `server/web/schedule/session-generator.test.ts` — session generation logic
- `components/web/tournaments/registration-notice.test.tsx` — component render
- `lib/public-media-url.test.ts` — utility function

### Smoke scripts (standalone, own PrismaClient)

- `scripts/smoke-attendance.ts`
- `scripts/smoke-entitlements.ts`
- `scripts/smoke-lead-lifecycle.ts`
- `scripts/smoke-org.ts`
- `scripts/smoke-passport.ts`
- `scripts/smoke-program.ts`
- `scripts/smoke-schedule.ts`
- `scripts/smoke-school-ops-extended.ts`

### E2E (Playwright)

- `e2e/smoke.spec.ts`
- `e2e/admin/bracket.spec.ts`
- `e2e/admin/scoring.spec.ts`
- `e2e/admin/tournament-list.spec.ts`
- `e2e/lineage/authenticated-lifecycle.spec.ts`
- `e2e/lineage/public-visibility.spec.ts`
- `e2e/tournaments/list.spec.ts`
- `e2e/tournaments/register.spec.ts`
- `e2e/tournaments/results.spec.ts`

### E2E Prisma fixture bridge

Playwright setup/spec files run in Node, while the generated Prisma client in this repo runs cleanly under Bun. Do not import `apps/web/.generated/prisma/client` directly from Playwright's Node-side files. Keep Prisma imports inside Bun-invoked helper files, and call them from Node-side Playwright helpers with `execFileSync("bun", [...])`.

Current bridge files:

- `e2e/helpers/auth.ts` — Node-side Playwright auth helper; loads `apps/web/.env`, shells DB user/session setup through `auth-db.ts`, then sets the Better Auth session cookie.
- `e2e/helpers/auth-db.ts` — Bun-only Better Auth user/session fixture DB work.
- `e2e/helpers/seed-lineage-lifecycle-db.ts` — Bun-only authenticated lineage lifecycle fixture DB work.
- `e2e/helpers/seed-lineage-lifecycle.ts` — Node-side Playwright wrapper that shells into `seed-lineage-lifecycle-db.ts`.
- `e2e/helpers/seed-tournament-cli.ts` — wraps the existing tournament Prisma fixture for global setup/teardown.
- `e2e/helpers/seed-lineage-db.ts` — Bun-only lineage fixture DB work.
- `e2e/helpers/seed-lineage.ts` — Node-side Playwright wrapper that shells into `seed-lineage-db.ts`.

---

## 13. What not to do

- Do not mock Prisma or the database — use real Postgres
- Do not import action modules before installing mocks
- Do not use `@types/bun` — use `// @ts-expect-error` instead
- Do not hardcode fixture IDs — use `tag()` with timestamps
- Do not skip cleanup — zombie rows break future runs
- Do not assert on revalidation calls — they're no-ops; just don't crash
- Do not use SQLite or PGlite for tests — always real Postgres
- **Do not use `page.waitForLoadState("networkidle")` in Playwright specs** — see §14 for the deterministic-locator pattern that replaces it

---

## 14. Playwright locator patterns (SESSION_0267)

### Rule

**`page.waitForLoadState("networkidle")` is banned in new Playwright specs.** Reviewers should reject any PR that adds it. Existing call sites are a cleanup backlog (see §14e).

### Why

`networkidle` waits for the network request stream to be quiet for 500ms. Under any meaningful background traffic — Next.js dev-server compilation, sibling Playwright specs streaming requests on a shared `bun run dev`, image lazy-loading, telemetry pings — that gate never resolves and times out at 30s. The full chromium suite in this repo runs 30+ specs that all share the same dev server, so background traffic is the norm, not the exception.

This is the root cause of the flake-under-load pattern documented across SESSION_0260, SESSION_0262, SESSION_0265, SESSION_0266, and SESSION_0267.

### Pattern — deterministic post-hydration element

Anchor on the first stable element that the page renders after hydration. Use `getByRole(...)` with an explicit role + accessible name, and pass `timeout: 30_000` (20s is marginal under full-suite load).

```typescript
// ✅ Correct — deterministic locator with explicit timeout
await page.goto(`/admin/tournaments/${id}/brackets/${bid}`)
await expect(
  page.getByRole("heading", { name: /^Bracket:/i, level: 2 })
).toBeVisible({ timeout: 30_000 })

// ❌ Wrong — networkidle waits for traffic to quiet (never happens under load)
await page.goto(`/admin/tournaments/${id}/brackets/${bid}`)
await page.waitForLoadState("networkidle")
await expect(page.getByText(/bracket:/i)).toBeVisible()
```

For redirect tests (no DOM element pre-redirect), anchor on a post-redirect element with a longer timeout to cover JIT-compile delay on dynamic routes:

```typescript
// ✅ Correct — URL match + DOM-settled assertion
await page.goto(`/lineage/${slug}/edit/${nodeId}`)
await expect(page).toHaveURL(
  url => url.pathname === "/auth/login",
  { timeout: 40_000 },  // dynamic-route JIT slack
)
await expect(
  page.getByRole("heading", { name: /sign in/i, level: 3 })
).toBeVisible({ timeout: 30_000 })
```

### Picking the anchor

Walk the page and ask: **what is the first element that exists, with a stable accessible name, the moment hydration completes?**

- A page-level `<h1>` or `<h2>` heading is almost always the right answer.
- Form labels and submit buttons are good fallbacks if the page has no heading.
- Avoid `getByText(...)` — text content is shared across hidden/visible nodes (loading states, screen-reader-only spans) and rarely has a stable container guarantee.
- Use `level: N` in heading locators to disambiguate.

### Cross-engine considerations

For firefox: Radix Select triggers don't reliably propagate synthetic `.click()` on placeholder text. Use `getByRole("combobox", { name: ... }).focus().press(" ")` to activate via keyboard (SESSION_0266 evidence).

For firefox serial-suite mode: cookies persist across tests in the same browser context. If a downstream test mutates auth state, an upstream test's UI bindings may bind against polluted React tree. Reset between tests:

```typescript
test("downstream serial test", async ({ page }) => {
  await page.context().clearCookies()
  await page.context().clearPermissions()
  await createAuthenticatedSession(page, fixture.userId)
  // ...
})
```

SESSION_0267_TASK_02 closed SESSION_0266_FINDING_02 with this pattern.

### Timeout policy

| Anchor type | Recommended timeout | Rationale |
| --- | --- | --- |
| Static-route heading visibility | `20_000` | Pre-compiled route; 20s covers cold-page-load + hydration. |
| Dynamic-route heading visibility | `30_000` | `app/.../[slug]/page.tsx` may need JIT-compile under load. |
| Redirect URL match (dynamic route) | `40_000` | URL-only assertion + middleware + JIT-compile chain. |
| Drag/dnd-kit assertions | per-spec | dnd-kit needs the SESSION_0265 pointer recipe; timeouts are tuned per drag scenario. |

### Audit recipe (go-forward enforcement)

For every PR that touches `apps/web/e2e/`:

```bash
git diff --name-only origin/main...HEAD -- 'apps/web/e2e/**/*.spec.ts' \
  | xargs -I{} grep -Hn 'waitForLoadState("networkidle")' {} \
  | grep -v '^$'
```

If this returns any new lines (not just pre-existing), block the PR until the offender migrates to a deterministic locator.

### Known offender backlog (cleanup queue)

As of SESSION_0267, the following spec files contain `waitForLoadState("networkidle")` calls that flake under full-suite load. Each is queued for cleanup in a future session; new authors should NOT add to this list.

| File | Approx call count | Notes |
| --- | --- | --- |
| `e2e/admin/bracket.spec.ts` | 2 | Bracket flow; partial cleanup landed SESSION_0266/0267 |
| `e2e/admin/data-subject-request-triage.spec.ts` | 5 | DSR triage workflow; needs per-form anchor picks |
| `e2e/admin/membership-detail.spec.ts` | 4 | Membership tabs page |
| `e2e/admin/membership-list.spec.ts` | 2 | Membership listing |
| `e2e/admin/scoring.spec.ts` | 1 | Scoring flow; partial cleanup landed SESSION_0267 |
| `e2e/admin/tournament-list.spec.ts` | 2 | Tournament listing |
| `e2e/lineage/editor-drag-reorder.spec.ts` | 3 | Drag-reorder spec; uses SESSION_0265 pointer recipe |
| `e2e/lineage/public-rank-redaction.spec.ts` | 2 | Public rank redaction |
| `e2e/tournaments/list.spec.ts` | 1 | Tournament list page |
| `e2e/tournaments/register.spec.ts` | 2 | Tournament registration |
| `e2e/tournaments/results.spec.ts` | 3 | Tournament results |

SESSION_0268 drained `e2e/lineage/authenticated-lifecycle.spec.ts` and `e2e/lineage/public-visibility.spec.ts` to zero.

Total remaining: ~27 calls across 11 files. Cleanup target: drain to zero across 3–4 future sessions, batching by feature area.

### Cross-references

- SESSION_0265 FINDING_02 — first identified the flake-under-load pattern.
- SESSION_0266 TASK_01 — established the deterministic-locator pattern on `bracket.spec.ts`.
- SESSION_0267 TASK_01 — extended the pattern to `scoring.spec.ts` + `authenticated-lifecycle.spec.ts:50`, bumped 20s → 30s, codified this rule.
- SESSION_0266 FINDING_02 → SESSION_0267 TASK_02 — firefox serial-suite cookie isolation pattern.

---

## Petey close

A good test proves one thing clearly.
If you can't name what the test proves, it proves nothing.

**Planned Passion Produces Purpose.**
**OSSS.**
