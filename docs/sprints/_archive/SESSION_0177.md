---
title: "SESSION 0177 - Lineage Tree v1 Requirements + Editor Spec"
slug: session-0177
type: session--planning
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0176.md
  - docs/runbooks/graphify-repo-memory.md
  - docs/runbooks/schema-migration.md
  - docs/architecture/lineage/lineage-tree-v1-requirements.md
  - docs/architecture/lineage/lineage-editor-permissions-spec.md
  - docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/architecture/lineage/lineage-react-canvas-port-plan.md
  - docs/architecture/lineage/lineage-public-viewer-editor-routes.md
  - docs/architecture/lineage/lineage-claim-workflow-evidence-review.md
  - docs/architecture/lineage/lineage-v1-acceptance-test-plan.md
  - docs/architecture/lineage/lineage-editor-implementation-task-list.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0177 - Lineage Tree v1 Requirements + Editor Spec

## Date

2026-05-17 MDT

## Operator

Brian Scott + Codex as Petey planning/grill-me partner.

## Goal

Create the v1 planning artifacts for a real lineage system: public viewer, ACL-gated editor, grouped promotion rows, claim workflow, schema proposal, BBL React canvas port plan, and implementation task list. This session is documentation/spec only.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Target repo: `/Users/brianscott/dev/ronin-dojo-app`.
- Current lineage implementation inspected after SESSION_0176.
- Old BBL source located in `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/LineageTree.jsx`.
- `LineageTreeMVP.jsx` is not the target source. It is a landing-page subset.
- FS-0020 mitigation followed: Graphify used before repo-wide discovery.
- FS-0021 remains open for the next schema implementation session: follow `docs/runbooks/schema-migration.md`.

## Graphify Check

- Graph status: current at 6005 nodes, 11434 edges, 712 communities, 1200 files.
- Queries run:
  - `graphify query "lineage tree relationship rank award permissions" --budget 2000`
  - `graphify query "LineageTree LineageRelationship RankAward" --budget 2000`
- Files selected from graph and verified directly:
  - `apps/web/prisma/schema.prisma`
  - `apps/web/server/web/lineage/queries.ts`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/components/web/lineage/lineage-org-chart.tsx`
  - `apps/web/components/web/lineage/lineage-tree-board.tsx`
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx`
  - `apps/web/prisma/seed-baseline-lineage.ts`

## Key Decisions

- Promotion lineage is the primary truth.
- Visual parent means `PROMOTED_BY`.
- `RankAward` is canonical for promotion facts.
- `LineageRelationship(type=PROMOTED_BY)` mirrors rank actions for traversal and relationship display.
- Relationship orientation stays compatible with the current schema: `fromNodeId` promoter, `toNodeId` promoted person.
- `LineageTree` can be a forest with multiple root-level fragments and one editor-chosen default root/focus.
- `LineageNode` remains reusable person/profile tied to `User` and `Passport`.
- Tree-specific placement lives in `LineageTreeMember`.
- Group rows are scoped under one promoter/parent in v1.
- Group rows auto-create from promotion dates and admins can override labels, order, collapsed default, and public visibility.
- Drag/drop is visual only.
- Changing promoter/parent requires modal, warning, rank selection, verification status, and audit note.
- Public and standalone viewer ship together: embedded discipline section plus `/lineage/[treeSlug]`.
- Editor lives under dashboard lineage routes, not global-admin-only `/admin`.
- Placeholder profiles are claimable in v1 through approval requests.
- Evidence is encouraged but optional; reviewers may approve with bypass note.
- Claim approval transfers a placeholder node only when claimant has no existing node.
- If claimant already has a node, automatic transfer is blocked for manual merge.

## Deliverables

- `docs/architecture/lineage/lineage-tree-v1-requirements.md`
- `docs/architecture/lineage/lineage-editor-permissions-spec.md`
- `docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md`
- `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`
- `docs/architecture/lineage/lineage-react-canvas-port-plan.md`
- `docs/architecture/lineage/lineage-public-viewer-editor-routes.md`
- `docs/architecture/lineage/lineage-claim-workflow-evidence-review.md`
- `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`
- `docs/architecture/lineage/lineage-editor-implementation-task-list.md`

## TASK_01 Through TASK_08

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0177_TASK_01 | Write v1 requirements | done |
| SESSION_0177_TASK_02 | Write lineage editor permissions spec | done |
| SESSION_0177_TASK_03 | Write Prisma schema patch proposal | done |
| SESSION_0177_TASK_04 | Write rank/promotion sync rules | done |
| SESSION_0177_TASK_05 | Write BBL React canvas port plan | done |
| SESSION_0177_TASK_06 | Write public viewer and dashboard editor route plan | done |
| SESSION_0177_TASK_07 | Write claim workflow and evidence review plan | done |
| SESSION_0177_TASK_08 | Write acceptance tests, migration checks, and QA/UAT checklist | done |

## Scope Guard

- No production code changes.
- No Prisma schema edits.
- No migration generated.
- No D3 removal in this planning slice.
- No runtime route files created.

## Next Implementation Session

Start with the schema migration and backfill proof only after rereading:

- `docs/runbooks/schema-migration.md`
- `docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md`
- `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`
- `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`

Use additive migration discipline, then build server read models and adapter tests before touching the public viewer.

## Status

closed-full
