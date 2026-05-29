---
title: "SESSION 0286 — bbl.local smoke: og:site_name + JSON-LD end-to-end verify"
slug: session-0286
type: session--review
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: claude-session-0286
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0285.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0286 — bbl.local smoke: og:site_name + JSON-LD end-to-end verify

## Date

2026-05-28

## Operator

Brian + claude-session-0286 (Petey orchestrating, Doug verifying)

## Goal

Close out the deferred SESSION_0285_TASK_03 verification: prove the brand-aware
`og:site_name` + JSON-LD refactor works end-to-end on a live dev server. Smoke
`bbl.local` for `/about` (+ `/terms`, `/privacy`, `/blog`) — `og:site_name` and
JSON-LD organization/website name must equal "Black Belt Legacy" with **0**
"Baseline Martial Arts" leaks. Then flip the white-label runbook audit rows to ✅.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0285.md` (closed)
- Carryover: SESSION_0285 brand-threaded the two `lib/pages.ts` helpers
  (`getPageData`/`getPageMetadata` → async, internal `getRequestBrand()`),
  added `getMetadataConfig(brand)` + brand params to `getOrganization`/`getWebSite`,
  and awaited 46 callers. Verified via typecheck (0 errors) + biome (clean) only.
  **Manual `bbl.local` smoke was explicitly deferred** (TASK_03 done statically).
  This session performs that deferred live smoke.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | content/SEO (metadata pipeline) — verification only, no code change to the pipeline |
| Extension or replacement | Neither — this session verifies the SESSION_0285 extension and updates docs |
| Why justified | SESSION_0285 deferred the live smoke; the white-label runbook audit rows cannot be flipped to ✅ without end-to-end proof on a running server |
| Risk if bypassed | Audit ledger claims a fix is shipped that was never observed live; a brand leak could persist undetected on BBL/RDD subpages |

### FAILED_STEPS check

- FS-0002 (dev server command): closed — using `cd apps/web && npx next dev --turbo` per `dev-environment.md`. Do NOT use `bun dev`/`pnpm dev`/`bunx next dev`.
- FS-0024 (Bash cwd drift): every git/bun/curl-after-cd call prefixed with `cd /Users/brianscott/dev/ronin-dojo-app …`; harness shell-guard active.
- No open/mitigated entries in the metadata/SEO/brand area.
- Drift register: no open entries affecting the brand-metadata lane (D-016 Base UI migration closed).

## Petey plan

This session is a single-lane verification + doc flip — no code change to the
metadata pipeline expected. Petey waived a separate petey-plan file: task is
clear, single-area, and finishes a deferred verification (criteria per
`docs/agents/petey.md`).

| ID | Status | Description | Owner |
| --- | --- | --- | --- |
| SESSION_0286_TASK_01 | ✅ done | Start dev server, smoke `bbl.local` `/about`+`/terms`+`/privacy`+`/blog`: og:site_name + JSON-LD = "Black Belt Legacy", 0 Baseline leaks | Doug |
| SESSION_0286_TASK_02 | ✅ done | Spot-check default host still resolves Baseline (no regression) | Doug |
| SESSION_0286_TASK_03 | ✅ done | Flip white-label runbook audit rows (og:site_name + JSON-LD) to ✅ + tick checklist | Petey |

## Task log

### SESSION_0286_TASK_01 — BBL live smoke (Doug)

Dev server was already running on `:3000` (PID 43988, serving `apps/web`); a
second `npx next dev --turbo` correctly refused to double-start, so the existing
server was used. Tested via `curl -H "Host: bbl.local"` (no `/etc/hosts` edit
needed). Results (all HTTP 200):

| Page | `og:site_name` | JSON-LD Org / WebSite name | "Baseline Martial Arts" hits |
| --- | --- | --- | --- |
| `/about` | Black Belt Legacy | Black Belt Legacy / Black Belt Legacy | 0 |
| `/terms` | Black Belt Legacy | (no JSON-LD graph emitted) | 0 |
| `/privacy` | Black Belt Legacy | (no JSON-LD graph emitted) | 0 |
| `/blog` | Black Belt Legacy | Black Belt Legacy / Black Belt Legacy | 0 |

`/terms` + `/privacy` emit **0** `ld+json` blocks by design; `/about` + `/blog`
emit 2 each. og:site_name resolves brand-aware on all four. **0** residual
Baseline leaks anywhere on BBL. ✅

### SESSION_0286_TASK_02 — regression spot-check (Doug)

- `baseline.local/about`: og:site_name = "Baseline Martial Arts", JSON-LD Org = "Baseline Martial Arts" ✅
- `localhost/about` (no Host header): og:site_name = "Baseline Martial Arts", JSON-LD Org = "Baseline Martial Arts" ✅

Confirmed against source: `apps/web/lib/brand-context.ts` maps `localhost` →
`BASELINE_MARTIAL_ARTS` ("during MVP build", line 31); `DEFAULT_BRAND` (truly
unrecognized host) = `RONIN_DOJO_DESIGN`. The plan's "default host still resolves
Baseline" expectation holds. No regression: BBL is isolated, Baseline unchanged.

### SESSION_0286_TASK_03 — runbook audit flip (Petey)

Flipped the white-label runbook: added an `og:site_name`/metadata audit row (✅
done), flipped the JSON-LD row to ✅ done, rewrote the two "Deferred" prose
blocks to "✅ RESOLVED (SESSION_0285, verified live SESSION_0286)", appended the
SESSION_0286 verification evidence to the SESSION_0284 verification line, and
ticked the "Page metadata" + "JSON-LD structured data" surface-checklist boxes.

**Drift fixed (out-of-band):** `docs/runbooks/dev-environment.md` brand→host
table claimed `localhost → RONIN_DOJO_DESIGN`. Source says `localhost →
BASELINE_MARTIAL_ARTS`. Corrected the RDD + Baseline rows and normalized the
table separator to padded style (cleared MD060 warnings).

## What landed

- White-label runbook audit table + checklist flipped to ✅ for `og:site_name` and JSON-LD; both "Deferred" prose blocks rewritten as RESOLVED with live proof.
- `dev-environment.md` brand→host table corrected (`localhost` → Baseline, not RDD).
- No application code changed this session — verification + docs only. The SESSION_0285 fix is confirmed working end-to-end on a live server.

## Files touched

- `docs/runbooks/white-label-site-runbook.md` (audit rows, prose, checklist, frontmatter)
- `docs/runbooks/dev-environment.md` (brand→host table fix, separator, frontmatter)
- `docs/sprints/SESSION_0286.md` (this file)

## Decisions resolved

- SESSION_0285 `og:site_name` + JSON-LD brand-threading is **verified live**, not just statically — the deferred TASK_03 from SESSION_0285 is now closed.
- `localhost` intentionally resolves to Baseline during MVP build (not a bug); runbook corrected to match source.

## Open decisions / blockers

- None for this session. Next lane (BBL assets → S3 + media-upload CRUD, deferred from SESSION_0285) is large and needs its own petey-plan before implementation.

## Next session

### Goal

BBL assets → S3 + media-upload CRUD improvement (the larger lane deferred from
SESSION_0285 now that the og:site_name + JSON-LD fix is verified live).

### Inputs to read

- `docs/runbooks/white-label-site-runbook.md` → "What's left for the RDD live-demo" item 3 (brand assets from S3)
- `docs/architecture/program-plan.md` S6 scope + Wave D (Media model)
- SESSION_0286 (this file)

### First task

Petey: write `petey-plan-0287.md` scoping the assets→S3 + media-upload CRUD lane
(inventory the existing `Media`/`MediaAttachment` schema + any current upload
path, decide S3 vs existing MinIO local-dev story, define CRUD surface).

## Reflections

- The smoke was a 4-curl confirmation of an already-merged fix — the right call
  to do live rather than trust the static typecheck-only TASK_03 from SESSION_0285.
- A pre-existing dev server was already on `:3000`; Next's "another dev server is
  already running" guard is a clean signal to reuse rather than fight for the port.
- The shell-guard mangles multi-line `for` loops (curl dropped from PATH in the
  eval subshell); flat `;`-chained single-line commands are the reliable form.
- Verifying the `localhost → Baseline` mapping against `brand-context.ts` source
  (rather than trusting the runbook table) surfaced a stale doc — fixed in passing.

## Review log

- SESSION_0286_REVIEW_01 (Doug + Petey): TASK_01–03 reviewed. Verification is
  honest — evidence is raw `curl` output against a live server, not inferred.
  TASK_01/02 prove the SESSION_0285 fix end-to-end and confirm no Baseline
  regression; TASK_03 flips the audit ledger to match observed reality. No
  application code touched, so no code-review surface. No unresolved findings.

## Hostile close review

- **Plan sanity:** Single-lane verification + doc flip; finishes the explicitly
  deferred SESSION_0285_TASK_03. In scope, no scope creep (the assets→S3 lane was
  correctly deferred to its own session/plan).
- **Dirstarter alignment:** No baseline capability bypassed — this verifies an
  existing extension of the Dirstarter metadata pipeline and corrects docs.
- **Verification honesty:** Claims backed by literal `curl` + `grep` output
  (og:site_name, JSON-LD names, leak counts, HTTP 200) and a source read of
  `brand-context.ts`. No "should work" hand-waving.
- **Data integrity / security:** N/A — no schema, no auth, no payments, no
  production data touched. Smoke ran against local dev only.
- **WORKFLOW 5.0 compliance:** Petey waiver recorded (single-area, clear, finishes
  deferred verify); SESSION file has numbered tasks + task log; one primary lane.
- **Score:** 9.6/10. No score cap (no Dirstarter or data-integrity failure).
- **Unresolved findings:** none.

## ADR / ubiquitous-language check

- **ADR:** None needed. No architectural decision made, changed, or rejected —
  this session verified the SESSION_0285 decision (brand-aware metadata pipeline,
  already covered by ADR 0021/0022 brand chrome) and corrected a stale doc row.
- **Ubiquitous language:** No new or changed domain terms.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Bumped `updated`/`last_agent` on `white-label-site-runbook.md`, `dev-environment.md`, `wiki/index.md` → claude-session-0286 (2026-05-28). SESSION_0286 frontmatter set at creation. |
| Backlinks/index sweep | No new cross-file links introduced (runbooks already cross-referenced; SESSION_0286 `pairs_with` SESSION_0285). Added SESSION_0285 **and** SESSION_0286 rows to `wiki/index.md` session table (0285 was a pre-existing gap). |
| Wiki lint | `bun run wiki:lint` → 232 errors / 627 warnings repo-wide. **0 errors introduced** (the index.md broken links are pre-existing archived-session 0001–0220 link rot; my 0285/0286 rows point to live files and pass). 3 residual SESSION_0286 warnings of the repo-pervasive "text-followed-by-list" class (reduced from 5 via unwrap). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | Recorded above (9.6/10, no cap, no unresolved findings). |
| Review & Recommend | Next session goal written: yes (assets→S3 + media CRUD; first task = write petey-plan-0287). |
| Memory sweep | One feedback memory added: shell-guard mangles multi-line `for` loops (curl dropped from PATH); use flat `;`-chained commands. localhost→Baseline mapping not memoried (it's in source). |
| Next session unblock check | Unblocked — first task is a Petey planning task (write petey-plan-0287), no user input required. |
| Git hygiene | Branch `main`; `git worktree list` checked; staged docs-only changes; conventional `docs:` commit; pushed to `origin/main` (user authorized). See bow-out response for commit hash. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` run after git hygiene; final stats reported in bow-out response. |
