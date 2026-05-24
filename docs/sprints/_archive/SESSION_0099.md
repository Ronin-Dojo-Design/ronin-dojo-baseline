---
title: "SESSION 0099 - S3 Public Media Bridge and Cost Monitor"
slug: session-0099
type: session
status: closed-full
created: 2026-05-08
updated: 2026-05-08
last_agent: codex-session-0099
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0098.md
  - docs/runbooks/aws-s3-operator-runbook.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0099 - S3 Public Media Bridge and Cost Monitor

## Date

2026-05-08 execution session

## Operator

Brian Scott + Codex acting as Petey for staging/prod storage readiness

## Status

closed-full

## Goal

Keep gear and public launch images available locally for development while making staging/prod resolve them from an AWS S3-backed public media base, with an operator runbook and admin-visible S3 cost projection.

## Why This Is Next

SESSION_0098 landed `/gear` with local copied merch assets. Brian explicitly wants the pictures to stay local for dev but be connected to the S3 bucket for staging/prod. This is a storage/media launch-support slice, not a new Stripe product or PWCC product-policy session.

## Source Facts

- Graphify query used during bow-in:
  - `/tmp/graphify-venv/bin/graphify query "SESSION_0099 S3 media images local staging production admin cost projection storage bucket runbook services s3 media" --budget 3000`
- Existing Dirstarter storage layer:
  - `apps/web/services/s3.ts`
  - `apps/web/lib/media.ts`
  - `apps/web/server/web/actions/media.ts`
  - `apps/web/server/admin/media/*`
  - `apps/web/app/admin/media/page.tsx`
- Existing S3 env vars are optional in `apps/web/env.ts`: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`.
- Gear/catalog assets currently hardcode `/images/merch/...` paths in `apps/web/lib/tuffbuffs/*`.
- AWS pricing sources checked on 2026-05-08:
  - https://aws.amazon.com/s3/pricing/
  - https://aws.amazon.com/cloudfront/pricing/
  - https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
  - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

## Dirstarter Alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Storage/media, admin operations, deployment env |
| Extension or replacement | Extension |
| Why justified | Dirstarter already has S3 upload helpers; Ronin needs environment-aware public asset URLs, launch cost visibility, and operator setup guidance. |
| Risk if bypassed | Staging/prod could silently serve missing local-only assets, or storage costs/security settings could remain owner-side tribal knowledge. |

## Petey Plan

### TASK_01 - Bow-in, storage scope, and project-log rows

- **Agent:** Petey + Giddy
- **What:** Create SESSION_0099 and project-log task records before implementation.
- **Done means:** SESSION_0099 has source facts, Dirstarter alignment, pre-flight, task IDs, and no ambiguous owner blocker.

### TASK_02 - Public media URL resolver and gear wiring

- **Agent:** Cody + Desi
- **What:** Add a small client-safe resolver so `/images/...` remains local in dev/test and prefixes to an S3/CloudFront public base in staging/prod.
- **Done means:** Gear cards use resolved URLs, helper tests prove slash normalization and absolute URL passthrough, and local fallback still works.

### TASK_03 - Admin storage monitor and S3 cost projection

- **Agent:** Cody + Doug
- **What:** Add an admin-only storage monitor that estimates current public media storage/request/transfer costs from repo catalog assumptions and env configuration.
- **Done means:** Admin can see projected monthly S3 cost, storage health/config state, and key assumptions without opening AWS Billing.

### TASK_04 - AWS S3 Operator Runbook

- **Agent:** Doug + Petey
- **What:** Create `docs/runbooks/aws-s3-operator-runbook.md` covering bucket, IAM, upload, env vars, verification, lifecycle/security, and current cost projections.
- **Done means:** Brian has a checklist of what to do in AWS/Vercel and a cost model that matches the admin projection.

### TASK_05 - Verification and close

- **Agent:** Cody + Doug + Petey
- **What:** Run focused tests/checks, record any baseline failures, and close SESSION_0099 with review evidence.
- **Done means:** Tests/checks are recorded and SESSION_0099 has a closeout plus Project Log review.

## Pre-flight: Backend/UI - S3 Public Media Bridge

### 1. Auth predicates planned

- Admin storage monitor uses `withAdminPage`.
- No user-upload or private media authorization changes in this session.
- Public gear image URLs remain public display assets only.

### 2. Existing action/component scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes, storage entries name `services/s3.ts` and `lib/media.ts`.
- Existing storage files read: `services/s3.ts`, `lib/media.ts`, `server/web/actions/media.ts`, `server/admin/media/*`, `app/admin/media/page.tsx`.
- Existing admin ops pattern read: `app/admin/billing/monitoring/page.tsx`, `server/admin/billing/monitoring/queries.ts`, `components/admin/sidebar.tsx`.
- L1 component primitives read: `Card`, `Badge`, `Wrapper`, `H3/H4/H5`, `Button`, `Stack`.

### 3. Data flow reference

- `docs/runbooks/deployment.md` consulted for Vercel env var pattern.
- `docs/architecture/security-privacy-payments-monitoring-plan.md` identifies public assets as acceptable in public storage and private certificate/media as future signed/private work.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0001/FS-0014 L1 component bypass, FS-0015 project-log gaps.
- Mitigation: existing primitives were read before UI edits, and Project Log task rows are created before implementation.

## Brian Actions Needed

No secret is needed in chat. After the runbook lands, Brian needs to:

1. Create or choose the AWS account/project for Ronin media.
2. Create the staging/prod S3 buckets or approve one bucket with environment prefixes.
3. Create the least-privilege IAM access key for app uploads.
4. Upload/sync `apps/web/public/images/merch` to the configured public media prefix.
5. Set Vercel env vars for staging/prod: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, and `NEXT_PUBLIC_MEDIA_BASE_URL`.

## Scope Guard

- Do not create AWS resources from Codex.
- Do not paste AWS secrets into docs or chat.
- Do not implement private certificate/media signed URLs in this session.
- Do not create Stripe products or shippable merch checkout in this session.
- Do not remove local images; local dev/test must continue to work without S3.

## What Landed

- Added a client-safe public media URL resolver in `apps/web/lib/public-media-url.ts`.
- Wired `/gear` card/list images through the resolver so local dev keeps `/images/...` and staging/prod can prefix those paths with `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Added `NEXT_PUBLIC_MEDIA_BASE_URL` to env validation and `.env.example`; added `S3_PUBLIC_URL` to `.env.example`.
- Added an admin-only Storage Monitor at `/admin/storage/monitoring`.
- Added storage cost projection logic for current catalog assets and launch/growth/heavy traffic scenarios.
- Added a `Storage Monitor` sidebar link for admins.
- Added `docs/runbooks/aws-s3-operator-runbook.md` with AWS/Vercel setup steps, IAM policy, sync command, verification, and cost assumptions.
- Updated deployment docs, wiki index, manual boundary registry, and project log.

## Files Touched

- `apps/web/lib/public-media-url.ts` - public media URL resolver.
- `apps/web/lib/public-media-url.test.ts` - resolver tests.
- `apps/web/components/web/tuffbuffs/affiliate-gear-card.tsx` - gear card image resolver wiring.
- `apps/web/components/web/tuffbuffs/affiliate-gear-browser.tsx` - list view image resolver wiring.
- `apps/web/server/admin/storage/monitoring/queries.ts` - storage config state and S3 cost projection.
- `apps/web/server/admin/storage/monitoring/queries.test.ts` - projection math tests.
- `apps/web/app/admin/storage/monitoring/page.tsx` - admin storage monitor page.
- `apps/web/components/admin/sidebar.tsx` - admin navigation entry.
- `apps/web/env.ts` - `NEXT_PUBLIC_MEDIA_BASE_URL` validation.
- `apps/web/.env.example` - S3 public URL and public media base placeholders.
- `docs/runbooks/aws-s3-operator-runbook.md` - operator runbook.
- `docs/runbooks/deployment.md` - storage env var cross-link.
- `docs/knowledge/wiki/index.md` - runbook/session index updates.
- `docs/knowledge/wiki/manual-boundary-registry.md` - owner-side AWS setup boundary.
- `docs/protocols/project-log.md` - task/build/review entries.
- `docs/sprints/SESSION_0099.md` - session record.

## Decisions Resolved

- Local dev stays local by default: no `NEXT_PUBLIC_MEDIA_BASE_URL`, no S3 required.
- Staging/prod image origin is env-driven: set `NEXT_PUBLIC_MEDIA_BASE_URL` to S3 or CloudFront media base.
- Recommended production delivery is private S3 bucket plus CloudFront OAC.
- Admin Storage Monitor is a projection/config monitor, not a live AWS Billing API integration.
- Private certificate/student media signed URLs are out of scope for SESSION_0099.
- No AWS resources, IAM keys, or Vercel env vars were created by Codex.

## Open Decisions / Blockers

- Brian must create the AWS bucket/distribution or approve direct public S3 delivery.
- Brian must create least-privilege upload credentials and set Vercel `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, and `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Brian must sync `apps/web/public/images/merch` to the bucket path `images/merch`.
- Staging proof is still pending: `/gear` should load S3/CloudFront image URLs and `/admin/storage/monitoring` should move from `NEEDS_SETUP` to `CONFIGURED`.
- Choose final public media host: CloudFront default domain, `media.baselinemartialarts.com`, or another brand/media domain.

## Verification

- `cd apps/web && bun test lib/public-media-url.test.ts server/admin/storage/monitoring/queries.test.ts` - 6/6 pass.
- `cd apps/web && bun biome check lib/public-media-url.ts lib/public-media-url.test.ts server/admin/storage/monitoring/queries.ts server/admin/storage/monitoring/queries.test.ts app/admin/storage/monitoring/page.tsx components/admin/sidebar.tsx components/web/tuffbuffs/affiliate-gear-card.tsx components/web/tuffbuffs/affiliate-gear-browser.tsx env.ts .env.example` - pass.
- `cd apps/web && bun --env-file=.env -e '<storage monitor query>'` - `NEEDS_SETUP`, 59 catalog objects, 0 missing local paths, launch estimate about `$0.012/month`, growth about `$0.057/month`, heavy direct-S3 about `$27.87/month`.
- `bun run wiki:lint` - 0 errors, 3 existing orphan warnings: `knowledge/wiki/topic-index.md`, `knowledge/wiki/concepts/tournament-ops.md`, `knowledge/wiki/dirstarter-uplift-backlog.md`.
- `git diff --check` - pass.
- `cd apps/web && bun run typecheck` - route types generated, then `tsc --noEmit --pretty false` produced no TypeScript output after several minutes and was terminated with SIGTERM. Recorded as inconclusive, not a pass.

## Task Log

- `SESSION_0099_TASK_01` - landed.
- `SESSION_0099_TASK_02` - landed.
- `SESSION_0099_TASK_03` - landed.
- `SESSION_0099_TASK_04` - landed.
- `SESSION_0099_TASK_05` - landed.

## Review Log

- `SESSION_0099_REVIEW_01` recorded in Project Log.
- `SESSION_0099_FINDING_01` remains open for owner-side AWS bucket/distribution/IAM/env setup and staging proof.

## Hostile Close Review

- **Giddy:** Dirstarter alignment holds. This extends existing `services/s3.ts`, `lib/media.ts`, and env validation rather than replacing storage/media. No schema or private-media policy was changed.
- **Doug:** Verification is adequate for the local code slice, but staging is not ready until Brian completes AWS and Vercel setup. Typecheck is inconclusive and must not be represented as passed.
- **Score:** 9.5/10 for the local storage bridge and runbook. Cap remains on launch readiness until staging proof exists.

## ADR / Ubiquitous Language Check

- No new ADR needed. This is an implementation extension of the existing Dirstarter S3/media baseline.
- No glossary update needed. No new domain term was introduced beyond public media base URL/operator runbook language.

## Next Session

- **Recommended goal if Brian completes AWS setup first:** Staging storage proof: verify `/gear` image URLs, `/admin/storage/monitoring`, upload helper behavior, CloudFront/OAC access, and AWS Billing sanity after sync.
- **Recommended goal if AWS setup is not done yet:** Return to the SESSION_0098 recommendation: formal PWCC/TuffBuffs commerce port map separating affiliate display, Stripe products, fulfillment, certificate orders, memberships, tournament fees, and outbound emails.
- **First task:** Read `docs/runbooks/aws-s3-operator-runbook.md`, `docs/sprints/SESSION_0099.md`, `apps/web/lib/public-media-url.ts`, and `apps/web/server/admin/storage/monitoring/queries.ts`; then decide whether the session is AWS staging proof or PWCC policy mapping.

## Reflections

- The useful split was keeping public catalog URL resolution separate from server-side S3 upload helpers. That lets local dev stay frictionless while staging/prod swap image origins with one env var.
- The admin monitor should be treated as a projection until AWS Billing/Cost Explorer is deliberately integrated. Adding billing permissions just to show an early estimate would be the wrong tradeoff.
- CloudFront OAC is the safer default for public production assets, but direct S3 public delivery remains a possible short staging bridge if Brian chooses speed over the stricter posture.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | New `SESSION_0099.md` and `aws-s3-operator-runbook.md` have frontmatter; touched docs frontmatter updated where relevant: Project Log, Deployment, Wiki Index, Manual Boundary Registry. |
| Backlinks/index sweep | Wiki index includes SESSION_0099 and AWS S3 Operator Runbook; deployment and manual-boundary docs cross-link the runbook. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 existing orphan warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0099_REVIEW_01` and `SESSION_0099_FINDING_01` recorded in Project Log. |
| Review & Recommend | Next Session section present with AWS-proof and PWCC alternatives. |
| Memory sweep | Manual Boundary Registry updated with owner-side S3 setup gates; no operator memory write needed. |
| Next session unblock check | Code-side work is unblocked; staging proof is blocked on Brian completing AWS/Vercel setup. |
| Git hygiene | Branch `main`; worktree list includes main plus existing SESSION_0085 worktrees; changes remain uncommitted because no commit was requested. |

