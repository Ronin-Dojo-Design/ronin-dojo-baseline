import { usePathname, useSearchParams } from "next/navigation"
import { safeRelativePath } from "~/lib/safe-redirect"

export const useAuthCallbackUrl = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  // Validate `?next` as a safe same-origin relative path (open-redirect guard,
  // shared with /preview — SOP §10b). An absent/unsafe value falls back to the
  // current path (or "/" on an /auth route), never an off-origin target.
  const fallback = pathname.startsWith("/auth") ? "/" : pathname
  const callbackURL = safeRelativePath(searchParams.get("next"), fallback)

  return callbackURL
}
