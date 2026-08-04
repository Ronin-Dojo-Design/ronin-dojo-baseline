---
title: "SESSION 0746 — L1: recipe-card contract block + recipe: wiki-lint check (petey-plan-0741 §B2)"
slug: session-0746
type: session--implement
status: closed
created: 2026-08-04
updated: 2026-08-04
last_agent: claude-cody-session-0746
sprint: S13
lane: repo
lane_seq:
recipe: lane
vault_session:
goal_ids: [G-031, G-023]
tickets: ["413"]
next_session:
pairs_with:

  - docs/sprints/SESSION_0744.md
  - docs/sprints/plans/petey-plan-0741-next-session-automation.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0746 — L1: recipe-card contract block + `recipe:` wiki-lint check

**Date:** 2026-08-04 · **Operator:** Brian (asleep — overnight lane) + claude-cody-session-0746

## Goal

Execute petey-plan-0741 §B2 as overnight lane L1 (SESSION_0744 fanout): additive contract-block
frontmatter (`personas` · `load_set` · `inputs` · `gates` · `output_contract`) on every
`docs/protocols/recipes/*.md` card, a `recipe:`-value resolution check in `scripts/wiki-lint.ts`,
a negative-fixture bun test, and the rule documented in `docs/protocols/llm-wiki-schema.md`.
Commit-only exit; orchestrator owns push/PR.

## Status

Frontmatter `status:` is the single source of truth.

## Bow-in

- Driver salvage: the planned Codex driver died on a 402 before starting; Claude (Cody) adopted
  the lane in the same worktree. Disk truth verified first: only untracked `lane-prompt.md`.
- Branch/worktree: `auto/session-0746-recipe-contracts` @ `/Users/brianscott/dev/ronin-0746` ·
  clean at adoption · base = origin/main @ d2a622a4
- State verified before building: 21 cards listed (matches plan count), zero carried
  `output_contract`; all live staged/in-progress SESSION `recipe:` values resolve; FS-0027
  test-writing SOP read before authoring the test file.

## Task log

| # | Task | Outcome |
| --- | --- | --- |
| 1 | Contract block on all 21 recipe cards (additive frontmatter only; `lane.md` 6-item minimum-output contract lifted as its `output_contract`) | landed — every card carries the 5 keys, derived from its own body; no existing keys touched, no body edits |
| 2 | R9 `recipe:` resolution check in `scripts/wiki-lint.ts` | landed — resolves against `docs/protocols/recipes/<v>.md` OR `.claude/skills/<v>/SKILL.md`; staged/in-progress unresolvable = error, else warning; `_archive/**` always warning (see judgment call below); quotes + inline `#` comments stripped (`normalizeFacetValue`); `main()` wrapped in `import.meta.main` so the test seam can import without running the scan |
| 3 | Negative-fixture test `scripts/wiki-lint.test.ts` + 6 fixtures under `scripts/wiki-lint-fixtures/` | landed — 9 tests: staged+bogus→error, card/skill/quoted-resolving→clean, closed+bogus→warning, comment-only→clean, archived+staged→warning, non-SESSION path out of scope, normalizer table |
| 4 | Rule doc section in `docs/protocols/llm-wiki-schema.md` | landed — `recipe:` facet rule + contract-block convention sections added; `updated`/`last_agent` bumped |
| 5 | This SESSION file | landed |

### Judgment call for AM review — `_archive/**` severity carve-out

The pinned rule keyed severity on `status:` alone. The monorepo-era archive contains FROZEN
sessions with fossilized `status: staged`/`in-progress` and retired recipe values
(`Epic_Lane` 0683, `AM_Plan_Session` 0682/0702) — under the literal rule those are 3 ERRORS the
lane may not fix (other SESSION files are forbidden paths; "history is never rewritten" is the
rule's own rationale). Resolution: `sprints/_archive/**` sessions warn at most, regardless of
status. The error path stays fully armed for the live sprint dir and is fixture-proven. This is
documented in the R9 docblock + llm-wiki-schema.md; ratify or tighten at AM.

## Verification

| Command / smoke | REAL_EXIT | Result |
| --- | --- | --- |
| `bun run typecheck` (gate 1; bare `bunx tsc --noEmit` prints help + exit 1 — NO root tsconfig.json exists, environmental; the workspace script IS the root typecheck) | 0 | ui-kit + api-client + web all green |
| `bunx tsc -p scripts/tsconfig.json --noEmit` (gate 2) | 0 | clean |
| `bun run wiki:lint` (gate 3) | 0 | 0 errors, 122 warnings — baseline pre-change was 0 errors/115 warnings; delta = exactly the 7 new R9 warnings (closed 0727/0728 wayfinder values + archived 0682/0683/0689/0690/0702); zero new R4/R8 from the card edits |
| `bun test scripts/wiki-lint.test.ts` (gate 4; single-file form is SOP §2-correct) | 0 | 9 pass / 0 fail / 20 expect |
| `bun run lint` (gate 5; writes files) | 0 | pre-existing apps/web warnings only; porcelain after = owned paths only, nothing to checkout |
| `grep -L 'output_contract' docs/protocols/recipes/*.md` (gate 6) | 1 | printed NOTHING (grep exit 1 = zero files selected = every card carries the block); each card carries it exactly once |

## Artifacts

None (docs + scripts lane; no runtime surface touched).

## Proposed ledger edits

- **Drift-register candidate (low):** 7 permanent R9 warnings now surface historical
  recipe-value drift — closed 0727/0728 (`wayfinder-epic-charting` / `wayfinder-work-through`)
  and archived 0682/0683/0689/0690/0702 (`AM_Plan_Session` / `Epic_Lane` / `docs-only` /
  `Docs_Lane`). Options: accept as permanent warnings (default), or operator ratifies a
  history-suppression. No row minted — AM owner decides.

## Open decisions / blockers

None — lane completed within its owned set. The `_archive/**` carve-out (above) is the one
orchestrator-judgment extension awaiting AM ratification.

## Deliberately-not-done

1. Did NOT bump `updated:`/`last_agent:` on the 21 recipe cards — mission pinned "additive
   frontmatter only"; no existing-key mutations (R4 exempts `protocols/` regardless).
2. Did NOT fix/suppress the 7 R9 warnings — history is never rewritten; other SESSION files are
   forbidden paths.
3. Did NOT touch `docs/sprints/_template/SESSION_TEMPLATE.md`'s comment-only `recipe:` form
   (outside the owned set) — handled in code via comment-stripping instead.
4. Did NOT run `next build`, `prisma generate`, or the full `bun run test` suite (prompt rule 8 /
   driver deltas); orchestrator owns the build gate.
5. Pre-existing apps/web oxlint warnings left as-is (out of scope; behavior of `bun run lint`
   unchanged by this diff).

## Reflections

- The pinned severity rule didn't anticipate fossilized statuses in the frozen archive; the
  literal rule would have reddened the gate against unfixable files → route:
  docs/protocols/llm-wiki-schema.md (carve-out documented) + this file's judgment-call block.
- The SESSION template's `recipe: # comment` form parses as a non-empty string under
  wiki-lint's simple YAML parser — comment-stripping in `normalizeFacetValue` was load-bearing,
  not cosmetic → route: no-action (handled in code, fixture-proven).
- Gate 1 as written (`bunx tsc --noEmit`) cannot run at the repo root (no root tsconfig);
  `bun run typecheck` is the real root gate → route: no-action (recorded here for the next
  lane-prompt author).
