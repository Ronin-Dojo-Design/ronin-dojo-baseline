import { usePathname, useSearchParams } from "next/navigation"

export const useAuthCallbackUrl = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const callbackURL = searchParams.get("next") || (pathname.startsWith("/auth") ? "/" : pathname)

  return callbackURL
}
