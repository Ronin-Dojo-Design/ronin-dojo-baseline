---
title: Autonomous Sessions Runbook
slug: autonomous-sessions
type: runbook
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0306
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/petey-plan-0305.md
backlinks:
  - docs/runbooks/README.md
---

# Autonomous Sessions Runbook

Run N bow-in → bow-out sessions back-to-back from one command, each in a **cold
process** so context stays fresh, each landing as its own reviewable PR.

## Why this works (the key idea)

This repo is a **file-based state machine**. Bow-in
([`opening.md`](../../rituals/opening.md)) reads the highest-numbered
`docs/sprints/SESSION_NNNN.md`; bow-out ([`closing.md`](../../rituals/closing.md))
writes the next one and commits. The session-to-session handoff therefore lives in
the **SESSION files + git**, not in any conversation.

That means the right automation is **a fresh `claude -p` process per session** — not
a long-running loop or kept-alive chat. Each process is cold, reads the latest SESSION
file, does one session, closes, and the next cold process picks up the thread. No
context decay, because there is no shared context to decay.

## The driver

[`scripts/auto-session.sh`](../../../scripts/auto-session.sh):

```bash
scripts/auto-session.sh 3   # run 3 sessions back-to-back
```

What it does each iteration:

1. Computes the next SESSION number and creates a branch `auto/session-NNNN`,
   **stacked on the previous session's branch** (the first stacks on `main`).
2. Invokes `claude -p` headless with a bow-in → work → full-bow-out prompt. The agent
   does the next automatable code slice of [`petey-plan-0305.md`](../../petey-plan-0305.md),
   **skips operator-only device smoke**, runs the full close gates (`wiki:lint` must be
   0 errors, typecheck/lint, `graphify update` before the commit), and **commits to the
   current branch** — it does **not** push or open a PR.
3. Verifies two safety brakes: the tree is clean (the close succeeded) and exactly one
   new commit exists (the session produced work). Either failing **halts the loop**.
4. Pushes the branch and opens a PR with `gh pr create --fill`.

### Stacked PRs — why, and how to merge

PR-per-session + back-to-back forces stacking: if session 2 re-branched from an
unchanged `main` it would not see session 1's new SESSION file and would redo its task.
So session k+1 branches from session k. You get one focused PR per session.

**Merge bottom-up:** merge the oldest PR (base `main`) first; GitHub auto-retargets the
next PR onto `main` as you go. Or squash-merge the stack in order.

## Prerequisite — permissions (one-time)

A headless `claude -p` agent **cannot answer permission prompts**. Before an unattended
run, satisfy one of:

- **Allowlist (recommended):** pre-allow the close-gate commands (`bun …`, `git …`,
  `gh …`, `graphify …`) in `.claude/settings.json`. The `/fewer-permission-prompts`
  skill generates this from your transcripts. The FS-0024 shell-guard still blocks the
  read-only `dirstarter_template` dir, so this stays safe.
- **`--dangerously-skip-permissions`** in the script — simplest, but removes the guardrail
  while the loop pushes branches. Not recommended.

## Safety model & limits

- **PR gate:** nothing reaches `main` unattended — you review each PR. The self-assessed
  hostile-close score is a weak signal with no human in the loop; the PR is the real gate.
- **Halts on failure:** a dirty tree or a no-op session stops the loop instead of
  compounding errors onto a bad base.
- **Finite plan:** `petey-plan-0305.md` is Phases 2→4 (~4–7 sessions), then it's done.
  Pass an `N` that matches the remaining automatable work; the loop invents nothing on
  its own beyond the SESSION "Next session" pointer.
- **Can't automate the human bits:** operator device/browser smoke (e.g. the Phase 1
  pinch-zoom phone check) is flagged and skipped, never faked.
- **Local only:** the close ritual needs the local `graphify` CLI (+ DB for some smokes),
  which a cloud runner won't have — run this on the operator machine. For calendar-spread
  unattended runs use `/schedule`, accepting that cloud sessions defer `graphify update`
  to the next local session.

## Cross-references

- [Opening ritual](../../rituals/opening.md)
- [Closing ritual](../../rituals/closing.md)
- [Petey Plan 0305 — Lineage epic](../../petey-plan-0305.md)
- [Graphify Repo Memory Runbook](graphify-repo-memory.md)
