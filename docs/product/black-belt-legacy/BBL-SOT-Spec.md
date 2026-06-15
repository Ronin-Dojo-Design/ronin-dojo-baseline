---
title: "BBL-SOT-Spec — Black Belt Legacy Source-of-Truth Build Spec"
slug: bbl-sot-spec
type: spec
status: active
created: 2026-06-10
updated: 2026-06-15
last_agent: codex-session-0391
author: Brian + Petey
pairs_with:
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/STORIES.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/ronin-project-context.md
tags:
  - bbl
  - blackbeltlegacy
  - launch
  - sot
  - blueprint
  - dirstarter-uplift
---

# BBL-SOT-Spec — Black Belt Legacy Source-of-Truth Build Spec

> **This is the ONE doc to read first.** It is the single, current blueprint to get
> `blackbeltlegacy.com` live — **correctly** — on a fully upstream-current Dirstarter base.
> Any agent (or Brian) should be able to open this, pick a phase, and know **exactly** what
> files to touch/add/edit, what to build, what "done" means, and the exact deliverables —
> with **zero** re-establishing of context.

## 0. How to use this doc

**Read only the SoT set, in this order, and nothing else unless a phase tells you to:**

1. **`BBL-SOT-Spec.md`** (this doc) — the build blueprint + locked decisions + phase map.
2. **`SOT-ADR.md`** — the consolidated, current architecture decisions (supersedes the old scattered ADRs; the originals are archived/historical, **not** sacred).
3. **`PRD.md`** — product truth (what BBL is, pillars, principles, non-goals).
4. **`STORIES.md`** — the story/acceptance backlog (BBL-* IDs).
5. **`CUTOVER_CHECKLIST.md`** — the launch/deploy gate sequencer.
6. **`GAP_MATRIX.md`** — feature status. **⚠ Treat as a claim to RE-VERIFY against the live app**, not gospel (known stale: e.g. BBL-EDITOR-001 marked Built but the admin add-person route didn't exist — SESSION_0358).

**Rules:** Don't go hunting through the wider wiki. Don't trust a doc that contradicts this one — this one + the live app win. If you find drift, fix it *here*, don't write a new doc.

## 1. Mission

Ship `blackbeltlegacy.com` ASAP **but correctly**: a verified martial-arts legacy platform where
an admin/RBAC steward can **add a person** to a lineage tree, that person can **claim** their
identity through review, and once claimed it shows correctly **across every surface** — built on a
**fully upstream-current Dirstarter** substrate (oRPC + permissions + unified dashboard), not the
layer we're about to replace. No can-kicking: do the work once, on the final foundation.

## 2. Locked decisions (the architecture)

These are settled (operator-confirmed, SESSION_0359 grill). They **supersede** the older ADRs noted; see `SOT-ADR.md`.

### 2.1 Identity model — Person-rooted

```text
User      = Better-Auth ACCOUNT (magic link / Google OAuth). Auth, sessions, roles, audit-actor.
            Born at real sign-up OR when a placeholder Passport is claimed + approved.

Passport  = IDENTITY / who they are. SOURCE OF TRUTH for the person.
            Created by admin/RBAC (add-person, import) with NO account.
            Passport.userId is NULLABLE → a placeholder = an accountless Passport.
            NO synthetic @placeholder.invalid emails (kills the SESSION_0358 hack; honors ADR 0020).

   Identity satellites re-point FK userId → passportId:
     DirectoryProfile · LineageNode · RankAward(earner) · Affiliation · FightRecord
   RankAward imported/historical promoter identity can point to Passport via awardedByPassportId;
   awardedById remains an optional real account actor.
   Account-side (stay on User): Membership, UserEntitlement, AuditLog actor, Tool/submissions, Session/Account.

CLAIM (BBL core loop, ALWAYS RBAC-reviewed):
   real person claims a placeholder node + submits private evidence
     → ProfileClaimRequest/LineageClaimRequest PENDING (evidence never public)
     → reviewed by RBAC: admin / TREE_ADMIN / BRANCH_EDITOR / NODE_EDITOR / granted ACL
       evaluated via upstream `can(user, permission)`
     → APPROVE → attach account: set Passport.userId = claimant + scoped edit rights + Membership
       → propagates across EVERY surface automatically (all satellites point at the Passport)
```

- **Name fields:** `Passport.legalFirstName`/`legalLastName` = legal SoT (columns already exist, schema.prisma:959–961). `Passport.displayName` = user-pickable label (default `First Last`). `User.name` = **derived** mirror `displayName ?? "${first} ${last}"` (Better-Auth needs non-null; not unique), written only via the identity service. Uniqueness/@handle = the **existing** unique `DirectoryProfile.slug` / `LineageNode.slug` (`brian-scott`, `brian-scott-2`); no new column; `User.id` (cuid2) is the PK.
- **One identity service** (`server/identity/`): `createPassport(identity)` (admin/import, no account) + `attachAccount(passportId, userId)` (sign-up / claim-approve). Collapses the **4** hand-rolled minters → one door: `lib/auth.ts:49–55`, `server/admin/users/actions.ts:88`, `server/web/lead/actions.ts:375–391`, `server/web/lineage/node-profile-actions.ts:90`.
- **Verification is never automatic** — it is the BBL value prop (PRD Pillar 5; non-goal: "Treating imported or claimed data as verified without review").

### 2.2 Sequencing — Foundation-first

Build the substrate before the identity work, so identity + claim are built **once**, on the final layer:

```text
Phase 0  Capture CURRENT upstream + re-pin + write this spec + SOT-ADR           (measure before porting)
Phase 1  oRPC + permissions + Better-Auth plugins (the substrate)
Phase 2  Unified /app/* dashboard restructure
Phase 3  Identity re-root (Passport-rooted) + reseed
Phase 4  BBL claim flow, RBAC-gated via can(user, permission)
Phase 5  Remaining upstream lanes: vendor SDK (Stripe/Resend), content/SEO, public API, toolchain, SHA bump
         (CUID2 moved into the Phase 3 schema wave — SOT-ADR D8)
Phase 6  WP-parity owner writes (Promote Rank / Move Node = structured re-parent) + drawer parity
Phase 7  CUTOVER (per CUTOVER_CHECKLIST): DNS/Resend/redirects/prod smoke
```

> **⚠ AMENDED SESSION_0361 (SOT-ADR D8): cutover is ARMED early, FLIPPED at a named checkpoint.**
> The live WP site is a dead landing page (zero parity bar), so Phase 6 is **not** launch-gating and
> the launch gate = Phases 1–5 + the nav/landing lane + stripe rehearsal. The cutover-lane work
> (slide-in nav L+R, landing/email-capture polish, L8 essentials = OG + sitemap, DKIM, 301 map, prod
> render verify) interleaves after Phase 1c or at a natural seam; the **DNS flip defaults to
> immediately after Phase 3** (final identity model, pure reseed intact), with an early-flip trigger
> if WP analytics show real organic traffic. cuid2 rides the Phase 3 schema wave, not Phase 5.
> **SESSION_0362 = Phase 1a oRPC scaffold** (as queued by SESSION_0360). Legacy UX reference for the
> slide-in navs + landing: **`blackbeltlegacy.local`** (Local WP site mounting the legacy React SPA —
> NOT the monorepo source). Measured spec + landing section inventory: SESSION_0361 "Decisions
> resolved" §4 + `docs/product/black-belt-legacy/_reference/` screenshots. Key correction: right
> slide-in = account + primary nav; left slide-in = contextual filter/search panel.

> **AMENDED SESSION_0373 (SOT-ADR D10): DNS flip waits for local Phases 1–6 functionality.**
> D9's ASAP flip timing is superseded by the operator's `bbl.local` gate: finish the unified `/app`
> dashboard/admin surface, remaining Phase 2b/2c work, and Phase 3–6 local functionality before DNS.
> Stripe rehearsal stays complete from SESSION_0369; Phase 3 uses D7/D9 user-carry semantics.

### 2.3 Data layer — oRPC, full adoption (not the ADR 0024 hybrid)

Operator override of ADR 0024 (proposed hybrid/pilot): adopt upstream's oRPC + permission model **fully**, because it is the substrate for the BBL RBAC claim/verification and the unified dashboard. `next-safe-action` is retired as surfaces migrate.

### 2.4 Other locked calls

- **Migration strategy:** clean big-bang + reseed of seed rows, **carrying early real users mechanically** (post-D8 soft launch; preserve `User`/`Passport`, repoint satellites by lookup). The phased dual-write playbook is documented for the post-launch world (in `human-code-runbook.md`), not used now.
- **cuid → cuid2:** rides the **Phase 3 schema wave** (SOT-ADR D8; was Phase 5), not an
  orphan task. SESSION_0391 expands this to all single-column string primary keys, guarded by FK
  `ON UPDATE CASCADE` catalog assertions, and requires action validators to accept cuid2 instead of
  relying on Zod's legacy `.cuid()` predicate.
- **Move Node = structured re-parent** (WP parity), **not** free x/y. Free x/y / visual groups / relationship-type picker are out of scope unless explicitly re-opened.
- **Brand-neutral primitives** (ADR 0022) stay brand-neutral; BBL is the only surface we *prove*, but no BBL hardcoding in shared code. Belt color = `Rank.colorHex` data.

## 3. Current state vs. target (the gap)

| Capability | `apps/web` today | Upstream target | Source of truth for the port |
| --- | --- | --- | --- |
| Data layer | `next-safe-action ^8`; no oRPC | oRPC (`@orpc/* ^1.13`, `@tanstack/react-query ^5.97`) | template `lib/orpc.ts`, `orpc-client.ts`, `orpc-query.ts`, `server/router.ts`, `app/api/rpc/` |
| Permissions | ad-hoc `adminActionClient` / `assert*Access` | `can(user, permission)`; roles/grants; `publicProcedure`/`authedProcedure` + `.meta({permission, rateLimit})`; `requireUser()`/`requirePermission()` | **live docs** (`/docs/authentication`) — newer than the local template; **capture in Phase 0** |
| Better-Auth | `^1.4.6`, no admin/nextCookies/oneTimeToken plugins | `^1.6.2` + `magicLink()`+`oneTimeToken()`+`admin()`+`nextCookies()` | template `lib/auth.ts:78–95` |
| Dashboard routes | `/admin/*` + `/dashboard/*` | unified `/app/*` (permission-gated) | **live docs** (changelog Jun 3) — newer than template; capture in Phase 0 |
| Public API | none | `/api/v1` OpenAPI 3.1 (users/identity `internal`) | live docs (changelog May 28) |
| Next / IDs | `next ^16.0.9`, `cuid()` ×115 | `next ^16.2.3+`, `cuid2()` | template `package.json`, schema wave |
| Identity | User-rooted; 4 hand-rolled minters; synthetic placeholder emails | (Ronin-specific) Person-rooted per §2.1 | this spec + `SOT-ADR.md` |

**Upstream pinning (captured SESSION_0359):** target = **`76c8e1e`** (2026-06-03, current upstream `main`).
The `dirstarter_template` clone was fast-forwarded `7e724b6 → 76c8e1e` (52 commits) and is now the accurate
reference. Confirmed present at `76c8e1e`: `server/orpc/{procedure,permissions,roles}.ts` (+ `permissions.test.ts`),
`lib/orpc-{server,client,query}.ts`, `server/router.ts`, `app/api/rpc/`, `app/api/v1/`, `app/app/` (unified
dashboard), and **flat `server/<entity>/*`** (the merge deleted `server/web/tools/*` — `server/web|admin/*` are gone
upstream). `apps/web/.dirstarter-upstream` re-pinned (historical `copied_at_sha` left as-is; `uplift_target_sha = 76c8e1e`).

**Captured substrate facts (ground truth for Phases 1/4):**

- `server/orpc/procedure.ts`: `publicProcedure`/`authedProcedure`; pipeline base-context → session → rate-limit → permission; authz via `meta.permission`; `source` rpc|rsc (RSC skips rate-limit). `/api/v1` exposure iff a procedure declares `.route()`.
- `server/orpc/permissions.ts`: `can(user, permission)` over role grants (`*`, `entity.*`, `entity.action`). **Role-based only — NO per-resource ownership.**
- `server/orpc/roles.ts`: flat `admin|user|guest`; admin=`["*"]`.
- **⚠ BBL must extend `can()` with resource-scoped grants** (per-tree/branch/node `LineageTreeAccess`) — see `SOT-ADR.md` **D4**. Upstream flat roles are NOT sufficient for BBL RBAC.
- `lib/auth.ts` upstream has NO shell-creation hook (the Passport/DirectoryProfile creation at our `lib/auth.ts:49–55` is Ronin's → moves to `server/identity/` in Phase 3). Upstream has `oneTimeToken()` + `claimsConfig` (OTP) — reusable for BBL claim.

## 4. Phase map (executable)

Each phase = one or more sessions. Per phase: **Goal · Files · Build · Done means · Deliverables · Depends on.**
Where a file list is upstream-derived and not yet captured, it says **[pin in capture]** — fill it from the Phase-0 upstream before building.

---

### Phase 0 — Capture current upstream + re-pin + SoT docs  ← THIS SESSION (SESSION_0359)

- **Goal:** Establish the true current-upstream source, produce the precise delta, re-pin the epic, and land the SoT docs so every later phase has an accurate, single map.
- **Files:**
  - `apps/web/.dirstarter-upstream` (re-pin note: target SHA + date)
  - `docs/architecture/uplift/epic-2026-05-19.md` (status header refreshed to current upstream; mark L1–L6 done, L7–L15 + new lanes pending)
  - `docs/architecture/uplift/lane-ledger.md` (refresh)
  - `docs/product/black-belt-legacy/BBL-SOT-Spec.md` (**this doc**)
  - `docs/product/black-belt-legacy/SOT-ADR.md` (**new** — consolidated decisions referencing/superseding old ADRs)
  - `docs/rituals/opening.md` (point bow-in at the SoT set: SOT-Spec → SOT-ADR → PRD → STORIES → CUTOVER → GAP_MATRIX)
- **Build:**
  1. Get the **real current upstream** by refreshing the existing upstream clone — **NOT** by adding a remote to `ronin-dojo-app` (that would fuse two git histories; the monorepo deliberately keeps one history). Per `apps/web/.dirstarter-upstream`: `dirstarter_template/` is the Dirstarter clone (`dirstarter/dirstarter.git` `main`, has its own `.git`). Run `cd "<dirstarter_template>" && git pull` (needs Dirstarter repo creds; FS-0024 shell guard blocks git in that dir, so this is an **operator-run** step). Record the new captured SHA/date.
  2. **Re-pin** `apps/web/.dirstarter-upstream` `copied_at_sha`/notes to the refreshed SHA; then three-way-merge / hand-port from the refreshed `dirstarter_template` into `apps/web` (the documented method).
  3. Produce a **delta inventory** of refreshed `dirstarter_template` vs `apps/web`: oRPC files, `server/router.ts`, `lib/orpc*.ts`, `app/api/rpc/`, `lib/auth.ts` plugins, the permission layout (roles/permissions per live docs), the `/app/*` dashboard, `/api/v1`, schema/cuid2. This delta **fills the [pin in capture] slots** in Phases 1–5.
  4. Write `SOT-ADR.md` (consolidated) + repoint `opening.md`.
- **Done means:** upstream captured + SHA recorded; delta inventory exists; this spec + SOT-ADR exist; `opening.md` points only at the SoT set; `bun run wiki:lint` green.
- **Deliverables:** captured-upstream SHA, the delta inventory (a section appended here or in the lane-ledger), `BBL-SOT-Spec.md`, `SOT-ADR.md`, updated `opening.md`.
- **Depends on:** nothing.

---

### Phase 1 — oRPC + permissions + Better-Auth plugins (substrate)

- **Goal:** Stand up the upstream data + authorization layer so all later code is written on it.
- **Files (add):** `apps/web/lib/orpc.ts`, `apps/web/lib/orpc-client.ts`, `apps/web/lib/orpc-query.ts`, `apps/web/server/router.ts`, `apps/web/app/api/rpc/route.ts`, the permission layer (`server/orpc/procedure.ts` + `permissions.ts` + `roles.ts` per live docs — **[pin in capture]**). **Edit:** `apps/web/lib/auth.ts` (add `admin()`, `nextCookies()`, `oneTimeToken()`; bump `better-auth` → `^1.6.2`), `apps/web/package.json` (+`@orpc/*`, `@tanstack/react-query`), a TanStack Query provider in the root layout.
- **Build:** port the oRPC scaffolding from captured upstream; define `publicProcedure`/`authedProcedure` + `.meta({permission, rateLimit})`; implement `can(user, permission)` + roles/grants; re-create the brand-scope + audit + rate-limit guarantees the current action layer enforces (non-negotiable — if the middleware can't preserve them, stop). Map the PRD RBAC roles (TREE_ADMIN / BRANCH_EDITOR / NODE_EDITOR / admin) into `roles.ts`. Migrate **one** representative read + one mutation as the proof (the lineage canvas read is the ideal pilot).
- **Done means:** `/api/rpc` live; one read + one mutation run through oRPC with brand-scope+audit+rate-limit preserved; `can()` gates a permission; typecheck/biome/tests green; browser-proof on `bbl.local`.
- **Deliverables:** working oRPC substrate + permission model + the migrated pilot surface + a short "how to add a procedure" note in this spec.
- **Depends on:** Phase 0.

---

### Phase 2 — Unified `/app/*` dashboard

- **Goal:** Adopt upstream's single permission-gated `/app/*` workspace; `/admin/*` + `/dashboard/*` redirect.
- **Files (CAPTURED SESSION_0365 — pin debt paid):** upstream `app/app/*` = 70 files (layout =
  `requireUser()` + `Shell` (+ AIProvider — stub for Ronin); overview page + stats/metrics
  `_components`; 9 entity areas); `lib/auth-guard.ts` (`requireUser`/`requirePermission`);
  `components/app/*` = 17 shell files (shell/sidebar/nav/chart/metrics/tiptap/ai/dialogs);
  redirects = `next.config.ts` `redirects()` → `/admin/:path*` + `/dashboard/:path*` → `/app/:path*`
  `permanent: true` (308). Live changelog re-verified + upstream GitHub HEAD re-checked still
  `76c8e1e` (2026-06-12). **This is where add-person / claim / profile surfaces will live — so it
  precedes the identity re-root to avoid moving them twice.**
- **Guard model (operator-ratified SESSION_0365 grill — option b):** per-area
  `requirePermission("<entity>.manage")` from day one (strings registered once in `roles.ts`,
  reused by entity routers in Phases 4–5); lineage areas gated permission-OR-active-`LineageTreeAccess`
  via a `requireLineageAccess()` built on the D4 seam; sidebar nav rendered per `can()`. This
  structurally fixes the legacy looseness (any lineage grantee could enter the whole `/admin` shell)
  and deliberately tightens `tournament_director` to tournaments + user-level items. Safe because
  there are NO real users pre-flip (operator + beta testers only).
- **Build (waves, local — template is local-only):** **2a** guards + shell + `/app` layout/overview +
  first wave (lineage/users/claims) · **2b** remaining ~35 areas + member `(web)/dashboard` pages ·
  **2c** blanket 308 redirect + delete old shells + flat `server/<entity>/*`. Old `/admin` keeps
  working untouched until 2c.
- **Done means:** `/app` renders, permission-gated; old routes 308 to `/app/*`; no surface lost; browser-proof.
- **Deliverables:** unified dashboard + redirect map; D-024 (drift) closed.
- **Depends on:** Phase 1 (complete — 1a `051c314`, 1b `edb74b2`, 1c `94e119d`).

> **AMENDED SESSION_0374:** scope locked to **Option A — full unified `/app`, every admin area,
> regardless of the D9 brand gate** (the gate stays a public-route 404 concern only). Wave 1 landed:
> `certificates`/`posts`/`content`/`media` migrated onto `requirePermission` layout guards with
> `/admin/*`→`/app/*` 308 redirects + `revalidatePath` repointing. The uniform recipe, the ordered
> remaining 23-area waves, and the deferred `server/<entity>` flatten codemod plan now live in
> [`APP_AND_SERVER_MIGRATION_MAP.md`](APP_AND_SERVER_MIGRATION_MAP.md). The Phase 3 identity re-root is
> mapped in [`PHASE3_USER_CARRY_PREFLIGHT.md`](PHASE3_USER_CARRY_PREFLIGHT.md) (no schema edits yet).

---

### Phase 3 — Identity re-root (Person-rooted), user-carry

> **Migration strategy = USER-CARRY, not clean reseed** (SOT-ADR D11/D9: preserve `User`/`Passport`,
> repoint satellites by lookup). The old §2.4 "clean big-bang + reseed" line is superseded — D11 flips
> before Phase 3, so early real users may exist. Execution map: `PHASE3_USER_CARRY_PREFLIGHT.md`.
> **5 satellites** (FightRecord promoted, SOT-ADR D1 amendment, SESSION_0390).

- **Goal:** Make Passport the person root per §2.1; collapse the 4 minters into the identity service.
- **Files:** `apps/web/prisma/schema.prisma` (`Passport.userId` nullable; `DirectoryProfile`/`LineageNode`/`RankAward`(earner)/`Affiliation`/`FightRecord` FK `userId` → `passportId`); **new** `apps/web/server/identity/{person-schema.ts, person-service.ts, person-service.test.ts}` (`createPassport`, `attachAccount`, `derivePersonName`); **edit** `lib/auth.ts` signup hook, `server/admin/users/actions.ts` (`createPerson`), `server/web/lead/actions.ts`, `server/web/lineage/node-profile-actions.ts` → call the service; every read/payload/query that joined via `userId` (lineage + directory payloads, visibility allowlists, the ~116 lineage/directory tests); `scripts/phase3-preflight-assert.ts` (pre-backfill gate) + the 3b backfill scripts (user-carry, not dual-write).
- **Build (3a→3b→3c):** **3a** = identity service + **additive** nullable `passportId` columns + assertion gate (SESSION_0390, done). **3b** = mint Passports for satellite-bearing/promoter Users lacking one → copy historical placeholder promoters to `RankAward.awardedByPassportId` → user-carry backfill `passportId` by `Passport.userId` lookup → cuid2 regen for identity tables with FK cascade assertions → null old placeholder satellite `userId` refs → detach + hard-delete placeholder Users → preflight PASS. The guarded physical drop SQL exists, but waits for Phase 3c because current read/write paths still select old satellite User relations. **3c** = repoint the 4 minters + claim flow at the service; read/test sweep; then run the old-column drop and browser proof. Delete the synthetic-email path; first/last name capture on add-person; DirectoryProfile parity on every create path.
- **Done means:** placeholder Passports exist with `userId=null`; the seed renders on tree + directory; add-person captures legal names + makes a DirectoryProfile; all 4 paths write identical shells; typecheck/oxlint/oxfmt/tests green; browser-proof on `bbl.local`.
- **Deliverables:** re-rooted schema + identity service + user-carry backfill + green tests.
- **Depends on:** Phase 1 (perm context for the service), Phase 2 (final routes).

---

### Phase 4 — BBL claim flow (RBAC-gated)

- **Goal:** The core loop: claim a placeholder → RBAC review → approve attaches account + scoped edit + Membership → propagates everywhere. (STORIES BBL-PROFILE-002/003, BBL-MIGRATE-004.)
- **Files:** the claim model + actions (`ProfileClaimRequest` / `LineageClaimRequest` — **reconcile the two claim systems**, ADR 0023), claim form + evidence upload, the review surface under `/app` gated by `can(user, "claim.review")` for admin/TREE_ADMIN/BRANCH_EDITOR/NODE_EDITOR; approval → `attachAccount(passportId, claimantUserId)` + grant + Membership + audit. **[verify current claim code against the live app — GAP_MATRIX is stale]**.
- **Build:** wire approval to the identity service's `attachAccount`; evidence private to reviewers (never in public payloads); audit on every transition.
- **Done means:** end-to-end browser proof — admin adds a placeholder → second account claims it + attaches evidence → RBAC reviewer approves → the claimant now owns the Passport and it renders correctly on tree, directory, drawer, rank rail.
- **Deliverables:** working claim→verify→attach loop + tests + browser proof.
- **Depends on:** Phase 3.

---

### Phase 5 — Remaining upstream lanes

- **Goal:** Finish full upstream parity. Lanes (resume the uplift epic; pin exact files in capture): **L7** Stripe `dahlia` + Resend contact shape; **L8** DB blog + native sitemap + RSS + MDX + OG; **public API `/api/v1`**; **CUID2** schema wave; **L14** toolchain bump (Next 16.2+, Prisma, etc.); **L15** `.dirstarter-upstream` SHA bump to captured target + epic close.
- **Done means:** each lane verified per its gate; `.dirstarter-upstream` = captured target; uplift epic closed.
- **Depends on:** Phases 1–2 (substrate); independent of 3–4 except where they touch identity reads.

---

### Phase 6 — WP-parity owner writes + drawer

- **Goal:** The original WP-parity arc on the correct base: **Promote Rank** (promotion workflow → RankAward + PROMOTED_BY) and **Move Node** (structured re-parent), plus profile-drawer parity (Belt Story; Tournaments/Achievements live on the profile page, not the drawer — operator decision). Students-by-belt roster.
- **Done means:** owner can run their tree (promote/move) on `bbl.local`, browser-proven; drawer matches WP function (not pixels).
- **Depends on:** Phases 3–4.

---

### Phase 7 — Cutover

- **Goal:** `blackbeltlegacy.com` live. Execute `CUTOVER_CHECKLIST.md` (DNS at Bluehost, Resend DKIM, 301 map, prod smoke, rollback plan).
- **Done means:** domain live + SSL + prod smoke green + magic-link email.
- **Depends on:** the launch-blocking subset of 1–6 (not necessarily all of Phase 6 polish).

### 4.8 Coarse session roadmap (estimate — finalize each phase's tasks at its start)

Visibility, not false precision. Detailed 3–5-task petey-plans are written at each phase's start.

| Phase | ≈ sessions | Slices |
| --- | --- | --- |
| 0 | 1 (done) | capture + re-pin + SoT docs (this session) |
| 1 — oRPC + perms | ~3 | (1a) deps + oRPC scaffold (`orpc-{server,client,query}`, `router.ts`, `app/api/rpc`, context) · (1b) permission model (`procedure/permissions/roles`) **+ BBL resource-grant extension seam (D4)** + auth plugins (`admin`/`nextCookies`/`oneTimeToken`, bump better-auth) · (1c) pilot migrate 1 read + 1 mutation, brand-scope/audit/rate-limit preserved + browser proof |
| 2 — unified `/app` | ~2–3 | (2a) `/app` shell + `requireUser`/`requirePermission` guards + redirects · (2b) move admin/dashboard surfaces · (2c) flatten `server/<entity>/*` |
| 3 — identity re-root | ~2–3 | (3a) `server/identity/` service + schema re-root migration · (3b) reads/payloads/tests sweep + reseed 17 · (3c) repoint signup/add-person/lead + browser proof |
| 4 — claim flow | ~2 | (4a) reconcile claim models + RBAC review via `can()`+resource grants · (4b) end-to-end claim→attach browser proof |
| 5 — remaining lanes | ~4–5 | L7 Stripe/Resend · L8 content/SEO · public API `/api/v1`+api-keys · cuid2 schema wave · toolchain · SHA bump to `76c8e1e` |
| 6 — WP-parity writes | ~2–3 | Promote Rank · Move Node (structured re-parent) · drawer parity |
| 7 — cutover | ~1–2 | `CUTOVER_CHECKLIST.md`: DNS/Resend/redirects/prod smoke |

**Honest total ≈ 17–22 sessions.** Each slice is independently shippable + verifiable, so Brian can execute any of them directly from this spec when session limits hit.

## 5. SoT doc set & what's superseded

- **Live SoT:** this spec, `SOT-ADR.md`, `PRD.md`, `STORIES.md`, `CUTOVER_CHECKLIST.md`, `GAP_MATRIX.md` (re-verify).
- **Superseded/archived** (historical, referenced by `SOT-ADR.md`, not read directly): ADR 0016/0019/0020/0023/0024/0025; `dirstarter-gap-audit.md` (its "no oRPC ever" stance is dead); scattered identity notes. The uplift `epic-2026-05-19.md` + `lane-ledger.md` remain the lane execution ledger for Phase 5, subordinate to this spec.
- **Rule:** if any of those contradict this spec, **this spec + the live app win.**
- **Runbooks updated per phase** (current-state until then; high-traffic ones carry a SESSION_0359 notice, the rest get rewritten as their phase lands): identity/auth wiring — `sops/sop-data-and-wiring-flows.md`, `sops/sop-e2e-user-lifecycle.md`, `dev-environment/local-dev-auth-storage.md` (Phases 1/3); lineage + RBAC — `domain-features/lineage-hub.md`, `domain-features/directory-org-profile-hub.md`, `domain-features/invites.md` (Phases 1/3/4); routes — anything citing `/admin/*` or `/dashboard/*` (Phase 2); data layer — `porting/*`, `sops/sop-test-writing.md` (Phase 1). `GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md` folds into Phases 4–6 (RBAC = SOT-ADR D4).

## 6. Verification & cutover gates

- Per-phase: `bun run typecheck`, `bun run lint:check` + `bun run format:check` (oxlint/oxfmt), `bun test`, `bun run wiki:lint` (docs), and **browser-proof on `bbl.local:3000`** (the operator's standing "prove it on the live DOM" rule — it caught real bugs SESSION_0357/0358 that green unit tests missed).
- Launch: `CUTOVER_CHECKLIST.md` is the authoritative cross-layer sequencer.

## 7. Open items / risks

- **Upstream access:** confirm we can `git fetch` the Dirstarter upstream (paid repo) or must fresh-download. Phase 0 resolves.
- **oRPC must preserve brand-scope + audit + rate-limit + public-payload allowlists** or it's a non-starter (PRD principle). Hard gate in Phase 1.
- **Two claim systems** (`ProfileClaimRequest` vs `LineageClaimRequest`) — reconcile in Phase 4, don't multiply.
- **GAP_MATRIX staleness** — re-verify feature status against the live app at the start of any phase that depends on it.
- **Scope is a multi-session program.** Brian can execute lanes directly from this spec when session limits hit; each phase is independently shippable + verifiable.

**Honor the Lineage. Build the Future. OSSS.**
