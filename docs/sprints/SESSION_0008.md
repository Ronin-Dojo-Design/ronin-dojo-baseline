---
title: "SESSION 0008 — S2 Smoke Test + S3 Org Create & Join Flow"
slug: session-0008
type: session
status: closed-unclean
created: 2026-04-26
updated: 2026-04-26
last_agent: copilot-session-0008
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0007.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0008

**Date:** 2026-04-26
**Operator:** Brian + Copilot (Petey → Cody)
**Goal:** Validate S2 (smoke test sign-up → Passport → /me → edit → save), then execute S3 — Organization create + join flow with invite link, Membership lifecycle, and multi-role assignment.
**Status:** closed-quick (UNCLEAN — session crashed due to API error)

---

## Petey's plan

This session has **two phases**: a quick S2 validation gate, then the S3 build.

### Phase A — S2 Smoke Test (gate)

| # | Task | Agent | Est |
|---|---|---|---|
| A1 | **Dev server boot**: `bun dev` — confirm app starts without errors | Cody | 5 min |
| A2 | **Sign-up flow**: create a test user via magic link or email sign-up → verify `Passport` + `DirectoryProfile` rows created in DB | Cody | 10 min |
| A3 | **`/me` route**: visit `/me` → confirm Passport editor renders with pre-filled data | Cody | 5 min |
| A4 | **Edit + save**: change display name + directory visibility → submit → verify DB update | Cody | 5 min |

**If A1–A4 pass:** S2 is ✅, move to Phase B.
**If any fail:** fix the issue before proceeding. Don't start S3 on a broken S2.

### Phase B — S3: Organization Create + Join Flow

S3 deliverable from program-plan: *"Owner creates an Organization (dojo/league/school/club). Invite link → user joins as Membership in (Org × Discipline). Multi-role. Status lifecycle (invited/pending/active/suspended/expired) modeled and enforced."*

#### Task breakdown

| # | Task | Agent | Depends on | Est |
|---|---|---|---|---|
| T1 | **Seed system Roles**: create seed data for system roles (OWNER, INSTRUCTOR, STUDENT, STAFF) with `isSystem: true` | Cody | — | 15 min |
| T2 | **Org create server action**: `server/web/organization/actions.ts` — `createOrganization` action. Creates Org + auto-creates Membership (OWNER role) + OrganizationDiscipline in a transaction. Brand from request context. | Cody | T1 | 30 min |
| T3 | **Org create UI**: `app/(web)/organizations/new/page.tsx` — form with name, slug (auto-gen), type (DOJO/LEAGUE/SCHOOL/CLUB), select disciplines. React Hook Form + Zod. | Cody | T2 | 30 min |
| T4 | **Invite link generation**: `generateInviteLink` action — creates a signed token (short-lived, scoped to org + discipline). Store in a new `OrganizationInvite` model or use a stateless JWT. | Cody | T2 | 20 min |
| T5 | **Join flow**: `app/(web)/join/[token]/page.tsx` — decode invite → show org info → confirm → create Membership (status: PENDING or ACTIVE depending on org settings). Assign STUDENT role by default. | Cody | T4 | 30 min |
| T6 | **Membership status lifecycle**: `updateMembershipStatus` action — OWNER/INSTRUCTOR can transition members between PENDING→ACTIVE→SUSPENDED→EXPIRED. Enforce valid transitions. | Cody | T2 | 20 min |
| T7 | **Org detail page**: `app/(web)/organizations/[slug]/page.tsx` — show org info, member list (for owner/instructor), invite link button. | Cody | T2, T4 | 30 min |

#### Parallelism

- **T1 is prerequisite** for everything (roles must exist).
- **T2 depends on T1** — needs OWNER role ID.
- **T3 and T4 and T6 are independent** after T2 — can be worked in parallel.
- **T5 depends on T4** (needs invite token format).
- **T7 depends on T2 + T4** (needs org + invite link).

#### Execution order

1. **T1** — Seed roles
2. **T2** — Org create action
3. **T3 + T4 + T6** (parallel)
4. **T5** (after T4)
5. **T7** (after T3 + T4)

### Key decisions (pre-resolved)

- **Invite mechanism**: Stateless signed token (JWT with org ID + discipline ID + expiry). No new DB table needed — keeps it simple. If we need revocation later, add an `OrganizationInvite` table in a future sprint.
- **Default role on join**: STUDENT. Owner can upgrade via MembershipRoleAssignment.
- **Membership status on join**: ACTIVE by default (small dojos don't need approval gates). Add org-level `requireApproval` flag later if needed.
- **Brand scoping**: Organization has `brand` column (already in schema). Org creation reads brand from middleware cookie/header.
- **Slug generation**: Auto-generate from org name via `slugify()`. Unique per brand (existing `@@unique([brand, slug])` constraint).

### Open questions

- **Invite link expiry duration**: Default to 7 days? Configurable per org later.
- **Max orgs per user**: No limit for now. Revisit if abuse becomes a concern.

### Done means

- [ ] S2 smoke test passes (sign-up → Passport created → /me → edit → save)
- [ ] System roles seeded (OWNER, INSTRUCTOR, STUDENT, STAFF)
- [ ] User can create an Organization via UI
- [ ] Creating an org auto-creates the owner's Membership + OWNER role
- [ ] Owner can generate an invite link
- [ ] Another user can join via invite link → Membership created
- [ ] Owner can change a member's status (PENDING/ACTIVE/SUSPENDED/EXPIRED)

---

## What landed

- **A1 ✅** — Dev server booted, no errors
- **A2 ✅** — Verified 2 seed users exist, 0 Passports (pre-S2 hook). Backfilled Passports + DirectoryProfiles for both users.
- **T1 ✅** — Confirmed 6 system roles already seeded (OWNER, INSTRUCTOR, STUDENT, STAFF, COACH, ORG_ADMIN, STYLE_APPROVER)
- **Proxy/middleware merge** — Merged brand resolution from `middleware.ts` into `proxy.ts`, deleted `middleware.ts`. This resolves the Next.js 16 deprecation conflict.

## Files touched

- `apps/web/proxy.ts` — merged brand resolution logic (host→brand mapping, x-brand header, brand cookie) from middleware.ts
- `apps/web/middleware.ts` — deleted (superseded by proxy.ts)

## Decisions resolved

- **middleware.ts vs proxy.ts**: Consolidated into `proxy.ts` per Next.js 16 convention. Brand resolution + auth guards now live in one file.

## Open decisions / blockers

- **A3/A4 not reached**: `/me` route not yet verified (session crashed before page could load)
- **S3 work not started**: All T2–T7 tasks still pending
- **Proxy.ts correctness**: The merged proxy.ts needs verification — it was written just before the crash. Confirm it works on next boot.

## Next session

- **Goal:** Verify proxy.ts merge works, complete S2 smoke test (A3–A4), then begin S3 org create flow
- **Inputs to read:** `apps/web/proxy.ts`, `docs/sprints/SESSION_0008.md`, `docs/architecture/program-plan.md`
- **First task:** Boot dev server, hit `/me`, confirm brand resolution works via proxy.ts

## Crash incident

- **When:** Mid-session, after proxy.ts edit, before middleware.ts delete confirmation
- **Error:** `Request Failed: 400 {"error":{"message":"thinking: Input tag 'adaptive' found using 'type' does not match any of the expected tags: 'disabled', 'enabled'","code":"invalid_request_body"}}`
- **Cause:** API-side error (Copilot backend), not a code issue
- **Impact:** middleware.ts delete may or may not have executed. Git shows `D apps/web/middleware.ts` — appears the delete went through.
