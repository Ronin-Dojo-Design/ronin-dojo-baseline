"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"

type Tag = { id: string; name: string; slug: string }

type ContentTagFilterProps = ComponentProps<"div"> & {
  tags: Tag[]
  activeTag?: string
}

export const ContentTagFilter = ({ tags, activeTag, ...props }: ContentTagFilterProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (tags.length === 0) return null

  const handleClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === activeTag) {
      params.delete("tag")
    } else {
      params.set("tag", slug)
    }
    router.push(`/posts${params.toString() ? `?${params}` : ""}`)
  }

  return (
    <Stack size="xs" className="flex-wrap" {...props}>
      <Badge
        variant={!activeTag ? "primary" : "outline"}
        className="cursor-pointer"
        onClick={() => {
          router.push("/posts")
        }}
      >
        All
      </Badge>
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant={activeTag === tag.slug ? "primary" : "outline"}
          className="cursor-pointer"
          onClick={() => handleClick(tag.slug)}
        >
          {tag.name}
        </Badge>
      ))}
    </Stack>
  )
}
