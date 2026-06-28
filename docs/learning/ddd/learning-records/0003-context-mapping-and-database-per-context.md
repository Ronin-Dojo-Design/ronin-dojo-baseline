# 0003 — Context mapping, and "a database per bounded context" (Giddy draws the boundary)

**Date:** 2026-06-27 · **Lesson:** 3 · **Tied to:** ADR 0038 (D1–D5), ADR 0034, SESSION_0459 (Mammoth's own DB), learning records `0001` + `0002`

> Giddy (senior dev) to a junior, the session after we gave Mammoth its **own database** and wrote the
> repeatable recipe for the next client. `0002` ended on a cliffhanger — "what does BBL↔Mammoth become
> once they have separate DBs?" This is that answer.

## The one-breath idea

A **bounded context** is a part of the system where a word means exactly one thing. Inside BBL,
"status" means a promotion's verification state. Inside Mammoth, "status" means where a metal-building
deal sits in the sales pipeline. Same word, *different worlds*. The lesson of `0001` was: keep those
worlds' **models** separate. The lesson of **this** session is the next, harder step — make the
separation **physical**: give each world its **own database**. The boundary stops being a naming
convention you have to remember and becomes a wall the schema itself enforces.

Why a wall and not just good manners? Because shared databases rot the boundary the moment someone is
in a hurry. Somebody adds a foreign key from a Mammoth `Project` to a BBL `User` "just to reuse the
login," and now the two worlds are welded: you can't migrate one without risking the other, can't back
up or restore one alone, can't hand the client their product without untangling BBL's data out of it.
**Separate databases make the wrong thing impossible instead of merely discouraged.** That's the whole
of ADR 0038 D1: one DB per product, *no cross-product foreign keys.*

## "Context mapping" — the names for how two contexts can relate

When you have two bounded contexts, DDD gives you a vocabulary for the relationship. The four worth
knowing, and where BBL↔Mammoth lands on each:

1. **Shared Kernel** — a small core both contexts agree to share and *neither is allowed to bend toward
   its own world.* That's `packages/ui-kit` (the m-card, tokens, AdminKanban). We keep this (ADR 0038
   D3). Sharing the *kernel* is good; it's sharing the *data* that's the trap.
2. **Separate Ways** — the contexts simply don't integrate; they live apart. After this session, BBL
   and Mammoth's **data** is Separate Ways: two databases, zero FKs between them.
3. **Customer/Supplier & Conformist** — one context depends on another's model, either with negotiation
   (customer/supplier) or by just swallowing it (conformist). We are *avoiding* this between products on
   purpose — neither product should conform to the other's schema.
4. **Anti-Corruption Layer (ACL)** — *if* one product ever needs data from another, it does **not** reach
   into the other's tables. It calls an API/contract and translates the answer into its own words at the
   door. The ACL is the customs checkpoint that stops the other world's concepts from leaking in. ADR
   0038's "cross-product data crosses an API/contract, not a FK" *is* the ACL rule.

So the headline: **BBL↔Mammoth = Shared Kernel (ui-kit) + Separate Ways (data) + an ACL if they ever
must talk.** Memorize that triple; it's the shape every future client will take.

## The tell that you've drawn the boundary right: the isolation proof

Here's the move worth keeping. After Mammoth's first migration we didn't *assume* it stayed in its lane
— we **proved** it. Snapshot BBL's database table list, run Mammoth's migration, snapshot again, `diff`.
An **empty diff** is the proof the boundary held: Mammoth created its 11 tables in `mammoth_dev` and
touched *nothing* in BBL's `ronindojo_prodsnap` (still 140 tables, identical digest). A boundary you
can't run a `diff` against is a boundary you're only hoping exists. Make the proof part of "done" — it's
in the recipe's Done-means checklist for exactly this reason.

There was a second, quieter isolation proof: when we switched Mammoth's package manager to a
**standalone bun** install, the repo's **root `bun.lock` didn't change.** Same principle one layer down
— a client's dependencies are their own failure domain too. A bad dep in a client app can't break BBL's
install or CI. Failure-domain thinking isn't just about the database; it's a habit you apply to every
shared resource: *can this product's mistake reach that product?* If yes, wall it.

## Three process lessons from this session (not DDD, but keep them)

1. **Translate the brief; don't invent the schema.** The Mammoth schema wasn't guessed — it was
   *translated* from the in-repo intake brief (the client's friction zones, pipeline, custom properties,
   billing milestones) and validated against HubSpot's standard object model (the thing we're replacing).
   Every table traces to a documented need. When you can ground a model in the customer's own words and a
   known reference model, do it — that's how you avoid both under- and over-building.
2. **Let the tool's validator teach you; don't trust stale memory.** I "knew" Prisma puts the DB URL
   inline in `schema.prisma`. Prisma 7 *removed* that — the URL now lives in `prisma.config.ts`. The
   validator caught my outdated instinct in one run. When a tool says you're wrong, it's usually right;
   check its *current* docs, don't argue from how it worked a version ago.
3. **Surface the inherited choice; don't autopilot it.** Mammoth was scaffolded with npm while the whole
   platform runs bun. I followed the npm setup at the install gate without flagging it — the operator
   caught it. **An inconsistency you inherit is still a decision you're making.** Name it, recommend, let
   the operator choose (we chose standalone bun, which also bought us the dependency-isolation win above).

## Zone of proximal development (next)

- **0004 — Projections in anger:** when a read-model should graduate to a stored table (the Loop Board's
  Phase B, which now lands on BBL's *own* DB), and how to do it without the table drifting from its
  source. (Carried from `0002`.)
- **0005 — Designing the ACL:** the first time two products *must* exchange data, write the
  anti-corruption layer — the API contract + the translation at the door — and resist the foreign key.

## How this advances `0001` and `0002`

`0001` asked whether the kernel stays in-repo or gets published; `0002` answered "in-repo now, published
only when a product leaves the monorepo," and reframed separation as *data/deploys/repos, not
components.* `0003` makes that concrete: we **separated the data** (a DB per context), named the
relationship (Shared Kernel + Separate Ways + ACL), and turned the whole thing into a **repeatable
recipe** so the next client is a checklist, not a research project. The kernel question's final answer
is now visibly trending the way `0002` predicted — share the core, separate everything that can have a
blast radius.
