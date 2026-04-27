---
title: "S2–S4 Pattern Compliance Audit"
slug: s2-s4-pattern-audit
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0016
health: 7
pairs_with:
  - docs/architecture/dirstarter-architecture-map.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# S2–S4 Pattern Compliance Audit

Audited against the 5-layer vertical slice pattern defined in `docs/architecture/dirstarter-architecture-map.md`.

---

## Summary

| Entity | Schema | Payloads | Queries | Schema (validation) | Actions | Components | Pages | Grade |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Passport** (S2) | ✅ | ❌ missing | ⚠️ minimal | ❌ missing | ❌ none | ⚠️ exists | ✅ `/me` | C |
| **Organization** (S3) | ✅ | ❌ missing | ⚠️ inline includes | ✅ `schemas.ts` | ✅ `actions.ts` | ✅ 4 components | ✅ list/create/detail | B+ |
| **DirectoryProfile** (S4) | ✅ | ❌ missing | ✅ proper pattern | ✅ `schema.ts` | — (read-only) | ✅ 4 components | ✅ `/directory` | B+ |

**Overall grade: B−** — structurally sound but missing the payloads layer and using inline `include`/`select` in queries.

---

## Detailed Findings

### 1. MISSING: `payloads.ts` files (all 3 entities)

**Problem:** Dirstarter's pattern extracts Prisma select/include shapes into `payloads.ts` with typed exports. Our entities inline these directly in queries.

**Where Dirstarter does it right:**
```typescript
// server/web/tools/payloads.ts
export const toolManyPayload = { id: true, name: true, ... } satisfies Prisma.ToolSelect
export type ToolMany = Prisma.ToolGetPayload<{ select: typeof toolManyPayload }>
```

**What we do instead:**
```typescript
// server/web/organization/queries.ts
return db.organization.findUnique({
  where: { id },
  include: { disciplines: { include: { discipline: true } }, ... }  // inline!
})
```

**Impact:** No reusable typed shapes. Components can't type-check against a stable payload type. If two queries return the same entity with different shapes, there's no central definition.

**Fix (S6 pre-work):** Create:
- `server/web/passport/payloads.ts`
- `server/web/organization/payloads.ts`
- `server/web/directory/payloads.ts`

### 2. MISSING: `"use cache"` + `cacheTag` + `cacheLife` (all queries)

**Problem:** Dirstarter uses Next.js caching directives on all read queries:
```typescript
export const searchTools = async (...) => {
  "use cache"
  cacheTag("tools")
  cacheLife("infinite")
  ...
}
```

Our queries use only `cache` from React (deduplication, not persistent caching):
```typescript
export const getDirectoryProfiles = cache(async (...) => { ... })
```

**Impact:** Every page load hits the DB. No ISR-style caching. Fine for dev, but needs fixing before production.

**Fix:** Add `"use cache"` + `cacheTag("<entity>")` to all read queries. Add `revalidate({ tags: ["<entity>"] })` to corresponding actions.

### 3. Organization queries use `include` instead of `select`

**Problem:** Dirstarter queries always use explicit `select` (via payloads). Our org queries use `include`, which returns all columns of the included relations.

```typescript
// Our code — overfetches
include: { disciplines: { include: { discipline: true } } }

// Dirstarter pattern — precise
select: { disciplines: { select: disciplineManyPayload } }
```

**Impact:** Potential data leakage (exposing fields we shouldn't), worse performance (returning unnecessary data), and no typed payload contract.

**Fix:** Refactor to `select`-based queries using payloads.

### 4. Passport page doesn't follow the page pattern

**Problem:** `/me/page.tsx` uses raw `<h1>` and `<p>` tags instead of Dirstarter's `<Intro>`, `<IntroTitle>`, `<IntroDescription>` components.

```tsx
// Our code
<h1 className="text-3xl font-bold">My Passport</h1>
<p className="text-muted-foreground mt-1">...</p>

// Dirstarter pattern
<Intro>
  <IntroTitle>My Passport</IntroTitle>
  <IntroDescription>...</IntroDescription>
</Intro>
```

**Impact:** Inconsistent UI, won't pick up theming changes.

**Fix:** Replace with `<Intro>` pattern. Add `<Section>` wrapper.

### 5. Organization page hardcodes metadata

**Problem:** Dirstarter uses `getData()` cache pattern with `getPageData()` + `getPageMetadata()` helpers for consistent page metadata. Our org pages use static `export const metadata` objects.

```tsx
// Dirstarter pattern
const getData = cache(async () => {
  const t = await getTranslations()
  return getPageData(url, title, description, { breadcrumbs: [...] })
})
export const generateMetadata = async () => { ... }

// Our code
export const metadata: Metadata = { title: "Organizations", ... }
```

**Impact:** No i18n support, no breadcrumbs, inconsistent with other pages.

**Fix (low priority — S11):** Migrate to `getData()` pattern when i18n is wired.

### 6. Directory page correctly follows the pattern ✅

`/directory/page.tsx` properly uses:
- `<Intro>` + `<IntroTitle>` + `<IntroDescription>`
- `<Section>` + `<Section.Content>`
- Passes `searchParams` to a listing component
- Session check for auth-aware rendering

This is the best-implemented page of the three.

### 7. Organization actions properly use `userActionClient` ✅

`server/web/organization/actions.ts` correctly:
- Uses `"use server"` directive
- Uses `userActionClient.inputSchema(...).action(...)`
- Accesses `ctx.user`, `ctx.db`, `ctx.revalidate`
- Uses Zod schemas from a separate file

This follows Dirstarter's `submit.ts` pattern well.

---

## Remediation Plan (ordered by impact)

| # | Fix | Effort | When |
| --- | --- | --- | --- |
| 1 | Create `payloads.ts` for passport, organization, directory | 1–2 hrs | S6 opening (pre-work) |
| 2 | Refactor org queries from `include` to `select` with payloads | 1 hr | S6 opening |
| 3 | Add `"use cache"` + caching directives to all queries | 30 min | S6 opening |
| 4 | Fix `/me/page.tsx` to use `<Intro>` pattern | 15 min | S6 opening |
| 5 | Migrate pages to `getData()` + i18n pattern | 2 hrs | S11 (brand rollout) |

**Recommendation:** Items 1–4 should be a single "pattern alignment" task at the start of S6. Do NOT combine with new feature work — it's tech debt cleanup, separate commit.

---

## Checklist for Future Sprints

Before shipping any new feature page, verify:

- [ ] `server/web/<entity>/payloads.ts` exists with typed select shapes
- [ ] Queries use `"use cache"` + `cacheTag` + `cacheLife`
- [ ] Queries use `select` (from payloads), not `include`
- [ ] Actions call `revalidate({ tags: [...] })` after mutations
- [ ] Page uses `<Intro>` + `<Section>` pattern
- [ ] Components import types from payloads (not inferring from query returns)
