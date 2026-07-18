---
title: Manual Boundary Registry
slug: manual-boundary-registry
type: runbook
status: active
created: 2026-04-27
updated: 2026-07-18
author: Brian + ChatGPT
last_agent: codex-session-0570
pairs_with:
  - docs/security/README.md
  - repo-truth-index
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/aws-s3-operator-runbook.md
  - docs/runbooks/resend-setup-runbook.md
backlinks:
  - docs/sprints/SESSION_0313.md
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
  - docs/sprints/SESSION_0163.md
  - docs/sprints/SESSION_0170.md
  - docs/sprints/SESSION_0171.md
  - docs/sprints/SESSION_0344.md
  - docs/sprints/SESSION_0568.md
  - docs/sprints/SESSION_0570.md
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
- **Status:** operator-manual — open

#### MB-002 — brand scope hardening

- **Boundary:** Decide and implement Prisma brand-scope enforcement layer.
- **Owner:** Cody
- **Blocker class:** `auth_decision`
- **Proof required:** code path + test evidence + updated auth doc
- **Status:** operator-manual — open

#### MB-003 — brand switcher

- **Boundary:** Finish `activeBrandId` persistence + switch flow + smoke proof.
- **Owner:** Cody
- **Blocker class:** `runtime_proof`
- **Proof required:** working end-to-end flow, session survives reload
- **Status:** operator-manual — open

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
- **Status:** operator-manual — open

#### MB-007 — staging deploy

- **Boundary:** Vercel + Neon staging environment proof.
- **Owner:** Cody + Doug
- **Blocker class:** `deploy_env`
- **Proof required:** deploy succeeds + smoke checklist passes
- **Status:** operator-manual — open

#### MB-008 — docs/wiki quality

- **Boundary:** Backlinks and doc health upgrades on key pages.
- **Owner:** Petey + Doug
- **Blocker class:** `docs_wiring`
- **Proof required:** wiki lint pass + index updates
- **Status:** operator-manual — open

#### MB-009 — content engine path

- **Boundary:** Decide current truth split: MDX-only now vs ContentAtom-backed intake-to-publish path.
- **Owner:** Petey + Iggy + owner
- **Blocker class:** `content_system_decision`
- **Proof required:** written policy + phased adoption plan
- **Status:** operator-manual — open

#### MB-010 — legacy migration

- **Boundary:** Clarify when BBL/WEKAF porting resumes relative to Baseline-first milestone.
- **Owner:** Petey + owner
- **Blocker class:** `brand_migration`
- **Proof required:** updated program lane note
- **Status:** operator-manual — open

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
- **Status:** operator-manual — open

#### MB-013 — security and financial transaction readiness

- **Boundary:** Prove private-data and payment-access controls before CGR commerce or protected learning surfaces launch.
- **Owner:** Cody + Doug + Giddy
- **Blocker class:** `qa_proof`
- **Proof required:** security test matrix, monitoring hooks, Customer Portal/customer ID path, non-tournament ledger projection, subscription policy proof, manual payment entitlement path, payment/entitlement drift audit, and launch-readiness signoff
- **Status:** operator-manual — open

**SESSION_0313 update (2026-05-31):** Security readiness moved from narrative review to linked documentation artifacts: `docs/security/ronin-security-risk-register.md`, `docs/security/payment-security-checklist.md`, `docs/security/privacy-data-classification.md`, and `docs/security/security-test-plan.md`. This satisfies the documentation side of the security test matrix handoff, but MB-013 remains **open** until payment/customer portal proof, monitoring hooks, drift audit scheduling, manual payment entitlement parity, and launch signoff are implemented and verified.

#### MB-014 — production multi-domain + server action hardening

- **Boundary:** Production-only manual steps that block staging/launch but are out of code scope.
- **Owner:** owner + Cody
- **Blocker class:** `deploy_env`
- **Proof required:** Vercel domain config screenshots/log, populated `HOST_TO_BRAND`, `allowedOrigins` array, and a pre-staging env-validation run
- **Status:** operator-manual — open
- **Specific gates:** register all four brand apex domains, fill `HOST_TO_BRAND` production rows in `~/lib/brand-context.ts`, configure `experimental.serverActions.allowedOrigins` in `next.config.ts`, and verify env validation covers Better Auth, Postgres, Stripe, Redis (Upstash), S3, cron secret, and Plausible.

#### MB-015 — Resend transactional email setup

- **Boundary:** Resend account creation, sending domain DNS verification, and `.env` population with live API key + verified sender email.
- **Owner:** owner (Brian)
- **Blocker class:** `deploy_env`
- **Proof required:** (1) Resend dashboard shows verified domain, (2) `.env` has live `RESEND_API_KEY` + `RESEND_SENDER_EMAIL`, (3) test email delivered to real inbox (merch order confirmation or magic link).
- **Status:** verified
- **Last verified:** 2026-05-26
- **Specific gates:** Create Resend account → add sending domain (baselinemartialarts.com) → add DNS records (SPF, DKIM, DMARC) → verify → update `.env` → test delivery. Current sandbox key `re_DGuMPeUi_*` is placeholder. Magic link auth and merch order confirmation emails are both wired and waiting.
- **Added:** SESSION_0113

#### MB-016 — canonical Obsidian vault activation and native smoke

- **Boundary:** Finish OD-A2–A5 without leaking personal credentials or orphaning phone captures. **DONE (SESSION_0568 Opus continuation, agent-safe with per-action operator go):** `SHH_Folder` + `Baseline_SHH.txt` + `_archive/` + secret plugin data (`copilot`/`obsidian-git`/`todoist` `data.json`) gitignored; ignored set + 334-file first commit reviewed and secret-scanned (path + content, 0 real key literals); private remote `Ronin-Dojo-Design/RDD_Baseline44_Vault` created **PRIVATE** + pushed. **REMAINS (owner-only, in-app):** configure obsidian-git auto-backup; pair the Desktop vault + both phone vaults to one Obsidian Sync remote; eyeball Command Center v2 + the new plugin-free CSS skin switcher in real Obsidian light/dark/phone; store the Todoist token outside notes/vault-git when wired.
- **Owner:** Brian at the laptop + phone; agent may guide and verify outputs one step at a time.
- **Blocker class:** `qa_proof`
- **Proof required:** ✅ secret scan + reviewed 334-file first commit; ✅ private remote confirmed (`RDD_Baseline44_Vault`, PRIVATE); ✅ archive local-only (gitignored). REMAINS: phone edit appears on laptop and vice-versa (Sync); Command Center v2 + skin-switcher eyeball in Worn Gi light/dark and phone widths; Todoist token stored outside notes/vault Git.
- **Status:** waiting_on_owner
- **Added:** SESSION_0568; OD-A1 core split complete (53 MB), OD-A2–A5 and native OD-B4 smoke remain.
- **Updated:** SESSION_0568 (Opus continuation) — OD-A2 vault git init + gitignore + secret-scan + private remote + push **DONE**; only Sync/phone-pairing + obsidian-git auto-backup + in-app Command Center/switcher eyeball remain owner-only.

#### MB-017 — MMB temporary HubSpot credential rotation and least privilege

- **Boundary:** A HubSpot login was supplied through a screenshot during SESSION_0570 and is therefore
  considered exposed. Do not use or preserve it as the lasting credential.
- **Owner:** Michael rotates/revokes sessions and mediates 2FA; Brian enters the replacement locally.
- **Blocker class:** `auth_decision`
- **Proof required:** Michael confirms rotation; the replacement exists only in macOS Keychain under the MMB
  temporary service reference; a metadata-only secret scan finds no password/2FA copy in repo or vault; access
  expiry/revocation owner is recorded; any lasting integration uses approved least-privilege OAuth/scoped access.
- **Status:** waiting_on_credentials
- **Added:** SESSION_0570.

SESSION_0163 update: Baseline DNS instructions now match the verified Resend dashboard setup from 2026-05-13 15:04, and the stale `rv_` ownership-token / legacy return-path CNAME guidance has been removed from active docs.

**SESSION_0260 closure (2026-05-26):** Production email delivery proven by a real DSR submission lifecycle email in production — the `dsr-submission-confirmation` template rendered cleanly, the verified-domain sender resolved correctly, and the email arrived in the recipient inbox. Resend message id `5040dc0b-203c-4fed-8529-83d737e42e2a`. This is stronger proof than the synthetic `apps/web/scripts/send-resend-production-test.tsx` smoke script (which is also checked in and reusable for future MB-style proofs): a real lifecycle event went through the real helper boundary, the rate-limiter gate, and Resend's verified-domain DKIM/SPF path. All three proof requirements met; boundary closed.

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

SESSION_0344 update: local BBL lineage membership checkout proof is green. `/lineage/join` now proves
Checkout cancel and success shells with `E2E_STRIPE_MOCK=1`; the Playwright+Bun bridge seeds disposable
Baseline-branded lineage membership `PricingPlan` rows, drives the real Stripe webhook route with mocked
Stripe line items/subscription retrieval, grants/revokes `UserEntitlement`, and asserts no
`Membership.status` or `ProgramEnrollment` mutation. MB-013 remains open until the same tier shape is
rehearsed through Baseline live test-mode Stripe/webhook delivery and production cleanup/signoff.

SESSION_0345 update: the real signed-webhook path is now proven via a **Stripe CLI local test-mode
rehearsal** (`sk_test` + `stripe listen` -> real Stripe-hosted Checkout -> real signature-verified
`checkout.session.completed`/`invoice.paid`/`customer.subscription.deleted` -> `UserEntitlement`
grant/revoke; no `Membership.status`/`ProgramEnrollment` mutation; all rows cleaned by id). The rehearsal
**caught + fixed a launch-blocking bug** (`SESSION_0345_FINDING_01`): `createLineageMembershipCheckout` and
`createProgramEnrollmentCheckout` rejected checkout for any **returning customer** (existing Stripe customer +
`automatic_tax`/`tax_id_collection` requires `customer_update`). Discovery that blocks a literal cutover:
`baselinemartialarts.com` prod runs a **live** Stripe key, so the "test card on Baseline" step is not runnable
(logged as drift D-018; CUTOVER proxy procedure corrected). What remains for MB-013: money-free verification
of the deployed prod live-webhook destination/secret + a launch-day real-charge-and-refund smoke decision.
Gate #4 below (manual/comp entitlement parity) is now specced as the gift/tier-gating epic
(`GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md`).

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

SESSION_0170 update: Vercel production now lists the S3/media env names (`S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, `NEXT_PUBLIC_MEDIA_BASE_URL`) and the latest production deployment was created after those env names. This partially advances gate 5, but MB-014 remains open because assets were not synced from this machine, no production media-base catalog image URL was observable on public pages, `/merch` still shows `0 items`, and authenticated `/admin/storage/monitoring` proof is blocked on a safe production admin auth path.

SESSION_0171 update: Gate 5 (public media storage) now advanced significantly. Local `.env.production.local` contains all S3 keys; AWS CLI installed locally; bucket `ronin-baseline-s3-bucket-434978747667-us-east-2-an` in `us-east-2` is reachable from local with the IAM credentials; 60 merch JPG/PNGs are uploaded under `images/merch/` (sync dry-run reports 0 changes — local + bucket identical); CloudFront distribution `d1th1bjp9wz9c3.cloudfront.net` is fronted by `NEXT_PUBLIC_MEDIA_BASE_URL` + `S3_PUBLIC_URL` and serves objects publicly (`HTTP/2 200` confirmed). The session also caught and helped the operator resolve four env value defects (region was `us-east-2-an`, secret was truncated to 38 chars, then re-paste was the Stripe live key shape, public URL pointed at the private S3 host) — all four are now mitigated in both Vercel and local `.env.production.local`. SESSION_0171 surfaced one new finding for MB-013: production DB has no `BASELINE_MARTIAL_ARTS` Organization row (User=1 Brian admin, all other tables=0), and the Dirstarter main `prisma db seed` is not production-safe (creates `admin@dirstarter.com`/`user@dirstarter.com` test users and demo Tools/Programs/Courses with FK refs back to those test users). MB-014 stays `open` because authenticated `/admin/storage/monitoring` smoke and the launch-safe production seed are deferred to SESSION_0172. Stripe-key rotation recommended as a precaution because the Stripe live secret was briefly present in `S3_SECRET_ACCESS_KEY` env slot during the in-session F-03 mitigation cycle.

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
