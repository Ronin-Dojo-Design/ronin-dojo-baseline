---
title: "SESSION 0417 — BBL reveal-prep: member photos + emails + registration (cloud sweep) + x-brand collapse"
slug: session-0417
type: session--open
status: closed
created: 2026-06-19
updated: 2026-06-19
last_agent: claude-session-0417
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0416.md
  - docs/petey-plan-0417.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0417 — BBL reveal-prep: member photos + emails + registration + x-brand collapse

## Date

2026-06-19

## Operator

Brian + claude-session-0417

## Goal

Plan + dispatch three parallel cloud feature lanes toward BBL reveal — (A) member photo
upload/crop to R2→Passport, (B) beautiful claim/invite emails + admin email tooling, (C) the
registration modal polished + deepened to monorepo parity — and merge them onto a single green
`main` by close, wired to `blackbeltlegacy.com` and functional for all users + admin. This session
authors `petey-plan-0417.md` (cloud-agent checklist + the three detailed cloud prompts), does the
carried x-brand fallback-page collapse inline, and consolidates the cloud PRs as they return.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0416.md` (closed). Also read the cloud-sweep precedent
  set: `docs/runbooks/component-launch-sweep-recipe.md` (the canonical recipe the parallel cloud
  sweeps replay), `docs/prune-roadmap.md` (the #119/#120/#121 prompt-set format),
  `docs/runbooks/porting/react-to-next-component-porting-runbook.md` (the port quality bar).
- Carryover: 0416 consolidated the 4 prune streams onto a green `main` and rebuilt + promoted the BBL
  landing to home `/` (gate untouched). 0416's "Next session" = operator review of the prod landing
  (done — operator verified behind the bob-tony cookie in incognito) + x-brand fallback-page collapse.
  This session does the x-brand collapse inline and adds the three reveal-prep feature lanes.

### Branch and worktree

- Branch: `main` (local == origin/main at bow-in)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean.
- Current HEAD at bow-in: `e4a1f19f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Media/Storage (avatar→R2), Auth (registration/claim), Theming (email + form brand tokens), Prisma (possible new fields for promo-registration / email tooling) |
| Extension or replacement | Extension: reuses existing seams — `applyWebMediaUpload`/`applyPassportAvatarPromotion` (media), `lib/notifications` + `emails/*` + `app/app/email` (email), `join-legacy-form` + safe-actions (registration). Adds crop UX, beautiful copy, admin composer, and promo fields on top. |
| Why justified | The plumbing exists and works; the gap is member-facing UX + admin tooling + copy quality for reveal. |
| Risk if bypassed | Re-implementing media/email/form data layers a second time (the Prisma-in-browser + sender-rep traps that already bit us). |

Live docs checked during planning: Media, Storage, Theming, Prisma (via the sweep recipe + apply-media/notifications source).

### Graphify check

- Graph status: current; stats at bow-in: 13218 nodes, 25754 edges, 1782 communities, 2058 files.
- Queries used:
  - `cloud component sweep port quality match original`
  - `cloud component sweep session cloud agent prompts roadmap`
- Files selected from graph: `docs/runbooks/component-launch-sweep-recipe.md`,
  `docs/runbooks/porting/react-to-next-component-porting-runbook.md`, `docs/prune-roadmap.md`,
  `docs/runbooks/dev-environment/{codex-cloud-bbl-waves-2-4,claude-mobile-runbook}.md`.
- Verification note: opened each directly; Graphify used as navigation, not proof.

### Grill outcome

7 forks resolved (full record in `docs/petey-plan-0417.md` §Decisions):

1. **Execution model** — operator dispatches the 3 lanes as parallel cloud agents; Petey writes
   self-contained prompts, keeps the session alive to consolidate (cherry-pick onto a local branch,
   green-per-stream), one push at close.
2. **x-brand collapse** — Petey does it inline this session (carried 0416 default task; mechanical;
   local cycles available while cloud runs).
3. **Photos surface** — avatar uploader in BOTH the claim/join wizard AND the profile editor; reuse
   `applyWebMediaUpload` → `applyPassportAvatarPromotion`; square crop + belt-framed preview
   (`Rank.colorHex`).
4. **Emails scope** — copy rewrite (claim + invite + welcome: warm, reassuring "your old info is
   safe", step-by-step aligned to the onboarding wizard) **and** port the admin composer / catalog /
   capture tooling onto the existing `app/app/email` surface. Stub the Resend seam in tests.
5. **Registration depth** — polish **and** pull in promo UX/fields from `BBLRegisterFormPromo.jsx`
   (deeper than presentation-only; may add profile fields).
6. **Migrations** — ON the table for the cloud prompts. Prefer wiring existing seams; if a lane needs
   schema, it edits `schema.prisma` + documents it, but does NOT create a `migrations/` dir or run
   migrate. Petey cuts ONE consolidated migration locally at merge and applies it to Neon once.
7. **Single-brand destination** — breaking Baseline/WEKAF/RDD is fine; collapse to BBL freely.

## Petey plan

> Full plan, cloud-agent checklist, and the three detailed cloud prompts live in
> [`docs/petey-plan-0417.md`](../petey-plan-0417.md). Summary below.

### Goal

Land member-photos + emails + registration (3 parallel cloud lanes) + the x-brand collapse on a
single green `main`, wired to `blackbeltlegacy.com` and functional for users + admin, by close.

### Tasks

#### SESSION_0417_TASK_01 — Author petey-plan-0417.md + cloud prompts

- **Agent:** Petey
- **What:** The plan doc with the cloud-agent checklist + 3 self-contained cloud prompts (Lane A
  photos, Lane B emails, Lane C registration) + agent assignment + handoff sequence + PR tracker.
- **Done means:** `docs/petey-plan-0417.md` exists; the operator can copy each prompt into a fresh
  cloud agent.
- **Depends on:** nothing

#### SESSION_0417_TASK_02 — x-brand fallback-page collapse (inline)

- **Agent:** Petey/Cody (inline)
- **What:** Collapse `disciplines`, `programs/*`, `organizations/new` (+ any other x-brand
  non-BBL-fallback pages) to BBL so they stop resolving to a wrong default now the header's gone.
- **Done means:** the pages render BBL behind the preview cookie; typecheck + `next build` green.
- **Depends on:** nothing

#### SESSION_0417_TASK_03 — Lane A: member photo upload/crop (cloud)

- **Agent:** Cody (cloud) → Desi review → Doug verify
- **What:** Port `PhotoUploader` + `ImageCropper` + `BeltPhotoPreview` (BBLApp) onto
  `applyWebMediaUpload` → `applyPassportAvatarPromotion`; surface in claim/join wizard + profile
  editor. Square crop, belt-framed preview.
- **Done means:** a member can upload + crop + save an avatar to R2 + their Passport from both
  surfaces; build green; PR open.
- **Depends on:** TASK_01

#### SESSION_0417_TASK_04 — Lane B: emails copy + admin tooling (cloud)

- **Agent:** Cody (cloud) → Desi review → Doug verify
- **What:** Rewrite claim/invite/welcome copy (reassuring, step-by-step, onboarding-aligned); port
  `InviteEmailComposer` + `EmailCatalogBrowser` + `EmailCaptureList` onto the existing
  `app/app/email` surface. Stub Resend in tests.
- **Done means:** beautiful emails render in the preview server; admin can browse catalog, see
  captures, and compose/send an invite; build green; PR open.
- **Depends on:** TASK_01

#### SESSION_0417_TASK_05 — Lane C: registration modal polish + promo (cloud)

- **Agent:** Cody (cloud) → Desi review → Doug verify
- **What:** Polish `join-legacy-form` 3-step wizard for mobile parity with `BBLRegisterForm.jsx` +
  pull in promo UX/fields from `BBLRegisterFormPromo.jsx`. Keep the safe-action data layer; add
  fields to `schema.prisma` (documented) if promo fields require them.
- **Done means:** the wizard is mobile-polished + promo-complete; submits via the existing action;
  build green; PR open.
- **Depends on:** TASK_01

#### SESSION_0417_TASK_06 — Consolidate + migration + push (Petey/Doug/Giddy)

- **Agent:** Petey (consolidate) → Doug (functional verify) → Giddy (hostile gate)
- **What:** Cherry-pick each returned cloud PR onto a local `consolidate` branch, green per stream;
  reconcile `schema.prisma` and cut ONE migration; apply to Neon; live-DOM/real-world verify
  (R2 upload, email send, mobile registration); ff `main` + one push; close PRs.
- **Done means:** all lanes on green `main`; functional for users + admin; deployed.
- **Depends on:** TASK_02..05

### Parallelism

Lanes A/B/C run in parallel as cloud agents on **disjoint file sets** (media vs email vs
registration). The x-brand collapse (TASK_02) runs locally in parallel. Collision risk is confined
to `schema.prisma` — handled by the "agents edit schema, Petey cuts one migration at merge" rule.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey | Planning + prompt authorship is the orchestrator's job. |
| TASK_02 | Petey/Cody inline | Mechanical brand collapse; no cloud overhead warranted. |
| TASK_03 | Cody (cloud) | Component port + media wiring. |
| TASK_04 | Cody (cloud) | Component port + email copy + admin tooling. |
| TASK_05 | Cody (cloud) | Form port + promo UX. |
| TASK_03–05 review | Desi | Cross-brand visual consistency + monorepo parity on each returned PR. |
| TASK_06 | Petey → Doug → Giddy | Consolidate → functional verify → hostile close gate. |

### Open decisions

- None at plan-lock. (Promo-registration fields that need schema are resolved by the "document in
  schema.prisma; Petey cuts one migration" rule.)

### Risks

- **Parallel `schema.prisma` edits** — mitigated by the single-migration-at-merge rule.
- **Sender reputation** — tests must stub Resend (open fix: unit tests send real Resend emails).
- **Prisma-in-browser** — any client chrome pulling `lib/media`/Prisma breaks the Turbopack build;
  resolve server-side, pass strings down (the `getCurrentUserAvatar` seam).
- **Cloud bootstrap** — fresh checkout needs a throwaway `DATABASE_URL` + `SKIP_ENV_VALIDATION=1`
  before `bun install`; `next build` is the authoritative typecheck (not bare `tsc`).

### Scope guard

- Don't regress the 0416 landing / countdown gate / the SESSION_0414 roster query.
- Don't re-implement the media/email/form data layers — wire the existing seams.
- One push at close. FS-0024 git guard before mutating git. Operator confirms each merge.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0417_TASK_01 | landed | Authored `docs/petey-plan-0417.md` (cloud checklist + 3 prompts + handoff). |
| SESSION_0417_TASK_02 | landed | x-brand fallback-page collapse: 10 pages / 14 sites swapped `(headers().get("x-brand") ?? Brand.X)` → `await getRequestBrand()` (always BBL); removed dead `headers`/`Brand` imports. typecheck + oxlint + oxfmt green; full `next build` at consolidation. |
| SESSION_0417_TASK_03 | landed | Lane A — member photo upload/crop consolidated (squash `ddffc5a1`); `react-easy-crop` installed. |
| SESSION_0417_TASK_04 | landed | Lane B — emails + admin composer consolidated (PR #122 → `221e8803`). |
| SESSION_0417_TASK_05 | landed | Lane C — registration wizard refactor + promo intake (operator's Codex patch → `d2cd9655`); `httpUrlSchema` Continue-crash fixed; no migration (promo fields → lead meta). |
| SESSION_0417_TASK_06 | landed | Consolidated A/B/C + launch polish; **reveal parked** on branch `reveal/gate-cut` (holding page kept); pushed to `main` (`71b3ba7f`). No migration needed. |
| SESSION_0417_TASK_07 | landed | Launch polish: hide curriculum/techniques/blog/about/organizations/trees links; BBL favicon; email logo/sender/contact → blackbeltlegacy.com; mobile register-modal x-overflow + 16px inputs; FREE→success modal / PAID→Stripe. |
| SESSION_0417_TASK_08 | landed | Prod Vercel env corrected (BETTER_AUTH_URL, RESEND_SENDER_EMAIL[_BBL], AUTH_GOOGLE_ID/SECRET → BBL). Bob preview email sent to operator. |
| SESSION_0417_TASK_09 | handed off | Self-serve free-account + magic-link claim + comp-gift → cloud prompt `docs/petey-plan-0418-free-account-claim.md`. |

## What landed

All three cloud lanes consolidated onto `main` + a large launch-polish pass, with the **countdown
holding page deliberately KEPT** (public still gated; the reveal commit is parked on branch
`reveal/gate-cut` for when launch is called). Bob & Tony review the live site via the preview link
`https://blackbeltlegacy.com/preview?token=bob-tony-BBL-preview`.

- **Lanes A/B/C** consolidated (member photos, transactional emails + admin composer, registration
  wizard refactor + promo intake). No migration (promo fields persist into lead `notes`/`meta`).
- **Continue-button crash fixed** — `httpUrlSchema` refine ran `new URL("")` on empty optional URL
  fields and threw, aborting validation; guarded with try/catch (wizard schema + public-actions).
- **Launch polish:** hid not-ready links (curriculum / techniques / blog / about / organizations /
  directory "Lineage Trees" toggle) across nav-sheet / footer / directory / search; BBL circle
  favicon; emails switched to the BBL wrapper + logo/sender/contact all → `blackbeltlegacy.com`;
  mobile register-modal x-overflow clipped + 16px inputs (iOS no-zoom) + step-indicator truncate;
  FREE submit → in-place success modal, PAID → Stripe checkout (no more sign-in bounce/loop).
- **Prod env corrected via Vercel CLI** (the BBL deploy was running Baseline values): `BETTER_AUTH_URL`,
  `RESEND_SENDER_EMAIL`, `RESEND_SENDER_EMAIL_BBL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` → BBL.
- **Bob preview email** sent to the operator (`ronindojodesign@gmail.com`) for review; Bob's addresses
  pending operator OK.
- **Cloud handoff:** self-serve free-account + magic-link claim + comp-gift spec →
  `docs/petey-plan-0418-free-account-claim.md` (the machinery already exists; just needs wiring).

Pushed commits: `ddffc5a1` (A) · `221e8803` (B) · `d2cd9655` (C) · `0aeb5ba4` (email/nav/contact) ·
`71b3ba7f` (mobile + success-state). Reveal parked: `reveal/gate-cut` (`5b150086`, unpushed/local).

## Decisions resolved

<!-- See Grill outcome above + petey-plan-0417.md §Decisions. -->

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0417.md` | This session ledger. |
| `docs/petey-plan-0417.md` | Cloud-agent plan + 3 prompts. |

## Verification

| Command / smoke | Result |
| --- | --- |
| TBD | TBD |

## Open decisions / blockers

None at plan-lock.

## Next session

### Goal

Land the self-serve **free-account + magic-link claim + comp-gift** flow (cloud build), then call the
public reveal (un-park `reveal/gate-cut`) once Bob/Tony sign off.

### First task

Hand `docs/petey-plan-0418-free-account-claim.md` to a cloud agent (wire `createJoinLegacyInterest`
to the existing `mintClaimMagicLink` + `notifyMemberOfBblClaimYourProfile` + `acceptLineageClaimByToken`
→ `finalizeLineageNodeClaim` comp-grant path; de-dupe placeholder Passports; stub Resend in tests).

### Operator-side, still open (not code)

- **Google OAuth:** confirm the `783677341288` client lists `https://blackbeltlegacy.com/api/auth/callback/google`
  (redirect URI) + `https://blackbeltlegacy.com` (JS origin). Rotate the secret pasted in chat.
- **Resend DKIM:** add the `resend._domainkey` TXT record in Bluehost DNS, verify in Resend.
- **Bob preview:** OK the review email → send to `sbjjitsu30@gmail.com` + `bobbassjjitsu30@gmail.com`
  (`/tmp/send-bob-preview.mjs <addr>`).
- After Bob signs off: un-park `reveal/gate-cut` to drop the holding page.

## Review log

<!-- Filled at bow-out. -->

## Hostile close review

<!-- Filled at bow-out. -->

## ADR / ubiquitous-language check

<!-- Filled at bow-out. -->

## Reflections

<!-- Filled at bow-out. -->
