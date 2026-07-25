---
title: "SESSION 0640 — auto-claude G-030 v1 branded doc renderer (overnight auto lane)"
slug: session-0640
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0640
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0640 — auto-claude G-030 v1 branded doc renderer (overnight auto lane)

> Staged by the SESSION_0635 overnight orchestrator (operator-approved 5-lane dispatch). Adopt at lane
> start: flip `status:` → `in-progress`, set `last_agent:` to `<driver>-session-0640`. The dispatch
> payload is the lane prompt; its HARD RULES are binding. Branch: `auto/session-0640-doc-renderer`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude G-030 v1 branded doc renderer — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0640_TASK_01 | done | G-030 v1 branded doc renderer — pure parse core + genre templates + RDD tokens + CLI + tests + 2 committed fixtures |

## What landed

`scripts/render-doc/` — a static build script (`bun scripts/render-doc/index.ts <path> [--genre=...]`)
that turns any frontmatter-carrying repo doc into a brand-styled HTML artifact with a metadata
header derived from the YAML.

- **Pure parse core** (`core/`), no I/O, unit-tested in isolation from templates (State-of-Dojo
  kernel pattern, not coupled to it — no import from/into `apps/web/components/app/state-of-dojo/**`):
  - `frontmatter.ts` — flat `key: value` + list (`- item`) YAML-lite splitter (repo has no YAML
    dep in the lockfile; mirrors `scripts/wiki-lint.ts`'s own parser, reimplemented standalone so
    this dir stays self-contained rather than cross-importing a sibling script).
  - `markdown.ts` — wraps `marked` (already a root devDependency in `bun.lock` — verified before
    reaching for a new dep) for headings/paragraphs/lists/code-fences/links/GFM-tables/blockquotes.
  - `metadata.ts` — extracts the ONE metadata-header shape (title, created, updated,
    author-or-last_agent, status, session-or-slug, decision) — every field optional, a missing key
    is simply absent from the header, never the string `"undefined"`.
  - `genre.ts` — `research-review` / `sop-ritual` (SOPs + rituals + workflows) / `generic` fallback,
    detected from frontmatter `type:` + path, overridable via `--genre=`. Unrecognized doc → `generic`,
    never a crash; a bad explicit `--genre=` value throws a clear error (that one IS user error, not
    an auto-detect miss).
  - `parse.ts` — composes the above into one `ParsedDoc` model; the only thing templates consume.
- **Template layer** (`templates/`) — `layout.ts` (shared shell + metadata-header renderer, HTML-escaped)
  + one file per genre (`research-review.ts`, `sop-ritual.ts`, `generic.ts`) + `render.ts` dispatcher.
- **`tokens.ts`** — reads (never edits) `packages/ui-kit/src/tokens/tokens.ts`'s `BrandTokenBlock`
  type + `brandTokenCss()` and supplies RDD's literal brand values as the default (traced to
  `apps/rdd/app/globals.css`'s `--mk-*` bridge — RDD is dark-mode-first, blue accent `#3B82F6`,
  Saira/Inter type pair — read-only reference, `apps/**` untouched).
- **`index.ts`** — CLI: reads the doc, parses, renders, writes to `scripts/render-doc/out/<slug>.html`
  (own self-contained `out/.gitignore`; no root-config edits).
- **Tests** (27 passing, `bun:test`, pure — no DB/mocks, FS-0027 doesn't apply): unit coverage for
  each core module + `parse.ts` integration + a golden-file regression test (`fixtures.test.ts`)
  that renders the two committed fixture inputs and asserts byte-identical output against the
  checked-in `fixtures/*.html`.
- **2 committed fixtures** (`scripts/render-doc/fixtures/`): the exact two docs named in the lane
  prompt — `research-review-security-headers-posture.html` (research-review genre) and
  `opening.html` (sop-ritual genre, `type: protocol` under `docs/rituals/` — proves the genre
  detector's path-based fallback, not just the `type:` match).

**tsconfig gap (noted per lane instructions, root config NOT touched):** `scripts/tsconfig.json`'s
`"include": ["*.ts"]` only covers top-level `scripts/*.ts` files — it does **not** reach
`scripts/render-doc/**`. Added a self-contained `scripts/render-doc/tsconfig.json`
(`"extends": "../tsconfig.json"`, `"include": ["**/*.ts"]`) so the new directory has its own
strict typecheck without touching the root file. Same gap for formatting: `oxfmt` found no config
walking up from `scripts/` (confirmed pre-existing — even committed `scripts/wiki-lint.ts` fails a
bare `oxfmt --check` today), so added a self-contained `scripts/render-doc/.oxfmtrc.json` (copied
from `apps/web/.oxfmtrc.json`'s settings — the repo's one documented style) rather than adding a
root config.

**Gitignore discovery:** the root `.gitignore` already has a blanket `out/` rule (line 3, ignores any
directory literally named `out` anywhere in the tree) — git's negation rule means a nested
`!.gitignore` inside an already-excluded directory can't re-include itself (`git add` refused it,
correctly), so `scripts/render-doc/out/.gitignore` needed `git add -f` to track (not a root-config
edit — the root file is untouched; this is force-tracking one small nested file the spec calls for).
Functionally the root rule alone already keeps `out/` untracked; the local file is the documented,
self-contained belt-and-suspenders the pinned decision asked for.

**Known cosmetic quirk (not fixed, out of scope):** the rendered body is verbatim markdown-to-HTML,
so a doc whose body itself opens with `# Title` (matching its frontmatter `title:`) shows that
title twice — once in the metadata-header `<h1>`, once as the body's own first heading (visible in
`opening.html`). Left as-is for v1: the renderer doesn't rewrite the source doc's heading levels,
which is the safer default (never silently drop/renumber content). Flagging as adjacent polish, not
fixing here (scope discipline).

## Files touched

| File | Change |
| --- | --- |
| `scripts/render-doc/core/frontmatter.ts` | new — frontmatter/body splitter |
| `scripts/render-doc/core/frontmatter.test.ts` | new — unit tests |
| `scripts/render-doc/core/markdown.ts` | new — `marked` wrapper + first-heading fallback |
| `scripts/render-doc/core/markdown.test.ts` | new — unit tests |
| `scripts/render-doc/core/metadata.ts` | new — metadata-header field extraction |
| `scripts/render-doc/core/metadata.test.ts` | new — unit tests |
| `scripts/render-doc/core/genre.ts` | new — genre detection/override |
| `scripts/render-doc/core/genre.test.ts` | new — unit tests |
| `scripts/render-doc/core/parse.ts` | new — pure parse core, composes the above |
| `scripts/render-doc/core/parse.test.ts` | new — unit tests |
| `scripts/render-doc/tokens.ts` | new — RDD brand tokens (reads `packages/ui-kit` tokens, read-only) |
| `scripts/render-doc/templates/layout.ts` | new — shared HTML shell + metadata header renderer |
| `scripts/render-doc/templates/research-review.ts` | new — research-review genre template |
| `scripts/render-doc/templates/sop-ritual.ts` | new — sop-ritual genre template |
| `scripts/render-doc/templates/generic.ts` | new — fallback genre template |
| `scripts/render-doc/templates/render.ts` | new — genre dispatcher |
| `scripts/render-doc/index.ts` | new — CLI entry point |
| `scripts/render-doc/tsconfig.json` | new — self-contained strict typecheck config |
| `scripts/render-doc/.oxfmtrc.json` | new — self-contained format config (mirrors `apps/web`'s) |
| `scripts/render-doc/out/.gitignore` | new — self-contained output-dir ignore |
| `scripts/render-doc/fixtures/research-review-security-headers-posture.html` | new — committed fixture sample |
| `scripts/render-doc/fixtures/opening.html` | new — committed fixture sample |
| `scripts/render-doc/fixtures.test.ts` | new — golden-file regression test against the two fixtures |
| `docs/sprints/SESSION_0640.md` | this file — adopted + filled at close |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun test --parallel=1 scripts/render-doc` | 27 pass, 0 fail, 48 expect() calls — exit 0 |
| `npx tsc --noEmit -p scripts/render-doc/tsconfig.json` (run from that dir) | exit 0, no output |
| `node_modules/.bin/oxfmt --check scripts/render-doc` | "All matched files use the correct format." — exit 0 |
| `node_modules/.bin/oxlint scripts/render-doc` | no output — exit 0 |
| `bun scripts/render-doc/index.ts docs/architecture/research/research-review-security-headers-posture.md` | `Rendered -> .../out/research-review-security-headers-posture.html` — exit 0 |
| `bun scripts/render-doc/index.ts docs/rituals/opening.md` | `Rendered -> .../out/opening.html` — exit 0 |
| `diff` of both fresh CLI renders vs. committed `fixtures/*.html` | byte-identical (empty diff) both times |
| Manual crash-safety probe: doc with **no frontmatter at all** | rendered clean, exit 0, `grep -c "undefined"` on output = `0` |
| Manual probe: unknown `--genre=not-a-real-genre` | clean error message, exit 1 (explicit override typo — intentionally not silently swallowed) |
| `git add -n scripts/render-doc docs/sprints/SESSION_0640.md` (dry run) | confirms `scripts/render-doc/out/*.html` is excluded (`!!` ignored), everything else staged as expected |

## Full close evidence

1. **Plan → done-means check:** static build script (not a route) ✓, reads `packages/ui-kit` tokens
   read-only with RDD as default brand ✓, two genre templates (`research-review` + `sop-ritual`)
   with `generic` fallback that never crashes ✓, metadata header consumes title/created/updated/
   author-or-last_agent/status/session-or-slug/decision with absent-not-"undefined" missing-key
   behavior ✓, output dir `scripts/render-doc/out/` with its own `.gitignore` ✓, ONE pure parse
   core with unit tests separate from templates (parallel-inspired by, not coupled to,
   State-of-Dojo — no import to/from `apps/web/components/app/state-of-dojo/**`, confirmed by
   construction: no such import exists anywhere in `scripts/render-doc/`) ✓, markdown rendering via
   an existing lockfile dependency (`marked`, checked before writing anything custom) ✓, 2 committed
   fixtures for the exact two named docs ✓.
2. **Typecheck:** ran (self-contained `scripts/render-doc/tsconfig.json`, root config untouched,
   gap documented above) — exit 0.
3. **Lint/format:** `oxlint` exit 0; `oxfmt --check` exit 0 (self-contained `.oxfmtrc.json`, root
   untouched, pre-existing repo-wide gap documented above).
4. **Tests:** 27/27 pass, pure (no DB, no mocks, FS-0027's mock.module concurrency issue doesn't
   apply — ran with `--parallel=1` anyway per convention).
5. **Cleaner-or-not-worse:** net-new self-contained directory; nothing outside `scripts/render-doc/`
   and this SESSION file was touched (`git status --short` confirms only those two paths).
6. **Unintended files:** none — dry-run `git add -n` above lists exactly the files in "Files
   touched" plus this SESSION file.
7. **New dependencies:** none. `marked` was already a root devDependency in `bun.lock`; no
   `bun add`/`bun install` was run.
8. **Schema change:** N/A.
9. **Security-sensitive:** N/A — no authz surface touched.
10. **New env vars:** none.
11. **Numbered `closing.md` steps:** this is an autonomous overnight lane governed by the dispatch
    prompt's own CLOSE sequence (not the full interactive `/bow-out`) — the dispatch prompt's steps
    (fill SESSION file → `git add` explicit paths → commit → push → `gh pr create --fill` → stop,
    never merge) are the "closing.md" for this lane; followed in full below.

## Proposed ledger edits

- **G-030** → status: **in-progress** (v1 shipped this session — pure parse core, two genre
  templates + generic fallback, RDD-token-styled output, CLI, 27 passing tests, 2 committed
  fixtures). Progress note for the goals ledger: "v1 landed in `scripts/render-doc/` (branch
  `auto/session-0640-doc-renderer`, PR pending operator go-ahead) — static CLI, not yet wired into
  any automated/scheduled flow. Follow-ups for a v2 (not started, not scoped this session): wire it
  into a repo doc-index/nav generator or a bow-out artifact step if the operator wants it live
  rather than on-demand; consider a third genre template if a third doc shape (e.g. ADRs) proves
  common enough to warrant one; the harmless double-H1 cosmetic quirk noted above."

## Open decisions / blockers

None — all forks were pre-pinned in the dispatch prompt. No blockers hit.

## Residual for AM merge

- This lane's branch (`auto/session-0640-doc-renderer`) is pushed and a PR is opened per the
  dispatch CLOSE sequence but **not merged** (lane rule: never merge). The attended AM merge should
  review and land it, then flip the `G-030` ledger row per "Proposed ledger edits" above.
- No shared-ledger files were edited directly (per HARD RULES) — the G-030 status flip above is
  proposed only, for the merge owner to apply.

