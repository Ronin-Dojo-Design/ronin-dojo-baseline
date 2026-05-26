"use client"

import { type HookCallbacks, type HookSafeActionFn, useAction } from "next-safe-action/hooks"
import plur from "plur"
import { type ComponentProps, useMemo } from "react"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import type { idsSchema } from "~/server/admin/shared/schema"

type DeleteDialogProps<ServerError, CVE, Data> = ComponentProps<typeof Dialog> & {
  ids: string[]
  label: string
  action: HookSafeActionFn<ServerError, typeof idsSchema, CVE, Data>
  callbacks?: HookCallbacks<ServerError, typeof idsSchema, CVE, Data>
}

export const DeleteDialog = <ServerError, CVE, Data>({
  children,
  ids,
  label,
  action,
  callbacks,
  ...props
}: DeleteDialogProps<ServerError, CVE, Data>) => {
  const { execute, isPending } = useAction(action, callbacks)
  const pluralizedLabel = useMemo(() => plur(label, ids.length), [label, ids])

  return (
    <Dialog {...props}>
      {children && <DialogTrigger render={children as React.ReactElement} />}

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <strong className="whitespace-nowrap">
              {ids.length} {pluralizedLabel}
            </strong>{" "}
            from the database.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button size="md" variant="secondary" />}>Cancel</DialogClose>

          <Button
            aria-label={`Delete ${pluralizedLabel}`}
            size="md"
            variant="destructive"
            className="min-w-28"
            onClick={() => execute({ ids })}
            isPending={isPending}
          >
            Delete {pluralizedLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
