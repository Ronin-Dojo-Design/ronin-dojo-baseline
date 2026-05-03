---
title: "Lane Manifest: S042 — Tournament operations"
slug: lane-s042-tournament-ops
type: lane-manifest
status: ready
created: 2026-05-03
author: Petey
session_target: SESSION_0042
primary_lane: Tournament operations
worktree: wt-tournaments
pairs_with:
  - docs/architecture/dirstarter-baseline-index.md
  - docs/protocols/WORKFLOW_5.0.md
---

## Lane Manifest: SESSION_0042 — Tournament Operations

## WORKFLOW 5.0 alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin CRUD, public listing/detail, Stripe checkout (registration fees) |
| Extension or replacement | **Extension** — no Dirstarter tournament equivalent; uses admin CRUD + public listing patterns as substrate |
| Why justified | WEKAF brand requires tournament visibility; Baseline events need registration |
| Risk if bypassed | WEKAF launches without its core differentiator |

## Deliverables (max 3)

1. Tournament + Division admin CRUD — create tournament, add divisions with format/gender/age/weight rules
2. Public event discovery — list upcoming tournaments, detail page with divisions + registration button
3. Registration checkout — athlete registers for division(s), pays via Stripe, creates `Registration` + `RegistrationEntry`

---

## Schema already exists (Wave C — landed SESSION_0026)

No migration needed. Models available:

- `Tournament`, `TournamentDiscipline`, `Division`
- `Registration`, `RegistrationEntry`, `TournamentRole`, `TournamentStaffAssignment`
- `Bracket`, `Match`, `MatchCompetitor` (build in later session — NOT this one)
- `WeighInRecord`, `MatAssignment`, `FightRecord` (later session)
- `RuleSet`, `AuditLog` (later session)

**This session scope:** Tournament → Division → Registration flow only. Brackets/scoring are a follow-up.

---

## Recipe 1: Tournament + Division admin CRUD

- **Pattern:** Dirstarter admin CRUD (baseline index §3)
- **Template files to read:**

| File | Why | Pattern to copy |
| --- | --- | --- |
| `server/admin/tools/actions.ts` | Canonical admin upsert with nested relations | Action shape — tournament has nested divisions like tool has categories |
| `server/admin/tools/schema.ts` | Zod input schema | Validation pattern |
| `server/admin/tools/queries.ts` | List + detail with includes | Query with nested includes |
| `app/admin/tools/page.tsx` | Admin list | Data table layout |
| `app/admin/tools/[slug]/page.tsx` | Admin detail/edit | Form layout |

- **Delta from template:**
  - Entity: `Tournament` with nested `Division` array
  - Tournament fields: name, slug, brand, status, startDate, endDate, location, registrationDeadline, maxParticipants, entryFeeCents
  - Division fields: name, format (SINGLE_ELIM etc), gender, ageMin/Max, weightMin/Max, discipline, maxCompetitors
  - Status workflow: DRAFT → OPEN → CLOSED → IN_PROGRESS → COMPLETED
  - Brand scoping on all queries

- **New files to create:**

```text
apps/web/server/admin/tournaments/
  ├── actions.ts     (upsert tournament + divisions, update status)
  ├── schema.ts      (Zod schemas for tournament + division)
  └── queries.ts     (list/detail with divisions included)

apps/web/app/admin/tournaments/
  ├── page.tsx       (list)
  ├── new/page.tsx   (create wizard)
  └── [id]/page.tsx  (edit + manage divisions)
```

- **Acceptance:** Admin can create a tournament with divisions. Status transitions enforced. Brand-scoped.

---

## Recipe 2: Public event discovery

- **Pattern:** Dirstarter public tool listing (baseline index §1, §2)
- **Template files to read:**

| File | Why | Pattern to copy |
| --- | --- | --- |
| `app/(web)/tools/page.tsx` | Public listing with filters | SEO + filter pattern |
| `app/(web)/tools/[slug]/page.tsx` | Public detail | Detail layout |
| `components/web/tools/tool-card.tsx` | Card component | Card layout (adapt for event) |
| `server/web/tools/queries.ts` | Public queries | Filter/sort pattern |

- **Delta from template:**
  - Entity: `Tournament` (only status=OPEN shown publicly)
  - Card shows: name, date, location, discipline(s), spots remaining
  - Detail shows: full info + division list + "Register" CTA per division
  - Filters: by discipline, date range, location
  - Sort: by startDate (soonest first)

- **New files to create:**

```text
apps/web/app/(web)/tournaments/
  ├── page.tsx           (upcoming events list)
  └── [slug]/page.tsx    (detail + division list + register CTAs)

apps/web/components/web/tournaments/
  ├── tournament-card.tsx
  ├── tournament-list.tsx
  └── division-table.tsx

apps/web/server/web/tournaments/
  ├── queries.ts
  └── payloads.ts
```

- **Acceptance:** Public page lists OPEN tournaments. Detail page shows divisions with registration availability.

---

## Recipe 3: Registration checkout

- **Pattern:** Dirstarter Stripe checkout (webhook route — baseline index §9)
- **Template files to read:**

| File | Why | Pattern to copy |
| --- | --- | --- |
| `app/api/stripe/webhooks/route.ts` | Existing webhook handler | Extend with registration fulfillment |
| `server/web/actions/submit.ts` | Tool submission flow (user-facing action) | User submits → creates record pattern |
| `services/stripe.ts` | Stripe client instance | Checkout session creation |
| `server/web/entitlement/grant-entitlement.ts` | Post-payment grant pattern (SESSION_0036) | How we handle checkout completion |

- **Delta from template:**
  - User selects division(s) → creates Stripe checkout session with metadata
  - On `checkout.session.completed`: create `Registration` (status=CONFIRMED) + `RegistrationEntry` per division
  - Check division capacity before allowing registration
  - Validate eligibility (rank, age, weight) — basic checks, not full rules engine

- **New files to create:**

```text
apps/web/server/web/tournaments/
  ├── register.ts       (server action: validate + create checkout session)
  └── schema.ts         (Zod: division selection input)

# Webhook extension — edit existing file, don't create new:
# app/api/stripe/webhooks/route.ts — add registration fulfillment case
```

- **Acceptance:** User can register for a tournament division, pay via Stripe, Registration + RegistrationEntry created on payment success.

---

## Pre-flight checklist

- [ ] Read this manifest
- [ ] Confirm `Tournament`, `Division`, `Registration`, `RegistrationEntry` models exist in schema (they do — Wave C)
- [ ] Read `server/admin/tools/actions.ts` for admin CRUD pattern
- [ ] Read `app/api/stripe/webhooks/route.ts` for webhook extension pattern
- [ ] Read `server/web/entitlement/grant-entitlement.ts` for post-payment pattern
- [ ] Do NOT build brackets/scoring/mat assignment — that's a future session

## Token budget estimate

| Read | Tokens |
| --- | --- |
| This manifest | ~1.5K |
| admin tools pattern (3 files) | ~2K |
| public tools pattern (2 files) | ~1.5K |
| webhook + stripe service | ~1.5K |
| entitlement grant (post-payment ref) | ~0.5K |
| **Total** | **~7K** |

## Scope guard

**IN scope:** Tournament CRUD, Division CRUD, public discovery, registration + payment.

**OUT of scope (future sessions):**
- Brackets, matches, scoring
- Mat assignments, weigh-ins
- Officials/staff assignment workflow
- Live results / spectator view
- Ranking series / points accumulation
