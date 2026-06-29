---
title: "Project Log (retired)"
slug: project-log
type: protocol
status: archived-frozen
created: 2026-04-28
updated: 2026-06-28
last_agent: claude-session-0468
sprint: S6
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/protocols/hostile-close-review.md
  - docs/_archive/project-log/01-build-log.md
  - docs/_archive/project-log/02-task-plan-log.md
  - docs/_archive/project-log/03-task-review-log.md
  - docs/sprints/_template/SESSION_TEMPLATE.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Project Log (retired)

> Relocated here from `docs/protocols/project-log.md` at **SESSION_0468** (S48 lean-out): an
> `archived-frozen` doc does not belong in the active `docs/protocols/` dir. A tombstone stub remains
> at the old path so inbound links resolve.

**Status:** Frozen at SESSION_0215 close. **Do not append to this file or its archives.**

## What replaced it

The per-session `docs/sprints/SESSION_NNNN.md` file is now the canonical record. Each SESSION file carries its own:

- Build log entries (under `## What landed` and `## Files touched`)
- Task plan entries (under `## Petey plan` and `## Task log`)
- Review entries (under `## Review log` and `## Hostile close review`)
- Findings (within the hostile-close-review block)

Stable IDs (`SESSION_NNNN_TASK_XX`, `SESSION_NNNN_REVIEW_XX`, `SESSION_NNNN_FINDING_XX`) continue to live inside SESSION files. There is no separate cross-session ledger; if you need to trace an ID, grep the `docs/sprints/` tree.

## SESSION template

Copy `docs/sprints/_template/SESSION_TEMPLATE.md` at bow-in, rename to `SESSION_NNNN.md`, fill in.

## Historical archive (read-only)

- [Rules (legacy)](project-log/00-rules.md)
- [Build log SESSION_0003 – SESSION_0224](project-log/01-build-log.md)
- [Task plan log SESSION_0021 – SESSION_0224](project-log/02-task-plan-log.md)
- [Task review log SESSION_0114 – SESSION_0218](project-log/03-task-review-log.md)

These are append-frozen at SESSION_0215. Do not modify. (Some sessions between SESSION_0216 and SESSION_0224 left residual entries inside the archive despite formal write-waivers; those entries are preserved verbatim and are also mirrored in their SESSION files.)

## Why retired

The append-only ledger grew to 2,121 lines and degraded Copilot/Claude hot-path context. SESSION files already carry the canonical per-session record; the cross-session ledger was duplicative. SESSION_0227 waived writes; SESSION_0228 formalizes the retirement.

## Cross-references

- [Opening ritual](../rituals/opening.md) — step 6 (create SESSION file at bow-in).
- [Closing ritual](../rituals/closing.md) — full-close writes review into the SESSION file.
- [Hostile close review](../protocols/hostile-close-review.md) — review entries go into the SESSION file, not here.
- [SESSION template](../sprints/_template/SESSION_TEMPLATE.md) — copy at bow-in.
