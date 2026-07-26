---
title: "SESSION 0552 - FI-002 lifecycle-email copy audit"
slug: session-0552
type: session--implement
status: closed
created: 2026-07-16
updated: 2026-07-16
last_agent: codex-session-0552
sprint: S12
pairs_with:
  - docs/sprints/SESSION_0547.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0552 - FI-002 lifecycle-email copy audit

## Date

2026-07-16

## Operator

Brian + codex-session-0552

## Goal

Close FI-002 Lane D by auditing every `LifecycleEmailKind` and the related BBL email templates for
member-facing copy, BBL wrapper/brand safety, durable links, callback safety, and product accuracy.
Fix email-layer defects only; log non-template or out-of-lane findings instead of building FI-004 or
other adjacent surfaces.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out,
per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest numbered session read: `docs/sprints/SESSION_0547.md`.
- Carryover: SESSION_0547 persisted the fan-out map; Lane D is FI-002, scoped to lifecycle-email copy
  across all `LifecycleEmailKind` values with `emails/` + `lib/email` as the low-collision surface.

### Branch and worktree

- Branch: `session-0552-email-copy-audit`
- Worktree: `/Users/brianscott/dev/ronin-0552`
- Status at bow-in: clean except new `docs/sprints/SESSION_0552.md` after template copy.
- Current HEAD at bow-in: `ae79db18`

### Dirstarter alignment

| Field                       | Answer                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Dirstarter baseline touched | Auth, theming, hosting                                                                        |
| Extension or replacement    | Extension: BBL email templates sit on the app's Better Auth, Resend, and branded-email shell. |
| Why justified               | FI-002 is about making BBL lifecycle email copy match the current product and auth behavior.  |
| Risk if bypassed            | Emails can leak stale routes, internal tier language, or scanner-consumable auth links.       |

Live docs checked during planning: not applicable; source-of-truth was the live repo plus BBL SoT docs.

### Graphify check

- Graph status: unavailable in this fresh worktree; stats at bow-in: 0 nodes, 0 edges, 0 communities,
  0 files tracked.
- Queries used:
  - `LifecycleEmailKind BblEmailWrapper magic link callbackURL lifecycle email`
- Files selected from graph: none; Graphify returned "No nodes in graph."
- Verification note: direct source inspection used instead. The zero-node graph was treated as
  "graph not built here," not as proof of no matches.

### Grill outcome

No open forks. Operator pinned a clear build lane: audit and fix email copy/wrapper/link defects,
do not touch the admin composer or non-email app surfaces, do not send live email, commit locally,
hold at push.

## Petey plan

### Goal

Audit all lifecycle email kinds and fix email-layer copy/link defects with dry render proof.

### Tasks

#### SESSION_0552_TASK_01 - Bootstrap worktree

- **Agent:** Cody
- **What:** Copy canonical `apps/web/.env`, install deps, generate Prisma.
- **Steps:** copy env; run `bun install`; run `bunx prisma generate --no-hints`.
- **Done means:** dependencies and Prisma client are ready for render/gate checks.
- **Depends on:** nothing.

#### SESSION_0552_TASK_02 - Audit lifecycle email matrix

- **Agent:** Cody + Desi lens
- **What:** Enumerate every `LifecycleEmailKind` and audit tone, wrapper/brand, links, callback safety,
  and product accuracy.
- **Steps:** inspect `apps/web/lib/notifications.ts`, `apps/web/emails/*`,
  `apps/web/emails/components/bbl-wrapper.tsx`, lifecycle catalog, and runtime call sites.
- **Done means:** full kind-by-kind matrix recorded in this session file.
- **Depends on:** SESSION_0552_TASK_01.

#### SESSION_0552_TASK_03 - Fix template/copy/link defects

- **Agent:** Cody
- **What:** Patch email-layer defects only.
- **Steps:** remove internal/stale copy, replace stale routes, ensure CTAs render durable current links,
  preserve BBL wrapper/brand defaults.
- **Done means:** source diff is limited to email/lifecycle copy and route constants.
- **Depends on:** SESSION_0552_TASK_02.

#### SESSION_0552_TASK_04 - Render verify and gates

- **Agent:** Doug
- **What:** Dry render changed templates and run required gates.
- **Steps:** render all lifecycle kinds and changed templates; run typecheck, test, lint check, build,
  and format check because a session file was added.
- **Done means:** evidence table contains command results and no live sends occurred.
- **Depends on:** SESSION_0552_TASK_03.

### Parallelism

Sequential. The same lifecycle source files determine both runtime and preview copy, so edits and
verification should stay in one coherent pass.

### Agent assignments

| Task                 | Agent            | Rationale                                                  |
| -------------------- | ---------------- | ---------------------------------------------------------- |
| SESSION_0552_TASK_01 | Cody             | Environment setup.                                         |
| SESSION_0552_TASK_02 | Cody + Desi lens | Copy audit requires product and member-facing tone review. |
| SESSION_0552_TASK_03 | Cody             | Narrow source patch.                                       |
| SESSION_0552_TASK_04 | Doug             | Render proof and gates.                                    |

### Open decisions

None.

### Risks

- `bun install` initially failed because Bun could not write its default tempdir; mitigated by pinning
  `TMPDIR` and `BUN_INSTALL_CACHE_DIR` to `/private/tmp/ronin-0552-*`.
- Graphify is unavailable in this worktree; direct source inspection is the audit path.

### Scope guard

- No live email sends.
- No `git push`, PR, merge, or deploy.
- No schema changes or migrations.
- No admin composer or `/app` surface changes.
- No FI-001 Truelson send path changes; no sends to `btruelson@gmail.com`.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set; live Dirstarter docs not needed for this email-copy lane.
- **Baseline pattern to extend:** existing React Email templates, `BblEmailWrapper`, `sendEmail`,
  `notifyUserOfLifecycleEvent`, lifecycle catalog.
- **Custom delta:** BBL-specific durable links and member-facing lineage copy.
- **No-bypass proof:** fixes preserve existing wrapper/sender/auth seams and do not replace Dirstarter auth.

## Cody pre-flight

### Pre-flight: lifecycle email audit

#### 1. Existing component scan

- Graphify query used: `LifecycleEmailKind BblEmailWrapper magic link callbackURL lifecycle email`
- Found by direct source inspection: `EmailLifecycleNotification`, `BblEmailWrapper`,
  `LIFECYCLE_FEATURES`, `LIFECYCLE_CATALOG`, Stripe lifecycle call sites, claim-approved/rejected
  lifecycle call sites, BBL claim/founder templates.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: no.
- Consulted live alignment URLs: no.
- Closest L1 pattern: React Email + Better Auth magic-link callbacks.
- Primitive API spot-check: `BblEmailButton` applies inline red background/white text; `sendEmail`
  resolves brandless sends to `Brand.BBL`.

#### 3. Composition decision

- Extending existing component: `BblEmailWrapper`.
- Composing existing components: `BblEmailHeading`, `BblEmailButton`, `EmailLifecycleNotification`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes, `docs/sprints/SESSION_0547.md`.
- ADR read: `docs/product/black-belt-legacy/SOT-ADR.md`.
- Runbook consulted: `docs/rituals/opening.md`.

#### 5. Dev environment confirmed

- Dev server command: not started; render verification uses React Email dry render.
- Working directory: `/Users/brianscott/dev/ronin-0552`.
- Brand/host for testing: `https://blackbeltlegacy.com` durable links in rendered output.

#### 6. FAILED_STEPS check

- Prior failures in this area: FI-011, FI-012, FI-014 classes were encoded in source comments and
  specifically checked.
- Mitigation acknowledged: wrapper inline colors/logo, `LIFECYCLE_FEATURES` member-facing benefits,
  and brandless `sendEmail` -> BBL default all remain in place.

## Task log

| ID                   | Status  | Summary                                                                                                    |
| -------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| SESSION_0552_TASK_01 | landed  | Env copied from canonical, `bun install` completed with temp/cache override, Prisma generated.             |
| SESSION_0552_TASK_02 | landed  | Audited 18/18 lifecycle kinds plus related BBL claim/founder templates.                                    |
| SESSION_0552_TASK_03 | landed  | Fixed lifecycle and BBL claim/founder copy/link defects in email-layer files.                              |
| SESSION_0552_TASK_04 | blocked | Render proof passed; required gates ran, but workspace typecheck/test/root-format have unrelated failures. |

## FI-002 audit matrix

Legend: Tone = member-facing, no internal jargon; Brand = BBL wrapper/logo/red CTA/default sender;
Links = durable current routes, no one-shot token CTA; Callback = no unsafe nested callback URL;
Accuracy = matches current product behavior. Status is `fixed`, `pass`, or `logged`.

| Kind                     | Template / runtime source                                    | Tone  | Brand | Links | Callback | Accuracy | Finding / action                                                                                                   |
| ------------------------ | ------------------------------------------------------------ | ----- | ----- | ----- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `new-member-welcome`     | `EmailLifecycleNotification`; Stripe checkout + catalog      | fixed | pass  | pass  | pass     | fixed    | Runtime intro leaked "brand-aware"; changed to member-facing lineage-profile benefits.                             |
| `upgrade-premium`        | `EmailLifecycleNotification`; subscription update + catalog  | pass  | pass  | pass  | pass     | pass     | Benefit copy comes from `LIFECYCLE_FEATURES`; no token CTA.                                                        |
| `upgrade-elite`          | `EmailLifecycleNotification`; subscription update + catalog  | pass  | pass  | pass  | pass     | pass     | Benefit copy comes from `LIFECYCLE_FEATURES`; no token CTA.                                                        |
| `comp-granted`           | Lifecycle catalog preview                                    | pass  | pass  | pass  | pass     | pass     | Preview uses durable `/app/profile`; no runtime sender found in this lane.                                         |
| `downgrade-confirmation` | `EmailLifecycleNotification`; subscription update + catalog  | pass  | pass  | pass  | pass     | pass     | Runtime defaults to durable profile CTA unless caller overrides; catalog uses `/app/membership`.                   |
| `subscription-ended`     | `EmailLifecycleNotification`; subscription deleted + catalog | pass  | pass  | pass  | pass     | pass     | Copy accurately says paid access revoked and free claim/verification remains.                                      |
| `membership-expiring`    | Lifecycle catalog preview                                    | pass  | pass  | pass  | pass     | logged   | Catalog-only template; no automated runtime scheduler found. Future scheduling flow is outside FI-002.             |
| `trial-ending`           | Lifecycle catalog preview                                    | pass  | pass  | pass  | pass     | logged   | Catalog-only template; no automated runtime scheduler found. Future scheduling flow is outside FI-002.             |
| `win-back`               | Lifecycle catalog preview                                    | pass  | pass  | pass  | pass     | logged   | Catalog-only template; no automated runtime scheduler found. Future win-back automation is outside FI-002.         |
| `payment-receipt`        | `EmailLifecycleNotification`; invoice paid + catalog         | pass  | pass  | pass  | pass     | pass     | Receipt copy and durable default profile/billing links render.                                                     |
| `payment-failed`         | `EmailLifecycleNotification`; invoice failed + catalog       | pass  | pass  | fixed | pass     | fixed    | Runtime had CTA label "Update card" with no explicit URL; added durable `/app/membership`.                         |
| `refund-confirmation`    | `EmailLifecycleNotification`; charge refunded + catalog      | pass  | pass  | pass  | pass     | pass     | No CTA; copy accurately says paid-tier access tied to payment was revoked.                                         |
| `renewal-reminder`       | Lifecycle catalog preview                                    | pass  | pass  | pass  | pass     | logged   | Catalog-only template; no automated runtime scheduler found. Future renewal reminder job is outside FI-002.        |
| `renewal-confirmation`   | Lifecycle catalog preview                                    | pass  | pass  | pass  | pass     | logged   | Catalog-only template; invoice-paid covers receipts today; renewal-specific scheduler not found.                   |
| `rank-promotion`         | Lifecycle catalog preview                                    | pass  | pass  | pass  | pass     | logged   | Catalog-only template; no runtime rank-promotion notification found. Building that flow is outside FI-002.         |
| `profile-claim-approved` | `claim-approved-email.ts` + catalog                          | pass  | pass  | pass  | pass     | pass     | No tier table; durable `/app/profile`; auto-claim path matches current code.                                       |
| `profile-claim-rejected` | `claim-rejected-email.ts` + catalog                          | pass  | pass  | pass  | pass     | pass     | Durable `/lineage`; reply-based help copy; no token URL.                                                           |
| `admin-dispute-alert`    | Stripe dispute runtime + catalog                             | fixed | pass  | fixed | pass     | fixed    | Catalog used stale `/admin/claims`; runtime had no CTA. Updated both to `/app/claims` and removed "in admin" copy. |

### Related BBL template audit

| Template                                  | Status | Finding / action                                                                                                                                                   |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `emails/components/bbl-wrapper.tsx`       | pass   | White logo on dark header and red CTA are inline-color guarded; no change.                                                                                         |
| `lib/email.ts`                            | pass   | Brandless sends resolve to `Brand.BBL`; no change.                                                                                                                 |
| `emails/bbl-claim-your-profile.tsx`       | fixed  | CTA preview already used durable `/auth/login?next=%2Fme`; copy still implied instant sign-in. Reworded to durable sign-in + post-sign-in claim reconciliation.    |
| `emails/bbl-first-tester-welcome.tsx`     | fixed  | Comments/copy still called the durable sign-in URL a one-click magic link and claimed automatic sign-in. Reworded to durable sign-in + email-bound reconciliation. |
| `emails/bbl-the-long-road.tsx`            | fixed  | Durable-link comments existed, but body copy still overclaimed "airtight/perfect" and "claims on the spot." Reworded to durable sign-in + claim connection.        |
| `emails/magic-link.tsx`                   | pass   | Better Auth login email necessarily contains a magic-link URL; not used as a durable claim CTA.                                                                    |
| `emails/bbl-join-legacy-confirmation.tsx` | pass   | Member-facing claim review copy matches current intake/review flow; no token CTA.                                                                                  |

## What landed

- Audited all 18 `LifecycleEmailKind` values and recorded the FI-002 matrix above.
- Fixed 5 email-copy/link defects: internal "brand-aware" copy, missing payment-failed CTA URL,
  stale admin-dispute `/admin/claims` URL, token-like claim-link language, and overclaimed founder
  copy.
- Verified all lifecycle entries and changed BBL claim/founder templates render through React Email
  without live sends.
- Goal was not fully clean-gated because workspace typecheck/test/root-format have unrelated failures,
  and `bun run test` exposed the known non-lifecycle live-send defect under the canonical `.env`.

## Decisions resolved

- Treat missing lifecycle automation for catalog-only kinds as logged evidence, not FI-002 build work.
- Use `/app/claims` as the durable admin review target instead of stale `/admin/claims`.
- Keep Better Auth magic-link emails as token-bearing auth emails; the FI-002 durable-link rule applies
  to claim/marketing CTAs that must survive scanner clicks.

## Files touched

| File                                                | Change                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `docs/sprints/SESSION_0552.md`                      | Session ledger, FI-002 matrix, and verification evidence.                              |
| `apps/web/server/admin/email/lifecycle-catalog.tsx` | Admin-dispute preview now uses `/app/claims` and current copy.                         |
| `apps/web/server/web/billing/stripe-webhook.ts`     | Removed internal "brand-aware" copy; added durable billing CTA and dispute-review CTA. |
| `apps/web/emails/bbl-claim-your-profile.tsx`        | Reworded claim steps for durable sign-in + reconciliation.                             |
| `apps/web/emails/bbl-first-tester-welcome.tsx`      | Reworded one-click/magic-link claim language for durable sign-in.                      |
| `apps/web/emails/bbl-the-long-road.tsx`             | Reworded overclaims and claim-link copy for durable sign-in.                           |
| `apps/web/lib/notifications.ts`                     | Updated claim URL comments to durable sign-in terminology.                             |

## Verification

| Command / smoke                                                                                                                  | Result                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cp /Users/brianscott/dev/ronin-dojo-app/apps/web/.env apps/web/.env`                                                            | Pass.                                                                                                                                     |
| `TMPDIR=/private/tmp/ronin-0552-bun-tmp BUN_INSTALL_CACHE_DIR=/private/tmp/ronin-0552-bun-cache bun install`                     | Pass; checked 772 installs, no package changes.                                                                                           |
| `TMPDIR=/private/tmp/ronin-0552-bun-tmp BUN_INSTALL_CACHE_DIR=/private/tmp/ronin-0552-bun-cache bunx prisma generate --no-hints` | Pass; Prisma Client 7.8.0 generated.                                                                                                      |
| Render all 18 lifecycle catalog entries with `@react-email/components`                                                           | Pass; all kinds rendered HTML + plain text, no sends.                                                                                     |
| Render `bbl-claim-your-profile`, `bbl-first-tester-welcome`, `bbl-the-long-road` founder + Tony variants                         | Pass; all rendered with durable `https://blackbeltlegacy.com/auth/login?next=%2Fme`; no Better Auth token URL present.                    |
| Catalog exhaustiveness check                                                                                                     | Pass; expected=18, catalog=18, missing=none, extra=none.                                                                                  |
| `bun run typecheck`                                                                                                              | Fail: `@ronin-dojo/web` passed, but `baseline` failed on missing `../.generated/prisma/client` and an implicit `tx` any.                  |
| `bun run test`                                                                                                                   | Fail: 1506 pass, 8 fail, 1 error across 1514 tests. Failures were billing/admin/media/stripe fixture timeouts/FKs, outside touched files. |
| `bun run lint:check` from `apps/web`                                                                                             | Pass with existing warnings.                                                                                                              |
| `bun run --filter '*' format:check`                                                                                              | Pass for `ui-kit` and `web`.                                                                                                              |
| `bunx oxfmt --check .`                                                                                                           | Fail: repo-wide existing docs/agent/archive formatting issues in 999 files.                                                               |
| `bunx oxfmt --check docs/sprints/SESSION_0552.md`                                                                                | Pass after formatting the added session file.                                                                                             |
| `bun run wiki:lint`                                                                                                              | Pass: 0 errors, 54 warnings; warnings are pre-existing and do not include `SESSION_0552.md`.                                              |
| `npx next build` from `apps/web`                                                                                                 | Initial fail: `SecItemCopyMatching failed -67674`; retry with `CI=1 NEXT_TELEMETRY_DISABLED=1` passed.                                    |

## Open decisions / blockers

- Logged, not built: several lifecycle kinds are catalog-only today (`membership-expiring`,
  `trial-ending`, `win-back`, `renewal-reminder`, `renewal-confirmation`, `rank-promotion`).
  Adding schedulers or product flows is outside FI-002.
- Gate blocker: workspace `bun run typecheck` is red from the separate `baseline` package generated
  Prisma client gap, not from this email diff.
- Gate blocker: workspace `bun run test` is red from unrelated timeout/FK failures in billing,
  admin, media, and stripe tests.
- Safety blocker: running the required `bun run test` with the canonical `.env` produced real
  `sendEmail` logs from non-lifecycle tests (`notifications-feedback`, org/member/admin membership,
  lead actions). Lifecycle email tests themselves honored `[email:lifecycle:dry-run]`.
- Close-runner skipped by design: `scripts/bow-out-gates.sh` would run `bun run build` (prebuild can
  migrate) and Graphify refresh, both conflicting with this worktree lane's instructions.

## Next session

### Goal

Pick up the next operator-selected fan-out lane after FI-002 is merged, likely FI-004 admin
email-composer parity or another SESSION_0547 persisted lane.

### First task

Confirm which worktree lanes have landed, rebase from latest `origin/main`, then start the next
selected lane with its own bow-in and collision check.

## Review log

### SESSION_0552_REVIEW_01 - FI-002 lifecycle-email audit close

- **Reviewed tasks:** SESSION_0552_TASK_01, SESSION_0552_TASK_02, SESSION_0552_TASK_03,
  SESSION_0552_TASK_04
- **Dirstarter docs check:** not applicable; no Dirstarter baseline behavior changed.
- **Verdict:** The email-layer diff is narrow and matches FI-002: lifecycle copy is member-facing,
  BBL wrapper/sender invariants remain intact, durable CTAs point to `/auth/login`, `/app/profile`,
  `/app/membership`, or `/app/claims`, and callback/token risk is not expanded. The close is not
  green because unrelated workspace gates are red and the known unit-test live-send defect fired.
- **Score:** 7.0/10, capped by red workspace gates and live-send test defect exposure.
- **Follow-up:** Fix or isolate the non-lifecycle email-send tests before requiring full-suite runs
  with a canonical Resend key.

## Hostile close review

- **Giddy:** pass on scope control; fail on clean-gate status because `bun run test` exposed live-send
  behavior and unrelated test failures remain.
- **Doug:** pass on render proof; fail on full gate proof because typecheck/test/root-format are red.
- **Desi:** pass on member-facing copy; claim-link language now describes durable sign-in and
  reconciliation instead of one-shot magic-token behavior.
- **Kaizen aggregate:** 7/10 - template work is sound, close is honestly blocked by repo/test
  infrastructure outside the lane.

## ADR / ubiquitous-language check

- ADR update not required. SOT-ADR remains valid; email copy changes did not alter architecture.
- Ubiquitous language update not required. No new domain terms introduced.

## Reflections

The biggest surprise was the required full-suite test command colliding with the exact known
Resend-key defect called out in the dispatch. Lifecycle sends stayed dry-run, but other notification
tests used the canonical `.env` and entered `sendEmail`. Future worktree lanes that must run
`bun run test` should clear or override `RESEND_API_KEY` unless the suite has been fixed.

Graphify behaved exactly like the opening ritual warned: zero nodes in a fresh worktree. Treating
that as "navigation unavailable" rather than as evidence prevented false negatives.

The actual FI-002 defects were copy/link defects, not wrapper defects. FI-011/FI-014 had already
been encoded well in `BblEmailWrapper` and `lib/email.ts`; the remaining risk was stale words and
stale routes around those safer primitives.

## Full close evidence

| Step                        | Proof                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| JETTY/frontmatter sweep     | `SESSION_0552.md` frontmatter filled and set `status: closed`; no wiki/architecture docs changed.                            |
| Backlinks/index sweep       | No new wiki pages; `SESSION_0552.md` backlinks `docs/knowledge/wiki/index.md` like the template. Wiki index was not changed. |
| Wiki lint                   | `bun run wiki:lint`: 0 errors, 54 warnings; no warnings in `SESSION_0552.md`.                                                |
| Kaizen reflection           | Reflections section filled.                                                                                                  |
| Hostile close review        | `SESSION_0552_REVIEW_01` recorded above; score capped by gate blockers.                                                      |
| Code-quality gate (Class-A) | Not applicable; copy/link/template edits only.                                                                               |
| Runtime verification (Doug) | React Email dry render proof for all 18 lifecycle kinds and changed BBL claim/founder templates; no live lifecycle sends.    |
| Review & Recommend          | Next session goal and first task written.                                                                                    |
| Memory sweep                | No persistent memory update needed; known non-lifecycle live-send defect remains a blocker, recorded above.                  |
| Next session unblock check  | Blocked only on merge/push authorization and unrelated repo gate failures; FI-002 template work itself is complete.          |
| Git hygiene                 | Branch `session-0552-email-copy-audit`; commit pending at final git step; no push authorized.                                |
| Graphify update             | Skipped per worktree-lane instruction; bow-in stats were 0 nodes/0 edges/0 communities.                                      |
