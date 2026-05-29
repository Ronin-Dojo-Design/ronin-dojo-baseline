---
title: "SESSION 0284 — White-label runbooks + brand-aware siteConfig.name"
slug: session-0284
type: session--open
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: claude-session-0284
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0283.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0284 — White-label runbooks + brand-aware siteConfig.name

## Date

2026-05-28

## Operator

Brian + claude-session-0284 (Petey orchestrating, Cody executing)

## Goal

Stage the multi-session white-label/BBL roadmap, convert the `siteConfig.name` server-context surfaces to brand-aware (the queued SESSION_0283 next-task), and publish two new rolling runbooks: white-label-site-runbook and bbl-production-runbook — both reusing the existing domain/deploy runbooks rather than re-deriving them.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0283.md`
- Carryover: SESSION_0283 built the brand-config foundation (`getBrandSiteConfig`, `getRequestBrand`, BrandProvider) and fixed `og:site_name`/ad labels/home title. Its queued next-task — the systematic `siteConfig.name` audit — is TASK_01 here.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `248350f`

### Graphify check

- Graph status: current; stats at bow-in: 7347 nodes, 12146 edges, 1031 communities, 1417 files tracked.
- Queries used:
  - `brand config white-label siteConfig getBrandSiteConfig brand-aware metadata`
  - `media upload S3 storage image admin CRUD`
  - `user dashboard profile edit school role tree editor admin toggle`
  - `blog post content engine landing page home sections articles`
  - `lineage listing tree node belt promotion`
- Files selected from graph: `apps/web/config/site.ts`, `apps/web/lib/brand-context.ts`, `apps/web/contexts/brand-context.tsx`, `apps/web/app/layout.tsx`, ADR 0021/0022.
- Verification note: graph used for navigation; exact files opened and read directly. `siteConfig.name` refactor enumeration used `grep` (code-symbol enumeration, not file discovery).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | content/SEO (metadata), theming (brand chrome), hosting (domain runbooks) |
| Extension or replacement | Extension — swaps static `siteConfig.name` reads for the Ronin-added brand-resolution layer; runbooks document hosting on top of Dirstarter's Vercel deploy |
| Why justified | White-label SaaS demo (RDD) and BBL launch require per-brand naming + a repeatable cutover runbook |
| Risk if bypassed | BBL/RDD surfaces keep showing "Baseline Martial Arts"; cutover knowledge stays trapped in session files |

Live docs checked during planning: ADR 0021/0022 (local brand-chrome source of truth); dirstarter-docs-inventory Alignment URLs (content/SEO + theming) to be confirmed at execution.

## Petey plan

See `/Users/brianscott/.claude/plans/with-opening-md-ritual-we-composed-rain.md` for the full plan. Compact ledger below.

### Goal

White-label runbooks + brand-aware `siteConfig.name` server-context conversion.

### Tasks

#### SESSION_0284_TASK_01 — Brand-aware siteConfig.name audit + server-context conversion

- **Agent:** Cody (subagent)
- **What:** Categorize all 48 `siteConfig.name` refs; convert the server-context subset to brand-aware via `getRequestBrand()` + `getBrandSiteConfig(brand).name`; document the rest.
- **Steps:** enumerate/categorize (server | client | email | static) → convert server-context + cheap client cases (incl. `lib/structured-data.ts` JSON-LD) → tsc + Biome → smoke `bbl.local:3000`.
- **Done means:** server-context name surfaces render the active brand; remaining refs categorized in the white-label runbook; tsc clean; smoke evidence.
- **Depends on:** nothing.

#### SESSION_0284_TASK_02 — Author white-label-site-runbook.md

- **Agent:** Petey (+ Desi)
- **What:** `docs/runbooks/white-label-site-runbook.md` as the living source of truth for white-labeling any brand site (esp. ronindojodesign.com).
- **Steps:** document brand-config system → static→dynamic audit table (name/slug/tagline/description done-able now; url/email/domain env-global, need per-brand source) → surface checklist → cross-ref domain runbook + ADR 0006.
- **Done means:** runbook exists with JETTY frontmatter, audit table (rolling backlog), and "what's left for RDD demo" section.
- **Depends on:** nothing (audit table reconciled after TASK_01).

#### SESSION_0284_TASK_03 — Author bbl-production-runbook.md

- **Agent:** Petey (+ Giddy)
- **What:** `docs/runbooks/bbl-production-runbook.md` covering taking blackbeltlegacy.com live as the BBL brand on Vercel (WordPress→Vercel cutover).
- **Steps:** reference vercel-domain-setup-runbook / vercel-deploy / deployment / ADR 0006+0015 (link, don't copy) → BBL-specific deltas (DNS source-of-truth OPEN, content migration, 301 redirect map, retire Local-by-Flywheel) → Resend per-domain DKIM reminder.
- **Done means:** runbook exists with JETTY frontmatter, a marked-OPEN DNS source-of-truth item, no duplication of generic domain steps.
- **Depends on:** nothing.

### Parallelism

TASK_01 (apps/web/**) is disjoint from TASK_02/03 (docs/runbooks/**) → TASK_01 runs as a background subagent while Petey writes the runbooks. TASK_02 audit table reconciled once TASK_01 reports its categorization.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0284_TASK_01 | Cody (subagent) | Mechanical brand-aware conversion against existing patterns |
| SESSION_0284_TASK_02 | Petey + Desi | Rolling doc + surface inventory; Petey holds the doc context |
| SESSION_0284_TASK_03 | Petey + Giddy | Deploy/DNS/Git cutover knowledge |

### Open decisions

- blackbeltlegacy.com DNS source of truth: Bluehost (ADR 0015 default) vs currently Flywheel — resolve before any DNS change (no DNS change this session).
- Emails brand-awareness: needs `brand` prop threaded through callers — deferred to white-label backlog.
- `siteConfig.url/email/domain` are env-global (same for all brands) — making them brand-aware needs a per-brand source first; out of scope today.

### Risks

- Client components lacking BrandProvider context → limit TASK_01 to server-context + verified client cases; tsc + smoke.
- Biome `--unsafe` JSX blindspot → tsc after any unsafe batch.
- Runbook duplication of vercel-domain-setup-runbook → enforce "link, don't copy".

### Scope guard

NOT this session: email brand props, `.url/.email/.domain` conversion, S3 assets, media CRUD, landing content, dashboard UX, lineage-runbook audit, gamification spike. All → white-label backlog / roadmap.

### Dirstarter implementation template

- **Docs read first:** ADR 0021/0022 (brand chrome); dirstarter-docs-inventory Alignment URLs for content/SEO + theming to confirm at execution.
- **Baseline pattern to extend:** Dirstarter `config/site.ts` `siteConfig` + Ronin's `getBrandSiteConfig()` / `getRequestBrand()` / BrandProvider (SESSION_0283).
- **Custom delta:** request/context brand resolution replacing static `siteConfig.name` reads; no new abstraction.
- **No-bypass proof:** extends the brand layer; `siteConfig` defaults still back the fallback path.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0284_TASK_01 | landed | Brand-aware siteConfig.name: 48→18 (30 converted); tsc/biome/smoke clean |
| SESSION_0284_TASK_02 | landed | Authored white-label-site-runbook.md + reconciled audit table |
| SESSION_0284_TASK_03 | landed | Authored bbl-production-runbook.md (DNS source-of-truth OPEN) |

## What landed

- **TASK_01 (brand-aware `siteConfig.name`):** 48 → 18 occurrences (30 converted). Server components (all `app/(web)/**/page.tsx` that used the name), route handlers (`api/og`, `[slug]/badge.svg` — brand resolved server-side, `siteName` threaded as a prop), client components via `useBrand()` (`nav`, `feedback-widget`, `feature-nudge`, `tool-claim-dialog`), and server actions (`claim`, `lead`, `admin/tools` → `notifications` now takes optional `brand`). All reuse the SESSION_0283 pattern (`getRequestBrand()` + `getBrandSiteConfig(brand)`); no new abstraction.
- **TASK_02:** Authored `docs/runbooks/white-label-site-runbook.md` — brand-resolution layer reference, static→dynamic audit table (the rolling backlog), per-file categorization from TASK_01, surface checklist, and "what's left for the RDD demo".
- **TASK_03:** Authored `docs/runbooks/bbl-production-runbook.md` — WordPress/Flywheel → Vercel cutover for blackbeltlegacy.com as the BBL brand; links (does not duplicate) the existing domain/deploy runbooks; DNS source-of-truth marked OPEN.
- **Subagent recovery:** the background Cody subagent did the real conversion but its final report was hijacked (it hit the `tsc` permission prompt — background agents can't get interactive approval — and pivoted to a permission-allowlist meta-task). Verified the actual diffs + ran the gate myself.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0284.md` | This session |
| `docs/runbooks/white-label-site-runbook.md` | New rolling white-label runbook |
| `docs/runbooks/bbl-production-runbook.md` | New BBL production cutover runbook |
| `docs/knowledge/wiki/index.md` | Added SESSION_0284 + 2 runbook rows |
| `apps/web/app/(web)/**/page.tsx` (19 pages) | `siteConfig.name` → `getBrandSiteConfig(getRequestBrand()).name` |
| `apps/web/app/api/og/route.tsx`, `app/(web)/[slug]/badge.svg/route.tsx` | Brand resolved server-side; `siteName` threaded as prop |
| `apps/web/components/web/{nav,feedback-widget,feature-nudge,dialogs/tool-claim-dialog}.tsx` | Brand name via `useBrand()` |
| `apps/web/server/web/actions/claim.ts`, `server/web/lead/actions.ts`, `server/admin/tools/actions.ts` | Brand-aware email/notification copy |
| `apps/web/lib/notifications.ts` | `notifySubmitterOf*` now take optional `brand?: Brand`, fall back to `siteConfig.name` |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | ✅ EXIT=0, 0 TS errors across 28 changed files |
| `bun biome check` (28 changed files, no `--write`) | ✅ clean, no fixes |
| `curl -H "Host: bbl.local" /about` `<title>` | ✅ "About Us – Black Belt Legacy" |
| `curl -H "Host: bbl.local" /terms` `<title>` | ✅ "… Black Belt Legacy" |
| Residual "Baseline Martial Arts" on BBL subpages | `og:site_name` (static `config/metadata.ts`) + JSON-LD (`lib/structured-data.ts`) — both deferred, documented in white-label runbook |
| `bun run wiki:lint` | 232 errors / 622 warnings — ALL pre-existing; grep confirms 0 findings on the 3 files this session created |
| `--filter dirstarter` (from runbooks) | ❌ stale — "No projects matched"; real package is `@ronin-dojo/web` (workspace-rename drift; flagged below) |

## Decisions resolved

- blackbeltlegacy.com = brand on the existing Vercel multi-brand app (`data-brand=BBL`); WordPress/Flywheel retired or content-source only (ADR 0006: all brands on one Vercel deployment).
- This session = plan + brand-aware quick win + two rolling runbooks; assets→S3 deferred to next session.

## Open decisions / blockers

- blackbeltlegacy.com DNS source of truth (Bluehost vs Flywheel) — see white-label/BBL runbooks. Resolve before any DNS change.
- Emails + `.url/.email/.domain` brand-awareness — white-label runbook backlog.
- **og:site_name + JSON-LD leak on BBL subpages** — root cause is the static `config/metadata.ts` module (no request context). Highest-value white-label follow-up: make metadata brand-aware per request (`getBrandMetadata(brand)` or per-page `generateMetadata`). Tracked in white-label runbook.
- **Workspace-filter drift (deploy risk):** runbooks (and possibly the Vercel build command) use `pnpm --filter dirstarter`, but the package is now `@ronin-dojo/web` — `--filter dirstarter` silently matches nothing. Verify the Vercel `buildCommand` filter; update stale runbook references. Not fixed this session (scope guard).

## Next session

### Goal

BBL assets → S3 + begin media-upload CRUD improvement (shadcn parity with the tool-listing gold-standard page).

### First task

Pull BBL logo/images from `ronin-dojo-monorepo`, decide the S3 transport path (AWS CLI bulk vs site media uploader) at execution time per file count/size, and upload to the configured bucket per `aws-s3-operator-runbook.md`.

## Review log

### SESSION_0284_REVIEW_01 — brand-aware conversion + runbooks

- **Reviewed tasks:** SESSION_0284_TASK_01, TASK_02, TASK_03
- **Dirstarter docs check:** brand-aware conversion extends the Ronin layer over Dirstarter `config/site.ts`; ADR 0021/0022 are the local source of truth. No live-docs delta required (no new Dirstarter capability bypassed).
- **Verdict:** Conversion is type-correct, lint-clean, and smoke-verified for the visible `<title>` surface. The honest gap (og:site_name + JSON-LD on subpages) is documented as deferred with a precise root cause, not hidden. Runbooks link rather than duplicate. The subagent derail was caught by verifying actual diffs + running the gate manually rather than trusting the report.
- **Score:** 9.6/10
- **Follow-up:** metadata-as-function refactor (og:site_name); confirm Vercel `--filter` package name.

## Hostile close review

- **Giddy:** pass — disjoint file sets, single clean commit, no schema/migration touched; flagged the `--filter dirstarter` deploy risk as an open item.
- **Doug:** pass — verification is honest (tsc EXIT=0 captured, smoke shows residual leaks rather than claiming 100%); wiki-lint counts recorded with pre-existing attribution.
- **Desi:** pass — UI brand name resolves on `bbl.local`; client components correctly use `useBrand()` not the server-only `getRequestBrand()`.
- **Kaizen aggregate:** 9.6/10 — clean scoped win; one point of caution on the deferred metadata leak being clearly logged.

## ADR / ubiquitous-language check

- ADR update: not required. The brand-aware conversion extends ADR 0022 (Brand Chrome Resolution) and ADR 0021 (brand-aware links); no new architectural decision. The metadata-as-function approach, if taken, would warrant an ADR in a future session.
- Ubiquitous language update: not required (no new domain terms).

## Reflections

- The background subagent did correct work but returned a hijacked report (permission-allowlist analysis instead of the conversion summary). Root cause: background agents can't answer interactive permission prompts, so when `tsc` was gated it pivoted. Lesson: for background subagents, either pre-authorize the verification commands or treat their reports as untrusted and verify diffs + run the gate yourself. The diffs were the truth; the summary was not.
- The `--filter dirstarter` → "No projects matched" silent no-op (exit 0) almost let an unverified 28-file change pass as "type-checked." The real package is `@ronin-dojo/web`. This is the workspace-rename filter drift pattern — and it may also affect the Vercel build command, which is a latent deploy risk worth a dedicated check.
- The brand layer was well-built in 0282/0283: converting was nearly mechanical. The remaining hard part (og:site_name/JSON-LD) is structural — static config modules can't see the request — which is exactly the kind of thing that should be solved once, centrally, rather than per page.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | 3 new docs carry full JETTY frontmatter; SESSION_0284 `last_agent: claude-session-0284` |
| Backlinks/index sweep | wiki/index.md: added SESSION_0284 + white-label + bbl-production rows; the 2 runbooks `pairs_with` each other |
| Wiki lint | `bun run wiki:lint` → 232 errors / 622 warnings, ALL pre-existing (grep: 0 findings on this session's 3 files) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0284_REVIEW_01; Giddy/Doug/Desi pass, 9.6/10 |
| Review & Recommend | Next session goal written: yes (BBL assets → S3 + media CRUD) |
| Memory sweep | Saved feedback memory: background subagents can't clear interactive permission prompts → verify their diffs |
| Next session unblock check | Unblocked — asset pull from monorepo + S3 upload is doable; transport path decided at execution |
| Git hygiene | branch `main`; reported in bow-out response (single commit) |
| Graphify update | reported in bow-out response (run after commit) |
