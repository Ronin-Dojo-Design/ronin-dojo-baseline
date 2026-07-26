---
title: "SESSION 0424 — Post-Launch SOT + feature-widget file-spec + MVP_LIVE lifecycle field"
slug: session-0424
type: session--open
status: closed
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0424
sprint: S-foundation
pairs_with:
  - docs/sprints/SESSION_0423.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0424 — Post-Launch SOT + feature-widget file-spec + MVP_LIVE lifecycle field

## Date

2026-06-20

## Operator

Brian + claude-session-0424

## Goal

Stand up the post-launch operating layer the operator asked for: a single light P0/P1/P2
source-of-truth, a file-spec for the feature-request widget (behavior + wiring), and a yaml
lifecycle convention (`MVP_LIVE`) that consolidates feature status as a frontmatter pointer.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest: `docs/sprints/SESSION_0423.md` (closed) + memory pickup.
- Carryover: 0423 created `feature-intake-ledger.md`; this session supersedes it with the
  single Post-Launch SOT (operator decision — one list, not two).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `8bd864b9`

### Graphify check

- Graph current; used `graphify query "feature request widget modal"` → found
  `feature-request-dialog.tsx` (the widget) → verified directly.

## Petey plan

### Goal

Create POST_LAUNCH_SOT + feature-request-dialog file-spec + the `lifecycle:` convention;
supersede the intake ledger; register + lint.

### Tasks

#### SESSION_0424_TASK_01 — Post-Launch SOT

- **Agent:** Petey/Cody
- **What:** `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` — single light P0/P1/P2 running
  list + Now-live (MVP_LIVE) + Inbox + the `lifecycle:` convention.
- **Done means:** SOT created, seeded with real items (petey-plan-0419), index-registered.

#### SESSION_0424_TASK_02 — Feature-widget file-spec + lifecycle field

- **Agent:** Cody
- **What:** `docs/knowledge/wiki/files/feature-request-dialog.md` (type: file, `lifecycle: MVP_LIVE`,
  wiring block: about → dialog → reportFeedback → Report/Feedback).
- **Done means:** spec created (the template for future feature specs), index-registered.

#### SESSION_0424_TASK_03 — Supersede the intake ledger

- **Agent:** Giddy
- **What:** `feature-intake-ledger.md` → thin redirect (status: superseded, superseded_by SOT).
- **Done means:** ledger superseded; index row updated.

### Open decisions

- None — operator confirmed SOT-absorbs-ledger + build-now.

### Scope guard

- No prod writes, no emails, do not flip `BBL_COUNTDOWN`. Commit local; push on operator go.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0424_TASK_01 | landed | POST_LAUNCH_SOT.md created + registered |
| SESSION_0424_TASK_02 | landed | feature-request-dialog.md file-spec + `lifecycle: MVP_LIVE` |
| SESSION_0424_TASK_03 | landed | feature-intake-ledger superseded → SOT |

## What landed

- **POST_LAUNCH_SOT.md** — single light post-launch SOT: P0/P1/P2 running list (seeded from
  petey-plan-0419), Now-live (MVP_LIVE) table, widget→`Report`(Feedback) inbox pointer, and
  the `lifecycle:` yaml convention (`planned|building|MVP_LIVE|ga|dropped`).
- **feature-request-dialog.md** — first feature file-spec (behavior + `wiring:` + `lifecycle: MVP_LIVE`),
  the template for future feature specs.
- **feature-intake-ledger.md** — superseded (one day old) → points to the SOT; no competing list.
- The `lifecycle:` field is the consolidation pointer: `grep -rl '^lifecycle: MVP_LIVE' docs/knowledge/wiki/files/`
  aggregates what's live; the SOT links the specs (status not duplicated).

## Open decisions / blockers

- Push held at G4 pending operator go (explicit-push rule).

## Next session

### Goal

Run the live maintenance loop: triage real widget Feedback into the SOT, ship a P0/P1 item,
mark its file-spec `MVP_LIVE`.

### First task

Read inbound `Report`(Feedback) rows, promote real ones into POST_LAUNCH_SOT (`FI-NNN`), or
pick the top P0 (Brian Truelson onboarding) per petey-plan-0419.

## Review log

### SESSION_0424_REVIEW_01 — post-launch SOT

- **Reviewed tasks:** TASK_01–TASK_03.
- **Verdict:** One SOT (no competing list — intake ledger superseded), grounded in the real
  widget data path (`Report`/Feedback, verified in `report.ts:62`), follows the existing
  `files/` file-spec pattern, and the `lifecycle:` field sits beside (not on top of) the
  saturated `status:` field. Seeded with real petey-plan-0419 items, not an empty shell.
- **Score:** 9.5/10.
- **Follow-up:** as more features ship, give each a `files/` spec with `lifecycle:` so the
  grep-aggregate stays complete.

## Hostile close review

- **Giddy:** pass — no duplicate truth (ledger superseded with `superseded_by`); new `type: sot`
  + `lifecycle:` fields are additive, lint-clean.
- **Doug:** pass — `bun run wiki:lint` 0 errors; wiring claims verified against source.

## ADR / ubiquitous-language check

- ADR not required. New process vocabulary: `lifecycle: MVP_LIVE` feature-status field
  (distinct from doc `status:`); documented in POST_LAUNCH_SOT.

## Reflections

- **Two lists is the trap; one SOT + a frontmatter pointer is the fix.** The day-old intake
  ledger and the requested SOT were the same intent — superseding immediately (not "keeping
  both for now") is what keeps it light.
- **The widget already had a home for requests** (`Report`/Feedback). The doc work was naming
  the data path, not building a pipeline.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter sweep | new docs full frontmatter; ledger `status: superseded` + `superseded_by` |
| Backlinks/index sweep | SOT + feature-request-dialog added to index; ledger row updated |
| Wiki lint | `bun run wiki:lint` → 0 errors |
| Hostile close review | SESSION_0424_REVIEW_01 + Giddy/Doug |
| Memory sweep | post-launch-sot pointer added |
| Git hygiene | committed; push HELD at G4 pending operator go |
| Graphify update | `graphify update .` (incremental) |
