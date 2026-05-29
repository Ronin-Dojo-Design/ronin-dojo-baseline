---
title: "Petey Plan 0287 — BBL assets → S3 + media-upload CRUD (multi-session epic)"
slug: petey-plan-0287
type: plan
status: in-progress
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0287
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0287.md
  - docs/sprints/petey-plan-0291.md
  - docs/runbooks/aws-s3-operator-runbook.md
  - docs/runbooks/local-dev-auth-storage.md
  - docs/runbooks/white-label-site-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0287 — BBL assets → S3 + media-upload CRUD

## Context

This lane was deferred from SESSION_0285 and re-confirmed at SESSION_0286 bow-out.
A bow-in inventory (SESSION_0287, Graphify + direct source read) found the lane is
**already substantially built — not greenfield** — so the "GAP 1: no Media model
(CRITICAL)" framing in `PETEY_PLAN_S2_SCHEMA_PASS4.md` is **stale**:

- `Media` + `MediaAttachment` models exist (Wave D, SESSION_0026).
- Storage service `apps/web/services/s3.ts` (AWS SDK v3, `forcePathStyle: true`).
- **Storage backend decision already made + documented**: MinIO (docker-compose)
  for local dev; AWS S3 + CloudFront for staging/prod. See
  `local-dev-auth-storage.md` and `aws-s3-operator-runbook.md`. Public assets
  resolve via `NEXT_PUBLIC_MEDIA_BASE_URL` (blank locally → serves `apps/web/public`).

- Upload path: `lib/media.ts:uploadToS3Storage()`, web `server/web/actions/media.ts`
  (`uploadMedia`/`fetchMedia`), `hooks/use-media-action.ts`, `components/common/form-media.tsx`.
- Admin CRUD: `server/admin/media/{queries,actions}.ts`, `app/admin/media/page.tsx`.
- Entitlement gate `canUploadMedia()` exists.

### Disconnect found (the real backlog)

1. **Upload never persists a `Media` row.** `uploadMedia` (web) pushes a buffer to
   S3 and returns a URL string only; the admin `createMedia` action that *does*
   create a `Media` row takes a manually-pasted URL. The two halves never meet.
2. **`deleteMedia` orphaned S3 objects** — deleted the DB row only.
3. **`MediaType` enum drift** — admin action used `AUDIO` (invalid) and lacked
   `YOUTUBE` (schema is `IMAGE|VIDEO|YOUTUBE|DOCUMENT`).
4. **Admin gallery was read-only** — no upload/delete UI.
5. **Web `uploadMedia`/`fetchMedia` are public + ungated** — they use the base
   `actionClient` (no auth, no `canUploadMedia` check). Security review needed.
6. **`MediaAttachment`** has 8 FK columns but only 3 wired Prisma relations
   (technique, contentAtom, certificateTemplate); the rest are id-only.
7. **BBL brand assets are not per-brand** — single shared `public/logo.png`,
   `favicon.png`, `opengraph.png`; `brandConfigs` is text-only; logo symbol is a
   hardcoded SVG; `resolvePublicMediaUrl()` exists but is applied only to
   merch/gear images, not logo/favicon/OG.

## Goal

Make media a tracked, branded, end-to-end CRUD system: every upload produces a
`Media` record, deletes clean up S3, and each brand (BBL first) serves its own
logo / favicon / OG image from S3 — extending the Dirstarter storage primitives,
not replacing them.

---

## Thread 1 — Media-upload CRUD improvement

### TASK_01 — Slice 1: upload persists Media + delete cleans S3 + enum fix + admin UI ✅ DONE (SESSION_0287)

- **Agent:** Cody
- **What:** Close the upload↔Media disconnect; make the admin gallery a working CRUD surface.
- **Done means:** `uploadMediaToLibrary` admin action (S3 upload + `Media.create`
  with mimeType/sizeBytes/brand/uploader); `deleteMedia` best-effort `removeS3File`
  via new `getS3KeyFromUrl()`; enum → `IMAGE|VIDEO|YOUTUBE|DOCUMENT`; admin upload
  button + per-card delete; `lib/media.test.ts` (6 cases). typecheck/biome/test green.

- **Depends on:** nothing.

### TASK_02 — Slice 2: harden web upload auth (security) ✅ DONE (SESSION_0288)

- **Agent:** Cody (+ Doug security review)
- **What:** `uploadMedia`/`fetchMedia` move from public `actionClient` to an
  authenticated client and enforce `canUploadMedia(user.id, brand)`.

- **Done means:** unauthenticated/ungated callers are rejected; `form-media.tsx`
  consumers still work for authorized users; safe-action test proves the gate.

- **Depends on:** confirm intended exposure (Open decision D1).
- **Outcome:** Added `mediaUploadActionClient` (auth + `canUploadMedia` gate) to
  `lib/safe-actions.ts`; both web actions now use it. New
  `server/web/actions/media.safe-action.test.ts` (5 cases: unauth + unentitled
  rejection for both actions, entitled upload success). D1 resolved → **tighten**
  (the `/me` UI already gated on `canUploadMedia`; the server just never enforced
  it). typecheck/biome/test green.

### TASK_03 — Slice 3: MediaAttachment attach/detach CRUD ✅ DONE (SESSION_0289)

- **Agent:** Cody
- **What:** Server actions to attach/detach a `Media` to an entity (passport,
  technique, org, event, etc.) with `purpose` + `sortOrder`; decide id-only vs
  wired Prisma relation for the 5 currently-bare FK columns.

- **Done means:** attach/detach actions + queries + a consuming surface (e.g.
  technique gallery or org gallery), tests.

- **Depends on:** TASK_01.

### TASK_04 — Slice 4: upload metadata enrichment

- **Agent:** Cody
- **What:** Capture `widthPx`/`heightPx` (image probe) and `durationSec` +
  `thumbnailUrl` (video) on upload; support `YOUTUBE` media (URL-only, no S3).
- **Done means:** uploaded image/video rows carry dimensions; YouTube add path works.
- **Depends on:** TASK_01.

---

## Thread 2 — BBL assets → S3

### TASK_05 — Slice A: per-brand asset fields in brandConfigs

- **Agent:** Cody
- **What:** Extend `brandConfigs` in `config/site.ts` with `logoSrc`, `faviconSrc`,
  `ogImageSrc` (relative paths under a per-brand convention, e.g.
  `/images/brands/<slug>/...`).
- **Done means:** `getBrandSiteConfig(brand)` returns per-brand asset paths;
  Baseline keeps current defaults.

- **Depends on:** Open decision D2 (path convention).

### TASK_06 — Slice B: route logo/favicon/OG through resolvePublicMediaUrl

- **Agent:** Cody
- **What:** `app/layout.tsx` favicon, `app/api/og/route.tsx` favicon fallback, and
  `components/web/ui/logo.tsx` / `logo-symbol.tsx` resolve the brand asset via
  `resolvePublicMediaUrl()` so they serve from S3/CloudFront in prod, `public` in dev.
- **Done means:** with `NEXT_PUBLIC_MEDIA_BASE_URL` set, BBL pages emit BBL asset
  URLs; blank → local `/public`. Brand-aware logo image (not just name text).

- **Depends on:** TASK_05.

### TASK_07 — Slice C: produce BBL asset files

- **Agent:** Brandon (assets) + Cody (placement)
- **What:** Obtain/produce BBL logo, wordmark, favicon, OG image; place under the
  per-brand path.

- **Done means:** real BBL asset files committed (or in S3) at the convention path.
- **Depends on:** TASK_05.

### TASK_08 — Slice D: provision per-brand assets in the real S3 bucket (operator)

- **Agent:** Operator (Brian) — agent-assisted
- **What:** `aws s3 sync` the per-brand asset paths into the prod/staging bucket;
  verify via `/admin/storage/monitoring`. Set `NEXT_PUBLIC_MEDIA_BASE_URL` for
  **Production + Preview** (FS-0023).

- **Done means:** BBL assets resolve through the media domain in a deploy preview;
  Storage Monitor shows `CONFIGURED`, 0 missing paths.

- **Depends on:** TASK_06, TASK_07. **Blocked on operator** (AWS secrets).

---

## This session's deliverable

**TASK_01 (Slice 1) only** — implemented + gates green. Everything else is staged
for follow-up sessions. Flip the white-label runbook "Favicon / logo / wordmark"
and "OG images" checklist rows when Thread 2 lands.

## Parallelism

- Thread 1 and Thread 2 are largely **disjoint file sets** (Thread 1 =
  `server/**/media`, `lib/media.ts`, `app/admin/media`; Thread 2 = `config/site.ts`,
  `app/layout.tsx`, `app/api/og`, `components/web/ui/logo*`). They can run in
  parallel across sessions / sub-agents.

- Within Thread 1, TASK_02 touches the web action auth and can run parallel to
  TASK_03/04. Slice 1 (TASK_01) is the shared foundation — done first.

## Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear execution; done this session |
| TASK_02 | Cody + Doug | Security-sensitive auth change |
| TASK_03 | Cody | CRUD extension |
| TASK_04 | Cody | Media metadata + YouTube |
| TASK_05–06 | Cody | Config + resolution wiring |
| TASK_07 | Brandon + Cody | Brand asset production |
| TASK_08 | Operator | AWS provisioning (secrets) |

## Open decisions

- **D1 — Web upload exposure.** Is `uploadMedia`/`fetchMedia` being public+ungated
  intentional (Dirstarter default) or a gap to tighten? (TASK_02 gate.)

- **D2 — Per-brand asset path convention.** `/images/brands/<slug>/...` in `public`
  (CDN-rewritten) vs distinct S3 keys per brand.
- **D3 — Media `key` column.** Add an explicit S3 `key` field to `Media` (avoids
  URL-parsing on delete) or keep `getS3KeyFromUrl()`? (Migration cost vs robustness.)

- **D4 — MediaAttachment relations.** Wire the 5 bare FK columns
  (passport/event/rankAward/course/organization) to real Prisma relations, or keep
  id-only polymorphic.

## Risks

- **Live Dirstarter docs not re-checked this session.** Per petey-plan rule 6,
  `dirstarter.com/docs/integrations/storage` + `/media` should be re-verified at
  Thread-2 implementation; `local-dev-auth-storage.md` is the current proxy and
  records alignment (S3_ENDPOINT, `forcePathStyle`, `uploadToS3Storage`).

- **AWS provisioning is operator-only** (secrets); new env vars must be scoped to
  Production **and** Preview (FS-0023) or t3-env validation fails preview builds.

- **Local S3 env is blank** → upload flows are not testable locally without MinIO
  (`docker compose up -d minio minio-init` + the 6 `S3_*` vars per `local-dev-auth-storage.md`).

## Scope guard

Adjacent work surfaced during execution (e.g. the public-upload security finding,
MediaAttachment relation gaps) goes into SESSION `Open decisions / blockers` and
the tasks above — **not** inline into Slice 1.

## Dirstarter implementation template

- **Docs read first:** `local-dev-auth-storage.md` + `aws-s3-operator-runbook.md`
  (proxies for `dirstarter.com/docs/integrations/storage` + `/media`, checked
  2026-05-29). Live re-check scheduled for Thread-2 implementation.
- **Baseline pattern to extend:** `uploadToS3Storage` (S3 primitive),
  `resolvePublicMediaUrl` (CDN rewrite), `services/s3.ts` (`forcePathStyle`),
  next-safe-action clients in `lib/safe-actions.ts`.

- **Custom delta:** persist a `Media` record per upload (our Wave-D model);
  per-brand asset resolution on top of the shared CDN-rewrite layer.

- **No-bypass proof:** Slice 1 builds on `uploadToS3Storage` + the `Media` model;
  it does not introduce a parallel storage client or bypass the upload primitive.

## Next steps

1. (Done) Slice 1 lands SESSION_0287.
2. Pick the next slice at SESSION_0288 bow-in — recommend **TASK_02 (security gate)**
   given launch exposure, or **TASK_05/06** if the RDD/BBL demo asset polish is the
   priority.

**Planned Passion Produces Purpose. OSSS.**
