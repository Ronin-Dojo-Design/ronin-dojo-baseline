---
title: "Lineage Claim Workflow And Evidence Review"
slug: lineage-claim-workflow-evidence-review
type: spec
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/knowledge/wiki/index.md
---

# Lineage Claim Workflow And Evidence Review

## Summary

Lineage Tree v1 supports claimable placeholder profiles. Historical people remain represented by placeholder `User` plus `LineageNode` records until the real person claims the profile or an admin assigns it.

Claim approval is a reviewed workflow. Evidence is private to reviewers and the claimant.

## Claim Entry Points

Public viewer:

- Show a claim action for placeholder nodes that are claimable.
- If the viewer is unauthenticated, start sign-up/sign-in and return to the claim form after auth.
- If the viewer is authenticated, open the claim form directly.

Dashboard:

- Tree admins see pending claim count.
- Tree admins can review, approve, deny, or request more information.

## Claim Form

The form captures:

- claimant note
- optional text evidence
- optional URLs
- optional file uploads through the app's media pipeline

Evidence is encouraged but not required. The UI should ask for at least one supporting item, but reviewers can approve without evidence when they record a bypass note.

## Evidence Privacy

Evidence visibility:

- claimant can view their own submitted evidence
- tree admins and claim reviewers can view evidence
- public viewers cannot view evidence
- node editors cannot view evidence unless they also have claim review permission

Evidence should not be rendered into public lineage payloads.

## Review Outcomes

Approved:

- If claimant has no existing `LineageNode`, transfer the claimed `LineageNode.userId` from the placeholder user to the claimant user.
- Archive the placeholder user for audit instead of hard deleting it.
- Mark claim status `APPROVED`.
- Write `AuditLog`.

Denied:

- Keep the placeholder user and node unchanged.
- Mark claim status `DENIED`.
- Store reviewer note.
- Write `AuditLog`.

Needs information:

- Keep claim open as `NEEDS_INFO`.
- Store reviewer note.
- Notify claimant in a later implementation slice if notification plumbing is selected.

Cancelled:

- Claimant may cancel their own pending claim.
- Keep placeholder user and node unchanged.

## Duplicate Node Conflict

If the claimant already has a `LineageNode`, automatic approval is blocked. The reviewer must use a manual merge workflow in a future implementation slice.

For v1:

- mark the claim as blocked or keep it pending with reviewer note
- do not transfer `LineageNode.userId`
- do not delete either node
- write `AuditLog`

## Placeholder User Handling

Placeholder user rules:

- Placeholder users are valid for historical people.
- Placeholder users can own `LineageNode` rows.
- Placeholder users should not be used as active login accounts.
- When a claim is approved, the placeholder user is archived or marked inactive for audit.
- The archived placeholder remains visible in audit history, not in normal person search.

If no archive field exists when implementation starts, add the smallest compatible field or status needed by the migration plan.

## Reviewer Permissions

Reviewers are:

- global admin
- tree `TREE_ADMIN`
- org owner or org admin through default tree admin grant for org-scoped trees

One authorized reviewer is enough in v1.

## Audit Requirements

Every review action writes `AuditLog` with:

- claim ID
- tree ID
- node ID
- claimant user ID
- reviewer user ID
- status before and after
- evidence count, not evidence content
- reviewer note or bypass reason when applicable

Do not write private evidence text into public audit display surfaces.
