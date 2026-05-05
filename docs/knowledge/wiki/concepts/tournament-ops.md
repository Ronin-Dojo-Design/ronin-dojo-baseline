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
| TournamentRole | ⚠️ Schema only | Model exists, no server actions or UI |
| TournamentStaffAssignment | ⚠️ Schema only | Model exists, no server actions or UI |
| Bracket | ✅ Active | Generation + viewer |
| Match | ✅ Active | Scoring + advancement |
| MatchCompetitor | ✅ Active | Per-match competitor tracking |
| FightRecord | ⚠️ Partial | Model exists, scoring writes to Match but FightRecord publication (official record with judge signatures) not implemented |
| RuleSet | ⚠️ Schema only | Model exists, no CRUD or assignment UI |
| WeighInRecord | ⚠️ Schema only | Model exists, no weigh-in workflow |
| MatAssignment | ⚠️ Schema only | Model exists, no mat/ring assignment UI |

## Open work (S3 completion lane — SESSION_0075–0078)

1. **TournamentRole + StaffAssignment CRUD** — assign judges, referees, mat coordinators
2. **WeighInRecord workflow** — weigh-in station UI, weight class validation
3. **MatAssignment UI** — assign matches to mats/rings, day-of scheduling
4. **FightRecord publication** — official fight records with judge scores, winner certification
5. **RuleSet CRUD + assignment** — define scoring rules per division, wire into match scoring
6. **Tournament results page** — public bracket results, medal standings
7. **Integration tests** — registration capacity race conditions, cross-brand isolation
8. **Seeding algorithm** — rank-based seeding for bracket generation

## Key decisions

- **Stripe integration**: Paid registrations use Stripe Checkout sessions; `stripePaymentIntentId` stored for refund path
- **Capacity management**: Serializable transaction wrapper prevents overselling
- **Registration snapshots**: `snapshotRankName` + `snapshotOrgName` captured at registration time (SESSION_0058)
- **L1 compliance**: All tournament UI refactored to Dirstarter primitives (SESSION_0050 + SESSION_0052)
