---
title: Closing Ritual
slug: closing
type: protocol
status: active
created: 2026-04-25
updated: 2026-05-05
last_agent: copilot-session-0074
pairs_with:
  - docs/rituals/opening.md
  - docs/protocols/code-guardrails.md
  - docs/knowledge/wiki/incidents.md
  - docs/protocols/failed-steps-log.md
  - docs/protocols/project-log.md
  - docs/protocols/hostile-close-review.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0029.md
---

# Closing ritual — bow out

Run this before ending any session. The point: leave the repo in a state where the next bow-in is cheap.

> v5.0 refresh of the legacy `closing_v4.5.md`. Quick/full distinction is preserved. The legacy multi-file state machine (`CHAT_HANDOFF.md` + `GIDDY_BRANCH_MONITOR.md` + `PETEY_NEXT_SESSION_PROMPT_*.md`) is consolidated into one file: the current `SESSION_NNNN.md`.

## Agent-agnostic

This ritual is the source of truth for any agent that closes a session: Claude, Copilot, Codex, or otherwise. The ritual itself never depends on a specific LLM, IDE, or CLI. The trigger may differ per environment (Claude Code: `/bow-out` skill; Copilot/Codex chat: the words "bow out"; CLI script: a make target), but the steps below are identical and binding.

When you record `last_agent` in the SESSION frontmatter or in this doc's frontmatter, name the agent that actually executed the work (e.g., `claude-session-0031`, `copilot-session-0028`, `codex-session-0030`). Do not rewrite past values; only stamp your own accurately on the artifacts you touched.

## Trigger

Any of: "Bow out" / "Close session" / "End session" / task complete / hitting a natural pause point.

## Three modes

| Mode | When to use | Required actions |
|---|---|---|
| **Quick close** | Back-to-back execution sessions | Fill SESSION file; commit if needed; done |
| **Full close** | End of day, end of sprint, after a milestone, before any context loss | Quick close + evidence artifact + Reflections + hostile review + Review & Recommend + memory sweep |
| **Unclean close recovery** | Session crashed, compaction ate context, or bow-out was skipped | Recovery checklist below; creates incident entry |

Default to quick. Escalate to full when the moment warrants it. Use unclean close recovery when a previous session wasn't closed properly.

## Mode contract

The requested close mode is binding.

- If the user asks for **quick close**, run quick close only unless there is an active safety reason to escalate. If you escalate, state why in the SESSION file.
- If the user asks for **full close**, run every quick close step plus every full close step. Do not call it full close until the SESSION file contains the full-close evidence artifact below.
- If the user says only "bow out" or "close", default to quick close unless the session touched schema, auth, payments, deployment, production data, or governance protocols.
- `closed-full` is a proof state, not a tone. Missing evidence means the status stays `in-progress` or `closed-quick`.

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
- `Task log` — the `TASK_PLAN_LOG` IDs touched this session
- `Review log` — the `TASK_REVIEW_LOG` entry for this session
- `Hostile close review` — Giddy + Doug verdict, Dirstarter docs check, score cap if any
- `ADR / ubiquitous-language check` — any architectural decision or domain term created, updated, or explicitly marked not needed
- `Status: closed-quick`

**Atomicity rule (FS-0015 / SESSION_0074_TASK_09):** The YAML frontmatter `status:` field and the body `### Status` line must be updated together in the same edit pass. Never change one without the other. A session file with `status: in-progress` in YAML but `closed-quick` in the body (or vice versa) is a data integrity violation.

**Project-log gate:** Before setting any closed status, verify the current session has at least one entry in `docs/protocols/project-log.md`: `grep -c "SESSION_NNNN" docs/protocols/project-log.md` must return ≥ 1. If it returns 0, append the task plan entries before closing.

If the session didn't accomplish its `Goal`, note that explicitly in `What landed` ("Goal X was not reached because Y").

### 3. JETTY 3.0 sweep on touched files

For every file listed in `Files touched`:

- If it's a wiki page or architecture doc: verify JETTY 3.0 frontmatter is present and `updated` date is current.
- If it's a code file with a wiki annotation (e.g., `wiki/files/schema-prisma.md`): bump `updated`, re-evaluate `health`.
- Update `backlinks` on any page that references or is referenced by touched files. Both directions.
- Update `wiki/index.md` if any new wiki pages were created, or any page status/health changed.

If you created new cross-references during the session, verify both pages list each other in `pairs_with` or `backlinks`.

Run wiki-lint from the repo root after the manual sweep:

```bash
bun run wiki:lint
```

If wiki-lint fails, record the exact error/warning count and whether failures are pre-existing or introduced by this session. Do not write "wiki-lint ran" without the command result.

### 4. Git hygiene

Before committing:

1. **Branch check**: Verify you're on the expected branch (`git branch --show-current`). If you should be on a feature branch but you're on `main`, stop and discuss with the user.
2. **Worktree check**: Run `git worktree list`. If a session worktree is clean and its branch is already merged into the active branch, remove the worktree and delete the local branch. If it still has unique commits or uncommitted files, record the branch/path and leave it in place.
3. **Stage and review**: `git add -A && git status` — review the list. No secrets, no `.env`, no `node_modules`.
4. **Commit**: Use a conventional commit message (`feat:`, `docs:`, `fix:`, `chore:`). Don't bundle unrelated changes into one commit.
5. **Push**: `git push origin <branch>` — only if the user has authorized pushes. If not, note "changes committed but not pushed" in the SESSION file.

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

### 6a. Full close evidence artifact

For full close, add this block to the SESSION file before changing status to `closed-full`:

```markdown
## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | <files checked; updated/last_agent/health changes or "no frontmatter changes needed"> |
| Backlinks/index sweep | <pairs_with/backlinks/index changes or "no new links"> |
| Wiki lint | <command + pass/fail count + whether failures are pre-existing or introduced> |
| Kaizen reflection | <Reflections section present: yes/no> |
| Hostile close review | <TASK_REVIEW_LOG entry or not-applicable line> |
| Review & Recommend | <next session goal written: yes/no> |
| Memory sweep | <operator memory update, protocol/doc update, or "none needed because..."> |
| Next session unblock check | <unblocked or blocked-on-user with reason> |
| Git hygiene | <branch, worktree list result, status, commit/push result or explicit no-commit reason> |
```

Generic checkmarks are not enough. The proof cell must say what was checked or what changed.

### 6.5. Review & Recommend (stage the next session)

Run the [Giddy + Doug Hostile Close Review](../protocols/hostile-close-review.md). This is the hard pass that checks plan sanity, Dirstarter alignment, security, data integrity, verification honesty, and WORKFLOW 5.0 compliance. If the session touched a Dirstarter baseline layer, check live `https://dirstarter.com/docs` pages and cite the sources in `TASK_REVIEW_LOG`.

Run the [Review & Recommend protocol](../protocols/review-recommend.md). This reviews what landed, checks the boundary registry and program plan, and writes a concrete `Next session` recommendation into the SESSION file. Optionally pre-stages the next `SESSION_NNNN+1.md` so the next bow-in is nearly zero-cost.

At full close, also consider running [Petey Plan protocol](../protocols/petey-plan.md) to pre-write the next session's plan block — this means the next session skips the planning phase entirely and goes straight to execution.

Append or update the current session entry in the [Project Log](../protocols/project-log.md) review section. The review entry must reference the numbered task IDs from the project log's task plan section and list unresolved findings as open follow-ups.

### 6.6. ADR + ubiquitous-language check

If the session made, changed, or rejected an architectural decision, create or update an ADR in `docs/architecture/decisions/`. If that decision touches a Dirstarter baseline layer, the ADR must include compact proof links to the relevant live Dirstarter docs. Do not paste long excerpts; one short `Dirstarter docs proof` table with URLs is enough.

Baseline layers that require Dirstarter proof in the ADR:

- project structure
- Prisma/database
- Better Auth/authentication
- payments/Stripe
- storage/media
- deployment/cron
- content/blog/SEO
- theming/UI primitives

If the session introduced or changed a domain term, update [Ubiquitous Language](../architecture/ubiquitous-language.md). If no ADR or glossary update is needed, record that explicitly in the SESSION file.

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
- [Schema Migration Runbook](../runbooks/schema-migration.md) — recurring schema change cycle.
- [Code guardrails](../protocols/code-guardrails.md) — coding standards enforced every session.
- [FAILED_STEPS Log](../protocols/failed-steps-log.md) — append-only log for protocol misses and mitigations.
- [Incidents log](../knowledge/wiki/incidents.md) — append-only log for unclean closes.
- [Project Log](../protocols/project-log.md) — unified build, task plan, and review ledger.
- [Giddy + Doug Hostile Close Review](../protocols/hostile-close-review.md) — hard close review against Dirstarter, security, data integrity, and workflow honesty.
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — at full close, log/update any "smoke pending" boundaries the session shifted.
- [SOP — Agent Workflows and Rituals](../runbooks/sop-agent-workflows-and-rituals.md) — the full bow-out / next-target selection procedure as a runbook.
- [Petey Plan protocol](../protocols/petey-plan.md) — structured planning for staging the next session at bow-out.
- [Review & Recommend protocol](../protocols/review-recommend.md) — the review + next-target recommendation cycle run at full close.

---

## UNCLEAN_CLOSING - Unclean close recovery

Use when a previous session's bow-out was skipped — context loss, compaction, crash, or operator error.

### When this applies

- The latest `SESSION_NNNN.md` has `Status: in-progress` but the session is over.
- A new session discovers the previous one was never closed.
- The closing ritual was interrupted mid-flight.

### Recovery checklist

1. **Read the unclosed SESSION file.** Identify what was done by reading `git log`, `git diff`, and any partial `What landed` entries.
2. **Backfill the SESSION file.** Fill in `What landed`, `Files touched`, `Decisions resolved`, `Open decisions / blockers`, `Next session`.
3. **Set status:** `Status: closed-unclean`
4. **Add reason tag:** Add `**Reason for unclean close:** {one sentence}` below the Status line.
5. **Log the incident.** Append an entry to [`docs/knowledge/wiki/incidents.md`](../knowledge/wiki/incidents.md) with date, session number, reason, and recovery actions.
6. **JETTY 3.0 sweep.** Run step 3 from quick close on any files touched in the unclosed session.
7. **Wiki index update.** Update session status in `wiki/index.md`.
8. **Continue.** Create the next `SESSION_NNNN.md` and proceed with bow-in.

### Status values (complete list)

| Status | Meaning |
|---|---|
| `in-progress` | Session is active |
| `closed-quick` | Normal quick close |
| `closed-full` | Full close with reflections |
| `closed-unclean` | Recovered from missed bow-out |
