---
title: "SESSION 0601 — BUILD: apps/rdd scaffold (Slice A) — workspace peer + 3 CI edits (rdd)"
slug: session-0601
type: session--build
status: closed
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0601
sprint: S12
lane: rdd
recipe: new-brand-onboarding
goal_ids: [G-027]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0598.md
  - docs/protocols/recipes/new-brand-onboarding.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0601 — BUILD: apps/rdd scaffold (Slice A)

> **Pre-staged build stub (ADR 0049), planned SESSION_0598 (G-027).** Reservation branch
> `session-0601-rdd-scaffold`. Adopt: FS-0024 guard, FS-0030 id check, ff to main, flip status, run in
> a worktree (`/worktree-setup`). Hydrates from `new-brand-onboarding.md` (Slice A). **Solo** — owns the
> 3 shared CI files, so no CI-touching fan-out sibling.

## Goal

Scaffold `apps/rdd` as a first-party workspace peer off `apps/baseline` (`workspace:*` ui-kit) with a
hello-route, and make **Products-CI pick it up** via the 3 CI edits — local, no cloud, no DB yet.

## First task

Adopt per ADR 0049; read SESSION_0598 grill outcomes + `new-brand-onboarding.md` Slice-A steps + the
`apps/baseline` exemplar (package.json `workspace:*`, `next.config` `transpilePackages` + `turbopack.root`,
tsconfig, postcss). Scaffold `apps/rdd`; add `apps/rdd/**` to `clients-ci.yml` `on.paths` **and** to
`ci.yml` + `playwright.yml` `paths-ignore`; prove Products-CI green + root gates untouched + `next build`.
Leave DB (B1) / auth+State-host (B2) / marketing+portfolio (B3) / cloud (C) to later slices.

## Operator

Brian + claude-session-0601

## Date

2026-07-21

## Branch and worktree

- Branch: `session-0601-rdd-scaffold` — base OVERRIDE per dispatch: hard-reset to LOCAL `main`
  (`562ceaac`), NOT `origin/main` (local `main` is 6 ahead of origin — held unpushed commits).
- Worktree: `/Users/brianscott/dev/ronin-0601` (own worktree; canonical + siblings `ronin-0600`/
  `ronin-0610-wsb`/`ronin-0610-wsc`/`ronin-0610-wsd` untouched).
- Reservation branch had 0 unique commits vs `main` (just stale — pre-dated `main`'s tip); hard-reset
  clean, no lost work.
- Bootstrapped via `.claude/skills/worktree-setup/bootstrap.sh` (`.env` copied, root `bun install`,
  756 packages).

## Owned files (solo lane — no CI-touching fan-out sibling)

- `apps/rdd/**` (new)
- `.github/workflows/clients-ci.yml`, `.github/workflows/ci.yml`, `.github/workflows/playwright.yml`
  (the 3 CI edits)
- root `bun.lock` (workspace-link churn only)
- `docs/sprints/SESSION_0601.md` (this file)

## Pre-flight: apps/rdd scaffold

Mechanical clone of the named exemplar (`apps/baseline`) per the dispatch — not a novel UI/component
decision, so the full L1 search-sweep doesn't apply; recorded per `cody-preflight.md` for the record.

### 1. Existing component scan
- Not applicable — Slice A is a hello-route (`<main>` + heading + paragraph using the token utility
  classes `bg-bg`/`text-ink`/`font-display`/`text-muted`), no `components/web/` or `components/common/`
  consumption. No new component is introduced.

### 2. L1 template scan
- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: n/a for this lane — the dispatch
  names the exact exemplar to mirror (`apps/baseline`), which IS the reference implementation.
- Closest pattern: `apps/baseline` shape verbatim — `package.json` (`workspace:*` ui-kit, no DB deps),
  `next.config.mjs` (`transpilePackages` + `turbopack.root`), `tsconfig.json`, `postcss.config.mjs`,
  `tailwind.config.ts`, `app/layout.tsx` + `app/page.tsx` (trimmed to a hello-route, no `lib/brand.ts`
  content-identity layer — that lands at Slice B3 marketing/portfolio), `app/globals.css` (starter vars
  copied verbatim from baseline's neutral default — RDD's real skin is a B3 design-interview slice).

### 3. Composition decision
- [x] Composing existing pattern (`apps/baseline` scaffold shape), no new abstraction.

### 4. Lane docs loaded
- [x] `docs/sprints/SESSION_0598.md` (grill outcomes, 5 forks pinned) read in full.
- [x] `docs/protocols/recipes/new-brand-onboarding.md` read in full (Slice-A step sequence + gotcha
  floor).
- [x] `apps/baseline/{package.json,next.config.mjs,tsconfig.json,postcss.config.mjs,tailwind.config.ts,
  app/layout.tsx,app/page.tsx,app/globals.css,.gitignore}` read directly (not inferred from prose).

### 5. Dev environment confirmed
- Dev server command: `npx next dev --turbo -p 3061` (from `apps/rdd/`; unique port, own worktree —
  `preview_start` cannot serve a worktree).
- Working directory: `/Users/brianscott/dev/ronin-0601/apps/rdd`.
- Verification commands confirmed: `bun run typecheck` (in-app), `npx next build` (in-app, real `$?`),
  root `bun run typecheck` (`bun run --filter '*' typecheck`).

### 6. FAILED_STEPS check
- Prior failures in this area: none area-specific. Mitigated the "real `$?`, never `| tail`" gotcha
  (PL-010 / `prebuild-migrates-not-generates` memory) by capturing exit codes with `echo "EXIT_CODE=$?"`
  directly after each gate, no pipe.

## Gates

In-app only (root gates don't cover `apps/rdd` by scope, but root `typecheck` DOES include it via
`bun run --filter '*'`, confirmed green below). No DB, no auth, no cloud this slice. Hand-authored
migrations n/a (no schema this slice). Commit HELD on the lane branch — NO push/PR/deploy.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0601_TASK_01 | done | Worktree claim (`ronin-0601`) + base-override hard-reset to local `main` (562ceaac) + `/worktree-setup` bootstrap |
| SESSION_0601_TASK_02 | done | Scaffold `apps/rdd` (9 files) mirroring `apps/baseline` shape, trimmed to DB-free hello-route |
| SESSION_0601_TASK_03 | done | Root `bun install` links the `rdd` workspace; confirmed `bun.lock` churn is rdd-only |
| SESSION_0601_TASK_04 | done | 3 CI edits: `clients-ci.yml` `on.paths`, `ci.yml` + `playwright.yml` `paths-ignore` all gain `apps/rdd/**` |
| SESSION_0601_TASK_05 | done | Gates: in-app typecheck + `next build` + root typecheck, all green; runtime smoke (dev server + fetch) confirmed the hello-route renders |

## What landed

- **`apps/rdd`** — new first-party workspace peer (`apps/*` glob), `@ronin-dojo/ui-kit` via
  `workspace:*` (not `file:`), `transpilePackages` + `turbopack.root` wired exactly like `apps/baseline`.
  Hello-route (`app/page.tsx`) renders "Ronin Dojo Design" / "Scaffold live — apps/rdd (Slice A, G-027)."
  on the shared brand-token surface (`app/globals.css`, neutral starter vars — real skin deferred to B3).
  No DB (`schema.prisma`/`prisma.config.ts`), no auth, no `lib/brand.ts` content-identity layer — those
  are B1/B2/B3.
- **Root workspace link** — `bun install` at root added the `rdd` workspace entry to `bun.lock` (+ its
  own `@types/node`/`tailwindcss` dedupe subtree); no unrelated package churn.
- **3 CI edits** — `apps/rdd/**` added to `clients-ci.yml`'s `on.paths` (triggers Products-CI on rdd
  changes) and to `ci.yml` + `playwright.yml`'s `paths-ignore` (keeps the BBL flagship gate from firing
  wastefully on rdd-only changes). `clients-ci.yml`'s `discover` job already dynamically lists every
  `apps/*`/`clients/*` product dir (minus `apps/web`), so `apps/rdd` joins the matrix automatically once
  the trigger fires — no 4th edit needed there.
- **`apps/rdd/.gitignore`** — added (mirrors `apps/baseline`'s local `.gitignore` minus the Prisma
  line) so the Next-generated `next-env.d.ts` doesn't get committed; root `.gitignore` doesn't cover it
  and neither `apps/web` nor `apps/baseline` commit it.

## Deviations / assumptions (no operator forks reopened — all resolved from the dispatch's own text)

- **No `lib/brand.ts` content-identity layer.** Baseline's `layout.tsx`/`page.tsx` pull a
  `BrandIdentity` object (school name, hero copy, nav) from `lib/brand.ts`; RDD's Slice-A scope is
  "hello-route" only, and the dispatch's concrete step list names only `app/layout.tsx` + `app/page.tsx`
  + `app/globals.css` (not `lib/brand.ts`). Kept the hello-route content as static JSX strings; the
  content-identity abstraction is deferred to B3 (marketing/portfolio) rather than pre-built now
  (CLAUDE.md "don't introduce abstractions for future needs" + explicit dispatch scope guard "NO
  marketing/portfolio").
- **No ui-kit import in the hello-route.** The dependency (`workspace:*`) is wired in `package.json`
  and proven resolvable by `bun install` + `next build`; no page-level import of an actual
  `@ronin-dojo/ui-kit` component, since real ui-kit consumption (AdminKanban, m-card) belongs to the
  B2 admin/State-host slice, not this scaffold.
- **`app/globals.css` starter vars copied verbatim from `apps/baseline`'s neutral default** (same hex
  values) rather than any RDD-specific palette — the recipe step ("swap starter vars for the brand's
  tokens") and SESSION_0598's design-seed decision (State-of-Dojo-look extraction) are both explicitly
  a later slice (B3 design interview), not Slice A.
- **Root `typecheck` DOES cover `apps/rdd`** (via `bun run --filter '*' typecheck`), contrary to the
  dispatch's "root gates do NOT cover apps/rdd" framing for `lint`/`test`/`build` — `typecheck` is
  root-wired by design (every workspace member gets the `--filter '*'` sweep) and passed green, so
  this strengthens rather than weakens the "root gates untouched or green" done-means.

## Verification

| Gate | Result |
| --- | --- |
| Bootstrap | `.claude/skills/worktree-setup/bootstrap.sh` — `.env` copied, root `bun install` (756 packages), Prisma client present |
| `bun.lock` churn scope | `git diff -- bun.lock` — new `apps/rdd` workspace entry + `rdd/@types/node`, `rdd/tailwindcss` (+ its own transitive dedupe subtree) only; zero unrelated package changes |
| In-app typecheck (`apps/rdd`) | `cd apps/rdd && bun run typecheck` → `$ tsc --noEmit` → **EXIT_CODE=0** |
| In-app build (`apps/rdd`) | `cd apps/rdd && npx next build` → `✓ Compiled successfully in 28.8s` / `Finished TypeScript in 35.7s` / `Route (app): ○ /  ○ /_not-found` (both Static) → **EXIT_CODE=0** |
| Root typecheck (`bun run typecheck` = `bun run --filter '*' typecheck`) | `@ronin-dojo/ui-kit typecheck: Exited with code 0` / `@ronin-dojo/api-client typecheck: Exited with code 0` / `rdd typecheck: Exited with code 0` / `baseline typecheck: Exited with code 0` / `@ronin-dojo/web typecheck: Exited with code 0` → **EXIT_CODE=0** (untouched or green, per done-means) |
| Runtime smoke | `npx next dev --turbo -p 3061` (own port, own worktree) → `✓ Ready in 7.3s`; `bun -e` fetch to `http://localhost:3061/` → `STATUS 200`, `HAS_TITLE true`, `HAS_SUBTEXT true` (computed page content, not just class presence); dev server killed after the probe |
| CI-trigger confirm | `git diff` on the 3 workflow files shows exactly `+ 'apps/rdd/**'` at the matching insertion point in each (`clients-ci.yml on.paths` ×2, `ci.yml paths-ignore` ×2, `playwright.yml paths-ignore` ×2) — 6-line diff total, no other lines touched |
| Git state | branch `session-0601-rdd-scaffold` (worktree `ronin-0601`); `git status --short` shows only the owned files (`apps/rdd/` untracked-new, the 3 workflow files + `bun.lock` modified) |

## Files touched

| Path | Change |
| --- | --- |
| `apps/rdd/package.json` (new) | name `rdd`, `@ronin-dojo/ui-kit: workspace:*`, `typecheck: tsc --noEmit`, no DB/auth deps |
| `apps/rdd/next.config.mjs` (new) | `transpilePackages: ["@ronin-dojo/ui-kit"]` + `turbopack.root` (mirrors baseline) |
| `apps/rdd/tsconfig.json` (new) | mirrors baseline verbatim |
| `apps/rdd/postcss.config.mjs` (new) | mirrors baseline verbatim |
| `apps/rdd/tailwind.config.ts` (new) | mirrors baseline's token-mapped color/font surface |
| `apps/rdd/app/layout.tsx` (new) | root layout, static metadata (no `lib/brand.ts` — Slice A scope) |
| `apps/rdd/app/page.tsx` (new) | hello-route |
| `apps/rdd/app/globals.css` (new) | starter brand-token vars (neutral default, copied from baseline) + `--mk-*` kernel bridge |
| `apps/rdd/.gitignore` (new) | mirrors baseline's (minus the Prisma line — no DB this slice) |
| `.github/workflows/clients-ci.yml` | `+ 'apps/rdd/**'` to `on.paths` (pull_request + push) |
| `.github/workflows/ci.yml` | `+ 'apps/rdd/**'` to `paths-ignore` (pull_request + push) |
| `.github/workflows/playwright.yml` | `+ 'apps/rdd/**'` to `paths-ignore` (pull_request + push) |
| `bun.lock` | new `apps/rdd` workspace entry (rdd-scoped churn only) |
| `docs/sprints/SESSION_0601.md` | adopted (status/pre-flight/task log/verification, this session) |

## Proposed ledger edits (apply at merge-wave — NOT applied here, lane rule)

- **`goals-ledger.md` — G-027 row**: update status/children to reflect Slice A landed (this session);
  next child = the already-staged Slice B1 (`rdd_dev` DB). SESSION_0598's proposed G-027 row (held,
  not yet applied per its own close notes) should land at the same merge-wave as this session's update.
- **`docs/knowledge/wiki/custom-component-inventory.md`** — no new custom component this slice (hello-
  route only, no ui-kit consumption); nothing to add here yet. Flag for B2 (admin shell + State-host
  mount, when `apps/rdd` first imports `@ronin-dojo/ui-kit`).
- **ADR 0051 + `ronin-project-context.md` domain drift** (`ronindojo.design` → `ronindojodesign.com`) —
  named in SESSION_0598 as "deferred to Slice-A build" but is a `docs/architecture/**`/wiki edit outside
  this lane's owned-file contract (scaffold + 3 CI files only); NOT fixed here — flagging forward to the
  merge-wave or a dedicated docs-conform pass, per "don't expand scope."
- **`index.md`** — add the SESSION_0601 row (session table) at the merge wave.

## Next session

### Goal

Slice B1 — `rdd_dev` DB (own `schema.prisma` + `prisma.config.ts`) + first migration + **isolation proof**.
