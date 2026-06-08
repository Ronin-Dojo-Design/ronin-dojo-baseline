---
title: ENTER_THE_DOJO Schema Intake
slug: enter-the-dojo-schema-intake
type: concept
status: active
created: 2026-06-06
updated: 2026-06-06
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/decisions/0001-dirstarter-vs-wpgraphql.md
  - docs/architecture/data-model.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0351.md
tags:
  - schema
  - legacy-intake
  - wordpress
  - pods
---

# ENTER_THE_DOJO Schema Intake

## Summary

`ENTER_THE_DOJO.md` is a legacy Ronin doctrine note from the WordPress + Pods era. Its core rule still holds: do not add fields, relationships, APIs, or state changes until ownership, visibility, validation, timestamps, and accountability are clear.

The implementation language is stale. In this repo, "Pods/custom tables/resolvers" translates to Prisma models, server services/actions, query payloads, route handlers, and future typed API/GraphQL/mobile contracts.

## Source

Three legacy copies were found and had the same SHA-256 hash:

- `/Users/brianscott/dev/ronin-dojo-monorepo/WEKAF USA/wekaf-usa—local /SOURCE_OF_TRUTH/ENTER_THE_DOJO.md`
- `/Users/brianscott/dev/ronin-dojo-monorepo/RoninDashboard/START_HERE/Ronin_Obsidian_Vault/RoninDojoDesign_Baseline/BACKEND_RONINDOJO/ENTER_THE_DOJO.md`
- `/Users/brianscott/dev/ronin-dojo-monorepo/RoninDashboard/START_HERE/Ronin_Obsidian_Vault/EPIC_MEGAPLANS/SOURCE_OF_TRUTH/ENTER_THE_DOJO.md`

This intake used the RoninDashboard backend copy.

## Current-Stack Translation

| Legacy term | Current repo equivalent |
| --- | --- |
| WordPress core user | Better Auth `User` plus Ronin `Passport` and `DirectoryProfile` |
| Ronin custom table | Prisma model in `apps/web/prisma/schema.prisma` |
| Pods content record | `ContentAtom`, `ContentVariant`, `Event`, `Tournament.description`, or a future content-shell model |
| REST / WPGraphQL exposure | Server query payload, server action, route handler, API client, or future mobile/GraphQL contract |
| Pod-level exposure | Route/query availability by brand, auth, role, status, and publication state |
| Field-level exposure | Prisma `select` payload plus per-field privacy checks |
| Relationship depth | Explicit nested `select` shape; default to the smallest useful payload |
| Cache invalidation | `cacheTag` / revalidation for public data; conservative request-scoped dedupe for auth/private data |

## Schema Review

### Already covered

- Tournament transactional truth: `Tournament`, `TournamentDiscipline`, `Division`, `Registration`, `RegistrationEntry`, `TournamentStaffAssignment`, `RuleSet`, `Bracket`, `Match`, `WeighInRecord`, `MatAssignment`.
- Membership truth: `Membership`, `MembershipRoleAssignment`, `Role`, `RankAward`, `AuditLog`.
- Accountability primitives: timestamps on core rows, optimistic locking on `Membership` and registration flows, `AuditLog`, Stripe processed-event records.
- Editorial/structured content: `ContentAtom`, `ContentVariant`, `ContentTask`, `ContentPublication`, `Event`, `Media`, `MediaAttachment`.
- Org/lineage visualization truth: `LineageTree`, `LineageNode`, `LineageTreeMember`, `LineageRelationship`, `LineageVisualGroup`.

### Not safe as a quick schema patch

- **Tournament content shell:** the legacy `tournament_content` idea is useful, but it should not become a quick table without deciding whether `ContentAtom`/`ContentVariant`, `Event`, or fields on `Tournament` own public event content. Current `Tournament` only has `description`; `Event` has richer public event fields but is separate from tournament execution truth.
- **Operational org chart:** the legacy `org_chart_nodes` shape overlaps with `Membership`, `Role`, `Organization`, and lineage visual trees, but it is not identical. A staff authority chart needs an explicit product decision: is it a staff org chart, lineage chart, affiliation chart, or admin permission tree?
- **Booleans:** `is_visible_in_chart`, `is_accepting_students`, and `is_public_contact` are plausible, but ownership differs by surface. Some belong on `LineageTreeMember`, some on `Organization`, and some may be derived from membership/role/settings.

## Candidate Follow-Ups

- Add a tournament public-content decision: reuse `ContentVariant(channel=SITE)`/`Event`, or add a `TournamentContent` table with one-to-one `Tournament` relation.
- Add an org/staff authority-chart spec before schema: define whether the owner is `Organization`, `Membership`, `LineageTree`, or a future admin visualization model.
- For mobile/Expo or React Native, treat any GraphQL/API exposure as a contract over existing payloads, not a second truth source.

## Relationships

- [Dirstarter over WPGraphQL ADR](../../../architecture/decisions/0001-dirstarter-vs-wpgraphql.md)
- [Data Model](../../../architecture/data-model.md)
- [Wiring Ledger](../wiring-ledger.md)

## Open Questions

- Should tournament public content be managed through the ContentAtom pipeline or through a dedicated tournament content table?
- Should staff/org authority visualization use lineage-tree infrastructure or a separate staff chart model?
