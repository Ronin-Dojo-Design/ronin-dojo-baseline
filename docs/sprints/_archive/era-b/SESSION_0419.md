---
title: "SESSION 0419 — Social-sign-in claim fix + email lifecycle wiring (post-launch hardening)"
slug: session-0419
type: session--implement
status: closed
created: 2026-06-19
updated: 2026-06-19
last_agent: claude-session-0419
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0418.md
  - docs/architecture/decisions/0032-social-signin-pending-claim.md
  - docs/architecture/decisions/0031-lifecycle-email-dry-run-gate.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0419 — Social-sign-in claim fix + email lifecycle wiring (post-launch hardening)

## Date

2026-06-19 (continues the post-launch evening of SESSION_0418)

## Operator

Brian + claude-session-0419

## Goal

Founder claim links "didn't work" for Tony. Root-cause and fix it, then harden the whole
founder/member claim path so **any** sign-in method claims; deliver the docs/graphify maps to
the founders; and wire the claim flow into the existing email lifecycle library so a successful
claim actually confirms by email.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

Operator-driven continuation of SESSION_0418 (no Petey/Cody planning phase). Branch `main`
throughout (trunk-based). This SESSION file was opened at bow-out.

## Task log

| ID | Title | Status |
| --- | --- | --- |
| SESSION_0419_TASK_01 | Diagnose Tony's "broken" claim — root cause: Google sign-in bypasses the magic-link-bound claim | ✅ |
| SESSION_0419_TASK_02 | Immediate fix: directly claim tony-hua for Tony's existing Google account (proven finalize path) | ✅ |
| SESSION_0419_TASK_03 | Grant Tony platform admin (`role: admin`) | ✅ |
| SESSION_0419_TASK_04 | Systemic fix: social sign-in honors a pending node claim (`LineagePendingClaim` + reconcile-on-any-auth) — ADR 0032 | ✅ |
| SESSION_0419_TASK_05 | Backfill Bob's binding (both emails → bob-bass, no expiry) | ✅ |
| SESSION_0419_TASK_06 | README live docs-navigator + Graphify graph links (GitHub Pages) | ✅ |
| SESSION_0419_TASK_07 | "Explore the Build" founder email (docs + graph) → Bob + Tony | ✅ |
| SESSION_0419_TASK_08 | Tony claim-explainer heads-up email (+ his admin link); HELD the bug/precautionary emails to Bob | ✅ |
| SESSION_0419_TASK_09 | Wire claim success into the email lifecycle library (`profile-claim-approved`, all 3 paths) + flip `EMAIL_LIFECYCLE_DRYRUN=0` in prod | ✅ |

## What landed

- **🔧 Root cause found: Google sign-in silently bypassed the claim.** The one-click claim was bound
  ONLY to the magic-link `callbackURL` (`/preview → /lineage/claim/accept?node=…`). The founder
  email recommends "Continue with Google," and Google OAuth carries no node — so a founder who
  signed in with Google authenticated fine but **never claimed**. Verified both founders were
  unclaimed; Tony had a Google account, Bob had never signed in at all (live unclicked magic-link
  token + no account).
- **Tony resolved directly + made admin.** Claimed tony-hua for his existing Google account via the
  proven `finalizeLineageNodeClaim` path (ownership transferred, Premium + Elite comp ACTIVE,
  audited); granted `role: admin` → `blackbeltlegacy.com/admin`.
- **🛡️ Systemic fix (ADR 0032): social sign-in now honors a pending node claim.** New
  `LineagePendingClaim` model persists an email→node binding at mint time (parsed from the
  nextPath — zero caller changes); `lib/auth.ts` `hooks.after` reconciles it on **every** successful
  auth (Google + magic-link + email sign-up), after `ensureIdentityShell`. Extracted the claim core
  into `claimNodeForUser` so the route path and the reconciler run identical logic. Reconciler never
  throws (can't block auth); gated on `emailVerified`.
- **Bob pre-wired.** Backfilled `LineagePendingClaim` for both his addresses → bob-bass (no expiry).
  He now auto-claims on **any** sign-in, either email — no new link needed.
- **Founder docs delivery.** README "Explore the Build" links (live Pages docs navigator + Graphify
  graph); "Explore the Build" email sent to Bob + Tony; Tony got a technical claim-explainer
  heads-up (carries his admin link). The bug/precautionary emails to Bob were **held** at operator
  request (operator handles Bob's messaging directly).
- **📧 Claim flow wired into the email lifecycle library + turned ON.** The library already had a
  `profile-claim-approved` kind but nothing fired it. Wired all three claim-success paths
  (magic-link route, reconciler, admin approve) through one rollback-safe `after()` helper
  (`scheduleClaimApprovedEmail`). Flipped `EMAIL_LIFECYCLE_DRYRUN=0` in prod — claim-success **and**
  the existing Stripe membership lifecycle emails now actually send (updates ADR 0031).

## Decisions resolved

- **Social/any sign-in must honor a pending node claim** — email→node binding reconciled on every
  auth (ADR 0032). The magic-link route path still claims directly (idempotent).
- **Hold the bug-explanation emails to Bob** — send only the positive "Explore the Build" email +
  Tony's technical heads-up; operator owns Bob's messaging (avoid alarming the namesake founder).
- **Turn the whole email lifecycle system ON in prod** (`EMAIL_LIFECYCLE_DRYRUN=0`) — claim-success
  + the Stripe membership emails (receipts/renewals/etc.), future events only. Operator chose
  "turn it all on" over keeping dry-run / auditing first.

## Files touched

- `apps/web/prisma/schema.prisma` + `migrations/20260620041705_lineage_pending_claim/` — new
  `LineagePendingClaim` model (additive: CREATE TABLE + indexes + FKs).
- `apps/web/server/web/lineage/claim-node-for-user.ts` — extracted shared claim core (the ONE claim
  primitive for route + reconciler).
- `apps/web/server/web/lineage/claim-accept-actions.ts` — thin wrapper over the core; fires
  claim-approved email.
- `apps/web/server/web/lineage/reconcile-pending-claims.ts` (+ `.test.ts`) — reconcile-on-any-auth;
  5 tests.
- `apps/web/server/web/lineage/mint-claim-magic-link.ts` — persist email→node binding at mint.
- `apps/web/server/web/lineage/claim-approved-email.ts` — `scheduleClaimApprovedEmail` (after() →
  lifecycle `profile-claim-approved`).
- `apps/web/server/admin/lineage/claim-review-actions.ts` — admin approve fires the same email.
- `apps/web/lib/auth.ts` — `hooks.after` calls the reconciler after `ensureIdentityShell`.
- `apps/web/lib/notifications.ts` — `notifyFounderOfBuildTour`, `notifyFounderOfClaimExplainer`.
- `apps/web/emails/bbl-build-tour.tsx`, `bbl-claim-explainer.tsx` — new founder emails.
- `apps/web/scripts/send-bbl-build-tour.ts` — serial founder send + `--dry-run` preview.
- `README.md` — "Explore the Build" Pages links.

## Verification

- `typecheck` clean; `next build` clean (catches use-server/boundary/circular — important for the
  `lib/auth.ts` edge); `oxlint` / `oxfmt` clean on all touched files.
- Tests: `claim-accept-actions` **6/6** (refactor behavior-preserving) + new
  `reconcile-pending-claims` **5/5** (happy / unverified / no-binding / already-owned / expired);
  both now emit the `profile-claim-approved` lifecycle event (verified via dry-run log).
- Prod: migration applied (additive table present); deploys `8d7hhbm0i` (fix) and `pbn8pxncw`
  (lifecycle wiring) both Ready; `blackbeltlegacy.com` 200.
- Tony confirmed sign-in-ready in prod: not banned, emailVerified, `role: admin`, owns tony-hua, 1
  live session.
- Founder sends (Resend ids): build-tour Bob `8e5e2f42` / Tony `9b60d7a5`; claim-explainer Tony
  `106e329f`.

## Open decisions / blockers

- **🔴 Secret rotation still pending** (operator action): Stripe live key, Stripe test key, Neon DB
  credential — passed through the SESSION_0418 transcript, confirmed not yet rotated.
- **Lifecycle emails are now LIVE but the non-claim copies weren't audited this session** — the
  Stripe membership emails (receipt/renewal/win-back/etc.) now send on future events. A quick copy
  audit pass is advisable (NOT blocking).
- Local `.env.prod.local` was repeatedly re-created (from the SESSION_0418 transcript) for prod
  reads/writes and deleted after each use; deleted at close.

## Next session

**Goal:** Lifecycle-email copy audit + claim-flow polish now that sending is live.

**Inputs to read:** this file; [[social-signin-claim-binding]] memory; ADR 0032 + ADR 0031;
`lib/notifications.ts` (`LifecycleEmailKind` set).

**First task:** Audit every now-live lifecycle email (the `LifecycleEmailKind` union — receipts,
renewals, win-back, comp-granted, rank-promotion, etc.): confirm each has a real trigger, correct
copy, and correct tier/CTA, since `EMAIL_LIFECYCLE_DRYRUN=0` turned them all on. NOT blocked on user.

## Reflections

- **The "broken link" wasn't broken — the user took a different door.** Tony's claim "failing" was
  actually him using Google (the *recommended* method) which silently skipped the node-bound claim.
  The lesson: when an email offers multiple auth methods, every method must converge on the same
  side effect, or the "recommended" one becomes the broken one. Reproducing the claim against the
  real account (rolled back) was what proved the logic was fine and the *path* was the bug.
- **Verify against data, not assumptions.** A lowercase email query made it look like Bob had zero
  magic-link tokens; case-insensitive showed one live, unclicked token. Founder emails are stored
  with their exact casing — never assume normalization.
- **Reuse the library, don't build a bespoke email.** The operator's "we have a WHOLE email lifecycle
  library" was right — `profile-claim-approved` already existed; the work was *wiring*, not authoring.
- **`after()` post-commit, never in-tx.** Scheduling the lifecycle email from inside the claim
  transaction would fire on rollback; firing it from the callers after the tx commits (the Stripe
  `scheduleLifecycleEmail` pattern) is rollback-safe.
- **A flag that defaults to "off" can hide a whole subsystem.** `EMAIL_LIFECYCLE_DRYRUN` defaulted to
  dry-run and was unset in Vercel, so *no* lifecycle email had ever actually sent in prod — including
  Stripe receipts. Wiring a new one surfaced the dormant gate.

## ADR / ubiquitous-language check

- **ADR 0032 created** — Social-sign-in pending claim binding (email→node, reconciled on any auth).
- **ADR 0031 updated** — recorded the prod flip to `EMAIL_LIFECYCLE_DRYRUN=0` (live sends on).
- Ubiquitous language: no new domain terms (reused Passport / LineageNode / claim). `LineagePendingClaim`
  is an implementation table, not a new ubiquitous term.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0419 frontmatter set; ADR 0032 created + ADR 0031 `updated` bumped + `last_agent` stamped; `custom-component-inventory.md` rows added. |
| Backlinks/index sweep | `wiki/index.md` ← SESSION_0419 row; SESSION_0419 `pairs_with` SESSION_0418 + ADR 0032/0031; ADR 0032 backlinks index. |
| Wiki lint | `bun run wiki:lint` — result reported at bow-out (see chat). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | Lightweight — schema change is additive + migration-verified; auth-hook edge built + tested (11/11) + `next build` clean; payments path untouched (only turned the dormant lifecycle emails on, operator-authorized). |
| Review & Recommend | Next session goal + First task written: yes. |
| Memory sweep | Added [[social-signin-claim-binding]] (project) + the lifecycle-dryrun gotcha; MEMORY.md index updated. |
| Next session unblock check | Unblocked (the lifecycle audit is code-doable; the one user item is secret rotation, tracked in Open decisions). |
| Git hygiene | Branch `main`; 4 code commits already pushed (`6481f22e`→`7ef4ef60`); this close commits the SESSION file + ADRs + wiki/index + component inventory (docs-only → no prod deploy). Single push; hash reported at bow-out / see git log. Never force-pushed. |
| Graphify update | node/edge/community count reported at bow-out (see chat), run before the close commit. |
