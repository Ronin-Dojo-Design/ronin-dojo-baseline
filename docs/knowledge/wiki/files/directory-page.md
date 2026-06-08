---
title: "directory/page.tsx"
slug: directory-page
type: file
status: active
created: 2026-04-27
updated: 2026-06-06
author: Brian + Copilot
last_agent: codex-session-0349
pairs_with:
  - knowledge/wiki/files/directory-query-component
  - docs/runbooks/domain-features/lineage-listing-runbook.md
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0014
  - sprints/SESSION_0348
  - sprints/SESSION_0349
wiring:
  - "apps/web/components/web/directory/directory-query.tsx — DirectoryQuery"
  - "apps/web/app/(web)/directory/[slug]/page.tsx — canonical profile detail"
  - "apps/web/server/web/directory/queries.ts — owner-tier-gated directory/profile read model"
  - "apps/web/server/web/entitlements/lineage-tier-policy.ts — UserEntitlement-derived render policy"
  - "apps/web/lib/lineage/trust-status.ts — derived lineage trust status adapter"
  - "apps/web/components/web/lineage/lineage-trust-badge.tsx — shared trust badge presentation"
  - "apps/web/lib/auth.ts — getServerSession()"
  - "apps/web/lib/brand-context.ts — getRequestBrand()"
tags: [directory, page, s4]
---

# directory/page.tsx

**Path:** `apps/web/app/(web)/directory/page.tsx`

Canonical public browse page for `/directory`. Reads brand through `getRequestBrand()`, auth session for viewer context, and delegates filtered people/profile results to `DirectoryQuery`.

## Current Route Contract

- `/directory` is the canonical public browse slug for people/profile discovery.
- `/directory/[slug]` is the canonical public DirectoryProfile detail route.
- `/members` and `/members/[slug]` are compatibility redirects to `/directory` and `/directory/[slug]`.
- Future sessions can expand `/directory` into faceted people/schools/organizations/lineage-tree discovery without restoring a duplicate `/members` list.

## Tier Gating

SESSION_0348 wires directory/profile detail reads to the lineage profile-detail render policy derived from active `UserEntitlement` rows.

- Free profile owners publish only a compact preview: avatar/initials fallback, name, and rank summary.
- Premium/elite/legend profile owners publish full detail fields, still bounded by DirectoryProfile privacy flags such as `showEmail`, `showOrgs`, and `showRanks`.
- Owner/admin preview can render the full profile without changing the anonymous public payload.

## Trust Badges

SESSION_0349 adds shared trust badges to directory cards and `/directory/[slug]`. DirectoryProfile does not own trust
state directly; the read model derives it from safe related fields:

- `LineageNode.verificationStatus` and legacy `isVerified`;
- `User.isPlaceholder` for imported profile records;
- `LineageClaimRequest.status` summaries for claimed or pending claim labels.

The public directory payload selects status summaries only. It does not expose claim evidence, claimant notes, reviewer
notes, or reviewer identity.
