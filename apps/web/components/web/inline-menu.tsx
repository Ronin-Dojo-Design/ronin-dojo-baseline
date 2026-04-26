"use client"

import { useScrollSpy } from "@mantine/hooks"
import { AlignLeftIcon, ChevronDownIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useTranslations } from "next-intl"
import type { ComponentProps, ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

type InlineMenuProps<T extends { id: string }> = ComponentProps<"div"> & {
  items: T[]
  renderItem: (item: T, isActive: boolean, index: number) => ReactNode
}

export const InlineMenu = <T extends { id: string }>({
  children,
  className,
  items,
  renderItem,
  title,
  ...props
}: InlineMenuProps<T>) => {
  const t = useTranslations("common")
  const [isOpen, setIsOpen] = useState(true)
  const selector = useMemo(() => items.map(({ id }) => `[id="${id}"]`).join(","), [items])
  const { active, data } = useScrollSpy({ selector })
  const activeId = data[active]?.id

  useEffect(() => {
    if (!activeId) return

    const activeMenuElement = document.querySelector(`nav a[href="#${activeId}"]`)
    activeMenuElement?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [activeId])

  return (
    <div
      className={cx("flex flex-col flex-1 p-1 overflow-hidden max-md:hidden lg:px-5", className)}
      {...props}
    >
      <Stack
        size="sm"
        wrap={false}
        className="group text-start w-full text-muted-foreground hover:text-foreground"
        asChild
      >
        <button type="button" onClick={() => setIsOpen(!isOpen)}>
          <AlignLeftIcon />
          <span className="flex-1 truncate text-sm">{title || t("on_this_page")}</span>
          <ChevronDownIcon className={cx("duration-200", isOpen && "rotate-180")} />
        </button>
      </Stack>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0 }}
            animate={{ height: isOpen ? "auto" : 0 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mt-3 overflow-y-auto overscroll-contain scroll-smooth"
          >
            {items.map((item, index) => renderItem(item, activeId === item.id, index))}
            {children}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
