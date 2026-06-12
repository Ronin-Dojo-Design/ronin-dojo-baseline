---
title: "SESSION 0372 — BBL SEO hygiene"
slug: session-0372
type: session--implement
status: closed
created: 2026-06-12
updated: 2026-06-12
last_agent: codex-session-0372
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0371.md
  - docs/sprints/SESSION_0368.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0372 — BBL SEO hygiene

## Date

2026-06-12

## Operator

Brian + codex-session-0372

## Goal

Start the normal `apps/web` dev server for Brian's manual `bbl.local` browser proof, then land the next cutover-arm hygiene slice: brand-aware OG/meta, robots, and sitemap coverage for the BBL lineage-first launch surface.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0371.md`
- Carryover: SESSION_0371 wired BBL Register CTAs to `/lineage/join` and rebuilt the registration intake. Browser screenshots are operator-owned this session; implementation continues the D9 pre-flip gate with OG/meta/sitemap hygiene.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: untracked screenshot PNGs present from previous/manual work; later removed at operator request.
- Current HEAD at bow-in: `0535554`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content/blog SEO metadata, Next metadata routes, brand theming config |
| Extension or replacement | Extension: keep Dirstarter metadata helpers and add brand-aware launch hygiene on top |
| Why justified | SOT-ADR D9 requires OG/meta + robots/sitemap hygiene before BBL DNS flip |
| Risk if bypassed | BBL can flip with Baseline/default metadata, missing sitemap/robots, or indexed gated routes |

Live docs checked during planning: not needed; this uses stable Next App Router metadata-route APIs already present in the local code patterns.

### Graphify check

- Graph status: current; stats at bow-in: 11,735 nodes, 18,226 edges, 1,706 communities, 1,894 files tracked.
- Queries used:
  - `BBL OG metadata sitemap robots brand feature gate bbl.local`
- Files selected from graph:
  - `apps/web/app/rss.xml/route.ts`
  - `apps/web/config/brand-features.ts`
  - `apps/web/app/(web)/(home)/page.tsx`
  - `apps/web/app/(web)/lineage/join/page.tsx`
  - `apps/web/config/metadata.ts`
  - `apps/web/lib/pages.ts`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- No blocking user question after source review. The repo already answers the main fork: use native Next metadata routes and existing brand helpers; do not fold the separate Passport/DirectoryProfile draft decision into this SEO slice.

## Petey plan

### Goal

Make BBL's public launch surface crawl/share cleanly without exposing gated D9 routes.

### Tasks

#### SESSION_0372_TASK_01 — Dev server handoff

- **Agent:** Cody
- **What:** Start `apps/web` with the canonical dev command so Brian can manually verify `bbl.local`.
- **Steps:** Run `npx next dev --turbo` from `apps/web`; record URL/status.
- **Done means:** dev server is ready on port 3000.
- **Depends on:** nothing

#### SESSION_0372_TASK_02 — BBL SEO metadata routes

- **Agent:** Cody
- **What:** Add brand-aware robots/sitemap coverage and tighten BBL OG metadata for home and `/lineage/join`.
- **Steps:** inspect metadata helpers, add native metadata route files, use the D9 route allowlist, add focused regression tests where possible.
- **Done means:** BBL sitemap contains allowed launch routes only; robots points to sitemap; home/join metadata use BBL title/description/OG semantics.
- **Depends on:** SESSION_0372_TASK_01

#### SESSION_0372_TASK_03 — Verification and close prep

- **Agent:** Doug
- **What:** Run focused tests plus type/lint gates, update docs/session, and prepare full-close evidence.
- **Steps:** run targeted tests, `bun run typecheck`, lint/fallow as available, note any environment caveats.
- **Done means:** gates and residual risks recorded in this session.
- **Depends on:** SESSION_0372_TASK_02

### Parallelism

Dev server and source exploration can run concurrently. Code changes are sequential because metadata helpers, sitemap, and tests share route/config assumptions.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0372_TASK_01 | Cody | Environment startup is mechanical. |
| SESSION_0372_TASK_02 | Cody | SEO route implementation is a coherent app-code slice. |
| SESSION_0372_TASK_03 | Doug | Verification and hostile close review need independent proof framing. |

### Open decisions

- None for this slice. `BBL registration should create Passport/DirectoryProfile drafts immediately` is recorded as a separate reviewed identity slice, not implemented here.

### Risks

- Local `NEXT_PUBLIC_SITE_URL` is `http://localhost:3000`, so local absolute metadata URLs will not show `bbl.local` unless the environment is overridden.
- DB-backed route rendering may still require the configured local database; metadata route tests should avoid that dependency.

### Scope guard

- Do not implement Stripe rehearsal in this slice.
- Do not start Phase 3 identity re-root or create Passport/DirectoryProfile drafts from BBL registration.
- Do not keep the untracked screenshot PNGs; operator approved removal during close.
- Do not widen BBL's D9 feature allowlist.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, SOT-ADR D9, SESSION_0368, SESSION_0371.
- **Baseline pattern to extend:** `config/metadata.ts`, `lib/pages.ts`, brand site config, existing RSS route, D9 `brand-features` allowlist.
- **Custom delta:** BBL launch routes get brand-aware crawl/share hygiene while gated routes stay out of sitemap.
- **No-bypass proof:** native Next metadata routes extend App Router conventions and reuse the repo's brand/feature config instead of creating a second launch map.

## Cody pre-flight

### Pre-flight: BBL SEO metadata routes

#### 1. Existing component scan

- Graphify query used: `BBL OG metadata sitemap robots brand feature gate bbl.local`
- Found: `apps/web/config/metadata.ts`, `apps/web/lib/pages.ts`, `apps/web/app/layout.tsx`, `apps/web/app/rss.xml/route.ts`, `apps/web/config/brand-features.ts`, `apps/web/config/site.ts`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: no; this is an existing local metadata extension, not a new Dirstarter surface.
- Consulted live alignment URLs: no.
- Closest L1 pattern: existing root metadata helper plus RSS metadata route.
- Primitive API spot-check: no UI primitives used.

#### 3. Composition decision

- Extending existing component: none.
- Composing existing components: none.
- Extending existing metadata helpers and feature config: `getMetadataConfig`, `getPageMetadata`, `BRAND_FEATURES`, `FEATURE_ROUTE_PREFIXES`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/product/black-belt-legacy/SOT-ADR.md`.
- Runbook consulted: `docs/runbooks/dev-environment/graphify-repo-memory.md`, `docs/protocols/cody-preflight.md`.

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` from `apps/web/`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.
- Brand/host for testing: `http://bbl.local:3000`.
- Verification commands confirmed: `bun run typecheck`, `bun run lint:check`, focused `bun test`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0002, FS-0004, FS-0005, FS-0007, FS-0008.
- Mitigation acknowledged: dev server started with the canonical command; session/pre-flight recorded before code edits; full-close evidence will be concrete; no inferred primitive or enum APIs.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0372_TASK_01 | landed | Dev server running with `npx next dev --turbo`; ready at `http://localhost:3000` and `bbl.local:3000` via host mapping. |
| SESSION_0372_TASK_02 | landed | Added request-aware native `robots.txt`/`sitemap.xml`, brand-origin OG/Twitter URLs, BBL home metadata source fix, and SEO route regression tests. |
| SESSION_0372_TASK_03 | landed | Focused tests, typecheck, oxlint, fallow changed-file audit, live curl proof, wiki lint, and Graphify update recorded. |

## What landed

- Normal `apps/web` dev server started with `npx next dev --turbo`; ready at `http://localhost:3000` and host-mapped `http://bbl.local:3000`.
- Added request-aware App Router metadata routes for `/robots.txt` and `/sitemap.xml`.
- BBL robots now disallows D9-gated routes (`/tournaments`, `/courses`, `/programs`, `/disciplines`, `/techniques`, `/gear`, `/merch`, `/advertise`, `/submit`, `/categories`, `/tags`) and points to the active request-origin sitemap.
- BBL sitemap now emits the lineage-first launch routes only: root, about, lineage, join, directory, members, schools, organizations, organizations/new, events, posts, blog, plus legal pages.
- Page metadata and OG image URLs now use the active request origin, so `bbl.local:3000` emits `http://bbl.local:3000/...` URLs instead of static `NEXT_PUBLIC_SITE_URL`.
- BBL home metadata now uses `getBrandSiteConfig(brand)` instead of Baseline translation strings.
- Removed six untracked BBL screenshot PNGs at operator request.

## Decisions resolved

- No `grill-with-docs` was needed; source review answered the SEO implementation forks.
- Stale local `apps/web/public/robots.txt` and `apps/web/public/sitemap.xml` conflicted with native metadata routes and were removed locally. They were untracked files, so no git deletion is recorded.
- The Passport/DirectoryProfile draft-on-registration idea remains a separate reviewed identity slice.

## Files touched

- `apps/web/app/robots.ts` — new request-aware robots metadata route.
- `apps/web/app/sitemap.ts` — new request-aware sitemap metadata route.
- `apps/web/config/seo.ts` — central static sitemap route list + BBL gated-route disallow projection.
- `apps/web/config/seo.test.ts` — regression coverage for BBL sitemap and robots gating.
- `apps/web/app/layout.tsx` — `metadataBase` now uses the active request origin.
- `apps/web/lib/opengraph.ts` — OG URL helper accepts an origin override.
- `apps/web/lib/pages.ts` — page metadata uses request-origin OG URLs and explicit Open Graph/Twitter title/description.
- `apps/web/app/(web)/(home)/page.tsx` — home metadata data source now uses brand site config.
- `docs/sprints/SESSION_0372.md` — session ledger.
- `docs/knowledge/wiki/index.md` — session index entry.
- `docs/knowledge/wiki/log.md` — session log entry.

## Verification

- `bun test config/seo.test.ts config/brand-features.test.ts` — 10 pass, 0 fail, 125 assertions.
- `bun run typecheck` — pass.
- `bun run lint:check` — pass with pre-existing warnings only.
- `bun run audit:fallow` — exits 0; no changed-file issues after removing an unnecessary export. Inherited findings remain excluded: `tailwind-merge`, `@react-email/preview-server`, and pre-existing complexity warnings.
- `curl -H 'Host: bbl.local:3000' http://127.0.0.1:3000/robots.txt` — 200, disallows D9-gated routes, sitemap points to `http://bbl.local:3000/sitemap.xml`.
- `curl -H 'Host: bbl.local:3000' http://127.0.0.1:3000/sitemap.xml` — 200, contains allowed launch routes only.
- `curl -H 'Host: bbl.local:3000' http://127.0.0.1:3000/` — BBL title/description/OG URL/image present.
- `curl -H 'Host: bbl.local:3000' http://127.0.0.1:3000/lineage/join` — Join Legacy title/description/OG/Twitter URLs present and request-origin scoped.
- `bun run wiki:lint` — to be recorded in full close evidence.

## Open decisions / blockers

- Minimal 301 map and production render verification remain before DNS flip.
- 2b wave 3+, 2c, and Phases 3-5 remain post/around cutover work; Phase 3 must use D9 user-carry migration semantics.
- Design the BBL registration Passport/DirectoryProfile draft behavior as a separate reviewed identity slice.

## Next session

### Goal

Continue the D9 pre-flip closeout with the minimal 301 map and production render verification, then reassess DNS flip readiness before resuming `/app` 2b/2c and Phase 3 identity work.

### Inputs to read

- `docs/sprints/SESSION_0372.md`
- `docs/sprints/SESSION_0368.md`
- `docs/product/black-belt-legacy/BBL-SOT-Spec.md`
- `docs/product/black-belt-legacy/SOT-ADR.md`
- `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md`

### First task

Build and verify the minimal Black Belt Legacy 301 map for the D9 lineage-first launch surface, then run production render proof for `blackbeltlegacy.com`/Vercel preview before DNS flip.

## Review log

### SESSION_0372_REVIEW_01 — BBL SEO hygiene

- **Reviewed tasks:** SESSION_0372_TASK_01, SESSION_0372_TASK_02, SESSION_0372_TASK_03.
- **Dirstarter alignment:** pass. Uses native Next metadata routes and existing repo metadata helpers; no second brand map beyond the existing D9 feature allowlist.
- **Verification:** pass. Pure tests, typecheck, oxlint, fallow, and live curl proof all green.
- **Residual risk:** sitemap is static-route-only; dynamic post/profile/school slugs can be added later once content ingestion and public payload policy are stable.

## Hostile close review

- **Giddy:** pass. The change is scoped to SEO hygiene and does not widen the BBL feature allowlist or alter auth/payment/identity behavior.
- **Doug:** pass. Runtime proof caught and resolved the stale public `robots.txt`/`sitemap.xml` conflict; live BBL metadata routes now return 200 and request-origin URLs.
- **Desi:** pass. No visual/UI change; metadata copy now matches the BBL brand config.
- **Score:** 9.5/10. Dynamic sitemap enrichment can trail the flip; current D9 launch surface is covered.

## ADR / ubiquitous-language check

- No new ADR needed. This implements SOT-ADR D9's OG/meta + robots/sitemap hygiene gate without changing the architecture decision.
- No ubiquitous-language update needed. No new domain term was introduced.

## Findings (severity >= medium)

- None.

## Reflections

- Runtime curl proof mattered: pure tests and typecheck passed before the existing untracked public files exposed a Next route conflict for `/robots.txt` and `/sitemap.xml`.
- Request-origin metadata is the right multi-domain seam; env-only `NEXT_PUBLIC_SITE_URL` is insufficient for one Vercel deployment serving `bbl.local`, `blackbeltlegacy.com`, and Baseline domains.
- Keep sitemap conservative until content/profile ingestion stabilizes. Static launch routes are enough for the pre-flip hygiene gate.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0372.md` created with current frontmatter; `wiki/index.md` and `wiki/log.md` stamped for codex-session-0372. No architecture/wiki concept pages created. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0372 row added; `wiki/log.md` SESSION_0372 entry appended. No new bidirectional doc links beyond session pairs. |
| Wiki lint | `bun run wiki:lint` passed: 643 markdown files scanned, 0 violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0372_REVIEW_01 present; Giddy/Doug/Desi pass. |
| Review & Recommend | Next session goal + first task written. |
| Memory sweep | No operator memory update needed; D9 already records the launch sequence and this session implements one gate. |
| Next session unblock check | Unblocked: minimal 301 map/prod render proof can start from CUTOVER_CHECKLIST + SESSION_0372 evidence. |
| Git hygiene | Branch `main`; worktree list has active repo plus three detached fallow cache worktrees under `/private/var/...`, left in place; status reviewed before staging; single push, hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before commit; `graphify stats` after update: 11,748 nodes, 18,252 edges, 1,682 communities, 1,892 files tracked. |
