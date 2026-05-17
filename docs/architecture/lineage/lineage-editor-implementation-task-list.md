---
title: "Lineage Editor Implementation Task List"
slug: lineage-editor-implementation-task-list
type: plan
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/knowledge/wiki/index.md
---

# Lineage Editor Implementation Task List

## Summary

This is the TASK_01 through TASK_08 backlog created by SESSION_0177. It keeps the next build session scoped and ordered.

## TASK_01 - Requirements

Write and review `lineage-tree-v1-requirements.md`.

Done means:

- product direction is explicit
- promotion lineage is primary truth
- public viewer, editor, groups, claims, and forest support are included
- out-of-scope items are recorded

## TASK_02 - Permissions

Write and review `lineage-editor-permissions-spec.md`.

Done means:

- default org/global grants are clear
- explicit roles are defined
- sensitive actions require audit notes
- branch and node scope limits are testable

## TASK_03 - Schema Proposal

Write and review `lineage-prisma-schema-patch-proposal.md`.

Done means:

- enums are proposed
- tree/member/group/access/claim models are proposed
- existing model changes are listed
- migration notes cite additive discipline

## TASK_04 - Rank And Promotion Sync

Write and review `lineage-rank-promotion-sync-rules.md`.

Done means:

- `RankAward` is canonical
- `PROMOTED_BY` relationship mirror is defined
- direction convention is explicit
- conflict and backfill rules are recorded

## TASK_05 - React Canvas Port

Write and review `lineage-react-canvas-port-plan.md`.

Done means:

- old BBL source file is identified
- D3 retirement path is explicit
- target component split is defined
- adapter and interaction requirements are testable

## TASK_06 - Routes

Write and review `lineage-public-viewer-editor-routes.md`.

Done means:

- embedded public route behavior is specified
- standalone public route is specified
- dashboard editor route is ACL-gated
- drawer tab behavior is clear

## TASK_07 - Claims

Write and review `lineage-claim-workflow-evidence-review.md`.

Done means:

- unauth claim flow is specified
- evidence privacy is specified
- approval, denial, needs-info, and duplicate-node conflict paths are specified
- audit requirements are specified

## TASK_08 - Acceptance Tests

Write and review `lineage-v1-acceptance-test-plan.md`.

Done means:

- migration checks are listed
- adapter tests are listed
- permission tests are listed
- claim tests are listed
- UI and manual QA/UAT are listed

## Recommended Build Order After SESSION_0177

1. Schema migration and backfill proof.
2. Server read models and pure adapter tests.
3. React canvas public viewer behind current lineage surface.
4. Standalone public route.
5. Dashboard editor read route and ACL guard.
6. Visual group editing.
7. Promotion modal and audited relationship changes.
8. Claim workflow and evidence review.
9. D3 removal after parity.
