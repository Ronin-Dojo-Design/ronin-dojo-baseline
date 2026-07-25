---
title: "G-009 Phase 0 — entitled-read instrumentation (build-ready design spec)"
slug: payout-phase0-instrumentation-spec-draft
type: design-spec
status: draft-spec
created: 2026-07-24
session: SESSION_0660
author: "Claude (Fable 5) — autonomous design-spec lane, wave 6 (continues #277)"
decision: "DRAFT — dedupe sub-fork (§2.4) open for operator ratification; everything else build-ready"
pairs_with:
  - docs/architecture/research/research-review-creator-payout-model.md
  - docs/sprints/SESSION_0660.md
  - docs/sprints/SESSION_0537.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# G-009 Phase 0 — entitled-read instrumentation (design spec)

> **DRAFT** — staged by an overnight autonomous lane. One sub-fork (§2.4 dedupe window) is
> presented with a recommendation for the operator to ratify; every other section is intended to be
> executable by a build lane without re-derivation.

> **Parent:** PR #277 (`research-review-creator-payout-model.md`, SESSION_0651) surveyed the whole
> G-009 creator-payout design space and left 7 forks open — but named ONE no-regret move: *"ship
> Phase 0 first: entitled-read instrumentation — it's correct under every fork branch and converts
> the attribution decision from taste into data."* This spec is that move, made build-ready. No
> merge-after dependency — #277 was read via `git show` as the source recommendation.

---

## 1. Purpose + non-goals

**Purpose.** BBL has premium community posts (FI-028b, SESSION_0537) and pooled subscription
revenue (D13), but **zero signal about which premium posts entitled members actually read**
(verified §3.4). Every G-009 attribution fork except flat-bounty needs that signal, and even the
fork *decision* needs it (do reads concentrate or spread? — #277 fork F4). Phase 0 records one
minimal, server-side event per entitled premium read so the operator can decide F1/F2/F4/F7 on
data.

**Non-goals (hard boundaries for the build lane):**

- **No payouts, no money movement, no Stripe Connect** — nothing in this phase touches
  `server/web/billing/*`, Stripe keys, or the dormant `StripeAccount`/`PayoutSplit` models.
- **No UI.** No view counters, no author earnings panel, no admin surface. The read-out is SQL
  (§5), runnable by an operator/agent. An AdminCollection surface is a later phase's call.
- **No client-side capture.** No beacons, no cookies, no JS — server-only, on the already-resolved
  entitled read path (§3). The Plausible client analytics stack is untouched.
- **No free-post tracking.** Only *premium* posts read by *paid-tier* members are recorded (§2.2).
  This is payout instrumentation, not general analytics.
- **No behavior change on the read path.** The FI-028b no-leak gate (`post-gate.ts`) and the
  entitlement resolver (`post-access.ts`) keep their exact semantics; the capture is additive and
  fire-and-forget (§3.3).

**Explicitly reversible.** One additive table + one additive server module + one call-site line +
one env flag. Dropping the table and deleting the module restores today byte-for-byte; no other
system will depend on the events until a later phase chooses to (§7).

---

## 2. Event model (schema sketch — NOT a migration)

### 2.1 Proposed model

Names are proposals; the build lane may bikeshed names, not shape.

```prisma
/// G-009 Phase 0 — one row per entitled premium read, deduped per reader/post/UTC-day (§2.4).
/// Payout instrumentation ONLY: aggregate reads (§5) are the product; individual rows are
/// never surfaced in any UI. Privacy posture: §4.
// @added   <build-lane migration>
// @why     G-009 Phase 0 — attribution signal for the creator-payout forks (#277)
// @wired   server/web/community/read-event.ts (write) · aggregation SQL only (read)
model PremiumReadEvent {
  id             String   @id @default(cuid(2))
  /// UTC day bucket the dedupe key rides on (NOT createdAt truncated at read time — the
  /// bucket is computed at write time so the unique constraint can enforce the window).
  readDay        DateTime @db.Date
  /// Which tier entitled this read: LINEAGE_PREMIUM | LINEAGE_ELITE | LINEAGE_LEGEND
  /// (`lib/entitlements/lineage-comp.ts:3-5`). String, not enum — the key space is owned
  /// by the entitlement system, and Phase-2 pool math may weight tiers (#277 F1).
  entitlementKey String
  /// Denormalized author (User id) at write time — pool math groups by author without
  /// joining CommunityPost. Plain string, NO FK: aggregate history should not dangle or
  /// cascade if author accounts churn. Passport resolution happens at read time, the same
  /// way `payloads.ts` resolves author display via the Passport canon.
  authorUserId   String
  createdAt      DateTime @default(now())

  post     CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId   String
  reader   User          @relation(fields: [readerUserId], references: [id], onDelete: Cascade)
  readerUserId String

  @@unique([postId, readerUserId, readDay])
  @@index([authorUserId, readDay])
  @@index([readDay])
}
```

Field-by-field rationale:

| Field | Why this shape |
|---|---|
| `postId` FK, `onDelete: Cascade` | Post hard-delete is admin-only and rare (moderation uses `status: HIDDEN`); if a post is truly deleted its raw read rows go with it. Paid history is protected later by Phase-2 period *snapshots*, not by raw events (#277 Phase 2). |
| `readerUserId` FK, `onDelete: Cascade` | The privacy lever (§4): account deletion erases the member's reading behavior automatically — no DSR special-casing needed. |
| `authorUserId` denormalized, no FK | The task brief suggested `authorPassportId?` — but canon says `CommunityPost.author` is **User-keyed** (`authorId`, `schema.prisma` model CommunityPost; carried server-only on `CommunityPostRowForGate`, `payloads.ts:66`). Record what the write path actually has; resolve User→Passport at aggregation time. |
| `entitlementKey` | Records *which* tier leg entitled the read. Needed if F1 ever weights Elite reads differently; cheap to capture now, impossible to backfill later. Requires threading the resolved tier through the viewer context (§3.2). |
| `readDay @db.Date` | The dedupe window is *enforced by the unique constraint*, so the bucket must be a stored column, not a query-time truncation. UTC, computed at write time. |
| No `brand` column | The community surface pins `Brand.BBL` at both call sites (`posts/page.tsx`, `posts/[slug]/page.tsx:50`); brand is derivable through the post join if the surface ever multi-brands. Don't store what a join answers. |
| No IP / user-agent / session id / duration | Deliberate data-minimization (§4). The row is ids + day, nothing else. |

### 2.2 What counts as a recordable read (the predicate)

A row is written **iff all of**:

1. `post.isPremium === true` — free posts are never tracked.
2. The viewer is signed in (`ctx.userId != null`).
3. The viewer is **not** an admin — admin views are moderation preview, not consumption
   (`post-access.ts:78-80` grants admins unconditionally; that leg must not pollute pool math).
4. The viewer is **not** the author (`post.authorId !== ctx.userId`) — self-reads earn nothing
   under every fork; recording them invites trivial self-inflation.
5. The paid-tier leg entitled the read (`ctx.hasPaidTier === true`).

This is exactly "the read was entitled *by the paid tier*" — the legs mirror
`isCommunityPostViewerEntitled` (`post-access.ts:71-85`) with the admin/author legs *excluded*
instead of included. The predicate is a pure function and unit-testable in isolation (§6.2).

### 2.3 Indexes + retention posture

- `@@unique([postId, readerUserId, readDay])` — the dedupe key AND the idempotent-write mechanism
  (`ON CONFLICT DO NOTHING` / Prisma `createMany` + `skipDuplicates`, §3.3).
- `@@index([authorUserId, readDay])` — every pool query in §5 groups by author over a date range.
- `@@index([readDay])` — period totals + retention pruning.

**Retention:** growth is bounded by (paid members × premium posts × days) — trivially small for
years at BBL scale (~0 paid subscribers at D13 ratification). Posture: **retain raw events at
least until Phase-2 period snapshots exist**; after a period is closed and snapshotted, raw rows
older than ~15 months are prunable by `readDay` (operator-tunable, decided in Phase 2 — Phase 0
ships no pruning job). Rationale: keep enough raw history to re-run attribution candidates against
real data (§7/F4) before any summarization discards it.

### 2.4 OPEN SUB-FORK — dedupe window (recommendation: per reader/post/UTC-day)

| Candidate | For | Against |
|---|---|---|
| **A — one read per reader/post/UTC-day** (recommended) | Absorbs refresh / soft-nav / RSC prefetch double-renders for free; "reader-days" is exactly the unit Medium-style pool math consumes; enforced by a 3-column unique constraint with a conflict-noop write — idempotent, race-safe, zero read-before-write; stores the minimum data | A member who genuinely re-reads a post across sessions in one day counts once (acceptable: payout math wants distinct-reader reach, not raw traffic) |
| B — one read per reader/post/session | Finer engagement granularity | The read path has no durable session identifier to key on (Better Auth session ids rotate and aren't threaded into `CommunityViewerContext`); storing session ids is *more* member data (§4); multi-device same-day reads double-count, inflating exactly the metric payouts depend on; the constraint can't enforce the window — dedupe becomes application logic |
| C — every render, dedupe at query time | Simplest write | Raw rows now include refresh/prefetch noise; every aggregation must re-derive "a read"; unbounded growth for zero analytical gain |

**Recommendation: A.** It is the only candidate where the *database constraint* is the dedupe
mechanism (no race conditions, no app-level bookkeeping), it matches the aggregation unit §5
actually needs, and it is the most private of the three. Note Medium's Partner Program uses a
30-seconds-read client signal — that requires client instrumentation, which is a Phase-0
non-goal (§1); "served an entitled detail render, deduped daily" is the honest server-side proxy.
If richer engagement signals are ever wanted, they layer *on top of* this table, not instead of it.

---

## 3. Capture points

### 3.1 Where the entitled read is served today (canon, cited)

The read is resolved and served in exactly two places — both call the same resolver pair:

| Surface | File:line | What renders |
|---|---|---|
| **Detail page** (the read surface) | `apps/web/app/(web)/posts/[slug]/page.tsx:57-58` — `resolveCommunityViewerContext(row.isPremium)` then `gateCommunityPost(row, isCommunityPostViewerEntitled(row, viewerContext))` inside the React-`cache`d `getData` (line 45) | The **full body** (`Markdown code={view.post.content}`, line 194) + media for an entitled viewer; locked teaser otherwise (line 145) |
| Feed page (NOT a capture point) | `apps/web/app/(web)/posts/page.tsx:94-96` — same resolver pair mapped over the feed | Cards/rows render **excerpt only** (`community-post-card.tsx:78`, `community-post-row.tsx:85-87`) — no body is *displayed*, so a feed render is not a read |

**Capture point: the detail page only.** The feed proves no read intent (excerpt-only render),
and capturing there would count every feed scroll as N reads. One honest observation for the build
lane's awareness (not in scope to change): the feed *serializes* full `content` into the RSC
payload for entitled viewers even though cards render only the excerpt (`CommunityPostMany.content`,
`payloads.ts:49`) — a payload-weight point, not a leak (viewer is entitled), and irrelevant to
capture placement.

The detail's `getData` is wrapped in React `cache` and shared by `generateMetadata` + the page
component (`posts/[slug]/page.tsx:45,73-79`), so one request = at most one capture attempt. Any
residual double-render (RSC prefetch, revisit, refresh) is absorbed by the §2.4 dedupe constraint —
the write is a conflict-noop, so over-firing is harmless by construction.

### 3.2 The minimal seam (server-side, one new module + one call-site line)

**New module** `apps/web/server/web/community/read-event.ts` exporting two things:

1. `shouldRecordPremiumRead(post, ctx): boolean` — the pure §2.2 predicate. No IO, no env.
2. `recordPremiumReadAfterResponse(post, ctx): void` — checks the kill-switch (§6.4) + the
   predicate, then schedules the write via **`after()` from `next/server`** — the repo's proven
   fire-and-forget idiom (precedents: `app/(web)/privacy/request/_actions.ts:30`,
   `app/api/printful/webhooks/route.ts:87`, `server/web/organization/actions.ts:138`). The write
   is a single `db.premiumReadEvent.createMany({ data: [...], skipDuplicates: true })` (maps to
   `ON CONFLICT DO NOTHING` on the §2.1 unique constraint), wrapped so rejection is logged and
   swallowed.

**Call site:** one line in `posts/[slug]/page.tsx` `getData`, immediately after line 58's gate:

```ts
recordPremiumReadAfterResponse(row, viewerContext)
```

**Context extension (additive, behavior-preserving):** `CommunityViewerContext`
(`post-access.ts:24-31`) collapses the tier to a boolean `hasPaidTier`; recording
`entitlementKey` (§2.1) needs the resolved tier. `getLineageProfileDetailRenderPolicyForUser`
already returns `tier` (`lib/entitlements/lineage-tier-policy.ts` — `LineageListingRenderPolicy.tier`),
so the build lane threads it through: add `tier: LineageListingTier | null` to the context type and
populate it in `resolveCommunityViewerContext` (`post-access.ts:45-58`) from the same policy call
it already makes — zero extra queries, no consumer behavior change (`hasPaidTier` keeps its exact
derivation). Map tier→key via the constants in `lib/entitlements/lineage-comp.ts:3-5`.

### 3.3 Failure posture: fire-and-forget, never block the read

- The write runs **after the response is sent** (`after()`), so even a hung DB write cannot delay
  or fail the page.
- Inside the deferred callback: try/catch (or the repo's `tryCatch` util), `console.error` on
  failure, never rethrow. A lost event is noise; a broken read path is an incident.
- The recorder must be provably unable to alter the gate result: it *consumes* `row` + `ctx`
  strictly after `gateCommunityPost` has produced `view`, mutates neither, and returns `void`.
  §6.2's negative test pins this.
- Kill-switch (§6.4) is checked *before* scheduling, so disabling it removes even the deferred
  callback, not just the write.

---

## 4. Privacy / consent posture

**What this table is:** first-party behavioral data — *which premium posts a paying member read,
per day*. That is qualitatively more sensitive than anything `CommunityPost` stores today, and the
posture must say so plainly:

- **Data minimization by schema:** ids + day + tier key only. No IP, no user-agent, no session id,
  no dwell time, no client fingerprint (§2.1). The most invasive question the table can answer is
  "did member X read post Y on day Z" — and no product surface will ask it (next bullet).
- **Aggregation-only reads:** every sanctioned read of this table is an aggregate (§5 — counts,
  shares, distributions grouped by post/author/tier/period). No UI, admin surface, or export may
  list individual readers of a post or the reading history of a member. This is a standing rule
  for later phases, not just a Phase-0 fact; it belongs in the model's doc comment (§2.1) so no
  future lane "discovers" the table as a reader-analytics source.
- **Deletion on account delete:** `readerUserId` FK carries `onDelete: Cascade` — deleting the
  `User` erases their reading rows mechanically. This composes with the existing GDPR-like DSR
  queue (`model DataSubjectRequest`, `schema.prisma` — EXPORT / DELETE / RECTIFY, admin-fulfilled):
  a DELETE fulfillment that removes the User removes the events; an EXPORT fulfillment should
  include the member's rows (they are the member's data — the admin runbook gains one query, §5.6).
- **Consent framing:** server-side first-party measurement of a paid feature's usage, in service
  of paying the authors members read — no cookies, no third parties, no cross-site anything. Same
  privacy class as the existing server-side Plausible aggregate stats (`lib/analytics.ts`,
  SESSION_0254 mutual understanding), and narrower than most (paid members only, premium posts
  only). The privacy policy's data-collection enumeration should gain a line when Phase 0 ships;
  flag it in the build-lane PR for operator wording.
- **Author-facing exposure (later phases):** authors will eventually see *aggregate* read counts
  of their own posts (earnings basis). They must never see reader identities. Same
  aggregation-only rule, stated now so Phase-4 inherits it.

---

## 5. Aggregation queries the attribution forks will need

Reference SQL (Postgres; table/column names per §2.1 — Prisma maps model `PremiumReadEvent` to its
conventional table name at migration time; adjust to the generated names). `:period_start` /
`:period_end` are half-open `[start, end)` UTC dates.

**5.1 Reads per premium post per period** (the basic read-out; #277 Phase-0 deliverable):

```sql
SELECT e."postId", p.title, COUNT(*) AS reader_days
FROM "PremiumReadEvent" e JOIN "CommunityPost" p ON p.id = e."postId"
WHERE e."readDay" >= :period_start AND e."readDay" < :period_end
GROUP BY e."postId", p.title
ORDER BY reader_days DESC;
```

**5.2 View-weighted pool math per author (#277 F4-A sketch)** — the Medium/YouTube-Shorts shape:
`author_cents = pool_cents × author_reader_days / total_reader_days`:

```sql
WITH author_reads AS (
  SELECT "authorUserId", COUNT(*) AS reader_days
  FROM "PremiumReadEvent"
  WHERE "readDay" >= :period_start AND "readDay" < :period_end
  GROUP BY "authorUserId"
), total AS (SELECT SUM(reader_days) AS total_days FROM author_reads)
SELECT a."authorUserId",
       a.reader_days,
       FLOOR(:pool_cents * a.reader_days / t.total_days) AS accrual_cents_floor
FROM author_reads a CROSS JOIN total t
ORDER BY accrual_cents_floor DESC;
```

Phase-2 note baked in now: floor-division leaves a rounding residue; the period-close job must
allocate the residue deterministically (largest-remainder) so shares sum exactly to the pool —
already a #277 Phase-2 gate ("shares sum to pool, rounding residue accounted").

**5.3 Concentration — the query that decides F4** (do reads concentrate in a few posts, making
per-unlock ≈ pooled anyway, or spread, making pooled materially fairer?):

```sql
WITH ranked AS (
  SELECT "postId", COUNT(*) AS rd,
         SUM(COUNT(*)) OVER () AS total_rd,
         ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS rank
  FROM "PremiumReadEvent"
  WHERE "readDay" >= :period_start AND "readDay" < :period_end
  GROUP BY "postId"
)
SELECT rank, "postId", rd, ROUND(100.0 * SUM(rd) OVER (ORDER BY rank) / total_rd, 1) AS cum_pct
FROM ranked ORDER BY rank;
```

**5.4 Per-tier reader-day mix (informs F1 pool weighting):**

```sql
SELECT "entitlementKey", COUNT(*) AS reader_days, COUNT(DISTINCT "readerUserId") AS readers
FROM "PremiumReadEvent"
WHERE "readDay" >= :period_start AND "readDay" < :period_end
GROUP BY "entitlementKey";
```

**5.5 Threshold preview (informs F2 + F7):** run 5.2 at candidate pool sizes/splits and count
authors clearing candidate thresholds ($10/$25) — "N authors would have been paid this period" is
the F7 build-now-vs-defer evidence.

**5.6 DSR EXPORT helper (§4):**

```sql
SELECT "postId", "readDay", "entitlementKey" FROM "PremiumReadEvent" WHERE "readerUserId" = :user_id;
```

---

## 6. Gates + rollout for the build lane

### 6.1 Migration rules (the proven 0639 pattern)

- **`prisma migrate dev` is BANNED** on the shared local DB (`prisma-prod-migration-flow` memory).
- Hand-author the migration: schema edit + a timestamped
  `apps/web/prisma/migrations/<ts>_add_premium_read_event/migration.sql` committed together —
  exactly the SESSION_0639 `add_inbound_email` shape (commit `e5f51f03`: schema.prisma + committed
  migration.sql, PR titled "migration unapplied", applied at AM merge).
- Local apply is the AM-merge owner's step (`prisma db execute --file` or equivalent); prod
  auto-applies via the committed file on deploy (`prebuild → migrate deploy`).
- Run `prisma generate` before any build gate after the schema lands, and capture REAL exit codes —
  never pipe the gate through `tail` (PL-010).

### 6.2 Test plan (pure unit + one integration behind a seam)

- **Pure unit — the predicate** (`shouldRecordPremiumRead`): table-driven over the §2.2 legs —
  free post → never; anon → never; admin → never; author-self → never; free-tier member → never;
  paid-tier member on premium post → yes; each key emitted matches the resolved tier. Same file
  style as `post-gate.test.ts` (pure, no DB).
- **Negative test — the no-leak invariant is untouched:** the existing `post-gate.test.ts` suite
  stays green unmodified, plus one new test pinning that the recorder cannot alter the gate:
  `gateCommunityPost` output for an unentitled viewer is identical with recording enabled/disabled
  (the recorder returns `void` and is called after gating — the test encodes that contract).
- **Integration (one, behind the seam):** with the db seam mocked/injected — the dedupe write is
  `skipDuplicates` (second same-day call → no throw, no second row) and a rejected write is
  swallowed (recorder never throws). Follow the repo's `*.integration.test.ts` pattern.
- **Test hermeticity:** the recorder must be inert under `bun test` by construction (seamed db,
  kill-switch honored) — the live-Resend-under-unit-tests incident
  (`unit-tests-send-real-resend-emails`) is the cautionary precedent for side-effectful code in
  test runs.
- **No e2e required:** server-only, no UI, no user-visible behavior change. (If the 0537 premium
  e2e specs run in CI, they must pass unchanged — that's the behavior-preservation proof.)

### 6.3 Rollout

1. Ship dark: table + recorder + call-site line, no UI, no announcement.
2. Post-deploy smoke: one entitled premium read on prod (operator or dev-login on a premium post)
   → one row; a refresh → still one row (dedupe proven live).
3. Leave it accruing. The §5 queries are the read-out; a fortnight of real data re-opens F4/F1/F7
   with evidence (#277's stated decision path).
4. **Data honesty caveat:** signal only accrues once premium posts AND paid readers exist (~0 paid
   subscribers at D13 ratification). Phase 0 being live *before* the premium catalog grows is the
   point — day-one coverage of whatever happens — but "two weeks of data" starts when reads start,
   not when the table ships.

### 6.4 Kill-switch

`PREMIUM_READ_EVENTS_DISABLED` — env flag, registered in `apps/web/env.ts` + `.env.example`
(the 0639 precedent added env vars the same way; boolean-string convention per `CSP_ENFORCE` in
`config/security-headers.ts:54`). Absent/falsy = recording ON (ship-dark default); `"1"`/`"true"`
= the recorder returns before scheduling anything (§3.3). Rationale for kill- rather than
enable-switch: the feature is inert-by-design (fire-and-forget, additive), so the flag exists for
incident response, not staged rollout — an unset-var default of ON means no prod env edit is
needed to ship, and one env edit (no code change) stops all writes.

---

## 7. Open forks inherited from #277 that Phase 0 does NOT decide

Phase 0 decides nothing about payouts. It produces the evidence the forks need:

| Fork (#277) | Stays open | What Phase-0 data contributes to deciding it |
|---|---|---|
| **F1 — split % and pool definition** | Yes — brand economics, operator's call | §5.2 previews real per-author dollars at any candidate pool/split; §5.4 shows the Premium-vs-Elite reader mix if tier-weighted pools are considered |
| **F2 — payout threshold + cadence** | Yes | §5.5 counts authors clearing $10/$25 candidate thresholds per period — fee-drag vs goodwill argued with names-and-numbers instead of hypotheticals |
| **F3 — Express vs Standard** | Yes — untouched by instrumentation | Nothing direct; indirectly, §5.5's "how many authors would actually be paid" sizes the Express per-active-account fee exposure |
| **F4 — attribution model (A/B/C/hybrid)** | Yes — THE fork Phase 0 exists to inform | §5.3 concentration: reads concentrated in few posts → A≈B, pick the cheaper build; reads spread → A is materially fairer. #277 names a fortnight of this data as the decision input |
| **F5 — tax posture / 1099 characterization** | Yes — tax-advisor question, not engineering | None (correctly — no money moves in Phase 0) |
| **F6 — schema seam (new creator-scoped models vs extending dormant org-scoped `StripeAccount`/`PayoutSplit`)** | Yes | None directly — but note Phase 0 deliberately takes the same stance recommended in #277: it touches neither dormant model (`schema.prisma:1971,1990`), keeping the fork fully open |
| **F7 — build now vs defer behind subscriber threshold** | Yes for Phases 1–4 | Phase 0 IS the no-regret branch both sides of F7 agree on (#277: "Phase 0 is the no-regret move under every branch"); its accruing data (§5.5) then times the Phase-1+ trigger |

**Sub-fork minted by this spec:** §2.4 dedupe window — recommendation A (per reader/post/UTC-day),
awaiting operator ratification before the build lane starts (it shapes the unique constraint, so it
must be decided pre-migration).

---

## Sources (all read this session)

- PR #277 — `docs/architecture/research/research-review-creator-payout-model.md` (read via
  `git show origin/auto/session-0651-rr-creator-payout:…` — no merge-after dependency)
- Canon (cited at file:line throughout): `apps/web/prisma/schema.prisma` (`CommunityPost` 4366,
  `StripeAccount` 1971, `PayoutSplit` 1990, `StripeConnectMode` 782, `DataSubjectRequest`,
  `GamificationEvent` 2665) · `apps/web/server/web/community/post-access.ts` ·
  `…/community/post-gate.ts` · `…/community/payloads.ts` · `apps/web/app/(web)/posts/[slug]/page.tsx` ·
  `apps/web/app/(web)/posts/page.tsx` · `apps/web/components/web/community/community-post-card.tsx` /
  `community-post-row.tsx` · `apps/web/lib/entitlements/lineage-comp.ts` ·
  `apps/web/lib/entitlements/lineage-tier-policy.ts` + `apps/web/server/web/entitlements/lineage-tier-policy.ts` ·
  `apps/web/lib/analytics.ts` · `apps/web/config/security-headers.ts` · commit `e5f51f03`
  (SESSION_0639 migration pattern) · `after()` precedents (`privacy/request/_actions.ts:30`,
  `printful/webhooks/route.ts:87`, `organization/actions.ts:138`)
- Memories: `prisma-prod-migration-flow` · `unit-tests-send-real-resend-emails` ·
  `bbl-membership-tier-model-0472` · `profile-tier-packaging-0502`
