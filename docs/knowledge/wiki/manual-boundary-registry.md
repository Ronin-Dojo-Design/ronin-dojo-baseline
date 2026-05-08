---
title: Manual Boundary Registry
slug: manual-boundary-registry
type: runbook
status: active
created: 2026-04-27
updated: 2026-05-08
author: Brian + ChatGPT
last_agent: codex-session-0099
pairs_with:
  - repo-truth-index
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/aws-s3-operator-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/chat-handoff.md
  - docs/rituals/closing.md
  - docs/sprints/SESSION_0023.md
  - docs/protocols/task-review-log.md
  - docs/knowledge/wiki/baseline-docs-adoption-checklist.md
  - docs/knowledge/how-to-use-these-registries.md
  - docs/sprints/SESSION_0030.md
  - docs/sprints/SESSION_0031.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/sprints/SESSION_0094.md
  - docs/sprints/SESSION_0095.md
  - docs/sprints/SESSION_0096.md
  - docs/sprints/SESSION_0097.md
  - docs/sprints/SESSION_0098.md
  - docs/sprints/SESSION_0099.md
tags:
  - blockers
  - ops
  - proof
---

## Summary

Track every important thing in the new baseline repo that still depends on human signoff, credentials, environment proof, runtime validation, release approval, or a deferred architectural choice. Manual work is not weakness — hidden manual work is.

## Status

Active, adopted SESSION_0010.

## When to use

Open this registry:

- at bow-in for planning-heavy sessions
- before declaring a milestone closed
- before staging/prod readiness
- whenever someone says "manual step" or "smoke pending"

Status vocabulary:
- `open`
- `waiting_on_owner`
- `waiting_on_credentials`
- `waiting_on_env`
- `scheduled`
- `verified`
- `archived`

Blocker classes:
- `auth_decision`
- `runtime_proof`
- `brand_migration`
- `docs_wiring`
- `data_model_decision`
- `deploy_env`
- `mobile_contract`
- `content_system_decision`
- `cleanup`
- `qa_proof`

## Steps

### 1. Read the registry

#### MB-001 — S2 auth

- **Boundary:** Lock mobile auth path: Better-Auth mobile SDK vs JWT bridge fallback.
- **Owner:** owner + Cody
- **Blocker class:** `mobile_contract`
- **Proof required:** one explicit architecture decision + implementation target
- **Status:** open

#### MB-002 — brand scope hardening

- **Boundary:** Decide and implement Prisma brand-scope enforcement layer.
- **Owner:** Cody
- **Blocker class:** `auth_decision`
- **Proof required:** code path + test evidence + updated auth doc
- **Status:** open

#### MB-003 — brand switcher

- **Boundary:** Finish `activeBrandId` persistence + switch flow + smoke proof.
- **Owner:** Cody
- **Blocker class:** `runtime_proof`
- **Proof required:** working end-to-end flow, session survives reload
- **Status:** open

#### MB-004 — S2 Passport bootstrap

- **Boundary:** Convert "code complete / smoke pending" into verified flow.
- **Owner:** Cody + Doug
- **Blocker class:** `qa_proof`
- **Proof required:** signup -> Passport stub -> DirectoryProfile stub smoke proof
- **Status:** verified

#### MB-005 — transitional cleanup

- **Boundary:** Remove Dirstarter reference models before prod or formally quarantine them.
- **Owner:** Petey + Cody
- **Blocker class:** `cleanup`
- **Proof required:** tracked removal plan or quarantine ADR
- **Status:** verified; SESSION_0039 resolved D-014 as Option B, repurpose Tool to Directory Listing. No removal. Relabel in a future session. See `dirstarter-baseline-index.md` section 14.

#### MB-006 — Baseline rollout

- **Boundary:** Approve Baseline-first public rollout surfaces and alias rules.
- **Owner:** Brandon + owner
- **Blocker class:** `brand_migration`
- **Proof required:** approved alias map + rollout checklist
- **Status:** open

#### MB-007 — staging deploy

- **Boundary:** Vercel + Neon staging environment proof.
- **Owner:** Cody + Doug
- **Blocker class:** `deploy_env`
- **Proof required:** deploy succeeds + smoke checklist passes
- **Status:** open

#### MB-008 — docs/wiki quality

- **Boundary:** Backlinks and doc health upgrades on key pages.
- **Owner:** Petey + Doug
- **Blocker class:** `docs_wiring`
- **Proof required:** wiki lint pass + index updates
- **Status:** open

#### MB-009 — content engine path

- **Boundary:** Decide current truth split: MDX-only now vs ContentAtom-backed intake-to-publish path.
- **Owner:** Petey + Iggy + owner
- **Blocker class:** `content_system_decision`
- **Proof required:** written policy + phased adoption plan
- **Status:** open

#### MB-010 — legacy migration

- **Boundary:** Clarify when BBL/WEKAF porting resumes relative to Baseline-first milestone.
- **Owner:** Petey + owner
- **Blocker class:** `brand_migration`
- **Proof required:** updated program lane note
- **Status:** open

#### MB-011 — directory monetization

- **Boundary:** Decide whether paid listings stay on Dirstarter `Tool` or become a Ronin-native listing model.
- **Owner:** Petey + Cody + Brandon
- **Blocker class:** `content_system_decision`
- **Proof required:** ADR or roadmap decision plus migration/quarantine plan
- **Status:** verified; SESSION_0039 resolved D-014 as Option B. Tool stays and is repurposed as Directory Listing. Stripe tiers map to listing tiers. Relabel UI in a future session.

#### MB-012 — local environment cleanup

- **Boundary:** Remove or archive accidental Local by Flywheel WordPress public directory from the working context.
- **Owner:** owner + Cody
- **Blocker class:** `cleanup`
- **Proof required:** explicit owner approval + path verification before delete/archive
- **Status:** open

#### MB-013 — security and financial transaction readiness

- **Boundary:** Prove private-data and payment-access controls before CGR commerce or protected learning surfaces launch.
- **Owner:** Cody + Doug + Giddy
- **Blocker class:** `qa_proof`
- **Proof required:** security test matrix, monitoring hooks, Customer Portal/customer ID path, non-tournament ledger projection, subscription policy proof, manual payment entitlement path, payment/entitlement drift audit, and launch-readiness signoff
- **Status:** open

#### MB-014 — production multi-domain + server action hardening

- **Boundary:** Production-only manual steps that block staging/launch but are out of code scope.
- **Owner:** owner + Cody
- **Blocker class:** `deploy_env`
- **Proof required:** Vercel domain config screenshots/log, populated `HOST_TO_BRAND`, `allowedOrigins` array, and a pre-staging env-validation run
- **Status:** open
- **Specific gates:** register all four brand apex domains, fill `HOST_TO_BRAND` production rows in `~/lib/brand-context.ts`, configure `experimental.serverActions.allowedOrigins` in `next.config.ts`, and verify env validation covers Better Auth, Postgres, Stripe, Redis (Upstash), S3, cron secret, and Plausible.

### 2. Notes by boundary

**MB-001 — Mobile auth path.** Current auth documentation explicitly preserves two viable mobile options. That means the mobile contract is not fully closed.

**MB-002 — Brand scope enforcement.** The docs already describe a future Prisma extension for stronger brand scoping. Until that is real, the safety posture is partly procedural and partly architectural.

SESSION_0023 update: Wave A added operational and billing tables (`Invoice`, `MembershipContract`, `Attendance`, `CheckIn`, `PayoutSplit`, etc.). No routes/actions expose them yet, but every future query/mutation touching these tables must prove brand scope plus organization membership/role checks before this boundary can close.

**MB-003 — Active brand persistence.** The auth doc names the behavior clearly. What matters now is operational proof.

**MB-004 — Passport bootstrap.** ~~Program plan notes this is code complete but still needs smoke proof. That makes this a perfect tracked manual boundary instead of a vague "almost done."~~ **VERIFIED SESSION_0011:** `scripts/smoke-passport.ts` proves User→Passport→DirectoryProfile creation, read, update, re-read, and default verification. Proof artifact: `apps/web/scripts/smoke-passport.ts` + passing run log.

**MB-005 — Dirstarter residue.** ~~The schema literally marks template models for future removal before production. That should stay visible until handled.~~ **VERIFIED SESSION_0039:** D-014 decided Option B — repurpose Tool as Directory Listing. The ~30 Tool-related files provide a complete CRUD + submission + Stripe pipeline that maps directly to the school directory. No removal; UI relabel in a future session. See `docs/architecture/dirstarter-baseline-index.md` §14.

**MB-009 — Content system path.** The repo has MDX blog content now, ContentAtom-style schema direction, and a wiki/docs/session knowledge layer. This needs a crisp operating rule so the system does not fork into three half-truths.

**MB-010 — Legacy migration.** SESSION_0098 added an owner-approved first TuffBuffs affiliate gear proof at `/gear` after the MB-013 monitor/audit work landed. This does not start formal PWCC or close the legacy migration boundary. It proves the repo can mine the TuffBuffs legacy monorepo for catalog/UI facts and should feed the next formal PWCC/TuffBuffs commerce port map.

**MB-011 — Directory monetization model.** ~~The roadmap intentionally reuses Dirstarter `Tool` and `Ad` for near-term paid listing proof. Before production, decide whether that remains the canonical paid listing substrate, gets renamed/promoted into a generic `DirectoryListing`, or is replaced by paid overlays on `Organization`, `Program`, and `Event`.~~ **VERIFIED SESSION_0039:** D-014 decided Option B — Tool stays as the paid directory listing substrate, repurposed with a UI relabel to "Listing" or "Directory Entry". Stripe tiers (Free/Standard/Premium) map to directory listing visibility tiers. The `Ad` system also stays as-is for sponsored placements.

**MB-012 — Local WordPress public directory cleanup.** The session began in `/Users/brianscott/Local Sites/ronin-dojo/app/public/` because VS Code was opened from the Local by Flywheel WordPress site. ADR 0005 already says that install is abandoned and irrelevant to the new stack. Do not delete it silently; verify the path and get owner approval first.

**MB-013 — Security and financial transaction readiness.** SESSION_0030 created `docs/architecture/security-privacy-payments-monitoring-plan.md` as the plan gate. SESSION_0094 reconciled the commerce truth after the entitlement schema landed. This remains open until implementation proves the gates with tests/logging: schedule auth/brand rejection, instructor enumeration protection, entitlement-first payment access, Stripe webhook idempotency, refund/revoke behavior, certificate verification rate limiting, private storage policy, and monitoring alerts.

SESSION_0094 update: the entitlement bridge now exists (`PricingPlan.stripeProductId`, `PricingPlan.stripePriceId`, `Entitlement`, `EntitlementGrant`, `UserEntitlement`) and tournament paid-registration webhook tests are the proof template. MB-013 still requires concrete payment proof before protected paid learning/certification/membership launch:

SESSION_0095 update: focused webhook proof landed for one-time and subscription access. A mapped one-time `PricingPlan.stripePriceId` now grants one PURCHASE `UserEntitlement`, preserves a pre-existing manual grant, survives replay, and activates `ProgramEnrollment`. A mapped subscription Checkout grants one SUBSCRIPTION `UserEntitlement`, survives replay, and `customer.subscription.deleted` revokes only rows matching the subscription source id. The webhook also retries Prisma `P2034` serializable write conflicts for paid tournament capacity enforcement.

SESSION_0096 update: current-brand `StripeCustomer` mapping, authenticated Customer Portal session creation, processed Stripe event-id storage, non-tournament `Invoice`/`Payment` projection for mapped Checkout, subscription update/failed-payment/paid-renewal handling, and full refund/dispute revocation proof landed. Failed renewal now keeps subscription access active only through a seven-day `endsAt` grace window; paid renewal restores active access and writes ledger rows; full refund and dispute revoke matching Stripe-sourced access and suspend program enrollment projections. The paid tournament parallel webhook retry was widened to include Prisma adapter `40001` transaction conflicts.

SESSION_0097 update: protected program enrollment Checkout now uses an authenticated action that accepts only `programId`, selected `stripePriceId`, and optional coupon, then derives user, brand, organization, pricing plan, line item, mode, Stripe Customer handling, URLs, and metadata server-side. Hostile tests prove caller-supplied metadata, line items, and redirect URLs cannot drive protected paid-learning access. This closes `SESSION_0096_FINDING_01` for the program enrollment Checkout surface while leaving the non-checkout MB-013 launch gates open.

SESSION_0098 update: local Stripe test-mode proof added an admin-only billing monitor at `/admin/billing/monitoring` and a repeatable payment/entitlement drift audit script. The monitor treats any `FAILED` webhook in the seven-day launch window and any `PROCESSING` webhook older than 15 minutes as blocking. The audit treats duplicate active same-brand/program Stripe Price mappings, active paid Stripe plans without grants, paid Stripe invoices missing active entitlements, orphan active Stripe-sourced entitlements, active paid program enrollments without Stripe-sourced entitlements, and failed/stale webhook events as blocking. `CertificateTemplate.priceCents > 0` remains warning-only. Local audit output on 2026-05-08 was READY with 0 blocking issues and 0 warnings.

SESSION_0098 late update: `/gear` now displays TuffBuffs/Amazon affiliate gear using local legacy assets and Grid/List/Carousel modes. This is not a Stripe product setup, not shippable merch checkout, not certificate/membership/tournament fee productization, and not outbound email implementation. Those decisions must be handled in a follow-up commerce/PWCC session before new Stripe products or customer emails are wired.

SESSION_0099 update: public gear/catalog images now have a local-dev-to-S3 public media bridge. Local dev keeps `/images/...` from `apps/web/public`; staging/prod must set `NEXT_PUBLIC_MEDIA_BASE_URL` and `S3_PUBLIC_URL` to the approved S3/CloudFront media base. Owner-side AWS setup remains manual and is documented in `docs/runbooks/aws-s3-operator-runbook.md`. Until Brian creates the bucket/distribution, syncs `apps/web/public/images/merch`, and sets Vercel env vars, `/admin/storage/monitoring` should report `NEEDS_SETUP`.

MB-013 still requires these launch gates:

1. Production/staging alert destination, recipients, and audit schedule setup for the new monitor/audit surfaces.
2. Staging proof that `/api/stripe/webhooks`, `/admin/billing/monitoring`, and the audit command run against the deployed environment.
3. Certificate pricing decision: migrate paid certificates to `PricingPlan` or keep `CertificateTemplate.priceCents` as a launch bridge.
4. Manual/admin payment entitlement path that grants/revokes the same `UserEntitlement` result without Stripe, or explicit launch exclusion.
5. DB-enforced or explicitly accepted-risk handling for non-unique `PricingPlan.stripePriceId` and non-unique `UserEntitlement` source rows.
6. Customer email/notification path for failed-renewal grace, refund, and dispute events.

SESSION_0098 planned owner checklist before this boundary can close:

- Confirm Stripe test mode first for monitor/audit proof; do not use live mode for local verification.
- Confirm where alerting should land after the admin monitor exists: dashboard only, email, Slack, or another channel.
- Provide alert recipient emails or explicitly defer outbound alerts to a post-monitoring follow-up.
- Approve the proposed daily drift-audit schedule, defaulting to 03:00 America/Denver.
- Approve launch thresholds: any blocking drift count above zero blocks paid curriculum launch.
- Provide or approve the launch Stripe Price inventory: brand, org, program, plan, Stripe product id, Stripe price id, mode, allowed coupon ids.
- Decide whether manual/cash/check/comp paid-curriculum access is excluded from launch or must be implemented with entitlement parity before launch.
- Decide certificate pricing bridge: keep `CertificateTemplate.priceCents` warning-only or migrate paid certificate orders into `PricingPlan`.
- Decide whether customer emails for failed-renewal grace, refund, and dispute events are required before paid curriculum launch.
- Decide whether SESSION_0098 proof is local-only or must include staging evidence.

Future Stripe event-destination backlog, not to be subscribed until handlers exist:

- Setup runbook: `docs/runbooks/stripe-setup-runbook.md`.
- Coupon/promotion-code sync: add handlers for `coupon.created`, `coupon.updated`, `coupon.deleted`, `promotion_code.created`, and `promotion_code.updated` only if Ronin needs to sync Stripe coupon administration into app-side allowlists/audit. Applying coupons in Checkout does not require these events.
- BBL lineage payout pipeline: add a separate Connect/payout webhook destination, likely `/api/stripe/connect/webhooks` with `STRIPE_CONNECT_WEBHOOK_SECRET`, when Connect handlers exist. Candidate connected-account events are `account.updated`, `account.external_account.updated`, `payout.created`, `payout.updated`, `payout.paid`, and `payout.failed`; candidate platform transfer events after transfer tracking exists are `transfer.created`, `transfer.updated`, and `transfer.reversed`.
- BBL payout manual decisions: decide whether BBL receives one org payout or individual lineage recipients get connected accounts; exact Premium/Elite split percentages; payout timing; refund/dispute clawback rules; and recipient onboarding/KYC responsibility.

**MB-014 — Production multi-domain + server action hardening.** SESSION_0030 hostile pass, SESSION_0031 prep refactor, and SESSION_0099 storage work identified five manual production gates the owner must close before staging deploy:

1. Register all four public apex domains (Ronin Dojo Design, Baseline Martial Arts, Black Belt Legacy, WEKAF) and add them as Vercel custom domains per ADR 0006.
2. Uncomment and fill the production rows in `HOST_TO_BRAND` inside `apps/web/lib/brand-context.ts` so unknown hosts no longer fall back to RONIN_DOJO_DESIGN in production.
3. Add `experimental.serverActions.allowedOrigins` to `apps/web/next.config.ts` listing the four brand domains so Server Actions CSRF/Origin checks pass under multi-domain hosting.
4. Verify env validation covers Better Auth, Postgres, Stripe (publishable + secret + webhook), Upstash Redis, S3 / private storage, cron secret, and Plausible before staging deploy. Live Dirstarter docs reference: `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/deployment`.
5. Configure public media storage per `docs/runbooks/aws-s3-operator-runbook.md`: bucket, CloudFront/OAC or approved direct S3 public delivery, least-privilege upload IAM key, synced merch assets, and Vercel `S3_*` / `NEXT_PUBLIC_MEDIA_BASE_URL` variables.

This boundary stays `open` until those five steps are verified. SESSION_0031 implementation does not depend on them, but staging/launch sessions do.

### 3. Closure rule

A boundary may only become `verified` when:

1. the choice/action is complete,
2. proof artifact exists,
3. owner is known,
4. next-state docs are updated.

If proof does not exist, it stays open.

## Rollback

If a boundary was closed prematurely (no proof artifact, owner unknown, or downstream docs not updated), reopen it by setting status back to `open` and recording why in the boundary's notes section. Never silently archive an unverified boundary.

## Last verified

2026-04-27 — MB-004 (Passport bootstrap) verified in SESSION_0011 via `scripts/smoke-passport.ts`.
