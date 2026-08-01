---
title: "Petey plan — RankEntry-unification Wayfinder charted (map #374)"
slug: petey-plan-0727-rankentry-wayfinder
type: plan
status: ratified
created: 2026-07-30
updated: 2026-07-31
last_agent: codex-session-0731
pairs_with:
  - docs/sprints/SESSION_0727.md
  - docs/product/black-belt-legacy/rankentry-unification-epic.md
  - docs/adr/0058-rankentry-is-rank-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey plan — RankEntry-unification Wayfinder (SESSION_0727)

The RankAward→RankEntry epic is charted as **wayfinder map
[#374](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/374)**, anchored on the
published spec [#372](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/372)
(`ready-for-agent`; `/to-spec` DONE — never re-run). The map is the route authority; this doc
records the sizing evidence + grill outcomes that shaped it, and the dispatch order. Detail
lives on the tickets, not here.

## Sizing evidence (TASK_01 — prod read, 2026-07-30)

Read-only query against **prod** (via `DIRECT_URL`; the pooler `DATABASE_URL` creds are stale
— ticket [#381](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/381)):

- **RankEntry: 111 rows** — 99 VERIFIED, 12 UNVERIFIED. RankAward: 111 rows — 27 VERIFIED,
  **72 IMPORTED**, 12 UNVERIFIED. **0 award-only orphans** (every award has its entry).
- **Canonical tree (`rigan-machado-lineage`): 95/95 member passports carry a RankEntry.**
  The SESSION_0522/0524 backfills applied; **the "0/78 dark roster" premise (SESSION_0725)
  was a stale local prodsnap artifact**, not prod truth.
- Remaining gap: **7 passports on side trees** (bbl-dirty-dozen / kajukenbo / muay-thai /
  karate / doce-pares) with no rank rows in either model.

**Sizing verdict: the roster backfill is ALREADY DONE.** The epic narrows to
**provenance + one read-seam + CI guard** (+ a 7-passport side-tree sweep + env hygiene).

## Grill outcomes (operator, SESSION_0727 — one-word picks; do not re-open)

1. **Provenance = COLUMN** on RankEntry (imported-vs-earned survives the G-011 table-drop);
   exact shape → prototype ticket [#375](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/375).
2. **Backfill = sweep the 7** side-tree stragglers (script + dry-run; `--apply` attended) →
   [#379](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/379). Canonical-tree
   lane closed as done.
3. **Table-drop = sequenced now** on the map with explicit blockers (**corrected SESSION_0730:
   before FI-001; blocked on #398**) →
   [#380](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/380).
4. **Map home = GitHub issues now** (skill-canonical); this doc + the SESSION file are the
   in-repo record.

Carried from SESSION_0723 (already ratified): one canonical rank-read seam
(`memberRanks`/`memberTopRank` on RankEntry, repoint ~29 readers); backfill status =
VERIFIED; executors model-agnostic (codex build-wall → gates on Claude/foreground).

## Dispatch order (next sessions)

- **Wave 1 (frontier, can fan out now):**
  [#375](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/375) provenance shape
  (`full`, HITL /prototype — **the next attended session**, staged as SESSION_0728) ·
  [#378](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/378) lineage test-gate
  fix (`quick`, AFK) ·
  [#379](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/379) straggler-sweep
  script + dry-run (`quick`, AFK; `--apply` attended) ·
  [#381](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/381) env hygiene
  (`quick`, attended — secrets).
- **Wave 2:** [#376](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/376) seam +
  read-sweep (blocked by #375) → [#377](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/377)
  CI read-guard (blocked by #376).
- **Wave 3:** [#380](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/380)
  table-drop grill (blocked by #376 + #377).

## Hard constraints (flagged, untouched)

- **Rank-awarded truth** (ADR 0035 / ADR 0058) and the **Passport-keyed claim** (ADR 0036)
  are ratified — no ticket re-opens them; the seam preserves the display law.
- **Technique-media NO-LEAK invariant**: no ticket touches media payloads; the seam exposes
  rank/status/provenance only.
- Prod writes are AFK-NEVER: every sweep/backfill is dry-run by default, `--apply` attended.
- Wayfinder discipline: never resolve more than one non-research ticket per session; HITL
  tickets are the operator's — never self-answer.

## Bow-out finding candidates (route at close — ledgers frozen this session)

- **Stale-prodsnap false negative** seeded the epic premise (0/78 vs prod 95/95) — FS/drift
  candidate; durable fix is the cadence question in map fog + [#381](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/381).
- **Pooler `DATABASE_URL` P1000 + `channel_binding=require`** (node-postgres can't satisfy
  it) — runbook note candidate; workaround recorded on [#381](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/381).
