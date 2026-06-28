# 0002 — The shared kernel, in practice (Giddy teaches the kernel)

**Date:** 2026-06-27 · **Lesson:** 2 · **Tied to:** ADR 0033 (D1, D3), SESSION_0458 (Loop Board), learning record `0001`

> Giddy (senior dev) to a junior, after we shipped the Loop Board by *reusing* a board we already had.

## "What's a kernel?" — the one-breath answer

A **kernel** is the small, shared **core** that several products are allowed to reuse, but that **none
of them is allowed to bend toward its own world**. In our repo the kernel is `packages/ui-kit`: the
`m-card` (our one card), the design tokens, and the `AdminKanban` board engine. Black Belt Legacy and
Mammoth are *different products with different languages* — a "status" on a BJJ promotion is not a
"status" on a metal-building sales deal — so they keep separate models. The kernel is the **one place
they're permitted to share**, and the deal is: it stays generic. No BBL words, no Mammoth words, just
"a card," "a board," "a column."

Think of a **car platform**: the chassis, axles, and wiring are shared across five models. Each model
bolts on its own body and trim. Nobody re-welds the chassis to fit one model — the moment you do, it
stops being a platform. Same with the kernel: the moment a product's rules leak in, it stops being
reusable and becomes a fork.

## The move that mattered this session: *reuse, don't reinvent*

We needed a shared board to show Brian + Tony the open work across our governance ledgers. My first
instinct (and probably yours) is "I'll build a board component." **Wrong reflex.** We *had* a board —
`AdminKanban`, already used by Mammoth. So the Loop Board became its **third consumer**: a `BoardConfig`
(the columns, as data) + a tiny mapper (ledger item → card) + a generic `readOnly` switch I added to the
kernel. No new renderer. That's the discipline behind our `[[listing-card-is-the-one-card]]` rule —
*every* listing renders through the one card; *every* board through the one engine. When you catch
yourself about to build "another card" or "another board," stop: the win is almost always a new
*consumer* of the kernel, plus maybe one small *generic* capability added to the kernel itself.

The test for "is this change allowed in the kernel?": **could any future product want it, with no idea
what BBL or Mammoth are?** A `readOnly` board? Yes — generic. A "show the lineage belt color"? No —
that's BBL's domain; it goes in BBL's mapper, not the kernel.

## Three more concepts this session leaned on (worth memorizing)

1. **Projection (read-model).** The Loop Board *computes a view* from the ledgers and stores **nothing**.
   No second copy to keep in sync, no migration. A report off a spreadsheet, not a photocopy of it.
   When someone says "let's add a table to track X" — first ask whether X can be *projected* from a
   source you already have. Often it can, and you've just avoided a sync bug forever.
2. **Port & adapter.** The board depends on a *slot* called `BoardStore` ("give me load/save"), and you
   plug in whatever fills it — localStorage today, a database later — without touching the board. This is
   why "make the board persist to a DB" is a one-file change, not a rewrite.
3. **Realtime-from-git.** We read the ledgers **live from the `main` branch** (GitHub's public raw URL),
   not from the deployed bundle. Why bother? Because our docs commits *skip the prod rebuild* — so a
   board baked at deploy-time would go stale exactly when the ledgers change. One infra fact (the repo
   is public) flipped the whole design from "good enough" to "free *and* always-fresh." **Lesson: a
   single environment fact can invert an architecture decision — so surface the fork, don't autopilot
   the default.**

## How this advances `0001`'s open question

Record `0001` ended with: *does the kernel live in `packages/ui-kit` (in-repo) or its own published
package (Mammoth in its own repo)?* This session the operator pushed toward **true product separation —
separate databases per product, separate brands/deploys, and eventually BBL in its own repo.** The
clarifying insight: **separation is about data, deploys, and repos — NOT about the kernel.** Components
stay shared (`packages/ui-kit`); it's the *databases, brands, and deployment homes* that split. So the
answer is trending: kernel stays the in-repo shared core now, and becomes a *published* package only
when a product actually leaves the monorepo (a handoff/sale). That's a **context-mapping** decision
(0003's topic), not a build-tooling one — exactly as `0001` warned.

## Zone of proximal development (next)

- 0003 — Context mapping: Shared Kernel vs Customer/Supplier vs Anti-Corruption Layer — and what
  BBL↔Mammoth becomes once they have **separate DBs** (this session's strategic turn).
- 0004 — Projections in anger: when a read-model should graduate to a stored table (the Loop Board's
  Phase B), and how to do it without the table drifting from its source.

## Process lesson (not DDD, but worth keeping)

**Push the verified code, then run the close while CI churns.** We committed + pushed Phase A, and ran
the entire bow-out (this record included) while GitHub's CI + Playwright ran in parallel — the close is
docs-only, so it never collides with the build matrix. The operator clocked it as a real efficiency win.
Make it the default cadence.
