---
title: "SESSION 0731 — CI read-guard: fail new RankAward READS (#377)"
slug: session-0731
type: session--staged
status: staged
created: 2026-07-31
updated: 2026-07-31
last_agent: claude-fable-session-0730
sprint: S13
lane: bbl
recipe: "seq-lane-build"
goal_ids: ["G-011"]
tickets: ["#377"]
next_session:
pairs_with:
  - docs/sprints/SESSION_0730.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0731 — CI read-guard for RankAward reads (#377)

> **Staged by SESSION_0730.** #376 (the canonical rank-read seam + IMPORTED-lock lift) is
> **MERGED + LIVE on prod** (#397; 111/111 entries, 0 orphans verified). This lane locks the
> repoint in place. Adopt: flip `status:` → `in-progress`.

## Goal

Build the CI guard that FAILS any NEW `RankAward` READ outside the allowlist (the seam/compat
layer + the write anchor + rank-reviews keep), per ticket
[#377](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/377). Quick AFK lane.

## Resolved upstream (do not re-open)

- #376's done-condition grep is the guard's seed: `grep -rn rankAward apps/web/server apps/web/app`
  must show writes + anchor only. Writes keep the RankAward anchor until the #380 drop.
- IMPORTED-lock LIFTED (operator, SESSION_0730) — imported belts are the member's own WP
  self-report; do NOT reintroduce an origin lock. `provenance` = historical metadata only.
- **#380 is BLOCKED on #398** (preview env-scoping + Neon branch — D-055): no destructive
  migration rides a PR until the operator closes #398. The guard lane itself is docs/CI-only.
- FI-001 launch-prep is newly unblocked (correctness gate cleared with #397) — queued behind
  this lane, operator's pick at 0730 close.

## Baton (paste-ready)

```
/bow-in — Build lane (seq-lane-build), worktree. Adopt SESSION_0731 (flip status → in-progress).
Repo: black-belt-legacy (ONE repo, ADR 0059). Ticket #377: CI guard failing NEW RankAward READS.

FIRST: read ticket #377 + map #374 + SESSION_0730's close (the merged seam, the IMPORTED-lock
lift, the D-055 preview-migration gate). Ground truth: server/belt/member-ranks.ts,
rank-entry-compatibility.ts, rank-entry-display-order.ts, the #376 done-condition grep.

BUILD: a deterministic check (script + CI step in ci.yml) that inventories rankAward READ sites
outside the allowlist (seam/compat/write-anchor/rank-reviews keep) and fails on NEW ones —
baseline-pinned so existing sanctioned sites pass. Wire into the changes-detector so docs-only
PRs skip. Full local gates green.

HOLD: PR-only main; hold every push for the operator's word. #380 stays blocked on #398.
```

## Next session

<!-- staged by 0731 at its own bow-out -->
