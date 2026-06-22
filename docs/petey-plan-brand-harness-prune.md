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

## Paste-ready cloud prompts — Stage 1 batch (4 waves)

> Each wave is a cold cloud agent on its own branch/worktree (disjoint dirs → safe to run in
> parallel). **Run order:** kick **after** any in-flight read-model PR (e.g. #151) has merged to
> `main`, so waves branch off a `main` that includes it. One DRAFT PR per wave. **Pause-on-merge:
> the operator merges.** Wave 4 runs **last** (it deletes `getRequestBrand` — only valid once 1–3
> have removed every call site).

**Shared preamble (prepend to every wave prompt):**

```text
Work in Ronin-Dojo-Design/ronin-dojo-baseline (apps/web), on a fresh branch off main. Confirm `pwd`
+ `git remote get-url origin` (must be ronin-dojo-baseline) before any mutating git. This is Stage 1
of docs/petey-plan-brand-harness-prune.md — READ that plan's "Shared mechanics" + "Stage 1" first.

GOAL (this wave only): remove `getRequestBrand()` call sites in this wave's directory and de-thread
the brand param, WITHOUT touching schema. Mechanics:
- `const brand = await getRequestBrand()` that only feeds `where: { brand }` → drop the line, inline
  `Brand.BBL` at the filter (KEEP the filter), and drop the now-dead `await`/`async` if it was the
  only await.
- `brand` threaded as a function param across modules → collapse it: callers stop passing it, callee
  inlines `Brand.BBL`.
HARD RULES: do NOT remove `brand:` filters, the `Brand` enum, or any schema field (that's Stage 2).
Keep `getRequestOrigin`/`resolveRequestOrigin` (origin ≠ brand). NEVER value-import the generated
`Brand` enum into a `"use client"` module — inline the `"BBL"` constant there (Prisma-in-browser 500s).
Do NOT delete `getRequestBrand` itself (Wave 4 does that).
GATE (run via the LOCAL oxc bin, never bunx): `next typegen && tsc --noEmit` clean · `bun test` on
touched areas green · local `next build` on any changed `"use server"`/route module · `bun run
lint:check` + `format:check` clean. If you add ANY dep, run non-frozen `bun install` and COMMIT
bun.lock (CI is --frozen-lockfile). Run oxfmt on every changed file.
DELIVERY: conventional commits ending `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`;
push; open a DRAFT PR; do NOT merge. End PR body with the Claude Code generated-by line and a
gate-results table + the exact `grep -rc getRequestBrand` before/after counts for this wave's dir.
```

**Wave 1 — `apps/web/server/web/**`** (branch `claude/brand-prune-w1-server-web`)
```text
[shared preamble] Wave 1 scope: apps/web/server/web/** ONLY (the largest cluster — schedule, merch,
lead, enrollment, course-enrollment, lineage, family, billing, media actions/queries). Sweep every
getRequestBrand site in that subtree; leave all other dirs untouched. PR title:
"refactor(brand-prune): Stage 1 wave 1 — de-thread getRequestBrand in server/web".
```

**Wave 2 — `apps/web/server/admin/**`** (branch `claude/brand-prune-w2-server-admin`)
```text
[shared preamble] Wave 2 scope: apps/web/server/admin/** ONLY (programs, tournaments, leads, content,
pricing-plans queries/actions). Leave all other dirs untouched. PR title:
"refactor(brand-prune): Stage 1 wave 2 — de-thread getRequestBrand in server/admin".
```

**Wave 3 — `apps/web/app/**` + `apps/web/lib/**` + `apps/web/components/**`** (branch `claude/brand-prune-w3-app-lib-components`)
```text
[shared preamble] Wave 3 scope: apps/web/app/**, apps/web/lib/**, apps/web/components/** ONLY (route
handlers, pages, layouts, lib helpers, client-shared brand reads). ⚠ EXTRA CARE: any `"use client"`
chrome must inline the "BBL" string constant — never value-import the generated `Brand` enum (it
pulls Prisma into the browser → 500s; `next build` catches it, tsc does not, so run `next build`).
Do NOT edit lib/brand-context.ts's `getRequestBrand` definition (Wave 4). Leave server/** untouched.
PR title: "refactor(brand-prune): Stage 1 wave 3 — de-thread getRequestBrand in app/lib/components".
```

**Wave 4 — tests + stragglers + delete `getRequestBrand`** (branch `claude/brand-prune-w4-delete`)
```text
[shared preamble] Wave 4 runs LAST, after waves 1–3 are merged. Scope: *.test.ts, e2e seeds, any
remaining stragglers, THEN delete `getRequestBrand` from apps/web/lib/brand-context.ts. Acceptance:
`grep -r "getRequestBrand" apps/web` returns 0 (paste the zero result in the PR body). Keep the
`Brand` enum + `brand:` filters + columns standing (Stage 2). PR title:
"refactor(brand-prune): Stage 1 wave 4 — finish sweep + delete getRequestBrand".
```

### Staged follow-up — m-card slice 3 (kick ONLY after Stage 1 lands)

m-card slice 3 (task/loop kinds + migrate remaining roster surfaces + deprecate `facet-result-card`/
`bjj-passport-card`/`listing-card`) churns `apps/web/components/**` — the same dir as Wave 3. **Do not
run it concurrently with brand-prune.** Kick it after Stage 1 is merged and green, off a fresh `main`.
Prompt template: mirror the slice-2 brief (build on existing `m-card.tsx` + Dirstarter base; one
coherent slice; presentation-only mappers; token-only theming; full proof gate; commit bun.lock if
deps change; draft PR; pause-on-merge).

## Origin

Teed up SESSION_0421 per ADR 0034's migration checklist ("full-prune the brand harness — incremental /
cloud-prompt batch"). Scope measured live: 451 `getRequestBrand` occurrences / 178 files / 43 models
with a `brand` column / `enum Brand` at `schema.prisma:395`. Stage 1 paste-ready wave prompts added
this session, sequenced after the now-merged Passport DTO surface work (#146/#147).
