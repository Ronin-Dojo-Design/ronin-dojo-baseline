---
title: "SESSION 0693 — kernel guard against the inert-save-button class (WL-P2-44) (auto lane)"
slug: session-0693
type: session--implement
status: in-review
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0693
sprint: S12
lane: repo
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0520.md
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0693 — kernel guard against the inert-save-button class (WL-P2-44) (auto lane)

## Date

2026-07-24

## Operator

Brian + autonomous lane (dispatched by an overnight-orchestrator run)

## Goal

Build a kernel guard that prevents the FI-025 inert-save-button class from recurring: the L1
`Button` (`apps/web/components/common/button.tsx`, built on Base UI's `useRender`) never infers a
`type` for the rendered `<button>` — a form-save `Button` that omits an explicit `type` prop
renders inert (14 call sites shipped broken this way; SESSION_0520 fixed all of them, but nothing
prevented the next form from reintroducing the class). `WL-P2-44` asks for either a lint rule or a
Form-context-aware submit default in the L1 Button. The dispatch pinned the **lint-rule** option —
`apps/web/components/common/*` is frozen for this lane.

## Verify-first evidence (operator addendum — confirm WL-P2-44 is still live, not a duplicate build)

Checked before writing any code, and re-checked mid-session on an explicit operator addendum:

- `docs/knowledge/wiki/wiring-ledger.md` — `WL-P2-44` row has **no `✅` resolved marker** (compare
  the same table's `WL-P2-42 ✅` / `WL-P2-49 ✅` rows, which do). The row's fix column still reads
  "Kernel guard: lint rule ... or a Form-context-aware submit default ... plus a regression test" —
  i.e. still an open ask, not a stale/superseded line.
- `find . -iname "*button-type*" -o -iname "*inert-button*" -o -iname "*button-guard*"` (canonical,
  excluding `node_modules`/`.next`/`.generated`) — **zero matches**. No prior guard script exists
  under any name.
- `apps/web/scripts/` listing (pre-build) and root `scripts/` listing — no lint-guard-shaped script
  present (`wiki-lint.ts`, `board-backlog.ts`, etc. are the closest analogues, none Button-related).
- No `.oxlintrc.json` anywhere in the repo — oxlint runs on defaults, so no custom oxlint rule
  could already cover this (oxlint 1.69's plugin/custom-rule surface is not configured at all).
- `grep -rn "button.type\|inert" .github/workflows/*.yml` — no CI step references button-type
  linting.
- Ran the new scanner over the current `apps/web` tree (1049 `.tsx` files) **before** concluding
  anything was missing: **0 violations** — consistent with SESSION_0520 having already fixed all 14
  known sites; the gap is specifically the absence of a guard against *recurrence*, which is exactly
  what this row asks for.

**Conclusion: WL-P2-44 is live and unbuilt. Proceeded to build — this is not a duplicate.**

## Pre-flight

Not a UI/component, schema, or backend-action task (`docs/protocols/cody-preflight.md`'s three
checklists don't apply to a standalone lint-guard script) — L1 pre-flight is also N/A: the L1
`Button` itself is frozen/untouched this lane; the deliverable is a new tooling script + test, not
app UI. Existing-component scan was still done for the *investigation* (confirmed `Button` is the
only component named exactly `Button` under `components/common/`; `ButtonGroup`/`QrShareButton`
are distinct exports) to keep the scanner's tag-name match precise.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0693_TASK_01 | done | Bootstrap worktree (env copy minus `RESEND_API_KEY`, `bun install`, `prisma generate`) |
| SESSION_0693_TASK_02 | done | Investigated oxlint config (no `.oxlintrc.json`, defaults only) — concluded a standalone TS-AST scanner is the right implementation, not a custom oxlint rule |
| SESSION_0693_TASK_03 | done | Built `apps/web/scripts/lint-button-type.ts` — walks `.tsx` files, tracks native `<form>` JSX nesting via the TypeScript compiler API, flags L1 `Button` usages inside a form with neither an explicit `type` nor a `render` prop |
| SESSION_0693_TASK_04 | done | Built `apps/web/scripts/lint-button-type.test.ts` — 8 cases incl. the exact FI-025 shape (must fail), typed/render/outside-form/non-L1-import cases (must pass), and a full-tree regression scan (raised to a 30s bun:test timeout — ~1000 files takes longer than the 5s default) |
| SESSION_0693_TASK_05 | done | Wired into `apps/web/package.json` `lint` / `lint:check` scripts so `bun run lint:check` (the exact command CI's `oxc` job runs) enforces it on every PR |
| SESSION_0693_TASK_06 | done | Ran the guard over `apps/web` — 0 current violations, no fixes needed outside frozen paths |
| SESSION_0693_TASK_07 | done | Gates: typecheck, lint:check (incl. the new guard), full `bun run test` — all green |
| SESSION_0693_TASK_08 | done | Operator verify-first addendum mid-session — re-confirmed WL-P2-44 is open/unbuilt (see evidence section above); no duplicate work found, continued as planned |

## What landed

- **`apps/web/scripts/lint-button-type.ts`** (new) — parses every `.tsx` file under `apps/web`
  with the TypeScript compiler API (`ts.createSourceFile(..., ts.ScriptKind.TSX)`), recursively
  walks the JSX tree tracking native `<form>` nesting, and flags every `<Button>` JSX usage
  (only for files that import `Button` from `~/components/common/button` — the L1 component) that
  is inside a form and has **neither** an explicit `type` attribute (any value, including a
  dynamic expression) **nor** a `render` attribute (which swaps the underlying tag away from
  `<button>`, e.g. `render={<Link />}` — those have no `type` semantics and are correctly exempt).
  Exported `findViolations(code, fileName)` for fixture-driven testing and `lintButtonType(root?)`
  for the full-tree scan; CLI entry (`import.meta.main`) prints violations and exits 1.
- **`apps/web/scripts/lint-button-type.test.ts`** (new) — 8 `bun:test` cases: the FI-025 shape
  itself (must flag), a self-closing-Button variant (must flag), explicit `type` incl. a ternary
  expression (must pass), `render`-prop exemption (must pass), outside-any-form (must pass),
  Button imported from a different library with the same name (must pass — proves the import-gate
  isn't matching on tag name alone), a file that never imports the L1 Button at all (must pass),
  and a full-tree scan of the live `apps/web` codebase asserting 0 violations (the ongoing
  regression gate — raised to a 30s timeout since walking + parsing ~1000 files exceeds bun:test's
  5s default).
- **`apps/web/package.json`** — `lint` / `lint:check` scripts now chain the guard after `oxlint`
  (`oxlint . && bun scripts/lint-button-type.ts` / `oxlint --fix . && bun scripts/lint-button-type.ts`).
  CI's `oxc` job (`.github/workflows/ci.yml`) already runs `bun run lint:check` from
  `apps/web` — no CI file changes needed; the guard is live on every PR the moment this merges.
- **No fixes needed in `apps/web`** — a fresh scan found 0 current violations (SESSION_0520 already
  cleared all 14 known sites; this guard's job was purely to prevent recurrence).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/scripts/lint-button-type.ts` | New. The scanner (153 lines). |
| `apps/web/scripts/lint-button-type.test.ts` | New. Regression tests (137 lines, 8 cases). |
| `apps/web/package.json` | `lint` / `lint:check` scripts now run the guard after `oxlint`. |
| `docs/sprints/SESSION_0693.md` | This file. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd && git branch --show-current` | `/Users/brianscott/dev/ronin-0693` / `auto/session-0693-wl44-button-lint-guard` — exit 0 |
| `bun install` | 757 packages installed — exit 0 |
| `bunx prisma generate` (apps/web) | Generated Prisma Client 7.8.0 — exit 0 |
| `bun test scripts/lint-button-type.test.ts` (isolated, dev loop) | 8 pass / 0 fail — exit 0 |
| `cd apps/web && bun run typecheck` | `next typegen` + `tsc --noEmit` clean — exit 0 |
| `cd apps/web && bun run lint:check` | oxlint: pre-existing unrelated warnings only (no errors, none in touched files); `lint-button-type: OK — no inert Button-in-form violations` — exit 0 |
| `cd apps/web && bun run test` (full suite, `--parallel=1`, never bare multi-file `bun test` per FS-0027) | **1749 pass / 0 fail across 225 files** (398s — heavy host contention from ~18 concurrent sibling-lane `tsc` processes during this run, per `ps aux`; no flakes observed) — exit 0 |
| `git status --porcelain` | Only the 4 files above touched — verified before staging |
| `oxfmt --check` (pre) → `oxfmt` (fix) → re-run tests | Formatter reflowed both new files (arrow-fn parens, line wraps); guard tests re-ran green after the reformat |

## Proposed ledger edits

**`docs/knowledge/wiki/wiring-ledger.md` — `WL-P2-44` row, resolution text for the merge owner to
paste in (append `✅` to the ID per the table's convention, e.g. `WL-P2-44 ✅`):**

```markdown
**✅ Resolved — SESSION_0693.** Built the lint-rule option (Form-context-aware submit default in
the L1 Button was explicitly out of scope — `components/common/*` stays frozen). New standalone
scanner `apps/web/scripts/lint-button-type.ts` walks every `.tsx` file via the TypeScript compiler
API, tracks native `<form>` JSX nesting, and flags any L1 `Button` inside a form lacking an
explicit `type` prop (a `render` prop, which swaps the tag away from `<button>`, is correctly
exempt). Wired into `apps/web/package.json`'s `lint`/`lint:check` scripts, so CI's existing
`bun run lint:check` step (`.github/workflows/ci.yml` `oxc` job) enforces it on every PR with zero
CI-file changes. Regression test `apps/web/scripts/lint-button-type.test.ts` (8 cases) includes
the exact FI-025 shape as a must-fail fixture and a full-tree scan of `apps/web` as a must-pass
regression gate (0 violations found — SESSION_0520 already cleared all 14 known sites; this closes
the "nothing prevents recurrence" gap). PR #<fill-at-merge>.
```

No other ledger edits proposed — this lane touched no other rows.

## Open decisions / blockers

- None blocking. The lint-rule option was pinned by the dispatch (Form-context-aware default in
  the L1 Button was explicitly forbidden — `components/common/*` frozen); no operator decision
  needed.
- Scope note (not a blocker, naming it per "don't expand scope"): the guard only checks the L1
  `Button` component, not raw `<button>` elements — raw HTML buttons are already out-of-doctrine
  per the L1 pre-flight rules (a separate concern from this recurrence-guard). If a raw `<button>`
  regression class ever appears, that would be a new, separate WL row, not a silent scope-creep
  into this guard.
- Perf note: the full-tree scan (~1000 files, TypeScript AST parse per file) takes ~15-20s
  locally as part of `lint:check`/`test`. Acceptable for a CI gate; flagged here in case it ever
  needs a cache (e.g., only re-scan changed files) at larger repo scale — not needed today.

## Residual for AM merge

- Apply the `WL-P2-44 ✅` resolution text above to `docs/knowledge/wiki/wiring-ledger.md` (outside
  this lane's write allowlist).
- Fill the `PR #<fill-at-merge>` placeholder in the proposed ledger text with this lane's actual
  PR number once opened.
