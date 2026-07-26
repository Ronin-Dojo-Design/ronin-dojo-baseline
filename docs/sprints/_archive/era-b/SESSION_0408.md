---
title: "SESSION 0408 — BBL reveal-prep: default avatar + full-fidelity WP member import + image optimization"
slug: session-0408
type: session--implement
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0408
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0407.md
  - docs/product/black-belt-legacy/BBL_LINEAGE_IMPORT_SPEC.md
  - apps/web/scripts/import-bbl-lineage-profiles.ts
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0408 — BBL reveal-prep: default avatar + full-fidelity WP member import + image optimization

## Date

2026-06-17

## Operator

Brian + claude-session-0408

## Goal

Drive BBL reveal-prep beyond the SESSION_0407 "Next session" block. The operator escalated scope mid-session
to a real **member migration**: finalize the default gi avatar; pull the full WordPress export (11 CPTs);
reconcile it into a clean roster; build + dry-run + run a **full-fidelity importer** (placeholder Passports +
DirectoryProfiles + LineageNodes + RankAwards + Affiliations + a BBL lineage tree with parent edges) against
prod; optimize + upload the launch-critical WP images to R2; and stage `recipients.json` for the (still
reveal-gated) claim emails. Dashboard/profile pixel-parity is scoped as a follow-on epic, not built here.
**Do NOT flip `BBL_COUNTDOWN` off** (reveal stays gated on the BBL webhook secret + claim emails).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0407.md` (closed) — BBL launched as a gated countdown; apex DNS
  flipped; 7 Dirty Dozen imported to prod; 5 avatars on R2. Reveal-prep remaining: default gi avatar +
  claim emails.
- Carryover: this session does the reveal-prep tail AND the operator-escalated WP member migration.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `1459275`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Identity (Passport/Directory/Lineage)** — import writes placeholder Passports + satellites through existing models. **Media (R2/S3)** — `aws s3 cp` optimized images. **Hosting** — no DNS change. |
| Extension or replacement | **Extension** — a new import script over existing models + the documented R2 upload; no new primitive, no schema/migration. |
| Why justified | Prod has only the 7 Dirty Dozen; the WP site has ~76 real members + a lineage tree + schools the launch should carry. |
| Risk if bypassed | Directory near-empty at reveal; the broader lineage + members unclaimed. |

### Grill outcome (operator-answered)

1. **WP data source = pull both wp_users + the `bbl_member` CPT** (and, as it turned out, all 11 CPT exports).
2. **Avatar = Base v3, crossover raised, chest closed** ("Take A — high cross") — render → 512 PNG → approve → upload.
3. **Session cut = full-fidelity import + run, DRY-RUN FIRST** (operator: "dry run it first then import and run").
4. **Parity = primitives-first / feature parity** track, scoped as a follow-on epic (not built this session).
5. **No Stripe; reveal stays gated** on the BBL webhook secret + claim emails.

### Drift logged

- **D-0408-1 (candidate):** the baseline seed (`seed-baseline-lineage.ts`) encodes a curated BBL lineage
  (confirmed ceremonies/ranks/edges) but **prod is migrate-only / never seeded** — prod likely lacks the BJJ
  rank system + the curated tree, holding only the SESSION_0407 Dirty Dozen import. The importer must be
  self-sufficient (ensure BJJ ranks/disciplines) + dedupe against actual prod state (inspect read-only first).

## Petey plan

### Goal

Turn the messy 11-file WP export into a clean prod BBL lineage (members + tree + ranks + schools), finalize
the default avatar + optimized media, and stage the claim-email recipients — all without flipping the reveal.

### Tasks

#### SESSION_0408_TASK_01 — Finalize default gi avatar

- **Agent:** Desi (design) + Cody (render)
- **What:** Render the operator-approved "Take A" SVG → 512×512 `default-black-belt.png`, optimize, show, upload to `s3://bbl-media/media/bbl/profiles/default-black-belt.png`.
- **Done means:** PNG approved + 200 on the r2.dev URL; Renato Magno + John Lewis resolve.
- **Depends on:** operator approval of the rendered PNG + fresh R2 creds.

#### SESSION_0408_TASK_02 — Reconcile WP export (DONE)

- **Agent:** Cody
- **What:** Parse all 11 WP CSV exports → strip spam/test → dedupe across CPTs → `/tmp/bbl-export/reconciled.json`.
- **Done means:** ~76 real members, lineage edges, 11 schools, image manifest, ~17 recipients identified. ✅

#### SESSION_0408_TASK_03 — Build + dry-run full-fidelity importer

- **Agent:** Cody
- **What:** `scripts/import-bbl-members-full.ts` — consumes `reconciled.json`; ensures BJJ discipline/rank system; creates/enriches placeholder Passports + DirectoryProfiles + LineageNodes + RankAwards (rank-string→shortName) + Affiliations (schools as Organizations) + a BBL `LineageTree` with `primaryVisualParentMemberId` edges + visual groups; idempotent; dedupe by `displayName`+`userId:null`.
- **Done means:** `--dry-run` prints the full plan + flags unmapped ranks/schools; operator approves.
- **Depends on:** read-only prod inspection (TASK_03a) + reconciled.json.

#### SESSION_0408_TASK_04 — Run import to prod

- **Agent:** Cody (operator-gated)
- **What:** Run the importer against prod Neon (operator-pasted `DATABASE_URL`) after dry-run approval. Idempotent/additive; behind the countdown.
- **Done means:** members + tree + ranks + schools in prod; spot-check via SSR.
- **Depends on:** TASK_03 dry-run approved.

#### SESSION_0408_TASK_05 — Optimize + upload launch-critical images

- **Agent:** Cody
- **What:** `sips`+`cwebp` pipeline on the launch-critical WP images (member avatars + Rigan portraits + BBL marks) → webp; defer the 123MB hero set; dedupe items/lineage; `aws s3 cp` to R2.
- **Done means:** optimized avatars 200 on r2.dev; the import points at them.
- **Depends on:** R2 creds.

#### SESSION_0408_TASK_06 — recipients.json + claim-email dry-run (NOT sent)

- **Agent:** Cody
- **What:** Build `recipients.json` from the ~17 real members with email (test-stripped, operator excluded); `send-bbl-claim-emails.ts --dry-run`.
- **Done means:** dry-run resolves nodes; send deferred to reveal (webhook secret + operator go).
- **Depends on:** TASK_04 (claimable nodes exist).

### Parallelism

TASK_02 done. TASK_01 + TASK_05 (media) are independent of TASK_03/04 (DB). TASK_03 gates TASK_04; TASK_04 gates TASK_06.

### Open decisions

- **Prod state unknown** — must inspect prod read-only (ranks? tree? existing people?) before finalizing the importer (D-0408-1).
- **Curated seed vs WP roster** — seed is higher-quality for the core lineage but prod isn't seeded; importer builds from WP + reuses seed *patterns*, deduping against actual prod.

### Risks

- Prod DB writes — idempotent/additive only; dry-run + read-only inspect first; never `db push`/`migrate` against prod.
- Spam/test pollution in the WP export (stripped in reconcile; re-verify in dry-run).
- R2 key case-sensitivity (D-025) — keep names consistent between upload + import.

### Scope guard

- No schema change/migration. No Stripe. No `BBL_COUNTDOWN` flip. No dashboard/profile UI rebuild (follow-on epic).
- No email send this session (reveal-gated).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0408_TASK_01 | landed | Default gi avatar (operator's faceless silhouette, not the SVG) → R2 (200), 70 placeholders wired + app-level brand fallback (`resolveDisplayAvatar`). |
| SESSION_0408_TASK_02 | landed | Reconciled 11 exports → 76 members + tree + 11 schools + 18 recipients (`/tmp/bbl-export/reconciled.json`). |
| SESSION_0408_TASK_03 | landed | `import-bbl-members-full.ts` built; dry-run clean (local + prod). |
| SESSION_0408_TASK_04 | landed | Ran to prod: `bbl-lineage` tree + 76 members + 38 ranks + 11 orgs + 4 affils + 75/75 edges; idempotency verified. |
| SESSION_0408_TASK_05 | deferred | Only the default avatar uploaded; member-photo migration (~220 imgs) → next session (full library located on disk). |
| SESSION_0408_TASK_06 | landed | `recipients.json` (**23** — rebuilt from the clean 3-col user export, +5 vs the first pass) + `send-bbl-claim-emails.ts --dry-run` → 23/23 resolve; **send deferred** (reveal-gated). |

## What landed

- **Full WP member migration to prod.** Reconciled all 11 WP CSV exports (stripped 100+ spam/test rows) into a
  clean roster (`/tmp/bbl-export/reconciled.json`, local-only), built `import-bbl-members-full.ts`, dry-ran it
  against prod, then ran it: **`bbl-lineage` LineageTree + 76 members**, 65 new + 5 enriched claimable
  placeholder Passports (deduped against the SESSION_0407 Dirty Dozen), 65 LineageNodes, **38 belt RankAwards**
  (`--ensure-ranks` added the missing `BK0` to prod's IBJJF system), **11 schools** as Organizations, 4
  Affiliations, and **75/75 parent edges** (Rigan Machado root → Bob Bass / Bill Hosken / Renato Magno / Andre
  Lima → students). Idempotent: a verification re-run created 0 rows.
- **Default gi avatar live.** The operator-designed faceless gi silhouette rendered to a 512² PNG and uploaded
  to R2 `media/bbl/profiles/default-black-belt.png` (200 `image/png` on r2.dev). `set-bbl-default-avatars.ts`
  wired it onto the **70** placeholder Passports with null `avatarUrl`; the 6 Dirty Dozen keep their real photos.
- **App-level brand default-avatar fallback.** `resolveDisplayAvatar(avatarUrl, brand)` in `lib/media.ts` +
  committed static asset `public/brand/bbl/default-black-belt.png`, wired into the directory read seams
  (`queries.ts`, `profile-projection.ts`). Brand-scoped — Baseline/RDD are unaffected (no default key).
- **Claim-email recipients staged.** `recipients.json` built from the **18** real emailable members
  (test/operator/`@bbl.local` excluded); `send-bbl-claim-emails.ts --dry-run` resolved **18/18** to claimable
  nodes — **nothing sent** (reveal-gated).

## Decisions resolved

- **Full-fidelity import + run, dry-run first** (operator) — identity + lineage tree edges + belt ranks + school
  affiliations for the whole reconciled roster, not just the Dirty Dozen.
- **Default avatar = the faceless gi silhouette** (operator-supplied `default-avatar.png`); the 5 diverse
  illustrated portraits are kept aside for a later use, not the default.
- **Default wired two ways:** (a) `avatarUrl` set on the 70 placeholders now, (b) app-level fallback for future
  null avatars (chosen over leaving initials).
- **Member-photo migration deferred** — default-for-all now; the full WP media library (5,917 imgs / 1.3 GB) is
  on disk at `~/Local Sites/BlackBeltLegacy/app/public/wp-content/uploads`, so next session pulls only the ~220
  member featured images. **Dashboard/profile pixel-parity** stays a follow-on epic.
- **Reveal + claim-email send stay gated** on `STRIPE_WEBHOOK_SECRET_BBL` + operator go.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/scripts/import-bbl-members-full.ts` | **New** — full-fidelity WP member importer (idempotent, dry-run, `--ensure-ranks`). |
| `apps/web/scripts/set-bbl-default-avatars.ts` | **New** — wire the BBL default avatar onto null-avatar placeholder Passports. |
| `apps/web/lib/media.ts` | **New** `resolveDisplayAvatar()` brand-aware default-avatar helper (string-keyed, no Brand value-import). |
| `apps/web/server/web/directory/queries.ts` | avatar resolution via `resolveDisplayAvatar` (2 seams). |
| `apps/web/server/web/directory/profile-projection.ts` | `+ brand?` param; avatar via `resolveDisplayAvatar`. |
| `apps/web/server/web/directory/search-profiles.ts` | thread `brand` into the projection. |
| `apps/web/public/brand/bbl/default-black-belt.png` | **New** — committed default-avatar static asset. |
| `docs/sprints/SESSION_0408.md` | This record. |
| `docs/knowledge/wiki/index.md` | SESSION_0408 row. |
| `docs/knowledge/wiki/drift-register.md` | D-0408-1..3. |
| `docs/knowledge/wiki/custom-component-inventory.md` | new importer/avatar scripts + helper. |

**Prod side-effects (not files):** Neon — `bbl-lineage` tree + 76 members + 65 passports + 38 RankAwards + 11
Organizations + 4 Affiliations + 70 `avatarUrl` updates + `BK0` rank row; R2 — `default-black-belt.png`.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | ✓ clean |
| `bun run lint:check` (oxlint) | ✓ clean on touched files (removed dead `parseLocation` block) |
| `bun run format:check` (oxfmt) | ✓ all files correct |
| `bun run wiki:lint` | ✓ no violations (693 files) |
| scoped `bun test profile-projection.test.ts` | 4 pass / 0 fail |
| importer prod **dry-run** | 76 people; 65 new / 5 enrich / 6 skip; 75/75 edges; only `BK0` rank missing |
| importer prod **run** | tree + 76 members + 65 passports + 38 ranks + 11 orgs + 4 affils created |
| idempotency re-run (dry) | 0 creates (tree exists; orgs/passports/nodes/ranks/members all 0) |
| default avatar | `curl` → **200 `image/png`** on r2.dev; 70 placeholders wired |
| claim-email `--dry-run` | **18/18** resolve to claimable nodes; **sent=0** |
| full `bun test` | **SKIPPED** — fires live Resend → BBL sender-rep risk (SESSION_0407 precedent) |
| `fallow` audit | not on PATH this shell; oxc gates + dead-code removal substitute on touched files |

## Open decisions / blockers

- **Reveal + claim-email send** gated on `STRIPE_WEBHOOK_SECRET_BBL` (pending) + operator go. `recipients.json`
  staged; nothing sent.
- **🔐 Rotate the exposed Neon password + R2 token** (operator pasted both in chat this session; recoverable
  from the transcript) — carryover from SESSION_0407, now higher priority.
- **Member-photo migration deferred** — ~220 member featured images at `~/Local Sites/BlackBeltLegacy/.../uploads`
  → optimize → R2 → backfill `avatarUrl` (next session).
- **Affiliation step not idempotent** (FINDING_01 / D-0408-2) — do not re-run the real import without the dedup fix.
- **3 school-name mismatches** ("Mat Fitness", "South Bay Jiu Jitsu" vs "South Bay Jiu-Jitsu", "231" pod-id) —
  4/8 affiliations resolved; refine school matching (normalize punctuation) before the next import pass.

## Next session

### Goal

Member-photo migration + the dashboard/profile pixel-parity epic — bringing the imported members to life and
the BBL surfaces toward parity with the legacy BBLApp.

### First task

Migrate the ~220 member featured images: match `reconciled.images` basenames →
`~/Local Sites/BlackBeltLegacy/app/public/wp-content/uploads` (the full 5,917-img / 1.3 GB library on disk) →
`sips -Z 512` + `cwebp` optimize only the needed ones → `aws s3 cp` to R2 → backfill `avatarUrl` (extend
`import-bbl-members-full.ts` with `--media-base`, or a dedicated backfill keyed on `avatarBasename`). Then open
the dashboard/profile parity epic (the SESSION_0408 parity map: profile + public ~60–75% reusable; dashboard is
the build; the public BJJ Passport ID card is the signature gap). **Reveal + claim emails** flip once
`STRIPE_WEBHOOK_SECRET_BBL` arrives. **Rotate** the exposed Neon password + R2 token first.

## Review log

### SESSION_0408_REVIEW_01 — full WP member migration + default avatar

- **Reviewed tasks:** TASK_01 (avatar), TASK_02 (reconcile), TASK_03 (build+dry-run), TASK_04 (prod run),
  TASK_06 (recipients). TASK_05 (member-photo migration) deferred; option-b app fallback added mid-session.
- **Dirstarter docs check:** not applicable (no new Dirstarter primitive — reused the existing identity models,
  the per-brand media seam, and `lib/media.ts`).
- **Verdict:** A large, high-risk lane (76 prod rows + tree + ranks + schools) executed safely: reconciliation
  was deterministic + spam/test-stripped, the importer was dry-run-verified against prod before writing, the one
  failure (a `sortOrder` collision on a partially-seeded prod rank system) errored *before* any people were
  written and was fixed cleanly (append after max sortOrder), and idempotency was proven by a 0-create re-run.
  The avatar shipped end-to-end (rendered → 200 on r2.dev → 70 wired → app fallback). Honest about what's
  deferred (member photos, parity, send/reveal).
- **Score:** 8.5/10.
- **Follow-up:** affiliation step isn't idempotent (re-run would dupe 4 — do not re-run the real import without
  fixing); 3 school-name mismatches unresolved; rotate exposed secrets.

## Hostile close review

- **Giddy:** pass — prod writes were dry-run-verified + idempotency-proven (0-create re-run); the rank-collision
  failure was caught pre-write and fixed, not papered over.
- **Doug:** pass with caveat — full `bun test` deliberately skipped (live-Resend sender-rep risk, 0407 precedent)
  + the affiliation step's non-idempotency is a known debt (don't re-run the real import without the dedup fix).
- **Desi:** pass — operator-chosen default avatar shipped + verified 200; app fallback is brand-scoped (Baseline
  unaffected). Pixel-parity rebuild correctly deferred to its own epic.
- **Kaizen aggregate:** 8.5/10 — a big migration landed safely + verified; points off for the deferred tail
  (photos, parity, send) and the affiliation-idempotency / school-match debt.

### Findings (severity ≥ medium)

#### SESSION_0408_FINDING_01 — affiliation step is not idempotent

- **Severity:** medium
- **Task:** SESSION_0408_TASK_04
- **Evidence:** post-run dry-run reports "Affiliations: 4 would create" despite the 4 already existing.
- **Impact:** re-running the real import would create duplicate Affiliation rows (4). Harmless to reads, but
  dirties the data.
- **Required follow-up:** add a `findFirst({ passportId, organizationId })` dedup before create; do NOT re-run
  the real import until fixed.
- **Status:** open (logged as drift D-0408-2).

## ADR / ubiquitous-language check

- **No new ADR.** Applies ADR 0025 (Passport identity SoT) + SOT-ADR D1 (person-rooted satellites). The
  importer + avatar fallback are tooling/read-model wiring, not architecture. The full-roster import is the data
  realization of the existing lineage model.
- **No new ubiquitous-language terms.** Reuses Passport / DirectoryProfile / LineageNode / LineageTree /
  RankAward / Affiliation / Organization. "bbl-lineage" is a tree slug; the per-instructor `*_student` CPTs are
  WP-source nomenclature, collapsed into the lineage tree, not introduced as domain terms.

## Reflections

- **Deterministic beats agentic for messy data.** Eleven WP exports with 100+ spam/test rows + overlapping
  person CPTs were far better reconciled by a single auditable Node script (spam regex, cross-CPT dedup, rank
  mapping, parent derivation) than by fanning agents over PII. The dry-run-against-prod step then caught the one
  environment-specific defect (prod's rank system lacked `BK0`, so a fixed `sortOrder` collided) *before* any
  write — exactly the "verify computed values against the real target before acting" lesson, again.
- **A reframe is not a rewrite — but scope crept hard.** The session opened as "render an avatar + send emails"
  and became a full member migration + app change. Imposing a staged cut (import now; photos + parity later) kept
  it shippable; the WP exports being mostly test/spam (and the curated *seed* already encoding the core lineage)
  were the surprises that re-shaped the plan.
- **The cheapest data was already on disk.** The "how do I download the photos" question dissolved once the Local
  WP uploads dir surfaced (5,917 imgs) — no export needed, just a basename match against the 220 we want.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0408 frontmatter `status: closed` + `updated` set; new scripts are code (no frontmatter). |
| Backlinks/index sweep | SESSION_0408 row added to `wiki/index.md`; drift-register + custom-component-inventory cross-linked. |
| Wiki lint | `bun run wiki:lint` → no violations (693 files). |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0408_REVIEW_01 + FINDING_01 above. |
| Review & Recommend | Next session goal + first task written. |
| Memory sweep | BBL memories updated (member migration landed, default avatar, WP-data reality, follow-ups). |
| Next session unblock check | First task (photo migration) doable; reveal/send BLOCKED ON USER (webhook secret). |
| Git hygiene | single close commit + push to `main` — hash reported in chat. |
| Graphify update | stats refreshed before the close commit — reported in chat. |
