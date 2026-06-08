---
title: "Lineage Public Viewer And Editor Routes"
slug: lineage-public-viewer-editor-routes
type: spec
status: active
created: 2026-05-17
updated: 2026-06-06
last_agent: codex-session-0351
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/sprints/SESSION_0202.md
  - docs/knowledge/wiki/index.md
---

# Lineage Public Viewer And Editor Routes

## Summary

Lineage Tree v1 ships both public viewing surfaces and an ACL-gated dashboard editor. The editor does not live under global-admin-only `/admin`.

## Public Embedded Viewer

Current embedded target:

- `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx`

V1 behavior:

- Query the default published lineage tree for the discipline and brand.
- Render the React canvas tree.
- Open the lineage drawer on node click.
- Show group labels only when `LineageVisualGroup.showPublicLabel` is true.
- Show unverified and disputed badges publicly.
- Respect `LineageTreeMember.showPromotionDatePublic`.
- If the date is public but unknown, show `Unknown date`.

Empty state:

- If no published tree exists, omit the lineage section unless the viewer has editor capability.
- If the viewer has editor capability, show a compact editor entry point.

## Public Standalone Viewer

New public route:

- `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`

V1 behavior:

- Resolve by `brand` plus `treeSlug`.
- Require `LineageTree.isPublished=true`.
- Honor `LineageVisibility`.
- Render the same canvas as the embedded viewer, with more available space.
- Use the same drawer tabs.
- Include claim entry points for claimable placeholder nodes.

Visibility rules:

- `PUBLIC`: visible in public routes and embedded sections.
- `UNLISTED`: visible by direct standalone URL, not auto-embedded unless explicitly selected.
- `RESTRICTED`: requires auth and access grant.
- `PRIVATE`: editor-only.

## Dashboard Editor Route

New dashboard route:

- `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx`

Landed SESSION_0202:

- `apps/web/app/(web)/dashboard/lineage-tab.tsx` adds a `Lineage` tab to `/dashboard` with the current user's editable trees.
- `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx` renders the read-only editor preview.
- `apps/web/server/web/lineage/editor-queries.ts` owns the auth-scoped editor list/detail reads and capability resolver.
- The shipped route is preview-only. Visual group controls, promotion changes, claim review, and ACL management remain future rollout items.

Optional supporting routes:

- `apps/web/app/(web)/dashboard/lineage/page.tsx` for editor-accessible tree list.
- `apps/web/app/(web)/dashboard/lineage/[treeId]/claims/page.tsx` for claim review.
- `apps/web/app/(web)/dashboard/lineage/[treeId]/access/page.tsx` for ACL management.

Route guard:

- Allow global admin.
- Allow org owner and org admin for org-scoped trees.
- Allow explicit `LineageTreeAccess` rows.
- Deny everyone else with the app's existing auth pattern.

## Editor Modes

The editor uses one route with mode-specific controls:

- `viewer`: authenticated preview with editor toolbar hidden.
- `owner/editor`: content editing, group editing, drag/drop visual placement, promoter modal.
- `admin review`: ACL and claim review controls for `TREE_ADMIN`.

Mode selection should be derived from capabilities. It should not trust a query string alone.

## Server Query Plan

Public read query:

- Resolve brand from request host.
- Load published tree by slug or discipline default.
- Include members, nodes, selected rank award, visual group, and relationships needed by the adapter.
- Exclude private evidence and ACL data.

Editor read query:

- Resolve tree by ID.
- Check capability.
- Include draft/unpublished members and groups.
- Include ACL summary for admins.
- Include pending claim counts for admins.

Mutation/action areas:

- tree metadata
- member create/update/archive
- promotion create/update
- visual group create/update/reorder
- visual reorder/move group
- promoter change modal
- ACL grant/revoke
- claim approve/deny/request-info

## Drawer Tabs

Public drawer tabs:

- `Profile`
- `Lineage`
- `Rank History`

Editor drawer tabs:

- `Profile`
- `Lineage`
- `Rank History`
- `Admin/Edit`

Tournament, belt story, and achievements stay out of the v1 drawer and move to the full profile page later.

## Rollout Order

1. Create read models and adapter behind the current embedded surface.
1. Add standalone public route.
1. Add dashboard editor route with read-only preview. **Landed SESSION_0202.**
1. Add visual group controls.
1. Add promotion modal and audited parent changes.
1. Add claims and ACL management.
1. Remove D3 when parity is proven.
