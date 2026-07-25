---
title: "BBL social-flywheel approval queue — build-ready design spec"
slug: social-flywheel-approval-queue-spec-draft
type: design-spec
status: draft-spec
created: 2026-07-24
session: SESSION_0666
author: "Claude (Fable 5) — autonomous design-spec lane, wave 8 (continues #281/#288)"
decision: "DRAFT — consent model/default (§2.3) open for operator ratification; everything else build-ready"
pairs_with:
  - docs/product/black-belt-legacy/social-content-flywheel-draft.md
  - docs/architecture/research/research-review-bbl-social-automation.md
  - docs/sprints/SESSION_0666.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - black-belt-legacy
  - social
  - draft
---

# BBL social-flywheel approval queue (design spec)

> **DRAFT** — staged by an overnight autonomous lane. The consent model + default (§2.3) is
> presented with a recommendation for the operator to ratify; every other section is intended to be
> executable by a build lane without re-derivation.

> **Parents:** PR #281 (`social-content-flywheel-draft.md` + `research-review-bbl-social-automation.md`,
> SESSION_0654) mapped the 7 platform-event→post-type rows and named ONE ground rule for v1:
> *"Approval-queue-first. At v1 nothing auto-posts."* PR #288 (SESSION_0657) spiked the card
> renderer (`scripts/prototypes/bbl-og-cards/cards.ts`) that gives the queue its graphics seam.
> This spec makes the queue itself build-ready. No merge-after dependency — #281/#288/#285 were
> read via `git show` as sources.

---

## 1. Purpose + non-goals

**Purpose.** BBL's domain events (claims verified, belts awarded, techniques promoted, milestones,
blog posts) are the raw material of the social flywheel, but today they evaporate — nothing
captures them as postable drafts, and the wave-4 recommendation (approval-queue-first) has no
surface to run on. This spec defines the minimal event-capture + draft-queue + approval surface
that lets a human review, approve, and **export** brand social content — with consent as a hard
schema-level precondition, not an editorial habit.

**Non-goals (hard boundaries for the build lane):**

- **No platform posting APIs at v1.** No Buffer/Ayrshare/Meta Graph API integration, no OAuth to
  any social network, no scheduler. The v1 "post" action is **copy-export**: copy the caption,
  download the card, and a human pastes it into the platform's own composer. Auto-posting is a
  later fork (§7), and the queue's shape deliberately makes it a config change, not a rebuild.
- **No posts about unclaimed people.** Person-centric drafts (E1/E2) enqueue only for
  verified-claimed, consenting members (§2.3). Placeholder Passports are structurally excluded.
- **No new analytics.** UTM'd links ride the exported caption text; measurement stays in the
  existing Plausible stack. No click-tracking infrastructure in this build.
- **No member-facing UI.** E6 ("share my legacy") and E7 ("Legacy, Wrapped") from the flywheel
  draft are member-initiated **product features**, explicitly out of scope here — the queue covers
  brand-account content only (E1–E5).
- **No editorial content authoring.** The queue holds event-generated drafts; free-form editorial
  posts (explainer/spotlight slots in the cadence grid) stay in whatever tool the operator writes
  them in. (A manual "compose draft" action is a plausible later addition, not v1.)

**Explicitly reversible.** One additive model + one additive consent column + one capture module +
enumerated one-line call sites + one admin route + one env flag. Dropping the table/column and
deleting the module/route restores today's behavior; no existing system will depend on
`SocialDraft` rows.

---

## 2. Event capture

### 2.1 Which domain events enqueue drafts (the seams, verified)

The wave-4 map has 7 rows; E6/E7 are member-initiated (out of scope, §1), so the queue captures
**E1–E5**. All seams below were verified this session at file:line.

| # | Event | Where it actually happens (canon) | Capture point | `subjectKey` |
|---|---|---|---|---|
| **E1** | Lineage claim **verified** | All approve doors converge on `finalizePassportClaim` (`apps/web/server/admin/lineage/claim-finalize.ts:527`): the email-token path (`server/web/lineage/claim-node-for-user.ts:234`, whose two callers are `acceptLineageClaimByToken` in `claim-accept-actions.ts` and `reconcilePendingLineageClaims` in `reconcile-pending-claims.ts`, fired from `lib/auth.ts` `hooks.after` — doc comment `claim-node-for-user.ts:26-29`), the legacy admin lineage door (`server/admin/lineage/claim-review-actions.ts:117`), and the unified review (`server/admin/claims/passport-claim-review-actions.ts:156`, inside `applyPassportClaimReview:56` / `reviewPassportClaim:340`) | Post-commit at each approve action (4 sites, §2.2) | `claim:<PassportClaimRequest.id>` |
| **E2** | Belt award becomes **VERIFIED** | Three verified-award moments: `mintAssertedRankAward` (`claim-finalize.ts:222` — "STATED source + VERIFIED (admin vouched)" `:220`, create `:251`, promote-to-VERIFIED `:241-244`); `finalizeRankPromotion` (`claim-finalize.ts:718` — mints a VERIFIED award `:724` and flips `node.isVerified` `:739-742`); `verifyRankEntryInTransaction` (`server/belt/verify-rank-entry-core.ts:27` — UNVERIFIED→VERIFIED promote `:46-49`, audited `belt.entry.verified` `:63-64`) | Post-commit at the same E1 approve sites (finalize results carry `rankAwardId`, e.g. `claim-review-actions.ts:106`) + the belt-review verify action | `award:<RankAward.id>` |
| **E3** | Technique **promoted to the public library** | There is **no runtime `isPublished` writer** — `Technique.isPublished` (`prisma/schema.prisma:3907`, default false) is seed-controlled; the only runtime editorial "goes public" act is `applySetTechniqueFeatured` (`server/web/techniques/apply-technique.ts:240-273`, RBAC `techniques.manage`), which lifts an authored technique onto public discovery per `TECHNIQUE_DISCOVERY_WHERE` (`server/web/techniques/queries.ts:25-27`) | Post-commit in `setTechniqueFeatured` (`server/web/techniques/crud-actions.ts:47-58`) when `isFeatured` flips true | `technique:<Technique.id>` |
| **E4** | Graph milestone crossed | Not an event row — a computed threshold (e.g. `lineageNode.count({ where: { isVerified: true } })`; `LineageNode.isVerified` is the ONE per-member trust flag, `claim-finalize.ts:711-713`) | **Nightly cron** (§2.5) diffs counts against a threshold table and enqueues | `milestone:<metric>:<threshold>` |
| **E5** | Staff blog `Post` published | `upsertPost` (`server/admin/posts/actions.ts:9-46`) — `Post.status` (`schema.prisma:4321`, `PostStatus @default(Draft)`) rides the form input; there is no discrete publish transition | Post-commit in `upsertPost` whenever the saved status is Published — repeat saves are absorbed by the dedupe key, so no before/after status diffing is needed | `post:<Post.id>` |

**Non-events (deliberate):** UNVERIFIED award mints are never enqueued — the self-added backfill
(`server/belt/router.ts:161-172`, minted UNVERIFIED), admin placeholder seeding
(`server/admin/users/actions.ts:174-181`), and lead placement
(`server/admin/lineage/place-lead-core.ts:95-102`) all create `verificationStatus: UNVERIFIED`
rows; celebrating a stated-but-unverified belt would violate the verified floor. Member
`CommunityPost`s are member content, not brand material (flywheel draft has no row for them;
they go live on create per `schema.prisma:4352-4356`).

### 2.2 Capture mechanics: post-commit, fire-and-forget, conflict-noop

One new module `apps/web/server/web/social/enqueue.ts` exporting:

1. `shouldEnqueueSocialDraft(event): boolean` — the pure eligibility predicate (§2.3 consent legs
   for person-centric types; kill-switch checked by the caller wrapper). No IO. Unit-testable.
2. `enqueueSocialDraftAfterCommit(event): void` — checks the kill-switch (§6.4) + predicate, then
   schedules the write via **`after()` from `next/server`** — the repo's proven fire-and-forget
   idiom (in-file precedents seen this session: `app/api/cron/publish-tools/route.ts:36`,
   `server/admin/posts/actions.ts:39`; more in the 0660 spec §3.2). The write is
   `db.socialDraft.createMany({ data: [...], skipDuplicates: true })` → `ON CONFLICT DO NOTHING`
   on the §3 unique key; rejection is logged and swallowed.

**Why post-commit, not in-transaction:** every E1/E2 seam runs inside a Serializable
`db.$transaction`, where any failed statement aborts the whole transaction — an in-tx
`SocialDraft` insert failure would break the claim/award write itself. A lost draft is noise; a
broken claim path is an incident (the 0660 failure posture, adopted verbatim). The cost is
enumerated call sites instead of one shared seam; the dedupe key makes multi-site over-firing
harmless by construction (both `acceptLineageClaimByToken` and a later admin re-approve of the
same claim produce the same `subjectKey` → conflict-noop).

**Idempotency:** `@@unique([cardType, subjectKey])` (§3) is BOTH the dedupe window and the
idempotent-write mechanism — no read-before-write, race-safe. Re-featuring a technique after an
unfeature does not re-enqueue (acceptable: one celebration per subject); a rejected draft is not
resurrected by a replayed event (the row still exists in REJECTED).

### 2.3 THE CONSENT GATE (F2) — hard precondition for person-centric drafts

**Rule:** a person-centric draft (`CLAIM_VERIFIED`, `RANK_PROMOTION`) is enqueued **iff all of**:

1. The subject Passport is **account-claimed**: `passport.userId != null` (`Passport.userId` is
   nullable; accountless = placeholder, `schema.prisma:1097-1098` + the Phase-3c comment in
   `server/admin/users/actions.ts:167-169`).
2. The subject's node/claim is **verified** (inherent to the E1/E2 seams — they ARE the
   verification moments).
3. The subject has the **affirmative publicity bit** set (below).
4. The payload draws **only already-public profile fields** at the member's tier (enforced by
   what the payload builder is allowed to read — name, avatar, rank + `Rank.colorHex`, lineage
   line; never evidence documents or private account data).

**Where the consent bit lives (schema sketch — NOT a migration):**

```prisma
model Passport {
  // …existing fields (schema.prisma:1069)…

  /// F2 publicity consent — "the brand account may celebrate me publicly" (social queue,
  /// SESSION_0666 spec §2.3). OPT-IN, default OFF. Editable ONLY via the PassportEditor
  /// (ADR 0025 — the ONE identity editor), so an accountless placeholder Passport can
  /// never become consented: the toggle requires an owning, signed-in user.
  allowSocialCelebration Boolean @default(false)
}
```

Rationale for **Passport over `DirectoryProfile`**: `DirectoryProfile` already carries display
prefs (`showEmail`/`showPhone`/`showOrgs`/`showRanks`, `schema.prisma:1141-1150`), which makes it
the superficially obvious home — but those are *directory-presentation* toggles on the
presentation view, while publicity consent is about the **person across every surface** (social
cards name the person, not their directory listing). Passport is the identity SoT (ADR 0025), the
consent travels with the person through claims/merges, and the PassportEditor
(`ProfileEditDrawer` on `/me`) is the ONE editor where it belongs. The build lane adds the toggle
there with plain-language copy ("Let Black Belt Legacy celebrate my milestones publicly").

**Default: OFF (opt-in).** This is F2 option (a) from the research review — explicit toggle,
GDPR-conformant (consent as a separate, un-pre-ticked choice per the review's §2.5 evidence).
Option (b) (paid-tier profile = implied publicity consent) is rejected as the default: profile
visibility ≠ publicity consent. **The operator ratifies the model + default before Phase A**
(the column default is baked into the migration).

**Revocation is honored at every later gate:** the approve and export server actions re-run the
consent check against the live Passport before acting; a person-centric draft whose subject has
revoked consent (or whose Passport lost its account) fails approve/export and is auto-flipped to
`REJECTED` with `rejectedReason: "consent-revoked"`. Enqueue-time consent is necessary, not
sufficient.

### 2.4 Payload snapshot

The draft `payload` (JSON) is built **at enqueue time** from the event row + public profile
fields, shaped exactly as the 0657 renderer inputs (§5): `PromotionCardInput` /
`ClaimVerifiedCardInput` / `MilestoneCardInput` — plus a seeded caption and the CTA path
(`/lineage/...?utm_source=social&utm_campaign=<cardType>`). Belt color resolves from
`Rank.colorHex` at build time (never re-queried at render). The snapshot is what the approver
sees and approves; if the underlying facts change materially (rare), the approver rejects and the
operator re-triggers manually — no live re-derivation.

### 2.5 E4 milestone cron

Follows the ONE existing cron pattern verbatim: `apps/web/vercel.json:6-11` registers
`/api/cron/publish-tools` (daily `0 0 * * *`), and the route gates on
`Bearer ${env.CRON_SECRET}` (`app/api/cron/publish-tools/route.ts:10-14`; `CRON_SECRET` already
registered at `apps/web/env.ts:23`). The build lane adds `/api/cron/social-milestones` (same
auth, same file shape) + one `crons` entry: compute the metric set (verified-node count,
verified black belts per branch, generations — start with verified-node count only), compare
against a hardcoded ascending threshold list (25/50/100/250/…), and enqueue one draft per newly
crossed threshold. Idempotent via `subjectKey = milestone:<metric>:<threshold>` — re-runs
conflict-noop; no state table needed.

---

## 3. Queue model (schema sketch — NOT a migration)

Names are proposals; the build lane may bikeshed names, not shape.

```prisma
/// SESSION_0666 — BBL social-flywheel approval queue (approval-queue-first, wave-4 ground rule).
/// Event-generated brand-social drafts. v1 "post" = copy-export; NOTHING auto-posts.
/// Person-centric rows require live consent at approve/export, not just enqueue (§2.3).
// @added   <build-lane migration>
// @why     social-flywheel-approval-queue-spec-draft.md — capture → approve → export
// @wired   server/web/social/enqueue.ts (write) · app/app/social-queue (read/actions)
enum SocialCardType {
  CLAIM_VERIFIED     // E1 — person-centric
  RANK_PROMOTION     // E2 — person-centric
  TECHNIQUE_FEATURED // E3 — instructor rights fork F5 gates EXPORT (§7)
  GRAPH_MILESTONE    // E4 — aggregate, lowest risk
  BLOG_POST          // E5 — owned content
}

enum SocialDraftStatus {
  DRAFT
  APPROVED
  EXPORTED
  REJECTED
}

model SocialDraft {
  id             String            @id @default(cuid(2))
  cardType       SocialCardType
  /// Idempotency key (§2.2): claim:<id> · award:<id> · technique:<id> ·
  /// milestone:<metric>:<n> · post:<id>. Unique with cardType → enqueue is conflict-noop.
  subjectKey     String
  /// Render-input snapshot at event time (§2.4): the 0657 card input shape + caption seed
  /// + CTA path. The approver approves THIS, not a live re-derivation.
  payload        Json
  /// Operator-editable caption (seeded from payload; edited in the preview drawer).
  caption        String?
  /// Approval-time snapshot of the exact SVG approved (audit trail; §5). Preview renders
  /// live from payload; this freezes what was actually signed off.
  renderedSvg    String?
  status         SocialDraftStatus @default(DRAFT)
  rejectedReason String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  approvedAt     DateTime?
  exportedAt     DateTime?

  approvedBy   User?   @relation(fields: [approvedById], references: [id], onDelete: SetNull)
  approvedById String?

  /// Person-centric subject (E1/E2 only; null for aggregate/owned types).
  /// Cascade — deleting the person deletes their drafts (the privacy lever, mirrors the
  /// 0660 PremiumReadEvent posture): a DSR DELETE erases pending celebrations mechanically.
  passport   Passport? @relation(fields: [passportId], references: [id], onDelete: Cascade)
  passportId String?

  @@unique([cardType, subjectKey])
  @@index([status, createdAt])
  @@index([passportId])
}
```

Field rationale highlights:

| Field | Why this shape |
|---|---|
| `subjectKey` string, no polymorphic FKs | Five subject types; typed FK columns for each would be five nullable FKs for a queue row that only needs identity + dedupe. The payload snapshot carries the display data; the key carries idempotency. (`passportId` IS a real FK because it does a job: consent re-check + privacy cascade.) |
| `payload` JSON | The queue is renderer-agnostic (fork F4 stays open — §7): a buy-tool (Placid/Bannerbear) would consume the same payload. JSON is acceptable here because the shape is versioned by `cardType` and consumed only by the renderer seam. |
| `renderedSvg` nullable | Written at approve-time only (§5). Not at enqueue — rendering is cheap and pure, so DRAFT rows render on demand; the snapshot exists for audit ("what exactly did we approve"), not caching. |
| `approvedById` SetNull | Audit survives account churn; mirrors `PassportClaimRequest.reviewedBy` (`schema.prisma:3236-3237`). |
| No channel/schedule columns | v1 has no scheduler (§1). When auto-posting arrives (§7), channel + slot land as additive columns; the status machine already has the seam (`APPROVED` → posted-by-machine instead of `EXPORTED`-by-human). |

**Status machine:** `DRAFT → APPROVED → EXPORTED` · `DRAFT → REJECTED` · `APPROVED → REJECTED`
(pulled before export, incl. consent revocation §2.3). No other transitions; enforced in the
server actions, not the DB.

**Retention:** volume is bounded by real domain events (a few dozen rows/month at current scale —
trivially small for years). `EXPORTED`/`REJECTED` rows older than ~12 months are prunable
(operator-tunable); v1 ships **no pruning job**. Person-centric rows additionally die with their
Passport (Cascade).

---

## 4. Surface: `/app/social-queue` (conformed AdminCollection)

**The pattern is the law** (`admin-collection-one-surface-law` memory): the queue is a conformed
`AdminCollection` data-table — the frame at `components/admin/admin-collection.tsx:16-60`, the
reference impl at `app/app/tools/page.tsx:7-16` (params-cache → server query promise → `Suspense`
→ table component), and the closest structural sibling is the belt-review queue
(`app/app/belt-reviews/page.tsx:14-22` — "a SIBLING AdminCollection of `/app/techniques`", a
review queue whose segment layout gates both index and detail). Claims (`app/app/claims/*`)
supplies the approve/reject row-action precedent.

**Route:** `app/app/social-queue/` — `page.tsx` + `_components/social-queue-table.tsx` (+
columns/toolbar files per the tools/claims file shape) + `server/admin/social-queue/`
(queries/schema/actions).

**Columns:** Preview thumbnail (SVG rendered from `payload`, small) · Type (cardType badge) ·
Subject (person name / technique / post title / milestone line, from payload) · Status ·
Created · Approved by. Default sort `createdAt` desc; column pinning right `actions` (the tools
table convention, `tools-table.tsx:29`).

**Filters:** faceted `status` + `cardType` (the `filterFields` slot of the frame).

**Row actions:**

- **Preview** — drawer/sheet with the full-size rendered card + the editable caption field
  (saves to `caption`). The only place the draft is edited.
- **Approve** — re-runs the consent check (§2.3), snapshots `renderedSvg`, stamps
  `approvedById`/`approvedAt`, status → `APPROVED`.
- **Reject** — reason required, status → `REJECTED`. Available on DRAFT and APPROVED.
- **Copy export** — APPROVED rows only; re-runs the consent check; copies the caption (with UTM
  link) to the clipboard + downloads the card (§5); stamps `exportedAt`, status → `EXPORTED`.
  For `TECHNIQUE_FEATURED` rows this action is disabled with an "F5 undecided" notice until the
  instructor-rights fork is ratified (§7) — the queue may hold what it may not yet ship.

**No header CTA** at v1 — drafts arrive by event only; a manual "compose draft" is a later
addition (§1).

**Authz — from the real matrix:** the per-area matrix is `APP_AREA_PERMISSIONS`
(`server/orpc/roles.ts:118+`) consumed via `can()` (`server/orpc/permissions.ts:40`). The
matrix's own documented rule (the `clientIntake` comment, `roles.ts:129-137`, mirrored by
`planningIntake`/`loopBoard` and `beltReviews:121-125`): **a new authz NEED maps to a new KEY in
the existing per-area matrix, never a new system**. Recommended: add
`socialQueue: "social-queue.manage"` — admin `"*"` covers it, zero grant plumbing, and the
segment layout gates on it exactly like `/app/belt-reviews` gates on `belt.admin`. (The closest
*existing* key is `posts.manage` — the staff editorial-content cap — acceptable if the operator
prefers zero new keys, but a marketing queue reviewable by a future VA should be grantable
without handing over blog admin; the new key is the matrix-conformant default.)

---

## 5. Rendering seam: graduating the 0657 card renderer

**What exists (verified):** `scripts/prototypes/bbl-og-cards/cards.ts` (branch
`auto/session-0657-bbl-og-cards`, PR #288) — three pure SVG-string renderers
(`renderPromotionCard` / `renderClaimVerifiedCard` / `renderMilestoneCard`) over typed inputs
(`PromotionCardInput` / `ClaimVerifiedCardInput` / `MilestoneCardInput`), with `escapeXml`,
`safeBeltColor` (hex-validated, falls back to the accent), a 1200×630 `svgShell`, and an explicit
prototype note: *"Prototype literals only. The live app's brand tokens are the eventual source."*

**Production home (proposal):** `apps/web/lib/social-cards/` — the renderers move essentially
as-is (pure string-in/string-out, no React, no satori, no IO; unit-testable by string assertion).
Two additions at graduation:

1. **Palette from the brand SoT:** the `PALETTE` literals resolve from `BrandSettings` (the DB is
   the brand color/asset SoT — `brand-color-sot-is-db` memory) at **payload-build time**, and
   `Rank.colorHex` rides the payload (§2.4) — the render functions stay pure (they receive
   resolved hex strings, never query).
2. **Two missing card types:** `TECHNIQUE_FEATURED` and `BLOG_POST` templates (same shell; title
   card + freemium/blog CTA line), built to the same input-type discipline.

**Relationship to the existing OG seam:** the production OG route
(`app/api/og/route.tsx:1-31`, `ImageResponse` from `next/og` + `components/web/og/og-base.tsx`)
is a *different* renderer class (JSX→PNG via satori at request time, serving meta tags). At v1
they stay separate: the queue consumes the pure-SVG renderers directly (server-render the string
for the preview drawer, ship it in the export). Converging the two (the "one renderer also serves
profile OG images" argument from the research review §2.3, and the real "one kernel" play) is an
open fork — do not pre-unify.

**Export mechanics (v1):** download the SVG + copy the caption. Optional stretch: client-side
canvas rasterization (SVG → PNG in the browser at copy-export) — zero server infrastructure;
platform composers accept PNG. Server-side rasterization is explicitly NOT v1.

**Kernel extraction:** NOT at v1. Per the extraction doctrine (`kernel-extracts-dirstarter-l1`
memory, ADR 0040 Option B), code moves to `packages/ui-kit` when a second app consumes it —
extract on demand, never preemptively. The renderers living in `apps/web/lib/` with pure
signatures makes that future extraction mechanical.

---

## 6. Build-lane plan

### 6.1 Phases (each lands green before the next starts)

| Phase | Scope | Gate |
|---|---|---|
| **A — schema + consent** | `SocialDraft` + enums + `Passport.allowSocialCelebration` (ONE hand-authored migration); consent toggle in the PassportEditor (`ProfileEditDrawer` on `/me`) with plain-language copy; `SOCIAL_QUEUE_DISABLED` env flag registered in `apps/web/env.ts` + `.env.example` | Migration rules §6.2; `prisma generate` then typecheck/oxlint/tests real-exit-code green; toggle round-trips on `/me` |
| **B — capture** | `server/web/social/enqueue.ts` (predicate + `after()` conflict-noop writer + payload builders); wired at the §2.1 seams (E1 ×4 approve sites, E2 belt-review verify action, E3 `setTechniqueFeatured`, E5 `upsertPost`) | Unit tests §6.3 green; existing claim/belt/technique/post suites green **unmodified** (behavior-preservation proof — capture is additive fire-and-forget) |
| **C — surface + renderer** | `/app/social-queue` AdminCollection + row actions (approve/reject/copy-export with consent re-check); `lib/social-cards/` graduation (+ the two new templates); `socialQueue` key in `APP_AREA_PERMISSIONS` | Typecheck/lint/tests + **affected e2e** (UI change → run the e2e leg per the gates memory); manual smoke: seed a draft, preview, approve, export, verify consent-revocation blocks export |
| **D — milestone cron** | `/api/cron/social-milestones` + `vercel.json` crons entry (§2.5) | Route unit test (auth gate + threshold idempotency); local invoke with `CRON_SECRET` produces exactly-once drafts across two runs |

Phases A+B can ship dark (no surface yet — rows simply accrue, provable by SQL); C is the first
visible change; D is independent of C.

### 6.2 Migration rules (the proven 0639 pattern)

- **`prisma migrate dev` is BANNED** on the shared local DB (`prisma-prod-migration-flow` memory).
- Hand-author: schema edit + timestamped
  `apps/web/prisma/migrations/<ts>_add_social_draft_and_consent/migration.sql` committed together
  (the SESSION_0639 `add_inbound_email` shape — PR flagged "migration unapplied", applied by the
  AM-merge owner; prod auto-applies via committed file on deploy, `prebuild → migrate deploy`).
- `prisma generate` before any build gate after the schema lands; capture REAL exit codes — never
  pipe the gate through `tail` (PL-010).

### 6.3 Test plan

- **Pure unit — the predicate** (`shouldEnqueueSocialDraft`): table-driven — placeholder Passport
  (userId null) → never; claimed but consent OFF → never; consent ON + claimed + verified → yes;
  aggregate/owned types → no consent legs consulted; kill-switch honored by the wrapper.
- **Pure unit — renderers:** each card type renders a well-formed SVG containing the escaped
  inputs; `safeBeltColor` rejects non-hex; XML injection via a hostile display name stays escaped
  (the 0657 `escapeXml` contract, now pinned by test).
- **Integration (seamed db):** `skipDuplicates` conflict-noop (second enqueue of the same
  subjectKey → no throw, no second row); rejected write swallowed (enqueuer never throws);
  approve/export actions flip status + reject on revoked consent.
- **Hermeticity:** the enqueuer must be inert under `bun test` by construction (seamed db,
  kill-switch honored) — the live-Resend-under-unit-tests incident
  (`unit-tests-send-real-resend-emails`) is the standing caution for side-effectful code in
  test runs.

### 6.4 Kill-switch

`SOCIAL_QUEUE_DISABLED` — env flag, boolean-string convention per `CSP_ENFORCE`
(`config/security-headers.ts`), registered in `apps/web/env.ts` + `.env.example`. Absent/falsy =
capture ON; `"1"`/`"true"` = `enqueueSocialDraftAfterCommit` returns before scheduling anything.
Kill- rather than enable-switch (the 0660 rationale): the feature is inert-by-design (additive,
fire-and-forget, nothing auto-posts), so the flag exists for incident response — one env edit
stops all new drafts with no code change. The **surface stays up** when the flag is on
(permission-gated anyway) so existing drafts can still be reviewed or killed mid-incident.

---

## 7. Open forks inherited — restated, NOT decided

| Fork (#281 F1–F6) | Status after this spec |
|---|---|
| **F1 — platform priority** (IG-first vs TikTok-first vs FB-groups-first) | Untouched — the queue is channel-agnostic (export is copy-out; the human picks the composer) |
| **F2 — consent model** | This spec proposes the **mechanism** (Passport bit, §2.3) and recommends **explicit opt-in toggle, default OFF**; the operator ratifies model + default before Phase A (the default is baked into the migration). Sub-fork also minted: the bit's home (Passport, recommended, vs DirectoryProfile) |
| **F3 — auto-post vs approval-queue** | v1 is queue-only BY DESIGN (§1 non-goal); the "aggregates could full-auto" counter-case stays open for after real queue data exists. The status machine reserves the seam (§3) |
| **F4 — graphics build vs buy** | This spec biases build (the 0657 renderers graduate, §5) but keeps the queue renderer-agnostic: `payload` JSON is tool-neutral, so Placid/Bannerbear remain drop-in buy-options |
| **F5 — technique-clip/instructor rights** | OPEN and enforced: `TECHNIQUE_FEATURED` drafts enqueue but their **copy-export is disabled** until the operator ratifies the rights posture (§4) |
| **F6 — account ownership / who owns the approval slot** | Untouched — but the queue makes the slot concrete (one weekly pass over `/app/social-queue`); unowned queues die, so F6 should be decided when the build lane is scheduled |
| **Auto-posting later** (Buffer/Ayrshare/Graph API — research review §2.4) | Deliberately deferred; the architecture makes it a config-shaped addition (channel/schedule columns + a poster worker consuming `APPROVED`), not a rebuild |
| **OG/social renderer convergence** (§5) | New fork minted — do not pre-unify |
| **Authz key** (§4) | Recommended new `social-queue.manage` key; `posts.manage` is the zero-new-keys fallback — operator's call at Phase C |

---

## Sources (all read this session)

- PR #281 — `docs/product/black-belt-legacy/social-content-flywheel-draft.md` +
  `docs/architecture/research/research-review-bbl-social-automation.md` (read via
  `git show origin/auto/session-0654-rr-bbl-social:…` — no merge-after dependency)
- PR #288 — `scripts/prototypes/bbl-og-cards/cards.ts` (read via
  `git show origin/auto/session-0657-bbl-og-cards:…`)
- PR #285 — `docs/product/black-belt-legacy/payout-phase0-instrumentation-spec-draft.md`
  (SESSION_0660; the house-style/format bar, read via `git show origin/auto/session-0660-bbl-payout-phase0:…`)
- Canon (cited at file:line throughout): `apps/web/server/web/lineage/claim-node-for-user.ts` ·
  `…/lineage/claim-accept-actions.ts` · `…/lineage/reconcile-pending-claims.ts` ·
  `apps/web/server/admin/lineage/claim-finalize.ts` · `…/lineage/claim-review-actions.ts` ·
  `apps/web/server/admin/claims/passport-claim-review-actions.ts` ·
  `apps/web/server/belt/verify-rank-entry-core.ts` · `apps/web/server/belt/router.ts` ·
  `apps/web/server/admin/users/actions.ts` · `apps/web/server/admin/lineage/place-lead-core.ts` ·
  `apps/web/server/web/techniques/{apply-technique,crud-actions,queries}.ts` ·
  `apps/web/server/admin/posts/actions.ts` · `apps/web/prisma/schema.prisma` (`Passport:1069`,
  `DirectoryProfile:1141`, `PassportClaimRequest:3202`, `Technique:3889`, `Post:4313`,
  `CommunityPost:4366`) · `apps/web/components/admin/admin-collection.tsx` ·
  `apps/web/app/app/tools/page.tsx` · `apps/web/app/app/belt-reviews/page.tsx` ·
  `apps/web/server/orpc/{roles,permissions}.ts` · `apps/web/app/api/cron/publish-tools/route.ts` ·
  `apps/web/vercel.json` · `apps/web/env.ts` · `apps/web/app/api/og/route.tsx`
- Memories: `admin-collection-one-surface-law` · `brand-color-sot-is-db` ·
  `kernel-extracts-dirstarter-l1` · `prisma-prod-migration-flow` ·
  `unit-tests-send-real-resend-emails` · `passport-identity-consolidation` (ADR 0025) ·
  `claim-unification-adr-0036` · `lineage-rank-display-awarded-truth`
