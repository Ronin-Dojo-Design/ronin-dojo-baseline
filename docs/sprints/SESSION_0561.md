---
title: "SESSION 0561 — Author the /preview-artifacts skill (queued at SESSION_0539)"
slug: session-0561
type: session--implement
status: closed
created: 2026-07-17
updated: 2026-07-18
last_agent: codex-session-0567
sprint: S23
pairs_with:

  - docs/sprints/SESSION_0555.md
  - docs/sprints/SESSION_0539.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0561 — Author the /preview-artifacts skill (queued at SESSION_0539)

## Date

2026-07-17

## Operator

Brian + claude-session-0561

## Goal

Author `.claude/skills/preview-artifacts/SKILL.md` — the operator-endorsed skill queued at
SESSION_0539 that encodes the repo's visual-review pattern: inline widgets and file attachments do
NOT render in the operator's client, so any visual review (design mock, screenshot gallery,
before/after comparison, fallow report) must be published as a self-contained HTML Artifact via the
Artifact tool, returning a private link. The skill must encode real repo practice (worktree
screenshot workflow, qlmanage SVG rasterization, browser-MCP-lock workarounds), not generic advice.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0555.md`
- Carryover: 0555 planned the quality-suite merge wave (A → B → C → D → F onto main). That lane is
  NOT this session's task — this autonomous lane was dispatched with an operator-pinned brief
  (author the /preview-artifacts skill, endorsed at SESSION_0539). Operator directive wins over the
  default Next-session block; the merge wave remains with its own lane.

### Branch and worktree

- Branch: `session-0561-preview-artifacts-skill`
- Worktree: `/Users/brianscott/dev/ronin-0561` (pre-created off origin/main `09b042c9`)
- Status at bow-in: clean
- Current HEAD at bow-in: `09b042c9`
- Bootstrap: skipped by design — docs/skill-only lane, no gates that need node_modules.

### Graphify check

- Graph status: not built in this worktree (graph lives in the canonical checkout — empty stats
  here mean "not built", never "no matches"). Discovery done via targeted sprint-doc mining
  (SESSION_0539 artifact endorsement, 0505/0506/0508 qlmanage + browser-MCP-lock/isolated-Playwright
  lessons, 0523 preview_start-vs-worktree lesson) through a read-only Explore subagent instead.

## Petey plan

### Goal

Ship `.claude/skills/preview-artifacts/SKILL.md` per write-a-skill conventions, encoding the
repo-proven Artifact preview workflow, and hold at the push gate.

### Tasks

#### SESSION_0561_TASK_01 — Mine repo history for the pattern

- **Agent:** Explore subagent
- **What:** Collect the real-practice inputs: SESSION_0539 endorsement quotes, 0505/0506/0508
  qlmanage + isolated-Playwright recipes, 0523 worktree dev-server lesson, existing canonical docs to
  reference, confirmation no preview-artifacts skill exists.
- **Done means:** Findings report with exact commands/quotes + canonical doc pointers.
- **Depends on:** nothing

#### SESSION_0561_TASK_02 — Author the skill

- **Agent:** Cody (inline — single coherent docs change)
- **What:** Write `.claude/skills/preview-artifacts/SKILL.md` following
  `.claude/skills/write-a-skill/SKILL.md`: valid frontmatter (name + trigger-rich description),
  under ~100 lines with progressive disclosure, encoding: asset collection (worktree dev-server
  screenshots, qlmanage SVG rasterization, diffs), one self-contained HTML page (inline CSS,
  data:-URI images, light/dark theme-aware, responsive, overflow-x for wide content), Artifact-tool
  publish semantics (stable title/favicon, redeploy-in-place), link drop in report + SESSION file.
- **Done means:** Skill file exists, frontmatter valid, triggers declared ("publish a preview",
  "artifact gallery", "show me the screenshots", "/preview-artifacts", visual review in autonomous
  lanes).
- **Depends on:** SESSION_0561_TASK_01

#### SESSION_0561_TASK_03 — Gates + lean bow-out + local commit (hold)

- **Agent:** Doug (inline verification) + close
- **What:** `git diff --check`; frontmatter validity per write-a-skill; check whether oxfmt
  `format:check` covers `.claude/**/*.md` before assuming (worktree has no node_modules — verify
  config textually if the runner can't execute). Lean docs close (skip Graphify update), commit
  locally, NO push/PR/merge.
- **Done means:** Local commit SHA on `session-0561-preview-artifacts-skill`; report delivered.
- **Depends on:** SESSION_0561_TASK_02

### Parallelism

TASK_01 runs as a background Explore subagent while bow-in completes; TASK_02/03 sequential inline.

### Open decisions

None — brief is operator-pinned and fully specified.

### Risks

- Skill must encode repo practice, not generic advice — mitigated by TASK_01 mining.
- format:check coverage of `.claude/*.md` unknown at plan-lock — verified in TASK_03 before
  assuming either way.

### Scope guard

- No app code. No bootstrap (`bun install`). No push/PR/merge — hold at push gate.
- FI-001 parked. No canonical-checkout writes; `../ronin-dojo-monorepo` read-only.
- No wiki restructuring beyond what the skill deliverable requires.

## Cody pre-flight

Abbreviated — pure docs/skill lane, no code. Existing-component scan = `.claude/skills/` listing
(37 skills, no `preview-artifacts` — confirmed). Closest patterns studied: `write-a-skill`
(conventions), `worktree-setup` (terse operational style + gotcha encoding), `pr-fix-loop`
(loop-style skill), `bow-in` (pointer-style skill). FAILED_STEPS in-area: FS-0002 (dev server via
`npx next dev --turbo`), FS-0024 (git guard) — both acknowledged; qlmanage/browser-MCP lessons from
memory + sprint mining.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0561_TASK_01 | landed | Explore subagent mined 0539/0505/0506/0508/0523 + canonical docs |
| SESSION_0561_TASK_02 | landed | `.claude/skills/preview-artifacts/SKILL.md` authored |
| SESSION_0561_TASK_03 | landed | Gates green; lean close; local commit (held) |

## What landed

- `.claude/skills/preview-artifacts/SKILL.md` — new skill (81 lines, write-a-skill-conformant:
  name + trigger-rich description frontmatter, no bundled files needed). Encodes the
  SESSION_0539-endorsed pattern with repo-proven mechanics: the two shapes (live design mock ·
  screenshot gallery), asset collection (worktree `next dev` via Bash with `RESEND_API_KEY=` guard
  + `.next/dev/lock` port gotcha, isolated-Playwright fallback for the recurring browser-MCP lock,
  `qlmanage -t -s N` zero-dep SVG rasterization, `docs/sprints/_assets/` naming convention),
  self-contained page rules (data:-URI embeds after `sips -Z` downscale, light/dark both-ways
  theme, phone-first responsive per the 0540 mobile break, overflow-x containers), Artifact-tool
  publish semantics (stable title/favicon, redeploy-in-place, cross-session `url` update,
  private-by-default), and the link-drop protocol (report + SESSION file). One thin spot marked
  with a TODO-history comment (the isolated-Playwright `.mjs` was never committed — recipe only).
- Wiki index session table: SESSION_0561 row added + pre-existing SESSION_0555 gap backfilled
  (FS-0019 last-5 spot-check).
- Downstream unblock: SESSION_0540's planned design lanes already reference
  `/preview-artifacts` as their review channel — the skill now exists for them.

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/preview-artifacts/SKILL.md` | New skill — Artifact-published visual-review workflow |
| `docs/sprints/SESSION_0561.md` | This session file |
| `docs/knowledge/wiki/index.md` | Session rows: 0561 added, 0555 gap backfilled |

## Verification

| Command / smoke | Result |
| --- | --- |
| `git diff --check` | clean (no whitespace errors) |
| Frontmatter validity (write-a-skill: name + "Use when" description, <1024 chars, third person) | pass — see skill header |
| SKILL.md length vs ~100-line convention | 81 lines — pass |
| `bun run wiki:lint` | 0 errors, 54 warnings — ALL pre-existing (none in this session's touched files; grep-verified) |
| oxfmt coverage check | `format:check` = `oxfmt --check .` scoped to `apps/web` only — does NOT cover `.claude/` or `docs/`; no oxfmt gate applies to this lane |
| Task-log gate (`awk` count ≥ 1) | pass — 3 task rows |

### SESSION_0567 held-lane pickup verification

The held branch was rebased onto current `origin/main` and independently re-gated from its isolated
worktree before handoff. The database-backed suite ran in an explicitly exclusive DB lane; the
earlier contended run was discarded rather than treated as evidence.

| Command / smoke | Result |
| --- | --- |
| `.claude/skills/worktree-setup/bootstrap.sh` | pass — dependencies installed, Prisma client generated, no tracked bootstrap changes |
| `bun run typecheck` | pass |
| `bun run lint` | pass — advisory baseline warnings only |
| `bun run format` | pass — no app-file changes |
| `bun test` (exclusive DB lane, PID 55096) | exit 0 — 1536 pass, 0 fail, 4370 `expect()` calls, 205 files, 345.45s |
| `bun run wiki:lint` | 0 errors, 54 baseline warnings |
| Skill conformance audit | pass — valid frontmatter; 551-character description; all five required triggers present; 81 lines; every cited cross-reference exists |
| `git diff --check` | clean |

## Open decisions / blockers

- Push held per brief — local commit on `session-0561-preview-artifacts-skill` awaits the
  operator's word (explicit-push-authorization).
- The skill is the FIRST written home of this pattern (no canonical runbook exists; the
  `preview-via-published-artifacts` memory is agent-side, not a repo file). If the operator wants a
  runbook-tier home later, extract from the skill — don't fork the content.

## Next session

### Goal

Merge-wave lane continues per SESSION_0555's Next-session block (operator-directed). For this
branch: operator reviews the `/preview-artifacts` skill, authorizes push, and the first
consumer lane (SESSION_0540's belt-surface design pass) exercises it end-to-end.

### First task

Review `.claude/skills/preview-artifacts/SKILL.md`, push `session-0561-preview-artifacts-skill`
on the operator's go, and fold the branch into the merge wave (docs-only — no deploy, per the
`ignoreCommand` gate).

## Review log

### SESSION_0561_REVIEW_01 — skill conformance + history fidelity

- **Reviewed tasks:** SESSION_0561_TASK_01, SESSION_0561_TASK_02, SESSION_0561_TASK_03
- **Dirstarter docs check:** not applicable — docs/skill lane, no L1 area touched
- **Verdict:** Skill follows write-a-skill exactly (frontmatter shape, trigger-rich description,
  under 100 lines, no unnecessary bundled files). Every command encoded traces to a named sprint
  doc (0539/0540/0505/0506/0523) or repo config verified this session (oxfmt scope); the one
  unrecoverable detail (throwaway Playwright script) is marked TODO-history rather than invented.
  Sprint provenance cited inline so future editors can re-verify.
- **Score:** 9.0/10
- **Follow-up:** first real use of the skill (0540 design pass) is the true acceptance test.

## Hostile close review

- **Giddy:** pass — docs-only branch off origin/main; no app code, no structural drift; wiki index
  gap (0555) fixed rather than skipped.
- **Doug:** pass — gates that CAN run in an un-bootstrapped worktree ran (`git diff --check`,
  wiki:lint, task-log awk); gates that don't apply were verified not to apply (oxfmt scope
  checked against `apps/web/package.json`, not assumed).
- **Desi:** not applicable — no UI surface touched (the skill's design rules encode her 0540
  mobile-first finding).
- **Kaizen aggregate:** 9/10 — deliverable complete and history-grounded; deducted for the
  subagent-wait stall mid-session (coordinator had to prod; the mining finished inline).

### SESSION_0567 pickup addendum

- **Giddy:** pass — clean rebase onto current `origin/main`; docs/skill-only delta remains isolated;
  no push, PR, merge, deploy, or production mutation performed.
- **Doug:** pass — bootstrap, typecheck, lint, format, wiki lint, skill-conformance audit, diff
  check, and an exclusive full test suite are green.
- **Kaizen aggregate:** 9.4/10 — current-base and full-suite proof close the original unbootstrapped
  evidence gap; the first real published Artifact remains the downstream acceptance test.

## ADR / ubiquitous-language check

- ADR update not required — skill encodes an existing operator-endorsed practice (SESSION_0539);
  no architectural decision changed.
- Ubiquitous language update not required — "Artifact" is the platform term; no new domain terms.

## Reflections

The pattern this skill encodes was scattered across five sprint reflections and one agent-side
memory — nothing a fresh session's read-path would surface. That is exactly the "built-not-pointed"
failure LR 0007 describes, and the fix matched the read-path-audit rule: make the artifact
consumable (a skill with declared triggers) rather than pushing another memory. SESSION_0540's
plans already invoked `/preview-artifacts` before it existed — downstream sessions were writing
checks against an unshipped skill, which made this lane overdue rather than optional.

Two process notes. First, the mining subagent and my inline timeboxed grep disagreed on a fact
(the isolated-Playwright lesson lives in 0506/0508, not 0507 — 0507 is email dry-run screenshots);
the subagent's thorough pass caught it. Encoding history from memory alone would have shipped a
wrong citation. Second, I stalled by ending a turn to "wait" for the background subagent — in this
harness a stopped turn waits for nothing; the coordinator had to prod. Lesson: either block on the
subagent synchronously or proceed inline and merge its findings when they arrive.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter sweep | SESSION file `status: closed`, `updated` current; wiki index `updated` already current |
| Wiki index (FS-0019) | 0561 row added; 0555 gap backfilled; last-5 spot-check done |
| Wiki lint | run at close — result in Verification table |
| Hostile close review | section above (Giddy/Doug pass, Desi n/a, Kaizen 9/10) |
| Review & Recommend | Next session block written |
| Git hygiene | local commits on `session-0561-preview-artifacts-skill`; branch clean and push HELD at the explicit authorization gate |
| Graphify update | skipped by design — lean docs close in un-bootstrapped worktree (graph lives in canonical checkout) |
| Memory sweep | no new memory needed — the skill itself is the durable artifact (supersedes re-recording the 0539 memory) |
