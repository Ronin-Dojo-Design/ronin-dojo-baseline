---
title: "Lineage v1 Acceptance Test Plan"
slug: lineage-v1-acceptance-test-plan
type: spec
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/knowledge/wiki/index.md
---

# Lineage v1 Acceptance Test Plan

## Summary

This plan defines implementation gates for the next build sessions. SESSION_0177 is documentation-only, so these are planned acceptance tests, migration checks, and QA/UAT items.

## Schema Checks

The migration must validate against:

- `RankAward`
- `LineageNode`
- `LineageRelationship`
- `AuditLog`
- `Media`
- `Organization`
- `Discipline`
- `Style`
- `Membership`
- `Role`

Migration checks:

- Prisma schema validates.
- Additive migration is generated with `migrate dev`.
- Existing lineage seed still runs or has a documented additive replacement.
- Existing `LineageNode.isVerified` and `LineageRelationship.isVerified` values backfill into `verificationStatus`.
- Existing `RankAward.awardedAt` values are preserved when the field becomes nullable.
- Existing public discipline pages keep rendering while D3 is still present.

## Unit Tests

Tree adapter tests:

- multi-root forest renders every member
- editor default root/focus is selected for initial framing
- `PROMOTED_BY` relationship orientation maps promoter to visual parent
- visual groups sort by `sortOrder`
- members sort by `visualSortOrder`
- hidden public group labels are omitted publicly
- editor view still shows hidden labels
- missing promotion dates display as `Unknown date` when public date display is enabled
- missing promotion dates are omitted when public date display is disabled
- disputed and unverified badges are present in compact node props

Permission tests:

- global admin gets access
- org owner gets `TREE_ADMIN` on org-scoped tree
- org admin role code gets `TREE_ADMIN` on org-scoped tree
- instructor and coach role codes do not get default access
- explicit `TREE_ADMIN` grants full tree access
- explicit `TREE_EDITOR` can edit content but not ACL
- `BRANCH_EDITOR` cannot move assigned branch root
- `NODE_EDITOR` can edit assigned node but not unrelated nodes
- denied users cannot load dashboard editor payloads

Claim tests:

- unauthenticated claim redirects to sign-up/sign-in and returns to claim form
- authenticated claimant submits text evidence
- authenticated claimant submits URL evidence
- authenticated claimant submits file evidence through media
- reviewer approves claim and transfers node to claimant when claimant has no node
- reviewer approval is blocked when claimant already has a node
- reviewer denies claim with note
- reviewer requests more information
- claim actions write audit rows

## UI Tests

Public viewer:

- embedded discipline lineage section renders
- standalone `/lineage/[treeSlug]` renders
- click node opens drawer
- drawer tabs show `Profile`, `Lineage`, and `Rank History`
- unverified and disputed badges show publicly
- public group label toggle works
- mobile pan/zoom works without layout overlap

Editor:

- dashboard lineage editor route denies unauthorized user
- authorized user sees editor toolbar
- drag reorder changes visual order only
- drag move into group changes group only
- promoter change opens modal
- modal requires rank selection, verification status, and audit note
- saving promoter change updates visual parent and audit log
- admin can rename group
- admin can hide public group label
- admin can collapse group by default
- admin can grant and revoke explicit lineage access
- admin can review claims

## Manual QA/UAT Checklist

Baseline public:

- `/disciplines/bjj` shows the embedded lineage section.
- `/lineage/[treeSlug]` opens the same tree in standalone mode.
- Brian's displayed promotion chain reaches the correct promoter path.
- Dirty Dozen and other promoted cohorts can be grouped by date or custom label.
- Unknown-date people do not look broken.

Editor:

- organization owner can open the dashboard editor for an org-scoped tree.
- coach without explicit ACL cannot open the editor.
- branch editor can edit inside branch but cannot move branch root.
- node editor can edit assigned node and must use audited modal for promoter change.

Claims:

- unauthenticated visitor can start claim and return after auth.
- evidence is not visible in public payloads.
- approval transfers a placeholder node only when claimant has no node.
- duplicate node conflict stops automatic transfer.

Regression:

- existing public discipline pages still render.
- existing profile drawer still opens from the lineage viewer.
- existing rank award pages/actions are not broken by nullable `awardedAt`.
- D3 dependency is removed only after React canvas parity is confirmed.
