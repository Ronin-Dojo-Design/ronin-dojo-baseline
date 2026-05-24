---
title: "Project Log Archive — Rules"
slug: project-log-archive-rules
type: archive
status: archived-frozen
created: 2026-05-23
updated: 2026-05-23
last_agent: claude-session-0228
pairs_with:
  - docs/protocols/project-log.md
---

Historical archive shard frozen at SESSION_0215 close. Append-only history preserved for reference. The canonical record going forward is the per-session `docs/sprints/SESSION_NNNN.md` file. Do not append to this shard.

## Rules

1. Every Cody task that touches code gets a build log entry.
2. Every planned task gets a task plan entry with stable ID: `SESSION_NNNN_TASK_XX`.
3. Every hostile/full close gets a review entry with stable ID: `SESSION_NNNN_REVIEW_XX`.
4. Findings get stable IDs: `SESSION_NNNN_FINDING_XX`.
5. Entries are never edited after creation (append-only). If status changes, append a note.
6. Opening ritual requires a task plan entry when tasks are identified. Closing ritual requires a review entry before `closed-full`.

---
