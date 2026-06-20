---
title: "SESSION 0412 — Supervised BBL Pods full-fidelity importer"
slug: session-0412
type: session--open
status: closed
created: 2026-06-18
updated: 2026-06-18
last_agent: codex-session-0412
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0411.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0412 — Supervised BBL Pods full-fidelity importer

## Date

2026-06-18

## Operator

Brian + codex-session-0412

## Goal

Run the operator-directed Petey + Cody session for the supervised BBL Pods full-fidelity importer lane only: no
Doug, no fan-out, prod data motion dry-run first, no new `migrate deploy`, grill the importer decisions as the
dry-run evidence appears, apply only after decisions are resolved, then bow out via the full closing ritual.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md).
Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0411.md` (left `in-progress`) and the last closed baseline read:
  `docs/sprints/SESSION_0410.md`.
- Carryover: SESSION_0411 reviewed the sweep PRs and merged only PR #96; its importer tasks remained pending.
  The operator explicitly superseded that mixed lane with SESSION_0412: supervised Pods importer only, with the
  provided GOAL overriding any earlier "next session" block.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: dirty before this SESSION file was created. Pre-existing changes: BBL landing files,
  `apps/web/app/(web)/layout.tsx`, untracked `apps/web/app/(web)/(home)/bbl/bbl-landing/bbl-dirty-dozen-data.ts`,
  `apps/web/app/(web)/_components/bbl-footer.tsx`, `apps/web/app/zz-teaser-preview/`,
  `docs/sprints/SESSION_0411.md`, and `teaser-plus-landing.jpeg`. Treat as prior/user work unless directly
  needed for this importer lane.
- Current HEAD at bow-in: `5c395f2`
- Remote sync before importer work: `git fetch origin main` showed local `main` behind by 4 commits with no path
  overlap against the dirty local files; `git pull --ff-only origin main` fast-forwarded to `36a002f`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/data, storage/media (R2), hosting/deploy verification. |
| Extension or replacement | Extension: run the existing Prisma-backed importer over existing Passport / RankAward / Affiliation / MediaAttachment models. |
| Why justified | BBL needs the full Pods promotion provenance to unlock the lineage timeline USP. |
| Risk if bypassed | Prod data could be mutated without dry-run/idempotency proof, or an agent could accidentally run schema migration / db push outside the supervised lane. |

Live docs checked during planning: repo authority docs and cached Dirstarter inventory only. The operator explicitly
provided authority docs to read and not re-derive; no Dirstarter substrate is being replaced.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 13,218 nodes, 25,754 edges, 1,782 communities,
  2,058 files tracked.
- Queries used:
  - `BBL Pods importer RankAward Passport DirectoryProfile MediaAttachment Affiliation bbl-lineage`
- Files selected from graph:
  - `apps/web/scripts/enrich-bbl-members-pods.ts`
  - `apps/web/scripts/import-bbl-lineage-profiles.ts`
  - `apps/web/scripts/import-bbl-wp-media.ts`
  - `apps/web/prisma/seed-baseline-lineage.ts`
  - `docs/product/black-belt-legacy/BBL_PODS_FULL_IMPORT_SPEC.md`
- Verification note: Graphify is navigation only; every command, mapping, and guard is verified against exact files
  and prod dry-run output before acting.

### Grill outcome

- In progress. Per `grill-me`, importer decisions are being asked one at a time after local evidence or dry-run
  output proves the actual fork. If a question can be answered from code/data, inspect first instead of asking.
- Resolved: off-roster and multi-promoter RankAward values stay as free-text notes for this apply. Evidence:
  `RankAward` supports one
  `awardedByPassportId`; the current public lineage payload renders `awardedByPassport` / `awardedBy`, not the
  free-text `notes` field. Placeholder Passport creation and UI surfacing for these notes are deferred to
  follow-up reconciliation.

### Drift logged

- **D-024 open:** deploy toolchain is bun, not pnpm.
- **D-025 open:** R2 keys are case-sensitive; use name-preserving `aws s3 cp`, not slugified media keys.
- **D-026/D-027 resolved:** importer dry-run affiliation counter and school normalization fixes are expected present.
- **D-028 planned:** thin SESSION_0408 import missed the full Pods provenance; this lane runs that planned import.
- **D-029 register gap:** SESSION_0410 records prod tree slug = `bbl-lineage` while local seed differs, but
  `drift-register.md` currently ends at D-028. Use `--tree-slug bbl-lineage` for prod and carry the register fix
  to close.

## Petey plan

### Goal

Safely run the full-fidelity BBL Pods enrichment against prod: confirm preconditions, dry-run, grill decisions,
apply, prove idempotency, and verify a public profile timeline.

### Tasks

#### SESSION_0412_TASK_01 — Authority lock and importer preconditions

- **Agent:** Petey + Cody
- **What:** Confirm the real fixture, importer script, prod schema state, and environment guards before any prod write.
- **Steps:**
  1. Inspect `enrich-bbl-members-pods.ts`, its fixture/sample, and the exact command/guards.
  2. Confirm `/tmp/bbl-export/reconciled-full.json` exists, or ask the operator for the relevant CPT export files.
  3. Confirm `currentResidence` + `logoUrl` already exist on prod without running a new migration.
  4. Confirm the command includes `BBL_COUNTDOWN=1`, `RESEND_API_KEY=`, `--tree-slug bbl-lineage`, and no email path.
- **Done means:** Preconditions are known and no prod write has occurred.
- **Depends on:** nothing

#### SESSION_0412_TASK_02 — Prod dry-run and grill decisions

- **Agent:** Petey + Cody
- **What:** Run the dry-run against prod, review actual creates/updates/unmatched/off-roster output, then grill open
  decisions one at a time with recommendations.
- **Steps:**
  1. Run the prod dry-run from `apps/web`:
     `BBL_COUNTDOWN=1 RESEND_API_KEY= bun run scripts/enrich-bbl-members-pods.ts --dry-run --input /tmp/bbl-export/reconciled-full.json --tree-slug bbl-lineage`.
  2. Review per-belt RankAwards, profile fills, galleries, affiliations, UNMATCHED, and off-roster promoters.
  3. Grill and resolve: off-roster promoters, gallery cap/featured-first, new CSV people create vs skip, sizes skip,
     and `started_training_with` LineageRelationship vs skip.
- **Done means:** Dry-run evidence is recorded and every importer decision is either resolved or blocked with exact
  missing input.
- **Depends on:** SESSION_0412_TASK_01

#### SESSION_0412_TASK_03 — Apply, verify idempotency, and full close

- **Agent:** Cody + Petey
- **What:** Apply the importer only after TASK_02 resolves, then prove idempotency and public render behavior before
  running the full closing ritual.
- **Steps:**
  1. If media copy is needed, use name-preserving R2 uploads (`aws s3 cp`) before writing URLs.
  2. Run the same importer command without `--dry-run`.
  3. Re-run dry-run and require 0 creates for idempotency.
  4. SSR or browser-smoke a marquee profile; timeline must show `Promoted by X · date · at Y`.
  5. Run the full `docs/rituals/closing.md` close: reflections, hostile review, evidence, ADR/memory sweep,
     custom-component inventory check, finding router, Graphify refresh, one close commit and push if gates pass.
- **Done means:** Data is applied and idempotent, public timeline proof exists, and SESSION_0412 is closed cleanly.
- **Depends on:** SESSION_0412_TASK_02

### Parallelism

None. The operator explicitly requested no Doug and no fan-out. Tasks run sequentially.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0412_TASK_01 | Petey + Cody | Petey locks authority and Cody verifies script/schema inputs read-only. |
| SESSION_0412_TASK_02 | Petey + Cody | Cody runs dry-run; Petey grills decisions from evidence. |
| SESSION_0412_TASK_03 | Cody + Petey | Cody applies/verifies; Petey closes with evidence and review. |

### Open decisions

- Off-roster promoters: resolved as free-text importer notes for this apply.
- Galleries: import cap and featured-first ordering. Dry-run currently sees 145 attachable galleries from 155
  extracted gallery URLs. Host inventory: 107 `blackbeltlegacy.local`, 42 `complete-cabin.flywheelsites.com`,
  and 6 `blackbeltlegacy.com`; source URLs still need the R2 decision before apply.
  Follow-up inspection found the existing SESSION_0409 WebP process (`sips -Z 512` + `cwebp -q 80`,
  `/tmp/bbl-export/avatars-optimized`, `/tmp/bbl-export/optimized-manifest.json`, R2 upload, and
  `backfill-bbl-avatars.ts`) is avatar-oriented. It matches 22/155 current gallery URLs by filename stem, so a
  gallery-specific optimize/rewrite manifest is still needed before importing galleries cleanly.
- New-in-CSV people: resolved for `Alexander Martinez`; accountless Passport/profile/node/member created under
  `Bill Hosken`, and the follow-up dry-run now has 0 unmatched people.
- Sizes: skip vs import into a field. Source CSVs include sizes, but the target importer/schema path does not.
- `started_training_with`: LineageRelationship vs skip for v1.
- Operator CPT files: resolved for this pass via today-only Downloads CSVs listed in the task log.

### Risks

- Prod data writes are live and additive; dry-run/idempotency proof is mandatory.
- `/tmp/bbl-export/reconciled-full.json` may not exist yet or may be incomplete.
- Prod schema may not have the prior prebuild columns despite SESSION_0410 expectation; do not run a new migration.
- Dirty worktree contains unrelated BBL landing changes; avoid touching them.
- R2 keys are case-sensitive; slugified media keys can create broken URLs.

### Scope guard

- No Doug, no fan-out, no sub-agents.
- No sweep PR review work in this session.
- No schema migration, no `prisma migrate deploy`, no `db push`, no `db pull`.
- `BBL_COUNTDOWN` stays ON; do not flip launch gates.
- `RESEND_API_KEY=` stays empty for importer/dev commands; send no claim emails.
- Use bun, not pnpm.
- Operate from `/Users/brianscott/dev/ronin-dojo-app`; run the FS-0024 guard before mutating git.
- One push to `main` only at close, if gates are green.

### Dirstarter implementation template

- **Docs read first:** `component-launch-sweep-recipe.md`, `BBL_PODS_FULL_IMPORT_SPEC.md`, `SOT-ADR.md`,
  `drift-register.md`, `SESSION_0410.md`, `SESSION_0411.md`, `database.md`, `neon-advisory-lock-recovery.md`,
  `failed-steps-log.md`, lineage and directory domain hubs, identity canon.
- **Baseline pattern to extend:** existing Prisma schema + importer script + Passport-rooted identity and
  RankAward promotion truth.
- **Custom delta:** BBL-specific Pods enrichment over the Ronin identity/lineage model.
- **No-bypass proof:** this is not replacing Dirstarter; it writes BBL launch data through existing app models.

## Cody pre-flight

### Pre-flight: supervised importer prod data motion

#### 1. Existing code/data scan

- Graphify query used: `BBL Pods importer RankAward Passport DirectoryProfile MediaAttachment Affiliation bbl-lineage`
- Found: `enrich-bbl-members-pods.ts`, `import-bbl-lineage-profiles.ts`, `import-bbl-wp-media.ts`,
  `seed-baseline-lineage.ts`, `BBL_PODS_FULL_IMPORT_SPEC.md`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Consulted live alignment URLs: no; operator provided authority docs for this data lane and no Dirstarter capability
  is being replaced.
- Closest L1 pattern: Prisma data scripts with `migrate deploy` handled by Vercel prebuild, not ad-hoc schema writes.
- Primitive API spot-check: not applicable; no UI component work planned.

#### 3. Composition decision

- Extending existing script: `apps/web/scripts/enrich-bbl-members-pods.ts`.
- No new component, schema model, or importer abstraction planned.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0410.md`, `SESSION_0411.md`).
- ADR read: `docs/product/black-belt-legacy/SOT-ADR.md`.
- Runbooks consulted: `component-launch-sweep-recipe.md`, `database.md`, `neon-advisory-lock-recovery.md`,
  lineage and directory domain hubs.

#### 5. Dev environment confirmed

- Dev server command if needed for SSR/browser proof: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: prod SSR or local `bbl.local:3000` only after data write, depending on verification path.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0020 (Graphify-first), FS-0021 (schema migration runbook skips), FS-0022
  (prebuild migration verification), FS-0024 (cwd/git guard), FS-0025 (single-push close).
- Mitigation acknowledged: Graphify query already run; no schema migration in this lane; verify prior prebuild only;
  use FS-0024 guard before mutating git; close in one push.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0412_TASK_01 | complete | Read authority docs, synced `main`, inspected importer/script paths, rebuilt `/tmp/bbl-export/reconciled-full.json` from today-only Pods CSV exports, confirmed no email leakage, and verified prod schema prebuild columns without running a migration. |
| SESSION_0412_TASK_02 | in-progress | Prod dry-run completed; grill decisions are being resolved before any apply. |
| SESSION_0412_TASK_03 | pending | TBD |

### CSV provenance

Today-only Pods CSVs used from `~/Downloads`:

- `BBL-Members-Export-2026-June-18-1521.csv`
- `Andre-Lima-Students-Export-2026-June-18-1524.csv`
- `BBL-Member-Profiles-Export-2026-June-18-1644.csv`
- `BBL-Schools-Export-2026-June-18-1646.csv`
- `Bill-Hosken-Students-Export-2026-June-18-1647.csv`
- `Bob-Bass-Students-Export-2026-June-18-1648.csv`
- `Renato-Magno-Students-Export-2026-June-18-1651.csv`

No today-only `Members-Export`, `Videos`, or `BBL-Lineage-Branches` CSV was used.

### Custom-field evidence

- `BBL-Members` custom fields include per-belt promotion fields such as `blue_belt_promotion_date`,
  `brown_belt_promotion_date`, `1st_degree_black_belt_promotion_date`, `who_promoted_you_to_*`,
  `where_you_were_promoted_to_*`, per-belt picture fields, `picture_gallery`, `any_picture_gallery`, `home_gym`,
  `current_school`, `started_training_with`, `started_training_at`, social/logo fields, and sizes.
- `BBL-Member-Profiles` carries richer person data and alternate belt fields, including
  `white_belt_start_date_brazilian_jiu_jitsu`, `purple_belt_promotion_date`, `brown_belt_promotion_date`,
  `black_belt_promotion_date`, coach/promoter fields, galleries, sizes, DOB, and residence.
- Student CPT exports carry alternate date names such as `date_of_*_promotion`; the reconciler maps these into
  the same importer ladder and infers the student-CPT promoter only when a date exists.
- Reconciled fixture: `/tmp/bbl-export/reconciled-full.json`, 40 people, 63 ladder entries, 21 people with dated
  ladder entries, 155 extracted gallery URLs, and `0` email regex matches.

### Prod dry-run evidence

- Command shape used from `apps/web`: `DATABASE_URL=<prod Neon> BBL_COUNTDOWN=1 RESEND_API_KEY= SKIP_ENV_VALIDATION=1 bun run scripts/enrich-bbl-members-pods.ts --dry-run --input /tmp/bbl-export/reconciled-full.json --tree-slug bbl-lineage`.
- Prod schema verification before dry-run: `Passport.currentResidence` and `Organization.logoUrl` exist; migrations
  `20260617183436_add_passport_current_residence` and `20260617220014_add_organization_logo_url` are recorded as
  finished; no `migrate deploy`, `db push`, or `db pull` was run.
- Dry-run result: 40 people in input, 39 matched in prod tree `bbl-lineage`, 1 unmatched (`Alexander Martinez`),
  4 organizations would create, 4 existing, 38 profile fields would fill, 48 RankAwards would create,
  15 RankAwards would enrich, 145 gallery attachments would attach, and 7 affiliations would create.
- No-gallery dry-run result: same non-media write set, but `Gallery attachments: 0 would attach`.
- Operator decision: add `Alexander Martinez` now. Dry plan showed no existing accountless Passport, no
  `alexander-martinez` profile/node slug collisions, `Bill Hosken` present in `bbl-lineage`, and next visual sort
  order `77`. Applied accountless Passport + public DirectoryProfile + verified public LineageNode + claimable
  LineageTreeMember under Bill Hosken with `BBL_COUNTDOWN=1`; no email field was written.
- Post-Alexander no-gallery dry-run result: 40 people in input, 40 matched, 0 unmatched, 4 organizations would
  create, 4 existing, 38 profile fields would fill, 48 RankAwards would create, 15 RankAwards would enrich,
  0 galleries would attach, and 9 affiliations would create.
- Warnings: 15 off-roster promoter warnings, all kept in notes by the current importer; no prod writes occurred.

## What landed

Filled at bow-out.

## Decisions resolved

- Off-roster and multi-promoter awards: keep source values in RankAward notes; do not create placeholder Passports
  in this apply.
- New-in-CSV `Alexander Martinez`: create the accountless Passport/profile/node/member now and attach the tree
  member under `Bill Hosken`.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0412.md` | New Codex session ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pwd && git remote -v && git branch --show-current && git status --short` | Ronin repo, `origin=Ronin-Dojo-Design/ronin-dojo-baseline`, branch `main`, dirty worktree pre-existing as listed above. |
| `git fetch origin main && git pull --ff-only origin main` | Local `main` fast-forwarded `5c395f2..36a002f`; dirty local BBL landing/session files preserved. |
| `graphify stats` | 13,218 nodes; 25,754 edges; 1,782 communities; 2,058 files tracked. |
| `graphify query "BBL Pods importer RankAward Passport DirectoryProfile MediaAttachment Affiliation bbl-lineage" --budget 2000` | Selected importer/media/lineage files for direct inspection. |
| `/Applications/Postgres.app/Contents/Versions/latest/bin/psql "$DATABASE_URL" ...` | Read-only prod verification confirmed `Passport.currentResidence`, `Organization.logoUrl`, finished migrations, and tree slug `bbl-lineage`. |
| `node /tmp/bbl-export/reconcile-pods.mjs ...today-only CSVs...` | Rebuilt `/tmp/bbl-export/reconciled-pods.json`; copied to `/tmp/bbl-export/reconciled-full.json`. |
| `node -e` email scan over `/tmp/bbl-export/reconciled-full.json` | `0` email matches. |
| `bun run scripts/enrich-bbl-members-pods.ts --dry-run --input /tmp/bbl-export/reconciled-full.json --tree-slug bbl-lineage` | Prod dry-run completed with no writes; 48 RankAwards would create, 15 would enrich, 145 galleries would attach, 7 affiliations would create. |
| `bun run scripts/enrich-bbl-members-pods.ts --dry-run --input /tmp/bbl-export/reconciled-full.json --tree-slug bbl-lineage --no-galleries` | Prod dry-run completed with no writes; 48 RankAwards would create, 15 would enrich, 0 galleries would attach, 7 affiliations would create. |
| `bun --eval` Alexander dry plan | Read-only check showed `Passport`, `DirectoryProfile`, `LineageNode`, and `LineageTreeMember` would create; no slug collisions; Bill Hosken member found; next sort `77`. |
| `BBL_COUNTDOWN=1 bun --eval` Alexander apply | Created Passport `rimcwt5pqmod1xm00jb0r1oq`, DirectoryProfile `alexander-martinez`, LineageNode `alexander-martinez`, and tree member `m192lxt0ot8tck195syerxdp` under Bill Hosken. |
| `bun run scripts/enrich-bbl-members-pods.ts --dry-run --input /tmp/bbl-export/reconciled-full.json --tree-slug bbl-lineage --no-galleries` after Alexander | Prod dry-run completed with no writes; 40 matched, 0 unmatched, 48 RankAwards would create, 15 would enrich, 0 galleries would attach, 9 affiliations would create. |

## Open decisions / blockers

Importer decisions intentionally pending until grill answers are resolved from the dry-run evidence.

## Next session

### Goal

Filled at bow-out.

### First task

Filled at bow-out.

## Review log

Filled at bow-out.

## Hostile close review

Filled at bow-out.

## ADR / ubiquitous-language check

Filled at bow-out.

## Reflections

Filled at bow-out.

## Full close evidence

Filled at bow-out.
