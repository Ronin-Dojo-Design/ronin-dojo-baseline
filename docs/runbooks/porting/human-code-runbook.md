---
title: Human Code Runbook — WordPress/Pods → TypeScript map
slug: human-code-runbook
type: reference
status: active
created: 2026-06-09
updated: 2026-06-09
last_agent: claude-session-0358
pairs_with:
  - docs/knowledge/wiki/concepts/passport-and-shells.md
  - docs/knowledge/wiki/repo-truth-index.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - porting
  - onboarding
  - bbl
---

# Human Code Runbook — WordPress/Pods → TypeScript

Plain-English bridge for a reader who knows the **old Black Belt Legacy WordPress/Pods** site but not the
new TypeScript app. It answers one question: *"the data I knew as a Pod field — where does it live now?"*
Source Pods are listed in `RoninDashboard/context/BBL_PODS_SCHEMA.md` (monorepo); the new home is the
Prisma schema (`apps/web/prisma/schema.prisma`). Canonical model: [passport-and-shells](../../knowledge/wiki/concepts/passport-and-shells.md)
and [ADR 0025](../../architecture/decisions/0025-passport-identity-source-of-truth.md).

## The big picture

- A WordPress **Pod** ≈ a database table. Each **Pod field** ≈ a column.
- One `bbl_member` Pod row becomes **several** rows in the new app, because the new app splits a person
  into purpose-built pieces instead of one wide row: **identity** (`User` + `Passport`), **each belt** (a
  `RankAward`), **their school** (an `Affiliation`), and **their place on the family tree**
  (`LineageTreeMember` + a `PROMOTED_BY` edge).
- One `bbl_school` Pod row becomes an **`Organization`**.

## `bbl_member` → identity (`User` + `Passport`)

| Pod field | New home | Notes |
| --- | --- | --- |
| `full_name` | `User.name` (+ `Passport.legalFirstName`/`legalLastName`) | `Passport.displayName` is the public name |
| `email_address` | `User.email` | Imports with no login get a synthetic placeholder + `isPlaceholder` |
| `bio` / `biography` | `Passport.bio` | |
| `cover_photo` | `Passport.coverPhotoUrl` | identity media lives on Passport |
| profile photo | `Passport.avatarUrl` | preferred over `User.image` everywhere |
| intro video | `Passport.videoIntroUrl` | |
| `date_of_birth` | `Passport.dob` | |
| `place_of_birth` | `Passport.placeOfBirth` | |
| `white_belt_start_date` | `Passport.startedTrainingAt` | when they began training |

## `bbl_member` belt fields → promotions (`RankAward`, one per belt)

Each belt group (`*_belt_promotion_date`, `who_promoted_you_to_*`, `where_you_were_promoted_to_*`,
`*_belt_pictures`) becomes **one `RankAward`** for that `Rank` (RankAward is the canonical promotion fact,
[ADR 0016](../../architecture/decisions/0016-lineage-promotion-source-of-truth.md)):

| Pod field | New home |
| --- | --- |
| `<belt>_promotion_date` | `RankAward.awardedAt` (with `rank` = that belt) |
| `who_promoted_you_to_<belt>` / `name_of_coaches_that_gave_you_…` | `RankAward.awardedBy` **and/or** the lineage `PROMOTED_BY` edge |
| `where_you_were_promoted_to_<belt>` | `RankAward.location` (free text) or `RankAward.organization` (linked school) |
| `<belt>_pictures` | `RankAward.mediaUrls` |

Imported promotions are `source = STATED`, `verificationStatus = IMPORTED` (assertions until verified). The
person's **current belt is derived** — the highest *verified* award — never stored as a single field.

## `bbl_member` school → `Affiliation`

| Pod field | New home | Notes |
| --- | --- | --- |
| `current_school` / `home_gym` | `Affiliation` → linked `Organization` or free-text `schoolName`, `role = TRAINS_AT`, `isCurrent = true` | the **canonical** school axis — NOT `Membership` (that's Baseline enrollment) |
| `name_of_coaches` | lineage `PROMOTED_BY` / instructor relationships | who taught/promoted them |

## `bbl_school` → `Organization`

| Pod field | New home |
| --- | --- |
| `name_of_school` | `Organization.name` |
| `school_location_address` | `Organization.addressLine1` / `city` / `state` / `country` |
| `owner_names` | claimed via `Organization.ownerId` (profile-claim, ADR 0023); else shown as text |
| `history_biography_of_school` | `Organization.description` |
| `school_logo` | Organization media attachment |
| `phone_number` / `email_address` | `Organization.phoneE164` / contact fields |
| `facebook/instagram/youtube_…_school`, website | `Organization.websiteUrl` + social links |

## Putting a person on the family tree

The WordPress site implied lineage through "who promoted you" text. The new app makes it a real graph:
a person becomes a **`LineageTreeMember`** of a brand's `LineageTree`, hung under a **visual parent**, and
the promotion becomes a **`PROMOTED_BY` `LineageRelationship`** that references the `RankAward`. The admin
**add-person** flow (`/admin/users/new`) creates the whole set in one step — see
[ADR 0025](../../architecture/decisions/0025-passport-identity-source-of-truth.md).

## See also

- [Repo Truth Index → canonical-entity layer](../../knowledge/wiki/repo-truth-index.md) — entity → source-of-truth table.
- [Ubiquitous Language](../../architecture/ubiquitous-language.md) — domain term definitions.
- [Repo Code Glossary](../../knowledge/wiki/repo-code-glossary.md) — DTO, view-model, and other code terms.
