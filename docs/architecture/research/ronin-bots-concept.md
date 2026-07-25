---
title: "Ronin bots — the client-facing naming layer over the agent OS"
slug: ronin-bots-concept
type: research-review
status: research-review
created: 2026-07-24
updated: 2026-07-24
session: SESSION_0679
last_agent: claude-session-0679
pairs_with:
  - docs/protocols/recipes/overnight-orchestrator-waves.md
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - agents
  - branding
  - rdd
  - productization
---

# Ronin bots — concept

**One sentence:** "Ronin bots" is the client-facing, per-brand-customizable naming layer over the
internal agent OS — ADR 0051's `kernel → brand → app` taxonomy applied to the **agents
themselves**: one agent kernel (the roster + recipes + orchestrator waves), skinned as a named
bot family per client brand.

Written by autonomous lane SESSION_0679 (wave 14 of the overnight-orchestrator run this concept
rides on — see `docs/protocols/recipes/overnight-orchestrator-waves.md`). Concept capture, not a
build spec; the operator ratifies naming before anything client-facing ships.

## Archaeology — the original "DojoBots" idea (FOUND)

Search ran per dispatch: `graphify query "dojo bots" --budget 1200` from canonical (returned only
`robots.ts`/`robots()` lexical noise — the concept isn't a code-graph node) and
`grep -ri "dojo bots\|dojobots" docs/`, which found the original:

- **DojoBots is the BBL feature-request widget**, shipped **SESSION_0422** as part of the premium
  `/about` + `/changelog` post-launch pass:
  `apps/web/app/(web)/about/_components/feature-request-dialog.tsx`, documented at
  `docs/knowledge/wiki/files/feature-request-dialog.md` (tagged `dojobots`, lifecycle
  `MVP_LIVE`, indexed in `POST_LAUNCH_SOT.md`).
- The fiction is already client-facing: on submit, the success toast reads
  "Request received — the DojoBots are on it. 🤖" — i.e. BBL members are told a *team of bots*
  picked up their request. SESSION_0420 (Reflections) and SESSION_0423 (feature-intake ledger
  planning) reference the modal as part of the intake path.

So the seed idea — **present the agent workforce to end-users as a friendly named bot crew** —
has existed since June 2026 as a one-line toast. This concept promotes that throwaway fiction
into portfolio-level branding, and renames it for the umbrella: **Ronin** bots (RDD-owned),
with DojoBots surviving as what a BBL-branded instance of the same layer happens to be called.

## What runs underneath (the kernel)

The internal agent OS — unchanged by any of this:

- **The roster** (`.claude/agents/*`, mapped in `docs/knowledge/wiki/agent-systems-map.md`):
  Petey (planning) · Cody (build) · Doug (verification) · Giddy (adversarial review / merge
  posture) · Desi (design) · Brandon (brand/rollout) — plus **Larry (legal & licensing) and
  Iggy (social strategy), promoted at PR #301** (SESSION_0676, wave 12 of the same run).
- **The process**: recipes (lane / orchestrator / overnight waves / review wave / merge wave),
  worktree-per-lane isolation, the operator gate (branches + PRs only; humans approve
  everything that ships).
- **The proof**: the 14-wave overnight run — ~40 autonomous lanes producing research packs,
  invoices, decks, SEO foundations, OG images, specs, and watchdogs across three brands in one
  night, all held for human review.

Internal names stay internal engineering vocabulary. Nothing in the kernel renames.

## What a client sees (the brand skin)

Each client brand gets a **bot family** named for it — same engine, custom presentation:

| Client / brand | Bot family | Example client-visible framing |
| --- | --- | --- |
| Mammoth (Ronin Building Design) | **Ronin Building bots** | "Your Building bots drafted 3 review-request emails — approve to send." |
| A plumbing client (Ronin Plumbing Design) | **Ronin Plumbing bots** | same engine, plumbing-branded |
| BBL (in-house) | **DojoBots** (already live) | "Request received — the DojoBots are on it." |
| RDD itself (/process, proposals) | **Ronin bots** (the umbrella name) | the cast of the agency's own process story |

The family name mirrors the ratified niche-brand scheme (memory `rdd-niche-brand-variants`:
Ronin *Niche* Design; the wave-8 handle audit, PR #291, recommends the full `ronin<niche>design`
form for handles). Role names shown to clients are **function-named, not persona-named** by
default — e.g. "the planner bot / the builder bot / the reviewer bot / the design bot" — so the
skin never depends on internal persona churn. Whether persona names (a client-facing "Iggy")
ever surface is an open fork below.

**The mapping law (kernel → brand → app for agents):**

| Layer | Agents equivalent |
| --- | --- |
| Kernel | the roster + recipes + orchestrator (one engine, brand-agnostic) |
| Brand | the bot family name + voice ("Ronin Building bots") |
| App/instance | how a given client's surfaces present them (widget copy, /process cast, report bylines) |

A client never sees the kernel; the kernel never forks per client. That's the same moat argument
as ADR 0051 — custom names are a skin, not a fork.

## How this feeds the /process page

Parallel lane **SESSION_0680** (this same wave) is building the RDD **/process page** — the
public explanation of how RDD works. Ronin bots is that page's cast: instead of exposing
internal jargon (orchestrator, lanes, worktrees, PR gates), the page can narrate
"your Ronin bots" doing the recognizable stages — a planner bot scopes, builder bots work in
parallel overnight, reviewer bots check everything, **a human approves everything that ships**.
The overnight-orchestrator recipe is the true story underneath; the bots layer is how it's told
without teaching clients git. Coordination note for 0680: this doc is the naming source; the
/process page should not mint its own competing bot vocabulary.

## Trademark / voice cautions

- **"Ronin" is a crowded mark.** The wave-8 handle audit (PR #291) already flagged USPTO
  87300933 as needing a human look for the niche-brand names; "Ronin bots" inherits that check.
  Larry-lane review + attorney pass before the name appears in contracts or paid marketing.
- **Never oversell autonomy.** Client-facing copy must keep the approval-gate truth visible —
  bots draft/build/propose; the operator (a human) approves and ships. This is both honest and
  the actual system (the operator-gate law in the recipe card). Overselling "AI runs your
  business" is a liability Larry's own definition warns about.
- **Voice ownership:** Brandon owns the bot-family voice per brand; Larry reviews
  compliance-sensitive bot copy (consent, TCPA-adjacent SMS contexts, "not legal advice"
  framings). Same division as the human-facing brand work.
- **Don't imply personhood in billing or records** — see the invoice fork below; a bot name must
  never read as a human employee to a client's bookkeeper (relevant to the QuickBooks handoff
  lane, SESSION_0672).

## Open forks (operator decisions — none resolved here)

1. **Per-client custom names vs fixed family names.** Fixed `Ronin <Niche> bots` everywhere
   (consistent, trademark-checkable once) vs letting a client name their own crew ("Mammoth
   bots") as a premium personalization. Recommendation lean: fixed family names as default,
   custom naming as an upsell — but unratified.
2. **Bot names in deliverables/invoices.** Do deliverables carry bot attribution ("Drafted by
   the Building bots · approved by Brian") or stay firm-voiced (RDD letterhead only)? Invoices:
   line-item bot labor distinctly, or keep hours undifferentiated? (Touches the RDD_Client_Invoice
   template from PR #298 and the feature-intake→billing pipeline spec, SESSION_0675.)
3. **Persona-name surfacing.** Do internal personas (Iggy, Larry…) ever appear client-facing, or
   is the skin strictly function-named? (Persona names are process vocabulary today —
   SESSION_0420 explicitly kept them out of the domain language.)
4. **DojoBots convergence.** Rename BBL's DojoBots to align with the Ronin-bots scheme, or keep
   it as the proof that per-brand bot naming already works? (Keeping it is itself the argument
   for the layer.)
5. **Where the layer lives technically** — copy-only (strings per brand app) vs a small kernel
   module (bot-family config: names, avatars, voice rules) consumable by any app's widgets,
   /process-style pages, and notification copy. No build implied until a second consumer exists.

## Sources

- `docs/knowledge/wiki/files/feature-request-dialog.md` (the original DojoBots, SESSION_0422)
- `docs/sprints/SESSION_0420.md` · `docs/sprints/SESSION_0423.md` · `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` (DojoBots references)
- `docs/knowledge/wiki/agent-systems-map.md` (the internal roster) · PR #301 / SESSION_0676 (Larry + Iggy)
- ADR 0051 (`kernel → brand → app`) · memory `rdd-niche-brand-variants` · PR #291 (handle audit + USPTO flag)
- `docs/protocols/recipes/overnight-orchestrator-waves.md` (the engine being productized)
