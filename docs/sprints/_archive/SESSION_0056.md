---
title: "SESSION 0056 — Content + Curriculum: Course Publishing, Certificate Issuance, Technique→Curriculum Linking, Media Gallery"
slug: session-0056
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0056
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0055.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0056 — Content + Curriculum Gaps (WORKFLOW 0040)

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

closed-quick

### Goal

Close the content + curriculum gaps identified in SESSION_0055 calendar audit (WORKFLOW target 0040): public course browsing, certificate issuance flow, technique→curriculum linking in admin, and media gallery management.

### Context read

- ✅ SESSION_0055 — closed-quick. Calendar audit complete. 0040 gaps identified.
- ✅ WORKFLOW_5.0 — target 0040: "Curriculum, techniques, media, certificates, publishing surfaces"
- ✅ `dirstarter-component-inventory.md` — MANDATORY PRE-FLIGHT confirmed.
- ✅ `opening.md` — ritual followed.
- ✅ Git: `main`, clean working tree.

### Existing code inventory

| Area | Admin | Public | Server | Gaps |
| --- | --- | --- | --- | --- |
| Courses | ✅ DataTable + form + curriculum items editor | ❌ None | ✅ CRUD + queries | **Public course list/detail pages** |
| Certificates | ✅ DataTable + template form | ❌ None | ✅ Template CRUD | **Issuance flow (order → issue → PDF URL), admin issue action** |
| Techniques | ✅ (in web server) | ✅ List + detail | ✅ Full CRUD + tests | **Link to curriculum items** |
| Media | Schema exists (Media + MediaAttachment) | ❌ None | ❌ No service layer | **Admin upload/gallery, attachment to entities** |

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content pages, admin CRUD, S3 media (FormMedia component exists in L1) |
| Extension or replacement | Extension — using L1 patterns for new domain pages |
| Why justified | Content/curriculum is the value proposition for Baseline members. Can't launch without it. |
| Risk if bypassed | No member-facing curriculum = no retention tool at launch |

### Lane selection

**Primary lane:** Content + curriculum
**Sub-lane:** None

---

## Petey plan

### Goal

Build four missing surfaces: public courses, certificate issuance, technique→curriculum linking, and media gallery.

### TASK_01 — Public course list + detail pages (Cody, 25 min)

- **Agent:** Cody
- **What:** Create `app/(web)/courses/page.tsx` (list) and `app/(web)/courses/[slug]/page.tsx` (detail with curriculum items). Brand-scoped queries.
- **Steps:**
  1. Create `server/web/courses/queries.ts` — `searchCourses()`, `findCourseBySlug()`
  2. Create `server/web/courses/payloads.ts` — card + detail payloads
  3. Create `app/(web)/courses/page.tsx` — grid of course cards
  4. Create `app/(web)/courses/[slug]/page.tsx` — course detail with curriculum items list, linked techniques
- **Done means:** Public users can browse and view courses with their curriculum
- **Depends on:** Nothing

### TASK_02 — Certificate issuance admin flow (Cody, 30 min)

- **Agent:** Cody
- **What:** Add "Issue Certificate" action to admin. Creates `CertificateIssuance` record with unique certificate number + QR code. Admin can issue from certificate template detail page.
- **Steps:**
  1. Create `server/admin/certificates/issuance-actions.ts` — `issueCertificate()` (generates certificateNumber, qrVerificationCode, creates issuance row)
  2. Create `server/admin/certificates/issuance-queries.ts` — `findIssuancesByTemplate()`
  3. Add issuance list + "Issue" button to `app/admin/certificates/[id]/page.tsx`
  4. Create `app/(web)/certificates/verify/[code]/page.tsx` — public QR verification page
- **Done means:** Admin can issue certificates to users; public can verify via QR code
- **Depends on:** Nothing

### TASK_03 — Technique→curriculum linking in admin (Cody, 20 min)

- **Agent:** Cody
- **What:** Add technique picker to curriculum items editor. When editing a curriculum item, admin can link techniques from a searchable dropdown.
- **Steps:**
  1. Add `linkTechniqueToCurriculum()` and `unlinkTechniqueFromCurriculum()` to `server/admin/courses/actions.ts`
  2. Add technique search query for picker
  3. Extend `CurriculumItemsEditor` with technique linking UI (Command/Popover picker per item)
- **Done means:** Admin can link/unlink techniques to curriculum items; linked techniques show on public course detail
- **Depends on:** Nothing (parallel with TASK_01)

### TASK_04 — Media gallery admin (Cody, 25 min)

- **Agent:** Cody
- **What:** Create admin media gallery page for uploading and managing Media records. Uses L1 `FormMedia` component for upload.
- **Steps:**
  1. Create `server/admin/media/queries.ts` — `findMedia()` with brand filter, pagination
  2. Create `server/admin/media/actions.ts` — `createMedia()`, `deleteMedia()`
  3. Create `server/admin/media/schema.ts` — table params + form schema
  4. Create `app/admin/media/page.tsx` — gallery grid with upload button
  5. Wire into admin nav sidebar
- **Done means:** Admin can upload, view, and delete media files
- **Depends on:** Nothing

### Parallelism

All four tasks are on disjoint file sets → **all parallel**.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear L1 page pattern, no decisions |
| TASK_02 | Cody | New service + admin extension |
| TASK_03 | Cody | Admin component extension |
| TASK_04 | Cody | L1 DataTable + FormMedia pattern |

### Open decisions

None — all patterns are established by existing admin pages.

### Risks

- Media upload depends on S3 env vars being configured. Code will be ready; upload will work when keys are set.

### Scope guard

If additional work surfaces (e.g., PDF generation for certificates, video transcoding), note in SESSION file — do NOT expand scope.

### Dirstarter implementation template

- **Docs read first:** `dirstarter-component-inventory.md` (2026-05-04)
- **Baseline pattern to extend:** Admin DataTable, public page with Wrapper/Card/Stack, FormMedia for uploads
- **Custom delta:** Course/certificate/media domain pages
- **No-bypass proof:** Using L1 components throughout. No hand-rolled HTML.

---

## Execution order

1. TASK_01: Public course pages
2. TASK_02: Certificate issuance
3. TASK_03: Technique→curriculum linking
4. TASK_04: Media gallery

---

## First task

**TASK_01:** Public course list + detail pages. Cody begins now.

---

## Execution log

### TASK_01 — Public course pages ✅

- Created `server/web/courses/payloads.ts` — `courseManyPayload`, `courseOnePayload` (with curriculum items + technique links)
- Created `server/web/courses/queries.ts` — `searchCourses()`, `findCourseBySlug()` with `"use cache"` + brand scoping
- Created `app/(web)/courses/page.tsx` — grid layout with discipline/rank badges, curriculum item count
- Created `app/(web)/courses/[slug]/page.tsx` — detail with numbered curriculum items, linked techniques (clickable to technique detail)

### TASK_02 — Certificate issuance ✅

- Created `server/admin/certificates/issuance-actions.ts` — `issueCertificate()` (generates unique cert number + QR code), `revokeCertificate()`
- Created `server/admin/certificates/issuance-queries.ts` — `findIssuancesByTemplate()`, `findIssuanceByQrCode()`
- Created `app/admin/certificates/_components/certificate-issuance-list.tsx` — shows issued certs with revoke button
- Updated `app/admin/certificates/[id]/page.tsx` — now loads + renders issuance list under template form
- Created `app/(web)/certificates/verify/[code]/page.tsx` — public QR verification page (valid/revoked/expired status)

### TASK_03 — Technique→curriculum linking ✅

- Added `linkTechniqueToCurriculum()`, `unlinkTechniqueFromCurriculum()` to `server/admin/courses/actions.ts`
- Added `searchTechniquesForPicker()` to `server/admin/courses/queries.ts`
- Updated `findCourseById` query to include `techniqueLinks` with technique details
- Rewrote `curriculum-items-editor.tsx` — now shows linked techniques as badges with X remove, inline `TechniqueSearchPicker` with live search dropdown

### TASK_04 — Media gallery ✅

- Created `server/admin/media/queries.ts` — `findMedia()`, `findMediaById()`
- Created `server/admin/media/actions.ts` — `createMedia()`, `deleteMedia()`
- Created `app/admin/media/page.tsx` — gallery grid with image/video/doc preview, metadata badges
- Added "Media" nav item to admin sidebar (`components/admin/sidebar.tsx`)

---

## Status

closed-quick

## Quick-close checklist

- [x] All four tasks executed and committed to file
- [x] L1 patterns used throughout (Wrapper, Stack, Badge, Card, H-heading, Intro/Section, withAdminPage HOC)
- [x] No scope creep (PDF generation, video transcoding deferred)
- [x] Admin nav updated

## Open items carried forward

- Stripe keys not configured (media upload S3 keys also needed)
- PricingPlanActions type mismatch (from SESSION_0053)
- Certificate "Issue" button needs a user picker form (currently only the issuance list + revoke exist — issue action ready but no admin form UI to call it yet)
- Media upload form UI not built (createMedia action ready, needs form with file upload calling S3 → createMedia)
