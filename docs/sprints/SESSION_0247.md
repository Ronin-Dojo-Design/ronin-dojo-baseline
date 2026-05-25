---
title: "SESSION 0247 - Lineage privacy launch plan"
slug: session-0247
type: session--plan
status: closed
created: 2026-05-24
updated: 2026-05-24
last_agent: codex-session-0247
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0246.md
  - docs/runbooks/lineage-listing-runbook.md
  - docs/runbooks/sop-e2e-user-lifecycle.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0247 - Lineage privacy launch plan

## Date

2026-05-24

## Operator

Brian + codex-session-0247 (Petey planning; Cody/Doug/Giddy/Desi staged for implementation)

## Goal

Graphify the current repo and old Black Belt Legacy implementation, then stage the next implementation work for `/lineage` pagination/search, lineage lifecycle E2E coverage, and GDPR-like privacy support.

## Bow-in

### Previous session

- SESSION_0246 closed factual non-tool JSON-LD enrichment and pushed `c677275 feat: enrich non-tool structured data`.
- The JSON-LD path is not fundamentally broken; SESSION_0246 clarified that tool pages keep `SoftwareApplication`/ratings semantics while non-tool pages carry factual `Course`, `Organization`, `CreativeWork`, and relationship fields.
- Brian promoted the previous "later/follow-up" items to active priority now: GDPR-like privacy support, `/lineage` pagination/search, and lineage lifecycle E2E tests.
- SESSION_0244 baseline-content waterfall remains deferred by explicit user override, not blocked.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Bow-in status: clean against `origin/main`
- HEAD at bow-in: `c677275`
- Confirmed this session is not running in `dirstarter_template`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Analytics, authentication, Prisma/database, content/listing search, and public page patterns. |
| Extension or replacement | Extension. Keep Dirstarter's Plausible/Better Auth/Prisma/listing primitives and add Ronin-specific lineage and privacy behavior on top. |
| Why justified | `/lineage` is now launch-critical, and old BBL has proven privacy/search UX worth porting into the new app's data/auth model. |
| Risk if bypassed | Rebuilding from old React/WP behavior directly would bypass Dirstarter cache/auth/query patterns and could reintroduce privacy leakage. |

### Dirstarter docs checked

- 2026-05-24: <https://dirstarter.com/docs/integrations/analytics> - Plausible provider baseline, automatic pageviews, and privacy-friendly analytics statement.
- 2026-05-24: <https://dirstarter.com/docs/authentication> - Better Auth, route/action protection, and server-side authorization rule.
- 2026-05-24: <https://dirstarter.com/docs/database/prisma> - Prisma schema/client/query and migration pattern.
- 2026-05-24: <https://dirstarter.com/docs/content> - search/listing/admin content workflow and status visibility pattern.

### Official privacy guidance checked

Legal caveat: this plan provides GDPR-like implementation support, not legal certification. Product/legal review still decides final policy text, legal bases, retention, DSR timelines, and jurisdictional obligations.

Official sources checked on 2026-05-24:

- <https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr_en>
- <https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/legal-grounds-processing-data/grounds-processing/when-consent-valid_en>
- <https://www.edpb.europa.eu/sme-data-protection-guide/process-personal-data-lawfully_en>

Implementation implication: consent must be freely given, specific, informed, unambiguous, affirmative, withdrawable, and scoped to the purposes presented. Not every processing path should be forced into consent; account, contract, security, legal, and legitimate-interest paths need their own legal-basis review.

### Graphify check

Current repo:

- `graphify stats --graph .`
- Result: 6924 nodes / 10748 edges / 1078 communities / 1340 files tracked.

Current repo queries:

- `graphify query --graph . --depth 3 --budget 7000 "lineage pagination search filters query params page size findPublishedLineageTrees lineage listing tests"`
- `graphify query --graph . --depth 3 --budget 7000 "lineage e2e lifecycle user privacy public authenticated owner claim profile visibility Playwright tests"`
- `graphify query --graph . --depth 3 --budget 7000 "GDPR cookie consent privacy policy analytics script gating data export delete consent banner"`
- `graphify query --graph . --depth 2 --budget 7000 "pagination paginated search params page perPage listing component query take skip total count"`

Selected current files:

- `docs/runbooks/lineage-listing-runbook.md`
- `docs/runbooks/sop-e2e-user-lifecycle.md`
- `apps/web/app/(web)/lineage/page.tsx`
- `apps/web/server/web/lineage/queries.ts`
- `apps/web/components/web/tools/tool-query.tsx`
- `apps/web/components/web/tools/tool-listing.tsx`
- `apps/web/components/web/pagination.tsx`
- `apps/web/contexts/filter-context.tsx`
- `apps/web/server/web/tools/schema.ts`
- `apps/web/server/web/tools/queries.ts`
- `apps/web/app/(web)/layout.tsx`
- `apps/web/lib/analytics.ts`
- `apps/web/components/web/footer.tsx`
- `docs/architecture/security-privacy-payments-monitoring-plan.md`

Old monorepo full graph attempt:

- `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify run /Users/brianscott/dev/ronin-dojo-monorepo`
- Result: failed with a Graphify extractor panic on a non-ASCII box-drawing character boundary in the full monorepo.
- Mitigation: graphified narrower BBL subgraphs instead.

Old BBL React graph:

- `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify run /Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy`
- Result: 2533 nodes / 10080 edges / 162 communities / 398 files tracked.

Old BBL WordPress theme graph:

- `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify run /Users/brianscott/dev/ronin-dojo-monorepo/wordpress/blackbeltlegacy-theme`
- Result: 38 nodes / 50 edges / 10 communities / 6 files tracked.

Old BBL queries:

- `graphify query --graph /Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy --depth 3 --budget 8000 "GDPR cookie consent privacy banner analytics localStorage blackbeltlegacy"`
- `graphify query --graph /Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy --depth 3 --budget 8000 "lineage search pagination filter profile member lifecycle blackbeltlegacy"`
- `graphify query --graph /Users/brianscott/dev/ronin-dojo-monorepo/wordpress/blackbeltlegacy-theme --depth 3 --budget 8000 "GDPR cookie consent privacy banner analytics blackbeltlegacy"`

Selected old BBL files:

- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/shared/CookieConsentBanner.jsx`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/profile/BBLPrivacyCenter.jsx`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/BlackBeltLegacyFinder.jsx`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/BlackBeltLegacyPublicViewer.jsx`
- `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/LineageProfileDrawer.jsx`
- `/Users/brianscott/dev/ronin-dojo-monorepo/wordpress/blackbeltlegacy-theme/functions.php`

Old monorepo hygiene note:

- The old monorepo now shows untracked `.graphify/` outputs at repo root, `src/brands/blackbeltlegacy/.graphify/`, and `wordpress/blackbeltlegacy-theme/.graphify/`.
- No old monorepo code was changed or staged.

## Findings

### Current `/lineage`

- `apps/web/app/(web)/lineage/page.tsx` renders all published public trees returned by `findPublishedLineageTrees({ brand })`.
- `apps/web/server/web/lineage/queries.ts` currently hard-caps the index at `take = 50`, orders by `name`, and returns no `total`, `page`, `perPage`, `skip`, search term, or filter contract.
- Existing query code already enforces `isPublished: true` and `PUBLIC` visibility and counts only visible members. Keep that privacy rule as the non-negotiable baseline.
- The detail query already separates public shared-cache reads from viewer-scoped authenticated reads. The index should stay public-only until a product decision says otherwise.

### Current Dirstarter patterns to reuse

- `apps/web/server/web/tools/schema.ts` uses `nuqs/server` for `q`, `page`, `perPage`, `sort`, and filters.
- `apps/web/server/web/tools/queries.ts` uses `skip`, `take`, `count`, and `$transaction` to return `{ tools, total, page, perPage }`.
- `apps/web/components/web/tools/tool-query.tsx`, `tool-listing.tsx`, `filter-context.tsx`, and `pagination.tsx` already solve URL query state, debounced client filter updates, and accessible pagination links.
- Recommendation: implement a lineage-specific schema/query/listing layer that mirrors this pattern instead of inventing a new pagination component.

### Current privacy surface

- `apps/web/app/(web)/layout.tsx` wraps the public app in `PlausibleProvider`.
- Dirstarter docs say its Plausible default is privacy-friendly and does not require a consent banner by default. Do not break default analytics casually.
- `apps/web/lib/analytics.ts` queries Plausible server-side for admin/reporting metrics.
- `apps/web/components/web/footer.tsx` does not currently expose privacy, terms, cookie settings, or privacy center links.

### Old BBL privacy implementation

- `CookieConsentBanner.jsx` stores `bbl_cookie_consent` in `localStorage`, supports essential/analytics/marketing categories, and defaults non-essential categories to opt-out in the banner.
- `BBLPrivacyCenter.jsx` stores `bbl_privacy_preferences` and `bbl_cookie_consent`, exposes consent toggles, data export request, correction/profile edit, processing restriction contact, deletion request, privacy policy, terms, and privacy contact paths.
- Old BBL has a mismatch worth fixing in the port: the banner initializes analytics false, while Privacy Center defaults analytics true before stored consent is loaded. New implementation should use one shared default: essential true, everything else false unless accepted.
- Old BBL deletion/export endpoints were WP REST style (`/gdpr/export-request`, `/gdpr/delete-request`). The new app should use Dirstarter/Better Auth/orpc/server-action style, require auth for identity-bound requests, and record request rows or support tickets before destructive automation.

### Old BBL lineage/search implementation

- `BlackBeltLegacyFinder.jsx` has directory mode switching, search query, verified/school/style/rank filters, member pagination via `limit`/`offset`, load-more behavior, and public member profile routing.
- `BlackBeltLegacyPublicViewer.jsx` has public/unlisted visibility controls, share links, offline cache handling, audit/telemetry calls, and admin diagnostics gating.
- `LineageProfileDrawer.jsx` is rich but carries known TODOs around role gating and stale-loading states. Port behavior selectively; do not port old assumptions wholesale.
- The WP `blackbeltlegacy-theme/functions.php` is mostly bundle enqueue/localization; useful as deployment context, not as the source of privacy behavior.

## Petey plan

### Goal

Stage three implementation sessions, with `/lineage` pagination/search as priority number one, followed by lineage lifecycle tests, then GDPR-like privacy support.

### Tasks

#### SESSION_0247_TASK_01 - Graphify and source-map the lineage/privacy work

- **Agent:** Petey + Hubble
- **What:** Use Graphify-first discovery on the current repo and old BBL implementation, then verify exact files.
- **Steps:**
  1. Confirm current repo branch/worktree and current Graphify stats.
  2. Query current lineage, lifecycle, pagination, and privacy surfaces.
  3. Graphify old BBL React and WP theme subgraphs after full monorepo Graphify failed.
  4. Read exact current and old BBL files selected by Graphify.
- **Done means:** This SESSION records graph stats, queries, selected files, and findings.
- **Depends on:** nothing

#### SESSION_0247_TASK_02 - Stage `/lineage` pagination/search implementation

- **Agent:** Petey + Cody + Desi
- **What:** Convert the current `/lineage` 50-row index into a query-param-driven searchable, paginated listing.
- **Steps:**
  1. Add lineage search params schema mirroring `toolFilterParams`: `q`, `page`, `perPage`, optional `discipline`, optional `organization`, and optional `sort` only if the UI exposes it.
  2. Replace `findPublishedLineageTrees` with or add `searchPublishedLineageTrees` returning `{ trees, total, page, perPage }`.
  3. Search only public tree/listing fields for MVP: tree name, description, discipline name, and organization name. Do not search hidden member names until a privacy review signs that off.
  4. Reuse existing `Pagination` and query-state patterns; add a lineage-specific search/listing component only if current tool components cannot be adapted cleanly.
  5. Add unit/integration tests proving public-only filtering, hidden-member count behavior, total counts, page bounds, and URL param parsing.
- **Done means:** `/lineage?q=...&page=...` returns stable public-only results with no hidden count/name leakage.
- **Depends on:** SESSION_0247_TASK_01

#### SESSION_0247_TASK_03 - Stage lineage lifecycle E2E tests

- **Agent:** Doug + Cody + Giddy
- **What:** Build E2E/user-lifecycle coverage around public, authenticated, owner, claim, profile, and visibility paths.
- **Steps:**
  1. Start from `docs/runbooks/sop-e2e-user-lifecycle.md` and `docs/runbooks/lineage-listing-runbook.md`.
  2. Seed or factory-create lineage fixtures with public, unlisted, restricted, and private nodes/trees.
  3. Cover anonymous public listing/detail reads.
  4. Cover authenticated non-owner reads without restricted/private leakage.
  5. Cover owner/editor reads where existing ACLs allow them.
  6. Cover claim request lifecycle and profile visibility changes where the implementation exists; mark true gaps as pending product work rather than faking assertions.
- **Done means:** A focused E2E/lifecycle suite catches the privacy regressions SESSION_0245 fixed and the pagination/search behavior SESSION_0248 will add.
- **Depends on:** SESSION_0247_TASK_02

#### SESSION_0247_TASK_04 - Stage GDPR-like privacy implementation

- **Agent:** Giddy + Cody + Doug
- **What:** Port the useful BBL privacy UX into the Next/Dirstarter stack without claiming legal certification.
- **Steps:**
  1. Add a shared consent/preferences model in the client with essential true and analytics/marketing/personalization false by default.
  2. Add a cookie/privacy preferences banner or panel that can be reopened from footer/legal links.
  3. Decide whether Plausible remains always-on under Dirstarter's privacy-friendly default or becomes controlled by the analytics toggle only after product/legal review.
  4. Add privacy/terms/cookie-setting links to the public footer.
  5. Add authenticated privacy-center request flows for data export, correction path, processing restriction contact, and deletion request. Prefer request records/manual queue first; do not hard-delete lineage facts automatically.
  6. Add tests for consent persistence, withdrawal, banner reopen, analytics gating if enabled, and auth-required request submission.
- **Done means:** The app has BBL-equivalent privacy affordances implemented in the new stack, with consent categories and data-right request intake wired safely.
- **Depends on:** SESSION_0247_TASK_03 unless Brian explicitly pulls privacy ahead of lifecycle tests.

### Parallelism

- SESSION_0248 should focus on TASK_02 only: `/lineage` pagination/search.
- Doug can draft lifecycle fixture/test cases in parallel once Cody stabilizes the search query contract.
- Privacy implementation should remain a separate session unless Brian reprioritizes it, because it touches layout, footer, auth, possible data model, analytics behavior, policy pages, and legal wording.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0247_TASK_01 | Petey + Hubble | Graph/source-map planning work, no production changes. |
| SESSION_0247_TASK_02 | Cody + Desi | Clear implementation plus UX/search ergonomics. |
| SESSION_0247_TASK_03 | Doug + Giddy | Privacy/security lifecycle testing and no-leak assertions. |
| SESSION_0247_TASK_04 | Giddy + Cody + Doug | Legal-adjacent privacy architecture, implementation, and verification. |

### Open decisions

- Product/legal must approve final privacy, terms, cookie, consent, and DSR wording. This plan is implementation support only.
- Decide during privacy implementation whether Plausible stays always-on under Dirstarter's no-cookie baseline or is controlled by the analytics preference toggle.
- Decide whether privacy requests need durable Prisma models (`PrivacyRequest`, `ConsentRecord`) or a support/email queue for MVP.
- Decide whether `/lineage` search should ever include public member names. MVP should not.
- SESSION_0244 baseline-content waterfall remains deferred by explicit user override, not blocked.

### Risks

- Consent UI can create false legal confidence if policy text, data inventory, retention, processors, and legal bases are not reviewed.
- Automated deletion can damage lineage integrity when one person's profile participates in other people's lineage facts. Prefer request/review/pseudonymization patterns first.
- Search must not reintroduce the hidden-member leakage closed in SESSION_0245.
- Full old monorepo Graphify currently fails; rely on narrower BBL subgraphs until the extractor panic is fixed or avoided.
- If privacy adds persistent models, ADR and migration discipline are required.

### Scope guard

- Do not implement code in SESSION_0247; this is a planning/staging session.
- Do not add ratings or SEO schema changes here.
- Do not execute the deferred SESSION_0244 baseline-content waterfall.
- Do not copy old BBL WP/React code directly into the new app without adapting to Dirstarter auth/query/cache patterns.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Analytics, Authentication, Prisma, and Content docs checked live on 2026-05-24.
- **Baseline pattern to extend:** Dirstarter `nuqs` filter params, `Pagination`, `searchTools` transaction/count pattern, Plausible provider, Better Auth server-side authorization, and Prisma query/service shape.
- **Custom delta:** Ronin lineage tree search, visibility-safe lifecycle tests, consent/preferences UI, and privacy request flows.
- **No-bypass proof:** Plan reuses existing Dirstarter primitives and explicitly rejects old BBL direct backend/API copying.

## Staged SESSION_0248 implementation

### Goal

Implement `/lineage` pagination/search as priority number one.

### Inputs to read

- `docs/sprints/SESSION_0247.md`
- `docs/runbooks/lineage-listing-runbook.md`
- `apps/web/app/(web)/lineage/page.tsx`
- `apps/web/server/web/lineage/queries.ts`
- `apps/web/server/web/tools/schema.ts`
- `apps/web/server/web/tools/queries.ts`
- `apps/web/components/web/pagination.tsx`
- `apps/web/components/web/tools/tool-query.tsx`
- `apps/web/components/web/tools/tool-listing.tsx`
- Old reference: `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/BlackBeltLegacyFinder.jsx`

### First task

Create the lineage search params and query contract, then wire `/lineage` to URL-driven search/pagination while preserving public-only visibility and visible-member counts.

### Suggested task IDs

| Task | Agent | Done means |
| --- | --- | --- |
| SESSION_0248_TASK_01 | Cody | Lineage params schema and `searchPublishedLineageTrees` return paginated `{ trees, total, page, perPage }`. |
| SESSION_0248_TASK_02 | Cody + Desi | `/lineage` UI exposes search and pagination using existing components/patterns. |
| SESSION_0248_TASK_03 | Doug + Giddy | Tests prove page/search behavior and no hidden member/name leakage. |

## What landed

- Planned the promoted follow-up work as a three-session implementation sequence.
- Graphified current repo and BBL old implementation subgraphs.
- Confirmed exact current and old files to start from.
- Recorded legal caveat and official privacy guidance sources.
- Staged SESSION_0248 so a fresh window can begin with `/lineage` pagination/search immediately.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0247.md` | New closed Petey plan for lineage search, lifecycle tests, and privacy implementation staging. |
| `docs/knowledge/wiki/index.md` | Add SESSION_0247 to the session index. |

## Decisions resolved

- `/lineage` pagination/search is priority number one for the next implementation window.
- Privacy work should be GDPR-like implementation support, not legal certification.
- Old BBL privacy/search behavior is reference material only; implementation must use the new Dirstarter/Next/Prisma/Better Auth shape.

## Open decisions / blockers

- Product/legal review is required before publishing final privacy/legal text or claiming GDPR compliance.
- Plausible consent behavior needs a deliberate decision during privacy implementation.
- Privacy data persistence model is undecided.
- Member-name lineage search is out of MVP scope until privacy reviewed.
- SESSION_0244 baseline-content waterfall remains deferred by explicit user override, not blocked.

## Task log

| Task ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0247_TASK_01 | Petey + Hubble | done | Current repo and old BBL subgraphs queried; exact files read and recorded. |
| SESSION_0247_TASK_02 | Petey + Cody + Desi | staged | `/lineage` pagination/search implementation staged for SESSION_0248. |
| SESSION_0247_TASK_03 | Doug + Cody + Giddy | staged | Lifecycle/E2E suite staged after search contract lands. |
| SESSION_0247_TASK_04 | Giddy + Cody + Doug | staged | GDPR-like privacy implementation staged after lifecycle/search unless reprioritized. |

## Review log

| Review | Scope | Result |
| --- | --- | --- |
| Doug | Testability and lifecycle coverage | PASS with follow-up: do not fake claim/profile lifecycle tests before the implementation exists. |
| Giddy | Privacy/security/data integrity | PASS with caveat: legal text and data rights process require product/legal approval; no automated hard-delete of lineage facts without review. |
| Desi | UX staging | PASS: reuse current search/pagination patterns; avoid a bespoke search UI unless existing primitives block it. |

## Hostile close review

- **Dirstarter alignment:** PASS. Plan extends Dirstarter analytics/auth/Prisma/content listing patterns.
- **Security/privacy:** PASS with caution. The plan explicitly blocks hidden member search and automated destructive deletion.
- **Data integrity:** PASS. Lineage visibility rules remain public-only on the index.
- **Verification honesty:** PASS. No implementation or legal compliance is claimed.
- **Workflow compliance:** PASS. Graphify-first discovery used; wiki/index close staged.

## ADR / ubiquitous-language check

- No ADR created in this plan-only session.
- ADR likely needed if SESSION_0249/0250 adds durable privacy/consent/request models or changes the public lineage listing/search contract.
- No ubiquitous-language update needed yet; "GDPR-like privacy support" is treated as implementation shorthand, not a domain term.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0247.md` created with JETTY 3.0; `wiki/index.md` updated for current session. |
| Backlinks/index sweep | `SESSION_0247.md` backlinks `wiki/index.md`; index row added. |
| Wiki lint | `bun run wiki:lint` failed with pre-existing repo-wide debt: 232 errors / 509 warnings. Follow-up filter `bun run wiki:lint 2>&1 \| rg "SESSION_0247\|session-0247\|0247" \|\| true` returned no hits. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Review recorded above; no open implementation finding blocks SESSION_0248. |
| Review & Recommend | Next session staged with concrete goal, inputs, and first task. |
| Memory sweep | No operator memory update needed; session file carries the staging plan. |
| Next session unblock check | Unblocked: start with `/lineage` params/query contract. |
| Git hygiene | User authorized stage/commit/push; final command proof reported in bow-out response. |
| Graphify update | Will run after commit/push; final stats reported in bow-out response to avoid a second commit loop. |

## Reflections

- The old BBL privacy UX is useful, but it mixes legal copy, WP endpoints, local storage, and destructive account language. The new implementation needs the affordances without copying the assumptions.
- Dirstarter's Plausible baseline matters: adding a banner does not automatically improve privacy if it creates inaccurate promises or breaks a privacy-friendly analytics setup.
- `/lineage` should follow the existing tools search pattern closely. The hard part is not pagination; it is preserving visibility semantics while search expands the surface area.

## Status

Closed.
