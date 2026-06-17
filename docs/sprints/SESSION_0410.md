---
title: "SESSION 0410 — Verify + polish the merged BBL profile pipeline (PRs #88/#89/#90) end-to-end on local"
slug: session-0410
type: session--implement
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0410
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0409.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0410 — Verify + polish the merged BBL profile pipeline (PRs #88/#89/#90) end-to-end on local

## Date

2026-06-17

## Operator

Brian + claude-session-0410

## Goal

Verify and polish the just-merged BBL profile pipeline END-TO-END on the real local app, with zero
dependency on the not-yet-exported Pods CPTs. PRs #88 (BJJ Passport card scaffold), #89 (`/me` page),
and #90 (Pods `currentResidence` migration + `enrich-bbl-members-pods.ts` importer +
`bbl-reconciled-full.sample.json` fixture) all merged to `main` but NONE are browser-verified or run
against a real DB. Prove the whole chain — data → schema → display — on the LOCAL dev DB only, fix
rendering/empty-state/layout bugs, and wire the BJJ Passport card onto the public profile/lineage
drawer (reusing the one card + `ListingDetail` shell + the one timeline). NEVER point `DATABASE_URL`
at prod, do not flip `BBL_COUNTDOWN`, send emails, or run anything against prod.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0409.md` (closed) — member photo migration + importer
  drift fixes (D-026/D-027) + staged the Pods full-fidelity lane (D-028, `BBL_PODS_FULL_IMPORT_SPEC.md`).
- Carryover: 0409's "Next session" block was *execute the full Pods import* (blocked on operator CSV
  exports). The operator's explicit GOAL for THIS session **overrides** that: verify the three already-
  merged scaffolding PRs (#88/#89/#90) locally against the committed synthetic fixture — no real Pods
  CPTs needed.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean; local `main` was **4 commits behind origin/main** (PRs #88/#89/#92/#90 were
  merged remotely but not pulled). Fast-forwarded `main` → `f8a5cda` (clean FF, 0 ahead).
- Current HEAD at bow-in: `f8a5cda`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Prisma** (apply the `currentResidence` migration to the local dev DB; read-model projection). **Identity (Passport)** — `/me` owner-self projection + the BJJ Passport card. No new primitive. |
| Extension or replacement | **Extension** — owner-self read seam + a presentational credential card + an enrichment importer over existing Passport/RankAward/Affiliation/MediaAttachment models. |
| Why justified | Three merged PRs are unverified; the pipeline must be proven on a real DB + live DOM before reveal, and the signature card needs wiring onto the public surface. |
| Risk if bypassed | A broken/empty `/me`, an unverified importer, or a card that only lives on `/me` ships unnoticed into the BBL reveal. |

Live docs checked during planning: Prisma (migrate dev local-only), Media/Storage (R2 case — not
touched this session). Identity canon (Passport = SoT, ADR 0025) confirmed against the projection seams.

### Drift logged

- **D-029 (new, low):** the enricher defaults `--tree-slug bbl-lineage`, but the **local** BBL tree is
  seeded as `rigan-machado-bjj-lineage` (prod uses `bbl-lineage`). Local runs must pass `--tree-slug`
  or seed a `bbl-lineage` tree. Not a prod defect — a local-seed/prod-slug divergence. Confirm + log at
  bow-out.

### Grill outcome

Bow-in grounding (read-only local DB inspection) surfaced one structural fork — see **Open decisions**.

## Petey plan

### Goal

Prove the merged BBL profile pipeline (importer → schema → `/me` + public card/timeline) works on the
local dev DB and live DOM, fix any rendering/empty-state/layout bugs, and wire the BJJ Passport card
onto the public profile + lineage drawer reuse-first.

### Tasks

#### SESSION_0410_TASK_01 — fallow BEFORE (baseline capture)

- **Agent:** Doug
- **What:** `npx fallow health` + `npx fallow dupes` to capture the pre-change complexity baseline.
- **Done means:** baseline numbers recorded in this file for the bow-out diff (operator gate).
- **Depends on:** nothing.

#### SESSION_0410_TASK_02 — Apply the local `currentResidence` migration

- **Agent:** Cody
- **What:** `cd apps/web && npx prisma migrate dev` against the LOCAL dev DB (`ronindojo_dev`) — applies
  `20260617183436_add_passport_current_residence` (confirmed unapplied at bow-in).
- **Done means:** `Passport.currentResidence` column exists locally; Prisma client regenerated.
- **Depends on:** nothing.

#### SESSION_0410_TASK_03 — Exercise the enrichment importer against the committed fixture (LOCAL)

- **Agent:** Cody
- **What:** Seed a minimal `bbl-lineage` tree + accountless `Jane Doe`/`John Will` placeholder Passports
  (the fixture's MATCH subjects; John Will is Jane's in-roster promoter), then run
  `enrich-bbl-members-pods.ts --dry-run --input scripts/fixtures/bbl-reconciled-full.sample.json` →
  review, then a real run into the LOCAL DB. Confirm: long-form date parse ("July 8th, 2009"), in-roster
  promoter → `awardedByPassportId`, off-roster (Rickson Gracie) → null+notes flag, per-belt RankAwards
  (`awardedAt` + `organizationId`), galleries → MediaAttachment, Ghost McMissing → UNMATCHED. Re-run
  dry-run → idempotency 0.
- **Done means:** importer output matches the README's captured dry-run; RankAwards with provenance exist
  in the local DB; idempotent re-run reports 0 creates.
- **Depends on:** TASK_02.

#### SESSION_0410_TASK_04 — Browser-verify `/me` on the live DOM + fix bugs

- **Agent:** Cody builds fixes; Doug verifies; Desi design-reviews.
- **What:** `npx next dev --turbo` (FS-0002), dev-login, browser-verify (Playwright/Chrome MCP) that
  `/me` renders the BJJ Passport card + the promotion timeline ("Promoted by X · date · at Y") +
  bio/socials/schools, and degrades gracefully where sparse. Fix rendering/empty-state/layout bugs;
  prove fixes on the live DOM first (SESSION_0337 lesson).
- **Done means:** `/me` verified rich + graceful on the live DOM; screenshots captured; bugs fixed.
- **Depends on:** TASK_02, TASK_03, and the Open-decision resolution (rich-data sourcing for `/me`).

#### SESSION_0410_TASK_05 — Wire the BJJ Passport card onto the PUBLIC profile + lineage drawer

- **Agent:** Cody builds; Desi reviews; Doug verifies.
- **What:** Mount `BjjPassportCard` on `/directory/[slug]` (via `ListingDetail`) and the lineage drawer,
  fed by the existing public projection (avatar/ranks/lineage path/school). REUSE the card + the one
  detail shell + the one timeline (`LineageRankHistoryTab`); do NOT build a new card/detail/timeline
  (ADR 0028/0029). Brand-neutral (belt color = `Rank.colorHex`); presentation-only (no private fields).
- **Done means:** public profile + drawer render the card from the projection on the live DOM; no leak
  of HIDDEN/private fields; gates pass.
- **Depends on:** TASK_03 (rich public subject), TASK_04.

#### SESSION_0410_TASK_06 — fallow AFTER + gates

- **Agent:** Doug
- **What:** `npx fallow audit` on touched files (diff vs TASK_01); run gates typecheck / oxlint / oxfmt /
  wiki:lint; scoped tests only (SKIP full `bun test` — live-Resend sender-rep risk).
- **Done means:** complexity not regressed; all gates green; evidence table filled.
- **Depends on:** TASK_04, TASK_05.

### Parallelism

TASK_01 (fallow) runs alongside TASK_02 (migration). TASK_03 gates the data for TASK_04/05. TASK_04 and
TASK_05 are sequential-ish (shared profile-render understanding) but touch disjoint files (`/me` page vs
directory/drawer) — TASK_05 can start once the card render is proven in TASK_04. Single coherent changes
inline; no worktrees needed.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0410_TASK_01 | Doug | baseline capture |
| SESSION_0410_TASK_02 | Cody | local migration |
| SESSION_0410_TASK_03 | Cody | seed + importer run |
| SESSION_0410_TASK_04 | Cody/Doug/Desi | build fixes + verify + design review |
| SESSION_0410_TASK_05 | Cody/Desi/Doug | wire card + review + verify |
| SESSION_0410_TASK_06 | Doug | fallow diff + gates |

### Open decisions

- **Rich-data sourcing for the local `/me` verification (the one fork).** `/me` renders only the
  signed-in user's own Passport, but `enrich-bbl-members-pods.ts` only touches **accountless** placeholder
  Passports (matched by displayName in the tree). Those sets are disjoint — the dev-login user
  (`Sensei Demo`) will not receive the imported provenance. Resolution options (asked at bow-in):
  - **(A) Repoint dev-login onto an enriched placeholder** — after enriching Jane Doe (TASK_03), attach a
    throwaway local user to her Passport and point `DEV_LOGIN_USER_ID` at it, so `/me` renders her REAL
    importer output. Most faithful; local-only; reverts by restoring the env var.
  - **(B) Hand-seed `Sensei Demo`** — add synthetic provenance RankAwards + affiliations + socials onto
    the existing dev-login Passport. No env change; faster; timeline data is synthetic, not importer-made.
  - **(C) Split verification** — verify `/me` graceful degradation on Sensei's existing partial data, and
    the full rich card+timeline on Jane Doe's PUBLIC profile/drawer (TASK_05). No identity mutation.

### Risks

- Local-DB seed mutations (TASK_03 + the Open-decision resolution) — keep them local-only and reversible;
  show any seed/codemod before running (operator script-caution memory).
- `BBL_COUNTDOWN=1` is set locally — the enricher's real-write gate is satisfied; this is the intended
  local pre-launch state, NOT the prod flip.

### Scope guard

- LOCAL dev DB only — NEVER point `DATABASE_URL` at prod. No `BBL_COUNTDOWN` flip. No emails. No Stripe.
- No real Pods CPT import (the exports aren't ready) — only the committed synthetic fixture.
- SKIP full `bun test` (live Resend → BBL sender-rep); scoped tests only.
- Reuse the one card / `ListingDetail` / one timeline — do NOT build a new card/detail/timeline (ADR 0028/0029).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0410_TASK_01 | landed | fallow BEFORE baseline: maintainability **90.0**, 544/8193 above threshold; dupes 19.2%. JSON saved for diff. |
| SESSION_0410_TASK_02 | landed | `currentResidence` migration applied LOCAL via `migrate deploy` (no-drift; preserves seed). Column verified. |
| SESSION_0410_TASK_03 | landed | Seeded isolated `bbl-lineage` tree + accountless Jane/John (quarantined proof data); ran `enrich-bbl-members-pods.ts` against the committed fixture into local DB. Proved long-form date parse ("July 8th, 2009"→`2009-07-08`), in-roster promoter→`awardedByPassportId` (John Will), off-roster→null+notes, per-belt RankAwards (`awardedAt`+org+location), galleries→MediaAttachment, Ghost→UNMATCHED; idempotent re-run = 0 creates. |
| SESSION_0410_TASK_04 | landed | Browser-verified `/me` on live DOM (Jane claimed = account attached to placeholder). Fixed **2 real bugs**: (1) `currentResidence` never surfaced → projection `locationLine` falls back to it + payload selects it; (2) Rank-History showed the school twice → importer sets `location` only when no org resolved. Re-verified live. |
| SESSION_0410_TASK_05 | landed | Wired `BjjPassportCard` onto the PUBLIC `/directory/[slug]` (verified live on sensei-demo: "BJJ Passport"+belt+avatar). Added `colorHex` to the shared rank payload. Drawer card wired then **removed** (redundant with header) per operator grill decision. |
| SESSION_0410_TASK_06 | landed | fallow AFTER: maintainability **89.9** (held), **0 introduced findings**, `enrich` file flat 25.7→25.7. Gates: tsc **0**, oxlint clean, oxfmt fixed (2 files). Scoped projection test 4/4. Full `bun test` SKIPPED (Resend). |
| SESSION_0410_TASK_07 | landed | **Grill → mutual understanding** on the drawer redesign + launch recipe (folder module · `Organization.logoUrl` · brand-token sweep · Poppins type-token-now/image-hero-later · lazy · 3-tabs-only). Wrote the canonical playbook [`component-launch-sweep-recipe.md`](../runbooks/component-launch-sweep-recipe.md) the parallel cloud sweeps replay. |
| SESSION_0410_TASK_08 | landed | DrawerIdentityHeader refactor: extracted RankBar/Avatar/Badges/Actions sub-components → **CRAP 272 → 42**; added data-driven `BeltSwatch` belt-bar inline with the rank (monorepo heading inspiration, brand-neutral). |
| SESSION_0410_TASK_09 | landed | **Drawer decomposed into a colocated folder module** `lineage-profile-drawer/` (index orchestrator + header + 3 tab modules + `use-drawer-profile` hook + types); `next/dynamic` lazy Lineage+Rank-History panels; `Organization.logoUrl` (local migration) + null-safe school badge in InfoTab. Old 856-line file deleted; consumers unchanged (barrel re-export). Verified live (page 200, header+Info render, 0 console errors). |
| SESSION_0410_TASK_10 | landed | **Wired drawer tab switching in View-A island** (workflow `wc3q11qua`): added `drawerTab` state + `activeTab`/`onTabChange` (mirrors the board's proven pattern; island never had it). Verified live: Lineage tab switches + lazy panel loads. |

## What landed

- **The merged BBL profile pipeline (PRs #88/#89/#90) is verified end-to-end on the local DB + live DOM** — the
  original goal. Local `main` was 4 commits behind origin; fast-forwarded to `f8a5cda` first. The enrichment
  importer was proven against the committed synthetic fixture into a quarantined `bbl-lineage` tree (date parse,
  promoter→Passport resolution, per-belt RankAwards with provenance, galleries, affiliations, unmatched handling,
  idempotency). `/me` renders the full rich pipeline (BJJ Passport card + provenance timeline + bio/socials/
  schools/residence) for a claimed placeholder, degrading gracefully where sparse.
- **2 real display bugs fixed** (found on the live DOM): the migrated `currentResidence` never surfaced on `/me`
  (projection + payload fix); the Rank-History timeline printed the school twice (importer `location`-vs-org fix).
- **The BJJ Passport card is wired onto the public `/directory/[slug]`** (Passport-rooted, brand-neutral, null-safe),
  verified live. The redundant in-drawer card was removed by operator decision (the drawer header IS the identity).
- **The lineage profile drawer is now a colocated folder module** (the reference implementation for the launch
  recipe): a thin orchestrator + header + 3 lazy-loaded tab modules + a hook + types. DrawerIdentityHeader CRAP
  **272 → 42**; net maintainability held (90.0 → 89.9) with **0 introduced fallow findings**.
- **View-A drawer tab switching now works** (was never wired since the island was created — a port-the-pattern gap).
- **`Organization.logoUrl` added** (local migration; null-safe school badge) — the school-logo data backfill + prod
  `migrate deploy` + media galleries are the **supervised new-data lane** (next session), NOT the parallel fleet.
- **The launch-sweep playbook** ([`component-launch-sweep-recipe.md`](../runbooks/component-launch-sweep-recipe.md))
  is written + carries **6 gotchas** the worked example surfaced (portal fonts, folder-vs-file resolution,
  lazy-unmount, stale Prisma client, controlled-tab consumer gap, fallow move-attribution).

## Decisions resolved

- **Rich-data sourcing for `/me` (grill fork A)** — use the accountless-placeholder + claim model (the BBL way);
  attach an account to enriched Jane, point dev-login there. No hand-faked data.
- **Proof-data isolation** — quarantine the fixture in a throwaway `bbl-lineage` tree (don't pollute the real
  `rigan-machado-bjj-lineage` seed — the clone-diff/proof-data lesson).
- **Card content** — belt color (`colorHex`) is necessary (the credential's defining visual); the discipline
  eyebrow is optional and was dropped from the shared payload (it caused a brittle nested-required type + test break).
- **Drawer architecture** — colocated **folder module**, built now, = the canonical recipe for parallel sweeps.
- **School logo** — add `Organization.logoUrl` + null-safe render **now (local)**; prod migrate + backfill + galleries
  → one **supervised lane**; the parallel fleet runs **zero migrations**.
- **Poppins** — type-token now (A), image-hero overlay later with the media lane (B).
- **Drawer scope** — exactly 3 tabs (Info/Lineage/Rank-History); the rich extras live on the profile page (decided
  earlier). Drop the redundant in-drawer card; keep + refactor the header.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/scripts/enrich-bbl-members-pods.ts` | Bug-2 fix: `location` set only when the promotion school did NOT resolve to an Organization (no more double-school in the timeline). |
| `apps/web/server/web/directory/profile-projection.ts` | `/me` `locationLine` falls back to `passport.currentResidence` (surfaces the migrated field). |
| `apps/web/server/web/directory/payloads.ts` | Self-payload selects `currentResidence`; shared `directoryRankAwardPayload` selects `colorHex` (belt tint for the card). |
| `apps/web/server/web/directory/profile-projection.test.ts` | Fixture rank objects gain realistic `colorHex` (`#000000`/`#8B4513`) to match the widened payload. |
| `apps/web/app/(web)/directory/[slug]/page.tsx` | Mount `BjjPassportCard` in the `ListingDetail` sidebar (Passport-rooted, null-safe, brand-neutral). |
| `apps/web/server/web/lineage/payloads.ts` | Membership-org select gains `logoUrl` (drawer school badge). |
| `apps/web/prisma/schema.prisma` | **New** `Organization.logoUrl String?` (nullable, additive). |
| `apps/web/prisma/migrations/20260617220014_add_organization_logo_url/` | **New** local migration (prod deploy deferred to the supervised lane). |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | **Deleted** — replaced by the folder module. |
| `apps/web/components/web/lineage/lineage-profile-drawer/` | **New folder module**: `index.tsx` (orchestrator + DrawerBody, lazy tabs), `drawer-header.tsx` (refactored header + BeltSwatch belt-bar), `info-tab.tsx` (+ null-safe school logo), `lineage-tab.tsx`, `use-drawer-profile.ts`, `drawer-types.ts`. |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | Wire `drawerTab` state + `activeTab`/`onTabChange` so View-A drawer tabs switch. |
| `docs/runbooks/component-launch-sweep-recipe.md` | **New** — the per-component launch-sweep playbook + 6 gotchas. |
| `docs/sprints/SESSION_0410.md` | This record. |
| `docs/knowledge/wiki/index.md` | SESSION_0410 row. |
| `/tmp/bbl-verify/*.ts` `*.mjs` | **Local-only** throwaway tooling (fixture seed, John-Will isolation, claim-jane) — not committed. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` | ✓ **0 errors** (post Prisma client regen) |
| `oxlint` (changed) / `oxfmt` | ✓ clean / 3 files reformatted |
| `fallow health` before → after | **90.0 → 89.9** (held); **0 introduced findings** (audit); `enrich` flat 25.7→25.7 |
| DrawerIdentityHeader CRAP | **272 → 42** |
| scoped `profile-projection.test.ts` | **4 pass / 0 fail** |
| enricher dry-run → real → dry-run | proved date/promoter/awards/galleries/affiliations; **idempotent re-run = 0** |
| `/me` live DOM | rich render (card + provenance timeline + bio/socials/schools); "Based in: San Diego, CA" surfaces; no double-school; 0 console errors |
| `/directory/sensei-demo` live | `BjjPassportCard` renders ("BJJ Passport" + belt + avatar) |
| lineage drawer live (decomposed) | page 200, header + Info render, **Lineage tab switches + lazy panel loads**, 0 console errors |
| email send during dev-login | **none** (ran dev server with `RESEND_API_KEY=` empty — BBL sender-rep protected) |
| full `bun test` | **SKIPPED** — live-Resend sender-rep risk (0407–0409 precedent) |

## Open decisions / blockers

- **Supervised new-data lane (next session):** prod `migrate deploy` for `currentResidence` + `logoUrl`; the Pods
  full-fidelity enrichment importer run against prod (the `BBL_PODS_FULL_IMPORT_SPEC.md` lane); school-logo backfill
  + admin upload; media galleries; the image-hero Poppins overlay (B). All gated, dry-run-first, behind the countdown.
- **Poppins type-token (A) for the drawer** is specified (the portal-font gotcha + the consumer-threading fix are in
  the recipe) but **not yet applied** — it's a multi-site consumer thread (island + board → DrawerContent) best done
  as a focused sweep. Documented, not done.
- **Reveal + claim-email send** still gated on `STRIPE_WEBHOOK_SECRET_BBL` + operator go (unchanged).

## Next session

### Goal

Run the **parallel cloud-session launch sweep** using [`component-launch-sweep-recipe.md`](../runbooks/component-launch-sweep-recipe.md):
page-by-page / component-by-component decompose → brand-token sweep → lazy → wire on-the-wire data → verify, with the
lineage profile drawer as the worked example. In parallel, run the **single supervised new-data lane**.

### First task

Apply the Poppins type-token (A) to the drawer per the recipe's portal-font gotcha (thread the brand font class from the
island + board consumers to `DrawerContent`), then kick the first parallel sweep on the next-highest-traffic component.
Separately (supervised, not the fleet): `prisma migrate deploy` the `currentResidence` + `logoUrl` columns to prod Neon,
then the Pods full-fidelity enrichment dry-run against prod. **Do NOT flip `BBL_COUNTDOWN` / send claim emails.**

## Review log

### SESSION_0410_REVIEW_01 — verify-the-pipeline + drawer decomposition + launch recipe

- **Reviewed tasks:** TASK_01–10.
- **Method:** inline verification (typecheck/fallow/live-DOM) + two background multi-agent workflows — `wc3q11qua`
  (tab-switching implement+verify) and `wk1xob7yr` (adversarial diff review across decomposition-behavior /
  correctness / brand-token dimensions, each finding adversarially verified).
- **Dirstarter docs check:** Prisma (additive nullable column, local migrate — no prod motion); identity (Passport
  SoT, ADR 0025) confirmed; ADR 0022 brand-neutrality upheld (belt color = `colorHex`, fonts/logos tokenized).
- **Verdict:** The original goal (verify PRs #88/#89/#90) is fully met with 2 real bugs caught + fixed on the live
  DOM. The session then expanded — at operator direction — into a drawer-decomposition epic that doubles as the
  reference implementation + written playbook for the launch finish. Every prod-bound change was held to the
  supervised lane; the parallel fleet's boundary (zero migrations) is explicit. Net complexity dropped
  (CRAP 272→42, maintainability held, 0 introduced findings).
- **Score:** 9/10.
- **Follow-up:** apply Poppins-A; run the supervised new-data lane; spawn the parallel sweeps.

## Hostile close review

- **Giddy:** pass — every prod-bound migration deferred to the supervised lane (local-only this session); no
  `BBL_COUNTDOWN` flip; no emails (dev-login ran with Resend disabled — verified no send). Proof data quarantined
  in a throwaway tree, not the real seed.
- **Doug:** pass with caveat — full `bun test` deliberately skipped (live-Resend sender-rep, 0407–0409 precedent);
  substituted typecheck 0 + fallow (0 introduced) + scoped test (4/4) + live-DOM. The Poppins-A type-token is
  documented but not applied (carried to next session, not silently dropped).
- **Desi:** pass — the redundant in-drawer card was removed (operator grill); the header is a cleaner, belt-forward
  identity (BeltSwatch belt-bar, monorepo-inspired, brand-neutral); the public card renders correctly.
- **Kaizen aggregate:** 9/10 — a clean verification lane landed + 2 bugs fixed, then a high-leverage architectural
  pattern (folder module + recipe) was established and proven on a real component, with prod risk correctly fenced.

### Findings (severity ≥ medium)

- The background diff-review workflow (`wk1xob7yr`) was still in-flight (no output) at close — it did not block
  the commit. The verified set stands on its own: typecheck 0, all gates green, decomposition behavior-preserving
  (confirmed by the tab-fix workflow's agents + live render/switch + 0 console errors), fallow 0 introduced findings.
  Any finding the review surfaces post-commit is a next-session follow-up against the committed diff, not a blocker.

## ADR / ubiquitous-language check

- **No new ADR required.** Applies ADR 0025 (Passport identity SoT), ADR 0022 (brand-neutral primitives), ADR
  0028/0029 (the one card/detail/timeline — reused, not rebuilt). The folder-module decomposition is a structural
  refactor, not an architectural decision; the recipe doc captures the pattern. If the supervised lane adds a
  person/org field beyond the existing satellites, an ADR note may be warranted then.
- **No new ubiquitous-language terms.** Reuses Passport / RankAward / Affiliation / Organization / LineageTree.

## Reflections

- **Grill before ramming the heavy lane.** The drawer redesign could have been a sloppy in-place hack. The grill
  (operator-invoked) forced the architecture decision (folder module) and the new-data boundary (supervised lane vs
  fleet) *before* any code moved — so the decomposition became a clean reference + a reusable playbook instead of a
  one-off. "Stage the heavy lane, don't ram it" (SESSION_0409) paid off again.
- **The worked example is where the recipe earns its keep.** Decomposing one real drawer surfaced 6 gotchas no
  abstract recipe would have — the portal-font trap, the stale-Prisma-client 500, the controlled-tab consumer gap,
  fallow's path-based move-attribution. Folding them back into the doc is the whole point of doing the first one by
  hand before parallelizing.
- **`fallow audit` ✗ ≠ regression when files move.** Decomposition relocates functions to new paths, so the audit's
  path-based diff flags them as "introduced" — but `introduced: 0` (json) + maintainability held + CRAP 272→42 prove
  the net dropped. Read the attribution, not the raw threshold count.
- **"Worked a few sessions back" needs a pickaxe, not a memory.** The operator recalled tab switching working; the
  workflow's `git log -S` proved it only ever worked on the *board* — the island never had it. Verify the claim
  against history before "restoring" something that was never there.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0410 frontmatter `status: closed` + `updated`; recipe doc has JETTY frontmatter; new code files carry no frontmatter (correct). |
| Backlinks/index sweep | SESSION_0410 row added to `wiki/index.md`; recipe doc added to the runbooks set + cross-linked to the lineage hub / ADR 0022. |
| Wiki lint | `bun run wiki:lint` → result reported in chat. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0410_REVIEW_01 + Giddy/Doug/Desi above. |
| Review & Recommend | Next session goal + first task written (parallel sweep + supervised lane). |
| Memory sweep | BBL launch memory updated (recipe + decomposition + new-data boundary); the recipe is a project-scoped artifact. |
| Next session unblock check | First task (Poppins-A + first sweep) is doable; the supervised prod lane is operator-gated. |
| Git hygiene | single close commit + push to `main` — hash reported in chat (FS-0025: no second evidence commit). |
| Graphify update | refreshed before the close commit — stats reported in chat. |
