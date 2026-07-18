---
name: pr-fix-loop
description: Keeps open pull requests merge-ready through review, scoring, bounded mechanical fixes, re-verification, and Giddy gate reporting. Use when the user says /pr-fix-loop, asks to babysit or repair PRs, or wants the open PR queue reviewed without auto-merge.
---

# PR Fix Loop

Read [`PR Review → Score → Fix`](../../../docs/protocols/pr-review-score-fix-loop.md) and
[`Giddy Merge Strategy`](../../../docs/protocols/giddy-merge-strategy.md) before execution.

## Standing goal

Every open PR becomes `READY (pending operator go)` or `KEEP_AS_IS — <blocker>`. Never push, merge, deploy,
or force-update a branch without explicit authorization for that exact action.

## One pass

1. Enumerate `gh pr list --state open`; capture PR number, branch, head SHA, checks, review state, intent.
2. Skip unchanged PRs already READY. Create one tracked task per changed/new PR.
3. For >1 PR, use one isolated Codex subagent and git worktree per PR, max three concurrent.
4. Per PR:
   - read every red check; classify code defect vs env/infra vs inherited-main;
   - review with Cody, Doug, Giddy lenses;
   - score via canonical protocol and code-quality matrix;
   - run [`fallow-fix-loop`](../fallow-fix-loop/SKILL.md) on branch diff;
   - run hostile close review;
   - apply only bounded mechanical fixes: conflicts, formatting/type/test failures, session-number collision,
     obvious correctness defects;
   - commit locally after gates; stop at G3.
5. Cap review→fix passes at three. Never merge.

## Worktree pattern

From canonical checkout after FS-0024 guard:

```bash
git fetch origin <branch>
git worktree add ../ronin-pr-<N> <branch>
```

Bootstrap fresh worktree before gates if `apps/web/node_modules` is absent. Never share checkout across PR
agents; never stash/reset another lane. Remove worktree only after operator-approved merge or abandonment.

## Output

One line per PR:

- `READY (pending go)` — score, local head, green evidence.
- `KEEP_AS_IS — <blocker>` — exact blocker/evidence.
- `INTENT — operator decision required` — mismatch or risky/non-mechanical fix.

Also report local commits not yet pushed and current Giddy gate.

## Guards

- Graphify-first discovery; exact source inspection afterward.
- FS-0024 cwd/remote guard before mutating git.
- `bun run test`, never bare multi-file `bun test`.
- Pause on merge; no auto-push or auto-PR update.
