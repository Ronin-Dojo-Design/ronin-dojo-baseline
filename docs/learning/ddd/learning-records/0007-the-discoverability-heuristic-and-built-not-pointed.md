---
title: "Learning Record 0007 — The dead-code heuristic also flags the load-bearing; and 'built' isn't 'pointed'"
slug: learning-record-0007
type: learning-record
status: active
created: 2026-06-29
updated: 2026-06-29
author: Giddy + claude-session-0468
last_agent: claude-session-0468
pairs_with:
  - docs/protocols/hostile-repo-review.md
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0007 — The dead-code heuristic also flags the load-bearing; and "built" isn't "pointed"

> Giddy, to a junior dev. S48 was the repo-health sprint: lean the 43M corpus, prove what's wired. We had a
> clean method — Graphify connectivity + reference-count + ritual-hook presence — to sort "wired" from
> "lost-in-the-wind." It worked, and it reclaimed ~3.3M of genuine dead weight in one session. But it also
> tried to bury five things that were holding the place up. That near-miss is the lesson.

## The trap: low refs + no trigger ≠ dead

The heuristic that finds dead code is "few inbound references, no call site / ritual hook." It is a good
*pointer*. It is not *proof* — and its false-positives are not random. They cluster on exactly the most
load-bearing kinds of artifact:

- **An engine has no direct trigger.** `three-pass-loop` is the score→fix→review contract that the *wired*
  `pr-review-score-fix-loop` is built on. It has `hooks=0` because engines are *invoked by* the things that
  are triggered, not triggered themselves.
- **A sub-routine is reached by a branch.** `identify-intent-improve` is invoked only by one branch of the PR
  loop. `grep` can't see a conditional invocation.
- **A schema is referenced, not run.** `qa-runtime-verification` is the shape of the `## Verification` table
  every bow-out audits — load-bearing, zero "hooks."
- **A break-glass runbook is dormant by design.** `hot-fix-protocol` fires only on a user-blocking prod bug.
  Its dormancy is the *good* outcome. You don't retire the fire extinguisher because there's been no fire.
- **An under-linked doc is not an orphan.** `send-email-flow` had 0 inbound references and was a live, weeks-old
  safety SOP. Same class as the deleted-then-mourned doc would have been.

Of five "dormant loops," reading them turned up **four foundations + one true duplicate.** The duplicate
(`kiss-dry-yagni-loop`, re-describing three wired skills) was correctly retired. The four were mislabeled by
the metric and corrected by the read. **The read is the proof; the metric only tells you where to read.**
(I labeled all five "dormant" before reading them, then had to relabel — the deeper read should have come
first. Cost: one relabel-then-correct cycle. Cheap this time; budget it next time.)

## The mirror trap: "built" is not "pointed"

The same session's positive lesson came from the operator. Handed five agent-engineering infographics —
skill-routing, context windows, work ledgers, trust boundaries, verification loops — with: *"we have these,
we just don't point to them well enough."* He was right: we'd built strong versions of all five (the roster,
the nine ledgers, Doug's verification gates) but they lived scattered across rituals, protocols, and agents.
A capability that an agent has to re-grep-the-world to find is, for practical purposes, **not built.**

So we wrote one conceptual map ([[agent-systems-map]]) pointing each pattern at our real systems, and lifted
the two genuinely-missing artifacts the images modelled (a task→workflow router, an allowed-vs-never table).
Then the operator closed the loop on *us*: *"how and when does an agent actually read the map?"* — applying
the build-not-pointed thesis to the new doc itself. A reference doc fails two ways: **never read** (unpointed)
or **always read** (bloat). The fix is to wire it at the *decision point* (the router into the opening
ritual's task step; an awareness line into the always-loaded `CLAUDE.md`) and *not* into the SESSION
template (a work-ledger, not a guidance surface). Writing it wasn't the deliverable; wiring it was.

## What to do differently

1. **Treat ref-count/hook-count as a worklist, not a verdict.** Anything it flags, *read* before you label,
   retire, or relabel. Especially engines, sub-routines, schemas, and break-glass runbooks.
2. **Prefer deletes to moves when leaning out.** Physical relocation breaks `../`-relative links and (here)
   doesn't even shrink the lint scope — the archive sweep was reverted for exactly this ([HRR-005], and the
   `doc-pruning-register` had already concluded it). Delete true dupes/dead; mark superseded *in place*.
3. **A capability isn't done until it's in the read-path.** Ship the pointer with the artifact. The
   [[agent-systems-map]] is the index that makes "what would Apple do — point to one of each thing" real.
4. **Check the ledgers before concluding.** Two of this session's answers were already written down (epic
   RH-1; the `doc-pruning-register` move-is-value-negative call). Re-deriving what you already concluded is
   its own waste — the [[s48-repo-health-and-hostile-repo-review]] kind of drift.

## Related

- [[hostile-repo-review]] — the protocol this sprint runs; its six hunt-lenses are the metric, this record is the caveat.
- [[learning-record-0005]] — the sibling near-miss (clean-rooming the L1 instead of extracting it); same family of "the heuristic/instinct pointed wrong, the read corrected it."
- [[agent-systems-map]] — the discoverability artifact this session produced.
