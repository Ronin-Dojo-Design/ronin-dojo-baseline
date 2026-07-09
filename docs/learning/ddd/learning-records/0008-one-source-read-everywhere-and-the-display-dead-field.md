---
title: "Learning Record 0008 — Consistency is one source read everywhere, not N surfaces kept in sync; and 'display-dead' isn't 'removable'"
slug: learning-record-0008
type: learning-record
status: active
created: 2026-06-30
updated: 2026-07-09
author: Giddy + claude-session-0474
last_agent: claude-session-0474
pairs_with:
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/product/black-belt-legacy/lineage-data-wiring-flow.md
  - docs/learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0008 — Consistency is one source read everywhere, not N surfaces kept in sync; and "display-dead" isn't "removable"

> Giddy, to a junior dev. SESSION_0474 started as a small free-tier render slice and turned into the session
> that taught the lineage display its real shape. Two bugs hid in it — one the operator caught on a live
> screenshot (the same person wearing two different belts on one page), one I *created* mid-session and the
> operator's grill caught before it shipped. They're the same bug wearing two hats, and that's the lesson.

## The trap: drift is the default when N surfaces each derive their own answer

David Meyer rendered "Black Belt – 5th Degree" in the honor strip and "Coral Belt – 7th Degree" on his card —
on the same page. Same person, two belts. The cause was mechanical: the card read `memberTopRank` (his highest
*awarded* belt), while the honor strip + the canvas tree read a different, deprecated field — `selectedRank`, a
"pick which belt to display" override left over from Baseline that still pointed at his stale WordPress-import
belt. **Two surfaces, two fields, two answers.**

The sharp edge: [ADR 0035](../../../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md) had
*already* fixed this — for the cards, the drawer, the directory. It moved them onto awarded-truth and deprecated
`selectedRank`. But it left two surfaces still reading the old field. **"Fixed in the canonical readers" is not
"fixed everywhere" as long as the divergence pattern survives** — any surface still free to read its own field
is a future Meyer waiting to surface. A partial migration off a deprecated field is a loaded gun with the safety
half-on.

## The mirror trap: I re-created the exact second-source-of-truth the canon had killed

Here's the part I own. Earlier in the same session, building the "unverified belt" display, I added a *per-award*
`verificationStatus` axis to the render path — a "prefer-verified" resolver and a per-award Unverified badge. It
type-checked, it tested, it looked principled. It was also **exactly the second source of truth ADR 0035 §5 had
deliberately marked vestigial** ("never gated on for display"). The result on the live tree: the founders —
Rigan Machado, the operator himself — showed a green "Verified" chip *and* a grey "Unverified" chip at once. Two
fields (`node.isVerified` and `RankAward.verificationStatus`) disagreeing about the same person. The same drift
as Meyer, but self-inflicted, because I introduced a new axis without checking what the canon had already
collapsed. The operator's grill ("the node is just a node — the *rank* is what's verified") killed it. **Adding
a display field/axis without first asking "did we already decide there's only one of these?" is how drift gets
*re*-introduced one session after it was fixed.**

## The fix is the same for both: one source, read everywhere

Both bugs die to the same move — collapse the N surfaces onto **one resolver**. `resolveLineageMemberView(node)`
now returns the whole view-model (avatar, belt, school, the single trust status) and *every* surface renders
what it returns; `memberTopRank` is the one place "what belt" is decided; `node.isVerified` is the one flag
"is it verified." When every surface reads one function, **disagreement becomes structurally impossible** — not
"unlikely if we're careful," impossible. That is the real payoff of KISS/DRY here: not fewer lines, but a shape
where the Meyer bug *cannot be written*. (The honor-strip + canvas fix was one line each — point them at the
resolver. The whole bug class closed with it.)

## The coda: "display-dead" is not "cheap to remove"

When the operator (rightly) called `selectedRank` YAGNI and asked to delete it, I pitched it as "drop a dead FK +
one dropdown." Mapping it found **~38 files + a Prisma migration**, because *display-dead* ≠ *unused*: the field
still fed the timeline's promotion-date, the galaxy date, the students-carousel, the drawer's rank panel, and a
user-facing edit form. A deprecated field grows quiet non-display tendrils. **Map the real footprint before you
estimate the removal** — and split a schema-touching, live-surface refactor out of the verified push rather than
bundling it (we did; it's [[lineage-rank-display-and-selectedrank-removal]] for next session).

## What to do differently

1. **When two surfaces disagree about one record, fix the *divergence pattern*, not the wrong surface.** Point
   them both at the one source. Patching the honor strip's value would have left the next surface free to drift.
2. **Before adding a display field/axis, check what the canon already collapsed.** If an ADR says "there is one
   verification axis," a per-award badge is re-opening a closed decision. Read the ADR for the *thing you're
   touching* before you add a second of it.
3. **Finish migrations off a deprecated field — a partial move is the bug's nest.** If you deprecate a field for
   display, sweep *every* reader, not just the canonical ones, or the divergence survives (ADR 0035 → SESSION_0474
   was a 44-session gap with a live bug in it).
4. **"Display-dead" ≠ "removable cheaply."** Grep the real footprint (non-display uses, edit forms, tests,
   migrations) before sizing the cut; split schema-touching cleanup out of a verified push.

## Related

- [[lineage-rank-display-awarded-truth]] (ADR 0035) — the canon both bugs violated; this record is its "and here's how it got re-violated."
- [[learning-record-0007]] — sibling: "the metric flags the load-bearing; the read corrects it." Here: "the migration looks done; the un-swept reader proves it isn't."
- [`human-code-runbook` §8](../../../runbooks/porting/human-code-runbook.md) — the plain-English walkthrough of the one-resolver pattern this record argues for.
