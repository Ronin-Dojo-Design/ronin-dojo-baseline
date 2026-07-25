"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import {
  SOCIAL_CONSENT_BASIS_LABELS,
  SOCIAL_QUEUE_SOURCE_LABELS,
  SOCIAL_QUEUE_STATUS_LABELS,
  type SocialConsentBasisLiteral,
  type SocialQueueRow,
  type SocialQueueSourceLiteral,
  type SocialQueueStatusLiteral,
} from "~/server/social-queue/schema"
import { SocialQueueRowActions } from "./social-queue-row-actions"

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

const STATUS_BADGE_VARIANT: Record<SocialQueueStatusLiteral, BadgeVariant> = {
  DRAFT: "outline",
  APPROVED: "success",
  REJECTED: "danger",
  PUBLISHED: "info",
}

/** MEMBER_OPT_IN is the consent-sensitive class — visually flagged for the reviewer. */
const CONSENT_BADGE_VARIANT: Record<SocialConsentBasisLiteral, BadgeVariant> = {
  MEMBER_OPT_IN: "warning",
  AGGREGATE_ONLY: "soft",
  OWNED_CONTENT: "soft",
}

const enumBadge = <K extends string>(
  value: string,
  labels: Record<K, string>,
  variants: Record<K, BadgeVariant>,
) => {
  if (!(value in labels)) return <Note>{value}</Note>
  const known = value as K
  return <Badge variant={variants[known]}>{labels[known]}</Badge>
}

/**
 * Columns for the `/app/social-queue` AdminCollection (SESSION_0686, spec §4): card preview
 * (SESSION_0688 — the og-route render of the payload's card params; the screenshot-thumbnail
 * idiom from `tool-form.tsx`), subject, source, consent basis, status, created,
 * approve/reject actions (pinned right — the tools table convention). The full preview
 * drawer arrives with a later phase; this slice reviews on thumbnail + headline.
 */
export const getColumns = (): ColumnDef<SocialQueueRow>[] => {
  return [
    {
      accessorKey: "previewImageUrl",
      enableSorting: false,
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Preview" />,
      cell: ({ row }) =>
        row.original.previewImageUrl ? (
          <Image
            src={row.original.previewImageUrl}
            alt={row.original.headline ?? "Card preview"}
            width={128}
            height={67}
            unoptimized
            className="h-12 w-auto rounded-md border box-content aspect-video object-cover"
          />
        ) : null,
    },
    {
      accessorKey: "headline",
      enableHiding: false,
      enableSorting: false,
      size: 300,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => (
        <span
          className="truncate font-medium"
          title={row.original.headline ?? row.original.subjectKey}
        >
          {row.original.headline ?? row.original.subjectKey}
        </span>
      ),
    },
    {
      accessorKey: "source",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ row }) => (
        <Badge variant="info">
          {SOCIAL_QUEUE_SOURCE_LABELS[row.original.source as SocialQueueSourceLiteral] ??
            row.original.source}
        </Badge>
      ),
    },
    {
      accessorKey: "consentBasis",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Consent" />,
      cell: ({ row }) =>
        enumBadge(row.original.consentBasis, SOCIAL_CONSENT_BASIS_LABELS, CONSENT_BADGE_VARIANT),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) =>
        enumBadge(row.original.status, SOCIAL_QUEUE_STATUS_LABELS, STATUS_BADGE_VARIANT),
    },
    {
      accessorKey: "rejectedReason",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
      cell: ({ row }) =>
        row.original.rejectedReason ? (
          <Note className="truncate" title={row.original.rejectedReason}>
            {row.original.rejectedReason}
          </Note>
        ) : null,
    },
    {
      accessorKey: "approvedByName",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Approved by" />,
      cell: ({ row }) =>
        row.original.approvedByName ? <Note>{row.original.approvedByName}</Note> : null,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <Note>{formatDate(row.original.createdAt)}</Note>,
    },
    {
      id: "actions",
      enableHiding: false,
      size: 180,
      cell: ({ row }) => <SocialQueueRowActions row={row.original} />,
    },
  ]
}
