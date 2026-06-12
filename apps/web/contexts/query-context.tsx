"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type PropsWithChildren, useState } from "react"

/**
 * TanStack Query provider for the oRPC client transport (`~/lib/orpc-query`).
 *
 * Deferred from Phase 1a (SESSION_0362) and mounted in Phase 1c
 * (SESSION_0364): this only stands up the provider so client components *can*
 * consume `orpc` query/mutation utils — no consumer is migrated yet, so there
 * is zero behavior change until a client surface opts in.
 *
 * Standard TanStack v5 App-Router pattern: the `QueryClient` is created once
 * per browser session via `useState`'s lazy initializer. Constructing it in
 * render (rather than module scope) keeps each request's client isolated on
 * the server and avoids sharing cache across users during SSR.
 */
export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
