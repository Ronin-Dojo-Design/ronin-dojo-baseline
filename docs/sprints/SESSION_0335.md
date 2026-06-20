---
title: "SESSION 0335 — Doc-system ergonomics: lint-to-spec, finding-router, domain cards, verification SOP"
slug: session-0335
type: session--implement
status: closed
created: 2026-06-02
updated: 2026-06-02
last_agent: claude-session-0335
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0334.md
  - docs/protocols/wiki-lint.md
  - docs/rituals/closing.md
  - docs/knowledge/wiki/repo-truth-index.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0335 — Doc-system ergonomics: lint-to-spec, finding-router, domain cards, verification SOP

## Date

2026-06-02

## Operator

Brian + claude-session-0335 (Petey orchestration)

## Goal

Make the docs/protocols/runbooks more usable as agent pointers, from friction observed
navigating the system in SESSION_0334: realign wiki-lint R4 with its own documented spec
(git-based "edited-without-bumping-`updated`", plus a `stable:` opt-out) to kill the recurring
false-positive staleness noise; add a finding-router so agents know which ledger a finding
goes to; introduce per-domain context cards (`docs/domains/`, lineage first) and a canonical
frontmatter field table (add `domain`/`stable`, deprecate `author`/`use_count`); and write a
verification/testing SOP + guard registry so each session stops re-deriving the test model.

## Status

### Status: in-progress

## Bow-in

- Continuation of SESSION_0334 (closed/pushed `e19e009`) — operator asked what would make the
  doc system more usable; selected: finding-router + stable/R4 + YAML trim, lineage domain card,
  verification SOP + guard registry.
- Branch `main` @ `e19e009`, clean. FS-0024 guard passed.
- Key discovery: `docs/protocols/wiki-lint.md` R4 documents a **git-diff vs `updated`** check, but
  `scripts/wiki-lint.ts` R4 implements a **30-day calendar** threshold — implementation drift from
  spec. That calendar produces the same 4 false positives every session. R5 in the protocol is also
  stale (lists `health` as required; it was removed SESSION_0027).

## Petey plan

### Tasks

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0335_TASK_01 | pending | wiki-lint R4 → spec: skip `stable: true`; warn only when a file's last git commit is newer than its `updated` field (edited-without-bump). |
| SESSION_0335_TASK_02 | pending | wiki-lint.md protocol: fix R4 wording + R5 (`health` no longer required); add canonical frontmatter field table (required/recommended/optional `domain`,`stable`/deprecated `author`,`use_count`). |
| SESSION_0335_TASK_03 | pending | Finding-router table (which ledger a finding goes to) → `closing.md` + `CLAUDE.md` pointer. |
| SESSION_0335_TASK_04 | pending | Drop `author` from `_template-runbook.md`; drop `use_count` from the SESSION_0334 ntfy runbook. |
| SESSION_0335_TASK_05 | pending | `docs/domains/` hub + `docs/domains/lineage.md` context card (`domain: lineage`); refresh `repo-truth-index.md` and point it at the domain cards. |
| SESSION_0335_TASK_06 | pending | `docs/runbooks/dev-environment/verification-and-testing.md` (unit/DB/e2e/CI gate) + guard registry; link from runbooks hub. |

### Scope guard

- No app/Prisma code changes — this is a docs + lint-tooling session.
- Do NOT mass-edit the 71 `author:` / 6 `use_count:` docs — deprecate in template + convention only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0335_TASK_01 | landed | wiki-lint R4 realigned to its own spec — working-tree-diff vs `updated` (+ `stable: true` opt-out). Killed the recurring 4 false-positive staleness warnings; a clean tree is now 0 R4 warnings. |
| SESSION_0335_TASK_02 | landed | `wiki-lint.md` protocol: fixed R4 wording + stale R5 (`health` no longer required); added the canonical frontmatter field table (required/recommended/optional `domain`,`stable`/deprecated `author`,`use_count`). |
| SESSION_0335_TASK_03 | landed | Finding-router table (which ledger each finding goes to) → `closing.md` §6.7 + `CLAUDE.md` pointer. |
| SESSION_0335_TASK_04 | landed | Dropped `author` from the 4 doc templates (concept/runbook/file/decision); dropped `use_count` from the ntfy runbook; added `domain:`. |
| SESSION_0335_TASK_05 | landed | **No `docs/domains/`** — the domain-card pattern already exists (`runbooks/domain-features/*-hub.md`). Enhanced `lineage-hub.md` with a code-entry-points map + privacy invariants/guards; refreshed `repo-truth-index.md` with a domain-hub pointer. |
| SESSION_0335_TASK_06 | landed | New `verification-and-testing.md` runbook (verification layers, CI map, why DB tests fail locally, guard registry) + hub link. Writing it surfaced the CI gap below. |
| SESSION_0335_TASK_07 | landed | **CI to best-practice** (operator ask): new `ci.yml` runs Biome (`biome ci`) + typecheck + unit tests (Postgres service) — the gates that previously ran nowhere; least-privilege `permissions`, concurrency, timeouts. Hardened `playwright.yml` with `permissions: contents: read`. Cleared 8 pre-existing `biome ci` errors to a green baseline (formatting + imports + a11y via `inputComponents`). |
| SESSION_0335_TASK_08 | landed | **Deploy cadence** (operator ask): Vercel CLI showed ~9 deploys/17h, every push to `main` → prod, no ignore-step. Added `vercel.json` `ignoreCommand` (`git diff --quiet HEAD^ HEAD -- apps/web …`) so docs/CI/scripts commits don't deploy; documented in CLAUDE.md + the verification runbook. |

## What landed

- **wiki-lint R4 now matches its documented spec.** It was a 30-day calendar (4 false positives every session); now it's the working-tree-diff vs `updated` the protocol always described, plus a `stable: true` opt-out. Clean tree ⇒ 0 R4 warnings; it fired correctly mid-session on 2 cross-midnight docs (dogfood proof).
- **Doc-system pointers:** finding-router (closing.md §6.7 + CLAUDE.md), canonical frontmatter table (added `domain`/`stable`, deprecated `author`/`use_count`), lineage-hub code-entry-points + guard map, repo-truth-index domain-hub pointer.
- **CI raised to best practice:** the missing Biome/typecheck/unit gates now run in `ci.yml` (least-privilege perms, concurrency, timeouts, Postgres for unit); `playwright.yml` hardened with read-only token. Repo made `biome ci`-clean (8 latent errors fixed).
- **Production deploys decoupled from pushes** via Vercel `ignoreCommand` — only `apps/web`/deps/build-config changes deploy.

## Decisions resolved

- **No parallel `docs/domains/` tree** — enhance the existing `runbooks/domain-features/` hubs instead (avoids the fragmentation the request was trying to fix).
- **R4 semantics:** working-tree diff, not historical commits (a 2026-05-29 bulk commit proved last-commit comparison too noisy) and not a calendar.
- **YAML:** add `domain` + `stable`; deprecate `author` (redundant with `last_agent`, ~13% coverage) + `use_count` (unmaintained, mostly `0`). Stop adding in templates; don't mass-rewrite existing docs.
- **a11y guard:** teach Biome the `Checkbox` primitive via `inputComponents` (project-wide) rather than per-line suppressions.
- **Deploy cadence:** keep trunk-based push-at-close, gate prod deploys on deployable-path changes (ignore-step). Release-branch decoupling noted as available but not needed now.

## Files touched

| File | Change |
| --- | --- |
| `scripts/wiki-lint.ts` | R4 rewritten to working-tree-diff + `stable:` opt-out (removed the calendar + `gitLastCommitDates` history scan). |
| `docs/protocols/wiki-lint.md` | R4/R5 fixes + canonical frontmatter field table. |
| `docs/rituals/closing.md` | §6.7 finding-router table. |
| `CLAUDE.md` | Finding-router pointer + push/deploy-cadence bullet. |
| `docs/knowledge/templates/_template-{runbook,concept,file,decision}.md` | Dropped `author`. |
| `docs/runbooks/dev-environment/ntfy-pushover-telegram.md` | Dropped `use_count`; added `domain: ops`. |
| `docs/runbooks/domain-features/lineage-hub.md` | Code-entry-points map + privacy invariants/guards + `domain: lineage`. |
| `docs/knowledge/wiki/repo-truth-index.md` | Domain-hub pointer (§4); refreshed frontmatter (dropped stale `author`). |
| `docs/runbooks/dev-environment/verification-and-testing.md` | **New** — verification layers, CI map, DB-local note, guard registry, deploy gating. |
| `docs/runbooks/README.md` | Linked the verification runbook. |
| `.github/workflows/ci.yml` | **New** — Biome + typecheck + unit (Postgres) gates; least-privilege perms. |
| `.github/workflows/playwright.yml` | Added `permissions: contents: read`. |
| `apps/web/biome.json` | `noLabelWithoutControl` → `inputComponents: ["Checkbox"]`. |
| `apps/web/.../promotion-events/*.ts(x)`, `dashboard/events/new/page.tsx`, `components/web/organizations/create-organization-form.tsx` | `biome ci` baseline: formatting + import fixes; removed a now-dead suppression. |
| `vercel.json` | `ignoreCommand` to skip non-deployable builds. |
| `docs/sprints/SESSION_0335.md` | This ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | 0 errors. R4 correctly fired on 2 cross-midnight docs (now bumped); clean after. The old 4 false positives are gone. |
| `cd apps/web && bun biome ci .` | Exit 0 — clean (after fixing 8 pre-existing errors). |
| `cd apps/web && bun run typecheck` | Pass (auto-fix was line-wrapping only). |
| Workflow YAML | `ci.yml` + `playwright.yml` parse OK (python yaml). |
| `vercel ls` | Confirmed ~9 deploys/17h, `main`→Production, no prior ignore-step. |
| `git diff --quiet HEAD^ HEAD -- apps/web …` semantics | Verified against Vercel docs: exit 0 = skip, exit 1 = deploy. |

## Open decisions / blockers

- **ntfy runbook markdownlint warnings** (MD060/MD040/MD031, ~28) are pre-existing in the subagent-authored file; not part of `wiki:lint` (R8) so non-blocking. Clean up when next editing that file.
- **Optional bigger deploy change** (not done): move Vercel Production Branch to a `release` branch for milestone-only prod. Available if per-push prod (when app code changes) still feels too frequent.

## ADR / ubiquitous-language check

- ADR **not required** — process/tooling/config changes (lint rule, CI workflows, deploy gating, doc pointers); no architecture or schema decision. The `domain`/`stable` frontmatter fields are documented in `wiki-lint.md` (the frontmatter spec), not an ADR.
- Ubiquitous language **not required**.

## Reflections

- **Implementation drifted from its own spec, silently.** wiki-lint R4 documented a git-diff check but shipped a calendar; the noise was treated as "known warnings" for months. Realigning code to the existing protocol was higher-value than any new idea — worth checking impl-vs-spec when a gate is chronically noisy.
- **Writing the verification runbook found a hole I'd mis-described.** Cataloguing "what runs where" surfaced that `bun test` + the guards run on **no** automated gate, and that SESSION_0334's "CI-verified guard" was wrong. Documentation as audit. The fix (a CI job) then exposed 8 latent `biome ci` errors — debt that accumulates exactly because the gate never ran.
- **The domain-card request was already solved.** `lineage-hub.md` existed; the gap was code-entry-points + discoverability, not a new tree. Checking for the existing pattern avoided fragmenting the thing the request wanted to consolidate.
- **Deploy frequency ≠ push frequency.** The felt pain was per-commit prod deploys (incl. docs), not git pushes. The cheap fix was decoupling (ignore-step), not changing the trunk-based workflow.

## Hostile close review

### SESSION_0335 — doc-system ergonomics + CI + deploy cadence

- **Giddy:** Pass. Each change is grounded in observed friction (R4 false positives, the missing CI gate found via the runbook, real `vercel ls` data) and verified (wiki:lint, `biome ci` exit 0, typecheck, Vercel exit-code confirmed against docs). No unverified claims shipped; the prior session's overclaim was corrected in writing.
- **Doc system / Desi:** Pass. No duplicate domain tree; existing hub enhanced; frontmatter taxonomy now has a single authoritative table.
- **Kaizen aggregate:** 9/10 — high-leverage, dogfooded (R4 caught its own author mid-session). −1: the unit CI job is best-effort until its first real run proves all DB-dependent unit tests pass with `migrate deploy` (no seed).

### Findings (severity ≥ medium)

#### SESSION_0335_FINDING_01 — unit tests + guards ran on no automated gate (resolved)

- **Severity:** medium
- **Task:** SESSION_0335_TASK_06 / TASK_07
- **Evidence:** only `playwright.yml` existed; no hooks; `bun test`/biome unrun in CI.
- **Impact:** the invariant guards (incl. SESSION_0334's dropdown guard) didn't actually gate; SESSION_0334 described them as CI-verified.
- **Required follow-up:** none structurally — `ci.yml` now runs them. Watch the first `unit` job run; add a seed step if a DB-dependent test needs it. Tracked in [wiring-ledger](../knowledge/wiki/wiring-ledger.md).
- **Status:** addressed

## Next session

### Goal

Resume `petey-plan-0305` (Phase 3e SVG connectors → 3f PDF export → Phase 4 Trophy slices + leaderboard). Confirm the first real `ci.yml` run is green (esp. the `unit` job).

### First task

Phase 3e — SVG 90° board connectors. Before coding, glance at the `ci.yml` run on this push to confirm the new gates pass.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log SESSION_0335_TASK_01–08. |
| JETTY/frontmatter sweep | This file + wiki-lint.md, closing.md, lineage-hub.md, repo-truth-index.md, README.md, verification runbook, templates, ntfy runbook all stamped `last_agent: claude-session-0335` / `updated: 2026-06-03`. |
| Backlinks/index sweep | verification runbook backlinks README + wiki index; lineage-hub ↔ verification cross-linked; wiki index gets SESSION_0335. |
| Wiki lint | `bun run wiki:lint` → 0 errors (R4 false-positive class eliminated; 2 cross-midnight warnings fixed). |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | Present; FINDING_01 (CI-enforcement gap) resolved. |
| Review & Recommend | Next-session goal + first task written. |
| ADR / ubiquitous-language | None needed (recorded above). |
| Memory sweep | None new — CI/deploy cadence lives in CLAUDE.md (always-loaded) + the verification runbook. |
| Next session unblock | Unblocked — Phase 3e self-contained; watch the first `ci.yml` run. |
| Git hygiene | FS-0024 guard; on `main`; single close push — hash reported at bow-out. |
| Graphify update | Ran pre-commit; stats in bow-out chat. |
