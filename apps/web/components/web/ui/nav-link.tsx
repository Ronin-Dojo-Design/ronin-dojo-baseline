"use client"

import type { WithOptional } from "@primoui/utils"
import type { LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { Slot } from "radix-ui"
import { type ComponentProps, isValidElement, type ReactNode } from "react"
import { Link } from "~/components/common/link"
import { Slottable } from "~/components/common/slottable"
import { cva, cx, type VariantProps } from "~/lib/utils"

const navLinkVariants = cva({
  base: "group flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none",

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

const navLinkAffixVariants = cva({
  base: "shrink-0 size-4 opacity-75",
})

const isItemActive = (href: LinkProps["href"] | undefined, pathname: string, exact = false) => {
  if (href && href !== "/" && typeof href === "string") {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return false
}

type NavLinkProps = Omit<WithOptional<ComponentProps<typeof Link>, "href">, "prefix"> &
  VariantProps<typeof navLinkVariants> & {
    /**
     * If set to `true`, the link will be considered active if the pathname is exactly the same as the href.
     */
    exact?: boolean

    /**
     * If set to `true`, the button will be rendered as a child within the component.
     * This child component must be a valid React component.
     */
    asChild?: boolean

    /**
     * The slot to be rendered before the label.
     */
    prefix?: ReactNode

    /**
     * The slot to be rendered after the label.
     */
    suffix?: ReactNode
  }

const NavLink = ({
  children,
  className,
  isActive: isActiveProp,
  isPadded,
  exact,
  asChild,
  prefix,
  suffix,
  href,
  ...props
}: NavLinkProps) => {
  const pathname = usePathname()
  const isActive = isActiveProp ?? isItemActive(href, pathname, exact)
  const useAsChild = asChild && isValidElement(children)
  const Comp = useAsChild ? Slot.Root : Link

  return (
    <Comp
      href={href!}
      className={cx(navLinkVariants({ isActive, isPadded, className }))}
      {...props}
    >
      <Slottable child={children} asChild={asChild}>
        {child => (
          <>
            <Slot.Root className={cx(navLinkAffixVariants())}>{prefix}</Slot.Root>
            {child}
            <Slot.Root className={cx(navLinkAffixVariants())}>{suffix}</Slot.Root>
          </>
        )}
      </Slottable>
    </Comp>
  )
}

export { NavLink, navLinkVariants }
