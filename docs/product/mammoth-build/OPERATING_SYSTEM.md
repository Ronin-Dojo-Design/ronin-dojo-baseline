---
title: "Mammoth Build operating system"
slug: mammoth-build-operating-system
type: protocol
status: active
created: 2026-07-18
updated: 2026-07-19
last_agent: codex-session-0571
pairs_with:
  - docs/product/mammoth-build/PRD.md
  - docs/product/mammoth-build/STORIES.md
  - docs/product/mammoth-build/CONTEXT.md
  - docs/architecture/decisions/0048-two-repo-vault-kit-and-client-ops-projections.md
  - docs/sprints/SESSION_0571.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - mammoth-build
  - operations
  - client-ops
---

# Mammoth Build operating system

## Promise

Run Mammoth work by the Brand Heartbeat and the mantra **Know the customer. Carry the build. Finish proud.**
Automation removes administration so people can protect the relationship; it never erases human ownership.

## Three authorities

| Authority | Owns | Must not own |
| --- | --- | --- |
| RDD monorepo | Product code, specs, stories, reusable vault-kit templates/presets | Private client notes, credentials, CRM records |
| Mammoth database | Contacts, Opportunities/Projects, Activities, Contact Attempts, Next Actions | Session rituals, product specs, consulting notes |
| Private MMB vault | Live consulting work, evidence links, opening/live/closing cards, read-only projections | CRM truth, copied goal/spec bodies, secrets |

## Lean operating loop

1. `/game-on` always uses canonical `/bow-in`, then opens one outcome, one primary slice, and one named Next
   Action. The lean overlay scales the work card and risk gates; it never exempts a session from the ritual.
2. Work from one live task/evidence table. Link canonical `SESSION_*`, story, goal, and ADR IDs; label inputs
   confirmed, proposed, or missing.
3. `/game-off` always uses canonical `/bow-out`. Record evidence, unfinished work, and the next owner; do not
   infer ratings or telemetry.

## Surface contract

- **Private vault:** consulting/session projection, time/evidence, next-session cue, non-secret integration status.
- **Admin CRM:** Today queue → roster → contact workspace → Contact Attempt → exactly one owned Next Action.
- **Customer portal:** later, project-scoped delivery, Installation Path, enablement, proof, and satisfaction.
- **Public landing:** mission, both Installation Paths, supported claims, and inquiry only.

## Quality and privacy

- Preserve BBL/Dirstarter parity through shared primitives and the current Mammoth app; create no parallel
  Kanban, CRM, or design-system kernel.
- Apply deeper review only for real data/imports, auth/roles, external communications, integrations, shared UI,
  durable architecture, or publish/deploy actions.
- Store no passwords, tokens, 2FA values, `.env` values, PII, or CRM bodies in Markdown or Git. HubSpot remains
  rotation-gated and Keychain-only; Todoist remains optional and scoped.
- Track accepted deliverables/hour, first-pass gate rate, rework, and scope variance when evidence exists.
  Keep client satisfaction, engineering verification, and sales outcomes separate.
