---
title: "SESSION 0499 — Scene hero images live + storyboard uploader (kill the URL field)"
slug: session-0499
type: session--implement
status: closed
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
| SESSION_0499_TASK_03 | landed — Desi 9.6 within combined SHIP | Timeline polish (operator, mid-session): (1) kill the ~3× name redundancy per scene card — figcaption attribution dup dies (Desi 0498 P3), echo chip goes avatar-only, ONE prominent name per card; (2) the H→V beat becomes SUBSTANTIAL — the display name itself rotates vertical and lands as the card's LEFT-EDGE SPINE (replaces the unnoticed tiny-marker rotate). The broader 2-axis carousel = pinned FI-020, NOT this slice. |
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

7 commits on `session-0499-scene-hero-uploader` (squash-merged via PR — see Git hygiene):

- **TASK_01 (prod data):** founder portraits live on the public story (Sr/Jr/Rigan; NULL-guarded; landing assets). Rorion = monogram (no portrait; A5).
- **TASK_02 `cda8543a`:** preset cropper system (registry: circle/square/wide/tall/triangle/star/free; aspect-vs-mask two layers, rectangle exports, `lib/shape-mask.ts` display tokens) + `ImageFieldUploader` (pick→crop→upload via the ONE `uploadMedia` seam) — **the hero URL field is dead** (operator law: image inputs = uploaders). Avatar consumers pixel-identical.
- **TASK_03 `cd944256`:** timeline polish — ONE name per card (figcaption dead, chip avatar-only) + the **name-spine H→V beat** (headline rotates −90° mid-viewport, parks as the card's left-edge spine; measured both viewports). Marker static.
- **Desi pass `658ee606`:** Escape-in-cropper data-loss P1 + accent var + dialog field order + 5 P3s.
- **Fallow loop `f09587fd`:** `useClaimEscape` (Suspense-window Escape gap — genuinely simulated), crop-failure toast, `RankByline`/`AncestryAvatar` clone-kill, dialog/save + `ImageFieldUploader` decomposition. Delta: clones 1→0, dead 5→2 (pre-existing), 4 CRAP targets→clean.
- **`1a2adf75`:** `mediaUrl` schema — root-relative paths accepted (founder-scene saves 400'd on prod), http(s)-only absolute (blocks `javascript:` — old `z.string().url()` accepted it).
- **`5ffef7be`:** code-quality pass — matrix scores uploader **9.3** / story motion **9.4** (pre-fix 8.9 caps cleared: inventory rows + JETTY headers).

Reviews: Desi 8.9/9.6 → fixes → combined SHIP; 3 finders + Doug-verifier (10/13 refuted); matrix formal run (closes 0498 deferral). Suite **1103/0**; headless 10/10 + 12-step round-trip.

## Review log

### Code-quality score — Uploader family additions (code-quality-matrix)

Unit: `components/web/uploader/{crop-presets,image-field-uploader,use-image-field-upload,use-claim-escape,validation}` + `lib/shape-mask.ts` (+ extended `cropper.tsx`). Formal matrix run at `1a2adf75` + this pass's doc fixes.

**Class:** A — extends the Dirstarter media/storage L1 via the untouched `uploadMedia` seam (§3).

| Dim | Score | Note |
| --- | ---: | --- |
| D1 Correctness | 9.5 | 12-step live Playwright round-trip on :3499 (upload→uuid key→save→board thumb→public SSR→Remove→restore byte-identical); avatar consumers pixel-identical by defaults; pick-guard test-pinned; objectURL revoked exactly once; canvas failures surfaced |
| D2 Security | 9 | seam untouched — adversarial authz pins authoritative; client validate documented UX-only, server sniff + 512KB ceiling authoritative; uuid keys; `mediaUrl` now blocks `javascript:`/`//host` — but the root-relative refine misses `/\`-and-whitespace protocol-relative smuggles (named follow-up; writers are `lineage.manage`-privileged) |
| D3 Simplicity | 9 | fallow clone-groups 0; preset registry = data not branches; hook/markup split; named debt: ImageCropper cognitive 132 (accepted-with-reason — JSX-branch-rich) + raw overlay-not-Dialog (exit path named) |
| D4 Readability | 9.5 | docblocks carry the why + trade-offs (orphaned-R2, Escape dual-mount); JETTY `@added/@why/@wired` added this pass on all 7 new files |
| D5 Maintainability | 9.5 | units 26–208 LOC; one shared validation source; fallow health 89.8 good; 0 new dead code |
| D6 Scalability | 9.5 | lazy cropper chunk; draw-time downscale (73KB measured vs 512KB ceiling); no server/hot-path work |
| D7 Convention/reuse | 9.5 | textbook extend-don't-bypass (seam's 3rd consumer; defaults keep avatars identical); pre-flight on file; family + hook inventory rows complete after this pass |

**Weighted average:** 9.3 · **Cap applied:** none (pre-fix: 8.9 uninventoried-primitive cap — `useClaimEscape`/`useImageFieldUpload` rows added) · **Composite: 9.3 / 10**
**Apple/Facebook verdict:** Strong — a senior reviewer approves: it extends the platform seam instead of forking it; the one shortcut (raw overlay, not `Dialog`) is named with its exit path.
**Top fixes (follow-ups):** (1) tighten `mediaUrl` root-relative refine against `\`/whitespace smuggles (D2, behavior change → out of this loop); (2) rebuild the crop overlay on `Dialog` (retires `useClaimEscape`).

### Code-quality score — Lineage-story motion post-polish (code-quality-matrix)

Unit: `lineage-story/lineage-story-scene.tsx` + `lineage-ancestry-entry.tsx` + `scene-model.ts`. Closes SESSION_0498's deferred formal matrix run.

**Class:** B — custom, reference = ADR 0044 + `custom-component-inventory` + scene-model token law (§3).

| Dim | Score | Note |
| --- | ---: | --- |
| D1 Correctness | 9.5 | Desi 9.6 on measured motion evidence (spine park/glyph sizes + chip window re-measured both viewports, probes on file); SSR/no-JS ships content visible at progress 0; hooks before early-return; public DOM regression-checked byte-identical |
| D2 Security | 9.5 | public RSC read path, minimal projection (ADR 0044 §D4); `ancestryStorySceneSelect` export narrowed in-file this branch; enabled-only + PUBLIC-chain keying test-pinned; user copy rendered as text nodes |
| D3 Simplicity | 9 | ONE `SceneShell` × token sets (palette branching only in `scene-model`); `RankByline`/`AncestryAvatar` dup-kill (clone-groups 0); named debt: `LineageStoryScene` cognitive 132 accepted-with-reason (motion + JSX-branch-rich; geometry stays with the JSX it animates — defensible, no §4 cap exists for complexity) |
| D4 Readability | 9.5 | every magic number carries its measured rationale (NAME_BEAT, chip position vs sticky chrome, spine geometry derivation written out); JETTY tags added to the new `lineage-ancestry-entry.tsx` |
| D5 Maintainability | 9.5 | pure model split (no React — server + tests consume); typed token contract with per-field docs; one-way sibling dependency documented; palette law + gate test-pinned |
| D6 Scalability | 9 | transform/opacity-only, deterministic scroll map; per-frame `offset*` reads documented reflow-safe but `spineTarget` runs 3× per frame (micro follow-up); chain length bounded by lineage depth |
| D7 Convention/reuse | 9.5 | L1 primitives (Avatar/Badge/H5/Stack); belt = `Rank.colorHex` data; red = token never hex (test-pinned); inventory rows updated for the polish + the missing atoms row added this pass |

**Weighted average:** 9.4 · **Cap applied:** none (pre-fix: 8.9 uninventoried-primitive cap — `lineage-ancestry-entry.tsx` row added) · **Composite: 9.4 / 10**
**Apple/Facebook verdict:** Strong — ship-quality motion code: deterministic, compositor-only, every constant carries its measurement; the one oversized component is a defended trade.
**Top fixes (follow-ups):** (1) memo `spineTarget` per frame if scenes multiply (D6, micro); (2) revisit the cognitive-132 acceptance only if the component grows.

Gates at the fix commit: typecheck 0 · lint clean-on-touched · format:check clean · `bun run test` 1103/0 · wiki-lint 0 errors. Fixes were docs/comments only (inventory rows, JETTY headers, this log) — headless re-verify not required; no behavior surface touched.

## Open decisions / blockers

- Rorion portrait: operator to supply an image OR the A5 ffmpeg poster-frame plan.

## Next session

### Goal

Unchanged from SESSION_0498's staged pick: **FI-001 (Brian Truelson, board P0)** — Epic A prod bring-up is
now fully DONE (operator flipped scenes live; portraits shipped; the mediaUrl save-fix deploys with this
merge). Operator-held alternatives: the quality menu (authz conformance sweep · WL-P2-22 · apparatus
lean-out — all banked, operator picks).

### First task

Confirm this deploy green + founder-scene saves work on prod (the 400 fix), then open FI-001 per
`petey-plan-0419` §Task 1 + `petey-plan-0457` §Slice A2.

## Hostile close review

- **Giddy-equivalent:** covered by the matrix run (`5ffef7be` agent): Class A/B verdicts 9.3/9.4, caps
  honestly applied then cleared, reuse-first proven (seam's consumer, not a fork). Pass.
- **Doug-equivalent:** verifier pass (10/13 finder candidates refuted with mechanism-level evidence;
  survivors fixed + genuinely simulated) + gates 1103/0 ×2 + `next build` green pre-push. Pass.
- **Desi:** 8.9/9.6 → fix pass → combined SHIP; name-spine "answers the operator's complaint with
  measured evidence." Pass.
- **Kaizen aggregate:** 9.4/10 — operator-driven session; every complaint became a measured fix; the
  fallow loop caught a live prod bug (mediaUrl 400) that five reviews missed because it lived in
  data-shape, not code-shape.

## ADR / ubiquitous-language check

- ADR update **not required** — no architectural decision changed; ADR 0044 conformed-to throughout
  (view minimalism §D4 upheld; preset system extends the family per ADR 0040 one-primitive×variants).
  The crop-preset registry + shape-mask doctrine are documented in the component inventory (their canon
  home for UI patterns).
- Ubiquitous language: no new domain terms ("preset", "spine" = UI vocabulary, inventoried).

## Reflections

- The operator's "why do I have to ask?" is the sharpest review the storyboard got — five agent reviews
  checked the data contract and none checked the input affordance. The inventory gap (uploader family had
  ZERO rows) was the enabler: you can't reuse-check against an inventory that doesn't list the thing.
  Fixed structurally (family inventoried + the law + WL-P2-28 checklist lesson).
- The fallow loop's live round-trip caught what static review couldn't: seeded data (root-relative paths)
  violating a zod shape (`url()`) = every founder-scene save 400ing on prod. Data-shape bugs need
  data-shaped verification. Bonus: the fix closed a real `javascript:` URL acceptance.
- Verification-driven refutation is cheap and high-value: 10 of 13 plausible-sounding finder candidates
  died against actual reachability (always-cropped uploads, effect-gated callbacks, spec-guaranteed
  callbacks). Confirm-before-fix saved a day of phantom fixes.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | 3 rows, all landed |
| Gates | typecheck 0 · lint clean-touched · format:check 1793 files · `bun run test` 1103/0 (×2) · `next build` green pre-push (§4a cost gate) |
| Wiki lint | 0 errors at close commit |
| Reviews | Desi (combined SHIP) + verifier (10/13 refuted) + matrix 9.3/9.4 — in Review log |
| Ledger routing | WL-P2-28 (✅fixed), D-041 (open, operator), FI-020 (pinned), chip task_e2143162 (mediaUrl edge), R2-orphan trade-off documented |
| Memory sweep | `image-inputs-are-uploaders-never-url-fields` saved mid-session + MEMORY.md indexed |
| Inventory | Uploader family section + atoms rows + JETTY on 7 new files (`5ffef7be`) |
| Git hygiene | single close commit + push on operator "Word."; PR squash-merge; branch deleted post-merge |
| Graphify | refreshed post-merge (count in bow-out chat) |
