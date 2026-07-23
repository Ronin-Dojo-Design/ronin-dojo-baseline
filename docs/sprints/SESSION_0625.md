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

## First tasks (game-on for Michael — operator-directed, run these first)

Run via **`/game-on`** (the MMB lean overlay). These pull up live so the operator can work *with* Michael:

1. **SotD artifacts preview — ALL BRANDS (show Michael builds on the spot).** Render + publish a frozen
   State-of-Dojo Artifact **with `NEXT_PUBLIC_SOTD_ALL_BRANDS=true`** so the **MMB panel is visible** (the live
   `/app/state` is BBL-scoped and *hides* MMB — see the note below). Republish after any on-the-spot build so
   Michael sees the MMB work land in real time. Use `/preview-artifacts`.
   ```bash
   NEXT_PUBLIC_SOTD_ALL_BRANDS=true bun scripts/state-of-project.ts   # → out/state-of-project.html (MMB shown)
   ```
2. **Review the client onboarding form + contract** (recently added): the new-client onboarding process
   ([`research-review-new-client-onboarding.md`](../architecture/research-review-new-client-onboarding.md) +
   [`new-client-runbook.md`](../runbooks/onboarding/new-client-runbook.md)), the onboarding components
   (`apps/web/components/web/onboarding/dashboard-onboarding.tsx`), and the contract model
   (`apps/web/.generated/prisma/models/MembershipContract.ts`). Confirm with the operator which of these is
   "the" client onboarding form + contract to walk Michael through.
3. **Build the onboarding form as an interactive, live-fillable form** — **FeatureWidget-style**
   (`apps/web/components/web/feature-widget.tsx` is the pattern) so the operator can **type Michael's answers
   in live, or Michael can write them in himself**. This IS the interactive *capture* front-end for the
   [Client_Meeting_Intake](../protocols/recipes/Client_Meeting_Intake.md) recipe — its output feeds the grill
   → synthesize → route flow below. Demo-safe (no secrets/PII); reuse the uploader/R2 seam if it takes files.

> **SotD ↔ MMB wiring note (operator caught this — real gap, SESSION_0620).** The MMB tab **is** correctly
> wired (parser `classifySessionProduct` maps `lane: mmb` → the MMB panel). It reads **empty** because the
> SotD projects only `docs/sprints/*` + `goals-ledger`, and **only 3 sprint sessions are MMB** (0582, 0586,
> this 0625). The real MMB work — sales-cockpit build, Michael's meeting, MMB epic — lives in the **Mammoth
> vault (`MMB_SESSION_NNNN`) + `docs/product/mammoth-build/`**, which the SotD **does not read**. Plus recipe
> cards + product artifacts (onboarding form, contract) aren't projected at all. **Logged as WL-P2-80.**
> **To make MMB show for Michael:** either project the MMB vault / `docs/product/mammoth-build/` + MMB goals
> into the SotD (the real fix), or, short-term, keep MMB sessions as `lane: mmb` stubs in `docs/sprints/` (like
> 0625) so they at least populate the planned column. Task 1 still uses `ALL_BRANDS=true` to guarantee the tab
> renders.

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
