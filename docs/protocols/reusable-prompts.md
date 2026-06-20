---
title: "Reusable Prompts"
slug: reusable-prompts
type: reference
status: active
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0421
backlinks:
  - docs/protocols/pr-review-score-fix-loop.md
---

# Reusable Prompts

Copy-paste, phone-friendly prompts for common ops. Swap `NNN` for the number. Terse by
design: standing rules (**pause-on-merge**, **graphify-first**, **ping-on-decision**)
already load each session via `CLAUDE.md` + memory, so prompts don't repeat them.

> **Read on demand, not every turn.** This file enters context only when referenced. Keep
> it that way — never copy these into `CLAUDE.md` (which loads every turn).

## PR review

Loop spec: [pr-review-score-fix-loop](pr-review-score-fix-loop.md).

**Full loop** — review → score → fix:

> Run the PR-review loop on PR #NNN. Autonomous; fix mechanical blockers (merge conflict,
> session-doc collision, env/CI) on the branch and re-run. Report verdict + what's left.

**Quick — ready?**

> PR #NNN ready to merge? Check CI / mergeability / diff, classify red checks (code vs env),
> one-screen verdict. No merge.

**Get-to-green** (stop before merge):

> Run the PR-review loop on PR #NNN, then clear conflicts/CI/collisions on the branch and
> re-run until green. Stop before the merge and ping me for the go.

**Triage all open PRs:**

> Triage all open PRs — one-line ready/blocked verdict each, per the PR-review loop.

<!-- Add more reusable prompts under new ## sections as needed. Keep each terse. -->
