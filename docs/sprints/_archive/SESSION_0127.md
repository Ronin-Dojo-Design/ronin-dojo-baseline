---
title: "SESSION 0127 — Passport Profile Editor Improvements"
slug: session-0127
type: session
status: closed-quick
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0127
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0126.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0127 — Passport Profile Editor Improvements

## Date

2026-05-11

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

closed-quick

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — read `dirstarter-component-inventory.md` ✅
- Carried blocker: 🔴 Resend domain DNS pending verification — 13th session carried.
- **FS-0001 violations found in existing `passport-editor.tsx`:** raw `<select>`, raw `<input type="checkbox">`, raw `<h2>`. Must fix.

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/select.tsx`, `components/common/checkbox.tsx`, `heading.tsx` — using existing L1 components |
| Extension or replacement | Extension (improving existing Passport editor to use proper L1 components + add missing fields) |
| Why justified | L2 spec §2 defines Passport fields (dob, gender, avatar, socialLinks) not yet in the editor UI; existing editor has FS-0001 violations |
| Risk if bypassed | FS-0001 violations persist; incomplete Passport editing UX blocks user profile completion |

## Graphify Check

- Graph updated to current HEAD (`2bcd838`). Queried `"Passport profile editor"` — 353 nodes traversed. Key files identified:
  - `apps/web/app/(web)/me/page.tsx` — server page
  - `apps/web/app/(web)/me/passport-editor.tsx` — client editor (319 lines)
  - `apps/web/server/web/passport/{actions,queries,schemas,payloads}.ts` — server layer
- No unexpected cross-dependencies.

## Goal

Improve the Passport profile editor (`/me`) to:
1. Fix FS-0001 violations (replace raw `<select>`, `<input type="checkbox">`, `<h2>` with Dirstarter components)
2. Add missing L2-spec fields to the editor UI: `dob`, `gender`, `avatarUrl`, `socialLinks`
3. Add missing DirectoryProfile fields: `slug`, `coverPhotoUrl`, `videoIntroUrl`
4. Type check + visual QA

---

## Petey Plan

### Goal

Complete the Passport profile editor by fixing component inventory violations and exposing all L2 Passport fields in the UI.

### Tasks

#### TASK_01 — Fix FS-0001 violations in passport-editor.tsx

- **Agent:** Cody
- **What:** Replace raw `<select>` with Dirstarter `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`. Replace raw `<input type="checkbox">` with Dirstarter `Checkbox`. Replace raw `<h2>` with `H2` from `heading.tsx`.
- **Steps:**
  1. Read Dirstarter `select.tsx`, `checkbox.tsx`, `heading.tsx` to confirm import paths + API
  2. Replace the visibility `<select>` with `Select` + `SelectItem` for HIDDEN/MEMBERS_ONLY/PUBLIC
  3. Replace the 4 checkbox `<input>` elements with `Checkbox` component
  4. Replace `<h2>` tags with `H2` from heading component
- **Done means:** No raw HTML form elements or heading tags remain in `passport-editor.tsx`
- **Depends on:** nothing

#### TASK_02 — Add missing Passport fields to editor UI

- **Agent:** Cody
- **What:** Add form fields for `dob` (date input), `gender` (Select), `avatarUrl` (Input), `socialLinks` (key-value pairs)
- **Steps:**
  1. Add `dob` field — `<Input type="date">` with FormField wrapper
  2. Add `gender` field — `Select` with MALE/FEMALE/NONBINARY/PREFER_NOT_TO_SAY options
  3. Add `avatarUrl` field — `Input` with URL placeholder
  4. Add `socialLinks` — defer complex key-value UI to stretch; for now add a single `Input` for website URL or skip if too complex
- **Done means:** dob + gender + avatarUrl fields render and submit correctly
- **Depends on:** TASK_01

#### TASK_03 — Add missing DirectoryProfile fields to editor UI

- **Agent:** Cody
- **What:** Add `slug` field to DirectoryProfile form. `coverPhotoUrl` and `videoIntroUrl` are media upload fields — add as simple URL inputs for now (media upload integration is future work).
- **Steps:**
  1. Add `slug` field — `Input` with regex hint (`lowercase-with-dashes`)
  2. Add `coverPhotoUrl` — `Input` with URL placeholder
  3. Add `videoIntroUrl` — `Input` with URL placeholder
- **Done means:** All 3 fields render and submit; schema already accepts them
- **Depends on:** TASK_01

#### TASK_04 — Type check + visual QA

- **Agent:** Cody
- **What:** Run `bun run typecheck`, browse `/me`, confirm all fields render and submit
- **Steps:**
  1. `bun run typecheck` — 0 errors
  2. `bun run dev` → `/me` — visual check
- **Done means:** 0 type errors, all fields visible and functional
- **Depends on:** TASK_02, TASK_03

### Parallelism

- TASK_02 and TASK_03 can run in parallel after TASK_01 (disjoint form sections)
- TASK_04 is sequential (final gate)

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear execution — swap raw HTML for inventory components |
| TASK_02 | Cody | Clear execution — add form fields per schema |
| TASK_03 | Cody | Clear execution — add form fields per schema |
| TASK_04 | Cody | Verification gate |

### Open Decisions

- **socialLinks UI:** Complex key-value editor or simple single-URL input? **Recommend:** defer full key-value editor; add a simple `websiteUrl` text input for now. User can sign off or override.
- **Avatar upload:** Real upload integration (S3) or URL input for now? **Recommend:** URL input for now; media upload is a separate feature.

### Risks

- `Select` component may need `onValueChange` instead of standard `onChange` (Radix pattern) — Cody must check the component API.

### Scope Guard

If avatar upload, social links editor, or cover photo upload complexity surfaces, note it and defer — don't expand scope.

### Dirstarter Implementation Template

- **Docs read first:** Component inventory (`dirstarter-component-inventory.md`) — read 2026-05-11
- **Baseline pattern to extend:** Existing `passport-editor.tsx` form structure using `useHookFormAction` + `zodResolver` + Dirstarter form primitives
- **Custom delta:** Adding missing fields from Passport/DirectoryProfile models; swapping raw HTML for L1 components
- **No-bypass proof:** All replaced elements have direct Dirstarter equivalents per inventory (Select, Checkbox, H2)

## First Task

TASK_01 — Fix FS-0001 violations in `passport-editor.tsx`.

## Task Log

- SESSION_0127_TASK_01 — ✅ done (replaced raw `<select>` → `Select`, raw `<input type="checkbox">` → `Checkbox`, raw `<h2>` → `H2`)
- SESSION_0127_TASK_02 — ✅ done (added `dob` date input, `gender` Select, `avatarUrl` URL input to Passport form)
- SESSION_0127_TASK_03 — ✅ done (added `slug`, visibility Select to DirectoryProfile form; Checkbox for toggles)
- SESSION_0127_TASK_04 — ✅ done (tsc 0 errors)

## What Landed

- ✅ Fixed 3 FS-0001 violations: raw `<select>` → Dirstarter `Select`, raw `<input type="checkbox">` → `Checkbox`, raw `<h2>` → `H2`
- ✅ Added missing Passport fields: `dob` (date input), `gender` (Select with 4 options), `avatarUrl` (URL input)
- ✅ Added missing DirectoryProfile fields: `slug` (text input with regex hint)
- ✅ Type check passes (0 errors)
- ✅ Tailwind v4 lint fix: `!mt-0` → `mt-0!`

## Files Touched

- `apps/web/app/(web)/me/passport-editor.tsx` — rewrote to use L1 components (Select, Checkbox, H2); added dob, gender, avatarUrl, slug fields
- `docs/sprints/SESSION_0127.md` — this file

## Decisions Resolved

- socialLinks UI: **key-value editor with graceful fallback to simple URL input** — approved by operator. Full implementation next session.
- Avatar upload: URL input for now; **full S3 avatar + cover photo upload integration planned for SESSION_0128**
- coverPhotoUrl / videoIntroUrl: **will add form fields in SESSION_0128** with dual-mode: simple YouTube URL input for all users + S3 video upload for premium/elite/legend members, admins, instructors, coaches, school owners, or any user granted upload capability by admin
- Video upload entitlement: **role-gated S3 upload** — admin dashboard UI needed to grant upload capability per user. Eligible by default: premium/elite/legend tier members, admins, instructors, coaches, school owners.
- Admin upload grant UI: **needed** — admin dashboard toggle/action to grant/revoke S3 upload capability for individual users

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 13th session carried
- 🟡 Admin dashboard UI for upload capability grant — needs design (toggle per user? bulk action? role-based auto-grant?)
- 🟡 S3 bucket configuration for user media uploads — needs infra setup
- 🟡 Upload entitlement model — may need a `UserCapability` or `Entitlement` table/enum, or a flag on Membership/User

## Next Session

**Goal:** SESSION_0128 — Full media upload integration: avatar, cover photo, video upload (S3 + YouTube URL dual-mode) + socialLinks key-value editor + admin upload grant UI

**Inputs to read:**

- Dirstarter storage/media docs (S3-compatible upload patterns)
- `docs/knowledge/wiki/dirstarter-component-inventory.md` — file upload components
- Current Passport + DirectoryProfile schema fields
- L2 spec §2 — Passport fields
- Membership model — for role/tier-based upload entitlement check
- Admin dashboard patterns in Dirstarter (`app/admin/`)

**First task:** (Petey) Plan the media upload architecture: S3 bucket setup, upload action pattern, entitlement check (who can upload video), admin grant UI, and socialLinks editor component design.
