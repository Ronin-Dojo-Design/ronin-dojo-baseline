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

## Belt Verification Subsystem — Block-A build spec (DESIGNED SESSION_0486, grill-ratified)

> **Why this block exists.** SESSION_0484's ship-it review held belt PRs **#178–#181**: the epic (Slices 2–5)
> models a self-declared belt as an **`UNVERIFIED` `RankAward` minted on self-declare**, and the belt UI reads
> `node.isVerified` for its trust indicator — so a self-asserted belt renders as **VERIFIED** and there is no
> approval path to make it real. The SESSION_0486 grill ratified the fix. It is **not** the "per-belt unverified
> display axis" the hold note first imagined — that path (call it B2) re-opens the exact decision the
> **SESSION_0474 grill + [[learning-record-0008]] + ADR 0035 §4/§5** closed (a per-award `verificationStatus`
> display axis produced the founder double-badge bug). The ratified path (**B1**) keeps `RankAward` = trusted
> awarded-truth **always**, so a pending belt has no award to leak and the display axis is never reintroduced.
>
> **This supersedes the UNVERIFIED-award assumption in Slices 2–5** — see "Reworks to the held slices" below.
> The ADR deliverable is an **amendment to ADR 0035** that *reaffirms* §5 (records why B2 was rejected) and
> *extends* §4 with a `RANK_PROMOTION` claim type — drafted alongside this block (SESSION_0486).

### Grill-ratified decisions (LOCKED — SESSION_0486)

1. **B1 — claim-record model.** A self-declared belt awaiting verification lives on a **`RANK_PROMOTION`
   `PassportClaimRequest`** (`claimedRankId` + photo evidence), **not** as a `RankAward`. Approve → the existing
   `mintAssertedRankAward` creates a **`VERIFIED`** award (`source: STATED`, `verificationStatus: VERIFIED`) →
   the member then enriches it. **No `UNVERIFIED` `RankAward` is ever produced by the belt-journey feature.**
   Every displayed award is trusted (`VERIFIED` | `IMPORTED`); `UNVERIFIED`/`DISPUTED` stay in the enum but are
   **not** produced here and **not** a display axis (ADR 0035 §5 reaffirmed). Aligns with the 0474 grill:
   "pending self-declared rank lives on the claim/registration record, NOT as a `RankAward`."
2. **A1 — extend `PassportClaimRequest`.** Add `type PassportClaimType { IDENTITY, RANK_PROMOTION }`
   (`@default(IDENTITY)`); reuse `claimedRankId`, `PassportClaimEvidence`, the `/app/claims` queue, the
   `LineageClaimStatus` state machine, and the review UX. **Branch `finalizePassportClaim` on `type`** — a
   promotion runs **only** the rank-mint branch (the passport is already owned → no account-attach/comp/etc.).
   Not a new god-table and not a greenfield model (ADR 0034 mantra): the promotion reuses the identity-claim's
   `claimedRank → mintAssertedRankAward` machinery verbatim.
3. **C-implied mint — the one self-service award path, hard-gated.** Enriching a belt **at/below the verified
   ceiling** that has no award row yet (e.g. a verified purple adding a white-belt story) self-service-mints a
   **`VERIFIED`-by-implication** award (`source: STATED`), **gated `rank.sortOrder ≤ ceiling`**; dates/promoters
   are self-reported enrichment (the rank is implied by the higher verified rank). **A belt above the ceiling
   cannot be minted this way — it routes to a `RANK_PROMOTION` claim.** `setPassportRank`'s ungated create path
   is removed/hard-gated to this backfill. Self-promotion stays structurally impossible; the ceiling rises
   **only** through an approved promotion claim.
4. **Soft-gate photo evidence → milestone.** A promotion request **prompts** for a certificate/instructor photo
   (speeds review) but does **not** hard-require one (older/informal promotions may lack it; the reviewer
   decides). On submit → `PassportClaimEvidence`; on approve → the photos **materialize as `RankMilestone` media**
   (`purpose ∈ {certificate, instructor}`) on the newly-minted award's milestone — the verification submission
   doubles as the journey-photo capture.
5. **Approver = the existing resource-scoped `claim.review` grant** (no new permission). Global admins via
   `claims.manage`; a member's **RBAC-enabled instructor** via the `claim.review` grant already carried by every
   `LineageTreeAccess` role (`TREE_ADMIN`/`EDITOR`/`BRANCH_EDITOR`/`NODE_EDITOR`, roles.ts:89–94). The promotion
   claim's node/tree context scopes which instructor may review — this IS the "admin/RBAC-instructor" on-ramp.
6. **Verification is one person+rank event.** Approving a **first** promotion for an unverified self-registrant
   flips `node.isVerified` **and** mints the award **and** places them under their declared instructor (the 0474
   on-ramp; reuse the identity-finalize branches conditionally). For an **already-verified** member's promotion,
   it mints only the new `VERIFIED` award (node already verified; comp already granted → idempotent no-op).

### The verification slices (one per session, in order — Block A)

#### Slice V1 — Schema: `PassportClaimType` + `PassportClaimRequest.type` + migration

- **What:** add `enum PassportClaimType { IDENTITY RANK_PROMOTION }`; add `type PassportClaimType @default(IDENTITY)`
  to `PassportClaimRequest` (schema.prisma:2985). **Hand-author the migration** (additive: new enum + a
  non-null column with a default; existing rows backfill to `IDENTITY` via the default — no data migration).
  Read `schema-migration.md` + `[[prisma-prod-migration-flow]]` first; commit the file (auto-applies on deploy).
- **Done:** `prisma validate` + generate clean; migration applies on a fresh DB; existing claims read `IDENTITY`.
- **Gate:** typecheck · `prisma validate` · wiki:lint 0. Schema PR → human review.

#### Slice V2 — `submitRankPromotionClaim` oRPC (member, own-passport) + evidence soft-gate

- **What (own-Passport `authedProcedure`):** `submitRankPromotionClaim({ rankId, note?, instructorRef?,
  evidence[] })` — creates a `PassportClaimRequest { type: RANK_PROMOTION, passportId (own), claimedRankId,
  claimantUserId, brand, node/tree context, evidence }`. **Guards:** own passport only; `claimedRank.sortOrder >
  verified ceiling` (you cannot file a promotion for a belt you already hold — that's backfill, Slice V4); **one
  open `RANK_PROMOTION` per passport** (reject a second open one). Evidence photos via R2 → `PassportClaimEvidence`
  (soft-gate: allowed to submit without, but the form prompts). Reuse `submitPassportClaim`'s core, branch on type.
- **Done + Gate:** procedure + Zod in/out + rateLimit meta; unit tests (own-only · above-ceiling-only · one-open ·
  submit-without-photo allowed). typecheck · oxlint/oxfmt · tests · next build · wiki:lint 0 · fallow 0.

#### Slice V3 — Branch `finalizePassportClaim` for `RANK_PROMOTION`

- **What:** in `claim-finalize.ts` branch on `claim.type`. **`RANK_PROMOTION`:** assert `passport.userId != null`
  (already owned → **no** `attachAccount`); `mintAssertedRankAward(claimedRankId)` → `VERIFIED` (reuse existing);
  **materialize `PassportClaimEvidence` → `RankMilestone` media** (`certificate`/`instructor`) on the minted
  award's milestone (create the milestone if absent — presupposes the fact, epic Locked-decision 1); **idempotent
  comp** (grant only if absent); if `node.isVerified == false` (first-claim self-registrant) → flip it + run the
  `trainedUnder`/tree branches (reuse). **`IDENTITY`:** unchanged (full attach). Reject/needs-info path unchanged.
- **Done + Gate:** promotion-finalize creates exactly the `VERIFIED` award + milestone media + (conditionally)
  the node flip; an already-verified member's promotion does **not** re-attach/re-comp. Tests for both branches.
  Full gate.

#### Slice V4 — Rework the held belt CRUD to B1 (remove UNVERIFIED-award creation; gate to backfill)

- **What (supersedes epic Slice 3's `upsertBeltMilestone`/`updateRankAwardFact`/`setPassportRank`):**
  - **Backfill mint (C-implied):** ensuring a `RankAward` for enrichment mints it **`VERIFIED`** (`source:
    STATED`) **only when `sortOrder ≤ verified ceiling`**; above-ceiling **throws** (UI routes to Slice V2).
  - **Delete `setPassportRank`'s ungated path** (onboarding/actions.ts:19) — repoint its onboarding caller: a
    brand-new member's first rank = a `RANK_PROMOTION` claim (pending), not an ungated award.
  - **Fact-edit rule:** date/promoter/school are member-editable on **self-added backfill awards** (their own
    enrichment); **read-only** on `IMPORTED` and instructor-approved (`RANK_PROMOTION`-minted) awards. (Mark the
    editable-source distinction — `awardedByPassportId == null && source == STATED && not from a claim`. Pick the
    cleanest marker at build; the epic's "UNVERIFIED-only" rule no longer applies since no UNVERIFIED awards exist.)
  - **Belt card states:** at/below ceiling → Add/Completed (enrichable); **above ceiling → "Locked — request
    promotion"** CTA opening the Slice V2 flow (replaces the epic's editable-UNVERIFIED-award card).
- **Done + Gate:** hard invariant tests — cannot mint above ceiling · cannot edit an imported/approved award's
  fact · above-ceiling card shows the promotion CTA not an edit form · no code path creates an `UNVERIFIED` award.
  Full gate.

#### Slice V5 — `/app/claims` queue + review UI carries `RANK_PROMOTION`

- **What:** extend the claims queue query + review surface to list `RANK_PROMOTION` claims (show the asserted
  belt swatch + evidence photos + claimant); wire **Approve / Needs-info / Deny** to the Slice V3 finalize.
  Reuse the resource-scoped `claim.review` gate so a student's RBAC-instructor sees their students' promotions
  (node/tree-scoped), and `claims.manage` for global admins. Notify the member on decision (reuse the claim
  notification seam; **no autonomous email beyond the existing claim-decision notice**).
- **Done + Gate:** an instructor with `claim.review` on the student's tree can approve a promotion → award +
  milestone appear; a non-scoped user cannot. Full gate.

#### Slice V6 — Verify (Doug proof gate — the launch-safety bar)

- **What (Playwright behavior + source proof):** (1) a self-declared belt **never renders as verified** anywhere
  (there is no award until approved); (2) promotion end-to-end — submit (± photo) → queue → RBAC-instructor
  approve → **`VERIFIED`** award + milestone media + ceiling rises; (3) **zero regression** to the awarded-truth
  rank display (0474/0475) — tree/drawer/directory belts unchanged, **no per-belt pill** (ADR 0035 §5 reaffirmed,
  no double-badge); (4) `setPassportRank` above-ceiling is rejected; (5) RBAC scope — a non-instructor cannot
  approve. **This slice is the gate that unholds #178–#181.**
- **Done + Gate:** green gates + all five proofs + the drafted ADR 0035 amendment finalized to `accepted`.

### Reworks to the held slices (what B1 changes in #178–#181 before they merge)

- **Slice 2 (`RankMilestone`)** — unchanged (still 1:1 with `RankAward`, cascade). ✅ Keep.
- **Slice 3 (belt oRPC)** — `upsertBeltMilestone` / `updateRankAwardFact` / `setPassportRank` **reworked by
  Slice V4** (mint `VERIFIED`-implied ≤ ceiling; no `UNVERIFIED` awards; above-ceiling → claim). The epic's
  "`UNVERIFIED`-only fact edit" rule is **retired**.
- **Slice 4 (`BeltEditCard`/grid)** — the above-ceiling card becomes **"Locked — request promotion"** (CTA →
  Slice V2), not an editable card that mints an `UNVERIFIED` award. Locked-state copy already exists; repoint the
  action.
- **Slice 5 (tab mount)** — unchanged mount; the read-model already reads awarded truth (all `VERIFIED`/`IMPORTED`).
- **Also carried from SESSION_0484 (non-verification, apply during the belt-PR rebase):** country round-trip
  data-loss fix, `Hint`→`Note`, first-run empty state; flywheel/CRM hardening (partial-unique index on normalized
  school name, atomic `demandCount`, scope fuzzy match to placeholder orgs), `/app/leads-pipeline` nav link.

### Verification-block parallelism

- **V1 first** (schema). **V2 + V3** after V1 (V3 needs the type; V2/V3 can pair). **V4** after V1 (independent of
  V2/V3 — it's the belt-CRUD rework; coordinate the `RankAward`-ensure change with V3's mint). **V5** after V3
  (queue wires the finalize). **V6** last (proof). One coherent lane — do inline; no fan-out.

## When the plan is exhausted — hand back

After Slice 6, **stop and hand back** (do not invent work). The operator reviews the stacked PRs (merge
bottom-up into `main`), then designs + unlocks Slice 7 (agent-driven lead automation). Ping via
`scripts/notify.sh` if configured.

**Belt-verification block (V1–V6):** designed + grill-ratified at **SESSION_0486** (parent SESSION_0484); Block A
builds it, then rebases + unholds #178–#181 through the Slice V4 reworks. Do **not** build V1–V6 and the design
pass concurrently — the design pass (0486) runs first; this block is its output.
