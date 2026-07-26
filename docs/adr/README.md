---
title: "ADR corpus (lean, 2026-07 reboot)"
slug: adr-readme
type: reference
status: active
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0711
---

# docs/adr/ — the lean ADR corpus

This is the **fresh, lean ADR log** started at the SESSION_0711 cleanup. Records here are short
Pocock-format decisions (Status / Context / Decision / Consequences) that state **current law** —
one decision per file, no epics, no implementation journals.

## The legacy corpus is frozen

The original log lives at [`docs/architecture/decisions/`](../architecture/decisions/) —
**ADR 0001–0054, frozen**: files there never move or renumber; corrections are applied as
supersession banners in place. Treat it as the historical record and the source for anything not
yet re-ratified here. When a legacy ADR and a `docs/adr/` record conflict, `docs/adr/` wins.

## Numbering

- `0001` — **reserved** for the migration lane (not minted here).
- `0002+` — seeded below; append monotonically, never reuse a number.

## Current records

| ADR | Decision | Re-states |
| --- | --- | --- |
| 0001 | (reserved — migration lane) | — |
| [0002](0002-main-is-pr-only.md) | `main` is PR-only, enforced by a GitHub ruleset | legacy 0053 |
| [0003](0003-per-app-databases.md) | One database per app (deploy unit = app + DB) | legacy 0038 (+0034) |
| [0004](0004-rankentry-is-rank-truth.md) | RankEntry is the ONE rank model | supersedes legacy 0016/0035 |

## Re-ratification backlog (by subject)

Legacy decisions still awaiting a lean re-statement here, grouped by subject — re-ratify on first
touch, not speculatively:

- **Repo & deploys** — monorepo + per-app Vercel projects (legacy 0034/0039); session numbering +
  lane facet (0049); lean session model (0052).
- **Portfolio taxonomy** — kernel → brand → app; white-label instance axis (0051); death of the
  in-app multi-brand harness (0004/0006/0021/0022 banners).
- **Design system** — ONE L1 card + named cards, tokens-as-contract (0040); AdminCollection as the
  admin law (0045); shared kernel extraction (0033 D1 / 0040 Option B).
- **Identity & claims** — Passport as identity SoT (0025); unified Passport-keyed claim (0036);
  social-signin pending claim (0032).
- **Lineage & belts** — rank display from awarded truth (0035 → folded into 0004 here); technique
  ownership axes (0046); grappling-arts technique scope (0050); branch heads + placement (0037).
- **Commerce** — entitlement-first commerce (0011); per-brand Stripe accounts (0030); tier
  auto-grant (0054, renumbered from dup 0012).
- **API layer** — FULL oRPC adoption (0024 as amended by SOT-ADR D3).
- **Content** — Post as the canonical blog surface (0042); content-atom relations (0018).
