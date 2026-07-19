---
title: Wiki Change Log
slug: log
type: protocol
status: superseded
created: 2026-04-26
updated: 2026-07-19
last_agent: codex-session-0571
---

# Wiki Change Log

Superseded append-only log of early wiki changes per the original `CLAUDE.md` rule 4.

## Superseded Status

This file was last maintained during the SESSION_0030/0031 era and is no longer the operating change log for normal project work. Do not append routine docs/runbook/session changes here.

Current source of truth:

- `docs/sprints/SESSION_NNNN.md` for session-local work and closeout evidence.
- `docs/protocols/project-log.md` for build, task, and review accountability.
- `docs/knowledge/wiki/index.md` for discoverability of wiki/runbook/architecture pages.
- `docs/knowledge/wiki/manual-boundary-registry.md` for owner-gated manual setup and launch blockers.

Use this file only as historical context for early wiki adoption.

## 2026-07-16 — SESSION_0543

- Updated D-047 with the exact +7 Users / +4 Organizations / +4 Passports left by an interrupted local prodsnap
  verification attempt. Cleanup remains a separate, explicitly authorized, backup-first and scratch-proven data
  operation; recurring count-neutral verification is not conflated with historical residue removal.
- Added SESSION_0543 to the wiki index and linked the active drift entry back to its evidence record.

## 2026-05-30 — SESSION_0311

- Lineage epic Phase 3-0: added nullable `RankAward.organizationId` FK → `Organization` (awarding
  school; `ON DELETE SET NULL`, indexed) + `Organization.rankAwards` back-relation; migration
  `20260531033236_add_rankaward_organization` (purely additive, no data loss). Amended ADR 0016 with
  the awarding-school axis (distinct from `awardedBy` promoter + `Membership` affiliation; core
  decision unchanged). Operator-overseen (DB-bound, not autonomous).
- Reverted 2 stale pre-session floating working-tree edits (`SESSION_0305.md` evidence rows,
  emptied `scripts/capture-balkan-orgchart.ts`) — restored to `main`'s correct versions.

## 2026-05-30 — SESSION_0310

- Added discoverability entry for `docs/sprints/SESSION_0310.md` to `docs/knowledge/wiki/index.md`.
- Recorded the lineage epic Phase 2 closing slice: node card hover lift refinement on
  `LineageTreeCanvas`'s inner draggable — subtle `hover:scale-[1.02]` + belt-color glow via a
  hover-only `--belt-tint` CSS variable sourced from `member.selectedRank.colorHex`, with
  `var(--color-primary)` fallback for rankless members and a `useReducedMotion()`-gated path
  that keeps the SESSION_0309 baseline cluster verbatim. Closes Phase 2's node-level
  micro-interaction surface area before Phase 3 belt-rail integration begins.

## 2026-05-30 — SESSION_0309

- Added discoverability entry for `docs/sprints/SESSION_0309.md` to `docs/knowledge/wiki/index.md`.
- Recorded the lineage epic Phase 2 third slice (bundled): `--ease-snappy` `@theme` token +
  `connector-grow-y/x` `@keyframes` + lineage tree connector grow-in on initial render + shared
  `DrawerContent` snappy entrance refinement. Token-first bundling: 3 consumers ship in the same
  commit as the new token.

## 2026-05-28 — SESSION_0278

- Added discoverability entry for `docs/sprints/SESSION_0278.md` to `docs/knowledge/wiki/index.md`.
- Recorded the Black Belt Legacy `/lineage/join` intake bridge in `docs/product/black-belt-legacy/GAP_MATRIX.md`.
- Updated email operations docs for brand-aware Baseline and Black Belt Legacy sender routing.

## 2026-05-20 — PR39 Baseline product pack intake

- Added discoverability entry for `docs/product/baseline-martial-arts/PRD.md` and `docs/product/baseline-martial-arts/STORIES.md` to `docs/knowledge/wiki/index.md`.
- Registered the Baseline product packet in the wiki index because PR39 review feedback explicitly requested index/log wiring.
- Operating accountability remains in `docs/protocols/project-log.md`; this log stays superseded except for this PR review compatibility entry.

## 2026-04-26 — SESSION_0004

- Created `JETTY_3.0.md` — annotation standard v1
- Created 4 templates: `_template-concept`, `_template-file`, `_template-decision`, `_template-runbook`
- Created `wiki/index.md` — master index linking all docs
- Retrofitted `passport-and-shells.md` with JETTY 3.0 frontmatter, mermaid diagram, backlinks
- Registered all existing `docs/` files in index with status + health scores

## 2026-04-26 — SESSION_0006

- Added JETTY 3.0 frontmatter to 15 docs: all architecture, rituals, protocols, runbooks, agents files
- Created `docs/protocols/code-guardrails.md` — coding SOP (no nested ternaries, lint, conventional commits)
- Created `docs/knowledge/wiki/incidents.md` — append-only unclean close incident log
- Added unclean close recovery mode to `docs/rituals/closing.md` with `closed-unclean` status
- Updated `plan-vs-current.md` — all entities ✅, behavioral requirements with S1 coverage, phases updated
- Updated `program-plan.md` — S1 and S5 marked ✅
- Updated wiki index: session statuses, health scores, new Obsidian vault + wiki-lint + code guardrails + incidents sections

## 2026-04-26 — SESSION_0007

- **S2 implemented**: Better-Auth post-signup hook, Passport + DirectoryProfile server actions/queries, `/me` page + editor
- Added JETTY 3.0 frontmatter to SESSION_0005, SESSION_0006, SESSION_0007
- Updated `docs/rituals/opening.md` step 6: SESSION files must include JETTY 3.0 frontmatter template at creation
- Added G8 (Zod `.optional()` for form strings) and G9 (`z.record()` v4 arity) to code guardrails
- Kaizen: `str()` helper pattern, check-before-build habit, Zod v4 gotchas documented
- Updated `program-plan.md` — S2 marked code complete (smoke test pending)

## 2026-04-26 — SESSION_0008 through SESSION_0013

- **S3 implemented**: Organization create + join flow, CRUD pages, membership lifecycle
- Sessions 0008–0013 covered org create, detail, list pages; join button; smoke testing
- Updated `program-plan.md` — S3 marked ✅

## 2026-04-26 — SESSION_0014 + SESSION_0015

- **S4 implemented**: Directory search with privacy-aware listing, filters, seed data
- Created `server/web/directory/` queries + schema + components
- Seed script expanded with directory profiles and org memberships
- S4 code complete, browser verification deferred to SESSION_0017

## 2026-04-27 — SESSION_0016

- Added ADR 0009 for mobile auth strategy (Better-Auth mobile SDK chosen)
- Created `packages/api-client/` scaffold for mobile auth
- Created `docs/architecture/dirstarter-architecture-map.md` — master L1 execution contract
- Created `docs/architecture/s2-s4-pattern-audit.md` — pattern compliance gap analysis
- Identified SESSION_0017 prework: S4 browser verification and Dirstarter pattern remediation

## 2026-04-27 — SESSION_0017

- Browser-verified S4 directory — fixed `localhost` brand mapping in `proxy.ts`
- **S4 formally closed.** Plan Milestone 1 (S1–S4) complete ✅
- Created payload files: `passport/payloads.ts`, `organization/payloads.ts`, `directory/payloads.ts`
- Refactored all org/passport/directory queries from inline `include` to payload-based `select`
- Updated `/me/page.tsx` to use Dirstarter `<Intro>/<Section>` pattern
- Updated `program-plan.md` — S4 marked ✅
- Updated wiki log (this entry)

## 2026-04-29 — SESSION_0023 through SESSION_0025

- Implemented Wave A schema substrate in `apps/web/prisma/schema.prisma`
- Created numbered accountability ledgers: `TASK_PLAN_LOG` and `TASK_REVIEW_LOG`
- Added hostile close review protocol and wired it into `closing.md`
- Tightened full-close mode contract with required full-close evidence artifact
- Added executable wiki lint command: `bun run wiki:lint`
- Updated ubiquitous language for quick close, full close, JETTY sweep, wiki lint, Kaizen reflection, and hostile close review
- Cleaned active wiki backlinks until `bun run wiki:lint` returned no violations

## 2026-04-29 — SESSION_0028

- Re-sequenced `WORKFLOW_5.0.md` after SESSION_0021-0027 drift.
- Added Program CRUD feature data prerequisites and updated `seed.ts` wiki notes for Program seed data.
- Added SESSION_0028 Program CRUD implementation and smoke proof references.

## 2026-04-30 — Directory monetization roadmap

- Preserved the pasted roadmap source at `docs/architecture/source/directory-monetization-roadmap.md`.
- Created `content-engine/directory-monetization-roadmap.md` with the repo reuse audit, DRY guardrails, phased plan, and Dirstarter source links.
- Updated the wiki index for SESSION_0028 closed-full status and the new roadmap page.
- Added full-close evidence to the roadmap synthesis and marked Local by Flywheel WordPress cleanup as MB-012.

## 2026-04-30 — SESSION_0029

- Preserved the SESSION_0029 ChatGPT paste at `docs/architecture/source/raw/SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md`.
- Created the Programs/Curriculum/Certification, Monetization/Entitlements, and Dirstarter Commerce Alignment specs.
- Updated `WORKFLOW_5.0.md` to insert SESSION_0029 as a spec session and push the School Ops CRUD continuation to SESSION_0030.
- Patched stale schema-status notes in `data-model.md` and `plan-vs-current.md`.
- Patched Dirstarter docs inventory URLs for current content and SEO docs.
- Updated wiki index for the new specs, raw source, and SESSION_0029.
- Removed merged local worktrees `wt-school-ops` and `wt-core-platform`.
- Added ADR 0011 for entitlement-first commerce with compact Dirstarter docs proof links.
- Updated `closing.md` so full close includes worktree cleanup and ADR/glossary checks.
- Updated `ubiquitous-language.md` with commerce and entitlement terms.

## 2026-04-30 — SESSION_0030 staged

- Preserved the CGR file system and wiring map source at `docs/architecture/source/raw/SESSION_0030_cgr_file_system_wiring_map_chatgpt_raw.md`.
- Created `docs/sprints/SESSION_0030.md` as the Petey execution packet for class schedules, class sessions, and instructor assignments.
- Cross-reviewed the raw map against existing Dirstarter/Ronin routes, server folders, Prisma models, and SESSION_0029 entitlement-first decisions, then kept CGR as source material and scope guard.
- Updated wiki index for the new raw source and staged SESSION_0030.

## 2026-04-30 — SESSION_0030 hostile close

- Ran hostile close review on the SESSION_0030 plan before implementation.
- Created `docs/architecture/security-privacy-payments-monitoring-plan.md` with private-data, financial-transaction, wireframe, monitoring, and test gates.
- Added MB-013 for security and financial transaction readiness.
- Updated Dirstarter docs inventory with SESSION_0030 security review sources: structure, Prisma, auth, env, payments, monetization, rate limiting, analytics, storage, deployment, cron, and content.
- Closed `docs/sprints/SESSION_0030.md` as `closed-full`; class schedule implementation is deferred to the next execution session.

## 2026-04-30 — SESSION_0031 planned + prep refactor

- Created `docs/sprints/SESSION_0031.md` (status `planned`) with all 11 SESSION_0030 hostile-review security gates folded into task done-criteria, DDD framing, and live Dirstarter docs references.
- Added `apps/web/lib/brand-context.ts` as the single source of truth for `HOST_TO_BRAND` / `resolveBrand` / `getRequestBrand`; refactored `apps/web/proxy.ts` and `apps/web/server/web/program/actions.ts` to import from it. MB-002 brand-scope hardening now has one resolution path.
- Patched `docs/protocols/WORKFLOW_5.0.md` calendar: SESSION_0030 = planning close, SESSION_0031 = class schedule execution with security gates, downstream rows shifted by one (launch day moves to SESSION_0041).
- Added MB-014 in `docs/knowledge/wiki/manual-boundary-registry.md` for production multi-domain + server-action hardening (apex domains, `HOST_TO_BRAND` rows, `serverActions.allowedOrigins`, env validation). Owner-gated; does not block SESSION_0031, blocks staging.

## 2026-05-28 — SESSION_0276

- Populated Brian Scott's Rigan Machado BJJ lineage tree member selected rank via `LineageTreeMember.rankAwardId` seed backfill to the BJJ `BK1` `RankAward`.
- Migrated the Baseline discipline lineage section from the legacy row/edge fallback to the v1 `LineageTree` / `LineageTreeBoard` path for seeded discipline tree slugs.
- Confirmed Bob Bass claim-flow readiness: Bob is a claimable placeholder node on the published Rigan Machado lineage tree; authenticated browser testing remains operator-side.
- Updated the Black Belt Legacy gap matrix and SESSION_0276 close record.

## 2026-05-28 — SESSION_0277

- Added `docs/runbooks/sop-email-runbook.md` to document Resend transactional email operations, where sent emails display, where replies are read/responded to today, and future in-app inbox data flows.
- Added `/admin/email` as an admin-facing email operations surface and linked it from admin navigation/command palette.
- Added selected-rank admin controls for lineage tree members so `LineageTreeMember.rankAwardId` can be selected/cleared from the admin lineage detail page.

## 2026-05-28 — SESSION_0279

- Created `docs/sprints/SESSION_0279.md` for the `/lineage/join` browser smoke and BBL email readiness session.
- Patched BBL production email readiness: brand-aware magic links, request-origin Join links, explicit brand sender configuration status, `.env.example` sender vars, and BBL production proof-script support.
- Recorded the local DB/browser-smoke blocker: Postgres.app was repaired to password auth, but further local DB commands require explicit approval after the approval-limit rejection.

## 2026-05-29 — SESSION_0304

- Created the premium-motion epic foundation: `docs/runbooks/design/motion-system.md` (martial-arts motion language — easing/duration tokens, mandatory `prefers-reduced-motion` discipline, per-surface animation catalog, 4-phase staged epic) and `docs/knowledge/wiki/wiring-ledger.md` (Desi not-done audit: zero P0s, two FS-0001 handroll slips fixed, localStorage clean, black-belt-rail verdict, two verified mermaid wire-flows).
- Enhanced `black-belt-rail` as the flagship motion surface: data-driven belt color from `Rank.colorHex`, member avatars, #1 emphasis, and a reduced-motion-gated staggered reveal (`motion/react`) via a new client `BlackBeltRailList`.
- Added route-level `loading.tsx` boundaries to 7 listing routes (disciplines, organizations, programs, tournaments, schools, members, courses) via a shared `ListingSkeleton`, for instant navigation feedback.
- Added a progressive `lib/haptics.ts` util (Android `navigator.vibrate`; iOS Safari / unsupported = silent no-op) wired to tournament register/select/cancel interactions; documented the iOS-web limitation + PWA/native path.
- Fixed two FS-0001 handroll slips Desi surfaced: cert-verify trust card → `Card`, schedule empty state → `EmptyList`.

## 2026-05-29 — SESSION_0305

- Fixed three lineage drawer mobile UX bugs: drawer-open delay so the ancestor path highlights before the drawer slides in (split selection into path state + 400ms-delayed `drawerOpen`), swipe-to-close gesture on the Base UI Dialog `Drawer` (80px threshold, gated on `scrollTop === 0`), and mobile content overflow (`min-w-0` + `overflow-hidden`).
- Authored `docs/petey-plan-0305.md` — the 4-phase lineage tree enhancement epic (mobile-first pinch-zoom, tree animations, black-belt-rail integration + family-tree templates, trophy.so gamification POC) with a Desi design review (8 animation opportunities, 3 mobile UX gaps).
- (Backfilled by SESSION_0306: copilot's close left this log + the wiki index session row + wiki:lint unrun; SESSION_0306 added the index rows and fixed 6 broken cross-reference links in the plan doc.)

## 2026-05-29 — SESSION_0306

- Advanced the lineage epic (`docs/petey-plan-0305.md`) **Phase 1 — mobile-first tree**: added two-finger pinch-to-zoom over the lineage canvas, auto-fit-to-viewport initial scale on load, lowered the zoom floor (`MIN_SCALE` 0.7 → 0.5) so wide trees shrink to fit, and a touch-aware "Pinch to explore" hint.
- Made `LineageNodeCard` responsive (narrower width/avatar/padding below `md`) and tightened sibling/root flex gaps on mobile so the unscaled tree is narrower — composition only, no FS-0001 slips.
- All gesture/zoom animation respects `prefers-reduced-motion` (instant scale, no tween) and pinch is disabled in `editMode` so it never fights the `@dnd-kit` drag editor; native scroll still provides one-finger pan.
- Plan-lock refinement (Petey): kept native scroll for pan + added pinch as the zoom driver, instead of a full transform-based pan/zoom rewrite — lower blast radius for the same Phase-1 mobile win before the S6 launch.

## 2026-05-29 — SESSION_0307

- Advanced the lineage epic (`docs/petey-plan-0305.md`) **Phase 2 — tree animations, first slice**: added a generation-stepped node entrance stagger to `LineageTreeCanvas` using `motion/react`. Each node card fades in from `opacity: 0, y: 6` over 250ms (`deliberate`) with the motion-system `ease-out` entrance curve (`[0.16, 1, 0.3, 1]`).
- Delay formula: `clamp(generation * 0.12 + siblingIndex * 0.06, 0, 0.9)` seconds — root nodes settle first, then each generation tier compounds the head start while sibling micro-stagger reads the row left-to-right. The 900ms ceiling keeps deep/wide trees from feeling draggy (motion-system "intentional stillness" + ~6–8 item stagger cap).
- Reduced-motion mandate: `useReducedMotion()` drills as a boolean prop through `LineageBranch` → `LineageChildGroupColumn` recursion; reduced-motion users get `initial={false}` + `transition: { duration: 0 }` — full final state on first paint, no stagger.
- DnD untouched: the `motion.div` wraps the existing draggable `<div ref={setDraggableRef}>` without owning its ref, so `@dnd-kit` translate, listeners, and drop targets keep working identically.
- Plan-lock refinement (Petey): used the existing motion-system `ease-out` entrance token instead of `petey-plan-0305.md`'s bklit "Snappy" curve (`cubic-bezier(0.85, 0, 0.15, 1)`). Token-first discipline — introducing `--ease-snappy` belongs to a separate slice that bundles drawer + connector animations as multiple consumers of the new token.

## 2026-05-30 — SESSION_0308

- Advanced the lineage epic (`docs/petey-plan-0305.md`) **Phase 2 — tree animations, second slice**: added an animated path trace to `LineageTreeCanvas`. When a node is tapped the highlight rises sequentially from the tapped node up to the root — one ancestor edge (connector segments + ring) per step.
- Promoted `buildSelectedPathMemberIds` to `buildSelectedPathTrace` that returns `{ pathMemberIds, pathDistanceById, maxDistance }`; distance is measured in ancestor hops from the tapped node (0 = tapped, 1 = parent, …). `maxDistance` drives the per-step delay scaling.
- Per-step delay formula: `tracePerStepDelay(maxDistance) = clamp(0.05, min(0.2, 1.0 / maxDistance), 0.2)` seconds. Five-ancestor baseline (5 × 0.2s + 0.2s connector transition = 1.2s) matches the spec cap; deeper trees compress the per-step delay with a 50ms floor so even extreme depth keeps a perceivable cascade.
- Threaded `pathDistanceById` + `perStepDelay` through `LineageBranch` → `LineageChildGroupColumn` recursion. Connector `transitionDelay` is computed per element: the `h-6 w-px` below a member and the `h-px` sibling bar share `(distance - 1) * perStep`; the `h-4 w-px` above each child group shares the same edge step via the parent's distance. Connector transitions bumped from `duration-300` to `duration-200` to match the motion-system `base` token.
- Ring + highlight shadow moved off the dnd-kit draggable onto a transparent rounded wrapper that owns only `transition-all duration-200` plus inline `transitionDelay`. Hover lift (`hover:-translate-y-1 hover:shadow-lg`) and the dim filter (`opacity-45 grayscale-[15%]` + counter-dim) stay on the inner draggable so they keep their existing `duration-300` and are NEVER delayed by the trace.
- Reduced-motion mandate: when `useReducedMotion()` is true, `perStepDelay = 0` so every connector and ring lights simultaneously — exactly the previous instant full-highlight behavior. DnD unchanged: the draggable ref, listeners, drop-target ring (`isOver`), and `CSS.Translate.toString(transform)` style all stay on the inner div.
- Plan-lock refinement (Petey): per-element inline `transitionDelay` instead of bolting the delay onto the existing `transition-all` on the draggable — protects hover transitions from inheriting the trace delay (which would have made hover feel sluggish during a trace play). A dedicated highlight wrapper isolates the ring/shadow transitions cleanly.

## 2026-05-31 — SESSION_0313

- Added the `docs/security/` documentation pack for the Ronin Dojo Baseline security review: hub, risk register, brand-scope hardening plan, payment security checklist, privacy data classification, and security test plan.
- Recorded Graphify/Codex cloud setup failure: `graphify` was not installed and no `.graphify/` artifacts were present, so SESSION_0313 used exact known docs/source reads and documented the environment remediation.
- Updated the wiki index and MB-013 manual boundary note so the new security pages are linked and discoverable; no runtime code, schema, auth, Stripe, or storage behavior changed in this docs-first slice.

## 2026-05-31 — Planning: petey-plan-0319 (PromotionEvent display surfaces epic)

- Petey grill + plan staging for the SESSION_0319→0321 arc (display surfaces for the `PromotionEvent` model landed in SESSION_0318). Wrote `docs/petey-plan-0319.md` and enriched SESSION_0318's "Next session" pointer with the four locked decisions so the unattended cold-process run executes without grilling.
- Locked: route `/events/[slug]` (additive `PromotionEvent.slug`); gallery proved with **real Black Belt Legacy photos** pulled from `ronin-dojo-monorepo` (`dist-bbl/brand/blackbeltlegacy/images/`) into `apps/web/public/seed/events/` (downscaled, ~2 MB, 8 images) + empty state; split S0319 seed-gen+OKC+read page / S0320 org timeline+`/events` index / S0321 begin editor+upload; run via `scripts/auto-session.sh 3` (push + PR-per-session, no auto-merge, halt on failed gate).
- Generalized `scripts/auto-session.sh`'s prompt to read whatever epic plan the SESSION "Next session" block names (was hardcoded to `petey-plan-0305.md`).
- No runtime code or schema changed in this planning commit; the numbered sessions (0319–0321) own the build.

## 2026-06-05 — SESSION_0347

- Updated `wiring-ledger.md` with WL-P1-6 for the unaudited generic admin entitlement grant/revoke path and marked it fixed by routing through audited admin entitlement helpers.
- Updated `sop-data-and-wiring-flows.md` with the comp/gift entitlement flow: trusted triggers, server-derived tier keys, audit-before-mutation, and lineage tier-policy read model.
- Added the SESSION_0347 row to the wiki index and refreshed the wiring-ledger index summary.

## 2026-06-06 — SESSION_0351

- Added `enter-the-dojo-schema-intake.md` to translate legacy WordPress/Pods doctrine into the current Prisma/Next/ContentAtom language and route bigger schema ideas to the wiring ledger.
- Added `repo-alignment-report.md` for weekly/on-demand architecture/admin/schema/docs alignment sweeps.
- Expanded `repo-code-glossary.md` with repo/project/session/schema/monitoring terms and updated the wiki index for SESSION_0351.
- Added WL-P2-6 through WL-P2-10 for tournament content shell, org/staff chart, pulse automation, brand-switcher proof, and fallow cleanup follow-ups.

## 2026-06-06 — SESSION_0352

- Added the shared `/directory` discipline filter on `Discipline.slug` and moved the People facet onto paginated `searchDirectoryProfiles`.
- Added `profile-projection.ts` and a focused projection test to preserve DirectoryProfile privacy, lineage trust badges, and listing-tier behavior across directory People cards.
- Updated the custom component inventory and glossary for `DirectoryFilters`, slug/cross-facet/pagination/projection terms, and recorded the fallow cleanup of the dead unpaginated People list query.

## 2026-06-06 — SESSION_0353

- Added `/directory` location (Region→City selects) + org/school searchable-combobox filters with per-facet visibility, on the shared brand-scoped projection; extracted the testable `buildDirectoryProfileWhere`.
- Promoted `ComboboxSelector` admin→common (added `size`/`clearLabel` + accessible clear button) and applied Desi's parity + site-wide `motion-reduce` fixes.
- Fixed Bug A (Base UI Select rendered raw id/slug on preset) via `items` on the discipline + lineage selected-rank Selects; cataloged the systemic ~17-consumer sweep as WL-P1-7.
- Triaged WL-P2-10 deps (keep `tailwind-merge`/`@react-email/preview-server`; `@ai-sdk/google`/`github-slugger` removable, deferred for triple-lockfile reconciliation) and classified two prod lineage reports as non-code (drawer tier-gate; 12-vs-17 visibility).

## 2026-06-06 — SESSION_0354

- Resolved WL-P1-7 systemically: new `DataSelect` wrapper (`components/common/data-select.tsx`) + render test; dogfooded in the new claim form; converted `school-filters`/`technique-filters`; the other ~30 id/enum Select consumers got the inline `items` fix; `tool-filters` documented as a ReactNode-label exception.
- Built a generic directory claim system mirroring the lineage flow: `ProfileClaimRequest` model + additive migration, submit action (dedup guard), `/admin/claims` review queue (org approval grants `ownerId`; person approval flagged for manual merge).
- Added the `ProfileHero` + `ProfileClaimTeaser` public "mock profile" on `/directory/[slug]` for placeholder persons, and an owner live-preview in `profile-form`/`school-form`; fixed `organizationHref` null/unknown→`/organizations` link-through 404.
- Resolved WL-P2-10: removed `@ai-sdk/google` + `github-slugger` and regenerated all 3 lockfiles; `pnpm install --frozen-lockfile` verified green.
- Updated the custom component inventory + glossary (`DataSelect`, `ProfileHero`, `ProfileClaimRequest`, claimable, claim teaser); wrote `docs/petey-plan-0355.md` as the feature spec.

## 2026-06-07 — SESSION_0355

- Extended `DataSelect` with an optional per-option `content?: ReactNode` dropdown row (`dataSelectRowContent`) keeping `label` string-only for the trigger/typeahead/a11y; render test added; `tool-filters` moved back onto `DataSelect` (ReactNode exception removed).
- Added `BeltSwatch` (data-driven SVG `fill`, no inline style) driven by `Rank.colorHex`; first consumer = the admin rank-award `DataSelect` rows (`colorHex` added to that query).
- Completed the claim funnel discoverability: `OrgClaimCta` (owner-less org/school, sign-in-gated per SOP §5) + `ListingRegisterCta` ("Add your school" / "Join the directory") + a dedup hint on the create-org form (interim of the Dirstarter search-first pattern).
- Browser-smoked the claimant-side flows (register CTAs + org claim CTA both auth states); admin-side smoke + person teaser env-blocked (non-admin dev user, no placeholder seed) — flagged.
- Staged `docs/petey-plan-0356-profile-redesign.md` (one Person-presentation contract + BBL shell + unified register/claim/invite funnel) and `docs/petey-plan-0357-bbl-galaxy.md`; stamped `petey-plan-0337` dormant.
- Logged 2 findings: the lineage profile-drawer tier/role gate must open for everyone (FINDING_01); the org/directory/profile domain-hub discovery gap (FINDING_02).

## 2026-06-12 — SESSION_0369 BBL landing/register polish

- Updated BBL landing/register funnel: Register CTAs route to `/lineage/join`, landing visual rhythm/token polish improved, Join Legacy form expanded into a premium lineage-ready registration intake, and backend lead/claim metadata captures the added context.
- Added route regression coverage for BBL Register → Join Legacy.
- Browser screenshot proof remains pending in a configured local environment because this container's Next/Turbopack dev render failed on Google font internals before app code.

## 2026-06-12 — SESSION_0372 BBL SEO hygiene

- Added request-aware native robots and sitemap metadata routes for the BBL lineage-first launch surface.
- Scoped BBL sitemap output to D9 allowed routes and disallowed gated routes in robots.
- Updated page metadata helpers so OG/Twitter URLs use the active request origin instead of static `NEXT_PUBLIC_SITE_URL`.

## 2026-06-12 — SESSION_0373 BBL local-first app route closeout

- Added SOT-ADR D10: DNS flip waits for Phases 1–6 local functionality on `bbl.local`; Stripe rehearsal remains complete and Phase 3 uses user-carry semantics.
- Closed the dashboard root/events/techniques/lineage editor route seam into `/app`: migrated admin/dashboard redirects, `/app/profile`, `/app/events/*`, `/app/techniques/*`, and `/app/lineage/[treeId]/edit`.
- Preserved unmigrated admin areas in place and recorded the remaining Phase 3 identity/server-flattening work for the next session.

## 2026-06-13 — SESSION_0374 Full unified /app wave 1 + Phase 3 preflight map

- Locked the route lane to Option A (migrate every admin area to `/app` regardless of the D9 brand gate; the gate stays a public-route 404 concern only).
- Migrated `certificates`, `posts`, `content`, `media` from `/admin` to the `/app` permission-gated shell: `requirePermission` layout guards, history-preserving `git mv`, unwrapped `withAdminPage`, registered `posts.manage`, `/admin/*`→`/app/*` 308 redirects + tests, sidebar entries, and `revalidatePath` repointed to `/app/*`.
- Added `PHASE3_USER_CARRY_PREFLIGHT.md` (40 `userId` models classified: 1 root-nullable, 3 REPOINT, 1 DUAL, 34 CARRY, 1 DECISION-NEEDED=FightRecord) and `APP_AND_SERVER_MIGRATION_MAP.md` (uniform recipe, ordered remaining 23-area waves, deferred `server/<entity>` flatten codemod plan). No schema edits; server flatten = map-only.

## 2026-06-13 — SESSION_0375 Codex automerge handoff for BBL app waves

- Added `scripts/auto-session-codex-automerge.sh`, a local Codex auto-merge driver defaulting to the first three safe remaining BBL `/app` waves and stopping before Prisma, server flattening, or Phase 3 identity work.
- Added `codex-cloud-bbl-waves-2-4.md` as a Codex Cloud fallback prompt while documenting local as preferred for Graphify, `bbl.local`, `gh`, and ntfy proof.
- Updated autonomous/Codex runbooks and the runbook hub with the local launch command: `caffeinate -i scripts/auto-session-codex-automerge.sh`.

## 2026-06-13 — SESSION_0376 BBL /app migration wave 2

- Migrated `roles`, `entitlements`, `invites`, and `leads` from `/admin` into the unified `/app` shell with per-area `requirePermission(APP_AREA_PERMISSIONS.<area>)` layout guards.
- Added Wave 2 `/admin/*` -> `/app/*` redirects and tests, app sidebar entries, scoped route-string updates, and `revalidatePath` repoints while leaving `server/admin/<area>` modules unflattened.
- Restored authenticated local proof: dev-login resolves to an admin user, curl returned 200 for all four `/app` areas on `bbl.local`, and Playwright rendered `/app/roles` with the Wave 2 sidebar entries.

## 2026-06-13 — SESSION_0377 BBL /app migration wave 3

- Migrated `email`, `brand-settings`, `privacy/requests`, and `reports` from `/admin` into the unified `/app` shell with per-area `requirePermission(APP_AREA_PERMISSIONS.<area>)` layout guards.
- Added Wave 3 `/admin/*` -> `/app/*` redirects and tests, app sidebar entries, scoped route-string updates, and `revalidatePath` repoints while leaving `server/admin/<area>` modules unflattened.
- Kept `privacy` rooted at `/app/privacy/requests` because the legacy surface is a DSR requests workflow, not a standalone privacy dashboard.

## 2026-06-13 — SESSION_0378 BBL /app migration wave 4

- Migrated `programs`, `courses`, `age-groups`, `skill-levels`, and `schedule` from `/admin` into the unified `/app` shell with per-area `requirePermission(APP_AREA_PERMISSIONS.<area>)` layout guards.
- Added Wave 4 `/admin/*` -> `/app/*` redirects and tests, app sidebar entries, scoped route-string updates, and `revalidatePath` repoints while leaving `server/admin/<area>` modules unflattened.
- Authenticated `bbl.local` curl proof returned 200 for all five `/app` areas; browser auth was blocked by localhost redirect/cookie context, so curl is the render evidence.

## 2026-06-13 — SESSION_0379 Lineage path planning pivot

- Pivoted the lineage-tree epic: instead of hand-building a 2D tidy-tree engine, chose to fork the MIT/TS/D3 library `donatso/family-chart` and build a focal-centric genealogy explorer (View A) alongside the existing org-chart canvas (View B), which is kept. Discovery found the old plan's premise stale (`bucketByDepth` dead, canvas already recursive).
- Locked the integration design in `lineage-tree-runbook` §0 (verdict) + §0a (spec) + §0b (candidate comparison); rewrote `petey-plan-0379` to the fork+extend slice sequence.
- Captured a parallel ChatGPT/Balkan "visual-parity spike" approach verbatim as candidate-B in `docs/architecture/source/raw/Brian-Chat-GPT-Session.md` (and appended to the runbook). Engine path (3 options, donatso front-runner) deferred to a fresh chat session for fresh eyes. No code this session.

## 2026-06-13 — SESSION_0380 Lineage View A engine path LOCKED

- Fresh-chat Petey grill of candidate-A against the real code + lineage-hub + the Dirstarter listing lens. Locked the SESSION_0379-deferred decision: **one shared engine-agnostic DTO, two layout engines** — vendor MIT `donatso/family-chart` for the focal View A explorer + keep the existing `LineageTreeCanvas` as the overview View B (untouched; copy → `lineage-tree-canvas-v2.tsx` only when View B work begins). Ratified in **ADR 0026**.
- Clarified candidate-B is **original code, not Balkan** (Balkan vocabulary borrowed as a design language only) — no Balkan package or license; we adopt its design (two-step DTO + role/trust/cohort vocabulary). Collapsing to one engine deferred to a later evidence-based gate (donatso whole-tree smoke + View A feel).
- Two grounding corrections verified in code (sharpen future slices): secondary multi-parent edges are **already materialized** in the public payload (`relationshipsTo`/`relationshipsFrom`); the trust vocabulary **already exists** as `lib/lineage/trust-status.ts` (richer than candidate-B's — reuse, don't reinvent).
- Re-pointed `petey-plan-0379` (two-step DTO 0379-2, grounding note on 0379-4, new 0379-B1 View B track, decisions 7–9) and stamped `lineage-tree-runbook` §0/§0b LOCKED. No code; vendor donatso (0379-1) is next session.

## SESSION_0381 — 2026-06-14 — Lineage View A: vendor donatso fork (slice 0379-1)

- **IoC + license review (TASK_01):** Cloned `donatso/family-chart` (SHA `c7d22492dfc3090109cf28c6d4c82b1ee4ffd770`). `LICENSE.txt` = MIT confirmed. IoC sweep clean: no network calls, no eval/exec, no fs writes, no install hooks, no external URLs (one ancestry.co.uk comment URL only). Sole runtime dep: `d3 ^7.9.0`. `sideEffects: false`.
- **Vendor copy (TASK_02):** Full `src/` copied to `apps/web/lib/lineage/family-chart/`; upstream `LICENSE.txt` + `UPSTREAM.md` (SHA + IoC summary) added. `d3@7.9.0` + `@types/d3@^7.4.3` added to `apps/web/package.json` and installed. TypeScript typecheck (`tsc --noEmit`) passes with zero errors on first run.
- **Desi design review:** Sharpened the card HTML spec for slices 0379-2 + 0379-3 — four HIGH findings: (1) carry `trustStatus: LineageTrustStatus` (full 6-state enum, not `verified: boolean`); (2) `isFocal: boolean` in the DTO; (3) inline styles only (no CSS classes in d3-managed HTML); (4) initials fallback as positioned `<div>` using `memberInitials()`. Folded into `petey-plan-0379` §0379-2 + §0379-3.
- **Smoke render (TASK_03):** `lineage-family-chart-smoke.tsx` (dev-only, process.env guard) mounts the engine via `useRef`/`useEffect`. Grounding fix discovered: `formatData` does not auto-derive `rels.children` from `rels.parents` — must build children in a second pass (fixed in smoke; note for slice 0379-2 adapter). Browser-verified at `localhost:3000/lineage/rigan-machado-bjj-lineage`: **17 BJJ nodes rendered, correct genealogy tree shape, connecting lines, zero console errors (Doug).**
- **petey-plan-0379** frontmatter restamped + §0379-2/§0379-3 card design spec updated (Desi findings). Runbook frontmatter restamped.

## SESSION_0416 — 2026-06-19 — BBL landing foundation built + promoted to `/` (SOT files)

- After the 4-stream prune consolidation, rebuilt the **BBL public landing** from a solid foundation and **promoted it to the home page** `/` (behind the unchanged countdown gate; only the bob-tony preview cookie sees it). `/lineage/join` kept as-is.
- **Type system the right way:** Poppins headings + Inter body **site-wide** — fonts loaded globally on `<html>`, Geist var renamed `--font-geist`, `@theme` `--font-display`/`--font-sans` point at the BBL fonts (Tailwind v4 `@theme` needs a full `.next` clear in dev). One guarded `brandThemeCss()` helper for `[data-brand]` + `[data-org]`.
- **Landing composition:** scrolling-phone hero → Rigan heritage → Rigan video → **claim wizard** (3-step stepper, monorepo UX on our fields/action) → email capture. Ads removed (a #120 `brandHasFeature→true` regression re-enabled them).
- **Chrome:** recovered the reverted **BBL footer** (`5413dc15`) → global, socials + link columns un-gated, no programs; **BBL logo** in the header; curated right-nav links; **gi fallback avatar** + the **Passport→client server seam** (`getCurrentUserAvatar`, the Prisma-in-browser rule); **login modal** (magic link) wired to the nav.
- New SOT file docs: `bbl-home-landing`, `bbl-join-landing-composition`, `bbl-join-form-wizard`, `bbl-footer`, `bbl-nav-sheet`, `bbl-type-system`, `bbl-current-user-avatar`.

## SESSION_0428 — 2026-06-21 — files/ spec catalog + repo-health consolidation epic

- Added the `files/` spec catalog: `files/README.md` (system diagram + catalog), `_template/SPEC_TEMPLATE.md`, and the first specs `public-passport-dto.md` + `bbl-galaxy-data-flow.md` (ASCII + mermaid wiring).
- Opened `docs/epics/post-launch-clean-repo-001.md` (RepoHealth findings RH-1…6) and cataloged the specs in `wiki/index.md`.

## SESSION_0429 — 2026-06-21 — design-system component batch + Mammoth-Rebuild CRM epic

- **Design system (Desi pass):** `component-design-system.{md,html}` + shared `scripts/lib/bbl-doc-theme.ts` (one token set — accent `#E52421`, Poppins/Inter, 1-2-3 step; gold flagged off-brand) + dark/light inversion (`prefers-color-scheme` + `data-theme`, accent `#FF4D49` on dark). Restyled the orchestration-hub + loop-poster generators; added the `orchestration-hub.md` runbook.
- **Component library specs (PWCC series):** `product/black-belt-legacy/page-specs/bbl-admin-task-board.md` (PWCC-001), `files/m-card-pattern.md` (PWCC-002), `files/three-level-magnetic-drawer.md` (PWCC-003), `files/admin-kanban-board.md` (PWCC-007), `files/mammoth-crm-bindings.md` (PWCC-004/005/006) — all brand-/content-agnostic with PWCC cloud handoffs.
- **Mammoth-Rebuild CRM epic:** `docs/epics/mammoth-rebuild-crm-001.md` — HubSpot-replacement assembled from the library; PWCC register; cross-brand (dark/orange) proof.
- **Inventory + index:** `custom-component-inventory.md` rows (MagneticDrawer, MCard) + bumped `updated`; `wiki/index.md` rows for all new pages + SESSION_0428/0429.
- **Tooling:** declared `marked` as a root devDependency so the advertised `docs:hub` generator runs from a clean checkout (Codex review #137).

## SESSION_0430 — 2026-06-21 — m-card PWCC-002 slice 1 (kind=roster on /directory/profiles)

- Built the first real `m-card` slice: `apps/web/components/web/m-card/m-card.tsx` (`kind=roster` on the Dirstarter base `components/common/card.tsx`) + `apps/web/lib/m-card/map-roster.ts`; `/directory/profiles` people now render via m-card (orgs/trees stay on `FacetResultCard`), parity preserved.
- Token-only theming (`--rank-color`→`--primary` fallback); presentation-only (redaction upstream). Unit test (shape + no leak) + a desktop/390px e2e.
- Wiki sync: `m-card-pattern.md` lifecycle PLANNED→WIP; `index.md` row updated to WIP + slice-1 note; `custom-component-inventory.md` MCard row flipped to BUILT. PR #150.

## SESSION_0571 — 2026-07-18 — Mammoth lean operating shell and recovery map

- Reconciled the phone screenshots against the canonical repo, Baseline vault/Downloads, private Mammoth
  vault, and locally visible iCloud Obsidian mirror. Screenshot-listed notes and legacy goal images were
  located; `MMB_INITIAL_INTAKE` remains explicitly missing pending its source or phone Sync.
- Added G-021 and a recovery/authority manifest. Legacy `/GOALS` records remain historical pointers rather
  than a second live backlog; current goals stay in the Goals Ledger.
- Ratified ADR 0048: reusable vault templates/presets/installer live in the monorepo; live client notes and
  dashboards stay private; Mammoth's database remains transactional CRM truth.
- Added the first `vault-kit` client-ops slice, Mammoth preset, and thin `/game-on`/`/game-off` skills. Scratch
  and private-vault installs preserve user-edited managed files and are byte-stable on a second run.
- Kept the legacy Discussion→Determination→Decision shape as a three-use template pilot. No skill was
  promoted because the existing artifact has no unique execution contract beyond Petey/grilling/SESSION notes.
