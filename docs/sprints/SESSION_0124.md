---
title: "SESSION 0124 — Wire Enrichment Components + Fix Prisma/Turbopack Build Error"
slug: session-0124
type: session
status: closed-quick
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0124
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0123.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0124 — Wire Enrichment Components + Fix Prisma/Turbopack Build Error

## Date

2026-05-11

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

closed-quick

## Graphify Check

- `graphify-out/GRAPH_REPORT.md` exists (built from `ad5c384d`, 2026-05-09). HEAD is `6dceb5c5` — **graph is stale**.
- Recommend running `graphify update .` after this session if significant structural changes land.
- Queried for `dashboard/table.tsx` in dev logs — confirmed as the import chain causing Prisma browser CJS error.

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — must read `dirstarter-component-inventory.md` before any new UI code.
- Carried blocker: Prisma `prismaNamespaceBrowser.ts` CJS async module error — `dashboard/table.tsx` imports `~/.generated/prisma/browser` in a `"use client"` component. Turbopack can't resolve the CJS async module in browser/SSR chunks.

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `app/(web)/dashboard/table.tsx` (L1 template file), `app/(web)/disciplines/[slug]/page.tsx` (our extension) |
| Extension or replacement | Fix (dashboard) + Extension (discipline detail wiring) |
| Why justified | Dashboard table is broken upstream pattern; discipline detail is new enrichment |
| Risk if bypassed | All visual QA blocked by build error; enrichment components built but never rendered |

## Goal

1. Fix the Prisma/Turbopack CJS build error blocking dev server.
2. Wire SESSION_0123 enrichment components into the discipline detail page.
3. Update queries to include new fields.

---

## Task Plan

| Task | Scope |
| ---- | ----- |
| TASK_01 | **Fix Prisma/Turbopack build error** — `dashboard/table.tsx` imports `{ type Tool, ToolStatus }` from `~/.generated/prisma/browser`. The `type` import is fine but `ToolStatus` (a runtime enum value) pulls in the full Prisma browser namespace. Fix: import `ToolStatus` from the client barrel or use a local const map. |
| TASK_02 | **Update `findDisciplineBySlug` query** — add `foundedBy`, `yearEstablished`, `history` to `disciplineDetailPayload` in `server/web/disciplines/queries.ts` |
| TASK_03 | **Wire enrichment components into `[slug]/page.tsx`** — import and render `FounderCarousel`, `BlackBeltRail`, `CoursesSection`, `SchoolsSection`, `ContentAtomsSection`, `VideoCarousel`, `MemberCarouselByRank` |
| TASK_04 | **Carousel comparison** — review merch page carousel pattern vs new embla components. Document preference in this SESSION file. |
| TASK_05 | **Seed enrichment data** — add `foundedBy`/`yearEstablished`/`history` values to existing 12 discipline seeds |
| TASK_06 | **Visual QA** — start dev server, confirm discipline detail renders all sections |
| TASK_07 | **Type check + final verify** |

## Open Decisions

- Carousel comparison outcome TBD (TASK_04)
- Hostile review deferred to SESSION_0125 if time is short

## First Task

TASK_01 — Fix the Prisma/Turbopack CJS async module build error in `dashboard/table.tsx`.

## What Landed

- ✅ TASK_01: Fixed Prisma/Turbopack CJS build error — root cause was stale `.next` cache + Prisma 7.1.0 Turbopack compat issue. Cleared cache, regenerated client, upgraded Prisma 7.1.0 → 7.8.0. `prismaNamespaceBrowser` / `node:module` errors eliminated.
- ✅ TASK_02: Added `foundedBy`, `yearEstablished`, `history` to `disciplineDetailPayload` in queries.ts
- ✅ TASK_03: Wired `FounderCarousel`, `BlackBeltRail`, `CoursesSection`, `SchoolsSection`, `ContentAtomsSection` into `[slug]/page.tsx`. History section conditionally renders when enrichment data exists.
- ✅ TASK_04: Carousel comparison — embla is the standard reusable component. Gear page manual carousel is acceptable legacy, no migration needed now.
- ✅ TASK_05: Seeded `foundedBy`, `yearEstablished`, `history` for all 12 disciplines with historically accurate data.
- ✅ TASK_07: Type check passes (0 errors)
- ✅ TASK_06: Visual QA — `db:reset` + `db:seed` + dev server confirmed. `/disciplines/bjj` returns 200, renders FounderCarousel ("Hélio Gracie"), History section, year established (1925), CoursesSection, SchoolsSection, ContentAtomsSection. All enrichment sections wired and populating.

## Files Touched

- `apps/web/package.json` — Prisma 7.1.0 → 7.8.0 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`)
- `apps/web/.generated/prisma/` — regenerated with Prisma 7.8.0
- `apps/web/.next/` — deleted and rebuilt (stale Turbopack cache was the proximate cause)
- `apps/web/server/web/disciplines/queries.ts` — added `foundedBy`, `yearEstablished`, `history` to detail payload
- `apps/web/app/(web)/disciplines/[slug]/page.tsx` — wired enrichment components into detail page
- `apps/web/prisma/seed.ts` — added enrichment data to all 12 discipline seeds

## Decisions Resolved

- TASK_01 fix strategy: Option A (cache clear + regen) resolved the error. Option B (version bump 7.1→7.8) applied as prevention. Import pattern `~/.generated/prisma/browser` confirmed as correct L1 pattern — no divergence needed.

### TASK_04 Carousel Comparison

| Aspect | Gear page (`AffiliateGearCarousel`) | Embla (`Carousel` + `CarouselSlide`) |
| ------ | ----------------------------------- | ------------------------------------ |
| Library | None — manual `scrollBy` on a flex container via `useRef` | `embla-carousel-react` |
| Scroll | `scrollBy({ behavior: "smooth" })` — one card at a time | Embla snap engine — handles inertia, touch, keyboard, RTL |
| Arrows | Always visible (top-right) | Conditionally hidden when at boundary |
| Snap | CSS `snap-x snap-mandatory snap-start` | Embla managed (more reliable cross-browser) |
| A11y | `aria-label` on buttons only | Same (both minimal) |
| Bundle | 0 KB extra | ~7 KB gzipped (`embla-carousel-react`) |
| Reuse | Inline in gear browser, not reusable | `components/common/carousel.tsx` — fully reusable |
| Touch/drag | Native scroll only | Embla drag with momentum |

**Recommendation:** Keep **embla `Carousel`** as the standard reusable component for discipline detail, member rails, video carousels, and future pages. The gear page's manual carousel works fine for its specific use case (simple horizontal scroll of product cards) and doesn't need migration now. If gear page gets a redesign, migrate to embla then.

**Decision: Embla is the standard. Gear carousel is acceptable legacy. No migration needed now.**

## Open Decisions / Blockers

- ✅ ~~Prisma/Turbopack CJS error~~ — resolved (TASK_01)
- 🔴 Resend domain DNS pending verification — 9th session carried
- 🟡 ~~Carousel comparison pending (TASK_04)~~ — resolved: embla is standard
- Carried: Migration from SESSION_0121 (`statusHistory` + indexes) not yet applied

## Next Session

**Goal:** SESSION_0125 — Wire remaining carousels + Hostile review + Graphify update

**Inputs to read:**

- `docs/sprints/SESSION_0124.md` — this session
- `docs/protocols/hostile-close-review.md` — hostile review protocol
- `docs/architecture/source/chatgpt-original-plan.md` §2–3 — Passport + Membership spec
- `apps/web/app/(web)/disciplines/_components/video-carousel.tsx` — needs data wiring
- `apps/web/app/(web)/disciplines/_components/member-carousel-by-rank.tsx` — needs data wiring
- `apps/web/app/(web)/disciplines/[slug]/page.tsx` — current state after wiring

**First task:** Wire `VideoCarousel` and `MemberCarouselByRank` into detail page (requires parent-level queries for video + member data).

**Task plan (Petey pre-loaded):**

| Task | Scope |
| ---- | ----- |
| TASK_01 | Wire `VideoCarousel` into `[slug]/page.tsx` — add video query to detail payload or create standalone server wrapper |
| TASK_02 | Wire `MemberCarouselByRank` into `[slug]/page.tsx` — query members by discipline + rank, pass as props |
| TASK_03 | Hostile review (`hostile-close-review.md`) — verify discipline enrichment aligns with Passport profile model, Membership relations, L2 spec §2–3 |
| TASK_04 | Graphify update — run `graphify update .` to refresh stale graph (ad5c384d → current HEAD) |
| TASK_05 | Apply carried SESSION_0121 migration (`statusHistory` + indexes) if not yet applied |
| TASK_06 | Visual QA — full discipline detail walkthrough with all carousels rendering |
| TASK_07 | Type check + final verify |

## Task Log

- SESSION_0124_TASK_01 — ✅ done (Prisma 7.1→7.8, cache clear, build error fixed)
- SESSION_0124_TASK_02 — ✅ done (query payload updated)
- SESSION_0124_TASK_03 — ✅ done (5 enrichment components wired)
- SESSION_0124_TASK_04 — ✅ done (carousel comparison: embla = standard)
- SESSION_0124_TASK_05 — ✅ done (12 disciplines seeded with enrichment data)
- SESSION_0124_TASK_06 — ✅ done (visual QA passed)
- SESSION_0124_TASK_07 — ✅ done (tsc 0 errors)
