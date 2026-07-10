"use client"

import { slugify } from "@dirstack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { ArchiveIcon, SaveIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
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
import { useComputedField } from "~/hooks/use-computed-field"
import { archiveProgram, saveProgram } from "~/server/web/program/actions"
import { saveProgramSchema } from "~/server/web/program/schemas"

type ProgramFormOrganization = {
  id: string
  name: string
  slug: string
  disciplines: {
    discipline: {
      id: string
      name: string
      slug: string
    }
  }[]
}

type ProgramFormProgram = {
  id: string
  organizationId: string
  disciplineId: string | null
  name: string
  slug: string
  description: string | null
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
}

interface CreateProgramFormProps extends ComponentProps<"form"> {
  organizations: ProgramFormOrganization[]
  program?: ProgramFormProgram
}

export const CreateProgramForm = ({
  organizations,
  program,
  className,
  ...props
}: CreateProgramFormProps) => {
  const router = useRouter()
  const resolver = zodResolver(saveProgramSchema)
  const firstOrganization = organizations[0]
  const isEditing = !!program

  const { form, action, handleSubmitWithAction } = useHookFormAction(saveProgram, resolver, {
    formProps: {
      defaultValues: {
        id: program?.id ?? "",
        organizationId: program?.organizationId ?? firstOrganization?.id ?? "",
        disciplineId: program?.disciplineId ?? "none",
        name: program?.name ?? "",
        slug: program?.slug ?? "",
        description: program?.description ?? "",
        status: program?.status ?? "ACTIVE",
      },
    },
    actionProps: {
      onSuccess: ({ data }) => {
        if (!data) return
        toast.success(`"${data.name}" ${isEditing ? "updated" : "created"}`)
        router.push(`/programs/${data.id}`)
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong")
      },
    },
  })

  useComputedField({
    form,
    sourceField: "name",
    computedField: "slug",
    callback: slugify,
    enabled: !isEditing,
  })

  const organizationId = form.watch("organizationId")
  const selectedOrganization =
    organizations.find(org => org.id === organizationId) ?? firstOrganization
  const disciplines = selectedOrganization?.disciplines ?? []

  const archiveAction = useAction(archiveProgram, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success(`"${data.name}" archived`)
      router.push("/programs")
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to archive program")
    },
  })

  if (!firstOrganization) {
    return (
      <div className="max-w-xl space-y-4 text-sm text-muted-foreground">
        <p>You need an editable organization before you can create programs.</p>
        <Button size="sm" render={<Link href="/organizations/new" />}>
          Create Organization
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className={className} noValidate {...props}>
        <Stack direction="column" className="gap-5">
          <input type="hidden" {...form.register("id")} />

          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization *</FormLabel>
                <Select
                  onValueChange={value => {
                    field.onChange(value)
                    form.setValue("disciplineId", "none")
                  }}
                  value={field.value}
                  disabled={isEditing}
                  items={Object.fromEntries(organizations.map(org => [org.id, org.name]))}
                >
                  <FormControl>
                    <SelectTrigger size="lg">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 @sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="Adult Brazilian Jiu-Jitsu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="adult-brazilian-jiu-jitsu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TextArea
                    size="lg"
                    rows={4}
                    placeholder="Short description for students and families."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      ...Object.fromEntries(
                        disciplines.map(({ discipline }) => [discipline.id, discipline.name]),
                      ),
                    }}
                  >
                    <FormControl>
                      <SelectTrigger size="lg">
                        <SelectValue placeholder="Optional discipline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No discipline</SelectItem>
                      {disciplines.map(({ discipline }) => (
                        <SelectItem key={discipline.id} value={discipline.id}>
                          {discipline.name}
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
                    items={{ ACTIVE: "Active", DRAFT: "Draft" }}
                  >
                    <FormControl>
                      <SelectTrigger size="lg">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
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
              render={<Link href={program ? `/programs/${program.id}` : "/programs"} />}
            >
              Cancel
            </Button>

            <Stack size="sm">
              {program && program.status !== "ARCHIVED" && (
                <Button
                  type="button"
                  size="md"
                  variant="destructive"
                  prefix={<ArchiveIcon />}
                  isPending={archiveAction.isPending}
                  onClick={() => archiveAction.execute({ id: program.id })}
                >
                  Archive
                </Button>
              )}

              <Button type="submit" size="md" prefix={<SaveIcon />} isPending={action.isPending}>
                {program ? "Update Program" : "Create Program"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </form>
    </Form>
  )
}
