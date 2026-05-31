import { getInitials } from "@dirstack/utils"
import { LogOutIcon, ShieldHalfIcon, UserIcon } from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { boxVariants } from "~/components/common/box"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { NavLink } from "~/components/web/ui/nav-link"
import { UserLogout } from "~/components/web/user-logout"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"
import { useEffect, useState } from "react"

export const UserMenu = () => {
  const { data: session, isPending } = useSession()
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)

  // The auth UI below diverges *structurally* on session state (plain Button vs a
  // motion.div-wrapped Button/DropdownMenu). `useSession()` resolves client-side, so
  // SSR and the client's first paint would otherwise render different trees → a
  // hydration mismatch that makes React regenerate the whole page (it intermittently
  // broke firefox e2e via slow client recovery). Gate on `mounted` so SSR + first
  // client paint render the identical stable button; the animated auth UI mounts after.
  useEffect(() => setMounted(true), [])

  if (!mounted || isPending) {
    return (
      <Button size="sm" variant="secondary" disabled>
        {t("navigation.sign_in")}
      </Button>
    )
  }

  if (!session?.user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Button size="sm" variant="secondary" render={<Link href="/auth/login" />}>
          {t("navigation.sign_in")}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={false}
          render={
            <Avatar
              className={cx(boxVariants({ hover: true, focus: true }), "size-6 duration-100")}
            />
          }
        >
          <AvatarImage src={session.user.image ?? undefined} />
          <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="max-w-48 truncate font-normal leading-relaxed">
              {session.user.name}

              {session.user.name !== session.user.email && (
                <div className="text-muted-foreground truncate">{session.user.email}</div>
              )}
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {session.user.role === "admin" && (
            <DropdownMenuItem render={<NavLink href="/admin" prefix={<ShieldHalfIcon />} />}>
              {t("navigation.admin_panel")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem render={<NavLink href="/dashboard" prefix={<UserIcon />} />}>
            {t("navigation.dashboard")}
          </DropdownMenuItem>

          <DropdownMenuItem render={<NavLink prefix={<LogOutIcon />} render={<UserLogout />} />}>
            {t("navigation.sign_out")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
