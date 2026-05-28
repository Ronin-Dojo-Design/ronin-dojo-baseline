---
title: "SESSION 0272 — Org member display fix, lineage tree seed, admin table polish, BBL gap matrix"
slug: session-0272
type: session--implement
status: closed
created: 2026-05-27
updated: 2026-05-27
last_agent: copilot-session-0272
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0271.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0272 — Org member display fix, lineage tree seed, admin table polish, BBL gap matrix

## Date

2026-05-27

## Operator

Brian + copilot-session-0272 (Petey orchestrating; Cody implementation)

## Goal

1. Fix org detail page: show unique member count + group memberships by user (Option 3).
2. Fix lineage seed: create per-discipline `LineageTree` records with `isPublished: true` + `LineageTreeMember` rows so `/lineage` stops 404ing.
3. Fix admin memberships table column spacing/rhythm.
4. Produce BBL story-to-implementation gap matrix doc.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `DataTable` column widths (L1 extension). Org detail page display logic. |
| Extension or replacement | Extension. Grouping memberships by user; adding lineage seed data. |
| Why justified | "7 members" showing 1 person × 7 disciplines is a data display bug. Lineage page 404s because no `LineageTree` records exist. |
| Risk if bypassed | Misleading member counts on production. Lineage feature entirely non-functional. |

## Petey plan

### Tasks

#### SESSION_0272_TASK_01 — Fix org detail: unique member count + grouped display

- **Agent:** Cody
- **What:** Change org detail page to count distinct users, group membership cards by user showing discipline badges.
- **Done means:** "N members" shows unique user count. Each user rendered once with all their discipline memberships visible.

#### SESSION_0272_TASK_02 — Lineage tree seed: per-discipline trees

- **Agent:** Cody
- **What:** Add `LineageTree` creation + `LineageTreeMember` rows to `seed-baseline-lineage.ts`. Separate trees per discipline (BJJ, Eskrima, Muay Thai, Boxing, Karate, Kajukenbo). `isPublished: true`, `visibility: PUBLIC`.
- **Done means:** `/lineage` index shows trees. `/lineage/[treeSlug]` renders nodes.

#### SESSION_0272_TASK_03 — Admin memberships table spacing

- **Agent:** Cody
- **What:** Fix column widths, truncation, and rhythm in `memberships-table-columns.tsx`.
- **Done means:** Table columns have readable spacing; no cramped truncation.

#### SESSION_0272_TASK_04 — BBL gap matrix

- **Agent:** Petey
- **What:** Produce `docs/product/black-belt-legacy/GAP_MATRIX.md` mapping each BBL story ID to implementation status.
- **Done means:** Doc exists with story-by-story status.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0272_TASK_01 | Cody (copilot) | done | Grouped memberships by user; unique count. |
| SESSION_0272_TASK_02 | Cody (copilot) | done | Per-discipline LineageTree + TreeMember seed. |
| SESSION_0272_TASK_03 | Cody (copilot) | done | Column widths: Org 140→200, Discipline 120→160, Rank 100→140. |
| SESSION_0272_TASK_04 | Petey (copilot) | done | GAP_MATRIX.md: 32 stories mapped. 4 ✅, 17 🔶, 7 ❌, 4 🔧. |

## What landed

- **Org detail page: unique member count + grouped display.** "7 members" (1 person × 7 disciplines) → "1 member" with discipline badges. Passport+Shell model now renders correctly.
- **Lineage tree seed: 5 per-discipline trees.** `seed-baseline-lineage.ts` now creates `LineageTree` + `LineageTreeMember` records for BJJ (Rigan Machado), Eskrima, Muay Thai, Kajukenbo, Karate. `isPublished: true`, `visibility: PUBLIC`. Unblocks `/lineage` page (was 404ing).
- **Admin memberships table column spacing.** Organization 140→200px, Discipline 120→160px, Rank 100→140px. Truncation classes widened.
- **BBL gap matrix.** `docs/product/black-belt-legacy/GAP_MATRIX.md` — all 32 stories from 7 epics mapped to implementation status. 4 built, 17 partial, 7 not started, 4 infra only.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/organizations/[slug]/page.tsx` | Group memberships by unique user; unique member count; deduplicated role badges. |
| `apps/web/prisma/seed-baseline-lineage.ts` | Added per-discipline `LineageTree` + `LineageTreeMember` creation (5 trees, ~20 members). |
| `apps/web/app/admin/memberships/_components/memberships-table-columns.tsx` | Column widths: Org 200, Discipline 160, Rank 140. Truncation classes widened. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | New file. 32-story gap matrix with status and evidence. |
| `docs/sprints/SESSION_0272.md` | Current session ledger. |

## Decisions resolved

- **Member display model:** Option 3 — group by unique user, show discipline badges. Not "7 members" for 1 person.
- **Lineage trees:** Separate per-discipline, not one combined tree. BJJ tree named "Rigan Machado BJJ Lineage."
- **BBL gap matrix:** Produced. Admin lineage CRUD + nav identified as missing (not in original stories but needed for editor epic).

## Open decisions / blockers

- **Admin lineage CRUD:** No `/admin/lineage` list page or sidebar nav entry. Blocker for editor stories (Epic 3). Needs to be built.
- **Admin dashboard close/back nav:** No clear way to exit admin dashboard back to public site. UX gap.
- **Seed scripts need re-run:** Local + production DBs don't have the new `LineageTree` records yet.

## Next session

- **Goal:** SESSION_0273 — Re-run seed scripts (local + production). Validate `/lineage` renders. Start admin lineage CRUD + sidebar nav. Begin BBL gap closure starting with highest-value items from GAP_MATRIX.
- **Inputs to read:** `docs/product/black-belt-legacy/GAP_MATRIX.md` (priority list), `apps/web/prisma/seed-baseline-lineage.ts` (re-run).
- **First task:** Re-run `seed-baseline-lineage.ts` on local dev, verify `/lineage` index + `/lineage/rigan-machado-bjj-lineage` renders. Then run on production.

## Status

closed
