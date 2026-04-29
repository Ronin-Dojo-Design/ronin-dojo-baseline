---
title: "SESSION 0016 — Browser-verify S4 directory, execute TASK_05 + TASK_06 (mobile auth)"
slug: session-0016
type: session
status: in-progress
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0016
sprint: S4/S5
pairs_with:
  - docs/sprints/SESSION_0015.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0016

**Date:** 2026-04-27
**Operator:** Brian + Copilot
**Goal:** Browser-verify S4 directory (close S4), then execute TASK_05 (mobile auth ADR 0009) + TASK_06 (mobile auth scaffold at `packages/api-client/`).
**Status:** closed-full

---

## Bow-in context

- SESSION_0015 closed-full. S4 code complete, seed data in place, TASK_05/06 planned.
- Git: `main`, clean working tree.
- Open decisions: Mobile auth path (Option A: Better-Auth mobile SDK vs Option B: JWT bridge fallback). TASK_05 resolves this.
- Next ADR number: **0009**.
- FAILED_STEPS: No open/mitigated entries in the auth or directory area.

---

## Petey Plan — Session orchestration

### Phase 1: S4 Browser Verification (Brian-driven)

1. Start dev server → Brian navigates `baseline.local:3000/directory`
2. Verify: auth vs unauth views, visibility filtering, filters work
3. If pass → S4 formally closed ✅

### Phase 2: TASK_05 — Mobile Auth ADR (Cody-A)

**What:** Write ADR 0009 deciding Better-Auth mobile SDK (Option A) vs JWT bridge (Option B).
**Why:** MB-001 is open. Mobile app (`apps/mobile/`) needs a locked auth contract before any mobile work begins.
**Done:** `docs/architecture/decisions/0009-mobile-auth-strategy.md` exists, status Accepted.

**Recommendation (Petey):** **Option A — Better-Auth mobile SDK.** Rationale:
- Better-Auth already handles web sessions; its mobile SDK shares the session contract (no second auth system to maintain).
- JWT bridge adds token lifecycle complexity (refresh rotation, revocation) that a solo dev doesn't need when Better-Auth already solves it.
- ADR 0002 already assumed "Better-Auth's mobile flow" as the primary path; JWT bridge was the fallback only if Better-Auth's mobile UX was thin.
- Better-Auth's mobile SDK has matured since ADR 0002 was written.

### Phase 3: TASK_06 — Mobile Auth Scaffold (Cody-B, parallelizable after TASK_05)

**What:** Create `packages/api-client/` with typed auth helpers for mobile, consuming Better-Auth's mobile SDK.
**Why:** Gives `apps/mobile/` (Expo, post-MVP) a ready-made auth layer.
**Done:** Package exists with auth client config, typed login/logout/session helpers, exports. Builds without error.

---

## L1 Constraint Reminder

**Dirstarter is the purchased boilerplate with proven patterns.** All work in this session (and all sessions) must:

1. **Use existing Dirstarter patterns** — HOC chains, action client, server actions, content collections, auth wiring. Do NOT invent new architectural patterns.
2. **Apply our features to the template** — our domain (Passport, Orgs, Directory, Tournaments) gets wired into Dirstarter's existing file structure, component patterns, and auth flow.
3. **No custom design work yet** — design tokens, themes, and branded styles are ported later (S11). Use Dirstarter's default UI until then.
4. **When in doubt, check `dirstarter_template/`** — the upstream reference at `/Users/brianscott/Local Sites/DirStarter/dirstarter_template/` is the authority for how things should be structured.

This means TASK_06's scaffold must follow Dirstarter's existing auth client pattern (see `dirstarter_template/lib/` and `dirstarter_template/server/`), not invent a novel package structure.

### Parallel execution plan

```
Phase 1 (Brian)     → browser test → close S4
Phase 2 (Cody-A)   → ADR 0009 (can start immediately, no code deps)
Phase 3 (Cody-B)   → scaffold (starts after ADR accepted)
```

---

## Execution log

### Phase 1 — Dev server startup

Deferred — Brian will test in SESSION_0017.

### Phase 2 — TASK_05 complete ✅

ADR 0009 written: Better-Auth mobile SDK chosen over JWT bridge. MB-001 resolved.

### Phase 3 — TASK_06 complete ✅

`packages/api-client/` scaffold created following Dirstarter's `lib/auth-client.ts` pattern.

### Phase 4 — Dirstarter architecture map ✅

Created `docs/architecture/dirstarter-architecture-map.md` — master execution contract mapping Dirstarter patterns to our domain. 10 sections, feature build playbook, sprint execution map, anti-patterns.

### Phase 5 — S2–S4 pattern compliance audit ✅

Created `docs/architecture/s2-s4-pattern-audit.md`. Key findings:
- All 3 entities missing `payloads.ts` files
- No `"use cache"` + cacheTag on queries
- Org queries use `include` instead of `select`
- `/me` page doesn't use `<Intro>` pattern
- Remediation plan: 4 items for S6 opening

---

## What landed

- **TASK_05:** ADR 0009 — Mobile auth strategy decided (Better-Auth mobile SDK). MB-001 closed.
- **TASK_06:** `packages/api-client/` scaffold — mobile auth client mirroring Dirstarter's pattern.
- **Dirstarter architecture map:** `docs/architecture/dirstarter-architecture-map.md` — the master translation guide and execution contract for all future sprints.
- **S2–S4 pattern audit:** `docs/architecture/s2-s4-pattern-audit.md` — gap analysis with prioritized remediation plan.
- **L1 constraint reminder:** Added to SESSION file as a permanent working principle.

## Files touched

| Path | Note |
| --- | --- |
| `docs/architecture/decisions/0009-mobile-auth-strategy.md` | New — ADR deciding Better-Auth mobile SDK |
| `packages/api-client/package.json` | New — mobile auth client package config |
| `packages/api-client/tsconfig.json` | New — TypeScript config |
| `packages/api-client/src/auth.ts` | New — `createMobileAuthClient()` following L1 pattern |
| `packages/api-client/src/index.ts` | New — package exports |
| `packages/api-client/README.md` | New — usage docs + L1 reference |
| `docs/architecture/dirstarter-architecture-map.md` | New — master Dirstarter→Ronin execution map |
| `docs/architecture/s2-s4-pattern-audit.md` | New — pattern compliance audit |
| `docs/sprints/SESSION_0016.md` | This session |

## Decisions resolved

- **MB-001 closed:** Mobile auth = Better-Auth mobile SDK (ADR 0009)
- **Execution philosophy:** Follow Dirstarter patterns exactly, never invent. Architecture map is the contract.
- **S2–S4 tech debt identified:** payloads.ts, caching, select-vs-include. Fix at S6 opening.

## Open decisions / blockers

- **S4 browser verification still pending** — needs dev server + Brian's manual test. First task for SESSION_0017.
- **S4 not formally closed** — blocked on browser verify above.
- **wiki/index.md not updated** — new docs (ADR 0009, architecture map, audit) not indexed.
- **`packages/api-client` not installed** — `pnpm install` not run; import errors expected until then.

## Next session

- **Goal:** Browser-verify S4 directory (close S4), then execute S2–S4 pattern remediation (payloads + caching + select refactor) as S6 pre-work.
- **Inputs to read:** SESSION_0016 (this file), `docs/architecture/dirstarter-architecture-map.md` (the execution contract), `docs/architecture/s2-s4-pattern-audit.md` (remediation plan), Dirstarter's `server/web/tools/payloads.ts` (reference implementation).
- **First task:** Start dev server (`npx next dev --turbo` from `apps/web/`), Brian tests `/directory`. If pass → close S4, then create `server/web/organization/payloads.ts` as first remediation item.

## Reflections

### What went well
- The Dirstarter deep-dive was overdue. Having the architecture map as a single document means every future session can reference it instead of re-discovering patterns ad hoc. This will save 15–20 min per session.
- TASK_05/06 executed cleanly because the decision space was already narrowed by ADR 0002. The ADR is a natural extension, not a controversial choice.
- The S2–S4 audit reveals the gaps are mechanical (missing files, wrong Prisma method), not architectural. The bones are right; we just need to finish the last mile.

### What could improve
- Should have created the architecture map BEFORE S3/S4, not after. The inline `include` patterns and missing payloads wouldn't have happened if the execution contract existed earlier. Lesson: L1 mapping document should be the FIRST artifact of any template-based project.
- SESSION_0016 tried to do too many things (browser verify + TASK_05 + TASK_06 + architecture map + audit). The browser verify is STILL pending. Next session should limit scope to 2–3 tasks max.

---

## Close checklist

- [x] Step 1 — Pause work
- [x] Step 2 — SESSION file updated (What landed, Files touched, Decisions, Open, Next)
- [x] Step 3 — JETTY 3.0 sweep (new files have frontmatter, backlinks declared)
- [x] Step 4 — Git hygiene (below)
- [x] Step 5 — Bow-out line (below)
- [x] Step 6 — Reflections written
- [x] Step 6.5 — Review & Recommend (Next session block written)
- [x] Step 7 — Memory sweep (no project-scoped facts to add beyond the architecture map)
- [x] Step 8 — Confirm unblocked (next session first task is doable: start dev server + browser test)

