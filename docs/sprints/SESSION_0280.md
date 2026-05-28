---
title: "SESSION 0280 — Lineage join browser smoke + full close"
slug: session-0280
type: session--implement
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0280
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0279.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0280 — Lineage join browser smoke + full close

## Date

2026-05-28

## Operator

Brian + copilot-session-0280 (Petey orchestrating, Cody executing)

## Goal

Complete the DB-backed browser smoke for `/lineage/join` (Free + Premium + Claim paths) that was blocked in SESSION_0279, then full-close both sessions with ADR, git hygiene, and push.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `next.config.ts` (allowedDevOrigins), Prisma seed script for BBL org fixture, `/etc/hosts` brand mapping |
| Extension or replacement | Extension — added BBL brand dev infrastructure for local smoke testing |
| Why justified | SESSION_0279 TASK_01 was blocked on Postgres approval; this session unblocked and completed the smoke |
| Risk if bypassed | BBL Join the Legacy intake would remain unproven with real DB rows |

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0280_TASK_01 | Cody | complete | Restored `pg_hba.conf` to trust auth, verified Postgres connectivity, confirmed 5 existing orgs (all BASELINE_MARTIAL_ARTS, no BBL) |
| SESSION_0280_TASK_02 | Cody | complete | Created `seed-bbl-org.ts` — idempotent BBL org + claimable lineage tree seed. Ran successfully: Organization, User, LineageNode, LineageTree, LineageTreeMember created |
| SESSION_0280_TASK_03 | Cody | complete | Added `allowedDevOrigins` to `next.config.ts` for `bbl.local`, `baseline.local`, `wekaf.local` |
| SESSION_0280_TASK_04 | Cody + Brian | complete | Browser smoke: Free path → success page ✅, Premium path → `/submit/{slug}` checkout ✅ |
| SESSION_0280_TASK_05 | Cody | skipped | Authenticated claim path — blocked by OAuth redirect URI mismatch on `bbl.local` and no dev-login bypass. Not a code defect. |
| SESSION_0280_TASK_06 | Petey | complete | ADR 0012 — brand-aware magic links. Full close, git hygiene, push. |

## What landed

- `apps/web/prisma/seed-bbl-org.ts` — idempotent BBL org + claimable lineage tree seed script
- `apps/web/next.config.ts` — `allowedDevOrigins` for multi-brand local dev hosts
- `docs/architecture/decisions/0012-brand-aware-magic-links.md` — ADR for brand-aware Better-Auth magic link sender + URL origin
- `docs/sprints/SESSION_0280.md` — this session file
- Restored `pg_hba.conf` from `scram-sha-256` back to `trust` auth for Postgres.app local dev
- Added `bbl.local` to `/etc/hosts`

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/prisma/seed-bbl-org.ts` | New — BBL org + lineage tree seed |
| `apps/web/next.config.ts` | Added `allowedDevOrigins` |
| `docs/architecture/decisions/0012-brand-aware-magic-links.md` | New ADR |
| `docs/sprints/SESSION_0280.md` | This session |
| `docs/sprints/SESSION_0279.md` | Updated status to closed |
| `docs/knowledge/wiki/index.md` | Added SESSION_0280 row |

## Verification

| Check | Result |
| --- | --- |
| Postgres connectivity | Restored trust auth; `psql ronindojo_dev` works passwordless |
| `seed-bbl-org.ts` | All 5 fixtures created successfully |
| Dev server | `npx next dev --turbo` — compiled `/lineage/join` in 67s (first compile) |
| Free path smoke | `bbl.local:3000/lineage/join` → submitted → success heart page ✅ |
| Premium path smoke | `bbl.local:3000/lineage/join` → submitted → `/submit/freddy-testington-legacy-profile` checkout ✅ |
| DB evidence | 2 BBL Lead rows: `ronindojodesign@gmail.com` (Free), `premium-test@example.com` (Premium) |
| Claim path | Skipped — OAuth redirect URI not configured for `bbl.local`, not a code defect |

## Browser smoke evidence

### Free path
- URL: `http://bbl.local:3000/lineage/join`
- Input: name + `ronindojodesign@gmail.com`, membership = FREE
- Result: Redirected to success page with heart confirmation
- DB: `Lead` row with `brand = BBL`, `email = ronindojodesign@gmail.com`

### Premium path
- URL: `http://bbl.local:3000/lineage/join`
- Input: name "Freddy Testington" + `premium-test@example.com`, membership = PREMIUM
- Result: Redirected to `/submit/freddy-testington-legacy-profile` (checkout page showing "Choose a plan for Freddy Testington Legacy Profile")
- DB: `Lead` row with `brand = BBL`, `email = premium-test@example.com`

### Observations
- Header chrome shows "Baseline Martial Arts" instead of "Black Belt Legacy" — brand theming/chrome not yet wired for BBL. This is expected scope for a future sprint (L4 theming layer).
- "1 Issue" badge was the HMR cross-origin warning, resolved by `allowedDevOrigins` config.

## Open decisions / blockers

- **Claim path auth:** Needs either Google OAuth redirect URI for `bbl.local`, a dev-login bypass, or magic link with a real email. Track for next session.
- **BBL brand chrome:** Header/footer shows Baseline branding on `bbl.local`. L4 theming work for a future sprint.
- **External:** `blackbeltlegacy.com` Resend domain verification + DNS still pending.

## Next session

**Goal:** Wire BBL brand chrome (header, footer, theme tokens) so `bbl.local` shows Black Belt Legacy branding instead of Baseline.

**Inputs to read:**
- `docs/sprints/SESSION_0280.md`
- `docs/architecture/decisions/0012-brand-aware-magic-links.md`
- `apps/web/proxy.ts` (brand → host mapping)

**First task:** Identify the brand chrome resolution path in the Dirstarter shell and add BBL theme tokens.
