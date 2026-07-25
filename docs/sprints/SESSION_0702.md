---
title: "SESSION 0702 — Plan/grill: BBL vertical lineage timeline v2 + LineageProfileDrawer_v2 (PL-025)"
slug: session-0702
type: session--staged
status: staged
created: 2026-07-25
updated: 2026-07-25
last_agent: session-0681-orchestrator
sprint: S12
lane: product
recipe: "AM_Plan_Session"
goal_ids: [PL-025]
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/sprints/SESSION_0681.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0702 — Plan/grill: lineage timeline v2 + drawer v2

> **Staged by SESSION_0681 (operator-directed).** Adopt: flip `status:` → `in-progress`, run
> `/grill-me` on PL-025. **Plan lane — no build.** Worktree-only (canonical-claim check at bow-in).

## Goal

Grill + plan PL-025: instructor timeline cards link to LineageProfileDrawer; drawer gets a `_v2`
(desi-design-review recipe + /hallmark pass) with a personal belt-history vertical timeline
(white → current, mirrors instructor lineage), each belt a TimeCapsuleCard accordion → 
StudentsCarousel-style horizontal media swiper (pics/videos/tournament wins).

## Open forks to grill (starter set — grill for more)

1. Drawer_v2 scope: parallel component vs in-place upgrade (ONE-editor law analog: no permanent v1/v2 fork — v2 replaces).
2. Belt-history data: RankEntry-only law (`memberTopRank` truth) — what feeds TimeCapsuleCards for placeholder Passports with sparse history?
3. Media per belt: which model binds media → a rank era? (new join vs tags on existing media). R2/uploader family only.
4. Freemium: which capsule content is public vs premium (profile-media-freemium-model-0525 precedent)?
5. Perf: drawer already heavy — lazy-load capsules? swiper virtualization?
6. Relation to WL-P2-23 deep-links (0698 lane) + PL-026 school-page family.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0702_TASK_01 | pending | /grill-me PL-025 → ratified plan + fan-out lane specs |

## What landed

## Proposed ledger edits

## Open decisions / blockers

## Next session
