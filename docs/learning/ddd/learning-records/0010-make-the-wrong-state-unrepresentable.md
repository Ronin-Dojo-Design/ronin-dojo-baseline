---
title: "Learning Record 0010 — Make the wrong state unrepresentable: encode the invariant in the type, read trust from the fact it certifies"
slug: learning-record-0010
type: learning-record
status: active
created: 2026-07-12
updated: 2026-07-12
author: "Giddy + claude-session-0532"
last_agent: claude-session-0532
pairs_with:
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0046-technique-ownership-org-nullable-and-authored-by.md
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0010 — Make the wrong state unrepresentable: encode the invariant in the type, read trust from the fact it certifies

> Giddy, to a junior dev. Watch how the premium-media leak got fixed *three times* before it stayed fixed — and why only the third fix was real. That arc is the whole lesson: the durable version of a security or consistency guarantee is never "we'll remember to strip the field." It's a shape where the field *isn't there to strip.*

## The trap: a rule you have to remember is a rule you'll forget

The freemium leak started as a discipline: **strip the media URL server-side before it reaches a locked tile** (0526). Correct, and fragile — because "remember to strip it" is a promise renewed on every new code path, and the day someone adds a fourth surface that forgets, the gated video is one `view-source` away. A guarantee enforced by vigilance decays at exactly the rate the codebase grows. The bug isn't the missing strip; the bug is that a locked tile *can hold a URL at all.*

## The four shapes of the same move

The fix that lasts changes the **type**, not the discipline — so the bad state can't be written:

- **The no-leak progression (0526→0527→0529).** First we stripped the URL (0526). Then we made a locked tile's media a **discriminated union whose locked variant literally has no `url` field** — `LockedTileMedia` — so "leak the URL" stops being a mistake you can make and becomes a shape that won't type-check (0527). Then it generalized: for a YouTube reel the *poster is the content*, because `img.youtube.com/vi/<id>` reconstructs the watch URL from the thumbnail. So `thumbnailUrl: null` is **type-encoded** on the locked variant too. The invariant we'd found: *any teaser derived from the gated asset's own identifier is itself a leak* (0529).
- **Guard at the sink, not each input (0512).** The HSL brand-color injection was made safe by validating `isHslSafe` at the **`<style>` injection sink** — the one place the value becomes executable — not at each of the inputs that feed it. Guard the inputs and every *new* input widens the attack surface; guard the sink and the surface is closed by construction.
- **A trust signal must read the fact it certifies (0484).** A "Verified" badge that read `node.isVerified` — a *different axis* than the belt's award status — could stamp VERIFIED on a self-declared belt. The badge and the thing it vouches for read the same source now. A certificate that reads a neighboring field is a forged certificate waiting to happen.
- **Enforce the invariant with a pure predicate + a test (0480/0482).** The belt-ceiling rule ("a self-report can never exceed the awarded ceiling") is enforced per-call by pure predicates and *proven* by a test, so a self-report ≤ ceiling can never climb into the displayed top rank. The invariant is executable, not aspirational.

## The fix: prefer "can't be written" over "we'll remember not to"

Absent field, discriminated union, sink-guard, DB constraint, pure-predicate-plus-test — these are the same senior move at different layers. Each one converts a rule you'd have to *remember* into a shape the compiler, the type system, or the database *enforces for you*. That's the payoff: not fewer bugs on average, but a specific bug class that **cannot occur**, verified by construction rather than by care.

## What to do differently

1. **When you catch yourself writing "remember to X," reach for a type instead.** Can the bad value be an absent field? A variant of a union? A constraint? If yes, make it that — the discipline becomes free.
2. **Guard at the sink, once.** Validate where the value becomes dangerous (the injection point, the write), not at every place it's produced. New producers then inherit the guarantee.
3. **A trust signal reads the exact source it certifies — never a neighboring axis.** If a badge says "verified," it reads the verification status of *that thing*, not a same-shaped flag one hop away.
4. **Generalize the leak to its root.** "Strip the URL" was too narrow; the real rule was "any teaser derived from the gated asset's own identifier is a leak." Fix the class, not the instance.
5. **Prove the invariant with a test that would fail if it broke.** A pure predicate plus a red-when-violated test turns an aspiration into an enforced law (0480/0482).

## Related

- [[learning-record-0008]] — one source read everywhere; here, the source is *encoded in the type* so drift can't be written.
- [[learning-record-0012]] — the review-side sibling: prove a security fix is real by neutralize-and-restore.
- [ADR 0046](../../../architecture/decisions/0046-technique-ownership-org-nullable-and-authored-by.md) — the technique-authoring model whose locked-tile union carries the no-leak invariant.
