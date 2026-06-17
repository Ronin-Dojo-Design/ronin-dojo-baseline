---
title: "BBL Pods Full-Fidelity Re-Import — SPEC"
slug: bbl-pods-full-import-spec
type: spec
status: draft
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0409
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0409.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - apps/web/scripts/import-bbl-members-full.ts
backlinks:
  - docs/knowledge/wiki/index.md
---

# BBL Pods Full-Fidelity Re-Import — SPEC

> **One-line:** SESSION_0408 imported a thin slice of the BBL roster (~8 of the 95 `bbl_member`
> Pods fields). This spec is the full-fidelity re-import: **schema-first**, then enrich every member
> with the complete WordPress/Pods record — the per-belt **promotion provenance** (date · promoter ·
> school — the lineage-timeline USP), image galleries, rank-with-degree, school roles, lineage
> hierarchy, and profile fields. Designed to be executed by a **cloud session** for Phases 1–2 once
> the **local-only Phase 0 extraction** is committed.

## Why (the gap)

SESSION_0408's `reconcile.mjs` captured: name, rank-string, school, instructor, bio, featured image,
email, slug, lineageParent. It **dropped** (confirmed present in the source):

- **Per-belt promotion ladder** — `who_promoted_you_to_<belt>`, `<belt>_promotion_date`,
  `where_you_were_promoted_to_<belt>`, `<belt>_pictures` for white→10th-degree. **This is the
  timeline USP** ("Promoted by X · date · at Y"). Present in `wp_postmeta` (local.sql): blue ×40,
  purple ×40, brown ×34, black ×34 date rows (many real, many `0000-00-00`); `who_promoted_*` ×10–12.
- **Image galleries** — the CSV `Image URL` column is pipe-delimited multi-image per member.
- **Rank with degree** — CSV `Ranks` taxonomy (`Black Belt>2nd Degree Black Belt`).
- **School roles** — CSV `School Names` + `School Roles` (Owner, etc.).
- **Lineage hierarchy** — CSV `Categories` (`Bob Bass Students>2nd Degree Black Belts of Bob Bass`),
  `Parent`/`Parent Slug`.
- **Profile fields** — `date_of_birth` ×111, `current_place_of_residence`, socials, `current_rank_in_bjj`
  ×39, `belt_degree`, tier, status, `started_training_with`/`_at`.

## Data sources (all LOCAL)

| Source | Location | Carries |
| --- | --- | --- |
| 9 WP post CSVs | `/tmp/bbl-export/csv-exports/*.csv` (staged from `~/Downloads`) | name, bio, **galleries**, Ranks(+degree), School Names/Roles, Instructors, lineage Categories, Parent hierarchy, author |
| WP postmeta | `~/Local Sites/BlackBeltLegacy/app/sql/local.sql` (302 MB, **local-only**) | the Pods custom fields — promotion **dates**, `who_promoted_*` (post-id), `where_promoted_*` (post-id), per-belt pics, DOB, residence, socials, current_rank, belt_degree, tier, status, training history |
| Pods CPT schema | monorepo `wordpress/pods/bbl_member_pod.json` (95 fields), `bbl_school_pod.json` (20) | field definitions (the mapping authority) |
| Member photos | `~/Local Sites/.../wp-content/uploads` (5.9k imgs) + R2 `bbl-media` (44 avatars already live, SESSION_0409) | featured + gallery images |

**CPTs in scope (BBL):** `bbl_member` (rich, 95 fields), `bbl_member_profile`, `bbl_lineage_branch`,
`bbl_school`, + 4 instructor-student CPTs (`bob_bass_student`, `bill_hosken_student`,
`andre_lima_student`, `renato_magno_student`), + the wp `member` CPT. (TuffBuffs/WEKAF Pods are other
brands — same target schema, out of scope for the BBL launch lane.)

## Phase 0 — Extract + reconcile (LOCAL; prerequisite — the cloud cannot do this)

The cloud session has the repo but **not** `local.sql` or the Local WP. So Phase 0 runs on this
machine and **commits the reconciled dataset** the cloud will import from.

1. Parse the 9 CSVs with a real CSV parser (quoted multiline bios, pipe-delimited galleries). Strip
   spam/test rows (reuse SESSION_0408's spam regex; drop `1970-01-01` draft dupes). Build an
   `id → {name, slug}` map (for resolving postmeta picks).
2. Extract the Pods postmeta from `local.sql` (`wp_postmeta` INSERTs) per member post-id: every
   `<belt>_promotion_date` (skip `0000-00-00`), `who_promoted_you_to_<belt>` (→ resolve post-id to
   name), `where_you_were_promoted_to_<belt>` (→ school name), `<belt>_pictures`, `date_of_birth`,
   `current_place_of_residence`, socials, `current_rank_in_bjj`, `belt_degree`, tier, status,
   `started_training_with`/`_at`. (Cleaner alternative if available: a Pods custom-field CSV/REST
   export that includes these columns — then no SQL parsing.)
3. Merge CSV + postmeta into `reconciled-full.json` keyed by canonical person (dedup across the
   instructor-student CPTs + `bbl_member`). **Redact emails** to a separate file (claim flow only;
   not needed for lineage/timeline). Commit `reconciled-full.json` to the repo for the cloud.

## Phase 1 — Schema (prod migration; cloud or local)

Gap analysis against the **current** schema (already largely Pods-shaped — Passport was built for
`bbl_member`, SESSION_0357):

| Pods data | Target | Status |
| --- | --- | --- |
| per-belt date · promoter · school · pics | **RankAward** (`awardedAt`, `awardedByPassportId`, `organizationId`, `mediaUrls`, `location`) — one row per earned belt | ✅ fits |
| DOB, gender, phone, socials, cover, video, place of birth, started-training date, bio, avatar | **Passport** (`dob`, `gender`, `phoneE164`, `socialLinks`, `coverPhotoUrl`, `videoIntroUrl`, `placeOfBirth`, `startedTrainingAt`, `bio`, `avatarUrl`) | ✅ fits |
| current residence | **Passport** | ⚠️ **new field** `currentResidence String?` (no home today) |
| image galleries / per-belt pics | **MediaAttachment** (polymorphic, Passport back-rel) — verify shape | ⚠️ confirm + wire |
| home gym / owned / representing / promotion school | **Affiliation** roles | ⚠️ `AffiliationRole` only has TRAINS_AT/TEACHES_AT/HEAD_INSTRUCTOR/OWNER/MEMBER → **add** `REPRESENTS`, `PROMOTED_AT`, `HOME_GYM`? (or map onto existing) |
| started training **with** (a person) | **LineageRelationship** or Passport field | ⚠️ decide |
| belt_size / shirt_size | — | ⚠️ skip or `Passport.sizes Json?` |

Deliver: a single Prisma migration with the genuinely-new fields/enum values; **`prisma migrate
deploy` to prod Neon** (NEVER `db push`/`db pull` against prod). Verify migration applied before import.

## Phase 2 — Full-fidelity enrichment importer (cloud)

Extend `import-bbl-members-full.ts` (or a sibling `enrich-bbl-members-pods.ts`) to consume
`reconciled-full.json`:

- **Passport enrich** — dob, placeOfBirth, residence, socials, cover, video, bio (non-destructive).
- **Per belt → RankAward** — `awardedAt` (parsed date), `awardedByPassportId` (resolve promoter
  name → Passport; see open decision for off-roster promoters), `organizationId` (promotion school),
  `mediaUrls` (belt pics), `location`. Dedup by `{passportId, rankId}` (already in importer).
- **Galleries → MediaAttachment** (cap/curate per open decision).
- **Affiliations** — home/owned/representing/promotion schools with the right roles.
- **Rank-with-degree** — use the CSV `Ranks` taxonomy to set the correct degree rank (not just belt).
- Idempotent, **dry-run first**, behind the countdown. Verify: re-run dry-run → 0 creates; SSR a
  marquee profile → timeline shows "Promoted by X · date · at Y".

## Open decisions (resolve at cloud kickoff)

1. **Off-roster promoters** — `who_promoted` names not in our 76 (Rigan Machado, Rickson, Daniel
   Camarillo…): create placeholder Passports, or store as free-text `awardedBy` label? (Recommend:
   placeholder Passports for the named lineage figures; free-text for one-offs.)
2. **Galleries** — import all gallery images per member, or cap N + curate? (Recommend: cap, featured first.)
3. **`started_training_with` (person)** — model as LineageRelationship, or skip for v1?
4. **belt_size / shirt_size** — import or skip? (Recommend skip for launch.)
5. **Email handling** — keep emails out of the committed dataset (claim flow only).
6. **New members in CSVs not yet in prod** — create, or enrich-only the existing 76? (Recommend: create real new ones, skip test/spam.)

## Guards

- **Schema migration to prod is the high-risk step** — migrate + verify, *then* import. `migrate
  deploy` only; never `db push`/`db pull` against prod Neon.
- Dry-run every prod write; importer idempotent/additive; behind `BBL_COUNTDOWN` (do **not** flip);
  no claim-email send.
- R2 key case-sensitivity (D-025); deploy is bun (D-024); one Neon project.

## Status of the prerequisite work (SESSION_0409, done)

- 44 member avatars optimized → R2 (200 on r2.dev) + `avatarUrl` backfilled in prod (42 rows).
- Importer drift **D-026** (dry-run affiliation idempotency) + **D-027** (school normalization) fixed
  + the 2 South Bay affiliations realized. The importer is now safe to re-run/extend.

## Delivered — Phases 1–2 code (cloud, un-applied)

Code written; **not** applied to prod, importer **not** run for real, `BBL_COUNTDOWN` **not** flipped.

- **Phase 1 migration** — `apps/web/prisma/migrations/20260617183436_add_passport_current_residence/`
  adds the one genuine gap, `Passport.currentResidence String?` (a single `ALTER TABLE … ADD COLUMN`).
  `MediaAttachment.passportId` already attaches to a Passport (SESSION_0289 back-relation) — no change.
  `AffiliationRole` is unchanged: home gym → `TRAINS_AT`, representing/current school → `MEMBER`, owned →
  `OWNER`, and the per-belt promotion school is `RankAward.organizationId` — all map onto existing values,
  so no new enum members. The promotion ladder needs no new fields (maps onto existing `RankAward`).
  Generated locally; **left un-applied** to prod (never `migrate deploy` against prod Neon here).
- **Phase 2 importer** — `apps/web/scripts/enrich-bbl-members-pods.ts` consumes
  `/tmp/bbl-export/reconciled-full.json`: matches accountless Passports by `displayName` within
  `bbl-lineage`, fills NULL profile fields, upserts per-belt `RankAward` rows (date/promoter/school/pics),
  attaches galleries as `MediaAttachment`, and writes home/representing affiliations. Idempotent,
  `--dry-run`, gated behind `BBL_COUNTDOWN`. A reproducible dry-run sample against a seeded local DB lives
  in `apps/web/scripts/fixtures/` (sample input + captured output).
