---
title: "Learning Record 0009 — Green isn't verified: the truth lives in the real data, the real wiring, and the real surface"
slug: learning-record-0009
type: learning-record
status: active
created: 2026-07-12
updated: 2026-07-12
author: "Giddy + claude-session-0532"
last_agent: claude-session-0532
pairs_with:
  - docs/learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
  - docs/runbooks/porting/human-code-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0009 — Green isn't verified: the truth lives in the real data, the real wiring, and the real surface

> Giddy, to a junior dev. Across a run of sessions the same ghost kept showing up: a lane where **typecheck, lint, 1,366 unit tests, and a production build were all green — and the feature was still broken.** Not flaky-broken. Dead. Unreachable. Rendering nothing. Leaking the thing it was supposed to hide. It happened often enough that it stopped being bad luck and became the lesson.

## The trap: every gate checks a *slice*, none of them checks the *flow*

A green suite is four narrow promises: the *shapes* line up (typecheck), the *style* is clean (lint), the *logic* is right *in isolation, against the fixtures you imagined* (unit tests), and the app *compiles for prod* (build). Notice what's missing from all four: **a real user, moving through real data, on the real surface.** That gap is where these bugs live — and it wears four faces:

1. **Code deploys; data doesn't.** The blog lane was green on a live local render — but a `Post` is a *database row*. The push shipped an empty prod blog. (0485. Same shape in 0496: the bug *was* a DB row drifted from its seed — a fix with **zero diff**, so "cards or it evaporates" at the next prodsnap.)
2. **Green tests can't see empty data.** The ancestry walk was correct and unit-tested and would have shipped rendering *nothing* for the one man who asked for it — Tony had a tree placement but zero provenance edges. Only a live-data smoke against the prodsnap caught it; the fix was a *data backfill*, not code. (0493.)
3. **"Built" hides where the tests mock.** A revalidate seam sat "done" since a phase-1 migration and would have 500'd on its *first real caller* forever — the unit tests mocked both sides of the transport. Building the first real consumer *is* the verification act. (0498; and 0495: a scalability prop that no page consumed — a well-shaped, well-tested, completely *dead* API.)
4. **The flow 404s while every gate is green.** FI-027 passed everything and was **100% unreachable** — a stale redirect bounced the route before its guard ran, and its filter silently didn't re-query. The authored-technique flow (0529) 404'd on the member's very next tap because a draft linked to a published-only route. (0529, 0530.)

## The fix is the same for all four: make "done" an empirical round-trip

You do not get to call it done from the terminal. You drive the actual surface, as the actual user, against actual data, and you *watch the thing happen*. When we made that non-negotiable — and crucially, ran the live smoke **before** the review wave — two things changed: the showstoppers surfaced in minutes instead of in production, and the reviewers spent their judgment on *working* code instead of scoring a corpse. The live smoke isn't a nicety on top of CI. On this codebase it is **the load-bearing gate**; CI is the backstop. (0530/0531.)

## What to do differently

1. **Drive the flow, not the gate.** After green, open the real surface and complete the real user journey. "It type-checks / tests pass" is a claim about shapes and logic; "I watched it work" is a claim about the product.
2. **Verify against *real* data, and against *live* prod when the bug could be data-shaped.** A cutover that's green on a stale snapshot can still drop 33 members on live prod (0523). Empty/edge data is a *different gate* than correct code.
3. **Build the first real consumer as the proof.** Built-not-wired debt hides exactly where the tests mock the transport. If nothing calls the seam yet, it isn't verified — it's pending.
4. **For any change to a shared primitive or a UI contract, run its affected e2e.** Unit + build green is not "verified" for shared-UI work — CI e2e was the *only* gate that caught two prod-bound regressions that passed two 9+ hostile reviews (0511).
5. **A data-layer fix has no diff — ledger it, or it un-happens.** A drifted DB row fixed by hand evaporates at the next prodsnap unless the change lands in the seed + a ledger row (0496).

## Related

- [[learning-record-0007]] — the sibling: "built isn't pointed." Here: "built isn't *verified*."
- [[learning-record-0008]] — one-source-read; several of these bugs are also two-sources-disagreeing.
- [`human-code-runbook` §9](../../../runbooks/porting/human-code-runbook.md) — the plain-English version for a human reader.
