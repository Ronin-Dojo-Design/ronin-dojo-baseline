---
title: "Petey Plan — Brand-harness prune (single-brand collapse → remove the Brand axis)"
slug: petey-plan-brand-harness-prune
type: petey-plan
status: active
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0421
pairs_with:
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/knowledge/wiki/ronin-project-context.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan — Brand-harness prune

> **Purpose:** retire the dead four-brand harness (the `Brand` enum + ~451 `getRequestBrand`
> threadings across 178 files + the `brand` column on 43 models) now that BBL is the only brand
> (ADR 0034 — multi-*brand* is dead, multi-*product* is the model). A cold agent can take one **Stage 1
> wave** below, `/bow-in`, and run it self-contained. **Stage 2 (schema migration) is NOT a fanout** —
> one careful session after Stage 1 is green.

## Why this is staged, not one big sweep

- `getRequestBrand()` is an **async fn that returns the `Brand.BBL` constant** (`lib/brand-context.ts:64`).
  It is `await`ed in **451 places across 178 files**, coloring hundreds of fns `async` and threading a
  pointless axis through the call graph (Ousterhout: a deep module that carries nothing).
- The `brand` value lands in **`where: { brand }` Prisma filters**. Those filters are **load-bearing
  on any DB that still has non-BBL rows.** There is at least one **BASELINE seed** still in the tree
  (the comp-fixture unit test — kept BASELINE on purpose, SESSION_0418). **Blindly stripping `brand:`
  filters can change query results and break that test.** → Stage 1 keeps semantics; Stage 2 owns the
  data decision.
- `brand` is a **real column on 43 models** + `enum Brand` (`schema.prisma:395`) + `User.brand`
  (persists "current brand"). Removing the enum is a **43-model migration** on a **live prod DB** —
  high-risk, single-session, last.

## Two stages

| Stage | What | Shape | Risk | Gate |
| --- | --- | --- | --- | --- |
| **1 — Code de-thread** | Kill all `getRequestBrand()` call sites + brand param-threading; inline `Brand.BBL` literal at filter sites; delete `getRequestBrand`. **Keep `brand: Brand.BBL` filters + enum + columns.** | **Fanout** (4 waves, disjoint dirs) | Low–med (no migration, reversible) | per-wave: `tsc --noEmit` + touched `bun test` + `next build` on changed server-action/route modules |
| **2 — Schema drop** | Drop the 43 `brand` columns + `enum Brand` + `User.brand`; remove the now-literal `brand: Brand.BBL` filters; resolve the BASELINE fixture; decide `BrandSettings` fate (it drives theme — keep as single-row config, do NOT blind-drop). | **One session** (not fanout) | **High** (prod migration) | backup + rollback plan; browser-verify; explicit operator go before the migration push |

## Phase 0 — operator decision gate (clear BEFORE Stage 2; Stage 1 can start now)

1. **Prod data is single-brand BBL only?** (Memory says yes — BBL is the only active brand, roster is
   BBL.) Confirm no live non-BBL rows depend on `brand:` filters.
2. **BASELINE comp-fixture test seed** — keep (re-stamp BBL) or delete? (It's a unit-test fixture; see
   issue #8 "entitlement + brand-membership fixtures" — fold that issue into Stage 2.)
3. **`BrandSettings`** — single-brand collapse to one row / env, or keep the table? (Brand colors are
   DB-sourced — `BrandSettings` overrides `styles.css`; do not break the live theme.)
4. **`User.brand`** — drop the column, or keep nullable for audit? (No writer left once Stage 1 lands.)

## Stage 1 — the fanout (4 disjoint waves)

**Shared mechanics (every wave):**
- Replace each `const brand = await getRequestBrand()` usage:
  - if `brand` only feeds `where: { brand }` → drop the line, inline `Brand.BBL` at the filter (keep
    the filter), and de-`async`/drop the now-unneeded `await` if it was the only one.
  - if `brand` is threaded as a **function param** across modules → collapse the param: callers stop
    passing it, callee inlines `Brand.BBL` (or `DEFAULT_BRAND`).
- Do **not** remove `brand:` filters, the `Brand` enum, or any schema field (that's Stage 2).
- Keep `getRequestOrigin` / `resolveRequestOrigin` (origin, **not** brand — untouched).
- **Isolation:** each wave is a disjoint directory → run as separate cloud agents / `isolation:
  worktree` subagents so they don't collide. One PR per wave.
- **Per-wave gate:** `next typegen && tsc --noEmit` clean · `bun test` on touched areas green · local
  `next build` on any changed `"use server"` / route module (the use-server export trap) · `bun run
  lint:check` + `format:check` via the **local** oxc bin (never `bunx`).

| Wave | Scope | Approx hot files |
| --- | --- | --- |
| **1** | `apps/web/server/web/**` | schedule, merch, lead, enrollment, course-enrollment, lineage, family, billing, media actions/queries (the largest cluster) |
| **2** | `apps/web/server/admin/**` | programs, tournaments, leads, content, pricing-plans queries/actions |
| **3** | `apps/web/app/**` + `apps/web/lib/**` + `apps/web/components/**` | route handlers, pages, layouts, lib helpers, any client-shared brand reads (⚠ never value-import the generated `Brand` enum into `"use client"` chrome → Prisma-in-browser 500s; inline the constant) |
| **4** | tests + stragglers + **delete `getRequestBrand`** from `lib/brand-context.ts`; `grep -r getRequestBrand apps/web` must return **0** | `*.test.ts`, e2e seeds, final sweep |

**Stage 1 done when:** `getRequestBrand` is deleted, `grep` is zero, all waves merged, CI green. The
`Brand` enum + `brand: Brand.BBL` literals + columns still stand (Stage 2 territory).

## Stage 2 — schema drop (single session, gated)

- Per-model decision from Phase 0; one Prisma migration dropping the 43 `brand` columns + `enum Brand`
  + `User.brand`; remove the `brand: Brand.BBL` literals Stage 1 left; resolve the BASELINE fixture
  (#8); settle `BrandSettings`.
- Backup prod + rollback plan; migrate-only on deploy (prod is not seeded); browser-verify theme +
  directory + lineage still render; **explicit operator go before the migration push.**

## Acceptance (whole program)

- [ ] `getRequestBrand` gone; `grep -r "getRequestBrand" apps/web` = 0 (Stage 1).
- [ ] No `Brand` enum, no `brand` column, no `brand:` filter remaining (Stage 2).
- [ ] Live theme (BrandSettings), directory, lineage tree/drawer, claims all verified post-migration.
- [ ] CI green; one PR per Stage-1 wave + one migration PR for Stage 2.

## Origin

Teed up SESSION_0421 per ADR 0034's migration checklist ("full-prune the brand harness — incremental /
cloud-prompt batch"). Scope measured live: 451 `getRequestBrand` occurrences / 178 files / 43 models
with a `brand` column / `enum Brand` at `schema.prisma:395`.
