# Closing ritual — bow out

Run this before ending any session. The point: leave the repo in a state where the next bow-in is cheap.

> v5.0 refresh of the legacy `closing_v4.5.md`. Quick/full distinction is preserved. The legacy multi-file state machine (`CHAT_HANDOFF.md` + `GIDDY_BRANCH_MONITOR.md` + `PETEY_NEXT_SESSION_PROMPT_*.md`) is consolidated into one file: the current `SESSION_NNNN.md`.

## Trigger

Any of: "Bow out" / "Close session" / "End session" / task complete / hitting a natural pause point.

## Two modes

| Mode | When to use | Required actions |
|---|---|---|
| **Quick close** | Back-to-back execution sessions | Fill SESSION file; commit if needed; done |
| **Full close** | End of day, end of sprint, after a milestone, before any context loss | Quick close + Reflections + memory-update sweep |

Default to quick. Escalate to full when the moment warrants it.

## Quick close steps

### 1. Pause the work

Stop typing. If a tool call is mid-flight, let it finish. If a build is running, decide whether to wait for it or abandon and note the abandonment in step 3.

### 2. Update the SESSION file

Open the current `docs/sprints/SESSION_NNNN.md`. Fill in:

- `What landed` — bullets of completed work
- `Files touched` — paths + one-line note each
- `Decisions resolved` — anything the user signed off on this session
- `Open decisions / blockers` — anything unblocking the next session
- `Next session: Goal + Inputs to read + First task`
- `Status: closed-quick`

If the session didn't accomplish its `Goal`, note that explicitly in `What landed` ("Goal X was not reached because Y").

### 3. JETTY 3.0 sweep on touched files

For every file listed in `Files touched`:

- If it's a wiki page or architecture doc: verify JETTY 3.0 frontmatter is present and `updated` date is current.
- If it's a code file with a wiki annotation (e.g., `wiki/files/schema-prisma.md`): bump `updated`, re-evaluate `health`.
- Update `backlinks` on any page that references or is referenced by touched files. Both directions.
- Update `wiki/index.md` if any new wiki pages were created, or any page status/health changed.

If you created new cross-references during the session, verify both pages list each other in `pairs_with` or `backlinks`.

### 4. Git hygiene

Before committing:

1. **Branch check**: Verify you're on the expected branch (`git branch --show-current`). If you should be on a feature branch but you're on `main`, stop and discuss with the user.
2. **Stage and review**: `git add -A && git status` — review the list. No secrets, no `.env`, no `node_modules`.
3. **Commit**: Use a conventional commit message (`feat:`, `docs:`, `fix:`, `chore:`). Don't bundle unrelated changes into one commit.
4. **Push**: `git push origin <branch>` — only if the user has authorized pushes. If not, note "changes committed but not pushed" in the SESSION file.

If the user hasn't authorized commits, leave changes uncommitted and note that in `Open decisions / blockers`.

### 5. Bow-out line

State to the user (or in the SESSION file): "Bowed out — SESSION_NNNN closed. Next session goal: {one line}."

That's quick close done.

## Full close — additional steps

After the quick-close steps:

### 6. Reflections (in the SESSION file)

Add a `## Reflections` section to the SESSION file. Capture what's worth remembering:

- Surprises encountered.
- Things that almost broke (and what saved them).
- Patterns or anti-patterns observed.
- Anything you'd tell yourself if you were starting this work again.

This is the kaizen-style note from the legacy system, kept lightweight.

### 7. Memory sweep

If anything from this session is worth carrying forward across all future sessions (not just the next one), update operator-side memory. Examples:

- A new architectural decision worth remembering — captured as an ADR; mentioned in memory only if it changes how we work.
- A discovered constraint or gotcha that future sessions will hit.
- A user preference that shapes future work.

Do *not* memory-dump the SESSION file's content. The SESSION file is the session-scoped record; memory is for project-scoped facts.

### 8. Confirm next session is unblocked

Re-read your `Open decisions / blockers` and `Next session` entries. Is the next session's `First task` actually doable, or does it require user input first? If the latter, explicitly note "BLOCKED ON USER" in the next session's entry.

## What this ritual is NOT

- Not a forced commit. Sometimes the right close is "uncommitted, here's what's queued."
- Not a comprehensive log. Diff is the log; the SESSION file is the *summary*.
- Not heavy ceremony. Quick close should take 60 seconds. Full close should take 5 minutes.

## What you must not skip

- The SESSION file update. **Always.** No exceptions. If you skipped it, the session didn't close — it crashed.
- The `Next session` entry. If the next session can't pick up the thread, this ritual failed.
- The JETTY 3.0 sweep (step 3). If you touched wiki pages and didn't update backlinks, the next agent will have broken references.
- The git hygiene check (step 4). Uncommitted changes with no record of what they are = lost work.

## Cross-references

- [Opening ritual](opening.md) — paired counterpart at the start of a session.
- [Chat handoff protocol](../protocols/chat-handoff.md) — describes the SESSION file format in full.
- [Wiki lint protocol](../protocols/wiki-lint.md) — rules for JETTY 3.0 sweep verification.
- [Prisma workflow runbook](../runbooks/prisma-workflow.md) — recurring schema change cycle.
