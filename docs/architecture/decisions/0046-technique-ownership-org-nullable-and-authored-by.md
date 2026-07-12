---
title: "ADR 0046 — Technique ownership: org-nullable (= school) + authored-by Passport + variants"
slug: 0046-technique-ownership-org-nullable-and-authored-by
type: adr
status: accepted
created: 2026-07-11
updated: 2026-07-11
last_agent: claude-session-0528
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/architecture/decisions/0038-separation-separate-dbs-per-product.md
backlinks:
  - docs/sprints/SESSION_0528.md
  - docs/knowledge/wiki/index.md
---

# ADR 0046 — Technique ownership: org-nullable (= school) + authored-by Passport + variants

**Status:** accepted (SESSION_0528). Ratified in a `/grill-with-docs` session before the Slice-3
authoring build, to resolve how an Elite member's self-authored technique is owned once authoring moves
off hand-seeded scripts onto a member-facing create flow.

## Context

`Technique` was org-owned only: `organizationId String` (required), `@@unique([brand, organizationId,
slug])`, `brand` derived from `org.brand`, and create/edit gated on an **org `Membership` with an
OWNER/INSTRUCTOR `roleAssignment`**. SESSION_0528's live-verify surfaced the blocker: **the BBL org has
zero OWNER/INSTRUCTOR memberships** — BBL's roster is placeholder Passports via `LineageTree`, not
`Membership` (ADR 0025 / roster model) — so *no user can author a BBL technique through the existing
gate*. Slice 3 needs Elite members to author techniques that appear on their profile, that staff can
promote into the canonical library, and (operator refinement) that **group by school** with **per-author
variants** ("all South Bay techniques by multiple Elite authors, incl. two instructors' renditions of the
same armbar").

The first-cut plan was "make techniques Passport-owned → `organizationId` nullable." Grilling it against
the platform model (org/brand-scoping is the isolation boundary — ADR 0034/0038) and the existing schema
(several content models are *already* org-nullable — `ContentAtom`, `Media`, `LineageTree`; Passport
*already* owns content — `MediaAttachment.passportId`) reshaped it: the org should not become a dummy
container, it should become the **school** (the grouping axis the operator actually wants), and a separate
**authored-by** column should carry ownership + variants.

## Decision

### D1 — `organizationId` becomes nullable and means *the author's school*

`Technique.organizationId String?`. For an authored technique it is the author's **current school** (from
their `Affiliation.organizationId`, itself nullable — some members have a free-text/placeholder school and
no org row). `null` → the technique is **profile-only, ungrouped**. Existing library techniques keep their
org. Grouping falls out of the column: *by school* = `where organizationId = X`.

### D2 — `authorPassportId` carries ownership (not the org)

`Technique.authorPassportId String?` → `Passport`. Non-null = a member-authored technique (surfaces on
that member's profile curriculum, `where authorPassportId = me`). **`null` = canonical / org-seeded** (the
existing library). Ownership, member-by-member curriculum, and variants all key off this column — not the
org. This preserves the org/brand-scoping invariant that a nullable-org-*as-owner* would have broken:
techniques are still brand-scoped and (usually) school-grouped; the *person* is a separate axis.

### D3 — Variants are independent per-author rows, grouped in the UI (not a concept/variant entity)

Two instructors' "Armbar from Closed Guard" = **two `Technique` rows**, same school org, same slug,
different `authorPassportId`. "Variant" is a **display** concept (group same-`(org, slug)` rows by author),
not a schema concept. No canonical-concept parent entity (YAGNI). Uniqueness splits by author:

- canonical (author `null`): unique on `(brand, organizationId, slug)` — partial index `WHERE
  author_passport_id IS NULL` (a plain composite `@@unique` with a nullable author column would let
  duplicate canonical rows through, since Postgres treats NULLs as distinct).
- authored (author non-null): unique on **`(brand, authorPassportId, slug)`** — partial index `WHERE
  author_passport_id IS NOT NULL`, keyed off the **author, not the org**. So different authors can share
  `(org, slug)` (= variants), but one author cannot duplicate their own `(brand, slug)` across schools
  (a person's curriculum has one "armbar-from-guard"). Implemented `Technique_authored_slug_key`
  (SESSION_0528 3A).

### D4 — `isFeatured` promotes into the canonical browse; attribution is preserved

`Technique.isFeatured Boolean @default(false)`. A staff "promote to library" action flips it; the technique
keeps its `authorPassportId` (the library shows "Armbar — by Instructor X"). Public browse/rails discovery
filters `organizationId != null OR isFeatured = true` (authored profile-only techniques stay off the
canonical browse until featured); a school curriculum filters `organizationId`; a profile curriculum
filters `authorPassportId`.

### D5 — Create/edit gate is capability-based, not membership-based

`canCreateTechniqueForUser(user, brand)` mirrors `canUploadMediaForUser`: `can()` RBAC **∨** staff role
(OWNER/INSTRUCTOR) **∨** Elite entitlement — **no 5th authz system**. `brand`: `org.brand` when an org is
present, else the creator's brand context. Edit: the author edits their own (`authorPassportId = me`);
org staff/RBAC edit any in their org; canonical (null author) is staff/RBAC-only.

## Consequences

- **Migration is additive** (three columns + two partial unique indexes; hand-authored, shadow-replayed —
  never `migrate-dev` on the shared local DB). Existing org-owned techniques are unaffected (org stays set,
  `authorPassportId` null, `isFeatured` false).
- **Every technique read that assumed a non-null org** must tolerate null (public browse/rails/watch get the
  `organizationId != null OR isFeatured` discovery filter; profile/school surfaces get the new filters).
  This is the real blast radius and the reason it was grilled before building.
- **Reversible-ish, not free:** dropping org-nullability later would require re-homing every authored
  technique — hence the ADR.

## Alternatives considered

- **Shape A — Passport-*owned*, org nullable-as-owner (polymorphic owner org XOR passport).** Rejected: makes
  the owner polymorphic, breaks the org/brand-scoping invariant, and makes "promote to library" ambiguous.
  D1+D2 keep the school (org) and the person (author) as *separate* axes instead.
- **Keep org required, author on the BBL org container.** Rejected once the operator's school-grouping +
  variants requirement landed — the org must be the *school* to group, and school is a soft/nullable concept
  in the identity model (`Affiliation.organizationId` is itself nullable).
- **Concept + variant entities (D3 option B).** Deferred (YAGNI) — no current need for a canonical rendition
  that variants are explicitly derived from/compared against; grouping is a display concern.
