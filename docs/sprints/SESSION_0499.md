---
title: "SESSION 0499 — Scene hero images live + storyboard uploader (kill the URL field)"
slug: session-0499
type: session--implement
status: in-progress
created: 2026-07-05
updated: 2026-07-05
last_agent: claude-session-0499
sprint: S49
pairs_with:

  - docs/sprints/SESSION_0498.md
  - docs/architecture/decisions/0044-lineage-story-scene-and-preview-gating.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0499 — Scene hero images live + storyboard uploader (kill the URL field)

## Date

2026-07-05

## Operator

Brian + claude-session-0499

## Goal

Operator-directed continuation of the Epic A bring-up (same conversation as 0498's close): (1) put the
REAL founder portraits on the live scenes — done via prod data (landing assets); (2) replace the
storyboard's `heroImageUrl` **URL text field** with the repo's canonical image-uploader flow — the
operator's standing demand: **image inputs are uploaders, never URL fields** (the repo has ONE uploader
family, `components/web/uploader/*`, with 3 consumer surfaces; the storyboard should be the 4th).

## Bow-in

- Continuation session (operator mid-conversation directive after 0498 closed/merged/deployed).
- Branch: `session-0499-scene-hero-uploader` off `main` (`bdae9c41`), canonical checkout.
- Prod state at open: operator had already created his own scene (enabled) AND flipped all 4 founders
  live via the storyboard — the Epic A bring-up steps 2–3 are effectively DONE by the operator.

## Petey plan

### Tasks

#### SESSION_0499_TASK_01 — Founder hero images on prod (DONE, data-only)

- **Agent:** inline (orchestrator), operator-directed prod write
- **What:** NULL-guarded `updateMany` set `heroImageUrl` on Sr / Jr / Rigan scenes to the landing-page
  portraits (`/brand/blackbeltlegacy/{carlos-gracie-sr,carlos-gracie-jr,rigan-machado}.jpg` —
  site-relative, the exact assets `bbl-landing-content.ts:265-279` uses). Rorion: no portrait exists
  (A5 ffmpeg poster-frame from the operator's April-10 clip) — monogram stays. Never clobbers curated
  values (guard: `heroImageUrl: null`).
- **Done means:** live-verified — all 3 portraits rendering in `/directory/tony-hua` SSR. ✅

#### SESSION_0499_TASK_02 — Storyboard hero-image uploader (the code fix)

- **Agent:** Cody
- **What:** replace the scene editor's `heroImageUrl` URL `Input` with an upload flow **reusing the
  canonical uploader family** + the existing admin media seam (R2; `canUploadMedia`/`can("media.manage")`
  gate — repo has 4 authz systems + ONE media upload path; extend, never fork). Upload → returned URL →
  same `heroImageUrl` schema field (no migration). Preview thumb + replace/clear. Video/poster stay URL
  fields until A5 (no video upload path exists — flagged 0498).
- **Done means:** an admin uploads a hero image from the storyboard dialog without ever seeing a URL
  field; gates green; loop-reviewed.

### Scope guard

- NO new bespoke uploader component — extend the one family (design doctrine: one primitive × variants).
- NO video upload this session (A5).
- Prod data writes = TASK_01 only (already executed, operator-directed).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0499_TASK_01 | landed | 3 founder heroes set on prod (NULL-guarded); live-verified in SSR. Rorion = monogram (no portrait; A5). |
| SESSION_0499_TASK_02 | landed | Preset cropper system + `ImageFieldUploader` — the scene editor's hero URL field is DEAD. Reused: the `uploadMedia` seam (3rd consumer; existing authz pins stay authoritative), lazy `ImageCropper` (extended `presets`/`defaultPreset`/`maxOutputPx`; defaults keep avatars pixel-identical), `ButtonGroup` chip row, the blog post-form upload idiom. New: `crop-presets.ts` registry (circle/square/wide-16:9/tall-4:5/triangle/star/free), `lib/shape-mask.ts` display-mask tokens (export = rectangle ALWAYS; shapes = display-time clip-path), shared `validateImageFile` guard (+3 tests → suite 1098). Live 12-step Playwright round-trip on :3499 (verification worktree — see findings for WHY): 3-chip preset row, preset switching, upload → `lineage/story-scenes/{uuid}.webp` (73KB — the `maxOutputPx` cap keeps crops under the 512KB seam ceiling), save, board thumb, public SSR + render on `/directory/tony-hua`, Remove → cleared (Rigan scene restored byte-identical to pre-test). A11y fix en route: `Label htmlFor` on the trigger button shadowed its visible name (WCAG 2.5.3) — label detached, `id` prop dropped from the variant. |

## Findings routed

- **WL-P2-28 (to log at close):** A1 storyboard shipped `heroImageUrl`/`heroVideoUrl`/`posterUrl` as URL
  text fields despite the canonical uploader family existing with 3 consumers — FS-0001-class reuse miss
  that survived 5 reviews + Doug (nobody checked the *input affordance* against the component inventory).
- **Memory (operator feedback, to save at close):** image inputs = the canonical uploader, never URL
  fields — standing preference, applies to every future media field.
- **Drift (to route at close): local `.env` S3 endpoint is dead.** `apps/web/.env` has
  `S3_ENDPOINT="http://localhost:3000"` / `S3_PUBLIC_URL="http://localhost:3000/ronindojo-dev"` — the
  runbook (`local-dev-auth-storage.md` §1) says MinIO on **:9000**; :3000 is the Next server itself, so
  every local media upload fails with an XML-deserialization error (the S3 SDK parsing Next's HTML 404).
  Docker daemon (MinIO host) was also down. TASK_02 verification therefore ran in a detached worktree
  (`176aa68d`) with a corrected private `.env` + a session-local S3 shim on :9100 — the operator's
  checkout, `.env`, and running :3000 dev server were untouched. Fix = restore the runbook values +
  `docker compose up -d minio minio-init` (operator's call).
- **Uploader family had ZERO inventory rows** (only a passing mention on `EvidencePhotoInput`) — the
  documentation gap behind WL-P2-28. Fixed: `custom-component-inventory.md` gained an Uploader-family
  section with the image-inputs-are-uploaders law.

## Pre-flight: ImageFieldUploader (+ cropper aspect variant) — SESSION_0499_TASK_02

### 1. Existing component scan

- Searched `components/web/` for: uploader, upload, cropper, photo, image field
- Searched `components/common/` for: input, label, hint, note, button, stack
- Found: the canonical uploader family `components/web/uploader/` (`AvatarUploader` in `index.tsx`,
  `cropper.tsx`, `use-photo-upload.ts`, `belt-preview.tsx`, `types.ts`); `MediaUploader`
  (`app/app/media/_components/media-uploader.tsx` — no crop, creates a `Media` row);
  **`post-form.tsx` hero-image field** (`app/app/blog/_components/` — `uploadMedia` → URL into one
  form field; the closest precedent, but crop-less and it keeps a URL input);
  `content-media-panel.tsx` (same `uploadMedia` consumer); `EvidencePhotoInput` (guest public action —
  wrong seam). Common primitives: Button/Input/Label/Hint/Note/Stack.

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes (no uploader primitive in L1
  beyond the post-form imageUrl pattern `post-form.tsx` descends from)
- Closest L1 pattern: Dirstarter blog post-form `imageUrl` + `uploadMedia` action (already localized
  as `apps/web/app/app/blog/_components/post-form.tsx`)
- **Primitive API spot-check:** `Button (variant: primary|secondary|ghost|destructive, size: sm|md,
  isPending, prefix/suffix)`, `Label (htmlFor, isRequired)`, `Hint (ComponentProps<"p">, red — form
  hint)`, `Note (ComponentProps<"p">, muted)`, `ImageCropper (imageSrc, onCropComplete(File),
  onCancel, title?, accentColor? — aspect HARD-WIRED 1, cropShape "round", output avatar.webp)`.

### 3. Composition decision

- [x] Extending existing component: the uploader family — `cropper.tsx` gains `aspect` /
  `cropShape` / `maxOutputPx` props (defaults preserve avatar behavior exactly); the family gains a
  **field variant** `image-field-uploader.tsx` (pick → crop → `uploadMedia` → URL into one form
  field) composing the SAME lazy cropper + the canonical media seam the way its 2 existing consumers
  do (`useAction(uploadMedia)` — post-form, content-media-panel).
- NOT widening `use-photo-upload.ts`: its FI-010a contract is `{ file }`-only avatar actions;
  `uploadMedia` takes `{ file, path }` — direct `useAction` is the established `uploadMedia`
  consumer pattern.
- Seam decision: reuse `uploadMedia` (`server/web/actions/media.ts`, `mediaUploadActionClient` =
  auth + `can("media.manage")` OR `canUploadMedia` — WL-P2-19; byte-sniff `sniffUploadBuffer`; 512KB
  ceiling `createFileSchema`). No action changes → existing adversarial authz tests
  (`media.safe-action.test.ts`) stay authoritative. Upload key =
  `lineage/story-scenes/${randomUUID()}` per upload (admin-library uuid idiom — avoids the blog
  `posts/new` shared-key clobber and the edit-overwrite "cancel didn't cancel" wart;
  `uploadToS3Storage` appends the sniffed extension + `?v=` cache-buster).
- Crop aspect (operator mid-session directive: cropper IS in play): **4:5** (the tighter mobile
  constraint; desktop 16:10 is handled by CSS object-cover), `cropShape="rect"`,
  `maxOutputPx=1600` — the 512KB seam ceiling rejects full-res 4:5 webp@0.9 crops, so the canvas
  downscales the long edge to 1600px (~2x retina of the rendered hero).

### 4. Lane docs loaded

- [x] SESSION_0499 spec + scope guard; SESSION_0498 task log (how A1 shipped) read
- [x] Wiki: `custom-component-inventory.md` §Lineage Journey (SESSION_0498) + §MediaUploader +
  §EvidencePhotoInput rows
- [x] Runbook: N/A (no schema/backend change)

### 5. Dev environment confirmed

- Dev server: `npx next dev --turbo -p 3499` from `apps/web/`
- Working directory: `apps/web/`
- Brand/host for testing: localhost:3499 (dev-login admin)
- Verification: `bun run typecheck`, `bun run lint` (fixer), `bunx oxfmt --check .`, `bun run test`
  (= `--parallel=1`, never bare multi-file `bun test`)

### 6. FAILED_STEPS check

- Prior failures in this area: the FS-0001-class reuse miss is THIS session's finding (WL-P2-28 —
  A1 shipped URL fields past 5 reviews); FS-0027 (bare `bun test`); FS-0028 (gate claim ↔ commit SHA)
- Mitigation acknowledged: yes — this task consumes the family instead of rebuilding; `bun run test`
  only; gates re-run at the final commit SHA.

## What landed

## Open decisions / blockers

- Rorion portrait: operator to supply an image OR the A5 ffmpeg poster-frame plan.

## Next session

TBD at close.
