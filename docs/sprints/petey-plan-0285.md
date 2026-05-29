---
title: "Petey plan 0285 — Brand-aware page metadata + JSON-LD (kill the og:site_name leak)"
slug: petey-plan-0285
type: petey-plan
status: active
created: 2026-05-28
updated: 2026-05-28
last_agent: claude-session-0284
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0284.md
  - docs/runbooks/white-label-site-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey plan 0285 — Brand-aware page metadata + JSON-LD

## Context

SESSION_0284 converted 30 of 48 `siteConfig.name` refs to brand-aware and verified the page `<title>` resolves per brand on `bbl.local`. But two surfaces still leak "Baseline Martial Arts" on **every** brand subpage:

- **`og:site_name`** — from the static `metadataConfig` object in `apps/web/config/metadata.ts`.
- **JSON-LD** organization + website names — from `getOrganization()` / `getWebSite()` in `apps/web/lib/structured-data.ts`.

Both funnel through two **synchronous** central helpers in `apps/web/lib/pages.ts`:

- `getPageMetadata({ url, ogImage, metadata })` — spreads `metadataConfig` → `og:site_name`.
- `getPageData(url, title, description, options)` — calls `getOrganization()` + `getWebSite()` → JSON-LD.

Because the leak is centralized, one refactor fixes it everywhere — but the helpers are sync and brand-unaware, and **46 page files** call them. This is the highest-leverage white-label fix (it serves the `ronindojodesign.com` demo and BBL launch), staged ahead of the assets→S3 lane.

## Goal

Make page `og:site_name` and JSON-LD organization/website names brand-aware across all pages by brand-threading the two `lib/pages.ts` helpers — no per-page metadata logic duplicated.

## Tasks

#### SESSION_0285_TASK_01 — Brand-thread the central metadata/JSON-LD helpers

- **Agent:** Cody
- **What:** Make the leak sources accept/resolve a brand.
- **Steps:**
  1. `config/metadata.ts`: convert `metadataConfig` (static) so `openGraph.siteName` is brand-resolvable — either export `getMetadataConfig(brand)` or drop `siteName` here and set it in the helper from `getBrandSiteConfig(brand).name`.
  2. `lib/structured-data.ts`: give `getOrganization()` / `getWebSite()` a `brand` param and use `getBrandSiteConfig(brand).name` (+ url when per-brand url lands; for now name only).
  3. `lib/pages.ts`: make `getPageData` and `getPageMetadata` `async`, call `await getRequestBrand()` internally, and pass brand down to (1) and (2). Keep signatures otherwise stable.
- **Done means:** helpers compile; `og:site_name` + JSON-LD names derive from the request brand.
- **Depends on:** nothing.

#### SESSION_0285_TASK_02 — Await the 46 callers

- **Agent:** Cody
- **What:** Update every caller of the now-async helpers.
- **Steps:**
  1. `grep -rln "getPageMetadata\|getPageData" apps/web` → 46 files (all in `generateMetadata` / server components).
  2. Add `await`; confirm each call site is in an async server context (NOT a client component, NOT module top-level). Flag any that aren't — those need a different path.
  3. `cd apps/web && bun run typecheck` (NOT `pnpm --filter` — see risks) → 0 errors.
- **Done means:** typecheck clean across all 46 callers; no client/module-scope `getRequestBrand()` calls.
- **Depends on:** TASK_01.

#### SESSION_0285_TASK_03 — Verify brand isolation

- **Agent:** Doug
- **What:** Prove the leak is gone without regressing Baseline.
- **Steps:** dev server smoke on `bbl.local:3000` for `/about`, `/terms`, `/privacy`, `/blog`: `og:site_name` = "Black Belt Legacy" and JSON-LD org/website name = "Black Belt Legacy"; **0** "Baseline Martial Arts" hits. Spot-check default host still resolves Baseline.
- **Done means:** 0 Baseline leaks on BBL subpages; Baseline host unchanged.
- **Depends on:** TASK_02.

## Parallelism

Sequential: TASK_01 → TASK_02 → TASK_03 (each depends on the prior). TASK_02 is mechanical/wide; a single agent on `main` is fine (no disjoint split worth a worktree).

## Open decisions

- None blocking. (Per-brand `url`/`email` is still a separate later item — this plan does name only.)

## Risks

- **Async ripple:** making the helpers async forces `await` in 46 callers. Any caller not already async, or in a client component, breaks — TASK_02 step 2 must catch these.
- **Workspace filter drift:** use `cd apps/web && bun run typecheck` to verify. `pnpm --filter dirstarter` matches nothing (renamed to `@ronin-dojo/web`), and `pnpm --filter @ronin-dojo/web typecheck` can fail locally on the `packageManager: bun@1.2.2` spec. `bun run typecheck` is the verified-working local gate (SESSION_0284).
- **Background subagents:** if delegated, pre-authorize the typecheck command or the agent will block on the permission prompt and may derail (SESSION_0284 incident).

## Scope guard

Name only. NOT this session: per-brand `url`/`email`/`domain`, email-template brand props, assets→S3, media CRUD.

## Dirstarter implementation template

- **Docs read first:** ADR 0021/0022 (brand chrome); dirstarter content/SEO alignment URLs.
- **Baseline pattern to extend:** Dirstarter `config/metadata.ts` + `lib/pages.ts` + `lib/structured-data.ts` metadata pipeline; Ronin's `getRequestBrand()` / `getBrandSiteConfig()` layer.
- **Custom delta:** brand resolution inside the shared page-data helpers; no new abstraction, no per-page duplication.
- **No-bypass proof:** extends the existing metadata pipeline rather than replacing it; `siteConfig` defaults remain the fallback.

## Verification

- `cd apps/web && bun run typecheck` → 0 errors.
- `bun biome check` on touched files → clean.
- `bbl.local:3000` smoke: `og:site_name` + JSON-LD = "Black Belt Legacy"; 0 "Baseline Martial Arts" on `/about`, `/terms`, `/privacy`, `/blog`.
- Update the white-label runbook audit table: flip `og:site_name` + JSON-LD rows to ✅.
