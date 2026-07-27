---
title: "Lane Manifest: S041 — Content + Curriculum surfaces"
slug: lane-s041-content-curriculum
type: lane-manifest
status: ready
created: 2026-05-03
author: Petey
session_target: SESSION_0040
primary_lane: Content and curriculum
worktree: wt-core-platform
pairs_with:
  - docs/architecture/dirstarter-baseline-index.md
  - docs/protocols/WORKFLOW_5.0.md
---

## Lane Manifest: SESSION_0041 — Content + Curriculum Surfaces

## WORKFLOW 5.0 alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content collections (blog/posts), media upload (S3), admin CRUD |
| Extension or replacement | **Extension** — Dirstarter has blog posts + media upload; we add curriculum, techniques, certificates on top |
| Why justified | Baseline needs curriculum browsing + technique library for member value |
| Risk if bypassed | Content is a launch feature; no curriculum = no differentiation from generic scheduling apps |

## Deliverables (max 3)

1. Course + CurriculumItem CRUD (admin) — create/edit/reorder curriculum items within a course
2. Technique library (public) — browse/search techniques with media attachments
3. Certificate template admin — create templates, link to rank promotions

---

## Schema already exists (Wave D — landed SESSION_0026)

No migration needed. Models available:

- `Course`, `CurriculumItem`, `CourseEnrollment`, `CurriculumItemCompletion`
- `Technique`, `TechniquePrerequisite`, `TechniqueCurriculumLink`, `TechniqueProgress`
- `Media`, `MediaAttachment`
- `CertificateTemplate`, `CertificateOrder`, `CertificateIssuance`
- `ContentAtom`, `ContentVariant`, `ContentTask`, `ContentPublication`

---

## Recipe 1: Course + CurriculumItem admin CRUD

- **Pattern:** Dirstarter admin CRUD (same as Tools admin — baseline index §3)
- **Template files to read:**

| File | Why | Pattern to copy |
| --- | --- | --- |
| `server/admin/tools/actions.ts` | Canonical `adminActionClient` upsert/delete | Action shape with `after()` revalidation |
| `server/admin/tools/schema.ts` | Zod input schema per entity | Schema-per-slice |
| `server/admin/tools/queries.ts` | List + detail queries with Prisma includes | Query shape |
| `app/admin/tools/page.tsx` | Admin list page with data table | Page layout |
| `app/admin/tools/[slug]/page.tsx` | Admin detail/edit page | Detail layout |
| `components/admin/tools/` | Admin form + table components | Form pattern |

- **Delta from template:**
  - Entity: `Course` instead of `Tool`
  - Relations: Course → CurriculumItems (ordered list, `position` field)
  - Brand scoping: Add `where: { brand }` to all queries (L3 requirement)
  - No Stripe integration on this entity
  - Add drag-reorder for CurriculumItem position (or simple up/down arrows)

- **New files to create:**

```text
apps/web/server/admin/courses/
  ├── actions.ts     (upsert/delete course + curriculum items)
  ├── schema.ts      (Zod schemas)
  └── queries.ts     (list/detail with includes)

apps/web/app/admin/courses/
  ├── page.tsx       (list)
  ├── new/page.tsx   (create)
  └── [id]/page.tsx  (edit)
```

- **Depends on:** Schema (already exists), auth HOC (already exists)
- **Acceptance:** Admin can create a Course, add CurriculumItems, reorder them. Brand-scoped.

---

## Recipe 2: Technique library (public)

- **Pattern:** Dirstarter public tool listing (baseline index §1, §2)
- **Template files to read:**

| File | Why | Pattern to copy |
| --- | --- | --- |
| `app/(web)/tools/page.tsx` | Public listing page with filters | Page + metadata |
| `app/(web)/tools/[slug]/page.tsx` | Detail page with SEO | Detail layout |
| `components/web/tools/tool-card.tsx` | Card component | Card layout |
| `components/web/tools/tool-list.tsx` | Grid/list rendering | List wrapper |
| `server/web/tools/queries.ts` | Public queries with filters | Filter pattern |
| `lib/media.ts` | S3 image URL helpers | Media display |
| `services/s3.ts` | Upload service | If admin uploads technique videos |

- **Delta from template:**
  - Entity: `Technique` instead of `Tool`
  - Filters: by `TechniqueCategory`, `TechniquePosition`, discipline, rank level
  - Media: Techniques have video/image attachments via `MediaAttachment`
  - No submission flow (admin-only creation)
  - Brand scoping on queries

- **New files to create:**

```text
apps/web/app/(web)/techniques/
  ├── page.tsx           (list with filters)
  └── [slug]/page.tsx    (detail with media)

apps/web/components/web/techniques/
  ├── technique-card.tsx
  ├── technique-list.tsx
  └── technique-filters.tsx

apps/web/server/web/techniques/
  ├── queries.ts
  └── payloads.ts
```

- **Depends on:** Media model (exists), Technique model (exists)
- **Acceptance:** Public page lists techniques, filterable by category/position/discipline. Detail page shows embedded media.

---

## Recipe 3: Certificate template admin

- **Pattern:** Same as Recipe 1 (admin CRUD)
- **Template files to read:** Same as Recipe 1 (admin tools pattern)

- **Delta:**
  - Entity: `CertificateTemplate`
  - Fields: name, description, design template (HTML/image), delivery method, price
  - Relations: linked to Discipline + Rank (for auto-issue on promotion)
  - Simpler than courses — flat CRUD, no nested items

- **New files:**

```text
apps/web/server/admin/certificates/
  ├── actions.ts
  ├── schema.ts
  └── queries.ts

apps/web/app/admin/certificates/
  ├── page.tsx
  └── [id]/page.tsx
```

- **Acceptance:** Admin can create certificate templates, link to discipline/rank.

---

## Pre-flight checklist

- [ ] Read this manifest
- [ ] Confirm `Course`, `Technique`, `CertificateTemplate` models exist in schema (they do — Wave D)
- [ ] Read `server/admin/tools/actions.ts` for action pattern
- [ ] Read `app/(web)/tools/page.tsx` for public listing pattern
- [ ] Read `lib/media.ts` + `services/s3.ts` for media helpers

## Token budget estimate

| Read | Tokens |
| --- | --- |
| This manifest | ~1.5K |
| admin tools pattern (3 files) | ~2K |
| public tools pattern (2 files) | ~1.5K |
| media/s3 helpers | ~1K |
| **Total** | **~6K** |
