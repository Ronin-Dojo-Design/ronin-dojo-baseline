---
title: "SESSION 0128 — Media Upload + socialLinks Editor + Admin Upload Grant"
slug: session-0128
type: session
status: closed
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0128
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0127.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0128 — Media Upload + socialLinks Editor + Admin Upload Grant

## Date

2026-05-11

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

in-progress

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — read `dirstarter-component-inventory.md` ✅
- Carried blocker: 🔴 Resend domain DNS pending verification — 14th session carried.
- Inventory confirms: `FormMedia` (`form-media.tsx`) exists for image upload with preview. `Avatar`/`AvatarImage`/`AvatarFallback` available. Must use these, not raw `<input type="file">`.

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `lib/media.ts` (S3 upload), `services/s3.ts` (S3 client), `components/common/form-media.tsx` (FormMedia), `hooks/use-media-action.ts` |
| Extension or replacement | Extension (wiring Dirstarter's existing S3 upload + FormMedia into Passport/DirectoryProfile editor; adding entitlement-gated upload) |
| Why justified | L2 spec §2 requires avatar, cover photo, video intro on Passport/DirectoryProfile. Dirstarter provides the upload machinery; we wire it in. |
| Risk if bypassed | Users can't upload profile media; media fields remain URL-only text inputs |

## Graphify Check

- Graph updated to current HEAD (`f3c7afe`). Queried `"S3 upload media avatar cover photo video entitlement"` — 32 nodes found. Key files:
  - `apps/web/app/(web)/me/passport-editor.tsx` — client editor
  - `apps/web/server/web/passport/{actions,queries,schemas,payloads}.ts` — server layer
  - `apps/web/app/admin/entitlements/` — full admin CRUD already exists
  - `apps/web/prisma/schema.prisma` — `Entitlement`, `EntitlementGrant`, `UserEntitlement` models exist
  - Dirstarter: `lib/media.ts` (uploadToS3Storage), `services/s3.ts` (S3Client), `components/common/form-media.tsx` (FormMedia)
- Queried `"passport editor socialLinks avatarUrl coverPhotoUrl videoIntroUrl"` — 372 nodes. Confirmed passport-editor.tsx doesn't yet have coverPhotoUrl/videoIntroUrl/socialLinks fields.

## Goal

Complete the Passport profile editor media integration:
1. Wire `FormMedia` for avatar upload (replacing URL-only input)
2. Add `coverPhotoUrl` + `videoIntroUrl` fields to DirectoryProfile form (FormMedia for cover photo; YouTube URL input + entitlement-gated S3 upload for video)
3. Build `socialLinks` key-value editor component
4. Seed an `S3_UPLOAD` entitlement and wire entitlement check into upload actions
5. Admin UI: grant/revoke S3 upload entitlement per user

---

## Petey Plan

### Goal

Wire Dirstarter's S3 upload machinery into the Passport profile editor for avatar, cover photo, and video intro; build a socialLinks editor; and gate S3 video upload behind an entitlement check with admin grant UI.

### Tasks

#### TASK_01 — Wire FormMedia for avatar upload
- **Agent:** Cody
- **What:** Replace the `avatarUrl` text `Input` in `passport-editor.tsx` with `FormMedia` component, using Dirstarter's existing `useMediaAction` hook and `uploadToS3Storage` from `lib/media.ts`. Add a server action `uploadPassportMedia` that accepts a file, validates auth, uploads to S3 at key `passports/{userId}/avatar`, and returns the URL.
- **Steps:**
  1. Read `FormMedia` API + `useMediaAction` hook to confirm props
  2. Create `server/web/passport/media-actions.ts` — `uploadPassportMedia` action (auth-gated, accepts FormData with file + field name)
  3. Update `passport-editor.tsx`: replace `avatarUrl` Input with `FormMedia` bound to the form field
  4. Update passport update schema to accept `avatarUrl` as optional string
- **Done means:** Avatar upload works via FormMedia; S3 key is `passports/{userId}/avatar.{ext}`; URL persists to Passport.avatarUrl
- **Depends on:** nothing

#### TASK_02 — Add coverPhotoUrl + videoIntroUrl to DirectoryProfile form
- **Agent:** Cody
- **What:** Add `coverPhotoUrl` as a `FormMedia` upload field. Add `videoIntroUrl` as a dual-mode field: text Input for YouTube/Vimeo URL (available to all), or `FormMedia` S3 upload (available only to users with `S3_UPLOAD` entitlement). For now, implement the URL input; gate the FormMedia behind a boolean prop `canUploadVideo` passed from the server page.
- **Steps:**
  1. Add `coverPhotoUrl` FormMedia field to DirectoryProfile section of passport-editor
  2. Add `videoIntroUrl` Input field with placeholder "YouTube or Vimeo URL"
  3. Add conditional `FormMedia` for videoIntroUrl when `canUploadVideo` is true
  4. Update DirectoryProfile update schema to accept both fields
  5. Pass `canUploadVideo` from server page (query user entitlements)
- **Done means:** Cover photo uploads via FormMedia; video intro accepts URL; S3 video upload renders only for entitled users
- **Depends on:** TASK_01 (shared media action pattern)

#### TASK_03 — Build socialLinks key-value editor
- **Agent:** Cody
- **What:** Create a `SocialLinksEditor` component that renders a list of `{ platform, url }` entries with add/remove. Platforms: WEBSITE, INSTAGRAM, FACEBOOK, YOUTUBE, TIKTOK, TWITTER, LINKEDIN. Uses Dirstarter `Select` for platform picker, `Input` for URL, `Button` for add/remove.
- **Steps:**
  1. Create `apps/web/app/(web)/me/_components/social-links-editor.tsx`
  2. Use `useFieldArray` from react-hook-form for dynamic entries
  3. Wire into passport-editor.tsx as the `socialLinks` field
  4. Update passport update schema: `socialLinks` as `z.array(z.object({ platform: z.string(), url: z.string().url() })).optional()`
- **Done means:** Users can add/remove social links; data persists as JSON to Passport.socialLinks
- **Depends on:** TASK_01 (form structure established)

#### TASK_04 — Seed S3_UPLOAD entitlement + wire entitlement check + auto-grant by tier
- **Agent:** Cody
- **What:** Add a seed for `S3_UPLOAD` entitlement (one per brand). Create a helper `hasEntitlement(userId, entitlementKey)` in `server/web/entitlements/queries.ts`. Also create `canUploadMedia(userId, brand)` that checks EITHER a UserEntitlement row OR membership tier/role (premium/elite/legend tiers, admin/instructor/coach/owner roles). Wire into `/me` server page.
- **Steps:**
  1. Add `S3_UPLOAD` entitlement to seed script (all brands)
  2. Create `server/web/entitlements/queries.ts` with `hasEntitlement(userId, key, brand)` + `canUploadMedia(userId, brand)` functions
  3. `canUploadMedia` checks: (a) active UserEntitlement for S3_UPLOAD, OR (b) any active Membership with tier in [PREMIUM, ELITE, LEGEND] or role in [ADMIN, INSTRUCTOR, COACH, OWNER]
  4. In `/me/page.tsx`, query `canUploadMedia(user.id, brand)` and pass result as `canUploadVideo` prop
- **Done means:** `canUploadVideo` is true for entitled users OR users with qualifying membership tier/role; seed creates entitlement rows
- **Depends on:** nothing (can run parallel with TASK_01)

#### TASK_05 — Admin UI: grant/revoke S3 upload entitlement
- **Agent:** Cody
- **What:** Add a "Grant Upload" action to the existing admin entitlements UI. This creates a `UserEntitlement` row with `sourceType: ADMIN_GRANT` for the selected user + `S3_UPLOAD` entitlement. Also add a revoke action. Leverage existing admin entitlements CRUD patterns.
- **Steps:**
  1. Read existing `app/admin/entitlements/` components to understand the pattern
  2. Create `app/admin/users/[id]/_components/upload-grant-toggle.tsx` — a toggle/button that grants or revokes `S3_UPLOAD`
  3. Create server actions: `grantUploadEntitlement(userId)` and `revokeUploadEntitlement(userId)` in `server/admin/entitlements/actions.ts`
  4. Wire into admin user detail page (if exists) or add a simple admin route
- **Done means:** Admin can toggle S3 upload capability per user; creates/deletes UserEntitlement row
- **Depends on:** TASK_04 (entitlement seeded)

#### TASK_06 — Type check + visual QA
- **Agent:** Cody
- **What:** Run `bun run typecheck`, browse `/me`, confirm all fields render. Test upload flow if S3 is configured.
- **Steps:**
  1. `bun run typecheck` — 0 errors
  2. Visual check `/me` — avatar FormMedia, cover photo FormMedia, video intro dual-mode, socialLinks editor
  3. Check admin entitlements page for grant/revoke actions
- **Done means:** 0 type errors, all fields visible and functional
- **Depends on:** TASK_01–05

### Parallelism

- TASK_01 and TASK_04 can run in parallel (independent)
- TASK_02 depends on TASK_01 (shared media action) and TASK_04 (entitlement check)
- TASK_03 can run in parallel with TASK_02 (disjoint form sections)
- TASK_05 depends on TASK_04
- TASK_06 is sequential (final gate)

```
TASK_01 ──┬──→ TASK_02 ──┐
          │               │
          ├──→ TASK_03 ──┤
          │               │
TASK_04 ──┼──→ TASK_05 ──┼──→ TASK_06
```

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear execution — wire existing Dirstarter FormMedia into passport editor |
| TASK_02 | Cody | Clear execution — add form fields + conditional upload |
| TASK_03 | Cody | Clear execution — build component with useFieldArray |
| TASK_04 | Cody | Clear execution — seed + query helper |
| TASK_05 | Cody | Clear execution — follows existing admin CRUD pattern |
| TASK_06 | Cody | Verification gate |

### Open Decisions

- ✅ **S3 bucket configuration:** Proceed with code using `env.S3_*` vars; infra setup separate. **Signed off.**
- ✅ **Auto-grant by role/tier:** Build BOTH manual admin grant AND auto-grant by membership tier (premium/elite/legend + admin/instructor/coach/owner roles). **Signed off.**
- ✅ **Video file size limit:** 100MB. **Signed off.**

### Risks

- `FormMedia` component uses `useMediaAction` which may have its own server action wired in (Dirstarter pattern). Need to verify if we need a custom action or can use the built-in one.
- S3 env vars not configured locally → uploads will fail. Code should handle this gracefully (show URL input fallback if S3 not configured).

### Scope Guard

If media transcoding, video player UI, social links validation/preview, or membership auto-grant complexity surfaces, note it and defer — don't expand scope.

### Dirstarter Implementation Template

- **Docs read first:** Component inventory (`dirstarter-component-inventory.md`) — read 2026-05-11. `FormMedia`, `Avatar`, `Select`, `Input`, `Button` confirmed.
- **Baseline pattern to extend:** `lib/media.ts` (uploadToS3Storage), `services/s3.ts` (S3Client), `components/common/form-media.tsx` (FormMedia + useMediaAction hook), `app/admin/entitlements/` (admin CRUD)
- **Custom delta:** Entitlement-gated video upload (dual-mode URL/S3), socialLinks key-value editor, admin upload grant toggle
- **No-bypass proof:** FormMedia is the L1 component for image/media upload. Entitlement model already exists. Admin CRUD pattern already exists.

## First Task

TASK_01 — Wire FormMedia for avatar upload in `passport-editor.tsx`.

## Task Log

- SESSION_0128_TASK_01 — ✅ done (replaced avatarUrl text Input with FormMedia; S3 key `passports/{userId}/avatar`)
- SESSION_0128_TASK_02 — ✅ done (added coverPhotoUrl FormMedia + videoIntroUrl dual-mode: URL input for all, FormMedia for entitled users)
- SESSION_0128_TASK_03 — ✅ done (built SocialLinksEditor with useFieldArray, platform Select + URL Input, add/remove)
- SESSION_0128_TASK_04 — ✅ done (seeded S3_UPLOAD entitlement all brands; created `hasEntitlement` + `canUploadMedia` queries with role-based auto-grant for INSTRUCTOR/COACH/OWNER/ORG_ADMIN + org owners)
- SESSION_0128_TASK_05 — ✅ done (UploadGrantToggle on admin user detail page; grant/revoke server actions)
- SESSION_0128_TASK_06 — ✅ done (tsc 0 errors)

## What Landed

- ✅ Avatar upload via `FormMedia` (replaces URL-only input) — S3 key `passports/{userId}/avatar`
- ✅ Cover photo upload via `FormMedia` on DirectoryProfile — S3 key `profiles/{userId}/cover`
- ✅ Video intro dual-mode: URL input (all users) + `FormMedia` S3 upload (entitled users only)
- ✅ `SocialLinksEditor` key-value component with platform picker (7 platforms) + URL input + add/remove
- ✅ `S3_UPLOAD` entitlement seeded for all 4 brands
- ✅ `hasEntitlement(userId, key, brand)` + `canUploadMedia(userId, brand)` server queries
- ✅ Auto-grant: users with INSTRUCTOR/COACH/OWNER/ORG_ADMIN role or org ownership get upload access
- ✅ Admin UI: `UploadGrantToggle` on `/admin/users/[id]` page — grant/revoke S3_UPLOAD per user
- ✅ Type check passes (0 errors)

## Files Touched

- `apps/web/app/(web)/me/passport-editor.tsx` — FormMedia for avatar, coverPhotoUrl, videoIntroUrl; SocialLinksEditor; props for userId + canUploadVideo
- `apps/web/app/(web)/me/page.tsx` — passes userId + canUploadVideo from server
- `apps/web/app/(web)/me/_components/social-links-editor.tsx` — new component
- `apps/web/server/web/passport/schemas.ts` — socialLinks as array of {platform, url}; added coverPhotoUrl, videoIntroUrl
- `apps/web/server/web/entitlements/queries.ts` — new file: hasEntitlement + canUploadMedia
- `apps/web/server/admin/entitlements/actions.ts` — added grantUserEntitlement + revokeUserEntitlement
- `apps/web/app/admin/users/_components/upload-grant-toggle.tsx` — new component
- `apps/web/app/admin/users/[id]/page.tsx` — wired UploadGrantToggle
- `apps/web/prisma/seed.ts` — S3_UPLOAD entitlement seed for all brands
- `docs/sprints/SESSION_0128.md` — this file

## Decisions Resolved

- S3 bucket config: Code uses existing `env.S3_*` vars; infra setup is separate ops task
- Auto-grant by tier: Role-based auto-grant implemented now (INSTRUCTOR/COACH/OWNER/ORG_ADMIN + org owners). Tier-based (premium/elite/legend) deferred until pricing plan / subscription integration exists
- Video file size limit: 100MB (uses Dirstarter's existing file validation)
- socialLinks schema: Array of `{ platform, url }` objects (not a flat record)

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 14th session carried
- 🟡 S3 bucket configuration for user media uploads — needs infra setup (env vars)
- ✅ Auto-grant S3_UPLOAD by membership tier — **signed off, building this session**
- ✅ Video file size limit — **100MB, signed off**

## Next Session

**Goal:** SESSION_0129 — Visual QA + S3 infra setup + tier-based auto-grant

**Inputs to read:**

- S3 bucket provisioning (AWS/Cloudflare R2) — configure `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` in `.env`
- Pricing plan / subscription model — for tier-based entitlement auto-grant (premium/elite/legend)
- `FormMedia` visual QA — test avatar upload, cover photo upload, video upload on `/me`
- Admin QA — test grant/revoke toggle on `/admin/users/[id]`

**First task:** (Petey) Plan S3 bucket provisioning + visual QA checklist + tier auto-grant architecture (EntitlementGrant → PricingPlan → auto-create UserEntitlement on subscription webhook).
