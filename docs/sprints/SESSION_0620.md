---
title: "SESSION 0620 — Desi design review + Petey/Giddy /rr on surfaces + ledger/ritual effectiveness"
slug: session-0620
type: session--review
status: staged
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0619
sprint: S12
lane: repo
recipe: ""
goal_ids: ["G-023", "G-026", "G-031"]
tickets: ["WL-P2-71", "WL-P2-73", "WL-P2-74"]
pairs_with:
  - docs/sprints/SESSION_0619.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0620 — Desi design review + `/rr` on surfaces + ledger/ritual effectiveness

> **Pre-staged stub (ADR 0049), staged 2026-07-22 by SESSION_0619.** Adopt at bow-in: flip
> `staged` → `in-progress`, run the FS-0035 canonical-occupancy check, ask the step-6b bow-in
> questions, then execute. Review/research lane — no code lands unless the `/rr` says build a tiny slice.

## Operator

Brian + <agent>-session-0620

## Goal

Two research/review threads the operator queued (SESSION_0619): a **Desi-led design pass** on the `/app`
surfaces, and a **Petey + Giddy `/rr`** on how to make the screens AND the tickets/lanes/ledgers/rituals work
more effectively and token-efficiently. Recommend, don't build (except a tiny proven slice).

## Next session

**Thread 1 — Desi design review (`/hallmark` + `/grill`):** run `/hallmark` audit + `/grill-me` /
`/grill-with-docs` (Desi-led) on the `/app` admin screens. Anchor on the operator's dogfood tickets:
**PL-020** (SotD belt-ladder → action words + order + inverted white/black), **PL-021** (admin app-shell
nav: no back button, no nav/footer shell), **PL-023** (mobile input zoom + FeatureWidget img preview).
Return a prioritized fix list for Cody — do not write production code in this lane.

**Thread 2 — Petey + Giddy `/rr` (research-recommend, don't build):**
1. **Wire the rituals (WL-P2-74):** `/ggr` into `closing.md` §6.5 + the bow-out skill body (absorb/replace the
   old `hostile-close-review` call so the ADR 0052 gate policy actually fires); point `opening.md` step 4 at
   `/pp`·`/ppp`; add a `bow-out-gates` check that a `/ggr` score exists for a code session; surface NEW
   `PlanningIntake` count at bow-in (WL-P2-72).
2. **Wiring-net automation (WL-P2-73):** design the built-not-wired orphan-detector (graph in-degree /
   convention check e.g. "every `state-of-dojo/*-panel.tsx` imported by `attention-panels.tsx`") as a
   `bow-out-gates` gate that routes to WL. Reuse `deferral-guard.ts` + finding-router §6.7.
3. **Wayfinder (WL-P2-71):** live State-of-Dojo Wayfinder panel (self-fetch `gh` `wayfinder:map`) vs. a
   persistent link card — recommend.
4. **Token-efficiency lens:** where the ledgers/rituals cost tokens without proportional effectiveness, propose
   the lighter mechanism (the operator's standing efficiency ask).

Inputs: `docs/rituals/{opening,closing}.md` · `.claude/skills/{bow-in,bow-out,ggr,pp,ppp}/SKILL.md` ·
`scripts/bow-out-gates.sh` · `scripts/deferral-guard.ts` · [WL-P2-71/73/74](../knowledge/wiki/wiring-ledger.md) ·
[PL-020…023](../knowledge/wiki/planning-ledger.md) · [G-031 S5](../knowledge/wiki/goals-ledger.md).

**Then:** fold the `/rr` recommendations into G-031 **S5** (ritual rework, own Build+QAR) → S4 (facet migration).

## Task log

<!-- SESSION_0620_TASK_01 … filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
