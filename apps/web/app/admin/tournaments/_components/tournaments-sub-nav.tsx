"use client"

import { usePathname } from "next/navigation"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

const links = [
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/tournaments/roles", label: "Roles" },
  { href: "/admin/tournaments/rule-sets", label: "Rule Sets" },
] as const

export function TournamentsSubNav() {
  const pathname = usePathname()

  return (
    <Stack size="sm" className="mb-4">
      {links.map(link => {
        const isActive =
          link.href === "/admin/tournaments"
            ? pathname === "/admin/tournaments"
            : pathname.startsWith(link.href)

        return (
          <Button
            key={link.href}
            variant="ghost"
            size="sm"
            className={cx(isActive && "bg-accent")}
            asChild
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        )
      })}
    </Stack>
  )
}
