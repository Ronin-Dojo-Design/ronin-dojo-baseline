---
title: "Learning Record 0018 — Parallel lanes and the canonical-checkout squat: worktree isolation, append-only ledgers, and contract-not-direct-edit"
slug: learning-record-0018
type: learning-record
status: active
created: 2026-07-21
updated: 2026-07-21
author: "Giddy + claude-session-0593"
last_agent: claude-session-0593
pairs_with:
  - docs/learning/ddd/learning-records/0017-push-by-deploy-unit-and-the-three-lying-gates.md
  - docs/protocols/recipes/merge-wave.md
  - docs/protocols/fan-out-session-recipe.md
  - docs/protocols/failed-steps-log.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0018 — Parallel lanes and the canonical-checkout squat

> Giddy, to a junior dev. We ran three planning lanes at once — this one plus RDD and admin-consolidation.
> Mid-session, this lane's checkout got yanked onto another lane's branch, its uncommitted work stranded on
> the wrong branch, and one lane had written a note directly into another lane's file and left it dangling.
> Nothing was *lost* — but only because we got lucky and paranoid in the right order. The whole mess was one
> root cause with three faces. Learn the root cause and the three faces, because parallel lanes are how we
> work now, and this will happen again to someone who didn't read this.

## The setup: one repo, N lanes, one shared checkout

Fan-out planning means several `session-NNNN` branches alive at once. The **safe** shape is one worktree per
lane: the canonical checkout `/Users/brianscott/dev/ronin-dojo-app` is *one* lane's home, and every other
lane lives in its own `../ronin-dojo-app-NNNN`. Our RDD lane (0598) did exactly that and never caused a
ripple. The admin-consolidation lane (0599) did **not** — it ran *in the canonical checkout*, and that single
shortcut produced every failure below.

## Face 1 — the HEAD-switch that strands your neighbor

0599 ran `git switch` (or `checkout`) to its own branch **in the shared checkout** while this lane (0593) was
live there with uncommitted edits to `SESSION_0593.md`. Git happily carried the uncommitted file onto 0599's
branch — that's what git *does* with a clean-to-carry change. Result: 0593's work was now sitting on 0599's
branch, 0593's branch had zero commits, and the next agent to look saw a checkout on the wrong branch with a
"foreign" dirty file.

The tell you'll see: `git worktree list` shows the canonical path pinned to a branch that isn't the session
you think you're in. Believe the worktree list, not your memory of which lane you started.

**Rule 1 — worktree isolation is not a build-lane nicety; it's the law for *any* parallel lane, plan or
build.** The canonical checkout never leaves its home lane's branch. Need another lane? `git worktree add
../ronin-dojo-app-NNNN session-NNNN-<slug>` — never `git switch` the shared checkout to it. This is already
written in `merge-wave.md` (§Hard-guards) and `fan-out-session-recipe.md`; 0599 bypassed it, so we promoted it
to FS-0034 and this record.

## Face 2 — the shared ledger is the serialization point, so make it append-only

Every planning lane wants to write the same two files: `goals-ledger.md` and `planning-ledger.md` (and
`SOT_Cookbook.md`). Three branches editing the same file is a merge fight *unless the edits are structured to
not fight*. What we learned to enforce:

- **EOF-append for new rows.** A new `G-`/`PL-` row goes at the end. Two lanes both appending at EOF produce a
  *both-added* block on rebase — resolved by keeping both, in order. Mechanical, not judgment.
- **In-place status edits are fine only if single-owner.** 0599 amended PL-003 p5; 0593 flipped PL-003 +
  PL-006 *status*. Different lines, one owner each → clean. The moment two lanes edit the *same* line it's a
  real conflict — so don't.
- **Drop the per-lane `last_agent` bump.** Every lane bumping frontmatter line 5 is the one *guaranteed*
  collision on these files, and it's self-inflicted. The **land owner** stamps `last_agent` once, at land.
- **Serialize the ledger-touching lands.** Rebase + `git merge --ff-only`, one lane at a time, in a fixed
  order. `--ff-only` (not a plain merge) fails loudly if you skipped a rebase — that's a feature.

**Rule 2 — treat shared ledgers as an append-only log with one merge owner, not a free-for-all scratch pad.**

## Face 3 — don't write a contract into your neighbor's file and leave it uncommitted

0599 needed 0593 to freeze a panel import-path, so it wrote a cross-lane "boundary note" *directly into*
`SESSION_0593.md` and left it uncommitted "for the owner to commit." Kind instinct, wrong mechanism: that note
is exactly the uncommitted change that got stranded in Face 1. A lane must not commit another lane's file
(correct — that's G0/G1 hygiene), but the fix isn't "write it and leave it dangling."

**Rule 3 — cross-lane contracts travel as a *frozen artifact the owner commits*, not a dangling edit.** The
writer proposes (a PR comment, a ledger row, a message to the owner); the **owner** commits the frozen
contract into its own file. Here the panel path (`components/app/state-of-dojo/*`) had *two* proposals — 0599's
committed one and 0593's uncommitted one — and the tie-breaker is simple: **conform to whichever is already
committed downstream**, because rewriting a committed ledger row is dearer than conforming a not-yet-built
module. Freeze it in one commit before either build lane starts.

## The recovery, and why it was safe

Two things saved us, and both are cheap enough to always do:

1. **Back up the dirty file before dispatching any Bash-capable subagent.** We copied `SESSION_0593.md` to the
   scratchpad *and* saved a `git diff` patch before letting Giddy near a shell. Review/analysis subagents can
   `git stash` a dirty tree and wipe uncommitted work (the `workflow-over-dirty-tree-clobbers-edits` hazard).
   With a backup, a clobber is an annoyance, not a loss.
2. **Merge analysis is read-only; forbid mutations explicitly in the dispatch.** Giddy diagnosed the whole
   collision and wrote the runbook without running a single mutating git command — we told it so in the brief.
   A recovery *plan* is safe to generate over a dirty tree; a recovery *action* waits for the human's go.

The carry itself was provably clean because the file's committed base was byte-identical on both branch tips —
so `git switch` back to 0593 moved the edit with zero conflict, and we committed it on its rightful branch
(`dc7ecc01`). When in doubt, prove the base is identical (`git diff branchA branchB -- path` empty) before you
trust a carry.

## What to tell yourself next time

- One lane, one worktree. The canonical checkout is somebody's home — respect it like a roommate's room.
- Shared ledgers are an append log with one merge owner. Design your rows to not touch anyone else's lines.
- A cross-lane contract is a committed freeze, owned by the consumer's downstream reality — not a sticky note
  in someone else's file.
- Before any subagent touches a dirty tree, back up the dirty file. Analysis read-only; action on the human's word.

Faces 1–3 are one lesson: **in a fan-out, the expensive collisions are not in the code — they're in the shared
surfaces (the checkout, the ledgers, the SESSION files). Isolate them, append to them, and hand off contracts
as commits.**
