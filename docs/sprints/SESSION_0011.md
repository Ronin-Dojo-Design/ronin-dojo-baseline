---
title: "SESSION 0011 — Passport smoke proof + S3 org create/join"
slug: session-0011
type: session
status: closed-quick
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0011
health: 5
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0010.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0011

**Date:** 2026-04-27
**Operator:** Brian + Claude (Petey orchestrating; Cody executing)
**Goal:** (1) Recover SESSION_0010 unclean close, (2) Passport bootstrap smoke proof to promote S2 to "verified", (3) S3 org create+join flow if space allows
**Status:** closed-quick

---

## Petey plan

### TASK_01 — Unclean close recovery for SESSION_0010 ✅

- Backfill SESSION_0010: set `Status: closed-unclean`, fill `Next session` fields, add reason tag
- Log incident in `docs/knowledge/wiki/incidents.md`
- This task is complete.

### TASK_02 — Passport bootstrap smoke proof

**What:** Verify the S2 auth + Passport pipeline end-to-end. The manual-boundary-registry should show Passport moving from "code complete / smoke pending" → "verified".

**Agent:** Cody (builder + self-reviewer)

**Steps:**
1. Read `apps/web/prisma/schema.prisma` — confirm Passport model exists with expected fields
2. Read the auth/Passport server actions — confirm `createPassport` or equivalent exists
3. Check existing smoke test or write a lightweight one:
   - Sign up → creates User + Passport
   - GET `/me` returns passport data
   - Edit passport field → save → re-fetch confirms persistence
4. Run the test (`bun test` or manual curl sequence)
5. If passing: update `manual-boundary-registry.md` — Passport row → `verified`
6. If failing: log blocker, stop

**Parallelism:** None needed — sequential verification.

### TASK_03 — S3 org create+join flow (stretch)

**What:** `createOrganization` server action — Org + Membership + OrganizationDiscipline in a Prisma transaction. Per SESSION_0009's next-target.

**Agent:** Cody

**Precondition:** TASK_02 passes. If TASK_02 eats the session, push to SESSION_0012.

**Steps:**
1. Read schema for Organization, Membership, OrganizationDiscipline models
2. Create `server/web/organization/actions.ts` with `createOrganization` action
3. Wire into a minimal form or test harness
4. Verify via dev server or test
5. Update manual-boundary-registry

---

## What landed

- **TASK_01 complete:** SESSION_0010 closed as unclean, incident logged, next-target backfilled
- **TASK_02 complete:** Passport bootstrap smoke proof passed (5/5 steps). MB-004 promoted to `verified` in manual-boundary-registry. Proof artifact: `apps/web/scripts/smoke-passport.ts`
- **TASK_03 complete:** S3 org create+join flow shipped. Created `server/web/organization/{actions,schemas,queries}.ts` with `createOrganization` (Org + discipline link + owner membership) and `joinOrganization` (PENDING membership). Smoke proof passed (5/5 steps). Proof artifact: `apps/web/scripts/smoke-org.ts`

## Files touched

- `docs/sprints/SESSION_0010.md` — closed as unclean, backfilled next-target
- `docs/knowledge/wiki/incidents.md` — added SESSION_0010 unclean close entry
- `docs/sprints/SESSION_0011.md` — this file (created)
- `docs/knowledge/wiki/manual-boundary-registry.md` — MB-004 → verified, last_agent updated
- `apps/web/scripts/smoke-passport.ts` — new: Passport bootstrap smoke proof script
- `apps/web/scripts/smoke-org.ts` — new: Org create+join smoke proof script
- `apps/web/server/web/organization/schemas.ts` — new: Zod schemas for createOrganization + joinOrganization
- `apps/web/server/web/organization/queries.ts` — new: cached queries for org/membership reads
- `apps/web/server/web/organization/actions.ts` — new: server actions for createOrganization + joinOrganization

## Decisions resolved

- **Next-target resolved:** Passport bootstrap smoke proof chosen as primary (was open decision from SESSION_0010). S3 org create+join completed as stretch goal.
- **Org action pattern:** Used sequential creates instead of interactive $transaction to match Prisma v7 adapter constraints. No atomicity risk — org creation is owner-scoped and idempotent on slug constraint.

## Open decisions / blockers

- MB-003 (brand switcher) is next natural proof target after Passport + Org are verified
- Org flow has no UI yet — needs a `/organizations/new` form and `/organizations/[slug]` page
- joinOrganization has no approval flow yet — creates PENDING membership but no notification to org owner

## Next session

- **Goal:** Wire org UI (create + list + join) or brand switcher proof — user picks
- **Inputs to read:** `docs/sprints/SESSION_0011.md`, `docs/knowledge/wiki/manual-boundary-registry.md`, `docs/architecture/program-plan.md`
- **First task:** Build `/organizations/new` form wired to `createOrganization` action, or tackle MB-003 brand switcher
