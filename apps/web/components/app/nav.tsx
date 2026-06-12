"use client"

import { usePathname } from "next/navigation"
import type { ComponentProps, ReactNode } from "react"
import { Badge } from "~/components/common/badge"
import { Button, type ButtonProps } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { cx } from "~/lib/utils"

export type NavLink = ButtonProps & {
  title: string
  href: string
  label?: ReactNode
}

type NavProps = ComponentProps<"nav"> & {
  isCollapsed: boolean
  links: Array<NavLink | undefined>
}

export const Nav = ({ className, links, isCollapsed, ...props }: NavProps) => {
  const pathname = usePathname()
  const rootPath = "/app"

  const isActive = (href: string) => {
    if (
      (href === rootPath && href === pathname) ||
      (href !== rootPath && pathname.startsWith(href))
    ) {
      return true
    }

    return false
  }

  return (
    <nav
      className={cx(
        "flex flex-col gap-1 p-3 group-data-[collapsed=true]/collapsible:justify-center group-data-[collapsed=true]/collapsible:px-2",
        className,
      )}
      {...props}
    >
      {links.map((link, index) => {
        if (!link) {
          return <Separator key={index} className="my-2 -mx-3 w-auto" />
        }

        const { href, title, label, suffix, ...props } = link

        if (isCollapsed) {
          return (
            <Tooltip key={index}>
              <TooltipTrigger
                render={
                  <Button
                    size="md"
                    variant="ghost"
                    aria-label={title}
                    className={cx("font-sans", isActive(href) && "bg-accent text-foreground")}
                    render={<Link href={href} />}
                    {...props}
                  />
                }
              />

              <TooltipContent side="right" render={<Stack size="lg" />}>
                {title}
                {label && <span className="opacity-60">{label}</span>}
              </TooltipContent>
            </Tooltip>
          )
        }

        return (
          <Button
            key={index}
            size="md"
            variant="ghost"
            suffix={
              suffix ||
              (label && (
                <Badge variant="outline" className="ml-auto size-auto">
                  {label}
                </Badge>
              ))
            }
            className={cx("justify-start font-sans", isActive(href) && "bg-accent text-foreground")}
            render={<Link href={href} />}
            {...props}
          >
            {title}
          </Button>
        )
      })}
    </nav>
  )
}
