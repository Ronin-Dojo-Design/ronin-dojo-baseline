---
title: "SESSION 0129 — Hostile Close Batch Review (0126–0128) + S3 Infra Plan + Visual QA"
slug: session-0129
type: session
status: closed-quick
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0129
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0128.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0129 — Hostile Close Batch Review (0126–0128) + S3 Infra Plan + Visual QA

## Date

2026-05-11

## Operator

Brian Scott + Copilot (Petey)

## Status

in-progress

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — no new UI code planned this session.
- Carried blocker: 🔴 Resend domain DNS pending verification — 15th session carried.
- Last hostile close review: SESSION_0125_REVIEW_01 (covered sessions 0123–0125). Sessions 0126, 0127, 0128 are **3 sessions overdue** for hostile review.

## Graphify Check

- Graph updated to HEAD (`529881a`) at session open. 13 new nodes, 188 edges, 606 communities.
- Queried `"passport editor avatarUrl socialLinks FormMedia S3 upload entitlement grant media coverPhoto videoIntro"` — 494 nodes found.
- Queried `"entitlement queries hasEntitlement canUploadMedia UserEntitlement grantUserEntitlement"` — 414 nodes found.
- Key files from graph: `server/web/entitlements/queries.ts`, `server/admin/entitlements/actions.ts`, `app/(web)/me/passport-editor.tsx`, `app/(web)/me/_components/social-links-editor.tsx`, `app/admin/users/_components/upload-grant-toggle.tsx`, `server/web/passport/schemas.ts`, `prisma/seed.ts`

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/form-media.tsx` (used, not modified), `lib/media.ts` (used, not modified), admin CRUD patterns |
| Extension or replacement | Extension — all sessions extended Dirstarter patterns, no replacements |
| Why justified | Review session — no code changes, only audit + planning |
| Risk if bypassed | 3 sessions of Passport/media/entitlement work without architectural review |

## Goal

1. Run hostile close review batch for sessions 0126–0128 (Passport profile editor arc: seed QA data, FS-0001 fixes, FormMedia upload, socialLinks, entitlement system).
2. Plan S3 infra setup + visual QA + tier-based auto-grant architecture for SESSION_0130.

---

## Petey Plan

### Goal

Hostile close review of the Passport profile editor arc (sessions 0126–0128), then plan next session's implementation work.

### Tasks

#### TASK_01 — Hostile close review batch: Sessions 0126–0128

- **Agent:** Giddy + Doug
- **What:** Batch hostile-close review of the Passport profile editor arc per `docs/protocols/hostile-close-review.md`. Three sessions covering: seed QA data + Muay Thai Mike (0126), FS-0001 remediation + missing Passport/DirectoryProfile fields (0127), FormMedia upload wiring + socialLinks editor + entitlement system + admin grant UI (0128).
- **Steps:**
  1. Read all files touched across sessions 0126–0128
  2. Answer 8 review questions + 3 Kaizen questions
  3. Record findings with severity + status
  4. Score and apply gate
- **Done means:** Review entry in this SESSION file + project-log
- **Depends on:** nothing

#### TASK_02 — Plan SESSION_0130: S3 infra + visual QA + tier auto-grant

- **Agent:** Petey
- **What:** Produce a plan for S3 bucket provisioning, visual QA of the full `/me` editor, and tier-based entitlement auto-grant architecture.
- **Done means:** Plan block with tasks, agents, dependencies
- **Depends on:** TASK_01 (review may surface remediation items that change the plan)

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Giddy + Doug | Hostile review requires architecture + QA dual lens |
| TASK_02 | Petey | Planning — no code |

---

## SESSION_0129_REVIEW_01 — Hostile Close Batch Review: Passport Profile Editor Arc (Sessions 0126–0128)

**Reviewed tasks:** SESSION_0126 (TASK_01–04), SESSION_0127 (TASK_01–04), SESSION_0128 (TASK_01–06)
**Dirstarter docs check:** cached docs sufficient — FormMedia, Select, Checkbox, H2, Button, Input, Stack all used from inventory. `lib/media.ts` and `services/s3.ts` used but not modified.
**Sources:** `docs/knowledge/wiki/dirstarter-component-inventory.md`, local schema, `apps/web/server/web/entitlements/queries.ts`, `apps/web/server/admin/entitlements/actions.ts`, `apps/web/app/(web)/me/passport-editor.tsx`, `apps/web/app/(web)/me/_components/social-links-editor.tsx`, `apps/web/app/admin/users/_components/upload-grant-toggle.tsx`, `apps/web/server/web/passport/schemas.ts`

**Verdict:** Solid extension work across 3 sessions. SESSION_0126 closed the QA data gap from hostile review finding. SESSION_0127 remediated FS-0001 violations and exposed missing L2 fields. SESSION_0128 was the heaviest — wiring FormMedia for 3 upload fields, building SocialLinksEditor, creating the entitlement query layer, and admin grant/revoke UI. All UI uses Dirstarter inventory components correctly. Entitlement system is well-structured with clean separation between manual grant and role-based auto-grant. Three findings below.

### Review Questions

1. **Plan sanity:** Good across all 3 sessions. Petey resolved open decisions before Cody started (data source for seeds, socialLinks schema shape, entitlement check logic). SESSION_0128's plan was the most complex (6 tasks) but well-sequenced with clear dependency graph.

2. **Dirstarter compliance:** All three sessions extended Dirstarter patterns without replacing them. FormMedia used correctly with `form`/`field`/`path` props. Select, Checkbox, H2, Button, Input, Stack — all from inventory. `adminActionClient` chain used for grant/revoke actions. ✅

3. **Security:**
   - `canUploadMedia` gates S3 upload on: (a) active UserEntitlement, (b) role-based membership (INSTRUCTOR/COACH/OWNER/ORG_ADMIN), (c) org ownership. All three checks are server-side. ✅
   - `grantUserEntitlement` and `revokeUserEntitlement` use `adminActionClient` — admin-only. ✅
   - **Finding 01:** `canUploadMedia` makes 3 sequential DB queries. No transaction — acceptable for read-only checks but worth noting.
   - **Finding 02:** `hasEntitlement` uses `"use server"` directive but is a query function, not a mutation. Should use `"use cache"` for performance, or at least be called from a cached wrapper.

4. **Data integrity:**
   - Entitlement grant uses upsert pattern (reactivate REVOKED, or create new). ✅
   - Revoke uses `updateMany` with status filter — safe, won't revoke already-revoked. ✅
   - `brand_key` unique constraint enforced at DB level for entitlement lookup. ✅
   - socialLinks stored as JSON array on Passport — no referential integrity, but acceptable for unstructured social link data.

5. **Lifecycle proof:**
   - Passport editor now covers: display name, legal name, DOB, gender, phone, emergency contact, avatar (FormMedia), bio, social links (key-value editor). Aligns with L2 spec §2. ✅
   - DirectoryProfile editor covers: slug, visibility, location, privacy toggles, cover photo (FormMedia), video intro (dual-mode). ✅
   - Upload entitlement lifecycle: seed → admin grant/revoke → auto-check by role. ✅

6. **Verification honesty:**
   - Type check passes (0 errors) across all 3 sessions. ✅
   - Visual QA done in SESSION_0126 (carousels populated). ✅
   - **Finding 03:** No integration test for `canUploadMedia`. The function has 3 code paths (entitlement, role, org ownership) — none tested. This is the same class of gap as SESSION_0125_FINDING_01.
   - No runtime test of FormMedia upload (S3 not configured locally). Acceptable — code paths are Dirstarter-standard.

7. **Workflow honesty:** SESSION files maintained, task IDs tracked, Petey→Cody handoffs clean across all 3 sessions. FS-0001 acknowledged and remediated in SESSION_0127. ✅

8. **Merge readiness:** Ready to merge. All features degrade gracefully (URL fallback when S3 not configured, empty socialLinks renders no entries, non-entitled users see URL-only video input).

### Kaizen Reflection

1. **Is this safe and secure?**
   - Upload gating is server-side and multi-layered (entitlement + role + ownership). Safe.
   - Missing: integration test proving `canUploadMedia` returns false for users without any qualifying condition. Also no test proving that revoking an entitlement actually blocks subsequent `canUploadMedia` checks.
   - Tests needed: (a) seed user with no entitlement/role/ownership → assert `canUploadMedia` returns false, (b) grant entitlement → assert true, (c) revoke → assert false again.

2. **Failed steps prevented?**
   - SESSION_0127 caught and remediated FS-0001 violations that had accumulated in SESSION_0126. Good self-correction. The violations existed because the original `passport-editor.tsx` was written before the component inventory gate was enforced.
   - Process improvement: none needed — the FS-0001 gate is working as designed (catch → remediate).

3. **Confidence at scale:**
   - 100 users: **9/10** — entitlement checks are fast, UI is clean, FormMedia is Dirstarter-standard.
   - 1,000 users: **8/10** — `canUploadMedia` makes 3 sequential queries. Should be a single query with OR conditions or cached.
   - 10,000 users: **7/10** — socialLinks as JSON array on Passport has no indexing. Entitlement check queries need caching or consolidation.
   - **Aggregate: 7**

### Score Gate

Aggregate confidence: **7** → Stage remediation items:

- Add integration test for `canUploadMedia` (3 code paths)
- Consolidate `canUploadMedia` into a single Prisma query with OR conditions
- Consider caching `hasEntitlement` result (short TTL)
- socialLinks JSON: acceptable for now, monitor at scale

### Findings

### SESSION_0129_FINDING_01 — canUploadMedia makes 3 sequential DB queries

- **Severity:** low
- **Task:** SESSION_0128_TASK_04
- **Evidence:** `server/web/entitlements/queries.ts:canUploadMedia` — 3 sequential `findFirst` calls
- **Impact:** At 10K+ users with frequent page loads, 3 queries per `/me` page load adds latency
- **Required follow-up:** Consolidate into a single query with OR conditions, or cache with short TTL
- **Status:** open

### SESSION_0129_FINDING_02 — hasEntitlement uses "use server" but is read-only

- **Severity:** low
- **Task:** SESSION_0128_TASK_04
- **Evidence:** `server/web/entitlements/queries.ts` — `"use server"` directive on query-only functions
- **Impact:** No caching; every call hits DB. Dirstarter pattern uses `"use cache"` for read queries.
- **Required follow-up:** Move to `"use cache"` with `cacheTag("user-entitlements")` and appropriate `cacheLife`, or call from a cached server page
- **Status:** open

### SESSION_0129_FINDING_03 — No integration test for canUploadMedia

- **Severity:** medium
- **Task:** SESSION_0128_TASK_04
- **Evidence:** No test file exists for `server/web/entitlements/queries.ts`
- **Impact:** 3 authorization code paths (entitlement, role, org ownership) are untested. Regression could leak upload capability or block entitled users.
- **Required follow-up:** Add `queries.integration.test.ts` with tests for all 3 paths + negative case + revocation case
- **Status:** open

---

## TASK_02 — Next Session Plan (SESSION_0130)

### Goal

Remediate hostile review findings + visual QA of `/me` editor + plan tier-based auto-grant architecture.

### Tasks

#### TASK_01 — Remediate FINDING_01: Consolidate canUploadMedia queries

- **Agent:** Cody
- **What:** Rewrite `canUploadMedia` to use a single Prisma query with OR conditions instead of 3 sequential queries.
- **Done means:** Single DB round-trip for upload authorization check
- **Depends on:** nothing

#### TASK_02 — Remediate FINDING_02: Cache entitlement queries

- **Agent:** Cody
- **What:** Move `hasEntitlement` and `canUploadMedia` to use `"use cache"` with appropriate cache tags and invalidation on grant/revoke.
- **Done means:** Queries cached; grant/revoke actions invalidate the cache tag
- **Depends on:** TASK_01

#### TASK_03 — Remediate FINDING_03: Integration test for canUploadMedia

- **Agent:** Cody
- **What:** Create `server/web/entitlements/queries.integration.test.ts` with tests for all 3 authorization paths + negative case + revocation case.
- **Done means:** 5+ test cases passing
- **Depends on:** TASK_01

#### TASK_04 — Visual QA: /me editor full walkthrough

- **Agent:** Doug
- **What:** Start dev server, browse `/me`, confirm all fields render: avatar FormMedia, DOB, gender, phone, emergency contact, bio, social links editor, DirectoryProfile slug/visibility/location/privacy toggles/cover photo/video intro.
- **Done means:** Screenshot or session log confirmation of all sections rendering
- **Depends on:** nothing (parallel)

#### TASK_05 — Plan tier-based auto-grant architecture

- **Agent:** Petey
- **What:** Design the architecture for auto-granting S3_UPLOAD when a user subscribes to premium/elite/legend tier. Depends on Stripe webhook integration. Produce a design doc or ADR.
- **Done means:** Architecture decision documented; implementation deferred until Stripe subscription wiring
- **Depends on:** nothing (parallel)

#### TASK_06 — Type check + final verify

- **Agent:** Cody
- **What:** `bun run typecheck` — 0 errors
- **Depends on:** TASK_01–03

### Parallelism

```
TASK_01 → TASK_02 → TASK_06
     └──→ TASK_03 ──┘
TASK_04 (parallel)
TASK_05 (parallel)
```

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear execution — query consolidation |
| TASK_02 | Cody | Clear execution — caching pattern |
| TASK_03 | Cody | Clear execution — integration test |
| TASK_04 | Doug | Visual QA |
| TASK_05 | Petey | Architecture decision — needs decomposition |
| TASK_06 | Cody | Verification gate |

### Open Decisions

- ✅ **Tier-based auto-grant trigger:** Webhook. **Signed off.** Dirstarter pattern confirmed: `checkout.session.completed` + `customer.subscription.deleted` events at `app/api/stripe/webhooks/route.ts`. Extend with entitlement grant/revoke on subscription lifecycle events. Live docs checked: `https://dirstarter.com/docs/integrations/payments` (2026-05-11).
- ✅ **Cache TTL for entitlement queries:** 60s with explicit invalidation on grant/revoke. **Signed off.**

### Risks

- S3 env vars not configured locally — FormMedia upload won't work in visual QA. URL fallback should render.
- Integration tests need a test DB — confirm `bun test` can connect to `ronindojo_dev`.

### Scope Guard

If Stripe subscription wiring, video transcoding, or social link validation/preview surfaces, note and defer.

### Dirstarter Implementation Template

- **Docs read first:** Component inventory (checked 2026-05-11), `"use cache"` pattern from Dirstarter queries
- **Baseline pattern to extend:** `"use cache"` + `cacheTag` + `cacheLife` from existing query files
- **Custom delta:** Entitlement-specific caching with grant/revoke invalidation
- **No-bypass proof:** Using Dirstarter's own caching pattern, not inventing a new one

---

## Task Log

- SESSION_0129_TASK_01 — ✅ done (hostile close review batch: 3 findings, aggregate 7)
- SESSION_0129_TASK_02 — ✅ done (SESSION_0130 plan produced)

## What Landed

- ✅ Hostile close review batch for sessions 0126–0128 (Passport profile editor arc)
- ✅ 3 findings identified: query consolidation, caching, integration test
- ✅ Kaizen aggregate: 7 → remediation items staged for SESSION_0130
- ✅ SESSION_0130 plan produced (6 tasks)
- ✅ Graphify updated to HEAD (`529881a`)

## Files Touched

- `docs/sprints/SESSION_0129.md` — this file (new)

## Decisions Resolved

- Hostile review scope: sessions 0126–0128 (3 sessions since last review at SESSION_0125)
- All 3 findings classified as open — remediation in SESSION_0130

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 15th session carried
- 🟡 S3 bucket configuration for user media uploads — needs infra setup
- 🟡 3 hostile review findings open (FINDING_01–03) — remediation in SESSION_0130
- 🟡 Tier-based auto-grant architecture — needs Petey decision in SESSION_0130

## Next Session

**Goal:** SESSION_0130 — Remediate hostile review findings + visual QA + tier auto-grant architecture

**Inputs to read:**

- `docs/sprints/SESSION_0129.md` — this session (review findings)
- `apps/web/server/web/entitlements/queries.ts` — consolidate + cache
- Dirstarter `"use cache"` pattern from any existing query file
- `apps/web/server/admin/entitlements/actions.ts` — add cache invalidation on grant/revoke
- Stripe webhook patterns in Dirstarter for tier auto-grant design

**First task:** TASK_01 — Consolidate `canUploadMedia` into a single Prisma query.
