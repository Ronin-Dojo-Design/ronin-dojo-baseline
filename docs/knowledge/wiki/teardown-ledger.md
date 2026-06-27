---
title: "Teardown Ledger — deferred prod/test data cleanup"
slug: teardown-ledger
type: reference
status: active
created: 2026-06-27
updated: 2026-06-27
last_agent: claude-session-0457
pairs_with:
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Teardown Ledger (TD)

The canonical home for **deferred prod/test data cleanup** — things deliberately left on production that
someone may want to remove later: leftover test accounts, banked destructive scripts, parked demo data,
rows kept on purpose. Distinct from wiring debt (`WL`), architectural drift (`D`), and SOP misses (`FS`):
those are about *code/architecture*; this is about *data we chose not to delete (yet)*.

**Convention.** One `### TD-NNN — title` section per item (monotonic, zero-padded 3 digits). Each carries a
`- **Status:**` line. The [loop-of-loops aggregator](../../protocols/loop-of-loops-ledger-driven-sessions.md)
(`scripts/ledger-backlog.ts`) surfaces only **`open`/`pending`** rows at bow-in; **`parked`** rows are
recorded-but-accepted (a kept-on-purpose decision) and do not nag the backlog — flip to `open` if the
decision changes. Route here from the closing-ritual finding router (closing.md §6.7).

| Status | Meaning |
| --- | --- |
| `open` | A real teardown TODO — surfaces in the bow-in backlog. |
| `parked` | Deliberately kept; recorded for traceability; does not surface. |
| `done` | Torn down; keep the row as history. |

---

### TD-001 — FI-001 test inbox leftover `User` on prod (`ronindojodesign@gmail.com`)

- **Status:** parked (operator decision SESSION_0457 — leave it)
- **What:** the `ronindojodesign@gmail.com` throwaway account (`sgg3rtFNltvlrfxGcEgHSkRT7YWr5WN7`) used to
  vet the FI-001 thank-you email. It is **0-activity** now (no claimed node, pending claim, membership,
  entitlement, registration, or passport claim — the 0444 test claim was torn down).
- **Why parked, not deleted:** the user delete is blocked by **3 immutable `AuditLog` rows** (`AuditLog→User`
  is `Restrict`) recording the torn-down 0444 test (`lineage.claim.reviewed` + 2 `entitlement.comp.granted`,
  2026-06-25). Completing the delete would require destroying prod audit history; the account is harmless, so
  the operator chose to leave it. It does not interfere with future test-sends (`--free-signup` just signs
  into it).
- **Tool / how to action if the decision changes:** `apps/web/scripts/delete-test-inbox-user.ts --apply
  --with-audit-logs` (guarded — refuses any account with real activity).

### TD-002 — Banked reversible purge of non-BBL Baseline demo data on prod

- **Status:** parked (operator decision SESSION_0450 — keep)
- **What:** prod carries **391 non-BBL rows** (388 BASELINE + 1 WEKAF + 1 RONIN) — the original Baseline
  Martial Arts demo dataset, co-resident with live BBL and brand-hidden from BBL surfaces.
- **Why parked:** the `brand` column is **not a vestige** — it's the still-load-bearing BBL-vs-future-
  `baselinemartialarts.com` separator (multi-product model), and the demo data is the seed for that future
  product. Harmless (brand-hidden). Keeping the data ⟺ keeping the column.
- **Tool / how to action if the decision changes:** `apps/web/scripts/purge-non-bbl-baseline-data.ts`
  (transactional, dry-run default; dry-ran on prod + prodsnap with byte-identical BBL integrity, then rolled
  back — banked for the eventual Baseline extraction). See `[[brand-vestige-trim-inventory]]`.
