---
title: "SESSION 0515 — AdminCollection conformance lane + launch-for-Brian gate plan"
slug: session-0515
type: session--implement
status: closed
created: 2026-07-08
updated: 2026-07-08
last_agent: claude-session-0515
sprint: S-launch
pairs_with:

  - docs/sprints/SESSION_0514.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0515 — AdminCollection conformance lane + launch-for-Brian gate plan

## Date

2026-07-08

## Operator

Brian + claude-session-0515

## Goal

Get `blackbeltlegacy.com` launch-SOLID for the FI-001 first tester (Brian Truelson). LEAD with the
CONFORMANCE lane (WL-P2-34 AdminCollection conformance + WL-P2-35 People Passport-keyed editor) — it
de-sprawls the admin onto ONE surface (the 500-session north star) AND hardens the exact tools used to
onboard Brian (People editor, claims, org, leads). Then plan/sequence the remaining launch-gate lanes
for operator sign-off (build in later sessions). Petey plans + grills the open forks; Cody builds; Doug
verifies; 3-pass gauntlet on the diff. The Brian email is HELD until the full gate is green and the
operator says "send."

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0514.md`
- Carryover: SESSION_0512/0514 merged WL-P2-36 (#196) + item-5 Stage 1 (#195) + durable email claim
  links (#197). The 3-pass gauntlet (fallow-fix-loop + Doug bug-hunt + hostile-close) is the pre-merge
  bar. This session executes the conformance lane the Next-session block pinned.

### Branch and worktree

- Branch: `main` (fresh worktree to be created off `origin/main` per standing rules)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `63f90db3`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin data-table kit (`components/data-table/*`), theming (via /app surfaces), Prisma (read queries) |
| Extension or replacement | Extension: `AdminCollection` wraps the existing `components/data-table/*` L1 kit + the `/app/tools` pattern; conform hand-rolled `*-table.tsx` wrappers onto it |
| Why justified | ADR 0045 D1/D5 — one admin-surface frame, conform incrementally; behavior-preserving |
| Risk if bypassed | Continued admin sprawl (~21 hand-rolled kit pages + non-kit stragglers) — the exact drift the operator's north star kills |

Live docs checked during planning: ADR 0045, ADR 0025 (Passport SoT), admin-collection-one-surface-law memory.

### Graphify check

- Graph status: current (canonical checkout). Discovery this bow-in used direct route inventory
  (`find app/app -name '*-table.tsx'`) since the surface set is a known, enumerable directory list.
- Files selected: `components/admin/admin-collection.tsx` (the frame), `app/app/users/_components/people-table.tsx`
  (the sole existing consumer / exemplar), the 21 hand-rolled `*-table.tsx` wrappers, the non-kit
  stragglers (`/app/media`, `/app/organizations`, `/app/claims`, `/app/leads-pipeline`).

### Grill outcome

Open forks surfaced for operator sign-off before Cody builds — see `## Petey plan → Open decisions`.

## Petey plan

### Goal

Execute the AdminCollection conformance lane (a coherent batch) + the People Passport-keyed editor, and
produce the sequenced launch-for-Brian gate plan for operator sign-off.

### Tasks

#### SESSION_0515_TASK_01 — WL-P2-34 AdminCollection conformance (onboarding stragglers)

- **Agent:** Cody → Doug → 3-pass gauntlet
- **What:** Migrate the three genuine hand-rolled stragglers — `/app/claims`, `/app/organizations`,
  `/app/media` (rebuild its gallery) — onto the `AdminCollection` frame (columns + query; row→detail).
- **Batch correction (bow-in discovery):** `/app/leads-pipeline` was in the operator's initial pick but is
  a deliberate **kanban** on the shared `AdminKanban` ui-kit kernel — already kernel-conformant; converting
  it to a table would regress the CRM board and duplicate `/app/leads`' table view. **Swapped OUT**; `/app/media`
  (a real hand-rolled gallery straggler, named in ADR 0045 D5) swapped IN. → candidate drift note for bow-out:
  ADR 0045 D5 lists leads-pipeline as a conformance target; it should be reclassified (kanban kernel ≠ table).
- **Done means:** Each page renders via `AdminCollection<TData>` (no hand-rolled list/grid/gallery);
  behavior-preserving (same rows, filters, actions, row→detail); affected admin e2e green.
- **Depends on:** nothing.

#### SESSION_0515_TASK_02 — WL-P2-35 People Passport-keyed editor

- **Agent:** Cody → Doug → 3-pass gauntlet
- **What:** Re-key `/app/users/[id]` userId→passportId; reuse+generalize the canonical `PassportEditor`
  via a gated `updatePassportAsAdmin` (adminActionClient, `where passportId`) + an admin-only
  `AccountSection` (role/ban/grants, gated when `passport.userId == null`). Keep `/app/users` (defer
  `/app/people` rename); placeholder-Passport delete OUT of scope.
- **Done means:** `/app/users/[id]` edits through the one PassportEditor for accountless + account People;
  account-only actions gated; ADR 0045 D3 follow-up satisfied.
- **Depends on:** nothing (file-disjoint from TASK_01; run sequentially in one worktree).

#### SESSION_0515_TASK_03 — WL-P2-37 profile /me + /directory consolidation (TICKET-0502-A)

- **Agent:** Cody → Doug → 3-pass gauntlet
- **What:** Merge `/me` + `/directory/[slug]` onto ONE profile renderer + read model; delete dead
  `directoryProfilePreviewPayload`/`previewRankToPublicRank`; preserve tier-gated render (free basic vs
  premium rich per `canRenderProfile`/`canRenderRichMedia`).
- **Done means:** One renderer feeds both surfaces; paywall e2e proves identical tier-gated render;
  Brian's profile renders COMPLETE. **In-scope per operator (bow-in grill).**
- **Depends on:** TASK_02 (People editor surface settles first).

##### Pre-flight: ProfileRenderer + unified profile projection (TASK_03)

**Existing-component / read-model scan (both trees read in full before design):**
- `/me` renderer `MeProfile` (14 files) + read model `getOwnDirectoryProfile`→`projectOwnProfile`→`MyProfile`
  and `getOwnLineageProfile`→`LineageNodeProfile`. Sidebar cards: BjjPassportCard + Identity/Affiliations/Social.
  Body: About / BeltHistory (lazy `LineageRankHistoryTab`) / Gallery. Owner-only edit actions + `MeSectionEmpty`
  prompts + `MeProfileEmpty` whole-page fallback.
- `/directory/[slug]` renderer `DirectoryProfile` (15 files) + read model `loadDirectoryProfile`→`findProfileBySlug`
  →`projectDirectoryDetailProfile`→`DirectoryDetailProfile`. Sidebar: BjjPassportCard (`ProfilePassportCard`).
  Body: Cover / About / Video / Ranks / Ancestry / Organizations / Social / mobile PassportSection / Upgrade.
  Placeholder branch → `ProfileClaimTeaser` (preserved verbatim). Hero: trust/claim/tier/media-lock badges +
  Save/QR actions.
- **Both share** `ListingDetail` chrome + `BjjPassportCard`; the section CONCEPTS overlap but the two read-model
  SHAPES diverge (owner-editor fields vs public tier-gated fields), so this is a shared-shell + viewer-context
  consolidation, NOT a lowest-common-denominator merge.

**Composition decision — ONE renderer + ONE projection with a viewer context:**
- New `server/web/directory/profile-view.ts` — `loadProfileViewForOwner(userId)` and
  `loadProfileViewBySlug(slug)` both return one `ProfileView = { model: UnifiedProfileModel, viewerContext }`,
  where `viewerContext = { isOwner: boolean, renderPolicy: LineageProfileDetailRenderPolicy }`. Reuses the
  existing `projectOwnProfile` / `projectDirectoryDetailProfile` payloads + `loadDirectoryProfile` derivations
  UNCHANGED under the hood — only the assembly is unified. Placeholder + claim-teaser path stays in the slug loader.
- New renderer `app/(web)/_components/profile-view/` — one `ProfileView` component taking `{ view }`, one copy
  each of the shared sections (about / hero-badges / hero-actions / sidebar / ranks / belt-history), branching on
  `viewerContext.isOwner`. Owner → edit affordances + gallery + identity/affiliations cards + section-empties.
  Public → tier-gated rich media (cover/video/social/location) behind `renderPolicy.canRenderRichMedia` +
  upgrade-section + trust badges. Both pages become thin loaders.

**Tier contract (unchanged, the hard net):** the 3 pinning tests stay byte-identical; `canRenderProfile`
(basic, all tiers) + `canRenderRichMedia` (premium+ / owner / admin) drive exactly the gates they drive today.
Owner (`/me`) = full render, tier-independent (the existing `canRenderRichMediaForViewer` "own profile" rule).

**FAILED_STEPS check:** Prisma-in-client (no `server-only`/Prisma into `"use client"` — sections stay server
components consuming props); `motion/react` reduced-fallback (untouched — ancestry story slice unchanged);
belt color `Rank.colorHex` via `BeltSwatch` (preserved); avatar `passport.avatarUrl ?? user.image` (preserved
via the existing projectors). Shared-DB contention → own dev server on :3100 if `Transaction API error`.

**Dev/verify:** `bunx tsc --noEmit`, `bun run lint`, `bun run format:check`, `npx next build`; 3 tier tests +
extended `e2e/directory/profile-paywall.spec.ts` (adds `/me` owner render). All from `apps/web/`.

#### SESSION_0515_TASK_04 — Launch-for-Brian gate plan (Petey, planning only)

- **Agent:** Petey (done — see `## Launch-for-Brian gate` below)
- **Done means:** Sequenced gate A–E + critical path + forks F1–F6 delivered for operator sign-off.

#### SESSION_0515_TASK_05 — Fix `/app/billing` 404 + stale admin links (bow-in bug)

- **Agent:** Cody (small) → Doug spot-check
- **What:** `app/app/billing/` has `layout.tsx` + `monitoring/page.tsx` but NO index `page.tsx` → `/app/billing`
  404s. Add `app/app/billing/page.tsx` (redirect to `/app/billing/monitoring`). Repoint the two stale
  `/admin/billing*` links left by the admin→app migration: `components/admin/sidebar.tsx:194`
  (`/admin/billing/monitoring` → `/app/billing/monitoring`) and `components/admin/command-palette.tsx:65`
  (`/admin/billing` → `/app/billing`).
- **Done means:** `/app/billing` resolves (no 404); no `/admin/billing` refs remain (grep clean); permission
  guard in `layout.tsx` still applies.
- **Depends on:** nothing (file-disjoint; sequence after TASK_01 in the one worktree).

#### SESSION_0515_TASK_06 — Composer durable-link conversion (#197 follow-up, slice of FI-004)

- **Agent:** Cody → Doug → gauntlet
- **What:** Convert the admin invite composer (`app/app/email/_components/bbl-invite-composer.tsx` +
  `server/admin/email/invite-actions.ts` `sendBblClaimInvite`) OFF the old `/lineage/join?node=` single-use
  pattern onto the durable-link pattern (PR #197): server-side `bindPendingClaim(email→node)` + a durable
  `/auth/login` claim-sign-in URL (`buildClaimSignInUrl`) so a composed onboarding email is scanner-safe and
  auto-claims on next sign-in — matching the Truelson script. This makes composer+script marryable (F5): run
  script `--backfill --grant`, then send custom copy via the composer with the durable URL. Generalizes
  beyond Brian (FI-003 students, future comps).
- **Done means:** the composer binds the claim server-side + sends the durable `/auth/login` URL; no
  single-use magic token in the composed email; a rehearsal send proves auto-claim on sign-in.
- **Depends on:** nothing (file-disjoint; sequence after the conformance tasks).

### Grill outcome (2 forks resolved)

1. **WL-P2-34 batch = onboarding stragglers → `/app/claims` + `/app/organizations` + `/app/media`**
   (leads-pipeline swapped OUT — it's a kanban on the shared `AdminKanban` kernel, not hand-rolled; see
   TASK_01 batch-correction note). Media swapped IN (real hand-rolled gallery straggler).
2. **WL-P2-37 IN scope** this session (operator pulled it in — profile is the funnel asset Brian lands on).
3. **F5 resolved (mid-session):** operator wants composer+script married → pull the **composer durable-link
   conversion** (TASK_06) INTO this session; full FI-004 (mobile/BBLApp) stays OUT of gate.
4. **Bow-in bug:** `/app/billing` 404 + stale admin links → TASK_05 (operator: fix this session).

### Open decisions

- Conformance execution is authorized this session; only push / PR merge / deploy / email-send are HELD
  for the operator's explicit "go".
- Gate-plan forks **F1–F6** (below) await operator sign-off — they gate LATER-session builds, NOT this
  session's conformance execution.

### Scope guard

- No push / PR merge / deploy / email-send without explicit operator "go".
- Behavior-preserving conformance only; no new capabilities bolted onto migrated tables.
- WL-P2-35: placeholder-Passport delete + `/app/people` rename OUT of scope.
- `../ronin-dojo-monorepo` READ-ONLY.

## Launch-for-Brian gate (TASK_04 — Petey, awaiting operator sign-off)

Gate = Brian's onboarding email does NOT send until every item is GREEN or explicitly waived. TASK_01–03
(conformance) assumed landing, not re-planned here. Ground truth: FI-001 is prod-verified green except the
operator "send" word; the Truelson thank-you script already uses the durable-link pattern
(`send-bbl-truelson-thankyou.ts:365`) — so Brian's send is NOT blocked on the #197 follow-ups.

### Critical path (now → "operator can say send")

1. **RISK #13** — rotate exposed prod Neon credential (hard prereq: no external user before rotation).
2. **WL-P2-37** — profile render complete (done in this session as TASK_03).
3. **FI-002 + #197 durable-link follow-ups** — lifecycle copy audit @ DRYRUN=0 (staged) + convert guest
   paid-checkout confirm email + admin invite composer onto the durable-link pattern.
4. **FI-001 rehearsal** — full loop green on a throwaway account (`--backfill`→`--send`→sign-in
   auto-claim→`--grant` lifetime Elite→2 entitlements + complete profile).
5. **Desi E sweep** — public surfaces clean (home, join/claim, directory, lineage, profile, checkout).
6. → operator says "send" → run `send-bbl-truelson-thankyou.ts` loop.

### Sequenced gate (by dependency)

- **D (security-first):** `RISK #13` rotate Neon cred (do first) · `RISK #7` PII/log-leak guardrail
  (launch-blocking, cheap) · `RISK #8` payment/access drift (manual spot-check acceptable) · `RISK #6`
  private-media boundary (deferrable-with-guardrail — not in Brian's flow) · `WL-P2-33` authz sign-off
  (sign-off in-gate; migration out).
- **A (Brian's data):** `WL-P2-21` verify canonical `rigan-machado-lineage` is Brian's sole published
  home on live prod (data already correct — clones removed 0508/0457; admin CRUD OUT of gate) ·
  `WL-P2-37` profile complete (this session).
- **C (email/signup):** `FI-002` copy audit @ DRYRUN=0 (staged) · `#197-followup` guest-checkout confirm
  → durable link · `#197-followup` admin invite composer → durable link · `FI-003` student sign-up +
  claim-approval · `FI-004` admin composer parity (possibly OUT — see F5).
- **B (onboarding):** `FI-001/G-001` rehearsal green end-to-end before any real send.
- **E (public QA):** Desi sweep — final gate before send.

### Forks awaiting operator sign-off (Petey recommendations)

- **F1 — RISK #13 blocker or parallel?** Rec: hard prereq for the SEND, not for build work — rotate early
  (cheap), build in parallel against prodsnap.
- **F2 — Which of #6/#7/#8 launch-blocking?** Rec: #7 blocking (cheap guardrail); #8 blocking-lite
  (documented manual spot-check ok); **#6 deferrable-with-guardrail** (not in Brian's flow) — *confirm defer*.
- **F3 — FI-002 DRYRUN=0 staged?** Rec: yes — dry-run copy render → flip to rehearsal address only → then
  real member traffic. Don't flip global live-send + Brian send in one step.
- **F4 — WL-P2-33 sign-off vs migration in-gate?** Rec: sign-off in-gate, staged migration OUT (char-tests
  hold the line; rushed pre-launch migration riskier than status quo).
- **F5 — FI-004 admin composer in-gate?** RESOLVED (operator): partially IN. Operator wants composer+script
  married → the **composer durable-link conversion is IN-gate** (TASK_06 this session); full FI-004
  (mobile admin, BBLApp port) stays OUT. Marriage path: script `--backfill --grant` binds+grants, composer
  sends custom copy with the durable `/auth/login` URL. The composer today defaults to the OLD
  `/lineage/join?node=` link + does not `bindPendingClaim` — TASK_06 fixes exactly that.
- **F6 — WL-P2-21 admin branch/subtree CRUD?** Rec: OUT — data already correct; gate item = *verify on live
  prod*, not *build the CRUD*.

### Explicitly OUT-of-gate

WL-P2-21 admin CRUD · WL-P2-33 staged migration · RISK #6 signed-URL architecture · RISK #8 nightly audit ·
FI-004 composer/mobile/BBLApp port · MB staging/multi-domain · long-tail P3 / RISK #9–12 · re-send "The Long
Road" to Bob (separate operator-gated outbound).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0515_TASK_01 | landed | WL-P2-34 conformance: /app/claims + /app/organizations + /app/media onto AdminCollection (`d71c3e3d`) |
| SESSION_0515_TASK_02 | landed | WL-P2-35 People Passport-keyed editor (`18d1349c`) |
| SESSION_0515_TASK_03 | landed | WL-P2-37 profile /me + /directory consolidation (`1fc3dc27`) |
| SESSION_0515_TASK_04 | landed | Launch-for-Brian gate plan (Petey) — F5 resolved; F1–F4/F6 await sign-off |
| SESSION_0515_TASK_05 | landed | Fix /app/billing 404 + stale /admin/billing links (`167a074a`) |
| SESSION_0515_TASK_06 | landed | Composer durable-link conversion (#197 follow-up / FI-004 slice) (`55d04a11`) |

All six landed in **PR #200** (squash-merged to `main` as `d0499bd3`) + the gauntlet fix (`a3cf6fca`) + pr-fix-loop nits (`1805635a`). Prod deploy READY, live smoke clean.

## What landed

- **WL-P2-34** (partial/incremental) — `/app/claims` + `/app/organizations` + `/app/media` migrated onto the `AdminCollection` frame (via the shared `runAdminListTransaction` paginator + threaded sort). `/app/leads-pipeline` STRUCK from the target list (kanban on the `AdminKanban` kernel → D-042). ~21 kit pages remain for the incremental sweep.
- **WL-P2-35** — `/app/users/[id]` re-keyed userId→passportId; one generalized `PassportEditor` (`adminPassportId?` prop + `updatePassportAsAdmin`) + gated `AccountSection`; accountless placeholders now editable.
- **WL-P2-37** — `/me` + `/directory/[slug]` on ONE renderer + ONE read model (`profile-view.ts`, `viewerContext` discriminated union); dead `directoryProfilePreviewPayload` deleted; byte-parity render.
- **TASK_05** — `/app/billing` 404 fixed (index redirect to `/app/billing/monitoring`).
- **TASK_06 (F5)** — BBL invite composer converted to the durable claim-link pattern (`bindPendingClaim` + `/auth/login`, node-picker, already-claimed guard) → composer+script marryable.
- **TASK_04** — the launch-for-Brian gate plan (A–E + critical path + forks F1–F6) delivered for operator sign-off; **F5 resolved** (composer durable-link in-gate).
- Follow-ups ledgered: WL-P2-38 (twin section-leaf trees), WL-P2-39 (claimable-node predicate), WL-P2-40 (admin-nav canonicalization), WL-P2-41 (deferred bot nits); drift D-042 (ADR 0045 D5 amend).

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` · `format:check` · `next build` | green (201/201 pages) |
| e2e `admin-collection-conformance` | 4 passed (claims/org/media + sort) |
| e2e `directory/profile-paywall` | 3 passed (free/premium/`/me` owner) |
| tier-policy tests (3 files) + `bind-pending-claim` | green, tier tests unchanged |
| fallow re-audit | duplication clone groups dropped; `profile-projection.ts` dead-exports cleared |
| CI on PR #200 (×2) | Oxc + tsc + unit + Playwright chromium/firefox/webkit + Vercel — all pass |
| Live prod smoke (`blackbeltlegacy.com`) | `/` `/directory` `/directory/brian-scott` → 200; `/app/billing` → 307→login (404 gone); `/me` → 307→login |

## Review log

### SESSION_0515_REVIEW_01 — 3-pass gauntlet + pr-fix-loop

- **Reviewed:** all 6 tasks (aggregate diff, +1767/−604).
- **Verdict:** SHIP. The two seams (one editor via `adminPassportId`, one renderer via `viewerContext`) are correct; migrations behavior-preserving; identity re-key authz non-bypassable; claim-binding no-magic-token + TOCTOU closed; funnel profile byte-parity.
- **Score:** 9.5/10.
- **Follow-up:** WL-P2-38/39/40/41 + D-042.

## Hostile close review

- **Giddy:** SOUND-WITH-NITS (nits fixed in `a3cf6fca`; twin section-leaves + claimable-predicate ledgered).
- **Doug:** SHIP (re-ran all gates; 3 LOW findings, 2 fixed, 1 ledgered).
- **Desi:** POLISHED (public funnel renders complete; media-thumbnail tradeoff mitigated).
- **Kaizen aggregate:** 9.5/10 — clean conformance lane, zero blockers, followed the 3-pass bar then a pr-fix-loop CI gate.

## ADR / ubiquitous-language check

- ADR update **required**: amend **ADR 0045 D5** to strike `/app/leads-pipeline` from the conformance-target list (D-042). Not done this session (docs-only follow-up).
- ADR 0025 (Passport SoT) + ADR 0045 D1/D3 **reinforced** (People re-key). No new domain terms.

## Reflections

- **Bow-in discovery paid off twice:** enumerating the actual surfaces before dispatch caught that `/app/leads-pipeline` is a kanban (not a table) and that `/app/billing`'s 404 was a missing index page, not the stale `/admin/*` prefix. Both would have been wrong turns if I'd taken the ADR/operator list literally.
- **The 3-pass gauntlet + a CI-bot pass is the right belt-and-suspenders for a launch merge** — the gauntlet caught structural nits (dead sort wire, hand-rolled paginator); the CI bots caught an edge-case 500 (unclamped pagination) + a test-user leak the gauntlet didn't. Different lenses, non-overlapping catches.
- **The 529 overload forced an inline-fix fallback:** subagent dispatch failed twice on API overload, so the pr-fix-loop nits were applied directly in the main loop. Worth remembering: when dispatch is down, small well-specified fixes can proceed inline.

## Next session

### Goal

Continue the launch-for-Brian gate (TASK_04 plan). The conformance lane is done + merged; the remaining critical path to "send Brian" is security + email + rehearsal.

### First task

**RISK #13 — rotate the exposed prod Neon DB credential** (the hard prerequisite before any external user touches prod). Then the F1–F6 forks await operator sign-off (F2 defer #6, F4 sign-off-only WL-P2-33, F6 WL-P2-21 verify-not-build). After rotation: FI-002 lifecycle copy audit (staged DRYRUN=0), the #197 durable-link follow-ups (guest checkout + this session's composer already done), then the FI-001 rehearsal on a throwaway account, then the Desi public-surface sweep — then the operator says "send." The Brian email stays HELD until the full gate is green.
