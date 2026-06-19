# Petey Plan 0417 — BBL reveal-prep: photos · emails · registration (cloud sweep) + x-brand collapse

> **What this is.** The orchestration plan + three self-contained **cloud-agent prompts** for
> SESSION_0417. The operator dispatches the three lanes as parallel cloud agents (claude.ai/code or
> the cloud transport); Petey writes the prompts, does the x-brand collapse locally, then consolidates
> the returned PRs onto a single green `main` with **one push at close**. Pairs with
> [`SESSION_0417.md`](sprints/SESSION_0417.md).
>
> **Quality bar for every port** = `react-to-next-component-porting-runbook.md`
> ("**porting is translation with proof**") × `component-launch-sweep-recipe.md` (decompose →
> brand-token → lazy → wire on-the-wire → verify) × this doc's standing context. **Reuse the existing
> seam; do not re-implement the data layer.**

---

## Decisions (locked at the SESSION_0417 grill)

1. **Execution model** — operator dispatches 3 parallel cloud agents from these prompts; Petey
   consolidates (cherry-pick onto a local `consolidate` branch, green-per-stream), one push at close.
2. **x-brand collapse** — Petey does it inline this session (not a cloud lane).
3. **Photos** — avatar uploader in the **claim/join wizard AND the profile editor**; reuse
   `applyWebMediaUpload` → `applyPassportAvatarPromotion`; square crop + belt-framed preview.
4. **Emails** — **copy rewrite** (claim/invite/welcome: warm, reassuring "your old info is safe",
   step-by-step, onboarding-aligned) **AND** port the admin **composer/catalog/capture** tooling.
5. **Registration** — **polish + pull in promo UX/fields** from `BBLRegisterFormPromo.jsx` (deeper
   than presentation-only).
6. **Migrations** — **ON the table**. Prefer wiring existing seams; if a lane genuinely needs schema,
   it edits `schema.prisma` + documents the change in its PR body, but does **NOT** create a
   `prisma/migrations/` dir or run `migrate`. **Petey cuts ONE consolidated migration locally at merge
   and applies it to Neon once.** This is the single rule that lets the lanes run in parallel.
7. **Single brand** — breaking Baseline / WEKAF / RDD is fine; collapse to BBL freely.

---

## Standing context — paste into EVERY cloud lane

```
REPO: ronin-dojo-app (origin Ronin-Dojo-Design/ronin-dojo-baseline, becoming black-belt-legacy).
App lives in apps/web (Next.js + Prisma + Better Auth, bun workspace). It deploys to
blackbeltlegacy.com on push (bun build). The repo is being pruned to BBL-only — Baseline/WEKAF/RDD
DO NOT MATTER; break or delete them freely. Single brand, single repo is the destination.

PUBLIC SITE IS COUNTDOWN-GATED: BBL_COUNTDOWN=1 shows a teaser; the FULL site is behind the
/preview?token=bob-tony-BBL-preview cookie. Do NOT touch the gate (app/(web)/layout.tsx early-return,
bbl-countdown, bbl-teaser). Your work ships behind the preview cookie.

GATES (must stay green): `npx next build` (the AUTHORITATIVE typecheck — see bootstrap) and the unit
suite. Run oxfmt/oxlint FROM apps/web (config is discovered from CWD): `cd apps/web && bun run format`.

CLOUD BOOTSTRAP (do this FIRST in a fresh checkout, in order):
  export DATABASE_URL='postgresql://u:p@localhost:5432/db?schema=public'   # throwaway, never connected
  export SKIP_ENV_VALIDATION=1
  bun install            # postinstall runs `prisma generate`; it THROWS without DATABASE_URL set
  bun run db:generate    # materialize ~/.generated/prisma so tsc/next build can typecheck
  # A bare `npx tsc --noEmit` floods with false `Cannot find name 'PageProps'` in a never-built
  # checkout (Next generates route-type globals into .next/types only during build). The REAL gate is
  # `npx next build`: it prints "✓ Compiled successfully" + "Finished TypeScript" BEFORE failing at
  # "Collecting page data" (P1001 no DB) — that compile+typecheck IS your proof. For fast iteration
  # scope tsc to your own files: `npx tsc --noEmit 2>&1 | grep <your-path>` → expect 0.

VERIFY (DB-less is fine — §5b of the sweep recipe): `next build` compile + type + grep the emitted
chunks/CSS for your strings/tokens. If Docker IS available, `docker compose up -d postgres` + minio,
`bun run db:migrate deploy`, seed, `RESEND_API_KEY= npx next dev --turbo` for a live-DOM pass. NEVER
fake live-DOM evidence; state "live-DOM deferred to PR review" if no DB.

HARD RULES (these have bitten us — non-negotiable):
- PRISMA-IN-BROWSER: never import lib/media, resolveDisplayAvatar, services/s3, or anything pulling
  the Prisma client into a "use client" component — it breaks the Turbopack build (node:module).
  Resolve server-side, pass plain strings/props down (the getCurrentUserAvatar seam is the pattern).
  `next build` catches this; tsc/unit tests do NOT.
- SAFE-ACTIONS: no raw forms when the Form/FormField + next-safe-action pattern exists; no bypass.
- BRAND TOKENS: colors from BrandSettings DB (CSS vars), belt color = Rank.colorHex DATA (via
  BeltSwatch) — never hardcode hex/belt palettes; type = --font-bbl-heading/--font-bbl-body (use the
  var() FALLBACK idiom `var(--font-bbl-heading,var(--font-display))` so off-BBL degrades cleanly).
- REUSE PRIMITIVES: Button/Input/Card/Stack/Badge/Dialog/Drawer from components/common — do not
  re-create them from the monorepo JSX.
- TESTS: bun:test + REAL Postgres (never mock Prisma); STUB the Resend/email seam in tests (live
  sends bounce + hurt the newly-DKIM'd BBL sender reputation). Mock next/headers, next/cache, ~/lib/auth.
- SCHEMA: prefer wiring existing seams. If you NEED new schema, edit prisma/schema.prisma AND list
  exactly what you added in your PR body, but DO NOT create prisma/migrations/* or run migrate —
  the integrator cuts one consolidated migration at merge.
- DO NOT REGRESS: the 0416 landing/home `/`, the countdown gate, or the SESSION_0414 directory roster
  (placeholder Passports linked by LineageTree membership — see server/web/directory/profile-where.ts).

DELIVERABLE: a focused PR (one lane) off main. PR body = what you built, the seams you reused, any
schema you added (NOT migrated), and your proof (build output + grep evidence + live-DOM or "deferred").
```

---

## Ordering & collision map

- **All three lanes run in parallel** — disjoint file sets: Lane A = `media` + the two surfaces,
  Lane B = `emails` + `app/app/email` + `server/admin/email`, Lane C = `lineage/join` + register form.
- **Only collision = `prisma/schema.prisma`** (Lane C promo fields, possibly Lane B email tooling).
  Resolved by Decision 6 (agents edit schema, integrator cuts one migration). Each lane MUST keep its
  schema additions in a clearly-commented block so the merge is mechanical.
- The **x-brand collapse** (Petey, local) is fully disjoint and rides the same consolidation push.

---

## CLOUD PROMPT — Lane A: member photo upload + crop → R2 → Passport

```
TASK: Bring beautiful member avatar upload to BBL. Members must be able to choose a photo, crop it,
preview it belt-framed, and save it — to Cloudflare R2 and onto their Passport — from BOTH the
claim/join wizard and their profile editor.

PORT THESE (BBLApp, in the SIBLING repo ../ronin-dojo-monorepo — read for UX/behavior, do NOT copy
JSX verbatim; translate to our primitives + seams):
  src/brands/blackbeltlegacy/components/PhotoUploader.jsx        (the upload flow; has a .test.jsx — read it for behavior parity)
  src/brands/blackbeltlegacy/components/ImageCropper.jsx         (re-exports src/brands/shared/components/ImageCropper — read the SHARED one)
  src/brands/blackbeltlegacy/components/BeltPhotoPreview.jsx     (belt-framed avatar preview)

REUSE THESE EXISTING SEAMS (apps/web — DO NOT re-implement the upload/storage layer):
  server/web/media/apply-media.ts   → applyWebMediaUpload (creates a MediaAttachment in R2),
                                       applyPassportAvatarPromotion (promotes an attachment to Passport.avatarUrl)
  server/web/actions/media.ts       → the safe-action wrappers (wire the client to THESE, not raw fetch)
  hooks/use-media-action.ts         → the client upload hook
  components/common/form-media.tsx, components/common/avatar.tsx
  services/s3.ts                    → R2 client (BBL bucket; keys preserve exact case — D-025)
  lib/media.ts resolveDisplayAvatar (BBL gi default fallback) — SERVER ONLY; never import into "use client"
  Passport.avatarUrl already exists (schema.prisma) — NO migration needed for the avatar itself.

SURFACES TO WIRE:
  1. Claim/join wizard: app/(web)/lineage/join/join-legacy-form.tsx — add an avatar step/field.
  2. Profile editor:    app/app/profile/page.tsx + _components — add an "edit avatar" control.
  Both call the same ported uploader → applyWebMediaUpload → applyPassportAvatarPromotion.

REQUIREMENTS:
  - Square crop (avatars render square/circle across the app); belt-framed preview tinted by the
    member's Rank.colorHex via the existing BeltSwatch/rank data (NEVER hardcode belt colors).
  - Decompose to a folder module (uploader/ : index.tsx orchestrator + cropper + belt-preview +
    use-photo-upload.ts + types). Lazy-load the cropper (it's heavy + below-fold of the trigger).
  - The cropper is the ONLY new client dep allowed if the shared one needs a library (check what
    src/brands/shared/components/ImageCropper uses — likely react-easy-crop or react-image-crop;
    add the lightest one to apps/web/package.json and note it in the PR).
  - Client component does NOT import lib/media/Prisma — resolve the current avatar server-side and
    pass it as a prop (the getCurrentUserAvatar pattern in server/web/account/current-user-avatar.ts).

DONE MEANS:
  - From BOTH surfaces a member can pick → crop → preview → save; the image lands in R2 and
    Passport.avatarUrl updates; the new avatar shows in the header/nav + directory.
  - `next build` green; colocated bun:test for the upload hook (real Postgres, stub S3 if needed);
    grep evidence of the lazy cropper chunk. Live-DOM screenshot if a DB is reachable, else deferred.
PR BODY: seams reused, any new dep, proof.
```

---

## CLOUD PROMPT — Lane B: beautiful claim/invite/welcome emails + admin email tooling

```
TASK: Make BBL's transactional emails beautiful and reassuring for NON-TECHNICAL members, and give
admins the tooling to browse, preview, compose and send them. Two halves: (1) email COPY rewrite,
(2) admin tooling port.

HALF 1 — COPY (rewrite, don't rebuild the send pipeline — it works):
  Files (apps/web/emails — built on @react-email + the BBL design system emails/components/bbl-wrapper.tsx):
    emails/bbl-claim-your-profile.tsx   (claim — read it; it's decent, make it warm + step-by-step)
    emails/invite-notification.tsx      (invite)
    emails/membership-welcome.tsx       (welcome after claim/join)
    emails/bbl-join-legacy-confirmation.tsx (join confirmation)
  Voice + content goals (CRITICAL — these are old-school martial artists, not tech users):
    - Reassure that their OLD information is SAFE and was carried over faithfully; nothing was lost.
    - A clear, numbered STEP-BY-STEP of exactly how to claim/finish their account, mirroring the
      onboarding wizard steps (so the email and the wizard tell the same story).
    - Warm, founder-to-founder, lineage-proud tone; the comp gift framed as a thank-you.
    - Big obvious button + a paste-able fallback link; works on mobile mail clients.
  Keep the existing magic-link/claim-URL props + the send functions in lib/notifications.ts
  (notifyMemberOfBblClaimYourProfile, notifyUserOfInvite, notifyMemberOfMembershipWelcome) intact —
  you are changing the TEMPLATE bodies, not the wiring.

HALF 2 — ADMIN TOOLING (port onto the EXISTING surface, extend don't replace):
  Existing app surface: app/app/email/page.tsx + _components/{bbl-email-catalog-panel,bbl-email-capture-list}.tsx
    backed by server/admin/email/{catalog.tsx (getBblEmailTemplatePreviews), queries.ts}.
  Port these BBLApp admin components (../ronin-dojo-monorepo, translate to our primitives + safe-actions):
    src/brands/blackbeltlegacy/components/admin/EmailCatalogBrowser.jsx  (has a .test.jsx) → richer catalog browse/preview
    src/brands/blackbeltlegacy/components/admin/EmailCaptureList.jsx      → richer capture list (BblEmailCapture model already exists)
    src/brands/blackbeltlegacy/components/admin/InviteEmailComposer.jsx   → the NET-NEW piece: compose + send an invite from the UI
  The composer SENDS via a new next-safe-action wrapping notifyUserOfInvite / the BBL claim sender —
  admin-authorized only (reuse the admin action/authorization pattern). NO raw email send from the client.

SCHEMA: if the composer needs to persist composed/sent emails (a SentEmail/EmailTemplate model), add
it to prisma/schema.prisma + document it in the PR — DO NOT create a migration dir.

DONE MEANS:
  - The 4 emails render beautifully in the preview server (`cd apps/web && bun run email`) — warm,
    reassuring, step-by-step, mobile-safe; screenshot each.
  - Admin can: browse the catalog + preview any template, see recent captures, and compose+send a
    BBL invite (to a test address) from app/app/email.
  - Tests STUB the Resend seam (no live sends). `next build` green.
PR BODY: copy changes summary, seams reused, any schema added (not migrated), proof.
```

---

## CLOUD PROMPT — Lane C: registration modal — mobile polish + promo parity

```
TASK: Bring the BBL join/registration experience up to monorepo parity — mobile-polished and with the
richer promo UX/fields — WITHOUT re-implementing the submit pipeline.

CURRENT STATE (apps/web): app/(web)/lineage/join/join-legacy-form.tsx is a 3-step wizard
(StepProgress + per-step validation) that submits via the safe-action createJoinLegacyInterest
(~/server/web/lead/public-actions). join-legacy-landing.tsx composes it; (home)/bbl-join-landing.tsx
promotes it to `/`. KEEP the action + data flow.

REFERENCE THESE (../ronin-dojo-monorepo — for UX/fields/flow; translate to our Form/FormField +
safe-actions + components/common primitives, do NOT copy JSX):
  src/brands/blackbeltlegacy/components/auth/BBLRegisterForm.jsx       (59KB — the full mobile-polished register UX)
  src/brands/blackbeltlegacy/components/auth/BBLRegisterFormPromo.jsx  (46KB — promo framing + extra fields to pull in)
  src/brands/blackbeltlegacy/components/profile/*                       (profile field patterns)
  src/brands/blackbeltlegacy/components/admin/settings/BBLSchoolProfileForm.jsx (school-profile fields, if school step is in scope)
  src/brands/blackbeltlegacy/components/admin/RegistrationFormToggle.jsx (admin: open/close registration — port the toggle onto an admin setting if not present)

REQUIREMENTS:
  - MOBILE FIRST: touch targets, step transitions, sticky/visible CTA, keyboard/scroll behavior,
    error/validation feedback — match BBLRegisterForm.jsx on a phone viewport.
  - Pull in the promo UX + any extra profile fields from BBLRegisterFormPromo.jsx that fit the BBL
    claim/join story. If a new field needs storage, add it to prisma/schema.prisma + document it in
    the PR (NO migration dir) and extend the createJoinLegacyInterest input/schema accordingly.
  - Decompose the wizard to a folder module (steps as files + a use-join-wizard hook). Reuse the repo
    StepProgress + Form/FormField; brand type via the var() fallback idiom.
  - Portaled Dialog/Select escape the brand-font scope — thread the brand font class to portal content.

DONE MEANS:
  - The wizard is visibly mobile-polished + promo-complete; every step validates; submit still hits
    createJoinLegacyInterest (extended if you added fields); the success path works.
  - `next build` green; colocated tests for new validation; live-DOM mobile screenshots if a DB is
    reachable, else "deferred to PR review".
PR BODY: what changed, fields added (not migrated), seams reused, mobile proof.
```

---

## Agent assignments & handoff sequence

| Phase | Owner | Action |
| --- | --- | --- |
| 0. Plan | **Petey** | This doc + SESSION_0417. Lock decisions. |
| 1. Dispatch | **Operator** | Paste each cloud prompt (+ standing context) into a fresh cloud Cody agent. 3 in parallel. |
| 1'. Local lane | **Petey/Cody** | x-brand fallback-page collapse, locally, in parallel with the cloud lanes. |
| 2. Build | **Cody (cloud ×3)** | Each lane builds its PR off `main`, proves with `next build` + grep + (deferred) live-DOM. |
| 3. Design review | **Desi** | On each returned PR: cross-brand visual consistency + monorepo parity + empty-state/mobile review → prioritized fix list (Cody applies). |
| 4. Consolidate | **Petey** | Cherry-pick each PR onto a local `consolidate` branch, green-per-stream; reconcile `schema.prisma`; cut ONE migration; apply to Neon. |
| 5. Functional verify | **Doug** | Real-world proof: live R2 avatar upload; real claim/invite email send (test addr); mobile registration submit. For users AND admin. |
| 6. Hostile close gate | **Giddy** | Gates green (build + tests + format); no Prisma-in-browser leak; gate untouched; honest verification. |
| 7. Push | **Petey** | FS-0024 git guard → ff `main` → one push → close PRs → bow-out. (Operator confirms each merge per explicit-push-authorization.) |

---

## Cloud PR tracker (fill as PRs return)

| Lane | PR / branch | CI | Schema added? | Desi review | Doug verify | Consolidated |
| --- | --- | --- | --- | --- | --- | --- |
| A — photos | _pending_ | — | — | — | — | — |
| B — emails | _pending_ | — | — | — | — | — |
| C — registration | _pending_ | — | — | — | — | — |
| x-brand (local) | n/a (inline) | — | n/a | — | — | — |

---

## Consolidation & review playbook (Petey — run per returned PR)

> Mirrors the SESSION_0416 pattern: replay each PR onto a local `consolidate` branch, gate green per
> stream, then ff `main` + ONE push at close. Do NOT merge via GitHub (preserves one-push cadence).

### Per-PR intake (in order)

1. **Fetch + cherry-pick** onto a local branch off current `main`:
   `git fetch origin <lane-branch>` → on `consolidate`, `git cherry-pick` the lane's commits (or
   `git merge --squash origin/<branch>` for a single clean commit). Resolve conflicts (only expected in
   `prisma/schema.prisma` — see schema step).
2. **Bootstrap if needed** then **gate**: `cd apps/web && bun run typecheck && bunx oxlint <files> &&
   bun run format:check`, then `npx next build` (authoritative — catches Prisma-in-browser + SSR).
3. **Desi parity review** (checklist below) → fix-list applied before the stream is called green.
4. **Tests**: `bun test` for the touched area; confirm the Resend seam is stubbed (no live sends).
5. Mark the row in the **Cloud PR tracker** green; move to the next PR.

### Schema → ONE migration (do AFTER all three are cherry-picked)

1. Reconcile the merged `prisma/schema.prisma` (each lane kept its additions in a commented block).
2. `cd apps/web && bun run db:generate` then generate ONE migration:
   `bunx prisma migrate dev --name session_0417_photos_emails_registration` (local Postgres.app).
   Review the SQL — it must be the union of all lanes' additions, nothing destructive to BBL data.
3. Apply to Neon at deploy (prod is migrate-only on push — D-024). Rotate creds per the standing notes.

### Desi parity checklist (per lane — vs the monorepo original + cross-surface consistency)

- **Lane A (photos):** crop is square; belt-frame uses `Rank.colorHex` (no hardcoded belt palette);
  uploader reuses `components/common` primitives (not monorepo JSX); avatar updates header/nav +
  directory after save; works on a phone viewport; empty/no-photo state is graceful.
- **Lane B (emails):** all four templates render on mobile mail; copy reassures "old info is safe" +
  has numbered claim steps matching the wizard; uses the `bbl-wrapper` design system (brand tokens, no
  hardcoded hex); admin composer/catalog/capture match BBLApp UX + reuse our admin table/primitives.
- **Lane C (registration):** mobile parity with `BBLRegisterForm.jsx` (touch targets, sticky CTA, step
  transitions, validation feedback); promo fields fit the BBL story; portaled Dialog/Select carry the
  brand font; reuses `StepProgress` + Form/FormField (no raw form).

### Doug functional verify (before push — "functional for users AND admin")

- **Photos:** real upload from claim wizard AND profile editor → image in R2 + `Passport.avatarUrl` set.
- **Emails:** send a real claim + invite to a test address (test/non-prod); admin can compose+send.
- **Registration:** complete the wizard on a mobile viewport → `createJoinLegacyInterest` succeeds.

### Giddy hostile gate (close)

Gates green (typecheck + `next build` + tests + format); no client Prisma leak; countdown gate
untouched (early-return precedes new renders); one consolidated migration reviewed; honest evidence.

## Cross-references

- [SESSION_0417](sprints/SESSION_0417.md) — this session's ledger.
- [Component Launch Sweep Recipe](runbooks/component-launch-sweep-recipe.md) — the per-component quality bar + bootstrap gotchas.
- [React→Next Component Porting Runbook](runbooks/porting/react-to-next-component-porting-runbook.md) — classify → inventory → translate → proof.
- [prune-roadmap.md](prune-roadmap.md) — the prompt-set format this models (#119/#120/#121).
- [SESSION_0416](sprints/SESSION_0416.md) — the consolidation pattern (cherry-pick → green-per-stream → one push).
