---
title: "SESSION 0351 — Schema and repo cleanup doc alignment"
slug: session-0351
type: session--open
status: closed
created: 2026-06-06
updated: 2026-06-06
last_agent: codex-session-0351
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0350.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0351 — Schema and repo cleanup doc alignment

## Date

2026-06-06

## Operator

Brian + codex-session-0351

## Goal

Run a quick Petey-led schema and repo cleanup alignment session: review legacy `ENTER_THE_DOJO.md` against the current Prisma/Next/Better Auth stack, sweep architecture docs and ADRs for stale or unbuilt claims, stage archive/status cleanup candidates, and record deferred wiring in the canonical ledgers while preserving the SESSION_0350 `/directory` filter continuation for SESSION_0352.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0350.md` (closed).
- Carryover: SESSION_0350 shipped the first faceted `/directory` browse slice and set the next implementation session as cross-facet filters plus People pagination convergence. Brian redirected this session into a quick cleanup/doc-alignment pass; the SESSION_0350 next-session implementation work should resume in SESSION_0352.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0351.md`.
- Current HEAD at bow-in: `b098926`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is `/Users/brianscott/dev/ronin-dojo-app` (not `dirstarter_template`). FS-0024 guard passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/schema docs, admin/dashboard docs surface, theming/brand chrome docs, content/docs navigation. |
| Extension or replacement | Extension: align Ronin-specific schema/domain docs and admin-only docs navigation around the existing Next.js/Prisma/Better Auth/Dirstarter substrate; do not replace substrate. |
| Why justified | The user requested a short cleanup pass before the planned `/directory` implementation continuation, and the target docs can mislead future implementation if stale. |
| Risk if bypassed | Stale WordPress/Pods or unbuilt brand-switcher/admin-dashboard claims could drive the next schema or admin work against the wrong stack. |

Live docs checked during planning: local Dirstarter docs inventory read; live URL refresh deferred unless code work touches a Dirstarter-owned layer.

### Graphify check

- Graph status: current enough for planning; `graphify stats` at bow-in: 9443 nodes, 14787 edges, 1392 communities, 1594 files tracked.
- Queries used:
  - `schema enum boolean relationship ENTER_THE_DOJO Pods WordPress GraphQL Passport DirectoryProfile Organization Discipline RankSystem Rank Membership RegistrationEntry`
  - `admin dashboard docs navigator graphify brand switcher brand chrome super admin bbl.local baselinemartialarts.com`
  - `automation cron pulse monitor storage security billing webhook app health repo-code-glossary`
- Files selected from graph:
  - `docs/architecture/s1-schema-design.md`
  - `docs/architecture/s2-schema-additions.md`
  - `docs/architecture/decisions/0008-brand-switcher.md`
  - `docs/architecture/decisions/0022-brand-chrome-resolution.md`
  - `apps/web/app/admin/brand-settings/page.tsx`
  - `apps/web/app/admin/brand-settings/_components/brand-settings-form.tsx`
  - `apps/web/server/admin/brand-settings/actions.ts`
  - `apps/web/server/admin/brand-settings/queries.ts`
  - `docs/runbooks/white-label-site-runbook.md`
  - `docs/runbooks/deploy/bbl-production-runbook.md`
- Verification note: exact files still need direct inspection after Petey grill; Graphify used as navigation, not proof.

### Grill outcome

- Round 1 decisions:
  - `ENTER_THE_DOJO.md`: patch only if the schema/docs gap is clear and small; route larger schema/product work to `wiring-ledger.md`.
  - Admin docs navigator: try a bounded owner/admin-only slice now.
  - Architecture/ADR sweep: update stale docs directly where truth is clear, and also create a reusable `repo-alignment-report.md` for weekly/on-demand sweeps.
  - Automations/pulses: graph the current monitor/cron/storage/security substrate now; YouTube summary can refine later, but should not block other tasks.
  - Glossary: expand `repo-code-glossary.md` with technically plain terms that help both a senior dev and a non-technical operator understand the project/repo context.

## Petey plan

### Goal

Review legacy schema doctrine and current repo/docs alignment, land small safe fixes, create a reusable alignment report, add owner/admin repo-doc navigation, and record bigger automation/schema/brand-switcher work in the right ledgers.

### Tasks

#### SESSION_0351_TASK_01 — Petey grill and cleanup scope lock

- **Agent:** Petey
- **What:** Resolve session boundaries for legacy schema intake, docs status sweep, ADR/doc alignment, admin docs navigator visibility, brand/BBL deferrals, `fallow`, and close/push gates.
- **Steps:**
  1. Ask Brian the minimum decision questions needed to avoid widening this cleanup pass into an implementation epic.
  2. Convert answers into a 1–3 task plan in this SESSION file.
  3. Mark any deferred implementation as wiring-ledger/drift/manual-boundary entries rather than expanding scope.
- **Done means:** `## Grill outcome` and `## Petey plan` contain locked decisions and task IDs before non-ledger edits start.
- **Depends on:** nothing.

#### SESSION_0351_TASK_02 — Legacy ENTER_THE_DOJO schema intake

- **Agent:** Petey → Giddy
- **What:** Compare the legacy WordPress/Pods-era `ENTER_THE_DOJO.md` doctrine to the current Prisma/Next/Better Auth schema and docs.
- **Steps:**
  1. Verify the legacy source copy and record provenance.
  2. Translate WordPress/Pods language into current-stack terms: Prisma models/services, ContentAtom/Event/Tournament content, server actions/API routes, query payloads, and GraphQL/mobile API considerations.
  3. Patch clear docs/schema wording where small and safe; do not add a migration unless a missing field is unambiguous and low-risk.
  4. Add larger schema/content/org-chart candidates to `wiring-ledger.md` or the alignment report.
- **Done means:** A repo-native schema-intake artifact exists, stale Pods language is translated, and any larger candidates are ledgered.
- **Depends on:** SESSION_0351_TASK_01.

#### SESSION_0351_TASK_03 — Owner/admin repo docs navigator

- **Agent:** Cody → Doug
- **What:** Add a bounded admin-only repo docs/navigation surface that exposes the generated docs navigator and Graphify HTML from the admin dashboard.
- **Steps:**
  1. Extend the existing admin sidebar/command palette, not a parallel admin shell.
  2. Serve or link the existing `docs/index.html` navigator without moving generated docs into public source truth.
  3. Link `/graphify.html` and clearly mark it as a local/dev navigation artifact.
  4. Keep access behind the existing admin layout; no tournament-director or lineage-tree-admin access.
- **Done means:** Admin users can reach a Repo Docs page from the dashboard/nav; local artifacts open without weakening public access posture.
- **Depends on:** SESSION_0351_TASK_01.

#### SESSION_0351_TASK_04 — Architecture alignment report and ledger sweep

- **Agent:** Petey → Giddy
- **What:** Create/update `repo-alignment-report.md`, sweep the named ADR/architecture docs for obvious stale claims, and route unbuilt work to canonical ledgers.
- **Steps:**
  1. Compare current repo truth against the user-named ADRs and architecture docs, prioritizing brand switcher/chrome, Dirstarter alignment, data model, cache/security/monetization docs.
  2. Patch stale doc text where the correction is clear from current code/sessions.
  3. Add unbuilt brand switcher, docs navigator hardening, BBL domain visibility, and pulse/cron work to `wiring-ledger.md` or existing manual boundaries.
  4. Add the report to wiki index/backlinks.
- **Done means:** Alignment report exists, stale high-signal docs are updated, and deferred work has stable ledger IDs.
- **Depends on:** SESSION_0351_TASK_02 and SESSION_0351_TASK_03.

#### SESSION_0351_TASK_05 — Automation pulse notes and repo glossary expansion

- **Agent:** Petey → Doug
- **What:** Document the current monitor/cron automation posture and expand `repo-code-glossary.md` with project/repo context terms.
- **Steps:**
  1. Use Graphify-selected monitor/security/storage files to summarize what exists today.
  2. Define "pulse" as a scheduled or on-demand health digest/check layer over monitors until Brian provides the YouTube summary.
  3. Record recommended app/site/security/storage pulse candidates without implementing background jobs this session unless a tiny doc/script change is clearly safe.
  4. Expand glossary entries for repo/project concepts, session protocol, ledgers, Dirstarter, brands, schema, monitors, and pulses.
- **Done means:** Glossary is materially more useful, and automation/pulse candidates are documented without hidden scope expansion.
- **Depends on:** SESSION_0351_TASK_04.

### Parallelism

Sequential for shared ledgers/session docs. Exact-file reads can run in parallel; edits should land in task order so ledger IDs and report references stay coherent.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0351_TASK_01 | Petey | The user explicitly requested `/grill-me` and `petey-plan.md` before execution. |
| SESSION_0351_TASK_02 | Petey → Giddy | Legacy schema doctrine needs current-stack translation before any schema decision. |
| SESSION_0351_TASK_03 | Cody → Doug | Small admin code slice with access/visual verification. |
| SESSION_0351_TASK_04 | Petey → Giddy | Alignment report and ADR/doc truth routing. |
| SESSION_0351_TASK_05 | Petey → Doug | Operational pulse framing plus glossary/onboarding clarity. |

### Open decisions

- YouTube pulse summary pending from Brian; proceed with existing repo evidence and leave a follow-up hook.

### Risks

- The request spans schema, legacy monorepo intake, architecture docs, ADRs, admin UI, docs navigation, BBL domain visibility, archive candidates, `fallow`, and full close; use ledgers instead of widening implementation.
- Admin docs navigator must not accidentally publish private docs as a public route.
- Schema changes from the legacy doc may look obvious but still require product signoff; default to intake/ledger unless tiny and unambiguous.

### Scope guard

- Do not run the SESSION_0350 `/directory` filters/pagination implementation in this session.
- Do not make schema migrations until legacy `ENTER_THE_DOJO.md` findings are reviewed and explicitly promoted.
- Do not build broad brand-switcher or super-admin implementation; ledger it unless it collapses into the admin docs-nav slice.
- Do not implement cron/pulse jobs before the YouTube summary; document the current substrate and likely next jobs.

### Dirstarter implementation template

- **Docs read first:** local Dirstarter docs inventory read on 2026-06-06; live docs refresh only if implementation touches Prisma/admin/theming code.
- **Baseline pattern to extend:** Next.js App Router feature folders, Prisma schema/docs, Better Auth/admin gates, Dirstarter docs/content conventions.
- **Custom delta:** Ronin wiki/ADR/session cleanup and owner-only docs/admin affordances.
- **No-bypass proof:** planning is doc alignment and ledger routing first; any code work must extend existing admin/dashboard patterns and pass Cody pre-flight.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0351_TASK_01 | complete | Petey grill and cleanup scope lock. |
| SESSION_0351_TASK_02 | complete | Legacy `ENTER_THE_DOJO.md` translated into current Prisma/Next/ContentAtom terms; larger schema candidates ledgered. |
| SESSION_0351_TASK_03 | complete | Owner/admin Repo Docs page added with docs navigator and Graphify links. |
| SESSION_0351_TASK_04 | complete | Repo alignment report created, stale docs/ADRs patched, archive statuses cleaned up, strict markdownlint configured. |
| SESSION_0351_TASK_05 | complete | Pulse candidates documented and repo-code glossary expanded. |

## What landed

- Added an admin-only Repo Docs surface at `/admin/repo-docs` with links to the generated docs navigator and `/graphify.html`.
- Added `/admin/repo-docs/docs-navigator`, a route handler that serves `docs/index.html` through the existing auth/admin boundary.
- Regenerated `docs/index.html` and `apps/web/public/graphify.html`.
- Added `docs/knowledge/wiki/concepts/enter-the-dojo-schema-intake.md` to translate legacy WordPress/Pods doctrine into this repo's Prisma/Next language.
- Added `docs/architecture/repo-alignment-report.md` as the weekly/on-demand alignment sweep.
- Expanded `docs/knowledge/wiki/repo-code-glossary.md` with repo/project/session/schema/monitoring terms.
- Patched stale architecture docs and ADRs, cleaned archived session statuses for SESSION_0039 and SESSION_0123, and updated the wiki index.
- Added DavidAnson-compatible architecture markdownlint config plus `scripts/fix-architecture-markdownlint.ts`.

## Decisions resolved

- No Prisma schema migration this session: `ENTER_THE_DOJO.md` yielded useful candidates, but tournament content shell and org/staff chart semantics need product decisions first.
- Brand switcher remains a follow-up: `User.lastActiveBrandId` exists, but the visible UI/session proof is still MB-003/WL-P2-9.
- Pulse/cron work remains a follow-up until Brian supplies the YouTube summary and route/secret/recipient/failure policy are decided.
- `docs/architecture/source/**` is treated as source snapshot material for markdownlint and ignored rather than rewritten.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/admin/repo-docs/page.tsx` | New admin Repo Docs hub. |
| `apps/web/app/admin/repo-docs/docs-navigator/route.ts` | New admin-gated generated docs navigator route. |
| `apps/web/components/admin/sidebar.tsx` | Added Repo Docs navigation link. |
| `apps/web/components/admin/command-palette.tsx` | Added Repo Docs command entry. |
| `docs/architecture/repo-alignment-report.md` | New reusable repo alignment report. |
| `docs/knowledge/wiki/concepts/enter-the-dojo-schema-intake.md` | New legacy doctrine schema-intake page. |
| `docs/knowledge/wiki/repo-code-glossary.md` | Expanded repo/project glossary. |
| `docs/knowledge/wiki/wiring-ledger.md` | Added schema, pulse, brand-switcher, and fallow follow-ups. |
| `docs/architecture/**/*.md` | Strict markdownlint cleanup and targeted stale-doc alignment. |
| `docs/sprints/_archive/SESSION_0039.md` / `SESSION_0123.md` | Corrected stale frontmatter statuses. |
| `.markdownlint-cli2.jsonc`, `.markdownlintignore`, `scripts/fix-architecture-markdownlint.ts`, `package.json` | Added DavidAnson-compatible architecture markdownlint tooling. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | Pass — no lint violations found. |
| `bun run markdown:lint:architecture` | Pass — 72 maintained architecture files, 0 errors; `docs/architecture/source/**` ignored as source snapshots. |
| `bun run docs:nav` | Pass — wrote `docs/index.html` with 611 docs, 8.4 MB. |
| `bun run graphify:viz` | Pass — exported `apps/web/public/graphify.html`. |
| `cd apps/web && bun run lint` | Pass — checked 1198 files, no fixes applied. |
| `cd apps/web && bun run typecheck` | Pass — route types generated and `tsc --noEmit` completed with no errors. |
| `curl -I /graphify.html` on local dev server | Pass — `200 OK`, static HTML served. |
| `curl -I /admin/repo-docs` and `/admin/repo-docs/docs-navigator` unauthenticated | Pass — `307` to `/auth/login?next=...`, no public docs exposure. |
| `npx fallow audit --changed-since HEAD --format human` | Findings ledgered in WL-P2-10: 4 dependency candidates and complexity hotspots; not fixed in this scope. |

## Open decisions / blockers

- YouTube pulse summary still pending from Brian.
- Fallow cleanup is intentionally deferred to WL-P2-10.
- Browser visual smoke was limited because the Playwright browser instance was already locked; HTTP smoke and compile checks passed.

## Next session

### Goal

Resume the SESSION_0350 planned implementation: add cross-facet filters to `/directory` and converge the People facet onto the paginated `search*` family, unless SESSION_0351 creates a higher-priority blocker.

### First task

Standardize the directory `discipline` param on slug, add a slug-aware filter-options query, render a shared discipline `Select` via `FiltersProvider`, then move People onto `searchDirectoryProfiles` with the existing trust/tier projection.

## Review log

| Reviewer | Verdict | Notes |
| --- | --- | --- |
| Giddy | Pass with follow-ups | TASK_02 avoided premature schema migration; TASK_04 routed unbuilt tournament-content/org-chart/brand-switcher work to WL-P2-6/7/9. |
| Doug | Pass with caveat | TASK_03 uses existing admin gates and unauthenticated smoke redirects to login; browser visual smoke was blocked by a locked Playwright instance, so verification rests on compile + HTTP checks. |

## Hostile close review

- **Dirstarter alignment:** PASS — admin work extends existing App Router/admin sidebar/command-palette patterns; no parallel shell or baseline replacement.
- **Security/privacy:** PASS — docs navigator is behind admin routes and unauthenticated requests redirect to login; generated docs remain repo-local/public-static only where explicitly linked.
- **Data/schema integrity:** PASS — no Prisma migration; legacy schema candidates are intake/ledger only.
- **Verification honesty:** PASS WITH CAVEAT — lint/typecheck/wiki/markdown/docs/Graphify/HTTP checks passed; visual browser smoke blocked by locked Playwright instance.
- **Score cap:** 8/10 until an authenticated admin visual smoke confirms the new Repo Docs page in-browser.

## ADR / ubiquitous-language check

- ADRs updated: 0001, 0004, 0008, 0021, 0022 plus maintained architecture markdownlint cleanup.
- New ADR not created: no new architecture decision was made; schema and pulse items are follow-ups, not accepted designs.
- Ubiquitous language: glossary expanded; canonical domain terms remain Passport, DirectoryProfile, Organization, Discipline, RankSystem, Rank, Membership, RegistrationEntry.

## Reflections

- The legacy `ENTER_THE_DOJO.md` was still useful after translating away from WordPress/Pods; the risky part is not terminology, it is deciding ownership for public tournament content and authority charts.
- `markdownlint-cli2` is a useful strict check, but source snapshots need an explicit ignore boundary or the tool encourages rewriting raw/source material.
- `fallow audit` is useful as a pulse, but its dependency findings need verification before removal.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | New/updated wiki and architecture docs have current `updated` dates; maintained architecture docs with existing `last_agent` were stamped `codex-session-0351`; source snapshots ignored. |
| Backlinks/index sweep | `wiki/index.md` includes `ENTER_THE_DOJO Schema Intake`, `Repo Alignment Report`, and SESSION_0351; `wiki/log.md` appended SESSION_0351 entry. |
| Wiki lint | `bun run wiki:lint` passed with no lint violations after frontmatter sweep. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Review log + hostile close review present; open follow-ups routed to WL-P2-6 through WL-P2-10. |
| Review & Recommend | Next session goal and first task preserve the SESSION_0350 `/directory` continuation for SESSION_0352. |
| Memory sweep | No operator memory update needed; durable facts are captured in ADR/docs/wiki/session files. |
| Next session unblock check | Unblocked: `/directory` filter/pagination continuation can start from SESSION_0350 next-session section plus this session's ledgers. |
| Git hygiene | Branch `main`; worktree list includes two fallow temp detached worktrees with untracked `node_modules`, left in place because removal would require force; active repo changes staged after close. Commit hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` completed; `graphify stats` after update: 9602 nodes, 15084 edges, 1427 communities, 1602 files tracked. `bun run graphify:viz` refreshed `apps/web/public/graphify.html`. |
