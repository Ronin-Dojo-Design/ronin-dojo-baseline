---
title: "BBL_PARITY_SPEC — Dashboard / Profile Pixel-Parity Build Blueprint"
slug: bbl-parity-spec
type: spec
status: active
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-tender-babbage
author: Brian + Claude
tags:
  - bbl
  - blackbeltlegacy
  - parity
  - profile
  - dashboard
  - passport
  - blueprint
---

# BBL_PARITY_SPEC — Dashboard / Profile Pixel-Parity Build Blueprint

> The build blueprint for the **BBL dashboard/profile parity epic** flagged in
> [`../../sprints/SESSION_0408.md`](../../sprints/SESSION_0408.md) ("Next session" block:
> *"profile + public ~60–75% reusable; dashboard is the build; the public BJJ Passport ID card
> is the signature gap"*). It maps every legacy **BBLApp** surface to a disposition against the
> **current `apps/web`** component set, so any agent can pick a slice and build it **reuse-first**.
>
> Scope rule (this epic): **feature parity** where our Dirstarter primitives differ, **pixel-match
> only the signature card** (the BJJ Passport ID card). Brand-neutral primitives stay brand-neutral
> ([`BBL-SOT-Spec.md`](BBL-SOT-Spec.md) §2.4 / ADR 0022) — belt color is `Rank.colorHex` data, never
> a hardcoded palette. This doc is planning only; it changes no schema, route, or query.

## 0. How to use this doc

Each surface below has one disposition table. Read the legend, find the slice you're building,
and follow its disposition. The companion reference for every component named here is
[`../../knowledge/wiki/custom-component-inventory.md`](../../knowledge/wiki/custom-component-inventory.md)
(cited inline as **CCI §N**) and its Dirstarter-primitive companion `dirstarter-component-inventory.md`.

**Disposition legend:**

- **REUSE** — an existing Ronin component already does the job (feature parity); name it and mount it.
- **COMPOSE** — assemble from existing L1 primitives + Ronin components into a new arrangement; name the parts.
- **BUILD** — genuinely missing; justify why nothing existing fits.

**Effort:** **S** ≈ mount/wire existing work · **M** ≈ compose + a small read-model touch · **L** ≈ new
component + read model. (Read-model / query work is owned by a **parallel branch** — this epic is the
presentation layer; see §5.)

## 1. Current-app surface inventory (the baseline we build on)

| Surface | Route / entry | Today | Inventory |
| --- | --- | --- | --- |
| Member dashboard | `/app/profile` | 7 tabs (Profile · School · [Techniques] · [Listings] · Lineage · Events · Saved) + `DashboardMembership` header | `app/app/profile/page.tsx`, CCI §9/§10/§3g |
| Owner identity editor | `/me` + dashboard Profile tab | `PassportEditor` (one canonical editor — display/legal name, dob, phone, emergency, avatar, bio, social, slug, visibility, show-toggles, cover, video) | CCI §10 |
| Public profile | `/directory/[slug]` | `ListingDetail` (hero / bio / ranks / schools / social) + claim teaser + save | CCI §9, §8 |
| Lineage viewer | `/lineage/[treeSlug]` | `LineageTreeBoard` / `LineageCohortTimeline` / `LineageProfileDrawer` (+ rank history, progression, students) | CCI §1 |
| Belt / rank surfaces | drawer tabs | `LineageRankHistoryTab` + `LineageRankProgressionPanel` + `BeltSwatch` | CCI §0, §1 |
| Promotions | `/events`, dashboard Events | `PromotionTimeline`, `DashboardEventsTab` | CCI §3g |
| Shared identity hero | claim teaser / editor preview | `ProfileHero` (presentation-only) | CCI §0 |

**Data already exists** ([`../../sprints/SESSION_0408.md`](../../sprints/SESSION_0408.md)): 76 BBL members
imported with `RankAward` belts, a `bbl-lineage` tree with parent edges, schools as Organizations, and
`Passport.avatarUrl` (default + real). So the rich-profile reads exist; this epic mostly **renders** them.

## 2. Surface A — Member Profile (BBLApp 5 tabs + Passport card + Privacy)

| Legacy BBLApp feature | Disposition | Effort | Current-app gap |
| --- | --- | --- | --- |
| **About** (bio / location / school / verified / social) | **REUSE** — `ProfileHero` + `ListingDetail` body slots (public) + `PassportEditor` (owner edit); trust via `LineageTrustBadge` (CCI §0, §9, §1) | S | Every field exists on `Passport`/`DirectoryProfile`; `/directory/[slug]` already renders hero/bio/ranks/schools/social. Gap = a read-only "About" panel grouping on the member-facing profile. |
| **Training** (styles + rank progression) | **REUSE** — `LineageRankProgressionPanel` (Points/Levels belt ladder + Achievements rail) + Discipline `Badge`s (CCI §1) | S–M | The panel already exists but is mounted **only inside the lineage drawer**; needs a profile-page mount (no drawer). Styles = `Discipline` badges (compose `Badge`). |
| **Achievements** (tournaments / promotions) | **COMPOSE** — `PromotionTimeline` (promotions) + `Card`/`Badge`/`Stat` tiles for tournament/`FightRecord` results (CCI §3g, §3e) | M | `PromotionTimeline` exists; a **person-scoped** tournament/achievement render does not (`FightRecord` is a satellite with no public surface yet). |
| **Lineage** (belt chain founder → current) | **REUSE** — `LineageTreeBoard` / `LineageCohortTimeline` + `LineageProfileDrawer`, focused via `initialFocusId`; chain via `buildSelectedPathMemberIds` (CCI §1) | S | Full viewer exists; the profile tab just mounts it focused on the person. |
| **Belt History** (promotion timeline + instructors) | **REUSE** — `LineageRankHistoryTab` (per-`RankAward` rows: `colorHex`, awarded-by/instructor, UTC-pinned dates) (CCI §1) | S | Exact-match component already built; mount it outside the drawer. |
| **BJJ Passport ID card** (shareable gradient credential) | **BUILD** — `BjjPassportCard` (**scaffolded this session**) composing `Card` / `Avatar` / `BeltSwatch` / `Badge` (CCI §0) | M | The signature gap — no credential card existed. Scaffolded **unwired** this session; wiring = read model + share (reuse `QrShareButton`, CCI §0) is the next slice. |
| **Privacy Center** | **REUSE** — `PassportEditor` visibility + per-field show-toggles + slug (CCI §10) | S | `DirectoryProfile` visibility (`HIDDEN`/`MEMBERS_ONLY`/`PUBLIC`) + show-toggles already live in `PassportEditor`; gap = a dedicated "Privacy" panel grouping, not new logic. |

**Reuse ratio:** 5 of 7 REUSE/compose from existing lineage + identity work; 1 BUILD (the card); 1 COMPOSE.

## 3. Surface B — Public Profile (`/directory/[slug]`)

| Legacy feature | Disposition | Effort | Current-app gap |
| --- | --- | --- | --- |
| Public hero (name / avatar / rank / trust) | **REUSE** — `ListingDetail` + `ProfileHero` + `LineageTrustBadge`/`LineageClaimBadge` (CCI §9, §0, §1) | S | Live on `/directory/[slug]`. |
| Bio / ranks / schools / social | **REUSE** — `ListingDetail` body slots; ranks via `BeltSwatch`; avatar via the passport projection (CCI §9, §0, §3i) | S | Live. Add a rank rail + the passport-card embed. |
| **Shareable passport card on the public profile** | **BUILD** — embed `BjjPassportCard` + `QrShareButton` (CCI §0) | M | Card scaffolded; wire to the public projection (already carries `passport.avatarUrl`, ranks, lineage path, school). |
| Claimable placeholder teaser | **REUSE** — `ProfileClaimTeaser` + `ProfileClaimForm` (CCI §8) | S | Live (SESSION_0354). |
| Save / bookmark | **REUSE** — `ListingSaveButton` (CCI §9) | S | Live (SESSION_0397). |

## 4. Surface C — Member Dashboard (BBLApp 8 tier-gated tabs)

Current dashboard = `/app/profile` (tabs Profile · School · [Techniques] · [Listings] · Lineage · Events ·
Saved) + the `DashboardMembership` header. Tier-gating already exists: `brandHasFeature` gates Techniques/
Listings, and `UserEntitlement` drives tier. The 8 legacy tabs map onto that scaffold.

| Legacy dashboard tab | Disposition | Effort | Current-app gap |
| --- | --- | --- | --- |
| **Overview** (stats / onboarding / belt-journey) | **COMPOSE** — `DashboardMembership` (enrollments/entitlements/registrations) + `LineageRankProgressionPanel` (belt-journey) + `Stat`/`Card` tiles (CCI §3g header, §1, §3e) | M | `DashboardMembership` exists but there is no "Overview" landing tab; the **onboarding checklist** is net-new (compose `Card`/`Badge`/progress). |
| **Students** (instructor roster) | **REUSE** — `StudentsCarousel` (students-by-belt) + `LineageHonorStrip` (CCI §1) | S–M | `StudentsCarousel` groups a member's lineage children by belt; needs an instructor-roster mount (reads exist via the lineage payload). |
| **Invites** | **REUSE** — org `GenerateInviteForm` + `InviteRowActions` (CCI §7) | S | Built for org settings; surface in a dashboard tab. Lineage-claim invites reuse the existing claim flow (CCI §8). |
| **My School** | **REUSE** — `DashboardSchoolTab` + org settings (`OrgGeneralInfoForm`, `SelfServiceThemeForm`, Members) (CCI §7) | S | Live; aggregate the org-admin surfaces into one tab. |
| **Content** | **REUSE** — `DashboardTechniquesTab` + `MediaAttachmentManager` + content-posts (CCI §3h, §4) | M | Techniques/media exist; broader "content" authoring (posts) is partial. |
| **Passport** | **REUSE** — `PassportEditor` + `MediaAttachmentManager` (passport media) + a `BjjPassportCard` live preview (CCI §10, §3h, §0) | S | `PassportEditor` is the canonical editor (SESSION_0398); add the card preview. |
| **Billing** | **REUSE** — `DashboardMembership` + `BillingPortalButton` (Stripe portal) (CCI §3g header) | S | Stripe portal live; tier-gating UI is net-small. |
| **Lineage** | **REUSE** — `DashboardLineageTab` + lineage editor preview (`LineageTreeBoard`) (CCI §1) | S | Live (SESSION_0202). |

**Reuse ratio:** 6 of 8 REUSE, 2 COMPOSE — the dashboard is mostly **re-mounting** existing surfaces into a
tier-gated 8-tab shell; the net-new work is the Overview tiles + onboarding checklist.

## 5. Sequencing — independently-shippable tracer bullets

Each slice is its own PR: one surface mount, reuses existing components, degrades gracefully if the next
slice never lands. Ordered by signal-per-effort; the read model that backs them is the **parallel branch's**
job (this epic renders what that branch projects).

- **Slice 0 — Passport card scaffold (THIS SESSION).** `BjjPassportCard` presentational + this spec. Unwired.
- **Slice 1 — Wire the Passport card (signature gap).** Mount `BjjPassportCard` on `/directory/[slug]` from
  the existing public projection (avatar / ranks / lineage path / school) + `QrShareButton`. Highest signal,
  smallest surface, fully read-only. Pixel-match here.
- **Slice 2 — Profile Belt History + Training.** Mount `LineageRankHistoryTab` + `LineageRankProgressionPanel`
  on the member profile (outside the drawer). Pure reuse, no new data.
- **Slice 3 — Profile Lineage tab.** Mount `LineageTreeBoard`/`LineageCohortTimeline` focused on the person
  (`initialFocusId`). Reuse.
- **Slice 4 — Profile About + Privacy.** Read-only About panel from the projection; group `PassportEditor`
  visibility + show-toggles into a Privacy Center panel.
- **Slice 5 — Achievements.** `PromotionTimeline` + a person-scoped tournament/`FightRecord` render (the one
  slice that needs a new read from the parallel branch).
- **Slice 6 — Dashboard Overview tab.** Compose `DashboardMembership` + belt-journey + onboarding checklist.
- **Slice 7 — Dashboard tier-gated tabs.** Mount Students / Invites / My School / Content / Billing into the
  existing tab shell behind the `has(feature)` + entitlement gates.

## 6. Guardrails (do not regress)

- **Brand-neutral primitives.** No BBL hardcoding in shared components; belt color is `Rank.colorHex`
  ([`BBL-SOT-Spec.md`](BBL-SOT-Spec.md) §2.4, ADR 0022). The new `BjjPassportCard` proves this — its tint is
  the passed `colorHex` via `BeltSwatch` + a `--rank-color` CSS variable, with the brand `primary` token as the
  rankless fallback.
- **Presentation-only public components never fetch** and never render private fields (the `ProfileHero`
  contract, CCI §0) — they take already-projected display values, so they cannot leak a `HIDDEN` profile.
- **Person-rooted identity** ([`SOT-ADR.md`](SOT-ADR.md) D1): every surface reads through the `Passport` and
  its satellites; an approved claim propagates automatically. Don't re-introduce `userId`-rooted reads.
- **Reads belong to the parallel branch.** This epic adds only presentation files; it does not touch the
  database, media/R2, the BBL import scripts, `lib/media.ts`, or the directory queries.

## 7. Open questions

- **Tournament / FightRecord surface (Slice 5):** `FightRecord` is a person satellite (SOT-ADR D1 amendment)
  with no public render yet — needs a read-model + card contract decision with the parallel branch.
- **Passport card share target:** PNG export vs. `QrShareButton` deep-link vs. OG image — decide when wiring
  Slice 1 (reuse the `QrShareButton` PNG-canvas path from CCI §0 first).
- **Dashboard tier matrix:** which of the 8 tabs are Free vs Premium/Elite/Legend — confirm against the BBL
  entitlement tiers before Slice 7.
