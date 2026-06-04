---
title: "Black Belt Legacy — Implementation Gap Matrix"
slug: bbl-gap-matrix
type: report
status: active
created: 2026-05-27
updated: 2026-06-04
last_agent: codex-session-0343
pairs_with:
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/STORIES.md
  - docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md
  - docs/runbooks/deploy/bbl-production-runbook.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0343.md
tags:
  - bbl
  - blackbeltlegacy
  - launch
  - cutover
  - gap-matrix
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
| BBL-PROFILE-002 | Claim profile | 🔶 Partial | `/lineage/[treeSlug]/claim` route + `claim-form.tsx` exist. Server: `claim-actions.ts`, `claim-schemas.ts`. SESSION_0273 added tree-level and member-level claimability policy toggles and claim-page guards. SESSION_0278 added `/lineage/join` intake that can create a `LineageClaimRequest` for a signed-in user selecting a claimable lineage node while also creating a lead and draft listing. **Missing:** End-to-end flow validation with authenticated browser session; evidence attachment UI unclear. |
| BBL-PROFILE-003 | Admin approve/deny claims | ✅ Built | `/admin/lineage/claims/[id]` route exists. Server: `claim-review-actions.ts` with safe-action tests. Admin can approve/deny with audit note. |
| BBL-PROFILE-004 | Trust badges (verified/unverified/disputed) | 🔶 Partial | `LineageNode.isVerified` and `LineageNode.visibility` exist in schema. `lineage-node-card.tsx` renders node cards. **Missing:** Consistent trust badge component across card, drawer, and detail page. No `disputed` or `imported` status enum on LineageNode (only `isVerified: boolean`). |
| BBL-PROFILE-005 | Owner edits public bio/photo/links | 🔶 Partial | `node-profile-actions.ts` + `node-profile-schemas.ts` exist with tests. **Missing:** Public-facing edit UI for profile owners (separate from lineage editor). |

**Epic 1 summary:** 1 ✅, 4 🔶. Claim review is solid. Public profile page and trust badges need dedicated routes.

---

## Epic 2 — Lineage Tree Viewer

| ID | Story | Status | Evidence / Notes |
| --- | --- | --- | --- |
| BBL-LINEAGE-001 | View lineage tree | ✅ Done | Production seed completed 2026-05-28: 17 users, 18 nodes, 17 relationships, 5 trees, 22 tree members created. `/lineage` returns 200, `/lineage/rigan-machado-bjj-lineage` returns 200. Tree renders Carlos Gracie Sr → Carlos Gracie Jr → Rigan Machado → Dirty Dozen → Brian Scott. Drawer shows profile info, rank history, lineage tab. SESSION_0275 added per-tree rank selection via `selectedRankAward`, admin drawer actions, and claim CTA. SESSION_0276 backfilled Brian's selected BJJ `BK1` `RankAward` in seed and migrated discipline pages to v1 tree rendering. |
| BBL-LINEAGE-002 | Click node → highlight root path | ✅ Done | Root-path highlighting implemented in `lineage-tree-canvas.tsx` via `buildSelectedPathMemberIds`. Clicking a node dims unrelated branches and highlights the path to root with primary color ring/opacity. |
| BBL-LINEAGE-003 | Grouped promotion rows | 🔶 Partial | `LineageVisualGroup` model exists. `lineage-group-header-form.tsx` exists. **Missing:** Public rendering of grouped rows with `showPublicLabel` logic. |
| BBL-LINEAGE-004 | Unknown dates handled gracefully | 🔧 Infra only | `showPromotionDatePublic` flag exists on `LineageTreeMember`. **Missing:** UI logic to render "Unknown date" vs omit. |
| BBL-LINEAGE-005 | Trust badges on nodes | 🔶 Partial | `isVerified` on `LineageNode`. `lineage-node-card.tsx` renders cards. **Missing:** Disputed/unverified badge rendering. Same gap as BBL-PROFILE-004. |

**Epic 2 summary:** 2 ✅, 2 🔶, 0 ❌, 1 🔧. Tree viewer renders with root-path highlighting, selected rank support, claim CTA, and discipline-page v1 tree reuse; grouped rows, unknown-date copy, and trust badges remain polish gaps.

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
| BBL-RANK-002 | Link tree member to selected rank award | 🔶 Partial | `LineageTreeMember.rankAwardId` FK exists. SESSION_0275 displays `selectedRankAward` on cards/drawer; SESSION_0276 backfills Brian's Rigan Machado tree member to his BJJ `BK1` `RankAward` in seed. **Missing:** Admin UI for selecting/changing tree-specific rank awards. |
| BBL-RANK-003 | Promoter ↔ rank sync | ❌ Not started | No automatic `PROMOTED_BY` relationship sync when promotion data changes. |
| BBL-RANK-004 | Disputed promotion flags | ❌ Not started | No `disputed` status on `RankAward` or `LineageRelationship`. Only `isVerified: boolean`. Need enum (VERIFIED / UNVERIFIED / DISPUTED / IMPORTED). |

**Epic 4 summary:** 0 ✅, 2 🔶, 2 ❌, 0 🔧. Rank history display and selected-rank wiring exist, but admin selection UI and trust/verification features remain incomplete.

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
| 2 — Lineage Tree Viewer | 2 | 2 | 0 | 1 | 5 |
| 3 — Lineage Editor | 2 | 3 | 0 | 1 | 6 |
| 4 — Rank History | 0 | 2 | 2 | 0 | 4 |
| 5 — Curriculum + Cert | 0 | 2 | 2 | 1 | 5 |
| 6 — Migration | 1 | 2 | 1 | 0 | 4 |
| 7 — Search + Discovery | 0 | 2 | 1 | 0 | 3 |
| **TOTAL** | **6** | **17** | **6** | **3** | **32** |

### Highest-value next tasks (Petey recommendation)

SESSION_0343 launch-readiness note: the cross-layer e2e gate order now lives in
[`CUTOVER_CHECKLIST.md`](CUTOVER_CHECKLIST.md). Registration e2e gap #1 is green; the next shared-infra
launch proof should cover Stripe checkout + tier/entitlement before the BBL-specific claim smoke below.

1. **Authenticated claim-flow smoke** — Bob Bass is a claimable placeholder on `/lineage/rigan-machado-bjj-lineage/claim`; next proof should use an authenticated browser session and capture the submitted claim. Also smoke `/lineage/join` with a signed-in user to prove the lead + draft listing + `LineageClaimRequest` bridge.
2. **Authenticated admin lineage smoke** — SESSION_0273 added `/admin/lineage` list/detail, sidebar/command-palette nav, and tree/member claimability toggles. Next proof should use an authenticated admin and, if available, a `TREE_ADMIN` grant.
3. **BBL-PROFILE-004 + BBL-LINEAGE-005** — Trust badge component. Shared dependency across Epics 1 and 2. Use existing `LineageVerificationStatus` before adding any new enum.
4. **BBL-EDITOR-005** — ACL management UI. Unblocks branch/node editor scoping (BBL-EDITOR-003/004).
5. **BBL-RANK-004** — Disputed status enum. Foundational for rank trust features across the board.
6. **Public profile page** (BBL-PROFILE-001) — Dedicated `/people/[slug]` route. High user visibility.
