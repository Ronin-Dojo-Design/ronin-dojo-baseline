---
title: "Learning Record 0013 — Don't build what was literally asked: ground-first, grill the conflict, the capability usually already exists"
slug: learning-record-0013
type: learning-record
status: active
created: 2026-07-12
updated: 2026-07-12
author: "Giddy + claude-session-0532"
last_agent: claude-session-0532
pairs_with:
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
  - docs/learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0013 — Don't build what was literally asked: ground-first, grill the conflict, the capability usually already exists

> Giddy, to a junior dev. The most valuable thing I built in one session was *nothing* — I read a learning record at bow-in, recognized that the dispatch was asking me to re-introduce a bug we'd killed two sessions earlier, and led the grill with that conflict instead of the keyboard. A dispatch is a *request*, not a spec. Your first job is to ground it against the code and the canon, not to execute it.

## The trap: a literal build of a wrong-but-confident request

The 0486 dispatch asked for a per-belt **UNVERIFIED** axis and an ADR reversal — the *exact* axis a prior grill and [[learning-record-0008]] had already killed, because it made founders display two belts at once. Nothing about the dispatch flagged the conflict; it read as a normal task. The only reason it didn't ship a re-regression is that the anti-rediscovery layer *worked*: reading LR 0008 at bow-in, **before** touching the ADR, surfaced the collision. The senior output wasn't code — it was *"this contradicts a decision we made on the same axis; here's the grill."*

## The four ways a request lies to you

- **Ground before lock (0494).** Planning against **five real surveys** instead of memory caught myths that would have shipped wrong: the app never had the radial MAB the operator "remembered," it was Rorion not Rigan who promoted, and the "Dirty Dozen" already exists as published editorial. Memory is a lossy cache of the codebase; plan against the code.
- **A locked spec can still encode a myth (0521).** A spec that survived a grill still said *"port the drawer's inline-edit"* — but that drawer **has no inline edit; it links out.** Grilling validates the *goals*; you still have to verify the *mechanisms* against the code they claim to reuse.
- **The plan's shorthand can hide a business bug (0489).** "Idempotent comp" sounded like a safe simplification — it would have handed **every promoted member free Elite.** When a plan's convenient phrasing implies a business outcome, flag it; don't silently obey it and don't silently drop it.
- **The machinery almost always already ~90% exists (0486/0490/0502/0527).** Again and again the honest task was *inventory what's there*, and the fix was **deleting a wrong branch**, not greenfielding. Declaring "we need to build X" before searching for X is how you rebuild something you already own.

## The fix: ground-first, grill the conflict, inventory before you build

The order is fixed. **Read the canon on the axis you're touching** (ADR + learning record) — that's the layer that catches re-regressions. **Ground the plan against the real surfaces** — that kills the myths. **Verify the mechanisms the spec claims to reuse.** *Then* inventory the code for what already exists. Only what's genuinely missing after all four gets built. And when a rule you inherited seems too broad, **surface and narrow it** with its *why* — don't silently obey it (0493); a rule without its incident-and-mechanism is a cargo-cult waiting to misfire.

## What to do differently

1. **At bow-in, read the ADR + learning record for the axis you're about to touch.** If the dispatch contradicts one, *lead the grill with that conflict* — that's the highest-value output, even (especially) when it's "don't build this."
2. **Plan against the code, not your memory of it.** Open the real surfaces/surveys first; treat every "I remember it does X" as a claim to verify.
3. **Verify the spec's *mechanisms*, not just its goals.** "Port the inline-edit" is false if there's no inline edit to port. Grilling proves intent; the code proves feasibility.
4. **Flag business logic smuggled in as shorthand.** "Idempotent comp," "just default it" — trace what it *does* to real users before you accept it.
5. **Inventory before you greenfield; prefer deleting a wrong branch to adding code.** The capability is usually already ~90% built.
6. **Surface and narrow an over-broad inherited rule with its why — don't silently obey.**

## Related

- [[learning-record-0008]] — the record that, read at bow-in, stopped 0486 from re-introducing the two-belts bug.
- [[learning-record-0007]] — "built isn't pointed"; here, "asked isn't needed" — both say the read-path/inventory comes before the build.
- [ADR 0035](../../../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md) — the awarded-truth canon the 0486 dispatch would have reversed.
