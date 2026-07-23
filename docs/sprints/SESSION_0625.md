---
title: "SESSION 0625 — MMB Meeting Intake (Michael's notes → grilled, routed)"
slug: session-0625
type: session--plan
status: staged
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0620
sprint: S12
lane: mmb
recipe: "Client_Meeting_Intake"
goal_ids: ["G-021"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0620.md
  - docs/sprints/SESSION_0624.md
  - docs/protocols/recipes/Client_Meeting_Intake.md
  - docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0625 — MMB Meeting Intake

> **Pre-staged stub (ADR 0049), staged by SESSION_0620.** **Parallel pair** with
> [SESSION_0624](SESSION_0624.md) (AM merge) — run in separate worktrees/lanes. First run of the newly
> synthesized [Client_Meeting_Intake](../protocols/recipes/Client_Meeting_Intake.md) recipe, applied to the
> Mammoth (MMB) instance. Lane facet `mmb` — consider the `/game-on` MMB overlay + MC-grill.

## Operator

Brian + <agent>-session-0625

## Goal

Absorb the **Michael Flores meeting notes** into MMB canon: grill → synthesize (brand heartbeat, pains,
commercial lanes, next actions) → **route to ledgers/PRD/STORIES/goals**, not prose. Follows the
`MMB_Initial_Intake` → `MMB_Meeting_Intake` line and the recent codex "Michael notes" capture.

## Next session

**Task — run the [Client_Meeting_Intake](../protocols/recipes/Client_Meeting_Intake.md) recipe on MMB.**

1. **Adopt the capture:** [`docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md`](../product/mammoth-build/assets/Michaels_Notes_Meeting.md)
   (`status: captured-needs-grill`, `contains_real_data: false`). Confirm demo-safe.
2. **Grill (MC-grill + goal election):** resolve every ambiguous branch — what Michael wants the sales
   cockpit to *answer / do / feel*. Name the product north-star (already drafted in the notes: "know every
   prospect personally, make the next action effortless, carry every building opportunity through delivery")
   and elect goal #1. Flip the note `status` → `grilled`.
3. **Synthesize:** brand heartbeat + soul-of-sales (Brandon), ranked pains-worth-fixing-first, commercial
   lanes (steel supply / erection-install / concrete-excavation / building-only vs building+install), and
   the explicit next actions.
4. **Route to canon (the point):** MMB `PRD.md` / `STORIES.md` (`## Solution` sections), the goals ledger /
   vault LLL (elect G-021 sub-goals), planning/feature-intake rows for discrete slices, ADRs for decisions.
   One row per item; ledger is the single home (finding-router). Respect the authority split — monorepo owns
   specs, MMB DB owns records, vault owns live ops.
5. **Stage the follow-on** build lane off the routed backlog if ready.

**Done means:** notes `grilled` + demo-safe; every material ask a routed PRD/STORIES/goal/PL row with an id +
done-means; north-star + goal #1 elected; follow-on staged or intake explicitly closed. (Recipe `## Done means`.)

## Task log

<!-- filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
