---
title: LLM Wiki Index
slug: index
type: concept
status: active
created: 2026-04-26
updated: 2026-07-26
author: Brian + Copilot
last_agent: claude-session-0624
---

# LLM Wiki Index

Master index of all knowledge pages, docs, and sessions in the Ronin Dojo Baseline repo.

## Meta

| Page | Type | Status |
| --- | --- | --- |
| [JETTY 3.0](../JETTY_3.0.md) | protocol | active |
| [JETTY 3.0 Systems Profile for Baseline Repo](../jetty-3-baseline-systems-profile.md) | protocol | active |
| [How to Use These Registries](../how-to-use-these-registries.md) | protocol | active |
| [LLM Wiki README](../README.md) | protocol | active |
| [CLAUDE.md](../../../CLAUDE.md) | protocol | active |
| [Project Log (retired)](../../protocols/project-log.md) | log | archived-frozen |

## Concepts

| Page | Type | Status |
| --- | --- | --- |
| [**Agent Systems Map**](agent-systems-map.md) | concept | active — **the 5 pillars of how this repo runs agents** (SESSION_0468): skill-routing · context discipline (the roster) · work ledgers · trust boundaries · verification loops. Each → our concrete implementation; the **task→workflow router** + **allowed-vs-never table** are filled-in gaps |
| [**Design-System Doctrine**](design-system-doctrine.md) | concept | active — **canonical design-system law** (ADR 0040, SESSION_0467): tokens-as-contract, type/spacing/φ, one Card surface + named cards, kernel boundary, 6 brand tear sheets |
| [Passport and Shells](concepts/passport-and-shells.md) | concept | active |
| [Repo Truth Index](repo-truth-index.md) | concept | active |
| [Second-Brain Levels](../../_archive/wiki/second-brain-levels.md) | reference | archived (SESSION_0711 sweep) — was: active — 5-level self-assessment of the repo's knowledge system (strong L1/L2/L4, gap at L3 semantic, emerging L5); open L3 decision |
| [Repo Code Glossary](repo-code-glossary.md) | reference | active — SESSION_0351 expanded repo/project/session/schema/monitoring terms; SESSION_0352 added slug, cross-facet filter, pagination, projection, and pen-test terms |
| [ENTER_THE_DOJO Schema Intake](concepts/enter-the-dojo-schema-intake.md) | concept | active — legacy WordPress/Pods doctrine translated to current Prisma/server-action/query-payload language |
| [Aliases and Canonical IDs](aliases-and-canonical-ids.md) | concept | active |
| [Baseline Docs Adoption Checklist](../../_archive/wiki/baseline-docs-adoption-checklist.md) | protocol | archived (SESSION_0711 sweep) |
| [Dirstarter Baseline Index](../../architecture/dirstarter-baseline-index.md) | architecture | active — **primary L1 reference** |
| [Dirstarter Upstream Sync Snapshot - 2026-05-14](../../architecture/dirstarter-upstream-sync-2026-05-14.md) | architecture | active — upstream porting gate |
| [Dirstarter Upstream Uplift Epic - 2026-05-19](../../architecture/uplift/epic-2026-05-19.md) | architecture | active — **15-lane multi-session epic plan; execution authority for the uplift** |
| [Dirstarter Upstream Uplift Lane Ledger](../../architecture/uplift/lane-ledger.md) | ledger | active — append-only per-lane audit ledger |
| [L1 Env/Deploy Diff Report](../../architecture/uplift/L1-env-deploy-diff-report.md) | architecture | active — SESSION_0205 env/deploy decision input |
| [Dirstarter Docs Inventory](dirstarter-docs-inventory.md) | concept | superseded by baseline index |
| [Dirstarter Gap Audit](../../_archive/wiki/dirstarter-gap-audit.md) | concept | archived (SESSION_0711 sweep) — was: superseded by baseline index |
| [Content Atoms](content-engine/content-atoms.md) | concept | active |
| [Curriculum Extract Schema](content-engine/curriculum-extract-schema.md) | concept | active |
| [Command Center and Intake](content-engine/command-center-and-intake.md) | concept | active |
| [Video Shortcuts and Iggy Flow](content-engine/video-shortcuts-and-iggy-flow.md) | concept | active |
| [Directory Monetization Roadmap](../../_archive/wiki/directory-monetization-roadmap.md) | concept | archived (SESSION_0711 sweep) |
| [Open Brain Repo Memory](concepts/open-brain-repo-memory.md) | concept | active |
| [Listing Pattern Repurposing](concepts/listing-pattern-repurposing.md) | concept | active |
| [Graphify Component Port Map](component-porting/graphify-component-port-map.md) | concept | active |
| [Component Porting Pipeline ASCII](component-porting/component-porting-pipeline-ASCII.md) | concept | active |
| [Graphify Report Panel](../../_archive/wiki/graphify-report-panel.md) | concept | archived (SESSION_0711 sweep) |
| [Ronin Component Port Command Center](../../_archive/wiki/ronin-component-port-command-center.md) | concept | archived (SESSION_0711 sweep) |
| [PWCC Mermaid Code](../../_archive/wiki/PWCC-mermaid-code.md) | concept | archived (SESSION_0711 sweep) |
| [PWCC ASCII Flow Component Port Pipeline](component-porting/plawywright-component-conversion-method/PWCC-ASCII-flow-component-port-pipeline.md) | concept | active |
| [Component Port Spec](component-porting/plawywright-component-conversion-method/component-port-spec.md) | concept | active |
| [Playwright Proof Gate](component-porting/plawywright-component-conversion-method/PW-proof-gate.md) | concept | active |
| [PWCC Discovery Command Center](../../_archive/wiki/PWCC-discovery-command-center.md) | concept | archived (SESSION_0711 sweep) |
| [Simple Playwright Component Port Pipeline](../../_archive/wiki/simple-pipeline.md) | concept | archived (SESSION_0711 sweep) |
| [Lineage Family Tree Port Spec](component-porting/specs/lineage-family-tree-port-spec.md) | spec | active |
| [Lineage Profile Drawer Port Spec](component-porting/specs/lineage-profile-drawer-port-spec.md) | spec | active |
| [Lineage Responsive Switch Port Spec](component-porting/specs/lineage-responsive-switch-port-spec.md) | spec | proven — SESSION_0338 Slice 1 responsive mode switch |
| [Lineage Mobile List Port Spec](component-porting/specs/lineage-mobile-list-port-spec.md) | spec | proven — SESSION_0339 Slice 2 mobile flatten-and-indent list |
| [Lineage Carousel Rail Port Spec](component-porting/specs/lineage-carousel-rail-port-spec.md) | spec | proven — SESSION_0340 Slice 3 Embla carousel rail extension |
| [Lineage Generation Rail Port Spec](component-porting/specs/lineage-generation-rail-port-spec.md) | spec | proven — SESSION_0341 Slice 4 connector-free generation rails |
| [Lineage Adaptive Connector Port Spec](component-porting/specs/lineage-adaptive-connector-port-spec.md) | spec | draft — petey-plan-0337 Slice 5 (spike) |
| [Graphify Token Efficiency Pipeline](content-engine/graphify-token-efficiency-pipeline.md) | concept | active |
| [Topic Index](../../_archive/wiki/topic-index.md) | index | archived (SESSION_0711 sweep) |
| [Tournament Operations](concepts/tournament-ops.md) | concept | active |
| [Dirstarter Uplift Backlog](../../_archive/wiki/dirstarter-uplift-backlog.md) | backlog | archived (SESSION_0711 sweep) — was: closed/superseded by uplift epic |
| [Ronin Project Context](ronin-project-context.md) | concept | active — compact project-context canon |
| [Doc Pruning Register](doc-pruning-register.md) | registry | active — doc consolidation/demotion register |
| [Form Inventory](../../_archive/wiki/form-inventory.md) | registry | archived (SESSION_0711 sweep) — was: active — catalog of app forms + their actions/schemas |

## Product Docs

| Page | Type | Status |
| --- | --- | --- |
| [Product Documentation Index](../../product/README.md) | index | active |
| [North Star — Bubble Builder Bento Box](../../product/north-star-bubble-builder-bento-box.md) | north-star | active — the ULTIMATE north star (canvas-of-canvases · shells + one passport · bento page-builder · tournament blueprint · sliding-tile mats · CCC engines-built-once); captured SESSION_0604 → dedicated `/pp` epic (PL-012, RDD phase 14) |
| [Black Belt Legacy PRD](../../product/black-belt-legacy/PRD.md) | prd | active |
| [Black Belt Legacy Stories](../../product/black-belt-legacy/STORIES.md) | stories | active |
| [Black Belt Legacy Gap Matrix](../../product/black-belt-legacy/GAP_MATRIX.md) | report | active — SESSION_0349 records shared trust badges across directory/detail/lineage surfaces, `legend` policy support, and `/directory` faceting as the next follow-up |
| [Black Belt Legacy Cutover Checklist](../../product/black-belt-legacy/CUTOVER_CHECKLIST.md) | report | active — SESSION_0345 proved the real signed-webhook path via Stripe CLI test-mode rehearsal + fixed a returning-customer checkout bug; prod is live-mode (drift D-018) so the proxy step is corrected — deployed-domain webhook wiring is a money-free launch item |
| [BBL Gift/Comp Membership + Tier-Gating Epic](../../product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md) | spec | draft — SESSION_0345 staged: comp/gift `UserEntitlement(MANUAL_GRANT)` on the existing spine, RBAC granting, tier-gated tree-card visibility, invite/claim tie-ins, BBL.com import, multi-rank seed plan |
| [Post-Launch SOT](../../product/black-belt-legacy/POST_LAUNCH_SOT.md) | sot | active — single light P0/P1/P2 running list + Now-live (MVP_LIVE) + widget Feedback inbox; supersedes feature-intake-ledger (SESSION_0424); `lifecycle:` yaml convention |

## Architecture

| Page | Type | Status |
| --- | --- | --- |
| [Architecture README](../../architecture/README.md) | file | active |
| [Dirstarter Baseline Index](../../architecture/dirstarter-baseline-index.md) | file | active — **L1 source of truth for all Dirstarter patterns** |
| [Dirstarter Upstream Sync Snapshot - 2026-05-14](../../architecture/dirstarter-upstream-sync-2026-05-14.md) | file | active — current upstream sync gate |
| [L1 Env/Deploy Diff Report](../../architecture/uplift/L1-env-deploy-diff-report.md) | architecture | active — env/deploy handoff for SESSION_0205 |
| [S1 Schema Design](../../architecture/s1-schema-design.md) | file | active |
| [Ubiquitous Language](../../architecture/ubiquitous-language.md) | concept | active |
| [Program Plan](../../architecture/program-plan.md) | file | active |
| [Plan vs Current](../../architecture/plan-vs-current.md) | file | active |
| [Data Model](../../architecture/data-model.md) | concept | active |
| [Repo Alignment Report](../../architecture/repo-alignment-report.md) | report | active — on-demand/weekly schema, docs, admin navigator, monitoring, and ledger alignment sweep |
| [Auth](../../architecture/auth.md) | file | active |
| [Legacy Conversion](../../architecture/legacy-conversion.md) | file | active |
| [Feature Data Prerequisites](../../architecture/feature-data-prerequisites.md) | file | active |
| [Dirstarter Architecture Map](../../architecture/dirstarter-architecture-map.md) | file | active |
| [Programs, Curriculum, and Certification Spec](../../architecture/programs-curriculum-certification-spec.md) | file | active |
| [Monetization and Entitlements Spec](../../architecture/monetization-entitlements-spec.md) | file | active |
| [Dirstarter Commerce Alignment](../../architecture/dirstarter-commerce-alignment.md) | file | active |
| [Security, Privacy, Payments, and Monitoring Plan](../../architecture/security-privacy-payments-monitoring-plan.md) | file | active |
| [Ronin Security Review](../../security/README.md) | index | active — SESSION_0313 security hardening roadmap |
| [Ronin Security Risk Register](../../security/ronin-security-risk-register.md) | file | active — priority security risk ledger |
| [Brand-Scope Hardening Plan](../../security/brand-scope-hardening-plan.md) | file | active — P0 brand isolation implementation plan |
| [Payment Security Checklist](../../security/payment-security-checklist.md) | file | active — Stripe/entitlement launch checklist |
| [Privacy Data Classification](../../security/privacy-data-classification.md) | file | active — sensitive data boundaries |
| [Security Test Plan](../../security/security-test-plan.md) | file | active — test matrix for hardening PRs |
| [PWCC Commerce Port Map](../../architecture/pwcc-commerce-port-map.md) | file | active |
| [Component Porting SOP](../../architecture/component-porting-sop.md) | file | active draft |
| [Directory Monetization Roadmap Raw Source](../../architecture/source/directory-monetization-roadmap.md) | source | active |
| [SESSION_0029 Commerce Learning Path Raw Source](../../architecture/source/raw/SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md) | source | active |
| [SESSION_0030 CGR File System and Wiring Map Raw Source](../../architecture/source/raw/SESSION_0030_cgr_file_system_wiring_map_chatgpt_raw.md) | source | active |
| [S2–S4 Pattern Compliance Audit](../../architecture/s2-s4-pattern-audit.md) | file | active |
| [Printful POD Integration Spec](../../architecture/printful-pod-spec.md) | spec | draft |
| [Infrastructure README](../../architecture/infrastructure/README.md) | index | active |
| [Domain Hosting Registry](../../architecture/infrastructure/domain-hosting-registry.md) | spec | active |
| [DNS Verification Spec](../../architecture/infrastructure/dns-verification-spec.md) | spec | active |
| [Email Delivery Spec](../../architecture/infrastructure/email-delivery-spec.md) | spec | active |
| [Hosting Data Flow](../../architecture/infrastructure/hosting-data-flow.md) | spec | active |
| [Cache Risk Register](../../architecture/cache-risk-register.md) | file | active |
| [2026-05-18 Launch Plan](../../architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md) | file | active |
| [SCHEMA_NEEDS_MANIFEST](../../architecture/SCHEMA_NEEDS_MANIFEST.md) | file | deprecated |
| [S2 Schema Additions](../../architecture/s2-schema-additions.md) | file | signed-off |
| [Lineage Public Viewer And Editor Routes](../../architecture/lineage/lineage-public-viewer-editor-routes.md) | spec | active — dashboard editor preview landed SESSION_0202 |
| [SESSION 0263 Audit Report](../../architecture/lineage/SESSION_0263_audit_report.md) | report | active — lineage v1 acceptance audit; SESSION_0264 cleared the four P0 editor gaps |
| [SESSION 0263 BBL Recon](../../architecture/lineage/SESSION_0263_bbl_recon.md) | report | active — monorepo lineage data + brand asset inventory |
| [BBL BJJ Rank + Verification Import Map](../../architecture/lineage/bbl-bjj-rank-verification-import-map.md) | architecture | active — SESSION_0264 BJJ rank/PODs field map |
| [Promotion Event Model](../../architecture/lineage/promotion-event-model.md) | plan | accepted — SESSION_0318 amended ADR 0016, migrated PromotionEvent + nullable FKs, seeded the April 10, 2026 ceremony + cohort link + read-only Rank-History display |

### ADRs

| Page | Type | Status |
| --- | --- | --- |
| [decisions/](../../architecture/decisions/) | decision | various |
| [ADR 0001 — Dirstarter (Next.js + Prisma) over WPGraphQL + JWT](../../architecture/decisions/0001-dirstarter-vs-wpgraphql.md) | decision | accepted |
| [ADR 0002 — Expo for mobile](../../architecture/decisions/0002-expo-for-mobile.md) | decision | see file |
| [ADR 0003 — No WordPress](../../architecture/decisions/0003-no-wordpress.md) | decision | see file |
| [ADR 0004 — Multi-brand encoded as `brand` column](../../architecture/decisions/0004-multi-brand-as-column.md) | decision | accepted (single-brand collapse) |
| [ADR 0005 — Legacy stack stays at tuffbuffs.com](../../architecture/decisions/0005-legacy-coexistence.md) | decision | see file |
| [ADR 0006 — Multi-domain hosting on one Vercel deployment](../../architecture/decisions/0006-multi-domain-hosting.md) | decision | see file |
| [ADR 0007 — BBL one-time migration from legacy to new stack](../../architecture/decisions/0007-bbl-migration.md) | decision | see file |
| [ADR 0008 — Brand switcher: admins + multi-brand members only](../../architecture/decisions/0008-brand-switcher.md) | decision | accepted |
| [ADR 0009 — Mobile Auth Strategy: Better-Auth Mobile SDK](../../architecture/decisions/0009-mobile-auth-strategy.md) | decision | accepted |
| [ADR 0010 — Cache strategy for auth-scoped queries](../../architecture/decisions/0010-cache-strategy.md) | decision | see file |
| [ADR 0011 — Entitlement-First Commerce](../../architecture/decisions/0011-entitlement-first-commerce.md) | decision | accepted |
| [ADR 0012 — Admin CRUD routing: flat with filter](../../architecture/decisions/0012-admin-crud-routing-pattern.md) | decision | accepted |
| [ADR 0054 — Tier-Based Entitlement Auto-Grant via Stripe Webhook (renumbered from dup 0012)](../../architecture/decisions/0054-tier-auto-grant.md) | decision | accepted |
| [ADR 0013 — Tool→Listing Pattern Repurposing](../../architecture/decisions/0013-tool-listing-repurposing.md) | decision | accepted |
| [ADR 0014 — Stripe Product Policy](../../architecture/decisions/0014-stripe-product-policy.md) | decision | accepted |
| [ADR 0015 — Domain Hosting Infrastructure](../../architecture/decisions/0015-domain-hosting-infrastructure.md) | decision | accepted |
| [ADR 0016 — Lineage Promotion Source of Truth](../../architecture/decisions/0016-lineage-promotion-source-of-truth.md) | decision | accepted |
| [ADR 0017 — pnpm pre/post scripts so Vercel runs `prisma migrate deploy`](../../architecture/decisions/0017-pnpm-pre-post-scripts.md) | decision | accepted |
| [ADR 0018 — ContentAtom owns tags/tools/media for variant posts](../../architecture/decisions/0018-content-atom-canonical-relations.md) | decision | accepted |
| [ADR 0019 — Membership = community state; UserEntitlement owns access](../../architecture/decisions/0019-membership-lifecycle-ownership.md) | decision | accepted |
| [ADR 0020 — Registration recipient userId XOR guest, keyed by recipientKey](../../architecture/decisions/0020-registration-recipient-userid-or-guest.md) | decision | accepted |
| [ADR 0021 — Brand-aware magic links + request-origin email links](../../architecture/decisions/0021-brand-aware-magic-links.md) | decision | accepted |
| [ADR 0022 — Brand Chrome Resolution](../../architecture/decisions/0022-brand-chrome-resolution.md) | decision | accepted |
| [ADR 0023 — Generic Profile Claim (member/org)](../../architecture/decisions/0023-generic-profile-claim.md) | decision | accepted |
| [ADR 0024 — Data layer: next-safe-action vs oRPC + TanStack Query](../../architecture/decisions/0024-orpc-vs-next-safe-action.md) | decision | proposed (full-oRPC per SOT-ADR D3) |
| [ADR 0025 — Passport identity source of truth (+ Affiliation, brand-color SoT)](../../architecture/decisions/0025-passport-identity-source-of-truth.md) | decision | accepted |
| [ADR 0026 — Lineage View A engine: vendored donatso fork](../../architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md) | decision | superseded by 0027 |
| [ADR 0027 — Lineage View A: custom cohort-timeline (retire family-chart)](../../architecture/decisions/0027-lineage-view-a-custom-cohort-timeline.md) | decision | accepted |
| [ADR 0028 — Shared Listing card + additive cross-entity taxonomy](../../architecture/decisions/0028-shared-listing-card-and-taxonomy.md) | decision | accepted |
| [ADR 0029 — Polymorphic Bookmark + shared ListingDetail chrome](../../architecture/decisions/0029-polymorphic-bookmark-and-listing-detail.md) | decision | accepted |
| [ADR 0030 — Per-brand Stripe account (BBL on its own account)](../../architecture/decisions/0030-per-brand-stripe-account.md) | decision | accepted |
| [ADR 0031 — Lifecycle email dry-run gate](../../architecture/decisions/0031-lifecycle-email-dry-run-gate.md) | decision | accepted |
| [ADR 0032 — Social-sign-in pending claim binding](../../architecture/decisions/0032-social-signin-pending-claim.md) | decision | accepted |
| [ADR 0033 — Component library as a shared kernel + strategic-harness posture](../../architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md) | decision | accepted |
| [ADR 0034 — One monorepo platform + per-product Vercel deploys](../../architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md) | decision | accepted |
| [ADR 0035 — Lineage rank display from awarded truth; `selectedRankAward` → pending claim](../../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md) | decision | accepted |
| [ADR 0036 — Unified Passport-keyed person claim](../../architecture/decisions/0036-unified-passport-claim.md) | decision | accepted |
| [ADR 0037 — Lineage branch heads & visual placement seeded from provenance](../../architecture/decisions/0037-lineage-branch-heads-and-visual-placement.md) | decision | accepted |
| [ADR 0038 — Per-product database separation](../../architecture/decisions/0038-per-product-database-separation.md) | decision | accepted |
| [ADR 0039 — Baseline restored as `apps/baseline` (own deploy + DB)](../../architecture/decisions/0039-baseline-as-apps-baseline.md) | decision | accepted |
| [ADR 0040 — Design-system doctrine + card architecture (one surface, named cards)](../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md) | decision | accepted |
| [ADR 0041 — Agent roster as a dispatch layer + the Kanban board as the session driver](../../architecture/decisions/0041-agent-roster-dispatch-and-kanban-as-session-driver.md) | decision | accepted |
| [ADR 0042 — Canonical public blog = `Post`/`/blog`; `ContentAtom` stays the content-ops engine](../../architecture/decisions/0042-canonical-blog-surface-post-over-contentatom.md) | decision | accepted |
| [ADR 0043 — RankAward fact vs member-owned RankMilestone](../../architecture/decisions/0043-rank-award-fact-vs-member-milestone.md) | decision | superseded — migration history; see BBL RankEntry canon |
| [ADR 0047 — Recruited-coach placeholder identity + exact-normalized dedup](../../architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md) | decision | accepted |
| [ADR 0048 — Two-repo vault-kit and client-ops projections](../../architecture/decisions/0048-two-repo-vault-kit-and-client-ops-projections.md) | decision | accepted — reusable kit in monorepo; live client vault private; product DB remains CRM truth |

## Learning Records

The **Giddy learning records** — durable _lessons_ of past sessions (the reasoning behind a fix, not the
fix). Bow-in (`opening.md` §3b) skims these for any record touching the current lane. Full index +
maintenance rule: [`docs/learning/ddd/learning-records/README.md`](../../learning/ddd/learning-records/README.md).

| Page | Type | Lesson |
| --- | --- | --- |
| [LR 0013 — Don't build what was literally asked](../../learning/ddd/learning-records/0013-dont-build-what-was-literally-asked.md) | learning | Ground-first, grill the conflict when a request contradicts a ratified ADR/LR; the capability usually already ~90% exists — the fix is often deleting a wrong branch (SESSION_0532 synthesis of 0486/0494/0521/0489). |
| [LR 0012 — Adversarial review with prod-shaped fixtures](../../learning/ddd/learning-records/0012-adversarial-review-with-prod-shaped-fixtures.md) | learning | 100+ green tests hid a self-approve CRITICAL because the fixture lacked the grant prod creates; test who _gains_ access first; two lenses catch what neither finds alone (0491/0492/0495). |
| [LR 0011 — Extend a hot path by not touching it](../../learning/ddd/learning-records/0011-extend-the-hot-path-by-not-touching-it.md) | learning | Route at the caller + a sibling core so identity regression stays re-testable; DRY polices knowledge not shape; share the kernel, not the data (0489/0488/0498/0519). |
| [LR 0010 — Make the wrong state unrepresentable](../../learning/ddd/learning-records/0010-make-the-wrong-state-unrepresentable.md) | learning | Encode the invariant in the type (absent field / discriminated union / sink-guard); a trust badge must read the fact it certifies (0526/0527/0512/0484). |
| [LR 0009 — Green isn't verified](../../learning/ddd/learning-records/0009-green-isnt-verified.md) | learning | Every gate can pass while the feature is unreachable, empty, or leaking; drive the real surface on real data — the live smoke is the load-bearing gate (0511/0529/0530). |
| [LR 0008 — One source read everywhere; "display-dead" isn't "removable"](../../learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md) | learning | Consistency = one resolver read everywhere, not N surfaces hand-synced; a zero-reader field can still be load-bearing. |
| [LR 0007 — The discoverability heuristic; "built" isn't "pointed"](../../learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md) | learning | Dead-code heuristics over-flag the load-bearing; an artifact does nothing until the read-path points at it. |
| [LR 0006 — Design systems & UI kits](../../learning/ddd/learning-records/0006-design-systems-and-ui-kits.md) | learning | One foundation + a few single-purpose pieces; tokens are the contract. |
| [LR 0005 — Extract the L1 down, don't clean-room it](../../learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md) | learning | When the kernel can't import an app L1, extract it down instead of reinventing. |
| [LR 0004 — Projection → stored table without drift](../../learning/ddd/learning-records/0004-projection-to-stored-table-without-drift.md) | learning | Promoting a read-model to a table needs one write path + backfill or it drifts. |
| [LR 0003 — Context mapping & database-per-context](../../learning/ddd/learning-records/0003-context-mapping-and-database-per-context.md) | learning | Draw the bounded-context boundary; a DB per context keeps the seam honest. |
| [LR 0002 — The shared kernel, in practice](../../learning/ddd/learning-records/0002-shared-kernel-in-practice.md) | learning | What belongs in the kernel vs a product; tokens travel, Tailwind doesn't. |
| [LR 0001 — Bounded contexts, ubiquitous language, shared kernel](../../learning/ddd/learning-records/0001-bounded-contexts-and-shared-kernel.md) | learning | The DDD foundation the roster's vocabulary rests on. |

## Sessions

Session rows no longer live here (the table was 1MB of duplicated frontmatter and stopped tracking ~0634). The SESSION_NNNN spine is the source of truth: open/staged sessions in [docs/sprints/](../../sprints/), closed sessions in [docs/sprints/_archive/](../../sprints/_archive/) (era subdirs). Read the highest-numbered SESSION file's frontmatter for current state (ADR 0049: one spine + lane: facet; highest number != most recent).

## Protocols

| Page | Type | Status |
| --- | --- | --- |
| [Chat Handoff](../../protocols/chat-handoff.md) | protocol | active |
| [Cody Pre-flight Protocol](../../protocols/cody-preflight.md) | protocol | active |
| [FAILED_STEPS Log](../../protocols/failed-steps-log.md) | protocol | active |
| [Project Log (retired)](../../protocols/project-log.md) | protocol | archived-frozen |
| [Giddy + Doug Hostile Close Review](../../protocols/hostile-close-review.md) | protocol | active |
| [Giddy Merge Strategy](../../protocols/giddy-merge-strategy.md) | protocol | active |
| [Hostile Repo Review](../../protocols/hostile-repo-review.md) | protocol | active |
| [Hot-Fix Protocol](../../protocols/hot-fix-protocol.md) | protocol | active — **break-glass** emergency prod-fix runbook; dormant by design (fires only on a user-blocking prod bug) |
| [Identify-Intent-Improve Loop](../../protocols/identify-intent-improve-loop.md) | protocol | active — **sub-routine** of `pr-review-score-fix-loop` (its `INTEGRATE_INTENT_REQUIRED` branch invokes this intent re-derivation) |
| [KISS / DRY / YAGNI Loop](../../protocols/kiss-dry-yagni-loop.md) | protocol | **superseded** (SESSION_0468) — workflow = `/fallow-fix-loop` + `/simplify` + `/code-quality`; KISS/DRY/YAGNI rubric folded into `code-quality-matrix` D3 |
| [Next Session Loading Order](../../protocols/next-session-loading-order.md) | protocol | active |
| [Petey Plan Protocol](../../protocols/petey-plan.md) | protocol | active |
| [PR Review → Score → Fix Loop](../../protocols/pr-review-score-fix-loop.md) | protocol | active |
| [QA Runtime Verification](../../protocols/qa-runtime-verification.md) | protocol | active — **schema** behind the wired `## Verification` close-gate (Doug's method; audited every bow-out by `hostile-close-review`) |
| [Three-Pass Loop](../../protocols/three-pass-loop.md) | protocol | active — **foundation**: the reusable score→fix→review engine `pr-review-score-fix-loop` is built on (invoked by other loops, not directly triggered) |
| [Review & Recommend Protocol](../../protocols/review-recommend.md) | protocol | active |
| [Send a One-off BBL Email (SOP)](../../protocols/send-email-flow.md) | protocol | active — gated draft→preview→send flow for personal/one-off BBL email (distinct from lifecycle email) |
| [Wiki Lint](../../protocols/wiki-lint.md) | protocol | active |
| [WORKFLOW 5.0](../../protocols/WORKFLOW_5.0.md) | protocol | active |
| [Code Guardrails](../../protocols/code-guardrails.md) | protocol | active |
| [Code Quality Matrix](../../protocols/code-quality-matrix.md) | protocol | active |
| [Loop of Loops — Ledger-Driven Sessions](../../protocols/loop-of-loops-ledger-driven-sessions.md) | protocol | draft |
| [Fan-Out Session Recipe](../../protocols/fan-out-session-recipe.md) | protocol | active — parallel disjoint-lane sessions: disjointness proof, prompt skeleton, shared-by-rule files, ledgered lane continuation (SESSION_0578; extends agent-systems-map §5b) |
| [Opening Ritual](../../rituals/opening.md) | protocol | active |
| [Closing Ritual](../../rituals/closing.md) | protocol | active |
| [Incidents Log](incidents.md) | protocol | active |
| [Drift Register](drift-register.md) | protocol | active |

## Agents

| Page | Type | Status |
| --- | --- | --- |
| [Petey](../../agents/petey.md) | protocol | active |
| [Cody](../../agents/cody.md) | protocol | active |
| [Brandon](../../agents/brandon.md) | protocol | active |
| [Agents README](../../agents/README.md) | protocol | active |

## Runbooks

| Page | Type | Status |
| --- | --- | --- |
| [Runbooks — Domain Hub](../../runbooks/README.md) | index | active — grouped index of all runbooks |
| [Docs Navigator](../../runbooks/dev-environment/docs-navigator.md) | runbook | active — searchable HTML doc browser (`bun run docs:nav`) |
| [Database](../../runbooks/database/database.md) | runbook | active |
| [Schema Migration](../../runbooks/database/schema-migration.md) | runbook | active |
| [Per-App Database Separation](../../runbooks/database/per-app-db-separation.md) | runbook | active — one DB per product (ADR 0038); add-a-DB + isolation proof |
| [New Client Runbook](../../runbooks/onboarding/new-client-runbook.md) | runbook | active — repeatable new-client-in-monorepo recipe (own DB; ADR 0034 + 0038); invokable as `/new-client-recipe` |
| [Prisma Workflow](../../runbooks/database/prisma-workflow.md) | runbook | active |
| [Neon Prisma Advisory-Lock Recovery](../../runbooks/database/neon-advisory-lock-recovery.md) | runbook | active |
| [Neon Credential Rotation](../../runbooks/database/neon-credential-rotation.md) | runbook | active — operator-only production Neon credential rotation procedure |
| [Manual Boundary Registry](manual-boundary-registry.md) | runbook | active |
| [SOP — Data and Wiring Flows](../../runbooks/sops/sop-data-and-wiring-flows.md) | runbook | active |
| [BBL Lineage Data + Wiring Flows](../../product/black-belt-legacy/lineage-data-wiring-flow.md) | runbook | active — SESSION_0517 canonical RankEntry, trust, claims, profile, certificate, and faceted `/directory` flow map |
| [BBL RankEntry Unified Domain](../../product/black-belt-legacy/rank-entry-unified-data-flow.md) | architecture-spec | proposed — unified cross-discipline rank-entry model and migration target |
| [SOP — End-to-End User Lifecycle](../../runbooks/sops/sop-e2e-user-lifecycle.md) | runbook | active |
| [SOP — Agent Workflows and Rituals](../../runbooks/sops/sop-agent-workflows-and-rituals.md) | runbook | active |
| [Dev Environment](../../runbooks/dev-environment/dev-environment.md) | runbook | active |
| [React to Next Component Porting Runbook](../../runbooks/porting/react-to-next-component-porting-runbook.md) | runbook | active |
| [Graphify Repo Memory Runbook](../../runbooks/dev-environment/graphify-repo-memory.md) | runbook | active |
| [Claude Mobile Runbook](../../runbooks/dev-environment/claude-mobile-runbook.md) | runbook | active — SESSION_0350 drive a Claude session from the phone (SSH+tmux/Tailscale or cloud); canonical transport + cloud-container prereqs |
| [Codex Mobile Runbook](../../runbooks/dev-environment/codex-mobile-runbook.md) | runbook | active — SESSION_0350 Codex peer (Codex Cloud / `codex` CLI) + operator setup checklist |
| [Codex Cloud BBL Waves 2-4 Handoff](../../runbooks/dev-environment/codex-cloud-bbl-waves-2-4.md) | runbook | active — Codex Cloud fallback prompt for BBL `/app` waves 2-4; local Codex automerge remains preferred for Graphify and `bbl.local` proof |
| [Stripe Setup Runbook](../../runbooks/integrations/stripe-setup-runbook.md) | runbook | active |
| [AWS S3 Operator Runbook](../../runbooks/integrations/aws-s3-operator-runbook.md) | runbook | active |
| [ADR 0014 Stripe Product Policy Research](../../runbooks/integrations/adr-0014-stripe-product-policy-research.md) | runbook | active |
| [Resend Setup Runbook](../../runbooks/integrations/resend-setup-runbook.md) | runbook | active |
| [SOP — Email Operations Runbook](../../runbooks/sops/sop-email-runbook.md) | runbook | active |
| [Vercel Domain Setup Runbook (Bluehost DNS)](../../runbooks/deploy/vercel-domain-setup-runbook.md) | runbook | active |
| [White-Label Site Runbook](../../runbooks/deploy/white-label-site-runbook.md) | runbook | active |
| [Black Belt Legacy Production Runbook](../../runbooks/deploy/bbl-production-runbook.md) | runbook | active |
| [Vercel Deploy Runbook](../../runbooks/deploy/vercel-deploy.md) | runbook | active |
| [Baseline Listings Runbook](../../runbooks/domain-features/baseline-listings-runbook.md) | runbook | active |
| [Lineage Listing Runbook](../../runbooks/domain-features/lineage-listing-runbook.md) | runbook | active |
| [Lineage Domain Hub](../../runbooks/domain-features/lineage-hub.md) | runbook | active — lineage doc index |
| [Directory / Organization / Profile Domain Hub](../../runbooks/domain-features/directory-org-profile-hub.md) | runbook | active — discovery / profile / register-vs-claim index |
| [MCP Usage Runbook](../../runbooks/dev-environment/mcp-usage-runbook.md) | runbook | active |
| [Deployment](../../runbooks/deploy/deployment.md) | runbook | active |
| [SOP — Test Writing Patterns](../../runbooks/sops/sop-test-writing.md) | runbook | active |
| [Test Fixture Ownership](../../runbooks/sops/test-fixture-ownership.md) | runbook | active — DB-backed test rollback, run identity, FK-safe cleanup, and count-neutral proof helper |
| [Course + Curriculum Runbook](../../runbooks/domain-features/course-curriculum-runbook.md) | runbook | active |
| [Baseline Design System Hub](../../runbooks/design/baseline-design-system.md) | runbook | active |
| [UI Library Candidates](../../runbooks/design/ui-library-candidates.md) | runbook | active |
| [Motion System](../../runbooks/design/motion-system.md) | runbook | active — martial-arts motion language, reduced-motion discipline, staged epic |
| [Feature Intake Ledger](feature-intake-ledger.md) | reference | superseded → [Post-Launch SOT](../../product/black-belt-legacy/POST_LAUNCH_SOT.md) (SESSION_0424) |
| [Wiring Ledger](wiring-ledger.md) | reference | active — not-done / gaps / FS-0001 handroll slips; WL-P1-6 closed the unaudited admin entitlement path in SESSION_0347 |
| [Parallel-lane shared state](parallel-lane-shared-state.md) | reference | active — **the inventory of what two worktrees share** (refs, HEAD, stash, config, ids, DB, ports) + which guard covers each. Audit this table for the next gap instead of waiting for the next incident. SESSION_0624. |
| [Test Fail Fix Ledger](test-fail-fix-ledger.md) | reference | active — clustered failing-test pointers + fix status; TFF-001..005 resolved (SESSION_0342, `--parallel=1`); close-router for test findings; read with `sop-test-writing.md` §2 |
| [Teardown Ledger](teardown-ledger.md) | reference | active — deferred prod/test data cleanup (`TD-NNN`); created SESSION_0457 (TD-001 FI-001 test user parked, TD-002 banked Baseline purge); wired into `ledger-backlog.ts` |
| [Goals Ledger](goals-ledger.md) | reference | active — top-of-backlog goals/objectives (`G-NNN`, code `GL`); created SESSION_0458; makes the operator `/goal` durable; wired into `ledger-backlog.ts` + the loop-board (goals lead the backlog) |
| [Core Values Ledger](core-values.md) | reference | active — `CV-NNN` value rows governing doc/wiki/runbook writing style; CV-001 EEE + CV-002 TD ratified SESSION_0572; applies to new/touched docs only |
| [Planning Ledger](planning-ledger.md) | reference | active — `PL-NNN` idea-intake queue ABOVE the goals-ledger (Brian/Michael/Tony idea dumps → `/pp` plan session → G-row); created SESSION_0587 (PL-001 = feature/feedback-widget intake surface); backlog/router wiring deferred to PL-001's plan |
| [Reddit Links Ledger](reddit-links-ledger.md) | reference | active — `RLL-NNN` Reddit-link capture inbox → planning-ledger; created SESSION_0589; code-wiring deferred to L2 (`session-0591`) |
| [YouTube Links Ledger](youtube-links-ledger.md) | reference | active — `YLL-NNN` YouTube-link capture inbox → planning-ledger; created SESSION_0589; code-wiring deferred to L2 (`session-0591`) |
| [ChatGPT Links Ledger](chatgpt-links-ledger.md) | reference | active — `GPTLL-NNN` ChatGPT-brainstorm capture inbox → planning-ledger; created SESSION_0589 (GPTLL-001/002); code-wiring deferred to L2 (`session-0591`) |
| [Daily Bug Scan Ledger](daily-bug-scan-ledger.md) | reference | active — `DBS-NNN` Codex daily-bug-scan findings; created SESSION_0589 (DBS-001 clients-ci fix→WL-P3-56, DBS-002/003 open); pipeline = `session-0596`, code-wiring = L2 |
| [Desi Design Ledger](desi-design-ledger.md) | protocol | active — `DES-NNN` design / UX / mobile / a11y findings (the finding-router's design home); created SESSION_0604; fed by the 3 design passes (`desi-design-review`/`mobile-optimization-pass`/`ui-ux-pass`) |
| [Skills Index (SSL)](skills-index.md) | reference | active — canonical skills inventory (Built half GENERATED from `.claude/skills/*/SKILL.md` via `bun scripts/skills-index.ts`) + the `SSL-NNN` discussed-not-built backlog; created SESSION_0617; wired into `ledger-backlog.ts` (code `SSL`) |

## Code files (annotated)

| Page | Type | Status |
| --- | --- | --- |
| [schema.prisma](files/schema-prisma.md) | file | active |
| [seed.ts](files/seed-ts.md) | file | active |
| [Dirstarter L1 Baseline](files/dirstarter-l1-baseline.md) | file | active |
| [create-organization-form.tsx](files/create-organization-form.md) | file | active |
| [organizations/new/page.tsx](files/organization-new-page.md) | file | active |
| [discipline-queries.ts](files/discipline-queries.md) | file | active |
| [organizations/page.tsx](files/organizations-list-page.md) | file | active |
| [organizations/[slug]/page.tsx](files/organization-detail-page.md) | file | active |
| [org-admin-access.ts](files/org-admin-access.md) | file | active |
| [join-organization-button.tsx](files/join-organization-button.md) | file | active |
| [directory/queries.ts](files/directory-queries.md) | file | active |
| [directory/schema.ts](files/directory-schema.md) | file | active |
| [directory/page.tsx](files/directory-page.md) | file | active |
| [directory/directory-query.tsx](files/directory-query-component.md) | file | active |
| [directory/directory-listing.tsx](files/directory-listing-component.md) | file | active |
| [directory/directory-list.tsx](files/directory-list-component.md) | file | active |
| [disciplines/[slug]/page.tsx](files/discipline-detail-page.md) | file | active |
| [schools/queries.ts](files/schools-queries.md) | file | active |
| [schools/[slug]/page.tsx](files/schools-detail-page.md) | file | active |
| [courses/page.tsx](files/courses-listing-page.md) | file | active |
| [(home)/bbl-join-landing.tsx](../../product/black-belt-legacy/page-specs/bbl-home-landing.md) | file | active |
| [join-legacy-landing.tsx (landing composition)](../../product/black-belt-legacy/page-specs/bbl-join-landing-composition.md) | file | active |
| [join-legacy-form.tsx (claim wizard)](../../product/black-belt-legacy/page-specs/bbl-join-form-wizard.md) | file | active |
| [\_components/bbl-footer.tsx](../../product/black-belt-legacy/page-specs/bbl-footer.md) | file | active |
| [nav/nav-sheet.tsx](../../product/black-belt-legacy/page-specs/bbl-nav-sheet.md) | file | active |
| [BBL type system (fonts + tokens)](../../product/black-belt-legacy/page-specs/bbl-type-system.md) | file | active |
| [Design System — 12-grid, golden ratio & hierarchy](files/design-system-grid-ratio-hierarchy.md) | file | active |
| [current-user-avatar.ts (avatar seam)](../../product/black-belt-legacy/page-specs/bbl-current-user-avatar.md) | file | active |
| [\_components/feature-request-dialog.tsx (DojoBots widget)](files/feature-request-dialog.md) | file | active — `lifecycle: MVP_LIVE` |
| [Public Passport DTO (canonical public identity projection)](files/public-passport-dto.md) | file | active — `lifecycle: WIP`; spec/flow (issue #134, PR #135) |
| [BBL Galaxy data flow](../../product/black-belt-legacy/page-specs/bbl-galaxy-data-flow.md) | file | active — `lifecycle: WIP`; spec/flow (PR #133) |
| [AdminTaskBoard (BBL operator task board — Todoist model)](../../product/black-belt-legacy/page-specs/bbl-admin-task-board.md) | file | active — `lifecycle: PLANNED`; spec/flow (SESSION_0428); absorbs monorepo AdminTaskForge |
| [m-card (content- & brand-agnostic roster/rank/task/loop card)](files/m-card-pattern.md) | file | active — `lifecycle: WIP`; PWCC-002; one card contract on Dirstarter base, kind→DTO. Slice 1 built: `kind=roster` on `/directory/profiles` (PR #150). |
| [three-level magnetic drawer (content-agnostic canvas)](files/three-level-magnetic-drawer.md) | file | active — `lifecycle: PLANNED`; PWCC-003; 3 detents + infinite m-card list; Todoist→cinematic chrome |
| [AdminKanban (reusable column board + intake + automations)](files/admin-kanban-board.md) | file | active — `lifecycle: PLANNED`; PWCC-007; config-driven CRM pipeline + lead intake + follow-up automations; Desi pass + reusable Cody loop |
| [Loop Board (/app/loop-board — shared ledger-backed AdminKanban)](files/loop-board.md) | file | active — `lifecycle: MVP_LIVE`; Loop-of-Loops P3 **Phase B (SESSION_0461): editable + DB-backed** — `KanbanCard` (single SoT) + Prisma `BoardStore`; live-ledger projection demoted to an insert-only importer; `AdminTaskBoard` retired/consolidated |
| [Component Design System (BBL doc & email branding tokens)](component-design-system.md) | concept | active — Desi brand pass (SESSION_0428); `component-design-system.html` is the living visual reference |
| [SPEC file template](files/_template/SPEC_TEMPLATE.md) | template | active — canonical `_spec` shape for the files catalog |
| [wiki-lint.ts](../../protocols/wiki-lint.md) | protocol | active |

## L1 Component Patterns & UI Components

> **MANDATORY PRE-FLIGHT: [`dirstarter-component-inventory.md`](dirstarter-component-inventory.md)** (SESSION_0051).
> Exhaustive per-component API inventory of every L1 component, hook, HOC, admin pattern, data-table system, and web component. Includes L1 violation audit, refactoring priority queue, and pre-flight checklist.
>
> Also see [`dirstarter-baseline-index.md`](../../architecture/dirstarter-baseline-index.md) (SESSION_0039) for architecture-level integration patterns.
>
> - §13: dirstarter.com/docs integration patterns (auth, email, storage, payments, rate limiting, analytics, content, middleware)
> - §14: D-014 decision — Tool → Directory Listing repurpose

## Custom components (Ronin Dojo additions)

> **REFERENCE: [`custom-component-inventory.md`](custom-component-inventory.md)** (SESSION_0195). Companion to `dirstarter-component-inventory.md`; lists Ronin-specific surfaces (lineage viewer, tournaments, courses, schools, admin shell, etc.) with public props and notable behavior (timezone pinning, cycle guards, visibility rules). Consult before designing or building new Ronin UI.

See [`dirstarter-baseline-index.md` §2e](../../architecture/dirstarter-baseline-index.md) for the full list (11+ components). Key additions:

| Component | Path | Added |
| --- | --- | --- |
| LeadCaptureForm | `components/web/lead-capture-form.tsx` | S2 |
| CreateOrganizationForm | `components/web/organizations/create-organization-form.tsx` | S1–S2 |
| InviteJoinForm | `components/web/organizations/invite-join-form.tsx` | S2 |
| JoinOrganizationButton | `components/web/organizations/join-organization-button.tsx` | S2 |
| MembershipActions | `components/web/organizations/membership-actions.tsx` | S2 |
| CreateProgramForm | `components/web/programs/create-program-form.tsx` | S2 |
| CreateScheduleForm | `components/web/schedules/create-schedule-form.tsx` | S2 |
| MaterializeScheduleButton | `components/web/schedules/materialize-schedule-button.tsx` | S2 |
| ScheduleInstructorList | `components/web/schedules/schedule-instructor-list.tsx` | S2 |
| DirectoryFilters/List/Listing/Query | `components/web/directory/directory-*.tsx` | S2 |
| LineageQuery/List/Listing/Search/Card | `components/web/lineage/lineage-*.tsx` | SESSION_0248 |
| LineageTrustBadge/LineageClaimBadge | `components/web/lineage/lineage-trust-badge.tsx` | SESSION_0349 |
| FacetResultCard + DirectoryFacetResult + getDirectoryFacets | `components/web/directory/facet-result-card.tsx`, `lib/directory/facet-result.ts`, `server/web/directory/facets.ts` | SESSION_0350 |
| DirectoryFilters + profile projection | `components/web/directory/directory-filters.tsx`, `server/web/directory/profile-projection.ts` | SESSION_0352 |
| ComboboxSelector (promoted) + directory location/org filters + `buildDirectoryProfileWhere` | `components/common/combobox-selector.tsx`, `components/web/directory/directory-filters.tsx`, `server/web/directory/{filter-options,profile-where}.ts` | SESSION_0353 |
| `DataSelect` (id/slug-aware Select) + generic profile-claim system (`ProfileHero`, `ProfileClaimTeaser`, `/admin/claims`) | `components/common/data-select.tsx`, `components/web/profile/profile-hero.tsx`, `components/web/claims/*`, `server/{web,admin}/claims/*`, `app/admin/claims/*` | SESSION_0354 |
| `DataSelect` rich rows (`content?: ReactNode`) + `BeltSwatch` + `OrgClaimCta` + `ListingRegisterCta` | `components/common/{data-select,belt-swatch}.tsx`, `components/web/claims/org-claim-cta.tsx`, `components/web/directory/listing-register-cta.tsx` | SESSION_0355 |
| QrShareButton/QrSharePanel | `components/common/qr-share-button.tsx` | SESSION_0347 |
| ContentPostMediaCarousel | `components/web/content-posts/content-post-media-carousel.tsx` | SESSION_0224 |
| PassportEditor | `app/(web)/me/passport-editor.tsx` | S2 |
| BBL email catalog panel + capture list | `app/admin/email/_components/bbl-email-*.tsx`, `server/admin/email/*` | SESSION_0370 |

## Obsidian Vault

| Page | Type | Status |
| --- | --- | --- |
| [Ronin Obsidian Starter Vault](../../../ronin_obsidian_starter_vault/README.md) | reference | active |
| [Learning Path](../../../ronin_obsidian_starter_vault/LEARNING_PATH.md) | reference | active |
| [Vault Map](../../../ronin_obsidian_starter_vault/VAULT_MAP.md) | reference | active |

## Templates

| Template | For type |
| --- | --- |
| [\_template-concept](../templates/_template-concept.md) | concept |
| [\_template-file](../templates/_template-file.md) | file |
| [\_template-decision](../templates/_template-decision.md) | decision |
| [\_template-runbook](../templates/_template-runbook.md) | runbook |
