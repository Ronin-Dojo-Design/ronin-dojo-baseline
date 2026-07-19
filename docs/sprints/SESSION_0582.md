---
title: "SESSION 0582 — CRM tracer loop 2/3: import commit behind explicit confirm (slice a)"
slug: session-0582
type: session--open
status: staged
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0574
sprint: S12
lane: mmb
vault_session: "MMB_SESSION_0006"
goal_ids: [MMB-G-004]
tickets: []
pairs_with:

  - docs/sprints/SESSION_0574.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0582 — CRM tracer loop 2/3: import commit behind explicit confirm (slice a)

> **Pre-staged stub (ADR 0049).** Created at SESSION_0574 bow-out; the next bow-in ADOPTS this
> file: flip `status: staged` → `in-progress`, fill Date/Operator, and go — no `cp`. Number 0582
> was minted via `bun scripts/ledger-id-next.ts --prefix=SESSION` (0579–0581 are reserved
> branches for the G-022 fan-out). If the operator re-elects the lane at bow-in, retitle this
> stub — the number claim stands either way.

## Date

<YYYY-MM-DD — fill at adopt>

## Operator

Brian + <agent>-session-0582

## Goal

CRM tracer loop 2/3, slice **(a)** — elected by the operator at SESSION_0574: build the import
COMMIT path behind an explicit confirm on `/app/leads` (`clients/mammoth-build-crm`), including
the pinned preview/write-path dedupe reconciliation (`findOrCreateContact` must match the
preview's case-insensitive email + last-10-digit phone semantics — divergence note at
`lib/lead-ingest.ts:11–16`). Quote the retention law in the opening card: real lead-sheet bodies
go to Mammoth's CRM DB only — never fixtures, repo, tickets, or vault (gated-lane law,
human-code-runbook). Attempt-outcome vocabulary (G-021) is still provisional — ratify it with
the operator if this slice touches it.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

<fill at adopt — branch `session-0582-mmb-import` claims are already implied by this stub's
filename; run the mint to verify, per opening.md step 1>

## Petey plan

### Goal

<fill at adopt>

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0582_TASK_01 | pending | TBD at adopt |

## Next session

### Goal

### First task
