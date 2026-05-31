---
title: "Brand-Scope Hardening Plan"
slug: brand-scope-hardening-plan
type: file
status: active
created: 2026-05-31
updated: 2026-05-31
last_agent: codex-session-0313
pairs_with:
  - docs/security/README.md
  - docs/security/ronin-security-risk-register.md
  - docs/architecture/decisions/0004-multi-brand-as-column.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Brand-Scope Hardening Plan

## Summary

Brand isolation is the highest-value hardening task for Ronin Dojo Baseline. The platform intentionally uses one app, one database, and one schema with `brand` as a column. That architecture is efficient, but a single missed predicate can leak data across Baseline Martial Arts, Black Belt Legacy, WEKAF, and Ronin Dojo Design.

This plan stages the first code PR: `fix(security): enforce brand-scoped database access`.

## Existing strengths

- Brand mapping is centralized in `apps/web/lib/brand-context.ts`.
- `apps/web/proxy.ts` overwrites downstream `x-brand`, so server code should not trust a client-supplied brand header.
- Auth/authorization helpers already model active brand, membership, organization ownership, and org-scoped roles.
- `apps/web/lib/authz.ts` explicitly says app-layer authorization and a brand-scope Prisma extension are belt-and-suspenders controls.
- Many Prisma models already include `brand` and indexes.

## Current gap

`apps/web/services/db.ts` currently returns a Prisma client extended only with `uniqueSlugsExtension`. The review did not find a brand-scope extension wired into the client.

That means brand isolation currently depends on each query/action remembering the correct predicate.

## Target invariant

For brand-scoped models, every read/write must satisfy one of these paths:

1. **Scoped user path** — query includes or derives the active brand from trusted request context.
2. **Scoped org path** — query derives organization and verifies `organization.brand === activeBrand`.
3. **Explicit global-admin path** — a named unscoped helper is used, audited, and limited to true global admin/system jobs.
4. **Public verification-safe path** — a public allowlisted projection returns only verification-safe fields and never exposes private internals.

No ordinary feature code should call the raw unscoped Prisma client for brand-scoped business data.

## Proposed implementation

### 1. Define the brand-scoped model allowlist

Start with models that either carry `brand` directly or are reachable through a brand-owned parent:

- Direct brand models: `Organization`, `Membership`, `Role`, `AuditLog`, `Media`, `Invoice`, `Payment`, `UserEntitlement`, `Tournament`, `RegistrationEntry`, `Certificate`, `Certification`, `ContentAtom`, `Program`, `Course`, `ClassSchedule`, `ClassSession`, `Waiver`, `Lead`, `Invite`, `MerchOrder`.
- Parent-derived models: role assignments, attendance, progress, attachments, and line items that must derive brand through parent rows.

The first PR should keep the allowlist conservative and expand only after tests prove behavior.

### 2. Add a scoped client factory

Preferred shape:

```ts
const db = rawDb
const scopedDb = brandScopedDb({ brand, user, source: "server-action" })
```

or a Prisma extension:

```ts
rawDb.$extends(brandScopeExtension({ brand, user }))
```

Whichever approach is chosen must preserve a deliberately named escape hatch for migrations, seeds, internal jobs, and explicit global-admin audits.

### 3. Fail loudly in development and test

When a brand-scoped model query omits brand context or attempts a cross-brand predicate:

- throw in development and test,
- log a structured security event in production,
- deny the request unless it uses the explicit audited unscoped path.

### 4. Update server-action clients

Add clients that carry trusted brand and audit metadata:

- `brandScopedActionClient`
- `brandAdminActionClient`
- `orgStaffActionClient`

These should inject brand, user, active brand, IP/user-agent metadata, and audit context so individual actions do not reinvent permission checks.

### 5. Add tests before broad migration

Minimum test cases:

- Baseline user cannot read BBL membership.
- WEKAF admin cannot mutate Baseline org unless explicit global-admin path is used.
- Missing brand predicate on allowlisted model fails in test.
- Brand cookie manipulation does not change server authority.
- Unknown production host does not silently become an unsafe brand context.
- Public certificate verification returns only allowlisted verification-safe fields.

## Rollout plan

### Phase A — Instrument and test

- Build the extension/client in warning mode for local exploration.
- Add tests that assert warnings/throws for omitted brand predicates.
- Identify high-volume routes that need migration.

### Phase B — Enforce in tests and development

- Turn omitted brand predicates into test/dev failures.
- Convert admin actions/queries by domain.
- Add escape-hatch usage logging.

### Phase C — Enforce in production

- Enable production deny for brand-scope rejects.
- Add alerting for rejected queries.
- Review every escape-hatch event.

## Non-goals

- Do not split the database per brand in the first hardening PR.
- Do not redesign the Prisma schema during enforcement.
- Do not remove app-layer authorization; data-layer scoping is defense-in-depth, not a replacement.

## Relationships

- [Risk register](ronin-security-risk-register.md)
- [Security test plan](security-test-plan.md)
- [ADR 0004 — Multi-brand as column](../architecture/decisions/0004-multi-brand-as-column.md)
- [Auth architecture](../architecture/auth.md)

## Open Questions

- Should parent-derived model protection happen in the Prisma extension, service layer, or query wrappers first?
- How should global-admin cross-brand workflows present explicit intent in the UI and audit log?
- Which background jobs legitimately require unscoped access?
