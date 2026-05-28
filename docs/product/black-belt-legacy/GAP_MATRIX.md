---
title: "Black Belt Legacy — Implementation Gap Matrix"
slug: bbl-gap-matrix
type: report
status: active
created: 2026-05-27
updated: 2026-05-27
last_agent: copilot-session-0272
pairs_with:
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/STORIES.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Black Belt Legacy — Implementation Gap Matrix

Story-by-story implementation status mapped against `STORIES.md`.

**Legend:**
- ✅ Built — route, server, UI all wired and functional
- 🔶 Partial — server logic or UI exists but feature incomplete or untested end-to-end
- ❌ Not started — no implementation exists
- 🔧 Infra only — schema/model exists but no route/UI

---

## Epic 1 — Public Legacy Profile

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-PROFILE-001 | View martial artist profile | 🔶 Partial | `/directory/[slug]` exists (directory listing). `LineageNode` has bio, slug, visibility. Profile drawer exists in lineage tree. **Missing:** Dedicated public profile page (e.g., `/people/[slug]`) with full bio, rank summary, school, verification status. |
| BBL-PROFILE-002 | Claim profile | 🔶 Partial | `/lineage/[treeSlug]/claim` route + `claim-form.tsx` exist. Server: `claim-actions.ts`, `claim-schemas.ts`. **Missing:** End-to-end flow validation; evidence attachment UI unclear. |
| BBL-PROFILE-003 | Admin approve/deny claims | ✅ Built | `/admin/lineage/claims/[id]` route exists. Server: `claim-review-actions.ts` with safe-action tests. Admin can approve/deny with audit note. |
| BBL-PROFILE-004 | Trust badges (verified/unverified/disputed) | 🔶 Partial | `LineageNode.isVerified` and `LineageNode.visibility` exist in schema. `lineage-node-card.tsx` renders node cards. **Missing:** Consistent trust badge component across card, drawer, and detail page. No `disputed` or `imported` status enum on LineageNode (only `isVerified: boolean`). |
| BBL-PROFILE-005 | Owner edits public bio/photo/links | 🔶 Partial | `node-profile-actions.ts` + `node-profile-schemas.ts` exist with tests. **Missing:** Public-facing edit UI for profile owners (separate from lineage editor). |

**Epic 1 summary:** 1 ✅, 4 🔶. Claim review is solid. Public profile page and trust badges need dedicated routes.

---

## Epic 2 — Lineage Tree Viewer

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-LINEAGE-001 | View lineage tree | 🔶 Partial | `/lineage` index + `/lineage/[treeSlug]` routes exist. `lineage-tree-canvas.tsx`, `lineage-tree-board.tsx`, `lineage-node-card.tsx`, `lineage-profile-drawer.tsx` all exist. **Was 404ing** because no `LineageTree` records existed (fixed in SESSION_0272 TASK_02 seed). |
| BBL-LINEAGE-002 | Click node → highlight root path | ❌ Not started | No root-path highlighting logic in `lineage-tree-canvas.tsx`. Node click opens drawer but doesn't dim unrelated branches. |
| BBL-LINEAGE-003 | Grouped promotion rows | 🔶 Partial | `LineageVisualGroup` model exists. `lineage-group-header-form.tsx` exists. **Missing:** Public rendering of grouped rows with `showPublicLabel` logic. |
| BBL-LINEAGE-004 | Unknown dates handled gracefully | 🔧 Infra only | `showPromotionDatePublic` flag exists on `LineageTreeMember`. **Missing:** UI logic to render "Unknown date" vs omit. |
| BBL-LINEAGE-005 | Trust badges on nodes | 🔶 Partial | `isVerified` on `LineageNode`. `lineage-node-card.tsx` renders cards. **Missing:** Disputed/unverified badge rendering. Same gap as BBL-PROFILE-004. |

**Epic 2 summary:** 0 ✅, 3 🔶, 1 ❌, 1 🔧. Tree viewer renders but lacks polish features (root path, grouped rows, trust badges).

---

## Epic 3 — Lineage Editor

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-EDITOR-001 | Add person to tree | ✅ Built | `editor-actions.ts` has add-member actions. `/lineage/[treeSlug]/edit` route exists. `lineage-editor-toolbar.tsx` provides UI. |
| BBL-EDITOR-002 | Set promoter/visual parent | ✅ Built | `promoter-change-modal.tsx` exists. `editor-actions.ts` handles parent reassignment with cycle prevention. Tests exist (`editor-graph.test.ts`). |
| BBL-EDITOR-003 | Branch-scoped editing | 🔶 Partial | `LineageTreeAccess` model with `BRANCH_EDITOR` role exists. **Missing:** Enforcement in editor UI — branch editor may currently see full tree edit controls. |
| BBL-EDITOR-004 | Node-scoped editing | 🔶 Partial | `LineageTreeAccess` model with `NODE_EDITOR` role exists. `node-profile-actions.ts` exists. **Missing:** UI enforcement — node editor restricted to profile fields only. |
| BBL-EDITOR-005 | Manage ACLs | 🔧 Infra only | `LineageTreeAccess` model with roles (`TREE_ADMIN`, `BRANCH_EDITOR`, `NODE_EDITOR`) exists. **Missing:** Admin UI for granting/revoking access. |
| BBL-EDITOR-006 | Manage visual groups | 🔶 Partial | `LineageVisualGroup` model + `lineage-group-header-form.tsx` exist. **Missing:** Full CRUD (create/rename/hide label/reorder/collapse). |

**Epic 3 summary:** 2 ✅, 3 🔶, 0 ❌, 1 🔧. Core add/promote flows work. ACL management UI and scope enforcement are gaps.

---

## Epic 4 — Rank History + Promotion Facts

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-RANK-001 | View rank history | 🔶 Partial | `lineage-rank-history-tab.tsx` exists. `RankAward` model exists with rank, date, promoter. **Missing:** Verification status display in drawer/profile. |
| BBL-RANK-002 | Link tree member to selected rank award | 🔧 Infra only | `LineageTreeMember.rankAwardId` FK exists. **Missing:** UI for selecting/displaying tree-specific rank award. |
| BBL-RANK-003 | Promoter ↔ rank sync | ❌ Not started | No automatic `PROMOTED_BY` relationship sync when promotion data changes. |
| BBL-RANK-004 | Disputed promotion flags | ❌ Not started | No `disputed` status on `RankAward` or `LineageRelationship`. Only `isVerified: boolean`. Need enum (VERIFIED / UNVERIFIED / DISPUTED / IMPORTED). |

**Epic 4 summary:** 0 ✅, 1 🔶, 2 ❌, 1 🔧. Rank history display exists but lacks trust/verification features.

---

## Epic 5 — Curriculum + Certification

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-CURRICULUM-001 | Browse curriculum | 🔶 Partial | `/courses` public route exists. Admin CRUD for courses exists (`/admin/courses`). **Missing:** Filter by discipline/rank/topic. |
| BBL-CURRICULUM-002 | Attach techniques to curriculum | 🔧 Infra only | `CurriculumItem` model + admin exists. Technique model exists. **Missing:** Technique-to-curriculum relationship UI. |
| BBL-CURRICULUM-003 | Track progress | ❌ Not started | No progress tracking model or UI. |
| BBL-CERT-001 | Issue certificates | 🔶 Partial | `/admin/certificates` route exists with CRUD. Certificate model exists. **Missing:** Issuance flow linking user + course + issuer + date. |
| BBL-CERT-002 | Verify certificate publicly | ❌ Not started | No public verification page. |

**Epic 5 summary:** 0 ✅, 2 🔶, 2 ❌, 1 🔧. Admin CRUD scaffolded. Public/student-facing features missing.

---

## Epic 6 — Migration + Data Stewardship

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-MIGRATE-001 | Import legacy BBL people | ✅ Built | `seed-baseline-lineage.ts` imports placeholder users + lineage nodes from BBL pods JSON data. `isPlaceholder: true` on users. SESSION_0272 adds `LineageTree` + `LineageTreeMember` records. |
| BBL-MIGRATE-002 | Deduplicate imported people | ❌ Not started | No merge/dedup UI or logic. |
| BBL-MIGRATE-003 | Source confidence marking | 🔶 Partial | `isVerified: false` on imported nodes. **Missing:** Richer source confidence enum (IMPORTED / PENDING / VERIFIED). |
| BBL-MIGRATE-004 | Attach evidence to claim | 🔶 Partial | Claim flow exists (BBL-PROFILE-002). **Missing:** Evidence file upload/attachment in claim form. |

**Epic 6 summary:** 1 ✅, 2 🔶, 1 ❌. Import works. Dedup and evidence attachment are gaps.

---

## Epic 7 — Search + Discovery

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-DISCOVER-001 | Search people | 🔶 Partial | `/directory` route with search exists. `lineage-search.tsx` component exists. **Missing:** Filter by rank, school, location. |
| BBL-DISCOVER-002 | Filter lineage trees | 🔶 Partial | `lineage-query.tsx` component exists for lineage index search. **Missing:** Discipline/style/school faceted filters. |
| BBL-DISCOVER-003 | Related profile suggestions | ❌ Not started | No related-profiles component or query. |

**Epic 7 summary:** 0 ✅, 2 🔶, 1 ❌. Basic search exists. Faceted filters and suggestions missing.

---

## Overall Summary

| Epic | ✅ Built | 🔶 Partial | ❌ Not started | 🔧 Infra only | Total |
| --- | --- | --- | --- | --- | --- |
| 1 — Public Legacy Profile | 1 | 4 | 0 | 0 | 5 |
| 2 — Lineage Tree Viewer | 0 | 3 | 1 | 1 | 5 |
| 3 — Lineage Editor | 2 | 3 | 0 | 1 | 6 |
| 4 — Rank History | 0 | 1 | 2 | 1 | 4 |
| 5 — Curriculum + Cert | 0 | 2 | 2 | 1 | 5 |
| 6 — Migration | 1 | 2 | 1 | 0 | 4 |
| 7 — Search + Discovery | 0 | 2 | 1 | 0 | 3 |
| **TOTAL** | **4** | **17** | **7** | **4** | **32** |

### Highest-value next tasks (Petey recommendation)

1. **BBL-LINEAGE-001 completion** — Verify `/lineage` index + `/lineage/[treeSlug]` render correctly with the new seed data. Re-run seed scripts on local and production. This unblocks all of Epic 2.
2. **Admin lineage CRUD + sidebar nav** — No `/admin/lineage` list/detail CRUD pages. No "Lineage" tab in admin sidebar. Admin dashboard also lacks a clear close/back navigation pattern. These are blockers for all editor stories (Epic 3).
3. **BBL-PROFILE-004 + BBL-LINEAGE-005** — Trust badge component. Shared dependency across Epics 1 and 2. Would need a verification status enum upgrade (VERIFIED / UNVERIFIED / DISPUTED / IMPORTED).
4. **BBL-EDITOR-005** — ACL management UI. Unblocks branch/node editor scoping (BBL-EDITOR-003/004).
5. **BBL-RANK-004** — Disputed status enum. Foundational for trust features across the board.
6. **Public profile page** (BBL-PROFILE-001) — Dedicated `/people/[slug]` route. High user visibility.
