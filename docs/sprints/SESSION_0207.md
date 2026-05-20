---
title: "SESSION 0207 - Dirstarter uplift L4 baseline listings tier flow"
slug: session-0207
type: session--implement
status: closed-full
created: 2026-05-20
updated: 2026-05-20
last_agent: codex-session-0207
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0206.md
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/lane-ledger.md
  - docs/runbooks/baseline-listings-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0207 - Dirstarter uplift L4 baseline listings tier flow

## Date

2026-05-20

## Operator

Brian + codex-session-0207 (Petey planning, Cody implementation, Doug verification)

## Goal

Implement the L4 baseline listings relabel and tier flow on Ronin's existing `Tool` model/routes using L3 `tier`, generated `tierPriority`, and bookmark primitives.

## Bow-in notes

- **Branch:** `session-0207-uplift-L4-listings-tier-flow`, cut from `main`.
- **Graphify first:** satisfied before repo-wide grep.
- **Graphify queries used:**
  - `SESSION_0207 L4 Tool.tier tierPriority bookmark primitives listing tier flow`
  - `public tools components tool-card bookmark actions admin tools tier status audit ToolTier`
  - `auth session safe-actions userActionClient getSession login redirect components button next-safe-action useAction`
  - `AuditLog entityType action before after userId brand Tool tier transition tests`
- **Dirstarter docs/changelog checked:** `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/changelog/listing-tiers`.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Public Tool/listing cards/detail actions, admin Tool form/table, bookmark actions, tier-aware submit/dashboard/featured surfaces. |
| Extension or replacement | Extension. Ronin keeps the `Tool` model, `/admin/tools`, `/submit`, and public slug routes while public/admin copy now says Listing where appropriate. |
| Why justified | Upstream `7e724b6` tier flow replaces the simple featured flag with Free/Standard/Premium listing tiers, admin tier control, tier-aware UI, and bookmark affordances. |
| Risk if bypassed | Ronin would have L3 schema primitives with no public/admin flow, forcing later listing work to rediscover tier semantics. |

## Tasks

### SESSION_0207_TASK_01 - Public listing card with ToolTier + status surfacing

- **Agent:** Cody
- **Status:** complete.
- **Result:** Public Tool cards/detail pages now surface listing tier badges, Featured/Verified status badges, `View Listing`, and Save controls backed by L3 bookmarks. Public CTA/link behavior now uses tier capabilities instead of the legacy `isFeatured` flag.

### SESSION_0207_TASK_02 - Admin tier transition panel + audit

- **Agent:** Cody
- **Status:** complete.
- **Result:** The existing `/admin/tools` gold-standard page is relabeled to Listings, adds a tier column/filter, replaces the old feature switch in the form with a Free/Standard/Premium radio panel, and writes `TIER_TRANSITION` audit rows on tier changes.

### SESSION_0207_TASK_03 - Smoke + ledger + close

- **Agent:** Doug + Petey
- **Status:** complete.
- **Result:** Focused tests, full isolated app tests, typecheck, build, curl smoke, Vercel readiness, lane ledger, wiki index, project log, baseline runbook, upstream marker, and full-close artifacts are complete.

## Decisions resolved

1. Public/admin copy can say Listing, but Ronin's Prisma model and route substrate remain `Tool`.
2. `Tool.tier` is now the source of truth for admin tier control; `isFeatured` is kept as a compatibility projection and is true for `Premium`.
3. Standard and Premium CTA/link treatment uses `tiersConfig` capabilities (`doFollow`, `featuredPlacement`) instead of checking `isFeatured` directly.
4. Unauthenticated Save routes to `/auth/login?next=...`; authenticated Save uses the L3 bookmark safe actions.
5. The broader direction is confirmed: courses, techniques, programs, disciplines, schools/orgs/teams, and members should converge toward listing/tool parity over time, with the current Tool admin page as the UX standard. That is recorded as a future parity target, not expanded into L4.

## Files touched

| File/group | Note |
| --- | --- |
| `apps/web/components/web/listings/listing-tier-badge.tsx`, `listing-bookmark-button.tsx` | New shared listing tier/status badge and bookmark affordance. |
| `apps/web/components/web/tools/*`, `apps/web/app/(web)/[slug]/page.tsx` | Public listing cards/detail actions now show tier/status and Save. |
| `apps/web/app/(web)/submit/*`, `apps/web/app/(web)/dashboard/table.tsx`, `components/web/listings/featured-tools.tsx` | Tier-aware upgrade/featured logic replaces direct `isFeatured` checks. |
| `apps/web/app/admin/tools/*`, `apps/web/server/admin/tools/*` | Admin listing relabel, tier form/table/filter, and tier-transition audit logging. |
| `apps/web/messages/en/*.json` | Public/admin copy relabeled from tool to listing where L4 touches the Tool substrate. |
| `apps/web/server/admin/tools/*.test.ts` | Focused tests for admin tier filtering and `TIER_TRANSITION` audit rows. |
| `apps/web/.dirstarter-upstream` | L4 partial-port note appended; copied SHA unchanged. |
| `docs/architecture/uplift/lane-ledger.md`, `docs/architecture/uplift/epic-2026-05-19.md`, `docs/runbooks/baseline-listings-runbook.md`, `docs/knowledge/wiki/index.md`, `docs/protocols/project-log.md`, `docs/sprints/SESSION_0207.md` | L4 governance closeout. |

## Verification evidence

- `bun test --isolate server/admin/tools/actions.safe-action.test.ts server/admin/tools/queries.test.ts server/web/tools/queries.test.ts server/web/bookmarks/queries.test.ts` - passed, 6/6 tests.
- `pnpm --filter dirstarter typecheck` - passed.
- `cd apps/web && bun biome check <28 touched code/message files>` - passed with no fixes.
- `pnpm --filter dirstarter build` - passed; `prisma migrate deploy` found no pending migrations, Next built 147 static pages, and `next-sitemap` completed. One pre-existing Turbopack/NFT warning remains from `server/admin/storage/monitoring/queries.ts` importing `next.config.ts`.
- `cd apps/web && bun test --isolate --path-ignore-patterns='e2e/**'` - passed, 244 tests / 872 assertions across 51 files.
- Local built-app smoke: `pnpm --filter dirstarter start`; `curl -H 'Host: baseline.local' http://localhost:3000/aws` returned public listing HTML containing `Premium Listing`, `Free Listing`, `Featured`, `Verified`, and `Save`; `/categories` returned `Listings` and `Save`; `/admin/tools` redirected to `/auth/login?next=/admin/tools`.
- `vercel ls --yes` - latest Production and Preview deployments were Ready.
- `bun run wiki:lint` - passed with 0 errors / 495 warnings across 396 markdown files.

## Review log

### SESSION_0207_REVIEW_01 - L4 baseline listings tier flow

- **Reviewed tasks:** SESSION_0207_TASK_01, SESSION_0207_TASK_02, SESSION_0207_TASK_03.
- **Dirstarter docs check:** live docs/changelog checked: project structure, Prisma, authentication, and listing tiers.
- **Verdict:** Pass. No P0/P1 findings. L4 uses the upstream tier model without renaming Ronin's `Tool` substrate, and the protected admin transition path has a DB-backed audit proof.
- **Residual risk:** Subscription cancellation still downgrades to `Free` in the Stripe webhook from L3 compatibility; upstream documents graceful downgrade to `Standard`. Keep this as a follow-up for the vendor/Stripe lane rather than changing billing behavior inside L4.

## Open decisions / blockers

No blockers for SESSION_0208. Follow-ups:

- Decide in L7 whether subscription cancellation should downgrade paid listings to `Standard` instead of `Free`.
- Plan a later parity lane for non-Tool domains (courses, techniques, programs, disciplines, schools/orgs/teams, members) to converge on listing/tool admin UX without forcing that refactor into the uplift L4 scope.

## Next session

SESSION_0208 is L5 - UI primitives Part 1 (upstream-derived). Start from `docs/architecture/uplift/epic-2026-05-19.md` section "L5 - SESSION_0208", `docs/architecture/uplift/lane-ledger.md`, this SESSION_0207 close artifact, and the upstream component primitive files named in the epic. First task: port upstream-derived UI primitives on top of the current Ronin component system without reworking the listing flow.

## Reflections

- L3 left the schema in the right shape: L4 was mostly about routing existing UI and admin behavior through `tier` instead of rebuilding.
- The old `isFeatured` flag is still useful as a compatibility projection, but letting it remain an independent admin switch would undermine the tier source of truth.
- The user clarified the bigger product direction mid-session: Tool/listing parity should become a cross-domain admin standard, but L4 stayed a proof lane instead of becoming a broad rewrite.
- The non-isolated grouped Bun test command showed mock bleed between lightweight query tests and DB-backed safe-action tests. The repo's `--isolate` pattern is the correct proof path and the full isolated suite passed.

## ADR / ubiquitous-language check

No ADR needed. Existing Dirstarter uplift doctrine already says `Tool` remains the internal substrate and Listing is the public monetized object. No new ubiquitous-language terms were introduced; "listing parity" was recorded as a future implementation target, not a formal domain term.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0207 created; touched governance docs updated to `updated: 2026-05-20` and `last_agent: codex-session-0207`. |
| Backlinks/index sweep | Wiki index has SESSION_0207; epic, lane ledger, baseline runbook, and project log backlink SESSION_0207. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors / 495 warnings across 396 markdown files; warnings are pre-existing orphan/R8 debt. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0207_REVIEW_01` appended to `docs/protocols/project-log.md` and summarized above. |
| Review & Recommend | Next session recommendation written for SESSION_0208 / L5. |
| Memory sweep | No operator memory update needed; durable facts live in this session, project log, lane ledger, and baseline runbook. |
| Next session unblock check | Unblocked; L5 can start from current component primitives and this L4 close artifact. |
| Git hygiene | Branch `session-0207-uplift-L4-listings-tier-flow`; final commit/push proof reported in bow-out response. |
| Graphify update | Post-commit Graphify stats reported in bow-out response. |

## Status

closed-full
