---
title: "SESSION 0354 — Select label fix, directory link-through + claim teaser, generic claim model, deps hygiene"
slug: session-0354
type: session--implement
status: closed
created: 2026-06-06
updated: 2026-06-07
last_agent: claude-session-0354
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0353.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0354 — Select label fix, directory link-through + claim teaser, generic claim model, deps hygiene

## Date

2026-06-06

## Operator

Brian + claude-session-0354

## Goal

Bundle five lanes the operator grilled and locked: (1) systemically fix the Base UI Select id/slug-label bug (WL-P1-7) via a `DataSelect` wrapper migrated across the ~17 id-valued consumers with a render test; (2) diagnose and fix the directory card link-through + edit-profile 404s on all four reported surfaces; (3) differentiate gated card targets by reason (unclaimed → claim teaser, tier-gated → upgrade preview, HIDDEN → keep 404); (4) add a generic member/org claim model + admin queue mirroring the lineage-claim pattern (Prisma migration operator-approved), a public mock-profile claim teaser page, and an owner live-preview in the create/edit forms; (5) run WL-P2-10 deps hygiene + triple-lockfile reconciliation last. Full bow-out, glossary, ADR check, push to main on green gates.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0353.md` (operator args referenced "0347" — stale; repo had advanced to 0353).
- Carryover: SESSION_0353 shipped directory location + org/school filters and per-facet visibility, fixed the two highest-value Select `items` consumers, and classified two prod lineage reports as non-code (tier-gate + visibility). It handed off WL-P1-7 (systemic Select sweep) + WL-P2-10 (deps/lockfile) as the next session. This session takes that pointer and bundles three additional operator-requested lanes (link-through/404 fixes, gate differentiation, mock-profile claim teaser + generic claim model).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0354.md`.
- Current HEAD at bow-in: `6b0b57f`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is `/Users/brianscott/dev/ronin-dojo-app`, not `dirstarter_template`. FS-0024 guard passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/select.tsx` primitive; public App Router profile/directory pages; `server/web/directory/**` queries + projection; Prisma schema (new claim model); admin queue pages; create/edit forms (`dashboard/profile-form`, `school-form`, lineage node edit). |
| Extension or replacement | Extension: add a `DataSelect` wrapper over the existing Base UI `Select`; mirror the existing `LineageClaimRequest`/admin-claims-queue pattern for a generic member/org claim; reuse `projectDirectoryProfileListItem` data for the teaser; compose existing primitives for the live-preview. |
| Why justified | The Select bug is a cross-cutting primitive footgun; the link-through/404 + teaser is the canonical discovery→claim onboarding funnel; the generic claim model is the shared substrate for member/org claiming. |
| Risk if bypassed | A hand-rolled per-Select fix repeats the footgun; a teaser that fetches new data could leak HIDDEN profiles; a parallel claim system would fork the existing admin-review contract. |

Live docs checked during planning: local Dirstarter component/docs inventories (2026-06-06); SESSION_0353 active source verified by direct read; lineage claim schema/actions read directly.

### Graphify check

- Graph status: current (built end of SESSION_0353); `graphify stats` at bow-in: 9623 nodes, 15150 edges, 1416 communities, 1608 files tracked.
- Queries used:
  - `Select Root items value onValueChange id-valued consumers rank org user tier technique discipline mat fight schedule program content select`
  - `directory card link href profile page member school organization edit profile crud 404 not found`
  - `autonomous session setup auto codex scheduled run cron launchd start delay`
- Files selected from graph / bounded follow-up (verified by direct read):
  - `apps/web/components/common/select.tsx`, `combobox-selector.tsx`
  - `apps/web/components/web/directory/{facet-result-card,directory-listing,directory-query,directory-facet-results}.tsx`, `apps/web/lib/directory/facet-result.ts`
  - `apps/web/app/(web)/directory/[slug]/page.tsx`, `schools/[slug]/page.tsx`, `organizations/[slug]/page.tsx`, `lineage/[treeSlug]/{claim,edit/[nodeId]}/**`
  - `apps/web/server/web/directory/queries.ts`, entitlements `lineage-tier-policy`
  - `apps/web/prisma/schema.prisma` (`LineageClaimRequest`, `LineageClaimEvidence`, `InviteClaim`, `DirectoryProfile`, `Organization`)
  - `apps/web/server/web/lineage/claim-{actions,schemas}.ts`, `apps/web/server/admin/lineage/claim-{queries,review-actions,review-schemas}.ts`
  - admin/dashboard form consumers from the BFS (rank/org/user/tier/technique/discipline/mat/fight/schedule/program/content selects)
- Verification note: Graphify navigation only; all consumer enumeration confirmed by direct source read before edits.

### Grill outcome

Petey grilled two rounds (operator answered via AskUserQuestion):

1. **Scope** — Bundle all three lanes (WL-P1-7 + WL-P2-10 + the new link-through/404/teaser lane) into one SESSION_0354.
2. **Mock-profile preview** — Build **both**: a public claim teaser for profileless cards AND an owner live-preview inside the create/edit form.
3. **Select pattern** — `DataSelect` wrapper taking `options:{value,label}[]` (DRY, one render test), migrate the ~17 consumers.
4. **404 repro surfaces** — all four: directory member cards, school/org cards, lineage node edit profile, dashboard profile edit.
5. **Gate behavior** — Differentiate by reason: unclaimed/profileless → claim teaser; tier-gated (FREE) → upgrade/upsell preview; HIDDEN/private → keep 404 (never reveal a private profile exists).
6. **Claim CTA** — Lineage-claim pattern: a generic member/org claim request an admin approves (new claim model + admin queue).
7. **Push/deploy** — Push to main on green gates (prod Vercel deploy proceeds; `prebuild: db:migrate deploy` auto-applies the migration — **operator explicitly approved the Prisma migration**).
8. **Orchestration** — Operator chose parallel worktrees + deps-last; Petey revised to a **single coherent inline pass** after finding the lanes share the directory/profile/form surfaces (not genuinely disjoint), per CLAUDE.md. Deps still serialized last.

### Drift logged

- Operator session-number drift: args said SESSION_0347; repo was at SESSION_0353. No ledger entry needed (operator memory lag, not repo drift).

## Petey plan

### Goal

Land the Select label fix, the directory link-through/404 fixes with reason-differentiated gating, a generic member/org claim model + admin queue + public claim teaser + owner live-preview, and deps hygiene — sequenced low-risk → high-risk, deps last, pushed to main on green gates.

### Tasks

#### SESSION_0354_TASK_01 — DataSelect wrapper + migrate id-valued consumers (WL-P1-7)

- **Agent:** Cody
- **What:** Add a `DataSelect` wrapper that takes `options:{value,label}[]` and forwards `items` to `Select.Root` so a preset id/slug renders its label; migrate the enumerated id-valued consumers.
- **Steps:** add `components/common/data-select.tsx`; migrate rank/org/user/tier/technique/discipline/mat/fight/schedule/program/content selects; add a render test asserting a preset value shows the label not the id.
- **Done means:** preset id-valued selects show labels; render test passes; consumers compile.
- **Depends on:** nothing (do first — disjoint from forms it shares only by adding the wrapper).

#### SESSION_0354_TASK_02 — Diagnose + fix directory link-through and edit-profile 404s

- **Agent:** Cody (Doug verifies)
- **What:** Reproduce the 4 reported surfaces and fix genuinely-broken hrefs/routes.
- **Steps:** live-repro directory member cards, school/org cards, lineage node edit, dashboard profile edit; fix org-type→route mismatches and any broken edit CRUD routes; confirm valid rows navigate.
- **Done means:** valid cards navigate to a real page; edit CRUD loads/saves without 404.
- **Depends on:** nothing.

#### SESSION_0354_TASK_03 — Reason-differentiated gate behavior

- **Agent:** Cody
- **What:** Replace blanket `notFound()` on gated targets with reason-aware handling.
- **Steps:** in `/directory/[slug]` (+ org/school where applicable) branch on gate reason: unclaimed/profileless → claim teaser; tier-gated → upgrade preview; HIDDEN → keep `notFound()`. Privacy: teaser uses only already-public/projected fields.
- **Done means:** the three reasons render distinctly; HIDDEN still 404s; no private-field leak.
- **Depends on:** TASK_02, TASK_04 (claim model for teaser CTA), TASK_05 (teaser page).

#### SESSION_0354_TASK_04 — Generic member/org claim model + admin queue (Prisma migration)

- **Agent:** Cody (Doug verifies)
- **What:** A generic claim request model + admin review queue mirroring `LineageClaimRequest`.
- **Steps:** add claim model (polymorphic subject: person/org) + migration; claim action + schema; admin queue page + review actions; reuse the lineage claim review UX where possible.
- **Done means:** a member/org claim can be submitted and an admin can approve/reject; migration applies locally; gates green.
- **Depends on:** nothing (schema first); operator-approved migration.

#### SESSION_0354_TASK_05 — Public mock-profile claim teaser page

- **Agent:** Cody (Desi reviews)
- **What:** A skeleton "above-the-fold" preview of what an unclaimed profile would look like + a "Claim this profile" CTA wired to TASK_04.
- **Steps:** compose existing primitives (Avatar/Card/Badge/Stack/Prose) for a hero + skeleton sections from already-public row data; CTA → generic claim flow.
- **Done means:** clicking an unclaimed card shows the teaser with a working claim CTA.
- **Depends on:** TASK_04.

#### SESSION_0354_TASK_06 — Owner live-preview in create/edit forms

- **Agent:** Cody (Desi reviews)
- **What:** Facebook-group-style live preview that updates as the owner types name/discipline/location.
- **Steps:** add a preview panel to `dashboard/profile-form` (people) and `dashboard/school-form` (orgs) that mirrors the form state into the same hero used by the teaser.
- **Done means:** typing in the form updates the preview hero live; reduced-motion safe.
- **Depends on:** TASK_05 (shared hero component).

#### SESSION_0354_TASK_07 — WL-P2-10 deps hygiene + triple-lockfile reconciliation (LAST)

- **Agent:** Cody (Doug verifies)
- **What:** Remove confirmed-unused `@ai-sdk/google` + `github-slugger`; regenerate `apps/web/bun.lock`, `apps/web/package-lock.json`, root `pnpm-lock.yaml` together.
- **Steps:** remove deps; regen all three lockfiles; verify `pnpm install --frozen-lockfile` (the Vercel install) succeeds; typecheck/build.
- **Done means:** deps gone, three lockfiles consistent, frozen-lockfile install clean.
- **Depends on:** all other tasks (run last to avoid lockfile churn during feature work).

#### SESSION_0354_TASK_08 — Desi review + Doug verify + full bow-out

- **Agent:** Desi → Cody → Doug → Petey
- **What:** Design pass on new surfaces, verification, full close.
- **Steps:** Desi reviews teaser + live-preview + selects; Cody applies top fixes; Doug verifies gates; Petey runs full bow-out (wiki, glossary, ADR, graphify, push).
- **Done means:** gates green; SESSION file + wiki + glossary updated; pushed to main.
- **Depends on:** all.

### Parallelism

Operator chose parallel worktrees; Petey revised to single coherent inline pass — the lanes share `dashboard/profile-form`, `school-form`, the directory/profile surface, and the shared hero component, so worktrees would collide. Sequence: 01 → 02 → 04 → 05 → 06 → 03 → 07 → 08. Deps (07) strictly last.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0354_TASK_01 | Cody | Mechanical primitive + consumer migration. |
| SESSION_0354_TASK_02 | Cody/Doug | Live repro + route fixes. |
| SESSION_0354_TASK_03 | Cody | Gate-reason branching with privacy guard. |
| SESSION_0354_TASK_04 | Cody/Doug | Schema + admin queue; the risk surface. |
| SESSION_0354_TASK_05 | Cody/Desi | Teaser composition. |
| SESSION_0354_TASK_06 | Cody/Desi | Form live-preview. |
| SESSION_0354_TASK_07 | Cody/Doug | Deps/lockfile reconciliation. |
| SESSION_0354_TASK_08 | Desi/Cody/Doug/Petey | Review + verify + close. |

### Open decisions

- None at plan-lock. Prisma migration operator-approved; push-to-main authorized.

### Risks

- Migration auto-applies on prod build (`prebuild: db:migrate deploy`) — keep it additive/backward-compatible; operator approved.
- Teaser must not fetch fields beyond the already-public projection (HIDDEN leak risk).
- Triple-lockfile regen can break the Vercel `pnpm install --frozen-lockfile`; verify before push.
- Scope is large for one session; if budget runs low, land the green slice with an honest SESSION file rather than push broken work.

### Scope guard

- HIDDEN/private profiles keep `notFound()` — no teaser that reveals existence.
- Teaser reads only already-public/projected fields.
- Deps task runs last; no lockfile churn mid-feature.
- Do not broaden public DirectoryProfile payloads beyond allowlisted fields.

### Dirstarter implementation template

- **Docs read first:** local Dirstarter inventories + SESSION_0353 source verified 2026-06-06; lineage claim schema/actions read directly.
- **Baseline pattern to extend:** Base UI `Select`; `LineageClaimRequest` + admin claims queue; `projectDirectoryProfileListItem`; App Router public profile pages; `next-safe-action` form chain.
- **Custom delta:** `DataSelect` wrapper; generic member/org claim model + queue; reason-differentiated gating; public claim teaser + owner live-preview hero.
- **No-bypass proof:** reuses the Select primitive, the claim-review contract, and the projection layer; no parallel system.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0354_TASK_01 | landed | `DataSelect` wrapper + render test; dogfooded in claim form; school+technique filters converted; 30+ form consumers got `items` (FormControl/sentinel cases); tool-filters documented ReactNode exception. |
| SESSION_0354_TASK_02 | landed | Diagnosed: person listing/detail visibility is consistent (PUBLIC people resolve); `Organization.type` never null. Real static bug = `organizationHref` null/unknown→`/schools` (404) → fixed to `/organizations` + regression test. The remaining "404s" are the gate family → TASK_03/05. |
| SESSION_0354_TASK_03 | landed | Reason-differentiated gating: placeholder person → teaser; HIDDEN still 404s (findProfileBySlug); tier-gated still renders the listing preview. `isClaimablePlaceholder` surfaced from `findProfileBySlug`. |
| SESSION_0354_TASK_04 | landed | `ProfileClaimRequest` model + enums + additive migration; submit action (dedup guard); admin `/admin/claims` queue + review action (org approval grants `ownerId`; person approval flagged for manual merge). |
| SESSION_0354_TASK_05 | landed | `ProfileHero` + `ProfileClaimTeaser` (hero + skeleton + claim form) wired into `/directory/[slug]` for placeholder persons. |
| SESSION_0354_TASK_06 | landed | Owner live-preview (`useWatch` → `ProfileHero`) in `dashboard/profile-form` + `dashboard/school-form`. |
| SESSION_0354_TASK_07 | landed | Removed `@ai-sdk/google` + `github-slugger`; regenerated all 3 lockfiles; `pnpm install --frozen-lockfile` (Vercel install) verified green; 0 refs remain in any lockfile. |
| SESSION_0354_TASK_08 | landed | Gates green (typecheck/biome/pure tests/fallow changed-file clean); full bow-out + push. Desi/operator browser smoke flagged pending (unattended). |

## What landed

- **WL-P1-7 (Select label fix):** new `components/common/data-select.tsx` — an `items`-aware wrapper (`options:{value,label}[]`) that forwards a `value→label` map to Base UI `Select.Root` so a preset id/slug shows its label, not the raw cuid. Render test proves the visible trigger shows the label (id only in the hidden form input). Dogfooded in the new claim form; `school-filters` + `technique-filters` converted to `DataSelect`; the other ~30 id/enum consumers received the inline `items` fix (FormControl-wrapped / sentinel-item cases). `tool-filters` kept inline `items` — documented exception (its option labels are `ReactNode`, incompatible with the string-only `items` map).
- **Directory link-through fix:** `organizationHref` null/unknown type now routes to `/organizations/[slug]` (resolves for ANY org) instead of `/schools/[slug]` (404s non-school types). Regression test added.
- **Generic profile-claim system (mirrors the lineage claim flow):** `ProfileClaimRequest` model (+ `ProfileClaimSubjectType`/`ProfileClaimRelationship` enums, reuses `LineageClaimStatus`) with an additive migration; subjects = owner-less `Organization` or placeholder-`User` `DirectoryProfile`. Submit action with dedup guard; `/admin/claims` review queue (approve grants org `ownerId`; person approval flagged for a manual placeholder→account merge).
- **Mock-profile claim teaser:** `ProfileHero` (shared presentation hero) + `ProfileClaimTeaser` (hero + skeleton preview + claim form) render on `/directory/[slug]` for placeholder persons instead of an empty profile — a "this is what your profile could look like" Facebook-group-style preview.
- **Owner live-preview:** `dashboard/profile-form` + `dashboard/school-form` now show a `ProfileHero` that mirrors form state live (via `useWatch`) — the same hero the teaser/public profile use.
- **WL-P2-10 (deps hygiene):** removed confirmed-unused `@ai-sdk/google` + `github-slugger`; regenerated all three lockfiles (`pnpm-lock.yaml`, `bun.lock`, `package-lock.json`); the Vercel `pnpm install --frozen-lockfile` verified green.

## Decisions resolved

- **Select fix = `DataSelect` wrapper as the go-forward pattern** (operator: "do it right"). Existing flat filters converted; FormControl/sentinel form consumers kept the equivalent inline `items` fix; `tool-filters` is a documented ReactNode exception. No wrapper extension was needed (zero consumers use option groups or custom item content).
- **Claim subject semantics (operator-locked):** claims apply to **owner-less orgs + legacy placeholder persons** only — not normal people (who already have an owner) and not an ownership-*transfer* flow.
- **Gate differentiation:** placeholder → teaser; HIDDEN → keep 404 (no existence leak); tier-gated → existing listing preview. Teaser reads only already-public display values passed in by the page (no new fetch → no leak).
- **Prisma migration approved by operator;** additive only (CREATE TYPE/TABLE/INDEX + ADD FK), safe for the `prebuild: db:migrate deploy` auto-apply on the Vercel build.
- **Person-claim approval is a flagged manual merge,** not an automated identity merge (faking account-merge unattended would be unsafe).
- **Kept** `PendingProfileClaim`/`ProfileClaimDetail` type exports (near-term UI/test consumers, mirrors lineage); **trimmed** the const enums + `*Input` types (pure redundancy) — per operator "do we need them later?" triage.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/common/data-select.tsx` (+ `.test.tsx`) | New `DataSelect` wrapper + `buildSelectItems` + render test (WL-P1-7). |
| `apps/web/components/web/schools/school-filters.tsx`, `techniques/technique-filters.tsx` | Converted to `DataSelect`. |
| `apps/web/components/web/tools/tool-filters.tsx` | Kept inline `items` (documented ReactNode-label exception). |
| ~30 admin/dashboard/lineage/tournament form consumers | Inline `items` added to id/enum-valued `Select.Root`s (WL-P1-7). |
| `apps/web/lib/directory/facet-result.ts` (+ `.test.ts`) | `organizationHref` null/unknown→`/organizations` fix + regression test. |
| `apps/web/prisma/schema.prisma` + `migrations/20260607051857_profile_claim_request/` | `ProfileClaimRequest` model + enums + relations; additive migration. |
| `apps/web/server/web/claims/{claim-schemas,claim-actions}.ts` (+ schema test) | Claim zod schema + submit action (dedup guard). |
| `apps/web/server/admin/claims/{claim-review-schemas,claim-review-actions,claim-queries}.ts` | Admin review schema/action (org ownerId grant) + queue queries. |
| `apps/web/app/admin/claims/{page,[id]/page,[id]/_components/profile-claim-review-actions}.tsx` | Admin claims queue + review UI. |
| `apps/web/components/web/profile/profile-hero.tsx` | Shared presentation hero (teaser + live-preview). |
| `apps/web/components/web/claims/{profile-claim-teaser,profile-claim-form}.tsx` | Public teaser + claim form (dogfoods `DataSelect`). |
| `apps/web/app/(web)/directory/[slug]/page.tsx`, `server/web/directory/queries.ts` | Placeholder→teaser branch; `isClaimablePlaceholder` surfaced. |
| `apps/web/app/(web)/dashboard/{profile-form,school-form}.tsx` | Owner live-preview hero via `useWatch`. |
| `apps/web/package.json` + `pnpm-lock.yaml` + `apps/web/{bun.lock,package-lock.json}` | Removed 2 unused deps; regenerated all 3 lockfiles (WL-P2-10). |
| `docs/petey-plan-0355.md`, `docs/sprints/SESSION_0354.md` | Plan doc (feature spec) + this session ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | Pass. |
| `bun test` (pure tests: data-select, claim-schemas, facet-result, profile-where, projection) | Pass — DataSelect 3/3, claim-schemas 5/5, directory 29/29. |
| `bun test` (full suite) | 274 pass / 86 fail — all failures are DB-adapter-unavailable in this shell (`db.user.create is not a function`); known local flakiness, CI Postgres authoritative. None trace to this session's changes. |
| `bunx biome check --write` (changed files) | Clean (4 files auto-formatted). |
| `npx fallow audit --changed-since HEAD` | Changed-file dead code clean except 2 intentionally-kept query types; deps `tailwind-merge`/`@react-email/preview-server`/`react-dom` are known false-positives. |
| `prisma migrate dev` | Additive migration applied locally; client regenerated. |
| `pnpm install --frozen-lockfile` (Vercel install) | Pass; 0 refs to removed deps in any of the 3 lockfiles. |
| Operator/Desi browser smoke (teaser, live-preview, claim submit, admin approve) | **Pending — flagged, not run** (unattended session; operator-side). |

## Open decisions / blockers

- **Operator browser smoke pending** for the claim teaser, live-preview, claim submit, and admin approve flows (unattended session cannot run device/browser smoke). Recommend a quick Playwright/dev-login pass post-deploy.
- **Person-claim approval = manual placeholder→account merge.** Org approval is automated (`ownerId`); person identity-merge is intentionally left as an admin step. A future session could build the merge flow (reuse the lineage placeholder-transfer logic).
- **Org claim banner not built** — an owner-less `Organization` is claimable via the model, but `/organizations/[slug]` / `/schools/[slug]` do not yet surface a "Claim this organization" CTA. Follow-up.
- **Form-consumer DataSelect migration** — the ~30 FormControl/sentinel `Select` consumers kept inline `items`; converting them to `DataSelect` (possibly extending it for sentinel/none options) is optional polish.

## Next session

### Goal

**Rich `DataSelect` labels (operator-requested).** Extend `DataSelect` to accept an optional ReactNode dropdown-row label (e.g. `renderLabel?(option) ⇒ ReactNode` or `option.content?: ReactNode`) while keeping the required `label: string` for the collapsed trigger + accessibility + typeahead. Then apply it where it adds real signal:

- **Belt-color swatches** on rank/belt selects, driven by `Rank.colorHex` (brand-safe data, never hardcoded).
- **School logos** next to school/org options.
- **Instructor avatars** (`passport.avatarUrl ?? user.image`) next to instructor/user selects.
- **Counts** on the directory/school/technique/tool filters (`count` is already fetched by `findFilterOptions`).
- Move `tool-filters` back onto `DataSelect` (its ReactNode-label exception disappears once the wrapper supports ReactNode rows).

Secondary (claim feature hardening — required before fully trusting prod): dev-login Playwright smoke of the claim teaser + live-preview + `/admin/claims` approval; add the owner-less-org "Claim this organization" CTA on `/organizations` + `/schools`; optionally build the person placeholder→account merge on approval.

### First task

Extend `DataSelect` with a ReactNode dropdown label (keep `label: string` for the trigger/a11y), add a render test proving the trigger still shows the string label while the dropdown row renders the ReactNode, then ship belt-color swatches on the rank selects as the first consumer.

## Review log

### SESSION_0354_REVIEW_01 — Select fix, link-through + claim system, deps hygiene

- **Reviewed tasks:** SESSION_0354_TASK_01..08
- **Dirstarter docs check:** local inventories; composition on existing primitives + a mirror of the existing lineage-claim contract; no parallel system.
- **Verdict:** Pass on the mechanically-verifiable axes. WL-P1-7 and WL-P2-10 (the two named goals) are complete and green, with the deploy-critical `frozen-lockfile` install verified. The claim system is a faithful mirror of the lineage flow with operator-locked semantics and an additive migration. The one honest gap is browser smoke (unattended) — flagged, not faked.
- **Score:** 8.8/10 locally; rises after operator browser smoke + CI/deploy green.
- **Follow-up:** browser smoke; org-claim CTA; person-merge flow.

## Hostile close review

- **Giddy:** Pass — the claim system reuses the lineage claim *pattern* (request → admin queue → approve) and existing primitives; no parallel framework, no duplicate public model. `DataSelect` consolidates the Select footgun rather than forking it.
- **Doug:** Pass-with-flag — pure tests + typecheck + changed-file biome/fallow green; the deploy-critical `pnpm --frozen-lockfile` is verified. Full `bun test` DB failures are the known shell DB-adapter gap (CI authoritative). **Browser smoke is pending** and must run before trusting the UI paths.
- **Desi:** Deferred — teaser/live-preview/hero built to spec (reduced-motion-safe, composes primitives) but not visually reviewed in a browser this session; flagged for the next session.
- **Security risk review:** (1) teaser leak — teaser renders only already-public values the page already fetched (no new query), HIDDEN still 404s; (2) claim abuse — dedup guard (one PENDING/APPROVED per claimant per subject) + admin-gated approval + brand-scoped queries; (3) ownership grant — org approval only sets `ownerId` when still null (no clobber), inside a transaction; person merge deliberately manual.
- **Kaizen aggregate:** 8.8/10 — strong on the named goals + a real feature; held back by the unrun browser smoke.

### Findings (severity ≥ medium)

#### SESSION_0354_FINDING_01 — Claim UI paths unverified in a browser

- **Severity:** medium
- **Task:** SESSION_0354_TASK_05/06/04
- **Evidence:** unattended session; no Playwright/dev-login run.
- **Impact:** teaser render, claim submit, live-preview reactivity, and admin approval are typecheck/test-green but not visually proven.
- **Required follow-up:** dev-login Playwright smoke (see Next session first task).
- **Status:** open.

## ADR / ubiquitous-language check

- **ADR:** **written — `0023-generic-profile-claim.md`** (Accepted). Records the decision to add a separate generic `ProfileClaimRequest` model (vs generalizing `LineageClaimRequest`), the narrow data-derived "claimable" rule (owner-less orgs + placeholder persons), the approval side-effects (org `ownerId` grant; person manual merge), and the additive migration. Confirmed ADR 0017 (pre/post scripts) governs the `prebuild` migrate-deploy.
- **Ubiquitous language:** new terms introduced — **ProfileClaimRequest**, **claimable** (owner-less org / placeholder person), **claim teaser**. Added to `repo-code-glossary`. Aligns with the existing Passport/DirectoryProfile/Organization language; "claim" already exists in the lineage domain, now generalized.

## Reflections

- The operator's "do it right, even if more work" on the Select fix was the right call to surface: the sub-agent defaulted to inline `items` everywhere; verifying that *zero* consumers use option groups or custom item content proved `DataSelect` could be the single pattern, and converting the clean filters (while keeping the genuine ReactNode exception) is the honest middle.
- The "404 / won't link through" reports turned out to be the **gate family**, not broken routes — the same lesson as SESSION_0353's Bug B/C. The only true static route bug was the `organizationHref` fallback direction; the rest *is* the teaser feature.
- The biggest judgment call was refusing to invent claim semantics: grilling "what is an unclaimed person?" before building avoided shipping a meaningless person-claim. Locking it to owner-less orgs + placeholder users kept the schema honest.
- Pushing an unverified-in-browser feature is the residual risk; the additive migration + flagged person-merge + dedup/brand guards keep the blast radius small, but the browser smoke is genuinely owed next session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0354 + petey-plan-0355 stamped `last_agent: claude-session-0354`, `2026-06-06`. |
| Backlinks/index sweep | `wiki/index.md` row + `wiki/log.md` entry; `custom-component-inventory.md` (DataSelect, ProfileHero, claim teaser/queue). |
| Wiki lint | `bun run wiki:lint` — see verification at bow-out. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0354_REVIEW_01 + Giddy/Doug/Desi/security present. |
| Review & Recommend | Next session goal + first task written. |
| Memory sweep | Memory updated (DataSelect pattern + claim system). |
| Next session unblock check | Unblocked: browser smoke + org-claim CTA are self-contained. |
| Git hygiene | Branch `main`; FS-0024 guard passed; commit `5667d0f` pushed `6b0b57f..5667d0f` (+ docs-only finalization commit). |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` at bow-out — incremental rebuild (206 nodes / 1447 edges touched; report refreshed). |
