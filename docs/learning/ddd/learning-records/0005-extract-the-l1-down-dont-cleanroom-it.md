---
title: "Learning Record 0005 — When the kernel can't import the L1, extract it down (don't clean-room it)"
slug: learning-record-0005
type: learning-record
status: active
created: 2026-06-28
updated: 2026-06-28
author: Giddy + claude-session-0466
last_agent: claude-session-0466
pairs_with:
  - docs/learning/ddd/learning-records/0002-shared-kernel-in-practice.md
  - docs/knowledge/wiki/goals-ledger.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0005 — When the kernel can't import the L1, extract it down (don't clean-room it)

> Giddy, to a junior dev. We bought the Dirstarter boilerplate for a reason: Piotr Kulpinski's components
> are clean, solid, and already debugged. `ListingCard` — the card every directory listing renders through
> (ADR 0028/0029) — is built on his L1 `Card` primitive (`apps/web/components/common/card.tsx`). So when we
> needed a card for the **shared kernel** (`packages/ui-kit`, consumed by BBL *and* Mammoth *and* future
> clients), the instinct should have been "reuse Piotr's card." Instead we hand-wrote a brand-new one from
> scratch. SESSION_0466 is where that bill came due — and the lesson is general.

## The trap

A shared kernel (`packages/ui-kit`, [[learning-record-0002]]) is deliberately walled off: it must run in a
standalone-bun client (Mammoth) and stay framework/brand-agnostic, so it **cannot import app-coupled code**
(`~/components/common/card.tsx` drags in Next `Link`, the app's tokens, the app tsconfig). That wall is
correct. The trap is what you do when you hit it:

- **The wrong move (what we did):** "I can't import the L1, so I'll re-implement a card from scratch in the
  kernel." Now there are **three cards on two foundations** — `ListingCard` and the app `m-card`
  (`components/web/m-card`) on Piotr's L1, and the **kernel `m-card`** (`packages/ui-kit/src/m-card`) as a
  clean-room reinvention with none of the L1's polish. The kernel card is what the AdminKanban / loop-board /
  Mammoth board render. It drifts, it's lower-quality, and nobody notices because each *per-session* review
  only looks at the diff in front of it.
- **The right move:** **extract the L1 primitive *down* into the kernel.** Pull the framework-agnostic skeleton
  of `common/card.tsx` (structure + token slots, no Next `Link`) into `packages/ui-kit` as the ONE base, then
  build BOTH the app `ListingCard` AND the kernel `m-card` on that single extracted primitive. One foundation,
  Piotr's clean base preserved everywhere, the kernel boundary still respected.

## The bug that proved it

The clean-room kernel card had a mobile readability bug: on a narrow board card the title wrapped *mid-word*
("Truelso→n", "onboar→ding"). Root cause: `.mk-card__title { overflow-wrap: anywhere }` collapses a flex
child's **min-content width to a single glyph**, so flexbox happily crushed the title to whatever was left
after the "Move" control took its space. Piotr's L1 card never had this — the clean-room reimplementation
reintroduced a class of bug the bought component had already solved. (The acute fix was three CSS lines:
`break-word` + `flex-wrap` on the top row; the *structural* fix is the extraction above, tracked as **G-005**.)

## The rules

1. **Boilerplate provenance is load-bearing — write it down.** When you build on a Dirstarter L1, say so in
   the component header *and* keep the chain visible (`ListingCard` → `common/card.tsx` → Dirstarter). The
   knowledge isn't "lost" by an agent forgetting; it's lost when the chain isn't recorded and the next agent
   can't see it. (This record + the `custom-component-inventory` are that chain for the card.)
2. **Kernel boundary ≠ license to clean-room.** Hitting "the kernel can't import this app component" means
   *extract the shared primitive down*, not *reinvent it*. Reinvention is how you get N cards / M foundations.
3. **Judge the clean-room copy at the bought component's bar.** Run `/code-quality` on a from-scratch kernel
   component against the Dirstarter original it replaces — if it scores lower, that's debt, not a new asset.
4. **The per-session lens walks past this.** Two parallel cards is *cross-cutting* drift; a per-diff close
   can't see it. It took an operator's "why aren't we using ListingCard?" to surface it. That's the argument
   for a scheduled `hostile-repo-review` (repo-wide), not just the per-session `hostile-close-review`.

## See also

- [[learning-record-0002]] — shared kernel in practice (why `packages/ui-kit` can't import app code).
- `docs/knowledge/wiki/goals-ledger.md` **G-005** — the heal: extract the L1, rebase the kernel m-card,
  reconcile the two m-cards.
- `docs/knowledge/wiki/custom-component-inventory.md` — the `ListingCard` / app-`m-card` / kernel-`m-card`
  entries (the provenance chain).
