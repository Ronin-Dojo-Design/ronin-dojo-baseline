---
description: "Closing ritual — end the current session (v5.1; single close mode)"
mode: "agent"
---

# Bow Out — Closing Ritual

**Source of truth:** [`docs/rituals/closing.md`](../../docs/rituals/closing.md). Read and execute it as written. This file is a thin pointer plus the minimum binding steps so the ritual can't be skipped.

This ritual is agent-agnostic. When you stamp `last_agent` on touched docs, name the agent that actually executed (e.g., `claude-session-NNNN`, `copilot-session-NNNN`, `codex-session-NNNN`). Do not rewrite past values.

## Close mode

One mode: **closed**. No quick/full/unclean distinction (consolidated SESSION_0241). Status values are `in-progress` or `closed`.

## Binding steps

Run in order. Skipping any of these is a FAILED_STEPS-grade miss.

1. **Pause the work.** Let any in-flight tool calls finish. Stop typing.
2. **Update the SESSION file** (`docs/sprints/SESSION_NNNN.md`):
   - `What landed` — bullets of completed work.
   - `Files touched` — paths + one-line note each.
   - `Decisions resolved` — anything the user signed off on.
   - `Open decisions / blockers` — anything unresolved.
   - `Next session: Goal + Inputs to read + First task`.
   - `Task Log` — the `TASK_PLAN_LOG` IDs touched this session.
   - **Atomicity rule (FS-0015):** YAML `status:` and body `### Status` line must update together in one edit pass. Never one without the other. Set `status: closed`.
3. **SESSION-file gate.** Verify the current session has at least one entry in its `## Task log`. The cross-session `project-log.md` is retired.

4. **JETTY 3.0 sweep on touched files.** For every file in `Files touched`:
   - Doc frontmatter sweep — verify JETTY 3.0 frontmatter; bump `updated`; set `last_agent` to current agent identity.
   - Bidirectional backlinks audit — both directions, both pages.
   - Wiki index completeness (FS-0019 gate) — current session has a row in `docs/knowledge/wiki/index.md` with correct status; spot-check last 5 session numbers for gaps.
   - Run `bun run wiki:lint` — record exact error/warning count and whether failures are pre-existing or introduced.
   - Incremental markdown formatting fix (G8 / R8) — only for files touched this session.

5. **Refine session type.** Default at bow-in is `session--open`. At bow-out, narrow to `session--plan`, `session--implement`, or `session--review` only if the session was clearly one mode. Mixed sessions stay `session--open`. Legacy `session` (pre-0139) — leave as-is, do not backfill.

6. **Git hygiene.**
   - Branch check (`git branch --show-current`) — if on `main` but expected to be on a feature branch, stop and discuss.
   - Worktree check (`git worktree list`) — remove clean/merged worktrees; record any with unique commits.
   - Stage and review (`git add -A && git status`) — no secrets, no `.env`, no `node_modules`.
   - Commit — conventional prefix (`feat:` / `docs:` / `fix:` / `chore:`); don't bundle unrelated changes.
   - Push only if authorized; otherwise note "changes committed but not pushed".

7. **Graphify update** (if installed and files changed):

   ```bash
   GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .
   ```

   Report final node/edge/community counts. Skip only if Graphify is not installed or no files changed.

8. **Bow-out line.** State: `Bowed out — SESSION_NNNN closed. Next session goal: {one line}.`

## Optional deep items

Do when useful — end of day, milestone, schema/auth/payments touched:

- **Reflections** — add `## Reflections` to the SESSION file (surprises, near-misses, patterns/anti-patterns, lessons).
- **Hostile close review** — run [Giddy + Doug Hostile Close Review](../../docs/protocols/hostile-close-review.md).
- **Evidence table** — add proof per row to the SESSION file (JETTY sweep, backlinks/index, wiki-lint, hostile review, next-session unblock, git hygiene, Graphify).
- **ADR + ubiquitous-language check** — if the session made/changed/rejected an architectural decision, create or update an ADR. Update [Ubiquitous Language](../../docs/architecture/ubiquitous-language.md) for new/changed domain terms. If neither applies, record that explicitly.
- **Memory sweep** — update any agent memory files with session learnings.
13. **Memory sweep** — update operator-side memory only for project-scoped facts worth carrying across all future sessions (not session-scoped content).
14. **Confirm next session unblocked** — re-read `Open decisions / blockers` and `Next session: First task`. If user input is required, mark "BLOCKED ON USER" with reason.
15. Run quick close steps 6–8 (git hygiene → Graphify → bow-out line) as the final commit-and-report pass.

## Status values

- `in-progress` — session still open.
- `closed-quick` — quick close complete.
- `closed-full` — full close evidence artifact present, hostile review run, ADR/glossary check recorded.
- `closed-unclean` — recovery close (see UNCLEAN_CLOSING in `closing.md`); requires incident log entry.

`closed-full` is a proof state, not a tone. Missing evidence means status stays `in-progress` or `closed-quick`.

## What you must not skip

- The SESSION file update. **Always.** No exceptions.
- The `Next session` entry. If the next session can't pick up the thread, this ritual failed.
- The JETTY 3.0 sweep on touched files.
- The project-log gate before setting any closed status.
- The git hygiene check (uncommitted changes with no record = lost work).

## Cross-references

- [Closing ritual (source of truth)](../../docs/rituals/closing.md)
- [Opening ritual](../../docs/rituals/opening.md)
- [Project Log](../../docs/protocols/project-log.md)
- [Giddy + Doug Hostile Close Review](../../docs/protocols/hostile-close-review.md)
- [Review & Recommend protocol](../../docs/protocols/review-recommend.md)
- [FAILED_STEPS Log](../../docs/protocols/failed-steps-log.md)
- [Graphify Repo Memory Runbook](../../docs/runbooks/graphify-repo-memory.md)
