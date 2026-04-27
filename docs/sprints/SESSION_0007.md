---
title: "SESSION 0007 — S2: Better-Auth + Passport Bootstrap"
slug: session-0007
type: session
status: closed-full
created: 2026-04-26
updated: 2026-04-26
last_agent: copilot-session-0007
health: 9
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0006.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0007

**Date:** 2026-04-26
**Operator:** Brian + Copilot (Petey → Cody)
**Goal:** S2 — Better-Auth + Passport bootstrap. Sign-up creates User + Passport + DirectoryProfile stubs. `/me` route renders Passport editor. Brand cookie wired through middleware.
**Status:** closed-full

---

## Petey's plan

S2 has **four deliverables**. They decompose into independent worktrees where noted.

### Task breakdown

| # | Task | Agent | Depends on | Est |
|---|---|---|---|---|
| T1 | **Post-signup hook**: wire Better-Auth `after` hook so that when a new User is created, a `Passport` + `DirectoryProfile` are created in a transaction | Cody | — | 30 min |
| T2 | **Brand cookie middleware**: read `x-brand` / hostname → resolve `Brand` enum → set cookie + inject into request context | Cody | — | 30 min |
| T3 | **`/me` route + Passport editor page**: App Router page at `(web)/me/page.tsx` that reads session, fetches Passport + DirectoryProfile, renders an edit form (React Hook Form + Zod) | Cody | T1 | 45 min |
| T4 | **Server actions for Passport + DirectoryProfile update**: `server/web/passport/actions.ts` — `updatePassport`, `updateDirectoryProfile` using existing safe-action patterns | Cody | T1 | 30 min |

### Parallelism

- **T1 and T2 are independent** — can be worked in parallel.
- **T3 and T4 depend on T1** (need the Passport to exist) but are independent of each other — can be worked in parallel after T1.

### Execution order

1. **T1 + T2** (parallel)
2. **T3 + T4** (parallel, after T1 lands)
3. Smoke test: sign up → verify Passport + DirectoryProfile created → visit `/me` → edit fields → save
4. Bow out

### Key decisions (pre-resolved)

- **Hook location**: Better-Auth's `after` middleware in `lib/auth.ts` — matches existing pattern (line ~49).
- **Brand middleware**: Extend existing Next.js middleware (likely `middleware.ts` at app root or `apps/web/middleware.ts`).
- **Form validation**: Zod v4 schemas co-located with the server actions.
- **No new packages needed** — React Hook Form, Zod, Better-Auth all already in the stack.

### Open questions to resolve during work

- Does `prisma migrate dev` still hang? (Carried from SESSION_0006.) If so, we code against the existing schema without running a new migration — S2 requires no schema changes.
- Where is the existing Next.js middleware file? Need to locate before T2.

---

## What landed

- **T1 — Post-signup hook**: Better-Auth `after` middleware in `lib/auth.ts` now creates `Passport` + `DirectoryProfile` in a `$transaction` on sign-up. Idempotent (checks for existing passport before creating). Fires on email sign-up, social sign-up, and OAuth callback paths.
- **T2 — Brand cookie middleware**: Already existed at `apps/web/middleware.ts` — fully wired (hostname → `Brand` enum → `x-brand` header + `brand` cookie). No changes needed.
- **T3 — `/me` route + Passport editor**: Server component at `app/(web)/me/page.tsx` fetches session + Passport + DirectoryProfile. Client component `passport-editor.tsx` renders two forms: Identity (display name, legal name, phone, emergency contact, bio) and Directory Profile (visibility, location, privacy toggles).
- **T4 — Server actions**: `server/web/passport/actions.ts` with `updatePassport` + `updateDirectoryProfile` using `userActionClient` chain. Zod schemas co-located. `server/web/passport/queries.ts` with cached DB lookups.
- **S2 scope complete** — smoke test deferred to SESSION_0008.

## Files touched

- `apps/web/lib/auth.ts` — Added post-signup hook creating Passport + DirectoryProfile stubs
- `apps/web/server/web/passport/actions.ts` — New: updatePassport + updateDirectoryProfile server actions with Zod schemas
- `apps/web/server/web/passport/queries.ts` — New: cached getPassportByUserId + getDirectoryProfileByUserId
- `apps/web/app/(web)/me/page.tsx` — New: /me server page (session guard, data fetch, renders editor)
- `apps/web/app/(web)/me/passport-editor.tsx` — New: client form component (Passport identity + DirectoryProfile privacy/location)
- `docs/sprints/SESSION_0007.md` — This file

## Decisions resolved

- **T2 already done**: Brand cookie middleware was built in a prior session — no duplication needed.
- **Zod schemas co-located with actions**, not in a separate `schema.ts` — keeps related code together for these small forms. Revisit if schemas grow or are shared.
- **`nullish()` → `.optional()`**: Zod `nullish()` causes `null` to flow into HTML input `value` props, which React rejects. Used `.optional()` for string fields and a `str()` coercion helper in the client component. `nullish()` kept only for `dob` and `gender` where null is semantically meaningful (Prisma `JsonNullValueInput`).

## Open decisions / blockers

- `prisma migrate dev` hang (carried forward from SESSION_0004)
- Smoke test not yet run — deferred to SESSION_0008
- Kajukenbo TuffBuffs-specific rank system (#14) — still unconfirmed
- Baseline + WEKAF subscription tiers — not yet defined

## Next session

- **Goal:** S2 smoke test + S3 kickoff (Organization create + join flow)
- **Inputs to read:**
  - `docs/sprints/SESSION_0007.md` (this file)
  - `docs/architecture/program-plan.md` (S3 row)
  - `apps/web/prisma/schema.prisma` (Organization + Membership models)
  - `apps/web/middleware.ts` (brand context for org creation)
- **First task:** Smoke test S2: sign up → verify Passport + DirectoryProfile created → visit `/me` → edit → save. Then begin S3 planning.

## Reflections

### What went well
- Petey's 4-task decomposition was clean — T1/T2 parallel, T3/T4 parallel after T1. The plan held exactly.
- Discovering T2 was already done saved 30 minutes. Reading existing code before building pays off.
- Dirstarter patterns (safe-actions, `useHookFormAction`, Form components) are well-established — following them made T3/T4 fast.

### Kaizen — lessons for future sessions
1. **Zod `nullish()` vs `.optional()` in form schemas**: When a Zod schema feeds into React Hook Form → HTML inputs, use `.optional()` for strings, not `.nullish()`. HTML `<input value={null}>` is a React error. Reserve `nullish()` for fields where `null` has distinct meaning (dates, enums, JSON). **Add to code guardrails.**
2. **`z.record()` arity in Zod v4**: `z.record(valueSchema)` is Zod v3 syntax. Zod v4 requires `z.record(keySchema, valueSchema)`. Always use `z.record(z.string(), valueSchema)`. **Add to code guardrails.**
3. **Check for existing implementations before building**: T2 was fully done. A 30-second `file_search` + `read_file` saved 30 minutes of duplicate work. Make this a habit in Petey's planning phase.
4. **`str()` helper pattern**: Coercing `null | undefined → ""` for form field values is a recurring need. The `str()` helper in `passport-editor.tsx` should be extracted to a shared util if it appears in more than one form component.
