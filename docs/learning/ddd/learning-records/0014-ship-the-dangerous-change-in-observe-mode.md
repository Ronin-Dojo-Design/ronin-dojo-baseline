---
title: "Learning Record 0014 — Ship the dangerous change in observe-mode; gate only the irreversible flip"
slug: learning-record-0014
type: learning-record
status: active
created: 2026-07-14
updated: 2026-07-14
author: "Giddy + claude-session-0536"
last_agent: claude-session-0536
pairs_with:
  - docs/security/ronin-security-risk-register.md
  - docs/learning/ddd/learning-records/0009-green-isnt-verified.md
  - docs/learning/ddd/learning-records/0011-extend-the-hot-path-by-not-touching-it.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0014 — Ship the dangerous change in observe-mode; gate only the irreversible flip

> Giddy, to a junior dev. You're going to be handed changes that can break *everything* at once — a
> Content-Security-Policy, a new middleware, a data-model cutover, a permissions rewrite. The junior has two
> instincts and both are wrong: freeze ("too scary, punt it"), or ship-and-pray ("I tested it locally, send
> it"). The senior move is neither. It's to split the change into a part that *watches* and a part that
> *acts* — ship all the watching now, and put the one acting step behind a switch you flip on purpose, later,
> with eyes on real data. Session 0536 is the clean example.

## The trap: coupling "the code changed" to "the new rule is now enforced"

A CSP is the maximal blast radius: get one origin wrong and the browser silently refuses to load a script, a
font, a Stripe iframe, a video — and the app breaks for real users with nothing in *your* logs. The tempting
framing is binary: either the CSP is on (and you're one typo from an outage) or it's off (and you have no
protection). Framed that way, every reviewer is right to be scared, and the P0 sits untouched for weeks.

The framing is the bug. "The code that computes the policy" and "the browser enforces the policy" are two
different events, and you do **not** have to ship them together.

## The move: Report-Only is a seatbelt for the change itself

We shipped the whole aggressive change — drop `'unsafe-inline'` from `script-src`, mint a per-request nonce,
move CSP emission into middleware — under `Content-Security-Policy-Report-Only`. In that mode the browser
*reports* what it would block and blocks **nothing**. So the risky code landed, deployed to production, and
got verified against real traffic while being incapable of breaking a single page. The one irreversible act —
enforcement — collapsed to a single environment flag (`CSP_ENFORCE=1`) that a later, deliberate session flips
after watching the real report stream.

That inversion is the whole lesson: **make the new behavior observable in production without letting it be
authoritative yet.** Then "did I get the policy right?" is answered by production itself, not by how thorough
you felt locally.

## Three corollaries that fall out of it

- **You can't enforce what you can't observe — so the observability ships first.** Before this session the CSP
  had been Report-Only in prod for weeks and *nobody had seen a single violation*, because there was no
  endpoint collecting them. The first deliverable wasn't the hardening — it was the report sink
  (`/api/csp-report`). "Flip it and watch" is a fantasy until there's a place for the reports to land. Build
  the watching before you earn the right to act.
- **Spend your caution budget on the flip, not the change.** Everything under Report-Only is safe, so it needs
  no operator sign-off — the nonce, the middleware move, the header refactor all shipped and merged
  autonomously. Only the flag that makes it authoritative is gated. Isolating the irreversible act to one
  reversible switch is what let the rest move fast.
- **Report-Only doesn't excuse you from rendering it.** The policy blocks nothing, but a broken *nonce* still
  breaks the page's hydration — and exactly that happened (a JSON-LD `<script>` got a nonce it shouldn't have,
  and every page threw a hydration mismatch invisible to typecheck, unit tests, and `next build`). Only
  loading the real pages and reading the console caught it. Same discipline as [[learning-record-0009]]:
  green gates are not verification.

## What to do differently

1. **When a change can break everything at once, look for its Report-Only mode.** For a CSP it's literally
   Report-Only; for a feature it's a dark-launch flag; for a data model it's dual-write / read-old /
   compare; for a permission change it's log-would-deny before deny. Ship the observing half now.
2. **Build the observability before the enforcement.** No sink, no flip. The thing that collects the "what
   would have happened" is a prerequisite, not a follow-up.
3. **Put the single irreversible step behind one reversible switch, and gate only that.** Let the safe
   majority of the change ship on its own merits; reserve the sign-off for the flip.
4. **Still drive the real thing.** "It can't enforce anything" is not "it can't break anything" — render the
   flows and read the console before you call it verified.

## Related

- [Security risk register #2](../../../security/ronin-security-risk-register.md) — the CSP row this record was
  written from; the flip is its one remaining step.
- [[learning-record-0009]] — green isn't verified; the hydration bug here is a fresh instance.
- [[learning-record-0011]] — extend the hot path by not touching it; the same "isolate the risky part"
  instinct, applied to a function instead of a rollout.
