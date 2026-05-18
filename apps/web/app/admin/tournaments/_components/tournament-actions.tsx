"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Tournament } from "~/.generated/prisma/browser"
import { TournamentsDeleteDialog } from "~/app/admin/tournaments/_components/tournaments-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

type TournamentActionsProps = ComponentProps<typeof Button> & {
  tournament: Tournament
}

export const TournamentActions = ({ tournament, className, ...props }: TournamentActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const tournamentPath = `/admin/tournaments/${tournament.id}`
  const isTournamentPage = pathname === tournamentPath

  return (
    <Stack size="sm" wrap={false}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="secondary"
            size="sm"
            prefix={<EllipsisIcon />}
            className={cx("data-[state=open]:bg-accent", className)}
            {...props}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8}>
          {!isTournamentPage && (
            <DropdownMenuItem asChild>
              <Link href={tournamentPath}>Edit</Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href={`/tournaments/${tournament.id}`} target="_blank">
              View
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TournamentsDeleteDialog
        tournaments={[tournament]}
        onExecute={() => router.push("/admin/tournaments")}
      >
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          className="text-red-500"
          {...props}
        />
      </TournamentsDeleteDialog>
    </Stack>
  )
}
