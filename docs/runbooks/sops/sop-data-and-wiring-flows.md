---
title: "SOP — Data Flows and Wiring Flows"
slug: sop-data-and-wiring-flows
type: runbook
status: active
created: 2026-04-27
updated: 2026-07-16
last_agent: codex-session-0542
pairs_with:
  - docs/runbooks/sops/sop-e2e-user-lifecycle.md
  - docs/runbooks/dev-environment/local-dev-auth-storage.md
  - docs/protocols/cody-preflight.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/ronin_dojo_baseline_systems_pack/08_SOP_DATA_AND_WIRING_FLOWS_BASELINE.md
  - docs/sprints/SESSION_0146.md
  - docs/sprints/SESSION_0344.md
  - docs/sprints/SESSION_0347.md
---

# SOP — Data Flows and Wiring Flows

> **⚠ Substrate-change notice (SESSION_0359, updated 0501).** Much of the SoT-Spec migration has **landed** and
> is reflected below: admin surfaces moved off `/admin/*` (retired to a thin shell — only `/admin/task-board`
> remains) to **`/app/*`**; oRPC is the internal contract at **`/api/rpc`** but only a few routers are migrated
> (`ping` / `health.brand` / `lineage` / `promotion` / `belt` — `server/router.ts`) — **most surfaces are still
> next-safe-action** server actions (`lib/safe-actions.ts` clients). The 4-brand `Brand`-enum harness is **dead**
> (single-brand collapse — every request is `Brand.BBL` via `lib/brand-context.ts`; **no `middleware.ts`, no
> `activeBrandId`**). `Passport.userId` is now **nullable** (accountless Passport = placeholder). Cross-check
> [`BBL-SOT-Spec.md`](../../product/black-belt-legacy/BBL-SOT-Spec.md) before building new work here.

## Purpose

Document the major system flows in low-fi ASCII so:

- humans can reason about the repo quickly
- future agents do not rebuild the same mental model from scratch
- product, auth, content, and brand wiring stay separate

---

## 1. High-level platform flow

```text
                    +----------------------+
                    |   User / Browser     |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |  Next.js app/web     |
                    |  route + middleware  |
                    +----------+-----------+
                               |
                  host -> brand | context
                               v
                    +----------------------+
                    | Better-Auth session  |
                    | (brand = BBL, server |
                    |  resolved; no        |
                    |  activeBrandId)      |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | authz.ts checks      |
                    | role + scope (brand  |
                    | single-valued: BBL)  |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Prisma client        |
                    | Postgres             |
                    +----------------------+
```

```mermaid
flowchart TD
    A[User / Browser] --> B[Next.js app/web\nroute handler]
    B -->|host → brand = BBL\nlib/brand-context| C[Better-Auth session\nno activeBrandId]
    C --> D[authz.ts checks\nrole + scope; brand single-valued BBL]
    D --> E[Prisma client\nPostgres]
```

---

## 2. Host/brand resolution flow

> **⚠ Single-brand collapse (verified SESSION_0501).** There is **no `middleware.ts`** and **no
> `activeBrandId`** in `apps/web`. Host→brand resolution is `lib/brand-context.ts::resolveBrand`, which is
> **edge-safe and always returns `Brand.BBL`** (single-brand deployment). `HOST_TO_BRAND` maps
> `blackbeltlegacy.com` / `bbl.local` / `localhost` → BBL. The 4-brand fan-out (BASELINE / WEKAF /
> RONIN_DOJO_DESIGN) is dead — those live as separate **products** (own app/DB/deploy), not per-request
> brand switches. oRPC handlers get `context.brand` from the `withBrand` middleware (`server/orpc/context.ts`).

```text
request.host (x-forwarded-host / host header)
   |
   v
+---------------------------+
| lib/brand-context.ts      |
| resolveBrand(host)        |
+---------------------------+
   |
   +--> HOST_TO_BRAND: blackbeltlegacy.com / bbl.local / localhost => BBL
   |    (single-brand collapse — always Brand.BBL today)
   |
   v
theme / marketing chrome / copy defaults (all BBL)
   |
   v
oRPC handlers scope by context.brand (withBrand middleware); server actions inline Brand.BBL
```

```mermaid
flowchart TD
    R[request.host] --> RB[lib/brand-context.ts\nresolveBrand]
    RB --> BBL[Brand.BBL\nsingle-brand collapse]
    BBL --> TH[theme / marketing chrome / copy defaults]
    TH --> CTX[oRPC context.brand via withBrand;\nserver actions inline Brand.BBL]
```

### Key rule

Brand is **server-resolved and single-valued (BBL) today** — never client-trusted. Other brands are separate
products (own app/DB/deploy), not a per-request `activeBrandId` switch inside this app.

---

## 3. Auth + brand context flow (web)

> **🔒 Security gates (hardened SESSION_0295–0300):**
>
> - Org-scoped mutations use `assertOrgAdminAccess(userId, organizationId)` — owner by `ownerId` OR `ORG_ADMIN` role OR **platform admin (`User.role === "admin"`)**, which grants access to all orgs incl. WP-imported `ownerId`-null orgs (SESSION_0448). See `server/web/organization/org-admin-access.ts`.
> - Every org-scoped mutation enforces a **cross-org guard**: the target entity (membership, invite, etc.) must belong to the asserted `organizationId`. An org admin cannot act on another org's resources by ID.
> - **Behaviorally proven:** `server/web/organization/org-management.safe-action.test.ts` (SESSION_0301) — 18 test cases proving unauth rejection, cross-org rejection, and happy paths for all 6 org management actions.
> - Brand is **never client-trusted** — server derives brand from the org row or host header.
> - Admin-only surfaces use `adminActionClient` (platform super-admin).
> - Media uploads use `mediaUploadActionClient` with `canUploadMedia(userId, brand)` — no public S3 writes.

```text
Visitor
  |
  v
Sign in / Sign up
  |
  v
Better-Auth creates session cookie
  |
  v
Server reads session
  |
  +--> host-derived brand context (lib/brand-context → always BBL)
  |    (no session.user.activeBrandId — field removed with the multi-brand harness)
  |
  v
authz.ts
  |
  +--> isAdmin? (User.role === "admin")
  +--> membership / role checks
  +--> resource-scoped grants (can())
  |
  v
Prisma query
  |
  v
Postgres rowset
```

```mermaid
flowchart TD
    V[Visitor] --> SI[Sign in / Sign up]
    SI --> BA[Better-Auth creates session cookie]
    BA --> SR[Server reads session]
    SR --> HC[host-derived brand context\nlib/brand-context → always BBL]
    HC --> AZ[authz.ts]
    AZ --> ADM{isAdmin?\nUser.role === admin}
    AZ --> GRANT{resource-scoped grants\ncan()}
    AZ --> MEM{membership / role checks}
    ADM & GRANT & MEM --> PQ[Prisma query]
    PQ --> PG[Postgres rowset]
```

---

## 4. Mobile auth decision flow (aspirational — NOT built)

> **⚠ Not implemented (verified SESSION_0501).** There is **no `apps/mobile`** (only `apps/web` and
> `apps/baseline`) and **no `app/api/v1`** public API surface yet — both are deferred. This section is a
> forward-looking design branch, not a live flow. Do not treat it as current wiring.

```text
                +--------------------+
                | apps/mobile (Expo) |
                +----------+---------+
                           |
                           v
              Which mobile auth path is final?
                           |
        +------------------+------------------+
        |                                     |
        v                                     v
+----------------------+         +----------------------------+
| Better-Auth mobile   |         | JWT bridge fallback        |
| SDK path             |         | short-lived mobile token   |
+----------------------+         +----------------------------+
        |                                     |
        v                                     v
shared session contract             explicit token lifecycle
        |                                     |
        +------------------+------------------+
                           |
                           v
                    app/api/v1 calls
```

```mermaid
flowchart TD
    EXPO[apps/mobile - Expo] --> Q{Which mobile auth path?}
    Q -->|Option A| BA_MOB[Better-Auth mobile SDK]
    Q -->|Option B| JWT[JWT bridge fallback\nshort-lived mobile token]
    BA_MOB --> SSC[shared session contract]
    JWT --> TLC[explicit token lifecycle]
    SSC & TLC --> API[app/api/v1 calls]
```

---

## 5. Identity shell flow

> **Passport is the identity source of truth (SESSION_0357/0358, ADR 0016).**
> `DirectoryProfile` is a *view* of identity, not a parallel store. Current rank is **derived
> from `RankAward`** (`source` STATED|EARNED + `verificationStatus`), not read off `Membership`.
> A person's school/org for display comes from **`Affiliation`** (linked org or free-text
> `schoolName`), with Baseline **`Membership`** as a fallback during the consolidation transition.
> `Membership` is Baseline enrollment/community state (paying is a separate `UserEntitlement`
> layer — ADR 0019); it is **not** the BBL school source. See `passport-and-shells.md`.
>
> **RankAward creation (updated SESSION_0490, ADR 0035 Amendment 1).** Besides admin/import, a member's
> belt now reaches a `RankAward` via a **RANK_PROMOTION claim → approve → mint VERIFIED award** (path B1):
> `setPassportRank` no longer mints an `UNVERIFIED` award on self-report — it files a pending
> `PassportClaimRequest{type: RANK_PROMOTION, claimedRankId, evidence}` (via `submitRankPromotionClaim`,
> oRPC `promotion.submit`). On approve, `applyPassportClaimReview` branches on `claim.type` and calls
> `finalizeRankPromotion → mintAssertedRankAward` → a **VERIFIED** `RankAward` (`source: STATED`,
> `verificationStatus: VERIFIED`). So the belt-journey path only ever produces VERIFIED awards; a
> self-declared belt is a claim record until verified. `RankAward.verificationStatus` stays **data-only
> / never a display axis** (ADR 0035 §5) — `node.isVerified` is the one display trust flag. Full flow:
> [`lineage-data-wiring-flow.md`](../../product/black-belt-legacy/lineage-data-wiring-flow.md) §5.

```text
User
 |
 +--> Passport (global identity — source of truth)
 |
 +--> DirectoryProfile (a view: privacy + visibility)
 |
 +--> RankAward(s) (rank/promotion source; current rank derived)
 |     +--> Rank
 |     +--> source (STATED | EARNED)
 |     +--> verificationStatus (UNVERIFIED | VERIFIED | DISPUTED | IMPORTED — DATA only, never displayed)
 |     |      belt-journey path (RANK_PROMOTION claim → approve) mints VERIFIED only; no UNVERIFIED self-report award
 |
 +--> Affiliation(s) (display-only person↔org: linked org OR free-text schoolName)
 |
 +--> Membership(s) (Baseline enrollment — community/admin state)
       |
       +--> Organization
       +--> Discipline
       +--> Role assignments
       +--> Status
```

```mermaid
flowchart TD
    U[User] --> P[Passport\nglobal identity — SoT]
    U --> DP[DirectoryProfile\na view: privacy + visibility]
    U --> RAW[RankAward\nrank source; current rank derived]
    U --> AFF[Affiliation\ndisplay-only org / schoolName]
    U --> M[Membership\nBaseline enrollment]
    RAW --> R[Rank]
    M --> O[Organization]
    M --> D[Discipline]
    M --> RA[Role assignments]
    M --> S[Status]
```

---

## 6. Tournament flow

```text
Tournament
  |
  +--> TournamentDiscipline
          |
          +--> Division
                 |
                 +--> Registration
                         |
                         +--> RegistrationEntry
                                |
                                +--> snapshotRankName
                                +--> snapshotOrgName
                                +--> representingMembership
```

```mermaid
flowchart TD
    T[Tournament] --> TD[TournamentDiscipline]
    TD --> DIV[Division]
    DIV --> REG[Registration]
    REG --> RE[RegistrationEntry]
    RE --> SRN[snapshotRankName]
    RE --> SON[snapshotOrgName]
    RE --> RM[representingMembership]
```

### Why snapshot matters

Registration history must not be rewritten by later promotions or organization changes.

---

## 7. Content truth flow (current + emerging)

## Current public long-form content

> **⚠ Updated SESSION_0501 (ADR 0042).** The BBL blog is now **DB-backed** via the `Post` model, authored in
> the `/app/blog` staff surface (Tiptap editor). The old `apps/web/content/blog/*.mdx` file-authoring path is
> **gone** (`apps/web/content/` no longer exists). Public read: `/blog` →
> `server/web/posts/queries.ts::findPublishedPosts(Brand.BBL)` → `PostFeed`. The member community feed is a
> separate model (`CommunityPost` / `/posts`).

```text
Authoring in /app/blog (Tiptap editor, staff)
   |
   v
Post model (DB)  — server/web/posts/queries.ts
   |
   v
Next.js render (/blog → findPublishedPosts → PostFeed)
   |
   v
public blog/article output
```

## Emerging structured editorial flow

```text
Capture / draft / knowledge
   |
   +--> wiki docs
   +--> sessions
   +--> future atom intake
   |
   v
ContentAtom / ContentTask / content variants
   |
   v
render / publish / campaign outputs
```

### Key rule

Do not confuse:

- wiki knowledge pages
- current live DB-backed blog content (`Post` model, `/app/blog` → `/blog`)
- the member community feed (`CommunityPost` → `/posts`)
- future reusable content-atom operational flow

These are related, not identical.

---

## 8. Documentation / session flow

```text
Bow in
  |
  v
read latest SESSION_NNNN
  |
  v
read program-plan + wiki index
  |
  v
do one task
  |
  v
update docs / files / session file
  |
  v
bow out
  |
  v
next SESSION picks up from there
```

---

## 9. Wiki maintenance flow

```text
new page or changed page
   |
   v
JETTY 3.0 frontmatter check
   |
   v
update health / updated / last_agent
   |
   v
fix backlinks / pairs_with
   |
   v
update wiki index if needed
```

---

## 10. Suggested content-engine operational flow for this repo

```text
Capture idea
  |
  v
Intake queue
  |
  v
Atomize truth
  |
  v
Draft variant(s)
  |
  v
Media tasks / review
  |
  v
Publish target selected
  |
  +--> MDX blog
  +--> social/video variant
  +--> in-app content entity
  |
  v
Publication log / next iteration
```

---

## 11. Local dev auth + storage flow (SESSION_0131)

See full runbook:
[`docs/runbooks/dev-environment/local-dev-auth-storage.md`](../dev-environment/local-dev-auth-storage.md)

```text
GET /api/auth/dev-login
  |
  v
Guard: isDev && DEV_LOGIN_USER_ID?
  |
  v
auth.api.signInMagicLink({ email })
  |  creates Verification row
  v
Read Verification.identifier from DB
  |
  v
auth.api.magicLinkVerify({ token })
  |  BA throws APIError(302) with signed cookies
  v
Catch error → extract Set-Cookie headers
  |
  v
307 redirect to /me (cookies forwarded)
  |
  v
getServerSession() reads signed cookie → user
  |
  v
/me checks Passport + DirectoryProfile exist → 200
```

```mermaid
flowchart TD
    DL[GET /api/auth/dev-login] --> G{isDev &&\nDEV_LOGIN_USER_ID?}
    G -->|No| N[404 Not available]
    G -->|Yes| ML[auth.api.signInMagicLink]
    ML --> VR[Read Verification row from DB]
    VR --> MV[auth.api.magicLinkVerify]
    MV -->|BA throws 302 APIError| CATCH[Catch error\nextract Set-Cookie]
    CATCH --> REDIR[307 → /me\nwith signed cookies]
    REDIR --> GS[getServerSession\nvalidates HMAC]
    GS --> PP{Passport +\nDirectoryProfile?}
    PP -->|Yes| OK[200 /me renders]
    PP -->|No| LOGIN[307 → /auth/login]
```

### Storage wiring (MinIO local → S3 prod)

```text
Upload request
  |
  v
lib/media.ts → uploadToS3Storage(file, key)
  |
  v
services/s3.ts → S3Client({
  endpoint: S3_ENDPOINT,         ← "http://localhost:9000" (local)
  forcePathStyle: true,          ← required for MinIO
  credentials: { accessKeyId, secretAccessKey }
})
  |
  v
MinIO :9000 (local) | S3/R2 (staging/prod)
  |
  v
Public URL: S3_PUBLIC_URL/key.ext
```

## 12. Program → Course → Enrollment flow (SESSION_0146)

```text
Program (brand + org + discipline)
  |
  +--> AgeGroup filter (many-to-many)
  +--> SkillLevel filter (many-to-many)
  |
  v
ProgramCourse (join: which courses belong)
  |
  v
Public: browse programs → check eligibility
  |
  v
CourseEnrollment
  |
  +--> linked to Membership
  +--> linked to PricingPlan (payment tier)
  |
  v
CurriculumItemCompletion
  |
  v
Rank / certification readiness
```

```mermaid
flowchart TD
    P[Program\nbrand + org + discipline] --> AG[AgeGroup filter]
    P --> SL[SkillLevel filter]
    P --> PC[ProgramCourse join]
    PC --> BROWSE[Public: browse → check eligibility]
    BROWSE --> CE[CourseEnrollment]
    CE --> MEM[linked to Membership]
    CE --> PP[linked to PricingPlan]
    CE --> CIC[CurriculumItemCompletion]
    CIC --> RANK[Rank / certification readiness]
```

---

## 13. Payment / Stripe checkout flow (SESSION_0146)

### Dirstarter baseline vs our extension

Dirstarter uses Stripe for directory-listing tiers (Free/Standard/Premium one-time + subscription). We extend this for martial arts use cases:

| Use case | Stripe model | PricingModel enum |
| --- | --- | --- |
| Monthly membership | Recurring subscription | MONTHLY |
| Annual membership | Recurring subscription | ANNUAL |
| Drop-in class | One-time payment | DROP_IN |
| Punch card (buy 4 get 5th free) | One-time payment + session tracking | PUNCH_CARD |
| Private lesson | One-time payment | PRIVATE_LESSON |
| Tournament registration | One-time payment | PER_TEST / CUSTOM |
| Free trial | No charge | FREE_TRIAL |
| Intro pack | One-time payment | INTRO_PACK |

### Payment wiring flow

```text
User selects program / lineage membership tier
  |
  v
PricingPlan lookup (amountCents, stripeProductId, stripePriceId)
  |
  v
Stripe Checkout Session created
  |
  +--> success_url: product-specific success shell
  +--> cancel_url: product-specific selection surface
  |
  v
Stripe webhook: checkout.session.completed
  |
  v
Server handler:
  +--> Grant UserEntitlement rows from EntitlementGrant
  +--> Create ProgramEnrollment only for program-scoped checkout
  +--> Sync subscription-sourced UserEntitlement rows for recurring tiers
  +--> Record Invoice / Payment ledger rows
  |
  v
Confirmation email via Resend
```

```mermaid
flowchart TD
    SEL[User selects program / lineage tier] --> PL[PricingPlan lookup\namountCents + stripeProductId]
    PL --> SC[Stripe Checkout Session]
    SC -->|success| WH[Stripe webhook\ncheckout.session.completed]
    SC -->|cancel| CANCEL[Back to selection surface]
    WH --> ENT[Grant UserEntitlement]
    WH --> ENR[Create ProgramEnrollment\nif program-scoped]
    WH --> SUB[Sync subscription access]
    WH --> LOG[Record payment]
    ENT & ENR & SUB & LOG --> EMAIL[Confirmation email via Resend]
```

Membership status is intentionally outside the Stripe webhook. See
[`ADR 0019`](../../architecture/decisions/0019-membership-lifecycle-ownership.md): `Membership`
is community/admin state, while `UserEntitlement` owns subscription and purchase access.

### Subscription cancellation flow

```text
Stripe webhook: customer.subscription.deleted
  |
  v
Revoke subscription-sourced UserEntitlement rows
  |
  v
Suspend related ProgramEnrollment projections when the entitlement source maps to a program
```

---

## 14. Comp / gift entitlement flow (SESSION_0346, hardened SESSION_0347)

Comp and gift access uses the same `UserEntitlement` signal as paid lineage membership. It does not
mutate `Membership.status`, does not touch Stripe customer/payment records, and does not trust tier
state from the client or QR URLs.

```text
Trusted comp trigger
  |
  +--> Admin grantUserComp action (adminActionClient)
  +--> Invite meta.comp accepted by claimInvite
  +--> Lineage claim review meta.comp approval
  |
  v
Server derives tier keys
  |
  +--> LINEAGE_PREMIUM => [LINEAGE_PREMIUM]
  +--> LINEAGE_ELITE   => [LINEAGE_PREMIUM, LINEAGE_ELITE]
  |
  v
grantComp / revokeComp helper
  |
  +--> AuditLog written before UserEntitlement mutation
  +--> sourceType = MANUAL_GRANT
  +--> deterministic sourceId = grant:{grantor}:{reason-slug}
  |
  v
UserEntitlement rows become the read signal
  |
  v
Lineage tier policy maps active keys to free / premium / elite render policy
```

```mermaid
flowchart TD
    TRIG[Trusted comp trigger] --> ADM[Admin grantUserComp]
    TRIG --> INV[Invite meta.comp accepted]
    TRIG --> CLAIM[Claim review meta.comp]
    ADM & INV & CLAIM --> KEYS[Server derives premium / elite keys]
    KEYS --> AUDIT[AuditLog before mutation]
    AUDIT --> UE[UserEntitlement rows\nsourceType MANUAL_GRANT]
    UE --> POLICY[Lineage tier policy\nfree / premium / elite]
```

Generic admin entitlement grants use the same audit-before-mutation rule after SESSION_0347:
`grantUserEntitlement` / `revokeUserEntitlement` write `entitlement.admin.granted` /
`entitlement.admin.revoked` audit rows before changing `UserEntitlement`. This keeps the S3-upload
toggle working while closing the unaudited premium/elite write path recorded in
[`wiring-ledger.md`](../../knowledge/wiki/wiring-ledger.md).

### Key rules

- Tier/role/school values in URLs or QR links are display/navigation only, never authorization.
- Claim and invite comp access is server-derived from stored `meta.comp`.
- Admin adjustment events must have an audit row before the entitlement mutation.
- Paid and comped lineage access converge on active `UserEntitlement` keys.
- `Membership.status` remains community/admin state per
  [`ADR 0019`](../../architecture/decisions/0019-membership-lifecycle-ownership.md).

---

## 15. Invite → Claim → Membership activation flow (SESSION_0146, updated SESSION_0148)

> **🔒 Security gates (hardened SESSION_0298–0300):**
>
> - `createOrgInvite` / `revokeOrgInvite` require `assertOrgAdminAccess`. Revoke includes a cross-org guard (invite.organizationId must match).
> - Brand is sourced server-side from the org row — never from client input.
> - Claim flow validates: not expired, not over `maxUses`, not already claimed by this user.
> - Invite type forced to `ORGANIZATION` server-side.

```text
Admin creates Invite
  |
  +--> organizationId
  +--> role (optional)
  +--> email (optional — named invite vs open link)
  +--> expiresAt
  +--> maxUses
  |
  v
Invite link generated: /invite/{token}
  |
  v
If meta.email present: send invite notification email via Resend
  (emails/invite-notification.tsx → lib/email.ts → Resend API)
  |
  v
Recipient visits link
  |
  v
Auth check: signed in?
  |
  +--> No: redirect to sign up, then return
  +--> Yes: continue
  |
  v
Discipline picker shown (org's available disciplines)
  |
  v
InviteClaim created
  |
  +--> checks: not expired, not over maxUses, not already claimed by this user
  |
  v
Membership created (status: ACTIVE — invited members pre-approved)
  |
  v
MembershipRoleAssignment created (if role specified)
  |
  v
Welcome email sent (notifyMemberOfMembershipWelcome) + redirect to /me
   (claim-form pushes /me; verified 0501 — there is no /organizations/[slug]/welcome route)
```

```mermaid
flowchart TD
    ADM[Admin creates Invite] --> LINK[Invite link: /invite/token]
    ADM -->|meta.email?| EMAIL[Send invite email via Resend]
    LINK --> VISIT[Recipient visits link]
    VISIT --> AUTH{Signed in?}
    AUTH -->|No| SIGNUP[Sign up → return]
    AUTH -->|Yes| DISC[Discipline picker]
    SIGNUP --> DISC
    DISC --> CHECK[InviteClaim checks\nnot expired, not over max, not duplicate]
    CHECK --> MEM[Membership created\nstatus: ACTIVE]
    MEM --> ROLE[MembershipRoleAssignment\nif role specified]
    ROLE --> WELCOME[Welcome email + redirect to /me]
```

---

## 16. Certification issuance flow (SESSION_0146)

```text
CertificateTemplate (per brand/discipline)
  |
  +--> certificateType (RANK_PROMOTION, COURSE_COMPLETION, SEMINAR, etc.)
  +--> deliveryMethod (DIGITAL, PHYSICAL, BOTH)
  |
  v
Trigger event:
  +--> Rank award granted
  +--> Course completed
  +--> Seminar attended
  |
  v
Certification record created
  |
  +--> userId
  +--> templateId
  +--> issuedAt
  +--> expiresAt (optional)
  +--> status (ACTIVE, EXPIRED, REVOKED)
  |
  v
Digital certificate rendered / physical cert queued
```

```mermaid
flowchart TD
    CT[CertificateTemplate\nper brand/discipline] --> TRIGGER{Trigger event}
    TRIGGER -->|Rank award| RA[RankAward granted]
    TRIGGER -->|Course done| CD[Course completed]
    TRIGGER -->|Seminar| SA[Seminar attended]
    RA & CD & SA --> CERT[Certification record created]
    CERT --> DIG[Digital certificate rendered]
    CERT --> PHYS[Physical cert queued]
```

---

## 17. Punch card / drop-in session tracking flow (SESSION_0146)

```text
User purchases PricingPlan (PUNCH_CARD)
  |
  +--> punchCardSize: 5
  +--> bonusSessions: 1
  |
  v
Entitlement created: "5 sessions of Program X"
  |
  v
User attends class
  |
  v
Attendance record (future model: ClassAttendance)
  |
  +--> decrements remaining sessions on Entitlement
  |
  v
Sessions remaining = 0?
  |
  +--> Yes: entitlement exhausted, prompt repurchase
  +--> No: continue tracking
```

```mermaid
flowchart TD
    BUY[Purchase PUNCH_CARD plan\npunchCardSize: 5, bonus: 1] --> ENT[Entitlement: 5 sessions]
    ENT --> ATT[User attends class]
    ATT --> DEC[Attendance recorded\ndecrement remaining]
    DEC --> CHECK{Sessions remaining?}
    CHECK -->|0| EXHAUST[Prompt repurchase]
    CHECK -->|>0| ATT
```

### Open design question

ClassAttendance model does not exist yet. This is needed before punch card tracking can be implemented. Likely shape:

```prisma
model ClassAttendance {
  id            String   @id @default(cuid())
  userId        String
  courseId       String
  membershipId  String?
  entitlementId String?
  attendedAt    DateTime @default(now())
  // ...relations
}
```

---

## 18. Dirstarter → Ronin Dojo monetization alignment map (SESSION_0146)

### What Dirstarter provides (L1 baseline)

Dirstarter's monetization is built around a **directory listing model**:

| Dirstarter concept | Model | Revenue type |
| --- | --- | --- |
| **Tool** (listing) | `Tool` model with status workflow (Draft→Pending→Scheduled→Published) | The core "thing" being listed |
| **Free listing** | No Stripe charge, queue-based processing | Freemium funnel |
| **Standard listing** | One-time Stripe payment, do-follow link, 24h processing | One-time revenue |
| **Premium listing** | Recurring Stripe subscription, featured placement, do-follow | MRR |
| **Advertising** | `Ad` model with 6 placement types (Banner, Tools, ToolPage, BlogPost, Bottom, All) | CPM/CPC or flat-rate |
| **Affiliate links** | `affiliateUrl` on Tool + link shortener tracking | Commission |
| **Tool claiming** | One-time token, OTP verification | Engagement |
| **Content/blog mentions** | `<ToolEntry>` MDX component embeds listings in posts | Cross-sell |
| **Submission workflow** | User submits → admin reviews → schedule → publish + email | Content pipeline |

### How we map this to martial arts SaaS (L2 extension)

| Dirstarter L1 concept | Our L2 equivalent | Revenue model |
| --- | --- | --- |
| **Tool listing** | **Organization listing** (school/dojo/gym in directory) | Free listing + premium placement |
| **Tool submission** | **Organization registration** (claim your school) | Free + paid tiers |
| **Premium listing** | **Featured school placement** in directory | Recurring subscription |
| **Advertising** | **Ad placements** on directory, tournament, blog pages | Flat-rate or CPM |
| **Affiliate links** | **Equipment/gear affiliate links** per discipline | Commission |
| **Tool claiming** | **School claiming** (verify you own this org) | Engagement |
| **Content/blog mentions** | **School/technique/discipline mentions** in blog posts | Cross-sell |
| *(no equivalent)* | **Membership dues** (monthly/annual program enrollment) | Recurring — **primary revenue** |
| *(no equivalent)* | **Tournament registration fees** | Per-event |
| *(no equivalent)* | **Drop-in / punch card / private lesson** | Transactional |
| *(no equivalent)* | **Certification fees** (belt testing, seminar) | Per-event |
| *(no equivalent)* | **Merch store** (gi, equipment, branded gear) | E-commerce |

### Listing types mapped to our models

| Listing type | Our model | Admin CRUD exists? | Public page? |
| --- | --- | --- | --- |
| School / Org listing | `Organization` | ✅ | ✅ (directory) |
| Discipline listing | `Discipline` | ✅ (admin) | ❌ (no public browse page yet) |
| Course listing | `Course` | ✅ (admin) | ❌ (no public browse page yet) |
| Program listing | `Program` | ✅ (admin) | ❌ (no public browse page yet) |
| Technique listing | *(future: TechniqueAtom)* | ❌ | ❌ |
| Tournament listing | `Tournament` | ✅ (admin + public) | ✅ |
| Instructor listing | `DirectoryProfile` + `Membership` (role=INSTRUCTOR) | ✅ (directory) | ✅ |

### Revenue projection architecture

```text
Revenue streams
  |
  +--> RECURRING (predictable MRR)
  |    +--> Membership dues (MONTHLY/ANNUAL via PricingPlan)
  |    +--> Premium org listing (featured placement subscription)
  |    +--> Site subscription (UserBrandSubscription: FREE/PREMIUM/PRO)
  |
  +--> TRANSACTIONAL (per-event)
  |    +--> Tournament registration fees
  |    +--> Drop-in class fees
  |    +--> Punch card purchases
  |    +--> Private lesson fees
  |    +--> Certification/testing fees
  |
  +--> ADVERTISING (placement-based)
  |    +--> Banner ads (top of page)
  |    +--> Directory ads (blended with org/school cards)
  |    +--> Tournament page ads
  |    +--> Blog post ads
  |    +--> Bottom-of-page ads
  |
  +--> AFFILIATE (commission-based)
  |    +--> Equipment/gear links per discipline
  |    +--> Training resource links
  |
  +--> E-COMMERCE (future)
       +--> Merch store (gi, gear, branded items)
```

```mermaid
flowchart TD
    REV[Revenue Streams] --> REC[RECURRING MRR]
    REV --> TXN[TRANSACTIONAL per-event]
    REV --> ADS[ADVERTISING placement]
    REV --> AFF[AFFILIATE commission]
    REV --> ECOM[E-COMMERCE future]
    REC --> MD[Membership dues]
    REC --> PL[Premium org listing]
    REC --> SS[Site subscription]
    TXN --> TRF[Tournament reg fees]
    TXN --> DI[Drop-in fees]
    TXN --> PC[Punch card]
    TXN --> PVT[Private lessons]
    TXN --> CERT[Certification fees]
    ADS --> BAN[Banner]
    ADS --> DIR[Directory]
    ADS --> TP[Tournament page]
    ADS --> BP[Blog post]
    AFF --> GEAR[Equipment/gear]
```

### Discipline involvement in monetization

Disciplines are central to pricing and listing:

```text
Discipline
  |
  +--> Programs (filtered by discipline)
  |    +--> PricingPlans per program
  |    +--> AgeGroup + SkillLevel eligibility
  |
  +--> Tournaments (TournamentDiscipline)
  |    +--> Divisions (per discipline)
  |    +--> Registration fees per division
  |
  +--> Certifications (per discipline)
  |    +--> Testing fees
  |    +--> Rank system progression
  |
  +--> Directory (discipline filter)
  |    +--> Members searchable by discipline
  |    +--> Orgs searchable by discipline
  |
  +--> Affiliate links (discipline-specific gear)
```

### Stripe wiring plan (not yet implemented)

| Use case | Stripe product type | Webhook events needed |
| --- | --- | --- |
| Membership (monthly/annual) | Recurring subscription | `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed` |
| Premium org listing | Recurring subscription | Same as above |
| Tournament registration | One-time payment | `checkout.session.completed` |
| Drop-in / punch card | One-time payment | `checkout.session.completed` |
| Private lesson | One-time payment | `checkout.session.completed` |
| Certification fee | One-time payment | `checkout.session.completed` |
| Advertising | One-time or recurring | `checkout.session.completed` |
| Site subscription (PRO tier) | Recurring subscription | `checkout.session.completed`, `customer.subscription.deleted` |

### Dirstarter components we reuse vs extend

| Dirstarter L1 component/pattern | Reuse or extend | Notes |
| --- | --- | --- |
| `Ad` model + 6 AdType placements | **Reuse** — add brand column | Same ad placement logic works |
| `Tool` status workflow (Draft→Pending→Scheduled→Published) | **Study** — adapt for org listing submissions | Same state machine pattern for school claims |
| Stripe webhook handler (`app/api/stripe/webhooks/route.ts`) | **Extend** — add our product types | Base webhook structure is L1 |
| Submission email flow (notify admin + submitter) | **Reuse** — adapt templates | Same pattern, different content |
| `config/ads.ts`, `config/submissions.ts`, `config/claims.ts` | **Extend** — add our config values | Same config pattern |
| Admin data tables + status filters | **Reuse** | Already using these throughout |
| `<ToolEntry>` blog embed | **Adapt** — `<SchoolEntry>`, `<TechniqueEntry>` | Same MDX component pattern |

---

## 19. What not to do

- do not let host brand logic replace active brand logic
- do not let public blog output pretend to be the whole content system
- do not let wiki notes become runtime state by accident
- do not let session files turn into essays
- do not let old WP/PODS data flow assumptions overwrite current Next/Prisma/Postgres truth

---

## Petey close

A clean system has clean flows.

If a flow feels muddy, the truth boundary is probably muddy too.

**Planned Passion Produces Purpose.**
**OSSS.**
