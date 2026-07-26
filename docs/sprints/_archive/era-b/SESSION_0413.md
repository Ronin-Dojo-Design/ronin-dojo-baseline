---
title: "SESSION 0413 — Consolidation: merge the BBL launch fleet into main"
slug: session-0413
type: session--open
created: 2026-06-18
updated: 2026-06-19
last_agent: claude-session-0413
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0412.md
  - docs/sprints/SESSION_0414.md
backlinks:

  - docs/knowledge/wiki/index.md
status: closed
---

# SESSION 0413 — Consolidation: merge the BBL launch fleet into main

## Date

2026-06-18

## Operator

Brian + claude-session-0413

## Goal

Consolidate the entire BBL launch-sweep + parity + holding-page work — the open/draft cloud PRs **plus**
the divergent locally-applied Codex work — into `main`, resolving the partial/conflicting overlaps with a
Giddy merge strategy. Review folds in as needed, but **merging is the focus**: get a clean, CI-green main so
the operator can send the bob-tony preview link. `BBL_COUNTDOWN` stays ON (no public reveal this session).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0412.md` (in-progress, Codex Pods-importer lane) and
  `docs/sprints/SESSION_0411.md` (closed) for the sweep-PR + holding-page carryover.
- Carryover: SESSION_0411 merged the first sweep fleet (#98–#107) + the claim flow (#108) and **left the
  holding-page + avatar integration uncommitted** pending photo curation. SESSION_0412 ran the supervised
  Pods importer (prod data, dry-run). This session is the operator's **explicit new GOAL** (overrides the
  empty 0412 "Next session" block): consolidate everything outstanding into main.

### Branch and worktree

- Branch: `main` (local == origin/main, 0 ahead / 0 behind)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: dirty — the held BBL holding-page work + the divergent Codex landing/drawer changes.
  **`apps/web/app/(web)/layout.tsx` contains unresolved `<<<<<<< ours / >>>>>>> theirs` conflict markers**
  from a half-finished local merge of #118.
- Current HEAD at bow-in: `0548c36f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming/presentation (sweeps, holding page), auth/onboarding (parity), payments (#116 Stripe webhook), email (#116 lifecycle). |
| Extension or replacement | Extension: all PRs build on existing components/primitives; no Dirstarter substrate replaced. |
| Why justified | Launch finish needs every swept surface + the holding page + parity in one coherent main. |
| Risk if bypassed | Divergent Codex/local work and untested parity drafts could regress shared, non-BBL-gated chrome. |

Live docs checked during planning: `component-launch-sweep-recipe.md`, BBL SoT set (cached), repo authority docs.

### Graphify check

- Graph status: current; 13,218 nodes, 25,754 edges, 1,782 communities, 2,058 files tracked.
- Queries: covered by PR file-lists (`gh pr diff --name-only`) + direct worktree diffs — exact overlap matrix below.

### Grill outcome (4 forks resolved)

1. **Holding page = RICH:** teaser hero + email capture, then full `<BblLanding showHero={false} holdingPage/>`,
   then `<BblFooter/>`, all behind the gate — built ON TOP of #118's brandable/`next-image`/server-belt-color engine.
2. **Scope = WHOLE FLEET:** #117, #118, #110, #111, #112, #113, #114, #115, #116, #119.
3. **#116 (emails + Stripe webhook) = MERGE NOW** (investigate the failing unit test first).
4. **Countdown stays ON:** push to main, Tony gets the `/preview?token=bob-tony-BBL-preview` link; photo curation +
   public reveal flip are a later session.

### Drift logged

- **D-024/D-025 open** (bun deploy; R2 case-sensitive keys) — carry.
- **D-029** register gap (prod tree slug `bbl-lineage`) — carry from 0410/0411/0412.

## Petey plan

### Goal

Land the whole BBL launch fleet on a CI-green `main` via a conflict-aware merge order, reconcile the divergent
local holding-page work as one commit, and confirm the bob-tony preview renders — countdown still ON.

### Overlap matrix (the merge problem)

| PR | State | CI | Overlaps |
| --- | --- | --- | --- |
| #117 drawer font | open | **Playwright FAIL** (Prisma→app-client chunk) | identical to local drawer files; `lineage-view-a-island` w/ #110 |
| #118 BBL landing | open | green | **divergent** from local landing/layout/rank-colors; local-only `bbl-footer`+`dirty-dozen-data` |
| #116 emails/Stripe | open | **unit FAIL** (assertion TBD) | shared docs (`wiki/index`, `SESSION_0411`) |
| #110 lineage scroll | draft | green | `lineage-view-a-island` w/ #117 |
| #111 courses | draft | TBD | recipe doc |
| #112 directory/[slug] | draft | TBD | recipe doc |
| #113 schools/[slug] | draft | TBD | recipe doc |
| #114 techniques | draft | TBD | recipe doc, `custom-component-inventory`, `wiki/index` |
| #115 onboarding parity | draft | TBD | `components/app/sidebar` w/ #119 — **shared chrome** |
| #119 header/nav parity | draft | TBD | `app/layout`, `styles.css`, `header`, `sidebar`, `brand-context` — **shared chrome** |

### Merge order (Giddy — least-conflict + BBL-critical first, shared chrome last)

1. **#118** (green) → merge → then **local holding-page reconciliation commit** (footer + dirty-dozen-data +
   resolve `layout.tsx` to the RICH shape on top of merged #118). Clears the biggest conflict + the Tony surface.
2. **#117** — fix the Prisma-in-client Playwright bug first, then merge (and `git checkout` the now-redundant local drawer files).
3. **#110** lineage scroll (rebase post-#117, both touch `view-a-island`).
4. **#111 → #112 → #113 → #114** page sweeps, sequential (recipe-doc cascade; union-resolve each).
5. **#116** emails/Stripe — pin + fix the failing unit test, then merge.
6. **#115 → #119** parity into shared chrome — verify CI + review, sequence (both touch `sidebar`), individual go.

### Parallelism

Sequential by default (shared docs + shared chrome). Independent draft CI verification can run concurrently.

### Open decisions

- Resolved at grill (4 forks above). Per-merge **go/no-go is the operator's** (explicit-push-authorization).

### Risks

- Untested parity drafts (#115/#119) touch non-BBL-gated shared chrome → can regress TB/WEKAF/Baseline. Gate hard.
- #117 carries a real Prisma-in-browser regression; the identical local copy carries it too.
- Recipe-doc/`wiki/index` cascade re-conflicts each sweep merge (known 0411 gotcha — union resolver).

### Scope guard

- `BBL_COUNTDOWN` stays ON; no public reveal; no member-photo curation this session.
- No new prod schema migration (importer lane is 0412's, not this session's).
- Per-action confirmation before every merge/push (operator memory).
- Clean throwaways before any commit: `app/zz-teaser-preview/`, `teaser-plus-landing.jpeg`.
- Operate from `/Users/brianscott/dev/ronin-dojo-app`; FS-0024 guard before mutating git.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0413_TASK_01 | complete | Bow-in: read rituals/recipe/0411/0412, built the PR overlap matrix, diagnosed #117 (Prisma→client) + #116 (unit) CI, grilled 4 forks. |
| SESSION_0413_TASK_02 | partial | Merged #118 (`11be2579` harden BBL launch surfaces). Rich holding page built (`5413dc15`) then **reverted** (`ec3c8c11`); kept the simpler dark cinematic teaser instead (`6fee5f2b` bundled logo, `fb888576` restore dark hero). |
| SESSION_0413_TASK_03 | superseded | Pivot to D12 — multi-brand PR fleet abandoned; #117 not merged. |
| SESSION_0413_TASK_04 | superseded | D12 — #110 abandoned. |
| SESSION_0413_TASK_05 | superseded | D12 — page sweeps #111–#114 abandoned. |
| SESSION_0413_TASK_06 | superseded | D12 — #116 emails/Stripe abandoned (port to new repo later). |
| SESSION_0413_TASK_07 | superseded | D12 — parity #115/#119 abandoned. |
| SESSION_0413_TASK_08 | superseded | D12 — consolidation goal dropped; preview link not the close criterion. |
| SESSION_0413_TASK_09 | complete | **PIVOT:** ratified SOT-ADR **D12** (BBL → own single-brand repo via subtractive fork) + amendment (fork point = now; cutover = Vercel project move; first data task = recover reconciler). Committed 0411/0412/0413 logs (`1bf5cf57`). |

## What landed

The session **changed direction mid-flight.** The planned "merge the whole PR fleet into main"
consolidation was started but abandoned in favor of a strategic pivot:

- **#118 merged + hardened** (`11be2579`) — BBL landing engine (brandable / `next-image` /
  server-belt-color), plus the `bbl-rank-colors.ts` helper and `bbl-landing/*` token cleanups.
- **Rich holding page built then reverted** — `5413dc15` layered a rich pre-launch holding page on
  #118's engine; `ec3c8c11` reverted it. Net public surface kept = the **simpler dark cinematic
  teaser**: `6fee5f2b` (show the bundled BBL logo, not the text wordmark) + `fb888576` (restore the
  dark cinematic hero over #118's theme-token reskin). Still behind `BBL_COUNTDOWN`.
- **🔱 PIVOT — SOT-ADR D12 ratified** (`1bf5cf57`): BBL extracts to **its own single-brand repo** via
  a **subtractive fork** of `ronin-dojo-app` (strip the 4-brand harness, keep the engine; prune
  ~122→~62 models; fresh Neon, re-migrate from WP+monorepo+Pods; cutover = re-attach
  `blackbeltlegacy.com` to a new Vercel project). Plus the D12 amendment (fork point = now; carry the
  held patch; abandon PR fleet #110–119; first data task = recover `reconcile-pods.mjs`). Committed
  the SESSION 0411/0412/0413 logs alongside.
- **Reconciler rescued** to `apps/web/scripts/reconcile-pods.mjs` (out of ephemeral `/tmp`) — left
  **untracked** at session end; to be committed to the *new* repo (D12 first data task).

## Decisions resolved

- **D12 supersedes the entire 0413 plan.** The 4-brand consolidation premise is dropped; BBL gets its
  own repo + Vercel deployment. The 4 grill forks above (holding page RICH / whole fleet / #116 in /
  countdown ON) are **obsolete** — only "countdown stays ON" survives.
- Public BBL surface = dark cinematic teaser (logo + hero), countdown ON. No public reveal.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/(home)/bbl/bbl-landing/*` | #118 merge: brandable engine, `bbl-rank-colors.ts`, token cleanups, teaser hero/logo restore. |
| `apps/web/app/(web)/layout.tsx` | #118 / teaser wiring (conflict markers resolved). |
| `apps/web/scripts/reconcile-pods.mjs` | Reconciler rescued from `/tmp` (untracked — carries to new repo). |
| `docs/product/black-belt-legacy/SOT-ADR.md` | **D12 + amendment** added. |
| `docs/sprints/SESSION_0411.md`, `SESSION_0412.md`, `SESSION_0413.md` | Session ledgers committed. |

## Verification

- `git log 0548c36f..HEAD` confirms the 6-commit range landed on `main` (CI-green per push).
- Public BBL surface = dark cinematic teaser behind `BBL_COUNTDOWN` (no reveal). Not re-screenshotted
  this close — superseded by the D12 fork (the teaser carries forward as a patch, not the deliverable).
- D12 + amendment present in `SOT-ADR.md`; reconciler present at `apps/web/scripts/reconcile-pods.mjs`.

## Open decisions / blockers

- None blocking. The entire 0413 merge plan is **dropped** by D12. Carry-forward: D-024/D-025 (bun
  deploy / R2 case-sensitive keys), D-029 (register tree slug `bbl-lineage`) — relevant to the new repo.

## Next session

### Goal

Begin the **D12 BBL extraction** — but operator-driven, not on autopilot (operator directive
SESSION_0414: "nothing is canonical anymore; I drive"). First: **Petey-plan the extraction**
(grill the un-pinned mechanics: new repo name/remote, FK-safe prune clusters + order, migration
sequence WP→monorepo→Pods, fresh Neon + Vercel + CI setup, how the held teaser patch carries in,
where/when to commit the recovered reconciler) into a session roadmap before any structural move.

### First task

SESSION_0414 opened, this 0413 closed cleanly. Then Petey-plan grill with the operator. No repo
created and no code touched until the operator says go.

## Review log

Light close (operator directive: nothing canonical, lean ceremony). The merged work (#118 + teaser)
shipped green to `main`; the strategic output (D12) was operator-grilled before ratification.

## Hostile close review

- **Did the planned goal complete?** No — and intentionally. The consolidation was abandoned for D12.
  Closing the session as `closed` with most tasks `superseded` is the honest record, not a failure to hide.
- **Loose end:** `apps/web/scripts/reconcile-pods.mjs` is untracked and is the CSV-export version, NOT
  yet rebuilt against `local.sql` as D12 specifies. It survives in the working tree → carry to 0414.
- **Risk:** the abandoned PRs (#110–119) remain open on GitHub; they should be closed with a pointer to
  D12 so the fleet doesn't get re-merged by mistake. Flagged for the operator (not done this session).

## ADR / ubiquitous-language check

- **SOT-ADR D12** added (supersedes D11's in-place flip for BBL; D1/D3/D4/D6 carry forward). No new
  ubiquitous-language terms; "subtractive fork", "harness", "engine", "parts-donor" are framing, not domain nouns.

## Reflections

A reframe landed as a reversal: three sessions of multi-brand-launch consolidation gave way to "the
friction is the harness, not the domain — fork it out." The merged #118 engine + teaser still have value
as the patch that carries into the new repo, so the session wasn't wasted motion. Lesson reinforced:
when the plan and the operator's evolving understanding diverge, stop executing the plan and re-decide.

## Full close evidence

- `git log --oneline 0548c36f..HEAD` → 6 commits (#118 merge, holding-page add+revert, 2 teaser fixes,
  docs+D12). All on `main`.
- `docs/product/black-belt-legacy/SOT-ADR.md` contains D12 + the D12 amendment.
- `apps/web/scripts/reconcile-pods.mjs` present (228 lines, untracked).
- WP migration source verified present: `~/Local Sites/BlackBeltLegacy/app/sql/local.sql` (316 MB).
