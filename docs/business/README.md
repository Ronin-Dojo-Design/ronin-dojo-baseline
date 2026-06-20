---
title: Ronin Dojo Design — Business Development Ledger
slug: business-bd-ledger
type: index
status: active
created: 2026-06-20
last_agent: petey
---

# Ronin Dojo Design — Business Development (Agency CRM)

This tree is the **agency's** business-development ledger — prospective and active
*client engagements* for Ronin Dojo Design (the studio). It is deliberately separate
from the product `Lead` model in `apps/web/prisma/schema.prisma`, which tracks
**gym-membership** prospects for the BBL / TuffBuffs / WEKAF brands. Do not file agency
clients into the product database, and do not file gym members here.

## Contents

- [`calendar-of-events.md`](./calendar-of-events.md) — scheduled agency events
  (intakes, discovery calls, milestones). Chronological ledger.
- [`leads/`](./leads/) — one file per prospective/active client engagement.
  - [`leads/mammoth-build-michael-flores.md`](./leads/mammoth-build-michael-flores.md)
    — Mammoth Metal Buildings (Michael Flores, GM). HubSpot Commerce Hub engagement.

## Conventions

- Lead status: `NEW → CONTACTED → INTAKE_SCHEDULED → DISCOVERY → PROPOSAL → WON → LOST → NURTURE`.
- Every calendar entry links back to the lead file it belongs to.
- This is a planning/record layer (Petey). It does not connect to any external
  calendar — events here must be mirrored into a real calendar by a human until a
  calendar integration exists.
