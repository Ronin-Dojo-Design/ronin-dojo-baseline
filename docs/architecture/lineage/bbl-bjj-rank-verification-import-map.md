---
title: "BBL BJJ Rank + Verification Import Map"
slug: bbl-bjj-rank-verification-import-map
type: architecture
status: active
created: 2026-05-26
updated: 2026-05-26
last_agent: codex-session-0264
pairs_with:
  - docs/sprints/SESSION_0264.md
  - docs/architecture/lineage/SESSION_0263_bbl_recon.md
  - docs/architecture/lineage/lineage-editor-permissions-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# BBL BJJ Rank + Verification Import Map

## Purpose

SESSION_0264 pivoted to rank and verification first for Black Belt Legacy BJJ data. The legacy WordPress/PODs files are schema exports plus frontend normalizers, not full member row dumps, so this map pins the source fields before importer or hand-entry work proceeds.

## Source Files

Legacy monorepo paths:

- `/Users/brianscott/dev/ronin-dojo-monorepo/wordpress/pods/bbl_member_pod.json`
- `/Users/brianscott/dev/ronin-dojo-monorepo/wordpress/pods-exports/bbl-pod-member-live-export-2026-02-20.json`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/data/beltInfoSchema.js`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/utils/bblDtoContracts.js`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/utils/podsMapper.js`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/lineageDataSource.js`

Current app implementation:

- `apps/web/server/web/lineage/bbl-bjj-rank-map.ts`
- `apps/web/server/web/lineage/bbl-bjj-rank-map.test.ts`

## Canonical Field Map

`bbl_member` stores one group per BJJ rank:

| Current rank | Rank short name | Date field | Promoter field | Location field | Media field |
| --- | --- | --- | --- | --- | --- |
| White Belt | `W0` | `white_belt_promotion_date` / `white_belt_start_date` | none | none | `white_belt_pictures` |
| Blue Belt | `BL0` | `blue_belt_promotion_date` | `who_promoted_you_to_blue_belt` | `where_you_were_promoted_to_blue_belt` | `blue_belt_pictures` |
| Purple Belt | `P0` | `purple_belt_promotion_date` | `who_promoted_you_to_purple_belt` | `where_you_were_promoted_to_purple_belt` | `purple_belt_pictures` |
| Brown Belt | `BR0` | `brown_belt_promotion_date` | `who_promoted_you_to_brown_belt` | `where_you_were_promoted_to_brown_belt` | `brown_belt_pictures` |
| Black Belt | `BK0` | `black_belt_promotion_date` | `who_promoted_you_to_black_belt` | `where_you_were_promoted_to_black_belt` | `black_belt_pictures` |
| Black Belt - 1st Degree | `BK1` | `1st_degree_black_belt_promotion_date` | `who_promoted_you_to_1st_degree_black_belt` | `where_you_were_promoted_to_1st_degree_black_belt` | `1st_degree_black_belt_pictures` |
| Black Belt - 2nd Degree | `BK2` | `2nd_degree_black_belt_promotion_date` | `who_promoted_you_to_2nd_degree_black_belt` | `where_you_were_promoted_to_2nd_degree_black_belt` | `2nd_degree_black_belt_pictures` |
| Black Belt - 3rd Degree | `BK3` | `3rd_degree_black_belt_promotion_date` | `who_promoted_you_to_3rd_degree_black_belt` | `where_you_were_promoted_to_3rd_degree_black_belt` | `3rd_degree_black_belt_pictures` |
| Black Belt - 4th Degree | `BK4` | `4th_degree_black_belt_promotion_date` | `who_promoted_you_to_4th_degree_black_belt` | `where_you_were_promoted_to_4th_degree_black_belt` | `4th_degree_black_belt_pictures` |
| Black Belt - 5th Degree | `BK5` | `5th_degree_black_belt_promotion_date` | `who_promoted_you_to_5th_degree_black_belt` | `where_you_were_promoted_to_5th_degree_black_belt` | `5th_degree_black_belt_pictures` |
| Black Belt - 6th Degree | `BK6` | `6th_degree_black_belt_promotion_date` | `who_promoted_you_to_6th_degree_black_belt` | `where_you_were_promoted_to_6th_degree_black_belt` | `6th_degree_black_belt_pictures` |
| Coral Belt (Red/Black) - 7th Degree | `CB7` | `7th_degree_black_belt_promotion_date` | `who_promoted_you_to_7th_degree_black_belt` | `where_you_were_promoted_to_7th_degree_black_belt` | `7th_degree_black_belt_pictures` |
| Coral Belt (Red/White) - 8th Degree | `CB8` | `8th_degree_coral_belt_promotion_date` | `who_promoted_you_to_8th_degree_coral_belt` | `promoted_at` | `8th_degree_coral_belt_pictures` |
| Red Belt - 9th Degree | `R9` | `9th_degree_coral_belt_promotion_date` | `who_promoted_you_to_9th_degree_black_belt` | `where_you_were_promoted_to_9th_degree_coral_belt` | `9th_degree_black_belt_pictures` |
| Red Belt - 10th Degree | `R10` | `10th_degree_coral_belt_promotion_date` | `who_promoted_you_to_10th_degree_coral_belt` | `where_you_were_promoted_to_10th_degree_coral_belt` | `10th_degree_black_belt_pictures` |

Legacy student CPTs such as Bob Bass, Bill Hosken, and Renato Magno use weaker date-only fields: `date_of_blue_belt_promotion`, `date_of_purple_belt_promotion`, `date_of_brown_belt_promotion`, `date_of_black_belt_promotion`, and degree variants like `date_of_1st_degree_black_belt_promotion`. These map to the same current ranks, but they usually do not carry per-rank promoter or school references.

## Current Model Mapping

- `RankAward.awardedAt` receives the legacy date field value.
- `RankAward.location` receives a resolved school/location label when the PODs location reference can be resolved.
- `RankAward.mediaUrls` receives belt photo URLs.
- `RankAward.awardedById` is set only when a legacy `bbl_member` promoter reference resolves to a current `User`.
- `LineageRelationship.type = PROMOTED_BY` links the promoter node to the promoted member node and can reference the matching `RankAward`.
- `LineageNode.verificationStatus` and `LineageRelationship.verificationStatus` carry verification. `RankAward` has no verification field.

## Verification Semantics

Legacy BBL has source-level verification, not per-rank-award verification.

| Legacy source value | Current status |
| --- | --- |
| `is_verified = true`, `verified`, `approved` | `VERIFIED` |
| missing, `false`, `pending`, `needs-proof`, `needs-info` | `PENDING` |
| `disputed`, `denied`, `rejected` | `DISPUTED` |

When a source profile is `VERIFIED`, imported `PROMOTED_BY` relationships may be initialized as verified only if the referenced promoter also resolves cleanly. Otherwise keep the relationship `PENDING` and preserve the legacy reference for review.

## Open Gaps

- The located legacy files are schema exports and mapper code, not complete member row data.
- PODs verification is profile/branch-level; there is no clear per-belt verification flag.
- The current BJJ seed previously skipped a base `Black Belt` rank. SESSION_0264 adds `BK0` so legacy `black_belt_promotion_date` does not get collapsed into `BK1`.
- The import helper returns legacy references. A later importer still has to resolve those references to Ronin users, nodes, schools, and media URLs.
