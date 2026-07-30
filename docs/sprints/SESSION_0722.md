---
title: "SESSION 0722 — repoint stale ronin-dojo-app repo name in code-quality + fallow-fix-loop skills"
slug: session-0722
type: session--implement
status: closed
created: 2026-07-30
updated: 2026-07-30
last_agent: cody-session-0722
sprint: S48
lane: repo
lane_seq:
recipe:
vault_session:
goal_ids: []
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0719.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0722 — repoint stale ronin-dojo-app repo name in code-quality + fallow-fix-loop skills

**Date:** 2026-07-30 · **Operator:** Brian + cody-session-0722

## Goal

Fix a drift left over from the five-repo fork (ADR 0055/0059): the `code-quality` and
`fallow-fix-loop` SKILL.md docs' "Repo context" lines still name the dead pre-fork repo
`ronin-dojo-app`. Repoint both to `black-belt-legacy` (this checkout's current name), changing
only the repo name — no other prose touched.

## Status

Frontmatter `status:` is the single source of truth (`in-progress` → `closed`, SESSION_0342). Do not restate it here.

## Bow-in

- Previous session: `docs/sprints/SESSION_0719.md` — scripts/ typecheck gate + e2e paper-over strip +
  overnight-orchestrator pilot staged. Unrelated to this task; this is a standalone lane dispatch.
- Branch/worktree: `auto/session-0722-stale-repo-name-skills` @ `/Users/brianscott/dev/bbl-0722` ·
  status: clean → 1 commit this session · HEAD: `65a9f6fb`
- Parallel-lane assessment (opening.md 1d): n/a — dispatched as a single-purpose docs lane by an
  orchestrating agent, not bow-in'd interactively.
- On-demand blocks pulled: none.

## Petey plan

### Tasks

#### SESSION_0722_TASK_01 — repoint `ronin-dojo-app` → `black-belt-legacy` in two SKILL.md files

- **Agent:** Cody · **Depends on:** nothing
- **What / steps:** Verify-first read of both files; edit only the "Repo context" line in each
  (`.agents/skills/code-quality/SKILL.md:15`, `.agents/skills/fallow-fix-loop/SKILL.md:13`) since
  `.claude/skills/<name>` are directory symlinks into `.agents/skills/<name>` (one file on disk,
  confirmed via `ls -i` — same inode before and after edit); leave all other prose byte-identical.
- **Done means:** grep for `ronin-dojo-app` across all four paths returns zero matches; `git diff
  --no-index` between each `.agents`/`.claude` pair is empty.

### Parallelism

Single file pair, sequential — n/a.

### Open decisions / risks

Whether these skills should become fully repo-agnostic (for kernel cherry-pick to rdd-monorepo,
the ui-kit upstream-of-record per CLAUDE.md) is an operator-fork decision, not in scope for this
task. Flagged below under Proposed ledger edits and held, not acted on.

### Scope guard

Repo-name only. Did not touch invocation forms, `apps/web` cwd notes, the FS-0042 bare-`fallow`
warning, or any other prose in either file. Did not decide the repo-agnostic question.

## Cody pre-flight

n/a — docs-only session, no code written (two-word string swap in doc prose, no runtime surface).

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0722_TASK_01 | landed | `.agents/skills/code-quality/SKILL.md:15` and `.agents/skills/fallow-fix-loop/SKILL.md:13` now read `black-belt-legacy` instead of `ronin-dojo-app`; `.claude/skills/*` twins are directory symlinks so they update identically with zero extra edits. Commit `65a9f6fb`. |

**Decisions resolved:** None *at lane time* — the repo-agnostic question was held here and later
**RESOLVED by the operator in the SESSION_0720 AM sweep** (drop the name). See Open decisions / blockers.

## Verification

| Command / smoke | Result |
| --- | --- |
| `grep -rn "ronin-dojo-app" .agents/skills/code-quality/SKILL.md .claude/skills/code-quality/SKILL.md .agents/skills/fallow-fix-loop/SKILL.md .claude/skills/fallow-fix-loop/SKILL.md ; echo REAL_EXIT=$?` | no matches; `REAL_EXIT=1` (grep's "no match" code — clean per gate spec) |
| `git diff --no-index .agents/skills/code-quality/SKILL.md .claude/skills/code-quality/SKILL.md ; echo REAL_EXIT=$?` | empty diff; `REAL_EXIT=0` |
| `git diff --no-index .agents/skills/fallow-fix-loop/SKILL.md .claude/skills/fallow-fix-loop/SKILL.md ; echo REAL_EXIT=$?` | empty diff; `REAL_EXIT=0` |
| `ls -i` on all four paths, before and after edit | each `.agents`/`.claude` pair shares one inode both before and after (symlinked directory, not a copy) |

No build/typecheck/lint/test gates run — DOCS-ONLY lane per dispatch contract (no bootstrap,
no node_modules in this worktree).

## Artifacts

None.

## Open decisions / blockers

- **Repo-agnostic skills question (flagged, not decided):** `code-quality` and `fallow-fix-loop`
  hardcode a repo name (`ronin-dojo-app` → now `black-belt-legacy`). Post-fork, `packages/ui-kit`
  in rdd-monorepo is the upstream-of-record for portfolio-wide law, synced down by cherry-pick
  (CLAUDE.md kernel section). If these skills are meant to cherry-pick cleanly across the five
  sibling repos, hardcoding any single repo name will re-drift on the next fork/sync. Proposed:
  a new D-row (design-system-and-cards.md ledger family, or a new skills-portability doc) deciding
  whether "Repo context" should read from git-remote at invocation time instead of being
  hand-written prose.
  - **RESOLVED (SESSION_0720 AM sweep, operator decision): drop the name.** The sweep superseded the
    `black-belt-legacy` literal with a repo-agnostic line (*"a Ronin Dojo portfolio app"*) in commit
    `a2cc9a62` on this branch — so the shipped net diff is `ronin-dojo-app` → agnostic, **not** →
    `black-belt-legacy`. Rationale: a hardcoded name re-drifts on the next kernel cherry-pick.
  - **Routed upstream:** the canonical ADR/D-row for "synced skills carry no repo name" belongs in
    **rdd-monorepo** (process-OS upstream-of-record), cherry-picked down. ADR 0059 keeps this session
    out of that repo, so it is a routed follow-up, not landed here.

## Next session

- **Goal:** n/a — this was a single-task docs lane, not a session with a follow-on goal.
- **First task:** n/a.

## Close evidence

**/ggr composite:** n/a — docs-only single-line-per-file fix, no code-quality-matrix surface (no Class A/B/C unit; two-word doc string swap).
**Systemic health:** CI = not run (docs-only lane, no gates requiring node_modules per dispatch contract) · findings routed 1/1 (proposed D-row above) · FS patterns: none introduced
**Reviewer verdicts:** Giddy n/a (not dispatched this lane) · Doug n/a (not dispatched this lane) · Desi n/a (no UI touched)
**Findings ≥ medium:** none
**ADR / ubiquitous-language check:** not required — confirms ADR 0055/0059 (five-repo era, this repo = black-belt-legacy) already valid; no new ADR needed for a stale-string fix

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | n/a — no new files created; two existing SKILL.md files edited in place, frontmatter untouched |
| Wiki lint | not run — SKILL.md files are not wiki pages (`.agents/skills/`, not `docs/knowledge/wiki/`) |
| Reflections routing receipt | 1 lesson → 1 route (see Reflections below) |
| Code-quality gate (Class-A) | no Class-A custom code — doc-string swap only |
| Runtime verification (Doug) + artifact URL | no runtime surface touched (docs-only) |
| Deferral guard (§6.8) | clean — the one deferred item (repo-agnostic redesign) is explicitly named above, not silently dropped |
| Memory sweep · next-session unblock | n/a — single-task lane, no next-session handoff needed |
| Git hygiene · Graphify update | branch `auto/session-0722-stale-repo-name-skills`, 1 commit (`65a9f6fb`), explicit paths staged (no `git add -A`); Graphify not refreshed (docs-only, no structural change) |

## Reflections

- The `.claude/skills/<name>` "hardlink twins" described in the dispatch prompt are actually directory symlinks (`.claude/skills/code-quality -> ../../.agents/skills/code-quality`), not per-file hardlinks — `ls -i` matching inodes is a side effect of the symlink resolving to the same file, not two linked inodes. Functionally equivalent (one edit, two paths), but worth correcting in the next dispatch prompt that references this pattern so "hardlink twins" terminology doesn't cause an agent to look for `ln`-created links that don't exist. → route: no-action (informational correction for future dispatch prompts; not a ledger-worthy drift, no file to edit under this session's owned-files scope)
