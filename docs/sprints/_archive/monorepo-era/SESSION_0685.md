---
title: "SESSION 0685 — MMB review-request engine (draft/approval, consent-first)"
slug: session-0685
type: session--closed
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: session-0685-mmb-review-engine
sprint: S12
lane: mmb
recipe: "overnight-orchestrator-waves"
goal_ids: []
pairs_with:
  - docs/product/mammoth-build/templates/review-request-sequences.md
  - docs/architecture/research/research-review-mmb-social-automation.md
  - clients/mammoth-build-crm/prisma/schema.prisma
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0685 — MMB review-request engine (draft/approval, consent-first)

CODE lane in the Mammoth CRM overnight-orchestrator run, worktree `/Users/brianscott/dev/ronin-0685`,
branch `auto/session-0685-mmb-review-engine`. Sibling lane 0687 owns the posting subtree of the same
app (`app/posting`, `lib/posting`) — untouched here.

## Goal

Build a review-request engine: on a completed-job trigger, render a templated review ask
(review-request-sequences.md) that lands in a DRAFT/APPROVAL state. Consent-first (TCPA): SMS
requires explicit prior-express-written consent; default channel email; every message carries an
opt-out; the engine NEVER sends — it stops at "approved, awaiting send."

## What landed

- **Prisma schema** (`clients/mammoth-build-crm/prisma/schema.prisma`): `ReviewRequest` model +
  `ReviewRequestStatus` (`draft|approved|sent`, this codebase only ever writes `draft`/`approved`),
  `ReviewChannel` (`email|sms`), `ReviewSequenceStep` (`first_touch|follow_up`),
  `ReviewRequestRoute` (`google_request|private_recovery`), `ReviewConsentBasis`
  (`email_business_relationship|sms_prior_express_written_consent`). Added `Contact.smsConsent`
  (explicit prior-express-written consent, default `false`) and the `reviewRequests`/`approvedReviews`
  back-relations on `Project`/`Contact`/`TeamMember`.
- **Generator** (`lib/reviews/generator.ts` + `lib/reviews/templates.ts`) — pure `planReviewRequest`:
  renders the review-request-sequences.md copy verbatim (SMS/email × first-touch/follow-up ×
  google-request/private-recovery = the doc's full matrix), given a per-customer input + a sender
  config. Routes to `private_recovery` (suppressing the Google ask entirely) when the project has an
  open Resolution Task, per the doc's routing rules.
- **Consent gate** (`lib/reviews/consent.ts`) — `assertConsentToSend`: throws `ConsentGuardError` for
  SMS without `smsConsent`, or for any channel once `optOut` is set. This is the ONE place
  send-eligibility is decided; the generator's channel resolver (`lib/reviews/generator.ts`) can
  never itself produce an SMS draft for an unconsented contact (SMS is only selected when BOTH
  preferred AND consented — default is always email).
- **Transitions** (`lib/reviews/transitions.ts`) — `assertApprovable`: the pure `draft → approved`
  guard (the ONLY transition this engine performs; re-runs the consent gate). No code path anywhere
  in this lane writes `status: "sent"`.
- **Server actions** (`lib/reviews/actions.ts`, `"use server"`) — `generateReviewRequestDraft(projectId,
  step?)` (the completed-job trigger's render+persist half) and `approveReviewRequest(reviewRequestId)`
  (re-checks LIVE `Contact.smsConsent` + the request's own `optOut`, not the draft-time snapshot, then
  writes `approved`). Both reuse the app's existing owner-gate (`requireOwner`/`requireOwnedProject`,
  now exported from `lib/actions.ts`) rather than building a second auth path.
- **Config** (`lib/reviews/config.ts`) — sender identity + link copy from env (`.env.example`
  documented below); unset values render the doc's own bracket placeholders so an unconfigured deploy
  is visibly a draft, never invented business copy.
- **Tests** (hermetic, no DB): `lib/reviews/generator.test.ts` (7), `lib/reviews/consent.test.ts` (5),
  `lib/reviews/transitions.test.ts` (7) — 19 new tests, all pure-function (bun:test, no Prisma client
  touched). Full suite: 67 pass / 0 fail.

**Explicitly not built** (HOLD EXTERNAL ACTIONS, out of scope): the actual send action/provider call,
the completed-job trigger wiring itself (a `Project.stage → complete` hook calling
`generateReviewRequestDraft`), the follow-up scheduler (the renderer supports `step: "follow_up"`
already; nothing calls it on a timer), and any UI under `app/reviews/**` (not requested by the
deliverable — `lib/reviews/**` alone satisfies "generator + server action + tests").

## Proposed ledger edits

- **Shared-file touches (minimal, flagged per HARD RULE #2):**
  - `clients/mammoth-build-crm/prisma/schema.prisma` — additive only (new enums/model + one new
    `Contact` column + back-relation arrays on `Project`/`Contact`/`TeamMember`); no existing field
    changed or removed. Pre-approved by the dispatch prompt ("review-request additions to that app's
    prisma schema" is explicitly in-scope for this lane).
  - `clients/mammoth-build-crm/lib/actions.ts` — added `export` to two already-existing, unchanged
    functions (`requireOwner`, `requireOwnedProject`) so `lib/reviews/actions.ts` reuses the ONE
    owner-gate instead of duplicating it. No behavior change to any existing caller.
  - `clients/mammoth-build-crm/.env.example` — appended a new "Review-request engine" section (7 new
    optional env vars, all commented out / all business copy, no secrets).
- **Migration-apply = merge-owner step.** Per the dispatch's bootstrap note (fresh worktree, no live
  DB reachable, `migrate dev` banned against any shared DB, and a sibling lane touches the same app's
  schema concurrently): this lane ran `bunx prisma generate` (clean, `REAL_EXIT=0`) but did **NOT**
  run `prisma migrate dev` — no migration `.sql` file exists yet for these model changes. The merge
  owner must run `bunx prisma migrate dev` (or `--create-only` + review) against `mammoth_dev` once
  this PR (and any concurrently-landing schema changes from lane 0687) are reconciled, then commit the
  generated migration file — prod applies it automatically via the `prebuild → migrate deploy` hook
  (`docs/runbooks/database/schema-migration.md`).
- **Consent basis (TCPA), for Larry's review:**
  - **SMS** = `sms_prior_express_written_consent` — gated on `Contact.smsConsent`, an explicit
    boolean captured at intake, default `false` (silence never implies consent). The generator can
    only select the SMS channel when a customer both prefers it AND `smsConsent === true`; the
    consent gate (`assertConsentToSend`) is re-run at approval time against the LIVE `Contact` value,
    not the draft-time snapshot, and blocks approval if consent was revoked or an opt-out was
    recorded in between. Every SMS message body carries `Reply STOP to opt out.` inline.
  - **Email** = `email_business_relationship` — an established transactional relationship (a
    completed, satisfied installation); every email carries a working unsubscribe link
    (`emailUnsubscribeLink`) in the body (CAN-SPAM posture, not a TCPA claim).
  - **No send path exists in this lane.** `ReviewRequestStatus` reserves `sent` but nothing here ever
    writes it; the engine's terminal state is `approved` — dispatching to a live email/SMS provider
    is a separate, later, operator-gated step.
  - **Private service-recovery branch**: an open Resolution Task suppresses the Google-review ask
    entirely (routes to `private_recovery`, never `google_request`) regardless of channel/consent —
    matches the source doc's routing rule #2 (never solicit a public review while a concern is open).

## Verification table

| Gate | Command | REAL_EXIT | Notes |
| --- | --- | --- | --- |
| Bootstrap install | `bun install` (from `clients/mammoth-build-crm`) | 0 | 236 packages, `ui-kit` symlink OK |
| Prisma format | `bunx prisma format` | 0 | Schema additions formatted clean |
| Prisma generate | `bunx prisma generate` | 0 | Own DB per ADR 0038; no live connection needed for generate |
| Typecheck | `bun run typecheck` (`tsc --noEmit`) | 0 | |
| Tests | `bun run test` (`bun test --parallel=1`) | 0 | 67 pass / 0 fail (19 new: generator 7, consent 5, transitions 7) |

## Full close evidence

- Identity confirmed: `pwd` → `/Users/brianscott/dev/ronin-0685/clients/mammoth-build-crm`,
  `git branch --show-current` → `auto/session-0685-mmb-review-engine`, run before every write.
- Owned-path discipline: all new code under `lib/reviews/**`; only 3 shared files touched, each
  additive-only and logged above with rationale.
- No `git add -A` used; every stage below is explicit paths.
- HOLD EXTERNAL ACTIONS honored: no send action, no live provider call, no trigger wiring, no cron —
  engine stops at `approved`.

## Open decisions / blockers

None blocking. Follow-ups for a later lane (not this one): wire the `Project.stage → complete`
trigger to call `generateReviewRequestDraft`; build the approval-queue UI (`app/reviews/**`); wire the
actual send step once an SMS/email provider is chosen; the merge owner runs `prisma migrate dev` for
this PR (see Proposed ledger edits).

## Next session

Continue the overnight-orchestrator wave per the operator's dispatch plan.
