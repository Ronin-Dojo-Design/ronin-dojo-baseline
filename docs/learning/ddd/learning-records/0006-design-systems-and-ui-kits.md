---
title: "Learning Record 0006 — How to build a design system & UI kit (and why ours was three half-systems)"
slug: learning-record-0006
type: learning-record
status: active
created: 2026-06-28
updated: 2026-06-28
author: Giddy + claude-session-0467
last_agent: claude-session-0467
pairs_with:
  - docs/knowledge/wiki/design-system-doctrine.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
  - docs/learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0006 — How to build a design system & UI kit (and why ours was three half-systems)

> Giddy, to a junior dev who just asked "which card do I use?" — for the fourth time this month. That
> question is the bug. Not the answer — *the fact that you have to ask.* Let me teach you what a design
> system actually is, why ours wasn't one yet, and how Apple/Facebook/Figma would have built it. The
> reference detail lives in the **[Design-System Doctrine](../../../knowledge/wiki/design-system-doctrine.md)**;
> this record is the *why* you carry in your head so you never rebuild this mess.

## The mess we were in (name it so you can smell it next time)

We didn't have a design system. We had **three half-systems wearing its clothes:**

1. **Three "one cards."** `ADR 0028` said `ListingCard` is the one card. Then the `m-card` spec said *it* was
   the one card and "ListingCard folds into me." Then `ADR 0033` said the *kernel* `m-card` was the one card
   for boards. Three docs, each written without killing the last. So every few sessions someone re-asks
   "which card?" and re-litigates the whole thing. **That re-litigation is the tax of an un-ratified system.**
2. **A god-component.** The app `m-card` grew `kind="roster"|"rank"|"task"|"loop"|"generic"` — one component
   trying to be a *person*, a *blog post*, and a *kanban task* at once, with a `MCardData` type that was
   really five DTOs in a trench coat.
3. **A confidently-wrong import.** `docs/_imports/monorepo-design-system/` carried legacy tokens that said
   BBL was dark-red **plus gold** — when the live app had *corrected* BBL to `#E52421` red and flagged that
   gold as a defect. So reading our own docs gave contradictory answers. The operator's exact words:
   *"Monorepo import is WRONG."* He was right. We deleted it.

The tell that ties all three together: **each is "one thing trying to be everything."** One card for every
entity; one component for every information architecture; one imported doc treated as truth over the running
code. A design system is the opposite instinct — *small, sharp, single-purpose things composed from a shared
base.*

## What a design system actually is

Say it in one breath: **a design system is a set of decisions made once, expressed as tokens, consumed by a
small set of single-responsibility components.** Three layers, in strict dependency order — the order
Figma teaches and Apple/Material live by:

```
tokens  →  primitives  →  components
(color    (Card surface,   (ListingCard,
 roles,    Button,          PersonCard,
 spacing,  Stack)           BoardCard)
 type)
```

- **Tokens are the contract.** A component references `bg-primary` / `var(--mk-accent)`, never `#E52421`.
  A *brand* is a block of token values. This is why "make Mammoth orange" is a token swap, not a card fork —
  and why "brand-agnostic" can be *true* instead of *asserted*.
- **One surface, many named cards.** There is one `Card` *surface* primitive. On it you compose a few
  *semantic* cards, each with a tight prop type: `ListingCard` (catalog), the record/person card, `BoardCard`
  (kanban). The surface is shared; the semantics are **not a `switch`.**
- **The live app is truth.** An imported or remembered value that contradicts the running code is worse than
  no doc — it's confidently wrong, and it'll cost a debugging session every time someone trusts it.

## What Apple / Facebook / Figma would do (the model, concretely)

- **They never ship `Card(kind=…)`.** They ship a `Card` surface and *named* cards. A discriminated union
  that changes both the layout *and* which DTO binds is N components hiding in a function — you've just moved
  the complexity into a `switch` and a god-type, not removed it. Different information architecture →
  different named component.
- **Density and responsiveness are props, not new components.** "Compact card" and "card with a hero image"
  are the *same* component at different `density` — never a second component. (Our own doctrine §5 calls this
  *progressive enrichment*.)
- **They have a design-systems org separate from feature teams** — because the system is *ratified law*, and
  feature teams *conform* to it. Which is the process lesson below.
- **One focal point per card; color carries hierarchy; the squint test.** Apple's HIG in three rules: the eye
  should land *once* (one accent value per card), secondary text is *muted* not *small-and-dark*, and the
  hierarchy must read in a 3-second squint.
- **None of this is our opinion — it's the field's consensus.** The doctrine §9–§11 grounds every position in
  researched gold standards: **Dirstarter** (our primitive base — [/docs/theming](https://dirstarter.com/docs/theming)),
  **shadcn/ui** (literally our `bg`/`fg`-pair token model), **Material Design 3** (3-tier ref→sys→component
  tokens), **Apple HIG**, **Figma** — plus [Figma's 12-design-systems study](https://www.figma.com/resource-library/design-system-examples/),
  whose four-part definition (UI kits / tokens / patterns / docs) and exemplars (**IBM Carbon** docs+a11y,
  **Atlassian** layered tokens, **Uber Base** multi-product scaling, **MD3** dynamic color) each independently confirm *tokens-as-contract* + *brand-as-token-swap*. When you can cite five
  gold standards for a rule, it's not a preference — it's the law.

## The rules (carry these)

1. **Ratify the system before you refactor the components.** We kept refactoring cards and re-deciding "the
   one card" because there was no constitution to point at. Stop. Write the law (a doctrine doc), ratify it
   (an ADR), teach it (this record), *then* conform the components in a follow-up. That's the Apple sequence,
   and it's the *cheapest* sequence — one decision instead of N re-litigations. (This session did exactly the
   first three; the code conforms next.)
2. **Tokens travel into the kernel; Tailwind does not.** When the shared kernel can't import an app-coupled
   primitive, *port the surface contract* into the kernel's plain-CSS/token idiom and **bridge the tokens to
   one SoT** — don't drag Tailwind in (breaks the standalone-bun client) and don't clean-room a parallel
   (that's the drift [[learning-record-0005]] is about).
3. **One surface, a few named cards — never a `kind` god-union** spanning unrelated information architectures.
   A board feed is uniform because *the board card* is uniform, not because you forced posts and people
   through one switch.
4. **The live app is truth; kill confidently-wrong imports on sight.** A doc that contradicts the running code
   isn't history worth keeping "just in case" — it's a landmine. Delete it (or banner it) the moment you find
   it, and re-derive from canon.
5. **A brand is a token block.** Adding a brand never touches a card. If it does, your tokens aren't the
   contract yet — fix that first.

## Why this matters beyond cards

Every one of these rules is the same Ousterhout move at the UI layer: *pull the complexity down into a deep,
shared module (the surface + the tokens) and keep the things on top shallow and single-purpose.* The card
fork was just the most visible symptom. The doctrine (§5–§6) and ADR 0040 make the surface the deep module
and the named cards the shallow, swappable layer — which is exactly what a UI kit is *for*.

## See also

- [Design-System Doctrine](../../../knowledge/wiki/design-system-doctrine.md) — the reference detail: tokens,
  type ladder, spacing/φ, the card architecture, the kernel boundary, all six brand tear sheets, the Desi
  conformance sweep.
- [ADR 0040](../../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md) — the
  ratification (supersedes the three "one card" claims).
- [[learning-record-0005]] — extract the L1 down, don't clean-room it (the G-005 origin, the code half).
- [[learning-record-0002]] — the shared kernel in practice (why `packages/ui-kit` can't import app code).
