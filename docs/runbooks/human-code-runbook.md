---
title: "Human–Code Runbook"
slug: human-code-runbook
type: runbook
status: active
created: 2026-07-18
updated: 2026-07-19
last_agent: claude-session-0574
pairs_with:
  - docs/knowledge/wiki/core-values.md
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/architecture/decisions/0048-two-repo-vault-kit-and-client-ops-projections.md
backlinks:
  - docs/runbooks/README.md
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - agents
  - runbook
---

# Human–Code Runbook

Platform-wide law for the human/agent boundary: what humans decide, what agents (cloud today,
local later) may read/write, and the proof required. LLL-style per CV-001/CV-002. Local-agent
rows are **proposed** until the local-agent feasibility lab (MMB_SESSION_0002 TASK_05) ratifies
them. Consolidated boundary rules: [agent-systems-map §4](../knowledge/wiki/agent-systems-map.md).

## Techstack (MMB-D-008 home)

| Layer | Stack | State |
| --- | --- | --- |
| Platform app (`apps/web`) | Next.js (App Router, Turbopack dev) · Prisma · PostgreSQL (Neon prod / Postgres.app local) · Better Auth · bun/pnpm workspace | confirmed |
| Client products (`clients/*`) | Same kernel; per-product DB + Vercel project (ADR 0038) | confirmed |
| Shared kernel | `packages/ui-kit` (Dirstarter L1 extraction, ADR 0040) · `vault-kit/` (Obsidian client-ops kit, ADR 0048) | confirmed |
| Gates | tsc · oxlint · oxfmt · bun run test · Playwright e2e · wiki-lint · Graphify | confirmed |
| Services | Vercel · Stripe · Resend · R2/MinIO · GitHub (`gh`) | confirmed |
| Local agents (lab) | Candidate local/free models — names/licenses unverified | proposed |

## Humans decide

| Decision | Why human-only |
| --- | --- |
| Push / PR merge / deploy / external share | explicit-push-authorization standing rule |
| Integration connect (HubSpot, Todoist, email, QuickBooks, scraping) | credential + legal/terms + retention review per lane (ADR 0048.6) |
| Live private-vault mutation, CRM record bodies | client-ops boundary (ADR 0048.7) |
| Client ratings / satisfaction claims | never inferred or self-awarded |
| ADR/CV ratification, scope changes, spend | operator drives; nothing is canonical without the word |

## Agents may

| Action | Cloud agents (today) | Local agents (lab) |
| --- | --- | --- |
| Read repo, docs, vault projections | yes | proposed: sanitized/local-only |
| Write repo code/docs on `main` (unpushed) | yes, gated by rituals + gates | no — sandbox/worktree only |
| Run gates, dev servers, local DB | yes | proposed: read-only queries first |
| Touch secrets/credentials | never in plaintext (Keychain/env only) | never |
| Send email / mutate CRM / financial actions | never without per-action authorization | never |

## Gated integration lanes (#233 template · MMB-D-018 goal)

ONE contract shape for every external-integration lane (cloud API, local-agent lab, client
system) — no per-lane bespoke shapes (#233, ratified SESSION_0574 grill: A·B·A·B·B·A). A lane
exists only as a filled row below; no row, no connect. Owner is always a named human ("Humans
decide": integration connect = credential + legal/terms + retention review, ADR 0048.6).
**Read-only-first is universal law** — every lane is born read-only; write-purpose lanes (e.g.
send-email) begin in draft/dry-run phase and sending is a scope graduation. Rows sit `proposed`
until the lane's pilot + operator word flip them `confirmed`.

### Contract fields

| Field | Definition | Fill guidance |
| --- | --- | --- |
| Owner | The ONE named human accountable for the lane end-to-end | A person, never an agent/team; owner runs connect, credential ops, and is the escalation terminus |
| Read-only-first scope | Exact API surface + scopes granted at lane birth | Enumerate scopes verbatim; write scopes absent at birth (universal law — draft/dry-run IS the read-only phase of a write lane); cite the research ticket that legally cleared the surface |
| Approval trigger | What requires a fresh human "go" (tiered) | Connect/credential + any scope graduation = explicit grill + decision row; recurring reads = standing per-lane approval; any mutation = per-action ("Agents may" law) |
| Stop conditions | Halt-immediately list; on halt: capture transcript, no retry, tighten contract before rerun | Universal floor (auth failure · write/scope-exceed prompt · rate ≥80% of quota · unexpected PII · operator stop word) + per-lane additions slot |
| Data retention | What may persist, where, for how long | Default pointer-only (ids/counts/status); record bodies never in repo/tickets/vault (ADR 0048.7); overrides per-lane via grill |
| Escalation | Who gets pinged, in order (fixed two-tier) | Executor agent → owner; owner → client-owner only on client-visible impact; never agent → client (MMB-D-011) |

### Lane contracts

| Lane | Owner | Read-only-first scope | Approval trigger | Stop conditions | Data retention | Escalation | State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HubSpot read-only pilot (MMB-G-004) | Brian | Free-tier private app; `crm.objects.*.read` + `crm.export`; API-only, UI scraping banned (#231) | connect + credential = Brian; sync runs standing once piloted; any write scope = new grill + decision row | universal floor · rate ≥80% of 250k/day · any Pro-tier-only endpoint touched (fog: Pro delta unconfirmed) | pointer-only in repo/vault; raw pulls local-only, purged at pilot end; no CRM bodies (ADR 0048.7, MMB-D-011) | agent → Brian; Michael only on client-visible impact | proposed |

## Evidence requirements

| Change | Required proof |
| --- | --- |
| App code | focused tests + typecheck + build (+ affected e2e for shared primitives) |
| Docs/wiki | wiki-lint + index/backlink sweep |
| Session close | evidence table in SESSION file; verification separate from business outcome |
| Local-agent output (lab) | scorecard row: privacy · offline · license/cost · quality · latency · auditability · recovery |

## Failure handling & rollback

| Failure | Response |
| --- | --- |
| Gate red | fix or revert before close; never push red (lean closes leave CI debt — don't) |
| Wrong mutation committed (unpushed) | `git revert`/reset on the local commit; record in OPS/FS ledger |
| Wrong mutation pushed | operator-authorized revert commit — never force-push |
| Vault projection drifted into authority | delete/repoint per ADR 0048.3/.5; log drift row |
| Local-agent misbehavior (lab) | stop condition → capture transcript → tighten contract before rerun |
