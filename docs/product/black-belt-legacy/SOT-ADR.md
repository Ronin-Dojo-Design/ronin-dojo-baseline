---
title: "SOT-ADR — Consolidated Architecture Decisions (Black Belt Legacy)"
slug: sot-adr
type: decision
status: active
created: 2026-06-10
updated: 2026-06-11
last_agent: claude-session-0361
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
