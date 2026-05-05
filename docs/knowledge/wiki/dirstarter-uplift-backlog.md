---
title: "Dirstarter Uplift Backlog"
slug: dirstarter-uplift-backlog
type: backlog
status: active
created: 2026-05-05
updated: 2026-05-05
last_agent: copilot-session-0074
pairs_with:
  - docs/knowledge/wiki/dirstarter-component-inventory.md
  - docs/knowledge/wiki/dirstarter-docs-inventory.md
  - docs/architecture/dirstarter-baseline-index.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0074.md
---

# Dirstarter Uplift Backlog

> **You already paid for this boilerplate. Use it.**

Items cataloged from `dirstarter-component-inventory.md` and `dirstarter-docs-inventory.md` that we have available but aren't using yet.

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
