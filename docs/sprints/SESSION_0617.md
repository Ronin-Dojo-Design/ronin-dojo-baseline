---
title: "SESSION 0617 — RISK #2: flip CSP_ENFORCE to enforcing"
slug: session-0617
type: session--implement
status: staged
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0614
sprint: S12
lane: repo
recipe: ""
goal_ids: []
tickets: ["RISK #2"]
pairs_with:
  - docs/sprints/SESSION_0614.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0617 — RISK #2: flip CSP_ENFORCE to enforcing

> **Pre-staged stub (ADR 0049), staged 2026-07-22 by SESSION_0614 bow-out.** Adopt at bow-in: flip
> `staged` → `in-progress`, run the FS-0035 canonical-occupancy check, then execute the task below.

## Operator

Brian + <agent>-session-0617

## Goal

Close **RISK #2** (top open P0). Per the `risk2-csp-status-and-nonce-flip` memory the CSP headers +
Report-Only mode + report-sink + script-nonce are already shipped — **only the `CSP_ENFORCE` flip (and a
report-review pass) remains.** Do NOT re-build the headers.

## Next session

**First task:** review the CSP violation-report sink for outstanding report volume / legit-surface
violations. If clean, flip `CSP_ENFORCE` to enforcing and verify no real surface breaks. This is an
**app-code deploy** — run `cd apps/web && bun run build` + the affected e2e before the push gate; hold
for the operator's go.

Inputs to read: the `risk2-csp-status-and-nonce-flip` memory + the CSP header/report-sink source it names.

## Task log

<!-- SESSION_0617_TASK_01 … filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
