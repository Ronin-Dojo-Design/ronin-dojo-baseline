---
title: "SESSION 0683 — G-033 kernel extraction: inbox → packages/ui-kit feature-module (mount per brand)"
slug: session-0683
type: session--staged
status: staged
created: 2026-07-24
updated: 2026-07-24
last_agent: session-0641-tidy
sprint: S12
lane: kernel
recipe: "Epic_Lane"
goal_ids: [G-033]
pairs_with:
  - docs/knowledge/wiki/goals-ledger.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0683 — G-033 kernel extraction (inbox feature-module)

> **Staged by SESSION_0641 (operator-directed, for AFTER tomorrow's AM Coffee Merge Review).** Adopt:
> flip `status:` → `in-progress`. This is the slice-2 epic that makes "every brand's inbox from ONE
> shared kernel" true (ADR 0051 kernel→brand→app). Not urgent — queued behind the merge review.

## Goal

Slice 1 (#269, SESSION_0641) built the working inbox **inside BBL (`apps/web`)** to prove the pattern:
`InboundEmail` model · svix-verified `/api/resend/webhooks` · AdminCollection `/app/inbox` · oRPC
`inbox` router · `email.manage` authz. It is **NOT** a kernel module — it lives app-local. This epic
**extracts it into `packages/ui-kit` as a brand-agnostic feature-module** and **mounts it per brand
app** so BBL / Baseline / MMB (and future instances) all consume the ONE module.

## First task (`/pp` this into fan-out lanes)

1. **Extract** the brand-agnostic core from `apps/web` → `packages/ui-kit` (the ADR 0040 Option-B
   "extract the L1 down" move, [[kernel-extracts-dirstarter-l1-not-cleanroom]]): the verify module,
   payload parser, the AdminCollection table + columns, the oRPC router shape, the Prisma model
   fragment. Keep app-specific wiring (auth adapter, env, brand resolution) as injected seams.
2. **Mount on BBL** — swap `apps/web`'s app-local copy to consume the kernel module (behavior-preserving;
   the #269 tests are the regression net).
3. **Mount on MMB** (`clients/mammoth-build-crm`) — replace the SESSION_0641 placeholder `/app/inbox`
   (surface + "pending Resend" banner) with the real module: add its `InboundEmail` table (own DB, ADR
   0038), the webhook endpoint, the AdminCollection surface. Gated on a Mammoth Resend account (operator).
4. **Baseline** (White Labeled Dojo) — mount so every white-label instance inherits it.
5. **Multi-account secret:** the current module holds ONE `RESEND_WEBHOOK_SECRET`; brands in SEPARATE
   Resend accounts (BBL vs Baseline) need a per-account/per-brand secret — design this into the seam.
6. **RDD** (`apps/rdd`) is a static marketing site with no admin/DB — decide: give it an admin, or let
   RDD mail surface in another brand's admin. (Fork for the operator.)

**Cross-refs:** [G-033](../knowledge/wiki/goals-ledger.md) (+ its activation checklist), SESSION_0641
(slice 1 + MMB placeholder), ADR 0051 / ADR 0040 / ADR 0038, `admin-collection-one-surface-law`.

## Next session
