---
title: ChatGPT Links Ledger
slug: chatgpt-links-ledger
type: reference
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/knowledge/wiki/reddit-links-ledger.md
  - docs/knowledge/wiki/youtube-links-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - planning
  - link-intake
---

# ChatGPT Links Ledger

Raw-capture inbox of **ChatGPT brainstorming-session outputs/links** shared as planning material.
Sibling of the [Reddit](reddit-links-ledger.md) and [YouTube](youtube-links-ledger.md)
link-ledgers; feeds the [planning-ledger](planning-ledger.md) → goals-ledger (a captured brainstorm
is raw material that graduates to a `PL`/`G` row).

**Capture flow:** operator shares a ChatGPT link / pasted text via Obsidian **QuickCapture** (phone)
into the vault's `gpt` inbox folder; rows are **promoted into this repo ledger to count** (repo is
SoT — ADR 0048). Historical ChatGPT source dumps live at `docs/architecture/source/` (e.g.
`chatgpt-original-plan.md`, `raw/Brian-Chat-GPT-Session.md`) — reference, not this live inbox.

**Row law:** `GPTLL-0NN` ids, append-only, mint = max+1 (verify by grep — D-049 class). Status:
`captured → triaged → routed (→ PL/G pointer) → done/rejected`. Wired into
`scripts/ledger-backlog.ts` (code `GPTLL`), `scripts/deferral-guard.ts`, and closing.md §6.7 by lane
L2 (`session-0591-ledger-wiring`).

## Rows

### GPTLL-001 — Review + route the ~2026-07-19 ChatGPT brainstorm (incl. "Phase 14") — captured · content-pending

- **Origin:** operator directive, SESSION_0589 (2026-07-20). The first GPTLL intake.
- **The ask:** review the ChatGPT brainstorming work from the night of ~2026-07-19 and route its
  ideas into `PL`/`G` rows.
- **Content status:** **PENDING operator hand-over** — the brainstorm content is not yet in the repo
  or reachable by an agent. Operator to paste it, name a repo/file path, or point to it.
- **"Phase 14" note:** a "Phase 14 Epic" was mentioned as planned/partially-done (possibly committed
  by GPT). SESSION_0589 graphify + grep found **no Phase 14 epic in this repo's graph** (only the
  Dirstarter Uplift 2026-05-19 epic and the petey-plan-0305 lineage-tree phases). If it exists it is
  in another repo/vault — operator to provide.
- **Note (already routed this session):** parts of the 2026-07-19 brainstorm were surfaced live in
  the SESSION_0589 grill and already routed — the **GLL_Epic** (→ [G-025](goals-ledger.md),
  [PL-007](planning-ledger.md)) and the **vault-consolidation epic**
  ([PL-008](planning-ledger.md)). GPTLL-001 covers the *remainder* pending the content hand-over.

### GPTLL-002 — ChatGPT share thread (operator capture, SESSION_0589) — captured

- **Origin:** operator, SESSION_0589 (2026-07-20). "Put this in as GPTLL."
- **Link:** <https://chatgpt.com/share/e/6a5e6aff-0358-8010-b2e3-06a142bf126f>
- **Status:** captured — **not yet triaged** (ChatGPT `/share/e/` links render client-side and aren't
  reliably agent-readable; triage when the operator pastes the content or in a triage session). May
  be the content for [GPTLL-001](#gptll-001--review--route-the-20260719-chatgpt-brainstorm-incl-phase-14--captured--content-pending)
  (~2026-07-19 brainstorm) — operator to confirm/link, or route as a new thread.

## Cross-references

- [Planning Ledger](planning-ledger.md) — where captures graduate to.
- [Reddit Links Ledger](reddit-links-ledger.md) · [YouTube Links Ledger](youtube-links-ledger.md) — siblings.
