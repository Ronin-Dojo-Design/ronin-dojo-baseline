---
title: "SESSION 0695 — WL-P3-39: active-tier-entitlement `where` dedup"
slug: session-0695
type: session--implement
status: closed
created: 2026-07-25
updated: 2026-07-25
last_agent: cody-session-0695
sprint: S12
lane: repo
lane_seq:
recipe: "lane"
goal_ids: []
tickets: []
pairs_with:
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0695 — WL-P3-39: active-tier-entitlement `where` dedup

## Operator

Brian + cody-session-0695 (overnight-orchestrator lane, worktree `/Users/brianscott/dev/ronin-0695`,
branch `auto/session-0695-wl39-entitlement-dedup`)

## Goal

Extract the active-tier-entitlement `where` predicate (3 near-identical inline copies) into ONE
shared helper consumed by all three call sites, and dedup the 4 local `UPGRADE_HREF = "/lineage/join"`
consts into one shared constant. Behavior-preserving.

## Verify-first (operator addendum)

Before extracting, confirmed the finding still reproduced in this tree (not superseded by any
convergence since SESSION_0535) by reading each target file **before editing**:

- `apps/web/server/web/community/permissions.ts:52-65` (pre-edit) — inline `database.userEntitlement
  .findFirst({ where: { userId: user.id, status: "ACTIVE", entitlement: { brand, key: { in:
  [...LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS] } }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
  select: { id: true } })`.
- `apps/web/server/web/entitlements/lineage-tier-policy.ts:54-63` (pre-edit) — same predicate shape,
  batched: `db.userEntitlement.findMany({ where: { userId: { in: uniqueUserIds }, status: "ACTIVE",
  entitlement: { brand, key: { in: [...LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS] } }, OR: [...] } })`.
- `apps/web/server/web/entitlements/queries.ts:18-25` (pre-edit, `hasEntitlement`) — same predicate
  shape, single key: `db.userEntitlement.findFirst({ where: { userId, status: "ACTIVE", entitlement: {
  key: entitlementKey, brand }, OR: [...] } })`.
- `rg -n "UPGRADE_HREF" apps/web -g '*.ts' -g '*.tsx'` (pre-edit) — 4 local `const UPGRADE_HREF =
  "/lineage/join"` declarations: `community-post-card.tsx:33`, `community-post-row.tsx:32`,
  `create-community-post-dialog.tsx:60`, `app/(web)/posts/[slug]/page.tsx:35`.

All reproduced verbatim (matching the ledger's WL-P3-39 row and the SESSION_0535/FI-028 finding) — not
superseded. Proceeded with the extraction below.

## What landed

- **New shared module** `apps/web/server/web/entitlements/active-entitlement.ts`:
  - `activeEntitlementWhereForUser({ userId, keys, brand, now })` — single-user `where` (used by
    `hasAnyActiveEntitlement`).
  - `activeEntitlementWhereForUsers({ userIds, keys, brand, now })` — multi-user `where` (`userId: {
    in: [...] }`), used by the batch lookup below.
  - `hasAnyActiveEntitlement(userId, keys[], brand, database?, now?)` — the boolean "any active,
    unexpired grant matching brand + one of keys" check named in the ledger's fix line.
- **`permissions.ts`** (`canCreateCommunityPostForUser`) — the inline `findFirst` block replaced with
  `await hasAnyActiveEntitlement(user.id, LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS, brand, database)`.
  Same `where` shape, same `select: { id: true }`, same call order (entitlement leg before the staff
  membership query). `permissions.test.ts`'s injected fake `database` still passes unmodified — it
  only asserts on the `where` SHAPE the fake `findFirst` receives, which is unchanged.
- **`queries.ts`** (`hasEntitlement`) — delegates to `hasAnyActiveEntitlement(userId, [entitlementKey],
  brand, db)` (a single-key check is the 1-key-array case). The file-level `"use cache"` directive +
  `cacheTag`/`cacheLife` calls are untouched; `hasAnyActiveEntitlement` is a plain (uncached) helper
  called from inside the cached function boundary, same as any other internal `await`.
- **`lineage-tier-policy.ts`** (`getLineageListingRenderPoliciesForUsers`) — the inline `findMany`
  `where` replaced with `activeEntitlementWhereForUsers(...)`. **Deliberately NOT** routed through
  `hasAnyActiveEntitlement` — documented inline (and here, per the operator's "diff before unifying"
  instruction): this call site is a genuinely different shape from the other two — a batch lookup
  across many users (`userId: { in: [...] }`) that needs each user's *matched* `entitlement.key`s to
  resolve their tier (free/premium/elite/legend), not a single any-match boolean. Giddy's SESSION_0535
  caution (this policy gates profile rendering app-wide) is why this call site keeps its own `findMany`
  + `select` shape verbatim — only the `where`-predicate construction is shared, not the query
  execution/return shape.
- **New shared module** `apps/web/lib/entitlements/routes.ts` — `UPGRADE_HREF = "/lineage/join"`. Lives
  in `lib/` (no `db` import) so it's importable from `"use client"` components.
- **4 consumers** (`community-post-card.tsx`, `community-post-row.tsx`,
  `create-community-post-dialog.tsx`, `app/(web)/posts/[slug]/page.tsx`) — dropped their local
  `const UPGRADE_HREF = "/lineage/join"` and import the shared constant instead. Scope note: many OTHER
  `/lineage/join` literals exist repo-wide (nav config, emails, SEO sitemap, e2e specs, BBL landing
  content, claim/register CTAs) — those are different contexts (not the community-post entitlement
  upgrade CTA this dedup targets) and were deliberately left alone; touching them would have expanded
  scope well beyond the ledger's fix line and the owned-file contract.
- **New test** `apps/web/server/web/entitlements/active-entitlement.test.ts` — 6 cases for
  `hasAnyActiveEntitlement`: active/matching multi-key grant (true), expired `endsAt` (false), wrong
  brand (false), active grant whose key isn't in the requested set (false), revoked (false), null
  `endsAt`/lifetime grant (true). Real Postgres, tagged fixtures, `afterAll` cleanup — the §6 query-test
  pattern (no `next/cache` mock needed; the helper itself doesn't call `cacheTag`/`cacheLife`).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/entitlements/active-entitlement.ts` | New — shared `where`-builders + `hasAnyActiveEntitlement`. |
| `apps/web/server/web/entitlements/active-entitlement.test.ts` | New — 6-case hermetic coverage (active/expired/wrong-brand/wrong-key/revoked/lifetime). |
| `apps/web/lib/entitlements/routes.ts` | New — shared `UPGRADE_HREF` constant. |
| `apps/web/server/web/community/permissions.ts` | `canCreateCommunityPostForUser` calls `hasAnyActiveEntitlement` instead of inline `findFirst`. |
| `apps/web/server/web/entitlements/queries.ts` | `hasEntitlement` delegates to `hasAnyActiveEntitlement`. |
| `apps/web/server/web/entitlements/lineage-tier-policy.ts` | `getLineageListingRenderPoliciesForUsers` uses `activeEntitlementWhereForUsers` for its `findMany` `where`. |
| `apps/web/components/web/community/community-post-card.tsx` | Imports shared `UPGRADE_HREF`; dropped local const. |
| `apps/web/components/web/community/community-post-row.tsx` | Imports shared `UPGRADE_HREF`; dropped local const. |
| `apps/web/components/web/community/create-community-post-dialog.tsx` | Imports shared `UPGRADE_HREF`; dropped local const. |
| `apps/web/app/(web)/posts/[slug]/page.tsx` | Imports shared `UPGRADE_HREF`; dropped local const. |
| `docs/sprints/SESSION_0695.md` | This record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pwd && git branch --show-current` (before every write) | `/Users/brianscott/dev/ronin-0695` / `auto/session-0695-wl39-entitlement-dedup` |
| Bootstrap (`.env` copy, `bun install`, `bunx prisma generate`) | 3/3 real exit 0 |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | real exit 0 |
| `bunx oxlint` on all 10 touched/new app files | real exit 0, no output |
| `bun test server/web/entitlements/active-entitlement.test.ts` | 6 pass / 0 fail |
| `bun test server/web/entitlements/queries.test.ts` | 2 pass / 0 fail |
| `bun test server/web/community/permissions.test.ts` | 9 pass / 0 fail |
| `bun test server/web/community/permissions.integration.test.ts` | 1 pass / 0 fail |
| `bun run test` (full suite, `--parallel=1`) | **1747 pass / 0 fail, 4826 expect() calls across 225 files** (255s) |

## Proposed ledger edits

<!-- Never edit shared ledgers from a lane — merge sweep applies this once. -->

**`docs/knowledge/wiki/wiring-ledger.md`** — replace the WL-P3-39 row's `Action` cell (currently "OPEN" /
SESSION_0535 finding text) with:

> ✅ Fixed (SESSION_0695) — extracted `hasAnyActiveEntitlement(userId, keys[], brand, db?, now?)` +
> `activeEntitlementWhereForUser`/`activeEntitlementWhereForUsers` into new
> `server/web/entitlements/active-entitlement.ts`; `permissions.ts` and `queries.ts::hasEntitlement`
> now call the shared boolean helper (behavior-preserving — same `where` shape, verified via existing
> `permissions.test.ts`/`permissions.integration.test.ts`/`queries.test.ts`, all green). `lineage-tier-
> policy.ts`'s batch `findMany` shares only the `where`-predicate builder (`activeEntitlementWhereFor
> Users`), NOT the boolean helper — it's a genuinely different shape (multi-user, needs per-user
> matched keys, not a boolean) per Giddy's SESSION_0535 caution; documented inline. Promoted shared
> `UPGRADE_HREF` (`~/lib/entitlements/routes.ts`) replacing 4 local `const UPGRADE_HREF =
> "/lineage/join"` copies (`community-post-card.tsx`, `community-post-row.tsx`, `create-community-
> post-dialog.tsx`, `posts/[slug]/page.tsx`). New test `active-entitlement.test.ts` (6 cases). Other
> `/lineage/join` literals repo-wide (nav/emails/SEO/e2e/BBL-landing) are a DIFFERENT context and were
> left alone — out of this row's scope. Full suite: 1747 pass / 0 fail. PR: <filled after `gh pr
> create`>.

## Open decisions / blockers

None. WL-P3-39 fully actioned as scoped; the merge sweep owner applies the ledger row edit above.

## Next session

### Goal

N/A — single-item lane dispatch, not a self-perpetuating chain.
