---
title: "Merge to Main Protocol"
slug: merge-to-main
type: protocol
status: active
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0034
pairs_with:
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/project-log.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Merge to Main Protocol

> How to land a session branch into `main` via PR. Derived from SESSION_0034
> governance tasks (PRs #1, #2, #3).

## Pre-conditions

1. Session is `closed-full` with hostile review ≥ 9.5.
2. All verification commands passed (or known debt documented as FINDING).
3. Branch has been committed and pushed to `origin`.

## Steps

### 1. Rebase onto current main

```bash
# From the worktree with the branch checked out
git fetch origin
git rebase --onto origin/main <last-merged-ancestor> <branch-name>
```

- Use `--onto` when the branch carries commits from earlier sessions that were
  already squash-merged into main (common with stacked branches).
- If all commits are unique to this session, a simple `git rebase origin/main`
  suffices.
- Resolve conflicts by keeping **both** sides for docs (frontmatter dates,
  index entries, SESSION-file rows) and accepting **main** for code files that
  were already squash-merged.

### 2. Verify after rebase

```bash
grep -rn "<<<<<<" .  # must return nothing
git diff --check
bunx prisma validate --schema apps/web/prisma/schema.prisma
```

### 3. Force-push the rebased branch

```bash
git push origin <branch-name> --force-with-lease
```

`--force-with-lease` is safe: it refuses if someone else pushed to the branch
since your last fetch.

### 4. Open PR (do NOT auto-merge without owner approval)

```bash
gh pr create --base main --head <branch-name> \
  --title "SESSION_NNNN: <one-line summary>" \
  --body "<summary with hostile review score, key deliverables, merge note>"
```

### 5. Owner review + squash-merge

```bash
gh pr merge <pr-number> --squash --delete-branch
```

- Squash-merge collapses session commits into one clean main commit.
- `--delete-branch` cleans up the remote branch.
- If the worktree complains about branch deletion (because `main` is checked
  out elsewhere), ignore the cosmetic error — the merge succeeded.

### 6. Pull main in orchestration worktree

```bash
cd /Users/brianscott/dev/ronin-dojo-app  # main worktree
git pull origin main
```

## Decision: when to skip rebase

If a branch's code is already on main (e.g., it was the base for a later branch
that was squash-merged first), the branch is **redundant**. Delete it:

```bash
git push origin --delete <branch-name>
```

Verify with:
```bash
diff <(git show origin/main:<file>) <(git show <branch>:<file>)
# Empty output = identical = safe to delete
```

## Conflict resolution heuristics

| File type | Strategy |
| --- | --- |
| `docs/protocols/project-log.md` | Retired stub; conflicts here should not happen — if both branches edited it, escalate to operator before merging. |
| `docs/sprints/SESSION_*.md` | Keep both sides (each branch should touch its own SESSION file; cross-edits are a smell). |
| `docs/knowledge/wiki/index.md` | Keep both sides (both add new session rows) |
| Frontmatter `last_agent` / `updated` | Accept the newer (incoming) value |
| `apps/web/lib/rate-limiter.ts` | Accept main (it has all prior session keys); incoming adds new keys on top |
| Code files identical on both sides | Accept either (use `--ours` or `--theirs`) |

## Anti-patterns

- **Never merge without rebase** when the branch is >2 commits behind main.
  The squash merge will include stale content.
- **Never auto-merge** a session PR without owner review. The hostile review
  score gates quality, but the owner gates scope and calendar.
- **Never rebase a branch whose code is already on main** — just delete it.

## Evidence from SESSION_0034

| PR | Branch | Strategy | Result |
| --- | --- | --- | --- |
| #2 | `session-0032-typecheck-debt` | Direct push + squash-merge | Clean |
| #1 | `session-0032-attendance` | Merge from main (resolve 2 doc conflicts) + squash-merge | Clean |
| #3 | `session-0033-enrollments-family-waivers-trial` | `rebase --onto` (drop 6 already-merged commits, resolve 3 doc conflicts) + squash-merge pending | PR open |
| — | `session-0031-class-schedules` | Code already on main via PR#1 squash | Deleted |
