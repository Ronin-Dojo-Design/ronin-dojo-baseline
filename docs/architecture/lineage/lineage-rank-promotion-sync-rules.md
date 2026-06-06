---
title: "Lineage Rank Promotion Sync Rules"
slug: lineage-rank-promotion-sync-rules
type: spec
status: active
created: 2026-05-17
updated: 2026-06-06
last_agent: codex-session-0351
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/sprints/SESSION_0178.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/knowledge/wiki/index.md
---

# Lineage Rank Promotion Sync Rules

## Summary

`RankAward` is the canonical promotion fact. `LineageRelationship(type=PROMOTED_BY)` is the graph mirror used for lineage traversal, profile drawer relationship display, and visual tree adapters.

The sync rule is one-way from approved editor actions into both records. The relationship does not own the truth when it conflicts with the rank award.

## Direction Convention

Preserve the current relationship orientation:

- `fromNodeId` is the promoter.
- `toNodeId` is the promoted person.
- For `PROMOTED_BY`, read the row as "`toNode` was promoted by `fromNode`."

This avoids rewriting every existing tree adapter at the same time as the schema migration.

## Create Promotion

When an authorized editor records a promotion:

1. Create or update the promoted user's `RankAward`.
1. Set `RankAward.userId` to the promoted user.
1. Set `RankAward.rankId` to the awarded rank.
1. Set `RankAward.awardedById` to the promoter user when the promoter is known as a `User`.
1. Allow `RankAward.awardedAt` to be `null` for unknown historical dates.
1. Ensure both people have `LineageNode` rows.
1. Create or update a `LineageRelationship` row:
   - `type = PROMOTED_BY`
   - `fromNodeId = promoterNode.id`
   - `toNodeId = promotedNode.id`
   - `rankAwardId = rankAward.id`
   - `startedAt = rankAward.awardedAt`
   - `verificationStatus = selected editor status`
1. Add or update the relevant `LineageTreeMember` row for the promoted person in the current tree.
1. Assign or create the materialized visual group from the promotion date.
1. Write an `AuditLog` entry for the action.

## Update Promotion

When an editor changes rank, promoter, date, or verification status:

- Update `RankAward` first.
- Recompute or update the linked `PROMOTED_BY` relationship.
- Reassign `LineageTreeMember.rankAwardId` if the displayed tree rank changed.
- Rebuild or reassign the visual group if the promotion date changed.
- Require an audit note if the promoter changed or verification became `VERIFIED` or `DISPUTED`.

Promoter change is not a drag/drop operation. It requires the dedicated modal.

## Delete Or Archive Promotion

Default behavior should be archive, not hard delete, until the lineage audit story is mature.

If a rank award is removed from display:

- Clear or change `LineageTreeMember.rankAwardId`.
- Clear `LineageRelationship.rankAwardId` or archive the linked `PROMOTED_BY` relationship if the relationship no longer has any valid promotion fact.
- Leave `AuditLog` with before/after state.

## Relationship Conflict Rules

If multiple `PROMOTED_BY` relationships exist for one promoted node:

- The tree member's `primaryVisualParentMemberId` controls the visual parent in that tree.
- The drawer shows all relationships.
- The selected `RankAward` controls the compact node rank/date display.
- The editor must warn before setting a different primary visual parent than the linked rank award promoter.

If `RankAward.awardedById` points to a user without a lineage node:

- Create a lineage node if the editor has permission.
- Otherwise store the rank award and leave the relationship unresolved until a node is created.

If the promoter is historically known but not claimable yet:

- Create a placeholder `User`.
- Create a `LineageNode` for that placeholder.
- Create the `PROMOTED_BY` relationship.

## Verification Status

The sync action must keep status consistent:

- New editor-created promotion defaults to `PENDING` unless the editor selects another status.
- Approved rank-action flows may create `VERIFIED` relationships when the editor has verification capability.
- `DISPUTED` status is public and must show a badge.
- `isVerified` remains a transitional legacy flag and should be derived from `verificationStatus == VERIFIED` during the migration window.

## Visual Group Sync

Materialized group rules:

- If `RankAward.awardedAt` exists, auto-create or find a `PROMOTION_DATE` group under the promoter member for that date.
- If `RankAward.awardedAt` is null, auto-create or find an `Unknown date` group under the promoter member.
- Admins can rename the group label without changing the underlying promotion date.
- Admins can hide the group label publicly with `showPublicLabel=false`.
- Moving a person between groups changes visual placement only unless the editor uses the promoter-change modal.

## Backfill Rules

Initial backfill should:

- Leave current `INSTRUCTOR_STUDENT` rows in place.
- Create `PROMOTED_BY` rows only when a rank award or seed source clearly identifies a promoter.
- Use existing `LineageRelationship.isVerified` and `LineageNode.isVerified` to set `verificationStatus`.
- Convert Brian's seeded promotion notes into proper `RankAward.awardedById` links where the seeded promoter placeholder/user exists.
- Log ambiguous historical relationships as migration review items rather than guessing.
