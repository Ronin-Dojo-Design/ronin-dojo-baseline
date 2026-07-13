"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Tournament } from "~/.generated/prisma/browser"
import { TournamentsDeleteDialog } from "~/app/app/tournaments/_components/tournaments-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

type TournamentActionsProps = ComponentProps<typeof Button> & {
  tournament: Tournament
}

export const TournamentActions = ({ tournament, className, ...props }: TournamentActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const tournamentPath = `/app/tournaments/${tournament.id}`
  const isTournamentPage = pathname === tournamentPath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isTournamentPage && (
          <DropdownMenuItem render={<Link href={tournamentPath} />}>Edit</DropdownMenuItem>
        )}

        <DropdownMenuItem render={<Link href={`/tournaments/${tournament.id}`} target="_blank" />}>
          View
        </DropdownMenuItem>
      </RowActionsMenu>

      <TournamentsDeleteDialog
        tournaments={[tournament]}
        onExecute={() => router.push("/app/tournaments")}
      >
        <RowDeleteButton {...props} />
      </TournamentsDeleteDialog>
    </Stack>
  )
}
