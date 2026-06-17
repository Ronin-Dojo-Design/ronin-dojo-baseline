---
title: "BBL — Dirty Dozen Profile Import Spec"
slug: bbl-lineage-import-spec
type: spec
status: active
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0403
pairs_with:
  - docs/sprints/SESSION_0403.md
  - docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - blackbeltlegacy
  - lineage
  - import
  - migration
---

# BBL — Dirty Dozen Profile Import Spec

`apps/web/scripts/import-bbl-lineage-profiles.ts` (SESSION_0403 TASK_02) imports the BBLApp featured black
belts into the Baseline identity spine as **claimable placeholder Passports**, tagged as the "Dirty Dozen"
cohort. It is the BBL.com import lane of the gift/comp membership epic.

## Source

Monorepo `src/brands/blackbeltlegacy/data/featuredBlackBelts.js` (`FEATURED_BLACK_BELTS`), mirrored live by
the `bbl_member` Pods CPT. Seven featured profiles: Bob Bass, John Will, David Meyer, Rick Williams, Chris
Haueter, Renato Magno, John Lewis. The script embeds the curated subset it needs (name, handle, avatar, bio,
location, website, member-since, Dirty Dozen rank).

## What it writes (per profile, idempotent)

| Model | Key / dedupe | Notes |
| --- | --- | --- |
| `Passport` | `displayName` + `userId: null` | Accountless ⇒ claimable. **Same key `seed-baseline-lineage.ts` uses**, so the 6 people that seed already creates are reused, not duplicated. Identity fields (avatar, bio, socialLinks, startedTrainingAt, legal name) are enriched **only when empty** (non-destructive). |
| `DirectoryProfile` | `passportId` (unique) | PUBLIC + slug + parsed location. The baseline seed does NOT create these, so the import is what makes the cohort directory-discoverable + profile-claimable. |
| `LineageNode` | `passportId` | Reused if present; created PUBLIC + verified for new people (John Lewis). |
| `LineageTreeMember` | `treeId` + `nodeId` | Claimable, in a dedicated `bbl-dirty-dozen` tree. |
| `LineageVisualGroup` | `treeId` + label contains "Dirty Dozen" | One cohort box; every imported member points at it. |

### Why a dedicated tree

The import targets a dedicated BBL `bbl-dirty-dozen` `LineageTree` (`--tree-slug` overridable) rather than the
existing baseline-cloned BBL Rigan tree. A `LineageNode` can be a member of several trees, so this keeps the
cohort self-contained and never re-points or removes members from the Rigan tree/group. People (Passport /
LineageNode / DirectoryProfile) are global identity (ADR 0025) and are deduped, so no person is duplicated even
though the projection tree is new. The cohort spans multiple promoters (Rigan, Machado Brothers, Pederneiras),
so the group is tree-level (unparented) rather than parented to Rigan.

## Comp on claim (important — read this)

The Dirty Dozen cohort is intended to receive a **lifetime `LINEAGE_ELITE`** comp when a real account claims
the placeholder (operator decision, SESSION_0403; the gift epic's "Dirty Dozen = lifetime elite").

**This import does not write comp grants, and "auto-on-claim" is not literally wired today.** The current
claim-approval action (`server/admin/lineage/claim-review-actions.ts`) applies a comp **only when the reviewer
supplies `input.comp` = { tier, termDays }** — there is no cohort→comp auto-derivation in code. The import's job
is to make the cohort *identifiable* (the "Dirty Dozen" `LineageVisualGroup`) so:

- the reviewer applies `{ tier: "LINEAGE_ELITE", termDays: null }` on approving a Dirty Dozen claim, **or**
- a future enhancement reads the claimed node's visual group and auto-applies the comp.

Decide with the operator whether to build that auto-wire; it is out of scope for this import.

## Avatars / media

The WordPress profile images are synced to `s3://bbl-media/media/bbl/profiles/`. Each export image is matched
**by filename** and resolved under that key via `NEXT_PUBLIC_MEDIA_BASE_URL` (the same media base
`lib/media.ts` uses), e.g. `…/lineage/Old-school-Bob.jpg` → `${NEXT_PUBLIC_MEDIA_BASE_URL}/media/bbl/profiles/Old-school-Bob.jpg`.
This sets `Passport.avatarUrl` (and `Passport.coverPhotoUrl` / `DirectoryProfile.coverPhotoUrl` when a cover is
present — none in the current export). With no media base set, the relative `/media/bbl/profiles/<file>` key is
stored. Absolute URLs in the export pass through untouched.

## Usage

```bash
# from apps/web
bun run scripts/import-bbl-lineage-profiles.ts --dry-run
NEXT_PUBLIC_MEDIA_BASE_URL=https://bbl-media.s3.amazonaws.com \
  bun run scripts/import-bbl-lineage-profiles.ts
bun run scripts/import-bbl-lineage-profiles.ts --tree-slug bbl-dirty-dozen
```

Run `prisma/seed-bbl-org.ts` first if you want the tree linked to the BBL organization (optional; the import
creates the tree either way).

## Verify after running

- `/members` (directory) lists the seven profiles (PUBLIC DirectoryProfiles).
- `/lineage/<bbl-dirty-dozen>` shows the cohort box with claimable members.
- Claiming one attaches the account to that node's Passport; reviewer applies the lifetime ELITE comp.

## Cross-references

- SESSION_0403 (`docs/sprints/SESSION_0403.md`, lands with the pricing-seed PR) — this session
- [Gift / comp membership epic](GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md) — comp cohort + tier-gating
- [ADR 0025 — Passport identity source of truth](../../architecture/decisions/0025-passport-identity-source-of-truth.md)
