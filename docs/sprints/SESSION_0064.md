---
title: "SESSION 0064 — Defensive Wiring Close-out + Component Inventory Enforcement"
slug: session-0064
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0064
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0063.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0064 — Defensive Wiring Close-out + Component Inventory Enforcement

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

closed-quick

### Goal

Complete SESSION_0063.5 deferred tasks (TASK_05–08), polish subscription form userId field, and conduct hostile-close review on component inventory enforcement (TASK_09).

### Context read

- ✅ SESSION_0063 — closed-quick. TASK_01–04 landed, TASK_05–08 deferred.
- ✅ Git: `main`.
- ✅ `opening.md` — bow-in ritual followed.
- ✅ `dirstarter-component-inventory.md` — consulted for TASK_09.

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin form patterns (`RelationSelector`), component inventory enforcement docs |
| Extension or replacement | Extension — userId field upgraded to L1 pattern; enforcement docs strengthened |
| Why justified | Subscription form had raw CUID input violating L1 patterns. Component inventory rules were not reaching Copilot agent effectively. |
| Risk if bypassed | Continued FS-0001 violations in every Copilot session. |

---

## Petey's assessment

### TASK_05–08: Already landed

Upon code inspection, all four deferred tasks were already implemented in the codebase:

| Task | Evidence | Status |
|---|---|---|
| TASK_05 — `checkEntitlement()` | `register.ts:38-46` — full guard with error message | ✅ pre-landed |
| TASK_06 — `isInSameBrand()` | `register.ts:48-51` + `organization/actions.ts:79-82` | ✅ pre-landed |
| TASK_07 — Passport checks | `register.ts:54-57` + `organization/actions.ts:84-86` | ✅ pre-landed |
| TASK_08 — `getUserMemberships` select | `organization/queries.ts:49-80` uses `select` payload | ✅ pre-landed |
| Polish — sidebar links | `sidebar.tsx:134,138-139` has Tiers + Subscriptions | ✅ pre-landed |

SESSION_0063 noted "imports added but guards not wired" — the guards were subsequently wired (likely in an intermediate commit). No code changes needed.

### Polish — userId → Select dropdown

Subscription form `userId` field was a raw `<Input>` with CUID text. Replaced with `<Select>` dropdown populated via new `findUserList()` query. Uses existing L1 `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` components.

### TASK_09 — Hostile-close review: Component inventory enforcement

#### Root cause analysis

**Why Copilot keeps using raw HTML instead of Dirstarter components:**

1. **`cody-preflight.md` pointed to the wrong doc.** Step 2 of the Component Checklist referenced `dirstarter-baseline-index.md` (high-level architecture doc) instead of `dirstarter-component-inventory.md` (the exhaustive, MANDATORY reference). Copilot dutifully read the baseline index — which doesn't list individual components — and assumed it had done its pre-flight.

2. **`cody.md` linked to wiki index section, not the inventory.** Rule 7 linked to `wiki/index.md#ui-components-dirstarter-common-library` — a section header that may or may not resolve. Replaced with direct link to the inventory.

3. **No hard rule in `copilot-instructions.md`.** The inventory was listed in the Key Files table (good), but there was no **explicit prohibition** of raw HTML. Claude and Codex don't have this problem because `CLAUDE.md`/`AGENTS.md` focus on wiki authoring (no UI code), and Claude Code loads `cody.md` + follows links more reliably. Copilot needs the rule surfaced at the top level.

4. **No guardrail rule.** `code-guardrails.md` had G1–G5 but no rule specifically about component inventory compliance. Added G6.

#### Violations found and fixed

| File | Violation | Fix |
|---|---|---|
| `components/web/lead-capture-form.tsx` | Raw `<h3>` + raw `<div className="rounded-lg border bg-card">` | → `<H3>` + `<Card>` |
| `components/web/ui/author.tsx` | Raw `<h3>` | → `<H6 as="h3">` |

#### Enforcement changes made

| File | Change |
|---|---|
| `docs/protocols/cody-preflight.md` | Step 2: `dirstarter-baseline-index.md` → `dirstarter-component-inventory.md` |
| `docs/agents/cody.md` | Rule 7: direct link to inventory. New Step 0 in L1 pre-flight: MUST read inventory first. |
| `docs/protocols/code-guardrails.md` | Added **G6 — No raw HTML when a Dirstarter component exists** with lookup table |
| `.github/copilot-instructions.md` | Added **⛔ HARD RULE: Component Inventory Gate** section |

#### Assessment: Do we need a Copilot tool or prompt set?

**No — not yet.** The problem was that the chain of references was broken (preflight → wrong doc). With these four fixes, the enforcement chain is now:

1. `copilot-instructions.md` — hard rule with FS-0001 warning (loaded automatically by Copilot)
2. `cody.md` — Step 0 in pre-flight checklist (loaded when playing Cody)
3. `cody-preflight.md` — correct doc reference in Component Checklist (loaded during pre-flight)
4. `code-guardrails.md` — G6 rule (checked at close)

If violations persist after 3+ sessions, escalate to a Copilot custom prompt/tool.

---

## What landed

- ✅ **TASK_05–08 confirmed pre-landed** — no code changes needed, status updated.
- ✅ **Subscription form userId polish** — raw CUID `Input` → `Select` dropdown with `findUserList()` query.
- ✅ **TASK_09 — Component inventory enforcement** — 4 docs updated, 2 code violations fixed, G6 guardrail added.

## Files touched

| File | Note |
|------|------|
| `server/admin/users/queries.ts` | Added `findUserList()` for dropdown selectors |
| `app/admin/subscriptions/_components/subscription-form.tsx` | userId field: raw Input → Select dropdown |
| `app/admin/subscriptions/new/page.tsx` | Pass `usersPromise` to form |
| `components/web/lead-capture-form.tsx` | Raw `<h3>` → `H3`, raw `<div>` → `Card` |
| `components/web/ui/author.tsx` | Raw `<h3>` → `H6 as="h3"` |
| `docs/protocols/cody-preflight.md` | Fixed doc reference: baseline-index → component-inventory |
| `docs/agents/cody.md` | Direct inventory link + Step 0 in pre-flight |
| `docs/protocols/code-guardrails.md` | Added G6 rule |
| `.github/copilot-instructions.md` | Added Component Inventory Gate hard rule |
| `docs/sprints/SESSION_0064.md` | This file |

## Decisions resolved

- **TASK_05–08 status:** Confirmed pre-landed. SESSION_0063 notes were stale.
- **Component inventory enforcement strategy:** Fix the reference chain first (4 docs). Escalate to Copilot tool only if violations persist after 3 sessions.
- **`author.tsx` heading level:** Used `H6 as="h3"` to match the small text size while preserving semantic heading level via `as` prop.

## Open decisions / blockers

- **Remaining raw HTML audit:** Only scanned `components/web/`. A full-repo sweep of `app/` pages may surface more violations — low priority, track as tech debt.
- **`findUserList` scaling:** Currently unbounded `findMany`. For large user bases, may need pagination or search. Acceptable for admin-only use.

## Task log

- `SESSION_0064_TASK_05` — Wire `checkEntitlement()` — ✅ pre-landed (no work needed)
- `SESSION_0064_TASK_06` — Wire `isInSameBrand()` — ✅ pre-landed (no work needed)
- `SESSION_0064_TASK_07` — Passport defensive checks — ✅ pre-landed (no work needed)
- `SESSION_0064_TASK_08` — `getUserMemberships` select — ✅ pre-landed (no work needed)
- `SESSION_0064_TASK_09` — Component inventory hostile-close — ✅ done (4 docs, 2 code fixes)
- `SESSION_0064_POLISH_01` — Subscription form userId → Select — ✅ done

## Review log

- `SESSION_0064_REVIEW_01` — All tasks landed or confirmed pre-landed. 4 enforcement docs updated, 2 raw HTML violations fixed, 1 form field upgraded to L1 pattern. Zero new components created.

## Next session

### SESSION_0065 — WP-3: Homepage + Hero Overhaul (Baseline Martial Arts)

- **Goal:** Replace Dirstarter default hero with Baseline Martial Arts branded landing page. Homepage layout, hero section, CTA, and i18n copy.
- **Agent:** Petey (plan the layout/sections) → Cody (build)
- **Inputs:** SESSION_0064 (this file), SESSION_0062 WP-3 scope, `app/(web)/(home)/hero.tsx`, `app/(web)/(home)/page.tsx`, `messages/en/pages.json`, `dirstarter-component-inventory.md` (MANDATORY pre-flight)
- **First task:** Petey reads current homepage structure (`hero.tsx`, `page.tsx`) and proposes Baseline-branded section plan
