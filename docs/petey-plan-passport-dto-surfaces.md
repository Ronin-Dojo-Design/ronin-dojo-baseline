---
title: "Petey Plan — Passport DTO surface migrations (issue #134, steps 2–5)"
slug: petey-plan-passport-dto-surfaces
type: petey-plan
status: active
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0421
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan — Passport DTO surface migrations (issue #134)

> **Purpose:** finish issue #134 — point every public surface at the **one canonical public Passport
> projection** so they stop re-selecting + re-redacting the same identity core (3 parallel Prisma
> selects, 2 separate redactors today). **Step 1 (the base) is DONE** (#135): `publicPassportPayload`
> + `projectPublicPassport` + `PublicPassportDTO` live in `server/web/passport/`. This plan is **steps
> 2–5** — the per-surface migrations + cleanup. A cold agent can take one surface, `/bow-in`, run it.

## The base to consume (already merged, #135)

- `server/web/passport/public-payloads.ts` → `publicPassportPayload` (identity core select:
  `displayName`, `avatarUrl`, `bio`, `socialLinks`, `directoryProfile { showRanks, visibility, slug }`,
  `rankAwardsEarned { rank { colorHex, rankSystem → discipline } }`).
- `server/web/passport/public-projection.ts` → `projectPublicPassport(passport, { brand?, showRanks? })`
  → `PublicPassportDTO`. **The single rank-gate + avatar-fallback audit point** (ADR 0025).
- Decision ratified in #134: **keep `showRanks`** and honor it uniformly (incl. tree/galaxy); the
  complexity was the duplication, not the feature.

## Shape: pipeline, not flat fanout

Independent surface migrations fan out, **then** a convergence cleanup that depends on the lineage
surfaces landing first:

```
[directory] [lineage-tree] [lineage-drawer] [disciplines] [promotion-events] [family]   ← fan out
                              └────────── galaxy (consumes projected lineage) ──────────┐
                                                                                        ▼
                                              delete dead redactors + single-gate assert (convergence)
```

- Each surface = **one behavior-preserving PR**, leaning on that surface's existing
  visibility/tier/redaction tests (do NOT change observable output).
- **galaxy** depends on **lineage** (it consumes the already-projected lineage result — #134 step 4) →
  sequence it after the lineage surfaces.
- **Cleanup** (#134 step 5: delete `redactLineageNodeRowRanks` / `redactLineageNodeProfileRanks`,
  assert one rank-gate audit point remains) runs LAST, after all lineage consumers migrated.

## Surfaces (one PR each)

| # | Surface | Today | Target |
| --- | --- | --- | --- |
| 2 | **Directory profile** | `directory/profile-projection.ts` + `directoryProfileDetailPayload` (tier/policy projection) | consume `projectPublicPassport`; keep directory **tier gating** as surface policy on top |
| 3a | **Lineage tree row** | `lineage/payloads.ts` `lineageNodeRowPayload` + `redactLineageNodeRowRanks` | consume base; replace redactor with `projectPublicPassport` |
| 3b | **Lineage profile drawer** | `lineageNodeProfilePayload` + `redactLineageNodeProfileRanks` | consume base; replace redactor with `projectPublicPassport` |
| 4 | **Galaxy** (after 3a/3b) | `bbl-galaxy-from-lineage.ts` consumes `LineageTreePublicResult` | point at shared verified/rank helpers; already verified-only post-#133 |
| — | **/me passport** | `getOwnDirectoryProfile` + `getOwnLineageProfile` (owner-unredacted) | consume base with `showRanks: true` (owner bypass) |
| — | **Disciplines / top-ranked** | `disciplines/top-ranked-queries.ts` | consume base for the member identity core |
| — | **Promotion-events timeline** | `promotion-events/payloads.ts` + `queries.ts` | consume base for promotee identity core |
| 5 | **Cleanup (LAST)** | dead redactors + duplicate selects | delete `redactLineageNodeRowRanks` / `redactLineageNodeProfileRanks`; confirm ONE rank-gate audit point |

## Per-surface acceptance (every PR)

- [ ] Surface view-models from `projectPublicPassport` (no local re-select of the rank→colorHex graph).
- [ ] **Behavior-preserving** — that surface's existing tests stay green:
      `lineage/queries.visibility.test.ts`, `directory/profile-tier-policy.integration.test.ts`,
      `directory/profile-projection.test.ts`, `promotion-events/queries.test.ts`.
- [ ] Honors `showRanks` (hidden → empty ranks); owner/admin contexts pass `showRanks: true`.
- [ ] Keeps redaction applicable beyond PUBLIC (watch `resolveLineageVisibilityScope`
      UNLISTED/RESTRICTED — #134 risk note).
- [ ] `next typegen && tsc --noEmit` clean · touched `bun test` green · `bun run lint:check` +
      `format:check` (local oxc bin, never `bunx`). No schema change.
- [ ] One surface per PR; isolate parallel surfaces with `isolation: worktree`.

## Watch-outs

- Avatar fallback chain lives in the projector now (`passport.avatarUrl ?? user.image ?? brand
  default`) — don't re-derive it per surface.
- Belt color is **always** `Rank.colorHex` data, never hardcoded.
- Galaxy is a **consumer** of the projected lineage result — don't give it its own select.
- Fold open PR **#133** (BBL Galaxy DRAFT) into surface #4; **triage/close #22** (stale lineage-editor
  PR) while in this lane.

## Origin

Issue #134 (steps 2–5); base merged #135 (`1d871277`). Teed up SESSION_0421 as the **#1 cloud fanout**
(ahead of the brand-harness prune) so the read-model surfaces consolidate on current files before the
prune churns every `server/*` file. See `petey-plan-brand-harness-prune.md` for the sequencing.
