---
title: "Lineage Editor Permissions Spec"
slug: lineage-editor-permissions-spec
type: spec
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/knowledge/wiki/index.md
---

# Lineage Editor Permissions Spec

## Summary

Lineage editing needs its own ACL layer because tree ownership is not identical to organization membership. Existing app roles still matter, but they only provide default grants for org-scoped trees.

## Existing Grants

Existing authorization inputs:

- Global `User.role = "admin"` remains superuser.
- Organization `ownerId` is trusted for org-scoped trees.
- Membership roles already include `OWNER`, `ORG_ADMIN`, `INSTRUCTOR`, and `COACH`.
- Existing helpers include `canEditOrganization` and `canAwardRank`.

Default v1 lineage grants:

- Global admin gets `TREE_ADMIN` on every tree.
- Org `OWNER` and `ORG_ADMIN` get `TREE_ADMIN` on trees scoped to that organization.
- `INSTRUCTOR` and `COACH` do not automatically edit lineage trees. They need explicit lineage ACL unless a later session changes the policy.

## Explicit Lineage Roles

Use a new `LineageTreeAccess` model with these roles:

| Role | Purpose |
| --- | --- |
| `TREE_ADMIN` | Full tree control, ACL management, claim review, publication settings, relationship changes, group management. |
| `TREE_EDITOR` | Edit tree content, people, ranks, relationships, and visual groups; cannot manage ACL or approve claims unless also admin. |
| `BRANCH_EDITOR` | Edit assigned branch subtree inside one tree; cannot move the assigned branch root to a new promoter. |
| `NODE_EDITOR` | Full edit rights for assigned node in that tree, including profile, rank, and relationships, subject to audit requirements. |

## Scope Fields

`LineageTreeAccess` should support:

- `treeId`
- `userId`
- `role`
- optional `rootMemberId` for branch scope
- optional `nodeId` or `memberId` for node scope
- `grantedById`
- timestamps

Validation rules:

- `TREE_ADMIN` and `TREE_EDITOR` apply to the whole tree.
- `BRANCH_EDITOR` must have a branch root member.
- `NODE_EDITOR` must have a node/member target.
- A scoped role cannot edit outside its scope.

## Capability Matrix

| Capability | TREE_ADMIN | TREE_EDITOR | BRANCH_EDITOR | NODE_EDITOR |
| --- | --- | --- | --- | --- |
| View editor | yes | yes | yes | yes |
| Edit tree metadata | yes | yes | no | no |
| Add person | yes | yes | yes, inside branch | no |
| Edit assigned node profile | yes | yes | yes, inside branch | yes |
| Edit rank award for scoped node | yes | yes | yes, inside branch | yes |
| Change promoter/parent | yes, audit note | yes, audit note | yes inside branch, not branch root | yes for assigned node, audit note |
| Reorder visual groups | yes | yes | yes inside branch | no |
| Move node into visual group | yes | yes | yes inside branch | yes for assigned node |
| Manage ACL | yes | no | no | no |
| Review claims | yes | no | no | no |
| Publish/unpublish tree | yes | no | no | no |

## Sensitive Actions

These actions always require an audit note:

- Change promoter/parent.
- Change relationship verification status to `VERIFIED` or `DISPUTED`.
- Approve or deny a claim.
- Transfer a placeholder node to a claimant user.
- Grant or revoke lineage ACL.
- Delete or archive a tree member.

Sensitive actions should write `AuditLog` with:

- `brand`
- `organizationId` when available
- `entityType`
- `entityId`
- `action`
- `before`
- `after`
- `userId`

## Dashboard Route Guard

The dedicated editor route should be ACL-gated:

- Allow global admin.
- Allow default org grants for org-scoped trees.
- Allow explicit `LineageTreeAccess` rows.
- Deny otherwise with not-found or unauthorized behavior consistent with the app's auth patterns.

## Claim Review Permissions

Claim review is limited to:

- global admin
- tree `TREE_ADMIN`
- org `OWNER`/`ORG_ADMIN` through default tree admin grant for org-scoped trees

Claim approval does not require two reviewers in v1. One authorized reviewer may approve or deny, with audit note.
