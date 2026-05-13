---
description: "Closing ritual — end the current session (v5.0; default: quick close)"
mode: "agent"
---

# Bow Out — Closing Ritual

**Source of truth:** [`docs/rituals/closing.md`](../../docs/rituals/closing.md). Read and execute it as written. This file is a thin pointer plus the minimum binding steps so the ritual can't be skipped.

This ritual is agent-agnostic. When you stamp `last_agent` on touched docs, name the agent that actually executed (e.g., `claude-session-NNNN`, `copilot-session-NNNN`, `codex-session-NNNN`). Do not rewrite past values.

## Mode contract

The user's requested close mode is binding.

- **Quick close** — default. Back-to-back execution sessions. Quick close steps only.
- **Full close** — end of day, end of sprint, after a milestone, before any context loss, or when the user says "full close". Quick close steps + evidence artifact + Reflections + hostile review + Review & Recommend + memory sweep.
- **Unclean close recovery** — previous session was never closed (status `in-progress` but session is over). Follow the UNCLEAN_CLOSING checklist in `closing.md` and log an incident.

Defaulting to quick when the user only says "bow out", unless the session touched schema, auth, payments, deployment, production data, or governance protocols — then escalate to full and state why.

## Minimum binding steps (quick close)

Run in order. Skipping any of these is a FAILED_STEPS-grade miss.

1. **Pause the work.** Let any in-flight tool calls finish. Stop typing.
2. **Update the SESSION file** (`docs/sprints/SESSION_NNNN.md`):
   - `What landed` — bullets of completed work.
   - `Files touched` — paths + one-line note each.
   - `Decisions resolved` — anything the user signed off on.
   - `Open decisions / blockers` — anything unresolved.
   - `Next session: Goal + Inputs to read + First task`.
   - `Task Log` — the `TASK_PLAN_LOG` IDs touched this session.
   - `Review Log` — the `TASK_REVIEW_LOG` entry for this session.
   - `Hostile close review` — Giddy + Doug verdict, Dirstarter docs check, score cap if any.
   - `ADR / ubiquitous-language check` — any architectural decision or domain term created/updated/explicitly-not-needed.
   - **Atomicity rule (FS-0015):** YAML `status:` and body `### Status` line must update together in one edit pass. Never one without the other.
3. **Project-log gate.** Before setting any closed status, verify the current session has at least one entry in [`docs/protocols/project-log.md`](../../docs/protocols/project-log.md) using Graphify-first discovery plus an exact-file check:

   ```bash
   graphify query "SESSION_NNNN TASK_PLAN_LOG TASK_REVIEW_LOG project-log" --budget 1000
   awk 'index($0, "SESSION_NNNN") { count++ } END { print count + 0 }' docs/protocols/project-log.md
   ```

   Exact-file count must be >= 1. If 0, append the task plan entries before closing. **Do not use repo-wide `grep` / `rg` / `find` for this gate.**

4. **JETTY 3.0 sweep on touched files.** For every file in `Files touched`:
   - Doc frontmatter sweep — verify JETTY 3.0 frontmatter; bump `updated`; set `last_agent` to current agent identity.
   - Bidirectional backlinks audit — both directions, both pages.
   - Wiki index completeness (FS-0019 gate) — current session has a row in `docs/knowledge/wiki/index.md` with correct status; spot-check last 5 session numbers for gaps.
   - Run `bun run wiki:lint` — record exact error/warning count and whether failures are pre-existing or introduced.
   - Incremental markdown formatting fix (G8 / R8) — only for files touched this session.

5. **Refine session type.** Default at bow-in is `session--open`. At bow-out, narrow to `session--plan`, `session--implement`, or `session--review` only if the session was clearly one mode. Mixed sessions stay `session--open`. Legacy `session` (pre-0139) — leave as-is, do not backfill.

6. **Git hygiene.** *(In full close mode, defer this until after steps 7–11 below to avoid a two-pass commit cycle.)*
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

## Additional binding steps (full close only)

Run after quick close steps 1–5 (and before quick close steps 6–8 — the full-close execution order in `closing.md` defers git hygiene + Graphify + bow-out line to the end):

9. **Reflections** — add `## Reflections` to the SESSION file (surprises, near-misses, patterns/anti-patterns, lessons).
10. **Hostile close review + Review & Recommend** — run [Giddy + Doug Hostile Close Review](../../docs/protocols/hostile-close-review.md) and [Review & Recommend](../../docs/protocols/review-recommend.md). Append the entry in `project-log.md` review section, referencing numbered TASK IDs and listing unresolved findings.
11. **Full close evidence artifact** — add the `## Full close evidence` table to the SESSION file with proof per row (JETTY sweep, backlinks/index, wiki-lint, kaizen, hostile review, R&R, memory sweep, next-session unblock, git hygiene, Graphify). Generic checkmarks are not enough; each cell must state what was checked or what changed. Post-commit `git hygiene` and `Graphify` cells may say "final response will report" and the bow-out response carries the immutable commit hash and post-commit graph stats.
12. **ADR + ubiquitous-language check** — if the session made/changed/rejected an architectural decision, create or update an ADR in `docs/architecture/decisions/`. Dirstarter-baseline-layer ADRs must include compact proof links to live Dirstarter docs. Update [Ubiquitous Language](../../docs/architecture/ubiquitous-language.md) for new/changed domain terms. If neither applies, record that explicitly.
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
