---
title: "SESSION 0605 — PLAN: /cas /car /cac scaffold commands + component-lifecycle (WS-E)"
slug: session-0605
type: session--plan
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0604
sprint: S12
lane: repo
recipe: epic-plan
goal_ids: []
tickets: []
pairs_with:
  - docs/sprints/SESSION_0604.md
  - docs/sprints/SESSION_0603.md
  - docs/protocols/SOT_Cookbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0605 — PLAN: create-* scaffold commands + component-lifecycle (WS-E)

> **Pre-staged plan-me stub (ADR 0049), staged SESSION_0604.** This is a **`/pp` PLAN session (no build)** —
> the ambiguous half of the operator's design-tooling vision. Adopt: own worktree, ff to main, flip status.
> Do **not** build; **grill the taxonomy first** (it touches the ratified abstraction ladder). The concrete,
> pattern-conforming half already landed in SESSION_0604 (Desi-Design-Ledger + 3 design-pass recipe cards).

## Operator

Brian + <agent>-session-0605

## Goal

`/pp` Petey plan → an executable fan-out for the **operator's create-* command family + the component
lifecycle**, conformed to the abstraction ladder (run → card → skill). Capture (from the SESSION_0604
brainstorm):

**A. Three scaffold slash-commands** (aliases in parens) — each a thin skill that scaffolds an artifact of a
type that ALREADY EXISTS in the repo (so the command is a *generator*, not a new abstraction):

- **`/create-a-sequence` (`/cas`)** → scaffold a new `seq-*` sequence skill (`.claude/skills/seq-*`) — the
  invariant ordered step-list. Overlaps `write-a-skill`; decide whether it's a thin wrapper or a distinct card.
- **`/create-a-recipe` (`/car`)** → scaffold a new recipe card (`docs/protocols/recipes/*.md`) + register it
  in `SOT_Cookbook.md` (the router) + the `recipe:` stub key. (SESSION_0604's 3 design cards are the worked example.)
- **`/create-a-card` (`/cac`)** → scaffold a new custom **component** + its CCC entry in
  `custom-component-inventory.md`. This is the entry point of the component lifecycle (B) — WS-E territory.

**B. The component lifecycle** (the "brainstorm → permanent" pipeline the operator described) — **= WS-E**, the
lifecycle recipe family deferred from the SESSION_0593 State-of-Dojo fan-out:

  brainstorm a design → **`/preview-artifacts`** (visual, on the SotD screen) → *if permanent* → make it a
  **skill** → the **CCC card** (`custom-component-inventory.md`) → the **recipe book** → **promote to a live
  component** → ship to **`wiring-ledger.md`** (or the right ledger).

**Pinned inputs (do NOT re-derive):**

- `/artifact-preview` already EXISTS as the **`/preview-artifacts`** skill — reuse it, don't build a new one.
- The **abstraction ladder** (`SOT_Cookbook.md` §"run → card → skill"; memory `abstraction-ladder-run-card-skill`):
  *never pre-build a card/seq-skill for unrun work.* Author the `sotd` skill + WS-E only after the flow runs 2–3×.
- **WS-E** is already scoped in the SESSION_0593 fan-out table (`recipes/component-lifecycle/{plan,design,build,review,wire}`
  + pointer lines in `epic-plan.md`/`lane.md`/`cody-preflight.md` + a SOT_Cookbook register).

## Open forks to grill (do NOT pre-resolve)

1. **Taxonomy** — how do `/cas` vs `/car` vs `/cac` differ, and how does each map onto the existing
   `seq-skill` / `recipe-card` / `CCC-component` abstractions without creating a fourth overlapping concept?
2. **Command vs skill** — are these slash-commands *skills* (`.claude/skills/*`) invoked via `/name`, or thin
   `write-a-skill` presets? (`write-a-skill` already scaffolds skills — does `/cas` add value over it?)
3. **Abstraction-ladder conformance** — which of these are we authorizing to pre-build (the operator may
   override the "don't pre-build unrun" default), vs which wait until the underlying flow has run 2–3×?
4. **Lifecycle ownership** — is the component lifecycle (B) the SAME as WS-E, or a superset? Where does the
   CCC card promotion + `wiring-ledger` ship-step live (a recipe card? the `/cac` skill? both)?
5. **Design-pass tie-in** — the SESSION_0604 design passes (`desi-design-review`/`mobile`/`ui-ux`) are the
   "review" rung of a component's lifecycle — do they slot into WS-E's `review` step or stay standalone?

## First task

Adopt per ADR 0049 (own worktree, ff to main, flip status). Read: SESSION_0604 (the design passes + the
Desi-Design-Ledger), the SESSION_0603 SotD kernel + custom-component-inventory CCC entry, `SOT_Cookbook.md`'s
abstraction-ladder section, the SESSION_0593 WS-E scope, and `write-a-skill`/`preview-artifacts` skills. Then
grill the 5 forks before proposing any file.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0605_TASK_01 | pending | Grill the 5 forks → resolve the create-* taxonomy vs existing abstractions |
| SESSION_0605_TASK_02 | pending | Scope WS-E (component lifecycle) + where the CCC-promote / wiring-ledger ship-step lives |
| SESSION_0605_TASK_03 | pending | Executable fan-out + staged build stub(s) per the abstraction-ladder verdict |

## Next session

### Goal

### First task
