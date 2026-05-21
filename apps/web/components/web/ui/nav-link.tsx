"use client"

import { mergeProps } from "@base-ui/react"
import { useRender } from "@base-ui/react/use-render"
import type { WithOptional } from "@dirstack/utils"
import type { LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { Link } from "~/components/common/link"
import { slot } from "~/lib/slot"
import { cva, cx, type VariantProps } from "~/lib/utils"

const navLinkVariants = cva({
  base: "group flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none",

  slots: {
    affix: "shrink-0 size-4 opacity-75",
  },

  variants: {
    isActive: {
      true: "font-medium text-foreground",
      false: "text-muted-foreground hover:[&[href],&[type]]:text-foreground",
    },
    isPadded: {
      true: "p-0.5 -m-0.5",
    },
  },

  defaultVariants: {
    isActive: false,
    isPadded: true,
  },
})

const isItemActive = (href: LinkProps["href"] | undefined, pathname: string, exact = false) => {
  if (href && href !== "/" && typeof href === "string") {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return false
}

type NavLinkProps = Omit<WithOptional<useRender.ComponentProps<typeof Link>, "href">, "prefix"> &
  VariantProps<typeof navLinkVariants> & {
    exact?: boolean
    prefix?: ReactNode
    suffix?: ReactNode
  }

const NavLink = ({
  children,
  className,
  isActive: isActiveProp,
  isPadded,
  exact,
  render,
  prefix,
  suffix,
  href,
  ...rest
}: NavLinkProps) => {
  const pathname = usePathname()
  const isActive = isActiveProp ?? isItemActive(href, pathname, exact)

  const { base, affix } = navLinkVariants({ isActive, isPadded })

  const props = mergeProps<"a">(
    {
      className: cx(base(), className),
      children: (
        <>
          {slot(prefix, { className: affix() })}
          {children}
          {slot(suffix, { className: affix() })}
        </>
      ),
    },
    rest,
  )

  return useRender({
    render: render ?? (href ? <Link href={href} /> : <button type="button" />),
    props,
  })
}

export { NavLink, navLinkVariants }
