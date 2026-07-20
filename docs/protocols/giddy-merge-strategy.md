---
title: "Giddy Merge Strategy"
slug: giddy-merge-strategy
type: protocol
status: superseded
created: 2026-06-20
updated: 2026-07-20
last_agent: claude-session-0584
superseded_by: docs/protocols/recipes/merge-wave.md
pairs_with:
  - docs/protocols/recipes/merge-wave.md
  - docs/agents/giddy.md
  - docs/protocols/merge-to-main.md
  - docs/protocols/pr-review-score-fix-loop.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - git
  - merge
  - commit-gate
---

> **SUPERSEDED by [Recipe — Merge Wave](recipes/merge-wave.md) (SESSION_0584, G-023).** The G0→G4
> gate ladder, hard guards, branch-posture preflight, merge disposition discipline, push cadence,
> and output contract below are **absorbed, not lost** — read the recipe card; it carries the same
> law in the recipe-card format (persona pack + load-set + overlays + minimum-output contract).
> This file stays as detailed historical reference.

# Giddy Merge Strategy

> Promoted from three legacy `RoninDashboard/protocols/` files — `GIDDY_COMMIT_GATE_PROTOCOL.md`
> (the G0–G4 gate ladder), `GIDDY_BRANCH_MONITOR.md` (branch-posture preflight), and
> `MERGE_POLICY.md` (disposition discipline) — synthesized into one strategy and
> **re-based onto this repo's trunk flow** (SESSION_0420). The monorepo's
> `final-clean-base` integration branch and the `epic/* · int/* · arch-refactor/*`
> branch families are dropped: this repo is **trunk-based on `main`** and ships one
> push per session at close.

The decision layer above [`merge-to-main.md`](merge-to-main.md). `merge-to-main` is
*how* a branch lands (rebase / PR / squash); this protocol is *when* a change is safe
to stage, commit, and push — and who approves each step. When you're "playing Giddy"
on a merge, this is your gate.

## Hard guards (non-negotiable)

1. **Never auto-push.** Push only on the operator's explicit, in-session approval for
   that exact action ([[explicit-push-authorization]] — overrides CLAUDE.md's
   auto-push-to-main default).
2. **Never auto-deploy.** Production deploy happens only when the operator asks. Note
   that on this repo push ≠ deploy: `vercel.json`'s `ignoreCommand` skips the prod
   build unless `apps/web` / `pnpm-lock.yaml` / `package.json` / `vercel.json` changed
   (SESSION_0335).
3. **Run the FS-0024 git guard before any mutating git** — confirm `pwd` is
   `/Users/brianscott/dev/ronin-dojo-app` and `git remote` is `ronin-dojo-baseline`,
   never the read-only `dirstarter_template` cwd.
4. **Never force-push `main`.** `--force-with-lease` is allowed only on a *session
   branch* during a `merge-to-main` rebase, never on `main`.

## Gate ladder (G0 → G4)

Every change moves up this ladder. State your current gate when you report status.

| Gate | Name | Meaning | What's allowed |
| --- | --- | --- | --- |
| **G0** | Working | edits in progress | no staging |
| **G1** | Stage candidate | scope still bounded, validation list known | `git add -p` surgically |
| **G2** | Commit candidate | required checks pass (below) | stage + commit (conventional message) |
| **G3** | Review ready | commit set clean + auditable | hand to operator / `pr-review-score-fix-loop` |
| **G4** | Push approved | operator gave explicit go | manual push — one per session at close |

Default posture is **stop at G3**. Only the operator's word moves you to G4.

### Required checks before commit (G2)

1. Touched-file list still maps to one logical change unit.
2. Close gates green (or debt documented as a FINDING): **typecheck · oxlint · oxfmt ·
   touched-area tests · wiki-lint** (CLAUDE.md). Run a local `next build` for new
   server-action/route modules ([[next-build-catches-use-server]]).
3. Validation commands actually ran, or the line is marked `MANUAL STEP REQUIRED` with
   owner + next action.
4. Commit message is conventional (`feat:` / `fix:` / `docs:` / `chore:` …) and ends
   with the `Co-Authored-By` trailer.
5. Status line prepared: `PASS | FAIL | MANUAL STEP REQUIRED`.

### Commit packaging

- One logical change per commit; no zero-delta commits.
- Separate code and docs commits unless the operator says otherwise.
- Stage surgically with `git add -p` when a working tree carries mixed work.

## Branch-posture preflight

Before execution, during a lane switch, and at session close, establish posture:

```bash
git status --short --branch
git log --oneline --decorate -n 25
git branch --all
```

Branch families on this repo (trunk-based — far simpler than the monorepo):

- `main` — the trunk; the only long-lived branch. Production deploys from it.
- `session-NNNN-*` — short-lived session/feature branches that land via
  `merge-to-main.md` and are deleted on squash-merge.
- cloud/codex PR branches — reviewed through [`pr-review-score-fix-loop.md`](pr-review-score-fix-loop.md)
  before integration.

Fast-forward only on shared branches (`git pull --ff-only`); if a fast-forward is
blocked, **stop and resolve divergence** before doing anything else.

## Merge disposition discipline

Every integration action (cherry-pick or merge) records a one-line disposition note in
the SESSION file:

- **source** — branch / commit / PR number,
- **reason selected** — why this delta, why now,
- **risk/check status** — `PASS` | `FAIL` | `MANUAL STEP REQUIRED`.

Prefer bounded `cherry-pick` for surgical deltas; use a `--no-ff` merge only when
branch history must stay intact. When code is already on `main` (e.g. a branch that was
the base for a later squash-merge), **delete the redundant branch** — don't re-merge it
(verify identical with `diff <(git show origin/main:<file>) <(git show <branch>:<file>)`).

## Push cadence

- **One push per session, at close** — don't push mid-session.
- Stage and commit freely on a session branch when G2 checks pass; hold the push at G3.
- At G4 (operator approved), push once, then record the pushed branch + head SHA in the
  SESSION file `## Full close evidence` (Git hygiene row).

## Output contract

When Giddy reports merge posture, publish:

1. current gate (`G0`–`G4`),
2. branch name + head SHA,
3. commit list (or `none`),
4. status (`PASS | FAIL | MANUAL STEP REQUIRED`),
5. next 3 steps.

## Cross-references

- [Merge to Main](merge-to-main.md) — the rebase/PR/squash mechanics this gates.
- [PR Review → Score → Fix Loop](pr-review-score-fix-loop.md) — what runs at G3.
- [Giddy](../agents/giddy.md) — the role that owns this strategy.
- [Closing ritual](../rituals/closing.md) — Git hygiene + Graphify update at bow-out.
