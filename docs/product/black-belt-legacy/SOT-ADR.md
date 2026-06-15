---
title: "SOT-ADR — Consolidated Architecture Decisions (Black Belt Legacy)"
slug: sot-adr
type: decision
status: active
created: 2026-06-10
updated: 2026-06-15
last_agent: codex-session-0391
author: Brian + Petey
pairs_with:
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/STORIES.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - adr
  - sot
  - architecture
---

# SOT-ADR — Consolidated Architecture Decisions

The **single current** decision record for the BBL build. It **supersedes** the older, scattered
ADRs (listed in §Superseded). Those remain in `docs/architecture/decisions/` as **historical**
references — read them only for backstory, never as current law. If an old ADR contradicts this
doc, **this doc wins.** Build detail lives in [`BBL-SOT-Spec.md`](BBL-SOT-Spec.md).

Captured upstream baseline for all decisions below: Dirstarter `main` **`76c8e1e`** (2026-06-03),
refreshed into `dirstarter_template` at SESSION_0359.

---

## D1 — Identity is Person-rooted (Passport = SoT; Account is optional)

- **Decision:** `Passport` is the person/identity source of truth. `Passport.userId` is **nullable** —
  a placeholder (admin/import-created) is an **accountless Passport**, with **no synthetic email**. The
  identity satellites `DirectoryProfile` / `LineageNode` / `RankAward` / `Affiliation` re-point FK
  `userId` → `passportId`. `User` (Better-Auth account) stays the auth/actor for Membership,
  UserEntitlement, AuditLog actor, submissions, sessions.
- **Claim = attach an account to an existing Passport** (`Passport.userId = claimant`), always RBAC-reviewed.
  Because satellites reference the Passport, an approved claim propagates across every surface automatically.
- **Names:** `Passport.legalFirstName`/`legalLastName` = legal SoT; `Passport.displayName` = user-pickable;
  `User.name` = derived mirror (Better-Auth needs non-null; not unique); uniqueness/@handle = existing unique
  `DirectoryProfile.slug` / `LineageNode.slug`. One identity service (`server/identity/`): `createPassport`
  + `attachAccount`.
- **Supersedes:** ADR 0020 (extends its nullable-userId/no-synthetic-User pattern to the identity core),
  ADR 0025 (Passport-SoT, now person-*rooted* not just labeled SoT), and the synthetic-`@placeholder.invalid`
  path added in SESSION_0358.
- **Consequence:** kills the 4 hand-rolled shell minters (`lib/auth.ts:49–55`, `server/admin/users/actions.ts:88`,
  `server/web/lead/actions.ts:375–391`, `server/web/lineage/node-profile-actions.ts:90`) → one door.

### D1 amendment — 5 satellites + migration calls *(SESSION_0390 grill)*

- **FightRecord is a 5th identity satellite (REPOINT).** Operator promoted it (overriding the
  `PHASE3_USER_CARRY_PREFLIGHT` 4-satellite default + Doug's "defer/CARRY"): a per-person career W/L
  tally is durable athletic identity a placeholder fighter should carry pre-claim. Disposition is now
  **4 REPOINT** (`DirectoryProfile`, `LineageNode`, `Affiliation`, `FightRecord`) **+ 1 DUAL**
  (`RankAward`: earner→passport, promoter `awardedById` stays User). `@@unique([userId,disciplineId,type])`
  → `([passportId,…])` in Phase 3b.
- **cuid → cuid2 stays in the Phase-3 wave** (operator), executed in the 3b destructive window (it is a
  PK rewrite, not additive). Sub-order: **regenerate cuid2 IDs first → backfill satellites against the new
  `Passport.id`** (preflight §7).
- **Placeholder reap = hard-delete** (operator) after the §5 step-4 "placeholder never acted as an account"
  assertion passes. The claim-flow §6 transform therefore drops the placeholder-archive step entirely.
- **Claim result contract:** add `passportAccountAttached: boolean`; drop the now-meaningless
  `placeholderArchivedUserId`.
- **Phase 3a landed (SESSION_0390):** `server/identity/` service (`createPassport`/`attachAccount`/
  `derivePersonName`) + **additive** migration (nullable `passportId` on the 5 satellites + nullable
  `Passport.userId`; no drops/constraint-moves/reseed) + the read-only pre-backfill assertion gate
  (`scripts/phase3-preflight-assert.ts`). The destructive backfill/drop/reseed is 3b.

### D1 amendment — RankAward promoter identity split + 3b rehearsal *(SESSION_0391)*

- **Historical promoter identity is Passport-side.** `RankAward.awardedById` remains the nullable
  account/actor link for a real logged-in promoter. Imported lineage promoters that were synthetic
  placeholder Users are copied to `RankAward.awardedByPassportId` before placeholder User deletion.
  Public lineage/rank provenance should prefer the Passport promoter identity once Phase 3c repoints
  read paths.
- **3b data sequence is now proven locally:** mint missing Passports for every satellite-bearing or
  promoter User; copy placeholder promoters to `awardedByPassportId`; backfill satellite `passportId`;
  rewrite every discovered single-column string primary key to cuid2 behind an `ON UPDATE CASCADE`
  catalog assertion; null old placeholder satellite `userId` columns; detach and hard-delete
  placeholder Users; re-run the preflight gate. The rehearsal preserved BBL people as accountless
  Passports and preserved account-bearing Users. Seed scripts that need Brian/admin ownership now
  resolve by identity (`User.name`, Passport display/legal name, or legacy id fallback) instead of
  depending on the pre-rewrite `User.id`.
- **Application validators must be cuid2-compatible.** Any action schema that validates database IDs
  must use the shared legacy-cuid + cuid2 helper during the transition, not Zod's legacy
  `z.string().cuid()` predicate.
- **Physical `userId` column drops are staged, not applied yet.** `phase3b-drop-old-user-columns.sql`
  is the guarded step-6 SQL, but applying it before Phase 3c would break current read/write paths that
  still select satellite `user` relations. Phase 3c must repoint code to Passport/`awardedByPassport`
  before the drop SQL becomes executable on the app database.

## D2 — Foundation-first on upstream-current Dirstarter

- **Decision:** Bring the repo to upstream-current Dirstarter (`76c8e1e`) **before** the identity re-root +
  claim, so identity is built once on the final substrate, not the layer we're replacing. Phase order in the spec.
- **Why:** re-rooting on today's `next-safe-action` + `/admin/*` layer = redoing it after oRPC + `/app` land.

## D3 — oRPC + permission model adopted FULLY (not the ADR 0024 hybrid)

- **Decision:** adopt upstream's oRPC data layer + permission gate fully; retire `next-safe-action` as surfaces
  migrate. The real upstream model (captured `76c8e1e`):
  - `server/orpc/procedure.ts` — `publicProcedure` / `authedProcedure`; pipeline = base-context → session →
    rate-limit → permission. Authz governed entirely by `meta.permission`; `source` "rpc"|"rsc" (RSC skips rate-limit).
  - `server/orpc/permissions.ts` — `can(user, permission)` matches role grants (`*`, `entity.*`, `entity.action`).
  - `server/orpc/roles.ts` — flat roles `admin|user|guest`; `ROLES` grant lists; `roleOf(user)`.
  - `lib/orpc-server.ts` / `orpc-client.ts` / `orpc-query.ts`, `server/router.ts`, `app/api/rpc/`.
  - REST `/api/v1` exposure is orthogonal: a procedure is public-API iff it declares `.route()`.
- **Hard gate:** the oRPC middleware MUST preserve brand-scope + audit + rate-limit + public-payload allowlists
  the current action layer enforces. If it can't, the migration stops (PRD principle).
- **Supersedes:** ADR 0024 (proposed hybrid/pilot) — operator override to full adoption; `dirstarter-gap-audit.md`
  "no oRPC ever" stance (dead).

## D4 — BBL RBAC EXTENDS the flat role model with resource-scoped grants  ⚠ key delta

- **Finding:** upstream `can()` is **role-based only, no per-resource ownership** (`permissions.ts`:
  *"there is no per-resource ownership check"*). Flat roles `admin|user|guest`.
- **Decision:** BBL needs **per-resource** authority — `TREE_ADMIN` of *a tree*, `BRANCH_EDITOR` of *a branch*,
  `NODE_EDITOR` of *a node* (the existing `LineageTreeAccess` model; PRD Epic 3 / BBL-EDITOR-003/004/005). So BBL
  **extends** `can()` with **resource-scoped grants** (the upstream-documented "Adding ownership grants" pattern):
  a `can(user, permission, resource?)` form that consults `LineageTreeAccess` for tree/branch/node scope, layered
  on top of the flat global roles. Claim review (`claim.review`) is gated this way.
- **Consequence:** Phase 1 builds the flat model AND the BBL resource-grant extension seam; Phase 4 claim review
  uses it. **Do not** assume the flat upstream roles are sufficient for BBL.

## D5 — Unified `/app/*` dashboard + `server/<entity>` flattening

- **Decision:** adopt upstream's unified `/app/*` workspace (replaces `/admin/*` + `/dashboard/*`, which 301) and
  the `server/` flattening (`server/web/*` + `server/admin/*` → flat `server/<entity>/*` — the `76c8e1e` merge
  deleted `server/web/tools/*`). Done **before** the identity re-root so add-person/claim/profile surfaces move once.
- **Supersedes:** drift D-024 (fork behind unified dashboard).

## D6 — Verification is always RBAC-reviewed (never automatic)

- **Decision:** every PERSON claim is reviewed by an RBAC steward (admin / TREE_ADMIN / BRANCH_EDITOR /
  NODE_EDITOR / granted ACL) before the account attaches. Verification is the BBL value prop (PRD Pillar 5;
  non-goal "treating claimed data as verified without review").
- **Supersedes:** ADR 0023's rationale — its PERSON claim was a *"manual merge because merging an identity is
  unsafe"*; under D1 it is a safe **attach to an accountless Passport**, but stays **reviewed** by policy (verification),
  not because it's dangerous. Reconcile the two claim systems (`ProfileClaimRequest` vs `LineageClaimRequest`) in Phase 4.
- **Reuse:** upstream `oneTimeToken()` + `claimsConfig` (OTP) is available for the claim flow.

## D7 — Standing engineering calls *(amended SESSION_0361 — see D8)*

- **Migration:** clean big-bang + reseed (no real users expected before the post-Phase-3 flip
  checkpoint — D8). **If the D8 early-flip trigger fires**, Phase 3 must instead mechanically carry
  early real users (preserve `User`/`Passport` rows, repoint satellites by lookup). Phased dual-write
  remains documented for post-launch scale only.
- **IDs:** `cuid()` → `cuid2()` moves **into the Phase 3 schema wave** (one big-bang window before the
  flip, D8), no longer parked in Phase 5 — doing it post-flip would mean an ID migration against live
  signups.
- **Lineage placement:** Move Node = **structured re-parent** (WP parity), not free x/y; free x/y / visual groups /
  relationship-type picker out of scope unless re-opened.
- **Primitives:** brand-neutral (ADR 0022 retained); belt color = `Rank.colorHex` data; BBL is the only proven surface.

## D8 — Cutover armed early; DNS flip checkpoint = immediately after Phase 3  *(SESSION_0361)*

- **Finding:** the live WP `blackbeltlegacy.com` is a dead landing page — broken email capture, zero
  functional features. The launch-parity bar is **zero**: Phase 6 WP-parity owner writes do **not**
  gate launch (no WP capability exists to match). Meanwhile the new platform already exceeds the WP
  site (directory, lineage tree + drawer, evidence-backed claim + RBAC review, join/checkout — all
  CI-e2e-covered), and the same Vercel deployment has been live-prod for `baselinemartialarts.com`
  for months, so a BBL domain flip adds no new risk class.
- **Decision — decouple ARMING from FLIPPING:**
  - **Arm early:** the cutover-lane work (public slide-in nav L+R, landing + email-capture polish,
    L8 content/SEO essentials = OG + sitemap, Resend DKIM, the small 301 map, BBL prod-render verify)
    rides earlier sessions — interleaved after Phase 1c or at a natural seam — so the flip itself is
    a ~30-minute operator action whenever taken.
  - **Flip checkpoint (default):** immediately after **Phase 3** lands — the site goes public on its
    final person-rooted identity model, pure clean reseed intact, claims at full strength.
  - **Early-flip trigger:** operator checks WP/Bluehost/Search-Console analytics once; if
    `blackbeltlegacy.com` has real organic traffic today, flip early on the current verified feature
    set, accepting the D7 early-user-carry migration in Phase 3.
  - Claims are **open** at flip — safe because every claim is RBAC-reviewed (D6).
- **Launch-gating subset (operator-ratified, SESSION_0361 grill):** Phases 1–5 (cuid2 moved into the
  Phase 3 wave; `/api/v1` may trail the flip) + the nav/landing cutover lane + stripe@22 runtime
  rehearsal + `CUTOVER_CHECKLIST` Layer 1. Phase 6 and drawer parity are post-launch.
- **Sequencing:** SESSION_0362 = Phase 1a oRPC scaffold (as queued by SESSION_0360). The launch focus
  rule stands: deferral is to this **named checkpoint**, not "later."
- **Consequences:** D7 migration + cuid2 bullets amended above; BBL-SOT-Spec §2.2 ordering callout;
  `GAP_MATRIX` BBL-PROFILE-002 staleness corrected (the authenticated claim e2e exists, runs in CI).
- **Supersedes:** the strict Phase 0→7 cutover-last ordering in BBL-SOT-Spec §2.2 (SESSION_0359), and
  this decision's own same-session "flip ASAP" draft.

## D9 — BBL launches lineage-first (brand feature gate); flip moved to ASAP  *(SESSION_0368)*

- **Decision (operator grill, SESSION_0368):** BBL ships **lineage + its funnels only** at cutover:
  lineage (+ `/lineage/join` checkout + entitlements untouched), directory, members, schools,
  organizations, events (promotion provenance), certificates, **posts + blog** (operator-fed
  content). Gated off (HTTP 404): tournaments, courses, programs, disciplines (browse page),
  techniques, gear, merch, advertise, submit, and the Dirstarter listings system
  (`/categories`, `/tags`, root `/[slug]`, the categories rail, the global listings search).
- **Mechanism:** static per-brand allowlist `config/brand-features.ts` (brands without an entry
  get ALL features — Baseline/RDD unchanged; brand-neutral, WEKAF can get its own list) + one
  central route gate in `proxy.ts` (rewrite → 404) + `brandHasFeature()` consumed by
  header/NavSheet/footer/dashboard-tabs/landing. **Nothing deleted** — re-enabling a feature is
  one line in one PR. No schema change (Phase-3 freeze respected).
- **Minimal chrome (operator, same session):** BBL header/footer carry essentials only, per the
  SESSION_0361 measured legacy spec — header = logo + hamburger + Join CTA + account (no inline
  desktop nav; primary nav lives in the right slide-in); footer = newsletter (lineage-flavored
  copy variant) + Quick Links + icons (no Browse column). `brandHasMinimalChrome()` in the same
  config; other brands keep full chrome.
- **Flip timing:** the D8 "flip after Phase 3" default is superseded — **operator ratified the
  early flip** (ASAP after the pre-flip gate: this gating slice → stripe@22 test-mode rehearsal →
  OG/meta + robots/sitemap hygiene → minimal 301 map → prod render verify). Consequence accepted:
  **Phase 3 runs the D7 user-carry migration** (preserve `User`/`Passport`, repoint satellites by
  lookup), not the pure reseed. Claims stay open at flip (D6 — always RBAC-reviewed).
- **Post-flip:** 2b/2c waves, Phases 3–5, techniques/posts-feed re-light as their lanes mature.

## D10 — DNS flip waits for local Phases 1–6 functionality *(SESSION_0373)*

- **Decision (operator override, SESSION_0373):** D9's "ASAP after pre-flip gate" timing is superseded
  for the active launch queue. `blackbeltlegacy.com` DNS cutover waits until Phases 1–6 are functional
  from a `bbl.local` standpoint, including the unified `/app` dashboard/admin surface and the Baseline
  surfaces that must flip into `/app` for Dirstarter upstream parity.
- **Carry-forward:** Stripe rehearsal remains complete from SESSION_0369. No DNS, Vercel production-domain,
  or live-domain mutation belongs to the Phase 2c closeout slice.
- **Phase 3 migration rule:** because early real users can exist before the final identity re-root, Phase 3
  uses D7/D9 user-carry semantics: preserve `User`/`Passport` rows and repoint satellites by lookup.
- **Cutover lane:** minimal 301 map and production render verification remain armed work, but they are not
  the immediate next gate until the local functionality pass is complete.

## D11 — DNS flip on minimum viable gate; Phases 3–6 are post-flip  *(SESSION_0388)*

- **Finding:** D10 (SESSION_0373) gated the DNS flip on full Phases 1–6 local functionality — a bar
  ~10–15 sessions away. Meanwhile `blackbeltlegacy.com` is a dead WP landing page (broken email
  capture, zero functional features), and the new platform already exceeds it: lineage tree + drawer,
  directory, evidence-backed claim + RBAC review, join/checkout, DKIM verified, Phase 2c waves 1–6
  complete (`/app` unified dashboard). The flip adds no new risk class — the same Vercel deployment
  has been live for `baselinemartialarts.com` for months.
- **Decision (operator grill, SESSION_0388):** supersede D10. Minimum viable flip gate:
  - Phase 1 complete ✅
  - Phase 2a–2c (all `/app` waves, including waves 5+6 commerce/infra) complete ✅
  - Domain attached to Vercel project ✅ (`blackbeltlegacy.com` + `www.`, `"verified":true`)
  - DKIM verified ✅
  - Mobile landing polished ✅ (hero h1 scaling, section gaps, border radii, hero card)
  - AdBanner suppressed for BBL ✅ (`brandHasFeature(brand, "advertise")` gate)
  - Rollback documented (revert apex A to `151.101.66.159` at Bluehost, instant)
- **Post-flip:** Phases 3–6 execute with D7/D9 user-carry semantics (preserve `User`/`Passport`,
  repoint satellites by lookup — no pure reseed). BrandSettings (colors/favicon/OG) set in prod
  admin post-flip. S3/R2 media env vars wired post-flip.
- **Supersedes:** D10 (SESSION_0373 flip-wait gate).

---

## Superseded / historical ADRs

Read only for backstory — **not** current law:

- ADR 0016 (lineage promotion SoT) — RankAward canonical still holds; folded into D1.
- ADR 0019 (membership lifecycle) — Membership = community/account state; consistent with D1 (Membership stays account-side).
- ADR 0020 (registration recipient nullable/guest) — pattern generalized by D1.
- ADR 0022 (brand-neutral primitives) — retained, see D7.
- ADR 0023 (generic profile claim) — pattern kept, rationale superseded by D1/D6.
- ADR 0024 (oRPC hybrid, proposed) — superseded by D3 (full adoption).
- ADR 0025 (Passport identity SoT) — superseded by D1 (person-*rooted*).
- `dirstarter-gap-audit.md` "no oRPC" — dead.
