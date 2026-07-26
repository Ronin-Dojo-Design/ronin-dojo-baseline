---
title: "SESSION 0697 — WL-P2-43: kill the third revalidation idiom (2 seam-bypass files → oRPC)"
slug: session-0697
type: session--implement
status: done
created: 2026-07-25
updated: 2026-07-25
last_agent: session-0697-lane
sprint: S12
lane: build
recipe: "overnight-orchestrator-waves"
goal_ids: []
pairs_with:
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/architecture/decisions/0024-orpc-vs-next-safe-action.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0697 — WL-P2-43: the third revalidation idiom dies with the seam-bypass migration

Overnight-orchestrator build lane (worktree `ronin-0697`, branch
`auto/session-0697-wl43-orpc-revalidate-migration`). Target: the 2 files that imported
`revalidatePath(path, "layout")` directly because the safe-action ctx `revalidate({paths,tags})`
seam can't express layout-typed revalidation (the FI-025 / FI-022 stale-`[id]`-page fixes) — a
third revalidation idiom. Direction: full oRPC (ADR 0024 superseded → full adoption; SOT-ADR D3 —
`safe-actions.ts` is a RETIRING seam, consumers migrate OFF it).

## What happened

**Verify-first:** both bypass files were still live on the retiring seam
(`adminActionClient` + direct `revalidatePath(..., "layout")`):

- `apps/web/server/admin/users/actions.ts` — `updateUser` / `deleteUsers` / `createPerson` /
  `updateUserRole` (3 layout-typed call sites)
- `apps/web/server/admin/certificates/issuance-actions.ts` — `issueCertificate` /
  `revokeCertificate` (2 layout-typed call sites)

**Migration (behavior-preserving):**

- **New routers** (procedures own their revalidation — the layout-typed call is now idiomatic
  INSIDE the handler, not a seam bypass; deferred tag work stays on the oRPC
  `context.revalidate` seam):
  - `apps/web/server/orpc/routers/users.ts` — `users.update` / `users.remove` /
    `users.createPerson` / `users.updateRole`, gated `meta.permission = APP_AREA_PERMISSIONS.users`
    ("users.manage" — the same string gating the `/app/users` layout; admin-only via the `"*"`
    grant, preserving the old `adminActionClient` boundary). Transaction bodies (identity lock
    law, self-role-change guard + audit, promoter-history fail-closed preflight, RankEntry sync,
    accountless-Passport create) carried over verbatim; guard throws became typed `ORPCError`s
    (`FORBIDDEN` self-role-change, `CONFLICT` delete preflights, `BAD_REQUEST` missing ids).
  - `apps/web/server/orpc/routers/certificates.ts` — `certificates.issue` / `certificates.revoke`,
    gated `certificates.manage`. Template brand check → `NOT_FOUND`.
  - Both registered in `apps/web/server/router.ts` (`appRouter.users`, `appRouter.certificates`).
- **Old action files deleted** (both bypass files + their 4 safe-action test files).
- **Call sites migrated** to `client.<router>.<procedure>` (the `inbox-status-select` /
  `belt-edit-form` idiom — try/catch surfacing the real oRPC message, no next-safe-action hooks):
  - `certificate-issue-dialog.tsx` — plain `useForm` + zodResolver; success = toast + reset +
    close + `router.refresh()` (unchanged UX).
  - `certificate-issuance-list.tsx` — `useTransition` revoke + `router.refresh()`; adds an error
    toast (old `useAction` with no callbacks swallowed failures silently).
  - `user-form.tsx` / `person-form.tsx` — plain `useForm` + zodResolver; same toasts/redirects.
    `person-form` types its values as `z.input<typeof createPersonSchema>` (the schema's
    `affiliationRole` `.default()` makes z.input differ from z.infer; zodResolver types over the
    input side).
  - `account-action-items.tsx` — `client.users.updateRole` inside the existing `toast.promise`,
    now with an error arm (see behavior notes).
  - `users-delete-dialog.tsx` / `people-delete-dialog.tsx` — a safe-action-SHAPED adapter
    (`deleteUsersViaOrpc`, returns `{data}|{serverError}`) plugs the oRPC call into the UNCHANGED
    shared `DeleteDialog` (`components/admin/dialogs/delete-dialog.tsx` untouched — its UI-shell
    migration is the broader all-admin-surfaces refactor, not this lane). Adds
    `onSuccess: router.refresh()`.
- **Tests:** the 4 retired safe-action tests' proofs carried forward into 2 oRPC integration
  tests (the `storyboard-router.integration.test.ts` pattern + SOP §15 Phase 1 shape —
  `createRouterClient` with injected context, adversarial authz first, recording `next/cache`
  seam asserting the **(path, type) pair** so a plain-path call can't satisfy a layout assert):
  - `apps/web/server/orpc/routers/users.integration.test.ts` — 11 pass (authz anon/member across
    all 4 procedures, no-phantom-write, self-role-change guard via both procedures + audit rows,
    createPerson RankAward+RankEntry twin, delete fail-closed CONFLICT + cascade, layout-typed
    + plain-path revalidation contracts).
  - `apps/web/server/orpc/routers/certificates.integration.test.ts` — 5 pass (authz on both
    procedures, FI-022 issuance row keyed to User.id + `CERT-` number + 32-hex QR + date-only
    expiry, unknown template NOT_FOUND, revoke, layout + deferred-tag contracts via flushed
    `after()`).

## Behavior deltas (deliberate, small)

1. **RPC vs Server Action re-render:** a Server Action carried the revalidated RSC tree in-band;
   an RPC response doesn't — so success paths now call `router.refresh()` (issue dialog already
   did; revoke list, user form, delete dialogs gained it). Same observable freshness.
2. **Errors now surface as errors:** the old `account-action-items` role toggle awaited a
   safe-action that RESOLVED with `{serverError}` — `toast.promise` false-toasted "Role
   successfully updated" on failure. The oRPC client throws, so the promise toast gained an
   error arm showing the real message. Same for the revoke button (previously silent).
3. **Error masking:** expected guard failures are typed `ORPCError`s with user-safe copy;
   unexpected internals now surface as generic 500s instead of the retiring seam's
   message-for-every-Error behavior (the belt/storyboard router precedent).

## Gates (REAL exit codes)

| Gate | Command | Exit |
| --- | --- | --- |
| typecheck | `cd apps/web && bun run typecheck` | 0 |
| lint | `cd apps/web && bun run lint` (oxlint --fix; pre-existing warnings only) | 0 |
| tests (new) | `bun test server/orpc/routers/users.integration.test.ts` — 11 pass | 0 |
| tests (new) | `bun test server/orpc/routers/certificates.integration.test.ts` — 5 pass | 0 |
| tests (affected) | `bun test server/lineage/storyboard-router.integration.test.ts` — 13 pass | 0 |
| tests (affected) | `bun test server/belt/router.integration.test.ts` — 49 pass | 0 |

`git grep 'revalidatePath(.*"layout"' -- apps/web` over tracked files → **zero** hits; the only
layout-typed calls left live inside the two new oRPC routers (idiomatic, procedure-owned).

## Proposed ledger edits

> Findings only — shared ledgers are NOT edited from this lane (append via the merge owner).

- **wiring-ledger WL-P2-43 → RESOLVED (draft):** "The third revalidation idiom died with the
  seam-bypass migration (SESSION_0697). The 2 direct `revalidatePath(path, "layout")` importers
  (`server/admin/users/actions.ts`, `server/admin/certificates/issuance-actions.ts`) migrated to
  oRPC (`server/orpc/routers/users.ts` + `certificates.ts`); the layout-typed call is now owned
  by the procedure (idiomatic in the `/api/rpc` Route Handler / rsc transport), deferred tags
  stay on the oRPC `context.revalidate` seam. Zero tracked `revalidatePath(..., "layout")`
  bypass sites remain; both files' 6 consumers + 4 tests moved off `adminActionClient`."
- **Stale doc mentions (comment-only, files not owned by this lane — cleanup candidates):**
  `server/identity/person-schema.ts:7`, `server/admin/lineage/place-lead-core.ts:52`, and
  `server/belt/router.ts:517` reference the now-deleted `server/admin/users/actions.ts` in
  docblocks (pattern citations, not imports).
- **Follow-on (not expanded here):** `components/admin/dialogs/delete-dialog.tsx` still speaks
  the next-safe-action hook contract (`useAction` + `HookSafeActionFn`); ~15 admin delete
  surfaces remain on it. The `deleteUsersViaOrpc` adapter shows the migration seam — when the
  last safe-action delete migrates, swap the dialog's contract to a plain
  `(ids) => Promise<{data}|{serverError}>` and drop the hook import.

## Exit

Commit → push `-u origin HEAD` → `gh pr create --fill` → hold at the PR gate (orchestrator merges).
