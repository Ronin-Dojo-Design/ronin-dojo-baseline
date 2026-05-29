# ADR 0010 — Cache strategy for auth-scoped queries

**Status:** proposed
**Date:** 2026-04-27 (drafted), 2026-04-28 (reverted to proposed per SESSION_0019)
**Deciders:** Brian + Copilot (SESSION_0018, reviewed SESSION_0019)
**Relates to:** D-005 (drift register), Dirstarter L1 cache pattern, [Cache Risk Register](../cache-risk-register.md)

> **SESSION_0019 note:** This ADR was incorrectly marked `accepted` before validation.
> SESSION_0018 produced the draft; SESSION_0019 reviewed it against live Dirstarter docs,
> current Next.js cache documentation, and the repo's actual query implementations.
> Recommendation: narrow to T1 public-only for now. See `docs/architecture/cache-risk-register.md`.

## Context

Dirstarter uses `"use cache"` + `cacheTag` + `cacheLife` on all read queries (e.g. `searchTools`, `findRelatedTools`). All Dirstarter data is public — no auth filtering, no per-user visibility rules. Dirstarter's docs (https://dirstarter.com/docs) contain **no caching guide** — caching is an undocumented convention visible only in source code.

Key Dirstarter patterns discovered from source + docs research:

- **Action client chain** (`lib/safe-actions.ts`): `actionClient` → `userActionClient` → `adminActionClient`, each layer adding `db`, `revalidate`, and `user` to context. The `revalidate` helper calls `updateTag(tag)` for each tag — this is the mutation-side invalidation pattern.
- **Session** (`lib/auth.ts`): `getServerSession()` is wrapped in `React.cache()` for per-request deduplication. Uses `better-auth` with `cookieCache: { enabled: true }`.
- **Auth HOC** (`lib/auth-hoc.ts`): `withAuth()` and `withAdminAuth()` wrap API route handlers.
- **Route protection** (`proxy.ts`): Middleware checks session cookie, redirects unauthenticated users. Not the only auth check — actions also verify session.
- **All queries are public**: No query in Dirstarter's `server/web/` takes a `userId` or auth context. All data (`Tool`, `Category`, `Tag`) is globally visible.

Ronin Dojo has **auth-scoped queries** where results depend on the viewer:

- **Directory**: `getDirectoryProfiles` returns PUBLIC profiles for anonymous users, PUBLIC + MEMBERS_ONLY for authenticated users. Per-field flags (`showEmail`, `showPhone`) strip sensitive data server-side.
- **Organizations**: `getOrganizationsByBrand` is public within a brand, but future features (private orgs) may scope by membership.
- **Courses**: S6 will add instructor-authored courses with publish state — unpublished courses visible only to the author/org admins.
- **Passport/Profile**: User's own data — always per-user.

**Risk:** Applying `"use cache"` globally without understanding cache key generation could cause **cross-user data leakage** — a critical bug class per our architecture rules.

## Research findings

### How `"use cache"` generates cache keys (Next.js 16)

Cache keys are built from:
1. **Build ID** — unique per build
2. **Function ID** — secure hash of function location + signature
3. **Serialized arguments** — all function parameters
4. **Closure-captured variables** — variables from outer scopes automatically included

**Critical insight:** If a cached function takes `viewerUserId` as a parameter, each distinct `viewerUserId` value produces a **separate cache entry**. This is the intended pattern for per-user caching.

### Constraints

- Cannot call `cookies()` or `headers()` inside `"use cache"` — must read auth outside the cached scope and pass session data as arguments.
- `React.cache` is **isolated** inside `"use cache"` boundaries — cannot use `React.cache` stores to smuggle data in.
- Return values must be serializable (no class instances).

### `"use cache: private"` variant

Next.js 16 also offers `"use cache: private"` for cases where you can't refactor to pass runtime data as arguments. Not needed here — our queries already accept auth data as parameters.

## Decision

### Three-tier caching strategy

| Tier | Pattern | When to use | Example |
|------|---------|-------------|---------|
| **T1 — Public data** | `"use cache"` + `cacheTag` + `cacheLife("hours")` | Data identical for all viewers within a brand. No auth filtering. | `getOrganizationsByBrand(brand)`, `getSystemRoles()`, `getDisciplines()`, seed data lookups |
| **T2 — Auth-variant data** | `"use cache"` + `cacheTag` + `cacheLife("minutes")` with `viewerUserId` (or `"anon"`) as an argument | Same query, different results per auth state. Viewer identity is part of the cache key. | `getDirectoryProfiles({ brand, filters, viewerUserId })` — anon sees PUBLIC, authed sees PUBLIC + MEMBERS_ONLY |
| **T3 — Per-user private data** | `React.cache()` only (no `"use cache"`) | Data owned by and visible only to one user. Deduplication within a single request, no cross-request caching. | `getPassportByUserId(userId)`, `getUserMemberships(userId)`, `getMyRegistrations(userId)` |

### Implementation rules

1. **Read session outside cache boundary.** Pages/layouts call `auth()` or `getSession()`, extract `userId`, pass it as a serialized argument to cached query functions.

2. **Normalize the viewer key.** Auth-variant queries accept `viewerUserId: string | null`. Pass `null` (or `"anon"`) for unauthenticated requests — this ensures anon results cache separately from user-specific results.

3. **Tag by entity domain.** Use `cacheTag("organizations")`, `cacheTag("directory")`, `cacheTag("courses")`, etc. On mutation (server action), call `revalidateTag("organizations")` to bust the relevant cache.

4. **Per-field privacy is post-cache filtering.** For T2 queries like directory profiles, the `select` payload fetches all flag-controlled fields; the privacy stripping (`showEmail ? email : null`) happens **after** the cache returns. This means we cache the full data and filter in the calling function. Alternative: cache per-visibility-combination — rejected as combinatorial explosion.

   **Wait — this is wrong.** If we cache the full data including email/phone, and the cache returns it before filtering, another user could see it if they share the same cache key. But they **can't** share the same key because `viewerUserId` is part of the key. However, the cached data for `viewerUserId="user-abc"` contains the raw email/phone of other users before per-field filtering. If the cache is ever leaked or accessed incorrectly, it's a data exposure risk.

   **Revised decision:** Per-field privacy filtering happens **inside** the cached function. The cached function returns already-filtered data. This means different viewers see the same filtered output for PUBLIC profiles (since field flags are per-profile-owner, not per-viewer). The only viewer-dependent axis is visibility level (PUBLIC vs PUBLIC+MEMBERS_ONLY), not field access.

   Actually, re-examining: `showEmail`, `showPhone`, etc. are **profile-owner settings**, not viewer-dependent. Profile owner "Alice" sets `showEmail=false` — ALL viewers see Alice's email hidden. This means per-field filtering is deterministic regardless of viewer. The ONLY viewer-dependent axis is `visibility` (which profiles are returned). So:

   **Final approach:** The cached function filters `where: { visibility: { in: allowedVisibility } }` based on the viewer state. Per-field stripping happens in the return mapping inside the cached function. Result: cached output is already safe.

5. **Cache life profiles:**
   - T1 (public): `cacheLife("hours")` — seed data changes rarely
   - T2 (auth-variant): `cacheLife("minutes")` — directory profiles change moderately
   - T3 (private): No `"use cache"` — just `React.cache()` for request deduplication

6. **Don't cache mutations.** Server actions that write data (create org, join org, update profile) never use `"use cache"`. They call `updateTag()` (Next.js 16 successor to `revalidateTag`) after the mutation. Our `safe-actions.ts` already has a `revalidate({ tags })` helper that calls `updateTag()` — use it in action handlers.

### Example: Directory query with T2 caching

```typescript
import { cacheLife, cacheTag } from "next/cache"

export async function getDirectoryProfiles({
  brand,
  filters,
  viewerUserId,
}: {
  brand: Brand
  filters?: DirectoryFilters
  viewerUserId: string | null
}) {
  "use cache"

  cacheTag("directory")
  cacheLife("minutes")

  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  const profiles = await db.directoryProfile.findMany({
    where: { visibility: { in: allowedVisibility }, /* ... */ },
    select: directoryProfileListPayload,
  })

  // Per-field privacy stripping (deterministic — not viewer-dependent)
  return profiles.map((profile) => ({
    // ... strip showEmail/showPhone fields
  }))
}
```

### Example: Page calling the cached function

```typescript
// app/(web)/directory/page.tsx
import { auth } from "~/lib/auth"

export default async function DirectoryPage() {
  const session = await auth()
  const viewerUserId = session?.user?.id ?? null

  const profiles = await getDirectoryProfiles({
    brand: currentBrand,
    filters: {},
    viewerUserId,
  })

  return <DirectoryList profiles={profiles} />
}
```

## Queries classified

| Query | Tier | Cache key includes | Tag |
|-------|------|-------------------|-----|
| `getOrganizationsByBrand(brand)` | T1 | `brand` | `organizations` |
| `getOrganizationById(id)` | T1 | `id` | `organizations` |
| `getOrganizationBySlug(brand, slug)` | T1 | `brand`, `slug` | `organizations` |
| `getOrganizationByInviteCode(code)` | T1 | `code` | `organizations` |
| `getSystemRoles()` | T1 | (none) | `roles` |
| `getDirectoryProfiles(brand, filters, viewerUserId)` | T2 | `brand`, `filters`, `viewerUserId` | `directory` |
| `getDirectoryFilterOptions(brand)` | T1 | `brand` | `directory` |
| `getPassportByUserId(userId)` | T3 | — | — |
| `getUserMemberships(userId)` | T3 | — | — |
| Future: `getCoursesByOrg(orgId, viewerUserId)` | T2 | `orgId`, `viewerUserId` | `courses` |

## Consequences

### Positive

- Aligns with Dirstarter L1 caching pattern (`"use cache"` + `cacheTag` + `cacheLife`)
- Auth-scoped data cannot leak across users — `viewerUserId` is part of the cache key
- Per-field privacy is deterministic and happens inside the cached function
- Clear classification makes it easy to add new queries to the right tier
- `revalidateTag` provides targeted invalidation on mutations

### Negative

- T2 caches proliferate entries per unique `viewerUserId` — on serverless (Vercel), these may not persist across requests anyway. Not a concern for MVP scale.
- We must remember to call `revalidateTag` in every mutation action — easy to miss. Mitigate: add a helper pattern or lint check.
- Requires `cacheComponents: true` in `next.config.ts` (Next.js 16 feature flag)

### Neutral

- T3 (private) queries use only `React.cache()` — same pattern as today. No change needed for passport/membership queries.
- We defer `"use cache: remote"` (Redis/KV) to post-MVP. In-memory LRU is sufficient.

## Related

- [ADR 0004 — Multi-brand as column](0004-multi-brand-as-column.md) — brand scoping on all queries
- [Drift Register D-005](../../knowledge/wiki/drift-register.md) — resolved by this ADR
- [Dirstarter architecture map — cache section](../dirstarter-architecture-map.md)
- [Next.js `"use cache"` docs](https://nextjs.org/docs/app/api-reference/directives/use-cache)
