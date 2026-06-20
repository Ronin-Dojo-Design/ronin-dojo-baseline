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

## Session pickup (cold start)

> /bow-in. Read the highest-numbered `docs/sprints/SESSION_*.md` (its **Next session** +
> **Inputs to read**) and the memory it names. Confirm where we stand in one screen before
> touching anything. Watch for session-number collisions (local vs cloud).

## Loop promotion

Program state + approved batch: memory `[[monorepo-loop-promotion-program]]`.

> Promote the next approved monorepo loop(s) into `docs/protocols/`, leaned out per
> `[[monorepo-loop-promotion-program]]` — strip QF/WO/SPRINT lanes, Petey-baton runners,
> RoninDashboard paths, `final-clean-base`/epic branches, deterministic-rank telemetry;
> wire to the roster + `/code-review` + `merge-to-main`; align thresholds to ≥9.5. Register
> in the wiki index; `bun run wiki:lint` must be 0 errors.

## Session-hygiene sweep

> Sweep `docs/sprints`: list every `SESSION_*.md` with frontmatter `status: in-progress`;
> flip the ones with real `## What landed` content to `closed` (note: retro-closed in sweep),
> flag any genuinely abandoned. Then propose an archive range (oldest active → N) to `git mv`
> into `docs/sprints/_archive/`, updating the wiki index. Track in `doc-pruning-register.md`.

## Feature intake triage

Ledger: `[[feature-intake-ledger]]` (`docs/knowledge/wiki/feature-intake-ledger.md`).

> Triage new rows in the feature-intake ledger: set type/priority/status, link any that map
> to an existing session/doc, and surface the top 3 for me to green-light.

## Bow-out

> /bow-out. Full close: fill the SESSION close sections, hostile review (Giddy/Doug),
> `bun run wiki:lint` (0 errors), graphify update, memory sweep — then commit + push on my go.

<!-- Add more reusable prompts under new ## sections as needed. Keep each terse. -->
