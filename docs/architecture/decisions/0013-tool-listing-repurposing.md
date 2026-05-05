---
title: "ADR 0013 — Tool→Listing Pattern Repurposing"
slug: adr-0013-tool-listing-repurposing
type: decision
status: accepted
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0066
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

**Accepted** — 2026-05-04

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
2. **Public User Profile** — member directory with privacy controls (DirectoryProfile visibility + per-field toggles)
3. **School/Org Page** — public school pages with programs, techniques, content, and join CTA

All three domain models already exist in the schema (Technique, Passport+DirectoryProfile, Organization). The UI and routing layer is what needs to be built.

## Decision

**Extend the Dirstarter Tool/Listing L1 pattern for all three domain listing types.** Specifically:

1. **Preserve the structural pattern** — slug-based routing, card grid listings, detail pages, dashboard management, query/filter/search, DataTable for owner management.
2. **Map domain models onto the pattern** — each listing type gets its own route group, server queries, card component, and filter set. No shared "generic listing" abstraction — each type is its own concrete implementation following the L1 pattern.
3. **Keep the original Tool model in the schema** as reference until pre-prod cleanup (per existing TODO comment in schema.prisma).
4. **Do not modify the L1 Tool components.** Create new domain-specific components (`technique-card.tsx`, `member-card.tsx`, `school-card.tsx`) that follow the same structural patterns.

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
2. **Generic listing abstraction** — rejected. Premature generalization. The three types differ enough (privacy model, authorization, field sets) that a shared component would leak domain logic.
3. **Keep "Tools" naming and rebrand** — rejected. Confusing. "Technique" / "Profile" / "School" are the ubiquitous language.

## Related decisions

- [ADR 0004 — Multi-brand as column](0004-multi-brand-as-column.md) — brand scoping applies to all three listing types
- [ADR 0012 — Admin CRUD routing pattern](0012-admin-crud-routing-pattern.md) — admin-side CRUD for techniques follows this pattern
