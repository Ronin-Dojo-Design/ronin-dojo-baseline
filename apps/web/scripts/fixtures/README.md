# BBL Pods full-import — fixtures

Reproducible fixtures for `scripts/enrich-bbl-members-pods.ts` (Phase 2 of
[`docs/product/black-belt-legacy/BBL_PODS_FULL_IMPORT_SPEC.md`](../../../../docs/product/black-belt-legacy/BBL_PODS_FULL_IMPORT_SPEC.md)).

## `bbl-reconciled-full.sample.json`

A **synthetic** `reconciled-full.json` (3 people) used only to exercise the
enrichment importer's dry-run. It is NOT real data — the production
`reconciled-full.json` is produced by the local-only Phase 0 extraction and lives
(uncommitted) at `/tmp/bbl-export/reconciled-full.json`.

The sample is shaped to cover every branch:

| Person              | Demonstrates                                                                                                                                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Jane Doe**        | profile fill (bio/dob/placeOfBirth/currentResidence/socialLinks), 5-belt ladder → 4 new RankAwards + 1 enriched (current rank already exists), galleries → MediaAttachment, distinct representing school → new MEMBER affiliation, an **off-roster** promoter (Rickson Gracie) flagged into `notes` |
| **John Will**       | long-form date parse (`March 3rd, 1957`), current-rank award enriched in place, empty galleries skipped                                                                                                                                                                                             |
| **Ghost McMissing** | **unmatched** (no accountless Passport in the tree) → reported + skipped, never created                                                                                                                                                                                                             |

Dates exercise both formats the parser must handle: ISO `2009-07-08` and long-form
`July 8th, 2009`.

## Reproduce the dry-run sample

```bash
# 1. local Postgres + migrations applied (includes the Phase 1 currentResidence migration)
export DATABASE_URL="postgresql://brianscott@localhost:5432/ronindojo_dev"
bun run db:migrate:deploy

# 2. seed the roster (creates the bbl-lineage tree + accountless Passports the enricher matches)
SKIP_ENV_VALIDATION=1 bun run scripts/import-bbl-members-full.ts        # uses /tmp/bbl-export/reconciled.json

# 3. dry-run the enrichment against the sample input
SKIP_ENV_VALIDATION=1 bun run scripts/enrich-bbl-members-pods.ts \
  --dry-run --input scripts/fixtures/bbl-reconciled-full.sample.json
```

## Captured dry-run output

```text
🥋 BBL Pods full-fidelity enrichment (DRY RUN — writes NOTHING)
   input=scripts/fixtures/bbl-reconciled-full.sample.json tree=bbl-lineage ensure-ranks=true galleries=true

   Loaded 3 people.

   Roster in tree: 3 accountless passports.

── Per-person plan ──────────────────────────────────────────
   MATCH  Jane Doe                       fields=bio,dob,placeOfBirth,currentResidence,socialLinks awards=+4/~1 gallery=+2 aff=+1
   MATCH  John Will                      fields=dob,placeOfBirth,currentResidence,socialLinks awards=+0/~1 gallery=+0 aff=+0
   UNMATCHED  Ghost McMissing

── Summary ──────────────────────────────────────────────────
   People in input:         3
   Matched in tree:         2
   Unmatched (skipped):     1
   Organizations:           0 would create, 3 existing
   Profile fields filled:   9 would fill
   RankAwards:              4 would create, 2 would enrich
   Gallery attachments:     2 would attach
   Affiliations:            1 would create

── Warnings (2) ─────────────────────────────────────────
   ⚠ Off-roster promoter "Rickson Gracie" for Jane Doe (BK1) — kept in notes, awardedByPassportId left null
   ⚠ Unmatched person "Ghost McMissing" — no accountless Passport in tree "bbl-lineage"

✅ DRY RUN complete — nothing written.
```

Idempotency is by construction: every write is guarded by an existence check
(`{passportId, rankId}` for awards, `{passportId, mediaId}` for galleries,
`{passportId, organizationId, role}` for affiliations, NULL-only for profile fields).
The home-gym affiliations above already show `aff=+0` on Jane/John because the roster
importer's `TRAINS_AT` rows dedupe — a real run followed by a dry-run reports `0`.
