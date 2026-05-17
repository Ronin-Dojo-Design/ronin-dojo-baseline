---
title: "Lineage Tree v1 Requirements"
slug: lineage-tree-v1-requirements
type: spec
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/knowledge/wiki/index.md
---

# Lineage Tree v1 Requirements

## Summary

Lineage Tree v1 turns the SESSION_0175/0176 viewer prototype into a real martial arts lineage system. The system must support public viewing, a standalone public tree route, a permissioned dashboard editor, grouped promotion rows, profile claiming, and auditable promotion lineage management.

The current `d3-org-chart` viewer is treated as disposable prototype code. V1 should replace it with a TypeScript/Dirstarter rewrite of the old Black Belt Legacy full `LineageTree.jsx`, fed by the new Prisma lineage backend.

## Product Definition

Lineage Tree v1 is a promotion-lineage system. In the default lineage view, a visual parent means the person was promoted by that parent.

The system must support:

- Multiple lineage trees across brands, organizations, schools, disciplines, styles, and individual instructors.
- A tree as a forest, not only a single-root hierarchy.
- One editor-selected default root or focus member per tree for initial public framing.
- One reusable `LineageNode` per person/profile, with tree-specific placement stored separately.
- The same person appearing in multiple trees with different displayed ranks through tree-member `rankAwardId`.
- Public display of verified, unverified, and disputed lineage.
- Unknown promotion dates, with public display controls.
- Claiming placeholder historical profiles through an approval workflow.

## Current State

The current Baseline lineage implementation includes:

- `LineageNode` and `LineageRelationship` schema models.
- `LineageRelationType.INSTRUCTOR_STUDENT`.
- `RankAward.awardedById`, but seeded Baseline owner rank awards currently store promoter text in `notes`.
- Public-only lineage read queries in `apps/web/server/web/lineage/queries.ts`.
- A D3 wrapper in `apps/web/components/web/lineage/lineage-org-chart.tsx`.
- A drawer in `apps/web/components/web/lineage/lineage-profile-drawer.tsx`.
- Seeded placeholder users for historical lineage people.

Limitations to resolve:

- D3 requires exactly one parent and one root.
- Non-BJJ or unattached fragments can disappear from the chart.
- Relationship intent is flattened into `INSTRUCTOR_STUDENT`.
- Row/group layout is not admin-defined.
- Editing, permissions, claims, and audit workflows are not implemented.

## V1 Data Principles

- `User` plus `Passport` remains the identity spine.
- Placeholder users remain valid for historical people who may not have accounts yet.
- `LineageNode` is the reusable lineage profile for a person.
- `LineageTree` defines a public/editor tree context.
- `LineageTreeMember` defines tree-specific membership, display rank, visual parent, visual group, sort order, and per-tree display flags.
- `RankAward` is canonical for promotion facts.
- `LineageRelationship(type=PROMOTED_BY)` is synchronized by actions and supports graph traversal and drawer relationship display.
- `AuditLog` records sensitive lineage changes, especially promoter/parent changes, claim approvals, and ACL changes.

## Public Viewer Requirements

The public viewer must:

- Render the BBL-style React tree canvas, not D3 HTML-string nodes.
- Use real React node cards with Dirstarter primitives where possible.
- Support click-to-open drawer.
- Support zoom/pan and pinch/drag through `@use-gesture/react`.
- Render measured connectors between parent and children.
- Render a forest with multiple root-level fragments.
- Frame the tree's default root/focus member on load.
- Display group labels only when the group has `showPublicLabel=true`.
- Show unverified and disputed badges publicly.
- Show unknown promotion dates as `Unknown date` only when the tree member permits date display; otherwise omit the date in compact views.
- Provide both embedded discipline-page display and standalone `/lineage/[treeSlug]` route.

## Editor Requirements

The editor must:

- Live under an ACL-gated dashboard route, not global-admin-only `/admin`.
- Allow tree admins/editors to create and manage trees.
- Allow authorized users to add people, connect people, choose promotion rank, set promoter, set verification status, assign visual groups, and reorder visual rows.
- Use drag/drop only for visual ordering or moving into an existing visual group.
- Require a modal, warning, rank selection, verification status, and audit note for promoter/parent changes.
- Auto-create materialized visual groups from promotion dates and let admins rename, hide public labels, collapse by default, and reorder.
- Allow tree admins to manage ACL assignments and claim reviews.

## Drawer Requirements

Replace the current drawer tabs with:

- `Profile`
- `Lineage`
- `Rank History`
- `Admin/Edit`

The drawer should keep tournaments, belt story, and achievements out of v1 drawer scope. Those belong on the full profile page later.

## Out Of Scope For First Implementation Slice

- Tournament record joins in the drawer.
- Belt story media UX.
- Full achievement model.
- Automatic duplicate identity merge when a claimant already has a node.
- Citation/source-link requirements for every relationship.
- Public self-serve tree creation without ACL review.

## Done Means

Lineage Tree v1 is ready for implementation when this requirements doc, the permission spec, schema proposal, sync rules, canvas port plan, route plan, claim workflow, and acceptance test plan are all written and mutually consistent.
