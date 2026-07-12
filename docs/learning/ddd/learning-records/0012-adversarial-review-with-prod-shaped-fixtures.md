---
title: "Learning Record 0012 — Adversarial review before push, with prod-shaped fixtures; and test who *gains* access first"
slug: learning-record-0012
type: learning-record
status: active
created: 2026-07-12
updated: 2026-07-12
author: "Giddy + claude-session-0532"
last_agent: claude-session-0532
pairs_with:
  - docs/protocols/hostile-repo-review.md
  - docs/learning/ddd/learning-records/0009-green-isnt-verified.md
  - docs/learning/ddd/learning-records/0010-make-the-wrong-state-unrepresentable.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0012 — Adversarial review before push, with prod-shaped fixtures; and test who *gains* access first

> Giddy, to a junior dev. The scariest bug I've watched clear every gate was this: 100+ green tests, three green production builds, and a member who could **approve their own belt promotion.** The gates weren't lying — they were testing a world that didn't match production. That gap is where security bugs live, and this record is how you close it before push instead of after.

## The trap: green fixtures can be *shaped wrong*

The self-approval exploit (0491) survived every test because the fixture lacked a grant that production **always** creates — the member's own-node `NODE_EDITOR`. In the test world nobody had that grant, so nobody could self-approve, so the test was green *and irrelevant.* The exploit lived precisely in the delta between "the data we tested against" and "the data production makes." A green suite over a non-prod-shaped fixture is a confident answer to the wrong question.

There's a widening rule hiding in that bug: it appeared the moment we moved an action **from a role-gate to a resource-scope**. Role-gates ask "what role are you?"; resource-scopes ask "what can you touch?" — and a resource-scope silently hands the action to *everyone who owns the resource*, which in this case included the applicant. When you change the gate's *axis*, the set of people who gain access changes, and the old tests were written for the old set.

## The disciplines that actually catch these

- **Test who *gains* access first (0491).** When an action moves gate → scope, enumerate **who newly can do it** and write the adversarial test for the *gainer* — the applicant approving themselves — before the happy path.
- **Neutralize-and-restore is the only honest proof (0492).** A security fix is only proven when you **remove the guard, watch the honest test go red, and restore it.** A test that's green with *and* without the fix is testing nothing. Make the guard earn its green.
- **Two lenses find what neither finds alone (0495).** A Security review came back green using origin-only R2 test bases — and missed that a root-anchored prefix guard **rejects every path-style MinIO image.** The *architecture* lens caught it. Security and architecture are different microscopes; run both.
- **A review is allowed to say "hold" (0484).** A ship-it review correctly **held** an unsafe, autonomously-built epic and shipped only the pieces that were independently safe. The output of a review isn't a rubber stamp; it's a partition into safe-now and not-yet.
- **Independent lenses each catch a distinct defect class (0511/0529).** The review wave isn't redundancy — correctness, security, UX, and architecture reviewers find *different* bugs. Running them in parallel is how a wave beats a single 9+ reviewer.

## The fix: make review adversarial, prod-shaped, and multi-lens — before push

Verification and review are not the same act (that's [[learning-record-0009]]'s job — drive the flow). This is the *review* act: assume an attacker, seed the fixture the way production seeds it, prove each guard by breaking it, and point several independent lenses at the diff **before** it leaves your machine. The self-approval bug is the standing proof that "tests pass" and "safe to ship" are different sentences.

## What to do differently

1. **Seed fixtures the way production seeds them.** If prod always grants own-node `NODE_EDITOR`, your test data must too — otherwise green means "untested," not "safe."
2. **When an action's gate changes axis (role → resource, or wider), enumerate who *gains* access and write the adversarial test for the gainer first.**
3. **Prove every security fix by neutralize-and-restore.** Remove the guard, confirm the test fails honestly, put it back. A guard whose test passes without it is decoration.
4. **Run independent lenses in parallel — security *and* architecture *and* UX — not either/or.** Each catches a class the others miss.
5. **Let review return "hold."** Ship the independently-safe subset; quarantine the rest. Partitioning is a valid, senior verdict.

## Related

- [[learning-record-0009]] — its sibling: 0009 drives the flow to prove it *works*; this drives an attacker to prove it's *safe*.
- [[learning-record-0010]] — the fix side: the strongest review outcome is a type that makes the bad state unrepresentable.
- [[hostile-repo-review]] — the protocol whose hunt-lenses this record's multi-lens discipline runs on.
