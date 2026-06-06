# ADR 0005 — Legacy stack stays at tuffbuffs.com; new stack runs everything else

**Status:** Accepted
**Date:** 2026-04-25

## Context

The legacy monorepo at [Ronin-Dojo-Design/ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) powers the live TuffBuffs site at `tuffbuffs.com` and has real users. The new platform at [Ronin-Dojo-Design/ronin-dojo-baseline](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline) is a clean-slate rebuild for Ronin Dojo Design (umbrella), Baseline Martial Arts (the TuffBuffs rebrand/successor), BBL, and WEKAF.

## Decision

The legacy WordPress stack continues to run unchanged at `tuffbuffs.com`, serving the existing TuffBuffs users. **No data migration. No shared database. No cross-stack auth.** The two stacks coexist independently.

The new stack (Ronin Dojo Design, Baseline Martial Arts, BBL, WEKAF) runs on its own Postgres + Vercel deployment. Baseline Martial Arts is a *successor* product to TuffBuffs, not a replacement deployed onto the same domain.

## Consequences

### Positive

- Existing TuffBuffs users are not disrupted.
- The new stack stays clean — no legacy data shapes leaking into the new schema.
- Migration becomes a deliberate one-time effort if/when it happens, not an architectural constraint.
- The "starting fresh with a better backend" goal is preserved.

### Negative

- Two systems to keep alive. Legacy TuffBuffs needs occasional security patching (WP core, plugins) until it's eventually retired.
- TuffBuffs users cannot use the new platform without re-registering — when/if Baseline Martial Arts launches publicly, expect a re-onboarding moment.

## What this means operationally

- The legacy monorepo stays where it is. Don't merge the new repo into it.
- An earlier WordPress Local install at `/Users/brianscott/Local Sites/ronin-dojo/app/public/` was abandoned during planning; it is irrelevant to both stacks now.
- If TuffBuffs.com needs a fix, it's a legacy-side change. Don't backport to the new stack.

## Future migration (deferred decision)

If/when TuffBuffs users migrate to Baseline Martial Arts:

1. Add `TUFFBUFFS` to the `Brand` enum in the new DB.
1. One-time export from legacy WP DB → import script into new Postgres (preserve user IDs as a `legacyUserId` field for support continuity).
1. Force password reset on first login (don't migrate WP password hashes — different format).
1. DNS plan: keep `tuffbuffs.com` pointing at the new stack OR redirect to `baselinemartialarts.com` — to be decided at migration time.
