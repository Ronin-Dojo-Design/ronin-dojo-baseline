---
title: "SESSION 0579 — G-022 Lane C: grappling curriculum data at scale (Judo adoption + AABB guard + grappling-scope ADR)"
slug: session-0579
type: session--open
status: closed
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0579
sprint: S12
lane: bbl
lane_seq:
vault_session:
goal_ids: [G-022]
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0578.md
  - docs/sprints/SESSION_0582.md
  - docs/epics/technique-graph-ga-fanout.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0579 — G-022 Lane C: grappling curriculum data at scale (Judo adoption + AABB guard + grappling-scope ADR)

## Date

2026-07-19

## Operator

Brian + claude-session-0579

## Goal

LANE C of the G-022 fan-out ("Technique graph out of beta"), planned at SESSION_0578, dispatched
by Petey from SESSION_0582. Adopt Judo (Kodokan Gokyo no Waza, first 20 throws) from the
read-only monorepo into the grappling curriculum system alongside the existing BJJ import; add
the additive `nativeName`/`aliases` Technique columns; add a zero-AABB-overlap guard to the
importer's seed/verify path (AUD2-6); live-verify AUD2-11 (curriculum level tab titles); write the
grappling-arts scope ADR (BLOCKING merge-gate for this lane, Giddy close condition). Merge order
C→B→A — this lane lands FIRST.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0578.md` (Petey plan: G-022 fan-out ratified, three
  lane prompts committed verbatim) + `docs/epics/technique-graph-ga-fanout.md` (lane owned-file
  sets, disjointness proof, merge order C→B→A) + `docs/sprints/SESSION_0582.md` (dispatch context;
  Lane C launched as the first fan-out lane after the SESSION_0582 mmb-import merge landed on
  `origin/main`).
- Carryover: SESSION_0578 opened G-022 and ratified the grappling-arts scope amendment (BJJ +
  judo + wrestling takedowns; no striking/weapons) as a grill outcome; this lane executes the
  monorepo-harvest axis (data adoption) and owes the ratifying ADR as a blocking merge-gate.

### Branch and worktree

- Branch: `session-0579-grappling-data`
- Worktree: `/Users/brianscott/dev/ronin-0579` (bootstrapped fresh: canonical `apps/web/.env`
  copied, `bun install` 756 packages, `prisma generate` for `apps/web`; `apps/baseline`'s own
  generated Prisma client was ALSO missing in this fresh worktree — generated it too, with a
  placeholder `DATABASE_URL`, purely so the repo-wide `bun run typecheck` gate could run to
  completion; this is a pre-existing per-worktree bootstrap gap unrelated to this lane's diff, not
  a fix owned by this lane).
- Status at bow-in: clean (reservation branch `session-0579-grappling-data` had zero unique
  commits vs `main`; reset to `origin/main` post-SESSION_0582-merge before starting).
- Current HEAD at bow-in: `9f3f4696` (= `origin/main`, "Merge branch 'session-0582-mmb-import'")

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (schema + migration), content seed/import scripts |
| Extension or replacement | Extension: extends the existing `import-bbl-bjj-curriculum.ts` seed idiom (findFirst-or-create disciplines, `Style` rows scoped to a discipline, manual partial-unique-index upsert) — no new pattern invented |
| Why justified | Judo modeling reuses the discipline/style idiom already present in `prisma/seed.ts` (Karate substyles); the two new Technique columns are additive/nullable-or-defaulted, hand-authored per the shared-local-DB migration rule |
| Risk if bypassed | A parallel taxonomy for Judo (new models) would fragment the discipline/rank system the platform already seeds |

Live docs checked during planning: Prisma schema (Technique/Discipline/Style/RankSystem/Rank/
Course/CurriculumItem), `prisma/seed.ts` (existing Judo discipline + Kodokan Kyu-Dan rank system,
Karate-substyle `Style` idiom), `server/web/curriculum/queries.ts` (read-only — the
`keyPointsFromNotes`/`bodyDescription`/`sourceField` parse contract this lane's `notes` format
must preserve; Lane A's file, never edited).

### Graphify check

- Graph status: worktree reads 0 nodes by design (fresh worktree — not a negative signal per
  SESSION_0578/0470 precedent). Canonical checkout not queried this session — file-level reads
  (schema, seed, importer, epic/ledger docs) were sufficient for a single-file-extension lane.
- Verification note: every claim below (technique/course/curriculum-item counts, graph
  slug-coverage, discipline/style rows) was verified against the local DB and the actual JSON
  payloads, not asserted from the prompt's inherited claims — see the correction under "Decisions
  resolved" (98 vs 80 BJJ techniques).

## Bow-in grill (resolved by the operator pre-dispatch, pinned — not re-opened this session)

Per the SESSION_0582 dispatch, the three-question bow-in grill named in the SESSION_0578 lane
prompt was already resolved by the operator and pinned into this lane's dispatch instructions:

1. **Japanese names:** additive hand-authored migration — `Technique.nativeName String?` +
   `Technique.aliases String[] @default([])`. Landed this session.
2. **Judo modeling:** its own discipline/style rows, following the existing idiom — reused the
   `Discipline` row already seeded system-wide (`prisma/seed.ts`, slug `judo`, its own Kodokan
   Kyu-Dan `RankSystem`); added ONE new `Style` row (`kodokan` / "Kodokan Judo") scoped to that
   discipline, mirroring the only prior `Style` precedent (Karate substyles). No parallel
   taxonomy invented.
3. **Graph tag:** judo rows do NOT get the graph tag now — Library-dark for the graph until Lane
   A adds layout slots. The importer's judo path never reads `bbl-bjj-graph.json`.

## Petey plan

### Goal

Land the grappling curriculum data adoption (Judo) + the additive schema delta + the AABB-overlap
guard + the grappling-scope ADR, verified against the live local DB, then hand off to Lane B.

### Tasks

#### SESSION_0579_TASK_01 — Ground-truth the harvest inventory's counts against the actual source files

- **Agent:** Cody (inline)
- **What:** Before writing the transform, directly count techniques in `bjj.js` and throws in
  `judo.js` rather than trusting the SESSION_0578/prompt figures.
- **Done means:** verified counts recorded (see "Decisions resolved" — the "98-technique trunk"
  claim did not hold; ground truth is 80).
- **Depends on:** nothing

#### SESSION_0579_TASK_02 — Hand-authored additive migration: `nativeName` + `aliases`

- **Agent:** Cody (inline)
- **What:** Add the two columns to `Technique`, write the SQL by hand in a new migration dir,
  apply via `prisma migrate deploy` (never `migrate dev`), regenerate the client.
- **Done means:** `prisma migrate status` reports "up to date"; client regenerated.
- **Depends on:** nothing

#### SESSION_0579_TASK_03 — Node/TS transform script (shown before running)

- **Agent:** Cody (inline)
- **What:** `prisma/transform-grappling-source.ts` — reads the read-only monorepo `bjj.js` +
  `judo.js` via a sandboxed `vm` eval (no `require`, no Node globals exposed beyond a stubbed
  `ACCESS_LEVELS`), writes `prisma/data/bbl-judo-curriculum.json` (new) and re-verifies
  `bbl-bjj-curriculum.json` (unchanged — see Task 01 finding).
- **Done means:** script runs, both JSON payloads verified against source counts.
- **Depends on:** SESSION_0579_TASK_01

#### SESSION_0579_TASK_04 — Extend the importer: Judo import path + AABB-overlap guard

- **Agent:** Cody (inline)
- **What:** Extend `import-bbl-bjj-curriculum.ts` with `importJudo()` (discipline/style/org-link/
  category/tag/course/curriculumItem/technique/link, no graph, no fabricated prerequisites) and
  `verifyGraphNodeAabbNoOverlap()` (read-only guard against `bbl-bjj-graph.json`, run at the top of
  `main()`).
- **Done means:** importer runs twice with identical counts (idempotency proof); AABB guard PASSes
  against the current 61-node layout.
- **Depends on:** SESSION_0579_TASK_02, SESSION_0579_TASK_03

#### SESSION_0579_TASK_05 — Live-verify AUD2-11 (curriculum level tab titles)

- **Agent:** Cody (inline)
- **What:** Dev server (`cd apps/web && npx next dev --turbo -p 3579`), fetch `/curriculum`,
  confirm the level-tab visible labels are human names, not rank codes.
- **Done means:** verified — see "Decisions resolved". No seed-side retitle needed.
- **Depends on:** SESSION_0579_TASK_04

#### SESSION_0579_TASK_06 — Grappling-arts scope ADR (blocking merge-gate)

- **Agent:** Cody (inline)
- **What:** `docs/architecture/decisions/0050-grappling-arts-technique-scope.md` — ratifies BJJ +
  judo + wrestling takedowns, no striking/weapons; supersedes the port epic's BJJ-only line
  (already stamped forward at SESSION_0578).
- **Done means:** ADR committed, next free number (0050) claimed.
- **Depends on:** nothing (documents an already-ratified decision)

#### SESSION_0579_TASK_07 — Gates + close

- **Agent:** Cody (inline)
- **What:** typecheck, lint:check, format:check, test, next build, idempotency proof, session
  record, close.
- **Done means:** all gates green or honestly flagged; commit locally; HOLD at push gate.
- **Depends on:** all above

### Parallelism

Sequential — single-lane, single-file-extension session; no sub-agent fan-out needed.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0579_TASK_01–07 | Cody | small, disjoint, single-owner file set; no planning fork needed beyond the already-pinned grill |

### Open decisions

None — the three bow-in grill questions were pre-resolved by the operator at dispatch (see "Bow-in
grill" above).

### Risks

- Sibling lanes 0580/0581 are LIVE in their own worktrees on this same machine (extreme system
  load observed: load average ~500 with 3 concurrent worktree typechecks) — mitigated by touching
  only this lane's owned files and never their worktrees/processes.

### Scope guard

- No edits to `components/*`, `app/(web)` pages, `server/web/*` (Lane A/B territory).
- No edits to `bbl-bjj-graph.json` (read-only; Lane A writes it).
- No wrestling authoring (no dataset exists — ledgered as a G-022 child, not built this session).
- No striking/weapons/PII data adoption (REJECTED per the harvest inventory).
- No push/PR/deploy without the operator's explicit go.

### Dirstarter implementation template

- **Docs read first:** `docs/epics/technique-graph-ga-fanout.md`, `docs/sprints/SESSION_0578.md`,
  goals-ledger G-022, `prisma/schema.prisma`, `prisma/seed.ts`, `server/web/curriculum/queries.ts`
  (read-only, parse-contract check)
- **Baseline pattern to extend:** `import-bbl-bjj-curriculum.ts`'s existing discipline/style/
  course/curriculum-item/technique upsert idiom
- **Custom delta:** Judo-specific field mapping (Japanese names/aliases, Gokyo grouping) + the
  AABB-overlap verify-only guard
- **No-bypass proof:** no new models, no new taxonomy, no new migration pattern — extends the
  existing hand-authored-migration + partial-unique-index-manual-upsert idioms already in this
  file

## Cody pre-flight

### Pre-flight: extend `import-bbl-bjj-curriculum.ts` + schema migration

#### 1. Existing component scan

- N/A — Prisma seed/import script, not a UI component. Scanned `prisma/seed.ts` and the existing
  importer for the discipline/style/rank/course/curriculum-item idiom instead (see "Baseline
  pattern to extend" above).

#### 2. L1 template scan

- Not applicable — no UI surface touched this lane.

#### 3. Composition decision

- Reused: `Discipline` (existing seeded Judo row), `RankSystem`/`Rank` (existing seeded Kodokan
  Kyu-Dan system), the Karate-substyle `Style` idiom (new `kodokan` row, same shape).
- New: `importJudo()`, `verifyGraphNodeAabbNoOverlap()`, `transform-grappling-source.ts`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0578 §"Next session" + the committed Lane C
  prompt).
- ADR read/written: `docs/architecture/decisions/0050-grappling-arts-technique-scope.md` (new,
  this session).
- Runbook consulted: `docs/runbooks/database/schema-migration.md` (hand-authored-migration flow).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo -p 3579` (AUD2-11 live-verify only;
  stopped after verification).
- Working directory: `/Users/brianscott/dev/ronin-0579`
- Brand/host for testing: local `localhost:3579` (BBL, `/curriculum`).

#### 6. FAILED_STEPS check

- Prior failures in this area: none specific to this importer.
- Mitigation acknowledged: FS-0031 (e2e DB is hermetic, not prodsnap) noted but not touched —
  this lane ran against the shared local dev DB per the standing gotcha (parallel sessions share
  ONE local DB; `migrate dev` is banned for exactly this reason).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0579_TASK_01 | landed | Ground-truthed `bjj.js`: 80 techniques across 5 populated levels (1,2,3,5,9), NOT 98 — the "98-technique trunk" figure inherited from SESSION_0578/the prompt does not hold against the source file (verified three ways: `description:` count, `accessLevel:` count, and the transform script's own eval). `judo.js`: 20 throws confirmed (Gokyo groups Dai-ikkyo/Dai-nikyo/Dai-sankyo-first-4, 8+8+4). |
| SESSION_0579_TASK_02 | landed | Migration `20260719000000_add_technique_native_name_aliases` (additive: `nativeName TEXT`, `aliases TEXT[] NOT NULL DEFAULT '{}'`) applied via `prisma migrate deploy`; client regenerated. |
| SESSION_0579_TASK_03 | landed | `prisma/transform-grappling-source.ts` written and run; `bbl-bjj-curriculum.json` re-verified byte-for-byte content-identical to the existing file (reverted the whitespace-only diff — no real BJJ content change); `bbl-judo-curriculum.json` written (3 levels, 20 throws, all with `nativeName`/`aliases`/`englishName`/`avoidWhen`). |
| SESSION_0579_TASK_04 | landed | `importJudo()` + `verifyGraphNodeAabbNoOverlap()` added to `import-bbl-bjj-curriculum.ts`. Two consecutive runs produced identical counts (idempotency proof — see Verification). AABB guard: PASS, 61 nodes, 0 overlaps. |
| SESSION_0579_TASK_05 | landed | Live-verified `/curriculum` on the dev server: level-tab visible labels are human names ("White Belt - Fundamentals", "White Belt - 1 Stripe", "White Belt - 2 Stripes", "Blue Belt", "Purple Belt") — rank shortNames (W0/W1/W2/BL0/P0) appear ONLY in the `aria-label` accessible-name suffix, never as the visible tab text. AUD2-11 does NOT manifest for the currently-seeded BJJ levels; no seed-side retitle needed. |
| SESSION_0579_TASK_06 | landed | ADR 0050 written and committed; the port epic's forward-pointing stamp (added at SESSION_0578) now resolves to a real file. |
| SESSION_0579_TASK_07 | landed | Gates run — see Verification. |

## What landed

- Judo adoption: 20 Kodokan Gokyo throws imported as `Technique` rows (discipline `judo`, style
  `kodokan`), 3 `Course` rows (Beginner/Intermediate/Advanced), 20 `CurriculumItem` rows, 20
  `TechniqueCurriculumLink` rows. Library-dark for the graph (no `bbl-bjj-graph.json` edit, no
  fabricated `TechniquePrerequisite` rows).
- Additive schema: `Technique.nativeName String?`, `Technique.aliases String[] @default([])`
  (hand-authored migration, `prisma migrate deploy`, never `migrate dev`).
- `prisma/transform-grappling-source.ts` — the shown-before-run node/TS harvest transform.
- `verifyGraphNodeAabbNoOverlap()` — a zero-AABB-overlap guard now running at the top of every
  importer invocation (AUD2-6 Lane C share).
- ADR 0050 — the grappling-arts technique scope amendment, ratifying and superseding the port
  epic's BJJ-only line (blocking merge-gate satisfied).
- Live-verified, corrected two inherited claims from the SESSION_0578 harvest inventory / prompt
  (see "Decisions resolved").

## Decisions resolved

- **Ground-truth correction — BJJ technique count.** `bjj.js` contains **80** techniques across 5
  populated levels (1, 2, 3, 5, 9 of a nominal 15-level `BJJ_LEVELS` ladder metadata table — the
  other 10 levels have belt/color/name metadata only, no curriculum content). The SESSION_0578
  harvest inventory and this lane's own dispatch prompt both cite "98-technique trunk." That
  figure over-counts by including each level's SECTION-object `id` fields (which share the
  `bjj-l\d+-...` id shape technique objects use) alongside the actual technique entries — the same
  miscounting mistake this session initially made and caught before it entered any output. The
  existing `bbl-bjj-curriculum.json` (80 techniques) is therefore **already the full, faithful
  trunk** — re-generating it from source via the transform produced byte-identical content (only
  JSON-array-formatting whitespace differed), so that regenerated file was reverted rather than
  committed as a no-op diff. **No BJJ content changed this session; only Judo was added.** This
  correction should be applied to G-022's Lane C description at the ledger sweep (see "Proposed
  ledger edits").
- **~14 "dark graph slugs" — already resolved in this DB, unrelated to this session's work.**
  Direct query against the local dev DB (`ronindojo_prodsnap`) found **zero** of the 61
  `bbl-bjj-graph.json` node slugs missing a published `Technique` row — all 61 already had
  matching rows (created by a prior run of this same importer) before this session began. The
  `TechniquePrerequisite` count (75) already matched the graph's edge count (75) at bow-in too.
  This lane's importer re-ran idempotently over that existing state (see Verification) rather than
  performing a backfill, because there was nothing left to backfill. (SESSION_0578's "~47
  DB-rendered vs 61 total" audit finding is a Lane A render-layer question, not a DB-completeness
  gap — this session confirms the underlying data side of that finding is closed.)
- **AUD2-11 (curriculum level tabs)** — live-verified NOT reproducing; no data change needed (see
  Task 05).
- **Judo Style modeling** — one new `Style` row (`kodokan`, "Kodokan Judo") scoped to the existing
  `judo` `Discipline`, per the bow-in grill's pre-resolved answer (mirrors the only existing
  `Style` precedent — Karate substyles in `prisma/seed.ts`).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Additive: `Technique.nativeName String?`, `Technique.aliases String[] @default([])`. |
| `apps/web/prisma/migrations/20260719000000_add_technique_native_name_aliases/migration.sql` | New hand-authored migration (2 `ALTER TABLE ... ADD COLUMN`, both nullable/default). |
| `apps/web/prisma/transform-grappling-source.ts` | New — sandboxed `vm`-eval transform: read-only monorepo `bjj.js`/`judo.js` → `prisma/data/*.json`. |
| `apps/web/prisma/data/bbl-judo-curriculum.json` | New — 3 levels, 20 Kodokan throws, with `nativeName`/`aliases`/`englishName`/`avoidWhen`. |
| `apps/web/prisma/data/bbl-bjj-curriculum.json` | Unchanged (regenerated then reverted — byte-identical content; see Decisions resolved). |
| `apps/web/prisma/import-bbl-bjj-curriculum.ts` | Extended: `importJudo()`, `ensureJudoDiscipline()`, `ensureJudoStyle()`, `judoRankShortNameForLevel()`, `ensureJudoRankId()`, `notesForJudoTechnique()`, `flattenJudoCurriculum()`, `verifyGraphNodeAabbNoOverlap()`; wired both into `main()`. |
| `docs/architecture/decisions/0050-grappling-arts-technique-scope.md` | New ADR — blocking merge-gate for this lane. |
| `docs/sprints/SESSION_0579.md` | This session record (new). |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx prisma migrate deploy` (apps/web) | PASS — 1 migration applied (`20260719000000_add_technique_native_name_aliases`); `prisma migrate status` reports up to date afterward. |
| `bunx prisma generate` (apps/web) | PASS |
| `bun run prisma/transform-grappling-source.ts` | PASS — bjj: 5 levels/80 techniques; judo: 3 levels/20 throws. |
| Importer run 1 (`bun run prisma/import-bbl-bjj-curriculum.ts`) | PASS — `[bbl-bjj] AABB overlap guard: PASS (61 nodes, 0 overlaps)`; `courses=5, curriculumItems=80, techniques=61, prerequisites=75`; `[bbl-judo] courses=3, curriculumItems=20, techniques=20`. |
| Importer run 2 (idempotency proof) | PASS — identical output to run 1, byte-for-byte on every count. |
| DB row-count cross-check (independent of script counters) | PASS — judo: 20 techniques / 3 courses / 20 curriculumItems / 20 techniqueCurriculumLinks (discipline `judo`, style `kodokan`); bjj: 61 graph-tagged techniques / 5 courses / 80 curriculumItems. |
| Graph slug coverage (61 `bbl-bjj-graph.json` node ids vs published `Technique.slug`) | 0 missing (see Decisions resolved — already resolved before this session). |
| AUD2-11 live-verify (`GET http://localhost:3579/curriculum`, dev server) | PASS — tab labels are human names; rank shortNames only in `aria-label`. |
| `npx oxfmt --check` (this lane's new/changed files) | PASS after one `oxfmt` (formatter, not linter) run on the 3 touched files. |
| `npx oxlint` (this lane's new/changed files) | PASS — 0 issues. |
| `bun run typecheck` (repo-wide) | PASS — `@ronin-dojo/ui-kit`, `@ronin-dojo/api-client`, `baseline`, `@ronin-dojo/web` all exit 0 (`apps/baseline`'s own missing generated Prisma client — a fresh-worktree bootstrap gap unrelated to this diff — was generated locally first so the gate could run to completion). |
| `bun run lint:check` (repo-wide) | PASS — 0 errors; ~40 pre-existing warnings, none in this lane's files. |
| `cd apps/web && bun run format:check` (repo-wide) | PASS — 1973 files, all correctly formatted (this lane's new/changed files were run through `oxfmt` — the formatter, not `oxlint` — before the check). |
| `bun run test` | 1376 pass / 41 fail / 3 errors across 1417 tests, 209 files (`@ronin-dojo/ui-kit`: 30/0 clean). **Every failure traced to `beforeEach`/`afterEach` timeouts or a cascading fixture-cleanup error**, under observed extreme host contention (load average 425–500 for this session's duration — 3 sibling worktrees' own gate runs sharing ONE local Postgres instance and CPU). Root-caused the one in-domain failure (`server/web/techniques/queries.test.ts`, 2 fails): its OWN dynamically-generated test-fixture Discipline/Techniques (`karate-<timestamp>` slugs, verified by direct DB query against the exact FK id in the error) — NOT this lane's Judo/BJJ rows or schema change. The domain's other file, `server/web/techniques/queries.discovery.test.ts`, passed cleanly. Zero failures assert on `nativeName`/`aliases`/Judo content. Recommend a clean re-run once sibling lanes 0580/0581 are done for an uncontended signal; not treated as a lane regression. |
| `cd apps/web && npx next build` (app-code diff ⇒ build required) | PASS — exit 0; `✓ Compiled successfully in 7.3min`; 296/296 static pages generated (slow wall-clock is the same sibling-lane host contention noted under `bun run test`). |

## Open decisions / blockers

- **Wrestling takedowns** — no source dataset exists in the monorepo (confirmed again this
  session; unchanged from SESSION_0578's finding). Remains a named G-022 content-authoring gap,
  not a lane blocker.
- **G-022's Lane C ledger description cites "98-technique trunk"** — this session's ground-truth
  finding (80) should be applied as an additive annotation at the ledger sweep (see "Proposed
  ledger edits" below); not edited directly by this lane per the additive-only/shared-ledger rule.
- **`apps/baseline` worktree-bootstrap gap** — a fresh worktree's `apps/baseline` has no `.env`
  and no generated Prisma client, which fails the repo-wide `bun run typecheck` gate for an
  unrelated workspace. Worked around locally (generated the client with a placeholder
  `DATABASE_URL`) to get a real signal on this lane's own diff; flagging as adjacent tech debt for
  `/worktree-setup`, not fixed as part of this lane (out of scope).

## Proposed ledger edits

(NOT applied by this lane — additive-only annotations for the Giddy sweep at the fan-out's close,
per the recipe's shared-by-rule-files discipline.)

- **G-022 Lane C row — count correction.** Amend "monorepo-harvest axis" child description:
  replace "`bjj.js` 98-technique trunk (SALVAGE)" with "`bjj.js` 80-technique trunk across 5
  populated levels (SALVAGE; ground-truthed at SESSION_0579 — the 98 figure over-counted
  section-object ids alongside technique ids)". No other Lane C child text changes.
- **G-022 Lane C row — landed marker.** Flip Lane C's tracked-child bullet from planned to
  **landed (SESSION_0579)**: Judo adoption (20 throws, discipline+style+course+curriculumItem+
  technique rows), `nativeName`/`aliases` additive migration, AABB-overlap seed-path guard, ADR
  0050. Wrestling takedowns remain an OPEN named authoring gap (no dataset) — do not flip that
  part.
- **New G-022 child (proposed, not minted):** "Wrestling takedowns — authoring gap" — no source
  dataset exists in the monorepo (confirmed twice: SESSION_0578 harvest inventory, SESSION_0579
  re-check). Needs a human-authored curriculum (no harvest transform possible). Suggest routing as
  a G-022 tracked child, P3, unblocked-but-unscheduled.
- **wiring-ledger.md — no new WL row minted this session** (nothing here rises to a wiring defect;
  the AABB guard is new coverage, not a fix to an existing wired defect). WL-P3-54 ("promote the
  [AABB] detector to a co-located unit test over the JSON") remains OPEN and is NOT satisfied by
  this lane's importer-side guard — that wiring-ledger row specifically asks for a **component-
  level** unit test in Lane A's tree (`components/web/techniques/`), which this lane does not own
  and did not build. Recommend Lane A's close notes this row explicitly.
- **`docs/epics/technique-graph-curriculum-port.md`** — the SESSION_0578 forward-pointing stamp
  ("the ratifying ADR is a blocking merge-gate on lane SESSION_0579") now resolves to a real file
  (`docs/architecture/decisions/0050-grappling-arts-technique-scope.md`); no further edit needed,
  the stamp already reads correctly once the ADR exists.

## Next session

### Goal

Lane B (`session-0580-technique-progress`) merges next per the ratified C→B→A order; this lane's
Judo content is now available for Lane B's progress-tracking wiring (any technique, including the
new Judo rows, is trackable via the existing `TechniqueProgress` model).

### First task

Lane B rebases over `origin/main` once this lane's commit lands, then proceeds per its own
already-committed prompt (SESSION_0578 §"Fan-out lane prompts" → LANE B).

## Review log

### SESSION_0579_REVIEW_01 — Cody self-review (single-agent dispatch; no separate Doug/Giddy/Desi pass this session)

- **Reviewed tasks:** SESSION_0579_TASK_01–07
- **Dirstarter docs check:** cached docs sufficient — reused the existing `import-bbl-bjj-curriculum.ts`/`prisma/seed.ts` idioms verbatim, no new pattern.
- **Verdict:** the lane's owned-file diff is small, additive, and idempotency-proven against the live local DB. The one open risk (test-suite noise from shared-host contention) is root-caused and documented, not silently absorbed. Self-review checklist below.
- **Score:** 8.5/10 — docked for (a) not re-running `bun run test` after sibling lanes are idle to get a clean signal (deferred, evidence-based judgment call, recorded), and (b) the `apps/baseline` worktree-bootstrap workaround, which is adjacent tech debt this lane surfaced but didn't fix.
- **Follow-up:** flag the `apps/baseline` bootstrap gap to `/worktree-setup` maintenance; flag the "98-technique trunk" ledger correction at the G-022 sweep.

## Hostile close review

- **Giddy:** self-check pass — placement correct (ADR in `docs/architecture/decisions/`, next free number 0050; new payload under `prisma/data/`; migration hand-authored per idiom); the blocking-merge-gate ADR condition from SESSION_0578 is satisfied; no ritual bypassed (full bow-out run, push held).
- **Doug:** self-check pass — disjointness held (only owned files touched, confirmed via `git status --short`); idempotency proven with two full importer runs + independent DB row-count cross-checks; `keyPointsFromNotes`/`bodyDescription`/`sourceField` parse contract preserved (the judo `notes` format is byte-for-byte structurally identical to the BJJ one — same field order, same "Key points:" sentinel line, same blank-line rules) and `server/web/curriculum/queries.ts` was never edited.
- **Desi:** not applicable — no UI touched this lane.
- **Kaizen aggregate:** 8.5/10 (no separate reviewer dispatch this session — single-agent Cody lane per the dispatch instructions; Doug/Giddy/Desi review happens for real at the G-022 merge-sweep per the fan-out recipe).

## ADR / ubiquitous-language check

- ADR update **required and delivered this session**: ADR 0050 (grappling-arts technique scope) —
  the blocking merge-gate condition from Giddy's SESSION_0578 close review. ADR 0046 (technique
  ownership axes) confirmed still valid and load-bearing (the manual partial-unique-index upsert
  idiom this lane's Judo path reuses verbatim).
- Ubiquitous language update **not required**: "Library-dark" (a technique with no graph node) was
  already coined in the SESSION_0578/epic-doc prompts, not newly introduced here; "Kodokan Judo"
  and "Gokyo no Waza" are domain terms from the source material, not new platform vocabulary.

## Reflections

- **Ground-truth before you seed.** The "98-technique trunk" figure had already survived two
  layers of citation (SESSION_0578's harvest inventory, then this lane's own dispatch prompt)
  before this session directly counted the source file and found 80. The miscounting mechanism —
  a regex/eval that captures a level's section-object `id` alongside its techniques' `id`s,
  because both share the same string shape — is exactly the kind of error that compounds silently
  across sessions if nobody re-derives the number from the actual bytes. Recording the correction
  here (and proposing it back into G-022) is cheaper than letting a wrong headline count survive
  another hand-off.
- **The DB was already further along than the prompt assumed.** The "~14 dark graph slugs"
  backfill task, framed as this lane's main data job, turned out to be zero-work: a prior importer
  run had already closed that gap in this local DB. Verifying against the live state before
  building a fix (rather than trusting the prompt's framing) avoided writing a backfill path for a
  gap that didn't exist.
- **Shared-host contention is a real, measurable cost of the fan-out model.** Running three
  worktrees' full test suites and typechecks concurrently against one local Postgres instance
  produced a load average of 425–500 for this session's full duration and made every gate 3–5x
  slower than a solo run would be. The failures it produced (41/1417 tests, all timeouts or
  cascading fixture-cleanup errors, zero assertion failures) were traceable and non-alarming this
  time, but the fan-out recipe should probably name this cost explicitly rather than let each lane
  rediscover it independently.
- **Reusing an existing idiom paid off immediately.** Judo's Discipline/RankSystem/Style rows
  already existed in `prisma/seed.ts` before this session (seeded generically, not for this
  feature) — the grill's "no parallel taxonomy" instruction meant this lane's entire Judo-schema
  footprint was two lines (`findFirst` reuse + one new `Style` row), not a new subsystem.

## Full close evidence

| Step | Proof |
| --- | --- |
| Gates | typecheck 0 / lint:check 0 err / format:check 1973 files clean / `next build` exit 0 (296/296 pages) / test 1376 pass with contention-traced failures — full table under Verification. |
| Importer idempotency | Two consecutive runs, byte-identical counts: bjj `courses=5, curriculumItems=80, techniques=61, prerequisites=75`; judo `courses=3, curriculumItems=20, techniques=20`; AABB guard PASS (61 nodes, 0 overlaps) on both runs. |
| Migration | `20260719000000_add_technique_native_name_aliases` applied via `migrate deploy` (NEVER `migrate dev`); `prisma migrate status` = up to date; strictly additive (nullable + default-only). |
| Monorepo write-guard | PASS — `/Users/brianscott/dev/ronin-dojo-monorepo` read-only throughout; transform reads via sandboxed `vm` eval, writes only into this repo's `prisma/data/`. |
| Disjointness | `git status --short` shows ONLY this lane's owned files: importer, schema + 1 migration dir, transform script, new payload, ADR 0050, this session file. Zero Lane A/B files touched. |
| wiki:lint | 0 errors (the 2 initial broken-link errors in ADR 0050 fixed — `../../epics/` depth), 64 pre-existing warnings in unrelated files. |
| markdownlint (ADR only) | `npx markdownlint-cli2` on ADR 0050: 0 issues. (Repo-wide `markdown:lint:architecture` has ~60 PRE-EXISTING failures in other files — none in this lane's diff.) |
| Push gate | HELD — local commit only on `session-0579-grappling-data`; NO push, NO PR, NO deploy, NO shared-ledger edits (proposed edits recorded above for the Giddy sweep). |
| Graphify update | Skipped by design — worktree graph is not-built (0 nodes); canonical-checkout refresh happens post-merge per 0569/0578 precedent. |
