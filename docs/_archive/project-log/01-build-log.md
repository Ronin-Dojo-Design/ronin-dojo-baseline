---
title: "Project Log Archive — Build log"
slug: project-log-archive-build-log
type: archive
status: archived-frozen
created: 2026-05-23
updated: 2026-05-23
last_agent: claude-session-0228
pairs_with:
  - docs/protocols/project-log.md
---

Historical archive shard frozen at SESSION_0215 close. Append-only history preserved for reference. The canonical record going forward is the per-session `docs/sprints/SESSION_NNNN.md` file. Do not append to this shard.

## Build log

### SESSION_0224 — ContentAtom canonical relations + media carousel

- **Session:** SESSION_0224
- **Sprint:** S6 / Content Engine
- **Status:** ✅ verified
- **Files:** `apps/web/prisma/schema.prisma`, `apps/web/prisma/migrations/20260522224500_add_content_atom_relations/migration.sql`, `apps/web/prisma/seed-content-atom-proof.ts`, `apps/web/server/web/content-posts/payloads.ts`, `apps/web/app/(web)/posts/[slug]/page.tsx`, `apps/web/components/web/content-posts/content-post-media-carousel.tsx`, `apps/web/components/web/ui/author.tsx`, `apps/web/lib/structured-data.ts`
- **Seed data:** yes — `why-the-bell-matters` atom now seeds 3 tags, 2 published tools, and 2 media attachments.
- **Smoke test:** Prisma format/validate/generate passed; migration applied locally; proof seed passed; SQL proof found 3 tags / 2 tools / 2 media; `/posts/why-the-bell-matters` and `/blog/boilerplate` returned 200; HTML proof found tags/tools/media/Article JSON-LD; Biome on touched files passed; `pnpm --filter @ronin-dojo/web typecheck` passed; `bun --cwd apps/web test -- --concurrency=1` passed 257/257; `pnpm --filter @ronin-dojo/web build` passed with existing Next workspace-root/NFT warnings.

#### Review

##### SESSION_0224_REVIEW_01 — Hostile close review for ContentAtom relations and media carousel

- **Reviewed tasks:** SESSION_0224_TASK_01, SESSION_0224_TASK_02, SESSION_0224_TASK_03.
- **Dirstarter docs check:** live Dirstarter Prisma/database, content, blog, SEO, media, storage, and theming docs checked on 2026-05-22. Implementation extends the DB-backed content/blog/media patterns and leaves `/blog` Post rendering intact.
- **Sources:** Graphify queries for ContentAtom/ContentVariant tags/tools/media, existing `/blog/[slug]` tools sidebar, existing carousel/media components, structured data caller shape, Dirstarter docs inventory, and project-log review entries; exact file reads for schema, seed, payloads, page, structured data, and component inventory.
- **Verdict:** Pass. No P0/P1 findings. Canonical atom metadata is additive and seeded idempotently; public reads remain brand-scoped; verification gates passed.
- **Follow-up:** Product should choose either ContentAtom admin editing for tags/tools/media or public `/posts` discovery/filtering as the next Content Engine slice.

### S1_SCHEMA — Phase 1 schema rev (31 models, all enums)

- **Session:** SESSION_0003–0005
- **Sprint:** S1
- **Status:** ✅ verified
- **Files:** prisma/schema.prisma, prisma/seed.ts, migrations/
- **Seed data:** yes (12 disciplines, 13 rank systems, 194 ranks, roles, event types)
- **Smoke test:** migration applied, seed ran, Prisma Studio verified

### S2_AUTH — Better-Auth + Passport bootstrap

- **Session:** SESSION_0007
- **Sprint:** S2
- **Status:** ✅ verified
- **Files:** auth config, passport routes, middleware
- **Seed data:** yes (2 template users)
- **Smoke test:** sign-up creates User + Passport + DirectoryProfile stubs

### S3_ORG — Organization create + join flow

- **Session:** SESSION_0008–0013
- **Sprint:** S3
- **Status:** ✅ verified
- **Files:** org actions, org pages, membership logic
- **Seed data:** partial (no test orgs in seed at the time)
- **Smoke test:** create org + join flow tested in browser

### S4_DIRECTORY — Directory search with privacy

- **Session:** SESSION_0014
- **Sprint:** S4
- **Status:** ⚠️ needs-verification
- **Files:** server/web/directory/queries.ts, components/web/directory/*, app/(web)/directory/page.tsx
- **Seed data:** no → **fixed in SESSION_0015** (5 test users with full identity graph)
- **Smoke test:** pending — directory showed empty because no seed data existed
- **Fix (SESSION_0015):** Added 5 test users to seed.ts with Passport + DirectoryProfile + Organization + Membership + RankAward. Reseeded. Awaiting browser verification.

### S15_SEED_FIX — Seed script: full identity graph

- **Session:** SESSION_0015
- **Sprint:** S4 (fix)
- **Status:** ✅ verified
- **Files:** prisma/seed.ts
- **Seed data:** yes — 5 users: sensei (PUBLIC/ACTIVE/Blue), alpha (PUBLIC/ACTIVE/White), beta (MEMBERS_ONLY/ACTIVE/L3), ghost (HIDDEN/ACTIVE), pending (PUBLIC/PENDING)
- **Smoke test:** `prisma db seed` ran successfully, all 5 users created with full graph

### S15_DOC_ADOPTION — SOP adoption + feature prerequisites + Cody pre-flight

- **Session:** SESSION_0015
- **Sprint:** S4 (housekeeping)
- **Status:** ✅ verified
- **Files:** docs/runbooks/sop-data-and-wiring-flows.md, docs/runbooks/sop-e2e-user-lifecycle.md, docs/architecture/feature-data-prerequisites.md, docs/agents/cody.md
- **Seed data:** n/a (docs only)
- **Smoke test:** n/a

### S15_CLOSE_FIX — Full close steps remediation (FS-0004)

- **Session:** SESSION_0015
- **Sprint:** S4 (process fix)
- **Status:** ✅ verified
- **Files:** docs/protocols/failed-steps-log.md, docs/agents/cody.md, docs/knowledge/wiki/index.md, docs/knowledge/wiki/files/seed-ts.md, docs/architecture/feature-data-prerequisites.md, docs/sprints/SESSION_0015.md
- **Seed data:** n/a
- **Smoke test:** JETTY sweep completed, wiki index updated, close checklist artifact added to SESSION file

### S28_PROGRAM_CRUD — School Ops Program CRUD

- **Session:** SESSION_0028
- **Sprint:** S2 / School operations lane
- **Status:** ✅ verified
- **Files:** apps/web/server/web/program/*, apps/web/app/(web)/programs/*, apps/web/components/web/programs/create-program-form.tsx, apps/web/lib/authz.ts, apps/web/prisma/seed.ts, apps/web/scripts/smoke-program.ts
- **Seed data:** yes — 2 Baseline Programs plus Sensei OWNER role assignment
- **Smoke test:** `bun scripts/smoke-program.ts` passed; HTTP smoke returned `/programs` 200, `/programs/[id]` 200, protected create/edit routes 307 to login

### DIRECTORY_MONETIZATION_ROADMAP — Directory monetization roadmap + Dirstarter reuse pass

- **Session:** Roadmap artifact, not numbered SESSION_0029 per owner directive
- **Sprint:** Cross-lane roadmap / Content + monetization
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `docs/architecture/source/directory-monetization-roadmap.md`, `docs/knowledge/wiki/content-engine/directory-monetization-roadmap.md`, `apps/web/lib/ai.ts`, AI routes, ad picker/bottom placement, Stripe product setup, seed data, wiki governance docs
- **Seed data:** yes — martial-arts `Tool` entries for Baseline Martial Arts, Black Belt Legacy, WEKAF USA, Ronin Dojo Design, USA Stick Fighting, Black Belt Wiki, and Smoothcomp
- **Smoke test:** `bunx biome check --write` on touched code passed; `bun run db:generate` passed; `bunx prisma validate --schema prisma/schema.prisma` passed; `bun run wiki:lint` passed; `git diff --check` passed; `curl -H "Host: baseline.local" http://localhost:3000/submit` returned 200; `curl -H "Host: baseline.local" http://localhost:3000/advertise` returned 200. Full `bunx tsc --noEmit --pretty false` still fails on pre-existing baseline issues, with no errors reported in the roadmap-touched code paths after Prisma generate.

### S32_ATTENDANCE_WRITE — Attendance/check-in write surface

- **Session:** SESSION_0032
- **Sprint:** S2 / School operations lane
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `apps/web/server/web/attendance/*`, `apps/web/server/web/school-ops/audit.ts`, `apps/web/server/web/schedule/audit.ts`, `apps/web/lib/rate-limiter.ts`, `apps/web/scripts/smoke-attendance.ts`
- **Seed data:** no durable seed changes; tests and smoke use tagged dev-DB fixtures with cleanup.
- **Smoke test:** `bun test server/web/attendance/actions.test.ts` 7/7; `bun test server/web/schedule/ server/web/attendance/` 22/22; `bun scripts/smoke-attendance.ts` passed allow/deny/idempotency matrix; `bunx prisma validate --schema prisma/schema.prisma` passed. Full `bunx tsc --noEmit --pretty false` still fails on pre-existing baseline issues outside the attendance/school-ops touched paths.

### S32_5_TYPECHECK_DEBT — Full app typecheck baseline

- **Session:** SESSION_0032.5
- **Sprint:** S2 / QA hardening
- **Status:** ✅ verified, pause-gated before SESSION_0033
- **Files:** `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/lib/auth.ts`, `apps/web/lib/media.ts`, `apps/web/services/s3.ts`, `apps/web/lib/structured-data.ts`, `apps/web/server/web/passport/*`, `apps/web/server/web/tools/queries.ts`
- **Seed data:** n/a.
- **Smoke test:** `bun run typecheck` passed; `bunx tsc --noEmit --pretty false` passed after `next typegen`; `bun test server/web/schedule/ server/web/attendance/` 22/22; `bun scripts/smoke-attendance.ts` passed; `bunx prisma validate --schema prisma/schema.prisma` passed.

### S33_ENROLLMENT_FAMILY_WAIVER_LEAD — Enrollment, family, waiver, trial write surface

- **Session:** SESSION_0033
- **Sprint:** S2 / School operations lane
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `apps/web/server/web/{enrollment,family,waiver,lead}/*`, `apps/web/scripts/smoke-school-ops-extended.ts`, `apps/web/lib/rate-limiter.ts`
- **Seed data:** no durable seed changes; action tests and smoke use tagged dev-DB fixtures with cleanup.
- **Smoke test:** `bun test server/web/enrollment server/web/family server/web/waiver server/web/lead` 7/7; `bun test server/web/schedule server/web/attendance` 22/22; `bun scripts/smoke-school-ops-extended.ts` passed enrollment/family/waiver/lead allow-deny-convert matrix; `bunx prisma validate --schema prisma/schema.prisma` passed. Full `bunx tsc --noEmit --pretty false` still fails on pre-existing baseline issues outside the SESSION_0033 touched paths.

### S58_TOURNAMENT_SNAPSHOTS_AUTH — Tournament registration snapshots + admin auth hardening

- **Session:** SESSION_0058
- **Sprint:** P0–P2 remediation
- **Status:** ✅ verified
- **Files:** `apps/web/server/web/tournaments/register.ts`, `apps/web/app/api/stripe/webhooks/route.ts`, `apps/web/components/admin/auth-hoc.tsx`
- **Seed data:** no
- **Smoke test:** `bunx tsc --noEmit` passes; code review confirmed snapshot fields populated in both free and paid registration paths; PricingPlanActions type mismatch investigated and closed as INVALID (TypeScript structural typing).

### S59_CACHE_ENROLLMENT_DRIFT — Cache pattern upgrade + enrollment Passport check + drift close

- **Session:** SESSION_0059
- **Sprint:** P0–P2 remediation
- **Status:** ✅ verified
- **Files:** `apps/web/server/web/organization/queries.ts`, `apps/web/server/web/directory/queries.ts`, `apps/web/server/web/enrollment/actions.ts`, `apps/web/server/web/enrollment/errors.ts`
- **Seed data:** no
- **Smoke test:** `bunx tsc --noEmit` passes; public queries upgraded to `"use cache"` + `cacheTag` + `cacheLife`; auth-scoped queries kept with React `cache()`; enrollment Passport assertion added to both `enrollInProgram` and `joinProgramWaitlist`; D-005 and D-011 closed.

### S60_HOSTILE_CLOSE_REVIEW — Cross-session hostile-close review (audit only, no code)

- **Session:** SESSION_0060
- **Sprint:** Hostile-close review
- **Status:** ✅ review complete — 6 P1 + 1 P2 + 3 P3 findings documented
- **Files:** no code changes (audit session)
- **Seed data:** no
- **Smoke test:** wiki:lint passed clean (169 files, 0 violations); D-006 and D-010 closed; `program-plan.md` marked `partially-superseded`.

### S96_BILLING_LAUNCH_GAPS — Customer billing, webhook idempotency, and lifecycle proof

- **Session:** SESSION_0096
- **Sprint:** S3 / Commerce implementation
- **Status:** ✅ verified with known full-typecheck baseline debt
- **Files:** `apps/web/prisma/schema.prisma`, `apps/web/prisma/migrations/20260507140933_add_stripe_customer_ledger_event_tracking/migration.sql`, `apps/web/app/api/stripe/webhooks/route.ts`, `apps/web/app/api/stripe/webhooks/route.test.ts`, `apps/web/server/web/billing/*`, `apps/web/server/web/products/actions.ts`, `apps/web/server/web/tournaments/register.ts`, `apps/web/server/web/dashboard/queries.ts`, `apps/web/app/(web)/dashboard/*`
- **Seed data:** no durable seed changes; tests create and clean real Prisma fixtures.
- **Smoke test:** `bun test app/api/stripe/webhooks/route.test.ts server/web/billing/actions.test.ts server/web/tournaments/register.concurrency.test.ts` passed 18/18; scoped Biome check passed. Full `bun run typecheck` still fails only on pre-existing unrelated errors from SESSION_0095.

### S99_STORAGE_MEDIA_BRIDGE — S3 public media bridge and admin cost monitor

- **Session:** SESSION_0099
- **Sprint:** S3 / Launch support
- **Status:** ✅ verified with full typecheck inconclusive
- **Files:** `apps/web/lib/public-media-url.ts`, `apps/web/components/web/tuffbuffs/*`, `apps/web/server/admin/storage/monitoring/queries.ts`, `apps/web/app/admin/storage/monitoring/page.tsx`, `apps/web/components/admin/sidebar.tsx`, `apps/web/env.ts`, `docs/runbooks/aws-s3-operator-runbook.md`
- **Seed data:** no
- **Smoke test:** `bun test lib/public-media-url.test.ts server/admin/storage/monitoring/queries.test.ts` passed 6/6; scoped Biome passed; `bun run wiki:lint` passed with 0 errors and 3 existing orphan warnings; `git diff --check` passed. `bun run typecheck` generated route types but was manually terminated after several minutes without TypeScript output.

### S6_L6_PHASE_1 — Dirstarter uplift L6 Base UI migration Phase 1 (foundation + leaf primitives)

- **Session:** SESSION_0209
- **Sprint:** S6 / Dirstarter uplift epic 2026-05-19, L6 Phase 1 (multi-session lane under D-016)
- **Status:** ✅ verified
- **Files:** `apps/web/package.json`, root `pnpm-lock.yaml`, `apps/web/lib/slot.ts`, `apps/web/components/common/toaster.tsx`, `apps/web/components/common/empty-list.tsx` (new), `apps/web/components/web/empty-list.tsx` (deleted), 10 empty-list import sites (disciplines, tools, posts, tags, courses, members, tournaments, schools, categories, techniques), `apps/web/components/common/separator.tsx`, `apps/web/components/common/avatar.tsx`, `apps/web/.dirstarter-upstream`, `docs/architecture/uplift/lane-ledger.md`, `docs/architecture/uplift/epic-2026-05-19.md`, `docs/knowledge/wiki/drift-register.md` (new entry `D-016`), `docs/sprints/petey-plan-0083.md` (new), `docs/sprints/SESSION_0209.md`, `docs/knowledge/wiki/index.md`, `docs/protocols/project-log.md`.
- **Seed data:** no.
- **Smoke test:** `pnpm --filter dirstarter typecheck` clean; `bun run lint` (biome --write) clean across 979 files; `bun test --isolate --path-ignore-patterns='e2e/**' --concurrency=1` passed 244/244 (parallel `--isolate` segfaults on bun 1.3.13 — upstream Bun bug, not lane-related); `pnpm --filter dirstarter build` clean (next-sitemap completed); `bun run wiki:lint` passed with 0 errors / 497 warnings; Vercel readiness reported in bow-out response.

