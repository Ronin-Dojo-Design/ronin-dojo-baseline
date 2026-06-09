---
title: "ADR 0025 — Passport identity source of truth (+ Affiliation, brand-color SoT)"
slug: adr-0025-passport-identity-source-of-truth
type: decision
status: accepted
created: 2026-06-09
updated: 2026-06-09
last_agent: claude-session-0358
pairs_with:
  - apps/web/prisma/schema.prisma
  - apps/web/server/admin/users/actions.ts
  - apps/web/server/web/lineage/create-lineage-member.ts
  - docs/knowledge/wiki/concepts/passport-and-shells.md
  - docs/sprints/SESSION_0357.md
  - docs/sprints/SESSION_0358.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0025 — Passport identity source of truth (+ Affiliation, brand-color SoT)

## Status

Accepted

## Context

`passport-and-shells.md` documented a **Passport + Shells** identity model, but the implementation
drifted into **four** disconnected "person" stores — the same human could exist in `Membership`,
`DirectoryProfile`, `LineageNode`, and `Passport`, and surfaces read whichever store happened to be
wired. The discipline "Top Ranked" rail rendered empty because it read `Membership.rank` while the
people were lineage black belts with `RankAward`s; the directory people facet read schools off
`Membership`, which is the wrong axis for BBL (a member's school is not their Baseline enrollment).
`passport-and-shells.md` also carried a standing open question (how RankAward relates to Membership),
and `repo-truth-index.md` had no canonical-entity map, so agents kept re-deriving the model.

Separately, the BBL "gold accent" bug (SESSION_0357) revealed that brand colors have **two** layers and
agents kept editing the wrong one.

This ADR ratifies the model that SESSION_0357 landed in the schema and SESSION_0358 wired into the
add-person flow and the read surfaces.

## Decision

1. **Passport is the single identity source of truth.** `DirectoryProfile` is a presentation/privacy
   **view**, not an identity store. `LineageNode` is the lineage-graph projection of a person, not a
   second identity. Profile/lineage surfaces resolve display name + avatar from Passport
   (`passport.displayName ?? user.name`, `passport.avatarUrl ?? user.image`).

2. **RankAward is the single rank/promotion source** (extends ADR 0016). It gained `source`
   (`RankAwardSource`: `STATED` | `EARNED`) and `verificationStatus`
   (`RankAwardVerificationStatus`: `UNVERIFIED` | `VERIFIED` | `DISPUTED` | `IMPORTED`). A person's
   **current rank is derived** (highest verified award), never a stored Passport/Membership field.
   `Membership.rankId` is deprecated → derived; its column removal is deferred (Baseline blast radius).

3. **Affiliation is the canonical person↔organization axis** — a new **display-only** model
   (`role`, `isCurrent`, linked `organization` **or** free-text `schoolName`). A person's schools,
   affiliations, and leagues are all `Organization`s (type-discriminated; umbrella affiliations use
   `OrganizationType.AFFILIATION`). Affiliation carries **no** payment/billing. `Membership` remains
   **Baseline enrollment** only (paying is a separate entitlement layer, ADR 0019). School-label and
   directory org-facet reads prefer Affiliation, falling back to Membership during the transition.

4. **Brand colors' source of truth is the `BrandSettings` DB row**, injected at runtime by
   `layout.tsx`, which **overrides** `app/styles.css`. `styles.css` is a fallback only. Editing
   `styles.css` alone changes nothing live; fix the seed (`seed-brand-settings.ts`) + reseed.

5. **Admin add-person is ONE action** (SESSION_0358): `createPerson` creates a placeholder `User`
   (`isPlaceholder`, synthetic unique email) + `Passport` + stated `RankAward` (`STATED`/`UNVERIFIED`)
   + optional `Affiliation` + optional lineage placement in a single transaction. Placement uses the
   new `createLineageMember` helper — the first **runtime** path that creates a `LineageNode` +
   `LineageTreeMember` (+ a `PROMOTED_BY` `LineageRelationship` when a parent is given); previously
   such rows existed only via seeds.

## Consequences

- Surfaces converge on canonical sources: the rail reads RankAward (ADR 0016), the directory facet +
  `memberSchoolLabel` read Affiliation. Identity fragmentation (drift **D-023**) is being paid down
  read-by-read; the four-store split is documented in `repo-truth-index.md`'s canonical-entity layer
  so it is not re-derived.
- The schema changes are **additive** (new columns/enums/model + back-relations; no DROP), safe for
  the `prebuild: db:migrate deploy` auto-apply (ADR 0017). The `Membership.rankId` removal stays a
  later Baseline cleanup.
- `Affiliation` and `Membership` now mean distinct things; conflating them (or treating Membership as
  the school source) is a regression. Documented in the glossary.
- `createLineageMember` is a reusable runtime member-create the lineage editor can adopt for its own
  "add member" affordance (the editor currently only *updates* existing members).
- Two color layers persist by design (DB override + CSS fallback) to support white-label parity; the
  DB is authoritative.

## Alternatives considered

- **Keep rank/school on `Membership`.** Rejected — Membership is Baseline enrollment; BBL lineage
  people have no Membership, so the rail/directory render empty or wrong.
- **Name the person↔org link `Affiliation`-on-a-Membership / reuse Membership.** Rejected — a paid
  enrollment and a display-only "trains at / affiliated with" fact are different; merging them leaks.
- **Store current rank on Passport.** Rejected — rank is provenance (who/when/where, verified); a
  derived highest-verified award is the truth, and storing it invites drift.
- **Move brand colors to CSS.** Rejected — white-label brands are DB-configured; CSS is the fallback.
