"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ImageIcon, PlayIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import type { MediaRow } from "~/server/admin/media/queries"
import { DeleteMediaButton } from "./delete-media-button"

/**
 * Columns for the Media gallery migrated onto `AdminCollection` (ADR 0045). The media
 * identity is visual, so the leading `preview` cell keeps a thumbnail (image `<img>`,
 * video poster/`<video>`, or an icon fallback) exactly as the old grid did. The per-row
 * `DeleteMediaButton` moves into the pinned `actions` column, preserving delete behavior.
 */
export const getColumns = (): ColumnDef<MediaRow>[] => {
  return [
    {
      id: "preview",
      enableSorting: false,
      enableHiding: false,
      // Desi (SESSION_0515): the grid→table migration (ADR 0045) dropped thumbnails to 48px.
      // Widen the preview column and bump the thumb to 64px (`size-16`) to recover scanability
      // within the mandated table, and stamp a corner play glyph on VIDEO rows so they read as
      // video at a glance.
      size: 80,
      header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
      cell: ({ row }) => {
        const item = row.original
        if (item.type === "IMAGE") {
          return (
            <img
              src={item.url}
              alt={item.altText ?? item.title ?? "Media"}
              className="size-16 rounded object-cover"
            />
          )
        }
        if (item.type === "VIDEO") {
          return (
            <div className="relative size-16">
              {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- admin preview of user-uploaded media; no caption track available */}
              <video
                src={item.url}
                className="size-16 rounded object-cover"
                poster={item.thumbnailUrl ?? undefined}
              />
              <span className="absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full bg-black/60">
                <PlayIcon className="size-3 fill-white text-white" />
              </span>
            </div>
          )
        }
        return (
          <div className="flex size-16 items-center justify-center rounded bg-muted">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
        )
      },
    },
    {
      id: "title",
      accessorKey: "title",
      enableSorting: false,
      enableHiding: false,
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <span className="block truncate font-medium">{row.original.title ?? "Untitled"}</span>
      ),
    },
    {
      id: "type",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const item = row.original
        return (
          <Stack size="xs">
            <Badge variant="outline">{item.type}</Badge>
            {item.mimeType && <Note>{item.mimeType}</Note>}
          </Stack>
        )
      },
    },
    {
      id: "uploadedBy",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Uploaded by" />,
      cell: ({ row }) => <Note>{row.original.uploadedBy.name ?? "Unknown"}</Note>,
    },
    {
      id: "attachments",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Attachments" />,
      cell: ({ row }) => {
        const count = row.original._count.attachments
        return (
          <Note>
            {count} attachment{count !== 1 ? "s" : ""}
          </Note>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="float-right">
          <DeleteMediaButton id={row.original.id} />
        </div>
      ),
    },
  ]
}
