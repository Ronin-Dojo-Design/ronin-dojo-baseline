---
title: "Cody Pre-flight Protocol"
slug: cody-preflight
type: protocol
status: active
created: 2026-04-27
updated: 2026-06-26
last_agent: claude-session-0452
source_sops:
  - docs/ronin_dojo_baseline_systems_pack/10_SOP_AGENT_WORKFLOWS_AND_RITUALS_BASELINE.md
  - docs/ronin_dojo_baseline_systems_pack/07_NEXT_SESSION_LOADING_ORDER_BASELINE.md
backlinks:
  - docs/agents/cody.md
  - docs/protocols/failed-steps-log.md
  - docs/knowledge/wiki/index.md
---

# Cody Pre-flight Protocol

## When

Before writing ANY new file, component, schema change, or backend implementation. No exceptions.

## Why

SESSION_0014 proved that without enforceable gates, the agent skips discovery and builds from scratch. SESSION_0026 proved the same for schema work — 26 models added without pre-flight. This protocol produces a **reviewable artifact** — not a promise to "check first."

## Scope

This protocol covers three work types:

1. **UI/component work** — use the Component Checklist below
2. **Schema/model work** — use the Schema Checklist below
3. **Backend/action work** — use the Backend Checklist below

## Component checklist

Cody must add a `## Pre-flight: {component name}` section to the active SESSION file with these fields filled in **before writing code:**

```markdown
## Pre-flight: {ComponentName}

### 1. Existing component scan
- Searched `components/web/` for: {search terms}
- Searched `components/common/` for: {search terms}
- Found: {list of relevant existing components, or "none"}

### 2. L1 template scan (via Dirstarter Component Inventory)
- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: {yes}
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: {yes}
- Searched `dirstarter_template/components/` for: {search terms}
- Closest L1 pattern: {file path and pattern name, or "none"}
- **Primitive API spot-check:** Read each composed primitive's component file
  (`components/common/<name>.tsx`) and record the exposed prop names + variant
  string union (if any) in the pre-flight output. Importing a primitive without
  listing its props is a FAILED_STEPS violation (see FS-0008). Example of
  correct output: `Avatar (src, fallback, size: 'sm'|'md'|'lg')`,
  `Badge (variant: 'default'|'secondary'|'destructive'|'outline', children)`.

### 3. Composition decision
- [ ] Extending existing component: {which one}
- [ ] Composing existing components: {which ones}
- [ ] New component, no L1 match exists (justify): {reason}

### 4. Lane docs loaded
- [ ] Prior SESSION "Next session" section read
- [ ] Wiki entries for target area read: {which ones}
- [ ] Runbook consulted: {which one, or "N/A"}

### 5. Dev environment confirmed
- Dev server command: `npx next dev --turbo` (from `apps/web/`)
- Working directory: {path — must be `apps/web/`}
- Brand/host for testing: {host:port}
- Verification commands confirmed: `bun run typecheck`, `bun run lint`, `bun run test` (from `apps/web/`)
  — use `bun run test` (= `bun test --parallel=1`), **never a bare `bun test fileA fileB`**: the non-parallel
  runner shares the module registry across files, so `mock.module()` leaks and produces false failures (FS-0027).
- **Writing or modifying tests? Read [`sop-test-writing.md`](../runbooks/sops/sop-test-writing.md) FIRST** —
  especially the "two-headed concurrency problem" (`--parallel=1`) and the §5d rolled-back-tx pattern.
- Reference: [dev-environment.md — Verification commands](../runbooks/dev-environment/dev-environment.md)

### 6. FAILED_STEPS check
- Prior failures in this area: {FS-NNNN or "none"}
- Mitigation acknowledged: {yes/no}
```

## Rules

1. **If field 1 or 2 finds an existing component → field 3 MUST use "Extending" or "Composing."** Selecting "New component" when a match exists is a FAILED_STEPS violation.

2. **If field 6 finds a prior failure → Cody must state how this task avoids repeating it.**

3. **The pre-flight section stays in the SESSION file as permanent record.** It is not deleted after the task is done.

4. **Petey may waive pre-flight for trivial tasks** (e.g., fixing a typo, updating a doc). The waiver must be noted: `Pre-flight: waived by Petey — {reason}`.

## Schema checklist

For any task that adds or modifies Prisma models (3+ models = mandatory Petey first):

```markdown
## Pre-flight: Schema — {description}

### 1. Petey invocation
- [ ] Petey plan exists in SESSION file with task IDs
- [ ] Petey waived: {reason} (only for ≤2 model changes)

### 2. Design doc check
- Design doc consulted: {s1-schema-design.md / s2-schema-additions.md / none}
- Models match design doc: {yes / deviations listed}

### 3. Existing schema scan
- Current model count: {N}
- Related existing models: {list}
- Back-relations needed: {list}
- **Schema spot-check:** Read each touched Prisma model and enum *from
  `schema.prisma` directly*, not from plan prose. Paste the exact enum values
  and back-relation field names into the pre-flight output. Inferring enum
  spelling or field type from prose is a FAILED_STEPS violation (see FS-0008).
  Example of correct output: `ClassSessionStatus enum: SCHEDULED, CANCELED,
  COMPLETED, NO_SHOW` (note: `CANCELED`, not `CANCELLED`); `AuditLog.action` is
  a free-form `String`, NOT an enum — use catalog constants from `errors.ts`.

### 4. Runbook consulted
- [ ] `docs/runbooks/schema-migration.md` read
- [ ] `docs/runbooks/prisma-workflow.md` read
- Migration strategy: {db push for dev / migrate dev for staging}

### 5. Data flow reference
- [ ] `docs/runbooks/sops/sop-data-and-wiring-flows.md` — relevant flow identified: {which}
- [ ] `docs/runbooks/sops/sop-e2e-user-lifecycle.md` — lifecycle stage covered: {which}

### 6. FAILED_STEPS check
- Prior failures in this area: {FS-NNNN or "none"}
- Mitigation acknowledged: {yes/no}
```

## Backend checklist

For any task that adds server actions, queries, or API routes:

```markdown
## Pre-flight: Backend — {description}

### 1. Auth predicates planned
- [ ] Session auth required
- [ ] Org membership verified
- [ ] Brand column filtered (ADR 0004)
- Authorization approach: {description}

### 2. Existing action scan
- Consulted `docs/architecture/dirstarter-baseline-index.md`: {yes}
- Searched `server/` for: {search terms}
- Related existing actions: {list}
- L1 pattern match: {dirstarter action client chain / custom}

### 3. Data flow reference
- [ ] `docs/runbooks/sops/sop-data-and-wiring-flows.md` — flow: {which}
- [ ] `docs/runbooks/sops/sop-e2e-user-lifecycle.md` — lifecycle stage: {which}

### 4. FAILED_STEPS check
- Prior failures in this area: {FS-NNNN or "none"}
- Manual Boundary Registry entries: {MB-NNNN or "none"}
```

## Enforcement

- During bow-out, Doug checks: does every new file have a pre-flight entry?
- Missing pre-flights are logged as FAILED_STEPS entries.
- Three FS entries in the same category triggers a protocol review.

## Source

Derived from:

- Cody workflow §5 in `10_SOP_AGENT_WORKFLOWS_AND_RITUALS_BASELINE.md`: "load lane docs → inspect target files → implement"
- Loading order tiers in `07_NEXT_SESSION_LOADING_ORDER_BASELINE.md`
- L1 pre-flight checklist added to `docs/agents/cody.md` in SESSION_0014
