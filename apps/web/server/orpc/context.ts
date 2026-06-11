import type { Brand } from "~/.generated/prisma/client"
import type { Session } from "~/lib/auth"

/**
 * Which transport invoked the procedure.
 *
 * - `rpc`     — JSON-over-HTTP via `/api/rpc/*` (TanStack Query, browser clients)
 * - `openapi` — REST-style HTTP via `/api/v1/*` (Bearer-auth public API)
 * - `rsc`     — in-process call from a React Server Component (no HTTP)
 */
export type Source = "rpc" | "openapi" | "rsc"

export type SessionUser = Session["user"]

/**
 * Context available inside every procedure handler. Transports inject `user`
 * and `source`; the base procedure middleware adds `revalidate`.
 *
 * Ronin delta (SOT-ADR D3 hard gate): `brand` is resolved server-side per
 * request via the `withBrand` middleware (`~/lib/brand-context`), mirroring
 * `lib/safe-actions.ts`. Brand scoping is mandatory — handlers must scope
 * queries by `context.brand`, never trust a client-supplied brand.
 */
export type Context = {
  user: SessionUser | null
  source: Source
  brand: Brand
  revalidate: (opts: { paths?: Array<string>; tags?: Array<string> }) => void
}

/**
 * Initial context shape — what a transport may inject before middleware runs.
 *
 * `user` lets a transport pre-resolve a session (e.g. from an API key).
 * `source` defaults to `"rpc"` if unset.
 * `brand` lets an in-process transport (rsc) pre-resolve the brand; HTTP
 * transports leave it unset and `withBrand` resolves it from trusted headers.
 */
export type InitialContext = {
  user?: SessionUser | null
  source?: Source
  brand?: Brand
}
