---
title: "Lineage Domain Hub"
slug: lineage-hub
type: runbook
status: active
created: 2026-05-30
updated: 2026-06-23
last_agent: claude-session-0438
domain: lineage
pairs_with:
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/petey-plan-0305.md
  - docs/runbooks/domain-features/lineage-listing-runbook.md
backlinks:
  - docs/runbooks/README.md
  - docs/knowledge/wiki/index.md
---

# Lineage Domain Hub

> **⚠ Substrate-change notice (SESSION_0359).** This documents the **current** substrate. The target is
> [`BBL-SOT-Spec.md`](../../product/black-belt-legacy/BBL-SOT-Spec.md): Phases 1–4 move lineage onto oRPC +
> `can()` with **BBL resource-scoped grants** (per-tree/branch/node `LineageTreeAccess`, SOT-ADR **D4**), root
> nodes on **Passport** (nullable `userId`), and make claim an RBAC-reviewed account-attach. Accurate for today's
> code — but **check the SoT-Spec before building new lineage work** here; this is rewritten as its phase lands.

Single entry point for all lineage knowledge. Lineage docs live across four locations
(`architecture/lineage/`, `architecture/decisions/`, `knowledge/wiki/component-porting/specs/`,
and here in `runbooks/domain-features/`); this hub maps them so a session never has to rediscover
the set. **Start here for any lineage work.**

## Mental model (read first)

Lineage is a **dual model** — keep these axes distinct:

- **Provenance (truth):** `RankAward` is the canonical promotion fact (per belt: `awardedBy` promoter,
  `awardedAt`, rank, and — from Phase 3 — `organizationId` awarding school).
  `LineageRelationship(type=PROMOTED_BY)` mirrors each award via `rankAwardId`
  (`fromNode` = promoter → `toNode` = promoted), forming a **multi-parent** graph. A practitioner can
  hold Blue ← Prof A, Purple/Brown ← Prof B @ another school, Black ← Prof C — all first-class.
- **Display (projection):** `LineageTreeMember` projects the graph into one org-chart per tree —
  `primaryVisualParentMemberId` (single visual parent) + `selectedRankAward` (which belt the card shows)
  + `isCollapsedDefault`. The tree never owns promotion truth.
- **Affiliation (separate axis):** `Membership → Organization` = where they train now, independent of
  who promoted them.

Authority + sync rules are governed by **ADR 0016** below — read it before touching rank/promotion logic.

## Data model & decisions

- [ADR 0016 — Lineage Promotion Source of Truth](../../architecture/decisions/0016-lineage-promotion-source-of-truth.md) — `RankAward` canonical; `PROMOTED_BY` mirror; tree never owns truth. **Authoritative.**
- [Lineage Rank Promotion Sync Rules](../../architecture/lineage/lineage-rank-promotion-sync-rules.md) — create/update/delete promotion flows, conflict rules, verification, visual-group sync.
- [Lineage Prisma Schema Patch Proposal](../../architecture/lineage/lineage-prisma-schema-patch-proposal.md) — the v1 schema patch shape.
- [Promotion Event Model — design + plan](../../architecture/lineage/promotion-event-model.md) — **draft/staged (SESSION_0316).** First-class `PromotionEvent` (belt ceremony) grouping multiple `RankAward`s with a shared media gallery; discipline-agnostic; flagged the most important cross-brand domain logic. Build via dedicated ADR + epic.
- Schema: `apps/web/prisma/schema.prisma` — `LineageNode`, `LineageRelationship`, `LineageTree`, `LineageTreeMember`, `LineageVisualGroup`, `PassportClaimRequest` (unified person-claim SoT, ADR 0036 P5 — both lineage + directory doors write it; reviewed via `reviewPassportClaim`/`finalizePassportClaim`), `LineageTreeAccess`, `RankAward`. (`LineageClaimRequest` is retired as the live writer — read-only for legacy stragglers until dropped.)

## Requirements & port specs

- [Lineage Tree v1 Requirements](../../architecture/lineage/lineage-tree-v1-requirements.md)
- [Lineage React Canvas Port Plan](../../architecture/lineage/lineage-react-canvas-port-plan.md)
- [Lineage Family Tree Port Spec](../../knowledge/wiki/component-porting/specs/lineage-family-tree-port-spec.md) — features-not-pixels port spec (MVP).
- [Lineage Profile Drawer Port Spec](../../knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md)
- [Lineage Public Viewer + Editor Routes](../../architecture/lineage/lineage-public-viewer-editor-routes.md)

## Editor & permissions

- [Lineage Editor Permissions Spec](../../architecture/lineage/lineage-editor-permissions-spec.md)
- [Lineage Editor Implementation Task List](../../architecture/lineage/lineage-editor-implementation-task-list.md)

## Claim & verification

- [Lineage Claim Workflow + Evidence Review](../../architecture/lineage/lineage-claim-workflow-evidence-review.md)
- [BBL BJJ Rank Verification Import Map](../../architecture/lineage/bbl-bjj-rank-verification-import-map.md)

## Listing & monetization

- [Lineage Listing Runbook](lineage-listing-runbook.md) — reuse the `Tool` submission + Stripe + claim model for lineage listings; do not build a second monetization stack.

## Epic plan & roadmap

- [Petey Plan 0305 — Lineage Tree Enhancement Epic](../../petey-plan-0305.md) — Phase 1 mobile-first (done) → Phase 2 animations (in progress) → Phase 3 Org Chart Board + family-tree templates + belt-rail → Phase 4 trophy.so gamification. **Phase 3 Org Chart Board design is locked there** (board layout mode, the dual-model data plan, the `RankAward.organizationId` add, session breakdown 3-0→3f).

## Current brand/domain wiring

- `BASELINE_MARTIAL_ARTS` and `BBL` both expose the BJJ discipline-page lineage section for `discipline.code = bjj`.
- The runtime tree lookup remains brand-scoped (`getLineageTreeBySlug({ brand, slug })`); do not add broad cross-brand fallbacks.
- `apps/web/prisma/seed-baseline-lineage.ts` seeds the canonical Baseline `rigan-machado-bjj-lineage` projection.
- `apps/web/prisma/seed-bbl-org.ts` syncs a BBL-scoped `rigan-machado-bjj-lineage` tree projection from the Baseline public projection when the Baseline seed exists. This reuses global `LineageNode` / `RankAward` facts while keeping `LineageTree` brand-scoped.
- Local smoke target: `http://bbl.local:3000/disciplines/bjj` should show the Rigan Machado BJJ Lineage section; tree mode should be horizontally scrollable.

## Components

- [Custom Component Inventory § Lineage](../../knowledge/wiki/custom-component-inventory.md) — `LineageTreeCanvas` (board mode coming), `LineageNodeCard`, `LineageProfileDrawer`, `LineageTreeBoard`, listing components. Visual reference for the Org Chart Board: `knowledge/wiki/component-porting/specs/assets/balkan-orgchart-board.png`.

## Acceptance & point-in-time audits

- [Lineage v1 Acceptance Test Plan](../../architecture/lineage/lineage-v1-acceptance-test-plan.md)
- Point-in-time (candidates for `_archive/`): `SESSION_0263_audit_report.md`, `SESSION_0263_bbl_recon.md` in `architecture/lineage/` — session snapshots, not standing specs.

## Code entry points (the file map)

So a session can open the right file directly instead of grepping. Components are catalogued in [Custom Component Inventory § Lineage](../../knowledge/wiki/custom-component-inventory.md); this is the non-component code.

| Surface | File(s) |
| --- | --- |
| **Public viewer route** | `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`; discipline embed `app/(web)/disciplines/_components/lineage-tree-section.tsx` |
| **Admin editor route** | `apps/web/app/admin/lineage/[treeId]/page.tsx` (+ `_components/`) |
| **Dashboard** | `apps/web/app/(web)/dashboard/lineage-tab.tsx`; join flow `app/(web)/lineage/join/` |
| **Public read model** | `apps/web/server/web/lineage/queries.ts` (brand-scoped fetch + visibility materialization) + `payloads.ts` (the public-field allowlist) + `node-profile-queries.ts` |
| **Mutations + RBAC** | `server/web/lineage/editor-actions.ts` / `editor-queries.ts` / `editor-graph.ts` (placement edits, `assertPlacementEditorAccess`, audit-on-mutation); `node-profile-actions.ts`; `claim-actions.ts` |
| **Pure libs (presentation-agnostic)** | `apps/web/lib/lineage/canvas-model.ts` (normalization), `tree-layout.ts`, `rank-progression.ts`, `search.ts`, `bbl-bjj-rank-map.ts` |
| **Schema + seeds** | `apps/web/prisma/schema.prisma` (Lineage* models, `RankAward`); seeds `prisma/seed-baseline-lineage.ts`, `seed-bbl-org.ts` |

## Open work & invariants (read before changing read-models)

- **Current epic state:** [petey-plan-0305](../../petey-plan-0305.md) — Phases 1–2 done, Phase 3a–3d + 3-UX done; **next = Phase 3e (SVG 90° connectors) → 3f (PDF export) → Phase 4 (Trophy slices + leaderboard).**
- **Privacy invariants — these are guarded by tests; do not regress:**
  - `server/web/lineage/queries.visibility.test.ts` — public payload allowlist (no email/role/notes/audit) + PRIVATE/RESTRICTED dropped by the materializer.
  - `lib/lineage/search.privacy.test.ts` — the public search bar can only surface members the materializer already passed (non-PUBLIC never reach it).
  - `lib/lineage/rank-progression.privacy.test.ts` — the rank-progression read model is a strict allowlist projection (rank taxonomy + `awardedAt` only; no PII).
  - Product rule (SESSION_0334): `awardedAt` promotion dates are **public by default**, opt-out via the per-member `showPromotionDatePublic` toggle.
- **Tracked debt:** lineage rows in [wiring-ledger](../../knowledge/wiki/wiring-ledger.md) (WL-P2-1 "Manage verification (coming soon)" stub, WL-P2-5 `treeId` dead wiring) and [drift-register](../../knowledge/wiki/drift-register.md).

## Cross-references

- [Runbooks Domain Hub](../README.md)
- [Schema Migration Runbook](../database/schema-migration.md) — for the `RankAward.organizationId` migration (Phase 3 slice 3-0).
- [Component Porting Pipeline](../../knowledge/wiki/component-porting/component-porting-pipeline-ASCII.md) — the PWCC method the Org Chart Board port follows.
- [Verification & Testing](../dev-environment/verification-and-testing.md) — how the guards above run (unit/DB/e2e) and which is authoritative.
