---
title: "Phase 3 User-Carry Identity Preflight Map (Black Belt Legacy)"
slug: phase3-user-carry-preflight
type: design
status: active
created: 2026-06-12
updated: 2026-06-15
last_agent: codex-session-0391
author: Doug + Brian
pairs_with:
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - phase3
  - identity
  - migration
  - passport
  - preflight
---

# Phase 3 User-Carry Identity Preflight Map

**DOC ONLY.** This is the execution map a future Phase 3 session runs *before* touching
`schema.prisma`. It pre-decides every `userId`-bearing model's disposition under SOT-ADR **D1**
(person-rooted identity) using the **D7/D9/D10 user-carry** migration semantics (preserve
`User`/`Passport`, repoint satellites by lookup — **not** clean reseed). All line numbers are
`apps/web/prisma/schema.prisma` as of SESSION_0374 (3787 lines). Verify they still hold at execution
time (the cuid2 wave rides the same window and will churn the file).

## D1 in one line

`Passport` = identity SoT. `Passport.userId` becomes **nullable** (an accountless Passport = the
placeholder, replacing synthetic `User{ isPlaceholder: true }` rows). The **5 identity
satellites** — `DirectoryProfile`, `LineageNode`, `RankAward`(earner), `Affiliation`, and
`FightRecord` — repoint their FK `userId` → `passportId`. Historical imported `RankAward` promoters
can also carry a Passport identity via `awardedByPassportId`; `awardedById` stays the optional
real-account actor link. `User` (Better-Auth account) stays the **actor/account** for everything
account-side. `MediaAttachment.passportId` (line 3313) already exists and is the proof-of-shape
precedent: it is the only model that points at Passport today.

**The litmus test for every row below:** does the row record **WHO-A-PERSON-IS** (identity →
**REPOINT** to passport) or **WHAT-AN-ACCOUNT-DID** (action/membership/audit → **CARRY** on user)?
A placeholder person (no account) must be able to own every REPOINT row; it must never own a CARRY
row.

---

## Section 1 — Classification table (one row per `userId`-bearing model)

Disposition legend: **REPOINT** = FK `userId`→`passportId` (identity satellite) · **CARRY** = stays
on `User` (account/actor) · **DUAL** = one identity link repoints + a separate actor link stays on
`User` · **DECISION-NEEDED** = see §4.

| Model | schema line | current `userId` role | Disposition | Rationale |
|---|---|---|---|---|
| **Passport** | 957 (`userId` 982) | identity row's own account link, `@unique` | **ROOT (make nullable)** | The root itself. `userId String @unique` → `userId String? @unique`. Accountless = placeholder. |
| **DirectoryProfile** | 990 (`userId` 1007) | the person's public profile, `@unique` | **REPOINT** | D1-named satellite. A placeholder person has a directory profile; it is WHO-they-are. `@unique` moves to `passportId`. |
| **LineageNode** | 2483 (`userId` 2495) | the person's lineage node, `@unique` | **REPOINT** | D1-named satellite. The canonical placeholder/claim surface today. `@unique` moves to `passportId`. |
| **RankAward** | 2000 (`userId` 2012; `awardedById` 2016) | belt earner (`EarnedBy`) + promoter (`AwardedBy`) | **DUAL+PROMOTER PASSPORT** | D1-named satellite. `userId`(earner)→`passportId` (a placeholder earns belts). `awardedById` **CARRIES** on `User?` for real account actors; imported/historical placeholder promoters move to `awardedByPassportId`. `@@unique([userId,rankId])`→`([passportId,rankId])`. |
| **Affiliation** | 1288 (`userId` 1299) | person↔school relationship | **REPOINT** | D1-named satellite (the BBL school axis, SESSION_0357/0358). A placeholder trains at a school. `@@index([userId,isCurrent])`→passport. |
| Session | 156 (`userId` 168) | active login session | **CARRY** | Better-Auth account internal. No placeholder ever has a session. |
| Account | 174 (`userId` 190) | OAuth/credential provider link | **CARRY** | Better-Auth account internal. Auth-side only. |
| Bookmark | 309 (`userId` 316) | who bookmarked a tool | **CARRY** | An account action. WHAT-an-account-did. |
| Membership | 1206 (`userId` 1221) | community/account membership state | **CARRY** | Explicit in D1 + superseded ADR 0019: Membership = account state, stays user-side. Placeholders have no membership. |
| ProgramEnrollment | 1433 (`userId` 1443) | who enrolled in a program | **CARRY** | Account action; needs a real participant account. |
| ClassInstructorAssignment | 1484 (`userId` 1493) | who teaches a class | **CARRY** | See §3 — operational staffing, action not identity. |
| CheckIn | 1521 (`userId` 1531) | who checked in | **CARRY** | Account event. |
| Attendance | 1538 (`userId` 1545) | who attended a session | **CARRY** | Account event. |
| BeltTestRegistration | 1580 (`userId` 1595) | who registered for a belt test | **CARRY** | Account action / operational registration. |
| FamilyMember | 1636 (`userId` 1645) | member of a family group | **CARRY** | See §3 — account-side household composition. |
| Invoice | 1686 (`userId` 1709) | billed account | **CARRY** | Commerce. Account only. |
| StripeCustomer | 1756 (`userId` 1765) | Stripe customer link | **CARRY** | Commerce. Account only. |
| MembershipContract | 1845 (`userId` 1862) | contract signatory account | **CARRY** | Commerce/legal. Account only. |
| NotificationPreference | 1871 (`userId` 1880) | account notification settings | **CARRY** | Account preference; needs a deliverable channel. |
| RankAward.awardedById | 2016 | promoter | **CARRY** (the DUAL half) | Acting account. Captured in the RankAward DUAL row above. |
| CourseEnrollment | 2135 (`userId` 2143) | who enrolled in a course | **CARRY** | Account action. |
| Registration | 2260 (`userId` 2274, already `String?`) | tournament registrant (guest-nullable) | **CARRY** | Already guest-nullable (ADR 0020). Account/guest action, not identity. |
| TournamentStaffAssignment | 2331 (`userId` 2340) | staffing role | **CARRY** | Operational staffing action. |
| GamificationEvent | 2371 (`userId` 2379) | who earned points | **CARRY** | See §3 — append-only account activity ledger. |
| UserBrandSubscription | 2460 (`userId` 2470) | brand subscription | **CARRY** | Account/commerce. |
| LineageTreeAccess | 2631 (`userId` 2640) | RBAC grantee on a tree | **CARRY** | Must be a real account (RBAC actor). D1 explicitly excludes; granted account performs edits. |
| WaiverSignature | 2782 (`userId` 2791; `signedOnBehalfId` 2794) | signer + on-behalf-of | **CARRY** (both) | See §3 — legal act by an account. `signedOnBehalfId` also CARRIES. |
| Certification | 2804 (`userId` 2816; `issuedById` 2821) | cert holder + issuer | **CARRY** (see §3/§4) | See §3 — credential held by an account; org-issued, account-scoped. Borderline; argued CARRY. |
| InviteClaim | 2992 (`userId` 2998) | who claimed an invite | **CARRY** | Account action in the invite flow. |
| EventRegistration | 3042 (`userId` 3054) | who registered for an event | **CARRY** | Account action. |
| FightRecord | 3118 (`userId` 3127) | a person's career W/L record | **REPOINT** | Operator promoted it in SESSION_0390: durable athletic identity carries with a placeholder person. `@@unique([userId,disciplineId,type])`→passport. |
| AuditLog | 3136 (`userId` 3149) | actor of an audited action | **CARRY** | Definitionally the acting account. Never a placeholder. |
| WeighInRecord | 3233 (`userId` 3244) | who weighed in | **CARRY** | Operational event tied to a registration. |
| TechniqueProgress | 3425 (`userId` 3433) | account's per-technique progress | **CARRY** | Account learning activity. |
| CertificateOrder | 3473 (`userId` 3495) | who ordered a certificate | **CARRY** | Commerce. Account only. |
| CertificateIssuance | 3507 (`userId` 3521) | recipient of an issued cert | **CARRY** (see §3) | Issuance artifact of a CARRY Certification; follows its parent. |
| Favorite | 3533 (`userId` 3540) | who favorited an entity | **CARRY** | Account action. |
| StudentListMember | 3565 (`userId` 3572) | membership of a saved student list | **CARRY** | See §3 — an account-scoped CRM list. |
| UserEntitlement | 3610 (`userId` 3620) | account's entitlement grant | **CARRY** | Commerce/access. Account only (comp grants attach to claimant account). |
| MerchOrder | 3661 (`userId` 3713) | who ordered merch | **CARRY** | Commerce. Account only. |
| DataSubjectRequest | 3770 (`userId` 3772/3781) | GDPR submitter | **CARRY** | Legal actor = the account. |
| Post | 3728 (`authorId` 3747, *not* `userId`) | content author | **CARRY** | See §3 — authorship is an authoring-account act, not directory identity. |

**Counts:** REPOINT = **4** (DirectoryProfile, LineageNode, Affiliation, FightRecord) · DUAL =
**1** (RankAward: earner→passport, real promoter actor carries, historical promoter identity can point
to Passport) · ROOT-nullable = **1** (Passport) · CARRY = **34**. The 5 identity satellites = the 4
REPOINTs + the RankAward DUAL.

---

## Section 2 — The identity satellites: exact column moves

For each, the FK and every constraint/index that names `userId` moves to `passportId`. Back-relations
on `User` move to `Passport`. **Do not** drop `User`-side back-relations for models that also keep a
`User` actor (RankAward).

- **DirectoryProfile** (990): `userId String @unique` → `passportId String @unique`; relation
  `user User` → `passport Passport`. One profile per passport.
- **LineageNode** (2483): `userId String @unique` → `passportId String @unique`; relation
  `user User` → `passport Passport`. This is the model the claim flow rewrites (§5).
- **Affiliation** (1288): `userId String` → `passportId String`; `@@index([userId, isCurrent])` →
  `@@index([passportId, isCurrent])`. Non-unique (a person has many affiliations).
- **RankAward** (2000) — **DUAL, the one that is not a clean swap:**
  - earner: `user User @relation("EarnedBy", fields:[userId])` → `passport Passport @relation("EarnedBy", fields:[passportId])`.
  - promoter account actor: `awardedBy User? @relation("AwardedBy", fields:[awardedById])` — stays
    nullable User for real accounts that performed an award action.
  - promoter identity: `awardedByPassportId` stores imported/historical promoter person identity when
    the old `awardedById` was only a synthetic placeholder User. Copy by `Passport.userId` lookup, then
    null placeholder `awardedById` before deleting placeholder Users.
  - `@@unique([userId, rankId])` → `@@unique([passportId, rankId])`; `@@index([userId, awardedAt])` →
    passport; `@@index([awardedById])` stays (still a User FK); add `@@index([awardedByPassportId])`.

`MediaAttachment.passportId` (3313) already exists — no change; it is the existing precedent and the
Passport-side back-relation is already wired (`mediaAttachments` on Passport, line ~986).

---

## Section 3 — Ambiguous-model adjudications (firm calls)

Default bias: **D1 names exactly 4 satellites.** Adding a 5th requires (a) the row is durable
person-identity, AND (b) placeholders must be able to own it. Each below is argued against that bar.

- **FightRecord** (3118) → **REPOINT (resolved SESSION_0390).** `@@unique([userId, disciplineId,
  type])` is a per-person career W/L tally — durable athletic identity a placeholder fighter should
  carry pre-claim. Phase 3b moves the unique/index shape to `passportId`.

- **Certification** (2804) → **CARRY.** A credential *held by an account*, scoped to an
  `organization` (required FK) and issued by `issuedById` (a User). It is WHAT-an-org-granted-an-account,
  not WHO-a-person-is in the directory. The active/expired/revoked lifecycle is account-operational.
  No placeholder is ever certified. Keep `userId` and `issuedById` on User.

- **CertificateIssuance** (3507) → **CARRY.** A 1:1 issuance artifact (`certificationId @unique`) of a
  Certification. It must follow its parent's disposition; parent is CARRY, so this is CARRY. The PDF/QR
  artifact belongs to the account that holds the credential.

- **GamificationEvent** (2371) → **CARRY.** An append-only points/activity *ledger*
  (`@@index([userId, createdAt])`) — the canonical WHAT-an-account-did. Repointing would conflate a
  person's identity with their activity stream and break the brand-scoped (`brand Brand`) account
  accounting. Placeholders earn no points.

- **FamilyMember** (1636) → **CARRY.** Membership of a `FamilyGroup` household
  (`@@unique([familyGroupId, userId])`) — an account-side household/billing composition, not directory
  identity. Family *relationships between people* are a separate lineage/Phase-4 concern; this join row
  is account-scoped.

- **StudentListMember** (3565) → **CARRY.** A saved CRM list membership
  (`@@unique([studentListId, userId])`) — an operator-curated account roster, WHAT-an-operator-grouped,
  not the person's own identity.

- **ClassInstructorAssignment** (1484) → **CARRY.** Operational staffing
  (`@@unique([classScheduleId, userId])`): who *acts as* instructor for a class. An acting role of an
  account, not durable identity (instructor *identity/credential* lives in RankAward/Certification).

- **WaiverSignature** (2782) → **CARRY (both FKs).** A timestamped legal *act* (`signedAt`, `ipAddress`,
  `userAgent`) — the archetypal WHAT-an-account-did. `signedOnBehalfId` (2794) is a second User actor
  (guardian-on-behalf-of) and also CARRIES. No placeholder signs a waiver.

- **Post** authorship (3728, `authorId` not `userId`) → **CARRY.** Authorship is an *authoring-account*
  act; the byline is the account that wrote it. BBL posts are operator-fed (D9). Public author *identity*
  surfaces (avatar/displayName) already read through Passport at the read-model layer — authorship FK
  does not need to be the identity link. Keep `authorId` on User.

---

## Section 4 — Operator decisions resolved

- **FightRecord (3118) — REPOINT.** Operator promoted it in SESSION_0390; it is the 5th identity
  satellite and participates in the Phase 3b `passportId` backfill and old `userId` drop.

- **Certification (2804) — confirm CARRY.** Adjudicated CARRY in §3, but flagged here because an
  operator who treats "black belt instructor certification" as directory-facing identity could argue
  otherwise. Recommendation: **CARRY** — it is org-issued and account-scoped; rank/identity already
  lives in the REPOINTed RankAward.

---

## Section 5 — Placeholder → accountless-Passport migration (data-level)

Today a placeholder is a synthetic `User { isPlaceholder: true }` (line 61) that a real `Passport`
(or LineageNode) hangs off of. Under D1 the *Passport* becomes the placeholder and the synthetic User
disappears. Data-level steps (run inside one transaction, after the schema columns exist but before
dropping the old `userId` columns — see §6 ordering):

1. **Add nullable columns:** add `passportId` to each REPOINT/DUAL satellite (nullable initially) and
   make `Passport.userId` nullable. Keep old `userId` columns in place for the backfill.
2. **Mint missing Passports first** for every `DirectoryProfile`/`LineageNode`/`Affiliation`/
   `RankAward` earner/`FightRecord` User and every historical `RankAward.awardedById` promoter User
   that lacks one. The backfill assumes a Passport exists for each source User.
3. **Reconcile historical promoters:** copy `RankAward.awardedByPassportId` from
   `Passport.userId = RankAward.awardedById` and null `awardedById` when the promoter User is synthetic
   placeholder-only. Real account promoter actors may keep `awardedById`.
4. **Backfill satellite `passportId` by lookup** for *all* rows (real and placeholder):
   `satellite.passportId = (SELECT id FROM Passport WHERE Passport.userId = satellite.userId)`.
   Because Passport↔User is 1:1 today (`userId @unique`), this is deterministic. Do it for
   DirectoryProfile, LineageNode, Affiliation, RankAward(earner only), and FightRecord.
5. **Regenerate all single-column string primary keys to cuid2** inside the destructive window. The
   Phase 3b script discovers eligible PKs from Postgres catalog metadata, asserts every inbound FK has
   `ON UPDATE CASCADE`, writes a temporary old→new mapping table, updates IDs table-by-table, and is
   idempotent on rerun. Prisma schema defaults are `@default(cuid(2))` for new rows.
6. **Null old placeholder satellite `userId` FKs before deleting placeholder Users.** Keeping the old
   columns non-null while deleting placeholder Users will trigger `ON DELETE CASCADE` on historical
   identity rows. Drop NOT NULL on the old columns or drop the old columns, then null placeholder
   references. This is mandatory when hard-delete precedes the final physical column drop.
7. **Detach placeholder Passports:** for every Passport whose `user.isPlaceholder = true`, set
   `Passport.userId = null`. The Passport survives; the satellites now point at it via `passportId`.
8. **Reap the synthetic placeholder User rows:** the `isPlaceholder: true` Users now own **no**
   identity satellites (all repointed) and should own **no** CARRY rows (a placeholder should never
   have had a Membership, Invoice, Session, Account, AuditLog, etc.). **Preflight assertion** (run and
   FAIL the migration if non-empty): list any `isPlaceholder` User referenced by any CARRY-side FK.
   Expected result: none. If found, it is a data defect (a placeholder was used as an actor) — stop and
   reconcile manually, do not cascade-delete. After the assertion passes, the placeholder Users can be
   hard-deleted (or left `archivedAt` if the operator prefers a reversible window — see §7).
9. **Drop old `userId` columns** from the 5 satellites; flip the new `passportId` columns to NOT NULL
   where the old column was NOT NULL (DirectoryProfile, LineageNode, Affiliation, RankAward.userId were
   all NOT NULL) and re-add the moved `@unique`/`@@index` on `passportId`.
10. **Real (account-bearing) users are untouched** beyond their satellites' FK swap: their Passport keeps
   `userId` set, their CARRY rows never move. This is the "user-carry" guarantee (D7/D9/D10) — no wipe,
   no reseed, no synthetic-email regeneration.

What happens to a placeholder's account-side rows: **there should be none.** D1's whole point is that
the placeholder never legitimately held account-side state. Step 4's assertion is the guard that proves
it before any delete.

---

## Section 6 — Claim-flow impact (`claim-review-actions.ts` + ProfileClaimRequest)

Source of truth today: `apps/web/server/admin/lineage/claim-review-actions.ts`,
`applyLineageClaimReview` (APPROVE branch). Current behavior, verified:

1. transfers ownership: `tx.lineageNode.update({ where:{ id: nodeId }, data:{ userId: claimantUserId } })`
   (the `if (claim.node.userId !== claim.claimantUserId)` block);
2. if `claim.node.user.isPlaceholder`, archives the placeholder User
   (`tx.user.update({ data:{ archivedAt } })`) and reports `placeholderArchivedUserId`;
3. creates/repairs a `LineageTreeAccess` `NODE_EDITOR` grant for the claimant (RBAC — stays User-side);
4. optionally `grantComp(...)` writing `UserEntitlement` for the claimant (stays User-side).

Under D1, steps 3–4 are **unchanged** (RBAC grantee + entitlements are CARRY, always a real account).
Steps 1–2 change shape:

- **Before:** "transfer `LineageNode.userId` from placeholder-User to claimant-User, then archive the
  placeholder User."
- **After (D1):** "**attach account to the Passport.**" The node already points at a `passportId`
  (the placeholder Passport). Claiming sets `Passport.userId = claimantUserId` instead of moving the
  node's FK. The node never moves — it stays on its Passport; the *account* attaches to that Passport.
  Conceptually: `attachAccount(passportId, claimantUserId)` =
  `tx.passport.update({ where:{ id: passportId }, data:{ userId: claimantUserId } })`.
  - Replaces step 1's `lineageNode.update({ data:{ userId } })`.
  - Replaces step 2: there is no synthetic placeholder User to archive (it was reaped in §5); instead
    you flip the Passport from accountless to account-attached. The result fields
    (`ownershipTransferred`, `placeholderArchivedUserId`) need reshaping — `placeholderArchivedUserId`
    becomes meaningless; add e.g. `passportAccountAttached: boolean`.
  - **Guard to preserve:** the existing `claimantExistingNode` / `CLAIMANT_HAS_NODE` check (one node per
    user) becomes "claimant account is not already attached to a *different* Passport" — i.e. a
    `Passport.userId @unique` collision. Keep an explicit pre-check so the error is `CLAIMANT_HAS_NODE`/
    a new `CLAIMANT_HAS_PASSPORT`, not a raw DB unique violation.

- **ProfileClaimRequest** (2725) APPROVE — same transform, polymorphic subject (PERSON | ORGANIZATION):
  - **PERSON** subject (`directoryProfileId`): today approval would set `DirectoryProfile` ownership;
    under D1 the DirectoryProfile points at a `passportId`, so PERSON approval is **also**
    `attachAccount(passportId, claimantUserId)` against the placeholder Passport behind that profile.
    Net effect: one account-attach lights up *all* of that person's satellites (profile + node + ranks
    + affiliations) at once — which is the D1 dividend.
  - **ORGANIZATION** subject (`organizationId`): unchanged — orgs are not person-identity; approval sets
    `Organization.ownerId` as today (out of this doc's scope, no passport involved).

**Phase-4 reconciliation (noted, out of scope here):** the two claim systems (lineage
`LineageClaimRequest` vs profile `ProfileClaimRequest`) both reduce to the same `attachAccount(passportId,
…)` primitive under D1. Unifying them onto a shared `attachAccount` helper is the Phase-4 consolidation;
Phase 3 only needs each call site to write the Passport instead of the satellite. Do **not** merge the
two review actions in Phase 3 — just point both at the same primitive.

---

## Section 7 — Migration ordering + risks

**FK / step ordering (single migration, transactional where possible):**

1. Schema: add nullable `passportId` to the 5 satellites; make `Passport.userId` nullable; add nullable
   `RankAward.awardedByPassportId`. (Additive — safe, no destructive move yet.)
2. Mint missing Passports for every satellite-bearing or historical-promoter User that lacks one.
3. Copy historical placeholder promoters to `RankAward.awardedByPassportId`; null placeholder
   `RankAward.awardedById` so synthetic Users are no longer actors.
4. Backfill `passportId` on all satellite rows by `Passport.userId` lookup (§5 step 4). Order does not
   matter between satellites; all read from the still-present `Passport.userId`.
5. Regenerate all single-column string primary keys to cuid2; assert FK `ON UPDATE CASCADE`
   preserved all row counts and non-null `passportId`s.
6. Drop NOT NULL/null old placeholder satellite `userId` references (or drop the old columns) before
   placeholder User hard-delete to prevent cascade loss.
7. Null out placeholder `Passport.userId` (§5 step 7).
8. **Assertion gate** (§5 step 8): fail if any `isPlaceholder` User is referenced by a remaining CARRY FK.
9. Reap placeholder Users by hard-delete.
10. Re-run the preflight gate; it must PASS before physical column drop.
11. Flip satellite `passportId` to NOT NULL; drop old satellite `userId` columns; move
   `@unique`/`@@index` to `passportId`; move `RankAward @@unique([userId,rankId])` →
   `([passportId,rankId])`.
12. Repoint claim-review write paths (§6) in the **same** PR as the schema change — the old
   `lineageNode.update({ data:{ userId } })` will not compile once the column is gone.

**Uniqueness constraints that move (must move atomically with the column):**

- `DirectoryProfile.userId @unique` → `passportId @unique`.
- `LineageNode.userId @unique` → `passportId @unique`.
- `RankAward @@unique([userId, rankId])` → `@@unique([passportId, rankId])`.
- `Passport.userId @unique` → `userId String? @unique` (nullable-unique; Postgres allows multiple NULLs,
  so many accountless placeholders coexist — correct).

**The cuid → cuid2 wave rides this window (D7/D8).** Doing the ID-type migration *and* the FK repoint in
one big-bang window avoids an ID migration against live signups later. SESSION_0391 proved the
backfill-then-regenerate order is viable when FK `ON UPDATE CASCADE` is intact: populate
`passportId`, rewrite all discovered single-column string primary keys to cuid2, then assert all satellite counts and
passport FKs survived. Do not rewrite `User.id` in this wave; operational code and real account rows
remain user-carry.

**Risks:**

- **Backfill correctness depends on Passport↔User being 1:1 today.** Verify `Passport.userId @unique`
  has zero violations and every satellite `userId` has a matching Passport *before* step 2. A satellite
  pointing at a User with no Passport would backfill NULL and then fail the NOT-NULL flip. Add a
  pre-backfill assertion for orphans.
- **Placeholder-with-account-state defect** (§5 step 4) — guarded by assertion, do not auto-delete.
- **Claim result-shape break** — `placeholderArchivedUserId` consumers (UI/audit) must be updated when
  step 7 reshapes the result type.
- **CARRY/REPOINT boundary errors** — any future code that joined identity surfaces *through* a CARRY
  FK (e.g. reading a person's display name via `Membership.user`) must instead route through Passport.
  Audit read paths for the 4 satellites' old `user` relation usages.

---

## Section 8 — Open questions for the operator

1. **FightRecord (§4) — resolved:** promoted to a 5th satellite (REPOINT) in SESSION_0390.
2. **Placeholder User reaping — hard-delete vs `archivedAt` window?** Hard-delete is clean; an
   `archivedAt` window is reversible if the §5 step-4 assertion missed something. Pick one before the
   migration writes.
3. **cuid2 scope/order — resolved:** SESSION_0391 uses backfill first, then full string-PK rewrite
   guarded by `ON UPDATE CASCADE` catalog assertions and idempotent rerun.
4. **Claim result contract** — agree the new field names (`passportAccountAttached`, drop
   `placeholderArchivedUserId`) so UI/audit consumers can be updated in the same PR.
5. **Certification (§4)** — confirm CARRY; an operator may treat instructor certification as
   directory-facing. *Doug recommends CARRY.*

---

## Section 9 — Phase 3 execution status (SESSION_0390 grill + 3a)

**Operator decisions (SESSION_0390 grill) — these resolve §8:**

1. **FightRecord → PROMOTED to a 5th satellite (REPOINT)** (overrides §4 Option A). Disposition is now
   **4 REPOINT** (DirectoryProfile, LineageNode, Affiliation, FightRecord) **+ 1 DUAL** (RankAward).
   In 3b: `@@unique([userId,disciplineId,type])`→`([passportId,…])`, `@@index([userId])`→passport.
2. **Placeholder reap → HARD-DELETE** (§8 q2) after the §5 step-4 assertion passes. The §6 claim
   transform therefore drops the placeholder-archive step (there is no synthetic User to archive).
3. **cuid2 → stays in the Phase-3 wave** (§8 q3), executed in the 3b destructive window. SESSION_0391
   proved the safe data-script order as **backfill satellites first → regenerate all discovered
   single-column string primary keys with FK cascade assertions**; the original "IDs first" plan
   remains acceptable only if the later backfill reads the post-regeneration `Passport.id`.
4. **Claim contract** (§8 q4): add `passportAccountAttached: boolean`; drop `placeholderArchivedUserId`.
5. **Certification** (§8 q5): **CARRY** confirmed.

**3a landed (SESSION_0390, additive + reversible — no destructive ops):**

- `server/identity/{person-schema,person-service,person-service.test}.ts` — `createPassport`
  (accountless), `attachAccount` (with `CLAIMANT_HAS_PASSPORT` pre-check), `derivePersonName`. 11 tests.
- Additive migration `20260614225425_phase3a_additive_passport_fks`: nullable `passportId` on all 5
  satellites + `Passport.userId` → nullable. No drops, no constraint moves, no reseed.
- `scripts/phase3-preflight-assert.ts` — the read-only pre-backfill gate (catalog-driven CARRY-FK
  discovery). One boundary fix: `media-authorization.ts` null-guards the now-nullable `Passport.userId`.

**⚠ Gate findings against the local seed DB (the gate FAILED — these are 3b prerequisites, NOT 3a defects):**

- **148 Users but only 75 Passports → 73 Users have NO Passport.** ALL 29 LineageNodes + 19/23
  RankAwards (earner) point at Passport-less Users. The §5-step-2 backfill assumes Passport↔User is
  1:1 — it is NOT today. **3b MUST first mint a Passport for every satellite-bearing User that lacks
  one**, *before* the satellite `passportId` backfill, or the NOT-NULL flip fails. (Authoritative run
  is pre-3b against the migration-target DB; local is a logic+sanity smoke.)
- **17 RankAwards have a placeholder `awardedById`** (placeholder-as-promoter). Under the §5-step-4
  assertion this reads as a "placeholder acted as an account" hit. It is semantically legitimate for
  imported lineage (a historical master promoted students) — so 3b must **reconcile this explicitly**:
  either repoint `awardedById` placeholders to their (3b-minted) Passport via a promoter-as-passport
  rule, or exempt promoter rows from the hard-delete blast. Do **not** cascade-delete these
  placeholders. This is the single sharpest 3b design call surfaced by the gate.

## Section 10 — Phase 3b rehearsal status (SESSION_0391)

**Decision landed:** historical placeholder promoters are not real account actors. `RankAward` now has
nullable `awardedByPassportId` for imported promoter identity; `awardedById` remains nullable User for
real account actors only. The 3b data script copies placeholder promoters to Passport identity, then
nulls those placeholder `awardedById` values before deleting synthetic Users.

**Local migration-target rehearsal (after reset + seed + BBL lineage seed):**

- Before script: `users=32`, `placeholderUsers=23`, `passports=6`.
- Gate failed as expected: 24 `LineageNode.userId` rows and 18 `RankAward.userId` rows had no Passport;
  17 `RankAward.awardedById` rows pointed at placeholder Users.
- Script actions: minted 24 missing Passports; copied 17 historical promoters to
  `awardedByPassportId`; nulled 17 placeholder `awardedById` actor links; backfilled
  `DirectoryProfile=6`, `LineageNode=25`, `RankAward=23`; rewrote identity-table IDs to cuid2 for
  `Passport=30`, `DirectoryProfile=6`, `LineageNode=25`, `RankAward=23`; nulled old placeholder
  satellite `userId` references for `LineageNode=23`, `RankAward=18`; deleted 23 placeholder Users.
- After script: `users=9`, `placeholderUsers=0`, `passports=30`, `accountlessPassports=23`; Brian Scott
  admin/account-bearing User remains; BBL historical people survive as accountless Passports.
- `scripts/phase3-preflight-assert.ts` PASSed after the data script.

**Important safety finding:** deleting placeholder Users while the old satellite `userId` FKs are still
non-null can cascade-delete the very identity rows being preserved. The script must null/drop old
placeholder satellite `userId` references before hard-delete, or the final column-drop SQL must happen
before the delete in the same guarded transaction.

**Step-6 status:** `scripts/phase3b-drop-old-user-columns.sql` is staged as guarded SQL, but not applied
to the app database yet. Current Phase 3b leaves old `userId` columns nullable for compatibility because
Phase 3c still needs to repoint read/write paths away from `LineageNode.user`, `RankAward.user`, and
related satellite User relations before the physical drop can compile and render safely.
