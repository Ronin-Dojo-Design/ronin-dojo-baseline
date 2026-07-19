---
title: "ADR 0048 — Two-repo vault-kit and client-ops projections"
slug: adr-0048-two-repo-vault-kit-and-client-ops-projections
type: decision
status: accepted
created: 2026-07-18
updated: 2026-07-19
last_agent: codex-session-0571
pairs_with:
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md
  - docs/product/mammoth-build/OPERATING_SYSTEM.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - obsidian
  - vault-kit
  - mammoth-build
---

# ADR 0048 — Two-repo vault-kit and client-ops projections

## Status

Accepted in SESSION_0571 from the operator-ratified SESSION_0570 boundary and Obsidian Dashboard Epic D2/D5.

## Context

Mammoth needs a lightweight private operating cockpit, but its product code, CRM data, and consulting notes
have different lifecycles and access boundaries. Putting the private vault in the platform monorepo would expose
client operations. Treating the vault as a CRM or copied goal ledger would create competing authorities.

## Decision

1. The RDD monorepo owns product code, specifications, reusable client-ops templates, presets, and `vault-kit/`.
2. The canonical operator vault is a separate lean private repository. A private Mammoth vault contains live
   consulting/session operations and installed projections only; private content never flows back into the kit.
3. Mammoth's per-product database remains the only transactional CRM authority (ADR 0038). Vault dashboards
   may link to deliberate read-only projections but never store or accept CRM mutations.
4. Vault-kit uses one generic template authority plus non-secret presets. Its manifest updates a file only while
   it byte-matches the prior managed version; operator edits are preserved.
5. Dashboard notes link canonical session, goal, story, and ADR IDs. They do not duplicate canonical bodies.
6. HubSpot, Todoist, email, and calendar appear as non-secret status pointers until separately authorized,
   scoped adapters exist. Credentials remain in Keychain or local environment storage.
7. Installation into a live private vault is an explicit operator-reviewed action. Development uses scratch vaults.

## Consequences

- The same productizable kit can serve Mammoth and future clients without moving client data into Git.
- The private vault remains useful offline without becoming a second application database.
- Updates are deterministic and non-destructive; operator-edited managed files require manual reconciliation.
- CRM feeds or write-back cross an explicit product boundary and require a separate contract and security review.

## Dirstarter alignment proof

- [Project structure](https://dirstarter.com/docs/codebase/structure): the product keeps App Router UI,
  server logic, and Prisma data concerns in the baseline's documented layers; `vault-kit/` is an additive root
  utility, not a replacement for those layers.
- [Prisma setup](https://dirstarter.com/docs/database/prisma): Mammoth continues to use the existing Prisma client
  and PostgreSQL database as CRM authority; this decision adds no competing persistence layer or schema bypass.
- [Authentication](https://dirstarter.com/docs/authentication): sales reads and mutations continue through the
  product's Better Auth session and owner-scoped server actions; vault projections receive no authenticated write path.
