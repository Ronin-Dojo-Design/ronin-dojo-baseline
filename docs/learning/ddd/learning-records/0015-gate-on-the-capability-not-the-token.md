---
title: "Learning Record 0015 — Gate on the capability, not the token; the seed hides the gap; a mirror's one divergence is the design"
slug: learning-record-0015
type: learning-record
status: active
created: 2026-07-14
updated: 2026-07-14
author: "Giddy + claude-session-0535"
last_agent: claude-session-0535
pairs_with:
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/decisions/0046-technique-ownership-org-nullable-and-authored-by.md
  - docs/learning/ddd/learning-records/0011-extend-the-hot-path-by-not-touching-it.md
  - docs/learning/ddd/learning-records/0009-green-isnt-verified.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0015 — Gate on the capability, not the token; the seed hides the gap; a mirror's one divergence is the design

> Giddy, to a junior dev. FI-028 gated community-post creation to paying members. The whole gate is one
> function and six tests, all green on the first try. It was also one line away from silently locking a
> future paying customer out of the feature they paid for — and no test would have caught it, because the
> test data was too kind. Here's the reflex to build.

## The trap: gating on the token the code happens to see, not the capability the user actually has

The obvious gate is `hasEntitlement(user, "LINEAGE_PREMIUM")` — "does this user hold the Premium row?" It
reads right, and every test passes, because our seed data (and the comp-grant path,
`getLineageCompEntitlementKeys`) writes the **subsumed** keys: a comped Elite gets _both_ `LINEAGE_ELITE`
**and** `LINEAGE_PREMIUM`. So in every state the tests exercise, "has Premium" and "is a paying member"
happen to coincide.

They only coincide because of how the _data_ is written — and the code does not write that data. Paid
entitlement keys come from `PricingPlan.entitlementGrants` (a **DB-configured** row the Stripe webhook
reads, `server/web/billing/stripe-webhook.ts`), not from any invariant in the gate's file. A future paid
**Elite** plan configured to grant only the `LINEAGE_ELITE` key — a perfectly reasonable config — would
make `hasEntitlement("LINEAGE_PREMIUM")` return **false** for a top-tier paying customer, and the gate would
deny them the feature they out-paid everyone for. Correct-looking code, green suite, latent lockout.

## The discipline: read the source of the data, then gate on the set that _means_ the capability

Two moves turned the landmine into a one-liner:

- **Read how the data is actually written before trusting its shape.** Opening `stripe-webhook.ts` —
  not the gate, the thing that _populates_ what the gate reads — is what surfaced "keys are per-plan
  config, not a code guarantee." You cannot reason about a gate from the gate alone when it keys off data
  another system owns.
- **Gate on the capability, not the token.** The question isn't "has the Premium row"; it's "is a paying
  member of any tier." So the gate checks the **tier-key set** `LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS`
  (`PREMIUM ∨ ELITE ∨ LEGEND`) — the set that _is_ the capability — with one `findFirst … key: { in: … }`.
  Any current or future paid tier passes, regardless of which subset of keys its plan happens to grant.

## The seed hides the gap — so seed the adversarial shape

The six-green-tests feeling is exactly the danger: the suite was green because the fixtures wrote the kind
keys. The fix is a test that constructs the **hostile** state the seed never produces — a member holding
**only** `LINEAGE_ELITE`, no `LINEAGE_PREMIUM` — and asserts they're allowed. That one test (`ALLOWS an
Elite member holding ONLY LINEAGE_ELITE`) is the whole guardrail: a single-key check _fails_ it, so the
landmine can never be re-introduced by a future "simplify this to match the sibling gate."

## A mirror is not a copy — its one divergence is the design

`canCreateCommunityPostForUser` mirrors `canCreateTechniqueForUser` (same three composed seams — RBAC ∨
staff `Membership` ∨ entitlement — the "no 5th authz" rule, [[learning-record-0011]]). But the technique
gate checks a **single** `LINEAGE_ELITE` key, and the post gate checks the **whole tier set**. That
divergence is not sloppiness — it's the load-bearing decision (posts unlock at the _lowest_ paid tier, so
the gate must admit _every_ tier above it). When you mirror a proven function, the one place you diverge is
the one place a reviewer must look hardest; name it in a comment and pin it with a test, or the next agent
will "restore parity" and reopen the hole.

## What to do differently

1. **When a gate keys off data another system writes (entitlements, feature flags, config rows), go read
   that writer first.** You cannot verify the gate from the gate's file alone.
2. **Gate on the capability (the set that means "allowed"), not a single token** — especially when that
   token is one member of a subsuming family. "Is a paying member" ≠ "holds the Premium row."
3. **A green suite on seed data proves nothing about the gap the seed can't produce.** Seed the adversarial
   shape (the entitled user your comp-path never mints) and assert on it. ([[learning-record-0009]] — green
   isn't verified.)
4. **When you mirror a proven gate, treat the one intentional divergence as the design:** comment it, and
   pin it with a test that a naive "make it match the sibling" would fail.

## Related

- [[learning-record-0011]] — compose the existing authz seams, never a 5th system; this gate is a fourth
  member of that `canDo<X>ForUser` family, diverging only where the tier boundary demands it.
- [[learning-record-0009]] — "green isn't verified"; here the green came from a too-kind seed, and the fix
  was an adversarial fixture.
- [ADR 0011](../../../architecture/decisions/0011-entitlement-first-commerce.md) — entitlement-first
  commerce: features check the entitlement, never Stripe metadata. This record adds: check the tier _set_,
  because which keys a plan grants is DB config, not a code guarantee.
