---
title: "SESSION 0496 — Epic A opener: StudentsCarousel V2 (A0.5, migration-free)"
slug: session-0496
type: session--implement
status: closed
created: 2026-07-03
updated: 2026-07-03
last_agent: claude-session-0496
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0495.md
  - docs/petey-plan-0494-experience-epics.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0496 — Epic A opener: StudentsCarousel V2 (A0.5, migration-free)

## Date

2026-07-03

## Operator

Brian + claude-session-0496

## Goal

Open **Epic A (the Lineage Journey)** with slice **A0.5 — StudentsCarousel V2**: an additive bake-off
variant of `students-carousel.tsx` with BBLApp gesture/behavior/feature parity (bigger "baseball-card"
player cards: avatar + full name + `BeltSwatch` + country flag + school logo + verified badge, NO premium;
real embla swiper; inline mini-preview; `motion/react` `layoutId` grow-into-drawer, reduced-motion =
instant swap). Run the operating loop (Desi→Cody→Giddy 3-pass, ≥9.5 gate, Doug at end) **plus** the
Playwright E2E gate (0495 lesson). **Migration-free** — proven at plan time. Hold at the push gate.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0495.md` (Epic C — feed + component-library hardening; shipped
  + CI-caught `ResultsCount` regression fixed post-push).
- Carryover: 0495's `Next session` block points here — open Epic A, first slice A0.5. Memory
  `epic-a05-students-carousel-v2-scope` (scope-lock) + `operating-loop-needs-e2e-for-ui-contracts` (E2E gate)
  read at bow-in.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (canonical checkout — node_modules present, no bootstrap)
- Status at bow-in: clean except untracked `prod-live-dirty-dozen.jpeg` (known 0494 stray; left out)
- Current HEAD at bow-in: `e6048280`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming (card/carousel primitives), Auth/profile (passport editor country field) |
| Extension or replacement | Extension: additive bake-off carousel variant + one read-model field (`logoUrl`) + swap a raw country TextField for the existing `CountrySelect` combobox — no new capability, no schema change |
| Why justified | Produces the reusable player-card + embla swiper + `layoutId` morph that Epic A scenes + the post-A featured-blog carousel both consume; delivers the operator's "baseball-card" opener |
| Risk if bypassed | Epic A's scrollytelling scenes would each reinvent the card/swiper/morph primitive |

Live docs checked during planning: not re-fetched (reuse of existing embla `Carousel`, `BeltSwatch`,
`CountrySelect`, `countryFlagEmoji`, and the existing lineage drawer — no new L1 capability).

### Graphify check

- Graph status: current; stats at bow-in: 16209 nodes, 31961 edges, 2169 communities, 2448 files tracked.
- Queries used: lineage students carousel payloads / `LineageTreeMemberRow` / country flag / BeltSwatch.
- Files selected + verified by direct read: `server/web/lineage/payloads.ts`,
  `components/web/lineage/students-carousel.tsx`, `components/common/carousel.tsx`,
  `components/common/belt-swatch.tsx`, `components/web/belt/country-select.tsx`, `lib/countries.ts`,
  `components/web/passport/passport-editor.tsx`; BBLApp parity source `StudentsCarousel.jsx` (monorepo).

### Grill outcome

3 forks resolved with the operator before build:

1. **Sequencing → A0.5 first, migration-free.** Petey proved A0.5 does NOT need the `LineageStoryScene`
   table or any migration: `isVerified` + `locationCountry` + school `name` are already on
   `LineageTreeMemberRow` (via `lineagePassportPayload`); only school `logoUrl` needs adding to the row
   payload's org select (one additive line, not a migration). A0 (LineageStoryScene) + A2 scrollytelling
   move to the next lane. (Deviates from the literal "A0 first" bow-in instruction — operator ratified the
   deviation given the proof.)
2. **Flag source → `directoryProfile.locationCountry`** (ISO-2, already in payload) rendered via the
   existing `countryFlagEmoji()`. Zero schema change. Operator KISS refinement: don't derive — **let the
   member pick** their flag via a `ComboboxSelector` with flags + names ("like Google"). That combobox
   already exists (`CountrySelect`, renders `🇧🇷 Brazil`, stores alpha-2) and is used elsewhere; the
   passport editor still uses a raw 2-letter `TextField` for `locationCountry` → swap it for `CountrySelect`.
3. **Model experiment:** orchestrate + build on Fable-5 (operator: "you are already on Fable"); dispatch the
   operating-loop roles (Desi/Cody/Giddy/Doug) as sub-agents.

## Petey plan

### Goal

Ship A0.5 StudentsCarousel V2 (migration-free, behind a toggle) through the operating loop to ≥9.5 + the
E2E gate; hold at the push gate.

### Tasks

#### SESSION_0496_TASK_01 — Read-model: project `school.logoUrl` onto the tree row

- **Agent:** Cody (fable)
- **What:** Add `logoUrl: true` to the org select(s) in `lineageNodeRowPayload` (`server/web/lineage/payloads.ts`)
  so `LineageTreeMemberRow` carries the current school logo. `isVerified` / `locationCountry` / school `name`
  are already selected — no other read-model change; NO migration.
- **Done means:** `LineageTreeMemberRow` type exposes school `logoUrl`; existing payload consumers unaffected; tsc green.
- **Depends on:** nothing.

#### SESSION_0496_TASK_02 — StudentsCarousel V2 (player card + embla swiper + grow-into-drawer)

- **Agent:** Cody (fable)
- **What:** New additive variant (existing `students-carousel.tsx` untouched) rendering "baseball-card"
  player cards through the embla `Carousel`/`CarouselSlide` primitive: avatar + full name + `BeltSwatch`
  (awarded-truth `memberTopRank`, ADR 0035) + country flag (`countryFlagEmoji(locationCountry)`) + school
  logo + verified badge (NO premium). Tap → inline mini-preview → `motion/react` `layoutId` grow-into-drawer
  (reduced-motion → today's instant swap, SSR-safe). Wired behind a toggle in the drawer/island consumer.
- **Done means:** V2 renders live behind a toggle; gesture/behavior parity with BBLApp (minus chrome);
  reduced-motion fallback verified; gates green; existing carousel byte-identical.
- **Depends on:** TASK_01.

#### SESSION_0496_TASK_03 — Country picker (`CountrySelect`) on both member-facing surfaces

Operator ask: the country flags-combobox on (a) the **dashboard profile edit** surface and (b) the
**registration/join** flow. Grounding found the two differ sharply in cost — split accordingly, both
migration-free:

- **TASK_03a — Dashboard profile edit (LIVE flag, clean).** In `passport-editor.tsx` (rendered by
  `app/(web)/dashboard/profile-tab.tsx`), replace the raw `locationCountry` 2-letter `TextField` with the
  existing `CountrySelect` combobox (flags + names, stores alpha-2). Writes directly to
  `directoryProfile.locationCountry` → **this is what makes the flag render on the player card.** Pure reuse.
- **TASK_03b — Join/registration wizard (INTAKE, no migration).** Add a `CountrySelect` field to
  `join-legacy-wizard/identity-step.tsx` + a `country` (alpha-2) key in the wizard `schema.ts` + `STEP_FIELDS`.
  The wizard is **guest lead-intake for steward review** — its `location` field already rides an unstructured
  `notes` blob (`server/web/lead/public-actions.ts`), and neither `Lead` nor the claim carries a structured
  country column. So the picked country joins the same review-intake path (steward / the member's own
  profile-edit sets the live flag). **It is intake, not a live profile write** — capturing "pick at signup →
  flag shows" end-to-end would need a structured country column on the intake chain + materialization
  (a migration), which is deferred to the A0 data-path lane (logged as a follow-up, NOT this session).
- **Done means:** 03a — member sets country via the flags combobox in profile edit → `locationCountry` →
  flag on card. 03b — the join wizard shows the flags combobox; the value is captured into the lead intake
  for review. Gates green; no migration.
- **Depends on:** nothing (03a parallel-safe with TASK_01; sequential-inline with TASK_02).

#### SESSION_0496_TASK_05 — Signup vertical: country materializes onto the profile (operator-added mid-session)

- **Agent:** Cody (fable), pass 2
- **What:** Close the loop from "pick a flag at signup" → "flag renders on the player card," end-to-end.
  Operator asked for "migration + materialization" — grounding proved **NO migration is needed**:
  `Lead.meta` is JSON (country rides as `meta.country`, like `location`/`avatarUrl` already do) and
  `DirectoryProfile.locationCountry` already exists.
  1. `createJoinLegacyInterest` (`server/web/lead/public-actions.ts`): persist the wizard's `country`
     (alpha-2) into `lead.meta.country` (in addition to the 03b notes-blob line for stewards).
  2. **Guest path (the magic-link signup):** in `ensureIdentityShell` (`lib/auth.ts:40`) — the seam that
     creates the Passport + DirectoryProfile stubs on sign-up/magic-link — look up the newest
     `source: "join-the-legacy"` Lead by the account's email (lowercased), validate `meta.country` against
     `COUNTRIES` (never write arbitrary JSON into the Char(2) column), and seed `locationCountry` on the
     newly created DirectoryProfile stub. Creation-time only (the early-return for existing passports
     already guarantees no clobber); never throw — seeding failure must not break auth (mirror the
     `reconcilePendingLineageClaims` swallow pattern).
  3. **Signed-in path:** a signed-in wizard submitter already has a DirectoryProfile — in the action, set
     `locationCountry` directly **iff currently null** (never overwrite an existing member choice).
- **Done means:** wizard country → `lead.meta.country`; fresh magic-link signup lands with the flag already
  on their profile/player card; signed-in submit fills a null country; existing non-null values untouched;
  unit coverage on the seed helper (valid code, bogus code, no lead, existing country); gates green; NO migration.
- **Depends on:** TASK_03b (the wizard field), pass-1 landing.

#### SESSION_0496_TASK_06 — Admin backfill surface: country on the lineage node-profile edit form (operator-added mid-session)

- **Agent:** Cody (fable), pass 2
- **What:** Put the `CountrySelect` on the **admin person-edit CRUD** so the operator can backfill member
  countries himself via UI (Andre Lima/Renato Magno → 🇧🇷, John Will → 🇦🇺, …) and dogfood the admin edit
  UX. The admin surface for lineage people (mostly accountless placeholder Passports) is
  `/lineage/[treeSlug]/edit/[nodeId]` → `lineage-node-profile-form.tsx` (today: displayName/bio/avatar/
  promotionDate only).
  1. `node-profile-schemas.ts`: add nullable `locationCountry` (validated alpha-2 against `COUNTRIES`).
  2. `node-profile-actions.ts`: inside the existing tx, `tx.directoryProfile.upsert({ where: { passportId },
     create: { passportId, locationCountry }, update: { locationCountry } })` — upsert because
     `createLineageMember` never creates a DirectoryProfile for placeholders. ⚠ Review edge (Giddy/Doug):
     the upsert-created stub (slug null, visibility default MEMBERS_ONLY) must NOT accidentally surface the
     placeholder in directory listings — verify the directory query filters.
  3. `lineage-node-profile-form.tsx`: add the `CountrySelect` field; prefill from the current value
     (extend the node-profile query select).
- **Done means:** admin edits any lineage member → picks a country → flag renders on their player card;
  placeholder (no prior DirectoryProfile) works via upsert; no directory-visibility side-effect; gates green;
  NO migration.
- **Depends on:** pass-1 landing (03a/03b establish the CountrySelect form idiom).

**Doctrine ruling (operator WWAD grill, mid-session):** do NOT mount the whole member `PassportEditor` on the
admin surface (session-bound self-edit god-form — the banned `kind`-union shape). The correct reuse altitude
is the **shared field kit**: both forms already compose `components/common/fields.tsx`; the gap is a shared
**`CountryField`** added to that kit ONCE (wrapping `CountrySelect` in the same rhf idiom as
`TextField`/`AvatarField`), composed by all three surfaces (member editor · wizard · admin form). Relayed to
Cody mid-pass-1. **UX bar (Desi pass-2 criterion):** the admin node-profile edit surface must feel
"Google-easy" — Material/Reddit-class friction (instant searchable combobox, clear labels, obvious save,
no dead ends) — expressed entirely in OUR tokens, not Material's visual language.

#### SESSION_0496_TASK_04 — Operating loop + E2E gate close

- **Agent:** Desi (fable) rubric each pass → Giddy (fable) architecture each pass; loop to ≥9.5 (max 3 passes);
  Doug (fable) final verify + affected Playwright `e2e/lineage/*` specs run locally before SHIP.
- **Done means:** aggregate ≥9.5 or 3 passes spent; E2E green locally; Doug launch-safe verdict; report state.
- **Depends on:** TASK_01, TASK_02, TASK_03.

### Parallelism

Single coherent lane — sequential inline Cody (TASK_01 → TASK_02, with TASK_03 folded in). A2 scrollytelling
fan-out is NOT this session (deferred to the A0 lane). Review agents (Desi/Giddy/Doug) dispatched as
sub-agents on Fable; Giddy + Desi can re-score the same diff in parallel per pass.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0496_TASK_01 | Cody (fable) | one additive payload line |
| SESSION_0496_TASK_02 | Cody (fable) | the core build — reuse-first (embla/BeltSwatch/drawer/motion) |
| SESSION_0496_TASK_03 | Cody (fable) | KISS reuse of existing `CountrySelect` |
| SESSION_0496_TASK_04 | Desi/Giddy/Doug (fable) | the operating loop + E2E gate |

### Open decisions

- None blocking — forks resolved at bow-in.

### Risks

- `layoutId` shared-element morph is the one non-trivial motion piece: must be SSR-safe + reduced-motion
  fallback (mandatory guard). E2E gate catches any lineage-drawer contract break (0495 lesson).

### Scope guard

- Do NOT touch the existing `students-carousel.tsx` (additive variant only).
- Do NOT restructure the drawer's internal content tabs — the morph lands in the EXISTING drawer, unchanged.
- Do NOT port BBLApp's search/filter/Expand-All chrome or its `getStudentsByInstructor` client fetch
  (server-loaded props).
- No `LineageStoryScene` / A0 / A2 work this session. No migration.
- No push/merge/deploy — hold at the gate for the operator.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0496_TASK_01 | landed (pass 1) | `logoUrl` on BOTH `lineageNodeRowPayload` org selects + new `memberSchool(node)` one-org resolver (`canvas-model.ts`) |
| SESSION_0496_TASK_02 | landed (pass 1) | `students-carousel-v2.tsx` — player cards + embla + TRUE `layoutId` shared-element morph (proven live, 23/25 frames); V1 default regression guarantee verified |
| SESSION_0496_TASK_03 | landed (pass 1) | Shared `CountryField` (`web/belt/country-field.tsx`, layering-correct home) on passport editor (03a) + join wizard (03b → notes + lead meta); latent `""`-rejects-save schema bug fixed |
| SESSION_0496_TASK_05 | pending | Signup vertical: `meta.country` → `ensureIdentityShell` seed → flag on card (pass 2; NO migration — proven) |
| SESSION_0496_TASK_06 | pending | Admin backfill: CountrySelect on lineage node-profile edit form + directoryProfile upsert (pass 2) |
| SESSION_0496_TASK_04 | landed | Operating loop closed: pass 2 ACCEPT (Giddy 9.6 · Desi 9.5) → Doug SHIP 9.6; E2E gate run at every pass |

### Operating-loop record

| Pass | Cody build | Giddy (architecture) | Desi (rubric) | Gate |
| --- | --- | --- | --- | --- |
| 0 | — | — | current `students-carousel.tsx` **8.8** (D7 7.5: bare `overflow-x-auto` not the L1 Carousel; first-name-only labels) + P1/P2/P3 build checklist + fixed ≥9.5 acceptance bar | baseline |
| 1 | 2 new + 14 changed files; tsc 0 · test 1045/0 · next build pass · **e2e/lineage 12/12 chromium** · format clean; TRUE shared-element morph proven live; V1-default verified; 6 risks flagged to reviewers | **9.1** (no caps; gap = test-pinning + a11y forward; both pass-2 designs pre-approved w/ HIDDEN-visibility hard req) | **8.5** (V2 8.2: **P1 width defect** — rail max-content 930px in 526px drawer, embla never engages, cards >3 unreachable, preview X off-screen; 03a 8.9 · 03b 9.0 · CountryField 9.3; morph live-feel: ACCEPT) | under 9.5 → pass 2 |
| 2 | P1 width FIXED + live-proven (drag engaged, 5/5 Coral + 17 Unranked reachable, mobile sheet holds); close-X 44px; combobox a11y ids forwarded (heals ALL form comboboxes); accent contrast = **BrandSettings DB drift** → ratified seed re-run (⚠ PROD has same stale row); Giddy P1/P2 test-pinning (+20 tests); TASK_05 seeding (`lead-country.ts`, creation-only, never-throw, `Lead@@index([email])` exists) + TASK_06 admin country (upsert CREATE pins `visibility: HIDDEN`, 6/6 tests); claim-finalize survival finding documented. tsc 0 · **1059/0** · build pass · **e2e 12/12** · format clean · prisma empty | **9.6** (fix list executed; TASK_05 funnel finish-line finding → carry-over scoped into the finalize card; always-upsert deviation recorded benign; 4 follow-up cards) | **9.5** (V2 9.5 · 03a 9.5 · 03b 9.5 · CountryField 9.6 · TASK_06 9.4; all 8 acceptance-bar items PASS; "Google-easy" bar REACHED; 3 LOWs deferred) | **≥9.5 ACCEPT — no pass 3** |

Pass-2 notable: accent root cause = local prodsnap `BrandSettings.accentColor` drifted from the checked-in
seed (`scripts/seed-brand-settings.ts` ratifies null) — **data-layer fix, zero CSS/code change; prod needs the
same seed run at ship time (operator authorization)**. Claim-finalize finding: on approve the claimant's
signup Passport (+profile) is DELETED and the placeholder's survives — a TASK_06 HIDDEN stub therefore
survives claim, leaving the claimant directory-invisible until self-heal; TASK_06 *improves* the pre-existing
gap (editable row vs no row + editor throw) but finalize should normalize visibility+slug on attach →
follow-up card candidate.

Pass-1 notable: `CountryField` homed at `components/web/belt/` NOT `common/fields.tsx` (avoids common→web
layering inversion — Giddy to ratify). Latent bug fixed in passing: `updateDirectoryProfileSchema.locationCountry`
`.length(2).optional()` rejected `""` → wedged every no-country profile save; now `""`→null (server-contract
change riding a UI task — flagged for explicit review).

Desi pass-0 key rulings: keep the belt-group Accordion, swap only the inner row for the L1 embla Carousel
(one card per slide, NOT BBLApp's 2×2 grid); `logoUrl` must come from BOTH org selects or the card can show
a mismatched school name/logo pair (`memberSchoolLabel` is affiliation-first); `layoutId` morph = highest
technical risk → spike first, approved fallback = scale/fade grow; V1 touched ONLY by an `export` keyword on
`groupByBelt`; do NOT change the hide-at-0-students consumer gate (0495 ResultsCount contract lesson).

## What landed

**Epic A opener A0.5 — StudentsCarousel V2 + the country vertical, through the operating loop
(pass 0 → pass 1 → pass 2 ACCEPT at Giddy 9.6 · Desi 9.5; Doug SHIP 9.6). Migration-free as proven at
plan time. Model experiment: Opus planned (bow-in grounding), Fable built + reviewed.**

- **StudentsCarousel V2** (`students-carousel-v2.tsx`): additive bake-off variant behind `?cards=v2`
  (V1 default; V1's only diff = an `export` on `groupByBelt`). "Baseball-card" player cards — dominant
  avatar + verified corner check + full name (2-line) + `BeltSwatch flat-bar` awarded-truth rank +
  flag/school-logo/school meta row (null slots omit cleanly) — through the L1 embla `Carousel`, kept inside
  V1's belt-group Accordion. Tap → ring + inline mini-preview → **true `layoutId` shared-element morph**
  into the drawer header (proven live: 23/25 animating frames, cross-mount in one `LayoutGroup`);
  reduced-motion drops the morph (instant swap); Escape closes only the preview + restores focus; touch
  guard keeps rail swipes from dismissing the mobile sheet.
- **Read-model**: `logoUrl` on BOTH `lineageNodeRowPayload` org selects + new one-org `memberSchool(node)`
  resolver (`canvas-model.ts`) so a card can never show a mismatched school name/logo pair;
  `memberSchoolLabel` is now a thin view over it.
- **The country vertical (4 surfaces, ONE shared field, zero migrations):** new `CountryField`
  (`web/belt/country-field.tsx`, layering-correct home) wrapping the existing `CountrySelect` —
  (1) member self-edit `passport-editor.tsx` (03a); (2) join-wizard step 2 → steward notes + `lead.meta.country`
  (03b); (3) **signup seeding** — `lead-country.ts` + `ensureIdentityShell` seed `locationCountry` at
  Passport-stub creation, creation-only + never-throw, proven at runtime with zero emails (TASK_05);
  (4) **admin backfill** — the lineage node-profile edit form, `directoryProfile.upsert` with CREATE pinning
  `visibility: HIDDEN` (leak-proof for placeholder stubs) (TASK_06).
- **Platform heals riding the lane:** `ComboboxSelector` now forwards FormControl's `id`/`aria-describedby`/
  `aria-invalid` → every form combobox's label binds (not just country); latent
  `updateDirectoryProfileSchema.locationCountry` wedge fixed (`""` rejected the whole profile save → now
  clears); accent-contrast root-caused to **BrandSettings DB drift** from the ratified seed → local reseed
  (data-layer, zero code) — **prod still carries the stale row (ship-time seed run, operator-gated)**.
- **+34 tests** (schema contract, one-org invariant, lead-country narrowing, HIDDEN-pin upsert) →
  1059 pass / 0 fail.

## Decisions resolved

- **A0.5 first, migration-free** — operator ratified deviating from the literal "A0 first" bow-in order once
  Petey proved no A0.5 field needs the `LineageStoryScene` table.
- **Flag source = `locationCountry`** (member-picked via `CountrySelect`, not derived) — operator KISS ruling.
- **Signup vertical now, not deferred** (operator mid-session) — landed as TASK_05 with no migration.
- **Admin backfill surface** = the lineage node-profile edit form (operator mid-session; WWAD grill ruled
  field-kit reuse over mounting the member `PassportEditor` as an admin god-form).
- **Bake-off structure** — V1 stays a frozen usable deliverable; V2 compares via `?cards=v2`; loser deleted
  at operator pick (time-boxed); V2 promotion to default = the moment it gets its own E2E smoke.
- **Toggle is a URL param, not a settings UI** (comparison audience = the operator).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/students-carousel-v2.tsx` | NEW — V2 player-card rail (embla + morph + preview) |
| `apps/web/components/web/belt/country-field.tsx` | NEW — shared RHF `CountryField` (wraps `CountrySelect`) |
| `apps/web/server/web/lead/lead-country.ts` (+`.test.ts`) | NEW — `findJoinLegacyLeadCountry` seeding seam (never-throw) |
| `apps/web/server/web/lineage/payloads.ts` | `logoUrl` on both row-payload org selects (additive) |
| `apps/web/lib/lineage/canvas-model.ts` (+test) | `memberSchool` one-org resolver; label delegates; +3 tests |
| `apps/web/components/web/lineage/students-carousel.tsx` | V1: `export` on `groupByBelt` ONLY |
| `apps/web/components/web/lineage/lineage-profile-drawer/{index,drawer-header,info-tab,drawer-types}.tsx` | variant threading + `LayoutGroup`/morph target (additive; null → pre-0496 markup) |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | `?cards=v2` resolve (effect, SSR-safe, V1 default) |
| `apps/web/components/web/passport/passport-editor.tsx` | 03a: raw country TextField → `CountryField` |
| `apps/web/server/web/passport/schemas.ts` (+test) | locationCountry `""`→null + regex/uppercase; +6 tests (wedge fix) |
| `apps/web/app/(web)/lineage/join/join-legacy-wizard/{schema,identity-step,use-join-wizard}` | 03b: optional `country` field |
| `apps/web/server/web/lead/public-actions.ts` | country → notes line + `lead.meta`; `normalizeCountryCode` allowlist |
| `apps/web/lib/auth.ts` | TASK_05: email lookup hoisted; creation-only country seed in `ensureIdentityShell` |
| `apps/web/server/web/lineage/node-profile-{schemas,queries,actions}.ts` (+test) | TASK_06: country field + HIDDEN-pinned upsert; 6/6 tests |
| `apps/web/app/(web)/lineage/[treeSlug]/edit/[nodeId]/_components/lineage-node-profile-form.tsx` | TASK_06 admin `CountryField`, prefilled |
| `apps/web/components/common/combobox-selector.tsx` · `components/web/belt/country-select.tsx` | a11y: forward FormControl `id`/aria props |
| `docs/knowledge/wiki/custom-component-inventory.md` | rows: `StudentsCarouselV2`, `CountryField`; V1 export note |
| `docs/sprints/SESSION_0496.md` | this record |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx tsc --noEmit` (Doug re-run) | PASS — 0 errors |
| `bun run test` (`--parallel=1`, Doug re-run) | PASS — **1059 / 0**, 2989 expects, 160 files |
| `npx next build` (gate runner + Doug, post-UAT) | PASS — exit 0 |
| `bun run format:check` | PASS — 1767 files incl. the 4 untracked new files (0495 gap closed) |
| `bunx playwright test e2e/lineage --project=chromium` | **12/12** (pass-1, pass-2, Doug — 3 independent green runs) |
| Affected-spec sweep (auth/registration, directory m-card, smoke) | 6/6 (1 load-flake disambiguated: 5s-timeout spec line, isolated re-run PASS — not a regression; P3 filed) |
| Live UAT: authenticated `/app/profile` country save | PASS — set→save→reload→persist; clear→persist (real browser session) |
| Live UAT: TASK_05 signup seeding | PASS — magic-link verify → `locationCountry: "BR"` seeded; 2nd sign-in no re-seed (creation-only); **zero emails**; test rows cleaned (0 residue) |
| Live UAT: V2/V1 bake-off toggle | PASS — `?cards=v2` cards + drill-down; no param → V1; 0 page errors |
| Failure-mode attacks (hostile lead.meta · HIDDEN bypass · clear-vs-skip · placeholder memberSchool) | ALL HELD (Doug) |
| Migration / schema | NONE — `git diff --stat apps/web/prisma/` empty; no migrate commands in diff |
| Operating loop | pass 0 (8.8 baseline) → pass 1 (Giddy 9.1 · Desi 8.5) → pass 2 **Giddy 9.6 · Desi 9.5 ACCEPT** → Doug **SHIP 9.6** |
| fallow introduced-findings delta | 0 (gate runner) |

## Open decisions / blockers

- **Push + prod seed: operator GO given in-session, both EXECUTED at close** — push `67b246e2` → main;
  prod BrandSettings seeded + post-run read verified (BBL + WEKAF ratified rows, null accents). **Factual
  correction found at execution:** the pre-seed prod read showed `BrandSettings` EMPTY — prod never carried
  the gold (it ran on the clean styles.css fallback); the stale rows were local-only pre-ratification
  leftovers. TD-003 ✅ done · D-038 RESOLVED with corrected mechanism (both ledgers amended).
- **Bake-off decision pending (operator):** V1 vs V2 — compare at `/lineage/rigan-machado-lineage?cards=v2`;
  loser deleted, V2-promotion adds its E2E smoke (FI-018 scopes this).
- Deferred (ledgered, none blocking): FI-017 finalize normalization + country carry-over · WL-P3-24/25/26
  (CreatableCombobox a11y, LOW bundle, V1 width trap — dies with the bake-off).

## Next session

### Goal

**Epic A continues: A0 story data model** — `LineageStoryScene` table (hand-authored migration +
`migrate diff` shadow-replay; NEVER migrate dev), ancestry projection + conditional-bridge select, founder
seed (Carlos Sr/Jr/Rorion/Rigan + Bob) — then **A2 v1 scroll scaffold** (motion/react `useScroll`).
Single lane during the migration. Standing alternative if the operator repoints: board P0 FI-001
(Brian Truelson onboarding).

### First task

Petey: confirm the A0 grill forks from `petey-plan-0494` (§Forks 1–4: story-table shape rec'd
`LineageStoryScene` 1:1 by nodeId · storyboard CRUD depth · dirty-dozen roster/assets — is
`prod-live-dirty-dozen.jpeg` (repo root, still untracked) the roster? · Rorion/bridge quotes). Then Cody
pre-flight → hand-author the migration. If the operator instead picks the bake-off winner first, route V2
promotion (default flip + E2E smoke + V1 deletion) as the opener — it's a small clean lane (FI-018).

## Review log

### SESSION_0496_REVIEW_01 — A0.5 operating loop + Doug end-of-epic verify

- **Reviewed tasks:** SESSION_0496_TASK_01–06 (04 = the loop itself).
- **Method:** operating loop with real sub-agent dispatch — Desi pass-0 rubric baseline → Cody pass-1 build →
  Giddy ∥ Desi pass-1 review (8.5/9.1, P1 width defect found LIVE) → Cody pass-2 (fixes + TASK_05/06) →
  Giddy ∥ Desi pass-2 re-score (9.6/9.5 ACCEPT) → Doug end-of-epic (gates re-run, failure-mode attacks,
  live UAT incl. emails-free signup round-trip, E2E sweep). Reviewers + builder on Fable-5; Petey/orchestration
  grounding on Opus (the session's model experiment).
- **Dirstarter docs check:** cached docs sufficient — L1 primitives extended (Carousel/Accordion/fields),
  none replaced.
- **Verdict:** Accepted at pass 2; Doug SHIP with 0 blockers and 2 operator-gated ship-time actions (push,
  prod seed). The loop caught what single-lens review misses: Desi's live probe found the rail-width defect
  the builder's own screenshots hid; Giddy's directory-leak analysis turned a plausible default into a
  pinned HIDDEN constraint before the code existed.
- **Score:** 9.6/10.
- **Follow-up:** FI-017, FI-018, D-038, TD-003, WL-P3-24/25/26 (routed §6.7).

## Hostile close review

- **Giddy:** PASS — 9.6; fix list fully executed; blast radii verified (combobox change additive-optional;
  auth hot path creation-only); TASK_05 funnel finish-line finding scoped into FI-017 (carry-over, not just
  normalization); always-upsert deviation recorded benign.
- **Doug:** PASS — SHIP 9.6; all 5 gates independently reproduced; 18 E2E specs; every contracted attack held;
  UAT boundaries declared honestly (embla drag accepted from pass-2 evidence; own-card end-to-end proven as
  two halves).
- **Desi:** PASS — 9.5; all 8 acceptance-bar items flipped/held; "Google-easy" bar REACHED; 3 LOWs deferred.
- **Kaizen aggregate:** 9.6/10 — verified, launch-safe, held at the push gate.

## ADR / ubiquitous-language check

- **ADR update: not required.** No architectural decision made/changed/rejected — A0.5 composes existing
  ratified surfaces (ADR 0035 awarded-truth; ADR 0025 Passport identity; design-system doctrine ADR 0040).
  The HIDDEN-visibility upsert pin and the bake-off pattern are component/inventory-level, not ADR-level
  (Giddy concurred). ADR 0035 + 0040 confirmed still valid.
- **Ubiquitous language: updated terms staged** — *player card*, *bake-off variant*, *grow-into-drawer*
  entered code this session; inventory rows carry them. Full glossary entry deferred to the bake-off
  resolution (the surviving variant names the term).

## Reflections

- **The loop's two-reviewer redundancy paid twice.** Desi's live-browser probe caught a P1 (rail width) that
  the builder's own live verification missed — because Cody's probe tested *behavior at the elements he knew
  about* while Desi measured *layout invariants*. And Giddy's pre-review of a not-yet-built feature (the
  upsert) converted a schema default into a hard requirement before a line existed. Review-before-build on
  risky slices is cheaper than review-after.
- **Root-cause discipline turned a CSS bug into a data fix.** The accent-contrast finding looked like a
  token/CSS change; the actual defect was a DB row drifted from its checked-in seed. The fix has ZERO diff
  artifact — which is exactly why Doug's "cards or it evaporates" demand matters: a data-layer fix that
  isn't ledgered is a fix that un-happens at the next prodsnap.
- **The operator's mid-session adds stayed cheap because the grounding was front-loaded.** Signup seeding and
  the admin surface both landed same-session with no migration because the bow-in disjointness proof had
  already mapped the data paths. Petey-time proof converts scope creep into scope slotting.
- **Model experiment (Opus plans → Fable builds): clean outcome.** Fable's builder+reviewers executed a
  6-task lane with zero rework loops beyond the designed passes; the one build blind spot (width) was the
  loop's to catch, not the model's to prevent. Worth repeating; not yet worth a standing rule.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | PASS (gate runner: 10 rows ≥ 1) |
| JETTY/frontmatter sweep | `custom-component-inventory.md` bumped (updated: 2026-07-04, last_agent claude-session-0496); SESSION_0496 full frontmatter; no other doc touched |
| Backlinks/index sweep | wiki index += SESSION_0496 row; SESSION_0496 pairs_with SESSION_0495 + petey-plan-0494; ledger rows (D-038, TD-004, FI-010b/011, WL) reference SESSION_0496 |
| Wiki lint | gate runner: **0 err / 30 warn** (all pre-existing) |
| Format-fix (code) | gate runner fixed 24 code files; format:check clean 1767 incl. untracked new files |
| Build | gate runner + Doug: `next build` PASS (pre-push cost gate satisfied) |
| Kaizen reflection | yes — `## Reflections` (4) |
| Hostile close review | REQUIRED (app-code auth) — run: Giddy/Doug/Desi all PASS, aggregate 9.6 (see section above) |
| Code-quality gate (Class-A) | the operating loop IS the Class-A gate — pass-2 aggregate 9.6/9.5 vs `code-quality-matrix.md`, Doug 9.6, no hard caps |
| Runtime verification (Doug) | SHIP — gates reproduced; live UAT (dashboard save, signup seeding 0-email, bake-off toggle); attacks held; boundaries declared |
| Review & Recommend | Next session goal written (A0 data model; alternatives: bake-off pick FI-011, board P0 FI-001) |
| Memory sweep | `brand-color-sot-is-db` updated (prodsnap drift gotcha); new `a05-bakeoff-and-country-vertical` project memory + MEMORY.md rows |
| Ledger cross-off | none resolved this session (additive lane); NEW rows routed: D-038, TD-003, FI-017, FI-018, WL-P3-24/25/26 |
| Next session unblock check | unblocked — A0 grill forks are enumerated in petey-plan-0494; migration lane needs no operator input to start (push gate is separate) |
| Git hygiene | branch main; worktrees: only canonical; single commit at close; **pushed on operator GO** (in-session authorization); hash in bow-out chat; `prod-live-dirty-dozen.jpeg` deliberately left untracked (0494 stray, possible A0 asset) |
| Graphify update | gate runner (pre-commit): nodes=16224 edges=31939 communities=2195 |
</content>
</invoke>
