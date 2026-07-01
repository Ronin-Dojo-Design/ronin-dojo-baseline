---
title: "Petey Plan 0477 — Belt Journey (RankMilestone) + School-Leads Flywheel + BBL CRM (autonomous epic)"
slug: petey-plan-0477-belt-journey-crm-epic
type: plan
status: active
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0476
pairs_with:
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/sprints/SESSION_0477.md
  - docs/product/black-belt-legacy/BBL_PARITY_SPEC.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0036-claim-unification.md
backlinks:
  - docs/sprints/SESSION_0477.md
---

# Petey Plan 0477 — Belt Journey + School-Leads Flywheel + BBL CRM

> **Authored SESSION_0476 for an overnight `scripts/auto-session-codex.sh` run** (operator handoff — Brian is
> asleep). Goal: build G-004 N2 (the member belt-by-belt edit cards) **and** the reference-resolution +
> school-leads growth flywheel it rides on, as **locked, self-contained slices → one reviewable PR each**
> (stacked; nothing merges to `main` unattended — the PR is the gate). **Headless Codex cannot grill** — every
> decision below is LOCKED; if a slice is ambiguous or needs a decision, **STOP, leave the tree clean, hand
> back.** Do the slices IN ORDER, one per session; each bow-out writes its SESSION `Next session` → the next slice.

## ⛔ HARD BOUNDARY (read first — non-negotiable every session)

- ❌ **No push / merge / deploy.** Commit to the session branch only; the wrapper opens the PR. Nothing reaches
  `main` unattended.
- ❌ **No sending of any invite/outreach emails.** The flywheel CREATES leads + placeholder orgs + a follow-up
  task; the actual invite send is an **operator/admin click** (Resend to real schools is operator-gated — see
  `[[bbl-resend-key-and-dogfood-teardown]]`). Wire the button/action, never auto-fire it.
- ❌ **No prod data mutation**, no Neon/Vercel/DNS/Stripe/prod-env work, no `brand`-enum/Stage-2 work, no
  running any banked/purge/teardown script, no `send-bbl-truelson-thankyou.ts`.
- ❌ **No Slice 7 (lead automation via agents) autonomously** — future/human-design. Slices 1–6 ARE the build;
  after Slice 6, hand back. Do not attempt Slice 7.
- ✅ **Schema is allowed** (Slice 2 adds `RankMilestone`) but the PR is **human-reviewed before merge** (always
  true in the stacked flow). Hand-author the migration; commit the file; additive only (new table + nullable FK).
- **Per-slice gate before commit:** `bun run typecheck` (0) · `(cd apps/web && bun run lint:check && bun run
  format:check)` (read-only — NEVER the `--fix`/`lint`/`format` variants, they mutate) · touched-area tests
  (`bun run test <file>`, `--parallel=1`) · `npx next build` (exit 0 for any `apps/web` code) · `bun run
  wiki:lint` (0 errors) · `npx fallow audit --base origin/main` reading `dead_code_introduced: 0`. Operator-only
  browser/device smoke is **flagged + skipped**, never faked.
- **Resilience:** if the next slice is already done / nothing to do, mark it `✅ no-op (SESSION ref)` and proceed
  to the following slice in the SAME session (one commit per session). Halt only on a genuinely empty list.

## Locked decisions (do not re-decide)

1. **`RankMilestone`** = the member's belt-journey enrichment (story + journey photos), **1:1 with `RankAward`**
   (`rankAwardId String @unique`, `onDelete: Cascade`). `RankAward` stays the canonical promotion FACT. The
   milestone is member-owned, always member-editable, never "verified". Discipline-neutral name (UX renders
   "Belt Journey"/"Belt"). **No privacy/visibility fields** (operator ruled out).
2. **Media** = `MediaAttachment` rows on a NEW `rankMilestoneId` FK (mirror the existing 9-FK polymorphic
   pattern), `purpose ∈ {belt, instructor, certificate, competition}` (string convention, NOT an enum — the
   column is shared). `RankAward.mediaUrls Json?` → mark `/// @deprecated` (drop later, not now).
3. **Promoter + school = the resolve-or-create combobox** (reuse `components/common/creatable-combobox.tsx` +
   the `CreatableField` pattern from `app/(web)/lineage/join/.../lineage-step.tsx`). Match → typed FK
   (`awardedByPassportId` / `organizationId`). Miss → freetext + **`emitSchoolLead()`** (Slice 1).
4. **School-leads reuse the EXISTING `Lead` model** (`source = SCHOOL_OUTREACH` — add the enum value) + a
   **placeholder `Organization`** (`ownerId = null`). **No new lead/CRM model.** Dedup via `lib/dedup.ts`.
   Verification stays RBAC/invite-gated (ADR 0036 D6/D13) — never automatic.
5. **Gating invariant** (the feature): ceiling = `pickTopAwardInDiscipline(awards, disciplineId).rank.sortOrder`
   (`server/web/lineage/node-profile-queries.ts:17`; BBL = BJJ). Create/backfill a `RankAward` only
   `sortOrder ≤ ceiling`; `updateRankAwardFact` **never changes `rankId`** and is allowed **only when
   `UNVERIFIED`** (verified fact → 403); **delete of the top award is forbidden**; the milestone carries no rank
   authority. So self-service can never self-promote.
6. **Card** = a dedicated `BeltEditCard` wrapping L1 `Card` (`components/common/card.tsx`) + `BeltSwatch`, belt
   color via `--rank-color` from `Rank.colorHex` (ADR 0022). **NOT** a new `m-card` kind (ADR 0040).
7. **Country** = a new `CountrySelect` (ISO 3166-1 alpha-2 + flag), stored on `Organization.country` /
   `Affiliation`. Feed a static countries array through `ComboboxSelector`.
8. **Mutations = oRPC `authedProcedure`** (`server/orpc/procedure.ts`; ADR 0024), own-Passport only, Zod in/out,
   permission + rateLimit meta, `revalidate(["/app/profile"])`.

## The slices (one per session, in order)

### Slice 1 — School-leads flywheel core (schema-free; stops the leak) → SESSION_0478

- **What:** `lib/dedup.ts` (`fuzzyMatchSchool(name, orgs) → Organization | null`, ~90% threshold, name-normalize
  + a small string-similarity — no new heavy dep; a compact Levenshtein/Dice helper) + `server/web/school-lead/
  emit-school-lead.ts` (`emitSchoolLead({ schoolName, memberEmail?, source }) →` dedup against existing
  `Organization` + open `Lead`s; MATCH → link + bump a demand-count in `Lead.meta`; MISS → create placeholder
  `Organization` (`ownerId: null`) + a `Lead` (`source: SCHOOL_OUTREACH`) + a `LeadFollowUp` (channel `email`,
  `notes: "auto — pending invite"`, NOT sent). Add `SCHOOL_OUTREACH` to `LeadSource`.
- **Retrofit the leaking join wizard:** after the legacy-join interest is created, if the school pick is custom
  (`schoolOrgId == null && schoolName`), call `emitSchoolLead(...)`. (Files: `server/web/lead/public-actions.ts`
  + the join options.) This is the immediate value — the wizard already captures + drops these.
- **Done:** a custom-school join creates exactly one deduped lead + placeholder org; a second identical entry
  bumps the count, not a new row. Unit-test dedup + emit.
- **Gate:** typecheck · oxlint/oxfmt check · the new tests · `next build` (app-code) · wiki:lint 0 · fallow 0.
  `LeadSource` enum add = a **schema migration** → this slice's PR is human-reviewed. If you'd rather keep Slice 1
  schema-free, store `source` semantics in `Lead.meta.kind = "school_outreach"` instead of a new enum value and
  note the choice — either is acceptable; pick the smaller diff and record it.

### Slice 2 — `RankMilestone` model + migration + ADR + ubiquitous language → SESSION_0479

- **What:** add `model RankMilestone { id; rankAwardId @unique; story String?; createdAt; updatedAt; media
  MediaAttachment[] }` (1:1, cascade) + `MediaAttachment.rankMilestoneId String?` + relation + `@@index`; mark
  `RankAward.mediaUrls` `/// @deprecated`. **Hand-author the migration** (additive: new table + nullable FK —
  read `docs/runbooks/database/schema-migration.md` + `prisma-workflow.md` + `cody-preflight.md` first). Author
  `docs/architecture/decisions/00NN-rank-award-fact-vs-member-milestone.md` (the fact/enrichment split) + add
  **RankMilestone / Belt Journey** to `docs/architecture/ubiquitous-language.md`.
- **Done:** `prisma validate` + generate clean; migration applies on a fresh DB; ADR + glossary landed.
- **Gate:** typecheck · `prisma validate` · wiki:lint 0. **Schema PR → human review before merge.**

### Slice 3 — Belt oRPC CRUD (gated; the invariant) → SESSION_0480

- **What (own-Passport, gated `sortOrder ≤ ceiling`):** `upsertBeltMilestone(rankId, { story })` (ensures a
  self-report `RankAward` exists — UNVERIFIED, gated — then upserts the milestone); `updateRankAwardFact(
  rankAwardId, { awardedAt, promoter, school })` (**UNVERIFIED only**; never changes `rankId`; promoter/school
  accept a typed FK or freetext→`emitSchoolLead`); `attachMilestoneMedia`/`detachMilestoneMedia`;
  `deleteRankAward` (**forbid top award**; cascades milestone). Reuse `setPassportRank` upsert +
  `pickTopAwardInDiscipline`.
- **Done + Gate:** procedures + **hard invariant tests** (cannot create/edit above ceiling · cannot edit a
  verified fact · cannot delete the top award · ownership enforced). typecheck · oxlint/oxfmt · tests · next
  build · wiki:lint 0 · fallow 0.

### Slice 4 — `BeltEditCard` + `BeltJourneyGrid` + edit form + `CountrySelect` → SESSION_0481

- **What:** `BeltEditCard` (L1 Card + `--rank-color`; status Add/Locked/Completed derived from award+milestone;
  locked = disabled + `opacity-70` + tooltip). `BeltJourneyGrid` (one card per discipline rank in `sortOrder`,
  `locked = sortOrder > ceiling`). The edit form: **fact fields** (date, promoter, school) editable only when
  UNVERIFIED; **milestone fields** (story + 4 media galleries) always editable; White-belt special-case
  (date = "when did you start training?", no promoter/location). Promoter/school = `CreatableField` (Slice 3
  freetext→lead). `CountrySelect` (ISO + flag). Media via R2 + `MediaAttachmentManager` → `attachMilestoneMedia`.
- **Done + Gate:** components render every rank with correct state from real data; form saves via Slice 3.
  Operator browser smoke flagged/skipped. typecheck · oxlint/oxfmt · tests · next build · wiki:lint 0 · fallow 0.

### Slice 5 — Mount the "Belts" tab + wire ceiling + BJJ scope + proof → SESSION_0482

- **What:** insert the "Belts" tab into `apps/web/app/app/profile/page.tsx` via `DashboardTabs`; server-load the
  member's awarded ranks + `memberTopRank` (BJJ-scoped) + the discipline rank list + milestones in ONE pass
  (no N+1). Write a Playwright behavior spec (enrich ≤ ceiling · locked above · verified-fact read-only ·
  delete-top blocked). **Prove zero regression to the awarded-truth rank display** (0474/0475).
- **Done + Gate:** tab live + gated + BJJ-scoped; behavior spec green; full gate. This completes the belt-journey
  + flywheel epic. **At bow-out, set `Next session` → "Slice 6 (BBL CRM) — HELD for operator design; hand back."**

### Slice 6 — BBL Lead Pipeline board (Mammoth pattern, BBL's own data) → SESSION_0483

- **What:** run "the Mammoth CRM for BBL" the doctrine-correct way (ADR 0034/0038 — **share the kernel, not the
  data**; Option C "route BBL leads into Mammoth's DB" is FORBIDDEN — no cross-product FKs). Build a **BBL Lead
  Pipeline board in `apps/web`** that mounts the existing `AdminKanban` kernel (`@ronin-dojo/ui-kit/kanban`) over
  BBL's OWN `Lead`/`LeadFollowUp`/`Organization` models — the SAME config-driven pattern Mammoth
  (`clients/mammoth-build-crm/lib/*`) and BBL's own loop-board (`apps/web/lib/loop-board/*`) already use. This is
  where Slice 1's school-leads (`source: SCHOOL_OUTREACH`) become a visible, workable outreach queue.
- **Steps (mirror the exemplars — NO extraction, NO cross-product data, reuse BBL's models):**
  1. New module `apps/web/lib/leads-pipeline/`: `board-config.ts` (stages NEW → TRIAL_BOOKED → CONTACTED →
     CONVERTED → LOST; a "Schools to invite" filter/swimlane for `SCHOOL_OUTREACH` ranked by demand-count),
     `board-store-db.ts` (read `Lead` + flatten `Organization.name`; write status/follow-up), `actions.ts`
     (own-scoped `updateLeadStatus` / `createLeadFollowUp` — reuse `server/admin/leads/*`), `types.ts`.
  2. Route `apps/web/app/app/leads-pipeline/page.tsx` → mount `AdminKanban` with the BBL config + store + BBL tokens.
  3. **Invite = an operator button** on a school-lead card calling the EXISTING `createOrgInvite` +
     `notifyUserOfInvite` — WIRED but NOT auto-fired (HARD BOUNDARY: no autonomous email sends).
- **Prior art (read first):** `clients/mammoth-build-crm/lib/{board-config,board-store-db,actions}.ts` (template)
  + `apps/web/lib/loop-board/board-config.ts` (BBL already does this) + `packages/ui-kit/src/kanban/`.
- **Done + Gate:** board reads BBL leads incl. the school-outreach queue; drag/status/follow-up persist; BBL DB
  isolation intact. typecheck · oxlint/oxfmt · tests · next build · wiki:lint 0 · fallow 0.

### Slice 7 — Lead automation via Petey/Cody agent orchestration — ⛔ HELD (future, human-design)

- Auto-triage/assign leads, draft outreach, escalate stale deals via agent handoffs. **Net-new + out-of-scope
  for the autonomous build** (needs design). After Slice 6, hand back — do NOT attempt Slice 7 autonomously.

## When the plan is exhausted — hand back

After Slice 6, **stop and hand back** (do not invent work). The operator reviews the stacked PRs (merge
bottom-up into `main`), then designs + unlocks Slice 7 (agent-driven lead automation). Ping via
`scripts/notify.sh` if configured.
