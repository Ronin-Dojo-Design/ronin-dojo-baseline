import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Route-segment layout scoped to `/clients/**` (SESSION_0678). This does NOT touch the owned
 * root `app/layout.tsx` (PR #274/#286/#290) — Next.js merges this segment's metadata into it.
 *
 * Every page under `/clients` is noindex/nofollow: these are private, per-client status pages
 * gated by `middleware.ts` Basic Auth, not public marketing surfaces. Child pages inherit this
 * `robots` value automatically (Next.js metadata merging) unless they explicitly override it —
 * none of them do.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
