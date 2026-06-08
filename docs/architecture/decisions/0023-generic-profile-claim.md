---
title: "ADR 0023 — Generic Profile Claim (member/org)"
slug: adr-0023-generic-profile-claim
type: decision
status: accepted
created: 2026-06-07
updated: 2026-06-07
last_agent: claude-session-0354
pairs_with:
  - apps/web/prisma/schema.prisma
  - apps/web/server/web/claims/claim-actions.ts
  - apps/web/server/admin/claims/claim-review-actions.ts
  - docs/sprints/SESSION_0354.md
  - docs/petey-plan-0355.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0023 — Generic Profile Claim (member/org)

## Status

Accepted

## Context

The `/directory` discovery surface lists people (`DirectoryProfile`) and organizations
(`Organization`). Some of those entries are legitimately "unclaimed":

- an **owner-less Organization** (`ownerId = null`) — e.g. an admin/import added a school
  before its real owner had an account;
- a **legacy placeholder person** (`DirectoryProfile` whose `User.isPlaceholder = true`) —
  a name imported with no login behind it.

Clicking such an entry previously rendered an empty profile or a `notFound()`. We want a
self-serve path for the real owner to take it over (so admins don't have to hand-wire
ownership for every imported school), surfaced as a "mock profile" claim teaser.

A claim flow already exists for **lineage** (`LineageClaimRequest`: request → admin
review queue → approve, targeting a `LineageNode` on a tree). The question was whether to
generalize that model or add a parallel one for directory subjects.

## Decision

Add a **separate, generic `ProfileClaimRequest` model** that mirrors the lineage claim
*pattern* (request → admin review → approve) rather than overloading `LineageClaimRequest`.

- Subject is polymorphic: exactly one of `directoryProfileId` (PERSON) or `organizationId`
  (ORGANIZATION), discriminated by `subjectType` (enforced in the action, not the DB).
- Reuse the existing `LineageClaimStatus` enum; add `ProfileClaimSubjectType` +
  `ProfileClaimRelationship`. Brand is stored on the row and all queries are brand-scoped.
- **Claimable** is narrow and data-derived: owner-less orgs + placeholder-User profiles.
  Normal people (who already have an owner) are never claimable; there is no ownership
  *transfer* between live accounts.
- **Approval side-effects:** ORGANIZATION approval sets `organization.ownerId = claimant`
  (only when still null, inside a transaction). PERSON approval is a **flagged manual**
  placeholder→account merge — not automated, because merging an identity is deliberate and
  unsafe to do implicitly.
- Abuse guard: one PENDING/APPROVED claim per claimant per subject; admin-gated review.

## Consequences

- Two claim systems coexist (lineage vs profile). They share a pattern + status enum but
  point at different subjects and grant different things; a single model would have been a
  leaky union. Documented in the glossary + a project memory so they aren't conflated.
- The directory detail page branches by gate reason: placeholder → claim teaser; HIDDEN →
  keep `notFound()` (no existence leak); tier-gated → existing listing preview.
- The migration is additive (CREATE TYPE/TABLE/INDEX + ADD FK), safe for the
  `prebuild: db:migrate deploy` auto-apply on the Vercel build (ADR 0017).
- Open follow-ups (SESSION_0354): owner-less-org "Claim this organization" CTA, the person
  placeholder→account merge, and browser verification of the UI paths.

## Alternatives considered

- **Generalize `LineageClaimRequest` to be polymorphic.** Rejected — it is tied to
  tree/node/evidence semantics and a different approval payload (node + tier comps); making
  it union over directory subjects would muddy both flows.
- **Route the claim CTA to existing create/sign-up flows (no model).** Rejected by operator
  grill — they wanted the admin-reviewed claim-request pattern, not just "create your own".
- **Allow person-to-person ownership transfer.** Out of scope — needs abuse controls; the
  placeholder-only rule avoids inventing that.
