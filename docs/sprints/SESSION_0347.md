---
title: "SESSION 0347 — BBL tier-gating read model + entitlement audit tighten + invite/claim/profile QR"
slug: session-0347
type: session--open
status: closed
created: 2026-06-04
updated: 2026-06-05
last_agent: codex-session-0347
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0346.md
  - docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/decisions/0019-membership-lifecycle-ownership.md
  - docs/runbooks/sops/sop-data-and-wiring-flows.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0347 — BBL tier-gating read model + entitlement audit tighten + invite/claim/profile QR

## Date

2026-06-04

## Operator

Brian + claude-session-0347 (Petey orchestration -> Cody build -> Desi UX review -> Doug verify -> Petey close)

## Goal

Harden the remaining BBL launch membership surface in three coupled lanes plus a doc-alignment lane: (1) close the
entitlement-audit cross-pollination found at bow-in — the admin `grantUserEntitlement`/`revokeUserEntitlement` path
can mint `LINEAGE_PREMIUM`/`LINEAGE_ELITE` with no `AuditLog`; route it through an audited helper without breaking the
live S3-upload toggle; (2) add the epic Phase-2 tier-gating read model — one tier-policy helper mapping
user -> tier -> render policy, consumed first at the lineage tree node card (free listing vs full card); (3) lift the
monorepo QR pattern (`qrcode.react`) into a shared invite/claim/profile QR component with server-built URLs and
server-derived tier (no client-trusted authorization); (4) update `sop-data-and-wiring-flows` with the comp/gift +
claim->comp / invite->comp flow and log the audit finding to the wiring-ledger.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0346.md`.
- Carryover: SESSION_0346 shipped the audited `grantComp`/`revokeComp` spine, admin comp action, claim->comp and
  invite->comp server-derived triggers, premium/elite catalog keys, and a multi-rank seed fixture. Its `Next session`
  block names the tier-gating read model + delegated comp authority. This session executes the tier-gating read model
  (Phase 2), closes a newly found entitlement-audit gap, and adds the operator-requested QR surface.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (QR lane runs in a parallel git worktree, merged at close).
- Status at bow-in: clean before creating `docs/sprints/SESSION_0347.md`.
- Current HEAD at bow-in: `ad7b9ef`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git` (FS-0024 pwd + remote
  guard run before this file was written).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization/entitlements, auth/RBAC (safe-action clients), Prisma (data only — no migration), UI primitives (cards/modal), invites. |
| Extension or replacement | Extension: reuse the `grantComp` audited helper + `adminActionClient`, the entitlement read surface, the lineage node card, and the invite/claim surfaces. QR adds one dependency (`qrcode.react`) and a shared render component; tier-gating adds one read-model helper. |
| Why justified | The epic's Phase 2 rides the existing entitlement spine and lineage render surface; the audit tighten reuses the SESSION_0346 audited helper rather than forking a second write path; QR is a thin render over server-built URLs. |
| Risk if bypassed | High: an unaudited admin entitlement write path undermines the tier-gating audit guarantee; a client-trusted QR tier would fork the no-trust-client posture proven in SESSION_0345. |

Live docs checked during planning: GIFT epic spec, ADR 0011 (entitlement-first commerce), ADR 0019 (membership/access
boundary), `payment-security-checklist`, `security-test-plan`, `sop-data-and-wiring-flows`, `sop-test-writing`,
`bbl-production-runbook`. No new Dirstarter API surface introduced.

### Graphify check

- Graph status: current (refreshed end of SESSION_0346); stats at bow-in: 9318 nodes, 14463 edges, 1397 communities,
  1582 files tracked.
- Queries used:
  - `lineage tier gating premium elite read model entitlement comp authority`
- Files/surfaces selected from graph + direct read:
  - `apps/web/server/entitlements/comp-grants.ts` (audited helper to reuse for TASK_01)
  - `apps/web/server/admin/entitlements/actions.ts` (`grantUserEntitlement`/`revokeUserEntitlement` — the unaudited path)
  - `apps/web/app/admin/users/_components/upload-grant-toggle.tsx` (live consumer of the unaudited path)
  - `apps/web/lib/entitlements/lineage-comp.ts` (`getLineageCompEntitlementKeys` — tier key expansion to read)
  - `apps/web/components/web/lineage/*` (lineage tree node card / canvas — tier-gating render target)
  - monorepo `src/brands/blackbeltlegacy/components/admin/invites/BBLQRCodeModal.jsx` (QR pattern to lift)
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof. One precise
  symbol-reference grep confirmed `grantUserEntitlement`/`revokeUserEntitlement` consumers (the upload-grant toggle).

### Grill outcome

Petey grill (3 forks) resolved before code:

1. **Audit gap = fix this session (TASK_01).** The admin `grantUserEntitlement`/`revokeUserEntitlement`
   (`server/admin/entitlements/actions.ts:69-131`) is admin-gated but writes no `AuditLog` and has a loose
   `entitlementKey: z.string()` schema, so it can mint `LINEAGE_PREMIUM`/`LINEAGE_ELITE` with no audit trail — a
   parallel, unaudited write path to the same tier keys the audited comp spine guards. It is live-wired to the
   S3-upload toggle, so the fix is to route it through an audited helper (not delete it). Decided over log-and-defer.
2. **Scope = all four lanes** (audit tighten + tier-gating read model + QR + doc alignment). Operator chose the full
   set; petey-plan budget is at its upper bound, so scope guards are tight (see below).
3. **Run shape = inline core + QR in a parallel worktree.** Security/tier work stays inline Petey -> Cody -> Desi ->
   Doug (security-sensitive, human-in-loop); QR is disjoint (new dep + new component) so it runs in a parallel git
   worktree subagent and merges at close.

### Drift logged

- **D-pending (TASK_01 finding):** unaudited admin entitlement grant/revoke path that can set premium/elite tier keys.
  Logged to `wiring-ledger` during TASK_01; remediated this session, not deferred.

## Petey plan

### Goal

Close the entitlement-audit cross-pollination, ship the Phase-2 tier-gating read model at the lineage node card, lift a
shared invite/claim/profile QR component, and align `sop-data-and-wiring-flows` with the comp flow — no schema
migration.

### Tasks

#### SESSION_0347_TASK_01 — Audited admin entitlement grant/revoke (close the unaudited tier-key write path)

- **Agent:** Cody -> Doug
- **What:** Route `grantUserEntitlement`/`revokeUserEntitlement` through an audited path so every admin entitlement
  mutation writes an `AuditLog` before the write, reusing the SESSION_0346 audited spine where possible; keep the live
  S3-upload toggle working; add the missing safe-action wrapper test for the comp admin actions (closes the
  `sop-test-writing` §5b gap).
- **Steps:**
  1. Confirm the only consumer is `app/admin/users/_components/upload-grant-toggle.tsx` (done at bow-in).
  2. Make `grantUserEntitlement`/`revokeUserEntitlement` write an `AuditLog` (`entitlement.admin.granted` /
     `entitlement.admin.revoked`, before/after) before mutating `UserEntitlement`; align idempotency with the comp
     path. Prefer factoring a shared internal audited grant helper rather than duplicating audit code.
  3. Add `server/admin/entitlements/actions.safe-action.test.ts` proving the wrapper gates (unauth, non-admin, admin
     happy path) for `grantUserComp`/`revokeUserComp` and the now-audited grant/revoke.
  4. Add an audit-before-mutation assertion test for the admin grant/revoke path (security-test-plan line 75).
  5. Log the finding + remediation to `docs/knowledge/wiki/wiring-ledger.md`.
- **Done means:** admin entitlement grant/revoke writes audit rows; toggle still works; safe-action + audit tests
  green; wiring-ledger entry exists.
- **Depends on:** nothing.

#### SESSION_0347_TASK_02 — Tier-gating read model + lineage node card render policy (epic Phase 2)

- **Agent:** Cody -> Desi -> Doug
- **What:** One read-model helper mapping a user's active `UserEntitlement` keys -> tier -> render policy (free listing
  vs full card), consumed first at the lineage tree node card. Mirror the avatar read-model pattern
  ([[passport-avatar-consumption-surfaces]]) — one helper, not scattered conditionals.
- **Steps:**
  1. Add a `lib/entitlements/` (or co-located) read-model helper: given a user (or a precomputed entitlement-key set),
     return `{ tier: "free" | "premium" | "elite", canRenderFullCard, features }`. Read the same keys
     `getLineageCompEntitlementKeys` grants, so paid and comped access map to one signal.
  2. Wire the lineage node card to switch between free listing (name + rank only) and full card (photo/bio/links/
     attachments) by the helper, defaulting to free.
  3. Unit tests: free vs premium vs elite mapping; elite-as-superset; no-entitlement default to free; render-policy
     boundary (no PII/full-card fields leak for free tier — cf. security-test-plan privacy tests).
  4. Desi review: card hierarchy, empty/free-state, parity with existing card contract.
- **Done means:** read-model helper + node card render switch exist; unit tests green; Desi fix-list addressed or
  triaged.
- **Depends on:** TASK_01 (clean audited tier-key writes are the signal this reads).

#### SESSION_0347_TASK_03 — Invite/claim/profile QR (lift monorepo pattern) — parallel worktree

- **Agent:** subagent (general-purpose) in a git worktree -> Desi -> Doug
- **What:** A shared, KISS QR component (lift `qrcode.react` from the monorepo `BBLQRCodeModal`) rendering a scannable
  code for invite links, claim links, and public profile URLs, with server-built URLs and copy/download.
- **Steps:**
  1. Add the `qrcode.react` dependency to `apps/web`.
  2. Build one shared `QrCode`/`QrShareModal` component composing existing UI primitives (not the monorepo's bespoke
     modal markup); PNG download + copy link; fix the monorepo pitfalls (deprecated `unescape`, no clipboard fallback/
     feedback, no canvas error handling).
  3. Render it on the admin invite surface, the claim surface, and the public profile page; the URL is built
     server-side. **Tier/role is display-only and server-derived — never authorization** (no-trust-client posture).
  4. Component test for the QR render + URL value; Desi review for brand consistency.
- **Done means:** shared QR component + three render sites exist; tier never trusted from the QR; tests green; merges
  into main cleanly at close.
- **Depends on:** nothing (disjoint file set + new dep); integrates at close.

#### SESSION_0347_TASK_04 — Doc alignment: comp flow + audit finding + test-SOP note

- **Agent:** Petey (folds into close)
- **What:** Add the comp/gift grant flow and the claim->comp / invite->comp server-derived triggers to
  `sop-data-and-wiring-flows.md`; note the `sop-test-writing` §5b safe-action gap closed in TASK_01; ensure the
  wiring-ledger entry from TASK_01 is complete.
- **Steps:**
  1. Add a "Comp / gift entitlement flow" section to `sop-data-and-wiring-flows.md` (audit-before-mutation; the two
     trusted triggers; the now-audited admin grant/revoke path).
  2. Cross-link from the payment-security-checklist's "admin adjustment events" line if useful.
  3. Confirm wiki-lint passes.
- **Done means:** wiring-flows SOP documents the comp flow; wiring-ledger entry complete; wiki-lint green.
- **Depends on:** TASK_01 (the audited path the doc describes).

### Parallelism

- TASK_03 (QR) runs in a **parallel git worktree** — disjoint file set (new dep + new component + three render sites)
  with low conflict against the entitlement/lineage files of TASK_01/02. Merged at close.
- TASK_01 -> TASK_02 run **sequential inline** (Petey -> Cody -> Desi -> Doug). TASK_02 reads the tier-key signal
  TASK_01 secures; both touch entitlement/lineage code so no intra-lane parallelism.
- TASK_04 folds into close after TASK_01 lands.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0347_TASK_01 | Cody -> Doug | Security-sensitive audit/RBAC; Doug verifies audit-before-mutation + toggle intact. |
| SESSION_0347_TASK_02 | Cody -> Desi -> Doug | Read-model + card render; Desi reviews hierarchy/parity; Doug verifies no free-tier PII leak. |
| SESSION_0347_TASK_03 | subagent (worktree) -> Desi -> Doug | Disjoint dep+UI; parallelizable; Desi brand-consistency; Doug verifies no client-trusted tier. |
| SESSION_0347_TASK_04 | Petey | Doc alignment + ledger; folds into close. |

### Open decisions

- TASK_02 consumption scope: this session gates the **lineage node card** only; directory + public-profile tier-gating
  consumption are follow-ons (kept out of scope to stay within the plan budget). Flagged for operator if they want
  profile consumption pulled in (the QR lane already touches the profile page).

### Risks

- **Plan budget at upper bound (4 lanes).** Mitigation: tight scope guards; QR parallelized; TASK_04 is light and
  folds into close. If TASK_01/02 overrun, TASK_03 (worktree) still lands independently and TASK_04 can defer to the
  next session's first task.
- **Worktree merge conflict on the public profile page** if TASK_02 and TASK_03 both touch it. Mitigation: TASK_02 is
  scoped to the lineage node card, not the profile page; QR profile render is additive.
- **Determinism under `--parallel=1`** (FS-0342): brand-scoped, self-cleaning fixtures; no shared-row reuse.
- **Client-trusted tier via QR** (FS-equiv to the checkout no-trust posture): tier in the QR URL is display-only;
  authorization stays server-derived from `invite.meta.comp` / entitlement keys.

### Scope guard

- No delegated (school-owner/instructor) comp authority matrix or term caps this session (epic future phase).
- No BBL.com import cohort, no schema migration.
- TASK_02 gates the lineage node card only — not directory/profile consumption.
- QR is a render over server-built URLs; it does not introduce a new auth/claim path or trust client-supplied tier.
- `fallow-rs/fallow` evaluation is a bow-out item (read-only), not adopted into gates mid-session.
- Adjacent tech debt goes under `Open decisions / blockers`, not inline.

### Dirstarter implementation template

- **Docs read first:** GIFT epic spec, ADR 0011, ADR 0019, `payment-security-checklist`, `security-test-plan`,
  `sop-data-and-wiring-flows`, `sop-test-writing`, `bbl-production-runbook`. No live Dirstarter URL re-fetch — the
  work rides already-aligned entitlement/auth/UI primitives.
- **Baseline pattern to extend:** the `grantComp` audited helper + `adminActionClient`; the entitlement read surface;
  the lineage node card; existing UI primitives (card/modal/button); the invite/claim/profile surfaces.
- **Custom delta:** an audited admin grant/revoke path, a tier-gating read-model helper + node-card render switch, a
  shared QR component over server-built URLs, and a comp-flow doc section.
- **No-bypass proof:** reuses the audited entitlement spine + RBAC clients + audit model + UI primitives; it does not
  fork the access model, the payment path, or the no-trust-client posture.

## Cody pre-flight

### Pre-flight: SESSION_0347_TASK_01 — Audited admin entitlement grant/revoke

#### 1. Existing component scan

- Graphify query used: `lineage tier gating premium elite read model entitlement comp authority`.
- Found: `comp-grants.ts` (`grantComp`/`revokeComp` audited helper), `server/admin/entitlements/actions.ts`
  (`grantUserEntitlement`/`revokeUserEntitlement` unaudited), `upload-grant-toggle.tsx` (live consumer),
  `AuditLog` model, `lineage-comp.ts` tier-key expansion.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0346`).
- ADR read: `0011-entitlement-first-commerce.md`, `0019-membership-lifecycle-ownership.md`.
- Runbooks consulted: `payment-security-checklist`, `security-test-plan`, `sop-test-writing`, `sop-data-and-wiring-flows`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app/apps/web`.
- Brand/host for testing: bun unit + integration tests; local Playwright `localhost:3000` for QR/card smoke.
- Verification commands: `bun test <files>`, `bun run typecheck`, `bun run lint`,
  `bun test --parallel=1 --path-ignore-patterns='e2e/**'`, `bun run wiki:lint`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (component scan skip), FS-0002 (dev server), FS-0024/0025 (git guard +
  single-push close), FS-0342 (deterministic `--parallel=1`).
- Mitigation acknowledged: plan + task ids exist before code; reuse-scan done; audit-before-mutation; determinism
  under `--parallel=1`; one push at close.

### Pre-flight: SESSION_0347_TASK_02 — Tier-gating read model + node card

#### 1. Existing component scan

- Found: `lib/entitlements/lineage-comp.ts` (`getLineageCompEntitlementKeys`), `server/web/entitlements/queries`,
  lineage node card / canvas components.

#### 3. Composition decision

- Extending: lineage node card render. Composing: existing card/avatar primitives. New: one tier-policy read helper.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0347_TASK_01 | complete | Audited admin entitlement grant/revoke path landed via `server/entitlements/admin-grants.ts`; safe-action wrapper and audit-before-mutation tests added; WL-P1-6 closed. |
| SESSION_0347_TASK_02 | complete | Tier-gating read model maps active `LINEAGE_PREMIUM` / `LINEAGE_ELITE` entitlement keys to free/premium/elite render policy; public lineage surfaces pass the policy into the tree/card stack. |
| SESSION_0347_TASK_03 | complete | Shared invite/claim/profile QR component landed with `qrcode.react`, server-built URLs, copy fallback, PNG error handling, and render sites for invite, claim, lineage tree, and public member profile pages. |
| SESSION_0347_TASK_04 | complete | Comp-flow SOP, test-SOP inventory, wiring-ledger, wiki index/log, and component inventory updated. |

## What landed

- Added audited generic admin entitlement helpers:
  - `grantAdminEntitlement` writes `entitlement.admin.granted` before creating/reactivating a manual grant.
  - `revokeAdminEntitlement` writes `entitlement.admin.revoked` before revoking active grants.
  - The existing admin S3-upload toggle path remains live through `grantUserEntitlement` / `revokeUserEntitlement`.
- Added the Phase-2 lineage tier read model:
  - free default: name/rank/path-highlight only, no drawer or full-card details.
  - premium/elite: full lineage card/drawer rendering, with elite as a superset.
  - dashboard/editor capability still elevates to full rendering so existing editor workflows do not regress.
- Added shared QR sharing:
  - `QrShareButton` / `QrSharePanel` render a high-correction SVG QR and hidden canvas for PNG download.
  - QR URLs are server-built invite/claim/profile URLs; tier/role/school state is not encoded or trusted.
  - Quick security cleanup: QR absolute URL construction now delegates to the existing ADR-0021 brand-origin helper rather than duplicating host-header parsing.
- Fixed a member-profile render warning surfaced by browser smoke by selecting `RankAward.id` in the directory payload before keying rank rows.
- Aligned docs and ledgers:
  - WL-P1-6 documents and closes the unaudited entitlement mutation gap.
  - wiring-flows SOP now describes comp/gift entitlement triggers and audit invariants.
  - safe-action SOP inventory now includes the admin entitlement wrapper coverage.
- Refreshed the root `README.md` so a new developer sees the WordPress/PHP rebuild rationale, current four-brand product state, BBL launch focus, agentic workflow, engineering/security posture, stack, repo layout, and canonical launch/product links.

## Decisions resolved

- The unaudited generic admin entitlement path was treated as a launch-integrity fix, not a deferred note, because it could write the same premium/elite tier keys that the audited comp spine protects.
- No autonomous 3-session bundle was used. Petey kept orchestration inline (Cody build -> Desi render pass -> Doug verification -> Petey close) because the Claude-spawned QR worktree did not exist at handoff and the final file set was manageable in one session.
- QR is a convenience carrier only. Authorization remains server-derived from invite metadata and active `UserEntitlement` keys.
- No new ADR or glossary term was needed. The work applies ADR 0011 (entitlement-first commerce) and ADR 0019 (membership lifecycle ownership) without changing their decisions.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/package.json` | Added `qrcode.react`. |
| `apps/web/bun.lock` | Lockfile entry for `qrcode.react`. |
| `apps/web/lib/request-url.ts` | Added server helper for request-origin and absolute URL construction. |
| `apps/web/components/common/qr-share-button.tsx` | Added shared QR share dialog/panel with copy and PNG download support. |
| `apps/web/components/common/qr-share-button.test.tsx` | Static render test for QR value, SVG/canvas output, and input value. |
| `apps/web/server/entitlements/admin-grants.ts` | Added audited generic admin grant/revoke helper. |
| `apps/web/server/admin/entitlements/actions.ts` | Routed generic admin grant/revoke through audited helper; tightened input schema. |
| `apps/web/server/admin/entitlements/actions.safe-action.test.ts` | Added comp and generic entitlement safe-action RBAC/audit tests. |
| `apps/web/lib/entitlements/lineage-tier-policy.ts` | Added free/premium/elite render-policy model. |
| `apps/web/lib/entitlements/lineage-tier-policy.test.ts` | Unit tests for tier mapping and elite precedence. |
| `apps/web/server/web/entitlements/lineage-tier-policy.ts` | Added server read model from active user entitlements to render policy. |
| `apps/web/components/web/lineage/lineage-tree-board.tsx` | Threaded render policy and gated drawer opening for free tier. |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Threaded render policy through tree, board, mobile list, honor strip, and compact child rows. |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Added free-listing card policy that hides full-card details and profile-open affordance. |
| `apps/web/components/web/lineage/lineage-node-card.policy.test.tsx` | Regression test that free listing does not leak full-card details. |
| `apps/web/components/web/lineage/lineage-mobile-list.tsx` | Applied render policy to mobile rows. |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | Applied render policy to compact child rows. |
| `apps/web/components/web/lineage/lineage-honor-strip.tsx` | Applied render policy to honor-strip avatars. |
| `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx` | Loads current-user lineage render policy for discipline lineage section. |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Loads render policy and adds public lineage-tree QR share. |
| `apps/web/app/(web)/lineage/[treeSlug]/claim/page.tsx` | Adds claim-link QR share. |
| `apps/web/app/(web)/invite/[code]/page.tsx` | Adds invite-link QR share. |
| `apps/web/app/admin/invites/[id]/page.tsx` | Adds admin invite QR share and absolute invite link. |
| `apps/web/app/(web)/members/[slug]/page.tsx` | Adds public profile QR share. |
| `apps/web/server/web/directory/payloads.ts` | Selects `RankAward.id` so member detail rank rows have stable keys. |
| `README.md` | Refreshed root orientation with the legacy WordPress/PHP rebuild rationale, current four-brand status, agentic workflow, engineering/security posture, stack, BBL launch links, and local commands. |
| `docs/runbooks/sops/sop-data-and-wiring-flows.md` | Added comp/gift entitlement flow section and audit/wiring invariants. |
| `docs/runbooks/sops/sop-test-writing.md` | Added safe-action test inventory row for admin entitlement actions. |
| `docs/knowledge/wiki/wiring-ledger.md` | Added and resolved WL-P1-6 for unaudited admin entitlement grants/revokes. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Added QR share component and lineage render-policy inventory notes. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0347 and updated wiring-ledger summary. |
| `docs/knowledge/wiki/log.md` | Added SESSION_0347 wiki-maintenance log entry. |
| `docs/sprints/SESSION_0347.md` | Filled close record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun test server/admin/entitlements/actions.safe-action.test.ts lib/entitlements/lineage-tier-policy.test.ts components/web/lineage/lineage-node-card.policy.test.tsx components/common/qr-share-button.test.tsx` | Passed — 10 tests / 50 assertions. |
| `cd apps/web && bun run typecheck` | Failed on broad pre-existing environment/dependency mismatch diagnostics across unrelated React/Next/Zod/Resend files; no diagnostics matched files introduced or changed for SESSION_0347 when filtered with `rg`. |
| `cd apps/web && bun run lint` | Passed — Biome checked 1194 files; formatter touched session files. |
| `cd apps/web && bun test server/admin/entitlements/actions.safe-action.test.ts lib/entitlements/lineage-tier-policy.test.ts components/web/lineage/lineage-node-card.policy.test.tsx components/common/qr-share-button.test.tsx server/web/directory/queries.avatar-projection.integration.test.ts` | Passed after late QR-origin/directory-payload fixes — 13 tests / 56 assertions. |
| `cd apps/web && bun test --parallel=1 --path-ignore-patterns='e2e/**'` | Passed once during close — 454 tests / 1413 assertions. A later repeated full-suite rerun after browser/dev-server smoke hit unrelated billing/tournament hook timeouts (432 pass / 6 fail / 1 error); implicated files passed in isolation immediately after. |
| `cd apps/web && bun test server/web/billing/checkout-actions.test.ts server/web/billing/drift-audit.test.ts` | Passed isolation after full-suite timeout cluster — 10 tests / 80 assertions. |
| `cd apps/web && bun test server/admin/tournaments/weigh-in.integration.test.ts app/api/stripe/webhooks/route.test.ts` | Passed isolation after full-suite cleanup cluster — 14 tests / 99 assertions. |
| `bun run wiki:lint` | Passed — 601 markdown files, 0 violations. |
| Browser smoke | Passed with headless Playwright: `/lineage/rigan-machado-bjj-lineage` 200 + QR opens; `/members/muay-thai-mike` 200 + QR opens; unauthenticated `/lineage/rigan-machado-bjj-lineage/claim` redirects to sign-in; 0 console errors after directory payload key fix. |

## Open decisions / blockers

- `bun run typecheck` is not a clean gate in the current local dependency graph. The failure is dominated by duplicate React/Next type identities and existing Zod/Resend signature drift in unrelated files; this session did not introduce a new changed-file type diagnostic in the filtered pass.
- Repeated local full-suite runs can still surface non-reproducible cleanup/timeouts in billing/tournament clusters under load. The implicated files passed isolation after the failed broad rerun; no SESSION_0347 code path was implicated.
- Phase-2 consumption is limited to lineage tree/card surfaces. Directory/profile monetized detail policies remain next-session work unless the operator decides to narrow launch scope.
- Fallow is not adopted into gates. A read-only availability check is acceptable at bow-out, but do not install or introduce it into CI without a separate decision.

## Next session

### Goal

Finish BBL tier-gating consumption beyond the lineage tree: apply the render policy to directory/profile detail surfaces, then run a focused launch smoke on free vs premium/elite users.

### First task

Read `docs/runbooks/domain-features/lineage-listing-runbook.md`, this SESSION_0347 close record, ADR 0011, ADR 0019, and WL-P1-6. Then identify every public DirectoryProfile/member/detail surface that exposes lineage-card details and decide whether it consumes the existing `LineageListingRenderPolicy` or needs a narrower profile-detail policy.

### Inputs to read

- `docs/sprints/SESSION_0347.md`
- `docs/runbooks/domain-features/lineage-listing-runbook.md`
- `docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md`
- `docs/architecture/decisions/0011-entitlement-first-commerce.md`
- `docs/architecture/decisions/0019-membership-lifecycle-ownership.md`
- `apps/web/lib/entitlements/lineage-tier-policy.ts`
- `apps/web/server/web/entitlements/lineage-tier-policy.ts`

## Review log

| Reviewer | Verdict |
| --- | --- |
| Desi | Pass with one scope note: free lineage cards now suppress full-card visual affordances (avatar, school, verification, action menu, drawer) while preserving path tracing. Public profile QR placement is additive; next session should finish profile-detail tier consumption rather than implying QR itself grants access. |
| Doug | Pass on the critical security lane: every generic admin entitlement mutation now audits before mutation; safe-action wrappers cover unauth/non-admin/admin paths; QR carries URLs only, not tier authority. Verification caveat: local typecheck is blocked by broad dependency graph drift outside the SESSION_0347 diff. |
| Petey | Scope held. The original QR worktree plan was superseded at handoff; inline execution avoided synthetic merge churn and still delivered all four locked tasks. |

## Hostile close review

### Findings (severity >= medium)

- **Resolved P1:** WL-P1-6 — generic admin `grantUserEntitlement` / `revokeUserEntitlement` could mutate premium/elite entitlement keys without an audit row. Fixed this session by routing through `server/entitlements/admin-grants.ts` and adding wrapper/audit tests.
- **Open verification finding:** `bun run typecheck` is not currently a reliable green gate locally because the app resolves duplicate React/Next type identities plus existing Zod/Resend drift outside this diff. The filtered pass found no SESSION_0347 changed-file diagnostic.

### Giddy verdict

Pass with verification caveat. The work stayed aligned to the locked plan and did not expand product scope into delegated comp authority, BBL import, or schema/API changes.

### Doug verdict

Pass on security/payment posture. Money-path boundaries hold: no Stripe mutation, no `Membership.status` mutation, no client-trusted tier from QR. Audit-before-mutation is now covered for the generic entitlement path.

### Dirstarter / baseline docs check

No live Dirstarter API or baseline-layer replacement was introduced. Existing Baseline primitives and safe-action clients were reused; no new ADR proof table required.

## ADR / ubiquitous-language check

- ADR update: not needed. This session applies ADR 0011 and ADR 0019 without changing either decision.
- Ubiquitous language: no new domain terms introduced. Existing `Passport`, `DirectoryProfile`, `Organization`, `Discipline`, `RankSystem`, `Rank`, `Membership`, and `RegistrationEntry` terms remain unchanged.
- Architecture note: `LineageListingRenderPolicy` is an implementation/read-model name, not a product-domain term.

## Reflections

- The risky cross-pollination was not payment code; it was a second admin write path to the same entitlement keys. The fix is better framed as "one audited mutation surface per access signal" than as a Stripe concern.
- The QR lane is safe only because URLs stay boring. Encoding tier/role hints in QR links would recreate the client-trust problem SESSION_0345 avoided.
- `bun add` stayed minimal in the lockfile, but the local typecheck still resolves a broader mixed dependency graph. Future sessions should not spend launch-lane budget fixing that unless typecheck is the explicit goal.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated touched docs with `updated: 2026-06-05` and `last_agent: codex-session-0347` where applicable: SESSION_0347, wiring-flows SOP, test-writing SOP, wiring-ledger, wiki index/log, custom-component inventory. |
| Backlinks/index sweep | Wiki index includes SESSION_0347; wiring-ledger pairs with SESSION_0347; component inventory pairs with SESSION_0347; wiki log has a SESSION_0347 entry. |
| Wiki lint | `bun run wiki:lint` passed — 601 markdown files, 0 violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Review log + Hostile close review sections present with WL-P1-6 and typecheck caveat. |
| Review & Recommend | Next session goal, first task, and inputs to read are written. |
| Memory sweep | No operator memory update needed; durable facts are captured in the SESSION file, WL-P1-6, SOPs, and component inventory. |
| Next session unblock check | Unblocked; first task is local doc/code review and policy consumption, no user input required. |
| Git hygiene | Branch `main`; FS-0024 guard confirmed repo `/Users/brianscott/dev/ronin-dojo-app` and remote `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; `git worktree list` showed only the main worktree. Single push planned; hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` passed before commit; stats after refresh: 9360 nodes, 14576 edges, 1376 communities, 1591 files tracked. |
| Local show-and-tell artifacts | Generated ignored files for developer walkthrough: `apps/web/public/graphify.html` (served at `http://bbl.local:3000/graphify.html` / `http://localhost:3000/graphify.html`) and `docs/index.html` (served at `http://localhost:8088/index.html`). |

## Post-close CI / deploy check

- GitHub Actions failed on commit `efd7f8f` before any lint/typecheck/test/e2e execution because `pnpm install --frozen-lockfile` detected `qrcode.react` in `apps/web/package.json` but not in `pnpm-lock.yaml`.
- Remediation: regenerated `pnpm-lock.yaml` with the existing root package-manager contract (`pnpm@9.0.0`) and verified the failed CI step locally with `pnpm install --frozen-lockfile`.
- Production domain check: `https://baselinemartialarts.com` returned `200` from Vercel and set `brand=BASELINE_MARTIAL_ARTS`.
