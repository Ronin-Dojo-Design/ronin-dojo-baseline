---
title: "Recipe — Merge Wave (the G0→G4 gate ladder)"
slug: recipe-merge-wave
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/giddy-merge-strategy.md
  - docs/protocols/merge-to-main.md
  - docs/protocols/recipes/review-wave.md
  - docs/protocols/recipes/AM_Coffee_Merge_Review.md
  - docs/rituals/closing.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - git
  - merge
  - commit-gate
  - recipe
---

# Recipe — Merge Wave

**Retires [`giddy-merge-strategy.md`](../giddy-merge-strategy.md)** (SESSION_0584, G-023) — same
gate ladder, same hard guards, absorbed into the recipe-card format so it can be pointed at from
[`SOT_Cookbook.md`](../SOT_Cookbook.md), the [orchestrator](orchestrator.md), and
[AM_Coffee_Merge_Review](AM_Coffee_Merge_Review.md) alike. `giddy-merge-strategy.md` carries a
supersede banner and stays as detailed historical reference — nothing below is new law, it is the
same law in the new shape.

## Persona pack

- **Giddy** — owns merge posture; states the current gate when reporting status.
- **Operator** — the ONLY approver of G4 (push).

## Load-set

1. [`merge-to-main.md`](../merge-to-main.md) — the rebase/PR/squash *mechanics*; this card is the
   *when-is-it-safe-to-stage/commit/push* decision layer above it.
2. `[[explicit-push-authorization]]` — overrides any default-push assumption.
3. [`closing.md`](../../rituals/closing.md) §4/§4a/§4b — the single-push-order sequencing this
   ladder feeds into at close.

## Hard guards (non-negotiable)

1. **Never auto-push.** Push only on the operator's explicit, in-session approval for that exact
   action.
2. **Never auto-deploy.** Push ≠ deploy on this repo: `vercel.json`'s `ignoreCommand` skips the
   prod build unless `apps/web` / `bun.lock` / `package.json` / `vercel.json` changed.
3. **Run the FS-0024 git guard before any mutating git** — `pwd` is `/Users/brianscott/dev/ronin-dojo-app`
   (or a `../ronin-NNNN` lane worktree) and `git remote` is `ronin-dojo-baseline`, never the
   read-only `dirstarter_template` cwd.
4. **Never force-push `main`.** `--force-with-lease` is allowed only on a *session branch* during a
   `merge-to-main` rebase, never on `main`.

## Gate ladder (G0 → G4)

Every change moves up this ladder. State your current gate when you report status.

| Gate | Name | Meaning | What's allowed |
| --- | --- | --- | --- |
| **G0** | Working | edits in progress | no staging |
| **G1** | Stage candidate | scope still bounded, validation list known | `git add -p` surgically |
| **G2** | Commit candidate | required checks pass (below) | stage + commit (conventional message) |
| **G3** | Review ready | commit set clean + auditable | hand to operator / [review-wave](review-wave.md) / `pr-review-score-fix-loop` |
| **G4** | Push approved | operator gave explicit go | manual push — one per session at close |

Default posture is **stop at G3**. A fan-out sweep ([AM_Coffee_Merge_Review](AM_Coffee_Merge_Review.md))
may merge multiple lanes to LOCAL `main` while still holding at G3 — merging locally is not pushing.

### Required checks before commit (G2)

1. Touched-file list still maps to one logical change unit.
2. Close gates green (or debt documented as a FINDING): **typecheck · oxlint · oxfmt ·
   touched-area tests · wiki-lint**.
3. Validation commands actually ran, or the line is marked `MANUAL STEP REQUIRED` with owner +
   next action.
4. Commit message is conventional (`feat:` / `fix:` / `docs:` / `chore:` …) and ends with the
   `Co-Authored-By` trailer.
5. Status line prepared: `PASS | FAIL | MANUAL STEP REQUIRED`.

## Branch-posture preflight

Before execution, during a lane switch, and at session close:

```bash
git status --short --branch
git log --oneline --decorate -n 25
git branch --all
```

Branch families: `main` (the trunk; production deploys from it) · `session-NNNN-*` (short-lived
lane/feature branches landing via `merge-to-main.md`, deleted on merge) · cloud/codex PR branches
(reviewed via `pr-review-score-fix-loop.md` before integration).

## Merge disposition discipline

Every integration action records a one-line disposition note in the SESSION file: **source**
(branch/commit/PR) · **reason selected** · **risk/check status** (`PASS`/`FAIL`/`MANUAL STEP
REQUIRED`). Prefer bounded `cherry-pick` for surgical deltas; `--no-ff` merge only when branch
history must stay intact. Redundant branches (already on `main`) get deleted, not re-merged —
verify identical with `diff <(git show origin/main:<file>) <(git show <branch>:<file>)`.

## Push cadence

One push per session, at close. Stage/commit freely on a session branch at G2; hold at G3 until
the operator's word moves it to G4 — then push once and record the branch + head SHA in the
SESSION file's Git-hygiene evidence row.

## Minimum-output contract

When Giddy reports merge posture, publish: current gate (G0–G4) · branch name + head SHA · commit
list (or `none`) · status (`PASS | FAIL | MANUAL STEP REQUIRED`) · next 3 steps.

## Cross-references

- [`giddy-merge-strategy.md`](../giddy-merge-strategy.md) — retired into this card; detailed history.
- [Merge to Main](../merge-to-main.md) — the rebase/PR/squash mechanics this gates.
- [PR Review → Score → Fix Loop](../pr-review-score-fix-loop.md) — what runs at G3.
- [Recipe — AM Coffee Merge Review](AM_Coffee_Merge_Review.md) — the fan-out sweep that drives this ladder.
- [Closing ritual](../../rituals/closing.md) — Git hygiene + the single-push order at bow-out.
