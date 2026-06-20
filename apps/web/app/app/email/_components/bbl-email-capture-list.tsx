"use client"

import { SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

/**
 * Serializable capture row — shaped on the server (page.tsx) so this client
 * component never imports the Prisma `db` (which would leak into the bundle).
 */
export type BblCaptureRow = {
  id: string
  name: string
  email: string
  membershipPath: string
  status: string
  submittedLabel: string
  leadHref: string
}

type BblEmailCaptureListProps = {
  captures: BblCaptureRow[]
}

const buildMailto = (email: string, subject: string, body: string) => {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${encodeURIComponent(email)}?${params.toString()}`
}

export function BblEmailCaptureList({ captures }: BblEmailCaptureListProps) {
  const [query, setQuery] = useState("")
  const [pathFilter, setPathFilter] = useState<string>("all")

  // Membership paths present in the data drive the audience-segment tabs.
  const paths = useMemo(() => {
    const seen = new Set<string>()
    for (const capture of captures) {
      seen.add(capture.membershipPath)
    }
    return [...seen]
  }, [captures])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return captures.filter(capture => {
      const matchesPath = pathFilter === "all" || capture.membershipPath === pathFilter
      const matchesQuery =
        !needle ||
        capture.name.toLowerCase().includes(needle) ||
        capture.email.toLowerCase().includes(needle)
      return matchesPath && matchesQuery
    })
  }, [captures, query, pathFilter])

  return (
    <Card hover={false} className="p-4">
      <Stack direction="column" className="w-full gap-4">
        <Stack className="items-start justify-between gap-4" wrap>
          <Stack direction="column" size="xs" className="min-w-0">
            <H3>Recent Join Legacy captures</H3>
            <Note className="text-sm">
              Leads from <code>/lineage/join</code>. Search and filter by membership path to pick an
              audience, then use the quick-action links to open a pre-filled draft from the BBL
              mailbox.
            </Note>
          </Stack>
          <Badge variant="outline" size="sm">
            {filtered.length} of {captures.length}
          </Badge>
        </Stack>

        {captures.length > 0 && (
          <Stack className="items-center justify-between gap-3" wrap>
            <div className="relative min-w-0 grow basis-56">
              <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search name or email..."
                aria-label="Search captures"
                className="pl-8"
              />
            </div>
            <Stack size="xs" wrap>
              <SegmentTab
                label="All"
                count={captures.length}
                isActive={pathFilter === "all"}
                onClick={() => setPathFilter("all")}
              />
              {paths.map(path => (
                <SegmentTab
                  key={path}
                  label={path}
                  count={captures.filter(capture => capture.membershipPath === path).length}
                  isActive={pathFilter === path}
                  onClick={() => setPathFilter(path)}
                />
              ))}
            </Stack>
          </Stack>
        )}

        {captures.length === 0 ? (
          <Note className="text-sm">No Join Legacy captures yet.</Note>
        ) : filtered.length === 0 ? (
          <Note className="text-sm">No captures match these filters.</Note>
        ) : (
          <div className="min-w-0 overflow-hidden rounded-md border">
            <div className="hidden gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs md:grid md:grid-cols-[1.1fr_1.2fr_0.7fr_0.7fr_auto]">
              <span>Name</span>
              <span>Email</span>
              <span>Path</span>
              <span>Submitted</span>
              <span>Actions</span>
            </div>
            <div className="divide-y">
              {filtered.map(capture => (
                <div
                  key={capture.id}
                  className="grid min-w-0 gap-3 px-4 py-3 text-sm md:grid-cols-[1.1fr_1.2fr_0.7fr_0.7fr_auto]"
                >
                  <span className="min-w-0 break-words font-medium">{capture.name}</span>
                  <span className="min-w-0 break-words font-mono text-xs">{capture.email}</span>
                  <span>
                    <Badge variant="outline" size="sm">
                      {capture.membershipPath}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground">{capture.submittedLabel}</span>
                  <Stack size="xs" wrap>
                    {capture.email && (
                      <>
                        <Button
                          size="xs"
                          variant="secondary"
                          render={
                            <a
                              href={buildMailto(
                                capture.email,
                                "Welcome to Black Belt Legacy",
                                `Osss ${capture.name},\n\nWelcome to Black Belt Legacy — we're excited to have you here.\n\nReply to this email if you have any questions.\n\nOsss,\nThe Black Belt Legacy Team`,
                              )}
                            />
                          }
                        >
                          Welcome
                        </Button>
                        <Button
                          size="xs"
                          variant="secondary"
                          render={<Link href={capture.leadHref} />}
                        >
                          Open lead
                        </Button>
                      </>
                    )}
                  </Stack>
                </div>
              ))}
            </div>
          </div>
        )}
      </Stack>
    </Card>
  )
}

type SegmentTabProps = {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}

function SegmentTab({ label, count, isActive, onClick }: SegmentTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
        isActive
          ? "border-primary bg-primary/10 font-medium text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/50",
      )}
    >
      {label}
      <span className="text-[0.65rem] text-muted-foreground tabular-nums">{count}</span>
    </button>
  )
}
