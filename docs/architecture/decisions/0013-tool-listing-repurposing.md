---
title: "ADR 0013 — Tool→Listing Pattern Repurposing"
slug: adr-0013-tool-listing-repurposing
type: decision
status: accepted
created: 2026-05-04
updated: 2026-05-24
last_agent: codex-session-0351
deciders: Brian Scott
pairs_with:
  - docs/sprints/SESSION_0066.md
  - docs/knowledge/wiki/concepts/listing-pattern-repurposing.md
  - docs/architecture/decisions/0004-multi-brand-as-column.md
  - docs/knowledge/wiki/dirstarter-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0066.md
---

# ADR 0013 — Tool→Listing Pattern Repurposing

## Status

**Accepted** — 2026-05-04. **Partially superseded by [ADR 0028](0028-shared-listing-card-and-taxonomy.md)**
(SESSION_0396): the "No shared generic abstraction" decision is reversed (one shared `ListingCard`; `ToolCard`
is now a thin adapter over it), and the "Tool model as dead code until pre-prod cleanup" framing is corrected
(Tool/Category/Tag are the retained reference engine + shared taxonomy). The structural-pattern repurposing
below still holds.

## Context

Dirstarter's core concept is a "Tool Directory" — a generic listing pattern with:

- A `Tool` model (name, slug, description, status, content, categories, tags, owner)
- Public detail page at `[slug]/page.tsx`
- Dashboard management at `dashboard/listing.tsx` + `dashboard/table.tsx`
- Card/list/query/filter/search components in `components/web/tools/` and `components/web/listings/`
- Server queries in `server/web/tools/` and `server/admin/tools/`
- SEO metadata, structured data, and static generation via `generateStaticParams`

Ronin Dojo has no use for "tools" — it's a martial arts platform. However, it needs three analogous directory listing patterns:

1. **Technique Listing** — public technique library per school, filterable by discipline/position/difficulty/belt range
1. **Public User Profile** — member directory with privacy controls (DirectoryProfile visibility + per-field toggles)
1. **School/Org Page** — public school pages with programs, techniques, content, and join CTA

All three domain models already exist in the schema (Technique, Passport+DirectoryProfile, Organization). The UI and routing layer is what needs to be built.

## Decision

**Extend the Dirstarter Tool/Listing L1 pattern for all three domain listing types.** Specifically:

1. **Preserve the structural pattern** — slug-based routing, card grid listings, detail pages, dashboard management, query/filter/search, DataTable for owner management.
1. **Map domain models onto the pattern** — each listing type gets its own route group, server queries, card component, and filter set. No shared "generic listing" abstraction — each type is its own concrete implementation following the L1 pattern.
1. **Keep the original Tool model in the schema** as reference until pre-prod cleanup (per existing TODO comment in schema.prisma).
1. **Do not modify the L1 Tool components.** Create new domain-specific components (`technique-card.tsx`, `member-card.tsx`, `school-card.tsx`) that follow the same structural patterns.

## Consequences

### Positive

- All three listing types get battle-tested UX patterns (SEO, filtering, pagination, dashboard CRUD) with no invention risk.
- L1 compliance is maintained — we're extending, not replacing.
- Component inventory rules still apply — all new components use L1 primitives (Card, Badge, Grid, Stack, DataTable, Form, etc.).

### Negative

- Three parallel implementations of a similar pattern means some structural repetition. This is acceptable — each domain type has enough unique fields and authorization rules that a shared generic abstraction would be premature.
- The Tool model + its components remain in the codebase as dead code until the pre-prod cleanup tracked in the schema TODO.

### Neutral

- Small schema migrations needed: add `slug` to DirectoryProfile, add `@@unique([brand, slug])` to Organization, possibly add `organizationId` to ContentAtom.

## Dirstarter docs proof

| Topic | URL |
| --- | --- |
| Project Structure | <https://dirstarter.com/docs/codebase/structure> |
| Content Management | <https://dirstarter.com/docs/content> |
| Authentication | <https://dirstarter.com/docs/authentication> |
| Theming | <https://dirstarter.com/docs/theming> |

## Alternatives considered

1. **Build from scratch** — rejected. Ignores the most reusable L1 pattern in the template.
1. **Generic listing abstraction** — rejected. Premature generalization. The three types differ enough (privacy model, authorization, field sets) that a shared component would leak domain logic.
1. **Keep "Tools" naming and rebrand** — rejected. Confusing. "Technique" / "Profile" / "School" are the ubiquitous language.

## Related decisions

- [ADR 0004 — Multi-brand as column](0004-multi-brand-as-column.md) — brand scoping applies to all three listing types
- [ADR 0012 — Admin CRUD routing pattern](0012-admin-crud-routing-pattern.md) — admin-side CRUD for techniques follows this pattern

## Follow-up sweep (deferred from SESSION_0243)

**Status:** open — tracked for SESSION_0245+

**Scope:** Public listing-page chrome parity (`getPageMetadata` + `Breadcrumbs` + `StructuredData` + `getRequestBrand` + cross-links) has been completed for every public route that has a `page.tsx` today (SESSIONs 0241–0243). The deeper Tool→DirectoryListing pattern repurposing across all admin-side call sites is **not yet swept**.

### Remaining work (next session triage)

1. Audit any remaining admin CRUD surfaces (`apps/web/app/admin/`) that still reference the legacy "Tool" naming or pattern and confirm they have been migrated to the per-entity listings (Techniques, Members, Schools, Organizations, Lineage, Programs, Courses, Gear, Merch).
1. Inventory any `(web)/categories`, `(web)/tags`, `(web)/certificates` directories — these currently have NO `page.tsx`; decide whether to author public listing pages or remove the directory shells.
1. Confirm `Section` / `Wrapper` / `Note` / `Intro` primitives are consistent across all uplifted pages; SESSION_0242 standardized on `Section` and `Note` for empty states.

**Why deferred:** SESSION_0243 prioritized Vercel prod rescue + the three remaining public-route uplifts (`/directory`, `/members`, `/techniques`). Deeper sweep is multi-session and lands cleaner after the Baseline content waterfall (SESSION_0244) so seeded data informs which surfaces are actually live.
