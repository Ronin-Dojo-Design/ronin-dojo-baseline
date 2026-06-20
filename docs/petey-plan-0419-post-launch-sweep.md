---
title: "Petey Plan 0419 — Post-launch sweep (agent TODO tracker)"
slug: petey-plan-0419-post-launch-sweep
type: petey-plan
status: active
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0419
pairs_with:
  - docs/sprints/SESSION_0419.md
  - docs/architecture/decisions/0032-social-signin-pending-claim.md
  - docs/architecture/decisions/0031-lifecycle-email-dry-run-gate.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0419 — Post-launch sweep (agent TODO tracker)

> **Purpose:** a tracking TODO list for fresh agent sessions to pick up the post-launch work after the
> SESSION_0419 evening (claim fix + lifecycle wiring + founder emails + mobile polish all shipped).
> Each task is **self-contained** — an agent can take one, `/bow-in`, and run it cold. Update the
> **Status** column + the per-task checkboxes as work lands.

## How to use this tracker

1. Pick the highest-priority `TODO` task below. Claim it by setting its Status to `IN PROGRESS` +
   stamping `last_agent`.
2. `/bow-in` (the repo expects it), then execute the task's embedded prompt + acceptance criteria.
3. On completion: set Status `DONE`, link the SESSION file that landed it, and check its boxes.
4. **Standing operator constraints (apply to every task):** explicit confirmation before any
   irreversible outward send (emails, deploys); verify flows before sending; never claim/hijack a
   member's node yourself; don't print/commit secrets (Stripe live/test + Neon still need rotation);
   prod is live — gate destructive writes.

## Status board

| # | Task | Priority | Status |
| --- | --- | --- | --- |
| 1 | Brian Truelson — first-tester onboarding + thank-you email | **P0 (time-sensitive)** | TODO |
| 2 | Feedback widget — verify + route + confirm destination | P1 | TODO |
| 3 | Student sign-up under instructor/school — full flow verification | P1 | TODO |
| 4 | Admin email composer parity + port BBLApp + Apple-worthy admin mobile | P2 | TODO |
| 5 | UI polish batch — rank-badge overlap, EmailCapture theme default, FormLabel wrap | P1 | TODO |

## Shared context (read once)

- Repo: **ronin-dojo-app** (Black Belt Legacy, `blackbeltlegacy.com` — **launched + live**). Legacy app
  = **ronin-dojo-monorepo**.
- **Claim system (ADR 0032 / SESSION_0419):** a `LineagePendingClaim { email, brand:BBL, nodeId }`
  binding is reconciled on **every** successful sign-in (`lib/auth.ts` `hooks.after` →
  `reconcilePendingLineageClaims` → the shared `claimNodeForUser` core). A fresh claim grants Elite
  comp via `finalizeLineageNodeClaim` and fires the `profile-claim-approved` lifecycle email.
- **Lifecycle emails are LIVE in prod** (`EMAIL_LIFECYCLE_DRYRUN=0`, ADR 0031) — they actually send.
- **Admin claim review** = `server/admin/lineage/claim-review-actions.ts` `applyLineageClaimReview`
  (APPROVE/DENY + audit; approve fires the claim-approved email).
- **Email infra:** `lib/notifications.ts`, `lib/email.ts`, `emails/*` (BblEmailWrapper + LoginStep
  red-circle step pattern in `emails/bbl-the-long-road.tsx`), the lifecycle template
  `emails/lifecycle-notification.tsx`.
- **Repo gotchas:** flex blowouts need `min-w-0` (`Card` is `flex items-start w-full` with
  `min-width:auto`); `FormLabel` hardcodes `truncate` (nowrap → clips long labels); verify no
  horizontal overflow (`docScrollWidth ≤ viewport`) after UI fixes.

---

## Task 1 — Brian Truelson: first-tester onboarding + special thank-you email — **P0**

**Status:** TODO · **Owner:** — · **Lands in:** SESSION_____

Brian Truelson (`btruelson@gmail.com`) is a long-time loyal member who emailed **today** asking about
the site. He is our **first non-admin tester** and we want our **first real claim success**. He has a
claimable placeholder profile in the directory at slug **`brian-truelson`** (a Black Belt).

**Acceptance criteria**

- [ ] His claim flow VERIFIED end to end **before** anything sends (replicate `claimNodeForUser` in a
      rolled-back prod tx like SESSION_0419 did for Tony — do **not** actually claim it for him).
- [ ] `LineagePendingClaim` backfilled: `{ email:"btruelson@gmail.com" (lowercased), brand:"BBL",
      nodeId:<brian-truelson node id>, expiresAt:null }` so ANY sign-in auto-claims.
- [ ] **Lifetime** Elite comp granted (NOT the default 1-year): grant BBL `LINEAGE_PREMIUM` +
      `LINEAGE_ELITE` with NO expiry (`server/entitlements/comp-grants.ts` `grantComp` +
      `lib/entitlements/lineage-comp`). NOTE: this app has **no PayPal** — "old PayPal subscription
      waived" is messaging only (his sub was on the legacy WP site); the lifetime comp here is the grant.
- [ ] Special branded email composed (reuse `BblEmailWrapper` + the LoginStep red-circle steps from
      `emails/bbl-the-long-road.tsx`), in the operator's first-person voice, including ALL of:
  - Thank you for being a loyal member all these years.
  - Excited to have you as the FIRST non-admin tester; your timing couldn't be better — we just tested
    among the team and hope you'll be our first claim success.
  - Please flag anything that breaks, feels off, or has friction, and where it could be easier — your
    feedback now is invaluable; call out any final kinks as you navigate.
  - We appreciate your support + patience; we've worked diligently to launch safely, securely, professionally.
  - As a token of appreciation: **lifetime membership granted**, old **PayPal subscription waived**.
  - Certificates, shirts, rashguards, hoodies dropping shortly — send your school logo and I'll
    personally send a shirt/rashguard/hoodie with your school logo, a BBL logo, or both; tell me your
    updated rank and I'll send a **free certificate hand-signed by Rigan**.
  - A clear **claim-process explanation styled like the login explanation** (numbered red-circle steps):
    how to sign in (Google recommended + Magic Link) AND that his profile auto-claims on sign-in.
  - His one-click claim/sign-in link (mint via `server/web/lineage/mint-claim-magic-link.ts`,
    email-bound, nextPath = claim-accept for `brian-truelson`, 7-day expiry).
- [ ] DRY-RUN preview shown to operator (copy + rendered HTML); **explicit "go" received before send**;
      sent to `btruelson@gmail.com`; Resend message id reported.

---

## Task 2 — Feedback widget: verify it works + find where it routes + wire it properly — **P1**

**Status:** TODO · **Owner:** — · **Lands in:** SESSION_____

The public feedback widget ("What can we do to improve Black Belt Legacy?" — email + "Write your
feedback here…") is **custom**: `components/web/feedback-widget.tsx`, mounted in `app/(web)/layout.tsx`,
submitting via `server/web/actions/report.ts`.

**Acceptance criteria**

- [ ] Trace `server/web/actions/report.ts` end to end — where does feedback GO today (DB? email?
      admin notification? no-op)? Report exactly.
- [ ] Confirm the widget works on the LIVE site (real test submit on mobile + desktop; success state,
      no console/network errors).
- [ ] Route it somewhere the operator will SEE: persist AND notify (email to the operator/admin inbox
      + admin surface if applicable), reusing `lib/notifications.ts` / `sendEmail`. Confirm the
      destination address with the operator.
- [ ] Verify the widget's mobile placement/readability (390px) — it sits bottom-left over content;
      ensure it doesn't cover CTAs.
- [ ] Report: where feedback went before, where it goes now, proof of the delivered test.

---

## Task 3 — Student sign-up under instructor/school: full flow verification + fixes — **P1**

**Status:** TODO · **Owner:** — · **Lands in:** SESSION_____

Verify (and fix gaps in) the path where a student signs up **under their instructor/school** (Tuff
Buffs + any other org), pays, gets the right features, and is correctly placed — and that admin claim
approval works.

**Acceptance criteria**

- [ ] A student can sign up under a specific instructor/school; the association is captured + persisted
      on registration (registration/join surfaces: `app/(web)/lineage/join`, the join wizard, intake).
- [ ] On successful registration, the student is placed under their instructor + school **correctly**
      (right Affiliation / Membership / LineageTree relationship — confirm against the data model);
      placement shows on their profile + the school roster.
- [ ] If they pay, entitlements/features are wired (Stripe checkout → signed webhook → `UserEntitlement`;
      tier features render). Verify off-prod via the test-mode rehearsal (`stripe-setup-runbook.md`) —
      **no real live charge**.
- [ ] Signup/lifecycle emails fire (lifecycle is LIVE in prod now).
- [ ] Claim + **APPROVAL** flow: admin can **APPROVE or DENY** correctly (`applyLineageClaimReview`),
      with the **sonner toast + email notification** on each decision and the audit log written. Verify
      BOTH branches (approve → ownership/comp + claim-approved email; deny → no grant + notice).
- [ ] Report a flow map + pass/fail per step + any fixes made.

---

## Task 4 — Admin email composer parity + port BBLApp + Apple-worthy admin mobile — **P2**

**Status:** TODO · **Owner:** — · **Lands in:** SESSION_____

Heavy parity check + polish of the **admin email composer** surface, porting missing pieces from the
legacy BBLApp, and making the admin dashboard Apple-worthy on mobile.

**Acceptance criteria**

- [ ] Map the current email-admin surface: `app/app/email/` (`page.tsx` + `_components/bbl-invite-composer.tsx`,
      `bbl-email-capture-list.tsx`, `bbl-email-catalog-panel.tsx`) + email infra (`lib/notifications.ts`,
      `lib/email.ts`, `emails/*`, the lifecycle system: `LifecycleEmailKind`, `EmailLifecycleNotification`).
- [ ] In the **monorepo**, GRAPHIFY-QUERY for the **BBLEmail** folder / BBLApp email components
      (`graphify query "BBLEmail email composer components"` in `ronin-dojo-monorepo`; a
      `…/dirstarter/emails` folder exists). Identify composer/template/catalog components this app MISSES.
- [ ] Parity matrix (BBLApp vs this app); port the missing/better pieces (composer UX, template catalog,
      send/preview/test-send, audience selection) into `app/app/email`, reusing this app's seams. Don't
      regress the dry-run gate (ADR 0031) or per-brand sender setup.
- [ ] Polish admin dashboard mobile responsiveness to "Apple-worthy" (ease of use + readability at
      390px; `components/admin/shell`, `app/admin/*`). Measure for horizontal overflow (flex blowouts /
      `FormLabel truncate`); browser-verify with screenshots.
- [ ] Report: parity matrix, what was ported, before/after mobile screenshots.

---

## Task 5 — UI polish batch — **P1**

**Status:** TODO · **Owner:** — · **Lands in:** SESSION_____

Three small polish items (verify each on a real 390px mobile viewport with `getBoundingClientRect`
measurements + screenshots):

- [ ] **Rank-badge overlap in the profile card:** on `/directory/[slug]` for an unclaimed placeholder
      (e.g. `/directory/bob-bass`), the hero card's rank badge ("Coral Belt (Red/Black) - 7th Degree")
      overlaps/overflows. Fix the hero layout (`ProfileHero` / directory-profile hero / `ProfileClaimTeaser`
      hero) — likely a flex blowout; confirm with measurement; fix with `min-w-0`/wrapping, not just padding.
- [ ] **EmailCapture theme default:** `app/(web)/_components/bbl-teaser/email-capture.tsx` currently
      defaults `theme="dark"`. Change the DEFAULT to follow **system color-scheme preference**
      (`prefers-color-scheme`); when no preference is set, default to **black (dark)**. The landing passes
      `theme="light"` explicitly (keep). Black wordmark (`BBL_LOGO_BLACK`) on light, white
      (`BBL_LOGO_WHITE`) on dark.
- [ ] **FormLabel truncate follow-up:** `components/common/form.tsx` `FormLabel` is hardcoded with
      `truncate` (nowrap) → long labels clip on mobile (SESSION_0419 worked around one instance by
      shortening copy). Make `FormLabel` **wrap** by default (or add an opt-in wrap), audit form labels
      for clipping, and remove the one-off copy workaround if appropriate.

---

## Origin

Captured from the operator's post-launch handoff at the close of SESSION_0419 (this window had done a
lot + compacted heavily; the operator asked to bank these as a tracker for fresh agent sessions rather
than execute them in an overloaded window).
