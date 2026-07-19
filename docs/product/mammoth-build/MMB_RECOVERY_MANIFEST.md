---
title: "Mammoth operating-context recovery manifest"
slug: mammoth-operating-context-recovery-manifest
type: reference
status: active
created: 2026-07-18
updated: 2026-07-19
last_agent: codex-session-0571
pairs_with:
  - docs/sprints/SESSION_0571.md
  - docs/product/mammoth-build/OPERATING_SYSTEM.md
  - docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - mammoth-build
  - obsidian
  - recovery
  - authority
---

# Mammoth operating-context recovery manifest

## Purpose

Reconcile the July 18 phone screenshots with locally visible repo and Obsidian material without moving,
copying, or treating stale vault mirrors as authority. Paths are evidence locations; the authority rules in
SESSION_0570 still govern.

## Authority

| Material | Authority | Projection rule |
| --- | --- | --- |
| Product code, specs, templates, goal/story/session IDs | `ronin-dojo-app` monorepo | Private vault may link to IDs; do not mirror bodies. |
| Contacts, Opportunities/Projects, Activities, Next Actions | Mammoth product database | Vault dashboard is read-only status/evidence, never CRM truth. |
| Meeting notes, live consulting work, private evidence | Private Mammoth vault | Keep outside the monorepo; promote only sanitized decisions/specs. |
| Credentials and 2FA | macOS Keychain / provider | Never store or project secret values. |

## Screenshot reconciliation

| Evidence | Located path | State | Next action |
| --- | --- | --- | --- |
| Phone folder picker at `ronin-dojo-app/docs` | `/Users/brianscott/dev/ronin-dojo-app/docs` | Found; repo path, not a vault | Keep as the canonical documentation tree. |
| Phone repo picker showing `ronin-dojo-app` and `ronin-dojo-monorepo` | `/Users/brianscott/dev/` | Found | Legacy repo is reference-only; do not revive its operating system. |
| Phone `Ronin_Baseline` notes (`Instagram plan initial thoughts`, JETTY, boundary/repo packets, Bamboo HR, Sunday Code, Obsidian terms) | `/Users/brianscott/Downloads/Ronin_Baseline/RONIN_DOJO-Baseline/00_Inbox/` and `/Users/brianscott/Desktop/Baseline_Vault/` | Found; duplicate/import material | Canonical-vault reconciliation remains under MB-016; no wholesale copy this session. |
| Phone `Untitled`, `Untitled 1/2/3` tree | `/Users/brianscott/Library/Mobile Documents/iCloud~md~obsidian/Documents/RoninDojoObsidian/` | Found; iCloud legacy mirror | Treat as archive/input, not current authority. |
| Goal UI screenshots | `RoninDojoObsidian/ronin-dojo-monorepo/RoninDashboard/sprints/active/WO-178-WEKAF-ChatGPT/Brian-screenshots/` | Found | Design references only; they are not current goal records. |
| Legacy `/GOALS` objective map | `/Users/brianscott/dev/ronin-dojo-monorepo/RoninDashboard/GOALS/` | Found; last updated 2026-03-02 | Reconcile by pointer/status into the current Goals Ledger; do not copy goal bodies. |
| Legacy Discussion-Determine-Decision memo | `RoninDashboard/GOALS/DISCUSSION_DECISION_MASTER_PETEY_2026-03-02.md` | Found; one five-section decision memo | Pilot as a lean decision-record template; do not promote to a skill until three current-repo uses prove a named entry point is useful. |
| Canonical Baseline kickoff | `docs/sprints/_archive/SESSION_0001.md` | Found | Historical orientation: it explicitly replaced the legacy RoninDashboard and rejected unearned machinery. |
| Mammoth private demo vault | `/Users/brianscott/Desktop/Mammoth_Demo_Vault/` | Found | Install only generated client-ops projections; preserve private notes and the Keychain pointer. |
| `MMB_INITIAL_INTAKE` | No filename or content match in the two repos, Desktop Mammoth/Baseline vaults, Downloads, or locally visible iCloud Obsidian roots | Missing | Brian/Michael supplies the source or completes phone Sync; do not fabricate a recovered intake. |

## Discussion → determination → decision pilot

Use this shape inside a SESSION decision block before considering a new skill:

1. **Discussion:** verified facts, options, and missing authority.
2. **Determination:** criteria and tradeoffs that distinguish the options.
3. **Decision:** chosen option, decider, and date.
4. **Next three:** the smallest executable actions.
5. **Revisit trigger:** evidence that would justify reopening the decision.

Promotion gate: use the shape successfully in three current-repo decisions. Promote only if callers repeatedly
need a named trigger or deterministic output beyond what Petey + grilling + SESSION decision blocks provide.

## Legacy goals reconciliation

| Legacy goal family | Current disposition |
| --- | --- |
| WEKAF Vegas / WordPress persistence (`WEKAF-001..003`) | Historical event/legacy-backend goals; do not import as open current work. Re-open only from present WEKAF product evidence. |
| TB architecture alignment (`TB-001`) | Superseded by the platform/module/brand-token model in ADR 0034 and current product goals. |
| BBL architecture alignment (`BBL-001`) | Superseded by current BBL SoT, ADRs, and active Goals Ledger rows. |
| BubbleBuilder white-label kernel (`BBA-001`) | Architectural intent absorbed by the shared-kernel/module model; no separate BubbleBuilder lane. |
| AutoMATic foundation (`AM-001`) | Parked historical concept; no current product authority. |
| RDD SaaS product lane (`RDD-001`) | Intent survives through ADR 0034, per-product deploys, G-014 vault-kit, and the Mammoth client product; no duplicate goal row. |

## Todoist and HubSpot status

- The canonical-vault Todoist panel is `status: not-connected`; no Todoist/HubSpot environment-variable names
  were present in the session shell. Todoist remains an optional one-way projection/capture adapter until the
  operator chooses its target project and sync direction. Its token belongs in Keychain or local provider data.
- HubSpot remains an owner-mediated, non-pressing sidecar under MB-017. Michael rotates first; Brian uses the
  local Keychain prompt. Neither access task blocks the sanitized operating shell or tracer work.
