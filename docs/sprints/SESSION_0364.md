---
title: "SESSION 0364 — Phase 1c: oRPC pilot read migration (public lineage tree) (cloud run)"
slug: session-0364
type: session--implement
status: in-progress
created: 2026-06-12
updated: 2026-06-12
last_agent: claude-session-0364
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0363.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0364 — Phase 1c: oRPC pilot read migration (public lineage tree)

> **Cloud run.** Executed unattended on a feature branch
> (`session-0364-orpc-phase-1c`) with a PR opened for the operator. Bow-out /
> full close + browser verification (manual `bbl.local` proof) happen later on
> the operator's machine; the bottom sections (`Review log` → `Full close
> evidence`) are intentionally left as bow-out stubs.

## Date

2026-06-12

## Operator

Brian (away) + claude-session-0364 (unattended cloud run)

## Goal

BBL-SOT-Spec **Phase 1c**: migrate ONE representative read through the oRPC
pipeline with brand-scope, audit, and rate-limit preserved — the named ideal
pilot being the public lineage tree page. Prove the migration pattern end to end
(flat `server/<entity>/router.ts` per SOT-ADR D5, public-payload allowlist
untouched per the D3 hard gate) so the remaining surfaces can follow with a known
shape. Stretch: stand up the deferred TanStack Query provider.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0363.md` (+ `SESSION_0362.md`).
- Carryover: 0362 shipped the brand-aware oRPC scaffold (Phase 1a — flat
  `can()`/roles, `health` smoke, brand middleware, `rsc()`/client/query libs);
  0363 added the D4 resource-grant seam. Phase 1c is the first real READ
  migration onto that scaffold. The TanStack provider was explicitly deferred
  from 1a and is the named stretch here.

### Branch and worktree

- Branch: `session-0364-orpc-phase-1c` (off `main`)
- Worktree: cloud sandbox `/home/user/ronin-dojo-baseline`
- Status at bow-in: clean
- Current HEAD at bow-in: `edb74b2` (Phase 1b merge; `main` at `76f35f0`)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Data-access / RSC read path (the upstream direct-query page pattern) + Authorization (`can()` permission gate) |
| Extension or replacement | Extension: the page keeps the same query/payload functions; only the *transport* changes — the read now flows through the oRPC `publicProcedure` pipeline instead of a direct import |
| Why justified | BBL-SOT-Spec Phase 1 — migrating reads onto oRPC is the stated path so every surface gets brand-scope + permission + rate-limit + audit uniformly |
| Risk if bypassed | Reads stay on ad-hoc direct imports with no uniform middleware seam — the very drift Phase 1 exists to remove |

Live docs checked during planning: not re-fetched — pilot surface and scaffold
pinned by the task spec and the SESSION_0363 next-session block.

### Graphify check

Skipped — files pinned by the task spec (pilot page + its query/payload
functions, oRPC scaffold). Read directly.

## Petey plan

### Goal

Route the public `/lineage/[treeSlug]` primary tree read through a new flat
oRPC router, preserving brand scope and payload shape byte-for-byte; mount the
deferred TanStack Query provider as a zero-behavior-change stretch.

### Tasks

#### SESSION_0364_TASK_01 — Pilot READ: public lineage tree through oRPC

- **Agent:** Cody (inline)
- **What:** New flat `server/lineage/router.ts` (`lineage.bySlug` on
  `publicProcedure`, `.meta({ permission: "lineage.read" })`) that thinly calls
  the existing `getLineageTreeBySlug` with `context.brand`; mount under
  `lineage` in `server/router.ts`; add `lineage.read` to `PUBLIC_GRANTS`; switch
  the page to `rsc()` + `api.lineage.bySlug(...)`.
- **Done means:** gates green; page rendering/props identical; payload functions
  untouched.
- **Depends on:** nothing

#### SESSION_0364_TASK_02 — TanStack Query provider (STRETCH)

- **Agent:** Cody (inline)
- **What:** `contexts/query-context.tsx` `QueryProvider` (singleton
  `QueryClient` via `useState`), mounted in the root `app/layout.tsx`.
- **Done means:** typecheck/lint/format green; zero behavior change (no consumer
  migrated).
- **Depends on:** nothing

### Open decisions

None — operator ratified scope via the task spec.

### Risks

- **Payload reshape temptation.** Mitigated by making the handler a pure
  pass-through to `getLineageTreeBySlug` — no select/shape logic moved into the
  router.

### Scope guard

- No schema changes; no payload-allowlist edits (`server/web/lineage/payloads.ts`
  untouched).
- Migrate only the PRIMARY tree read — the sibling render-policy query and the
  metadata/profiles queries stay direct calls.
- No deletion of the old `getLineageTreeBySlug` export (other callers use it).
- No procedure-pipeline reordering; no other next-safe-action surfaces touched.

### Dirstarter implementation template

- **Docs read first:** SESSION_0362/0363, BBL-SOT-Spec Phase 1, SOT-ADR D3/D5;
  pilot page + `server/web/lineage/queries.ts`/`payloads.ts`; oRPC scaffold
  (`procedure.ts`, `roles.ts`, `lib/orpc-server.ts`).
- **Baseline pattern to extend:** the upstream RSC direct-query read page; the
  oRPC `publicProcedure` pipeline ported in 1a.
- **Custom delta:** `server/lineage/router.ts` flat router (D5) + `lineage.read`
  public grant; page reads via `rsc()`.
- **No-bypass proof:** the handler calls the *same* query with `context.brand`
  and returns its result verbatim — brand scope and the public-payload allowlist
  remain the single source of the response shape (D3).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0364_TASK_01 | landed | `server/lineage/router.ts` (`lineage.bySlug`, public, brand-from-context, thin pass-through to `getLineageTreeBySlug`); mounted under `lineage`; `lineage.read` added to `PUBLIC_GRANTS` + asserted in `permissions.test.ts`; page switched to `rsc()` + `api.lineage.bySlug(...)`, rendering/props/`null→notFound()` identical. |
| SESSION_0364_TASK_02 | landed | `contexts/query-context.tsx` `QueryProvider` (singleton `QueryClient` via `useState`) mounted in `app/layout.tsx`; provider only, no consumer migrated, zero behavior change. |

## What landed

- **Pilot read migration** (`server/lineage/router.ts`): the public
  `/lineage/[treeSlug]` primary tree read now travels through the oRPC
  `publicProcedure` pipeline (base context → session → brand → rate-limit →
  permission). `lineage.bySlug` takes only `{ slug }` (brand comes from
  `context.brand`; clients can never choose a brand — D3) and returns
  `getLineageTreeBySlug`'s result verbatim.
- **`lineage.read` public grant** added to `PUBLIC_GRANTS` in `roles.ts` (the
  page is anonymous-reachable); `permissions.test.ts` asserts the new grant.
- **Router mounted** under `lineage` in `server/router.ts` (the first migrated
  entity surface joining the `health` smoke).
- **Page swap**: `app/(web)/lineage/[treeSlug]/page.tsx` reads via
  `const api = await rsc()` + `api.lineage.bySlug({ slug: treeSlug })`. The
  sibling render-policy query and the metadata/profiles reads stay direct calls
  (Phase 1c migrates the primary read only).
- **Stretch**: `contexts/query-context.tsx` `QueryProvider` mounted in
  `app/layout.tsx` — provider only.

## Decisions resolved

- **Brand comes from context, not input.** The existing
  `lineageTreeBySlugSchema` includes `brand`, but the oRPC input deliberately
  omits it — `withBrand` injects `context.brand` server-side (D3). The handler
  passes `context.brand` exactly where the page previously passed its
  `getRequestBrand()` value.
- **No-viewer (public) path preserved.** The page called `getLineageTreeBySlug`
  without a `viewer`, so the procedure does too — the public shared-cache fast
  path is unchanged. (Viewer-scoped reads remain a future migration.)
- **`null → notFound()` left in the page.** The procedure returns
  `LineageTreePublicResult | null`; the page keeps its own `notFound()` mapping
  rather than adopting `orNotFound`, keeping the diff minimal and rendering
  identical.
- **Provider placed outside the existing tree** (just inside
  `NextIntlClientProvider`) so all client components are within Query scope.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/lineage/router.ts` | New — flat `lineage` router with `bySlug` (public, brand-from-context, thin pass-through). |
| `apps/web/server/router.ts` | Mounted `lineage` router; refreshed root-router comment. |
| `apps/web/server/orpc/roles.ts` | Added `lineage.read` to `PUBLIC_GRANTS`. |
| `apps/web/server/orpc/permissions.test.ts` | Asserts guest has the new `lineage.read` public grant. |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Primary tree read via `rsc()` + `api.lineage.bySlug(...)`; dropped the direct `getLineageTreeBySlug` import. |
| `apps/web/contexts/query-context.tsx` | New — `QueryProvider` (stretch). |
| `apps/web/app/layout.tsx` | Mounted `QueryProvider` (stretch). |
| `docs/sprints/SESSION_0364.md` | This session file. |

## Verification

| Command / gate | Result |
| --- | --- |
| `bun install --frozen-lockfile` (root, CI dummy env) | EXIT 0 (636 packages) |
| `bun run db:generate` (Prisma client) | EXIT 0 — Prisma Client 7.8.0 → `apps/web/.generated/prisma` |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | EXIT 0, 0 errors |
| `bun run lint:check` (oxlint) | EXIT 0 — only pre-existing warnings, none in touched files |
| `bun run format:check` (oxfmt, 1244 files) | EXIT 0 |
| `bun test server/orpc/` | 36 pass / 0 fail (70 expect calls) |

> DB-backed tests + the Playwright `e2e/lineage/*` suite (chromium/firefox/webkit)
> are NOT run here — no Postgres/browser in the sandbox. CI runs the full suite +
> Playwright on the PR and is the authoritative gate that the page still renders
> identically.

## Open decisions / blockers

- **Viewer-scoped lineage read** (`getLineageTreeBySlugForViewer`) not migrated —
  the pilot page uses the public path only. A follow-up surface can migrate the
  viewer path, deciding how to thread `viewer` (likely from `context.user`).
- **TanStack consumer migration** deferred — provider is mounted but no client
  component consumes `~/lib/orpc-query` yet.
- **Manual `bbl.local` proof** of the page deferred to the operator's machine.

## Next session

### Goal

Migrate the next read surface(s) onto oRPC following the 1c pattern (and/or the
viewer-scoped lineage read), and/or wire the first TanStack Query consumer onto
the new provider.

### First task

On the operator's machine: manual `bbl.local` proof that `/lineage/[treeSlug]`
renders identically post-migration, then pick the next read surface (or the
viewer-scoped lineage path) and repeat the 1c migration shape.

## Review log

<!-- Bow-out stub (cloud run) — filled during full close on operator machine. -->

## Hostile close review

<!-- Bow-out stub (cloud run) — filled during full close on operator machine. -->

## ADR / ubiquitous-language check

- ADR update not required — this session *implements* BBL-SOT-Spec Phase 1c
  within SOT-ADR D3/D5 (no new decision). Putting the new router at flat
  `server/lineage/router.ts` is the D5 pre-alignment, recorded here + in code
  comments.
- Ubiquitous language update not required — no new domain terms; reuses the
  lineage / `LineageTree` vocabulary.

## Reflections

<!-- Bow-out stub (cloud run) — filled during full close on operator machine. -->

## Full close evidence

<!-- Bow-out stub (cloud run) — full closing ritual runs on the operator's
     machine: wiki index/log row, wiki lint, Graphify update, memory sweep,
     git hygiene. This branch lands via PR review, not a main push. -->
