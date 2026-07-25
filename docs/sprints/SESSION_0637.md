---
title: "SESSION 0637 — auto-codex technique-graph Wave-2 (C5 glow, D3 empty/reset, B2 tooltips) (overnight auto lane)"
slug: session-0637
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: codex-session-0637
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0637 — auto-codex technique-graph Wave-2 (C5 glow, D3 empty/reset, B2 tooltips) (overnight auto lane)

> Staged by the SESSION_0635 overnight orchestrator (operator-approved 5-lane dispatch). Adopt at lane
> start: flip `status:` → `in-progress`, set `last_agent:` to `<driver>-session-0637`. The dispatch
> payload is the lane prompt; its HARD RULES are binding. Branch: `auto/session-0637-graph-wave2`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-codex technique-graph Wave-2 (C5 glow, D3 empty/reset, B2 tooltips) — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Bow-in

- Adopted the staged stub and set `last_agent: codex-session-0637`.
- Branch/worktree verified: `auto/session-0637-graph-wave2` in
  `/Users/brianscott/dev/ronin-0637`; initial status contained only this untracked staged session
  file.
- `scripts/canonical-claim.sh check --session 0637`: canonical free.
- `scripts/githooks/doctor.sh`: passed with one warning (`gh` unauthenticated, so the server
  ruleset could not be verified).
- Graphify returned 0 nodes / 0 edges in this fresh worktree. Per the runbook, this was treated as
  "graph unavailable", never as evidence of absence. The dispatch's worktree-only rule prohibited
  querying the canonical checkout.
- `ledger-backlog.ts --top=10` confirmed G-013 and G-022 are P1. The loop-board read was unavailable
  because the local DB was unreachable; the operator-pinned lane remained authoritative.
- Parallel-lane assessment: already dispatched as one owned-file lane; no further fan-out.

## Cody pre-flight: existing technique graph Wave-2 implementation

### 1. Existing component scan

- Scoped source inspection found the complete C5, D3, and B2 implementation already present in
  `components/web/techniques/technique-graph.tsx`.
- Existing shared primitives are consumed in place: `EmptyList`, `Card`, `Button`, `Badge`, and
  `Tooltip` (`TooltipProvider`, `TooltipTrigger`, `TooltipContent`). No shared primitive edit was
  needed or made.

### 2. L1 template / primitive scan

- No new component was planned or created.
- Current composition already uses the repo's established common primitives. Shared primitive
  sources were read-only under this lane's ownership contract.

### 3. Composition decision

- Extend the existing `TechniqueGraph` only if a real gap exists. Recon proved no gap: the three
  dispatched items had already landed and were subsequently refined.

### 4. Lane docs loaded

- Read in the required order: goals-ledger G-013 + G-022 (read-only), SESSION_0546,
  SESSION_0569, and SESSION_0581.
- SESSION_0583 and git provenance were then inspected only after current source revealed the prior
  S2 implementation.

### 5. Dev environment / permitted verification

- Dependencies were present.
- Dispatch forbade dev-server, Playwright, build, full-suite, and DB-backed verification.
- Planned static gates were the dispatch's exact commands; execution stopped after the first gate
  exposed a hard-rule conflict (recorded below).

### 6. Prior failures / mitigations

- FS-0020: Graphify-first was attempted before scoped source search; its empty worktree graph was
  not treated as a negative.
- D-054 identifies the graph island's complexity debt; this lane did not broaden into the
  out-of-scope refactor.
- Locked-media invariant: no graph DTO, query, media gate, URL, poster, or media ID path was changed.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0637_TASK_01 | stopped — already landed | C5 exists in `28b5fd95`; later `d633d456` ratified/refined two-stage touch selection. Current source retains keyboard-focus/hover parity, selection fallback, and CSS reduced-motion fallback. No duplicate edit made. |
| SESSION_0637_TASK_02 | stopped — already landed | D3 graph empty/reset state exists in `28b5fd95` using shared `EmptyList`, `Card`, and `Button`. The curriculum counterpart also exists but is outside this lane's ownership. No duplicate edit made. |
| SESSION_0637_TASK_03 | stopped — already landed | B2 difficulty label/definition helpers, tests, and shared-tooltip composition exist in `28b5fd95`. No DTO/media-bearing fields were added. No duplicate edit made. |

## What landed

No product change. The dispatch was stale against branch HEAD:

- `28b5fd95 feat(techniques): graph S2 — neighborhood glow, empty states, difficulty tooltips,
  WL-P2-65/66 (G-022 Lane A)` is contained by this branch and `main`.
- `d633d456` subsequently refined C5 with the ratified two-stage touch interaction.
- G-022's current progress row already records Lane A S2 as done.

Re-implementing the items would duplicate shipped work or reopen a prior interaction decision,
contrary to the dispatch's "implement, don't redesign" rule and the autonomous escalation valve.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0637.md` | Adopted the staged record; documented the stale dispatch, provenance, gate violation, and AM residual. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun run typecheck` | **EXIT 0.** Tail: `baseline typecheck: ✔ Generated Prisma Client (7.8.0) to ./.generated/prisma in 265ms`; `@ronin-dojo/web typecheck: ✓ Types generated successfully`; `baseline typecheck: Exited with code 0`; `@ronin-dojo/web typecheck: Exited with code 0`. **Hard-rule conflict:** the required root gate transitively ran `prisma generate` through the `baseline` workspace script. Per the dispatch ("NEVER run prisma generate"; violation = stop and record), no further gates were run. |
| Git provenance | `git branch --contains 28b5fd95` includes `auto/session-0637-graph-wave2` and `main`; `git show --stat 28b5fd95` names the three dispatched features and their tests/surfaces. |

## Proposed ledger edits

<!-- Lanes NEVER edit shared ledgers. Every WL/G/D/FS change you would have made goes here as a row;
the attended AM merge applies them once. -->

None. G-022 already records Lane A S2 (C5/D3/B2) as done. The AM orchestrator should drop this
duplicate lane rather than change the ledger.

## Open decisions / blockers

- **STALE DISPATCH:** all three mission items were already on `main` before this branch was staged.
  No safe, non-duplicative product delta exists inside the pinned scope.
- **HARD-RULE STOP:** the required `bun run typecheck` gate transitively invoked
  `prisma generate` in the `baseline` workspace. The command completed with exit 0, but the
  dispatch defines any Prisma-generate invocation as a stop-and-record violation. Therefore
  `lint:check`, `format:check`, and the focused pure-module test were not run.
- No product files were staged or committed. No push, PR, merge, deploy, DB-backed test, build,
  dev server, or e2e command was run.

## Residual for AM merge

Do not merge a duplicate feature commit; there is none. Review this session-record-only stop and
retire the lane. If the AM Desi/Doug sweep still wants visual confirmation of the already-landed
behavior, probe these exact states:

- `/techniques/graph`: hover and keyboard-focus a node; verify only its 1-hop neighbor nodes and
  connecting edges glow, with no transition under reduced motion.
- `/techniques/graph` on touch: first tap selects/reveals the neighborhood; second tap opens the
  node dialog; closing clears selection.
- Graph type filter with a synthetic zero-match fixture: verify the `EmptyList` overlay and
  "Show all techniques" reset restore the full graph.
- Node dialog difficulty badge: hover and keyboard-focus each Beginner / Intermediate / Advanced /
  Expert badge and verify the shared tooltip definition appears.
- Locked technique payload inspection: re-confirm no URL, poster, media ID, or other media-bearing
  data reaches the client for locked techniques.
