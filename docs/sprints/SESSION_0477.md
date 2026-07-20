---
title: "SESSION 0477 — Belt Journey: RankMilestone model + member belt-by-belt edit cards (G-004 N2)"
slug: session-0477
type: session--implement
status: closed
created: 2026-06-30
updated: 2026-06-30
last_agent: claude-session-0476
sprint: S49
pairs_with:
  - docs/product/black-belt-legacy/BBL_PARITY_SPEC.md
  - docs/sprints/SESSION_0457.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0477 — Belt Journey: RankMilestone model + member belt-by-belt edit cards (G-004 N2)

> **PRE-STAGED at SESSION_0476's tail** (operator directive: continue the BBLApp dashboard-parity goal — the
> belt-by-belt edit cards gated by highest belt award). **Operator ratified the architecture:** model the
> member's belt enrichment as a **dedicated `RankMilestone`** — "do it right, for scalability / stability /
> clean code / best standards" (WWAD), not a fields-on-`RankAward` shortcut and not a `mediaUrls` Json blob.
> Privacy toggles are **out of scope** (operator). Grounded in a 2-agent discovery (source spec + target
> model). Port method = **read-and-translate** (features-not-pixels, SESSION_0457). The domain model, the
> gating invariant, and the reuse map are embedded below so the build session starts cold-ready.

## Date

2026-06-30 (pre-staged; executes next)

## Operator

Brian + claude-session-0477

## Goal

Give a member a **Belt Journey** surface on their dashboard (`/app/profile`): a grid of belt cards (one per
rank in their discipline) where they enrich each belt they hold — story + journey photos (belt / instructor /
certificate / competition) — and edit the self-reported promotion fact (date / promoter / school). Editing is
gated **up to and including their highest awarded belt**; higher belts are **locked** ("your instructor needs
to promote you"). Built on a new, discipline-neutral **`RankMilestone`** model — the member's enrichment,
cleanly separated from the canonical `RankAward` fact.

## Status

Single source of truth is the frontmatter `status:` field.

## Domain model — the decision this session ratifies (read once)

Two concerns, two lifecycles, two owners → **two models** (SRP; WWAD "model the fact and the expression
separately"). An ADR is authored in TASK_01.

| | `RankAward` (exists) | `RankMilestone` (NEW) |
| --- | --- | --- |
| **Is** | the canonical **promotion FACT** | the member's **enrichment** of reaching that rank |
| **Owner** | system / lineage / instructor | the member |
| **Verification** | `verificationStatus` (part of the trust graph) | none — inherently subjective, never "verified" |
| **Editable by member** | only while `UNVERIFIED` (verified facts are locked) | **always** (it's their scrapbook) |
| **Participates in** | lineage relationships, promotion events, awarded-truth rank display (ADR 0035) | nothing — pure presentation content |
| **Holds** | `awardedAt`, `awardedByPassportId` (promoter), `organizationId` (school), `verificationStatus`, `source` | `story` (narrative) + journey photos via `MediaAttachment` |

- **Relationship:** `RankMilestone` is **1:1 with `RankAward`** (`rankAwardId String @unique`, `onDelete:
  Cascade`). Enrichment presupposes the fact — so "add belt info" for a held-but-unrecorded lower belt first
  upserts a self-reported (`source: STATED`, `verificationStatus: UNVERIFIED`) `RankAward` (gated ≤ ceiling),
  then upserts its milestone. Promotion history stays in **one** canonical place (`RankAward`); the milestone
  never becomes a second source of "what belts does this person hold."
- **Not identity fragmentation (ADR 0025):** `RankMilestone` stores *content* (story, photos), not identity —
  identity stays on `Passport`. This is a content satellite, the same shape as `MediaAttachment`, not a
  person-store.
- **Media:** journey photos are `MediaAttachment` rows on a **new `rankMilestoneId` FK** (the existing
  polymorphic pattern — the table already carries 9 owner FKs), `purpose ∈ {belt, instructor, certificate,
  competition}`. The award fact stays lean. `RankAward.mediaUrls Json?` is **deprecated** (`/// @deprecated`,
  dropped in a later migration) — belt media never touches the blob.
- **Naming:** `RankMilestone` is **discipline-neutral** (BJJ belts, TKD dans, Karate kyu, WEKAF) — the model is
  neutral; the BJJ UX renders "Belt Journey" / "Belt." *(Operator said "belt milestone"; neutral name proposed
  per the scalability directive — see Open decision D1, a trivial rename if overridden.)*

### The gating invariant (the heart of "gated by highest belt award")

Ceiling = `pickTopAwardInDiscipline(awards, disciplineId).rank.sortOrder` (awarded truth, discipline-scoped;
BBL = BJJ). Self-service **cannot inflate the ceiling** because: (1) create/backfill of a `RankAward` is gated
`rank.sortOrder ≤ ceiling`; (2) update-fact never changes a card's `rankId`; (3) delete of the top award is
forbidden; (4) the milestone (always editable) carries no rank authority. A member enriches up to their ceiling
and can never self-promote above it — the ceiling only rises through the separate instructor/verified/claim
flow. Backfilled lower awards are `UNVERIFIED` and (per ADR 0035) display-vestigial, so this does **not** touch
the awarded-truth rank display shipped in 0474/0475.

## Embedded discovery (the reuse map)

**Source (legacy BBLApp — what we translate):** `BBL_PARITY_SPEC.md` §4 (Member Dashboard) + §2 (Belt History);
legacy `../ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/{dashboard/BBLBeltInfoCards,profile/BBLBeltInfoWizard}.jsx`
+ `data/beltInfoSchema.js`. Card = 15-rank grid, status Add/Locked/Completed; edit fields = date, location,
promoted-by, 4 media types; White-belt special-case (date = "when did you start training?", no promoter/location).

**Target (ronin-dojo-app — proven primitives, all in-tree):**

- **Mount:** new "Belts" tab in `apps/web/app/app/profile/page.tsx:54` via `DashboardTabs`
  (`app/(web)/dashboard/tabs.tsx:19`).
- **Award model (rich already):** `RankAward` has `awardedAt`, `awardedByPassportId` (promoter Passport,
  `PromotedByPassport`), `organizationId` (school Org) + `location` fallback, `mediaAttachments[]`,
  `@@unique([passportId, rankId])`. `Rank` has `sortOrder` + `colorHex`.
- **Ceiling resolver:** `pickTopAwardInDiscipline` — `server/web/lineage/node-profile-queries.ts:17`.
- **Write path to reuse:** `setPassportRank` (`server/web/onboarding/actions.ts:19`, upsert on `[passportId,
  rankId]`). Admin create shape: `server/admin/users/actions.ts:112` (`source: STATED`,
  `verificationStatus: UNVERIFIED`).
- **Media attach/detach:** `server/admin/media/actions.ts` (`attachMedia`/`detachMedia`) + R2 +
  `MediaAttachmentManager` (the `PassportEditor` pattern) — generalize to the member-owned milestone.
- **Rank picker (discipline-scoped):** `getBjjRanksForClaimPicker()` — `server/web/lineage/rank-queries.ts:9`.
- **Card + color:** dedicated `BeltEditCard` wrapping L1 `Card` (`components/common/card.tsx`) + `BeltSwatch`,
  belt color via `--rank-color` from `Rank.colorHex` (ADR 0022; the `m-card` idiom). **No new `m-card` kind**
  (ADR 0040).
- **Mutations:** oRPC `authedProcedure` (`server/orpc/procedure.ts`; ADR 0024 full oRPC).

## Petey plan

> **AUTONOMOUS RUN — READ THIS.** The binding execution spec is
> [`docs/petey-plan-0477-belt-journey-crm-epic.md`](../petey-plan-0477-belt-journey-crm-epic.md), executed
> **one slice per cold session in order** (SESSION_0478 = Slice 1 = the flywheel core, NOT the belt cards). The
> belt-card detail in this section is design context that maps to Slices 2–5 — do **not** build it out of order.
> Do the slice for your session number per the epic plan.

### Goal

Ship the Belt Journey as a new dashboard tab on a clean, discipline-neutral `RankMilestone` model + gated
member oRPC — best-standards, tested, migration-safe, no regression to awarded-truth display.

### Tasks

#### SESSION_0477_TASK_01 — Data model: `RankMilestone` + migration + ADR + ubiquitous language

- **What:** add `model RankMilestone { id; rankAwardId String @unique; story String?; createdAt; updatedAt;
  media MediaAttachment[] }` (1:1 with `RankAward`, `onDelete: Cascade`). Add `rankMilestoneId String?` + the
  relation to `MediaAttachment` (mirror the existing polymorphic FK pattern + `@@index`). Mark
  `RankAward.mediaUrls` `/// @deprecated`. **Hand-author the migration** (additive: new table + nullable FK —
  no enum casts, non-breaking; committed → auto-applies on deploy, per `[[prisma-prod-migration-flow]]`).
- **Also:** author `docs/architecture/decisions/00NN-rank-award-fact-vs-member-milestone.md` (the fact/
  enrichment separation) + add **RankMilestone / Belt Journey** to `docs/architecture/ubiquitous-language.md`.
- **Done means:** `prisma validate` + generate clean; migration applies on a fresh DB; ADR + glossary landed.
- **Depends on:** nothing.

#### SESSION_0477_TASK_02 — oRPC: gated member belt CRUD (fact + milestone + media)

- **What (own-Passport, `authedProcedure`, all gated `sortOrder ≤ ceiling`):**
  - `upsertBeltMilestone(rankId, { story })` — ensures the `RankAward` exists (self-report upsert if missing,
    UNVERIFIED, gated), then upserts its `RankMilestone`. Returns the enriched card view.
  - `updateRankAwardFact(rankAwardId, { awardedAt, promoter, school })` — **only if `UNVERIFIED`** (verified →
    403); never changes `rankId`.
  - `attachMilestoneMedia` / `detachMilestoneMedia(rankMilestoneId, mediaId, purpose)` — via `MediaAttachment`.
  - `deleteRankAward(rankAwardId)` — **forbid the top award**; cascade the milestone.
- **Best-standards:** Zod in/out contracts, resource permission + rateLimit meta, `revalidate(["/app/profile"])`,
  ownership assertion (member edits only their own Passport). **Unit-test the invariant hard** — cannot
  create/edit above ceiling, cannot edit a verified fact, cannot delete the top award.
- **Done means:** procedures + passing gate/verification/ownership tests.
- **Depends on:** TASK_01.

#### SESSION_0477_TASK_03 — `BeltEditCard` + `BeltJourneyGrid` (presentation)

- **What:** dedicated `BeltEditCard` (wraps L1 `Card`; belt color via `--rank-color`; status badge Add /
  Locked / Completed derived from award+milestone presence; locked = disabled + `opacity-70` + tooltip). A
  `BeltJourneyGrid` rendering one card per discipline rank in `sortOrder`, `locked = sortOrder > ceiling`.
- **Reuse:** L1 `Card`, `BeltSwatch`, the `--rank-color` idiom. NOT a new `m-card` kind (ADR 0040).
- **Done means:** grid renders every rank with correct Add/Locked/Completed from real data.
- **Depends on:** nothing (parallel with TASK_01/02 — pure component; mock the read view).

#### SESSION_0477_TASK_04 — Edit surface (form) + media, wired to oRPC

- **What:** the add/edit surface from an unlocked card — **fact fields** (date, promoter, school) editable only
  when `UNVERIFIED` (else read-only with a "verified" note); **milestone fields** (story + the 4 media
  galleries) always editable. White-belt special-case. Media via R2 + `MediaAttachmentManager` →
  `attachMilestoneMedia`. (Open decision D2: compact form vs stepped wizard — recommend compact.)
- **Done means:** a member fills/updates a belt; saves via TASK_02; re-render shows Completed; verified facts
  are read-only.
- **Depends on:** TASK_02 + TASK_03.

#### SESSION_0477_TASK_05 — Mount the "Belts" tab + wire ceiling + discipline scope

- **What:** insert the "Belts" tab into `app/app/profile/page.tsx`; server-load the member's awarded ranks +
  `memberTopRank` (BJJ-scoped) + the discipline rank list + milestones; pass the ceiling + per-card state.
- **Done means:** tab live on `/app/profile`, gated + BJJ-scoped, one query pass (no N+1).
- **Depends on:** TASK_03 + TASK_04.

#### SESSION_0477_TASK_06 — Verify (proof gate)

- **What:** Playwright behavior-parity (NOT pixel): enrich a belt ≤ ceiling; belt above ceiling locked;
  verified-fact read-only; delete-top blocked; media attaches. `bun run build` + full `bun run test` + lint
  (app-code → CI + BBL prod deploy). **Prove no regression to the awarded-truth rank display** (0474/0475) —
  the tree/drawer/directory belt must be unchanged.
- **Done means:** green gates + behavior proof + ceiling-integrity + zero display regression.
- **Depends on:** TASK_05.

### Parallelism

- **TASK_01 (schema/migration/ADR)** first (everything else needs the model). **TASK_03 (component)** runs in
  parallel with TASK_01/02 (mock the read view). **TASK_02 (oRPC)** after TASK_01. **TASK_04 → 05 → 06**
  sequential. App-code lane → `build` + full `test` before proposing the push (fires CI + BBL prod deploy).

### Open decisions (resolve at bow-in — recommendations inline)

- **D1 — model name `RankMilestone` (neutral) vs literal `BeltMilestone`.** *Rec: `RankMilestone`* (multi-
  discipline scalability, per your WWAD directive); UX renders "Belt Journey." Trivial rename if you prefer literal.
- **D2 — edit UX: compact form vs BBLApp's 7-step wizard.** *Rec: compact form* — keep the fields, drop the
  one-field-per-step ceremony.
- **D3 — promoter capture: freetext vs verified-instructor autocomplete (that's G-004 N1).** *Rec: `awardedByPassportId`
  when picked from verified instructors + text fallback (`notes`/a small `promoterName`); wire the N1 creatable-
  combobox as a fast-follow.*
- **D4 — media `purpose`: string convention vs a typed enum.** *Rec: documented string convention on the shared
  `MediaAttachment.purpose` (an enum there would wrongly constrain all attachment types).* No enum migration.

### Risks

- **Ceiling integrity is the feature** — the 4 guards (create ≤ ceiling · no `rankId` change on update ·
  no-delete-top · milestone carries no authority) are mandatory; unit-test them hard. Without them a member
  self-promotes.
- **Migration safety** — additive only (new table + nullable FK); hand-author, commit the file (prod
  auto-applies on the Vercel build — a missing file = prod applies nothing; a bad file fails the build). No
  enum casts here, so low risk. `[[prisma-prod-migration-flow]]`.
- **Don't regress awarded-truth display** — belt cards WRITE the `RankAward`s that `memberTopRank` reads; a bug
  in ordering/top-selection corrupts the belt shown across tree/drawer/directory (the 0474 Meyer/Casey class).
  TASK_06 must prove zero display change.
- **Verified-fact lock** — a member must NOT edit the date/promoter/school of a VERIFIED award (would corrupt a
  trusted fact); only `UNVERIFIED` facts are member-editable. Enforce server-side, not just UI.
- **`@@unique([passportId, rankId])`** — "add belt" upserts, never blind-creates (re-add of a held rank = edit).
- **Discipline scope** — ceiling via `pickTopAwardInDiscipline` (BBL = BJJ); a multi-discipline member's BJJ top,
  not a global TKD rank (the 0475 fix). MVP = BJJ only.

### Scope guard

- **In:** `RankMilestone` model + migration + ADR; member-gated oRPC (fact + milestone + media); `BeltEditCard`
  + grid + edit form; "Belts" tab; BJJ discipline; verify.
- **Out (defer):** privacy/visibility toggles (**operator: not needed**), multi-discipline, admin-edit of a
  member's belts, the verified-instructor autocomplete (N1 — separate), the stepped wizard, a separate profile
  "Belt History" tab (dashboard tab first), dropping `mediaUrls` (deprecate now, drop later).
- **No shortcut fields** — belt data goes through `RankMilestone` + the proper `RankAward` relations
  (`awardedByPassportId`, `organizationId`, `MediaAttachment`), never the `mediaUrls`/`notes`/`location`
  overloads. If something genuinely won't model cleanly, STOP and raise it.

## Cody pre-flight

<!-- cody-preflight.md before code. Prior art: setPassportRank (onboarding/actions.ts:19), pickTopAwardInDiscipline
(node-profile-queries.ts:17), attachMedia/detachMedia (server/admin/media/actions.ts), getBjjRanksForClaimPicker
(rank-queries.ts:9), m-card.tsx (--rank-color), DashboardTabs (dashboard/tabs.tsx), PassportEditor +
MediaAttachmentManager. Schema: model RankAward + MediaAttachment already carry the polymorphic pattern to mirror. -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0477_TASK_01 | pending | `RankMilestone` model (1:1 RankAward) + `MediaAttachment.rankMilestoneId` + migration + ADR + ubiquitous language; deprecate `mediaUrls` |
| SESSION_0477_TASK_02 | pending | Gated member oRPC — upsertBeltMilestone / updateRankAwardFact (UNVERIFIED-only) / attach-detach media / deleteRankAward (not top); invariant tests |
| SESSION_0477_TASK_03 | pending | `BeltEditCard` + `BeltJourneyGrid` (L1 Card + `--rank-color`; Add/Locked/Completed) |
| SESSION_0477_TASK_04 | pending | Edit form (fact fields UNVERIFIED-editable + milestone always) + media via R2 |
| SESSION_0477_TASK_05 | pending | Mount "Belts" tab on `/app/profile` + wire ceiling + BJJ discipline scope (one query pass) |
| SESSION_0477_TASK_06 | pending | Verify — Playwright behavior-parity + build/full-test/lint; ceiling-integrity + zero awarded-truth regression |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- D1–D4 above to resolve at bow-in (recommendations given). Privacy toggles ruled OUT by operator.

## Next session

> **ANCHOR for the overnight autonomous run.** The authoritative sliced spec is
> **[`docs/petey-plan-0477-belt-journey-crm-epic.md`](../petey-plan-0477-belt-journey-crm-epic.md)** — its
> locked decisions + per-slice steps are BINDING for the headless sessions (they cannot grill). Driver:
> `scripts/auto-session-codex.sh 6` (Slices 1–6: flywheel → schema → oRPC → components → tab → BBL CRM board;
> Slice 7 agent-automation is a HARD STOP).

### Goal

Execute **Slice 1** of `docs/petey-plan-0477-belt-journey-crm-epic.md` — the school-leads flywheel core
(`lib/dedup.ts` + `emitSchoolLead()` + retrofit the leaking join wizard). Schema-free, high-leverage, independent.

- **Inputs to read:** `docs/petey-plan-0477-belt-journey-crm-epic.md` (locked decisions + Slice 1), then the
  Slice 1 files (`server/web/lead/public-actions.ts`, `server/admin/leads/*`, `components/common/creatable-combobox.tsx`).
- **First task:** implement Slice 1 exactly as specified; write the SESSION task IDs + Cody pre-flight FIRST;
  full bow-out; commit only (the wrapper opens the PR). At bow-out, set the next SESSION's `Next session` → Slice 2.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
