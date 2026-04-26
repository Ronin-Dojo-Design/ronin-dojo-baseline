"use client"

import { usePagination } from "@mantine/hooks"
import { getPageLink } from "@primoui/utils"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { Note } from "~/components/common/note"
import { NavLink, navLinkVariants } from "~/components/web/ui/nav-link"
import { cx } from "~/lib/utils"

type PaginationLinkProps = ComponentProps<typeof NavLink> & {
  isDisabled?: boolean
}

const PaginationLink = ({
  isDisabled,
  children,
  prefix,
  suffix,
  ...props
}: PaginationLinkProps) => {
  if (isDisabled) {
    return (
      <NavLink prefix={prefix} suffix={suffix} asChild>
        <button type="button" disabled>
          {children}
        </button>
      </NavLink>
    )
  }

  return (
    <NavLink prefix={prefix} suffix={suffix} {...props}>
      {children}
    </NavLink>
  )
}

export type PaginationProps = ComponentProps<"nav"> & {
  total: number
  perPage?: number
  page?: number
  siblings?: number
  boundaries?: number
}

export const Pagination = ({
  className,
  total,
  perPage = 1,
  page = 1,
  siblings,
  boundaries,
  ...props
}: PaginationProps) => {
  const t = useTranslations("components.pagination")
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const pageCount = Math.ceil(total / perPage)

  const pagination = usePagination({
    total: pageCount,
    page,
    siblings,
    boundaries,
  })

  if (pagination.range.length <= 1) {
    return null
  }

  return (
    <nav
      className={cx("-mt-px flex w-full items-start justify-between text-sm md:w-auto", className)}
      {...props}
    >
      <PaginationLink
        isDisabled={page <= 1}
        href={getPageLink(params, pathname, page - 1)}
        prefix={<ArrowLeftIcon />}
        rel="prev"
      >
        {t("prev")}
      </PaginationLink>

      <Note className="md:hidden">{t("page_of", { page, pageCount })}</Note>

      <div className="flex items-center flex-wrap gap-3 max-md:hidden">
        <Note as="span">{t("page_label")}</Note>

        {pagination.range.map((value, index) => (
          <div key={`page-${index}`}>
            {value === "dots" && <span className={navLinkVariants()}>...</span>}

            {typeof value === "number" && (
              <NavLink
                href={getPageLink(params, pathname, value)}
                isActive={value === page}
                className={cx("min-w-5 justify-center", value === page && "bg-accent rounded-xs")}
              >
                {value}
              </NavLink>
            )}
          </div>
        ))}
      </div>

      <PaginationLink
        isDisabled={page >= pageCount}
        href={getPageLink(params, pathname, page + 1)}
        suffix={<ArrowRightIcon />}
        rel="next"
      >
        {t("next")}
      </PaginationLink>
    </nav>
  )
}
