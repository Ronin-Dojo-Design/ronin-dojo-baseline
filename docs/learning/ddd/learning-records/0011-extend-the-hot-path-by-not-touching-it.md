---
title: "Learning Record 0011 — Extend a hot path by not touching it; DRY polices knowledge, not shape; share the kernel, not the data"
slug: learning-record-0011
type: learning-record
status: active
created: 2026-07-12
updated: 2026-07-12
author: "Giddy + claude-session-0532"
last_agent: claude-session-0532
pairs_with:
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
  - docs/learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0011 — Extend a hot path by not touching it; DRY polices knowledge, not shape; share the kernel, not the data

> Giddy, to a junior dev. There's a reflex every junior has when a new feature looks *almost* like an existing function: open the function, add an `if`. It feels like reuse. It's usually how you put a new feature one typo away from the thing you were most afraid to break. Watch four sessions where the senior move was the opposite — *don't* touch the shared path — and one where the senior move was to duplicate on purpose.

## The trap: branching inside the hot path couples the new to the sacred

`finalizePassportClaim` is the **live identity path** — the code that runs when a real member's claim is approved and their account becomes them (0489). The tempting way to add a second finalize flavor was a branch inside it. But every branch inside a hot path makes the old, load-bearing behavior share a fate with your new, unproven one: now "did I regress identity?" can only be answered by re-reasoning the whole function. We routed **at the caller** and gave the new flavor a **separate sibling finalize** instead. The 21 existing identity tests stayed green *because the code they cover never changed* — and that green is a real answer to "did I regress identity?", not a hopeful one.

## The same discipline, four ways

- **The inverted guard *is* the design (0488).** Submit-a-claim rejects an already-owned passport; a promotion-claim *requires* one. Those aren't two states of one function fighting over an `if` — they're two operations. A `type` discriminant at the boundary and a shared *core* below expresses that; an if-branch inside the shared path hides it.
- **Make the caller own the transaction (0519).** A shared writer got *safer* by **deleting its own default DB connection** and forcing every caller to pass its client. Now paired writes run inside the caller's transaction (atomic or nothing), and authorization stays where it belongs — with the caller. Removing a convenience closed a correctness hole.
- **DRY polices duplicated *knowledge*, not similar-looking *shapes* (0498).** Two "should we merge these?" candidates — the Passport-id vs. node-id spaces, and the four authorization systems — *looked* dupe-y and were **different axes doing different jobs**. Merging them would have coupled things that must move independently. The senior move is ratify-then-conform to a boundary, not collapse everything that rhymes.
- **Share the kernel, not the data — and let conformance add duplication (0484/0531).** BBL's Leads board runs on the **AdminKanban kernel** over BBL's *own* Lead data: shared mechanism, zero cross-product coupling. And conforming a surface to a reference component can *increase* line-count locally — the row-action triplet showed up in more places as surfaces adopted it. That's convergence toward a shared component, not a DRY violation. Ledger the extraction; don't hand-differentiate the copies to chase a zero-duplication score.

## The fix: route at the boundary, share the core, keep data local

The unifying rule: **the shared thing should be the smallest thing that's genuinely the same** — a kernel, a core, a contract — and everything variable (the data, the authorization, the new flavor) lives *outside* it at the caller. Then extending the system means adding a sibling and a route, never editing the sacred middle. "Did I break the old thing?" stays answerable by running the tests that never had reason to change.

## What to do differently

1. **To extend a hot path, route at the caller and add a sibling — don't branch inside it.** The proof you didn't regress is the untouched tests staying green.
2. **When two operations have opposite preconditions, that's a `type` discriminant + a shared core — not one function with an `if`.**
3. **Make callers pass the DB client into shared writers.** Paired writes belong in the caller's transaction, and authorization belongs to the caller.
4. **Before merging two similar things, ask "same *knowledge* or same *shape*?"** Different-axes-doing-different-jobs stay separate; ratify a boundary and conform to it.
5. **Share the kernel, keep the data per-product; let conformance raise local duplication and ledger the extraction.** Convergence toward a shared component is the goal, not a dupe to "fix."

## Related

- [[learning-record-0005]] — extract the L1 *down* into the kernel; here, share the kernel and keep the data local.
- [ADR 0036](../../../architecture/decisions/0036-unified-passport-claim.md) — the one Passport-keyed claim whose finalize this record says to extend by sibling, not branch.
- [ADR 0040](../../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md) — one foundation + single-purpose pieces; the kernel-not-data rule in component form.
