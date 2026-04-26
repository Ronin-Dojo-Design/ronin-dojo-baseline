"use client"

import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { useFilters } from "~/contexts/filter-context"
import { cx } from "~/lib/utils"
import type { TagsFilterSchema } from "~/server/web/tags/schema"

export const TagFilters = ({ className, ...props }: ComponentProps<"div">) => {
  const { filters, updateFilters } = useFilters<TagsFilterSchema>()
  const alphabet = "abcdefghijklmnopqrstuvwxyz&"

  return (
    <div
      className={cx("grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] gap-1 w-full", className)}
      {...props}
    >
      {alphabet.split("").map(letter => (
        <Button
          key={letter}
          variant={filters.letter === letter ? "primary" : "secondary"}
          className="px-2 py-1 text-sm font-medium text-center uppercase"
          onClick={() => updateFilters({ letter })}
        >
          {letter}
        </Button>
      ))}
    </div>
  )
}
