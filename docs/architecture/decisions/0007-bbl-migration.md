# ADR 0007 — BBL one-time migration from legacy to new stack

**Status:** Accepted (planned)
**Date:** 2026-04-25

## Context

BBL has real users in the legacy stack at [Ronin-Dojo-Design/ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo). Unlike WEKAF (greenfield, no users) and TuffBuffs (staying on legacy indefinitely — see [ADR 0005](0005-legacy-coexistence.md)), BBL needs to migrate once before its DNS cuts over to the new stack.

## Decision

Plan a **one-time, scripted migration** from the legacy WP DB into the new Postgres, executed once shortly before DNS cutover. The migration script lives at `apps/web/scripts/migrate-bbl.ts`.

## Migration scope

What moves:

- **Users + profiles** from `wp_users` + Pods `bbl_member` → `User` + `Profile` (preserve email, name; capture `wp_user_id` as `legacyUserId` for support continuity).
- **Schools** from Pods `bbl_school` → `School` with `brand: 'BBL'`.
- **Memberships / lineage** from Pods relationships → `Membership` with appropriate role.
- **Belt/progress data** if present → `Belt` + `Progress`.

What does NOT move:

- WP password hashes (different format; force password reset via Better-Auth's "forgot password" email blast on cutover day).
- WP user meta beyond what Pods exposes for BBL.
- WP comments/posts (irrelevant to app data).
- Theme/plugin config (legacy stack's concern).

## Cutover sequence

1. Build BBL fully in the new stack (UI, API, auth, screens) before any migration runs.
2. **Dry run:** point script at a copy of the legacy DB; inspect output in a staging Postgres; verify counts and spot-check 5–10 users.
3. **Freeze legacy BBL writes** (10–30 min window): put a maintenance banner up.
4. **Run migration** against production legacy → production new Postgres.
5. **Send password-reset email** to every migrated user via Better-Auth's flow (Resend is already wired in Dirstarter).
6. **Cut DNS** for BBL's domain to the new Vercel deployment.
7. **Smoke test:** sign in as a known migrated user via reset flow; verify school/membership/belt data appears correctly.

## Rollback plan

If migration is materially broken post-cutover:

- DNS reverts to the legacy stack (TTL set low — 60–300s — for the 24h around cutover).
- Legacy BBL writes were frozen; no data loss in the rollback.
- Investigate, fix, re-run.

## Consequences

**Positive**

- BBL users land on the new stack with their identity preserved (same email, history of belt awards, school affiliations).
- One disruption, well-scoped, well-tested before it happens.

**Negative**

- Password reset on cutover is a friction moment (mitigated by clear comms email pre-cutover + a banner).
- Legacy → Pods relationship mapping requires careful schema reading. Allocate real time to writing the script; don't underestimate.

## Tracking

When BBL migration becomes near-term, open a tracking issue and link this ADR. Fields the script must produce:

- `users.legacyUserId` (string, nullable)
- `schools.legacyPodId`
- `memberships.legacyPodId`

These let the support team correlate post-migration questions ("my old account was X") to new records.
