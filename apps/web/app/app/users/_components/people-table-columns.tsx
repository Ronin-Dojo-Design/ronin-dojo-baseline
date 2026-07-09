"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { isAdmin } from "~/lib/authz-predicates"
import { passportDisplayName } from "~/lib/identity/passport-display"
import type { PersonRow } from "~/server/admin/people/queries"
import { PersonActions } from "./person-actions"

/**
 * Passport-native mirror of `memberTopRankAward` / `memberTopRank`
 * (`lib/lineage/canvas-model.ts` — CANONICAL). The canvas resolvers read
 * `node.passport.rankAwardsEarned`; our row IS the passport, so we read
 * `passport.rankAwardsEarned` directly. Same rule: highest AWARDED belt is `[0]`
 * because the query pre-orders by `rank.sortOrder desc`. Multi-discipline surface
 * (an admin list spans disciplines) → no `disciplineId` scoping, i.e. highest overall,
 * exactly like `memberTopRankAward(node)` with no discipline. Do NOT re-derive a
 * different rule — change `canvas-model.ts` and mirror it here.
 */
function topRank(person: PersonRow) {
  return person.rankAwardsEarned[0]?.rank ?? null
}

/**
 * Passport-native mirror of `memberSchool` / `memberSchoolLabel`
 * (`lib/lineage/canvas-model.ts` — CANONICAL): affiliation org name first, else the
 * free-text `schoolName`, else null. The Membership fallback in the canvas resolver
 * (D-023 transition) is not selected here — this admin surface reads the canonical
 * Affiliation axis only. `!= null` (not truthiness) preserves the `??` semantics for
 * an empty-string free-text school.
 */
function schoolLabel(person: PersonRow): string | null {
  const affiliation = person.affiliations[0]
  if (affiliation?.organization) return affiliation.organization.name
  if (affiliation?.schoolName != null) return affiliation.schoolName
  return null
}

/** The INSTRUCTOR_STUDENT parent's display name ("Listed under"), or null. */
function listedUnder(person: PersonRow): string | null {
  const parent = person.lineageNode?.relationshipsTo[0]?.fromNode.passport
  return passportDisplayName(parent) ?? null
}

/** Whether this Passport has a linked account — gates account-only row actions. */
const hasAccount = (person: PersonRow) => person.user != null

export const getColumns = (): ColumnDef<PersonRow>[] => {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <RowCheckbox
          checked={table.getIsAllPageRowsSelected()}
          ref={input => {
            if (input) {
              input.indeterminate =
                table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
            }
          }}
          onChange={e => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row, table }) => (
        <RowCheckbox
          checked={row.getIsSelected()}
          onChange={e => row.toggleSelected(e.target.checked)}
          // Only account-holders are selectable (bulk actions are account-only); admins never.
          // Identity-only row chrome (authz-conformance sweep item 3): shared `isAdmin` predicate.
          disabled={!hasAccount(row.original) || isAdmin(row.original.user)}
          aria-label="Select row"
          table={table}
          row={row}
        />
      ),
    },
    {
      id: "displayName",
      accessorKey: "displayName",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const person = row.original
        const name = passportDisplayName(person) ?? person.user?.name ?? "Unnamed"

        // WL-P2-35: `/app/users/[id]` is now Passport-keyed, so EVERY Person — accountless
        // placeholders included — opens the ONE Passport editor. `person.id` IS the passport id.
        return <DataTableLink href={`/app/users/${person.id}`} title={name} />
      },
    },
    {
      id: "account",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Account" />,
      cell: ({ row }) => {
        const { user } = row.original
        if (!user) {
          return <Badge variant="outline">None</Badge>
        }
        if (user.banned) {
          return (
            <Badge variant="outline" className="text-red-500">
              Banned
            </Badge>
          )
        }
        if (user.isPlaceholder) {
          return <Badge variant="warning">Placeholder</Badge>
        }
        return <Badge variant="success">Active</Badge>
      },
    },
    {
      id: "belt",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Belt" />,
      cell: ({ row }) => {
        const rank = topRank(row.original)
        if (!rank) return <Note>—</Note>

        return (
          <Stack size="xs" wrap={false}>
            <BeltSwatch colorHex={rank.colorHex} />
            <Note>{rank.name}</Note>
          </Stack>
        )
      },
    },
    {
      id: "school",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="School" />,
      cell: ({ row }) => <Note>{schoolLabel(row.original) ?? "—"}</Note>,
    },
    {
      id: "verified",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Verified" />,
      cell: ({ row }) => {
        const node = row.original.lineageNode
        // Verification is a node-level axis — no node → not applicable, render "—".
        if (!node) return <Note>—</Note>
        return node.isVerified ? (
          <Badge variant="success">Verified</Badge>
        ) : (
          <Badge variant="outline">Unverified</Badge>
        )
      },
    },
    {
      id: "listedUnder",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Listed under" />,
      cell: ({ row }) => <Note>{listedUnder(row.original) ?? "—"}</Note>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <Note>{formatDate(row.getValue<Date>("createdAt"))}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <PersonActions person={row.original} className="float-right" />,
    },
  ]
}
