"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { ArchiveIcon, SaveIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Checkbox } from "~/components/common/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Link } from "~/components/common/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { archiveSchedule, saveSchedule } from "~/server/web/schedule/actions"
import { saveScheduleSchema } from "~/server/web/schedule/schemas"

const DAYS_OF_WEEK = [
  { value: "MON" as const, label: "Mon" },
  { value: "TUE" as const, label: "Tue" },
  { value: "WED" as const, label: "Wed" },
  { value: "THU" as const, label: "Thu" },
  { value: "FRI" as const, label: "Fri" },
  { value: "SAT" as const, label: "Sat" },
  { value: "SUN" as const, label: "Sun" },
]

type DayValue = (typeof DAYS_OF_WEEK)[number]["value"]

type ScheduleFormDiscipline = {
  id: string
  name: string
}

type ScheduleFormSchedule = {
  id: string
  organizationId: string
  programId: string
  disciplineId: string | null
  name: string
  description: string | null
  status: "ACTIVE" | "PAUSED" | "ARCHIVED"
  daysOfWeek: DayValue[]
  startTime: string
  endTime: string
  timezone: string
  effectiveFrom: Date | null
  effectiveTo: Date | null
  capacity: number | null
  locationName: string | null
}

interface CreateScheduleFormProps extends ComponentProps<"form"> {
  organizationId: string
  programId: string
  disciplines: ScheduleFormDiscipline[]
  schedule?: ScheduleFormSchedule
  defaultTimezone?: string
}

const toIsoDate = (value: Date | null | undefined) => {
  if (!value) return ""
  const iso = value.toISOString()
  return iso.slice(0, 10)
}

export const CreateScheduleForm = ({
  organizationId,
  programId,
  disciplines,
  schedule,
  defaultTimezone = "America/Denver",
  className,
  ...props
}: CreateScheduleFormProps) => {
  const router = useRouter()
  const resolver = zodResolver(saveScheduleSchema)
  const isEditing = !!schedule

  const { form, action, handleSubmitWithAction } = useHookFormAction(saveSchedule, resolver, {
    formProps: {
      defaultValues: {
        id: schedule?.id ?? "",
        organizationId,
        programId,
        disciplineId: schedule?.disciplineId ?? "none",
        name: schedule?.name ?? "",
        description: schedule?.description ?? "",
        status: schedule?.status ?? "ACTIVE",
        daysOfWeek: schedule?.daysOfWeek ?? [],
        startTime: schedule?.startTime ?? "17:00",
        endTime: schedule?.endTime ?? "18:00",
        timezone: schedule?.timezone ?? defaultTimezone,
        effectiveFrom: schedule?.effectiveFrom
          ? (toIsoDate(schedule.effectiveFrom) as unknown as Date)
          : undefined,
        effectiveTo: schedule?.effectiveTo
          ? (toIsoDate(schedule.effectiveTo) as unknown as Date)
          : undefined,
        capacity: schedule?.capacity ?? undefined,
        locationName: schedule?.locationName ?? "",
      },
    },
    actionProps: {
      onSuccess: ({ data }) => {
        if (!data) return
        toast.success(`"${data.name}" ${isEditing ? "updated" : "created"}`)
        router.push(`/programs/${programId}/schedules/${data.id}`)
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong")
      },
    },
  })

  const archiveAction = useAction(archiveSchedule, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success(`"${data.name}" archived`)
      router.push(`/programs/${programId}/schedules`)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to archive schedule")
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className={className} noValidate {...props}>
        <Stack direction="column" className="gap-5">
          <input type="hidden" {...form.register("id")} />
          <input type="hidden" {...form.register("organizationId")} />
          <input type="hidden" {...form.register("programId")} />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input size="lg" placeholder="Adult BJJ — Tue/Thu evenings" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TextArea size="lg" rows={3} placeholder="Internal note for staff." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daysOfWeek"
            render={({ field }) => {
              const value = (field.value ?? []) as DayValue[]
              const toggle = (day: DayValue) => {
                if (value.includes(day)) {
                  field.onChange(value.filter(v => v !== day))
                } else {
                  field.onChange([...value, day])
                }
              }
              return (
                <FormItem>
                  <FormLabel>Days of Week *</FormLabel>
                  <Stack size="sm" className="flex-wrap">
                    {DAYS_OF_WEEK.map(day => {
                      const checked = value.includes(day.value)
                      return (
                        <Label
                          key={day.value}
                          className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm"
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggle(day.value)} />
                          {day.label}
                        </Label>
                      )
                    })}
                  </Stack>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <div className="grid gap-4 @sm:grid-cols-3">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <Input type="time" size="lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time *</FormLabel>
                  <FormControl>
                    <Input type="time" size="lg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone *</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="America/Denver" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 @sm:grid-cols-2">
            <FormField
              control={form.control}
              name="effectiveFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective From</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      size="lg"
                      value={(field.value as unknown as string) ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective To</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      size="lg"
                      value={(field.value as unknown as string) ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 @sm:grid-cols-2">
            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="Main Mat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field: { value, onChange, ...rest } }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      size="lg"
                      min={1}
                      max={500}
                      placeholder="30"
                      value={value === undefined || value === null ? "" : String(value)}
                      onChange={onChange}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 @sm:grid-cols-2">
            <FormField
              control={form.control}
              name="disciplineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discipline</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? "none"}
                    items={{
                      none: "No discipline",
                      ...Object.fromEntries(disciplines.map(d => [d.id, d.name])),
                    }}
                  >
                    <FormControl>
                      <SelectTrigger size="lg">
                        <SelectValue placeholder="Optional discipline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No discipline</SelectItem>
                      {disciplines.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    items={{ ACTIVE: "Active", PAUSED: "Paused" }}
                  >
                    <FormControl>
                      <SelectTrigger size="lg">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PAUSED">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Stack className="justify-between">
            <Button
              size="md"
              variant="secondary"
              render={
                <Link
                  href={
                    schedule
                      ? `/programs/${programId}/schedules/${schedule.id}`
                      : `/programs/${programId}/schedules`
                  }
                />
              }
            >
              Cancel
            </Button>

            <Stack size="sm">
              {schedule && schedule.status !== "ARCHIVED" && (
                <Button
                  type="button"
                  size="md"
                  variant="destructive"
                  prefix={<ArchiveIcon />}
                  isPending={archiveAction.isPending}
                  onClick={() => archiveAction.execute({ id: schedule.id })}
                >
                  Archive
                </Button>
              )}

              <Button type="submit" size="md" prefix={<SaveIcon />} isPending={action.isPending}>
                {schedule ? "Update Schedule" : "Create Schedule"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </form>
    </Form>
  )
}
