---
title: "Brand-Scope Hardening Plan"
slug: brand-scope-hardening-plan
type: file
status: active
created: 2026-05-31
updated: 2026-06-26
last_agent: claude-session-0451
pairs_with:
  - docs/security/README.md
  - docs/security/ronin-security-risk-register.md
  - docs/architecture/decisions/0004-multi-brand-as-column.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Brand-Scope Hardening Plan

> **Single-brand update (2026-06-24, SESSION_0447).** ADR 0034 collapsed the
> 4-brand model (BASELINE / RONIN / BBL / WEKAF) to a **single brand: Black Belt
> Legacy (BBL)**. The bulk of this plan — runtime brand-scope **data-isolation**
> enforcement to stop one brand's rows leaking into another brand's tenant — is
> now **largely moot**: there is only one tenant, so cross-brand data leakage is
> no longer a live attack surface. Those sections are marked **superseded /
> reduced-scope** below.
>
> **KEEP-FOREVER exception — the host→brand SECURITY gate (MB-002 core).** The
> host→brand resolution and trusted-origin boundary in
> `apps/web/lib/brand-context.ts` (`HOST_TO_BRAND`, `BRAND_TRUSTED_ORIGINS`,
> `resolveBrand`) is **load-bearing and survives the single-brand collapse and
> the eventual schema-level `brand` column drop**. It maps incoming request
> hosts to a brand and rejects untrusted origins (Better Auth `trustedOrigins`,
> OAuth/magic-link callback validation). Do **not** treat this as vestigial. The
> distinction throughout this doc: *host-origin trust boundary = keep* vs
> *multi-brand data-isolation hardening = stale*.

## Summary

Brand **data isolation** was the highest-value hardening task under the original
multi-brand model: one app, one database, one schema with `brand` as a column,
where a single missed predicate could leak data across Baseline Martial Arts,
Black Belt Legacy, WEKAF, and Ronin Dojo Design.

**As of the single-brand collapse (ADR 0034) the multi-tenant data-isolation risk
is reduced-scope** — there is one brand (BBL) at the chrome/UI layer, so there is
no second *concurrently-written* tenant for the staged runtime extension to guard.
The runtime brand-scope enforcement PR staged below
(`fix(security): enforce brand-scoped database access`) is therefore **shelved as
superseded**, not lost; it is preserved here as history and as a re-activation
plan should the platform ever re-introduce a second active product tenant. What
remains permanently in force is the host→brand **origin trust** gate (see the
KEEP-FOREVER note above).

> **2026-06-26 sharpening (SESSION_0450/0451) — do NOT read "single brand" as
> "drop the brand predicates."** Prod still carries the original Baseline Martial
> Arts demo dataset (~388 non-BBL rows co-resident in the BBL database, SESSION_0450
> audit; `[[brand-vestige-trim-inventory]]`). The existing `brand` column + the
> per-query brand predicates (`searchCourses(..., Brand.BBL)`, `where:{brand}`) are
> exactly what hide that legacy data from BBL surfaces **right now**. So the
> brand filter is load-bearing isolation today and stays until the Baseline data is
> extracted to the future `baselinemartialarts.com` product (then run the banked
> `apps/web/scripts/purge-non-bbl-baseline-data.ts` and drop the column). What's
> shelved is only the *new* runtime Prisma-extension PR, not the brand filter
> already in the codebase.

## Existing strengths

- **(KEEP-FOREVER)** Host→brand mapping and the trusted-origin boundary are
  centralized in `apps/web/lib/brand-context.ts` (`HOST_TO_BRAND`,
  `BRAND_TRUSTED_ORIGINS`, `resolveBrand`). This is the MB-002 security gate and
  is **not** affected by the single-brand collapse — it survives even the
  eventual `brand` column drop. `resolveBrand` now always returns `Brand.BBL`,
  but the trusted-origin allowlist still gates Better Auth origin checks and
  OAuth/magic-link callbacks.
- `apps/web/proxy.ts` is now single-brand middleware (no `x-brand` header
  injection); server code no longer derives or trusts a client-supplied brand
  header — callers inline `Brand.BBL`.
- Auth/authorization helpers model membership, organization ownership, and
  org-scoped roles. *(2026-06-24: "active brand" is now constant BBL.)*
- `apps/web/lib/authz.ts` describes app-layer authorization as the live control;
  the brand-scope Prisma extension it proposed as belt-and-suspenders is
  superseded — see below.
- Many Prisma models still include a `brand` column and indexes. *(2026-06-24:
  these are now single-valued vestiges slated for the gated Stage-2 `brand`
  column drop; they are not a second-tenant boundary.)*

## Current gap (SUPERSEDED — single-brand collapse, ADR 0034)

> **2026-06-24, SESSION_0447.** The gap below was a *multi-tenant data-isolation*
> gap. With a single brand it no longer represents a live risk: there is no
> second brand whose rows a missing predicate could expose. Retained for history.

`apps/web/services/db.ts` returns a Prisma client extended only with
`uniqueSlugsExtension`; no brand-scope extension is wired in. Under the old
multi-brand model that meant brand isolation depended on each query remembering
the correct predicate. Single-brand: the runtime brand-scope extension is **not
needed** and is not planned.

## Target invariant (SUPERSEDED — single-brand collapse, ADR 0034)

> **2026-06-24, SESSION_0447.** The invariant and proposed implementation below
> (scoped client factory, model allowlist, fail-loud cross-brand denial) targeted
> *multi-tenant* isolation and are **superseded**: with one brand there is no
> cross-brand path to enforce. Kept verbatim as the re-activation blueprint if a
> second product tenant is ever introduced. The two test cases that remain
> relevant — *unknown production host* and *brand cookie manipulation* — fold into
> the **KEEP-FOREVER** host→brand origin gate, not into a data-scope extension.

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
- [ADR 0034 — Monorepo platform and per-product deploys](../architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md)
- [Auth architecture](../architecture/auth.md)

## Open Questions

> **2026-06-24, SESSION_0447.** The cross-brand questions below are **moot under
> the single-brand collapse** (no global-admin cross-brand workflow exists). They
> are retained only as the re-activation checklist for a future second tenant.

- Should parent-derived model protection happen in the Prisma extension, service layer, or query wrappers first?
- How should global-admin cross-brand workflows present explicit intent in the UI and audit log?
- Which background jobs legitimately require unscoped access?
