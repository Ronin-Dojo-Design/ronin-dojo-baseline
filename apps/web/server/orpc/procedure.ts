import { ORPCError, os } from "@orpc/server"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import type { InitialContext } from "~/server/orpc/context"
import { can } from "~/server/orpc/permissions"
import { consumeRateLimit, type RateLimitConfig } from "~/server/orpc/rate-limit"
import { revalidate } from "~/server/orpc/revalidate"
import type { Permission, Role } from "~/server/orpc/roles"

export type ProcedureMeta = {
  permission?: Permission
  rateLimit?: RateLimitConfig
}

/**
 * Roles that bypass rate limiting entirely. Edit this list (and only this
 * list) if you want moderators or another role to skip limits.
 */
const RATE_LIMIT_BYPASS_ROLES: ReadonlyArray<Role> = ["admin"]

const base = os.$context<InitialContext>().$meta<ProcedureMeta>({
  rateLimit: { points: 600, duration: 60 * 60 },
})

const withBaseContext = base.middleware(async ({ next, context }) => {
  return next({
    context: {
      revalidate,
      source: context.source ?? ("rpc" as const),
    },
  })
})

const withSession = base.middleware(async ({ next, context }) => {
  const user = context.user ?? (await getServerSession())?.user ?? null
  return next({ context: { user } })
})

/**
 * Ronin delta (SOT-ADR D3 hard gate — brand scope is mandatory): resolve the
 * request brand server-side, mirroring `lib/safe-actions.ts`. The middleware
 * `x-brand` header is trusted (proxy.ts overwrites client-supplied values);
 * an in-process transport (rsc) may pre-inject `brand` to skip re-resolution.
 * Clients can never choose a brand.
 */
const withBrand = base.middleware(async ({ next, context }) => {
  const brand = context.brand ?? (await getRequestBrand())
  return next({ context: { brand } })
})

const withRateLimitGate = base.middleware(async ({ next, context, procedure, path }) => {
  const meta = procedure["~orpc"].meta as ProcedureMeta
  const source = context.source ?? "rpc"

  // RSC calls are in-process — the originating HTTP request was already
  // counted upstream; counting again would double-charge.
  if (source === "rsc") {
    return next()
  }

  const role = context.user?.role
  if (role && RATE_LIMIT_BYPASS_ROLES.includes(role as Role)) {
    return next()
  }

  const config = meta.rateLimit
  if (!config || config === "none") {
    return next()
  }

  // Scope the bucket to this procedure so sibling procedures sharing the same
  // `{ points, duration }` numbers (e.g. tool submit and newsletter subscribe,
  // both 3/day) keep independent quotas.
  await consumeRateLimit(config, context.user?.id, path.join("/"))
  return next()
})

const withPermissionGate = base.middleware(async ({ next, context, procedure }) => {
  const meta = procedure["~orpc"].meta as ProcedureMeta
  const permission = meta.permission
  if (!permission) {
    return next()
  }

  if (!can(context.user ?? null, permission)) {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" })
    }
    throw new ORPCError("FORBIDDEN", { message: "Insufficient permissions" })
  }

  return next()
})

/**
 * Two builders cover every procedure:
 *
 * - `publicProcedure` — anonymous-reachable procedures (a public permission, or
 *   none). `context.user` may be `null`.
 * - `authedProcedure` — everything else. Asserts a signed-in user and narrows
 *   `context.user` to non-null for the handler.
 *
 * Both share the same pipeline (top → bottom):
 *   1. base context — injects `revalidate`, normalizes `source`
 *   2. session      — resolves `user` from cookie unless pre-injected
 *   3. brand        — Ronin delta: resolves `brand` from trusted headers
 *   4. rate limit   — reads `meta.rateLimit`; skips RSC and bypass roles
 *   5. permission   — reads `meta.permission`; calls `can(user, permission)`
 * `authedProcedure` adds a 6th step asserting `context.user`.
 *
 * Authorization is governed entirely by `meta.permission`; the `can()` check in
 * step 5 is the single source of truth for who may call a procedure. A non-public
 * permission already rejects anonymous callers there, so `authedProcedure` adds no
 * new authorization — it only surfaces the non-null `user` that permission already
 * implies, and acts as the deny-by-default backstop for a procedure that omits a
 * public permission. Reach for `publicProcedure` only to deliberately admit
 * anonymous callers.
 *
 * Compose router-level defaults by deriving a builder at the top of an entity
 * router and chaining further `.meta()` calls on each procedure. Meta is
 * shallow-merged (see `@orpc/contract` `mergeMeta`).
 *
 * REST exposure is orthogonal: a procedure appears on `/api/v1` if and only if it
 * declares a `.route()` — RPC and RSC reach every procedure regardless.
 */
export const publicProcedure = base
  .use(withBaseContext)
  .use(withSession)
  .use(withBrand)
  .use(withRateLimitGate)
  .use(withPermissionGate)

export const authedProcedure = publicProcedure.use(async ({ next, context }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" })
  }

  return next({ context: { user: context.user } })
})
