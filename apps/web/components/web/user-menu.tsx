import { getInitials } from "@primoui/utils"
import { LogOutIcon, ShieldHalfIcon, UserIcon } from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { boxVariants } from "~/components/common/box"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
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

export const UserMenu = () => {
  const { data: session, isPending } = useSession()
  const t = useTranslations()

  if (isPending) {
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
          <DropdownMenuLabel className="max-w-48 truncate font-normal leading-relaxed">
            {session.user.name}

            {session.user.name !== session.user.email && (
              <div className="text-muted-foreground truncate">{session.user.email}</div>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {session.user.role === "admin" && (
            <DropdownMenuItem render={<NavLink href="/admin" prefix={<ShieldHalfIcon />} />}>
              {t("navigation.admin_panel")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem render={<NavLink href="/dashboard" prefix={<UserIcon />} />}>
            {t("navigation.dashboard")}
          </DropdownMenuItem>

          <DropdownMenuItem render={<NavLink prefix={<LogOutIcon />} asChild />}>
            <UserLogout>{t("navigation.sign_out")}</UserLogout>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
