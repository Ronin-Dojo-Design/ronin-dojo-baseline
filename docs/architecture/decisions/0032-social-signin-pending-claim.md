---
title: ADR 0032 — Social-sign-in pending claim binding
slug: adr-0032-social-signin-pending-claim
type: decision
status: accepted
created: 2026-06-19
updated: 2026-06-19
last_agent: claude-session-0419
pairs_with:
  - docs/sprints/SESSION_0419.md
  - docs/architecture/decisions/0025-passport-identity-consolidation.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - auth
  - lineage
  - claim
  - identity
---

# ADR 0032 — Social-sign-in pending claim binding

## Decision

A lineage node claim is bound to the **invited email address**, not to a single sign-in mechanism.
At claim-link mint time we persist a `LineagePendingClaim { email, brand, nodeId }` row, and on
**every** successful authentication we reconcile it: `lib/auth.ts` `hooks.after` (which already
fires for Google OAuth callback, magic-link verify, and email sign-up) looks up any unconsumed
binding for the authenticated, email-verified user and runs the claim. Any sign-in method now
claims; the magic-link `callbackURL` route path remains as a direct, idempotent claim.

## Context

The original one-click claim (SESSION_0412) rode **only** the magic-link `callbackURL`
(`/preview → /lineage/claim/accept?node=<id>`). The founder email recommends "Continue with Google"
as the primary method, but Google OAuth carries no node id — so a founder who followed the
recommended path authenticated correctly yet **never claimed** their profile (SESSION_0419: both
founders were unclaimed; Tony had signed in with Google). The node-to-sign-in coupling was the bug:
the claim must survive whichever door the user walks through.

## Decision drivers

- The invited email is the identity proof we already control; `emailVerified` (true for Google and
  magic-link) authorizes consuming the binding.
- `hooks.after` is the single existing seam that fires on every auth path and already runs
  `ensureIdentityShell` — the reconciler runs **after** the shell so the placeholder Passport swap
  (`finalizeLineageNodeClaim` deletes the empty signup Passport, attaches the node's) respects the
  `Passport.userId @unique` constraint.
- One claim core (`claimNodeForUser`) is shared by the route action and the reconciler so they can
  never drift; the admin-approve path keeps using `finalizeLineageNodeClaim` directly.

## Consequences

- New additive table `LineagePendingClaim` (`@@unique([email, nodeId])`), written at mint by
  `mintClaimMagicLink` (node parsed from the nextPath — zero caller changes) and by deliberate
  backfill (e.g. Bob's two founder addresses).
- The reconciler **never throws** — a claim failure (ALREADY_OWNED_BY_OTHER, CLAIMANT_HAS_NODE)
  must never block authentication; the binding is left unconsumed for a later retry.
- Idempotent: a replay is a no-op (the node's Passport already belongs to the claimant); the
  magic-link route still claims directly and the reconciler's finalize is a no-op on replay.
- A successful claim now fires the `profile-claim-approved` lifecycle email on all paths (see
  ADR 0031 for the send gate).

## Dirstarter baseline note

This reuses Better Auth's existing `hooks.after` (`createAuthMiddleware`) seam and `databaseHooks`
model — no Better Auth config/provider change. The decision is domain-level (how a claim binds to an
identity), layered on top of the unchanged auth baseline.

## Alternatives considered

- **Carry the node through Google via a node-bearing OAuth `callbackURL`** — only works for one
  specific link click, not "any sign-in, any device, days later." Rejected for the email-bound
  binding, which is method- and device-agnostic.
- **Signed cookie through the OAuth round-trip** — no migration, but still link-click-scoped and
  fragile across devices. Rejected.
