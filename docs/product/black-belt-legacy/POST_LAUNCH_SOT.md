---
title: "Post-Launch SOT — Black Belt Legacy"
slug: post-launch-sot
type: sot
status: active
created: 2026-06-20
updated: 2026-07-10
last_agent: claude-session-0520
pairs_with:
  - docs/knowledge/wiki/files/feature-request-dialog.md
  - docs/petey-plan-0419-post-launch-sweep.md
  - docs/sprints/SESSION_0509.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - post-launch
  - sot
  - running-list
---

# Post-Launch SOT — Black Belt Legacy

**The single light running list now BBL is live.** What's live, what's next (P0/P1/P2), and
what's come in. This **supersedes** the day-old `feature-intake-ledger.md` — one list, not two.

- **P0** — breaks or blocks live users (fix now).
- **P1** — important, schedule soon.
- **P2** — nice-to-have / polish.

> Detailed task breakdowns for in-flight items live in their petey-plan
> (e.g. [`petey-plan-0419-post-launch-sweep`](../../petey-plan-0419-post-launch-sweep.md)).
> This SOT is the index + status, not the spec.

## Status convention (the yaml pointer)

Each shipped feature gets a **file-spec** under `docs/knowledge/wiki/files/` carrying a
`lifecycle:` frontmatter field — **the single source of truth for feature status**:

```yaml
lifecycle: planned | building | MVP_LIVE | ga | dropped
```

- `MVP_LIVE` = shipped to production at MVP quality (the launch bar).
- `ga` = hardened / general-availability. `dropped` = decided against.

Aggregate "what's live" in one command — the SOT just *links* to the specs, so status is
never duplicated:

```bash
grep -rl '^lifecycle: MVP_LIVE' docs/knowledge/wiki/files/
```

## Now live (MVP_LIVE)

| Feature | Spec | Shipped |
| --- | --- | --- |
| Feature-request widget (DojoBots) | [feature-request-dialog](../../knowledge/wiki/files/feature-request-dialog.md) | SESSION_0422 |
| Public `/changelog` (What's New) | — | SESSION_0422 |
| Premium `/about` page | — | SESSION_0422 |
| RBAC capability grants | — | SESSION_0509 |

## Running list (P0 / P1 / P2)

Inbound requests land as `Report`(Feedback) via the widget (see the spec) — triage them into
this table. IDs are monotonic `FI-NNN` (carried over from the retired intake ledger).

| ID | Item | Type | Pri | Status | Source / notes |
| --- | --- | --- | --- | --- | --- |
| FI-001 | Brian Truelson first-tester onboarding + lifetime comp + thank-you email | feature | P0 | in-progress — **unblocked** | petey-plan-0457 — A1 prod clone cleanup done + test-send re-confirmed 0457 (Resend `8fe8b411…`, from `welcome@blackbeltlegacy.com`). **N1/N2 (G-004) SHIPPED SESSION_0500 → the onboarding-polish gate is CLEARED.** Only the operator "send Brian now" remains. **Readiness RE-VERIFIED green vs LIVE prod (SESSION_0507):** email renders (`--dry-run`), node unclaimed + claimable, `--verify` claim+comp sim CLAIMS (rolled back, 2 entitlements), Resend keyed 2/2. Send seq = `--backfill`→`--send`→(sign-in)→`--grant`. **Lifetime Elite requires the `--grant` step** — auto-claim gives 1yr (Brian not Dirty Dozen). **PRE-SEND GATE RE-EXPANDED (SESSION_0520, operator grill):** the "only operator go remains" line above is stale — the send is held behind the first-tester profile-readiness lane. **4 of 5 blockers CLEARED SESSION_0520 (#202, live on prod):** FI-025 ✅ · FI-026 ✅ · FI-022 ✅ · FI-023 ✅ (verified already-rendering). **Remaining: FI-024 (profile design pass) → then the operator's explicit "send Brian now".** Parked visual expansion → G-008. |
| FI-002 | Lifecycle-email copy audit (all `LifecycleEmailKind`, now `DRYRUN=0`) | bug | P1 | triaged | SESSION_0419 follow-up |
| FI-003 | Student sign-up under instructor/school + claim-approval flow | feature | P1 | triaged | petey-plan-0419 |
| FI-004 | Admin email-composer parity + port BBLApp BBLEmail + mobile admin | feature | P1 | triaged | petey-plan-0419 |
| FI-005 | UI polish: rank-badge overlap · EmailCapture theme default · FormLabel wrap | polish | P2 | **resolved (SESSION_0506)** | Stale row — all 3 already shipped: rank-badge wraps in `ProfileHero` (render-verified @390px on `/directory/bob-bass`); EmailCapture `prefers-color-scheme` default + FormLabel `min-w-0 break-words` both landed SESSION_0420. Crossed off. |
| FI-006 | Claim→award rank lifecycle: registration/claim rank picker → pending claim (`rankId` on claim record) → admin-verify creates `RankAward`; deprecate `LineageTreeMember.selectedRankAward` FK | feature | P1 | resolved (SESSION_0500 — verified already-done) | ADR 0035 / SESSION_0430. Both halves confirmed shipped on `main`: rank picker + `currentRankId`/`claimedRankId` on the claim record (SESSION_0441); **`selectedRankAward` FK removed in SESSION_0475** (schema:2931 comment only remains). The "remaining FK deprecation" line was stale. No work needed. |
| FI-007 | Directory-profile form: Cover Photo Url + Video intro show **"Invalid URL" on empty fields** (validation bug); assess cover-photo + avatar wiring correctness end-to-end; update the forms | bug | P1 | resolved (SESSION_0434) | Validation fixed (#159); wiring audited — avatar round-trips; cover/video were stored + in the read model but **never rendered** (logged WL-P2-14/15). SESSION_0434 wired the render: `coverPhotoUrl` → `ProfileHero` background + new `ProfileCoverBanner` (claimed `ListingDetail` path); `videoIntroUrl` → new `VideoIntroSection` (YouTube/Vimeo embed). Browser-verified (dev-login as admin owner → `/directory/brian-scott`). Orig screenshot `_assets/SESSION_0430-directory-profile-form-invalid-url.png`. |
| FI-008 | Reconcile `seed-baseline-lineage.ts` with the SESSION_0430 SQL corrections (Bill Hosken/Jerry Smith/Rikki/ranks/merges) so the seed stops being a latent regression (D-030); then it can carry the full Hélio Gracie node + Rorion link | bug | P1 | resolved (#161) | SESSION_0433 — seed reconciled; D-030 resolved; seed-run verified on prodsnap (no regression; independently re-verified SESSION_0434 — throwaway prodsnap copy, before/after byte-identical) |
| FI-009 | Re-derive the technique-graph + BJJ-curriculum feature fresh on current main (do NOT rebase the conflicting WIP). Reference: closed PR #157 / branch `codex/technique-graph-curriculum` + its 2 data JSONs (`prisma/data/bbl-bjj-{curriculum,graph}.json`) + `import-bbl-bjj-curriculum.ts`. De-threads getRequestBrand (gone); needs html2canvas dep | feature | P2 | resolved (SESSION_0435) — LIVE on prod | **Already built + merged on `main` before this lane** — the re-derive landed via `0be7eacc` (port) + `e2cdeb9c`/#154 (getRequestBrand de-thread, pages use `Brand.BBL`); `main` is byte-identical to the ref branch; html2canvas + nav/seo/footer/header/brand-features all present. SESSION_0435 = browser-verified both pages render with real data (no console errors); made graph node cards opaque (`bg-card`) so connector lines no longer bleed through; ran the idempotent `import-bbl-bjj-curriculum.ts` against **prod Neon** (all-creates: +1 org, 5 courses, 80 items, 61 techniques, 75 prereqs, 81 links; before-state confirmed 0 BJJ rows). Live: `blackbeltlegacy.com/curriculum` + `/techniques/graph` both 200 with content (countdown off). |

| FI-010 | **Claim-funnel mobile break (live-user report — Mikayla Huffman):** (a) profile photo staged during the claim wizard is **lost** after the magic-link email round-trip (guest upload doesn't persist/re-bind on verify); (b) the invite email promises "Create your password — takes about 60 seconds" but **no password-creation step appears** after click-through. The flagship claim loop drops its own funnel steps | bug | P0 | resolved (SESSION_0492) — photo persists to `Lead.meta.avatarUrl`; false password copy removed (magic-link + Google, no password); auto-rebind-on-verify deferred (follow-up) | SESSION_0491 operator QA (5 screenshots, prod, iOS). Repro: run `/lineage/claim` from the invite email on mobile. Likely seams: guest-upload staging vs `claimNodeForUser` reconciliation; magic-link callback never routes to a set-password step |
| FI-011 | **Email wrapper visual defects:** the BBL logo renders "LEGACY" white-on-white (dark-background logo asset on white email body) and both CTAs ("View My Profile" / "Claim your profile") render grey/washed-out like disabled buttons | bug | P1 | resolved (SESSION_0492) — 14 templates → `BblEmailWrapper` (BBL logo/red CTA), `button.tsx` deleted, TuffBuffs left neutral; render-verified | SESSION_0491 operator QA screenshots (claim-invite + claim-approved emails). Fix the email layout wrapper once — all lifecycle emails inherit |
| FI-012 | **Internal jargon leaked into member-facing email copy:** claim-approved email pastes an internal tier-spec table ("Premium+: full card (avatar/school/bio)…", "Elite/Legend inherit Premium (Elite = comp-gift tier)") into the member email | bug | P1 | resolved (SESSION_0492) — `tier:"elite"` dropped from claim-approved; `LIFECYCLE_FEATURES` rewritten to member-benefit copy + single-sourced | SESSION_0491 operator QA. Fold into the FI-002 lifecycle-copy audit — this is its worst concrete instance |
| FI-013 | **Mobile lineage layout overlap:** the Ancestors/Progeny filter dropdowns float over the root member card, obscuring the root's name/rank at phone width | bug | P1 | resolved (SESSION_0492, `session-0492-prodqa`) | DepthStepper moved from `absolute` overlay → in-flow bar above tree on mobile (`sm:absolute` desktop). **Lead live-DOM confirmed** at mobile width: root card legible, controls in-flow. |
| FI-014 | **Brand-leak: BBL signup received a "Welcome to Baseline Martial Arts" email** (live-user report — Jay Farrell, free join-legacy signup) — sent *from* `welcome@baselinemartialarts.com` with broken logo + no BBL wrapper | bug | P0 | resolved (SESSION_0492, `session-0492-prodqa`) | Root cause = brandless `sendEmail` defaulted to `env.RESEND_SENDER_EMAIL` (Baseline). Fixed: brandless resolves `Brand.BBL` across all sender paths (`lib/email.ts`); `.env.example` flipped; lead-welcome passes BBL. Read-only prod query confirmed Jay = `NEW` Lead, free signup, no org attach → code fix fully covers. Email-audit (Desi) mapped the whole catalog. |
| FI-015 | **Vestigial Baseline link:** "Advertise on Black Belt Legacy" fallback origin pointed at baselinemartialarts.com | bug | P2 | resolved (SESSION_0492, `session-0492-prodqa`) | `public-actions.ts` fallback origin → blackbeltlegacy.com; link-pass swept email/funnel CTAs, zero member-facing Baseline links remain |
| FI-016 | **Community feed + ancestry timeline P2/P3 polish batch** (post-SHIP backlog from Desi review + Doug P3s, SESSION_0493): mobile style-filter hidden (`max-sm:hidden`) + no mobile sticky filter bar; hero post-count not filter-aware; create-dialog hints (YouTube/Vimeo-only, title max-length counter); hide native-share item when `navigator.share` unsupported; timeline red-name dark-contrast check; ancestor deep-link seam unconsumed (→ WL-P2-23); community image origin-guard allows any bucket path (scope to `community-posts/` prefix); YouTube id charset validation; ancestry walk loop lacks a direct DB test; `bjj-passport-card` avatar `ring-(--rank-color)` invisible for #000 ranks on dark; `bbl-reveal.tsx` ships SSR-hidden (`initial opacity:0` + whileInView) | polish | P2 | open | Bundle into the community-feed phase-2 (votes) session or a dedicated polish lane |
| FI-017 | **Claim-finalize strands the surviving profile:** on cross-passport claim approve, `claim-finalize.ts:601-607` deletes the claimant's signup Passport (its DirectoryProfile cascades — a TASK_05-seeded country dies with it) and the placeholder's profile survives as-is — so a SESSION_0496 admin-upserted HIDDEN slug-less stub leaves the new owner directory-invisible until they self-heal in the passport editor | gap | P2 | open (SESSION_0496 Doug/Giddy finding — pre-existing since Phase 3c; SESSION_0496 *improves* it: editable HIDDEN row vs no-row editor-throw) | Scope: finalize normalizes the surviving profile on attach (visibility → MEMBERS_ONLY + slug mint) AND carries over `locationCountry` (+ future profile fields) from the deleted signup profile when the survivor lacks them. Touches the claim core (the moat) — own reviewed slice, not a rider |
| FI-018 | **StudentsCarousel bake-off resolution:** V1 (default, frozen) vs V2 player-card rail (`?cards=v2`, SESSION_0496) — operator picks the winner; the loser is deleted (time-boxed duplication); if V2 promotes to default it gains its own E2E smoke at the promotion boundary (the 0495 lesson) | decision | P2 | open | Compare live at `/lineage/rigan-machado-lineage?cards=v2`. Promotion lane = default flip + E2E smoke + V1 deletion (incl. WL-P3-26's V1 width trap) + ubiquitous-language entry |
| FI-025 | **Admin "Update User" does not persist** — clicking Update on the `/app` admin user surface saves nothing (or reverts on nav) | bug | P0 (pre-send gate) | **resolved (SESSION_0520, #202)** — TWO layered bugs: the button was INERT (Base UI `Button` defaults `type="button"`, no onClick — clicking did literally nothing) AND `updateUser`/`updateUserRole` only revalidated the list path (dynamic `[id]` page re-rendered stale). Both fixed + browser round-trip proven; sweep found 13 more forms with the same inert-button class (incl. the feedback widget — mouse-unsubmittable) → all fixed; kernel guard ledgered WL-P2-44 | FI-001 blocker — CLEARED |
| FI-026 | **Belt editing locked to White Belt 4-stripes** — operator can edit that one belt's date/promoter/school but cannot edit or add any other belt | bug | P0 (pre-send gate) | **resolved (SESSION_0520, #202)** — root cause: the 0518 read-cutover made the editability ceiling RankEntry-sourced, so any award lacking a synced entry collapsed the ceiling. Durable fix: read ceiling re-sourced from RankAward via the write gate's exact helper pair (parity by construction) + orphan-entry regression test (31/31). Browser-verified all belts to Black-1st editable. Prod probed read-only: 63/63 parity, 0 orphans (backfill had healed data; 0519's writer-sync deployed with #202 seals the write side) | FI-001 blocker — CLEARED |
| FI-022 | **Certificates page is inert** — `/app/certificates` surface exists but "does nothing" | bug | P1 (pre-send gate) | **resolved (SESSION_0520, #202)** — the one dead wire was `issueCertificate`: implemented but NO UI ever called it (+ empty list = looks inert). Issue-certificate dialog built (walk-in idiom, User-id-space picker verified); issue+revoke revalidation layout-typed + race-fixed; browser-verified template → issue → public verify "✓ Valid Certificate". **Still unbuilt (by scope decision, NOT bugs):** rendered/printable PDF certificate + `CertificateOrder` physical-order/fulfillment UI — new FI row them if wanted | FI-001 blocker — CLEARED |
| FI-023 | **Scrollytelling vertical timeline not on the profile page** (the USP; Tony Hua's favorite) | feature | P0 (pre-send gate) | **resolved-as-verified-present (SESSION_0520)** — it ALREADY renders on `/directory/[slug]` AND `/me` (`LineageStorySequence` via `AncestrySection` — the docstring literally says "the hand-coded BBLApp design Tony Hua asked for twice"); screenshot-verified. Two timelines exist: cohort "Cinematic explorer" = the `/lineage/[treeSlug]` default view; ancestry scrollytelling = the profile one. Remaining ask (prominence on profile + an explorer "timeline" view toggle) folded into **FI-024** + G-008 | FI-001 blocker — CLEARED (design polish → FI-024) |
| FI-024 | **Profile design-consistency pass** (following session): profile page aligned with ronin-dojo-monorepo BBLApp (parts parity); **edit = one inline-in-place surface** — button toggles edit on the profile page itself (user or admin) by porting the existing `LineageProfileDrawer` inline-edit pattern; **retire the separate profile edit pages** (one-surface law); finish killing URL photo fields → the one uploader family; belt cards readable/show-what's-filled; timeline scrollytelling design pass | design | P1 (pre-send gate) | open (SESSION_0520 operator) | FI-001 blocker; Desi audit first |
| FI-019 | **RBAC capability grant/toggle admin surface** (operator, SESSION_0498): an `/app` surface where admins grant/revoke individual `can()` permission keys (e.g. `beta.view`) to specific users — so non-admin testers (Tony-grade) can be admitted to gated areas without the full admin role. Extends authz system #1 (flat roles/`can()`); repo has 4 authz systems — this is a UI over #1, NOT a 5th system. Depends on a per-user permission-override store (today permissions flow from `role` only). | feature | P2 | MVP_LIVE (SESSION_0509) | Shipped the narrowest viable People-detail toggle surface: `UserPermissionGrant`, audited soft-revoke grant/revoke actions, session-loaded `extraGrants` for `can()`, allowlisted `beta.view` + `media.upload`, and legacy `S3_UPLOAD` bridge. Follow-up: accountless People appear after the `/app/users` Passport-backed collection conformance lane. |
| FI-020 | **2-axis lineage explorer — PINNED idea (operator, SESSION_0499):** generation-deck interaction — each ancestor card carries a horizontal StudentsCarousel of their students at that belt-rank grouping (browse the breadth), vertical scroll-snaps descend the generations, cards overlay iTunes-cover-flow-style, the person's NAME rotates vertical and lands as the card's left-edge spine. **Operator ruled: NOT for the directory vertical timeline — candidate for the lineage tree canvas board surface, later.** The timeline stays the single authored story spine. Fragments that DO stay on the timeline lane (A3 bucket): name-dedup (renders ~3× per card) + a more substantial H→V element than the tiny marker (e.g. the name-spine treatment standalone). | idea | P3 | pinned | Revisit at the next lineage-canvas design lane; pairs with FI-018 (StudentsCarousel winner) + WL-P2-23 (ancestor deep-links) |

| FI-021 | **Mobile entry point for `/app` admin CRUD sections** (SESSION_0500 Epic B follow-up): the always-on bottom nav made the `/app` console Sidebar `max-md:hidden`, so ~30 admin/staff CRUD sections lost their mobile entry point (reachable by URL, unlinked). Also prune the now-dead `BblMemberRail` `isMobile` branch. | gap | P2 | **resolved (SESSION_0501, `579253b8`)** — ONE `config/admin-sections.ts` (7 groups × 36 items, gates verbatim + icon-uniqueness test-asserted) drives the new server-filtered `/app/sections` grouped index, the regrouped desktop sidebar, an admin "Sections" NavSheet link, and the beta `/app/beta/command-deck`; `BblMemberRail` `isMobile` branch pruned. Doug SHIP 9.6 (36/36 gates independently diffed; mobile-shell e2e 3/3 live). | Follow-on forks: admin belt-edit mount → `/app/users/[id]` belts tab (operator-ratified, next lane); Command Deck promote-or-delete decision after operator plays with it. |

<!-- Append new rows above. Resolve in place: Status → MVP_LIVE (+ link the file-spec) or declined (+ reason). -->

## Inbox (raw, untriaged)

Feature requests submitted through the widget are stored as `Report` rows of type `Feedback`
(no separate table). Read them (admin / DB), then promote real ones into the running list
above with an `FI-NNN` id. Until triaged they live only as Feedback reports — this line is the
pointer so they're not lost.
