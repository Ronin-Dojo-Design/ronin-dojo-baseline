---
title: "SESSION 0715 — rdd-monorepo bootstrap + PL-032 B (live cross-repo portfolio SotD)"
slug: session-0715
type: session--staged
status: staged
created: 2026-07-27
updated: 2026-07-27
last_agent: claude-session-0714
sprint: S13
lane: rdd
recipe: "epic-plan"
goal_ids: [G-023]
pairs_with:
  - docs/sprints/SESSION_0714.md
  - docs/sprints/plans/petey-plan-0712-sotd-usefulness.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0715 — rdd-monorepo bootstrap + PL-032 session B

> **Staged by SESSION_0714** (operator-elected next lane). Adopt: flip `status:` → `in-progress`.
> Runs in **`~/dev/rdd-monorepo`** (ADR 0059: session = one repo) — NOT this checkout; this repo's
> copy of the stub exists for backlog visibility only.

## Goal

Bootstrap rdd-monorepo (clone-only, no trim — upstream-of-record) and run **PL-032 session B**: make
the **portfolio State-of-Dojo live across all repos**. SESSION_0714 built the SotD renderer in BBL as
the brand-local view; the portfolio version aggregates every sibling's status via the GitHub-API
fetch pattern (SESSION_0712 grill: "SotD home = rdd-mono + per-brand; cross-repo via GitHub-API").
This is the fix for the staleness the operator caught at 0714 (BBL's Fan-out can't see the Mammoth
trim that ran in the MMB repo).

## First task

1. Clone/bootstrap `~/dev/rdd-monorepo`; set the **weekly RDD sync day** (unset since 0712).
2. Cherry-pick SESSION_0714's SotD renderer up: `a9530dc0` (vocab.ts substrate + unification) +
   `eb2cb782` (6-tab board + fork-fanout.yml/sotd-landed.yml data).
3. Scope + build the cross-repo fetch: read each sibling repo's `docs/sprints/*` frontmatter +
   `goals-ledger.md` via `gh api`, so the Fan-out/portfolio sections reflect live per-repo status
   (Mammoth trim, sibling trims) with no hand-editing.

## Queued behind / alongside (BBL cleanup lane — can run in BBL)

`loadEpics` complexity extract (CRAP 306, `scripts/state-of-project.ts:264`) · `BELT_WORD` delete
(zero-consumer) · SotD script deploy-scope-gate decision · WEKAF app-residue (seeds/public/config
baseline-vestige) · Desi 3 LOW + Doug 2 P3 (landedPanel guard symmetry). Plus: **MMB Mammoth trim**
(2026-08-05 cutover — runs in mammoth-metal-buildings; verify SESSION_0713 status there).

## Next session

### Goal

### First task
