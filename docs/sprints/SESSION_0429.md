---
title: "SESSION 0429 — Design-system component batch (PWCC-001…007), Mammoth-Rebuild CRM epic, PR #137 watch"
slug: session-0429
type: session--open
status: closed
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0429
sprint: S-foundation
pairs_with:

  - docs/sprints/SESSION_0428.md
  - docs/epics/post-launch-clean-repo-001.md
  - docs/epics/mammoth-rebuild-crm-001.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0429 — Design-system component batch + Mammoth-Rebuild CRM epic

## Date

2026-06-21

## Operator

Brian + claude-session-0429

## Goal

Land the Desi brand-system pass (one token set + dark/light) and spec a reusable, brand-/content-
agnostic component library (task board, m-card, magnetic drawer, AdminKanban), then fold it into a
Mammoth-Rebuild CRM (HubSpot-replacement) epic with a clean PWCC port series — all on the
`post-launch-clean-repo-001` branch (PR #137), docs-only.

## Status

See frontmatter `status:`.

## Bow-in

### Previous session

- Continues `claude/post-launch-clean-repo-001` (PR #137) from SESSION_0428's repo-health epic +
  files/ spec catalog. This session is the design-system + component-spec batch on the same branch.

### Branch and worktree

- Single branch `claude/post-launch-clean-repo-001` → draft PR #137. Docs + root `scripts/` only
  (no `apps/web`), so it skips the prod deploy gate; the `package.json` script-entry edit triggers
  a Vercel preview build only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0429_TASK_01 | landed | Desi brand pass — `component-design-system.{md,html}` + shared `bbl-doc-theme.ts`; restyled hub + poster generators (no gold; BBL red `#E52421`) |
| SESSION_0429_TASK_02 | landed | Dark/light inversion across the doc design system (prefers-color-scheme + `data-theme`; accent `#FF4D49` on dark; toggles) |
| SESSION_0429_TASK_03 | landed | AdminTaskBoard spec (PWCC-001) — Todoist model + PWCC cloud handoff |
| SESSION_0429_TASK_04 | landed | m-card spec (PWCC-002) — content-/brand-agnostic roster/rank/task/loop card on Dirstarter base |
| SESSION_0429_TASK_05 | landed | three-level magnetic drawer spec (PWCC-003) — content-agnostic canvas, infinite m-card list, cinematic chrome |
| SESSION_0429_TASK_06 | landed | Mammoth-Rebuild CRM epic + bindings (PWCC-004/005/006) — HubSpot-replacement, library→surface map, cloud-agent prompts |
| SESSION_0429_TASK_07 | landed | AdminKanban spec (PWCC-007) — reusable config-driven board + lead intake + follow-up automations + Desi pass + reusable Cody loop |
| SESSION_0429_TASK_08 | landed | PR #137 watch — subscribed; diagnosed + re-kicked a transient `@prisma/client` `bun install` flake (Playwright chromium) |

## What landed

- **Design system (Desi pass):** one canonical token set (accent `#E52421`, Poppins/Inter, the
  1-2-3 step = filled red disc + white number) in `scripts/lib/bbl-doc-theme.ts`; authored
  `docs/component-design-system.{md,html}`; restyled the orchestration-hub + loop-poster generators
  to it; gold `#d7a74c`/`#FFD700` flagged off-brand.
- **Dark/light inversion:** true OS-following inversion (`prefers-color-scheme`) + forceable
  `data-theme`; accent lifts to `#FF4D49` on dark; toggles in the hub + the design-system HTML;
  posters pinned light (paper). Dark surfaces mirror the iOS/Todoist chrome.
- **Component library specs (PWCC series):** AdminTaskBoard (001), m-card (002), magnetic drawer
  (003), AdminKanban (007) — all brand-agnostic (Dirstarter base + token swap) and content-agnostic
  (kind→DTO), each with ASCII+mermaid wiring, wireframes, status taxonomy, and a PWCC cloud handoff.
- **Mammoth-Rebuild CRM epic:** `docs/epics/mammoth-rebuild-crm-001.md` — replace HubSpot by
  assembling the library (object→component map, PWCC register, phased roadmap re-basing the
  SESSION_0425 MVP); bindings PWCC-004/005/006 with ready cloud-agent prompts; Mammoth dark/orange
  token block = the cross-brand proof.
- **PR #137 watch:** subscribed to PR activity; all bot events (Vercel/CodeRabbit) non-actionable;
  diagnosed the one CI failure as a transient registry flake (`@prisma/client@^7.8.0` failed to
  resolve in `bun install` on the chromium runner while the same step passed on Oxc/Typecheck) and
  re-kicked via empty commit `8c11de28` (rerun API was 403 for the integration).

## Decisions resolved

- Canonical accent is BBL red `#E52421` (dark `#FF4D49`); **gold is off-brand** (`styles.css:210`).
- Two axes of agnosticism for the library: **content** (`kind`→DTO) + **brand** (Dirstarter base +
  token block). Zero per-brand/per-content code in components.
- Clean **PWCC-NNN** port series for this batch (distinct from the SESSION_0337 `PORTMAP-NNNN`
  lineage epic). Mammoth pipeline (PWCC-004) binds the reusable AdminKanban (PWCC-007).
- The Mammoth CRM is the cross-brand proof of the brand-agnostic library; the SESSION_0425 MVP is
  re-based onto it, not discarded.

## Files touched

| File | Change |
| --- | --- |
| `scripts/lib/bbl-doc-theme.ts` | NEW shared token/step/dark-light theme module |
| `scripts/build-orchestration-hub.ts`, `scripts/build-loop-posters.ts` | restyle to shared theme + dark/light + theme toggle; posters pinned light |
| `docs/component-design-system.html`, `docs/knowledge/wiki/component-design-system.md` | NEW living design-system reference (.html committable) + companion |
| `docs/runbooks/dev-environment/orchestration-hub.md`, `package.json`, `.gitignore` | docs:hub/docs:posters scripts + runbook + ignores |
| `docs/knowledge/wiki/files/{bbl-admin-task-board,m-card-pattern,three-level-magnetic-drawer,admin-kanban-board,mammoth-crm-bindings}.md` | NEW PWCC-001/002/003/007 + bindings specs |
| `docs/epics/mammoth-rebuild-crm-001.md` | NEW HubSpot-replacement CRM epic + PWCC register |
| `docs/epics/post-launch-clean-repo-001.md` | catalog rows + RH-5 render-layer mitigation |
| `docs/knowledge/wiki/{index.md,custom-component-inventory.md}` | catalog rows + MagneticDrawer/MCard inventory entries |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | 0 errors, 14 warnings (all pre-existing in `SESSION_VIDEO_R001.md`) |
| CI on PR #137 (Typecheck / Oxc / Unit / Vercel) | green (docs-only; outside `apps/web` job scope) |
| Playwright (chromium) | transient `bun install` flake → re-kicked `8c11de28`; rerun green past install |
| Live component render | N/A — specs only (build handed to cloud agents via PWCC prompts) |

## Open decisions / blockers

- **PR #137 not merged** — draft; CI re-running on `8c11de28`. NOT blocked on user.
- **PWCC builds not started** — 001/002/003/007 + bindings are specs; first build (recommend
  PWCC-007 AdminKanban or PWCC-002 m-card) is a cloud/sub-agent lane.
- **Carryover from SESSION_0428:** issue #134 directory-DTO migration + cloud Graphify parity sweep
  still open (separate thread from this batch).

## Next session

### Type

**PR-Review-Loop** (lightweight Petey orchestration) — see the Petey prompt below.

### Goal

Drive PR #137 (`claude/post-launch-clean-repo-001`) to merge-ready: confirm CI green, run the
review loop on the docs/spec batch, fix any review findings, mark ready, merge.

### Petey prompt — next session (PR-Review-Loop on PR #137)

```text
SESSION TYPE: PR-Review-Loop (lightweight). Act as Petey → orchestrate; Doug reviews; Cody fixes.
TARGET: PR #137 — claude/post-launch-clean-repo-001 (docs/spec batch, PWCC-001..007 + Mammoth epic).

LANE 0 — Bow-in + CI gate (inline)
  READ:  docs/sprints/SESSION_0429.md (this file) · docs/epics/post-launch-clean-repo-001.md
  DO:    pull_request_read get_check_runs on #137; if any non-Vercel/CodeRabbit check is red,
         diagnose (get_job_logs) — re-kick only transient infra flakes, fix real failures.
  TOUCH: none unless a fix is needed.

LANE A — Doug review: standards + spec parity (read-only, parallelizable sub-agent)
  READ:  docs/knowledge/wiki/files/{bbl-admin-task-board,m-card-pattern,three-level-magnetic-drawer,
         admin-kanban-board,mammoth-crm-bindings}.md · docs/epics/mammoth-rebuild-crm-001.md ·
         docs/knowledge/wiki/files/_template/SPEC_TEMPLATE.md (shape) · component-design-system.md
  CHECK: every spec matches SPEC_TEMPLATE; PWCC ids unique + cross-linked; wiring paths real
         (spot-check monorepo/baseline paths exist); no gold; redaction-stays-upstream stated;
         each file cataloged in index.md + epic + (components) custom-component-inventory.md.
  OUTPUT: a findings list (severity ≥ medium) — no code edits.

LANE B — Cody fixes (inline, only if Lane A finds issues)
  TOUCH: only the flagged spec/catalog files. Re-run `bun run wiki:lint` (must stay 0 errors).
  COMMIT: docs(spec): address #137 review — <one line>. Push to the same branch.

LANE C — Ready + merge (inline, after green + clean review)
  DO:    mark PR #137 ready for review (update_pull_request draft=false) so CodeRabbit runs;
         address any CodeRabbit blocker; when CI green + reviews clear → merge_pull_request (squash).
  GUARD: docs-only; never force-push; FS-0024 git guard before any mutating git.

STOP CONDITIONS: PR merged/closed → unsubscribe + done. Ambiguous review finding or a real (non-flake)
CI failure that needs a scope decision → AskUserQuestion, don't guess.

FIRST TASK: Lane 0 — re-check #137 CI on the latest commit; if green, mark ready and start Lane A.
```

### Inputs to read (next bow-in)

- `docs/sprints/SESSION_0429.md` (this file) · `docs/epics/post-launch-clean-repo-001.md` ·
  `docs/epics/mammoth-rebuild-crm-001.md` · the 5 PWCC spec files under `docs/knowledge/wiki/files/`.

## ADR / ubiquitous-language check

- No new ADR required this session (specs only; the canonical-DTO ADR remains queued under #134).
  No new ubiquitous-language terms — reused Passport/DirectoryProfile/Rank; introduced doc-level
  terms (m-card, PWCC port id, detent) scoped to the specs, not the domain model.

## Reflections

- **Two axes of agnosticism is the unlock.** Separating "brand" (token block) from "content"
  (`kind`→DTO) let one card/board/drawer serve BBL, Mammoth, and any future brand — and the CRM
  fell out as "assemble the library + a token block," which is the whole argument for the library.
- **A docs-only PR can still go red on infra.** The `@prisma/client` resolve flake hit one runner
  while the same install passed on two others — proof it was registry noise, not the diff. The
  cheap tell: compare the failing step's outcome across sibling jobs on the same SHA before re-kicking.
- **No rerun permission → empty commit is the fallback.** `rerun_failed_jobs` 403'd for the
  integration; an empty commit re-triggers cleanly. Worth knowing for the PR-Review-Loop next session.
- **Spec-first + cloud-handoff prompts kept this session lightweight.** Every component shipped as a
  spec with a paste-ready prompt rather than a build — the build lanes are cleanly parallelizable later.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0429 frontmatter set; `last_agent: claude-session-0429`; pairs_with SESSION_0428 + both epics; touched docs carry frontmatter. |
| Backlinks/index sweep | `wiki/index.md` rows added for all 5 specs + 2 epics; `custom-component-inventory.md` MagneticDrawer/MCard rows + bumped `updated`. |
| Wiki lint | `bun run wiki:lint` → 0 errors, 14 warnings (pre-existing in SESSION_VIDEO_R001.md). |
| Kaizen reflection | Reflections present: yes. |
| Hostile close review | Lightweight — docs/spec only; wiki:lint 0 errors; CI green on docs scope; the one red was a diagnosed infra flake (re-kicked), not a content defect. |
| Review & Recommend | Next session = PR-Review-Loop on #137 with full Petey prompt + per-lane file read/touch lists. |
| Memory sweep | Project facts captured in the epics + PWCC register; no operator-memory change needed. |
| Next session unblock check | Unblocked — Lane 0 (re-check #137 CI) is doable immediately. |
| Git hygiene | Branch `claude/post-launch-clean-repo-001`; docs-only; single close commit — hash reported at bow-out / see git log. |
| Graphify update | Skipped — Graphify not installed in container. |
