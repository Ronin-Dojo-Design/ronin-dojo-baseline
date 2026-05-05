---
title: "Tournament Operations — Feature Lane Status"
slug: tournament-ops
type: concept
status: active
created: 2026-05-05
updated: 2026-05-05
last_agent: copilot-session-0074
feature_area: tournament-ops
key_models:
  - Tournament
  - Division
  - Registration
  - RegistrationEntry
  - Bracket
  - Match
  - MatchCompetitor
  - FightRecord
  - RuleSet
  - WeighInRecord
  - MatAssignment
  - TournamentDiscipline
  - TournamentRole
  - TournamentStaffAssignment
key_files:
  - apps/web/server/admin/tournaments/
  - apps/web/server/web/tournaments/
  - apps/web/app/admin/tournaments/
  - apps/web/app/(web)/tournaments/
  - apps/web/components/web/tournaments/
  - apps/web/components/admin/tournaments/
pairs_with:
  - docs/sprints/SESSION_0042.md
  - docs/sprints/SESSION_0050.md
  - docs/architecture/s1-schema-design.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0074.md
---

# Tournament Operations — Feature Lane Status

## Purpose

Single lookup page for the tournament-ops feature lane. Prevents the SESSION_0073 mistake where two LLMs concluded "tournament ops was never started" because no concept page existed.

## Session history

| Session | What shipped |
|---|---|
| SESSION_0026 | Schema Wave C: Tournament, Division, Registration, Bracket, Match, FightRecord, RuleSet, WeighInRecord, MatAssignment models |
| SESSION_0042 | Admin CRUD (tournaments + divisions), public list + detail, server queries |
| SESSION_0043 | Registration flow: Zod schema, capacity check, Stripe checkout, webhook fulfillment |
| SESSION_0044 | RegisterButton wiring, success banner, admin registration list |
| SESSION_0045 | Free-path registration, admin links, TS fixes |
| SESSION_0046 | Cancel registration + Stripe refund |
| SESSION_0046.5 | stripePaymentIntentId storage, serializable transaction for capacity |
| SESSION_0047 | Registration status transitions (approve/waitlist/cancel), bulk actions, L1 rewrite |
| SESSION_0048 | Brand-scope remediation, bracket generation |
| SESSION_0049 | Match scoring, auto-advance BYE winners, bracket viewer |
| SESSION_0050 | L1 refactor (FS-0014): ScoreMatchForm + MatchCard → Dirstarter primitives, 10-point must scoring, auto-TKO |
| SESSION_0051 | Component inventory audit (L1 violations documented) |
| SESSION_0052 | L1 refactor: divisions-editor, registrations-table, tournament-card, tournament admin scaffolding |
| SESSION_0058 | Registration snapshot fields (snapshotRankName, snapshotOrgName), admin auth HOC hardening |

## Shipped surfaces

### Admin (apps/web/app/admin/tournaments/)

- **Tournament CRUD** — list, create, edit, delete with DataTable + scaffolding
- **Division editor** — nested division management within tournament form
- **Registration management** — list, approve/waitlist/cancel, bulk status actions
- **Bracket generation** — generate brackets from approved registrations
- **Bracket viewer** — visual bracket tree with match scoring
- **Score forms** — 10-point must + points scoring, auto-TKO detection

### Public (apps/web/app/(web)/tournaments/)

- **Tournament list** — filterable by discipline/date/location, brand-scoped
- **Tournament detail** — division table, registration button
- **Registration flow** — division selection → Stripe checkout (paid) or direct (free)
- **Cancel registration** — with Stripe refund for paid registrations
- **Success banner** — post-registration confirmation

### Server layer

- `server/admin/tournaments/` — actions, queries, bracket-queries, registrations-queries, schema
- `server/web/tournaments/` — queries, payloads, register, schema

## Schema models — usage status

| Model | In Use? | Notes |
|---|---|---|
| Tournament | ✅ Active | Full CRUD + public listing |
| TournamentDiscipline | ✅ Active | Join table for multi-discipline tournaments |
| Division | ✅ Active | Nested CRUD within tournament |
| Registration | ✅ Active | Full lifecycle: create → approve → cancel with Stripe |
| RegistrationEntry | ✅ Active | Per-division registration entries |
| TournamentRole | ✅ Active | Full admin CRUD (SESSION_0075 server + SESSION_0076 UI) |
| TournamentStaffAssignment | ✅ Active | Staff panel on tournament detail page (SESSION_0075 server + SESSION_0076 UI) |
| Bracket | ✅ Active | Generation + viewer |
| Match | ✅ Active | Scoring + advancement |
| MatchCompetitor | ✅ Active | Per-match competitor tracking |
| FightRecord | ✅ Active | Publication action upserts W/L/D from completed matches (SESSION_0077) |
| RuleSet | ✅ Active | Full admin CRUD (SESSION_0075 server + SESSION_0076 UI) |
| WeighInRecord | ✅ Partial | Panel component built (SESSION_0076), embedded on registration detail page (SESSION_0077) |
| MatAssignment | ✅ Active | Panel on tournament detail page with match→mat assignment (SESSION_0077) |

## Open work (S3 completion lane — remaining)

1. ~~**TournamentRole + StaffAssignment CRUD**~~ ✅ Done (SESSION_0075 + SESSION_0076)
2. ~~**WeighInRecord workflow**~~ ✅ Panel built (SESSION_0076), embedded on registration detail (SESSION_0077)
3. ~~**MatAssignment UI**~~ ✅ Done (SESSION_0077) — panel on tournament detail page
4. ~~**FightRecord publication**~~ ✅ Done (SESSION_0077) — publish from completed matches, upserts W/L/D
5. ~~**RuleSet CRUD + assignment**~~ ✅ CRUD done (SESSION_0075 + SESSION_0076) — wire into match scoring TBD
6. **Tournament results page** — public bracket results, medal standings
7. **Integration tests** — registration capacity race conditions, cross-brand isolation
8. **Seeding algorithm** — rank-based seeding for bracket generation
9. ~~**Registration detail page**~~ ✅ Done (SESSION_0077) — overview, entries, WeighIn panel
10. **RuleSet → Division wiring** — assign rule sets to divisions, enforce during match scoring

## Key decisions

- **Stripe integration**: Paid registrations use Stripe Checkout sessions; `stripePaymentIntentId` stored for refund path
- **Capacity management**: Serializable transaction wrapper prevents overselling
- **Registration snapshots**: `snapshotRankName` + `snapshotOrgName` captured at registration time (SESSION_0058)
- **L1 compliance**: All tournament UI refactored to Dirstarter primitives (SESSION_0050 + SESSION_0052)
