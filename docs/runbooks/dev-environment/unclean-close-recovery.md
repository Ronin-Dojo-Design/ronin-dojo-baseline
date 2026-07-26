---
title: "Unclean close recovery"
slug: unclean-close-recovery
type: runbook
status: active
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0711
pairs_with:
  - docs/rituals/closing.md
  - docs/knowledge/wiki/incidents.md
backlinks:
  - docs/rituals/closing.md
---

# Unclean close recovery

Use when a previous session's bow-out was skipped — context loss, compaction, crash, or operator
error. (Moved out of `closing.md` at SESSION_0711; the ritual keeps a pointer.)

## When this applies

- The latest `SESSION_NNNN.md` has `status: in-progress` but the session is over.
- A new session discovers the previous one was never closed.
- The closing ritual was interrupted mid-flight.

## Recovery checklist

1. **Read the unclosed SESSION file.** Identify what was done by reading `git log`, `git diff`, and
   any partial `What landed` entries.
2. **Backfill the SESSION file.** Fill in `What landed`, `Files touched`, `Decisions resolved`,
   `Open decisions / blockers`, `Next session`.
3. **Set status:** frontmatter `status: closed` and add a
   `**Close notes:** unclean recovery — {reason}` line in the body.
4. **Log the incident.** Append an entry to
   [`docs/knowledge/wiki/incidents.md`](../../knowledge/wiki/incidents.md) with date, session
   number, reason, and recovery actions.
5. **JETTY sweep.** Run the closing ritual's frontmatter/backlinks sweep (closing.md step 3) on any
   files touched in the unclosed session.
6. **Continue.** Create the next `SESSION_NNNN.md` and proceed with bow-in.

*(The old "update the session row in `wiki/index.md`" step is retired — session rows no longer live
in the wiki index; the SESSION_NNNN spine in `docs/sprints/` is the source of truth.)*

## Status values

| Status | Meaning |
| --- | --- |
| `in-progress` | Session is active |
| `closed` | Session is done |

Legacy values (`closed-quick`, `closed-full`, `closed-unclean`) are accepted in old SESSION files
but must not be used for new sessions.
