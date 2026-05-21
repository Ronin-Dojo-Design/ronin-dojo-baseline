"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { formatDate } from "@primoui/utils"
import { PlusIcon, ShieldCheckIcon, TrashIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { use, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardHeader } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"
import { TextArea } from "~/components/common/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import {
  createWeighInRecord,
  deleteWeighInRecords,
  markWeighInOfficial,
} from "~/server/admin/tournaments/actions"
import type { findWeighInRecords } from "~/server/admin/tournaments/queries"
import { weighInRecordSchema } from "~/server/admin/tournaments/schema"

type WeighInPanelProps = {
  registrationId: string
  userId: string
  weighInsPromise: ReturnType<typeof findWeighInRecords>
}

export function WeighInPanel({ registrationId, userId, weighInsPromise }: WeighInPanelProps) {
  const weighIns = use(weighInsPromise)
  const [open, setOpen] = useState(false)

  const { executeAsync: markOfficial } = useAction(markWeighInOfficial)
  const { executeAsync: deleteRecord } = useAction(deleteWeighInRecords)

  const handleMarkOfficial = (id: string) => {
    toast.promise(
      async () => {
        const { serverError } = await markOfficial({ id })
        if (serverError) throw new Error(serverError)
      },
      {
        loading: "Marking as official...",
        success: "Marked as official weigh-in",
        error: err => `Failed: ${err.message}`,
      },
    )
  }

  const handleDelete = (id: string) => {
    toast.promise(
      async () => {
        const { serverError } = await deleteRecord({ ids: [id] })
        if (serverError) throw new Error(serverError)
      },
      {
        loading: "Deleting weigh-in...",
        success: "Weigh-in deleted",
        error: err => `Failed: ${err.message}`,
      },
    )
  }

  // Inline form
  const resolver = zodResolver(weighInRecordSchema)
  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createWeighInRecord,
    resolver,
    {
      formProps: {
        defaultValues: {
          registrationId,
          userId,
          weightKg: 0,
          isOfficial: false,
          notes: "",
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success("Weight recorded successfully")
          form.reset()
          setOpen(false)
        },
        onError: ({ error }) => toast.error(error.serverError),
      },
    },
  )

  return (
    <Card>
      <CardHeader>
        <Stack className="justify-between">
          <H3>Weigh-Ins</H3>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="primary" size="sm" prefix={<PlusIcon />} />}>
              Record Weight
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Weigh-In</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={handleSubmitWithAction} className="grid gap-4" noValidate>
                  <FormField
                    control={form.control}
                    name="weightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isRequired>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value as number}
                            onChange={e => field.onChange(Number(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isOfficial"
                    render={({ field }) => (
                      <FormItem>
                        <Stack size="sm">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel>Official weigh-in</FormLabel>
                        </Stack>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <TextArea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button size="md" isPending={action.isPending}>
                    Record Weight
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </Stack>
      </CardHeader>

      <div className="p-4 pt-0">
        {weighIns.length === 0 ? (
          <Note>No weigh-ins recorded yet.</Note>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Weight</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {weighIns.map(w => (
                <TableRow key={w.id}>
                  <TableCell>
                    <Note className="font-mono">{Number(w.weightKg).toFixed(2)} kg</Note>
                  </TableCell>
                  <TableCell>
                    <Note>{w.user.name ?? "—"}</Note>
                  </TableCell>
                  <TableCell>
                    <Note>{formatDate(w.recordedAt)}</Note>
                  </TableCell>
                  <TableCell>
                    {w.isOfficial ? (
                      <Tooltip>
                        <TooltipTrigger render={<Badge variant="success">Official</Badge>} />
                        <TooltipContent>
                          This is the official weigh-in used for division eligibility
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Note>Unofficial</Note>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack size="sm" wrap={false}>
                      {!w.isOfficial && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="secondary"
                                size="sm"
                                prefix={<ShieldCheckIcon />}
                                onClick={() => handleMarkOfficial(w.id)}
                              />
                            }
                          />
                          <TooltipContent>Mark as official</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="secondary"
                              size="sm"
                              prefix={<TrashIcon />}
                              className="text-red-500"
                              onClick={() => handleDelete(w.id)}
                            />
                          }
                        />
                        <TooltipContent>Delete weigh-in</TooltipContent>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
