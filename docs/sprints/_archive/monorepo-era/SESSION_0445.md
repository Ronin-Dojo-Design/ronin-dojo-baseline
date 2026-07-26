---
title: "SESSION 0445 — Join-legacy funnel polish (7 findings) + comp tier gate + global join modal + Truelson (blocked)"
slug: session-0445
type: session--implement
status: closed
created: 2026-06-24
updated: 2026-06-25
last_agent: claude-session-0445
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0444.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0445 — Join-legacy funnel polish + comp tier gate + global join modal

## Date

2026-06-24

## Operator

Brian + claude-session-0445 (Petey)

## Goal

Polish the public claim / join-legacy funnel against the 6 findings from the operator's SESSION_0444
mobile walk-through (plus a 7th surfaced mid-session: the nav "Join" button), then complete Truelson
care once a `blackbeltlegacy.com`-authorized Resend key is in `.env.prod`.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0444.md`
- Carryover: 0444 merged PR #162, cut the prod lineage tree over to `rigan-machado-lineage`, proved the
  Chayce magic-link claim loop on prod, and captured 6 funnel-polish findings + the Truelson care task.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean; Current HEAD at bow-in: `ff99cb42`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Storage/media (R2 upload — new public evidence-upload action) |
| Extension or replacement | Extension: reuses `uploadToS3Storage` + the existing rate-limiter; adds a public (unauthenticated) entry point, distinct from the auth-gated `mediaUploadActionClient` |
| Why justified | The Join-the-Legacy intake is account-optional; a guest must attach a certificate photo before they have a Passport |
| Risk if bypassed | A public upload surface needs its own validation/rate-limit — handled inline (raster allowlist, content-sniff, IP rate-limit, byte ceiling) |

## Petey plan

### Goal

Land the funnel-polish findings (quick wins first), browser-verify each, run a fallow + code-review
quality pass, then bow out. Truelson care held on the BBL Resend key.

### Tasks

| ID | Title |
| --- | --- |
| SESSION_0445_TASK_01 | Quick wins — #2 Address, #5 BJJ-only ranks, #4 success-screen space |
| SESSION_0445_TASK_02 | Heavier — #1 comp tier gate, #3 guest evidence upload, #6 name-order data |
| SESSION_0445_TASK_03 | #7 (new) global join modal from nav |
| SESSION_0445_TASK_04 | fallow audit + code-review-fix loop (security/perf/DRY) |
| SESSION_0445_TASK_FINAL | Truelson care (operator-gated — BLOCKED on Resend key) |

### Scope guard

UI/data polish on the claim funnel. Explicit push authorization (operator memory) — build + verify,
wait for "go" before push/deploy/send/grant.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0445_TASK_01 | landed | #2 "City / region"→"Address"; #5 belt picker scoped to the BJJ/IBJJF ladder (was 4 cross-discipline systems → dup White/Orange/Blue/Purple); #4 no code bug (formatter-canonical space renders; likely mobile wrap). |
| SESSION_0445_TASK_02 | landed | #1 comp-claim tier gate (locked "Complimentary Elite" card; `membershipPath` stays FREE → no Stripe); #3 new guest evidence photo uploader (`EvidencePhotoInput` + public `uploadJoinLegacyEvidence`); #6 name-order DATA fix applied to prod + prodsnap. |
| SESSION_0445_TASK_03 | landed | #7 global join modal — nav "Join" pops the wizard in place (no page nav). Lazy chunk + signed-out-only options load. |
| SESSION_0445_TASK_04 | landed | fallow audit + 8-angle code review → fixed SVG XSS gap, server byte ceiling, stale-modal remount, lifted `isLifetimeComp` helper, shared `JoinLegacyDrawer`, extracted `CompTierCard`, cached `getJoinWizardOptions`. |
| SESSION_0445_TASK_FINAL | blocked | Truelson care — needs a `blackbeltlegacy.com`-authorized Resend key in `apps/web/.env.prod`. |

## What landed

- **#2 Address relabel** — `identity-step.tsx` field label "City / region" → "Address".
- **#5 BJJ-only belt ladder** — `getBeltRanks` now scopes to `rankSystem.discipline.code = "bjj"`
  (mirrors the claim picker). Root cause: it pulled **all** system-wide BELT systems across disciplines
  (IBJJF + 2× eskrima Doce Pares + Kajukenbo = 94 ranks) → same-name belts collided (White ×3, Orange ×2,
  Blue ×3, Purple ×2). Now a clean 31-rank IBJJF ladder, White→Red, no dupes (DB-verified).
- **#4 success-screen space** — **no code bug.** oxfmt's canonical form keeps `email</strong> for the
  next steps` on one line with a literal space, which React renders; any explicit `{" "}` token is
  reverted by the formatter. Almost certainly a mobile line-wrap artifact. Left unchanged; flagged for
  operator re-check on device.
- **#1 comp-claim tier gate** — for a "Claim this profile" arrival (`?node=`), the Free/Premium/Elite
  picker is replaced by a locked **`CompTierCard`** ("Complimentary Elite", lifetime for Dirty Dozen
  else first year). `membershipPath` stays at its FREE default under the hood so the server routes the
  comp claimant to the claim magic-link, **never Stripe**. Generic join (nav modal / `/lineage/join`
  with no node) still shows the normal picker; Premium/Elite still go to checkout.
- **#3 guest evidence photo upload** — `EvidencePhotoInput` (new) replaces the URL text field with a real
  photo uploader: pick → upload to R2 via the new **public, rate-limited `uploadJoinLegacyEvidence`**
  action → thumbnail. Photo-only (link cases live in the adjacent Website/Instagram fields). The avatar
  uploader/cropper didn't fit (round-square crop; auth-gated).
- **#6 name-order DATA fix** — French "NOM Prénom" import artifact (surname-first + uppercased).
  `fix-bbl-imported-name-order.ts` (explicit, idempotent, dry-run default) corrected `CULLET Eric`→
  **Eric Cullet**, `FRANCIS DELPECH`→**Francis Delpech**, `ROBERT MANSFIELD`→**Robert Mansfield** on
  **prod + prodsnap** (verified). 4 false positives excluded (`GM Steve Wolk` = title; 3 middle-initial
  names). The display helper is a clean passthrough — this was data, not code.
- **#7 global join modal** — nav "Join" (header + nav-sheet) now pops the wizard in place via a
  layout-mounted `JoinModalProvider` + `JoinCtaButton` (degrades to a `/lineage/join` link when the
  provider is absent). Wizard chunk lazy-loads on first open; options load only for signed-out visitors;
  remounts fresh each open.
- **Quality pass (TASK_04)** — fallow audit (mine clean; the CRITICAL findings are inherited) + an
  8-angle code review. Fixed: SVG stored-XSS gap (raster allowlist), server-side byte ceiling, stale
  reopened-modal success screen, the lifetime predicate lifted to one `isLifetimeComp()` helper (was in
  3 places), shared `JoinLegacyDrawer` (drawer dup), `CompTierCard` extraction, and `unstable_cache`'d
  `getJoinWizardOptions` (was 4 queries on every signed-out page).

## Decisions resolved

- **#1 tier gate** = lock to a "Complimentary Elite" card for claim-link arrivals; keep `membershipPath`
  FREE internally (operator-approved via the bow-in question). The comp card surfaces only on the
  `?node=` "Claim this profile" path — the email magic-link uses the separate `/lineage/claim/accept`
  one-click flow (unchanged).
- **#3** = build a real **guest-capable** uploader (operator chose this over URL-fallback); photo-only
  (operator: "just upload a picture not paste a link").
- **#6** = compile full list → fix **prod + prodsnap** (operator pre-authorized the prod write).
- **#7** = **full global modal** (operator chose over the quick navigate-and-open).
- **Rate-limiter IP weakness** (spoofable `x-forwarded-for` / shared fallback) = inherited shared infra
  (same limiter `captureBblEmail` uses) — out of scope for this diff; noted as a platform follow-up.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/lineage/join/join-legacy-wizard/identity-step.tsx` | #2 label → "Address" |
| `apps/web/server/web/onboarding/ranks.ts` | #5 scope `getBeltRanks` to BJJ discipline |
| `apps/web/app/(web)/lineage/join/join-legacy-wizard/path-step.tsx` | #1 comp branch → `<CompTierCard>` |
| `apps/web/app/(web)/lineage/join/join-legacy-wizard/comp-tier-card.tsx` | NEW — locked comp Elite card |
| `apps/web/app/(web)/lineage/join/join-legacy-wizard/index.tsx` | #1 derive compClaim/claimProfileName, pass to PathStep |
| `apps/web/app/(web)/lineage/join/page.tsx` | #1 compute `compIsLifetime` via `isLifetimeComp` |
| `apps/web/app/(web)/lineage/join/join-legacy-landing.tsx` | #1 thread `compIsLifetime`; use shared drawer |
| `apps/web/app/(web)/lineage/join/join-legacy-form.tsx` | #1 `compIsLifetime` prop passthrough |
| `apps/web/app/(web)/lineage/join/join-legacy-drawer.tsx` | NEW — shared join drawer chrome |
| `apps/web/app/(web)/lineage/join/join-legacy-wizard/evidence-photo-input.tsx` | NEW — #3 guest photo uploader |
| `apps/web/app/(web)/lineage/join/join-legacy-wizard/lineage-step.tsx` | #3 evidence URL field → `<EvidencePhotoInput>` |
| `apps/web/server/web/lead/public-actions.ts` | #3 NEW `uploadJoinLegacyEvidence` (raster allowlist + byte ceiling); `isLifetimeComp` |
| `apps/web/lib/rate-limiter.ts` | #3 new `evidence_upload` limiter (15/h/IP) |
| `apps/web/lib/lineage/dirty-dozen.ts` | NEW `isLifetimeComp()` helper (lifted from 3 copies) |
| `apps/web/app/(web)/_components/join-modal/join-modal-context.tsx` | NEW — #7 tiny context (no UI imports) |
| `apps/web/app/(web)/_components/join-modal/join-modal-provider.tsx` | NEW — #7 layout-mounted modal (lazy wizard) |
| `apps/web/app/(web)/_components/join-modal/join-cta-button.tsx` | NEW — #7 modal-or-link CTA |
| `apps/web/app/(web)/layout.tsx` | #7 mount provider; load options for signed-out only |
| `apps/web/components/web/header.tsx` | #7 Join CTAs → `<JoinCtaButton>` |
| `apps/web/components/web/nav/nav-sheet.tsx` | #7 Join CTAs → `<JoinCtaButton>` (close sheet first) |
| `apps/web/server/web/lineage/join-options.ts` | perf — `unstable_cache` (300s) |
| `apps/web/scripts/fix-bbl-imported-name-order.ts` | NEW — #6 idempotent data correction (applied) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | clean (0 errors) |
| `bun run lint:check` | clean (no warnings in touched files) |
| `bun run format:check` | all correct |
| `bun run wiki:lint` | 0 errors, 15 warnings (all pre-existing in other files) |
| `bun test` (schema + public-actions + onboarding safe-action) | 17 pass, 0 fail (email seam stubbed) |
| Headless browser (414px) — all 7 findings | 15/15 checks pass (comp card first-year + lifetime, Address, evidence upload, nav modal no-nav, BJJ ladder) |
| #5 belt ladder (DB) | clean 31-rank IBJJF ladder, no dupes |
| #6 name fix (prod + prodsnap) | `Eric Cullet` / `Francis Delpech` / `Robert Mansfield`; idempotent re-run confirmed |
| `next build` (local pre-push cost gate) | **green** (exit 0 — full prod build + routes + sitemap) before pushing |

## Open decisions / blockers

- **Truelson care** — BLOCKED ON USER: needs a `blackbeltlegacy.com`-authorized Resend key in
  `apps/web/.env.prod`. Preview-to-self → real send → lifetime-Elite grant, per 0444.
- **`next build` gate not run locally** (dev-server conflict) — runs on Vercel deploy.
- **#4** — operator to re-confirm on device; if still joined, restructure the copy to prevent the wrap.
- **Platform follow-up** — `getIP`/`x-forwarded-for` rate-limit is spoofable/shared (affects all public
  actions); a trusted-proxy IP resolution is a platform-level fix.

## Next session

### Goal

Complete Truelson care (once the BBL Resend key lands), then continue funnel/claim-flow polish.

### First task

`SESSION_0446_TASK_01` — Once `apps/web/.env.prod` holds a `blackbeltlegacy.com`-authorized Resend key:
preview-to-self dry run of Brian Truelson's thank-you/claim email (to `ronindojodesign@gmail.com`) →
operator approves → real send to Truelson → `--grant` lifetime Elite after he signs in. Use the one-shot
inline key pattern (never persist). See `scripts/send-bbl-truelson-thankyou.ts` + memory
`bbl-resend-key-and-dogfood-teardown`.

### Inputs to read

- This file; `docs/sprints/SESSION_0444.md` "Findings → next session"; memory
  `bbl-resend-key-and-dogfood-teardown`.

## Review log

### SESSION_0445_REVIEW_01 — funnel polish + global modal + quality pass

- **Reviewed tasks:** TASK_01–04.
- **Dirstarter docs check:** storage/media (R2) — extended via the existing `uploadToS3Storage` seam,
  new public entry point with its own validation; not a baseline replacement.
- **Verdict:** Clean. All 7 findings verified by a 15-check headless pass at mobile width; the comp gate
  is implemented at the right depth (server still routes FREE → claim magic-link, never Stripe). The
  self-review (8 angles) caught a real security gap (SVG stored-XSS on the new public upload) and a UX
  bug (stale reopened modal), both fixed; complexity findings are inherited, not introduced. #6 is the
  only prod write — applied reversibly (explicit, idempotent script) with operator authorization.
- **Score:** 8.5/10 (−1 `next build` not run locally; −0.5 the inherited rate-limiter IP weakness is now
  load-bearing for a public upload surface).
- **Follow-up:** Truelson (blocked); `next build` on deploy; #4 device re-check.

### Findings (severity ≥ medium)

#### SESSION_0445_FINDING_01 — public upload SVG stored-XSS (FIXED in-session)

- **Severity:** high · **Task:** TASK_03/04 · **Evidence:** `server/web/lead/public-actions.ts` upload action
- **Impact:** an SVG with inline `<script>` could pass a `startsWith("image/")` sniff and be served from
  the R2 origin → XSS when the URL is opened directly.
- **Required follow-up:** none — fixed (raster-mime allowlist; SVG rejected) + a hard byte ceiling added.
- **Status:** addressed.

## ADR / ubiquitous-language check

- ADR update **not required** — no new architectural decision. The comp-tier gate is a UI rendering of
  the existing comp-grant rule (ADR-era Dirty Dozen comp); the global modal + public upload are
  component/wiring choices, not decisions that change the model.
- Ubiquitous-language update **not required** — no new domain terms (reused: comp Elite, Dirty Dozen,
  claim, lineage). New code symbols (`CompTierCard`, `EvidencePhotoInput`, `JoinModalProvider`,
  `JoinLegacyDrawer`, `isLifetimeComp`) documented in `custom-component-inventory.md`.

## Hostile close review

- **Giddy:** pass — operator-approved decisions executed as agreed; the one prod write (#6) was
  pre-authorized, applied reversibly + verified; push held per the explicit-push rule.
- **Doug:** pass — every finding verified on the rendered DOM (15-check headless pass), not just source;
  the comp gate proven to keep `membershipPath` FREE (no Stripe); gates green (typecheck/lint/format/
  wiki-lint/tests). Honesty: `next build` was **not** run (dev-server conflict) — disclosed, not hidden;
  #4 reported as "no code bug found" rather than faking a fix.
- **Desi:** pass — comp card replaces the confusing tier picker on the claim path; the evidence uploader
  reads as a real photo field; the nav modal removes the page-nav confusion that tripped a real signup
  (Jay Farrell). Mobile-verified at 414px.
- **Kaizen aggregate:** 8.5/10 — strong; lose half a point each for the deferred build gate and the
  inherited rate-limit weakness now fronting a public surface.

## Reflections

- **Run fallow BEFORE implementing, not after.** The operator's standing discipline
  (`fallow-baseline-before-implementation`) is a baseline-diff, and I built first then audited — so I
  have an after-snapshot with no clean before-diff to prove complexity dropped. The audit was still
  valuable (it caught the SVG XSS), but next time capture the baseline at bow-in.
- **A formatter can erase your "fix."** #4's explicit-space token was reverted by oxfmt to the
  canonical same-line literal space — which already renders correctly. The honest call was "no
  reproducible bug," not a no-op fix dressed up as a fix.
- **Self-review earns its keep on new public surfaces.** The 8-angle review's single highest-value catch
  was the SVG stored-XSS on the brand-new unauthenticated upload — exactly the kind of gap a
  build-it-and-ship pass misses. Adversarial review before push is cheap insurance.
- **"Reuse the existing component" has limits.** The operator asked to reuse FormMedia/the cropper for
  #3, but FormMedia's upload is auth-gated and the cropper force-crops round avatars — neither fits a
  guest certificate. Reusing the *backend* (S3 + rate-limiter + validation) while writing a thin new
  field was the honest middle path; surfacing *why* the existing ones don't fit mattered.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | only doc touched is this SESSION file (frontmatter complete, `last_agent` set); code files carry inline SESSION_0445 comments; new components added to custom-component-inventory |
| Backlinks/index sweep | wiki index session row added for 0445; `pairs_with` → SESSION_0444 + custom-component-inventory |
| Wiki lint | `bun run wiki:lint` → 0 errors, 15 warnings (all pre-existing in SESSION_VIDEO_R001 + petey-plan-0436) |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | SESSION_0445_REVIEW_01 + Giddy/Doug/Desi above |
| Review & Recommend | yes — Next session = Truelson care (blocked on Resend key) |
| Memory sweep | added `join-funnel-comp-gate-and-global-modal` (patterns); existing explicit-push + Resend-key memories still valid |
| Next session unblock check | BLOCKED ON USER — Truelson needs the BBL Resend key |
| Git hygiene | branch `main`; commit `83599dfb` (app code) + a docs(ritual) commit; **pushed on operator "go"** after the local `next build` gate passed — hashes in chat |
| Graphify update | Nodes 93 · Edges 927 · Communities 2112 (run before close commit) |
| Pre-push cost gate | local `next build` green (exit 0) before push; new closing.md step **4a** codifies this + the push-selectivity discipline; CI follow-up (trim Playwright ×3 matrix) spawned as a task |
