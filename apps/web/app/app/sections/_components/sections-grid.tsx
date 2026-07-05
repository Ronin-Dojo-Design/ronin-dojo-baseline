"use client"

import { useMemo, useState } from "react"
import { Card, CardHeader } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { ADMIN_SECTION_GROUPS } from "~/config/admin-sections"

type SectionsGridProps = {
  /**
   * Server-filtered set of reachable section hrefs — permission decisions are
   * made in the page (same `can()` + lineage-grant rules as the sidebar); this
   * island only re-derives display data from the shared config and applies the
   * client-side title filter.
   */
  allowedHrefs: string[]
}

export const SectionsGrid = ({ allowedHrefs }: SectionsGridProps) => {
  const [query, setQuery] = useState("")

  const groups = useMemo(() => {
    const allowed = new Set(allowedHrefs)
    const needle = query.trim().toLowerCase()

    return ADMIN_SECTION_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(
        item =>
          allowed.has(item.href) && (needle === "" || item.title.toLowerCase().includes(needle)),
      ),
    })).filter(group => group.items.length > 0)
  }, [allowedHrefs, query])

  return (
    <Stack direction="column" size="lg" className="w-full">
      <Input
        type="search"
        size="lg"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Filter sections…"
        aria-label="Filter sections"
        className="max-w-xs"
      />

      {groups.length === 0 ? (
        <Note>No sections match “{query.trim()}”.</Note>
      ) : (
        <div className="grid w-full gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {groups.map(group => {
            const GroupIcon = group.icon

            return (
              <Card key={group.key} hover={false} className="gap-3 p-4">
                <CardHeader size="sm">
                  <GroupIcon className="size-4 text-muted-foreground" />
                  <Heading size="h6">{group.label}</Heading>
                </CardHeader>

                <Stack direction="column" size="xs" className="w-full">
                  {group.items.map(item => {
                    const ItemIcon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline [&_svg]:size-4"
                      >
                        <ItemIcon />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </Stack>
              </Card>
            )
          })}
        </div>
      )}
    </Stack>
  )
}
