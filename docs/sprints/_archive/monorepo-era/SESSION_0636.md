---
title: "SESSION 0636 — auto-codex WL-P3-58 dead-token fixes + stale-WL sweep (overnight auto lane)"
slug: session-0636
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: codex-session-0636
sprint: S12
lane: repo
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0636 — auto-codex WL-P3-58 dead-token fixes + stale-WL sweep (overnight auto lane)

> Staged by the SESSION_0635 overnight orchestrator (operator-approved 5-lane dispatch). Adopt at lane
> start: flip `status:` → `in-progress`, set `last_agent:` to `<driver>-session-0636`. The dispatch
> payload is the lane prompt; its HARD RULES are binding. Branch: `auto/session-0636-wl-tokens`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-codex WL-P3-58 dead-token fixes + stale-WL sweep — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Petey plan

1. Verify the SESSION_0581 precedent and each named source site before editing.
2. Replace only surviving invalid `hsl(var(--X))` usages with the matching `var(--color-X)` token.
3. Run the read-only WL top-51 sweep and propose evidence-backed stale-row corrections here.
4. Format, run the three required gates, record real exit codes, and commit locally without pushing.

Parallelism assessment: one coherent token-correction lane with overlapping verification; no disjoint
candidate warrants fan-out. The operator's overnight dispatch supersedes SESSION_0634's unrelated CRM
planning handoff.

Pre-flight: waived by Petey — this is a pinned, three-site token-expression correction; it creates no
component, schema, backend path, accessible name, or user-visible string.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0636_TASK_01 | landed | Fixed all four WL-P3-58 dead-token declarations across the three named files and completed the read-only WL top-51 stale-row sweep. |

## What landed

- Replaced every named surviving `hsl(var(--X))` declaration with the matching complete-color token:
  `var(--color-border)` in the belt preview and both data-table shadows, and `var(--color-muted)` in the
  lineage canvas gradient.
- Verified the source sites were still unfixed before editing and matched the SESSION_0581 AUD2-8
  precedent (`05a9fa75`).
- Reviewed all 51 rows returned by the read-only WL backlog sweep and identified five genuinely stale open
  rows whose fix cells already claim Fixed/Resolved.
- No accessible name, `aria-*` value, test id, or user-visible string changed.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/uploader/belt-preview.tsx` | Corrected the neutral fallback ring shadow to consume `var(--color-border)`. |
| `apps/web/components/web/lineage/lineage-tree-canvas/index.tsx` | Corrected only the named muted radial-gradient declaration to consume `var(--color-muted)`. |
| `apps/web/lib/data-table.ts` | Corrected both pinned-column inset shadows to consume `var(--color-border)`. |
| `docs/sprints/SESSION_0636.md` | Adopted and closed the session; recorded implementation, sweep, verification, review, and AM residual. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `cd apps/web && bunx oxfmt components/web/uploader/belt-preview.tsx components/web/lineage/lineage-tree-canvas/index.tsx lib/data-table.ts` | **exit 0** — tail: `Finished in 65ms on 3 files using 8 threads.` |
| `bun scripts/ledger-backlog.ts --ledger=WL --top=51` | **exit 0** — tail: `By ledger: ... WL 51 ...` / `Bow-in: bundle 3-5 coherent items`. All 51 returned rows were checked against their full ledger rows. |
| `bun run typecheck` (worktree root) | **exit 0** — tail: `baseline typecheck: Exited with code 0` / `@ronin-dojo/web typecheck: Exited with code 0`. |
| `cd apps/web && bun run lint:check` | **exit 0** — tail: `app/app/tournaments/rule-sets/_components/tournament-rule-set-form.tsx...` warnings only; no errors and no warning points to a changed line. |
| `cd apps/web && bun run format:check` | **exit 0** — tail: `All matched files use the correct format.` / `Finished in 724ms on 2035 files using 8 threads.` |
| `cd apps/web && npx fallow audit --changed-since HEAD --gate new-only --max-crap 30` | **exit 0** — tail: `No issues in 3 changed files` / `audit gate excluded 5 inherited findings`. |
| `cd apps/web && npx fallow health` | **exit 1 (inherited repo health, non-lane gate)** — headline: `Health score: 79 B`; maintainability `89.8 (good)`. No introduced finding was attributed to this four-expression diff. |

## Proposed ledger edits

<!-- Lanes NEVER edit shared ledgers. Every WL/G/D/FS change you would have made goes here as a row;
the attended AM merge applies them once. -->

1. **WL-P3-58 → ✅ RESOLVED (SESSION_0636).** Evidence: the four named declarations now use
   `var(--color-border)` / `var(--color-muted)` in `belt-preview.tsx:26`,
   `lineage-tree-canvas/index.tsx:169`, and `data-table.ts:22,24`; typecheck, lint-check, format-check, and
   changed-diff fallow gate exit 0. Keep the computed-style visual proof as the AM residual below.
2. **WL-P2-14 → parser-facing closed.** Evidence: `wiring-ledger.md:92` fix cell begins
   `✅ Fixed (SESSION_0434)` and records the public cover render plus browser verification.
3. **WL-P2-35 → parser-facing closed.** Evidence: `wiring-ledger.md:114` fix cell says
   `✅ Resolved (SESSION_0515, MERGED #200)`; separately scoped follow-ups remain separate work.
4. **WL-P2-37 → parser-facing closed.** Evidence: `wiring-ledger.md:116` fix cell says
   `✅ Resolved (SESSION_0515, MERGED #200)`; its leaf-tree follow-up is already WL-P2-38.
5. **WL-P2-58 → parser-facing closed.** Evidence: `wiring-ledger.md:137` fix cell says
   `✅ RESOLVED SESSION_0533`.
6. **WL-P2-78 → parser-facing closed.** Evidence: `wiring-ledger.md:164` fix cell says
   `✅ RESOLVED (SESSION_0620) — Gate 12d built`.

Sweep note: WL-P2-10 and WL-P2-21 contain resolved sub-slices but are not stale-open parser mistakes.
WL-P2-10 still defers sidebar/markdownlint complexity; WL-P2-21 explicitly retains admin branch/subtree CRUD
and chrome. No shared ledger was edited.

## Open decisions / blockers

None for the lane. Changes are committed locally and intentionally not pushed; the orchestrator owns push
and AM merge.

## Residual for AM merge

- Run a computed-style visual probe on each affected surface (belt-preview fallback ring, lineage muted
  radial gradient, and both left/right pinned data-table shadows). Class presence is not behavior.
- No browser or dev server was started tonight, per dispatch.

## Review log

- **Doug:** GO on SESSION_0636_TASK_01; no P1/P2/P3 findings. Confirmed each full-color token is defined and
  the lineage file changed only the requested declaration.
- **Desi:** GO on SESSION_0636_TASK_01; no P1/P2/P3 findings. Confirmed semantic-token fit and the existing
  arbitrary-gradient convention.
- **Giddy Gate Review:** Class A/B token-consumption correction. D1 9, D2 10, D3 10, D4 10, D5 10, D6 10,
  D7 10 → weighted 9.8; no-runtime-proof cap 9.4 → **Composite 9.4/10 — CLEARS**. Fallow changed-diff gate:
  zero introduced issues; five inherited findings excluded. Only follow-up is the already-dispatched AM
  computed-style probe.

## ADR / ubiquitous-language check

No architectural decision or domain term changed; no ADR or glossary update needed.

## Artifacts

None. The live zero-token State-of-Dojo remains `/app/state`; no frozen snapshot was published for this
no-browser overnight lane.

## Reflections

The backlog parser can surface rows as open even when a fix cell carries a resolved marker. A resolved
sub-slice is not enough to close a row: WL-P2-10 and WL-P2-21 both contain explicit remaining work, so the
sweep must read the full fix cell rather than key only on `✅` or `RESOLVED`.
