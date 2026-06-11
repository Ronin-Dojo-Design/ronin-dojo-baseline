import { createRouterClient, ORPCError } from "@orpc/server"
import { notFound } from "next/navigation"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { appRouter } from "~/server/router"

/**
 * In-process client for invoking oRPC procedures from React Server
 * Components. Resolves the current session and tags the call with
 * `source: "rsc"` so middleware can skip rate limiting (the originating
 * HTTP request was already counted) while still enforcing permissions
 * and caching identically to network transports.
 *
 * Ronin delta: also pre-resolves `brand` from the request headers so the
 * `withBrand` middleware doesn't re-read them per procedure call (SOT-ADR
 * D3 hard gate — brand travels with every transport).
 *
 * @example
 *   // app/(web)/[slug]/page.tsx
 *   import { rsc } from "~/lib/orpc-server"
 *
 *   export default async function ToolPage({ params }) {
 *     const api = await rsc()
 *     const tool = await api.tools.bySlug({ slug: params.slug })
 *     return <Tool data={tool} />
 *   }
 */
export const rsc = async () => {
  const session = await getServerSession()
  const brand = await getRequestBrand()

  return createRouterClient(appRouter, {
    context: {
      user: session?.user ?? null,
      source: "rsc" as const,
      brand,
    },
  })
}

/**
 * Await an `rsc()` read and turn a `NOT_FOUND` procedure error into Next's
 * `notFound()`. Other errors (including `FORBIDDEN`) propagate unchanged.
 *
 * Lets a Server Component fetch a record through the permission-gated client
 * and render the 404 page when it is missing, without an explicit null check.
 *
 * @example
 *   const user = await orNotFound(api.users.byId({ id }))
 */
export const orNotFound = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise
  } catch (error) {
    if (error instanceof ORPCError && error.code === "NOT_FOUND") {
      notFound()
    }
    throw error
  }
}
