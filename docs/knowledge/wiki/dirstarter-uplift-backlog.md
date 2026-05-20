---
title: "Dirstarter Uplift Backlog"
slug: dirstarter-uplift-backlog
type: backlog
status: superseded
created: 2026-05-05
updated: 2026-05-19
last_agent: codex-session-0204
pairs_with:
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/lane-ledger.md
  - docs/architecture/uplift/L1-env-deploy-diff-report.md
  - docs/knowledge/wiki/dirstarter-component-inventory.md
  - docs/knowledge/wiki/dirstarter-docs-inventory.md
  - docs/architecture/dirstarter-baseline-index.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/runbooks/baseline-listings-runbook.md
  - docs/sprints/SESSION_0165.md
  - docs/sprints/SESSION_0203.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0074.md
  - docs/sprints/SESSION_0164.md
  - docs/sprints/SESSION_0165.md
  - docs/sprints/SESSION_0203.md
  - docs/sprints/SESSION_0204.md
---

# Dirstarter Uplift Backlog

> **This backlog is closed as of SESSION_0204; see [`docs/architecture/uplift/epic-2026-05-19.md`](../../architecture/uplift/epic-2026-05-19.md).**
>
> Every item below has been reconciled against upstream `7e724b6` and assigned one disposition keyword: `reconciled-into-L5`, `reconciled-into-L6`, `reconciled-into-L8`, `replaced-by-upstream`, or `carried-as-domain-work`. Do not pick items off this list — pick lane work off the epic doc and the per-lane audit ledger at [`docs/architecture/uplift/lane-ledger.md`](../../architecture/uplift/lane-ledger.md).
>
> This file is retained for historical context and final archival at L15 (SESSION_0218) bow-out.

## Reconciliation summary (SESSION_0204 refresh)

| # | Easy win | Disposition | Where it lands in the epic |
| - | --- | --- | --- |
| 1 | Skeleton loading states | reconciled-into-L6 | SESSION_0209 TASK_01 — port `components/common/skeleton.tsx` composites to listing pages. |
| 2 | Tooltips on dashboard/admin | reconciled-into-L6 | SESSION_0209 TASK_01 — wire `Tooltip` to icon-only buttons. |
| 3 | Command palette (Cmd+K) | reconciled-into-L6 | SESSION_0209 TASK_02 — admin layout cmdk integration. |
| 4 | Toast/Sonner on actions | reconciled-into-L6 | SESSION_0209 TASK_02 — wire to all mutation paths via action client. |
| 5 | EmptyList for zero-state | reconciled-into-L6 | SESSION_0209 TASK_01 — port `components/common/empty-list.tsx`. |
| 6 | Dialog/Sheet ConfirmDelete | reconciled-into-L6 | SESSION_0209 TASK_02 — extract reusable `ConfirmDeleteDialog`. |
| 7 | MDX content | carried-as-domain-work | SESSION_0211 TASK_01 — upstream blog MDX informs L8, but program/school/technique MDX remains Ronin domain work. |
| 8 | OG image generation | reconciled-into-L8 | SESSION_0211 TASK_02 — dynamic OG handler per entity. |
| 9 | Sitemap generation | reconciled-into-L8 | SESSION_0211 TASK_02 — native `app/sitemap.ts`; remove `next-sitemap`. |
| 10 | Data-table column features | replaced-by-upstream | SESSION_0208 TASK_02 — older standalone easy-win scope is replaced by upstream data-table helper porting. |
| 11 | Blog/newsletter scaffolding | reconciled-into-L8 | SESSION_0211 TASK_01 — DB-driven blog wired to L3 `Post` model. |

## Historical content (frozen 2026-05-19)

> The sections below are the original backlog as of SESSION_0165's last edit. Kept intact for trace; superseded by the epic doc.

## Upstream freshness note

SESSION_0164 refreshed the local Dirstarter upstream reference to `7e724b6` on branch `upstream/dirstarter-main-20260514`. This backlog predates that update and should be treated as a historical uplift list until it is reconciled with `docs/architecture/dirstarter-upstream-sync-2026-05-14.md`.

Do not start a backlog item from this file without first checking whether upstream changed the relevant pattern.

## SESSION_0165 triage

The backlog is still useful, but the next executable work should follow the updated port-package order in `docs/architecture/dirstarter-baseline-index.md`:

1. Env/deploy comparison before touching production-sensitive config.
2. Baseline listings relabel planning before any Tool schema or route rename.
3. Small UI primitive sample with Playwright proof.
4. Vendor SDK review as its own lane.

The older "easy wins" below are no longer automatically next. They must be checked against Dirstarter upstream `7e724b6` and the Baseline Listings Runbook before implementation.

## High-leverage easy wins (< 1 session each)

### 1. Skeleton loading states on all listing pages

- **L1 ref:** `components/common/skeleton.tsx`
- **Where:** `/members`, `/schools`, `/tournaments`, `/programs`, `/techniques`
- **Current:** Most pages show nothing during load or use raw `animate-pulse` divs
- **Fix:** Replace with `<Skeleton />` composites matching each card layout
- **Estimate:** 0.5 session

### 2. Tooltips on dashboard tabs + admin actions

- **L1 ref:** `components/common/tooltip.tsx`
- **Where:** Dashboard tab triggers, admin table row actions, toolbar buttons
- **Current:** No tooltips anywhere — icon-only buttons have no accessible labels
- **Fix:** Wrap with `<Tooltip>` + descriptive content
- **Estimate:** 0.25 session

### 3. Command palette for admin navigation

- **L1 ref:** `components/common/command.tsx` (cmdk-based)
- **Where:** Admin layout — global Cmd+K
- **Current:** Admin navigation is sidebar-only
- **Fix:** Wire Command component with route list + entity search
- **Estimate:** 1 session

### 4. Toast/Sonner for action feedback

- **L1 ref:** `components/common/toast.tsx` (sonner)
- **Where:** All server actions (create/update/delete/status transitions)
- **Current:** Most actions silently succeed or show inline errors only
- **Fix:** Add toast notifications on mutation success/failure
- **Estimate:** 0.5 session

### 5. EmptyList component for zero-state

- **L1 ref:** `components/common/empty-list.tsx`
- **Where:** All listing pages when query returns 0 results
- **Current:** Some pages show nothing, some show raw "No results" text
- **Fix:** Consistent empty state with illustration + action CTA
- **Estimate:** 0.25 session

### 6. Dialog/Sheet for destructive confirmations

- **L1 ref:** `components/common/dialog.tsx`, `components/common/sheet.tsx`
- **Where:** Delete actions across admin (tournaments, programs, leads, etc.)
- **Current:** `tournaments-delete-dialog.tsx` exists but pattern not replicated
- **Fix:** Extract reusable `ConfirmDeleteDialog` and wire into all admin delete flows
- **Estimate:** 0.5 session

## Structural opportunities (1–2 sessions each)

### 7. MDX content for school/program pages

- **L1 ref:** Content Collections (already configured), MDX components
- **Where:** Program descriptions, school "about" pages, technique write-ups
- **Current:** Plain text fields only
- **Fix:** Enable MDX rendering for rich content with embedded components
- **Estimate:** 2 sessions

### 8. OG image generation per dynamic route

- **L1 ref:** Dirstarter OG image patterns
- **Where:** `/tournaments/[slug]`, `/members/[slug]`, `/schools/[slug]`, `/programs/[id]`
- **Current:** Default/static OG images only
- **Fix:** Dynamic OG image with entity name, image, key stats
- **Estimate:** 1 session

### 9. Sitemap generation

- **L1 ref:** `next-sitemap.config.cjs` (already in Dirstarter template)
- **Where:** All public pages
- **Current:** No sitemap
- **Fix:** Configure next-sitemap with dynamic routes for tournaments, members, schools, techniques
- **Estimate:** 0.5 session

### 10. Data-table column features

- **L1 ref:** `components/data-table/` (column visibility, faceted filters, date range)
- **Where:** Admin tables (tournaments, leads, registrations, programs)
- **Current:** Basic DataTable usage — not leveraging faceted filters or date range selectors
- **Fix:** Add faceted filters for status/type columns, date range for created/updated
- **Estimate:** 1 session

### 11. Blog/newsletter scaffolding

- **L1 ref:** Dirstarter blog module, newsletter component
- **Where:** Content marketing for dojos
- **Current:** Not started
- **Fix:** Enable blog + newsletter sign-up for each brand
- **Estimate:** 2 sessions

## Total estimate

- Easy wins: ~3 sessions
- Structural: ~7 sessions
- **Grand total: ~10 sessions of pure uplift work** (can be interleaved with feature work)
