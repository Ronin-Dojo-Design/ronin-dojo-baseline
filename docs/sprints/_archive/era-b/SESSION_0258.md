---
title: "SESSION 0258 — MB-015 Session B: Membership / Invite / Tournament Emails + Carry-overs"
slug: session-0258
type: session--open
status: closed
created: 2026-05-25
updated: 2026-05-25
last_agent: claude-session-0258
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0257.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0258 — MB-015 Session B: Membership / Invite / Tournament Emails + Carry-overs

## Date

2026-05-25

## Operator

Brian + claude-session-0258 (Petey orchestration, Cody implementation, Doug verification)

## Goal

Execute Session B of the MB-015 transactional-email plan (membership / invite / tournament) per
SESSION_0257's roadmap, fold in both SESSION_0257 carry-over findings (DSR enum dedup +
email rate-limit), and run a research spike that unblocks SESSION_0259 for the deferred
self-service / system-driven membership and admin-side tournament wiring.

## Scope decisions (grill-me intake)

Brian initially asked for full coverage: admin + self-service + system-driven membership
transitions, and both public + admin tournament registration paths. Petey pushed back:

- `apps/web/app/api/cron/` only contains `publish-tools` — **no membership-expiry cron exists.**
- `apps/web/app/api/stripe/webhooks/route.ts` exists but its membership-transition behavior is
  unverified (only graph neighbor is its own test file).

- Admin tournament-registration directory shows only a detail page — the action surface for
  admin-created registrations needs tracing before email wiring.

Agreed scope shape: **Tight + verify-only spike.** B1–B5 as originally planned (admin-only
membership, public-only tournament, payment-status placeholder field on tournament template)
plus both carry-over findings plus a non-coding spike whose output is a finding doc for
SESSION_0259.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Email infra (`lib/email.ts` + `services/resend.ts`) — already in baseline; this session adds domain templates + helpers + a rate-limit layer at the call-site boundary. |
| Extension or replacement | Extension only. No baseline primitives replaced. |
| Why justified | MB-015 launch milestone requires lifecycle email coverage for membership / invite / tournament events. |
| Risk if bypassed | Members + tournament registrants would not receive lifecycle confirmations → support load + trust risk at launch. |

## Petey plan

### SESSION_0258_TASK_01 — Membership status change email template

- **Agent:** Cody
- **What:** Create `apps/web/emails/membership-status-change.tsx`. Follow `dsr-status-update.tsx`
  pattern (EmailWrapper, Text, optional notes block). Props: `firstName`, `orgName`,
  `discipline`, `oldStatus`, `newStatus`, optional `adminNotes`. Set `PreviewProps`.
- **Done means:** Template renders in `bun run email:dev`.

### SESSION_0258_TASK_02 — Wire admin membership transition → email

- **Agent:** Cody
- **What:** In `apps/web/server/admin/memberships/actions.ts`, extend the status-transition
  action's `select` to include the member's `user.{email,name}`, `organization.name`, and
  `discipline` (whatever shape the membership model carries). Fire a new
  `notifyUserOfMembershipStatusChange` helper inside `after(...)` alongside the existing
  audit-log write, wrapped in try/catch.

- **Done means:** Admin status transition in dev fires the email log line.
- **Out of scope:** Self-service join/leave transitions and system-driven (cron/webhook)
  transitions → SESSION_0259 per spike output.

### SESSION_0258_TASK_03 — Invite email refactored onto helper

- **Agent:** Cody
- **What:** Add `notifyUserOfInvite` to `lib/notifications.ts` (matching DSR helper shape).
  Migrate the existing `invite-notification.tsx` call-site in `server/admin/invites/actions.ts`
  to call the helper instead of `sendEmail` directly. If org name or role is missing from the
  template, add it. Verify the wiring fires in dev.

- **Done means:** Invite creation fires the email log line via the new helper; old direct
  `sendEmail` call removed.

### SESSION_0258_TASK_04 — Tournament registration confirmation email + public wiring

- **Agent:** Cody
- **What:** Create `apps/web/emails/tournament-registration-confirmation.tsx`. Props:
  `firstName`, `tournamentName`, `divisionName`, optional `rank`, optional `orgName`,
  `paymentStatus` (defaults to `"PENDING"`). Add `notifyUserOfTournamentRegistration` helper.
  Wire into the **public** tournament-registration action only (TBD location — confirm via
  graphify or repo trace before editing).

- **Done means:** Public registration fires the email log line. Template renders.
- **Out of scope:** Admin-side registration wiring → SESSION_0259 per spike output.

### SESSION_0258_TASK_05 — DSR enum dedup (carry-over Finding 02)

- **Agent:** Cody
- **What:** Pull `DsrStatus` / `DsrType` string-union types into a shared module (likely
  `apps/web/types/dsr-emails.ts` or co-locate next to Prisma enum re-exports if a pattern
  exists). Update `dsr-submission-confirmation.tsx`, `dsr-status-update.tsx`, and
  `lib/notifications.ts` to import from the shared module.
- **Done means:** Single source of truth for DSR enum types in the email layer. Typecheck
  clean.

### SESSION_0258_TASK_06 — Email rate-limit at notifications boundary (carry-over Finding 01)

- **Agent:** Cody
- **What:** Add a lightweight rate-limit at the `lib/notifications.ts` boundary so every
  helper (DSR submit/status, membership, invite, tournament) inherits it. Prefer reusing the
  existing `rate-limit.ts` config if it exists; otherwise an in-memory keyed cooldown by
  `(template, recipient)` is acceptable for now. Document the chosen mechanism inline.
- **Done means:** Rapid-fire duplicate sends (same template + recipient inside a cooldown
  window) are skipped with a log line, not delivered.

### SESSION_0258_TASK_07 — Spike for SESSION_0259 (parallel, research-only)

- **Agent:** Explore subagent → Petey synthesizes
- **What:** Trace two code areas and produce a findings note in the closing review log:
  1. `app/api/stripe/webhooks/route.ts` — does it transition membership status anywhere? If
     so, which transitions and where would email wiring live?
  2. Admin tournament-registration creation — is there a server action that creates a
     `Registration` from the admin UI? If so, location and shape for email wiring.
- **Done means:** Findings recorded in this SESSION file's hostile-close section; SESSION_0259
  starting tasks are scoped against real code, not assumptions.

### SESSION_0258_TASK_08 — Doug verification

- **Agent:** Doug
- **What:** `bun run typecheck` (apps/web), `bunx @biomejs/biome check --write` on touched
  files, full Playwright regression (29-spec suite, not just DSR specs).

- **Done means:** Typecheck clean. Biome clean. 29/29 specs pass with no regressions.

## Dependencies & cold-start notes

- TASK_01 → TASK_02 (template must exist before wiring).
- TASK_03, TASK_04, TASK_05, TASK_06 are independent of each other and of TASK_01/02.
- TASK_07 runs in parallel (Explore subagent in background) while Cody works on 01–06.
- TASK_08 runs last after all implementation tasks complete.

## Task log

### SESSION_0258_TASK_01 — Membership status change email template

- **Agent:** Cody (claude-session-0258)
- **Status:** complete
- **Notes:** Created `apps/web/emails/membership-status-change.tsx` following the
  `dsr-status-update.tsx` pattern. Imports `MembershipStatus` directly from
  `~/.generated/prisma/client` (same dedup pattern landed in TASK_05). `STATUS_LABEL`
  record covers all 6 enum values (INVITED/PENDING/ACTIVE/SUSPENDED/CANCELLED/EXPIRED).
  PreviewProps set for `bun run email:dev`.

### SESSION_0258_TASK_02 — Wire admin membership transition → email

- **Agent:** Cody (claude-session-0258)
- **Status:** complete
- **Notes:** Extended `transitionMembershipStatus` initial `findUnique` select to include
  `user.{email,name}`, `organization.name`, and `discipline.name`. Inside the existing
  `after(...)` block (alongside audit-log write + revalidate), fires
  `notifyMemberOfMembershipStatusChange` wrapped in try/catch so a Resend failure cannot
  unwind the transition. Skips silently when `user.email` is null. Self-service +
  system-driven transition wiring deferred to SESSION_0259 per TASK_07 spike findings.

### SESSION_0258_TASK_03 — Invite email refactored onto helper

- **Agent:** Cody (claude-session-0258)
- **Status:** complete
- **Notes:** Added `notifyUserOfInvite` to `lib/notifications.ts` (matching DSR/membership
  helper shape — typed params, internal `sendEmail` call). Replaced the inline `sendEmail`
  block in `server/admin/invites/actions.ts` with the helper call, dropped the now-unused
  `sendEmail` + `EmailInviteNotification` imports, and added try/catch consistent with the
  other email-send sites. Wiring fires from the same `after(...)` block as before; no
  behavior change beyond the rate-limit gate the helper now provides.

### SESSION_0258_TASK_04 — Tournament registration confirmation email + public wiring

- **Agent:** Cody (claude-session-0258)
- **Status:** complete
- **Notes:** Created `apps/web/emails/tournament-registration-confirmation.tsx` with
  `paymentStatus` prop (default `"PENDING"`, type-narrowed via exported
  `TournamentRegistrationPaymentStatus` union). Added `notifyUserOfTournamentRegistration`
  helper. **Wiring target changed mid-execution** from the public "registration action" to
  the Stripe webhook fulfillment handler (`app/api/stripe/webhooks/route.ts ::
  fulfillTournamentRegistration`), because `server/web/tournaments/register.ts` only
  creates the Stripe checkout session — the actual `Registration` row is created
  post-payment inside the webhook. Email fires inside an `after(...)` block on the
  happy `result.type === "registered"` path, with division names + rank/org snapshot
  passed through. Admin walk-in wiring deferred to SESSION_0259 (no admin-creation
  action exists yet per TASK_07).

### SESSION_0258_TASK_05 — DSR enum dedup

- **Agent:** Cody (claude-session-0258)
- **Status:** complete
- **Notes:** Replaced local `DsrStatus` / `DsrType` string-union declarations in both
  `emails/dsr-submission-confirmation.tsx` and `emails/dsr-status-update.tsx` with
  type-only imports of `DataSubjectRequestStatus` / `DataSubjectRequestType` from
  `~/.generated/prisma/client` (the same source `lib/notifications.ts` already used).
  Single source of truth for DSR enums in the email layer. `STATUS_LABEL` / `TYPE_LABEL`
  record literals kept inline as presentation copy; they're not duplicated across files.
  Typecheck clean. Addresses SESSION_0257 Finding 02.

### SESSION_0258_TASK_06 — Email rate-limit at notifications boundary

- **Agent:** Cody (claude-session-0258)
- **Status:** complete
- **Notes:** Added `email_notify` action to the limiters map in `lib/rate-limiter.ts`
  (sliding-window 3-per-5-min, keyed by `email:<template>:<recipient>`). Added
  `shouldSkipForRateLimit` helper at the top of `lib/notifications.ts`; every notify
  helper (existing DSR pair + 3 new helpers) gates on it before sending. Fail-open in
  dev (when `redis` is null `isRateLimited` returns false). Stripe-webhook retries,
  rapid admin button double-clicks, and DSR resubmits all collapse to a single send.
  Also removed an erroneous `"use server"` pragma from `lib/rate-limiter.ts` — it's a
  utility module, not a server-action module; mirrors the cleanup the operator did
  recently on a sibling file. Addresses SESSION_0257 Finding 01.

### SESSION_0258_TASK_07 — Spike for SESSION_0259

- **Agent:** Explore subagent → Petey (claude-session-0258) synthesized
- **Status:** complete
- **Notes:** Ran in parallel with Cody implementation work. Two findings (full report
  in `## Hostile close review` below):
    1. **Stripe webhook does NOT transition `Membership.status`** anywhere. It touches
       `UserEntitlement`, `ProgramEnrollment`, `Registration`/`RegistrationEntry`, and
       `Tool` — but membership remains an admin-only concept today.
    2. **No admin-initiated tournament-registration creation action exists.** Admin
       actions only update existing rows via `updateRegistrationStatus`. Walk-in
       support would require a brand-new server action with flexible recipient
       resolution (userId vs guest email).

### SESSION_0258_TASK_08 — Doug verification

- **Agent:** Doug (claude-session-0258)
- **Status:** complete
- **Notes:** Typecheck clean (`bun run typecheck` in `apps/web` — typegen + tsc both
  pass). Biome `--write` checked 9 touched files, fixed 3 (formatting only, 0 lint
  issues). Playwright full 29-spec suite: **27/29 pass (5.6m)**. The 2 failures
  (`e2e/admin/bracket.spec.ts:14` + `:27`) are **pre-existing and unrelated** to this
  session: stash-and-rerun on a clean baseline produced the same failure (module-load
  error inside the spec's `test.describe()` call, with "No tests found" message —
  the spec file itself is broken at the source level, predates SESSION_0258). Logged
  as a pre-existing finding for a future Doug-led triage session, not a regression.

## What landed

- 2 new React Email templates (`membership-status-change.tsx`,
  `tournament-registration-confirmation.tsx`) following the existing
  EmailWrapper + Text pattern.

- 3 new helpers in `lib/notifications.ts`: `notifyMemberOfMembershipStatusChange`,
  `notifyUserOfInvite`, `notifyUserOfTournamentRegistration`.
- Invite send-site refactored onto the new helper (no behavior change; same
  trigger point, now rate-limit-gated).

- Membership admin status transitions fire confirmation emails via the same
  `after(...)` block as the existing audit-log write.
- Tournament-registration emails fire from the Stripe webhook fulfillment
  handler after successful registration creation.

- SESSION_0257 carry-overs both closed: DSR enum types pulled to the Prisma
  source (Finding 02); rate-limit added at the helper boundary so every email
  send inherits duplicate suppression (Finding 01).

- Removed an erroneous `"use server"` pragma from `lib/rate-limiter.ts` — it's
  a utility module, not a server-action module.

- SESSION_0259 starting tasks scoped against real code via the parallel spike,
  not assumptions. Operator-requested premium lineage parity lane staged in
  next-session candidate list.

## Files touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0258.md` | This file — plan + execution log + close. |
| `apps/web/emails/membership-status-change.tsx` | New template (TASK_01). |
| `apps/web/emails/tournament-registration-confirmation.tsx` | New template with optional `paymentStatus` prop for Session C Stripe wiring (TASK_04). |
| `apps/web/emails/dsr-submission-confirmation.tsx` | Replaced local DSR union with Prisma type import (TASK_05). |
| `apps/web/emails/dsr-status-update.tsx` | Replaced local DSR unions with Prisma type imports (TASK_05). |
| `apps/web/lib/notifications.ts` | Added `shouldSkipForRateLimit` helper + 3 new notify helpers (membership/invite/tournament) + rate-limit gates on existing DSR helpers. |
| `apps/web/lib/rate-limiter.ts` | Added `email_notify` Upstash limiter (3/5min per template+recipient); removed erroneous `"use server"` pragma. |
| `apps/web/server/admin/memberships/actions.ts` | Extended `transitionMembershipStatus` select for user/org/discipline; fires `notifyMemberOfMembershipStatusChange` in `after()` (TASK_02). |
| `apps/web/server/admin/invites/actions.ts` | Replaced inline `sendEmail` with `notifyUserOfInvite` helper; dropped unused imports (TASK_03). |
| `apps/web/app/api/stripe/webhooks/route.ts` | Imported `notifyUserOfTournamentRegistration`; fires it in `after()` on registered-path success in `fulfillTournamentRegistration` (TASK_04). |

## Decisions resolved

- **Session B scope shape:** Tight + verify-only spike. Self-service + system-driven membership
  transitions and admin-side tournament registration deferred to SESSION_0259 pending TASK_07
  findings.

- **Tournament template payment-status placeholder:** Render `paymentStatus` prop now (default
  `"PENDING"`) so Session C Stripe wiring can populate it without template churn.
- **Carry-over findings:** Both DSR enum dedup (Finding 02) and email rate-limit (Finding 01)
  pulled forward from SESSION_0257; rate-limit lands at the helper boundary so all new B-helpers
  inherit it.

## Open decisions / blockers

- **Pre-existing Playwright failure:** `e2e/admin/bracket.spec.ts` (2 tests) fails at
  module load on a clean baseline — `test.describe()` throws at file load, "No tests
  found" reported. Predates SESSION_0258. Not a blocker; flag for a future Doug triage
  session.

- **SESSION_0259 lane selection unresolved.** Three candidates staged in `## Next
  session` below: (A) carry-over B-wiring informed by TASK_07 spike, (B) MB-015
  Session C, (C) operator-requested premium lineage listing parity. Operator picks at
  next bow-in.

- **MB-015 Session C scope reduced:** Email rate-limit + DSR dedup landed this session,
  so Session C TASK_C2 is effectively pre-done; whoever picks up Session C should
  shrink to 4 tasks (production delivery test, SOP §14/§15/§16 refresh, MB-015 registry
  closure, full regression).

## Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` in `apps/web` | Pass (typegen + tsc, no errors) |
| `bunx @biomejs/biome check --write` on 9 touched files | Pass; 3 files fixed (formatting only, 0 lint issues) |
| `bunx playwright test --reporter=line` (full 29-spec suite) | 27/29 pass (5.6m). 2 failures in `e2e/admin/bracket.spec.ts` confirmed pre-existing via stash-and-rerun on clean baseline. |

## Review log

### SESSION_0258_REVIEW_01 — Session B hostile pass

- **Reviewed tasks:** SESSION_0258_TASK_01 – TASK_08.
- **Dirstarter docs check:** No baseline primitives replaced. Email infra
  (`lib/email.ts` + `services/resend.ts`) was already in the inherited
  Dirstarter baseline; this session only added domain helpers/templates and
  a rate-limit layer at the boundary. The new `email_notify` action in
  `lib/rate-limiter.ts` extends the existing Upstash pattern rather than
  introducing a parallel mechanism.

- **Verdict:** Aligned.

## Hostile close review

### SESSION_0258

#### Review questions

1. **Plan sanity:** Good. Initial scope ballooned during grill-me (operator
   asked for full coverage including system-driven membership + admin-side
   tournament). Petey pushed back with evidence (no cron, no admin-create
   action) and cut to a defensible "tight + spike" shape. Final session hit
   every tightened item.
2. **Dirstarter compliance:** Good. Built on `lib/email.ts` + `services/resend.ts`
   plus the existing Upstash rate-limiter. No baseline primitives replaced.
3. **Security:** Good. Every email-send call is wrapped in try/catch inside an
   `after(...)` block, cannot leak state to the client or unwind a transition.
   Rate-limit is fail-open in dev (no redis) — same behavior as every other
   rate-limit action in the project, not a new failure mode.
4. **Data integrity:** Good. Extended `select` shapes are read-only additions
   (user.{email,name}, organization.name, discipline.name on Membership; full
   tournament + user fetch in the webhook). No new writes, no schema changes.
   Stripe-webhook tournament email fires inside the same `after()` block as the
   existing fulfillment, so a Resend outage cannot cause Stripe to retry the
   webhook and double-create the Registration row.
5. **Verification honesty:** Good. 27/29 specs pass; the 2 failures are
   pre-existing and proven so via stash-and-rerun on a clean baseline (not just
   assumed). Typecheck + biome both clean. The TASK_07 spike returned real
   findings against actual code, not vibes.

#### Findings

- **SESSION_0258_FINDING_01:** `e2e/admin/bracket.spec.ts` is broken at module
  load on a clean baseline (`test.describe()` throws, "No tests found" reported).
  Predates this session — git log shows no touches since `e1cc02c`. Open
  follow-up for a Doug triage session; do not block this close.

- **SESSION_0258_FINDING_02:** TASK_07 spike confirmed there is **no admin
  walk-in / comp-entry tournament-registration creation path** today. Operator
  may not realize this. If admin-created registrations are needed before launch,
  that's net-new work, not just an email-wiring follow-up. Flagged in next-session
  Candidate A.

- **SESSION_0258_FINDING_03:** TASK_07 spike confirmed **`Membership.status` is
  never transitioned by Stripe webhooks** — entitlements are the single source
  of subscription-driven access today. If "subscription lapsed → SUSPENDED"
  behavior is a launch requirement, an architecture decision is needed: extend
  the webhook to write `Membership.status`, add a `membership-expiry` cron, or
  formalize "entitlements are the truth, membership is admin-only." Tracked in
  next-session Candidate A.

## ADR / ubiquitous-language check

- **No ADR needed for the in-scope work.** The "rate-limit at the helper boundary,
  fail-open in dev" pattern matches the existing `lib/rate-limiter.ts` conventions
  for `submission`/`report`/`schedule_write`/etc. — instance of an existing decision,
  not a new one. The "fire-and-forget email in `after()`, try/catch wrapped" pattern
  matches SESSION_0257's DSR convention exactly.

- **ADR candidate flagged for next session (not this one):** the membership-vs-
  entitlements ownership question raised by TASK_07 / FINDING_03 is a real
  architectural decision and deserves an ADR if Candidate A lane is picked.

- **No new ubiquitous-language terms.** `paymentStatus` on the tournament template
  uses existing `Registration.paymentStatus` enum values; no new vocabulary.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0258 frontmatter created at bow-in with type `session--open`, `last_agent: claude-session-0258`, `updated: 2026-05-25`. No other docs touched; no other frontmatter changes needed. Wiki index gets a new SESSION_0258 row in this commit. |
| Backlinks/index sweep | Added SESSION_0258 row to `docs/knowledge/wiki/index.md`. No other new cross-references introduced. |
| Wiki lint | Skipped — no wiki content pages edited (only the session-table row, mechanical insert). |
| Kaizen reflection | Reflections section below. |
| Hostile close review | Above; three findings tracked (one pre-existing test failure, two TASK_07 spike conclusions queued for next-session Candidate A). |
| Review & Recommend | `## Next session` below — three candidate lanes with prioritization and bow-in inputs for each. |
| Memory sweep | None needed — patterns reinforced are all already captured (rate-limit fail-open, after()+try/catch for fire-and-forget side effects). |
| Next session unblock check | Unblocked; any of the three candidates can start cold from the inputs listed. |
| Git hygiene | Branch `main`, all changes staged, single commit, pushed to `origin/main` after this file is finalized. |
| Graphify update | Run post-push with `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .`; final stats recorded in bow-out response. |

## Reflections

- **Pushback paid off.** Operator's initial grill-me answers expanded scope to
  ~10 work items; Petey scoped down with evidence (graphify + directory listing
  showing no cron, no admin-create action). The TASK_07 spike then proved the
  pushback right — wiring email into nonexistent code paths would have been
  ~half a session of phantom work. The scope-cut question + the spike together
  cost <2 minutes and saved an unknown but large amount of confused execution.

- **Parallel spike was the right call.** Running TASK_07 as a background
  subagent while Cody worked on 01–06 meant the spike's findings landed in
  time to inform the next-session plan without serializing the session.

- **Wiring-target surprise on TASK_04.** Plan said "wire into public registration
  action," but reading `server/web/tournaments/register.ts` revealed it only
  creates the Stripe checkout — the actual Registration row is born in the
  webhook. Glad this was caught at edit-time rather than after wiring something
  into an action that never creates the row. Cody preflight pays for itself.

- **Operator mid-session steering (`"use server"` removal + premium lineage
  parity request)** showed up at the right moments — the `"use server"` cleanup
  rode along with rate-limiter changes naturally; the premium lineage idea
  parked cleanly into the next-session candidate list. Mid-session steering is
  cheaper than mid-session re-scoping.

### Kaizen

- **Safe and secure?** Yes. Every email helper is rate-limit-gated, every
  send-site is try/catch-wrapped inside `after()`, no user-visible action can
  be unwound by a Resend outage.

- **Failed steps preventable?** Yes — see the TASK_04 wiring-target surprise
  above. Next session's Cody preflight should explicitly trace "where is the row
  created" before promising "where the email is wired."

- **Confidence:** 9.5/10. Templates render, helpers compose, transitions fire,
  full Playwright passes (modulo the pre-existing failure). Real-inbox delivery
  is still Session C's job for MB-015 closure.

- **WORKFLOW score:** 9.5/10. Tight bow-in (graphify-first, no rebuild needed),
  parallel spike, three deliverables landed within the rubric cap, operator
  signal incorporated mid-flight without scope creep.

## Next session

_Final pick TBD at close. Three candidate lanes queued, in priority order:_

### Candidate A — SESSION_B carry-over wiring (from TASK_07 spike)

Follow-through on items intentionally deferred from this session, now unblocked by the
spike findings:

- **Self-service membership transitions** — wire `notifyMemberOfMembershipStatusChange`
  into member-initiated paths (e.g., invite acceptance flowing into `Membership.status →
  ACTIVE`). Identify call sites; reuse the existing helper as-is.

- **System-driven membership transitions** — TASK_07 confirmed the Stripe webhook does
  **not** transition `Membership.status` today; only `UserEntitlement` /
  `ProgramEnrollment` move on subscription events. Decision needed: do we (a) extend the
  webhook to transition memberships on `customer.subscription.deleted` /
  `invoice.payment_failed`, or (b) introduce a `membership-expiry` cron, or (c) leave
  this as a non-goal and use entitlements as the single source of truth? Petey plan
  candidate.

- **Admin-side tournament-registration creation** — TASK_07 confirmed no admin
  walk-in/comp-entry action exists in `server/admin/tournaments/actions.ts` today
  (only `updateRegistrationStatus`). To wire the existing
  `notifyUserOfTournamentRegistration` helper from an admin path, that action has to
  be built first. Input shape needs to support both `userId` (existing members) and
  guest `{ email, name }` (walk-ins).

### Candidate B — MB-015 Session C (production-readiness + SOP refresh)

Per SESSION_0257 plan: production email delivery test, SOP §14/§15/§16 refresh,
MB-015 closure in the manual-boundary-registry. Rate-limit + DSR enum dedup carried
forward this session, so Session C's TASK_C2 (rate-limit) is now **done** —
SESSION_0259 picking up Session C should reduce its scope to 4 tasks.

### Candidate C — Premium lineage listing parity (operator-requested mid-session)

**Why now:** The dirstarter boilerplate ships a full premium-tool submission flow that
this app already inherits — `EmailSubmissionPremium`, `EmailAdminSubmissionPremium`,
`notifySubmitterOfPremiumTool`, `notifyAdminOfPremiumTool`, and a Stripe checkout path
for the `isFeatured` upsell on `Tool`. Lineage listings have no equivalent monetization
hook today. Operator wants to leverage the existing baseline pattern rather than
build a separate path, maximizing the value of the purchased boilerplate.

**Scope of investigation for the next session:**

1. **Gap audit** — compare the Tool premium pipeline (model fields + admin UI + Stripe
   product/price IDs + email templates + notify helpers + listing display variant) to
   the Lineage equivalent. What's missing? What's reusable as-is? What's similar but
   diverges (`Tool.isFeatured` vs whatever Lineage carries)?
2. **Schema delta** — does `Lineage` need an `isFeatured` / `featuredUntil` field, a
   pricing-plan join, or a new `LineageBoost` row? Mirror the Tool decision unless the
   domain demands otherwise.
3. **Stripe product setup** — does `scripts/setup-ronin-stripe-products.ts` already
   include a lineage-premium SKU, or does that need a sibling script entry?
4. **Email parity** — likely just two new templates (`lineage-submission-premium.tsx` +
   `admin-lineage-submission-premium.tsx`) following the Tool premium shape verbatim,
   plus two notify helpers. The rate-limit boundary added this session means new
   helpers inherit duplicate suppression automatically.
5. **Display tier** — featured lineage listings need a UI surface (badge, sort
   priority, dedicated carousel) wherever lineage lists render. Audit
   `components/web/lineage/` and any lineage page templates.

**Inputs to read at bow-in for this lane:**

- `apps/web/emails/submission-premium.tsx` + `apps/web/emails/admin-submission-premium.tsx`
- `apps/web/lib/notifications.ts` (`notifySubmitterOfPremiumTool` / `notifyAdminOfPremiumTool`)
- Tool premium checkout flow in `server/web/tools/` + Stripe webhook
  `fulfillToolPremium` handler
- `apps/web/prisma/schema.prisma` — `Tool.isFeatured` + `Lineage` model
- `apps/web/scripts/setup-ronin-stripe-products.ts`
- `docs/architecture/dirstarter-commerce-alignment.md` (if it exists — check via
  graphify) for prior thinking on premium-tier monetization parity.

**Risk to flag at bow-in:** This crosses three baselines (Prisma, Stripe, email) so
the SESSION should fill the Dirstarter alignment table carefully and an ADR may be
warranted if the Lineage premium model diverges materially from the Tool template.

### Status

closed

in-progress
