---
title: "Directory / Organization / Profile Domain Hub"
slug: directory-org-profile-hub
type: runbook
status: active
created: 2026-06-07
updated: 2026-06-23
last_agent: claude-session-0438
domain: directory-org-profile
pairs_with:
  - docs/architecture/decisions/0023-generic-profile-claim.md
  - docs/architecture/decisions/0004-multi-brand-as-column.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/petey-plan-0356-profile-redesign.md
backlinks:
  - docs/runbooks/README.md
  - docs/knowledge/wiki/index.md
---

# Directory / Organization / Profile Domain Hub

Single entry point for the **discovery → profile → register/claim** surface: the public
directory, organization & school pages, person profiles, and the register/claim funnels that
connect them. **Start here for any org/directory/profile work** — read this hub → the relevant
SOP/ADR → the route inventory below, *before* planning (the SESSION_0356 discovery-process fix).

Pairs with the [Lineage Domain Hub](lineage-hub.md): lineage owns *promotion provenance*; this
hub owns *who/what is listed and how they get claimed or registered*.

## Mental model (read first)

Three subject types share one discovery + claim surface — keep them distinct:

- **Person** — a `DirectoryProfile` over a `User` (+ `Passport` for public identity:
  `displayName`, `avatarUrl`). Surfaced in `/directory` and `/members`.
- **Organization** — a brand-scoped `Organization` (schools are organizations with a school-ish
  presentation). Surfaced in `/organizations` and `/schools`. May be **owner-less** (`ownerId = null`).
- **LineageTree subject** — a `LineageNode` on a tree (owned by the [lineage hub](lineage-hub.md));
  appears here only via the shared claim pattern.

Two funnels connect a visitor to these subjects — **do not conflate them**:

- **Register** = create a *new* entity you own (`/organizations/new`, signup → directory presence).
- **Claim** = take over an *existing* owner-less / placeholder entity. **Person** claims (lineage
  node + directory profile, unified) write `PassportClaimRequest` → reviewed at `/app/lineage/claims`
  via `reviewPassportClaim` → approve attaches the account to the Passport. **Organization** claims
  write `ProfileClaimRequest` → `/admin/claims` review → approve sets `ownerId`. See
  [ADR 0023](../../architecture/decisions/0023-generic-profile-claim.md) + ADR 0036 P5 (SESSION_0438).

**Brand is a column** ([ADR 0004](../../architecture/decisions/0004-multi-brand-as-column.md)) — every
query in this domain is brand-scoped. Never add cross-brand fallbacks.

## Data model & decisions

- [ADR 0023 — Generic Profile Claim](../../architecture/decisions/0023-generic-profile-claim.md) — the `ProfileClaimRequest` model (polymorphic Person/Organization subject; owner-less + placeholder only; request → admin review → approve). **Authoritative for claim.**
- [ADR 0004 — Multi-brand as a column](../../architecture/decisions/0004-multi-brand-as-column.md) — brand-scoping for all directory/org queries.
- [ADR 0021 — Brand-aware magic links](../../architecture/decisions/0021-brand-aware-magic-links.md) / [ADR 0022 — Brand-chrome resolution](../../architecture/decisions/0022-brand-chrome-resolution.md) — the brand chrome these public pages render in.
- Schema: `apps/web/prisma/schema.prisma` — `DirectoryProfile`, `Organization`, `Membership`, `Passport`, `User`, `ProfileClaimRequest`.

## Tier policy (privacy vs monetization — important)

- **Server payload allowlist is the real privacy boundary** (guarded by `server/web/lineage/queries.visibility.test.ts`): no email/role/private notes ever leave the server.
- **`LineageProfileDetailRenderPolicy`** (tier gating of profile *contents*) is consumed **only by the directory** (`profile-projection.ts`, `directory/queries.ts`, `search-profiles.ts`). The **lineage profile drawer does NOT tier-gate contents** — it shows the full public profile to everyone (funnel-first, operator-ruled SESSION_0356; **drift D-022**). Don't assume the drawer gates by tier.

## Route inventory (the file map)

So a session opens the right file directly instead of grepping.

| Surface | Route | Page / key files |
| --- | --- | --- |
| **Directory (people + orgs + trees)** | `/directory`, `/directory/[slug]` | `app/(web)/directory/page.tsx`, `[slug]/page.tsx` |
| **Members** | `/members`, `/members/[slug]` | `app/(web)/members/` |
| **Organizations (public)** | `/organizations`, `/organizations/[slug]` | `app/(web)/organizations/page.tsx`, `[slug]/page.tsx` |
| **Schools (public)** | `/schools`, `/schools/[slug]` | `app/(web)/schools/page.tsx`, `[slug]/page.tsx` |
| **Register org** | `/organizations/new`, `/organizations/join`, `/organizations/[slug]/get-started` | `create-organization-form.tsx` |
| **Org admin (owner)** | `/organizations/[slug]/settings/*` | `settings/{general,invites,members,theme}/` |
| **Own profile** | `/me` | `app/(web)/me/` (+ `passport-editor.tsx`) |
| **Org claim review (admin)** | `/admin/claims`, `/admin/claims/[id]` (org-only since ADR 0036 P5) | `app/app/claims/` (`/admin/*` 308-redirects to `/app/*`) |
| **Person claim review (manager)** | `/app/lineage/claims`, `/app/lineage/claims/[id]` | `app/app/lineage/claims/` (unified `PassportClaimRequest` queue) |
| **Org admin (platform)** | `/admin/organizations`, `/admin/organizations/[id]/theme` | `app/admin/organizations/` |

### Read models & actions (server)

| Concern | File(s) |
| --- | --- |
| Directory read model + tier projection | `server/web/directory/queries.ts`, `profile-projection.ts`, `search-profiles.ts` |
| Directory filters/facets | `server/web/directory/filter-options.ts` |
| Claim submit (claimant) | `server/web/claims/claim-actions.ts` (`userActionClient`; owner-less/placeholder precondition; per-claimant dedup; brand-scoped) |
| Org claim review (admin) | `server/admin/claims/claim-review-actions.ts` (ProfileClaimRequest; approve sets `organization.ownerId`; org-only since P5) |
| Person claim review (unified) | `server/admin/claims/passport-claim-review-actions.ts` (`reviewPassportClaim` → `finalizePassportClaim`: real account→Passport attach + node entitlements when node context present). Admin queries: `server/admin/lineage/claim-queries.ts`. `applyLineageClaimReview` retained for legacy stragglers only. |

## Components

| Component | File | Role |
| --- | --- | --- |
| `ProfileHero` | `components/web/profile/profile-hero.tsx` | Shared public profile/identity shell (the profile-redesign anchor — `petey-plan-0356`). |
| `OrgClaimCta` | `components/web/claims/org-claim-cta.tsx` | Owner-less-org "Claim this organization" CTA (sign-in-gated, `?next=`). |
| `ListingRegisterCta` | `components/web/directory/listing-register-cta.tsx` | "Add your school" / "Join the directory" register callouts. |
| `create-organization-form` | `components/web/organizations/create-organization-form.tsx` | Register a new org (+ dedup hint — interim search-first). |
| Directory filters | `components/web/directory/*` | Faceted filtering (DataSelect / ComboboxSelector — see the [Custom Component Inventory](../../knowledge/wiki/custom-component-inventory.md)). |

Catalogued in [Custom Component Inventory](../../knowledge/wiki/custom-component-inventory.md).

## Open work & invariants

- **Profile redesign epic:** [petey-plan-0356](../../petey-plan-0356-profile-redesign.md) — one role-agnostic
  Person-presentation contract; public profiles adopt the shared `ProfileHero`; the unified search-first
  register/claim/invite funnel (Dirstarter submit pattern) is Lane E (warrants an ADR when built).
- **Register ≠ Claim** — keep the two funnels distinct (operator directive, SESSION_0355); a dedup hint
  bridges them on the create-org form until the unified funnel lands.
- **Drift to know:** D-022 (detail policy is directory-only; drawer shows full public view).

## Cross-references

- [Runbooks Domain Hub](../README.md) · [Lineage Domain Hub](lineage-hub.md)
- [ADR 0023 — Generic Profile Claim](../../architecture/decisions/0023-generic-profile-claim.md)
- [Profile-redesign epic](../../petey-plan-0356-profile-redesign.md)
- [Drift Register](../../knowledge/wiki/drift-register.md) (D-021 oRPC, D-022 drawer contents)
